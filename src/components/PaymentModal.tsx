import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { Book, PaymentOrderResponse } from '../types/index.ts';
import {
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  useGetSandboxDataMutation,
} from '../store/services/paymentApi.ts';
import { useAppDispatch } from '../store/index.ts';
import { updatePurchasedBooks } from '../store/slices/authSlice.ts';
import { downloadPurchasedBook } from '../utils/downloadHelper.ts';

interface PaymentModalProps {
  open: boolean;
  book: Book | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  book,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();
  const [getSandboxData, { isLoading: isGeneratingSandbox }] = useGetSandboxDataMutation();

  const [orderData, setOrderData] = useState<PaymentOrderResponse | null>(null);
  const [step, setStep] = useState<'INITIAL' | 'CHECKOUT' | 'SUCCESS' | 'ERROR'>('INITIAL');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0); // 0: Razorpay, 1: UPI, 2: Cards, 3: NetBanking
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('gpay');
  const [upiId, setUpiId] = useState<string>('alex.morgan@oksbi');
  const [selectedBank, setSelectedBank] = useState<string>('hdfc');
  const [downloading, setDownloading] = useState(false);

  // Initialize payment order when modal opens
  React.useEffect(() => {
    if (open && book) {
      setStep('INITIAL');
      setErrorMsg(null);
      setOrderData(null);

      createOrder({ bookId: book.id })
        .unwrap()
        .then((res) => {
          setOrderData(res.data);
          setStep('CHECKOUT');
        })
        .catch((err) => {
          console.error('Order creation error:', err);
          setErrorMsg(err.data?.error || err.error || 'Failed to initiate payment.');
          setStep('ERROR');
        });
    }
  }, [open, book, createOrder]);

  const handleCompletePayment = async () => {
    if (!orderData) return;
    setErrorMsg(null);

    try {
      // Obtain secure payment credentials
      const sandboxRes = await getSandboxData({
        gatewayOrderId: orderData.gatewayOrderId,
        simulateTamper: false,
        simulateFailure: false,
      }).unwrap();

      // Submit payment verification to backend
      const verifyRes = await verifyPayment({
        orderId: orderData.orderId,
        razorpay_order_id: sandboxRes.razorpay_order_id,
        razorpay_payment_id: sandboxRes.razorpay_payment_id,
        razorpay_signature: sandboxRes.razorpay_signature,
      }).unwrap();

      if (verifyRes.success) {
        dispatch(updatePurchasedBooks(orderData.book.id));
        setStep('SUCCESS');
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      console.error('Payment processing failed:', err);
      setErrorMsg(
        err.data?.error || err.error || 'Payment authorization failed. Please try again.'
      );
    }
  };

  const handleDownload = async () => {
    if (!book) return;
    setDownloading(true);
    const res = await downloadPurchasedBook(book.id, book.title);
    setDownloading(false);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  const getMethodName = () => {
    switch (activeTab) {
      case 0:
        return 'Razorpay';
      case 1:
        return 'UPI';
      case 2:
        return 'Card';
      case 3:
        return 'Net Banking';
      default:
        return 'Razorpay';
    }
  };

  if (!book) return null;

  return (
    <Dialog
      open={open}
      onClose={isVerifying || isCreatingOrder ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 3, p: 1 },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <LockIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {step === 'SUCCESS' ? 'License Confirmed' : 'Private Checkout'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#059669' }}>
          <VerifiedUserIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.04em' }}>
            256-BIT ENCRYPTED
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {step === 'INITIAL' && (
          <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={38} thickness={4} />
            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
              Connecting to secure payment gateway...
            </Typography>
          </Box>
        )}

        {step === 'ERROR' && (
          <Box sx={{ py: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              If you already hold a license for this volume, you can download your copy anytime from your member vault.
            </Typography>
          </Box>
        )}

        {step === 'CHECKOUT' && orderData && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Book & Price Summary */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                backgroundColor: '#f8fafc',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
              }}
            >
              <Box
                component="img"
                src={orderData.book.coverImage}
                alt={orderData.book.title}
                sx={{
                  width: 58,
                  height: 82,
                  borderRadius: 1,
                  objectFit: 'cover',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#0f172a' }}>
                  {orderData.book.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
                  By {orderData.book.author} • Lifetime DRM-Free License
                </Typography>
                <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 800 }}>
                  ₹{orderData.amount.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            {errorMsg && (
              <Alert severity="error" onClose={() => setErrorMsg(null)}>
                {errorMsg}
              </Alert>
            )}

            {/* Select Payment Method Tabs */}
            <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ backgroundColor: '#f1f5f9', px: 2, py: 1.2, borderBottom: '1px solid #e2e8f0' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', letterSpacing: 0.5 }}>
                  SELECT PAYMENT METHOD
                </Typography>
              </Box>

              <Tabs
                value={activeTab}
                onChange={(_, val) => setActiveTab(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}
              >
                <Tab icon={<PaymentIcon fontSize="small" />} label="Razorpay" />
                <Tab icon={<AccountBalanceWalletIcon fontSize="small" />} label="UPI" />
                <Tab icon={<CreditCardIcon fontSize="small" />} label="Cards" />
                <Tab icon={<AccountBalanceIcon fontSize="small" />} label="Net Banking" />
              </Tabs>

              <Box sx={{ p: 2.5 }}>
                {/* 1. Razorpay Method */}
                {activeTab === 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: '#eff6ff',
                        borderRadius: 2,
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e3a8a', mb: 0.5 }}>
                        Pay via Razorpay Secure Gateway
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#3b82f6', fontSize: '0.82rem', lineHeight: 1.5 }}>
                        All domestic &amp; international cards, UPI apps, wallets, and instant bank transfers
                        supported with zero surcharge.
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* 2. UPI Method */}
                {activeTab === 1 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                      Select UPI Application:
                    </Typography>
                    <RadioGroup
                      row
                      value={selectedUpiApp}
                      onChange={(e) => setSelectedUpiApp(e.target.value)}
                      sx={{ gap: 1 }}
                    >
                      <FormControlLabel
                        value="gpay"
                        control={<Radio size="small" />}
                        label={<Typography variant="body2">Google Pay</Typography>}
                      />
                      <FormControlLabel
                        value="phonepe"
                        control={<Radio size="small" />}
                        label={<Typography variant="body2">PhonePe</Typography>}
                      />
                      <FormControlLabel
                        value="paytm"
                        control={<Radio size="small" />}
                        label={<Typography variant="body2">Paytm</Typography>}
                      />
                    </RadioGroup>

                    <TextField
                      label="Virtual Payment Address (UPI ID)"
                      size="small"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@bank"
                      fullWidth
                    />
                  </Box>
                )}

                {/* 3. Cards Method */}
                {activeTab === 2 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <TextField
                      label="Card Number"
                      size="small"
                      placeholder="4111 •••• •••• 4444"
                      defaultValue="4111 8892 4192 4444"
                      fullWidth
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField label="Expiry" size="small" defaultValue="08/29" sx={{ flex: 1 }} />
                      <TextField label="CVV" size="small" defaultValue="382" sx={{ flex: 1 }} />
                    </Box>
                  </Box>
                )}

                {/* 4. NetBanking Method */}
                {activeTab === 3 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                      Select Bank:
                    </Typography>
                    <RadioGroup
                      row
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      sx={{ gap: 1 }}
                    >
                      <FormControlLabel value="hdfc" control={<Radio size="small" />} label="HDFC Bank" />
                      <FormControlLabel value="icici" control={<Radio size="small" />} label="ICICI Bank" />
                      <FormControlLabel value="sbi" control={<Radio size="small" />} label="SBI" />
                      <FormControlLabel value="axis" control={<Radio size="small" />} label="Axis Bank" />
                    </RadioGroup>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Privacy & DRM Free Promise */}
            <Typography variant="caption" sx={{ color: '#64748b', textAlign: 'center' }}>
              Instant PDF delivery. Permanently unlocked in your vault.
            </Typography>

            {/* Primary Action Button */}
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={
                isVerifying || isGeneratingSandbox ? <CircularProgress size={20} color="inherit" /> : <LockIcon />
              }
              disabled={isVerifying || isGeneratingSandbox}
              onClick={handleCompletePayment}
              sx={{ py: 1.4, fontWeight: 800, fontSize: '1rem', borderRadius: 2 }}
            >
              {isVerifying ? 'Confirming License...' : `Pay ₹${orderData.amount.toFixed(2)} with ${getMethodName()}`}
            </Button>
          </Box>
        )}

        {step === 'SUCCESS' && (
          <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
              License Verified &amp; Activated!
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', maxWidth: 420 }}>
              Your lifetime personal license for <strong>{book.title}</strong> is now registered. You can download
              your copy right away or access it anytime from your member vault.
            </Typography>

            <Divider sx={{ width: '100%', my: 1 }} />

            <Button
              variant="contained"
              color="secondary"
              size="large"
              startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
              onClick={handleDownload}
              disabled={downloading}
              sx={{ py: 1.4, px: 4, fontWeight: 700, borderRadius: 2 }}
            >
              {downloading ? 'Downloading...' : 'Download Book (PDF)'}
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isVerifying} color="inherit">
          {step === 'SUCCESS' ? 'Close' : 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
