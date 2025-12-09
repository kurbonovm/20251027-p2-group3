#!/bin/bash

# Hotel Reservation System - Quick Setup Script
# This script helps you set up the project quickly

set -e

echo "🏨 Hotel Reservation System - Quick Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env and add your credentials!${NC}"
    echo ""
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Check if frontend/.env exists
if [ ! -f frontend/.env ]; then
    echo -e "${YELLOW}Creating frontend/.env file...${NC}"
    cp .env frontend/.env
    echo -e "${GREEN}✓ frontend/.env file created${NC}"
    echo ""
else
    echo -e "${GREEN}✓ frontend/.env file already exists${NC}"
fi

echo ""
echo "📋 Setup Checklist:"
echo "==================="
echo ""

# Function to check if a service is configured
check_env_var() {
    local var_name=$1
    local var_value=$(grep "^${var_name}=" .env | cut -d '=' -f2)

    if [[ -z "$var_value" ]] || [[ "$var_value" == *"your-"* ]] || [[ "$var_value" == *"change"* ]]; then
        echo -e "${RED}✗ ${var_name} - NOT CONFIGURED${NC}"
        return 1
    else
        echo -e "${GREEN}✓ ${var_name} - Configured${NC}"
        return 0
    fi
}

# Check all required variables
echo "Checking OAuth2 Configuration:"
check_env_var "GOOGLE_CLIENT_ID" || MISSING_OAUTH=1
check_env_var "GOOGLE_CLIENT_SECRET" || MISSING_OAUTH=1
check_env_var "FACEBOOK_CLIENT_ID" || MISSING_OAUTH=1
check_env_var "FACEBOOK_CLIENT_SECRET" || MISSING_OAUTH=1

echo ""
echo "Checking Stripe Configuration:"
check_env_var "STRIPE_API_KEY" || MISSING_STRIPE=1
check_env_var "STRIPE_WEBHOOK_SECRET" || MISSING_STRIPE=1

echo ""
echo "Checking Email Configuration:"
check_env_var "EMAIL_USERNAME" || MISSING_EMAIL=1
check_env_var "EMAIL_PASSWORD" || MISSING_EMAIL=1

echo ""
echo "Checking JWT Configuration:"
check_env_var "JWT_SECRET" || MISSING_JWT=1

echo ""
echo "=========================================="
echo ""

if [ ! -z "$MISSING_OAUTH" ]; then
    echo -e "${YELLOW}⚠️  OAuth2 Setup Required${NC}"
    echo "   Google: https://console.cloud.google.com/"
    echo "   Facebook: https://developers.facebook.com/"
    echo ""
fi

if [ ! -z "$MISSING_STRIPE" ]; then
    echo -e "${YELLOW}⚠️  Stripe Setup Required${NC}"
    echo "   Get keys: https://dashboard.stripe.com/test/apikeys"
    echo "   Setup webhook: https://dashboard.stripe.com/test/webhooks"
    echo ""
fi

if [ ! -z "$MISSING_EMAIL" ]; then
    echo -e "${YELLOW}⚠️  Email Setup Required${NC}"
    echo "   Generate App Password: https://myaccount.google.com/apppasswords"
    echo ""
fi

if [ ! -z "$MISSING_JWT" ]; then
    echo -e "${YELLOW}⚠️  JWT Secret Required${NC}"
    echo "   Generate: openssl rand -base64 64"
    echo ""
fi

echo ""
echo "📖 Next Steps:"
echo "=============="
echo ""
echo "1. Edit .env file with your credentials:"
echo "   nano .env"
echo ""
echo "2. Read the detailed setup guide:"
echo "   cat SETUP_GUIDE.md"
echo ""
echo "3. Choose how to run:"
echo ""
echo "   Option A - Docker (Recommended):"
echo "   docker-compose up -d"
echo ""
echo "   Option B - Manual:"
echo "   Terminal 1: brew services start mongodb-community"
echo "   Terminal 2: cd backend && mvn spring-boot:run"
echo "   Terminal 3: cd frontend && npm install && npm run dev"
echo ""
echo "4. Access the application:"
echo "   Frontend: http://localhost:5173 (manual) or http://localhost:80 (docker)"
echo "   Backend: http://localhost:8080"
echo "   Swagger: http://localhost:8080/swagger-ui.html"
echo ""
echo "=========================================="
echo ""

# Ask if user wants to open .env file
read -p "Would you like to edit .env file now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ${EDITOR:-nano} .env
fi

echo ""
echo -e "${GREEN}Setup complete! Follow the steps above to continue.${NC}"
echo ""
