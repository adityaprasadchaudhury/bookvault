import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Box, Typography, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

export const NotFoundPage: React.FC = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
      <Typography variant="h1" sx={{ fontWeight: 900, color: 'primary.main', fontSize: '6rem', mb: 1 }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
        The page or book resource you were looking for does not exist or has been relocated.
      </Typography>
      <Button variant="contained" color="primary" component={RouterLink} to="/" startIcon={<HomeIcon />}>
        Return to Catalog
      </Button>
    </Container>
  );
};
