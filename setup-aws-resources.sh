#!/bin/bash
set -e

echo "========================================="
echo "Hotel Reservation - AWS Resource Setup"
echo "with DocumentDB and Proper Tagging"
echo "========================================="
echo ""

# Configuration
AWS_REGION="us-east-1"
BatchID="20251027"
CreatedBy="aepanda"
AppName="HotelReservation"
Environment="Production"

# Resource names (all include group3)
ECR_REPO_NAME="hotel-reservation-group3-backend"
S3_FRONTEND_BUCKET="hotel-reservation-group3-frontend"
S3_ARTIFACTS_BUCKET="hotel-reservation-group3-artifacts"
DocDBClusterID="hotel-reservation-group3-docdb"
DOCDB_SUBNET_GROUP="hotel-reservation-group3-docdb-subnet"
DocDBSGName="hotel-reservation-group3-docdb-sg"
EB_SERVICE_ROLE="hotel-reservation-group3-eb-service-role"
EC2_INSTANCE_ROLE="hotel-reservation-group3-ec2-role"
EC2_INSTANCE_PROFILE="hotel-reservation-group3-ec2-profile"

# VPC Configuration
VPC_ID="vpc-0366766502072fac8"

# DocumentDB Configuration
DOCDB_USERNAME="group3"
DOCDB_PASSWORD="20251027-p2-group3"
DOCDB_DB_NAME="hotel_reservation"
DOCDB_INSTANCE_CLASS="db.t3.small"

echo "Configuration:"
echo "  Region: $AWS_REGION"
echo "  BatchID: $BatchID"
echo "  CreatedBy: $CreatedBy"
echo "  Environment: $Environment"
echo "  VPC: $VPC_ID"
echo "  DocumentDB Instance Class: $DOCDB_INSTANCE_CLASS"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."
echo ""

# Step 1: Create ECR Repository
echo "Step 1: Creating ECR Repository..."
ECR_URI=$(aws ecr describe-repositories \
  --repository-names $ECR_REPO_NAME \
  --region $AWS_REGION \
  --query 'repositories[0].repositoryUri' \
  --output text 2>/dev/null || echo "")

if [ -z "$ECR_URI" ]; then
  aws ecr create-repository \
    --repository-name $ECR_REPO_NAME \
    --region $AWS_REGION \
    --tags \
      Key=BatchID,Value=$BatchID \
      Key=CreatedBy,Value=$CreatedBy
  
  ECR_URI=$(aws ecr describe-repositories \
    --repository-names $ECR_REPO_NAME \
    --region $AWS_REGION \
    --query 'repositories[0].repositoryUri' \
    --output text)
  
  echo "✅ ECR Repository created: $ECR_URI"
else
  echo "✅ ECR Repository already exists: $ECR_URI"
fi

# Step 2: Create S3 Buckets
echo ""
echo "Step 2: Creating S3 Buckets..."

# Frontend bucket
if aws s3 ls "s3://$S3_FRONTEND_BUCKET" 2>/dev/null; then
  echo "✅ Frontend bucket already exists"
else
  aws s3 mb s3://$S3_FRONTEND_BUCKET --region $AWS_REGION
  aws s3api put-bucket-tagging \
    --bucket $S3_FRONTEND_BUCKET \
    --tagging "TagSet=[{Key=BatchID,Value=$BatchID},{Key=CreatedBy,Value=$CreatedBy}]"
  echo "✅ Frontend bucket created: s3://$S3_FRONTEND_BUCKET"
fi

# Artifacts bucket
if aws s3 ls "s3://$S3_ARTIFACTS_BUCKET" 2>/dev/null; then
  echo "✅ Artifacts bucket already exists"
else
  aws s3 mb s3://$S3_ARTIFACTS_BUCKET --region $AWS_REGION
  aws s3api put-bucket-versioning \
    --bucket $S3_ARTIFACTS_BUCKET \
    --versioning-configuration Status=Enabled
  aws s3api put-bucket-tagging \
    --bucket $S3_ARTIFACTS_BUCKET \
    --tagging "TagSet=[{Key=BatchID,Value=$BatchID},{Key=CreatedBy,Value=$CreatedBy}]"
  echo "✅ Artifacts bucket created: s3://$S3_ARTIFACTS_BUCKET"
fi

# Step 3: Create IAM Roles
echo ""
echo "Step 3: Creating IAM Roles..."

# EB Service Role
if aws iam get-role --role-name $EB_SERVICE_ROLE 2>/dev/null > /dev/null; then
  echo "✅ EB Service Role already exists"
else
  aws iam create-role \
    --role-name $EB_SERVICE_ROLE \
    --assume-role-policy-document file://iam-policies/eb-service-trust-policy.json \
    --tags \
      Key=BatchID,Value=$BatchID \
      Key=CreatedBy,Value=$CreatedBy
  
  aws iam attach-role-policy \
    --role-name $EB_SERVICE_ROLE \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth
  
  aws iam attach-role-policy \
    --role-name $EB_SERVICE_ROLE \
    --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy
  
  echo "✅ EB Service Role created"
fi

# EC2 Instance Role
if aws iam get-role --role-name $EC2_INSTANCE_ROLE 2>/dev/null > /dev/null; then
  echo "✅ EC2 Instance Role already exists"
else
  aws iam create-role \
    --role-name $EC2_INSTANCE_ROLE \
    --assume-role-policy-document file://iam-policies/ec2-trust-policy.json \
    --tags \
      Key=BatchID,Value=$BatchID \
      Key=CreatedBy,Value=$CreatedBy
  
  aws iam attach-role-policy \
    --role-name $EC2_INSTANCE_ROLE \
    --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier
  
  aws iam attach-role-policy \
    --role-name $EC2_INSTANCE_ROLE \
    --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker
  
  echo "✅ EC2 Instance Role created"
fi

# Create custom policy for ECR and S3
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
POLICY_ARN="arn:aws:iam::$ACCOUNT_ID:policy/HotelReservationGroup3ECRS3Policy"

if aws iam get-policy --policy-arn $POLICY_ARN 2>/dev/null > /dev/null; then
  echo "✅ Custom policy already exists"
else
  aws iam create-policy \
    --policy-name HotelReservationGroup3ECRS3Policy \
    --policy-document file://iam-policies/ecr-s3-policy.json \
    --tags \
      Key=BatchID,Value=$BatchID \
      Key=CreatedBy,Value=$CreatedBy
  
  aws iam attach-role-policy \
    --role-name $EC2_INSTANCE_ROLE \
    --policy-arn $POLICY_ARN
  
  echo "✅ Custom policy created and attached"
fi

# Create Instance Profile
if aws iam get-instance-profile --instance-profile-name $EC2_INSTANCE_PROFILE 2>/dev/null > /dev/null; then
  echo "✅ Instance Profile already exists"
else
  aws iam create-instance-profile \
    --instance-profile-name $EC2_INSTANCE_PROFILE \
    --tags \
      Key=BatchID,Value=$BatchID \
      Key=CreatedBy,Value=$CreatedBy
  
  aws iam add-role-to-instance-profile \
    --instance-profile-name $EC2_INSTANCE_PROFILE \
    --role-name $EC2_INSTANCE_ROLE
  
  echo "✅ Instance Profile created"
  echo "⏳ Waiting 10 seconds for IAM propagation..."
  sleep 10
fi

# Step 4: Setup DocumentDB
echo ""
echo "Step 4: Setting up Amazon DocumentDB..."
echo "⚠️  This will take 10-15 minutes to complete"
echo ""

# Get VPC CIDR block
VPC_CIDR=$(aws ec2 describe-vpcs \
  --vpc-ids $VPC_ID \
  --query 'Vpcs[0].CidrBlock' \
  --output text \
  --region $AWS_REGION)

echo "Using VPC: $VPC_ID ($VPC_CIDR)"

# Get available AZs
AZ_LIST=($(aws ec2 describe-availability-zones \
  --region $AWS_REGION \
  --query 'AvailabilityZones[?State==`available`].ZoneName' \
  --output text))

echo "Available AZs: ${AZ_LIST[@]}"
echo ""

# Check for specific public subnets (10.0.10.0/24 and 10.0.11.0/24)
echo "Looking for public subnets 10.0.10.0/24 and 10.0.11.0/24..."

BASE_CIDR=$(echo $VPC_CIDR | cut -d'.' -f1-2)
SUBNET_1_CIDR="${BASE_CIDR}.10.0/24"
SUBNET_2_CIDR="${BASE_CIDR}.11.0/24"

# Check if subnet 10.0.10.0/24 exists
SUBNET_1_ID=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=cidr-block,Values=$SUBNET_1_CIDR" \
  --query 'Subnets[0].SubnetId' \
  --output text \
  --region $AWS_REGION 2>/dev/null || echo "")

# Check if subnet 10.0.11.0/24 exists
SUBNET_2_ID=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=cidr-block,Values=$SUBNET_2_CIDR" \
  --query 'Subnets[0].SubnetId' \
  --output text \
  --region $AWS_REGION 2>/dev/null || echo "")

# Check if subnets exist and are public
NEED_TO_CREATE=false

if [ -n "$SUBNET_1_ID" ] && [ "$SUBNET_1_ID" != "None" ] && [ -n "$SUBNET_2_ID" ] && [ "$SUBNET_2_ID" != "None" ]; then
  echo "✅ Found existing subnets: $SUBNET_1_ID, $SUBNET_2_ID"
  
  # Check if they are public (have route to IGW)
  SUBNET_1_PUBLIC=$(aws ec2 describe-subnets \
    --subnet-ids $SUBNET_1_ID \
    --query 'Subnets[0].MapPublicIpOnLaunch' \
    --output text \
    --region $AWS_REGION)
  
  SUBNET_2_PUBLIC=$(aws ec2 describe-subnets \
    --subnet-ids $SUBNET_2_ID \
    --query 'Subnets[0].MapPublicIpOnLaunch' \
    --output text \
    --region $AWS_REGION)
  
  if [ "$SUBNET_1_PUBLIC" != "True" ] || [ "$SUBNET_2_PUBLIC" != "True" ]; then
    echo "⚠️  Subnets exist but are not public. Converting to public subnets..."
    
    # Enable auto-assign public IP
    aws ec2 modify-subnet-attribute \
      --subnet-id $SUBNET_1_ID \
      --map-public-ip-on-launch \
      --region $AWS_REGION 2>/dev/null || true
    
    aws ec2 modify-subnet-attribute \
      --subnet-id $SUBNET_2_ID \
      --map-public-ip-on-launch \
      --region $AWS_REGION 2>/dev/null || true
    
    echo "✅ Enabled auto-assign public IP on subnets"
  else
    echo "✅ Subnets are already public"
  fi
else
  NEED_TO_CREATE=true
fi

# Create public subnets if they don't exist
if [ "$NEED_TO_CREATE" = true ]; then
  echo "⚠️  Subnets 10.0.10.0/24 and 10.0.11.0/24 do not exist. Creating public subnets..."
  
  # Check for Internet Gateway
  echo "Checking for Internet Gateway..."
  IGW_ID=$(aws ec2 describe-internet-gateways \
    --filters "Name=attachment.vpc-id,Values=$VPC_ID" \
    --query 'InternetGateways[0].InternetGatewayId' \
    --output text \
    --region $AWS_REGION)
  
  if [ -z "$IGW_ID" ] || [ "$IGW_ID" == "None" ]; then
    echo "Creating Internet Gateway..."
    IGW_ID=$(aws ec2 create-internet-gateway \
      --query 'InternetGateway.InternetGatewayId' \
      --output text \
      --region $AWS_REGION)
    
    aws ec2 create-tags \
      --resources $IGW_ID \
      --tags \
        Key=Name,Value="hotel-reservation-group3-igw" \
        Key=BatchID,Value=$BatchID \
        Key=CreatedBy,Value=$CreatedBy \
      --region $AWS_REGION
    
    aws ec2 attach-internet-gateway \
      --internet-gateway-id $IGW_ID \
      --vpc-id $VPC_ID \
      --region $AWS_REGION
    
    echo "✅ Internet Gateway created: $IGW_ID"
  else
    echo "✅ Internet Gateway exists: $IGW_ID"
  fi
  
  # Create Route Table for public subnets
  echo "Creating public route table..."
  RT_ID=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --query 'RouteTable.RouteTableId' \
    --output text \
    --region $AWS_REGION)
  
  aws ec2 create-tags \
    --resources $RT_ID \
    --tags \
      Key=Name,Value="hotel-reservation-group3-public-rt" \
      Key=BatchID,Value=$BatchID \
      Key=CreatedBy,Value=$CreatedBy \
    --region $AWS_REGION
  
  # Add route to Internet Gateway
  aws ec2 create-route \
    --route-table-id $RT_ID \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id $IGW_ID \
    --region $AWS_REGION
  
  echo "✅ Route table created: $RT_ID"
  
  # Create Public Subnet 1 (10.0.10.0/24)
  echo "Creating public subnet 1: $SUBNET_1_CIDR..."
  SUBNET_1_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block $SUBNET_1_CIDR \
    --availability-zone ${AZ_LIST[0]} \
    --query 'Subnet.SubnetId' \
    --output text \
    --region $AWS_REGION)
  
  aws ec2 create-tags \
    --resources $SUBNET_1_ID \
    --tags \
      Key=Name,Value="hotel-reservation-group3-public-subnet-1" \
      Key=BatchID,Value=$BatchID \
      Key=CreatedBy,Value=$CreatedBy \
    --region $AWS_REGION
  
  # Enable auto-assign public IP
  aws ec2 modify-subnet-attribute \
    --subnet-id $SUBNET_1_ID \
    --map-public-ip-on-launch \
    --region $AWS_REGION
  
  # Associate with route table
  aws ec2 associate-route-table \
    --route-table-id $RT_ID \
    --subnet-id $SUBNET_1_ID \
    --region $AWS_REGION
  
  echo "✅ Public subnet 1 created: $SUBNET_1_ID ($SUBNET_1_CIDR in ${AZ_LIST[0]})"
  
  # Create Public Subnet 2 (10.0.11.0/24)
  echo "Creating public subnet 2: $SUBNET_2_CIDR..."
  SUBNET_2_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block $SUBNET_2_CIDR \
    --availability-zone ${AZ_LIST[1]} \
    --query 'Subnet.SubnetId' \
    --output text \
    --region $AWS_REGION)
  
  aws ec2 create-tags \
    --resources $SUBNET_2_ID \
    --tags \
      Key=Name,Value="hotel-reservation-group3-public-subnet-2" \
      Key=BatchID,Value=$BatchID \
      Key=CreatedBy,Value=$CreatedBy \
    --region $AWS_REGION
  
  # Enable auto-assign public IP
  aws ec2 modify-subnet-attribute \
    --subnet-id $SUBNET_2_ID \
    --map-public-ip-on-launch \
    --region $AWS_REGION
  
  # Associate with route table
  aws ec2 associate-route-table \
    --route-table-id $RT_ID \
    --subnet-id $SUBNET_2_ID \
    --region $AWS_REGION
  
  echo "✅ Public subnet 2 created: $SUBNET_2_ID ($SUBNET_2_CIDR in ${AZ_LIST[1]})"
fi

SUBNET_IDS="$SUBNET_1_ID $SUBNET_2_ID"
echo "Using subnets: $SUBNET_IDS"
echo ""

# Check for existing DB Subnet Group
EXISTING_SUBNET_GROUPS=$(aws docdb describe-db-subnet-groups \
  --region $AWS_REGION \
  --query "DBSubnetGroups[?VpcId=='$VPC_ID'].DBSubnetGroupName" \
  --output text 2>/dev/null)

SELECTED_SUBNET_GROUP=""

if [ -n "$EXISTING_SUBNET_GROUPS" ]; then
  FIRST_GROUP=$(echo "$EXISTING_SUBNET_GROUPS" | awk '{print $1}')
  
  GROUP_AZ_COUNT=$(aws docdb describe-db-subnet-groups \
    --db-subnet-group-name $FIRST_GROUP \
    --query 'DBSubnetGroups[0].Subnets[*].SubnetAvailabilityZone.Name' \
    --output text \
    --region $AWS_REGION | tr '\t' '\n' | sort -u | wc -l | tr -d ' ')
  
  if [ "$GROUP_AZ_COUNT" -ge 2 ]; then
    echo "✅ Using existing DB Subnet Group: $FIRST_GROUP"
    SELECTED_SUBNET_GROUP=$FIRST_GROUP
  fi
fi

# Create DB Subnet Group if needed
if [ -z "$SELECTED_SUBNET_GROUP" ]; then
  if aws docdb describe-db-subnet-groups \
    --db-subnet-group-name $DOCDB_SUBNET_GROUP \
    --region $AWS_REGION 2>/dev/null > /dev/null; then
    echo "✅ DB Subnet Group already exists"
    SELECTED_SUBNET_GROUP=$DOCDB_SUBNET_GROUP
  else
    aws docdb create-db-subnet-group \
      --db-subnet-group-name $DOCDB_SUBNET_GROUP \
      --db-subnet-group-description "Subnet group for Hotel Reservation DocumentDB" \
      --subnet-ids $SUBNET_IDS \
      --tags \
        Key=BatchID,Value=$BatchID \
        Key=CreatedBy,Value=$CreatedBy \
      --region $AWS_REGION
    
    echo "✅ DB Subnet Group created"
    SELECTED_SUBNET_GROUP=$DOCDB_SUBNET_GROUP
  fi
fi

DOCDB_SUBNET_GROUP=$SELECTED_SUBNET_GROUP

# Create Security Group for DocumentDB
DOCDB_SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=$DocDBSGName" "Name=vpc-id,Values=$VPC_ID" \
  --query 'SecurityGroups[0].GroupId' \
  --output text \
  --region $AWS_REGION 2>/dev/null || echo "")

if [ "$DOCDB_SG_ID" != "" ] && [ "$DOCDB_SG_ID" != "None" ]; then
  echo "✅ DocumentDB Security Group already exists: $DOCDB_SG_ID"
else
  DOCDB_SG_ID=$(aws ec2 create-security-group \
    --group-name $DocDBSGName \
    --description "Security group for Hotel Reservation DocumentDB" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text \
    --region $AWS_REGION)
  
  aws ec2 create-tags \
    --resources $DOCDB_SG_ID \
    --tags \
      Key=Name,Value=$DocDBSGName \
      Key=BatchID,Value=$BatchID \
      Key=CreatedBy,Value=$CreatedBy \
    --region $AWS_REGION
  
  echo "✅ DocumentDB Security Group created: $DOCDB_SG_ID"
fi

# Allow MongoDB traffic within VPC
aws ec2 authorize-security-group-ingress \
  --group-id $DOCDB_SG_ID \
  --protocol tcp \
  --port 27017 \
  --cidr 10.0.0.0/16 \
  --region $AWS_REGION 2>/dev/null || echo "  (Ingress rule already exists)"

# Create DocumentDB Cluster
if aws docdb describe-db-clusters \
  --db-cluster-identifier $DocDBClusterID \
  --region $AWS_REGION 2>/dev/null > /dev/null; then
  echo "✅ DocumentDB Cluster already exists"
else
  echo ""
  echo "Creating DocumentDB Cluster (this takes 10-15 minutes)..."
  aws docdb create-db-cluster \
    --db-cluster-identifier $DocDBClusterID \
    --engine docdb \
    --engine-version 5.0.0 \
    --master-username $DOCDB_USERNAME \
    --master-user-password "$DOCDB_PASSWORD" \
    --db-subnet-group-name "$DOCDB_SUBNET_GROUP" \
    --vpc-security-group-ids $DOCDB_SG_ID \
    --preferred-maintenance-window "mon:04:00-mon:05:00" \
    --tags \
      Key=BatchID,Value=$BatchID \
      Key=CreatedBy,Value=$CreatedBy \
      Key=Name,Value=$DocDBClusterID \
    --region $AWS_REGION
  
  echo "⏳ Waiting for DocumentDB Cluster to become available..."
  aws docdb wait db-cluster-available \
    --db-cluster-identifier $DocDBClusterID \
    --region $AWS_REGION
  
  echo "✅ DocumentDB Cluster created"
fi

# Create DocumentDB Instance
if aws docdb describe-db-instances \
  --db-instance-identifier "${DocDBClusterID}-instance-1" \
  --region $AWS_REGION 2>/dev/null > /dev/null; then
  echo "✅ DocumentDB Instance already exists"
else
  echo ""
  echo "Creating DocumentDB Instance (this takes 5-10 minutes)..."
  aws docdb create-db-instance \
    --db-instance-identifier "${DocDBClusterID}-instance-1" \
    --db-instance-class $DOCDB_INSTANCE_CLASS \
    --engine docdb \
    --db-cluster-identifier $DocDBClusterID \
    --preferred-maintenance-window "mon:05:00-mon:06:00" \
    --tags \
      Key=BatchID,Value=$BatchID \
      Key=CreatedBy,Value=$CreatedBy \
      Key=Name,Value="${DocDBClusterID}-instance" \
    --region $AWS_REGION
  
  echo "⏳ Waiting for Instance to become available..."
  aws docdb wait db-instance-available \
    --db-instance-identifier "${DocDBClusterID}-instance-1" \
    --region $AWS_REGION
  
  echo "✅ DocumentDB Instance created"
fi

# Get DocumentDB Endpoint
DOCDB_ENDPOINT=$(aws docdb describe-db-clusters \
  --db-cluster-identifier $DocDBClusterID \
  --query 'DBClusters[0].Endpoint' \
  --output text \
  --region $AWS_REGION)

echo ""
echo "========================================="
echo "✅ AWS Resources Setup Complete!"
echo "========================================="
echo ""
echo "📋 Resource Summary:"
echo ""
echo "ECR Repository:"
echo "  URI: $ECR_URI"
echo ""
echo "S3 Buckets:"
echo "  Frontend: s3://$S3_FRONTEND_BUCKET"
echo "  Artifacts: s3://$S3_ARTIFACTS_BUCKET"
echo ""
echo "IAM Roles:"
echo "  EB Service Role: $EB_SERVICE_ROLE"
echo "  EC2 Instance Role: $EC2_INSTANCE_ROLE"
echo "  Instance Profile: $EC2_INSTANCE_PROFILE"
echo ""
echo "DocumentDB:"
echo "  Cluster ID: $DocDBClusterID"
echo "  Instance Class: $DOCDB_INSTANCE_CLASS"
echo "  Endpoint: $DOCDB_ENDPOINT"
echo "  Username: $DOCDB_USERNAME"
echo "  Database: $DOCDB_DB_NAME"
echo "  Security Group: $DOCDB_SG_ID"
echo ""
echo "📝 Connection String:"
echo "mongodb://$DOCDB_USERNAME:<password>@$DOCDB_ENDPOINT:27017/$DOCDB_DB_NAME?tls=true&tlsAllowInvalidHostnames=true&retryWrites=false"
echo ""
echo "========================================="
echo ""
echo "Next Steps:"
echo "1. Update backend/Dockerrun.aws.json with ECR URI:"
echo "   $ECR_URI:latest"
echo ""
echo "2. Initialize Elastic Beanstalk:"
echo "   cd backend && eb init"
echo ""
echo "3. Create EB environment:"
echo "   eb create hotel-reservation-prod --instance-type t3.medium --service-role $EB_SERVICE_ROLE --instance-profile $EC2_INSTANCE_PROFILE"
echo ""
echo "4. Set environment variables:"
echo "   eb setenv SPRING_DATA_MONGODB_URI='mongodb://$DOCDB_USERNAME:$DOCDB_PASSWORD@$DOCDB_ENDPOINT:27017/$DOCDB_DB_NAME?tls=true&tlsAllowInvalidHostnames=true&retryWrites=false'"
echo ""
echo "5. Deploy application:"
echo "   ./deploy.sh"
echo ""
echo "========================================="
echo ""
echo "⚠️  IMPORTANT: DocumentDB Credentials"
echo "   Username: $DOCDB_USERNAME"
echo "   Password: $DOCDB_PASSWORD"
echo "   Database: $DOCDB_DB_NAME"
echo ""

# Save configuration to file
cat > aws-resources-config.txt <<EOF
AWS Resources Configuration
Generated: $(date)

BatchID: $BatchID
CreatedBy: $CreatedBy
Region: $AWS_REGION
Environment: $Environment

ECR Repository: $ECR_URI
S3 Frontend Bucket: $S3_FRONTEND_BUCKET
S3 Artifacts Bucket: $S3_ARTIFACTS_BUCKET

EB Service Role: $EB_SERVICE_ROLE
EC2 Instance Role: $EC2_INSTANCE_ROLE
Instance Profile: $EC2_INSTANCE_PROFILE

DocumentDB Cluster: $DocDBClusterID
DocumentDB Instance Class: $DOCDB_INSTANCE_CLASS
DocumentDB Endpoint: $DOCDB_ENDPOINT
DocumentDB Username: $DOCDB_USERNAME
DocumentDB Database: $DOCDB_DB_NAME
DocumentDB Security Group: $DOCDB_SG_ID

Connection String:
mongodb://$DOCDB_USERNAME:<password>@$DOCDB_ENDPOINT:27017/$DOCDB_DB_NAME?tls=true&tlsAllowInvalidHostnames=true&retryWrites=false
EOF

echo "Configuration saved to: aws-resources-config.txt"
echo ""
