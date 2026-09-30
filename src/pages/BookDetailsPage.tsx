import React, { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Grid,
  Button,
  Divider,
  Paper,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DownloadIcon from '@mui/icons-material/Download';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { useGetBookByIdQuery } from '../store/services/bookApi.ts';
import { useAppSelector } from '../store/index.ts';
import { PaymentModal } from '../components/PaymentModal.tsx';
import { ReaderPreviewDrawer } from '../components/ReaderPreviewDrawer.tsx';
import { downloadPurchasedBook } from '../utils/downloadHelper.ts';

export const BookDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const { data, isLoading, isError, error, refetch } = useGetBookByIdQuery(id || '', {
    skip: !id,
  });

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ severity: 'error' | 'success'; message: string } | null>(null);

  const book = data?.book;

  // Check if book is purchased by current user
  const isPurchased =
    book?.isPurchased ||
    (book && user?.purchasedBookIds && user.purchasedBookIds.includes(book.id));

  const handleDownload = async () => {
    if (!book) return;
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

  const handleBuyClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/books/${id}` } });
      return;
    }
    setPaymentOpen(true);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 12, textAlign: 'center' }}>
        <CircularProgress size={44} />
        <Typography variant="body1" sx={{ mt: 2, color: '#64748b' }}>
          Opening monograph vault...
        </Typography>
      </Container>
    );
  }

  if (isError || !book) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {(error as any)?.data?.error || 'Book not found or failed to load.'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} component={RouterLink} to="/">
          Return to Library
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 5, pb: 12 }}>
      <Container maxWidth="lg">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 4, color: '#64748b' }}
        >
          <Link component={RouterLink} to="/" underline="hover" color="inherit">
            Library
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>
            {book.title}
          </Typography>
        </Breadcrumbs>

        <Grid container spacing={6}>
          {/* Left Column: Large Book Cover with Realistic Depth */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                position: 'sticky',
                top: 96,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Box
                component="img"
                src={book.coverImage}
                alt={book.title}
                sx={{
                  width: '100%',
                  maxWidth: 380,
                  borderRadius: 3,
                  boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(0,0,0,0.06)',
                  mb: 3,
                }}
              />

              {/* Book Metadata Quick Panel */}
              <Paper
                variant="outlined"
                sx={{
                  width: '100%',
                  maxWidth: 380,
                  p: 3,
                  borderRadius: 2.5,
                  backgroundColor: '#ffffff',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: '#0f172a' }}>
                  Publication Specifications
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Category:
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {book.category}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Volume Length:
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {book.pages} pages
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Language:
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {book.language}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      ISBN:
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>
                      {book.isbn}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Format Rights:
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                      DRM-Free Offline PDF
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Grid>

          {/* Right Column: Title, Synopsis & Purchase / Download actions */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box>
              {/* Unboxed discipline metadata */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, textTransform: 'uppercase', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '0.08em' }}>
                  {book.category}
                </Typography>
                <Typography variant="caption" sx={{ color: '#cbd5e1' }}>•</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  FIRST EDITION MONOGRAPH
                </Typography>
              </Box>

              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontFamily: 'Georgia, Cambria, serif',
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.2,
                  mb: 1.5,
                  fontSize: { xs: '1.8rem', sm: '2.4rem' },
                }}
              >
                {book.title}
              </Typography>

              <Typography variant="h6" sx={{ color: '#475569', fontWeight: 500, mb: 3 }}>
                By <strong style={{ color: '#0f172a' }}>{book.author}</strong>
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Purchase / Ownership Card */}
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: 3,
                  border: isPurchased ? '2px solid #86efac' : '1px solid #e2e8f0',
                  backgroundColor: isPurchased ? '#f0fdf4' : '#ffffff',
                  mb: 4,
                }}
              >
                {isPurchased ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CheckCircleIcon color="success" sx={{ fontSize: 30 }} />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#14532d', lineHeight: 1.2 }}>
                          You Own This Volume
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#166534' }}>
                          Lifetime DRM-free personal license active on your account.
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      startIcon={
                        downloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />
                      }
                      onClick={handleDownload}
                      disabled={downloading}
                      sx={{ py: 1.5, fontWeight: 800, borderRadius: 2 }}
                    >
                      {downloading ? 'Preparing Download...' : 'Download Complete Volume (PDF)'}
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.04em' }}>
                          LIFETIME DRM-FREE PRICE
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                          ₹{book.price.toFixed(2)}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AutoStoriesIcon />}
                        onClick={() => setPreviewOpen(true)}
                        sx={{ borderColor: '#cbd5e1', color: '#475569', fontWeight: 600 }}
                      >
                        Read Sample Excerpt
                      </Button>
                    </Box>

                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<ShoppingBagIcon />}
                      onClick={handleBuyClick}
                      sx={{ py: 1.5, fontWeight: 800, fontSize: '1rem', borderRadius: 2 }}
                    >
                      Purchase Volume (₹{book.price.toFixed(2)})
                    </Button>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VerifiedUserIcon sx={{ color: '#059669', fontSize: 18 }} />
                      <Typography variant="caption" sx={{ color: '#475569' }}>
                        Cryptographically signed download token delivered upon verified payment.
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Paper>

              {/* Volume Synopsis */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
                  About this Volume
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#334155',
                    lineHeight: 1.8,
                    fontSize: '1rem',
                  }}
                >
                  {book.description}
                </Typography>
              </Box>

              {/* Curriculum & Chapters Preview */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
                  Curriculum &amp; Chapters
                </Typography>
                <Box
                  sx={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 2.5,
                    p: 2.5,
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.8,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <MenuBookIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      Chapter 1: Foundational Principles, Mental Models &amp; Domain Boundaries
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <MenuBookIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      Chapter 2: Production Hardening, Concurrency &amp; Operational Resilience
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <MenuBookIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      Chapter 3: Enterprise Architectural Case Studies &amp; Migration Blueprints
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Payment Checkout Modal */}
      <PaymentModal
        open={paymentOpen}
        book={book}
        onClose={() => setPaymentOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Chapter 1 Preview Drawer */}
      <ReaderPreviewDrawer
        open={previewOpen}
        book={book}
        isPurchased={isPurchased}
        onClose={() => setPreviewOpen(false)}
        onBuyNow={() => {
          setPreviewOpen(false);
          setPaymentOpen(true);
        }}
        onDownload={() => handleDownload()}
      />

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
    </Box>
  );
};
