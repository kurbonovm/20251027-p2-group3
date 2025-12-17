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
  const [priceError, setPriceError] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleChange = (field: keyof Room, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user makes changes
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
      setPriceError('');
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
      setPriceError('Price must be a positive number');
      handleChange('pricePerNight', 0);
    } else if (numValue === 0) {
      setPriceError('Price must be greater than 0');
      handleChange('pricePerNight', 0);
    } else {
      setPriceError('');
      handleChange('pricePerNight', Math.round(numValue)); // Convert to integer
    }
  };

  const validateForm = (): boolean => {
    // Required fields validation
    if (!formData.name || formData.name.trim() === '') {
      setError('Room name is required');
      return false;
    }

    if (!formData.pricePerNight || formData.pricePerNight <= 0) {
      setError('Price per night must be greater than 0');
      return false;
    }

    if (!formData.capacity || formData.capacity < 1) {
      setError('Capacity must be at least 1');
      return false;
    }

    if (!formData.totalRooms || formData.totalRooms < 1) {
      setError('Total rooms must be at least 1');
      return false;
    }

    if (!formData.floorNumber || formData.floorNumber < 1) {
      setError('Floor number must be at least 1');
      return false;
    }

    if (formData.size !== undefined && formData.size < 0) {
      setError('Size cannot be negative');
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
      setPriceError('');
      
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
    setPriceError('');
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
                onChange={(e) => handleChange('name', e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
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
                error={!!priceError}
                helperText={priceError}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiFormHelperText-root': { color: '#f44336' },
                }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />
            </Grid>

            {/* Capacity */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Capacity (Guests) *"
                value={formData.capacity || 1}
                onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 1)}
                required
                inputProps={{ min: 1, max: 20 }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />
            </Grid>

            {/* Floor Number */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Floor Number *"
                value={formData.floorNumber || 1}
                onChange={(e) => handleChange('floorNumber', parseInt(e.target.value) || 1)}
                required
                inputProps={{ min: 1, max: 200 }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />
            </Grid>

            {/* Size */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Size (sq ft)"
                value={formData.size || 0}
                onChange={(e) => handleChange('size', parseInt(e.target.value) || 0)}
                inputProps={{ min: 0, max: 10000 }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />
            </Grid>

            {/* Total Rooms */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Total Rooms *"
                value={formData.totalRooms || 1}
                onChange={(e) => handleChange('totalRooms', parseInt(e.target.value) || 1)}
                required
                inputProps={{ min: 1, max: 1000 }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />
            </Grid>

            {/* Image URL */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.imageUrl || ''}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
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
            disabled={isLoading || !!priceError}
            sx={{
              backgroundColor: '#2196F3',
              '&:hover': {
                backgroundColor: '#1976D2',
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

