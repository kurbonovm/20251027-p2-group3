# Quick Deployment Reference

## 🚀 Quick Start (First Time Setup)

### 1. Install Required Tools
```bash
# Install AWS CLI
brew install awscli

# Install EB CLI
pip install awsebcli --upgrade --user

# Verify installations
aws --version
eb --version
docker --version
```

### 2. Configure AWS Credentials
```bash
aws configure
# Enter your Access Key ID, Secret Access Key, region (us-east-1), and format (json)
```

### 3. Create ECR Repository
```bash
aws ecr create-repository --repository-name hotel-reservation-backend --region us-east-1

# Save the repository URI from output
# Example: 123456789012.dkr.ecr.us-east-1.amazonaws.com/hotel-reservation-backend
```

### 4. Create S3 Buckets
```bash
aws s3 mb s3://hotel-reservation-frontend --region us-east-1
aws s3 mb s3://hotel-reservation-artifacts --region us-east-1
```

### 5. Set Up IAM Roles (Run these commands)
```bash
# Create service role
aws iam create-role \
  --role-name hotel-reservation-eb-service-role \
  --assume-role-policy-document file://eb-service-trust-policy.json

# Create EC2 instance role
aws iam create-role \
  --role-name hotel-reservation-ec2-role \
  --assume-role-policy-document file://ec2-trust-policy.json

# Create instance profile
aws iam create-instance-profile \
  --instance-profile-name hotel-reservation-ec2-profile

aws iam add-role-to-instance-profile \
  --instance-profile-name hotel-reservation-ec2-profile \
  --role-name hotel-reservation-ec2-role
```

See full guide in `AWS_DEPLOYMENT_GUIDE.md` for trust policy JSON files.

---

## 📦 Deploy Backend to Elastic Beanstalk

### Step 1: Build and Push Docker Image
```bash
cd backend

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin YOUR_ECR_URI

# Build image
docker build -t hotel-reservation-backend:latest .

# Tag and push
docker tag hotel-reservation-backend:latest YOUR_ECR_URI:latest
docker push YOUR_ECR_URI:latest
```

### Step 2: Update Dockerrun.aws.json
```bash
# Edit backend/Dockerrun.aws.json and replace YOUR_ECR_URI with your actual ECR URI
```

### Step 3: Initialize and Deploy
```bash
# First time only
eb init hotel-reservation-backend --platform docker --region us-east-1

# Create environment
eb create hotel-reservation-prod \
  --instance-type t3.medium \
  --service-role hotel-reservation-eb-service-role \
  --instance-profile hotel-reservation-ec2-profile

# Set environment variables
eb setenv \
  SPRING_DATA_MONGODB_URI="your_mongodb_uri" \
  JWT_SECRET="your_jwt_secret" \
  SPRING_PROFILES_ACTIVE="prod"

# Deploy
eb deploy
```

---

## 🌐 Deploy Frontend to S3

```bash
cd frontend

# Build frontend
npm install
npm run build

# Deploy to S3
aws s3 sync dist/ s3://hotel-reservation-frontend/ --delete

# Make public (if not using CloudFront)
aws s3api put-bucket-policy \
  --bucket hotel-reservation-frontend \
  --policy file://frontend-bucket-policy.json
```

---

## 🔄 Subsequent Deployments

### Use the Deployment Script
```bash
# Update deploy.sh with your ECR URI and bucket name
# Then run:
./deploy.sh
```

### Or Manual Deploy
```bash
# Backend only
cd backend
docker build -t hotel-reservation-backend:latest .
# ... push to ECR ...
eb deploy

# Frontend only
cd frontend
npm run build
aws s3 sync dist/ s3://hotel-reservation-frontend/ --delete
```

---

## 🔍 Monitoring and Debugging

```bash
# Check environment status
eb status

# View logs
eb logs

# View recent logs only
eb logs --stream

# SSH into instance
eb ssh

# Check health
eb health

# Open app in browser
eb open
```

---

## 🛠️ Common Commands

```bash
# List environments
eb list

# Switch environment
eb use hotel-reservation-staging

# Restart app
eb restart

# Update environment variables
eb setenv KEY=VALUE

# Print environment variables
eb printenv

# Terminate environment (CAREFUL!)
eb terminate hotel-reservation-prod
```

---

## 🔐 Environment Variables Required

```bash
SPRING_DATA_MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hotel_reservation
JWT_SECRET=your-secure-jwt-secret-256-bits
SPRING_PROFILES_ACTIVE=prod
CORS_ALLOWED_ORIGINS=https://your-cloudfront-url.cloudfront.net
AWS_REGION=us-east-1
```

---

## 🐛 Troubleshooting

### Docker Image Pull Failed
```bash
# Check ECR permissions
aws ecr describe-repositories
aws iam get-instance-profile --instance-profile-name hotel-reservation-ec2-profile
```

### Application Not Starting
```bash
# Check logs
eb logs
eb ssh
docker logs $(docker ps -q)
```

### Health Check Failing
```bash
# Test health endpoint
curl http://YOUR_EB_URL/actuator/health
```

### MongoDB Connection Issues
```bash
# Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
# Check connection string
eb printenv | grep MONGO
```

---

## 📊 Cost Estimate (Approximate Monthly)

- **Elastic Beanstalk**: Free (pay for resources)
- **EC2 (2x t3.medium)**: ~$60/month
- **Application Load Balancer**: ~$20/month
- **S3 Storage**: ~$1-5/month
- **CloudFront**: ~$1-10/month (depends on traffic)
- **ECR**: ~$1/month
- **CloudWatch Logs**: ~$0.50/month
- **Data Transfer**: Variable

**Total**: ~$83-96/month (can reduce with spot instances)

---

## 🔗 Important URLs

- ECR Console: https://console.aws.amazon.com/ecr/
- Elastic Beanstalk Console: https://console.aws.amazon.com/elasticbeanstalk/
- S3 Console: https://console.aws.amazon.com/s3/
- CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/
- IAM Console: https://console.aws.amazon.com/iam/

---

## 📚 Full Documentation

For complete step-by-step instructions, see `AWS_DEPLOYMENT_GUIDE.md`

---

## ⚠️ Important Notes

1. **Never commit secrets**: Add `.env*` to `.gitignore`
2. **Use HTTPS in production**: Set up CloudFront + ACM certificate
3. **Monitor costs**: Set up AWS Budgets
4. **Enable backups**: Configure MongoDB Atlas automated backups
5. **Test deployments**: Use staging environment first

---

## 🆘 Support

If you encounter issues:
1. Check `AWS_DEPLOYMENT_GUIDE.md` troubleshooting section
2. Review CloudWatch logs
3. Verify IAM permissions
4. Check security group rules
5. Ensure MongoDB connection string is correct

