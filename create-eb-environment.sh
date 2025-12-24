#!/bin/bash
set -e

echo "========================================="
echo "Create Elastic Beanstalk Environment"
echo "Single Instance with Public IP"
echo "========================================="
echo ""

# Configuration
VPC_ID="vpc-0366766502072fac8"
AWS_REGION="us-east-1"
ENV_NAME="hotel-reservation-group3-prod"
SERVICE_ROLE="hotel-reservation-group3-eb-service-role"
BatchID="20251027"
CreatedBy="aepanda"

echo "Step 1: Finding DocumentDB subnets (group3-docdb)..."

# Get subnets with "group3-docdb" in the name
DOCDB_SUBNETS=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query 'Subnets[?contains(Tags[?Key==`Name`].Value | [0], `group3-docdb`)].[SubnetId,AvailabilityZone,CidrBlock,MapPublicIpOnLaunch]' \
  --output text \
  --region $AWS_REGION)

if [ -z "$DOCDB_SUBNETS" ]; then
  echo "⚠️  No subnets with 'group3-docdb' name found."
  echo "Looking for subnets 10.0.10.0/24 and 10.0.11.0/24..."
  
  # Fallback to specific CIDR blocks
  SUBNET_1=$(aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$VPC_ID" "Name=cidr-block,Values=10.0.10.0/24" \
    --query 'Subnets[0].SubnetId' \
    --output text \
    --region $AWS_REGION)
  
  SUBNET_2=$(aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$VPC_ID" "Name=cidr-block,Values=10.0.11.0/24" \
    --query 'Subnets[0].SubnetId' \
    --output text \
    --region $AWS_REGION)
  
  if [ -z "$SUBNET_1" ] || [ "$SUBNET_1" == "None" ] || [ -z "$SUBNET_2" ] || [ "$SUBNET_2" == "None" ]; then
    echo "❌ ERROR: Could not find DocumentDB subnets (10.0.10.0/24 and 10.0.11.0/24)"
    echo "Please run setup-aws-resources.sh first to create the required subnets."
    exit 1
  fi
else
  echo "Found DocumentDB subnets:"
  echo "$DOCDB_SUBNETS"
  echo ""
  
  # Get first subnet
  SUBNET_1=$(echo "$DOCDB_SUBNETS" | head -1 | awk '{print $1}')
  # Get second subnet (if exists)
  SUBNET_2=$(echo "$DOCDB_SUBNETS" | head -2 | tail -1 | awk '{print $1}')
  
  # If only one subnet found, get any other subnet in different AZ
  if [ "$SUBNET_1" == "$SUBNET_2" ]; then
    echo "⚠️  Only one DocumentDB subnet found. Looking for another subnet in different AZ..."
    SUBNET_1_AZ=$(echo "$DOCDB_SUBNETS" | head -1 | awk '{print $2}')
    
    SUBNET_2=$(aws ec2 describe-subnets \
      --filters "Name=vpc-id,Values=$VPC_ID" \
      --query "Subnets[?AvailabilityZone!='$SUBNET_1_AZ'][0].SubnetId" \
      --output text \
      --region $AWS_REGION)
    
    if [ -z "$SUBNET_2" ] || [ "$SUBNET_2" == "None" ]; then
      echo "❌ ERROR: Could not find subnet in different AZ"
      exit 1
    fi
  fi
fi

# Verify subnets are public
echo ""
echo "Verifying subnets are public..."
SUBNET_1_PUBLIC=$(aws ec2 describe-subnets \
  --subnet-ids $SUBNET_1 \
  --query 'Subnets[0].MapPublicIpOnLaunch' \
  --output text \
  --region $AWS_REGION)

SUBNET_2_PUBLIC=$(aws ec2 describe-subnets \
  --subnet-ids $SUBNET_2 \
  --query 'Subnets[0].MapPublicIpOnLaunch' \
  --output text \
  --region $AWS_REGION)

if [ "$SUBNET_1_PUBLIC" != "True" ] || [ "$SUBNET_2_PUBLIC" != "True" ]; then
  echo "⚠️  Subnets are not public. Enabling auto-assign public IP..."
  
  aws ec2 modify-subnet-attribute \
    --subnet-id $SUBNET_1 \
    --map-public-ip-on-launch \
    --region $AWS_REGION 2>/dev/null || echo "  (Could not modify subnet $SUBNET_1)"
  
  aws ec2 modify-subnet-attribute \
    --subnet-id $SUBNET_2 \
    --map-public-ip-on-launch \
    --region $AWS_REGION 2>/dev/null || echo "  (Could not modify subnet $SUBNET_2)"
  
  echo "✅ Enabled auto-assign public IP"
else
  echo "✅ Subnets are public"
fi

# Use only the first subnet for single instance deployment
EC2_SUBNET=$SUBNET_1

echo ""
echo "========================================="
echo "Selected subnet for Elastic Beanstalk:"
echo "  EC2 Subnet: $EC2_SUBNET"
echo "  Instance Type: t3.medium"
echo "  Deployment: Single instance (no load balancer)"
echo "========================================="
echo ""

echo "Step 2: Creating Elastic Beanstalk environment..."
echo "This will take 10-15 minutes..."
echo ""

cd backend

# Create single instance environment (no load balancer, no auto-scaling)
# Instance will get a dynamic public IP from the subnet (no Elastic IP, no NAT Gateway)
# The subnet's MapPublicIpOnLaunch=True provides the public IP automatically
eb create $ENV_NAME \
  --instance-type t3.medium \
  --service-role $SERVICE_ROLE \
  --single \
  --vpc.id $VPC_ID \
  --vpc.ec2subnets $EC2_SUBNET

if [ $? -eq 0 ]; then
  echo ""
  echo "========================================="
  echo "✅ Environment Created Successfully!"
  echo "========================================="
  echo ""
  echo "Environment: $ENV_NAME"
  echo "Region: $AWS_REGION"
  echo "VPC: $VPC_ID"
  echo "Subnet: $EC2_SUBNET"
  echo "Instance Type: t3.medium"
  echo "Deployment Type: Single instance (no load balancer)"
  echo ""
  echo "Next steps:"
  echo "1. Set environment variables:"
  echo "   cd backend"
  echo "   eb setenv SPRING_DATA_MONGODB_URI='<your-mongodb-uri>'"
  echo ""
  echo "2. Deploy application:"
  echo "   eb deploy"
  echo ""
  echo "3. Get environment URL:"
  echo "   eb status"
  echo ""
else
  echo ""
  echo "❌ Failed to create environment"
  exit 1
fi
