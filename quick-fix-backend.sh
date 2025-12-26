#!/bin/bash

# Quick fix script to create missing ECS service components

AWS_REGION="us-east-1"
PROJECT_NAME="hotelx"

echo "Getting VPC ID..."
VPC_ID=$(aws ec2 describe-vpcs \
    --filters "Name=tag:Name,Values=${PROJECT_NAME}-prod-vpc" \
    --query 'Vpcs[0].VpcId' \
    --output text \
    --region $AWS_REGION)

echo "VPC ID: $VPC_ID"

echo "Getting subnet IDs..."
PRIVATE_SUBNET_1_ID=$(aws ec2 describe-subnets \
    --filters "Name=tag:Name,Values=${PROJECT_NAME}-private-subnet-1" \
    --query 'Subnets[0].SubnetId' \
    --output text \
    --region $AWS_REGION)

PRIVATE_SUBNET_2_ID=$(aws ec2 describe-subnets \
    --filters "Name=tag:Name,Values=${PROJECT_NAME}-private-subnet-2" \
    --query 'Subnets[0].SubnetId' \
    --output text \
    --region $AWS_REGION)

echo "Private Subnets: $PRIVATE_SUBNET_1_ID, $PRIVATE_SUBNET_2_ID"

echo "Creating security groups..."

# Create ALB Security Group
ALB_SG_ID=$(aws ec2 create-security-group \
    --group-name ${PROJECT_NAME}-prod-alb-sg \
    --description "Security group for ALB" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text \
    --region $AWS_REGION 2>/dev/null || \
    aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=${PROJECT_NAME}-prod-alb-sg" \
        --query 'SecurityGroups[0].GroupId' \
        --output text \
        --region $AWS_REGION)

echo "ALB SG: $ALB_SG_ID"

# Add ALB rules
aws ec2 authorize-security-group-ingress \
    --group-id $ALB_SG_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION 2>/dev/null || true

aws ec2 authorize-security-group-ingress \
    --group-id $ALB_SG_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION 2>/dev/null || true

# Create ECS Security Group
ECS_SG_ID=$(aws ec2 create-security-group \
    --group-name ${PROJECT_NAME}-prod-ecs-sg \
    --description "Security group for ECS tasks" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text \
    --region $AWS_REGION 2>/dev/null || \
    aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=${PROJECT_NAME}-prod-ecs-sg" \
        --query 'SecurityGroups[0].GroupId' \
        --output text \
        --region $AWS_REGION)

echo "ECS SG: $ECS_SG_ID"

# Add ECS rules
aws ec2 authorize-security-group-ingress \
    --group-id $ECS_SG_ID \
    --protocol tcp \
    --port 8080 \
    --source-group $ALB_SG_ID \
    --region $AWS_REGION 2>/dev/null || true

echo "Getting target group ARN..."
TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups \
    --names ${PROJECT_NAME}-backend-tg \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text \
    --region $AWS_REGION)

echo "Target Group: $TARGET_GROUP_ARN"

echo "Creating ECS service..."

# First, we need to build and push a Docker image
echo "Note: You need a Docker image in ECR before creating the service."
echo "The GitHub Actions workflow will handle this."

echo ""
echo "✅ Security groups created successfully!"
echo "   ALB Security Group: $ALB_SG_ID"
echo "   ECS Security Group: $ECS_SG_ID"
echo ""
echo "📋 Now trigger the GitHub Actions workflow again:"
echo "   1. Push a commit to main branch"
echo "   2. Or go to Actions → Deploy Backend to AWS → Run workflow"
echo ""
echo "The workflow will:"
echo "   1. Build the Docker image"
echo "   2. Push to ECR"
echo "   3. Create the ECS service automatically"
