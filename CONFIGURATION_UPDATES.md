# Configuration Updates Summary

## Changes Made - December 20, 2024

### 🏷️ Updated Configuration Values

#### 1. BatchID
- **Old**: `20251027`
- **New**: `20251027-EY`

#### 2. Resource Names (All include "group3")

| Resource Type | Old Name | New Name |
|---------------|----------|----------|
| ECR Repository | `hotel-reservation-backend` | `hotel-reservation-group3-backend` |
| S3 Frontend Bucket | `hotel-reservation-frontend` | `hotel-reservation-group3-frontend` |
| S3 Artifacts Bucket | `hotel-reservation-artifacts` | `hotel-reservation-group3-artifacts` |
| DocumentDB Cluster | `hotel-reservation-docdb` | `hotel-reservation-group3-docdb` |
| DB Subnet Group | `hotel-reservation-docdb-subnet` | `hotel-reservation-group3-docdb-subnet` |
| Security Group | `hotel-reservation-docdb-sg` | `hotel-reservation-group3-docdb-sg` |
| EB Service Role | `hotel-reservation-eb-service-role` | `hotel-reservation-group3-eb-service-role` |
| EC2 Instance Role | `hotel-reservation-ec2-role` | `hotel-reservation-group3-ec2-role` |
| Instance Profile | `hotel-reservation-ec2-profile` | `hotel-reservation-group3-ec2-profile` |
| IAM Policy | `HotelReservationECRS3Policy` | `HotelReservationGroup3ECRS3Policy` |
| EB Environment | `hotel-reservation-prod` | `hotel-reservation-group3-prod` |

#### 3. DocumentDB Configuration
- **Username**: Changed from `hoteldbadmin` to `group3`
- **Database Name**: Kept as `hotel_reservation` (unchanged)
- **Application Name**: Kept as `HotelReservation` (unchanged)
- **Instance Count**: Changed from 2 (primary + replica) to **1 (single instance only)**

#### 4. Configuration File Format
- **Changed**: `application-prod.properties` → `application-prod.yml`
- **Format**: Converted from Java Properties to YAML format
- **Content**: All settings preserved, just reformatted

---

## 📁 Files Modified

### 1. `setup-aws-resources.sh`
**Changes:**
- BatchID: `20251027` → `20251027-EY`
- All resource names now include `group3`
- DocumentDB username: `hoteldbadmin` → `group3`
- DocumentDB instances: Removed replica creation (single instance only)
- IAM policy name updated to include `Group3`

### 2. `iam-policies/ecr-s3-policy.json`
**Changes:**
- S3 bucket ARN updated: `hotel-reservation-artifacts` → `hotel-reservation-group3-artifacts`

### 3. `frontend-bucket-policy.json`
**Changes:**
- S3 bucket ARN updated: `hotel-reservation-frontend` → `hotel-reservation-group3-frontend`

### 4. `deploy.sh`
**Changes:**
- EB environment name: `hotel-reservation-prod` → `hotel-reservation-group3-prod`
- S3 bucket name: `hotel-reservation-frontend` → `hotel-reservation-group3-frontend`

### 5. `backend/src/main/resources/application-prod.yml` (NEW)
**Changes:**
- Created new YAML configuration file
- Converted all properties from .properties format to YAML
- Added comments for BatchID and Group
- All DocumentDB settings preserved

### 6. `backend/src/main/resources/application-prod.properties` (DELETED)
- Removed old properties file
- Replaced with YAML format

---

## 🔧 Updated Tags

All AWS resources will now be tagged with:

```yaml
BatchID: 20251027-EY
CreatedBy: aepanda
Application: HotelReservation
Environment: Production
Name: (resource-specific name with group3)
```

---

## 💰 Cost Impact

### DocumentDB Instance Reduction
**Before**: 2 instances (primary + replica)
- 2x db.t3.medium = ~$140/month

**After**: 1 instance (single instance)
- 1x db.t3.medium = ~$70/month

**Monthly Savings**: ~$70/month

### Updated Total Monthly Cost Estimate

| Service | Configuration | Cost |
|---------|--------------|------|
| **DocumentDB** | 1x db.t3.medium | ~$70 |
| **DocumentDB Storage** | 100 GB SSD | ~$10 |
| **DocumentDB Backups** | 7-day retention | ~$10 |
| **EC2 (EB)** | 2x t3.medium | ~$60 |
| **Application Load Balancer** | Standard | ~$20 |
| **S3** | Frontend + Artifacts | ~$2 |
| **CloudFront** | CDN | ~$5 |
| **ECR** | Docker images | ~$1 |
| **Other** | CloudWatch, Data Transfer | ~$10 |
| **Total** | | **~$188/month** |

**Savings from original estimate**: ~$70/month (27% reduction)

---

## 🚀 Deployment Commands (Updated)

### 1. Run Setup Script

```bash
# Make executable
chmod +x setup-aws-resources.sh

# Edit to change DocumentDB password
nano setup-aws-resources.sh
# Change: DOCDB_PASSWORD="ChangeThisSecurePassword123!"

# Run setup
./setup-aws-resources.sh
```

### 2. Update Configuration Files

After setup completes, update these files with output values:

**backend/Dockerrun.aws.json:**
```json
{
  "Image": {
    "Name": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/hotel-reservation-group3-backend:latest"
  }
}
```

**deploy.sh:**
```bash
ECR_REPO="ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/hotel-reservation-group3-backend"
```

### 3. Initialize Elastic Beanstalk

```bash
cd backend

eb init hotel-reservation-group3-backend \
  --platform docker \
  --region us-east-1
```

### 4. Create EB Environment

```bash
eb create hotel-reservation-group3-prod \
  --instance-type t3.medium \
  --service-role hotel-reservation-group3-eb-service-role \
  --instance-profile hotel-reservation-group3-ec2-profile \
  --elb-type application
```

### 5. Set Environment Variables

```bash
# Get DocumentDB endpoint from setup script output
DOCDB_ENDPOINT="hotel-reservation-group3-docdb.cluster-xxxxx.us-east-1.docdb.amazonaws.com"

eb setenv \
  SPRING_DATA_MONGODB_URI="mongodb://group3:YourPassword@${DOCDB_ENDPOINT}:27017/hotel_reservation?tls=true&tlsAllowInvalidHostnames=true&retryWrites=false" \
  SPRING_DATA_MONGODB_DATABASE="hotel_reservation" \
  JWT_SECRET="your-secure-jwt-secret-256-bits" \
  SPRING_PROFILES_ACTIVE="prod" \
  CORS_ALLOWED_ORIGINS="https://your-cloudfront-url.cloudfront.net" \
  AWS_REGION="us-east-1"
```

### 6. Deploy

```bash
# Update deploy.sh with your ECR URI and run
./deploy.sh
```

---

## 📋 Connection String Format

### Updated DocumentDB Connection String

```
mongodb://group3:<password>@hotel-reservation-group3-docdb.cluster-xxxxx.us-east-1.docdb.amazonaws.com:27017/hotel_reservation?tls=true&tlsAllowInvalidHostnames=true&retryWrites=false
```

**Key Components:**
- **Username**: `group3`
- **Database**: `hotel_reservation`
- **Cluster**: `hotel-reservation-group3-docdb`
- **SSL**: Required (`tls=true`)
- **Retry Writes**: Disabled (`retryWrites=false`)

---

## ✅ Verification Checklist

After running setup script, verify:

- [ ] ECR repository created: `hotel-reservation-group3-backend`
- [ ] S3 buckets created with `group3` in names
- [ ] IAM roles created with `group3` in names
- [ ] DocumentDB cluster created: `hotel-reservation-group3-docdb`
- [ ] DocumentDB has **1 instance only** (no replica)
- [ ] All resources tagged with `BatchID: 20251027-EY`
- [ ] All resources tagged with `CreatedBy: aepanda`
- [ ] Configuration saved to `aws-resources-config.txt`

---

## 🔍 Finding Your Resources

### AWS Console Search

Use these filters to find your resources:

**By BatchID:**
```
tag:BatchID=20251027-EY
```

**By Name Pattern:**
```
*group3*
```

**By Application:**
```
tag:Application=HotelReservation
```

### AWS CLI Commands

```bash
# List all resources with BatchID tag
aws resourcegroupstaggingapi get-resources \
  --tag-filters Key=BatchID,Values=20251027-EY \
  --region us-east-1

# List ECR repository
aws ecr describe-repositories \
  --repository-names hotel-reservation-group3-backend \
  --region us-east-1

# List S3 buckets
aws s3 ls | grep group3

# Describe DocumentDB cluster
aws docdb describe-db-clusters \
  --db-cluster-identifier hotel-reservation-group3-docdb \
  --region us-east-1

# List IAM roles
aws iam list-roles | grep group3
```

---

## 🎯 Key Benefits of Changes

### 1. Clear Identification
✅ All resources clearly identified with `group3`  
✅ Easy to distinguish from other projects  
✅ Prevents naming conflicts  

### 2. Cost Optimization
✅ Single DocumentDB instance saves ~$70/month  
✅ Suitable for development/staging environments  
✅ Can add replica later if needed  

### 3. Consistent Tagging
✅ BatchID `20251027-EY` for precise tracking  
✅ All resources follow same naming convention  
✅ Easy cost allocation and resource management  

### 4. Modern Configuration
✅ YAML format is more readable  
✅ Better structure and organization  
✅ Industry standard for Spring Boot  

---

## 📚 Related Documentation

- **Main Guide**: `AWS_DEPLOYMENT_GUIDE.md`
- **Quick Reference**: `QUICK_DEPLOY_GUIDE.md`
- **DocumentDB Setup**: `DOCUMENTDB_SETUP_GUIDE.md`
- **Previous Updates**: `DEPLOYMENT_UPDATES_SUMMARY.md`
- **Setup Script**: `setup-aws-resources.sh`

---

## ⚠️ Important Notes

1. **Single Instance**: DocumentDB now uses 1 instance instead of 2
   - Suitable for dev/staging environments
   - For production with high availability, consider adding a replica

2. **Username Change**: DocumentDB username is now `group3`
   - Update all connection strings accordingly
   - Update any documentation or scripts

3. **YAML Configuration**: Spring Boot will automatically use `.yml` over `.properties`
   - No code changes needed
   - Both formats are supported

4. **Resource Names**: All resources include `group3`
   - Update any hardcoded references
   - Update CI/CD pipelines if applicable

---

**Last Updated**: December 20, 2024  
**BatchID**: 20251027-EY  
**Group**: group3  
**Version**: 2.1

