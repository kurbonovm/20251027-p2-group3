# Admin Authentication & Registration - Current Status

## ✅ What's Working

### Backend
1. **Role System**: User model supports ADMIN, MANAGER, GUEST roles
2. **Security**: `/api/admin/**` routes protected with `@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")`
3. **Login**: Works for all users including admins - returns user with roles
4. **Admin Endpoints**: Full AdminController with user, room, reservation management

### Frontend
1. **Route Protection**: Admin routes protected with `ProtectedRoute` component
2. **Role Checking**: Checks user roles before allowing access
3. **Admin Pages**: All admin pages exist (Dashboard, Users, Rooms, Reservations, Transactions)
4. **API Integration**: Complete adminApi.ts with all endpoints

## ❌ What's Missing

### Backend
1. **Admin Registration**: Registration always creates GUEST users
   - Location: `AuthService.java` line 57: `roles.add(User.Role.GUEST);`
2. **Role Update Endpoint**: No endpoint to update user roles (only status update exists)

### Frontend
1. **Admin Registration UI**: No way to register as admin through UI
2. **Admin User Creation**: No UI to create admin users (must use MongoDB)

## Current Admin User Creation Process

Admin users must be created manually via MongoDB:

```javascript
db.users.insertOne({
  firstName: "Admin",
  lastName: "User",
  email: "admin@hotel.com",
  password: "$2a$10$...",  // BCrypt hash
  roles: ["ADMIN"],
  enabled: true,
  createdAt: new Date()
})
```

## Recommended Implementation

### Option 1: Add Admin User Creation Endpoint (Recommended)
- Add endpoint: `POST /api/admin/users` (admin-only)
- Allow admins to create new users with any role
- Include role selection in request body

### Option 2: Add Role Update Endpoint
- Add endpoint: `PUT /api/admin/users/{id}/roles` (admin-only)
- Allow admins to update user roles
- More flexible for managing existing users

### Option 3: Keep Manual Creation
- Keep current approach (MongoDB manual creation)
- Document the process clearly
- Add seed script for initial admin user

## Next Steps

1. ✅ Verify admin login works (should work if admin user exists)
2. ✅ Test admin route protection
3. ⚠️ Decide on admin user creation approach
4. ⚠️ Implement chosen approach if needed

