import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  People,
  AspectRatio,
  Stairs,
} from '@mui/icons-material';
import { useGetRoomByIdQuery } from '../features/rooms/roomsApi';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import Loading from '../components/Loading';

/**
 * Room details page component
 * @returns {React.ReactNode} The room details page
 */
const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const { data: room, isLoading, error } = useGetRoomByIdQuery(id);

  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    navigate('/booking', {
      state: {
        room,
        checkInDate,
        checkOutDate,
        guests,
      },
    });
  };

  if (isLoading) return <Loading message="Loading room details..." />;

  if (error) {
    return (
      <Container>
        <Alert severity="error">Failed to load room details. Please try again.</Alert>
      </Container>
    );
  }

  if (!room) {
    return (
      <Container>
        <Alert severity="error">Room not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <CardMedia
              component="img"
              height="400"
              image={room.imageUrl || 'https://via.placeholder.com/600x400?text=Room+Image'}
              alt={room.name}
              sx={{ borderRadius: 2, mb: 2 }}
            />

            {room.additionalImages && room.additionalImages.length > 0 && (
              <Grid container spacing={1}>
                {room.additionalImages.map((img, index) => (
                  <Grid item xs={4} key={index}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={img}
                      alt={`${room.name} ${index + 1}`}
                      sx={{ borderRadius: 1 }}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>

          <Grid item xs={12} md={5}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>
                {room.name}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Chip label={room.type} color="primary" sx={{ mr: 1 }} />
                {room.available ? (
                  <Chip label="Available" color="success" />
                ) : (
                  <Chip label="Not Available" color="error" />
                )}
              </Box>

              <Typography variant="h5" color="primary" gutterBottom>
                ${room.pricePerNight} / night
              </Typography>

              <Typography variant="body1" color="text.secondary" paragraph>
                {room.description}
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <People />
                  </ListItemIcon>
                  <ListItemText primary={`Capacity: ${room.capacity} guests`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AspectRatio />
                  </ListItemIcon>
                  <ListItemText primary={`Size: ${room.size} sq ft`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Stairs />
                  </ListItemIcon>
                  <ListItemText primary={`Floor: ${room.floorNumber}`} />
                </ListItem>
              </List>

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Amenities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {room.amenities?.map((amenity, index) => (
                  <Chip
                    key={index}
                    icon={<CheckCircle />}
                    label={amenity}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>

              <Box component="form" sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Check-in Date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                />
                <TextField
                  fullWidth
                  type="date"
                  label="Check-out Date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                  inputProps={{ min: checkInDate || new Date().toISOString().split('T')[0] }}
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Number of Guests"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  inputProps={{ min: 1, max: room.capacity }}
                  sx={{ mb: 3 }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleBookNow}
                  disabled={!room.available || !checkInDate || !checkOutDate}
                >
                  {isAuthenticated ? 'Book Now' : 'Login to Book'}
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default RoomDetails;
