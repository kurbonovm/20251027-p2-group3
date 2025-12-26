import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Grid,
  Stack,
  Divider,
  useTheme,
  Avatar,
} from '@mui/material';
import {
  People as PeopleIcon,
  AspectRatio as SizeIcon,
  Stairs as StairsIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { Room } from '../../types';

interface RoomDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  room: Room | null;
  occupiedCount?: number;
}

const RoomDetailsDialog: React.FC<RoomDetailsDialogProps> = ({
  open,
  onClose,
  room,
  occupiedCount = 0,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  if (!room) return null;

  const totalRooms = room.totalRooms || 1;
  const availableCount = totalRooms - occupiedCount;
  const occupancyRate = ((occupiedCount / totalRooms) * 100).toFixed(0);

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
          pb: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            src={room.imageUrl || 'https://via.placeholder.com/64'}
            variant="rounded"
            sx={{ width: 64, height: 64 }}
          />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: isDarkMode ? '#FFD700' : 'primary.main' }}>
              {room.name}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip
                label={room.type}
                size="small"
                sx={{
                  backgroundColor: isDarkMode ? 'rgba(255,215,0,0.1)' : 'rgba(25,118,210,0.1)',
                  color: isDarkMode ? '#FFD700' : 'primary.main',
                  fontWeight: 600,
                }}
              />
              <Chip
                label={availableCount > 0 ? `${availableCount} Available` : 'Fully Occupied'}
                size="small"
                sx={{
                  backgroundColor: availableCount > 0 ? 'rgba(46,125,50,0.1)' : 'rgba(211,47,47,0.1)',
                  color: availableCount > 0 ? '#4caf50' : '#f44336',
                  border: '1px solid',
                  borderColor: availableCount > 0 ? 'rgba(46,125,50,0.3)' : 'rgba(211,47,47,0.3)',
                  fontWeight: 600,
                }}
              />
            </Stack>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        {/* Room Image */}
        {room.imageUrl && (
          <Box
            component="img"
            src={room.imageUrl}
            alt={room.name}
            sx={{
              width: '100%',
              height: 300,
              objectFit: 'cover',
              borderRadius: 2,
              mb: 3,
            }}
          />
        )}

        {/* Description */}
        {room.description && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: isDarkMode ? '#FFD700' : 'primary.main', mb: 1 }}>
              Description
            </Typography>
            <Typography variant="body1" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'text.primary' }}>
              {room.description}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 3, borderColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'divider' }} />

        {/* Room Details Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    background: isDarkMode
                      ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                      : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MoneyIcon sx={{ color: '#fff', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
                    Price Per Night
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: isDarkMode ? '#fff' : '#1a1a1a' }}>
                    ${room.pricePerNight}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    background: isDarkMode
                      ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                      : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PeopleIcon sx={{ color: '#fff', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
                    Guest Capacity
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: isDarkMode ? '#fff' : '#1a1a1a' }}>
                    {room.capacity} Guests
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    background: isDarkMode
                      ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                      : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SizeIcon sx={{ color: '#fff', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
                    Room Size
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: isDarkMode ? '#fff' : '#1a1a1a' }}>
                    {room.size || 'N/A'} sq ft
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    background: isDarkMode
                      ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                      : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <StairsIcon sx={{ color: '#fff', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
                    Floor Number
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: isDarkMode ? '#fff' : '#1a1a1a' }}>
                    Floor {room.floorNumber || 'N/A'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    background: isDarkMode
                      ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                      : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <InventoryIcon sx={{ color: '#fff', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
                    Inventory
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: isDarkMode ? '#fff' : '#1a1a1a' }}>
                    {totalRooms} Total / {occupiedCount} Occupied
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    background: `linear-gradient(135deg, ${
                      parseInt(occupancyRate) > 75 ? '#f44336' : parseInt(occupancyRate) > 50 ? '#ff9800' : '#4caf50'
                    } 0%, ${
                      parseInt(occupancyRate) > 75 ? '#d32f2f' : parseInt(occupancyRate) > 50 ? '#f57c00' : '#388e3c'
                    } 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
                    {occupancyRate}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
                    Occupancy Rate
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color:
                        parseInt(occupancyRate) > 75
                          ? '#f44336'
                          : parseInt(occupancyRate) > 50
                          ? '#ff9800'
                          : '#4caf50',
                    }}
                  >
                    {occupancyRate}%
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <>
            <Divider sx={{ my: 3, borderColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'divider' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: isDarkMode ? '#FFD700' : 'primary.main', mb: 2 }}>
                Amenities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {room.amenities.map((amenity, index) => (
                  <Chip
                    key={index}
                    icon={<CheckIcon sx={{ color: isDarkMode ? '#FFD700 !important' : 'primary.main' }} />}
                    label={amenity}
                    sx={{
                      backgroundColor: isDarkMode ? 'rgba(255,215,0,0.1)' : 'rgba(25,118,210,0.1)',
                      color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'text.primary',
                      border: '1px solid',
                      borderColor: isDarkMode ? 'rgba(255,215,0,0.3)' : 'rgba(25,118,210,0.3)',
                    }}
                  />
                ))}
              </Box>
            </Box>
          </>
        )}

        {/* Additional Images */}
        {room.additionalImages && room.additionalImages.length > 0 && (
          <>
            <Divider sx={{ my: 3, borderColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'divider' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: isDarkMode ? '#FFD700' : 'primary.main', mb: 2 }}>
                Additional Images
              </Typography>
              <Grid container spacing={2}>
                {room.additionalImages.map((img, index) => (
                  <Grid item xs={6} sm={4} key={index}>
                    <Box
                      component="img"
                      src={img}
                      alt={`${room.name} ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 2,
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}
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
          variant="contained"
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
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomDetailsDialog;
