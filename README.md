# HotelX

A modern, full-stack hotel reservation platform for a luxury hotel in Richardson, TX with over 100 premium rooms. Built with Spring Boot, MongoDB, React, Redux, and Stripe for secure payment processing.

## Project Overview

HotelX is a comprehensive hotel management system located at 123 Luxury Boulevard, Richardson, TX 75080. The platform simplifies the booking process for guests and provides hotel administrators with robust tools for managing room availability, reservations, and amenities. The solution is designed for deployment to AWS.

**Contact Information:**
- **Location**: 123 Luxury Boulevard, Richardson, TX 75080
- **Phone**: (972) 555-0123 / (972) 555-0124
- **Email**: reservations@hotelx.com, info@hotelx.com
- **Capacity**: 100+ premium rooms
- **Rating**: 4.9/5 guest satisfaction

## Tech Stack

### Backend
- **Java 17** with **Spring Boot 3.2.0**
- **MongoDB** - NoSQL database
- **Spring Security** - Authentication & Authorization
- **OAuth2** - Social login (Google, Okta)
- **JWT** - Token-based authentication
- **Stripe** - Payment processing
- **Maven** - Build tool

### Frontend
- **React 18** with **Vite**
- **Redux Toolkit** with **RTK Query**
- **React Router v6**
- **Material-UI (MUI)**
- **Axios**
- **Stripe.js**

### Deployment
- **Backend**: AWS ECS (Fargate) with ECR for container registry
- **Database**: AWS DocumentDB (MongoDB-compatible)
- **Frontend**: AWS S3 + CloudFront
- **CI/CD**: GitHub Actions with secrets stored in GitHub Secrets

## Features

### User Management
- Email/password registration and login
- OAuth2 social login (Google, Okta)
- Role-based access control (GUEST, MANAGER, ADMIN)
- User profile management
- Automatic user provisioning via OAuth2 providers

### Room Management
- CRUD operations for 100+ premium rooms
- Real-time availability checking
- Advanced search and filtering
- Capacity and amenity management
- Room types: Standard, Deluxe, Suite, Presidential
- Amenities: Free WiFi, Free Parking, Swimming Pool, Fine Dining

### Reservation Management
- Create, update, and cancel reservations
- **Overbooking prevention** with synchronized transactions
- Date validation and availability checks
- Automated email confirmations

### Payment Processing
- Secure Stripe integration
- Payment intent creation and confirmation
- Refund processing
- Transaction history

### Security
- JWT authentication with 24-hour token expiration
- BCrypt password hashing (10 rounds)
- OAuth2 integration with Google and Okta
- CORS configuration with origin whitelisting
- Method-level authorization with role-based access control
- Input validation and sanitization

## Project Structure

```
mkhrs/
├── backend/                 # Spring Boot API
│   ├── src/main/java/
│   │   └── com/hotel/reservation/
│   │       ├── config/
│   │       ├── controller/
│   │       ├── dto/
│   │       ├── exception/
│   │       ├── model/
│   │       ├── repository/
│   │       ├── security/
│   │       └── service/
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── pom.xml
│   └── README.md
│
├── frontend/                # React application
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── theme.js
│   ├── package.json
│   └── README.md
│
├── Docs/
│   └── Requirements.md
└── README.md
```

## Getting Started

### Prerequisites

- **Java 17+**
- **Node.js 18+**
- **MongoDB 4.4+**
- **Maven 3.6+**
- **Stripe Account** (for payments)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Configure `application.yml`:
```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/hotel_reservation

jwt:
  secret: your-256-bit-secret-key

stripe:
  api:
    key: your-stripe-api-key
```

3. Set environment variables:
```bash
# Database Configuration
export DATABASE_URI=mongodb://localhost:27017
export DATABASE_NAME=hotel_reservation

# JWT Configuration
export JWT_SECRET=your-256-bit-secret-key
export JWT_EXPIRATION=86400000

# OAuth2 - Google
export GOOGLE_CLIENT_ID=your-google-client-id
export GOOGLE_CLIENT_SECRET=your-google-client-secret

# OAuth2 - Okta
export OKTA_CLIENT_ID=your-okta-client-id
export OKTA_CLIENT_SECRET=your-okta-client-secret
export OKTA_ISSUER_URI=https://your-domain.okta.com/oauth2/default

# Stripe Configuration
export STRIPE_API_KEY=your-stripe-api-key
export STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Application URLs
export BACKEND_URL=http://localhost:8080
export FRONTEND_URL=http://localhost:5173
export CORS_ALLOWED_ORIGINS=http://localhost:5173
```

4. Start MongoDB:
```bash
# macOS
brew services start mongodb-community

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

5. Build and run:
```bash
mvn clean install
mvn spring-boot:run
```

Backend will be available at `http://localhost:8080`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment (`.env`):
```env
VITE_API_URL=http://localhost:8080/api
VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
```

4. Start development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login with email/password
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /oauth2/authorization/google` - Initiate Google OAuth2 login
- `GET /oauth2/authorization/okta` - Initiate Okta OAuth2 login
- `GET /login/oauth2/code/{provider}` - OAuth2 callback endpoint

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/{id}` - Get room by ID
- `GET /api/rooms/available` - Get available rooms
- `POST /api/rooms` - Create room (Manager/Admin)
- `PUT /api/rooms/{id}` - Update room (Manager/Admin)
- `DELETE /api/rooms/{id}` - Delete room (Manager/Admin)

### Reservations
- `GET /api/reservations` - Get all (Admin/Manager)
- `GET /api/reservations/my-reservations` - Get user's reservations
- `POST /api/reservations` - Create reservation
- `PUT /api/reservations/{id}` - Update reservation
- `POST /api/reservations/{id}/cancel` - Cancel reservation

### Payments
- `POST /api/payments/create-intent` - Create payment
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Payment history
- `POST /api/payments/{id}/refund` - Process refund

## Key Implementation Details

### Overbooking Prevention
The system prevents double-booking using:
- `synchronized` methods in ReservationService
- MongoDB queries for overlapping reservations
- Atomic database operations

### Security
- **JWT Authentication**: 24-hour token expiration with secure token generation
- **Password Security**: BCrypt hashing with 10 rounds
- **OAuth2 Integration**:
  - Google OAuth2 for social login
  - Okta OIDC for enterprise authentication
  - Custom user service for automatic user provisioning
  - Secure token exchange and validation
- **Role-Based Access Control**: Three-tier permission system (GUEST, MANAGER, ADMIN)
- **Session Management**: Stateless authentication with JWT tokens

### Payment Security
- Stripe handles sensitive card data
- Server-side payment confirmation
- Webhook verification for events

## Testing

### Backend
```bash
cd backend
mvn test
```

### Frontend
```bash
cd frontend
npm test
```

## Building for Production

### Backend
```bash
cd backend
mvn clean package
java -jar target/reservation-system-1.0.0.jar
```

### Frontend
```bash
cd frontend
npm run build
# dist/ folder ready for deployment
```

## Deployment

### AWS Architecture

The application is deployed on AWS using a containerized microservices architecture:

#### Backend Deployment (ECS Fargate)
1. **Docker Containerization**: Spring Boot application containerized with Dockerfile
2. **AWS ECR**: Docker images stored in Elastic Container Registry
3. **AWS ECS**: Container orchestration with Fargate (serverless)
4. **Load Balancer**: Application Load Balancer for traffic distribution
5. **Auto-scaling**: Fargate tasks scale based on CPU/memory metrics

#### Frontend Deployment (S3 + CloudFront)
1. **AWS S3**: Static React build hosted in S3 bucket
2. **AWS CloudFront**: CDN for global content delivery
3. **HTTPS**: SSL/TLS certificates via AWS Certificate Manager

#### Database
- **AWS DocumentDB**: MongoDB-compatible managed database service
- **VPC**: Secured within private subnet
- **Backup**: Automated daily snapshots

#### CI/CD Pipeline (GitHub Actions)
1. **Automated Testing**: Run tests on every push/PR
2. **Docker Build**: Build and tag Docker images
3. **ECR Push**: Push images to AWS ECR
4. **ECS Deployment**: Update ECS service with new task definition
5. **S3 Sync**: Deploy frontend build to S3
6. **CloudFront Invalidation**: Clear CDN cache
7. **Secrets Management**: All credentials stored in GitHub Secrets

See individual README files in `backend/` and `frontend/` for detailed deployment instructions.

## Documentation

- All Java classes include comprehensive JavaDoc
- All React components include JSDoc comments
- API documentation available via Swagger (if enabled)

## License

This project is developed as part of the HotelX requirements.

## Contributors

- **Liam Heaney**
- **Arnold B. Epanda**
- **Muhiddin Kurbonov**

## Support

For issues and questions, please refer to the project documentation or contact the development team.
