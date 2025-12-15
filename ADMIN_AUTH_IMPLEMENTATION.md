# Admin Authentication & User Creation - Implementation Summary

## ✅ Completed Implementation

### 1. Backend - Admin User Creation Endpoint

**File Created:**
- `backend/src/main/java/com/hotel/reservation/dto/CreateUserRequest.java`
  - DTO for creating users with specific roles
  - Includes validation for all required fields
  - Supports role selection (ADMIN, MANAGER, GUEST)

**File Updated:**
- `backend/src/main/java/com/hotel/reservation/controller/AdminController.java`
  - Added `POST /api/admin/users` endpoint (admin-only)
  - Endpoint allows admins to create users with any role
  - Includes password encoding and validation
  - Protected with `@PreAuthorize("hasRole('ADMIN')")`

**Endpoint Details:**
```
POST /api/admin/users
Authorization: Bearer <admin_token>
Content-Type: application/json

Request Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "roles": ["ADMIN"],  // or ["MANAGER"], ["GUEST"], or multiple roles
  "enabled": true
}
```

### 2. Frontend - Role-Based Routing

**Files Updated:**
- `frontend/src/components/AuthModal.tsx`
  - Updated `handleLoginSubmit` to check user roles after login
  - Updated `handleRegisterSubmit` to check user roles after registration
  - Routes ADMIN/MANAGER users to `/admin/dashboard`
  - Routes GUEST users to home page or returnTo path

- `frontend/src/pages/OAuth2Callback.tsx`
  - Updated to fetch user info from `/api/auth/me` after OAuth2 login
  - Checks user roles and routes accordingly
  - ADMIN/MANAGER → `/admin/dashboard`
  - GUEST → home page or returnTo path

- `frontend/src/features/admin/adminApi.ts`
  - Added `createUser` mutation for admin user creation
  - Exported `useCreateUserMutation` hook
  - Added `CreateUserRequest` interface

## 🔄 Authentication Flow

### Login Flow:
1. User enters credentials in AuthModal
2. Backend authenticates and returns user with roles
3. Frontend checks user roles:
   - **ADMIN or MANAGER** → Redirect to `/admin/dashboard`
   - **GUEST** → Redirect to home page or returnTo path

### Registration Flow:
1. User registers through AuthModal (always creates GUEST)
2. Backend creates user with GUEST role
3. Frontend checks user roles (for consistency):
   - **ADMIN or MANAGER** → Redirect to `/admin/dashboard` (unlikely for new registrations)
   - **GUEST** → Redirect to home page

### OAuth2 Flow:
1. User authenticates via Google/Facebook
2. Backend returns token
3. Frontend fetches user info from `/api/auth/me`
4. Frontend checks user roles and routes accordingly

## 🎯 Key Features

1. **Unified Login/Register UI**: All users (GUEST, ADMIN, MANAGER) use the same AuthModal
2. **Role-Based Routing**: Automatic routing based on user role after authentication
3. **Admin User Creation**: Admins can create users with any role via API
4. **Secure Endpoint**: Admin user creation is protected (admin-only)

## 📝 Usage

### Creating Admin Users (via API):
```typescript
import { useCreateUserMutation } from '../features/admin/adminApi';

const [createUser] = useCreateUserMutation();

await createUser({
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@hotel.com',
  password: 'securePassword123',
  phoneNumber: '+1234567890',
  roles: ['ADMIN'],
  enabled: true,
});
```

### Testing the Flow:
1. Create an admin user via MongoDB or the new endpoint
2. Login with admin credentials
3. Should automatically redirect to `/admin/dashboard`
4. Login with guest credentials
5. Should redirect to home page

## ⚠️ Notes

- Registration always creates GUEST users (by design)
- Admin users must be created via:
  - MongoDB (manual)
  - Admin API endpoint (POST /api/admin/users) - requires existing admin
- OAuth2 users default to GUEST role (can be updated by admin)

