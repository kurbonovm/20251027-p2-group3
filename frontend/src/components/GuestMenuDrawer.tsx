import React, { useState } from 'react';
import {
  Menu,
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';

interface GuestMenuDrawerProps {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

/**
 * Guest Menu Dropdown component - appears below hamburger icon
 * Displays promotional card, menu items, and login/signup action
 */
const GuestMenuDrawer: React.FC<GuestMenuDrawerProps> = ({ open, onClose, anchorEl }) => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleLoginSignup = () => {
    onClose();
    setAuthModalOpen(true);
  };

  const handleAboutUs = () => {
    onClose();
    navigate('/about');
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 320,
            maxWidth: '90vw',
            backgroundColor: '#000000',
            color: '#ffffff',
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Promotional Card: Become a Guest */}
          <Card
            sx={{
              backgroundColor: '#1a1a1a',
              borderRadius: 2,
              mb: 2,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#252525',
              },
            }}
            onClick={() => {
              onClose();
              navigate('/register');
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      color: '#ffffff',
                      mb: 0.5,
                      fontSize: '0.95rem',
                    }}
                  >
                    Become a Guest
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      lineHeight: 1.5,
                      fontSize: '0.8rem',
                    }}
                  >
                    It's very comfy to room with Luxe.
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    flexShrink: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}
                >
                  🍺
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <List sx={{ p: 0, mb: 2 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleAboutUs}
                sx={{
                  backgroundColor: '#1a1a1a',
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#252525',
                  },
                }}
              >
                <ListItemText
                  primary="About Us"
                  primaryTypographyProps={{
                    sx: {
                      color: '#ffffff',
                      fontWeight: 500,
                      fontSize: '0.9rem',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>

          {/* Log in or sign up Action */}
          <Card
            sx={{
              backgroundColor: '#1a1a1a',
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#252525',
              },
            }}
            onClick={handleLoginSignup}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#1976d2',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                Log in or sign up
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Menu>

      {/* Authentication Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab="login"
      />
    </>
  );
};

export default GuestMenuDrawer;

