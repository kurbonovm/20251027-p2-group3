# HotelX - Frontend

A modern, responsive React frontend for HotelX, a luxury hotel in Richardson, TX with 100+ premium rooms. Built with Redux, RTK Query, and Material-UI featuring a clean, professional design with dark mode support.

**Hotel Information:**
- **Location**: 123 Luxury Boulevard, Richardson, TX 75080
- **Phone**: (972) 555-0123 / (972) 555-0124
- **Email**: reservations@hotelx.com, info@hotelx.com
- **Capacity**: 100+ premium rooms
- **Guest Rating**: 4.9/5

## 🚀 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **RTK Query** - Data fetching and caching
- **React Router v6** - Routing
- **Material-UI (MUI)** - UI component library
- **Axios** - HTTP client
- **Stripe** - Payment processing

## 📋 Features

### User Management
- ✅ OAuth2 authentication (Google, Okta)
- ✅ Email/password login and registration
- ✅ Role-based access control (Guest, Manager, Admin)
- ✅ User profile management
- ✅ Seamless OAuth2 callback handling
- ✅ Persistent authentication state

### Room Management
- ✅ Browse 100+ available premium rooms
- ✅ Advanced search and filtering
- ✅ Real-time availability checking
- ✅ Room details with amenities (Free WiFi, Free Parking, Swimming Pool, Fine Dining)
- ✅ Multiple room types (Standard, Deluxe, Suite, Presidential)

### Reservation Management
- ✅ Book rooms with date selection
- ✅ View reservation history
- ✅ Modify reservations
- ✅ Cancel reservations
- ✅ Email confirmations

### Payment Processing
- ✅ Stripe integration
- ✅ Secure payment processing
- ✅ Transaction history
- ✅ Refund processing

### Admin Features
- ✅ Room inventory management
- ✅ Reservation management
- ✅ User management
- ✅ Reporting and analytics

## 🛠️ Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable components
│   │   └── ProtectedRoute.jsx
│   ├── features/          # Feature-based modules
│   │   ├── auth/         # Authentication
│   │   │   ├── authSlice.js
│   │   │   └── authApi.js
│   │   ├── rooms/        # Room management
│   │   │   └── roomsApi.js
│   │   ├── reservations/ # Reservation management
│   │   │   └── reservationsApi.js
│   │   ├── payments/     # Payment processing
│   │   │   └── paymentsApi.js
│   │   └── admin/        # Admin features
│   ├── layouts/          # Layout components
│   │   └── MainLayout.jsx
│   ├── pages/            # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── OAuth2Callback.jsx
│   │   ├── Rooms.jsx
│   │   ├── Reservations.jsx
│   │   ├── Unauthorized.jsx
│   │   └── NotFound.jsx
│   ├── services/         # API services
│   │   └── api.js
│   ├── store/            # Redux store
│   │   └── store.js
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types (if needed)
│   ├── constants/        # Constants and enums
│   ├── theme.js          # Material-UI theme
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── public/               # Static assets
├── .env.example         # Environment variables template
├── .env                 # Environment variables (local)
├── .prettierrc          # Prettier configuration
├── eslint.config.js     # ESLint configuration
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running (see backend README)

### Installation

1. Clone the repository and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
# Backend API URL
VITE_API_URL=http://localhost:8080/api

# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key

# OAuth2 Configuration
# The OAuth2 callback is handled by the backend, then redirects to frontend
# Frontend callback route: /oauth2/callback
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 🎨 Code Style

The project uses ESLint and Prettier for code formatting:

```bash
# Run linter
npm run lint

# Format code
npm run format
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔐 Authentication

The application supports multiple authentication methods:

1. **Email/Password**: Traditional authentication with JWT tokens
2. **OAuth2 Social Login**:
   - Google OAuth2 for consumer authentication
   - Okta OIDC for enterprise authentication
3. **Automatic User Provisioning**: New users are created automatically on first OAuth2 login

### OAuth2 Flow
1. User clicks "Continue with Google" or "Continue with Okta" on login page
2. Frontend redirects to backend OAuth2 authorization endpoint
3. User authenticates with OAuth2 provider (Google/Okta)
4. Provider redirects back to backend with authorization code
5. Backend exchanges code for access token and fetches user info
6. Backend creates/updates user in database and generates JWT token
7. Backend redirects to frontend callback (`/oauth2/callback`) with JWT token
8. Frontend stores token and fetches user profile
9. User is redirected to original destination or home page

All authenticated routes are protected using the `ProtectedRoute` component.

## 🎯 Key Components

### Redux Store
- Centralized state management using Redux Toolkit
- RTK Query for efficient data fetching and caching
- Automatic cache invalidation and refetching

### Protected Routes
- Route protection based on authentication status
- Role-based access control (Guest, Manager, Admin)
- Automatic redirects for unauthorized access
- Preservation of intended destination during OAuth2 flow
- Session storage for pending actions (e.g., room booking before login)

### Material-UI Theme
- Custom theme configuration with dark mode support
- Professional, modern design with clean navigation
- Consistent design system across all pages
- Responsive components optimized for all devices
- Gold/blue gradient accents for luxury feel

## 🔗 API Integration

The frontend communicates with the backend API using RTK Query:

- Automatic request/response handling
- Built-in caching and optimization
- Automatic JWT token injection for authenticated requests
- OAuth2 authentication handled via redirect flow
- Centralized error handling and token refresh

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1920px+)
- Tablet (768px - 1919px)
- Mobile (320px - 767px)

## 🚢 Deployment

### AWS S3 + CloudFront Deployment

The frontend is deployed as a static website on AWS S3 with CloudFront CDN for global content delivery.

#### Prerequisites
- AWS Account with S3 and CloudFront access
- AWS CLI configured
- GitHub repository with Actions enabled

#### Deployment Architecture
1. **AWS S3**: Hosts static React build files
2. **AWS CloudFront**: CDN for fast global content delivery
3. **AWS Certificate Manager**: SSL/TLS certificates for HTTPS
4. **Route 53** (optional): DNS management
5. **GitHub Actions**: Automated deployment pipeline

#### Manual Deployment Steps

##### 1. Build the application
```bash
npm run build
```

##### 2. Create S3 Bucket
```bash
aws s3 mb s3://hotelx-frontend --region us-east-1

# Enable static website hosting
aws s3 website s3://hotelx-frontend --index-document index.html --error-document index.html

# Upload build files
aws s3 sync dist/ s3://hotelx-frontend --delete
```

##### 3. Configure S3 Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::hotelx-frontend/*"
    }
  ]
}
```

##### 4. Create CloudFront Distribution
```bash
aws cloudfront create-distribution \
  --origin-domain-name hotelx-frontend.s3.amazonaws.com \
  --default-root-object index.html
```

##### 5. Update Environment Variables
Create `.env.production`:
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_STRIPE_PUBLIC_KEY=pk_live_your_production_stripe_key
```

### CI/CD Pipeline (GitHub Actions)

#### GitHub Secrets Configuration

Store the following secrets in your GitHub repository (Settings → Secrets and variables → Actions):

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
S3_BUCKET
CLOUDFRONT_DISTRIBUTION_ID
VITE_API_URL
VITE_STRIPE_PUBLIC_KEY
```

#### GitHub Actions Workflow

Create `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy Frontend to AWS S3

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Build application
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_STRIPE_PUBLIC_KEY: ${{ secrets.VITE_STRIPE_PUBLIC_KEY }}
        run: |
          cd frontend
          npm run build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Deploy to S3
        run: |
          cd frontend
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete

      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

### OAuth2 Configuration for Production

Ensure that your OAuth2 providers are configured with production redirect URIs:

#### Google OAuth2
- Authorized redirect URI: `https://api.yourdomain.com/login/oauth2/code/google`

#### Okta OIDC
- Sign-in redirect URI: `https://api.yourdomain.com/login/oauth2/code/okta`

The backend will redirect to your frontend domain (`https://yourdomain.com/oauth2/callback`) after successful authentication.

### CloudFront Configuration Notes

- **Custom Error Responses**: Configure 404 errors to redirect to `index.html` for client-side routing
- **Compress Objects**: Enable automatic compression for faster delivery
- **HTTPS Only**: Redirect HTTP to HTTPS
- **Cache Behavior**: Set appropriate cache policies for static assets vs HTML files

## 📝 License

This project is part of HotelX.

## 👥 Contributors

- **Liam Heaney**
- **Arnold B. Epanda**
- **Muhiddin Kurbonov**

## Contributing

1. Follow the code style guidelines
2. Write JSDoc comments for all functions
3. Add proper error handling
4. Test your changes before committing
