import React from 'react';
import { Card, CardMedia, Box, Typography, IconButton, Chip } from '@mui/material';
import { FavoriteBorder, Star } from '@mui/icons-material';
import { Room, RoomType } from '../types';
import { useNavigate } from 'react-router-dom';

/**
 * Get high-quality room image based on room type and name
 * Uses Unsplash images that match the screenshot descriptions
 */
const getRoomImage = (type: RoomType, name: string | null | undefined): string => {
  // Always use type-based images for consistency - high-quality Unsplash images
  // All images use w=800&h=480&fit=crop&q=90 for consistent dimensions
  const typeImages: Record<RoomType, string> = {
    PRESIDENTIAL: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=480&fit=crop&q=90',
    SUITE: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=480&fit=crop&q=90',
    DELUXE: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=480&fit=crop&q=90',
    STANDARD: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=480&fit=crop&q=90',
  };

  // Map room types and names to high-quality Unsplash images matching screenshot
  const imageMap: Record<string, string> = {
    // Presidential Suite - modern living room with dark green accent wall
    'presidential': typeImages.PRESIDENTIAL,
    'presidential suite': typeImages.PRESIDENTIAL,
    
    // Alpine Lodge Room - cozy bedroom with light wooden walls
    'alpine': typeImages.STANDARD,
    'lodge': typeImages.STANDARD,
    'mountain': typeImages.STANDARD,
    
    // Urban Loft - modern workspace with dark green accent wall
    'urban': typeImages.DELUXE,
    'loft': typeImages.DELUXE,
    'city': typeImages.DELUXE,
    
    // Garden Terrace - bedroom with glass door to terrace with pool
    'garden': typeImages.SUITE,
    'terrace': typeImages.SUITE,
    'poolside': typeImages.SUITE,
    
    // Skyline Penthouse - luxurious bedroom with city skyline view
    'penthouse': typeImages.PRESIDENTIAL,
    'skyline': typeImages.PRESIDENTIAL,
    'downtown': typeImages.PRESIDENTIAL,
  };

  // Handle null or undefined name
  if (!name) {
    return typeImages[type] || typeImages.STANDARD;
  }

  const nameLower = name.toLowerCase();
  for (const [key, imageUrl] of Object.entries(imageMap)) {
    if (nameLower.includes(key)) {
      return imageUrl;
    }
  }

  // Return type-based image as default
  return typeImages[type] || typeImages.STANDARD;
};

interface RoomCardProps {
  room: Room;
}

/**
 * Room Card component matching the screenshot design
 */
const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const navigate = useNavigate();

  // Generate a consistent rating based on room ID for demo purposes
  // This handles different ID formats (MongoDB ObjectIds, numeric IDs, etc.)
  const generateRating = (id: string): string => {
    // Convert the entire ID string to a numeric value using a simple hash
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Use absolute value and modulo to get a value between 0-9
    const seed = Math.abs(hash) % 10;
    // Generate rating between 4.0 and 4.9
    const ratingValue = 4.0 + (seed * 0.1);
    return ratingValue.toFixed(2);
  };

  const rating = generateRating(room.id);

  // Mock badges - show badge for certain room types
  const badges = ['Guest favorite', 'New'];
  const showBadge = room.type === 'PRESIDENTIAL' || room.type === 'SUITE';
  const badgeLabel = room.type === 'PRESIDENTIAL' ? 'Guest favorite' : room.type === 'SUITE' ? 'New' : badges[0];

  return (
    <Card
      onClick={() => navigate(`/rooms/${room.id}`)}
      sx={{
        backgroundColor: 'transparent',
        boxShadow: 'none',
        cursor: 'pointer',
        borderRadius: 2,
        overflow: 'hidden',
        '&:hover': {
          transform: 'scale(1.02)',
          transition: 'transform 0.2s',
        },
      }}
    >
      <Box sx={{ position: 'relative', width: '100%' }}>
        <CardMedia
          component="img"
          image={
            room.imageUrl && room.imageUrl.trim() !== ''
              ? room.imageUrl
              : getRoomImage(room.type, room.name)
          }
          alt={room.name}
          onError={(e) => {
            // Fallback if image fails to load
            const target = e.target as HTMLImageElement;
            if (target.src !== getRoomImage(room.type, room.name)) {
              target.src = getRoomImage(room.type, room.name);
            } else {
              // Ultimate fallback
              target.src = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=480&fit=crop&q=90';
            }
          }}
          sx={{
            borderRadius: 2,
            objectFit: 'cover',
            width: '100%',
            aspectRatio: '4/3',
            maxHeight: { xs: 200, md: 200 },
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            display: 'block',
          }}
        />
        {showBadge && (
          <Chip
            label={badgeLabel}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: '#1976d2',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        )}
        <IconButton
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            // Handle favorite
          }}
        >
          <FavoriteBorder />
        </IconButton>
      </Box>

      <Box sx={{ mt: 1.5, px: 0.5 }}>
        <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 500, mb: 0.5, fontSize: '0.9rem' }}>
          {room.name}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Star sx={{ fontSize: 14, color: '#1976d2' }} />
            <Typography variant="caption" sx={{ color: '#ffffff', fontSize: '0.75rem' }}>
              {rating}
            </Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 500, fontSize: '0.9rem' }}>
            ${room.pricePerNight}
            <Typography component="span" variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', ml: 0.25, fontSize: '0.7rem' }}>
              /night
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default RoomCard;

