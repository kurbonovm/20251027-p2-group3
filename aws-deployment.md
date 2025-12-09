# AWS Deployment Guide

This guide covers deploying the Hotel Reservation System to AWS using various services.

## Architecture Overview

- **Backend**: AWS EC2 or ECS with Docker
- **Frontend**: AWS S3 + CloudFront
- **Database**: AWS DocumentDB (MongoDB-compatible)
- **Authentication**: AWS Cognito (optional)
- **Load Balancer**: AWS Application Load Balancer
- **Storage**: AWS S3 for images and static assets

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Docker installed locally
4. Domain name (optional, for custom domain)

## Deployment Steps

### 1. Set Up DocumentDB

```bash
# Create DocumentDB cluster
aws docdb create-db-cluster \
    --db-cluster-identifier hotel-reservation-cluster \
    --engine docdb \
    --master-username admin \
    --master-user-password YourStrongPassword123! \
    --vpc-security-group-ids sg-xxxxxxxxx

# Create DocumentDB instance
aws docdb create-db-instance \
    --db-instance-identifier hotel-reservation-instance \
    --db-instance-class db.t3.medium \
    --engine docdb \
    --db-cluster-identifier hotel-reservation-cluster
```

### 2. Deploy Backend to ECS

#### 2.1 Create ECR Repository

```bash
# Create ECR repository for backend
aws ecr create-repository \
    --repository-name hotel-reservation-backend \
    --region us-east-1

# Get ECR login
aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin \
    <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

#### 2.2 Build and Push Docker Image

```bash
# Build backend image
cd backend
docker build -t hotel-reservation-backend .

# Tag image
docker tag hotel-reservation-backend:latest \
    <account-id>.dkr.ecr.us-east-1.amazonaws.com/hotel-reservation-backend:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/hotel-reservation-backend:latest
```

#### 2.3 Create ECS Task Definition

Create `backend-task-definition.json`:

```json
{
  "family": "hotel-reservation-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/hotel-reservation-backend:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "SPRING_DATA_MONGODB_URI",
          "value": "mongodb://admin:password@docdb-endpoint:27017/hotel_reservation?authSource=admin&tls=true"
        }
      ],
      "secrets": [
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:account-id:secret:jwt-secret"
        },
        {
          "name": "STRIPE_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:account-id:secret:stripe-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/hotel-reservation-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register task definition:

```bash
aws ecs register-task-definition \
    --cli-input-json file://backend-task-definition.json
```

#### 2.4 Create ECS Service

```bash
aws ecs create-service \
    --cluster hotel-reservation-cluster \
    --service-name backend-service \
    --task-definition hotel-reservation-backend \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=8080"
```

### 3. Deploy Frontend to S3 + CloudFront

#### 3.1 Build Frontend

```bash
cd frontend
npm run build
```

#### 3.2 Create S3 Bucket

```bash
# Create S3 bucket
aws s3 mb s3://hotel-reservation-frontend

# Enable static website hosting
aws s3 website s3://hotel-reservation-frontend \
    --index-document index.html \
    --error-document index.html

# Upload build files
aws s3 sync dist/ s3://hotel-reservation-frontend --delete
```

#### 3.3 Create CloudFront Distribution

Create `cloudfront-config.json`:

```json
{
  "CallerReference": "hotel-reservation-frontend",
  "Comment": "Hotel Reservation System Frontend",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-hotel-reservation-frontend",
        "DomainName": "hotel-reservation-frontend.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-hotel-reservation-frontend",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "Compress": true
  },
  "DefaultRootObject": "index.html",
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200"
      }
    ]
  }
}
```

```bash
aws cloudfront create-distribution \
    --distribution-config file://cloudfront-config.json
```

### 4. Set Up Application Load Balancer

```bash
# Create target group
aws elbv2 create-target-group \
    --name hotel-backend-tg \
    --protocol HTTP \
    --port 8080 \
    --vpc-id vpc-xxxxxxxxx \
    --health-check-path /actuator/health

# Create ALB
aws elbv2 create-load-balancer \
    --name hotel-reservation-alb \
    --subnets subnet-xxx subnet-yyy \
    --security-groups sg-xxx

# Create listener
aws elbv2 create-listener \
    --load-balancer-arn arn:aws:elasticloadbalancing:... \
    --protocol HTTPS \
    --port 443 \
    --certificates CertificateArn=arn:aws:acm:... \
    --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

### 5. Configure Secrets Manager

```bash
# Store JWT secret
aws secretsmanager create-secret \
    --name jwt-secret \
    --secret-string "your-jwt-secret-key"

# Store Stripe API key
aws secretsmanager create-secret \
    --name stripe-api-key \
    --secret-string "your-stripe-api-key"

# Store email credentials
aws secretsmanager create-secret \
    --name email-credentials \
    --secret-string '{"username":"email@gmail.com","password":"app-password"}'
```

### 6. Set Up CI/CD with AWS CodePipeline

Create `buildspec.yml` for backend:

```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
  build:
    commands:
      - echo Build started on `date`
      - echo Building the Docker image...
      - docker build -t $IMAGE_REPO_NAME:$IMAGE_TAG .
      - docker tag $IMAGE_REPO_NAME:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
  post_build:
    commands:
      - echo Build completed on `date`
      - echo Pushing the Docker image...
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
      - echo Writing image definitions file...
      - printf '[{"name":"backend","imageUri":"%s"}]' $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG > imagedefinitions.json

artifacts:
  files: imagedefinitions.json
```

## Environment Variables

Set these environment variables in ECS task definition or EC2:

```bash
SPRING_DATA_MONGODB_URI=mongodb://...
JWT_SECRET=...
STRIPE_API_KEY=...
STRIPE_WEBHOOK_SECRET=...
EMAIL_USERNAME=...
EMAIL_PASSWORD=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
APP_CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

## Monitoring and Logging

### CloudWatch Logs

```bash
# Create log group
aws logs create-log-group --log-group-name /ecs/hotel-reservation-backend

# Set retention
aws logs put-retention-policy \
    --log-group-name /ecs/hotel-reservation-backend \
    --retention-in-days 30
```

### CloudWatch Alarms

```bash
# CPU utilization alarm
aws cloudwatch put-metric-alarm \
    --alarm-name backend-high-cpu \
    --alarm-description "Alert when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold
```

## Scaling

### Auto Scaling for ECS

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
    --service-namespace ecs \
    --resource-id service/hotel-reservation-cluster/backend-service \
    --scalable-dimension ecs:service:DesiredCount \
    --min-capacity 2 \
    --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
    --service-namespace ecs \
    --resource-id service/hotel-reservation-cluster/backend-service \
    --scalable-dimension ecs:service:DesiredCount \
    --policy-name cpu-scaling-policy \
    --policy-type TargetTrackingScaling \
    --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

## Cost Optimization

1. Use Reserved Instances for DocumentDB
2. Enable S3 Intelligent-Tiering
3. Use CloudFront caching
4. Implement auto-scaling
5. Use Spot Instances for non-critical workloads

## Security Best Practices

1. Enable VPC Flow Logs
2. Use AWS WAF with CloudFront
3. Enable encryption at rest (DocumentDB, S3)
4. Use AWS Secrets Manager for credentials
5. Implement least privilege IAM roles
6. Enable MFA for AWS accounts
7. Regular security audits with AWS Config

## Backup and Disaster Recovery

```bash
# Enable automated backups for DocumentDB
aws docdb modify-db-cluster \
    --db-cluster-identifier hotel-reservation-cluster \
    --backup-retention-period 7 \
    --preferred-backup-window "03:00-04:00"

# Enable S3 versioning
aws s3api put-bucket-versioning \
    --bucket hotel-reservation-frontend \
    --versioning-configuration Status=Enabled
```

## Domain and SSL

1. Register domain in Route 53
2. Request SSL certificate in ACM
3. Configure CloudFront with custom domain
4. Update DNS records

## Maintenance

1. Regular security patches
2. Monitor costs with AWS Cost Explorer
3. Review CloudWatch logs
4. Test disaster recovery procedures
5. Update dependencies regularly
