# Hotel Reservation Application - AWS Elastic Beanstalk Deployment Guide

**BatchID**: 20251027-EY  
**Group**: group3  
**Last Updated**: December 20, 2024

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start (Automated Setup)](#quick-start-automated-setup)
4. [Manual Setup (Step-by-Step)](#manual-setup-step-by-step)
5. [Environment Configuration](#environment-configuration)
6. [IAM Roles and Permissions](#iam-roles-and-permissions)
7. [DocumentDB Setup](#documentdb-setup)
8. [Dockerization](#dockerization)
9. [Deployment Steps](#deployment-steps)
10. [Post-Deployment Configuration](#post-deployment-configuration)
11. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Deployment Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                           │
│                         Region: us-east-1                   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │               CloudFront (CDN)                          │ │
│  │         (Frontend Static Content Delivery)              │ │
│  └─────────────────┬──────────────────────────────────────┘ │
│                    │                                          │
│  ┌─────────────────▼──────────────────────────────────────┐ │
│  │         S3: hotel-reservation-group3-frontend          │ │
│  │         (Frontend Build Files)                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │    Elastic Beanstalk: hotel-reservation-group3-prod    │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │     Application Load Balancer (ALB)              │  │ │
│  │  └────────────┬─────────────────────────────────────┘  │ │
│  │               │                                          │ │
│  │  ┌────────────▼──────────────────────┐                 │ │
│  │  │  EC2 Instance (t3.medium)          │                 │ │
│  │  │  - Docker Container                │                 │ │
│  │  │  - Spring Boot Backend             │                 │ │
│  │  │  - Port 8080                       │                 │ │
│  │  └──────────┬─────────────────────────┘                 │ │
│  │             │                                            │ │
│  │             │ (Private VPC Connection)                  │ │
│  │             │                                            │ │
│  │  ┌──────────▼──────────────────────────────────────┐   │ │
│  │  │   DocumentDB: hotel-reservation-group3-docdb    │   │ │
│  │  │   - 1 Instance (db.t3.medium)                   │   │ │
│  │  │   - Database: hotel_reservation                 │   │ │
│  │  │   - Username: group3                            │   │ │
│  │  └─────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │   ECR: hotel-reservation-group3-backend                 │ │
│  │   (Docker Image Storage)                                │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Component Breakdown
- **Frontend**: React app served from S3 + CloudFront CDN
- **Backend**: Spring Boot app in Docker container on Elastic Beanstalk
- **Database**: Amazon DocumentDB (MongoDB-compatible)
- **Container Registry**: AWS ECR for Docker images
- **Storage**: S3 for frontend static files and artifacts
- **Load Balancer**: Application Load Balancer (ALB)
- **Instances**: Single EC2 t3.medium instance (no auto-scaling)

### Resource Names
All resources include `group3` for easy identification:
- ECR: `hotel-reservation-group3-backend`
- S3 Frontend: `hotel-reservation-group3-frontend`
- S3 Artifacts: `hotel-reservation-group3-artifacts`
- DocumentDB: `hotel-reservation-group3-docdb`
- EB Environment: `hotel-reservation-group3-prod`
- IAM Roles: Include `group3` prefix

---

## Prerequisites

### Required Tools

```bash
# Check AWS CLI
aws --version  # Should be v2.x or higher

# Check Docker
docker --version  # Should be 20.x or higher

# Check Node.js and npm (for frontend)
node --version  # Should be v16.x or higher
npm --version

# Check Java and Maven (for backend)
java -version  # Should be Java 17
mvn --version  # Should be 3.8.x or higher

# Check EB CLI
eb --version
```

### Install Missing Tools

**AWS CLI** (if not installed):
```bash
# macOS
brew install awscli

# Verify
aws --version
```

**EB CLI**:
```bash
# Using pip
pip install awsebcli --upgrade --user

# Verify
eb --version
```

**Docker**:
```bash
# macOS
brew install --cask docker

# Start Docker Desktop and verify
docker --version
```

### AWS Account Requirements
- ✅ Active AWS account with billing enabled
- ✅ IAM user with programmatic access (Access Key ID and Secret)
- ✅ Appropriate IAM permissions for:
  - EC2, S3, ECR
  - Elastic Beanstalk
  - DocumentDB
  - IAM role creation
  - CloudWatch

---

## Quick Start (Automated Setup)

### Option 1: Use the Automated Setup Script

This is the **RECOMMENDED** method for first-time deployment.

```bash
# 1. Navigate to project root
cd /path/to/20251027-p2-group3

# 2. Configure AWS CLI (if not already done)
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Region: us-east-1
# Output format: json

# 3. Make setup script executable
chmod +x setup-aws-resources.sh

# 4. Review the script (optional)
cat setup-aws-resources.sh

# 5. Run the automated setup
./setup-aws-resources.sh

# This will create:
# - ECR Repository
# - S3 Buckets (Frontend & Artifacts)
# - IAM Roles and Policies
# - DocumentDB Cluster and Instance
# - Security Groups
# - DB Subnet Groups
# All with proper tags: BatchID=20251027-EY, CreatedBy=aepanda
```

**Setup Time**: 10-15 minutes (DocumentDB creation is the longest step)

**What the script creates**:
- ✅ ECR repository for Docker images
- ✅ S3 buckets for frontend and artifacts
- ✅ IAM roles with proper permissions
- ✅ DocumentDB cluster with 1 instance
- ✅ Security groups configured
- ✅ All resources tagged properly

**Output**: The script saves all configuration to `aws-resources-config.txt`

### After Automated Setup

1. **Copy environment template**:
```bash
cp env-production-example.txt backend/.env.production
```

2. **Update .env.production** with DocumentDB endpoint from script output

3. **Proceed to [Deployment Steps](#deployment-steps)**

---

## Manual Setup (Step-by-Step)

If you prefer manual control or the automated script fails, follow these steps.

### Step 1: Configure AWS CLI

```bash
# Configure AWS credentials
aws configure

# Prompts:
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region name: us-east-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity
```

Expected output:
```json
{
    "UserId": "AIDAI...",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/your-username"
}
```

### Step 2: Create ECR Repository

```bash
# Create ECR repository for Docker images
aws ecr create-repository \
  --repository-name hotel-reservation-group3-backend \
  --region us-east-1 \
  --tags \
    Key=BatchID,Value=20251027-EY \
    Key=CreatedBy,Value=aepanda \
    Key=Application,Value=HotelReservation \
    Key=Environment,Value=Production

# Save the repository URI from output
# Example: 123456789012.dkr.ecr.us-east-1.amazonaws.com/hotel-reservation-group3-backend
```

**Save this URI** - you'll need it for Docker commands and configuration files.

### Step 3: Create S3 Buckets

```bash
# Create frontend bucket
aws s3 mb s3://hotel-reservation-group3-frontend --region us-east-1

# Tag frontend bucket
aws s3api put-bucket-tagging \
  --bucket hotel-reservation-group3-frontend \
  --tagging "TagSet=[{Key=BatchID,Value=20251027-EY},{Key=CreatedBy,Value=aepanda},{Key=Application,Value=HotelReservation}]"

# Configure for static website hosting
aws s3 website s3://hotel-reservation-group3-frontend/ \
  --index-document index.html \
  --error-document index.html

# Create artifacts bucket
aws s3 mb s3://hotel-reservation-group3-artifacts --region us-east-1

# Enable versioning on artifacts bucket
aws s3api put-bucket-versioning \
  --bucket hotel-reservation-group3-artifacts \
  --versioning-configuration Status=Enabled

# Tag artifacts bucket
aws s3api put-bucket-tagging \
  --bucket hotel-reservation-group3-artifacts \
  --tagging "TagSet=[{Key=BatchID,Value=20251027-EY},{Key=CreatedBy,Value=aepanda},{Key=Application,Value=HotelReservation}]"
```

### Step 4: Set Up IAM Roles

**4a. Create Elastic Beanstalk Service Role**

```bash
# Create the service role
aws iam create-role \
  --role-name hotel-reservation-group3-eb-service-role \
  --assume-role-policy-document file://iam-policies/eb-service-trust-policy.json \
  --tags \
    Key=BatchID,Value=20251027-EY \
    Key=CreatedBy,Value=aepanda \
    Key=Application,Value=HotelReservation

# Attach required policies
aws iam attach-role-policy \
  --role-name hotel-reservation-group3-eb-service-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth

aws iam attach-role-policy \
  --role-name hotel-reservation-group3-eb-service-role \
  --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy
```

**4b. Create EC2 Instance Role**

```bash
# Create the instance role
aws iam create-role \
  --role-name hotel-reservation-group3-ec2-role \
  --assume-role-policy-document file://iam-policies/ec2-trust-policy.json \
  --tags \
    Key=BatchID,Value=20251027-EY \
    Key=CreatedBy,Value=aepanda \
    Key=Application,Value=HotelReservation

# Attach required policies
aws iam attach-role-policy \
  --role-name hotel-reservation-group3-ec2-role \
  --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier

aws iam attach-role-policy \
  --role-name hotel-reservation-group3-ec2-role \
  --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker
```

**4c. Create Custom ECR/S3 Policy**

```bash
# Get your AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create custom policy
aws iam create-policy \
  --policy-name HotelReservationGroup3ECRS3Policy \
  --policy-document file://iam-policies/ecr-s3-policy.json \
  --tags \
    Key=BatchID,Value=20251027-EY \
    Key=CreatedBy,Value=aepanda \
    Key=Application,Value=HotelReservation

# Attach to EC2 role
aws iam attach-role-policy \
  --role-name hotel-reservation-group3-ec2-role \
  --policy-arn arn:aws:iam::$ACCOUNT_ID:policy/HotelReservationGroup3ECRS3Policy
```

**4d. Create Instance Profile**

```bash
# Create instance profile
aws iam create-instance-profile \
  --instance-profile-name hotel-reservation-group3-ec2-profile \
  --tags \
    Key=BatchID,Value=20251027-EY \
    Key=CreatedBy,Value=aepanda \
    Key=Application,Value=HotelReservation

# Add role to instance profile
aws iam add-role-to-instance-profile \
  --instance-profile-name hotel-reservation-group3-ec2-profile \
  --role-name hotel-reservation-group3-ec2-role

# Wait for IAM propagation
echo "Waiting 10 seconds for IAM propagation..."
sleep 10
```

---

## Environment Configuration

### 1. Create Environment Variables File

```bash
# Copy the template
cp env-production-example.txt backend/.env.production

# Edit the file
nano backend/.env.production
```

**Update these values in `backend/.env.production`**:

```env
# DocumentDB Configuration (UPDATE ENDPOINT AFTER DOCDB CREATION)
SPRING_DATA_MONGODB_URI=mongodb://group3:20251027-p2-group3@REPLACE_WITH_DOCDB_ENDPOINT:27017/hotel_reservation?tls=true&tlsAllowInvalidHostnames=true&retryWrites=false
SPRING_DATA_MONGODB_DATABASE=hotel_reservation

# JWT Configuration (GENERATE A SECURE SECRET)
JWT_SECRET=your-super-secure-jwt-secret-key-min-256-bits
JWT_EXPIRATION=86400000

# Spring Profile
SPRING_PROFILES_ACTIVE=prod

# CORS Configuration (UPDATE WITH YOUR FRONTEND URL)
CORS_ALLOWED_ORIGINS=https://your-cloudfront-url.cloudfront.net

# AWS Configuration
AWS_REGION=us-east-1

# Logging
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_HOTEL=DEBUG
LOGGING_LEVEL_MONGODB=DEBUG
```

**Generate a secure JWT secret**:
```bash
# Generate 256-bit random secret
openssl rand -base64 64
```

### 2. Application Configuration (YAML)

The application uses `backend/src/main/resources/application-prod.yml`:

```yaml
server:
  port: 8080
  error:
    include-message: always
    include-binding-errors: always

spring:
  data:
    mongodb:
      uri: ${SPRING_DATA_MONGODB_URI}
      database: ${SPRING_DATA_MONGODB_DATABASE:hotel_reservation}
      ssl:
        enabled: true
      retry-writes: false
      retry-reads: true
      auto-index-creation: false

jwt:
  secret: ${JWT_SECRET}
  expiration: ${JWT_EXPIRATION:86400000}

cors:
  allowed-origins: ${CORS_ALLOWED_ORIGINS:*}

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: when-authorized
  health:
    mongo:
      enabled: true
```

This file is already configured correctly and doesn't need changes.

---

## IAM Roles and Permissions

### Required IAM Policy Files

The project includes three IAM policy files in `iam-policies/`:

**1. `eb-service-trust-policy.json`** - Elastic Beanstalk Service Role:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "elasticbeanstalk.amazonaws.com"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "elasticbeanstalk"
        }
      }
    }
  ]
}
```

**2. `ec2-trust-policy.json`** - EC2 Instance Role:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

**3. `ecr-s3-policy.json`** - ECR and S3 Access:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRPullPermissions",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3AccessPermissions",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::hotel-reservation-group3-artifacts/*",
        "arn:aws:s3:::hotel-reservation-group3-artifacts",
        "arn:aws:s3:::elasticbeanstalk-*/*"
      ]
    },
    {
      "Sid": "CloudWatchLogsPermissions",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

### IAM Role Summary

| Role Name | Purpose | Attached Policies |
|-----------|---------|-------------------|
| `hotel-reservation-group3-eb-service-role` | Elastic Beanstalk operations | Enhanced Health, Managed Updates |
| `hotel-reservation-group3-ec2-role` | EC2 instance permissions | Web Tier, Docker, ECR/S3 Custom |
| `hotel-reservation-group3-ec2-profile` | Instance profile | Contains EC2 role |

---

## DocumentDB Setup

### Configuration

**Cluster**: `hotel-reservation-group3-docdb`  
**Engine**: DocumentDB 5.0.0  
**Instance Class**: db.t3.medium  
**Instance Count**: 1 (no replica)  
**Storage Encryption**: Disabled  
**Automated Backups**: Disabled  
**Username**: `group3`  
**Password**: `20251027-p2-group3`  
**Database**: `hotel_reservation`

### Security Configuration

DocumentDB runs in a private VPC with:
- Security group restricting access to EB instances
- SSL/TLS required for all connections
- No public accessibility

### Connection String Format

```
mongodb://group3:20251027-p2-group3@hotel-reservation-group3-docdb.cluster-xxxxx.us-east-1.docdb.amazonaws.com:27017/hotel_reservation?tls=true&tlsAllowInvalidHostnames=true&retryWrites=false
```

**Important Parameters**:
- `tls=true` - SSL/TLS required
- `tlsAllowInvalidHostnames=true` - Required for DocumentDB
- `retryWrites=false` - DocumentDB doesn't support retry writes

### SSL Certificate

The Dockerfile automatically downloads the required SSL certificate:

```dockerfile
# Download DocumentDB SSL certificate
RUN mkdir -p /app/certs && \
    curl -o /app/certs/global-bundle.pem \
    https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
```

No manual certificate management needed!

---

## Dockerization

### Dockerfile Overview

Located at `backend/Dockerfile`:

**Features**:
- ✅ Multi-stage build (builder + runtime)
- ✅ Automatic DocumentDB SSL certificate download
- ✅ Non-root user for security
- ✅ Health check endpoint
- ✅ JVM memory optimization
- ✅ Production-ready configuration

**Key Sections**:

1. **Builder Stage**: Compiles Java application with Maven
2. **Runtime Stage**: Runs application with minimal Alpine image
3. **SSL Setup**: Downloads DocumentDB certificate
4. **Security**: Non-root user (spring)
5. **Health Check**: Monitors `/actuator/health`

### Docker Build and Test Locally

```bash
# Navigate to backend
cd backend

# Build Docker image
docker build -t hotel-reservation-group3-backend:latest .

# Test run locally (update with your DocumentDB endpoint)
docker run -p 8080:8080 \
  -e SPRING_DATA_MONGODB_URI="mongodb://group3:20251027-p2-group3@your-endpoint:27017/hotel_reservation?tls=true&tlsAllowInvalidHostnames=true&retryWrites=false" \
  -e JWT_SECRET="your-jwt-secret" \
  -e SPRING_PROFILES_ACTIVE="prod" \
  hotel-reservation-group3-backend:latest

# Test health endpoint (in another terminal)
curl http://localhost:8080/actuator/health
```

Expected response:
```json
{
  "status": "UP",
  "components": {
    "mongo": {
      "status": "UP"
    }
  }
}
```

### Dockerrun.aws.json Configuration

Located at `backend/Dockerrun.aws.json`:

```json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "REPLACE_WITH_YOUR_ECR_URI:latest",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": 8080,
      "HostPort": 8080
    }
  ],
  "Logging": "/var/log/hotel-reservation",
  "Volumes": [
    {
      "HostDirectory": "/var/log/hotel-reservation",
      "ContainerDirectory": "/app/logs"
    }
  ],
  "Environment": [
    {
      "Name": "SPRING_PROFILES_ACTIVE",
      "Value": "prod"
    }
  ]
}
```

**Update the Image.Name** with your ECR repository URI from Step 2.

---

## Deployment Steps

### Pre-Deployment Checklist

- [ ] AWS CLI configured
- [ ] All AWS resources created (ECR, S3, IAM, DocumentDB)
- [ ] `.env.production` file configured
- [ ] `Dockerrun.aws.json` updated with ECR URI
- [ ] Docker running locally
- [ ] EB CLI installed

### Step 1: Build and Push Docker Image to ECR

```bash
# Navigate to backend directory
cd backend

# Get your ECR repository URI (from setup output or AWS console)
ECR_URI="123456789012.dkr.ecr.us-east-1.amazonaws.com/hotel-reservation-group3-backend"

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $ECR_URI

# Build Docker image
docker build -t hotel-reservation-group3-backend:latest .

# Tag for ECR
docker tag hotel-reservation-group3-backend:latest $ECR_URI:latest

# Push to ECR
docker push $ECR_URI:latest

# Also tag with version for rollback capability
VERSION=$(date +%Y%m%d-%H%M%S)
docker tag hotel-reservation-group3-backend:latest $ECR_URI:$VERSION
docker push $ECR_URI:$VERSION

echo "Image pushed: $ECR_URI:latest"
echo "Version: $ECR_URI:$VERSION"
```

### Step 2: Initialize Elastic Beanstalk

```bash
# Still in backend directory
# Initialize EB application
eb init hotel-reservation-group3-backend \
  --platform docker \
  --region us-east-1

# This creates .elasticbeanstalk/config.yml
```

### Step 3: Create Elastic Beanstalk Environment

```bash
# Create environment (single instance, no auto-scaling)
eb create hotel-reservation-group3-prod \
  --instance-type t3.medium \
  --service-role hotel-reservation-group3-eb-service-role \
  --elb-type application

# This will:
# - Create Application Load Balancer
# - Launch 1 EC2 t3.medium instance
# - Deploy Docker container from ECR
# - Configure security groups
# - Set up CloudWatch logging

# Wait for environment creation (5-10 minutes)
```

### Step 4: Set Environment Variables

```bash
# Get DocumentDB endpoint from setup script output or AWS console
DOCDB_ENDPOINT="hotel-reservation-group3-docdb.cluster-xxxxx.us-east-1.docdb.amazonaws.com"

# Set all environment variables
eb setenv \
  SPRING_DATA_MONGODB_URI="mongodb://group3:20251027-p2-group3@${DOCDB_ENDPOINT}:27017/hotel_reservation?tls=true&tlsAllowInvalidHostnames=true&retryWrites=false" \
  SPRING_DATA_MONGODB_DATABASE="hotel_reservation" \
  JWT_SECRET="$(openssl rand -base64 64)" \
  SPRING_PROFILES_ACTIVE="prod" \
  CORS_ALLOWED_ORIGINS="*" \
  AWS_REGION="us-east-1" \
  LOGGING_LEVEL_ROOT="INFO" \
  LOGGING_LEVEL_COM_HOTEL="DEBUG"

# This will restart the application with new variables
```

### Step 5: Deploy Application

```bash
# Deploy to EB environment
eb deploy

# Monitor deployment
eb status

# Check application health
eb health

# View recent logs
eb logs
```

### Step 6: Verify Deployment

```bash
# Open application in browser
eb open

# Or get the URL
EB_URL=$(eb status | grep CNAME | awk '{print $2}')
echo "Application URL: http://$EB_URL"

# Test health endpoint
curl http://$EB_URL/actuator/health

# Test API endpoint (if you have a public endpoint)
curl http://$EB_URL/api/rooms
```

### Step 7: Deploy Frontend to S3

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Get EB URL for API configuration
EB_URL=$(cd ../backend && eb status | grep CNAME | awk '{print $2}')

# Create production environment file
cat > .env.production <<EOF
VITE_API_URL=http://$EB_URL
VITE_APP_NAME=Hotel Reservation System
EOF

# Build production version
npm run build

# Deploy to S3
aws s3 sync dist/ s3://hotel-reservation-group3-frontend/ \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html"

# Upload index.html with no-cache
aws s3 cp dist/index.html s3://hotel-reservation-group3-frontend/index.html \
  --cache-control "no-cache, no-store, must-revalidate"

# Make bucket publicly accessible
aws s3api put-bucket-policy \
  --bucket hotel-reservation-group3-frontend \
  --policy file://frontend-bucket-policy.json

# Get S3 website URL
echo "Frontend URL: http://hotel-reservation-group3-frontend.s3-website-us-east-1.amazonaws.com"
```

### Step 8: Set Up CloudFront (Optional but Recommended)

```bash
# Create CloudFront distribution for HTTPS and global CDN
aws cloudfront create-distribution \
  --origin-domain-name hotel-reservation-group3-frontend.s3-website-us-east-1.amazonaws.com \
  --default-root-object index.html

# Note the CloudFront domain from output
# Example: d1234567890abc.cloudfront.net

# Update CORS configuration in backend
CF_URL="https://d1234567890abc.cloudfront.net"
cd ../backend
eb setenv CORS_ALLOWED_ORIGINS="$CF_URL"
eb deploy
```

---

## Post-Deployment Configuration

### 1. Verify All Components

```bash
# Check EB environment
cd backend
eb status
eb health

# Check DocumentDB connectivity (SSH into EB instance)
eb ssh
docker logs $(docker ps -q) | grep -i mongo
exit

# Check frontend
curl -I http://hotel-reservation-group3-frontend.s3-website-us-east-1.amazonaws.com

# Check CloudFront (if configured)
curl -I https://your-cloudfront-domain.cloudfront.net
```

### 2. Monitor Application

**CloudWatch Logs**:
```bash
# View recent logs
eb logs

# Stream logs in real-time
eb logs --stream

# View specific log
eb logs --log-group /aws/elasticbeanstalk/hotel-reservation-group3-prod/var/log/eb-docker/containers/eb-current-app/stdouterr.log
```

**CloudWatch Metrics**:
- Navigate to CloudWatch Console
- Select Metrics > Elastic Beanstalk
- View:
  - CPU Utilization
  - Network In/Out
  - Request Count
  - HTTP 2xx, 4xx, 5xx responses

### 3. Set Up CloudWatch Alarms

```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name hotel-reservation-group3-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --tags \
    Key=BatchID,Value=20251027-EY \
    Key=CreatedBy,Value=aepanda
```

### 4. Configure Custom Domain (Optional)

**Using Route 53**:

```bash
# Create hosted zone
aws route53 create-hosted-zone \
  --name hotelreservation.com \
  --caller-reference $(date +%s)

# Create A record (alias to ELB or CloudFront)
# Do this via AWS Console for easier configuration
```

**Request SSL Certificate**:

```bash
# Request ACM certificate (must be in us-east-1 for CloudFront)
aws acm request-certificate \
  --domain-name hotelreservation.com \
  --subject-alternative-names www.hotelreservation.com \
  --validation-method DNS \
  --region us-east-1

# Follow validation instructions
# Update CloudFront to use certificate
```

### 5. Enable HTTPS

**For Elastic Beanstalk**:
```bash
# Via console: Configuration > Load Balancer > Add Listener
# Port: 443
# Protocol: HTTPS
# SSL Certificate: Select from ACM
```

**For CloudFront**:
- Already supports HTTPS by default
- Add custom SSL certificate for custom domain

---

## Troubleshooting

### Common Issues

#### 1. Docker Image Pull Failed

**Symptom**: EB environment shows "Degraded" health, logs show "Error pulling image"

**Solution**:
```bash
# Verify ECR permissions
aws iam get-instance-profile --instance-profile-name hotel-reservation-group3-ec2-profile

# Check if custom ECR policy is attached
aws iam list-attached-role-policies --role-name hotel-reservation-group3-ec2-role

# Verify image exists in ECR
aws ecr describe-images --repository-name hotel-reservation-group3-backend

# Check Dockerrun.aws.json has correct ECR URI
cat backend/Dockerrun.aws.json
```

#### 2. Application Won't Start

**Symptom**: Health checks fail, application logs show errors

**Solution**:
```bash
# SSH into instance
eb ssh

# Check Docker container status
docker ps -a

# View container logs
docker logs $(docker ps -a -q)

# Check environment variables
docker exec $(docker ps -q) env | grep SPRING

# Check DocumentDB connectivity
docker exec $(docker ps -q) nc -zv hotel-reservation-group3-docdb.cluster-xxxxx.us-east-1.docdb.amazonaws.com 27017
```

#### 3. DocumentDB Connection Issues

**Symptom**: Application logs show "MongoTimeoutException" or "Connection refused"

**Solution**:
```bash
# Check security group allows traffic from EB to DocumentDB
aws ec2 describe-security-groups --filters "Name=group-name,Values=*group3*"

# Verify DocumentDB endpoint
aws docdb describe-db-clusters --db-cluster-identifier hotel-reservation-group3-docdb

# Check connection string format
eb printenv | grep MONGODB_URI

# Verify SSL certificate is in Docker image
eb ssh
docker exec $(docker ps -q) ls -la /app/certs/
```

#### 4. 502 Bad Gateway

**Symptom**: ALB returns 502 error

**Causes and Solutions**:

1. **Application not listening on port 8080**:
```bash
eb ssh
docker exec $(docker ps -q) netstat -tuln | grep 8080
```

2. **Health check path incorrect**:
```bash
# Verify health check configuration
eb config

# Test health endpoint
curl http://localhost:8080/actuator/health
```

3. **Container crashed**:
```bash
docker ps -a  # Check if container is running
docker logs $(docker ps -a -q)  # View crash logs
```

#### 5. CORS Errors in Frontend

**Symptom**: Browser console shows CORS policy errors

**Solution**:
```bash
# Check CORS configuration
eb printenv | grep CORS

# Update CORS with frontend URL
eb setenv CORS_ALLOWED_ORIGINS="https://your-frontend-url.com"

# Redeploy
eb deploy

# Verify CORS headers
curl -H "Origin: https://your-frontend-url.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  http://your-eb-url/api/rooms
```

#### 6. High Memory Usage

**Symptom**: Application becomes unresponsive, Out of Memory errors

**Solution**:
```bash
# Check memory usage
eb ssh
docker stats

# Adjust JVM heap size in Dockerfile
# Current: -Xms512m -Xmx1024m
# Change to: -Xms256m -Xmx768m (for smaller instances)

# Rebuild and redeploy
cd backend
docker build -t hotel-reservation-group3-backend:latest .
# ... push to ECR ...
eb deploy
```

### Useful Commands

```bash
# Environment status
eb status

# Application health
eb health

# View logs
eb logs
eb logs --stream

# SSH into instance
eb ssh

# Restart application
eb restart

# Deploy new version
eb deploy

# Set environment variables
eb setenv KEY=VALUE

# View environment variables
eb printenv

# Open application in browser
eb open

# Terminate environment (CAREFUL!)
eb terminate hotel-reservation-group3-prod

# List all environments
eb list

# Switch environment
eb use another-environment
```

### Emergency Rollback

If deployment fails:

```bash
# List application versions
eb appversion

# Deploy previous version
eb deploy --version previous-version-label

# Or via console:
# Elastic Beanstalk > Applications > hotel-reservation-group3-backend
# > Application versions > Select previous version > Deploy
```

---

## Resource Summary

### All Created Resources

| Resource Type | Resource Name | Purpose |
|---------------|---------------|---------|
| **ECR Repository** | `hotel-reservation-group3-backend` | Docker image storage |
| **S3 Bucket** | `hotel-reservation-group3-frontend` | Frontend static files |
| **S3 Bucket** | `hotel-reservation-group3-artifacts` | Build artifacts and logs |
| **DocumentDB Cluster** | `hotel-reservation-group3-docdb` | MongoDB-compatible database |
| **DocumentDB Instance** | `hotel-reservation-group3-docdb-instance-1` | Database instance |
| **Security Group** | `hotel-reservation-group3-docdb-sg` | DocumentDB access control |
| **DB Subnet Group** | `hotel-reservation-group3-docdb-subnet` | DocumentDB network |
| **IAM Role** | `hotel-reservation-group3-eb-service-role` | EB service operations |
| **IAM Role** | `hotel-reservation-group3-ec2-role` | EC2 instance permissions |
| **IAM Policy** | `HotelReservationGroup3ECRS3Policy` | ECR and S3 access |
| **Instance Profile** | `hotel-reservation-group3-ec2-profile` | EC2 IAM binding |
| **EB Application** | `hotel-reservation-group3-backend` | Elastic Beanstalk app |
| **EB Environment** | `hotel-reservation-group3-prod` | Production environment |
| **Application Load Balancer** | (auto-created) | Traffic distribution |
| **EC2 Instance** | (auto-created) | Application server |

### Resource Tags

All resources tagged with:
```
BatchID: 20251027-EY
CreatedBy: aepanda
Application: HotelReservation
Environment: Production
```

### Monthly Cost Estimate

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| DocumentDB | 1x db.t3.medium | ~$70 |
| DocumentDB Storage | 100 GB | ~$10 |
| EC2 (EB) | 1x t3.medium | ~$30 |
| Application Load Balancer | Standard | ~$20 |
| S3 | Storage + requests | ~$2 |
| ECR | Image storage | ~$1 |
| CloudWatch | Logs and metrics | ~$2 |
| Data Transfer | 100 GB/month | ~$5 |
| CloudFront | 100 GB/month | ~$5 |
| **Total** | | **~$145/month** |

**Cost Optimization Tips**:
- Use Reserved Instances for 30-60% savings
- Enable S3 lifecycle policies
- Configure CloudWatch log retention
- Use CloudFront caching to reduce origin requests

---

## Additional Resources

- **AWS Elastic Beanstalk Documentation**: https://docs.aws.amazon.com/elasticbeanstalk/
- **Amazon DocumentDB Documentation**: https://docs.aws.amazon.com/documentdb/
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/
- **Spring Boot on AWS**: https://spring.io/guides/gs/spring-boot-docker/
- **AWS Well-Architected Framework**: https://aws.amazon.com/architecture/well-architected/

---

## Support and Maintenance

### Regular Maintenance Tasks

**Weekly**:
- Review CloudWatch metrics
- Check application logs for errors
- Monitor costs in AWS Billing

**Monthly**:
- Review and rotate secrets (JWT_SECRET)
- Update dependencies in backend/frontend
- Review security group rules
- Check for AWS service updates

**Quarterly**:
- Rotate DocumentDB password
- Review IAM permissions
- Performance tuning based on metrics
- Update documentation

### Getting Help

For issues or questions:
1. Check this deployment guide first
2. Review CloudWatch logs: `eb logs`
3. Check EB environment events in console
4. Verify DocumentDB connectivity
5. Review security group and IAM configurations
6. Check AWS Service Health Dashboard

---

**End of Deployment Guide**

**BatchID**: 20251027-EY  
**Group**: group3  
**Version**: 3.0  
**Last Updated**: December 20, 2024
