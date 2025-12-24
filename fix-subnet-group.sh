#!/bin/bash
set -e

echo "========================================="
echo "Fix DocumentDB Subnet Group"
echo "========================================="
echo ""

AWS_REGION="us-east-1"
VPC_ID="vpc-0366766502072fac8"
DOCDB_SUBNET_GROUP="hotel-reservation-group3-docdb-subnet"
BatchID="20251027"
CreatedBy="aepanda"

echo "Step 1: Check if the problematic subnet group exists..."
if aws docdb describe-db-subnet-groups \
  --db-subnet-group-name $DOCDB_SUBNET_GROUP \
  --region $AWS_REGION 2>/dev/null > /dev/null; then
  
  echo "Found existing subnet group. Checking for clusters using it..."
  
  CLUSTERS_USING=$(aws docdb describe-db-clusters \
    --query "DBClusters[?DBSubnetGroup=='$DOCDB_SUBNET_GROUP'].DBClusterIdentifier" \
    --output text \
    --region $AWS_REGION)
  
  if [ -n "$CLUSTERS_USING" ]; then
    echo "❌ ERROR: Clusters are using this subnet group: $CLUSTERS_USING"
    echo "Cannot delete. Please delete clusters first."
    exit 1
  fi
  
  echo "No clusters using this group. Deleting..."
  aws docdb delete-db-subnet-group \
    --db-subnet-group-name $DOCDB_SUBNET_GROUP \
    --region $AWS_REGION
  
  echo "✅ Deleted problematic subnet group"
  echo "Waiting 5 seconds..."
  sleep 5
else
  echo "Subnet group does not exist. Will create new one."
fi

echo ""
echo "Step 2: Find /24 subnets in different AZs..."

# Get available AZs
AZ_LIST=($(aws ec2 describe-availability-zones \
  --region $AWS_REGION \
  --query 'AvailabilityZones[?State==`available`].ZoneName' \
  --output text))

echo "Available AZs: ${AZ_LIST[@]}"

# Find /24 subnets in first two different AZs
SUBNET_1_ID=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=availability-zone,Values=${AZ_LIST[0]}" \
  --query 'Subnets[?contains(CidrBlock, `/24`)][0].SubnetId' \
  --output text \
  --region $AWS_REGION)

SUBNET_2_ID=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=availability-zone,Values=${AZ_LIST[1]}" \
  --query 'Subnets[?contains(CidrBlock, `/24`)][0].SubnetId' \
  --output text \
  --region $AWS_REGION)

if [ -z "$SUBNET_1_ID" ] || [ "$SUBNET_1_ID" == "None" ] || [ -z "$SUBNET_2_ID" ] || [ "$SUBNET_2_ID" == "None" ]; then
  echo "❌ ERROR: Could not find /24 subnets in both ${AZ_LIST[0]} and ${AZ_LIST[1]}"
  echo "Please ensure /24 subnets exist in at least 2 different AZs"
  exit 1
fi

SUBNET_IDS="$SUBNET_1_ID $SUBNET_2_ID"

echo "Found /24 subnets:"
aws ec2 describe-subnets \
  --subnet-ids $SUBNET_IDS \
  --query 'Subnets[*].[SubnetId,CidrBlock,AvailabilityZone,State]' \
  --output table \
  --region $AWS_REGION

echo ""
echo "Step 3: Create new DB Subnet Group..."
aws docdb create-db-subnet-group \
  --db-subnet-group-name $DOCDB_SUBNET_GROUP \
  --db-subnet-group-description "Fixed subnet group for Hotel Reservation DocumentDB" \
  --subnet-ids $SUBNET_IDS \
  --tags \
    Key=BatchID,Value=$BatchID \
    Key=CreatedBy,Value=$CreatedBy \
  --region $AWS_REGION

echo "✅ Created new DB Subnet Group"

echo ""
echo "Step 4: Verify new subnet group..."
aws docdb describe-db-subnet-groups \
  --db-subnet-group-name $DOCDB_SUBNET_GROUP \
  --query 'DBSubnetGroups[0].Subnets[*].[SubnetIdentifier,SubnetAvailabilityZone.Name]' \
  --output table \
  --region $AWS_REGION

echo ""
echo "========================================="
echo "✅ Subnet Group Fixed Successfully!"
echo "========================================="
echo ""
echo "You can now run ./setup-aws-resources.sh again"
echo ""

