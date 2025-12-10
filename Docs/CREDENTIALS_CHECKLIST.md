# 🔑 Credentials Setup Checklist

Use this checklist to gather all required credentials before running the application.

---

## 1. 🔵 Google OAuth2

**Where:** [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

**Steps:**
- [ ] Create new project "Hotel Reservation System"
- [ ] Enable Google+ API
- [ ] Configure OAuth consent screen
- [ ] Create OAuth 2.0 Client ID (Web application)
- [ ] Add redirect URIs:
  - `http://localhost:8080/login/oauth2/code/google`
  - `http://localhost:5173/oauth2/callback`

**Credentials to copy:**
```env
GOOGLE_CLIENT_ID=_____________________
GOOGLE_CLIENT_SECRET=_________________
```

**Example:**
```env
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
```

---

## 2. 🔵 Facebook OAuth2

**Where:** [Facebook Developers](https://developers.facebook.com/apps/)

**Steps:**
- [ ] Create new app (Consumer type)
- [ ] Add Facebook Login product
- [ ] Configure Valid OAuth Redirect URIs:
  - `http://localhost:8080/login/oauth2/code/facebook`
  - `http://localhost:5173/oauth2/callback`
- [ ] Copy App ID and App Secret from Settings → Basic

**Credentials to copy:**
```env
FACEBOOK_CLIENT_ID=___________________
FACEBOOK_CLIENT_SECRET=_______________
```

**Example:**
```env
FACEBOOK_CLIENT_ID=1234567890123456
FACEBOOK_CLIENT_SECRET=abcdef0123456789abcdef0123456789
```

---

## 3. 💳 Stripe

**Where:** [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)

**Steps:**
- [ ] Sign up / Login to Stripe
- [ ] Go to Developers → API keys
- [ ] Copy Secret key (sk_test_...)
- [ ] Copy Publishable key (pk_test_...)
- [ ] Go to Developers → Webhooks
- [ ] Add endpoint: `http://localhost:8080/api/payments/webhook`
- [ ] Select events:
  - [ ] payment_intent.succeeded
  - [ ] payment_intent.payment_failed
  - [ ] payment_intent.canceled
  - [ ] charge.refunded
- [ ] Copy webhook Signing secret (whsec_...)

**Credentials to copy:**
```env
# Backend
STRIPE_API_KEY=___________________________
STRIPE_WEBHOOK_SECRET=____________________

# Frontend
VITE_STRIPE_PUBLIC_KEY=___________________
```

**Example:**
```env
STRIPE_API_KEY=sk_test_51Abc123Def456...
STRIPE_WEBHOOK_SECRET=whsec_abc123def456...
VITE_STRIPE_PUBLIC_KEY=pk_test_51Abc123Def456...
```

**Test Cards:**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

---

## 4. 📧 Gmail (Email Notifications)

**Where:** [Google App Passwords](https://myaccount.google.com/apppasswords)

**Steps:**
- [ ] Enable 2-Step Verification on your Google account
- [ ] Go to App Passwords
- [ ] Select app: Mail
- [ ] Select device: Other → "Hotel Reservation"
- [ ] Click Generate
- [ ] Copy 16-character password

**Credentials to copy:**
```env
EMAIL_USERNAME=_________________________
EMAIL_PASSWORD=_________________________
```

**Example:**
```env
EMAIL_USERNAME=yourname@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # 16 characters with spaces
```

---

## 5. 🔐 JWT Secret

**Generate:**
```bash
openssl rand -base64 64
```

Or use: https://www.grc.com/passwords.htm

**Credential to copy:**
```env
JWT_SECRET=_________________________________
```

**Example:**
```env
JWT_SECRET=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/==
```

---

## 6. 🗄️ MongoDB Password

**Choose a strong password:**

```env
MONGO_PASSWORD=_________________________
```

**Example:**
```env
MONGO_PASSWORD=MySecurePassword123!
```

---

## ✅ Final .env File Template

Copy this to your `.env` file and fill in the values:

```env
# MongoDB Configuration
MONGO_PASSWORD=your-secure-password

# JWT Configuration (generate with: openssl rand -base64 64)
JWT_SECRET=your-generated-secret-key-minimum-256-bits

# Stripe Configuration
STRIPE_API_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Configuration
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

# OAuth2 Configuration
GOOGLE_CLIENT_ID=123456789-xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
FACEBOOK_CLIENT_ID=1234567890
FACEBOOK_CLIENT_SECRET=xxx

# Frontend Configuration
VITE_API_URL=http://localhost:8080/api
VITE_STRIPE_PUBLIC_KEY=pk_test_51...
```

---

## 📝 Notes

### For Development (Local Testing):
- ✅ Use Stripe **test** keys (sk_test_... / pk_test_...)
- ✅ Use `http://localhost` URLs
- ✅ OAuth2 apps can stay in "development" mode

### For Production:
- ⚠️ Use Stripe **live** keys (sk_live_... / pk_live_...)
- ⚠️ Update redirect URIs to your domain
- ⚠️ Switch OAuth2 apps to "production" mode
- ⚠️ Use strong, unique passwords
- ⚠️ Store secrets in AWS Secrets Manager or similar

---

## 🧪 Quick Test Commands

After setup, verify everything works:

```bash
# 1. Check backend starts
cd backend
export $(cat ../.env | xargs)
mvn spring-boot:run

# 2. Check MongoDB connection
mongosh

# 3. Test API endpoint
curl http://localhost:8080/actuator/health

# 4. Check Swagger UI
open http://localhost:8080/swagger-ui.html
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "redirect_uri_mismatch" | Check OAuth redirect URIs match exactly |
| "Invalid webhook signature" | Use `stripe listen` for local testing |
| "Authentication failed" (email) | Use App Password, not regular password |
| "Connection refused" (MongoDB) | Start MongoDB: `brew services start mongodb-community` |
| "Invalid JWT" | Ensure JWT_SECRET is 256+ bits (32+ chars) |

---

## 📞 Support Resources

- **Google OAuth2:** https://console.cloud.google.com/
- **Facebook Login:** https://developers.facebook.com/
- **Stripe:** https://dashboard.stripe.com/
- **Gmail App Passwords:** https://myaccount.google.com/apppasswords
- **Stripe Testing:** https://stripe.com/docs/testing

---

**Last Updated:** November 2024
