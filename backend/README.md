# HotelX - Backend

Spring Boot REST API for HotelX, a luxury hotel in Richardson, TX with 100+ premium rooms. Built with MongoDB, Spring Security, OAuth2, and Stripe integration.

**Hotel Information:**
- **Location**: 123 Luxury Boulevard, Richardson, TX 75080
- **Phone**: (972) 555-0123 / (972) 555-0124
- **Email**: reservations@hotelx.com, info@hotelx.com
- **Capacity**: 100+ premium rooms

## Tech Stack

- **Java 17** - Programming language
- **Spring Boot 3.2.0** - Framework
- **Spring Data MongoDB** - Database integration
- **Spring Security** - Authentication and authorization
- **OAuth2 / OIDC** - Social login (Google) and enterprise authentication (Okta)
- **JWT** - Token-based authentication
- **Stripe** - Payment processing
- **Lombok** - Code generation
- **Maven** - Build tool

## Features

### Authentication & Authorization
- Email/password registration and login
- OAuth2 social login (Google)
- OIDC enterprise authentication (Okta)
- JWT token-based authentication with 24-hour expiration
- Role-based access control (GUEST, MANAGER, ADMIN)
- Password encryption with BCrypt (10 rounds)
- Automatic user provisioning via OAuth2/OIDC providers
- Custom OAuth2 user services for Google and Okta
- Stateless session management

### Room Management
- CRUD operations for rooms
- Room filtering by type, price, amenities
- Real-time availability checking
- Capacity validation

### Reservation Management
- Create, update, and cancel reservations
- Overbooking prevention with synchronized transactions
- Date range validation
- Automatic total calculation
- Email confirmations

### Payment Processing
- Stripe payment intent creation
- Payment confirmation
- Refund processing
- Transaction history
- Webhook support

### Security Features
- JWT authentication filter
- CORS configuration
- Method-level security with annotations
- Request validation

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/hotel/reservation/
│   │   │   ├── config/              # Configuration classes
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── controller/          # REST controllers
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── RoomController.java
│   │   │   │   ├── ReservationController.java
│   │   │   │   └── PaymentController.java
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── RegisterRequest.java
│   │   │   │   ├── AuthResponse.java
│   │   │   │   └── UserDto.java
│   │   │   ├── exception/           # Exception handling
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   ├── model/               # Domain models
│   │   │   │   ├── User.java
│   │   │   │   ├── Room.java
│   │   │   │   ├── Reservation.java
│   │   │   │   └── Payment.java
│   │   │   ├── repository/          # MongoDB repositories
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── RoomRepository.java
│   │   │   │   ├── ReservationRepository.java
│   │   │   │   └── PaymentRepository.java
│   │   │   ├── security/            # Security components
│   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   ├── UserPrincipal.java
│   │   │   │   ├── CustomUserDetailsService.java
│   │   │   │   └── oauth2/         # OAuth2 integration
│   │   │   │       ├── CustomOAuth2UserService.java
│   │   │   │       ├── CustomOidcUserService.java
│   │   │   │       ├── OAuth2AuthenticationSuccessHandler.java
│   │   │   │       └── OAuth2AuthenticationFailureHandler.java
│   │   │   ├── service/             # Business logic
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── RoomService.java
│   │   │   │   ├── ReservationService.java
│   │   │   │   └── PaymentService.java
│   │   │   └── HotelReservationApplication.java
│   │   └── resources/
│   │       └── application.yml      # Application configuration
│   └── test/                        # Test files
├── pom.xml                          # Maven dependencies
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- MongoDB 4.4+ (or AWS DocumentDB)
- Stripe account for payment processing

### Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Configure application settings in `application.yml`:
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

3. Set environment variables (or update application.yml):
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

# OAuth2 - Okta (OIDC)
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

4. Build the project:
```bash
mvn clean install
```

5. Run the application:
```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login with email/password
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /oauth2/authorization/google` - Initiate Google OAuth2 login
- `GET /oauth2/authorization/okta` - Initiate Okta OIDC login
- `GET /login/oauth2/code/google` - Google OAuth2 callback
- `GET /login/oauth2/code/okta` - Okta OIDC callback

### Rooms
- `GET /api/rooms` - Get all rooms (with filters)
- `GET /api/rooms/{id}` - Get room by ID
- `GET /api/rooms/available` - Get available rooms for dates
- `POST /api/rooms` - Create room (Manager/Admin)
- `PUT /api/rooms/{id}` - Update room (Manager/Admin)
- `DELETE /api/rooms/{id}` - Delete room (Manager/Admin)

### Reservations
- `GET /api/reservations` - Get all reservations (Admin/Manager)
- `GET /api/reservations/my-reservations` - Get user's reservations
- `GET /api/reservations/{id}` - Get reservation by ID
- `POST /api/reservations` - Create reservation
- `PUT /api/reservations/{id}` - Update reservation
- `POST /api/reservations/{id}/cancel` - Cancel reservation
- `GET /api/reservations/date-range` - Get reservations by date (Admin/Manager)

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history
- `GET /api/payments/{id}` - Get payment by ID
- `POST /api/payments/{id}/refund` - Process refund (Admin/Manager)
- `POST /api/payments/webhook` - Stripe webhook

## Security

### JWT Authentication
- All requests (except auth and public endpoints) require JWT token
- Token must be sent in Authorization header: `Bearer <token>`
- Tokens expire after 24 hours (configurable via `JWT_EXPIRATION`)
- Stateless authentication with no server-side session storage

### OAuth2 / OIDC Integration
- **Google OAuth2**: Social login for consumers
- **Okta OIDC**: Enterprise authentication for organizations
- **Automatic User Provisioning**: New users are automatically created on first login
- **Custom User Services**:
  - `CustomOAuth2UserService`: Handles standard OAuth2 providers (Google)
  - `CustomOidcUserService`: Handles OIDC providers (Okta)
- **Success/Failure Handlers**: Custom handlers for OAuth2 authentication flow
- **Provider-Specific Attribute Mapping**: Handles different attribute names across providers
- **Secure Token Exchange**: OAuth2 tokens are exchanged for JWT tokens

### Role-Based Access Control
- **GUEST**: Can view rooms, make reservations, manage own bookings
- **MANAGER**: All guest permissions + room management
- **ADMIN**: All permissions + user management and reporting
- Default role for OAuth2 users: GUEST (upgradeable by admin)

## Database Schema

### User Collection
```json
{
  "_id": "ObjectId",
  "firstName": "String",
  "lastName": "String",
  "email": "String (unique)",
  "password": "String (hashed, optional for OAuth2 users)",
  "phoneNumber": "String",
  "roles": ["GUEST", "MANAGER", "ADMIN"],
  "provider": "String (google/okta/null for local auth)",
  "providerId": "String (unique ID from OAuth2 provider)",
  "avatar": "String (profile picture URL)",
  "enabled": "Boolean",
  "createdAt": "DateTime",
  "updatedAt": "DateTime"
}
```

### Room Collection
```json
{
  "_id": "ObjectId",
  "name": "String",
  "type": "Enum (STANDARD/DELUXE/SUITE/PRESIDENTIAL)",
  "description": "String",
  "pricePerNight": "Decimal",
  "capacity": "Integer",
  "amenities": ["String"],
  "imageUrl": "String",
  "additionalImages": ["String"],
  "available": "Boolean",
  "floorNumber": "Integer",
  "size": "Integer",
  "createdAt": "DateTime",
  "updatedAt": "DateTime"
}
```

### Reservation Collection
```json
{
  "_id": "ObjectId",
  "user": "DBRef<User>",
  "room": "DBRef<Room>",
  "checkInDate": "Date",
  "checkOutDate": "Date",
  "numberOfGuests": "Integer",
  "totalAmount": "Decimal",
  "status": "Enum (PENDING/CONFIRMED/CHECKED_IN/CHECKED_OUT/CANCELLED)",
  "specialRequests": "String",
  "paymentId": "String",
  "confirmationEmailSent": "Boolean",
  "cancellationReason": "String",
  "cancelledAt": "DateTime",
  "createdAt": "DateTime",
  "updatedAt": "DateTime"
}
```

### Payment Collection
```json
{
  "_id": "ObjectId",
  "reservation": "DBRef<Reservation>",
  "user": "DBRef<User>",
  "amount": "Decimal",
  "currency": "String",
  "status": "Enum (PENDING/PROCESSING/SUCCEEDED/FAILED/REFUNDED)",
  "stripePaymentIntentId": "String",
  "stripeChargeId": "String",
  "paymentMethod": "String",
  "cardLast4": "String",
  "cardBrand": "String",
  "refundAmount": "Decimal",
  "refundReason": "String",
  "refundedAt": "DateTime",
  "receiptUrl": "String",
  "createdAt": "DateTime",
  "updatedAt": "DateTime"
}
```

## Testing

Run tests:
```bash
mvn test
```

Run tests with coverage:
```bash
mvn test jacoco:report
```

## Building for Production

Build the application:
```bash
mvn clean package
```

The JAR file will be in `target/reservation-system-1.0.0.jar`

Run the JAR:
```bash
java -jar target/reservation-system-1.0.0.jar
```

## Deployment to AWS

### AWS ECS Deployment with Fargate

The backend is deployed as a containerized application on AWS ECS using Fargate for serverless container orchestration.

#### Prerequisites
- AWS Account with ECR, ECS, and DocumentDB access
- Docker installed locally
- AWS CLI configured
- GitHub repository with Actions enabled

#### Deployment Architecture
1. **AWS ECR**: Stores Docker images
2. **AWS ECS**: Manages container orchestration
3. **AWS Fargate**: Serverless compute for containers
4. **Application Load Balancer**: Routes traffic to ECS tasks
5. **AWS DocumentDB**: Managed MongoDB-compatible database
6. **VPC**: Private subnet for database, public subnet for ALB
7. **Security Groups**: Network access control

#### Deployment Steps

##### 1. Create Dockerfile
```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/reservation-system-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

##### 2. Build and Push to ECR
```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build Docker image
docker build -t hotelx-backend .

# Tag image
docker tag hotelx-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/hotelx-backend:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/hotelx-backend:latest
```

##### 3. Create ECS Task Definition
```json
{
  "family": "hotelx-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "hotelx-backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/hotelx-backend:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "DATABASE_URI", "value": "mongodb://docdb-endpoint:27017"},
        {"name": "DATABASE_NAME", "value": "hotel_reservation"},
        {"name": "BACKEND_URL", "value": "https://api.yourdomain.com"},
        {"name": "FRONTEND_URL", "value": "https://yourdomain.com"}
      ],
      "secrets": [
        {"name": "JWT_SECRET", "valueFrom": "arn:aws:secretsmanager:..."},
        {"name": "GOOGLE_CLIENT_SECRET", "valueFrom": "arn:aws:secretsmanager:..."},
        {"name": "OKTA_CLIENT_SECRET", "valueFrom": "arn:aws:secretsmanager:..."},
        {"name": "STRIPE_API_KEY", "valueFrom": "arn:aws:secretsmanager:..."}
      ]
    }
  ]
}
```

##### 4. Create ECS Service
```bash
aws ecs create-service \
  --cluster hotelx-cluster \
  --service-name hotelx-backend-service \
  --task-definition hotelx-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=hotelx-backend,containerPort=8080"
```

### Environment Variables for Production
```bash
# Database
DATABASE_URI=mongodb://documentdb-endpoint:27017
DATABASE_NAME=hotel_reservation

# JWT
JWT_SECRET=production-secret-256-bits-minimum-32-characters
JWT_EXPIRATION=86400000

# OAuth2 - Google
GOOGLE_CLIENT_ID=production-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=production-google-client-secret

# OAuth2 - Okta
OKTA_CLIENT_ID=production-okta-client-id
OKTA_CLIENT_SECRET=production-okta-client-secret
OKTA_ISSUER_URI=https://your-domain.okta.com/oauth2/default

# Stripe
STRIPE_API_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Application URLs (HTTPS for production)
BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://your-cloudfront-domain.cloudfront.net
```

### OAuth2 Provider Setup

#### Google OAuth2 Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Configure authorized redirect URIs:
   - Development: `http://localhost:8080/login/oauth2/code/google`
   - Production: `https://api.yourdomain.com/login/oauth2/code/google`
6. Copy Client ID and Client Secret to environment variables

#### Okta OIDC Setup
1. Sign up for [Okta Developer Account](https://developer.okta.com/)
2. Create a new OIDC application (Web Application)
3. Configure Sign-in redirect URIs:
   - Development: `http://localhost:8080/login/oauth2/code/okta`
   - Production: `https://api.yourdomain.com/login/oauth2/code/okta`
4. Configure Sign-out redirect URIs (optional)
5. Grant types: Authorization Code, Refresh Token
6. Copy Client ID, Client Secret, and Issuer URI to environment variables

## CI/CD Pipeline (GitHub Actions)

The project uses GitHub Actions for automated deployment to AWS ECS.

### GitHub Secrets Configuration

Store the following secrets in your GitHub repository (Settings → Secrets and variables → Actions):

```
AWS_ACCOUNT_ID
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
ECR_REPOSITORY
ECS_CLUSTER
ECS_SERVICE
ECS_TASK_DEFINITION

DATABASE_URI
DATABASE_NAME
JWT_SECRET
JWT_EXPIRATION
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
OKTA_CLIENT_ID
OKTA_CLIENT_SECRET
OKTA_ISSUER_URI
STRIPE_API_KEY
STRIPE_WEBHOOK_SECRET
BACKEND_URL
FRONTEND_URL
CORS_ALLOWED_ORIGINS
```

### GitHub Actions Workflow

Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend to AWS ECS

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Build with Maven
        run: |
          cd backend
          mvn clean package -DskipTests

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build, tag, and push image to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: ${{ secrets.ECR_REPOSITORY }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster ${{ secrets.ECS_CLUSTER }} \
            --service ${{ secrets.ECS_SERVICE }} \
            --force-new-deployment
```
```

## Key Implementation Details

### Overbooking Prevention
- Uses `synchronized` keyword on reservation creation/update methods
- Queries for overlapping reservations before confirming
- Atomic database operations with MongoDB transactions

### Password Security
- BCrypt password encoding
- Minimum 8 characters validation
- Never returns password in responses

### Payment Security
- Stripe handles sensitive card data
- Payment webhook verification
- Refund authorization checks

## Documentation

All classes and methods are documented with JavaDoc comments following industry standards.

## License

This project is part of HotelX.

## Contributors

- **Liam Heaney**
- **Arnold B. Epanda**
- **Muhiddin Kurbonov**
