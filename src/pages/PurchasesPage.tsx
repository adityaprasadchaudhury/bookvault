import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { useGetPurchasesQuery } from '../store/services/purchaseApi.ts';
import { downloadPurchasedBook } from '../utils/downloadHelper.ts';

export const PurchasesPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useGetPurchasesQuery();
  const [downloadingBookId, setDownloadingBookId] = useState<string | null>(null);
  const [alertInfo, setAlertInfo] = useState<{ severity: 'error' | 'success'; message: string } | null>(null);

  const purchases = data?.purchases || [];

  const totalPages = purchases.reduce((acc, p) => acc + (p.book?.pages || 0), 0);
  const totalValue = purchases.reduce((acc, p) => acc + (p.amount || 0), 0);

  const handleDownload = async (bookId: string, title: string) => {
    setDownloadingBookId(bookId);
    const res = await downloadPurchasedBook(bookId, title);
    setDownloadingBookId(null);

    if (res.success) {
      setAlertInfo({ severity: 'success', message: `Downloaded "${title}" successfully.` });
    } else {
      setAlertInfo({ severity: 'error', message: res.error || 'Failed to download book.' });
    }
  };

  return (
    <Box sx={{ py: 6, pb: 14 }}>
      <Container maxWidth="xl">
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Personal Member Vault
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Permanent DRM-free digital editions licensed to your account. Accessible for direct offline download.
          </Typography>
        </Box>

        {/* Member Vault Metrics Bar */}
        {purchases.length > 0 && (
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    backgroundColor: '#eff6ff',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AutoStoriesIcon />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    VOLUMES LICENSED
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    {purchases.length} Books
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    backgroundColor: '#f0fdf4',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <VerifiedUserOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    TOTAL PAGES UNLOCKED
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    {totalPages} Pages
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    backgroundColor: '#f8fafc',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircleIcon />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    VAULT VALUE
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    ₹{totalValue.toFixed(2)}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {isError && (
          <Alert severity="error" sx={{ mb: 3 }} action={<Button onClick={() => refetch()}>Retry</Button>}>
            {(error as any)?.data?.error || 'Failed to load member vault.'}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress size={36} />
            <Typography variant="body2" sx={{ mt: 2, color: '#64748b' }}>
              Opening your secure reader vault...
            </Typography>
          </Box>
        ) : purchases.length === 0 ? (
          /* Empty State */
          <Paper
            elevation={0}
            sx={{
              p: 7,
              textAlign: 'center',
              border: '1px dashed #cbd5e1',
              borderRadius: 3.5,
              backgroundColor: '#ffffff',
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <AutoStoriesIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Your member vault is currently empty
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 3, maxWidth: 450, mx: 'auto' }}>
              Explore our curated technical monograph collection. Any volume you purchase is permanently unlocked here
              for unlimited offline reading.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/"
              endIcon={<ArrowForwardIcon />}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Browse Library Catalog
            </Button>
          </Paper>
        ) : (
          /* Purchases Table */
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>MONOGRAPH</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>CATEGORY</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>PRICE</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>ACTIVATED DATE</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>LICENSE STATUS</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>
                    OFFLINE EDITION
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchases.map((item) => (
                  <TableRow
                    key={item.orderId}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    {/* Book info */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          component="img"
                          src={item.book.coverImage}
                          alt={item.book.title}
                          sx={{
                            width: 44,
                            height: 60,
                            borderRadius: 1,
                            objectFit: 'cover',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                          }}
                        />
                        <Box>
                          <Typography
                            component={RouterLink}
                            to={`/books/${item.book.id}`}
                            variant="subtitle2"
                            sx={{
                              fontFamily: 'Georgia, Cambria, serif',
                              fontWeight: 800,
                              color: '#0f172a',
                              textDecoration: 'none',
                              '&:hover': { color: 'primary.main' },
                            }}
                          >
                            {item.book.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                            By {item.book.author}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
                        {item.book.category}
                      </Typography>
                    </TableCell>

                    {/* Amount */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        ₹{item.amount.toFixed(2)}
                      </Typography>
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#475569' }}>
                        {new Date(item.purchaseDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Typography>
                    </TableCell>

                    {/* License Status */}
                    <TableCell>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, color: '#16a34a' }}>
                        <CheckCircleIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#15803d' }}>
                          LIFETIME DRM-FREE
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Download Button */}
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        startIcon={
                          downloadingBookId === item.book.id ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <DownloadIcon fontSize="small" />
                          )
                        }
                        onClick={() => handleDownload(item.book.id, item.book.title)}
                        disabled={downloadingBookId === item.book.id}
                        sx={{ fontWeight: 700, borderRadius: 2 }}
                      >
                        {downloadingBookId === item.book.id ? 'Streaming...' : 'Download PDF'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

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
