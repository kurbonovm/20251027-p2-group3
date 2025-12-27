import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  useTheme,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
} from '@mui/material';
import {
  Save,
  ExpandMore,
  Notifications,
  Hotel,
  Accessible,
  Restaurant,
  Language,
  Palette,
  RestartAlt,
} from '@mui/icons-material';
import {
  useGetMyPreferencesQuery,
  useUpdateMyPreferencesMutation,
  useResetMyPreferencesMutation,
} from '../features/preferences/preferencesApi';
import { UserPreferences } from '../types';
import { useThemeMode } from '../contexts/ThemeContext';

/**
 * User preferences settings component
 * Allows users to manage their preferences for notifications, room preferences, accessibility, etc.
 */
const UserPreferencesSettings: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { setThemeMode } = useThemeMode();

  const { data: preferences, isLoading: loadingPreferences } = useGetMyPreferencesQuery();
  const [updatePreferences, { isLoading: updating }] = useUpdateMyPreferencesMutation();
  const [resetPreferences, { isLoading: resetting }] = useResetMyPreferencesMutation();

  const [formData, setFormData] = useState<UserPreferences>({
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    bookingConfirmationEmails: true,
    promotionalEmails: true,
    bookingReminderEmails: true,
    preferQuietRoom: false,
    wheelchairAccessible: false,
    hearingAccessible: false,
    visualAccessible: false,
    dietaryRestrictions: [],
    allergies: [],
    preferredLanguage: 'en',
    preferredCurrency: 'USD',
    preferredDateFormat: 'MM/DD/YYYY',
    preferredTimeFormat: '12h',
    themeMode: 'light',
  });

  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [newDietaryRestriction, setNewDietaryRestriction] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  useEffect(() => {
    if (preferences) {
      setFormData(preferences);

      // Sync theme mode with preferences when loaded
      if (preferences.themeMode === 'light' || preferences.themeMode === 'dark') {
        setThemeMode(preferences.themeMode);
      }
    }
  }, [preferences, setThemeMode]);

  const handleSwitchChange = (field: keyof UserPreferences) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: event.target.checked });
  };

  const handleInputChange = (field: keyof UserPreferences) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSelectChange = (field: keyof UserPreferences) => (
    event: any
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleAddDietaryRestriction = () => {
    if (newDietaryRestriction.trim()) {
      setFormData({
        ...formData,
        dietaryRestrictions: [...(formData.dietaryRestrictions || []), newDietaryRestriction.trim()],
      });
      setNewDietaryRestriction('');
    }
  };

  const handleRemoveDietaryRestriction = (index: number) => {
    setFormData({
      ...formData,
      dietaryRestrictions: formData.dietaryRestrictions.filter((_, i) => i !== index),
    });
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setFormData({
        ...formData,
        allergies: [...(formData.allergies || []), newAllergy.trim()],
      });
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await updatePreferences(formData).unwrap();

      // Apply theme change immediately
      if (formData.themeMode === 'light' || formData.themeMode === 'dark') {
        setThemeMode(formData.themeMode);
      }

      setSuccess('Preferences updated successfully!');
    } catch (err: any) {
      setError(err.data?.message || 'Failed to update preferences');
    }
  };

  const handleReset = async () => {
    try {
      const reset = await resetPreferences().unwrap();
      setFormData(reset);

      // Apply theme change immediately
      if (reset.themeMode === 'light' || reset.themeMode === 'dark') {
        setThemeMode(reset.themeMode);
      }

      setSuccess('Preferences reset to defaults!');
    } catch (err: any) {
      setError(err.data?.message || 'Failed to reset preferences');
    }
  };

  if (loadingPreferences) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>Loading preferences...</Typography>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Notification Preferences */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Notifications color="primary" />
            <Typography variant="h6">Notification Preferences</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.emailNotificationsEnabled}
                  onChange={handleSwitchChange('emailNotificationsEnabled')}
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.smsNotificationsEnabled}
                  onChange={handleSwitchChange('smsNotificationsEnabled')}
                />
              }
              label="SMS Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.bookingConfirmationEmails}
                  onChange={handleSwitchChange('bookingConfirmationEmails')}
                />
              }
              label="Booking Confirmation Emails"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.promotionalEmails}
                  onChange={handleSwitchChange('promotionalEmails')}
                />
              }
              label="Promotional Emails"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.bookingReminderEmails}
                  onChange={handleSwitchChange('bookingReminderEmails')}
                />
              }
              label="Booking Reminder Emails"
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Room Preferences */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Hotel color="primary" />
            <Typography variant="h6">Room Preferences</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Preferred Bed Type</InputLabel>
                <Select
                  value={formData.preferredBedType || ''}
                  onChange={handleSelectChange('preferredBedType')}
                  label="Preferred Bed Type"
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="KING">King</MenuItem>
                  <MenuItem value="QUEEN">Queen</MenuItem>
                  <MenuItem value="DOUBLE">Double</MenuItem>
                  <MenuItem value="TWIN">Twin</MenuItem>
                  <MenuItem value="SINGLE">Single</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Preferred Floor Level</InputLabel>
                <Select
                  value={formData.preferredFloorLevel || ''}
                  onChange={handleSelectChange('preferredFloorLevel')}
                  label="Preferred Floor Level"
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="HIGH">High Floor</MenuItem>
                  <MenuItem value="MIDDLE">Middle Floor</MenuItem>
                  <MenuItem value="LOW">Low Floor</MenuItem>
                  <MenuItem value="GROUND">Ground Floor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Preferred Room View</InputLabel>
                <Select
                  value={formData.preferredRoomView || ''}
                  onChange={handleSelectChange('preferredRoomView')}
                  label="Preferred Room View"
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="OCEAN">Ocean</MenuItem>
                  <MenuItem value="CITY">City</MenuItem>
                  <MenuItem value="GARDEN">Garden</MenuItem>
                  <MenuItem value="MOUNTAIN">Mountain</MenuItem>
                  <MenuItem value="POOL">Pool</MenuItem>
                  <MenuItem value="COURTYARD">Courtyard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preferred Room Type"
                value={formData.preferredRoomType || ''}
                onChange={handleInputChange('preferredRoomType')}
                placeholder="e.g., Standard, Deluxe, Suite"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.preferQuietRoom}
                    onChange={handleSwitchChange('preferQuietRoom')}
                  />
                }
                label="Prefer Quiet Room"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preferred Check-In Time"
                type="time"
                value={formData.preferredCheckInTime || ''}
                onChange={handleInputChange('preferredCheckInTime')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preferred Check-Out Time"
                type="time"
                value={formData.preferredCheckOutTime || ''}
                onChange={handleInputChange('preferredCheckOutTime')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Accessibility Preferences */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Accessible color="primary" />
            <Typography variant="h6">Accessibility Preferences</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.wheelchairAccessible}
                  onChange={handleSwitchChange('wheelchairAccessible')}
                />
              }
              label="Wheelchair Accessible"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.hearingAccessible}
                  onChange={handleSwitchChange('hearingAccessible')}
                />
              }
              label="Hearing Accessible"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.visualAccessible}
                  onChange={handleSwitchChange('visualAccessible')}
                />
              }
              label="Visual Accessible"
            />
            <TextField
              fullWidth
              label="Other Accessibility Needs"
              multiline
              rows={2}
              value={formData.otherAccessibilityNeeds || ''}
              onChange={handleInputChange('otherAccessibilityNeeds')}
              placeholder="Describe any other accessibility requirements"
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Dietary & Special Requests */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Restaurant color="primary" />
            <Typography variant="h6">Dietary Restrictions & Allergies</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Dietary Restrictions
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  value={newDietaryRestriction}
                  onChange={(e) => setNewDietaryRestriction(e.target.value)}
                  placeholder="e.g., Vegetarian, Vegan, Halal"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDietaryRestriction())}
                />
                <Button variant="outlined" onClick={handleAddDietaryRestriction}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.dietaryRestrictions.map((restriction, index) => (
                  <Chip
                    key={index}
                    label={restriction}
                    onDelete={() => handleRemoveDietaryRestriction(index)}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Allergies
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="e.g., Peanuts, Shellfish, Dairy"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                />
                <Button variant="outlined" onClick={handleAddAllergy}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.allergies.map((allergy, index) => (
                  <Chip
                    key={index}
                    label={allergy}
                    onDelete={() => handleRemoveAllergy(index)}
                    color="error"
                  />
                ))}
              </Box>
            </Box>

            <TextField
              fullWidth
              label="Default Special Requests"
              multiline
              rows={3}
              value={formData.defaultSpecialRequests || ''}
              onChange={handleInputChange('defaultSpecialRequests')}
              placeholder="Any default special requests for your bookings"
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Language & Regional Preferences */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Language color="primary" />
            <Typography variant="h6">Language & Regional Settings</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Preferred Language</InputLabel>
                <Select
                  value={formData.preferredLanguage}
                  onChange={handleSelectChange('preferredLanguage')}
                  label="Preferred Language"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                  <MenuItem value="zh">Chinese</MenuItem>
                  <MenuItem value="ja">Japanese</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Preferred Currency</InputLabel>
                <Select
                  value={formData.preferredCurrency}
                  onChange={handleSelectChange('preferredCurrency')}
                  label="Preferred Currency"
                >
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                  <MenuItem value="JPY">JPY (¥)</MenuItem>
                  <MenuItem value="CNY">CNY (¥)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Date Format</InputLabel>
                <Select
                  value={formData.preferredDateFormat}
                  onChange={handleSelectChange('preferredDateFormat')}
                  label="Date Format"
                >
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Time Format</InputLabel>
                <Select
                  value={formData.preferredTimeFormat}
                  onChange={handleSelectChange('preferredTimeFormat')}
                  label="Time Format"
                >
                  <MenuItem value="12h">12-hour</MenuItem>
                  <MenuItem value="24h">24-hour</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Theme Preferences */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Palette color="primary" />
            <Typography variant="h6">Theme Preferences</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth>
            <InputLabel>Theme Mode</InputLabel>
            <Select
              value={formData.themeMode}
              onChange={handleSelectChange('themeMode')}
              label="Theme Mode"
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="auto">Auto (System)</MenuItem>
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<RestartAlt />}
          onClick={handleReset}
          disabled={resetting}
          sx={{
            color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary',
            borderColor: isDarkMode ? 'rgba(255,255,255,0.3)' : 'divider',
          }}
        >
          Reset to Defaults
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={<Save />}
          disabled={updating}
          sx={{
            background: isDarkMode
              ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
              : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: isDarkMode ? '#000' : '#fff',
            fontWeight: 600,
            '&:hover': {
              background: isDarkMode
                ? 'linear-gradient(135deg, #FFA500 0%, #FFD700 100%)'
                : 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
            },
          }}
        >
          {updating ? 'Saving...' : 'Save Preferences'}
        </Button>
      </Box>
    </Box>
  );
};

export default UserPreferencesSettings;
