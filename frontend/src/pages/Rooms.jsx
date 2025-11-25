import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGetRoomsQuery } from '../features/rooms/roomsApi';

/**
 * Rooms page component to browse available rooms
 * @returns {React.ReactNode} The rooms page
 */
const Rooms = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    roomType: '',
    minPrice: '',
    maxPrice: '',
  });

  const { data: rooms, isLoading, error } = useGetRoomsQuery(filters);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Presidential'];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">Failed to load rooms. Please try again later.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" component="h1" gutterBottom>
        Browse Rooms
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="Room Type"
              name="roomType"
              value={filters.roomType}
              onChange={handleFilterChange}
            >
              <MenuItem value="">All Types</MenuItem>
              {roomTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="number"
              label="Min Price"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="number"
              label="Max Price"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </Grid>
        </Grid>
      </Box>

      {rooms && rooms.length === 0 ? (
        <Alert severity="info">No rooms found matching your criteria.</Alert>
      ) : (
        <Grid container spacing={3}>
          {rooms?.map((room) => (
            <Grid item xs={12} sm={6} md={4} key={room.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={room.imageUrl || 'https://via.placeholder.com/300x200?text=Room+Image'}
                  alt={room.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {room.name}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip label={room.type} color="primary" size="small" sx={{ mr: 1 }} />
                    <Chip label={`${room.capacity} Guests`} size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {room.description}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${room.pricePerNight} / night
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Amenities: {room.amenities?.join(', ') || 'N/A'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/rooms/${room.id}`)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Rooms;
