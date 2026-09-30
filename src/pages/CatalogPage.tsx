import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Grid,
  Skeleton,
  Alert,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ClearIcon from '@mui/icons-material/Clear';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import StarIcon from '@mui/icons-material/Star';
import { useGetBooksQuery } from '../store/services/bookApi.ts';
import { BookCard } from '../components/BookCard.tsx';
import { PaymentModal } from '../components/PaymentModal.tsx';
import { ReaderPreviewDrawer } from '../components/ReaderPreviewDrawer.tsx';
import { Book } from '../types/index.ts';
import { useAppSelector } from '../store/index.ts';
import { downloadPurchasedBook } from '../utils/downloadHelper.ts';

export const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { data, isLoading, isError, error, refetch } = useGetBooksQuery();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  const [activePaymentBook, setActivePaymentBook] = useState<Book | null>(null);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);

  const books = data?.books || [];

  // Extract distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => set.add(b.category));
    return ['All', ...Array.from(set).sort()];
  }, [books]);

  // Featured Spotlight Volume (Book 4 or first item)
  const featuredBook = useMemo(() => {
    return books.find((b) => b.title.includes('Data-Intensive')) || books[0] || null;
  }, [books]);

  const isFeaturedPurchased =
    featuredBook &&
    (featuredBook.isPurchased ||
      (user?.purchasedBookIds && user.purchasedBookIds.includes(featuredBook.id)));

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let result = books.filter((b) => {
      const matchesSearch =
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || b.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'pages') {
      result.sort((a, b) => b.pages - a.pages);
    }

    return result;
  }, [books, searchQuery, selectedCategory, sortBy]);

  const handleDownload = async (book: Book) => {
    await downloadPurchasedBook(book.id, book.title);
  };

  return (
    <Box sx={{ pb: 10 }}>
      {/* Editorial Luxury Hero Section */}
      <Box
        sx={{
          backgroundColor: '#090d16',
          color: '#ffffff',
          pt: { xs: 7, md: 9 },
          pb: { xs: 8, md: 10 },
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={6} sx={{ alignItems: 'center' }}>
            {/* Left Header Narrative */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#60a5fa',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    fontSize: '0.75rem',
                  }}
                >
                  ONLINE MONOGRAPH BOOKSTORE
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569' }}>
                  •
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                  30 CURATED VOLUMES
                </Typography>
              </Box>

              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontFamily: 'Georgia, Cambria, serif',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                  mb: 2.5,
                  fontSize: { xs: '2.2rem', sm: '3rem', md: '3.6rem' },
                }}
              >
                Definitive Books for Master Engineers &amp; Founders
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: '#94a3b8',
                  lineHeight: 1.8,
                  fontSize: { xs: '1rem', md: '1.15rem' },
                  maxWidth: 620,
                  mb: 4,
                }}
              >
                Handcrafted digital monographs on distributed systems, modern architecture, and leadership. Direct
                cryptographic licensing with zero telemetry and permanent DRM-free PDF ownership.
              </Typography>

              {/* Trust Indicators */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: { xs: 2.5, sm: 4 },
                  pt: 2,
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 600 }}>
                    EDITIONS
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                    Hardcover-Grade Digital
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 600 }}>
                    READER RIGHTS
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                    100% DRM-Free Ownership
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 600 }}>
                    PRIVACY STANDARD
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#34d399' }}>
                    Zero Telemetry Tracking
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Right Featured Spotlight Card */}
            {featuredBook && (
              <Grid size={{ xs: 12, md: 5 }}>
                <Box
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 3.5,
                    p: 3,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 3,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {/* Spotlight Cover */}
                  <Box
                    component="img"
                    src={featuredBook.coverImage}
                    alt={featuredBook.title}
                    sx={{
                      width: { xs: '100%', sm: 140 },
                      height: { xs: 200, sm: 205 },
                      borderRadius: 2,
                      objectFit: 'cover',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)',
                      flexShrink: 0,
                    }}
                  />

                  {/* Spotlight Info */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#fbbf24', mb: 0.8 }}>
                        <StarIcon sx={{ fontSize: 15 }} />
                        <StarIcon sx={{ fontSize: 15 }} />
                        <StarIcon sx={{ fontSize: 15 }} />
                        <StarIcon sx={{ fontSize: 15 }} />
                        <StarIcon sx={{ fontSize: 15 }} />
                        <Typography variant="caption" sx={{ color: '#94a3b8', ml: 0.5, fontWeight: 700 }}>
                          EDITOR'S CHOICE
                        </Typography>
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: 'Georgia, Cambria, serif',
                          fontWeight: 800,
                          lineHeight: 1.25,
                          color: '#ffffff',
                          mb: 0.5,
                        }}
                      >
                        {featuredBook.title}
                      </Typography>

                      <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1.5 }}>
                        By {featuredBook.author} • {featuredBook.pages} pages
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: '#cbd5e1',
                          fontSize: '0.82rem',
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {featuredBook.description}
                      </Typography>
                    </Box>

                    {/* Spotlight CTA */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AutoStoriesIcon fontSize="small" />}
                        onClick={() => setPreviewBook(featuredBook)}
                        sx={{
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: '#ffffff',
                          '&:hover': { borderColor: '#ffffff', backgroundColor: 'rgba(255,255,255,0.06)' },
                        }}
                      >
                        Preview
                      </Button>

                      {isFeaturedPurchased ? (
                        <Button
                          size="small"
                          variant="contained"
                          color="secondary"
                          onClick={() => handleDownload(featuredBook)}
                          sx={{ fontWeight: 700 }}
                        >
                          Download PDF
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<ShoppingBagIcon fontSize="small" />}
                          onClick={() => {
                            if (!isAuthenticated) {
                              navigate('/login', { state: { from: `/books/${featuredBook.id}` } });
                            } else {
                              setActivePaymentBook(featuredBook);
                            }
                          }}
                          sx={{ fontWeight: 700 }}
                        >
                          Buy ₹{featuredBook.price}
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Dynamic Controls Bar */}
      <Container maxWidth="xl" sx={{ mt: -3 }}>
        <Box
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: 3,
            p: 2.5,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0',
            mb: 4,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            {/* Live Instant Search Field */}
            <TextField
              placeholder="Search by title, author, or architectural domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {/* Sort Selector */}
              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel id="sort-label">Sort By</InputLabel>
                <Select
                  labelId="sort-label"
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="default">Curated Order</MenuItem>
                  <MenuItem value="title">Title (A-Z)</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="pages">Volume Length (Pages)</MenuItem>
                </Select>
              </FormControl>

              {/* View Switcher (Grid vs Compact) */}
              <Box sx={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                <IconButton
                  size="small"
                  onClick={() => setViewMode('grid')}
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                >
                  <ViewModuleIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setViewMode('compact')}
                  color={viewMode === 'compact' ? 'primary' : 'default'}
                >
                  <ViewListIcon fontSize="small" />
                </IconButton>
              </Box>

              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {filteredBooks.length} Books
              </Typography>
            </Box>
          </Box>

          {/* Interactive Category Segmented Control (Zero-Pill styling) */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              mt: 2.5,
              pt: 2,
              borderTop: '1px solid #f1f5f9',
            }}
          >
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <Button
                  key={cat}
                  size="small"
                  variant={active ? 'contained' : 'text'}
                  color={active ? 'primary' : 'inherit'}
                  onClick={() => setSelectedCategory(cat)}
                  sx={{
                    borderRadius: 2,
                    fontSize: '0.8rem',
                    fontWeight: active ? 700 : 500,
                    px: 1.8,
                    py: 0.6,
                    backgroundColor: active ? 'primary.main' : 'transparent',
                    color: active ? '#ffffff' : '#475569',
                    '&:hover': {
                      backgroundColor: active ? 'primary.dark' : '#f8fafc',
                    },
                  }}
                >
                  {cat}
                </Button>
              );
            })}
          </Box>
        </Box>

        {/* Error Handling */}
        {isError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={() => refetch()}>
                Retry
              </Button>
            }
            sx={{ mb: 4 }}
          >
            {(error as any)?.data?.error || 'Failed to load catalog. Please check server.'}
          </Alert>
        )}

        {/* Dynamic Book Grid */}
        <Grid container spacing={3}>
          {isLoading
            ? Array.from({ length: 8 }).map((_, idx) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={idx}>
                  <Box sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0', p: 2, backgroundColor: '#ffffff' }}>
                    <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2, mb: 2 }} />
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="90%" height={32} />
                    <Skeleton variant="text" width="40%" height={28} />
                  </Box>
                </Grid>
              ))
            : filteredBooks.map((book) => (
                <Grid
                  size={
                    viewMode === 'grid'
                      ? { xs: 12, sm: 6, md: 4, lg: 3 }
                      : { xs: 12, sm: 12, md: 6 }
                  }
                  key={book.id}
                >
                  <BookCard
                    book={book}
                    onBuyNow={(b) => setActivePaymentBook(b)}
                    onPreviewExcerpt={(b) => setPreviewBook(b)}
                  />
                </Grid>
              ))}
        </Grid>

        {/* Empty state */}
        {!isLoading && filteredBooks.length === 0 && (
          <Box sx={{ py: 12, textAlign: 'center', backgroundColor: '#ffffff', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
            <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700, mb: 1 }}>
              No monographs match your query
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
              Try searching with alternative terminology or reset to view all 30 titles.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            >
              Reset Filters
            </Button>
          </Box>
        )}
      </Container>

      {/* Payment Checkout Modal */}
      <PaymentModal
        open={!!activePaymentBook}
        book={activePaymentBook}
        onClose={() => setActivePaymentBook(null)}
        onSuccess={() => refetch()}
      />

      {/* Chapter 1 Interactive Preview Drawer */}
      <ReaderPreviewDrawer
        open={!!previewBook}
        book={previewBook}
        isPurchased={
          Boolean(
            previewBook?.isPurchased ||
              (previewBook && user?.purchasedBookIds && user.purchasedBookIds.includes(previewBook.id))
          )
        }
        onClose={() => setPreviewBook(null)}
        onBuyNow={(b) => setActivePaymentBook(b)}
        onDownload={(b) => handleDownload(b)}
      />
    </Box>
  );
};
