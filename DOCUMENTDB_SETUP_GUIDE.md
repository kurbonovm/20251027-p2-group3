# Amazon DocumentDB Setup Guide

## Overview

Amazon DocumentDB (with MongoDB compatibility) is a fully managed document database service that supports MongoDB workloads. This guide covers setup for the Hotel Reservation application.

## 📋 Prerequisites

- AWS CLI configured
- VPC with at least 2 subnets in different Availability Zones
- Existing Elastic Beanstalk environment or follow main deployment guide

## 🏗️ Architecture with DocumentDB

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS VPC                              │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Elastic Beanstalk Environment                   │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  EC2 Instances (Private Subnets)                 │  │ │
│  │  │  - Docker Containers (Spring Boot)               │  │ │
│  │  └───────────────┬──────────────────────────────────┘  │ │
│  └──────────────────┼─────────────────────────────────────┘ │
│                     │                                         │
│  ┌──────────────────▼─────────────────────────────────────┐ │
│  │         DocumentDB Cluster (Private Subnets)           │ │
│  │  ┌──────────────────┬──────────────────────────────┐  │ │
│  │  │  Primary Instance│  Replica Instance            │  │ │
│  │  │  (AZ-1)          │  (AZ-2)                      │  │ │
│  │  └──────────────────┴──────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## 🚀 Step-by-Step Setup

### Step 1: Create DB Subnet Group

```bash
# Create subnet group (requires at least 2 subnets in different AZs)
aws docdb create-db-subnet-group \
  --db-subnet-group-name hotel-reservation-docdb-subnet \
  --db-subnet-group-description "Subnet group for Hotel Reservation DocumentDB" \
  --subnet-ids subnet-xxxxxxxx subnet-yyyyyyyy \
  --tags \
    Key=BatchID,Value=20251027 \
    Key=CreatedBy,Value=aepanda \
    Key=Application,Value=HotelReservation \
    Key=Environment,Value=Production
```

**Finding Subnet IDs:**
```bash
# List available subnets in your VPC
aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=vpc-xxxxxxxx" \
  --query 'Subnets[*].[SubnetId,AvailabilityZone,CidrBlock]' \
  --output table

# Or use default VPC subnets
aws ec2 describe-subnets \
  --filters "Name=default-for-az,Values=true" \
  --query 'Subnets[*].[SubnetId,AvailabilityZone]' \
  --output table
```

### Step 2: Create Security Group for DocumentDB

```bash
# Create security group
DOCDB_SG_ID=$(aws ec2 create-security-group \
  --group-name hotel-reservation-docdb-sg \
  --description "Security group for Hotel Reservation DocumentDB" \
  --vpc-id vpc-xxxxxxxx \
  --query 'GroupId' \
  --output text)

echo "DocumentDB Security Group ID: $DOCDB_SG_ID"

# Tag the security group
aws ec2 create-tags \
  --resources $DOCDB_SG_ID \
  --tags \
    Key=Name,Value=hotel-reservation-docdb-sg \
    Key=BatchID,Value=20251027 \
    Key=CreatedBy,Value=aepanda \
    Key=Application,Value=HotelReservation \
    Key=Environment,Value=Production
```

### Step 3: Get Elastic Beanstalk Security Group

```bash
# Find EB security group
EB_SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=*hotel-reservation-prod*" \
  --query 'SecurityGroups[0].GroupId' \
  --output text)

echo "Elastic Beanstalk Security Group ID: $EB_SG_ID"

# If not found, you can find it in EB console or wait until EB environment is created
```

### Step 4: Configure Security Group Rules

```bash
# Allow inbound traffic from EB security group to DocumentDB (port 27017)
aws ec2 authorize-security-group-ingress \
  --group-id $DOCDB_SG_ID \
  --protocol tcp \
  --port 27017 \
  --source-group $EB_SG_ID \
  --group-owner-id $(aws sts get-caller-identity --query Account --output text)

# Verify the rule
aws ec2 describe-security-groups \
  --group-ids $DOCDB_SG_ID \
  --query 'SecurityGroups[0].IpPermissions'
```

### Step 5: Create DocumentDB Cluster

```bash
# Create DocumentDB cluster with proper tagging
aws docdb create-db-cluster \
  --db-cluster-identifier hotel-reservation-docdb \
  --engine docdb \
  --engine-version 5.0.0 \
  --master-username hoteldbadmin \
  --master-user-password "YourSecurePassword123!" \
  --db-subnet-group-name hotel-reservation-docdb-subnet \
  --vpc-security-group-ids $DOCDB_SG_ID \
  --storage-encrypted \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --tags \
    Key=BatchID,Value=20251027 \
    Key=CreatedBy,Value=aepanda \
    Key=Application,Value=HotelReservation \
    Key=Environment,Value=Production \
    Key=Name,Value=hotel-reservation-docdb

# Wait for cluster to become available (takes 5-10 minutes)
aws docdb wait db-cluster-available \
  --db-cluster-identifier hotel-reservation-docdb
```

### Step 6: Create DocumentDB Instances

```bash
# Create primary instance
aws docdb create-db-instance \
  --db-instance-identifier hotel-reservation-docdb-instance-1 \
  --db-instance-class db.t3.medium \
  --engine docdb \
  --db-cluster-identifier hotel-reservation-docdb \
  --preferred-maintenance-window "mon:05:00-mon:06:00" \
  --tags \
    Key=BatchID,Value=20251027 \
    Key=CreatedBy,Value=aepanda \
    Key=Application,Value=HotelReservation \
    Key=Environment,Value=Production \
    Key=Name,Value=hotel-reservation-docdb-primary

# Create read replica (optional, for high availability)
aws docdb create-db-instance \
  --db-instance-identifier hotel-reservation-docdb-instance-2 \
  --db-instance-class db.t3.medium \
  --engine docdb \
  --db-cluster-identifier hotel-reservation-docdb \
  --preferred-maintenance-window "mon:06:00-mon:07:00" \
  --tags \
    Key=BatchID,Value=20251027 \
    Key=CreatedBy,Value=aepanda \
    Key=Application,Value=HotelReservation \
    Key=Environment,Value=Production \
    Key=Name,Value=hotel-reservation-docdb-replica

# Wait for instances to become available (takes 5-10 minutes)
aws docdb wait db-instance-available \
  --db-instance-identifier hotel-reservation-docdb-instance-1
```

### Step 7: Get Connection String

```bash
# Get cluster endpoint
DOCDB_ENDPOINT=$(aws docdb describe-db-clusters \
  --db-cluster-identifier hotel-reservation-docdb \
  --query 'DBClusters[0].Endpoint' \
  --output text)

echo "DocumentDB Endpoint: $DOCDB_ENDPOINT"

# Get reader endpoint (for read operations)
DOCDB_READER_ENDPOINT=$(aws docdb describe-db-clusters \
  --db-cluster-identifier hotel-reservation-docdb \
  --query 'DBClusters[0].ReaderEndpoint' \
  --output text)

echo "DocumentDB Reader Endpoint: $DOCDB_READER_ENDPOINT"
```

### Step 8: Download SSL Certificate

DocumentDB requires TLS/SSL connections. Download the certificate:

```bash
# Download DocumentDB certificate bundle
wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

# Or using curl
curl -o global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

# Copy to backend resources directory
mkdir -p backend/src/main/resources/certs
cp global-bundle.pem backend/src/main/resources/certs/

# Add to .gitignore if not already there
echo "src/main/resources/certs/*.pem" >> backend/.gitignore
```

### Step 9: Update Dockerfile to Include Certificate

Update `backend/Dockerfile` to include the SSL certificate:

```dockerfile
# Production stage
FROM eclipse-temurin:17-jre-alpine

# Install wget for health check
RUN apk add --no-cache wget

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Set working directory
WORKDIR /app

# Copy JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Copy DocumentDB SSL certificate
COPY src/main/resources/certs/global-bundle.pem /app/certs/global-bundle.pem

# Change ownership to non-root user
RUN chown -R spring:spring /app

# Switch to non-root user
USER spring

# ... rest of Dockerfile
```

### Step 10: Configure Application Properties

Update `backend/src/main/resources/application-prod.properties`:

```properties
# DocumentDB Configuration
spring.data.mongodb.uri=${SPRING_DATA_MONGODB_URI}
spring.data.mongodb.database=${SPRING_DATA_MONGODB_DATABASE:hotel_reservation}

# SSL Configuration for DocumentDB
spring.data.mongodb.ssl.enabled=true

# Connection pool settings
spring.data.mongodb.min-connections-per-host=10
spring.data.mongodb.max-connections-per-host=50
spring.data.mongodb.threads-allowed-to-block-for-connection-multiplier=5
spring.data.mongodb.connect-timeout=10000
spring.data.mongodb.socket-timeout=10000
spring.data.mongodb.max-wait-time=10000
spring.data.mongodb.server-selection-timeout=30000

# Retry settings
spring.data.mongodb.retry-writes=true
spring.data.mongodb.retry-reads=true
```

### Step 11: Create Connection String

```bash
# Format: mongodb://username:password@endpoint:27017/?tls=true&tlsCAFile=global-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false

# For Spring Boot application:
DOCDB_CONNECTION_STRING="mongodb://hoteldbadmin:YourSecurePassword123!@${DOCDB_ENDPOINT}:27017/hotel_reservation?tls=true&tlsAllowInvalidHostnames=true&retryWrites=false"

echo "Connection String: $DOCDB_CONNECTION_STRING"
```

**Important Notes:**
- `tlsAllowInvalidHostnames=true` is required for DocumentDB
- `retryWrites=false` is required (DocumentDB doesn't support retryable writes)
- Use port `27017` (default MongoDB port)

### Step 12: Update Elastic Beanstalk Environment Variables

```bash
# Set environment variables in EB
eb setenv \
  SPRING_DATA_MONGODB_URI="mongodb://hoteldbadmin:YourSecurePassword123!@${DOCDB_ENDPOINT}:27017/hotel_reservation?tls=true&tlsAllowInvalidHostnames=true&retryWrites=false" \
  SPRING_DATA_MONGODB_DATABASE="hotel_reservation"

# Redeploy application
eb deploy
```

## 🔐 Security Best Practices

### 1. Use AWS Secrets Manager (Recommended)

Instead of environment variables, store the connection string in Secrets Manager:

```bash
# Create secret
aws secretsmanager create-secret \
  --name hotel-reservation/docdb-connection \
  --description "DocumentDB connection string for Hotel Reservation" \
  --secret-string "{\"uri\":\"mongodb://hoteldbadmin:YourSecurePassword123!@${DOCDB_ENDPOINT}:27017/hotel_reservation?tls=true&tlsAllowInvalidHostnames=true&retryWrites=false\"}" \
  --tags \
    Key=BatchID,Value=20251027 \
    Key=CreatedBy,Value=aepanda \
    Key=Application,Value=HotelReservation

# Update IAM policy to allow EC2 instances to read the secret
# (Add to ecr-s3-policy.json)
```

### 2. Rotate Passwords Regularly

```bash
# Update master password
aws docdb modify-db-cluster \
  --db-cluster-identifier hotel-reservation-docdb \
  --master-user-password "NewSecurePassword456!" \
  --apply-immediately
```

### 3. Enable Enhanced Monitoring

```bash
# Enable enhanced monitoring on instances
aws docdb modify-db-instance \
  --db-instance-identifier hotel-reservation-docdb-instance-1 \
  --monitoring-interval 60 \
  --monitoring-role-arn arn:aws:iam::ACCOUNT_ID:role/rds-monitoring-role \
  --apply-immediately
```

## 📊 Monitoring and Maintenance

### CloudWatch Metrics

Monitor these key metrics:
- `CPUUtilization`
- `DatabaseConnections`
- `FreeableMemory`
- `WriteIOPS` / `ReadIOPS`
- `NetworkThroughput`

### Set Up CloudWatch Alarms

```bash
# High connection count alarm
aws cloudwatch put-metric-alarm \
  --alarm-name hotel-reservation-docdb-high-connections \
  --alarm-description "Alert when connection count > 80" \
  --metric-name DatabaseConnections \
  --namespace AWS/DocDB \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=DBClusterIdentifier,Value=hotel-reservation-docdb \
  --tags \
    Key=BatchID,Value=20251027 \
    Key=CreatedBy,Value=aepanda
```

### Backup and Restore

```bash
# Create manual snapshot
aws docdb create-db-cluster-snapshot \
  --db-cluster-snapshot-identifier hotel-reservation-manual-backup-$(date +%Y%m%d) \
  --db-cluster-identifier hotel-reservation-docdb \
  --tags \
    Key=BatchID,Value=20251027 \
    Key=CreatedBy,Value=aepanda \
    Key=BackupType,Value=Manual

# Restore from snapshot
aws docdb restore-db-cluster-from-snapshot \
  --db-cluster-identifier hotel-reservation-docdb-restored \
  --snapshot-identifier hotel-reservation-manual-backup-20241220 \
  --engine docdb \
  --tags \
    Key=BatchID,Value=20251027 \
    Key=CreatedBy,Value=aepanda
```

## 🧪 Testing Connection

### From EC2 Instance (EB Environment)

```bash
# SSH into EB instance
eb ssh

# Install mongo shell
sudo yum install -y mongodb-org-shell

# Download SSL certificate
wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

# Connect to DocumentDB
mongo --ssl \
  --host hotel-reservation-docdb.cluster-xxxxxx.us-east-1.docdb.amazonaws.com:27017 \
  --sslCAFile global-bundle.pem \
  --username hoteldbadmin \
  --password

# Test commands
> show dbs
> use hotel_reservation
> db.createCollection("test")
> db.test.insertOne({name: "test"})
> db.test.find()
```

### From Application

Add a test endpoint in your Spring Boot application:

```java
@RestController
@RequestMapping("/api/test")
public class TestController {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @GetMapping("/db-connection")
    public ResponseEntity<Map<String, Object>> testDatabaseConnection() {
        try {
            // Test connection
            mongoTemplate.getDb().getName();
            
            // Get database stats
            Document stats = mongoTemplate.getDb().runCommand(new Document("dbStats", 1));
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "connected");
            response.put("database", mongoTemplate.getDb().getName());
            response.put("collections", stats.get("collections"));
            response.put("dataSize", stats.get("dataSize"));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
```

## 💰 Cost Optimization

### Instance Sizing

Start with smaller instances and scale up as needed:

```bash
# Development/Testing: db.t3.medium (2 vCPU, 4 GB RAM)
# Production: db.r5.large (2 vCPU, 16 GB RAM)
# High-traffic: db.r5.xlarge (4 vCPU, 32 GB RAM)
```

### Reserved Instances

For production, use reserved instances for 30-60% savings:

```bash
# Purchase reserved instance (1-year term)
aws docdb purchase-reserved-db-instances-offering \
  --reserved-db-instances-offering-id xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
  --reserved-db-instance-id hotel-reservation-docdb-reserved \
  --db-instance-count 1 \
  --tags \
    Key=BatchID,Value=20251027 \
    Key=CreatedBy,Value=aepanda
```

### Scheduled Scaling

For non-production environments:
- Scale down instances during off-hours
- Use snapshots for dev/test environments

## 🔄 Migration from MongoDB Atlas

If migrating from MongoDB Atlas:

### 1. Export Data from Atlas

```bash
# Export using mongodump
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/hotel_reservation" \
  --out=./backup
```

### 2. Import to DocumentDB

```bash
# From EC2 instance with network access to DocumentDB
mongorestore --ssl \
  --host hotel-reservation-docdb.cluster-xxxxxx.us-east-1.docdb.amazonaws.com:27017 \
  --sslCAFile global-bundle.pem \
  --username hoteldbadmin \
  --password "YourSecurePassword123!" \
  --db hotel_reservation \
  ./backup/hotel_reservation
```

## 🐛 Troubleshooting

### Connection Timeout

```bash
# Verify security group allows traffic
aws ec2 describe-security-groups --group-ids $DOCDB_SG_ID

# Test connectivity from EB instance
eb ssh
telnet ${DOCDB_ENDPOINT} 27017
```

### SSL/TLS Errors

```bash
# Ensure tlsAllowInvalidHostnames=true in connection string
# Verify certificate file is included in Docker image
```

### Slow Queries

```bash
# Enable profiling
mongo --ssl --host ${DOCDB_ENDPOINT}:27017 \
  --sslCAFile global-bundle.pem \
  --username hoteldbadmin \
  --password

> use hotel_reservation
> db.setProfilingLevel(1, { slowms: 100 })
> db.system.profile.find().sort({ts:-1}).limit(5)
```

## 📚 Additional Resources

- [Amazon DocumentDB Documentation](https://docs.aws.amazon.com/documentdb/)
- [DocumentDB Best Practices](https://docs.aws.amazon.com/documentdb/latest/developerguide/best_practices.html)
- [Spring Data MongoDB with DocumentDB](https://spring.io/projects/spring-data-mongodb)

---

**Estimated Monthly Cost:**
- 2x db.t3.medium instances: ~$140/month
- Storage (100 GB): ~$10/month
- Backups: ~$10/month (7-day retention)
- **Total: ~$160/month**

For production, consider Reserved Instances for 30-60% savings.

