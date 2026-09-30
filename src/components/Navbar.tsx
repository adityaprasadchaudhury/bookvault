import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CodeIcon from '@mui/icons-material/Code';
import { useAppDispatch, useAppSelector } from '../store/index.ts';
import { logOut } from '../store/slices/authSlice.ts';
import { useGetPurchasesQuery } from '../store/services/purchaseApi.ts';
import { ThemeSelector } from './ThemeSelector.tsx';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const { data: purchaseData } = useGetPurchasesQuery(undefined, {
    skip: !isAuthenticated,
  });

  const purchaseCount = purchaseData?.total ?? user?.purchasedBookIds?.length ?? 0;

  const handleLogout = () => {
    dispatch(logOut());
    navigate('/');
  };

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1, gap: 2 }}>
          {/* Brand Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #78350f 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(180, 83, 9, 0.3)',
              }}
            >
              <AutoStoriesIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Merriweather", "Georgia", "Cambria", serif',
                  fontWeight: 800,
                  color: 'text.primary',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                BookStore
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'primary.main',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  letterSpacing: '0.08em',
                  display: 'block',
                }}
              >
                CLASSIC &amp; MODERN DIGITAL PRESS
              </Typography>
            </Box>
          </Box>

          {/* Navigation Links & Action Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
            <Button
              component={RouterLink}
              to="/"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                fontSize: '0.88rem',
                display: { xs: 'none', md: 'inline-flex' },
                '&:hover': { color: 'primary.main', backgroundColor: 'transparent' },
              }}
            >
              Curated Catalog
            </Button>

            {/* Standalone HTML/CSS/JS Link */}
            <Tooltip title="View pure HTML, CSS & Vanilla JavaScript edition">
              <Button
                component="a"
                href="/html-css-js/index.html"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                startIcon={<CodeIcon sx={{ fontSize: 16 }} />}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  borderRadius: 2,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'secondary.main',
                  border: '1px dashed',
                  borderColor: 'secondary.main',
                  px: 1.5,
                  py: 0.5,
                  '&:hover': {
                    backgroundColor: 'secondary.light',
                    color: '#ffffff',
                  },
                }}
              >
                HTML/CSS/JS View
              </Button>
            </Tooltip>

            {/* Dynamic Theme Switcher */}
            <ThemeSelector />

            {isAuthenticated ? (
              <>
                <Button
                  component={RouterLink}
                  to="/purchases"
                  startIcon={<LockOutlinedIcon sx={{ fontSize: 18 }} />}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 700,
                    borderColor: 'divider',
                    color: 'text.primary',
                    px: 2,
                    '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
                  }}
                >
                  My Books
                  {purchaseCount > 0 && (
                    <Chip
                      label={purchaseCount}
                      size="small"
                      color="primary"
                      sx={{
                        ml: 1,
                        height: 20,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                      }}
                    />
                  )}
                </Button>

                <Box
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center',
                    gap: 1,
                    backgroundColor: 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider',
                    px: 1.5,
                    py: 0.6,
                    borderRadius: 2,
                  }}
                >
                  <AccountCircleIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {user?.name}
                  </Typography>
                </Box>

                <Tooltip title="Log out">
                  <IconButton
                    onClick={handleLogout}
                    size="small"
                    sx={{
                      color: 'text.secondary',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { color: '#ef4444', borderColor: '#fecaca', backgroundColor: 'rgba(239, 68, 68, 0.08)' },
                    }}
                  >
                    <LogoutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="text"
                  sx={{
                    color: 'text.primary',
                    fontWeight: 600,
                  }}
                >
                  Sign In
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  color="primary"
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                  }}
                >
                  Join Store
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
