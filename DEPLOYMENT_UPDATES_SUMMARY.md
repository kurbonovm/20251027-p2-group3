# Deployment Updates Summary

## Changes Made for DocumentDB Integration and AWS Resource Tagging

### Date: December 20, 2024
### BatchID: 20251027
### CreatedBy: aepanda

---

## 🎯 Overview

The deployment configuration has been updated to:
1. **Use Amazon DocumentDB** instead of MongoDB Atlas as the database
2. **Add consistent tagging** to all AWS resources with `BatchID=20251027` and `CreatedBy=aepanda`
3. Provide automated scripts for resource setup
4. Include DocumentDB-specific configurations

---

## 📚 New Files Created

### 1. **DOCUMENTDB_SETUP_GUIDE.md**
Comprehensive guide covering:
- DocumentDB architecture and setup
- Security group configuration
- SSL/TLS certificate handling
- Connection string format
- Migration from MongoDB Atlas
- Monitoring and troubleshooting
- Cost optimization strategies

**Key Differences from MongoDB Atlas:**
- Requires VPC and subnet configuration
- Requires SSL/TLS with certificate
- Uses `tlsAllowInvalidHostnames=true`
- Requires `retryWrites=false`
- Managed within AWS infrastructure

### 2. **setup-aws-resources.sh**
Automated script that creates ALL AWS resources with proper tagging:
- ECR Repository
- S3 Buckets (Frontend & Artifacts)
- IAM Roles and Policies
- DocumentDB Cluster and Instances
- Security Groups
- DB Subnet Groups

**All resources are tagged with:**
```
BatchID: 20251027
CreatedBy: aepanda
Application: HotelReservation
Environment: Production
```

---

## 🔧 Modified Files

### 1. **backend/Dockerfile**
**Changes:**
- Added DocumentDB SSL certificate download during build
- Installed `curl` for certificate retrieval
- Added JVM SSL trust store configuration
- Certificate automatically downloaded from AWS on build

**New sections:**
```dockerfile
# Download DocumentDB SSL certificate
RUN mkdir -p /app/certs && \
    curl -o /app/certs/global-bundle.pem \
    https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

# SSL configuration in ENTRYPOINT
"-Djavax.net.ssl.trustStore=/app/certs/global-bundle.pem"
```

### 2. **backend/src/main/resources/application-prod.properties**
**Changes:**
- Added DocumentDB-specific connection settings
- Configured SSL/TLS requirements
- Set `retryWrites=false` (DocumentDB requirement)
- Added connection pool optimization
- Enhanced logging for MongoDB operations

**New properties:**
```properties
spring.data.mongodb.ssl.enabled=true
spring.data.mongodb.retry-writes=false
spring.data.mongodb.min-connections-per-host=10
spring.data.mongodb.max-connections-per-host=50
```

---

## 🏷️ Tagging Strategy

### Standard Tags Applied to All Resources

| Tag Key | Tag Value | Purpose |
|---------|-----------|---------|
| `BatchID` | `20251027` | Identifies resources from this batch deployment |
| `CreatedBy` | `aepanda` | Identifies who created the resources |
| `Application` | `HotelReservation` | Groups resources by application |
| `Environment` | `Production` | Identifies the environment (Production/Staging/Dev) |
| `Name` | (varies) | Human-readable name for the resource |

### Resources Tagged

1. **ECR Repository** - `hotel-reservation-backend`
2. **S3 Buckets**:
   - `hotel-reservation-frontend`
   - `hotel-reservation-artifacts`
3. **IAM Roles**:
   - `hotel-reservation-eb-service-role`
   - `hotel-reservation-ec2-role`
4. **IAM Policies**:
   - `HotelReservationECRS3Policy`
5. **Instance Profile**:
   - `hotel-reservation-ec2-profile`
6. **DocumentDB Resources**:
   - Cluster: `hotel-reservation-docdb`
   - Primary Instance: `hotel-reservation-docdb-instance-1`
   - Replica Instance: `hotel-reservation-docdb-instance-2` (optional)
   - DB Subnet Group: `hotel-reservation-docdb-subnet`
7. **Security Groups**:
   - `hotel-reservation-docdb-sg`

### Benefits of Tagging

1. **Cost Allocation**: Track costs by BatchID or CreatedBy
2. **Resource Management**: Easily identify and manage related resources
3. **Automation**: Enable automated cleanup scripts
4. **Compliance**: Meet organizational tagging requirements
5. **Organization**: Group resources logically

---

## 🔐 DocumentDB vs MongoDB Atlas

### Connection String Comparison

**MongoDB Atlas:**
```
mongodb+srv://user:pass@cluster.mongodb.net/hotel_reservation
```

**Amazon DocumentDB:**
```
mongodb://user:pass@cluster.docdb.amazonaws.com:27017/hotel_reservation?tls=true&tlsAllowInvalidHostnames=true&retryWrites=false
```

### Key Differences

| Feature | MongoDB Atlas | Amazon DocumentDB |
|---------|--------------|-------------------|
| **Location** | Cloud (external) | AWS VPC (internal) |
| **SSL/TLS** | Optional | Required |
| **Certificate** | Not required | Required (`global-bundle.pem`) |
| **Retry Writes** | Supported | Not supported (`retryWrites=false`) |
| **IP Whitelist** | Required (`0.0.0.0/0` for EB) | Security Groups |
| **Connection** | Public internet | Private VPC |
| **Scaling** | Managed automatically | Manual instance sizing |
| **Backup** | Automated | Automated (configurable) |
| **Cost** | Pay-as-you-go | Instance-based pricing |

### Advantages of DocumentDB

1. **Security**: Runs in your private VPC
2. **Performance**: Low latency (same AWS region)
3. **Integration**: Native AWS service integration
4. **Compliance**: Data stays within your AWS account
5. **Management**: AWS managed service

### Considerations

1. **Setup Complexity**: Requires VPC, subnets, security groups
2. **Cost**: Fixed instance costs (~$140/month for 2x t3.medium)
3. **Compatibility**: 95% MongoDB compatible (some features not supported)
4. **Migration**: Requires data migration from Atlas if already using it

---

## 🚀 Quick Start with New Configuration

### Option 1: Automated Setup (Recommended)

```bash
# Run the automated setup script
chmod +x setup-aws-resources.sh
./setup-aws-resources.sh

# This will create all resources with proper tagging
# Wait 10-15 minutes for DocumentDB cluster creation
```

### Option 2: Manual Setup

Follow the step-by-step guide in `DOCUMENTDB_SETUP_GUIDE.md`

### After Setup

1. **Update Dockerrun.aws.json** with your ECR URI
2. **Update deploy.sh** with your configuration
3. **Set environment variables**:
   ```bash
   eb setenv \
     SPRING_DATA_MONGODB_URI="mongodb://user:pass@endpoint:27017/hotel_reservation?tls=true&tlsAllowInvalidHostnames=true&retryWrites=false" \
     SPRING_DATA_MONGODB_DATABASE="hotel_reservation"
   ```
4. **Deploy**:
   ```bash
   ./deploy.sh
   ```

---

## 📊 Cost Estimate with DocumentDB

### Monthly Costs

| Service | Configuration | Estimated Cost |
|---------|--------------|----------------|
| **DocumentDB** | 2x db.t3.medium instances | ~$140/month |
| **DocumentDB Storage** | 100 GB SSD | ~$10/month |
| **DocumentDB Backups** | 7-day retention | ~$10/month |
| **EC2 (EB)** | 2x t3.medium instances | ~$60/month |
| **Application Load Balancer** | Standard | ~$20/month |
| **S3** | Frontend + Artifacts | ~$2/month |
| **CloudFront** | CDN (depends on traffic) | ~$5/month |
| **ECR** | Docker images | ~$1/month |
| **Data Transfer** | Variable | ~$10/month |

**Total: ~$258/month**

### Cost Optimization

1. **Reserved Instances**: Save 30-60% on DocumentDB and EC2
2. **Right-Sizing**: Start with smaller instances, scale as needed
3. **Auto-Scaling**: Scale down during off-hours
4. **Lifecycle Policies**: Automate old backup deletion

---

## 🔍 Verifying Tags

### View Tags on Resources

```bash
# ECR Repository
aws ecr list-tags-for-resource \
  --resource-arn arn:aws:ecr:us-east-1:ACCOUNT_ID:repository/hotel-reservation-backend

# S3 Bucket
aws s3api get-bucket-tagging --bucket hotel-reservation-frontend

# DocumentDB Cluster
aws docdb list-tags-for-resource \
  --resource-name arn:aws:rds:us-east-1:ACCOUNT_ID:cluster:hotel-reservation-docdb

# Security Group
aws ec2 describe-tags --filters "Name=resource-id,Values=sg-xxxxxxxx"
```

### Cost Allocation Report

Enable Cost Allocation Tags in AWS Billing Console:
1. Go to Billing > Cost Allocation Tags
2. Activate tags: `BatchID`, `CreatedBy`, `Application`, `Environment`
3. Wait 24 hours for tags to appear in cost reports

---

## 🛠️ Troubleshooting

### DocumentDB Connection Issues

**Problem**: Application can't connect to DocumentDB

**Solutions**:
1. Verify security group allows traffic from EB instances
2. Check connection string format (must include all parameters)
3. Ensure SSL certificate is in Docker image
4. Verify DocumentDB cluster is in same VPC as EB environment

### SSL Certificate Errors

**Problem**: SSL handshake failures

**Solutions**:
1. Verify `global-bundle.pem` is downloaded in Dockerfile
2. Check JVM SSL trust store configuration
3. Ensure `tlsAllowInvalidHostnames=true` in connection string

### Tags Not Showing

**Problem**: Tags don't appear on resources

**Solutions**:
1. Some tags take time to propagate (up to 24 hours for billing)
2. Verify tag syntax in commands
3. Check IAM permissions for tagging

---

## 📋 Migration Checklist

If migrating from existing MongoDB Atlas setup:

- [ ] Run `setup-aws-resources.sh` to create DocumentDB
- [ ] Export data from MongoDB Atlas using `mongodump`
- [ ] Import data to DocumentDB using `mongorestore`
- [ ] Update application environment variables
- [ ] Update Dockerfile with SSL certificate
- [ ] Deploy updated application
- [ ] Verify connectivity and functionality
- [ ] Update connection pooling settings
- [ ] Monitor performance metrics
- [ ] Disable MongoDB Atlas cluster

---

## 📚 Additional Resources

- **DocumentDB Guide**: `DOCUMENTDB_SETUP_GUIDE.md`
- **Main Deployment Guide**: `AWS_DEPLOYMENT_GUIDE.md`
- **Quick Reference**: `QUICK_DEPLOY_GUIDE.md`
- **Setup Script**: `setup-aws-resources.sh`

---

## ✅ Summary

### What Changed
✅ Switched from MongoDB Atlas to Amazon DocumentDB  
✅ Added comprehensive tagging strategy (BatchID, CreatedBy, etc.)  
✅ Created automated resource setup script  
✅ Updated Dockerfile for DocumentDB SSL support  
✅ Configured application properties for DocumentDB  
✅ Added detailed DocumentDB setup documentation  

### What Stays the Same
✅ Application code (fully compatible)  
✅ Data models and schemas  
✅ API endpoints  
✅ Frontend configuration  
✅ Deployment workflow  

### Benefits
✅ Enhanced security (private VPC)  
✅ Better cost tracking (tags)  
✅ Automated setup process  
✅ AWS-native integration  
✅ Production-ready configuration  

---

**Last Updated**: December 20, 2024  
**Version**: 2.0 (DocumentDB + Tagging)

