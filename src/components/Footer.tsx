import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 6,
        backgroundColor: '#090d16',
        color: '#94a3b8',
        borderTop: '1px solid #1e293b',
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 4,
            mb: 4,
          }}
        >
          {/* Brand Info */}
          <Box sx={{ maxWidth: 420 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  backgroundColor: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f8fafc',
                }}
              >
                <AutoStoriesIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                BookStore
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
              An independent online technical bookstore and digital library. Handcrafted digital collector's editions
              with permanent cryptographic licenses and zero telemetry.
            </Typography>
          </Box>

          {/* Privacy and Trust Indicators */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 3, md: 6 } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
              <LockOutlinedIcon sx={{ color: '#60a5fa', fontSize: 18, mt: 0.2 }} />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#e2e8f0', display: 'block' }}>
                  Reader Privacy Guarantee
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Zero tracking, no analytics telemetry
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
              <VerifiedUserOutlinedIcon sx={{ color: '#34d399', fontSize: 18, mt: 0.2 }} />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#e2e8f0', display: 'block' }}>
                  DRM-Free PDF Ownership
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Direct lifetime offline reading
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            pt: 3,
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: '#475569' }}>
            © {new Date().getFullYear()} BookStore. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Link href="/" underline="hover" sx={{ color: '#64748b', fontSize: '0.75rem', '&:hover': { color: '#94a3b8' } }}>
              Library Catalog
            </Link>
            <Link href="/purchases" underline="hover" sx={{ color: '#64748b', fontSize: '0.75rem', '&:hover': { color: '#94a3b8' } }}>
              My Books
            </Link>
            <Link href="/html-css-js/index.html" target="_blank" rel="noopener noreferrer" underline="hover" sx={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600, '&:hover': { color: '#fbbf24' } }}>
              HTML/CSS/JS Edition ⚡
            </Link>
            <Link href="/" underline="hover" sx={{ color: '#64748b', fontSize: '0.75rem', '&:hover': { color: '#94a3b8' } }}>
              Privacy &amp; Terms
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
