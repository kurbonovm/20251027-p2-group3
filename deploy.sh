#!/bin/bash
set -e

echo "========================================="
echo "Hotel Reservation Deployment Script"
echo "========================================="

# Configuration - UPDATE THESE VALUES
ECR_REPO="REPLACE_WITH_YOUR_ECR_URI"
AWS_REGION="us-east-1"
EB_ENV_NAME="hotel-reservation-group3-prod"
S3_FRONTEND_BUCKET="hotel-reservation-group3-frontend"
VERSION=$(date +%Y%m%d-%H%M%S)

echo "Version: $VERSION"
echo "Region: $AWS_REGION"
echo ""

# Step 1: Build and test backend
echo "Step 1: Building backend..."
cd backend
mvn clean package -DskipTests
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed!"
    exit 1
fi
echo "✅ Backend build successful"
cd ..

# Step 2: Build Docker image
echo ""
echo "Step 2: Building Docker image..."
cd backend
docker build -t hotel-reservation-backend:$VERSION .
if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi
docker tag hotel-reservation-backend:$VERSION hotel-reservation-backend:latest
echo "✅ Docker image built successfully"

# Step 3: Push to ECR
echo ""
echo "Step 3: Pushing to ECR..."
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_REPO

if [ $? -ne 0 ]; then
    echo "❌ ECR login failed!"
    exit 1
fi

docker tag hotel-reservation-backend:$VERSION $ECR_REPO:$VERSION
docker tag hotel-reservation-backend:latest $ECR_REPO:latest

docker push $ECR_REPO:$VERSION
docker push $ECR_REPO:latest

if [ $? -ne 0 ]; then
    echo "❌ Docker push failed!"
    exit 1
fi
echo "✅ Docker images pushed to ECR"

# Step 4: Deploy to Elastic Beanstalk
echo ""
echo "Step 4: Deploying to Elastic Beanstalk..."
eb deploy $EB_ENV_NAME

if [ $? -ne 0 ]; then
    echo "❌ EB deployment failed!"
    exit 1
fi
echo "✅ Backend deployed to Elastic Beanstalk"

# Step 5: Build frontend
echo ""
echo "Step 5: Building frontend..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend npm install failed!"
    exit 1
fi

npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi
echo "✅ Frontend built successfully"

# Step 6: Deploy frontend to S3
echo ""
echo "Step 6: Deploying frontend to S3..."
aws s3 sync dist/ s3://$S3_FRONTEND_BUCKET/ \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html"

if [ $? -ne 0 ]; then
    echo "❌ S3 sync failed!"
    exit 1
fi

aws s3 cp dist/index.html s3://$S3_FRONTEND_BUCKET/index.html \
  --cache-control "no-cache, no-store, must-revalidate"

if [ $? -ne 0 ]; then
    echo "❌ S3 index.html upload failed!"
    exit 1
fi
echo "✅ Frontend deployed to S3"

# Step 7: Invalidate CloudFront cache (if exists)
echo ""
echo "Step 7: Checking for CloudFront distribution..."
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Origins.Items[?DomainName=='$S3_FRONTEND_BUCKET.s3-website-$AWS_REGION.amazonaws.com']].Id" \
  --output text 2>/dev/null)

if [ ! -z "$DISTRIBUTION_ID" ]; then
  echo "Found CloudFront distribution: $DISTRIBUTION_ID"
  echo "Invalidating cache..."
  aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*"
  echo "✅ CloudFront cache invalidated"
else
  echo "⚠️  No CloudFront distribution found (skipping cache invalidation)"
fi

# Step 8: Get URLs
echo ""
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo "Version: $VERSION"
echo ""

EB_URL=$(eb status $EB_ENV_NAME | grep CNAME | awk '{print $2}')
if [ ! -z "$EB_URL" ]; then
  echo "Backend URL: http://$EB_URL"
fi

S3_URL="http://$S3_FRONTEND_BUCKET.s3-website-$AWS_REGION.amazonaws.com"
echo "Frontend URL (S3): $S3_URL"

if [ ! -z "$DISTRIBUTION_ID" ]; then
  CF_DOMAIN=$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DomainName' --output text)
  echo "Frontend URL (CloudFront): https://$CF_DOMAIN"
fi

echo ""
echo "========================================="

# Step 9: Health check
echo ""
echo "Running health check..."
sleep 30

if [ ! -z "$EB_URL" ]; then
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$EB_URL/actuator/health)
  if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Backend health check passed (HTTP $HTTP_STATUS)"
  else
    echo "⚠️  Backend health check returned HTTP $HTTP_STATUS"
  fi
else
  echo "⚠️  Could not retrieve EB URL for health check"
fi

cd ..
echo ""
echo "Deployment script finished!"

