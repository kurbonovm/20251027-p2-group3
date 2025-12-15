import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Room, RoomType } from '../types';
import { useUpdateRoomMutation } from '../features/admin/adminApi';

interface EditRoomModalProps {
  open: boolean;
  onClose: () => void;
  room: Room | null;
  onUpdateSuccess?: () => void;
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

const EditRoomModal: React.FC<EditRoomModalProps> = ({ open, onClose, room, onUpdateSuccess }) => {
  const [updateRoom, { isLoading }] = useUpdateRoomMutation();
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
  const [priceInput, setPriceInput] = useState<string>('');
  const [priceError, setPriceError] = useState<string>('');

  useEffect(() => {
    if (room) {
      const price = room.pricePerNight || 0;
      setFormData({
        name: room.name || '',
        type: room.type || 'STANDARD',
        description: room.description || '',
        pricePerNight: price,
        capacity: room.capacity || 1,
        amenities: room.amenities || [],
        imageUrl: room.imageUrl || '',
        additionalImages: room.additionalImages || [],
        available: room.available !== undefined ? room.available : true,
        floorNumber: room.floorNumber || 1,
        size: room.size || 0,
        totalRooms: room.totalRooms || 1,
      });
      setPriceInput(price > 0 ? price.toString() : '');
      setPriceError('');
    }
  }, [room]);

  const handleChange = (field: keyof Room, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const handleAddAdditionalImage = (url: string) => {
    if (url.trim() && !formData.additionalImages?.includes(url.trim())) {
      handleChange('additionalImages', [...(formData.additionalImages || []), url.trim()]);
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
      handleChange('pricePerNight', numValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;

    // Validate price before submit
    const price = parseFloat(priceInput);
    if (!priceInput || isNaN(price) || price <= 0) {
      setPriceError('Price must be a positive number');
      return;
    }
    
    // Ensure price is a valid integer (not string or float)
    const priceValue = Math.round(price);

    try {
      // Build update data with only changed fields
      const updateData: Partial<Room> = {};
      
      // Helper to check if a value has changed
      const hasChanged = (newVal: any, oldVal: any): boolean => {
        if (newVal === undefined || newVal === null) return false;
        if (Array.isArray(newVal) && Array.isArray(oldVal)) {
          return JSON.stringify(newVal) !== JSON.stringify(oldVal);
        }
        if (typeof newVal === 'number' && typeof oldVal === 'number') {
          return Math.abs(newVal - oldVal) > 0.01; // For floating point comparison
        }
        return newVal !== oldVal;
      };

      // Only include fields that have changed
      if (hasChanged(formData.name, room.name)) {
        updateData.name = formData.name;
      }
      if (hasChanged(formData.type, room.type)) {
        updateData.type = formData.type;
      }
      if (hasChanged(formData.description, room.description)) {
        updateData.description = formData.description;
      }
      if (hasChanged(priceValue, room.pricePerNight)) {
        updateData.pricePerNight = priceValue;
        console.log('Price change detected:', {
          originalPrice: room.pricePerNight,
          newPrice: priceValue,
          priceType: typeof priceValue,
          priceValue: priceValue,
          isInteger: Number.isInteger(priceValue)
        });
      }
      if (hasChanged(formData.capacity, room.capacity)) {
        updateData.capacity = formData.capacity;
      }
      if (hasChanged(formData.amenities, room.amenities)) {
        updateData.amenities = formData.amenities;
      }
      if (hasChanged(formData.imageUrl, room.imageUrl)) {
        updateData.imageUrl = formData.imageUrl;
      }
      if (hasChanged(formData.additionalImages, room.additionalImages)) {
        updateData.additionalImages = formData.additionalImages;
      }
      if (formData.available !== undefined && formData.available !== room.available) {
        updateData.available = formData.available;
      }
      if (hasChanged(formData.floorNumber, room.floorNumber)) {
        updateData.floorNumber = formData.floorNumber;
      }
      if (hasChanged(formData.size, room.size)) {
        updateData.size = formData.size;
      }
      if (hasChanged(formData.totalRooms, room.totalRooms)) {
        updateData.totalRooms = formData.totalRooms;
      }

      // Ensure we have at least one field to update
      if (Object.keys(updateData).length === 0) {
        alert('No changes detected');
        return;
      }

      // Remove any undefined or null values to ensure we only send actual data
      const cleanUpdateData: Partial<Room> = {};
      Object.keys(updateData).forEach(key => {
        const value = updateData[key as keyof Room];
        if (value !== undefined && value !== null) {
          // For arrays, only include if not empty (unless explicitly changed to empty)
          if (Array.isArray(value)) {
            cleanUpdateData[key as keyof Room] = value as any;
          } else {
            cleanUpdateData[key as keyof Room] = value as any;
          }
        }
      });

      console.log('Sending update to backend (cleaned):', cleanUpdateData);
      console.log('Price per night type:', typeof cleanUpdateData.pricePerNight, 'Value:', cleanUpdateData.pricePerNight);
      console.log('Room ID:', room.id);
      const updatedRoom = await updateRoom({ id: room.id, room: cleanUpdateData }).unwrap();
      console.log('Room updated successfully:', updatedRoom);
      
      // Call the success callback if provided
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
      
      onClose();
    } catch (error: any) {
      console.error('Failed to update room:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      // RTK Query error structure: { status, data, error }
      // Backend error structure: { message, status, timestamp }
      let errorMessage = 'Unknown error occurred';
      
      if (error?.data) {
        // Backend error response
        errorMessage = error.data.message || error.data.error || JSON.stringify(error.data);
      } else if (error?.error) {
        // Network or other error
        errorMessage = error.error.message || error.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      console.error('Error details:', {
        message: errorMessage,
        status: error?.status,
        data: error?.data,
        error: error?.error,
      });
      
      alert(`Failed to update room: ${errorMessage}\n\nStatus: ${error?.status || 'N/A'}\n\nPlease check the browser console and backend logs for more details.`);
    }
  };

  if (!room) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ color: '#ffffff' }}>Edit Room</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Room Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Room Name"
                value={formData.name}
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
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Room Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  label="Room Type"
                  sx={{
                    color: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  {ROOM_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />
            </Grid>

            {/* Price Per Night */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price Per Night"
                type="text"
                inputMode="numeric"
                value={priceInput}
                onChange={(e) => handlePriceChange(e.target.value)}
                required
                error={!!priceError}
                helperText={priceError}
                placeholder="Enter price"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: priceError ? '#f44336' : 'rgba(255, 255, 255, 0.3)' },
                    '& input[type=number]': {
                      MozAppearance: 'textfield',
                    },
                    '& input[type=number]::-webkit-outer-spin-button': {
                      WebkitAppearance: 'none',
                      margin: 0,
                    },
                    '& input[type=number]::-webkit-inner-spin-button': {
                      WebkitAppearance: 'none',
                      margin: 0,
                    },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiFormHelperText-root': {
                    color: priceError ? '#f44336' : 'rgba(255, 255, 255, 0.5)',
                  },
                }}
              />
            </Grid>

            {/* Capacity */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacity (Guests)"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 1)}
                required
                inputProps={{ min: 1 }}
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
                label="Floor Number"
                type="number"
                value={formData.floorNumber}
                onChange={(e) => handleChange('floorNumber', parseInt(e.target.value) || 1)}
                inputProps={{ min: 1 }}
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
                label="Size (sq ft)"
                type="number"
                value={formData.size}
                onChange={(e) => handleChange('size', parseInt(e.target.value) || 0)}
                inputProps={{ min: 0 }}
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
                label="Total Rooms"
                type="number"
                value={formData.totalRooms}
                onChange={(e) => handleChange('totalRooms', parseInt(e.target.value) || 1)}
                inputProps={{ min: 1 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />
            </Grid>

            {/* Available */}
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.available}
                    onChange={(e) => handleChange('available', e.target.checked)}
                  />
                }
                label="Available"
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              />
            </Grid>

            {/* Image URL */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.imageUrl}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />
            </Grid>

            {/* Amenities */}
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                Amenities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {formData.amenities?.map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    onDelete={() => handleRemoveAmenity(amenity)}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                    }}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
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
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddAmenity}
                  sx={{
                    color: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {COMMON_AMENITIES.filter((a) => !formData.amenities?.includes(a)).map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    onClick={() => {
                      setNewAmenity(amenity);
                      handleAddAmenity();
                    }}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: 'rgba(255, 255, 255, 0.7)',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Grid>

            {/* Additional Images */}
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                Additional Images
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {formData.additionalImages?.map((url) => (
                  <Chip
                    key={url}
                    label={url.substring(0, 30) + '...'}
                    onDelete={() => handleRemoveAdditionalImage(url)}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                    }}
                  />
                ))}
              </Box>
              <TextField
                fullWidth
                size="small"
                placeholder="Add additional image URL"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    handleAddAdditionalImage(input.value);
                    input.value = '';
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' },
            }}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditRoomModal;

