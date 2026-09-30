import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAppDispatch } from '../store/index.ts';
import { setCredentials } from '../store/slices/authSlice.ts';

const loginFormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as any)?.from || '/';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Authentication failed. Please verify credentials.');
      }

      dispatch(setCredentials({ user: resData.user, token: resData.token }));
      navigate(from, { replace: true });
    } catch (err: any) {
      setServerError(err.message || 'An unexpected error occurred during sign-in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (e: React.MouseEvent) => {
    e.preventDefault();
    setValue('email', 'user@example.com', { shouldValidate: true });
    setValue('password', 'Password123!', { shouldValidate: true });
  };

  return (
    <Container maxWidth="xs" sx={{ py: 10 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3.5,
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 20 }} />
        </Box>

        <Typography variant="h5" component="h1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
          Member Sign In
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3, textAlign: 'center' }}>
          Access your personal library and licensed downloads
        </Typography>

        {serverError && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {serverError}
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
          <TextField
            label="Email Address"
            fullWidth
            margin="normal"
            size="small"
            autoComplete="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            size="small"
            autoComplete="current-password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={submitting}
            sx={{ mt: 3, mb: 2, py: 1.3, fontWeight: 700, borderRadius: 2 }}
          >
            {submitting ? <CircularProgress size={22} color="inherit" /> : 'Sign In to Bookstore'}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              No account?{' '}
              <Link component={RouterLink} to="/register" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Join Bookstore
              </Link>
            </Typography>

            <Link
              href="#quick-fill"
              onClick={handleQuickFill}
              sx={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'none', '&:hover': { color: '#64748b' } }}
            >
              Fill Member Details
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};
