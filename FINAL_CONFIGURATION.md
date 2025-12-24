# Final Configuration Changes

## Updates Made - December 20, 2024

### 🔧 Changes Summary

#### 1. **DocumentDB Cluster Simplified**

**Removed Options:**
- ❌ `--storage-encrypted` (No encryption)
- ❌ `--backup-retention-period 7` (No automatic backups)
- ❌ `--preferred-backup-window "03:00-04:00"` (No backup window)

**Kept:**
- ✅ `--preferred-maintenance-window "mon:04:00-mon:05:00"` (For system updates)

**Benefits:**
- Simplified configuration
- Reduced cost (no backup storage)
- Faster cluster creation
- Suitable for development/testing

**Note:** For production environments, consider enabling:
- Storage encryption for data security
- Automated backups for disaster recovery

#### 2. **DocumentDB Credentials Set**

```
Username: group3
Password: 20251027-p2-group3
Database: hotel_reservation
```

**Password set in script** - No need to change it manually.

#### 3. **Auto-Scaling Disabled**

**Previous Configuration:**
```yaml
MinSize: 2
MaxSize: 4
Auto-scaling triggers: CPU-based
```

**New Configuration:**
```yaml
MinSize: 1
MaxSize: 1
No auto-scaling
```

**Benefits:**
- Fixed single instance (predictable costs)
- Simpler configuration
- Suitable for controlled environments
- No unexpected scale-up charges

**Cost Impact:**
- Before: 2-4 EC2 instances = $60-120/month
- After: 1 EC2 instance = $30/month
- **Savings: $30-90/month**

#### 4. **Environment Variables File Created**

**File:** `env-production-example.txt`

**Contains:**
- DocumentDB connection string template
- Username: `group3`
- Password: `20251027-p2-group3`
- All required environment variables
- Clear setup instructions

**Usage:**
```bash
# Copy to backend directory
cp env-production-example.txt backend/.env.production

# Update the DocumentDB endpoint after running setup script
nano backend/.env.production
```

---

## 📊 Updated Cost Estimate

### Monthly AWS Costs (Simplified Configuration)

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| **DocumentDB** | 1x db.t3.medium (no encryption, no backups) | ~$70 |
| **DocumentDB Storage** | 100 GB (no backup storage) | ~$10 |
| **EC2 (EB)** | 1x t3.medium (no auto-scaling) | ~$30 |
| **Application Load Balancer** | Standard | ~$20 |
| **S3** | Frontend + Artifacts | ~$2 |
| **CloudFront** | CDN | ~$5 |
| **ECR** | Docker images | ~$1 |
| **CloudWatch** | Logs | ~$2 |
| **Data Transfer** | Variable | ~$5 |
| **Total** | | **~$145/month** |

### Cost Comparison

| Configuration | Monthly Cost | Savings |
|---------------|--------------|---------|
| Original (2 DocDB + auto-scaling 2-4 EC2) | ~$258 | - |
| First Update (1 DocDB + auto-scaling 2-4 EC2) | ~$188 | $70 |
| **Current (1 DocDB + 1 EC2, no extras)** | **~$145** | **$113 (44%)** |

---

## 🚀 Updated Deployment Steps

### 1. Run Setup Script

```bash
chmod +x setup-aws-resources.sh
./setup-aws-resources.sh
```

**Script will:**
- Create all AWS resources with `group3` naming
- Set DocumentDB username to `group3`
- Set DocumentDB password to `20251027-p2-group3`
- Create cluster without encryption or backups
- Configure single EC2 instance (no auto-scaling)
- Display all credentials in output

### 2. Create Environment File

```bash
# Copy template to backend
cp env-production-example.txt backend/.env.production

# Get DocumentDB endpoint from setup script output
# Update backend/.env.production with the endpoint
nano backend/.env.production

# Replace: REPLACE_WITH_DOCDB_ENDPOINT
# With: hotel-reservation-group3-docdb.cluster-xxxxx.us-east-1.docdb.amazonaws.com
```

### 3. Update Configuration Files

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

### 4. Deploy Application

```bash
# Build and push Docker image
cd backend
docker build -t hotel-reservation-group3-backend:latest .

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag hotel-reservation-group3-backend:latest \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/hotel-reservation-group3-backend:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/hotel-reservation-group3-backend:latest

# Initialize EB
eb init hotel-reservation-group3-backend --platform docker --region us-east-1

# Create environment (single instance, no auto-scaling)
eb create hotel-reservation-group3-prod \
  --instance-type t3.medium \
  --single \
  --service-role hotel-reservation-group3-eb-service-role \
  --instance-profile hotel-reservation-group3-ec2-profile

# Set environment variables
eb setenv \
  SPRING_DATA_MONGODB_URI="mongodb://group3:20251027-p2-group3@DOCDB_ENDPOINT:27017/hotel_reservation?tls=true&tlsAllowInvalidHostnames=true&retryWrites=false" \
  SPRING_DATA_MONGODB_DATABASE="hotel_reservation" \
  JWT_SECRET="generate-a-secure-secret" \
  SPRING_PROFILES_ACTIVE="prod"

# Deploy
eb deploy
```

---

## 📝 Connection String

### Full DocumentDB Connection String

```
mongodb://group3:20251027-p2-group3@hotel-reservation-group3-docdb.cluster-xxxxx.us-east-1.docdb.amazonaws.com:27017/hotel_reservation?tls=true&tlsAllowInvalidHostnames=true&retryWrites=false
```

**Components:**
- **Protocol**: `mongodb://`
- **Username**: `group3`
- **Password**: `20251027-p2-group3`
- **Host**: `hotel-reservation-group3-docdb.cluster-xxxxx.us-east-1.docdb.amazonaws.com`
- **Port**: `27017`
- **Database**: `hotel_reservation`
- **Options**:
  - `tls=true` (SSL/TLS required)
  - `tlsAllowInvalidHostnames=true` (DocumentDB requirement)
  - `retryWrites=false` (DocumentDB doesn't support retry writes)

---

## 📋 Configuration Files Updated

### 1. `setup-aws-resources.sh`
- ✅ Password set to `20251027-p2-group3`
- ✅ Removed encryption from DocumentDB
- ✅ Removed backup retention
- ✅ Removed backup window
- ✅ Updated output to show credentials

### 2. `backend/.ebextensions/autoscaling.config`
- ✅ MinSize: 1
- ✅ MaxSize: 1
- ✅ Removed CPU-based scaling triggers
- ✅ Kept health check configuration
- ✅ Kept CloudWatch log streaming

### 3. `env-production-example.txt` (NEW)
- ✅ Template for .env.production
- ✅ Contains all required environment variables
- ✅ Username: group3
- ✅ Password: 20251027-p2-group3
- ✅ Clear instructions for setup

---

## ⚠️ Important Notes

### Development vs Production

**Current Configuration is suitable for:**
- ✅ Development environments
- ✅ Testing environments
- ✅ Proof of concept
- ✅ Cost-sensitive deployments

**For Production, consider adding:**
- 🔒 Storage encryption (`--storage-encrypted`)
- 💾 Automated backups (`--backup-retention-period`)
- 🔄 Read replica for high availability
- 📈 Auto-scaling for EC2 instances
- 🔐 AWS Secrets Manager for credentials
- 🌐 Multi-AZ deployment

### Security Considerations

1. **Credentials in Script**
   - Password is hardcoded as `20251027-p2-group3`
   - Easy to remember but not highly secure
   - For production, use AWS Secrets Manager

2. **No Encryption**
   - Data is not encrypted at rest
   - Suitable for non-sensitive data
   - For production, enable encryption

3. **No Backups**
   - No automatic recovery from data loss
   - Manual snapshots recommended
   - For production, enable automated backups

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] DocumentDB cluster created without encryption
- [ ] DocumentDB has 1 instance (no replica)
- [ ] DocumentDB username is `group3`
- [ ] DocumentDB password is `20251027-p2-group3`
- [ ] Elastic Beanstalk has 1 EC2 instance only
- [ ] No auto-scaling configured
- [ ] `env-production-example.txt` file exists
- [ ] All resources tagged with BatchID `20251027-EY`
- [ ] All resources include `group3` in names
- [ ] Connection string works with application

---

## 🔗 Quick Reference

### DocumentDB Credentials
```
Username: group3
Password: 20251027-p2-group3
Database: hotel_reservation
```

### Resource Names
```
ECR: hotel-reservation-group3-backend
S3 Frontend: hotel-reservation-group3-frontend
S3 Artifacts: hotel-reservation-group3-artifacts
DocumentDB: hotel-reservation-group3-docdb
EB Environment: hotel-reservation-group3-prod
```

### Tags
```
BatchID: 20251027-EY
CreatedBy: aepanda
Application: HotelReservation
Environment: Production
```

---

**Last Updated**: December 20, 2024  
**Version**: 3.0 (Simplified Configuration)  
**BatchID**: 20251027-EY  
**Group**: group3

