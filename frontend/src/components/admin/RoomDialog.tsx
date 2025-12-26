import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  useTheme,
  Typography,
  Alert,
  Grid,
} from '@mui/material';
import { Room } from '../../types';
import { useCreateRoomMutation, useUpdateRoomMutation } from '../../features/rooms/roomsApi';

interface RoomDialogProps {
  open: boolean;
  onClose: () => void;
  room?: Room | null;
  mode: 'add' | 'edit';
  onSuccess?: () => void;
}

const RoomDialog: React.FC<RoomDialogProps> = ({ open, onClose, room, mode, onSuccess }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation();
  const [updateRoom, { isLoading: isUpdating }] = useUpdateRoomMutation();

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    pricePerNight: '',
    capacity: '',
    size: '',
    floorNumber: '',
    totalRooms: '',
    imageUrl: '',
    amenities: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (room && mode === 'edit') {
      setFormData({
        name: room.name,
        type: room.type,
        description: room.description || '',
        pricePerNight: room.pricePerNight.toString(),
        capacity: room.capacity.toString(),
        size: room.size?.toString() || '',
        floorNumber: room.floorNumber?.toString() || '',
        totalRooms: room.totalRooms?.toString() || '1',
        imageUrl: room.imageUrl || '',
        amenities: room.amenities?.join(', ') || '',
      });
    } else {
      // Reset form for add mode
      setFormData({
        name: '',
        type: 'STANDARD',
        description: '',
        pricePerNight: '',
        capacity: '2',
        size: '',
        floorNumber: '1',
        totalRooms: '1',
        imageUrl: '',
        amenities: '',
      });
    }
    setError('');
    setSuccess('');
  }, [room, mode, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || !formData.type || !formData.pricePerNight || !formData.capacity) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // Prepare room data
      const roomData = {
        name: formData.name,
        type: formData.type as Room['type'],
        description: formData.description,
        pricePerNight: parseFloat(formData.pricePerNight),
        capacity: parseInt(formData.capacity),
        size: formData.size ? parseInt(formData.size) : 0,
        floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : 1,
        totalRooms: formData.totalRooms ? parseInt(formData.totalRooms) : 1,
        availableRooms: formData.totalRooms ? parseInt(formData.totalRooms) : 1,
        imageUrl: formData.imageUrl || '',
        additionalImages: [],
        amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
        available: true,
      };

      if (mode === 'add') {
        await createRoom(roomData).unwrap();
        setSuccess('Room added successfully!');
      } else if (room?.id) {
        await updateRoom({ id: room.id, ...roomData }).unwrap();
        setSuccess('Room updated successfully!');
      }

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Close dialog after short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.data?.message || err.message || 'Failed to save room');
    }
  };

  const roomTypes = [
    'STANDARD',
    'DELUXE',
    'SUITE',
    'PRESIDENTIAL',
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: isDarkMode ? 'rgba(26,26,26,0.98)' : 'background.paper',
          border: '1px solid',
          borderColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'divider',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,165,0,0.05) 100%)'
            : 'linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(66,165,245,0.05) 100%)',
          borderBottom: '1px solid',
          borderColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'divider',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: isDarkMode ? '#FFD700' : 'primary.main' }}>
          {mode === 'add' ? 'Add New Room' : 'Edit Room'}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ m: 0, width: '100%', mt: 2 }}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              fullWidth
              required
              label="Room Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Ocean View Suite"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              required
              select
              label="Room Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              {roomTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the room features and ambiance..."
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              type="number"
              label="Price Per Night ($)"
              name="pricePerNight"
              value={formData.pricePerNight}
              onChange={handleChange}
              inputProps={{ min: 0, step: 0.01 }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              type="number"
              label="Guest Capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              inputProps={{ min: 1, max: 10 }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Size (sq ft)"
              name="size"
              value={formData.size}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Floor Number"
              name="floorNumber"
              value={formData.floorNumber}
              onChange={handleChange}
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Total Rooms"
              name="totalRooms"
              value={formData.totalRooms}
              onChange={handleChange}
              inputProps={{ min: 1 }}
              helperText="Inventory count"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Image URL"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/room-image.jpg"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Amenities"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              placeholder="WiFi, Air Conditioning, Mini Bar, Safe (comma separated)"
              helperText="Separate amenities with commas"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'divider',
        }}
      >
        <Button
          onClick={onClose}
          disabled={isCreating || isUpdating}
          sx={{
            color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isCreating || isUpdating}
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
          {isCreating || isUpdating
            ? 'Saving...'
            : mode === 'add'
            ? 'Add Room'
            : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomDialog;
