# 🚀 Hotel Reservation System - Complete Setup Guide

## Prerequisites

- ✅ Java 17+ installed
- ✅ Node.js 18+ installed
- ✅ MongoDB running (or use Docker)
- ✅ Maven 3.6+ installed
- ✅ Git installed

---

## 📋 Step-by-Step Setup

### Step 1: Clone and Setup Project

```bash
cd /Users/muhiddin/Desktop/SKILLSTORM/20251027-java-EY/PROJECTS/p2/mkhrs

# Copy environment file
cp .env.example .env
cp .env.example frontend/.env
```

### Step 2: Configure OAuth2 Credentials

#### 🔵 Google OAuth2

1. **Go to:** [Google Cloud Console](https://console.cloud.google.com/)
2. **Create Project:** "Hotel Reservation System"
3. **Enable API:** Google+ API
4. **OAuth Consent Screen:**
   - External
   - App name: Hotel Reservation System
   - Scopes: email, profile
5. **Create Credentials → OAuth Client ID:**
   - Type: Web application
   - Authorized origins: `http://localhost:8080`, `http://localhost:5173`
   - Redirect URIs:
     - `http://localhost:8080/login/oauth2/code/google`
     - `http://localhost:5173/oauth2/callback`
6. **Copy** Client ID and Client Secret

#### 🔵 Facebook OAuth2

1. **Go to:** [Facebook Developers](https://developers.facebook.com/)
2. **Create App → Consumer**
3. **Add Facebook Login → Web**
4. **Configure Settings:**
   - Valid OAuth Redirect URIs:
     - `http://localhost:8080/login/oauth2/code/facebook`
     - `http://localhost:5173/oauth2/callback`
5. **Get credentials** from Settings → Basic
   - App ID (Client ID)
   - App Secret (Client Secret)

#### 💳 Stripe

1. **Go to:** [Stripe Dashboard](https://dashboard.stripe.com/)
2. **Sign up/Login**
3. **Get API Keys** (Developers → API keys):
   - Secret key: `sk_test_...`
   - Publishable key: `pk_test_...`
4. **Create Webhook** (Developers → Webhooks):
   - URL: `http://localhost:8080/api/payments/webhook`
   - Events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_intent.canceled`
     - `charge.refunded`
   - Copy webhook signing secret: `whsec_...`

### Step 3: Update .env File

Edit `.env` with your credentials:

```bash
nano .env
```

Replace the placeholder values:

```env
# MongoDB
MONGO_PASSWORD=admin123  # Change this!

# JWT Secret (generate a strong random key)
JWT_SECRET=your-super-secret-jwt-key-at-least-256-bits-long-change-this

# Stripe (from Stripe Dashboard)
STRIPE_API_KEY=sk_test_51ABC...  # Your secret key
STRIPE_WEBHOOK_SECRET=whsec_...  # Your webhook secret

# Email (Gmail example)
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password  # See Gmail App Password setup below

# Google OAuth2 (from Google Cloud Console)
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret

# Facebook OAuth2 (from Facebook Developers)
FACEBOOK_CLIENT_ID=1234567890
FACEBOOK_CLIENT_SECRET=your-facebook-secret

# Frontend
VITE_API_URL=http://localhost:8080/api
VITE_STRIPE_PUBLIC_KEY=pk_test_51ABC...  # Your publishable key
```

### Step 4: Setup Gmail App Password (for email notifications)

1. **Go to:** [Google Account Security](https://myaccount.google.com/security)
2. **Enable 2-Step Verification** (if not already enabled)
3. **Go to:** [App Passwords](https://myaccount.google.com/apppasswords)
4. **Select app:** Mail
5. **Select device:** Other (Custom name) → "Hotel Reservation"
6. **Click Generate**
7. **Copy the 16-character password** → Use as `EMAIL_PASSWORD`

### Step 5: Generate JWT Secret

Generate a secure random key:

```bash
# On Mac/Linux
openssl rand -base64 64

# Or use this online: https://www.grc.com/passwords.htm
```

Copy the output and use it as your `JWT_SECRET`.

### Step 6: Update Frontend .env

Edit `frontend/.env`:

```bash
nano frontend/.env
```

Add:

```env
VITE_API_URL=http://localhost:8080/api
VITE_STRIPE_PUBLIC_KEY=pk_test_51ABC...  # Your Stripe publishable key
VITE_OAUTH2_REDIRECT_URI=http://localhost:5173/oauth2/callback
```

---

## 🐳 Option 1: Run with Docker (Recommended)

### Start Everything with Docker Compose

```bash
# Make sure .env is configured
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

**Access Points:**
- Frontend: http://localhost:80
- Backend: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- MongoDB: localhost:27017

---

## 💻 Option 2: Run Manually (Development)

### Start MongoDB

```bash
# If using Homebrew
brew services start mongodb-community

# Or with Docker
docker run -d -p 27017:27017 --name mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:7.0
```

### Start Backend

```bash
cd backend

# Build
mvn clean install

# Run (make sure .env variables are exported)
export $(cat ../.env | xargs)
mvn spring-boot:run

# Or run the JAR
java -jar target/reservation-system-1.0.0.jar
```

Backend will start at: http://localhost:8080

### Start Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Frontend will start at: http://localhost:5173

---

## 🧪 Test the Setup

### 1. Test Backend

```bash
# Health check
curl http://localhost:8080/actuator/health

# Should return: {"status":"UP"}
```

### 2. Test Swagger UI

Open: http://localhost:8080/swagger-ui.html

You should see all API endpoints documented.

### 3. Test OAuth2 Login

1. Go to frontend: http://localhost:5173
2. Click "Login with Google" or "Login with Facebook"
3. Authorize the app
4. You should be redirected back with a JWT token

### 4. Test Stripe Payment

1. Create a reservation
2. Use Stripe test card: `4242 4242 4242 4242`
3. Use any future date for expiry
4. Use any 3-digit CVC
5. Payment should succeed

**More test cards:** https://stripe.com/docs/testing

### 5. Test Email Notifications

1. Register a new user with your real email
2. Check your inbox for welcome email
3. Create a reservation
4. Check for reservation confirmation email

---

## 🔍 Verify Configuration

### Check if MongoDB is Running

```bash
mongosh
# Or
mongo

# Should connect successfully
```

### Check Backend Logs

```bash
# If using Docker
docker-compose logs backend

# If running manually
# Check console output for any errors
```

### Check Environment Variables are Loaded

```bash
cd backend
mvn spring-boot:run

# Look for log output:
# - "Started HotelReservationApplication"
# - No errors about missing environment variables
```

---

## 🐛 Troubleshooting

### Issue: OAuth2 "redirect_uri_mismatch" error

**Solution:** Make sure redirect URIs in Google/Facebook console EXACTLY match:
```
http://localhost:8080/login/oauth2/code/google
http://localhost:8080/login/oauth2/code/facebook
```

### Issue: Stripe webhook signature verification failed

**Solution:**
1. Use Stripe CLI for local testing:
   ```bash
   stripe listen --forward-to localhost:8080/api/payments/webhook
   ```
2. Use the webhook secret from CLI output in your `.env`

### Issue: Email not sending

**Solution:**
1. Make sure 2-Step Verification is enabled
2. Use App Password, not your regular Gmail password
3. Check `EMAIL_USERNAME` and `EMAIL_PASSWORD` are correct

### Issue: MongoDB connection refused

**Solution:**
```bash
# Start MongoDB
brew services start mongodb-community

# Or with Docker
docker-compose up -d mongodb
```

### Issue: JWT token invalid

**Solution:**
1. Make sure `JWT_SECRET` is at least 256 bits (32+ characters)
2. Same secret must be used in both backend and any token validation

### Issue: CORS errors in browser

**Solution:**
Make sure `APP_CORS_ALLOWED_ORIGINS` in backend includes your frontend URL:
```
http://localhost:5173,http://localhost:3000
```

---

## 📊 Test Data

### Create Admin User (via MongoDB)

```bash
mongosh

use hotel_reservation

db.users.insertOne({
  firstName: "Admin",
  lastName: "User",
  email: "admin@hotel.com",
  password: "$2a$10$...",  // Use BCrypt hash of "admin123"
  roles: ["ADMIN"],
  enabled: true,
  createdAt: new Date()
})
```

Or use the registration endpoint and update role via MongoDB.

### Create Test Rooms

Use Swagger UI or Postman to create rooms via `/api/rooms` endpoint.

Example room:
```json
{
  "name": "Deluxe Suite 101",
  "type": "DELUXE",
  "description": "Luxurious suite with ocean view",
  "pricePerNight": 299.99,
  "capacity": 2,
  "amenities": ["WiFi", "TV", "Mini Bar", "Ocean View"],
  "imageUrl": "https://example.com/room.jpg",
  "available": true,
  "floorNumber": 1,
  "size": 450
}
```

---

## 🎯 Next Steps

1. ✅ **Verify all services are running**
2. ✅ **Test OAuth2 login flows**
3. ✅ **Test Stripe payment with test cards**
4. ✅ **Create test rooms and reservations**
5. ✅ **Build frontend admin dashboard** (optional)
6. ✅ **Deploy to AWS** (see aws-deployment.md)

---

## 📚 Additional Resources

- **Stripe Testing:** https://stripe.com/docs/testing
- **Google OAuth2:** https://developers.google.com/identity/protocols/oauth2
- **Facebook Login:** https://developers.facebook.com/docs/facebook-login
- **Spring Security OAuth2:** https://spring.io/guides/tutorials/spring-boot-oauth2/
- **MongoDB Documentation:** https://docs.mongodb.com/

---

## 🆘 Need Help?

1. Check logs: `docker-compose logs -f`
2. Verify environment variables are set
3. Check Swagger UI for API documentation
4. Review `IMPLEMENTATION_SUMMARY.md` for feature details

---

**Last Updated:** November 2024
**Version:** 1.0.0
