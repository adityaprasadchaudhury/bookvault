import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { useAppTheme, ThemeMode } from '../theme/ThemeContext.tsx';

export const ThemeSelector: React.FC = () => {
  const { themeMode, setThemeMode } = useAppTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
    handleClose();
  };

  const options: { mode: ThemeMode; label: string; sublabel: string; icon: React.ReactElement; color: string }[] = [
    {
      mode: 'classic',
      label: 'Classic Bookstore',
      sublabel: 'Warm amber, parchment & espresso',
      icon: <AutoStoriesIcon sx={{ fontSize: 18 }} />,
      color: '#b45309',
    },
    {
      mode: 'midnight',
      label: 'Midnight Library',
      sublabel: 'Dark ink, gold foil & obsidian',
      icon: <DarkModeOutlinedIcon sx={{ fontSize: 18 }} />,
      color: '#f59e0b',
    },
    {
      mode: 'minimalist',
      label: 'Editorial Minimalist',
      sublabel: 'Clean indigo, crisp & modern',
      icon: <LightModeOutlinedIcon sx={{ fontSize: 18 }} />,
      color: '#2563eb',
    },
  ];

  return (
    <>
      <Tooltip title="Switch Theme (Classic / Midnight / Minimalist)">
        <IconButton
          onClick={handleClick}
          size="small"
          aria-controls={open ? 'theme-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 1,
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover',
            },
          }}
        >
          <PaletteOutlinedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        id="theme-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              mt: 1.5,
              minWidth: 260,
              borderRadius: 3,
              p: 1,
              border: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}>
            THEME &amp; PALETTE
          </Typography>
        </Box>

        {options.map((opt) => {
          const isSelected = themeMode === opt.mode;
          return (
            <MenuItem
              key={opt.mode}
              onClick={() => handleSelect(opt.mode)}
              selected={isSelected}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                py: 1,
                px: 1.5,
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                },
              }}
            >
              <ListItemIcon sx={{ color: opt.color, minWidth: 32 }}>
                {opt.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontWeight: isSelected ? 700 : 500 }}>
                    {opt.label}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                    {opt.sublabel}
                  </Typography>
                }
              />
              {isSelected && <CheckIcon sx={{ fontSize: 16, color: 'primary.main', ml: 1 }} />}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
