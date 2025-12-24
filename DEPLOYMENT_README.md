# Hotel Reservation AWS Deployment Files

This directory contains all necessary files and documentation for deploying the Hotel Reservation application to AWS Elastic Beanstalk.

## 📁 File Structure

```
.
├── AWS_DEPLOYMENT_GUIDE.md          # Complete deployment guide
├── QUICK_DEPLOY_GUIDE.md            # Quick reference guide
├── deploy.sh                         # Automated deployment script
├── frontend-bucket-policy.json      # S3 bucket policy for frontend
├── backend/
│   ├── Dockerfile                   # Multi-stage Docker build
│   ├── .dockerignore               # Files to exclude from Docker build
│   ├── Dockerrun.aws.json          # Elastic Beanstalk Docker config
│   ├── .ebextensions/
│   │   └── autoscaling.config      # Auto-scaling configuration
│   └── src/main/resources/
│       └── application-prod.properties  # Production Spring config
└── iam-policies/
    ├── eb-service-trust-policy.json     # EB service role trust policy
    ├── ec2-trust-policy.json            # EC2 instance role trust policy
    └── ecr-s3-policy.json               # ECR and S3 access policy
```

## 🚀 Getting Started

### Prerequisites

1. AWS Account with billing enabled
2. AWS CLI v2 installed and configured
3. EB CLI installed
4. Docker installed
5. Node.js 16+ and npm
6. Java 17 and Maven

### Quick Start

1. **Read the guides**:
   - Start with `QUICK_DEPLOY_GUIDE.md` for a quick overview
   - Read `AWS_DEPLOYMENT_GUIDE.md` for detailed instructions

2. **Set up AWS resources**:
   ```bash
   # Create ECR repository
   aws ecr create-repository --repository-name hotel-reservation-backend

   # Create S3 buckets
   aws s3 mb s3://hotel-reservation-frontend
   aws s3 mb s3://hotel-reservation-artifacts
   ```

3. **Configure IAM roles**:
   ```bash
   cd iam-policies
   # Follow instructions in AWS_DEPLOYMENT_GUIDE.md section "IAM Roles and Permissions"
   ```

4. **Update configuration**:
   - Edit `backend/Dockerrun.aws.json` - replace ECR URI
   - Edit `deploy.sh` - update ECR_REPO and bucket names
   - Create `.env.production` files with your secrets

5. **Deploy**:
   ```bash
   ./deploy.sh
   ```

## 📋 Configuration Checklist

Before deploying, ensure you have:

- [ ] AWS CLI configured with credentials
- [ ] ECR repository created
- [ ] ECR URI noted and updated in files
- [ ] S3 buckets created
- [ ] IAM roles and policies created
- [ ] MongoDB connection string ready
- [ ] JWT secret generated
- [ ] Environment variables configured
- [ ] Docker running locally

## 🔧 Key Files Explained

### backend/Dockerfile
Multi-stage Docker build that:
- Uses Maven for dependency management
- Builds optimized production JAR
- Runs as non-root user for security
- Includes health check endpoint

### backend/Dockerrun.aws.json
Tells Elastic Beanstalk:
- Which Docker image to use (ECR URI)
- Port mappings (8080)
- Volume mounts for logs
- Environment variables

### backend/.ebextensions/autoscaling.config
Configures:
- Auto-scaling (2-4 instances)
- CPU-based scaling triggers
- Load balancer settings
- Health check configuration
- CloudWatch log streaming

### deploy.sh
Automated script that:
1. Builds backend JAR
2. Creates Docker image
3. Pushes to ECR
4. Deploys to Elastic Beanstalk
5. Builds frontend
6. Deploys to S3
7. Invalidates CloudFront cache
8. Runs health checks

## 🔐 Security Best Practices

1. **Never commit secrets**:
   ```bash
   # Already in .gitignore
   .env*
   **/application-prod.properties
   ```

2. **Use AWS Secrets Manager** (recommended):
   ```bash
   # Store secrets in AWS Secrets Manager instead of environment variables
   aws secretsmanager create-secret \
     --name hotel-reservation/mongodb-uri \
     --secret-string "your-mongodb-uri"
   ```

3. **Rotate secrets regularly**:
   - JWT_SECRET every 90 days
   - Database passwords every 90 days
   - AWS access keys every 90 days

4. **Enable HTTPS**:
   - Set up CloudFront with ACM certificate
   - Force HTTPS redirect

5. **Restrict security groups**:
   - Only allow ports 80, 443 from internet
   - Database only accessible from app tier

## 📊 Monitoring

### CloudWatch Dashboards

Create dashboard with:
- CPU Utilization
- Memory Usage
- Request Count
- Response Time
- Error Rate (4xx, 5xx)
- Database Connections

### Set Up Alarms

```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name hotel-reservation-high-cpu \
  --alarm-description "Alert when CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

## 🔄 CI/CD Integration

### GitHub Actions (Example)

```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Run deployment script
        run: ./deploy.sh
```

## 💰 Cost Optimization

1. **Use Spot Instances for non-production**:
   ```bash
   eb create --enable-spot
   ```

2. **Schedule scaling**:
   - Scale down during off-hours
   - Scale up during business hours

3. **Enable S3 lifecycle policies**:
   ```bash
   aws s3api put-bucket-lifecycle-configuration \
     --bucket hotel-reservation-artifacts \
     --lifecycle-configuration file://lifecycle-policy.json
   ```

4. **Use Reserved Instances for production**:
   - 1-year or 3-year commitments
   - Up to 75% savings

## 🐛 Troubleshooting

### Common Issues

1. **Docker image pull failed**:
   - Check ECR permissions
   - Verify instance profile has `ecr-s3-policy`
   - Ensure ECR URI is correct in `Dockerrun.aws.json`

2. **Application won't start**:
   ```bash
   eb logs
   eb ssh
   docker logs $(docker ps -q)
   ```

3. **Health check failing**:
   ```bash
   # Test health endpoint
   curl http://YOUR_EB_URL/actuator/health
   
   # Check application logs
   eb logs --stream
   ```

4. **MongoDB connection timeout**:
   - Add `0.0.0.0/0` to MongoDB Atlas IP whitelist
   - Verify connection string format
   - Check security group allows outbound on port 27017

### Useful Debug Commands

```bash
# Check environment status
eb status

# View real-time logs
eb logs --stream

# SSH into instance
eb ssh

# Check Docker container
docker ps
docker logs CONTAINER_ID

# Test health endpoint
curl http://localhost:8080/actuator/health

# Check environment variables
eb printenv
```

## 📚 Additional Resources

- [AWS Elastic Beanstalk Documentation](https://docs.aws.amazon.com/elasticbeanstalk/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Spring Boot Production Best Practices](https://docs.spring.io/spring-boot/docs/current/reference/html/deployment.html)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section in `AWS_DEPLOYMENT_GUIDE.md`
2. Review CloudWatch logs in AWS Console
3. Verify all IAM permissions are correctly set
4. Ensure MongoDB connection is working
5. Check security group rules

## 📝 Maintenance Checklist

### Weekly
- [ ] Review CloudWatch metrics
- [ ] Check error logs
- [ ] Verify backups are running

### Monthly
- [ ] Review and optimize costs
- [ ] Update dependencies
- [ ] Review security alerts
- [ ] Test disaster recovery plan

### Quarterly
- [ ] Rotate secrets and credentials
- [ ] Review and update IAM policies
- [ ] Performance tuning based on metrics
- [ ] Update documentation

---

**Last Updated**: December 2024
**Application Version**: 1.0.0

