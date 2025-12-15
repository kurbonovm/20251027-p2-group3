import React, { useState, useEffect } from 'react';
import {
  Container,
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updatedUser = await updateProfile(formData).unwrap();
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
      setError(err.data?.message || 'Failed to update profile');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar
              sx={{ width: 80, height: 80, mr: 2, bgcolor: 'primary.main' }}
              src={displayUser?.avatar}
            >
              <Person sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h4">
                {displayUser?.firstName} {displayUser?.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {displayUser?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
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
            <Typography variant="h5">Profile Information</Typography>
            {!isEditing ? (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
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
                }}
              >
                Cancel
              </Button>
            )}
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={displayUser?.email || ''}
                  disabled
                  helperText="Email cannot be changed"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>

            {isEditing && (
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                sx={{ mt: 3 }}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;
