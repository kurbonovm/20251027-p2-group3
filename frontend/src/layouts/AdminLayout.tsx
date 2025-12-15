import React from 'react';
import { Container, Box } from '@mui/material';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * AdminLayout component - navigation is now in AdminHeader
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {

  return (
    <Container maxWidth="xl">
      {/* Navigation is now in AdminHeader, so we just render the children */}
      <Box>{children}</Box>
    </Container>
  );
};

export default AdminLayout;
