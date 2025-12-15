import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { Star, Pool, Business, Spa, ArrowForward } from '@mui/icons-material';

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const categories: Category[] = [
  { id: 'popular', label: 'Popular', icon: <Star /> },
  { id: 'pools', label: 'Pools', icon: <Pool /> },
  { id: 'suites', label: 'Suites', icon: <Business /> },
  { id: 'spa', label: 'Spa', icon: <Spa /> },
];

/**
 * Category Filters component
 */
const CategoryFilters: React.FC<{ selectedCategory?: string; onCategoryChange?: (category: string) => void }> = ({
  selectedCategory = 'popular',
  onCategoryChange,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        px: { xs: 2, sm: 3 },
        mb: 3,
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        scrollbarWidth: 'none',
      }}
    >
      {categories.map((category) => (
        <Box
          key={category.id}
          onClick={() => onCategoryChange?.(category.id)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            minWidth: 80,
          }}
        >
          <IconButton
            sx={{
              width: 56,
              height: 56,
              backgroundColor: selectedCategory === category.id ? '#1976d2' : 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: selectedCategory === category.id ? '#1565c0' : 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            {category.icon}
          </IconButton>
          <Typography
            variant="caption"
            sx={{
              color: selectedCategory === category.id ? '#1976d2' : 'rgba(255, 255, 255, 0.7)',
              fontWeight: selectedCategory === category.id ? 600 : 400,
              textAlign: 'center',
              borderBottom: selectedCategory === category.id ? '2px solid #1976d2' : '2px solid transparent',
              pb: 0.5,
            }}
          >
            {category.label}
          </Typography>
        </Box>
      ))}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          minWidth: 80,
        }}
      >
        <IconButton
          sx={{
            width: 56,
            height: 56,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          <ArrowForward />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CategoryFilters;

