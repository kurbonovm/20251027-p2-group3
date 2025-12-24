import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Switch,
  Grid,
  Alert,
} from '@mui/material';
import { Room, RoomType } from '../types';
import { useCreateRoomMutation } from '../features/admin/adminApi';

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
  onCreateSuccess?: () => void;
}

const ROOM_TYPES: RoomType[] = ['STANDARD', 'DELUXE', 'SUITE', 'PRESIDENTIAL'];
const COMMON_AMENITIES = [
  'WiFi',
  'AC',
  'TV',
  'Mini Bar',
  'Room Service',
  'Safe',
  'Balcony',
  'Ocean View',
  'City View',
  'Private Terrace',
  'Indoor-Outdoor Lounge',
  'Jacuzzi',
  'Kitchenette',
  'Work Desk',
];

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ open, onClose, onCreateSuccess }) => {
  const [createRoom, { isLoading }] = useCreateRoomMutation();
  const [formData, setFormData] = useState<Partial<Room>>({
    name: '',
    type: 'STANDARD',
    description: '',
    pricePerNight: 0,
    capacity: 1,
    amenities: [],
    imageUrl: '',
    additionalImages: [],
    available: true,
    floorNumber: 1,
    size: 0,
    totalRooms: 1,
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [priceInput, setPriceInput] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // Individual field validation errors
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    price: '',
    description: '',
    capacity: '',
    floorNumber: '',
    size: '',
    totalRooms: '',
    imageUrl: '',
  });

  const handleChange = (field: keyof Room, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(''); // Clear global error when user makes changes
  };

  // Validation helper functions
  const validateName = (value: string): string => {
    if (!value || value.trim() === '') {
      return 'Room name is required';
    }
    if (value.length < 1 || value.length > 200) {
      return 'Room name must be between 1 and 200 characters';
    }
    return '';
  };

  const validateDescription = (value: string): string => {
    if (value && value.length > 2000) {
      return 'Description must not exceed 2000 characters';
    }
    return '';
  };

  const validateCapacity = (value: number): string => {
    if (!value || value < 1) {
      return 'Capacity must be at least 1 guest';
    }
    if (value > 20) {
      return 'Capacity cannot exceed 20 guests';
    }
    return '';
  };

  const validateFloorNumber = (value: number): string => {
    if (!value || value < 1) {
      return 'Floor number must be at least 1';
    }
    if (value > 200) {
      return 'Floor number cannot exceed 200';
    }
    return '';
  };

  const validateSize = (value: number): string => {
    if (value < 0) {
      return 'Size cannot be negative';
    }
    if (value > 10000) {
      return 'Size cannot exceed 10,000 sq ft';
    }
    return '';
  };

  const validateTotalRooms = (value: number): string => {
    if (!value || value < 1) {
      return 'Total rooms must be at least 1';
    }
    if (value > 1000) {
      return 'Total rooms cannot exceed 1000';
    }
    return '';
  };

  const validateImageUrl = (value: string): string => {
    if (!value || value.trim() === '') {
      return ''; // Image URL is optional
    }
    try {
      new URL(value);
      return '';
    } catch {
      return 'Please enter a valid URL (e.g., https://example.com/image.jpg)';
    }
  };

  // Field change handlers with validation
  const handleNameChange = (value: string) => {
    handleChange('name', value);
    const error = validateName(value);
    setFieldErrors((prev) => ({ ...prev, name: error }));
  };

  const handleDescriptionChange = (value: string) => {
    handleChange('description', value);
    const error = validateDescription(value);
    setFieldErrors((prev) => ({ ...prev, description: error }));
  };

  const handleCapacityChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    handleChange('capacity', numValue);
    const error = validateCapacity(numValue);
    setFieldErrors((prev) => ({ ...prev, capacity: error }));
  };

  const handleFloorNumberChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    handleChange('floorNumber', numValue);
    const error = validateFloorNumber(numValue);
    setFieldErrors((prev) => ({ ...prev, floorNumber: error }));
  };

  const handleSizeChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    handleChange('size', numValue);
    const error = validateSize(numValue);
    setFieldErrors((prev) => ({ ...prev, size: error }));
  };

  const handleTotalRoomsChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    handleChange('totalRooms', numValue);
    const error = validateTotalRooms(numValue);
    setFieldErrors((prev) => ({ ...prev, totalRooms: error }));
  };

  const handleImageUrlChange = (value: string) => {
    handleChange('imageUrl', value);
    const error = validateImageUrl(value);
    setFieldErrors((prev) => ({ ...prev, imageUrl: error }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities?.includes(newAmenity.trim())) {
      handleChange('amenities', [...(formData.amenities || []), newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    handleChange(
      'amenities',
      formData.amenities?.filter((a) => a !== amenity) || []
    );
  };

  const handleAddAdditionalImage = () => {
    if (newImageUrl.trim() && !formData.additionalImages?.includes(newImageUrl.trim())) {
      handleChange('additionalImages', [...(formData.additionalImages || []), newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveAdditionalImage = (url: string) => {
    handleChange(
      'additionalImages',
      formData.additionalImages?.filter((img) => img !== url) || []
    );
  };

  const handlePriceChange = (value: string) => {
    setPriceInput(value);
    
    // Allow empty string for typing
    if (value === '') {
      setFieldErrors((prev) => ({ ...prev, price: 'Price per night is required' }));
      handleChange('pricePerNight', 0);
      return;
    }

    // Only allow numbers and one decimal point
    if (!/^\d*\.?\d*$/.test(value)) {
      return;
    }

    const numValue = parseFloat(value);
    
    // Validate positive number
    if (isNaN(numValue) || numValue < 0) {
      setFieldErrors((prev) => ({ ...prev, price: 'Price must be a positive number' }));
      handleChange('pricePerNight', 0);
    } else if (numValue === 0) {
      setFieldErrors((prev) => ({ ...prev, price: 'Price must be greater than $0' }));
      handleChange('pricePerNight', 0);
    } else if (numValue > 1000000) {
      setFieldErrors((prev) => ({ ...prev, price: 'Price cannot exceed $1,000,000 per night' }));
      handleChange('pricePerNight', 0);
    } else {
      setFieldErrors((prev) => ({ ...prev, price: '' }));
      handleChange('pricePerNight', Math.round(numValue)); // Convert to integer
    }
  };

  const validateForm = (): boolean => {
    // Check all field errors
    const nameError = validateName(formData.name || '');
    const priceError = !formData.pricePerNight || formData.pricePerNight <= 0 
      ? 'Price per night is required and must be greater than $0' 
      : '';
    const descriptionError = validateDescription(formData.description || '');
    const capacityError = validateCapacity(formData.capacity || 0);
    const floorNumberError = validateFloorNumber(formData.floorNumber || 0);
    const sizeError = validateSize(formData.size || 0);
    const totalRoomsError = validateTotalRooms(formData.totalRooms || 0);
    const imageUrlError = validateImageUrl(formData.imageUrl || '');

    // Update all field errors
    setFieldErrors({
      name: nameError,
      price: priceError,
      description: descriptionError,
      capacity: capacityError,
      floorNumber: floorNumberError,
      size: sizeError,
      totalRooms: totalRoomsError,
      imageUrl: imageUrlError,
    });

    // Check if any errors exist
    if (nameError || priceError || descriptionError || capacityError || 
        floorNumberError || sizeError || totalRoomsError || imageUrlError) {
      setError('Please fix all validation errors before submitting');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      // Create the room object with all required fields
      const roomToCreate: Partial<Room> = {
        name: formData.name?.trim(),
        type: formData.type,
        description: formData.description?.trim() || '',
        pricePerNight: formData.pricePerNight,
        capacity: formData.capacity,
        amenities: formData.amenities || [],
        imageUrl: formData.imageUrl?.trim() || '',
        additionalImages: formData.additionalImages || [],
        available: formData.available !== undefined ? formData.available : true,
        totalRooms: formData.totalRooms,
        floorNumber: formData.floorNumber,
        size: formData.size || 0,
      };

      console.log('Creating room:', roomToCreate);
      
      await createRoom(roomToCreate).unwrap();
      console.log('Room created successfully');
      
      // Reset form
      setFormData({
        name: '',
        type: 'STANDARD',
        description: '',
        pricePerNight: 0,
        capacity: 1,
        amenities: [],
        imageUrl: '',
        additionalImages: [],
        available: true,
        floorNumber: 1,
        size: 0,
        totalRooms: 1,
      });
      setPriceInput('');
      setFieldErrors({
        name: '',
        price: '',
        description: '',
        capacity: '',
        floorNumber: '',
        size: '',
        totalRooms: '',
        imageUrl: '',
      });
      
      if (onCreateSuccess) {
        onCreateSuccess();
      }
    } catch (err: any) {
      console.error('Failed to create room:', err);
      setError(err?.data?.message || 'Failed to create room. Please try again.');
    }
  };

  const handleClose = () => {
    setError('');
    setFieldErrors({
      name: '',
      price: '',
      description: '',
      capacity: '',
      floorNumber: '',
      size: '',
      totalRooms: '',
      imageUrl: '',
    });
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ color: '#ffffff' }}>
          Create New Room
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Room Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Room Name *"
                value={formData.name || ''}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                error={!!fieldErrors.name}
                helperText={fieldErrors.name || 'Enter a unique name for the room'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiFormHelperText-root': { 
                    color: fieldErrors.name ? '#f44336' : 'rgba(255, 255, 255, 0.5)' 
                  },
                }}
              />
            </Grid>

            {/* Room Type */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Room Type *</InputLabel>
                <Select
                  value={formData.type || 'STANDARD'}
                  onChange={(e) => handleChange('type', e.target.value as RoomType)}
                  label="Room Type *"
                  required
                  sx={{
                    color: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  {ROOM_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Price Per Night */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price Per Night ($) *"
                value={priceInput}
                onChange={(e) => handlePriceChange(e.target.value)}
                required
                error={!!fieldErrors.price}
                helperText={fieldErrors.price || 'Enter the nightly rate in dollars'}
                placeholder="e.g., 150"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiFormHelperText-root': { 
                    color: fieldErrors.price ? '#f44336' : 'rgba(255, 255, 255, 0.5)' 
                  },
                }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description || ''}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                error={!!fieldErrors.description}
                helperText={
                  fieldErrors.description || 
                  `Describe the room features and amenities (${(formData.description || '').length}/2000 characters)`
                }
                placeholder="e.g., Spacious room with ocean view, king-size bed, and modern amenities..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiFormHelperText-root': { 
                    color: fieldErrors.description ? '#f44336' : 'rgba(255, 255, 255, 0.5)' 
                  },
                }}
              />
            </Grid>

            {/* Capacity */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Capacity (Guests) *"
                value={formData.capacity || ''}
                onChange={(e) => handleCapacityChange(e.target.value)}
                required
                error={!!fieldErrors.capacity}
                helperText={fieldErrors.capacity || 'Maximum number of guests (1-20)'}
                inputProps={{ min: 1, max: 20 }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiFormHelperText-root': { 
                    color: fieldErrors.capacity ? '#f44336' : 'rgba(255, 255, 255, 0.5)' 
                  },
                }}
              />
            </Grid>

            {/* Floor Number */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Floor Number *"
                value={formData.floorNumber || ''}
                onChange={(e) => handleFloorNumberChange(e.target.value)}
                required
                error={!!fieldErrors.floorNumber}
                helperText={fieldErrors.floorNumber || 'Which floor is this room on? (1-200)'}
                inputProps={{ min: 1, max: 200 }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiFormHelperText-root': { 
                    color: fieldErrors.floorNumber ? '#f44336' : 'rgba(255, 255, 255, 0.5)' 
                  },
                }}
              />
            </Grid>

            {/* Size */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Size (sq ft)"
                value={formData.size || ''}
                onChange={(e) => handleSizeChange(e.target.value)}
                error={!!fieldErrors.size}
                helperText={fieldErrors.size || 'Room size in square feet (optional, max 10,000)'}
                placeholder="e.g., 350"
                inputProps={{ min: 0, max: 10000 }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiFormHelperText-root': { 
                    color: fieldErrors.size ? '#f44336' : 'rgba(255, 255, 255, 0.5)' 
                  },
                }}
              />
            </Grid>

            {/* Total Rooms */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Total Rooms *"
                value={formData.totalRooms || ''}
                onChange={(e) => handleTotalRoomsChange(e.target.value)}
                required
                error={!!fieldErrors.totalRooms}
                helperText={fieldErrors.totalRooms || 'How many rooms of this type? (1-1000)'}
                inputProps={{ min: 1, max: 1000 }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiFormHelperText-root': { 
                    color: fieldErrors.totalRooms ? '#f44336' : 'rgba(255, 255, 255, 0.5)' 
                  },
                }}
              />
            </Grid>

            {/* Image URL */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Main Image URL"
                value={formData.imageUrl || ''}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                error={!!fieldErrors.imageUrl}
                helperText={fieldErrors.imageUrl || 'Enter a valid URL for the main room image (optional)'}
                placeholder="https://example.com/room-image.jpg"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiFormHelperText-root': { 
                    color: fieldErrors.imageUrl ? '#f44336' : 'rgba(255, 255, 255, 0.5)' 
                  },
                }}
              />
            </Grid>

            {/* Additional Images */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                Additional Images
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add additional image URL"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAdditionalImage();
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddAdditionalImage}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  Add
                </Button>
              </Box>
              {formData.additionalImages && formData.additionalImages.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {formData.additionalImages.map((url, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          flex: 1,
                          color: 'rgba(255, 255, 255, 0.8)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {url}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => handleRemoveAdditionalImage(url)}
                        sx={{
                          color: '#f44336',
                          minWidth: 'auto',
                          '&:hover': {
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                          },
                        }}
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>

            {/* Amenities */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                Amenities
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add amenity"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAmenity();
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddAmenity}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {COMMON_AMENITIES.map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    onClick={() => {
                      if (!formData.amenities?.includes(amenity)) {
                        handleChange('amenities', [...(formData.amenities || []), amenity]);
                      }
                    }}
                    onDelete={
                      formData.amenities?.includes(amenity)
                        ? () => handleRemoveAmenity(amenity)
                        : undefined
                    }
                    sx={{
                      backgroundColor: formData.amenities?.includes(amenity)
                        ? 'rgba(76, 175, 80, 0.3)'
                        : 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: formData.amenities?.includes(amenity)
                          ? 'rgba(76, 175, 80, 0.4)'
                          : 'rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Grid>

            {/* Available Switch */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.available !== undefined ? formData.available : true}
                    onChange={(e) => handleChange('available', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#2196F3',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#2196F3',
                      },
                    }}
                  />
                }
                label="Available"
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={
              isLoading || 
              Object.values(fieldErrors).some(error => error !== '')
            }
            sx={{
              backgroundColor: '#2196F3',
              '&:hover': {
                backgroundColor: '#1976D2',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(33, 150, 243, 0.3)',
                color: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            {isLoading ? 'Creating...' : 'Create Room'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateRoomModal;

