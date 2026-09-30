import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import { Book } from '../types/index.ts';
import { useAppSelector } from '../store/index.ts';
import { downloadPurchasedBook } from '../utils/downloadHelper.ts';

interface BookCardProps {
  book: Book;
  onBuyNow: (book: Book) => void;
  onPreviewExcerpt?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onBuyNow, onPreviewExcerpt }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [downloading, setDownloading] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ severity: 'error' | 'success'; message: string } | null>(null);

  // Check if book is purchased by current user
  const isPurchased =
    book.isPurchased ||
    (user?.purchasedBookIds && user.purchasedBookIds.includes(book.id));

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setDownloading(true);
    const res = await downloadPurchasedBook(book.id, book.title);
    setDownloading(false);

    if (res.success) {
      setAlertInfo({ severity: 'success', message: `Downloaded "${book.title}" successfully.` });
    } else {
      setAlertInfo({ severity: 'error', message: res.error || 'Failed to download book.' });
    }
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/books/${book.id}` } });
      return;
    }
    onBuyNow(book);
  };

  const handleExcerptClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPreviewExcerpt) {
      onPreviewExcerpt(book);
    } else {
      navigate(`/books/${book.id}`);
    }
  };

  return (
    <>
      <Card
        className="book-cover-effect"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          borderRadius: 3,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: 'var(--book-card-hover-shadow)',
            borderColor: 'primary.main',
          },
        }}
        onClick={() => navigate(`/books/${book.id}`)}
      >
        {/* Realistic Book Cover Presentation with physical lighting */}
        <Box
          sx={{
            position: 'relative',
            pt: '130%',
            overflow: 'hidden',
            backgroundColor: '#090d16',
            perspective: 800,
          }}
        >
          <span className="book-spine-accent"></span>
          <CardMedia
            component="img"
            image={book.coverImage}
            alt={book.title}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          />

          {/* Owned Indicator Ribbon */}
          {isPurchased && (
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 0.6,
                backgroundColor: 'rgba(240, 253, 244, 0.95)',
                color: '#15803d',
                px: 1.2,
                py: 0.4,
                borderRadius: 1.5,
                border: '1px solid #bbf7d0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 14, color: '#16a34a' }} />
              <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.7rem' }}>
                OWNED
              </Typography>
            </Box>
          )}
        </Box>

        {/* Book Details */}
        <CardContent sx={{ flexGrow: 1, p: 2.5, pb: 1 }}>
          {/* Unboxed Metadata (Zero-Pill discipline) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, textTransform: 'uppercase', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
              {book.category}
            </Typography>
            <Typography variant="caption" sx={{ color: '#cbd5e1' }}>•</Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
              {book.pages} pgs
            </Typography>
          </Box>

          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 800,
              fontSize: '1.08rem',
              lineHeight: 1.3,
              mb: 0.6,
              color: 'text.primary',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.6em',
            }}
          >
            {book.title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.82rem',
              mb: 1.5,
            }}
          >
            {book.author}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2,
            }}
          >
            {book.description}
          </Typography>

          {/* Pricing Row */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mt: 'auto', pt: 1 }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                LIFETIME LICENSE
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 800, lineHeight: 1 }}>
                ₹{book.price.toFixed(2)}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700, fontSize: '0.72rem' }}>
              DRM-FREE PDF
            </Typography>
          </Box>
        </CardContent>

        {/* Actions */}
        <CardActions sx={{ p: 2, pt: 0.5, gap: 1 }}>
          <Button
            size="small"
            variant="text"
            startIcon={<AutoStoriesOutlinedIcon fontSize="small" />}
            onClick={handleExcerptClick}
            sx={{ flex: 1, color: '#475569', fontSize: '0.78rem', '&:hover': { backgroundColor: '#f1f5f9' } }}
          >
            Preview
          </Button>

          {isPurchased ? (
            <Button
              size="small"
              variant="contained"
              color="secondary"
              startIcon={downloading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon fontSize="small" />}
              onClick={handleDownload}
              disabled={downloading}
              sx={{ flex: 1.3, fontWeight: 700, fontSize: '0.8rem' }}
            >
              {downloading ? '...' : 'Download'}
            </Button>
          ) : (
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<ShoppingBagIcon fontSize="small" />}
              onClick={handleBuyClick}
              sx={{ flex: 1.3, fontWeight: 700, fontSize: '0.8rem' }}
            >
              Buy Now
            </Button>
          )}
        </CardActions>
      </Card>

      <Snackbar
        open={!!alertInfo}
        autoHideDuration={4000}
        onClose={() => setAlertInfo(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {alertInfo ? (
          <Alert severity={alertInfo.severity} onClose={() => setAlertInfo(null)} sx={{ width: '100%' }}>
            {alertInfo.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
};
