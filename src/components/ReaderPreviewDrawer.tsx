import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import DownloadIcon from '@mui/icons-material/Download';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { Book } from '../types/index.ts';

interface ReaderPreviewDrawerProps {
  open: boolean;
  book: Book | null;
  isPurchased?: boolean;
  onClose: () => void;
  onBuyNow: (book: Book) => void;
  onDownload: (book: Book) => void;
}

export const ReaderPreviewDrawer: React.FC<ReaderPreviewDrawerProps> = ({
  open,
  book,
  isPurchased,
  onClose,
  onBuyNow,
  onDownload,
}) => {
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('sepia');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');

  if (!book) return null;

  const themeStyles = {
    light: { bg: '#ffffff', text: '#1e293b', border: '#e2e8f0', meta: '#64748b' },
    sepia: { bg: '#faf6ee', text: '#2d241e', border: '#e7ded0', meta: '#786857' },
    dark: { bg: '#0f172a', text: '#e2e8f0', border: '#1e293b', meta: '#94a3b8' },
  }[theme];

  const fontSizeMap = {
    sm: { body: '0.92rem', title: '1.25rem', heading: '1.05rem', line: 1.7 },
    md: { body: '1.05rem', title: '1.45rem', heading: '1.2rem', line: 1.85 },
    lg: { body: '1.2rem', title: '1.65rem', heading: '1.35rem', line: 2.0 },
  }[fontSize];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 540, md: 620 },
            backgroundColor: themeStyles.bg,
            color: themeStyles.text,
            transition: 'background-color 0.2s ease, color 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* Drawer Header & Reader Controls */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: `1px solid ${themeStyles.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoStoriesIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: '0.04em' }}>
            CHAPTER 1 EXCERPT PREVIEW
          </Typography>
        </Box>

        {/* Reader Customization Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Theme Switcher */}
          <ToggleButtonGroup
            value={theme}
            exclusive
            size="small"
            onChange={(_, val) => val && setTheme(val)}
            sx={{ height: 28 }}
          >
            <ToggleButton value="light" title="Light reading theme">
              <LightModeOutlinedIcon sx={{ fontSize: 14 }} />
            </ToggleButton>
            <ToggleButton value="sepia" title="Sepia warm theme">
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                Sepia
              </Typography>
            </ToggleButton>
            <ToggleButton value="dark" title="Dark obsidian theme">
              <DarkModeOutlinedIcon sx={{ fontSize: 14 }} />
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Font Size Adjuster */}
          <ToggleButtonGroup
            value={fontSize}
            exclusive
            size="small"
            onChange={(_, val) => val && setFontSize(val)}
            sx={{ height: 28 }}
          >
            <ToggleButton value="sm" title="Small font">
              <FormatSizeIcon sx={{ fontSize: 13 }} />
            </ToggleButton>
            <ToggleButton value="md" title="Default font">
              <FormatSizeIcon sx={{ fontSize: 16 }} />
            </ToggleButton>
            <ToggleButton value="lg" title="Large font">
              <FormatSizeIcon sx={{ fontSize: 19 }} />
            </ToggleButton>
          </ToggleButtonGroup>

          <IconButton onClick={onClose} size="small" sx={{ color: themeStyles.meta }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Reader Scrollable Content */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 3, md: 5 } }}>
        <Typography variant="caption" sx={{ color: themeStyles.meta, letterSpacing: '0.1em', fontWeight: 700 }}>
          {book.category.toUpperCase()} • FIRST EDITION
        </Typography>

        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Georgia, Cambria, serif',
            fontWeight: 800,
            fontSize: fontSizeMap.title,
            mt: 1,
            mb: 0.5,
            lineHeight: 1.25,
          }}
        >
          {book.title}
        </Typography>

        <Typography variant="subtitle2" sx={{ color: themeStyles.meta, mb: 3 }}>
          By {book.author} • {book.pages} Pages
        </Typography>

        <Divider sx={{ borderColor: themeStyles.border, my: 3 }} />

        {/* Chapter 1 Excerpt Content */}
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Georgia, Cambria, serif',
            fontWeight: 700,
            fontSize: fontSizeMap.heading,
            mb: 2,
            color: 'primary.main',
          }}
        >
          Chapter 1: Foundational Principles &amp; Mental Models
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Georgia, Cambria, serif',
            fontSize: fontSizeMap.body,
            lineHeight: fontSizeMap.line,
            mb: 2.5,
          }}
        >
          Software engineering and architecture are grounded in clear boundaries and repeatable abstractions. In this
          collector's volume, {book.author} demonstrates why modern practitioners must prioritize decoupled design,
          testability, and deterministic failure isolation.
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Georgia, Cambria, serif',
            fontSize: fontSizeMap.body,
            lineHeight: fontSizeMap.line,
            mb: 2.5,
          }}
        >
          When designing high-leverage distributed systems, the most costly mistakes are rarely algorithmic. Instead,
          they stem from implicit coupling, tangled dependencies, and premature optimizations that obscure domain
          boundaries.
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Georgia, Cambria, serif',
            fontSize: fontSizeMap.body,
            lineHeight: fontSizeMap.line,
            mb: 2.5,
          }}
        >
          By establishing strict invariants at the system perimeter, organizations achieve predictability, zero-downtime
          evolution, and sustainable velocity across quarters. Every component should possess a solitary, well-defined
          reason to change.
        </Typography>

        <Box
          sx={{
            p: 3,
            my: 4,
            borderLeft: '3px solid #2563eb',
            backgroundColor: theme === 'dark' ? '#1e293b' : theme === 'sepia' ? '#f4eedf' : '#f8fafc',
            borderRadius: '0 8px 8px 0',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontStyle: 'italic',
              fontFamily: 'Georgia, Cambria, serif',
              color: themeStyles.text,
              lineHeight: 1.7,
            }}
          >
            "{book.description}"
          </Typography>
        </Box>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Georgia, Cambria, serif',
            fontSize: fontSizeMap.body,
            lineHeight: fontSizeMap.line,
            mb: 2.5,
          }}
        >
          Moving from prototypes to enterprise production requires defensive engineering across every layer: validating
          inputs early at API borders, cryptographically verifying state signatures, and enforcing strict authorization
          checks for all digital asset streaming.
        </Typography>
      </Box>

      {/* Drawer Footer CTA */}
      <Box
        sx={{
          p: 2.5,
          borderTop: `1px solid ${themeStyles.border}`,
          backgroundColor: theme === 'dark' ? '#090d16' : theme === 'sepia' ? '#f3ece0' : '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="caption" sx={{ color: themeStyles.meta, display: 'block', fontWeight: 600 }}>
            {isPurchased ? 'OWNED' : 'DRM-FREE MONOGRAPH'}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: themeStyles.text, lineHeight: 1 }}>
            ₹{book.price.toFixed(2)}
          </Typography>
        </Box>

        {isPurchased ? (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DownloadIcon />}
            onClick={() => onDownload(book)}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Download Complete PDF
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            startIcon={<ShoppingBagIcon />}
            onClick={() => {
              onClose();
              onBuyNow(book);
            }}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Own Complete Volume
          </Button>
        )}
      </Box>
    </Drawer>
  );
};
