import React, { useState, useMemo } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TextField,
  Box,
  IconButton,
  Tooltip,
  DialogContentText,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  useGetAllUsersQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useCreateUserMutation,
} from '../../features/admin/adminApi';
import AdminLayout from '../../layouts/AdminLayout';
import Loading from '../../components/Loading';
import Notification from '../../components/Notification';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { User, CreateUserRequest } from '../../types';

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

const AdminUsers: React.FC = () => {
  const { data: users, isLoading, error } = useGetAllUsersQuery();
  const [updateUserStatus, { isLoading: isUpdatingStatus }] = useUpdateUserStatusMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  const currentUser = useSelector(selectCurrentUser);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Create user form state
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    roles: ['CUSTOMER'],
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    phoneNumber?: string;
    roles?: string;
  }>({});

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchTerm) return users;

    const lowerSearch = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(lowerSearch) ||
        user.lastName.toLowerCase().includes(lowerSearch) ||
        user.email.toLowerCase().includes(lowerSearch) ||
        user.phoneNumber?.toLowerCase().includes(lowerSearch)
    );
  }, [users, searchTerm]);

  const showNotification = (message: string, severity: NotificationState['severity']) => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // Validate individual fields
  const validateField = (fieldName: keyof typeof newUser, value: any): string | undefined => {
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        const nameValue = value as string;
        if (!nameValue?.trim()) {
          return `${fieldName === 'firstName' ? 'First' : 'Last'} name is required`;
        }
        if (nameValue.trim().length < 2) {
          return `${fieldName === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
        }
        if (!/^[a-zA-Z\s-]+$/.test(nameValue)) {
          return 'Only letters, spaces, and hyphens are allowed';
        }
        return undefined;

      case 'email':
        const emailValue = value as string;
        if (!emailValue?.trim()) {
          return 'Email is required';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
          return 'Please enter a valid email address';
        }
        return undefined;

      case 'password':
        const passwordValue = value as string;
        if (!passwordValue?.trim()) {
          return 'Password is required';
        }
        if (passwordValue.length < 8) {
          return 'Password must be at least 8 characters';
        }
        return undefined;

      case 'phoneNumber':
        const phoneValue = value as string;
        if (phoneValue && phoneValue.trim()) {
          if (!/^[\d\s\-\+\(\)]+$/.test(phoneValue)) {
            return 'Please enter a valid phone number';
          }
          if (phoneValue.replace(/\D/g, '').length < 10) {
            return 'Phone number must be at least 10 digits';
          }
        }
        return undefined;

      case 'roles':
        const rolesValue = value as string[];
        if (!rolesValue || rolesValue.length === 0) {
          return 'Please select a role';
        }
        return undefined;

      default:
        return undefined;
    }
  };

  // Handle field change with validation
  const handleFieldChange = (fieldName: keyof typeof newUser, value: any) => {
    setNewUser({ ...newUser, [fieldName]: value });
    
    // Clear error for this field when user starts typing
    if (formErrors[fieldName]) {
      setFormErrors({ ...formErrors, [fieldName]: undefined });
    }
  };

  // Handle field blur to validate on focus loss
  const handleFieldBlur = (fieldName: keyof typeof newUser) => {
    const error = validateField(fieldName, newUser[fieldName]);
    if (error) {
      setFormErrors({ ...formErrors, [fieldName]: error });
    }
  };

  // Check if user is trying to modify themselves
  const isSelfModification = (userId: string): boolean => {
    return currentUser?.id === userId;
  };

  const handleStatusToggle = async (user: User) => {
    // Prevent self-modification
    if (isSelfModification(user.id)) {
      showNotification('You cannot disable your own account', 'warning');
      return;
    }

    try {
      await updateUserStatus({ id: user.id, enabled: !user.enabled }).unwrap();
      showNotification(
        `User ${user.enabled ? 'disabled' : 'enabled'} successfully`,
        'success'
      );
    } catch (err: any) {
      console.error('Failed to update status:', err);
      showNotification(
        err?.data?.message || 'Failed to update user status. Please try again.',
        'error'
      );
    }
  };

  const handleOpenDeleteDialog = (user: User) => {
    // Prevent self-deletion
    if (isSelfModification(user.id)) {
      showNotification('You cannot delete your own account', 'warning');
      return;
    }

    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleCreateUser = async () => {
    // Validate all fields
    const errors: typeof formErrors = {};
    
    errors.firstName = validateField('firstName', newUser.firstName);
    errors.lastName = validateField('lastName', newUser.lastName);
    errors.email = validateField('email', newUser.email);
    errors.password = validateField('password', newUser.password);
    errors.phoneNumber = validateField('phoneNumber', newUser.phoneNumber);
    errors.roles = validateField('roles', newUser.roles);

    // Filter out undefined errors
    const hasErrors = Object.values(errors).some(error => error !== undefined);

    if (hasErrors) {
      setFormErrors(errors);
      showNotification('Please fix the errors in the form', 'warning');
      return;
    }

    try {
      await createUser(newUser).unwrap();
      showNotification('User created successfully', 'success');
      setCreateDialogOpen(false);
      // Reset form
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        roles: ['CUSTOMER'],
      });
      setFormErrors({});
    } catch (err: any) {
      console.error('Failed to create user:', err);
      // Handle specific error messages from backend
      const errorMessage = err?.data?.message || err?.message || 'Failed to create user. Please try again.';
      
      if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('already')) {
        setFormErrors({ ...formErrors, email: 'This email address is already registered' });
        showNotification('This email address is already registered', 'error');
      } else if (errorMessage.toLowerCase().includes('duplicate')) {
        setFormErrors({ ...formErrors, email: 'A user with this email already exists' });
        showNotification('A user with this email already exists', 'error');
      } else {
        showNotification(errorMessage, 'error');
      }
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id).unwrap();
      showNotification('User deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      showNotification(
        err?.data?.message || 'Failed to delete user. Please try again.',
        'error'
      );
    }
  };

  if (isLoading) return <Loading message="Loading users..." />;

  if (error) {
    return (
      <AdminLayout>
        <Alert severity="error">Failed to load users. Please try again later.</Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage user accounts, roles, and permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Create A User
        </Button>
      </Box>

      {/* Search Box */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* User Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    {searchTerm ? 'No users found matching your search' : 'No users available'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user: User) => {
                const isCurrentUser = isSelfModification(user.id);
                return (
                  <TableRow
                    key={user.id}
                    sx={{
                      backgroundColor: isCurrentUser ? 'action.hover' : 'inherit',
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {user.firstName} {user.lastName}
                        {isCurrentUser && (
                          <Chip label="You" size="small" color="primary" variant="outlined" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phoneNumber || '-'}</TableCell>
                    <TableCell>
                      {user.roles.map((role) => (
                        <Chip
                          key={role}
                          label={role}
                          size="small"
                          color={role === 'ADMIN' ? 'error' : role === 'MANAGER' ? 'warning' : 'default'}
                          sx={{ mr: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.enabled ? 'Active' : 'Disabled'}
                        color={user.enabled ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip
                          title={
                            isCurrentUser
                              ? 'Cannot disable your own account'
                              : user.enabled
                              ? 'Disable User'
                              : 'Enable User'
                          }
                        >
                          <span>
                            <Button
                              size="small"
                              onClick={() => handleStatusToggle(user)}
                              disabled={isCurrentUser || isUpdatingStatus}
                              variant="outlined"
                              color={user.enabled ? 'warning' : 'success'}
                            >
                              {isUpdatingStatus ? (
                                <CircularProgress size={20} />
                              ) : user.enabled ? (
                                'Disable'
                              ) : (
                                'Enable'
                              )}
                            </Button>
                          </span>
                        </Tooltip>
                        <Tooltip
                          title={isCurrentUser ? 'Cannot delete your own account' : 'Delete User'}
                        >
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDeleteDialog(user)}
                              disabled={isCurrentUser || isDeleting}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create User Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setFormErrors({});
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create A User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="First Name"
              value={newUser.firstName}
              onChange={(e) => handleFieldChange('firstName', e.target.value)}
              onBlur={() => handleFieldBlur('firstName')}
              required
              fullWidth
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
            />
            <TextField
              label="Last Name"
              value={newUser.lastName}
              onChange={(e) => handleFieldChange('lastName', e.target.value)}
              onBlur={() => handleFieldBlur('lastName')}
              required
              fullWidth
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
            />
            <TextField
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={() => handleFieldBlur('email')}
              required
              fullWidth
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            <TextField
              label="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              onBlur={() => handleFieldBlur('password')}
              required
              fullWidth
              error={!!formErrors.password}
              helperText={formErrors.password || "Minimum 8 characters"}
            />
            <TextField
              label="Phone Number"
              value={newUser.phoneNumber}
              onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
              onBlur={() => handleFieldBlur('phoneNumber')}
              fullWidth
              error={!!formErrors.phoneNumber}
              helperText={formErrors.phoneNumber || "Optional"}
            />
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: formErrors.roles ? 'error.main' : 'inherit' }}>
                Role *
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label="Guest"
                  color={newUser.roles.includes('CUSTOMER') ? 'primary' : 'default'}
                  onClick={() => {
                    handleFieldChange('roles', ['CUSTOMER']);
                    if (formErrors.roles) {
                      setFormErrors({ ...formErrors, roles: undefined });
                    }
                  }}
                  variant={newUser.roles.includes('CUSTOMER') ? 'filled' : 'outlined'}
                />
                <Chip
                  label="Manager"
                  color={newUser.roles.includes('MANAGER') ? 'primary' : 'default'}
                  onClick={() => {
                    handleFieldChange('roles', ['MANAGER']);
                    if (formErrors.roles) {
                      setFormErrors({ ...formErrors, roles: undefined });
                    }
                  }}
                  variant={newUser.roles.includes('MANAGER') ? 'filled' : 'outlined'}
                />
                <Chip
                  label="Admin"
                  color={newUser.roles.includes('ADMIN') ? 'primary' : 'default'}
                  onClick={() => {
                    handleFieldChange('roles', ['ADMIN']);
                    if (formErrors.roles) {
                      setFormErrors({ ...formErrors, roles: undefined });
                    }
                  }}
                  variant={newUser.roles.includes('ADMIN') ? 'filled' : 'outlined'}
                />
              </Box>
              {formErrors.roles && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {formErrors.roles}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateDialogOpen(false);
            setFormErrors({});
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            color="primary"
            disabled={isCreating}
          >
            {isCreating ? <CircularProgress size={24} /> : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>?
            <br />
            <br />
            This action cannot be undone. All associated data including reservations will be affected.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={24} /> : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Notification
        open={notification.open}
        onClose={closeNotification}
        message={notification.message}
        severity={notification.severity}
      />
    </AdminLayout>
  );
};

export default AdminUsers;
