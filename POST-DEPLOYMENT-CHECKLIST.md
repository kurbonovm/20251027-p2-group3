# HotelX Post-Deployment Checklist

This checklist ensures your AWS deployment is fully configured and working correctly.

## ✅ After Running `setup-aws.sh`

### 1. Update AWS Secrets Manager (REQUIRED)

Replace placeholder values with real credentials:

```bash
# Stripe
aws secretsmanager update-secret --secret-id hotelx/stripe-api-key \
  --secret-string "sk_live_YOUR_REAL_KEY" --region us-east-1

aws secretsmanager update-secret --secret-id hotelx/stripe-webhook-secret \
  --secret-string "whsec_YOUR_WEBHOOK_SECRET" --region us-east-1

# Google OAuth
aws secretsmanager update-secret --secret-id hotelx/google-client-id \
  --secret-string "YOUR_GOOGLE_CLIENT_ID" --region us-east-1

aws secretsmanager update-secret --secret-id hotelx/google-client-secret \
  --secret-string "YOUR_GOOGLE_CLIENT_SECRET" --region us-east-1

# Okta OAuth
aws secretsmanager update-secret --secret-id hotelx/okta-client-id \
  --secret-string "YOUR_OKTA_CLIENT_ID" --region us-east-1

aws secretsmanager update-secret --secret-id hotelx/okta-client-secret \
  --secret-string "YOUR_OKTA_CLIENT_SECRET" --region us-east-1

aws secretsmanager update-secret --secret-id hotelx/okta-issuer-uri \
  --secret-string "https://dev-YOUR_DOMAIN.okta.com/oauth2/default" --region us-east-1
```

### 2. Get CloudFront URLs

```bash
# Frontend CloudFront URL
FRONTEND_URL=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='CloudFront distribution for hotelx frontend'].DomainName" \
  --output text --region us-east-1)
echo "Frontend: https://$FRONTEND_URL"

# Backend CloudFront URL
BACKEND_URL=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='CloudFront distribution for hotelx backend API'].DomainName" \
  --output text --region us-east-1)
echo "Backend: https://$BACKEND_URL"
```

### 3. Configure GitHub Secrets (REQUIRED)

Add these to your GitHub repository (Settings → Secrets and variables → Actions):

```bash
gh secret set AWS_ACCESS_KEY_ID
gh secret set AWS_SECRET_ACCESS_KEY
gh secret set AWS_ACCOUNT_ID  # From infrastructure-config.txt
gh secret set BACKEND_API_URL  # https://<BACKEND_CF_DOMAIN>/api
gh secret set CLOUDFRONT_DISTRIBUTION_ID  # From infrastructure-config.txt
gh secret set STRIPE_PUBLIC_KEY  # Your Stripe publishable key
```

Or manually set them in GitHub:
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- `AWS_ACCOUNT_ID` - Found in `infrastructure-config.txt`
- `BACKEND_API_URL` - `https://<BACKEND_CF_DOMAIN>/api`
- `CLOUDFRONT_DISTRIBUTION_ID` - Frontend CloudFront distribution ID from `infrastructure-config.txt`
- `STRIPE_PUBLIC_KEY` - Your Stripe publishable key

### 4. Update OAuth Redirect URLs

#### Google OAuth Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   ```
   https://<FRONTEND_CF_DOMAIN>
   ```
5. Add to **Authorized redirect URIs**:
   ```
   https://<BACKEND_CF_DOMAIN>/login/oauth2/code/google
   https://<BACKEND_CF_DOMAIN>/oauth2/callback/google
   ```

#### Okta Configuration
1. Go to [Okta Admin Console](https://dev-xxxxxxxx.okta.com/admin)
2. Navigate to: **Applications** → Your Application → **General** tab
3. Add to **Sign-in redirect URIs**:
   ```
   https://<BACKEND_CF_DOMAIN>/login/oauth2/code/okta
   https://<BACKEND_CF_DOMAIN>/oauth2/callback/okta
   ```
4. Add to **Sign-out redirect URIs**:
   ```
   https://<FRONTEND_CF_DOMAIN>
   ```
5. Under **Trusted Origins**, add:
   - Origin Name: `Production Frontend`
   - Origin URL: `https://<FRONTEND_CF_DOMAIN>`
   - Type: Check both **CORS** and **Redirect**

**⚠️ Keep your localhost URLs for local development!**

### 5. Deploy the Application

Option A - Automatic (Recommended):
```bash
git push origin main
```

Option B - Manual trigger:
```bash
gh workflow run deploy-backend.yml
gh workflow run deploy-frontend.yml
```

### 6. Monitor Deployment

```bash
# Watch workflows
gh run watch

# Check backend service
aws ecs describe-services --cluster hotelx-prod-cluster \
  --services hotelx-backend-service --region us-east-1 \
  --query 'services[0].[runningCount,desiredCount]'

# Check backend logs
aws logs tail /ecs/hotelx-backend --follow --region us-east-1

# Test backend health
curl https://<BACKEND_CF_DOMAIN>/actuator/health
```

### 7. Verify Everything Works

- [ ] Frontend loads at `https://<FRONTEND_CF_DOMAIN>`
- [ ] Backend health check returns `{"status":"UP"}`
- [ ] Rooms page loads data
- [ ] Login works (test both Google and Okta)
- [ ] Can make a reservation
- [ ] Admin panel accessible (if admin user)

## 🔍 Troubleshooting

### Backend tasks not starting

Check security groups:
```bash
# Verify DocumentDB SG allows ECS traffic
aws ec2 describe-security-groups --filters "Name=group-name,Values=hotelx-prod-docdb-sg" \
  --query 'SecurityGroups[0].IpPermissions' --region us-east-1
```

### CORS errors

Check allowed origins:
```bash
aws secretsmanager get-secret-value --secret-id hotelx/allowed-origins --region us-east-1
```

Should include your frontend CloudFront URL.

### 504 Gateway Timeout

1. Check if tasks are running:
   ```bash
   aws ecs list-tasks --cluster hotelx-prod-cluster --region us-east-1
   ```

2. Check ALB target health:
   ```bash
   aws elbv2 describe-target-health --target-group-arn <TG_ARN> --region us-east-1
   ```

3. Check backend logs for errors:
   ```bash
   aws logs tail /ecs/hotelx-backend --since 10m --region us-east-1
   ```

## 📊 Infrastructure Overview

After successful deployment, you'll have:

- **Frontend**: Hosted on S3, served via CloudFront
- **Backend**: Running on ECS Fargate, served via CloudFront → ALB
- **Database**: DocumentDB cluster in private subnets
- **Networking**: VPC with public/private subnets, NAT gateways
- **Security**: Security groups controlling all traffic
- **Secrets**: All credentials in AWS Secrets Manager
- **CI/CD**: GitHub Actions for automatic deployments

## 💰 Cost Estimate

~$322/month:
- DocumentDB: ~$200/month
- NAT Gateways: ~$65/month
- ECS Fargate: ~$30/month
- Other services: ~$27/month

## 🔄 Future Deployments

After initial setup, deployments are automatic:

1. Make code changes
2. Commit and push to `main` branch
3. GitHub Actions automatically:
   - Builds Docker images
   - Pushes to ECR
   - Updates ECS service
   - Builds frontend
   - Uploads to S3
   - Invalidates CloudFront cache

No manual steps required! 🎉
