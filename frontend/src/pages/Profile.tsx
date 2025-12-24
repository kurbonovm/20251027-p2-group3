import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Grid,
  Alert,
} from '@mui/material';
import { Person, Edit, Save } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, updateUser } from '../features/auth/authSlice';
import { useUpdateProfileMutation, useGetCurrentUserQuery } from '../features/auth/authApi';
import { UpdateProfileRequest } from '../types';

/**
 * User profile page component
 */
const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  // Fetch current user to ensure we have the latest data from the server
  const { data: currentUser, refetch: refetchCurrentUser } = useGetCurrentUserQuery();

  // Use currentUser from query if available, otherwise fall back to Redux user
  const displayUser = currentUser || user;

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    firstName: displayUser?.firstName || '',
    lastName: displayUser?.lastName || '',
    phoneNumber: displayUser?.phoneNumber || '',
  });
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }>({});

  // Update Redux state when currentUser query returns data
  useEffect(() => {
    if (currentUser) {
      dispatch(updateUser(currentUser));
    }
  }, [currentUser, dispatch]);

  // Sync formData with user state when user changes (e.g., after profile update)
  // Only sync when not editing to avoid overwriting user's current edits
  useEffect(() => {
    if (displayUser && !isEditing) {
      setFormData({
        firstName: displayUser.firstName || '',
        lastName: displayUser.lastName || '',
        phoneNumber: displayUser.phoneNumber || '',
      });
    }
  }, [displayUser?.firstName, displayUser?.lastName, displayUser?.phoneNumber, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear field error when user starts typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: undefined,
      });
    }
    
    // Clear general error
    if (error) {
      setError('');
    }
  };

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};
    let isValid = true;

    // Validate first name
    if (!formData.firstName || formData.firstName.trim() === '') {
      errors.firstName = 'First name is required';
      isValid = false;
    } else if (formData.firstName.trim().length < 1 || formData.firstName.trim().length > 50) {
      errors.firstName = 'First name must be between 1 and 50 characters';
      isValid = false;
    }

    // Validate last name
    if (!formData.lastName || formData.lastName.trim() === '') {
      errors.lastName = 'Last name is required';
      isValid = false;
    } else if (formData.lastName.trim().length < 1 || formData.lastName.trim().length > 50) {
      errors.lastName = 'Last name must be between 1 and 50 characters';
      isValid = false;
    }

    // Validate phone number (optional, but if provided must be valid)
    if (formData.phoneNumber && formData.phoneNumber.trim() !== '') {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(formData.phoneNumber.trim())) {
        errors.phoneNumber = 'Phone number format is invalid';
        isValid = false;
      } else if (formData.phoneNumber.trim().length > 20) {
        errors.phoneNumber = 'Phone number must not exceed 20 characters';
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});

    // Validate form before submission
    if (!validateForm()) {
      setError('Please fix the errors in the form');
      return;
    }

    try {
      // Trim values before sending
      const trimmedData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber?.trim() || '',
      };

      const updatedUser = await updateProfile(trimmedData).unwrap();
      
      // Update Redux state with the updated user data
      dispatch(updateUser(updatedUser));
      
      // Immediately update formData with the updated user data
      setFormData({
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        phoneNumber: updatedUser.phoneNumber || '',
      });
      
      // Refetch current user to ensure we have the latest data from the server
      await refetchCurrentUser();
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Profile update error:', err);
      
      // Handle validation errors from backend
      if (err?.data?.errors) {
        // Backend returned field-specific errors
        const backendErrors: typeof fieldErrors = {};
        Object.keys(err.data.errors).forEach((key) => {
          backendErrors[key as keyof typeof fieldErrors] = err.data.errors[key];
        });
        setFieldErrors(backendErrors);
        setError('Please fix the errors in the form');
      } else if (err?.data?.message) {
        setError(err.data.message);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    }
  };

  // Check if user is admin or manager
  const isAdminOrManager = displayUser?.roles?.some(role => role === 'ADMIN' || role === 'MANAGER');

  return (
    <Box sx={{ my: 4, maxWidth: isAdminOrManager ? '100%' : '960px', mx: 'auto' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          backgroundColor: isAdminOrManager ? '#1a1a1a' : '#ffffff',
          color: 'black', // Ensure text color is always black
        }}
      >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mr: 2, 
                  bgcolor: isAdminOrManager ? '#1976d2' : 'primary.main',
                }}
                src={displayUser?.avatar}
              >
                <Person sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography 
                  variant="h4"
                  sx={{ color: 'black' }} // Ensure text color is always black
                >
                  {displayUser?.firstName} {displayUser?.lastName}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ color: 'text.secondary' }} // Use default secondary text color
                >
                  {displayUser?.email}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: 'text.secondary' }} // Use default secondary text color
                >
                  Role: {displayUser?.roles?.join(', ')}
                </Typography>
              </Box>
            </Box>

            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography 
                variant="h5"
                sx={{ color: 'black' }} // Ensure text color is always black
              >
                Profile Information
              </Typography>
              {!isEditing ? (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                  sx={isAdminOrManager ? {
                    color: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      borderColor: '#1976d2',
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    },
                  } : {}}
                >
                  Edit Profile
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      firstName: displayUser?.firstName || '',
                      lastName: displayUser?.lastName || '',
                      phoneNumber: displayUser?.phoneNumber || '',
                    });
                    setFieldErrors({});
                    setError('');
                    setSuccess('');
                  }}
                  sx={isAdminOrManager ? {
                    color: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  } : {}}
                >
                  Cancel
                </Button>
              )}
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                    error={!!fieldErrors.firstName}
                    helperText={fieldErrors.firstName}
                    sx={isAdminOrManager ? {
                      '& .MuiOutlinedInput-root': {
                        color: '#ffffff',
                        '& fieldset': { borderColor: fieldErrors.firstName ? '#f44336' : 'rgba(255, 255, 255, 0.3)' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                      '& .MuiFormHelperText-root': { color: '#f44336' },
                      '& .Mui-disabled': {
                        color: 'rgba(255, 255, 255, 0.5)',
                        WebkitTextFillColor: 'rgba(255, 255, 255, 0.5)',
                      },
                    } : {}}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                    error={!!fieldErrors.lastName}
                    helperText={fieldErrors.lastName}
                    sx={isAdminOrManager ? {
                      '& .MuiOutlinedInput-root': {
                        color: '#ffffff',
                        '& fieldset': { borderColor: fieldErrors.lastName ? '#f44336' : 'rgba(255, 255, 255, 0.3)' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                      '& .MuiFormHelperText-root': { color: '#f44336' },
                      '& .Mui-disabled': {
                        color: 'rgba(255, 255, 255, 0.5)',
                        WebkitTextFillColor: 'rgba(255, 255, 255, 0.5)',
                      },
                    } : {}}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={displayUser?.email || ''}
                    disabled
                    helperText="Email cannot be changed"
                    sx={isAdminOrManager ? {
                      '& .MuiOutlinedInput-root': {
                        color: '#ffffff',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                      '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.5)' },
                      '& .Mui-disabled': {
                        color: 'rgba(255, 255, 255, 0.5)',
                        WebkitTextFillColor: 'rgba(255, 255, 255, 0.5)',
                      },
                    } : {}}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    error={!!fieldErrors.phoneNumber}
                    helperText={fieldErrors.phoneNumber || 'Optional - Format: +1234567890 or (123) 456-7890'}
                    placeholder="+1 (555) 123-4567"
                    sx={isAdminOrManager ? {
                      '& .MuiOutlinedInput-root': {
                        color: '#ffffff',
                        '& fieldset': { borderColor: fieldErrors.phoneNumber ? '#f44336' : 'rgba(255, 255, 255, 0.3)' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                      '& .MuiFormHelperText-root': { color: fieldErrors.phoneNumber ? '#f44336' : 'rgba(255, 255, 255, 0.5)' },
                      '& .Mui-disabled': {
                        color: 'rgba(255, 255, 255, 0.5)',
                        WebkitTextFillColor: 'rgba(255, 255, 255, 0.5)',
                      },
                    } : {}}
                  />
                </Grid>
              </Grid>

              {isEditing && (
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  sx={{ 
                    mt: 3,
                    ...(isAdminOrManager && {
                      backgroundColor: '#2196F3',
                      '&:hover': {
                        backgroundColor: '#1976D2',
                      },
                    }),
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            )}
          </Box>
        </Paper>
    </Box>
  );
};

export default Profile;
