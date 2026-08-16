'use client';

import React, { Suspense, useEffect, useState } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Avatar,
  Alert,
  Snackbar,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi, userApi, TokenManager } from '@/lib/api';

const shellSx = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #f6f5f1 0%, #ffffff 50%, #f6f5f1 100%)',
  px: 2,
  py: 4,
};

const cardSx = {
  width: '100%',
  maxWidth: '460px',
  p: { xs: 3, sm: 5 },
  borderRadius: '16px',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
};

const fieldSx = {
  mb: 2,
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#f6f5f1',
    '&:hover': { backgroundColor: '#ebe9e0' },
    '&.Mui-focused': {
      backgroundColor: '#fff',
      '& fieldset': { borderColor: '#1a1a1a', borderWidth: '2px' },
    },
  },
};

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [isChecking, setIsChecking] = useState(true);
  const [inviteError, setInviteError] = useState('');
  const [invitee, setInvitee] = useState<{ username: string; email: string } | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ password: '', confirmPassword: '', general: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setInviteError('This invite link is missing its token.');
      setIsChecking(false);
      return;
    }
    authApi
      .getInvite(token)
      .then((info) => setInvitee(info))
      .catch((err) => setInviteError(err instanceof Error ? err.message : 'This invite link is invalid or has expired.'))
      .finally(() => setIsChecking(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { password: '', confirmPassword: '', general: '' };

    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    if (newErrors.password || newErrors.confirmPassword) return;

    setIsSubmitting(true);
    try {
      const response = await authApi.setPassword(token, password);
      TokenManager.set(response.access_token);
      setShowSuccess(true);

      const me = await userApi.getMe();
      const destination = me.role === 'vendor' ? '/vendor' : '/dashboard';
      setTimeout(() => router.push(destination), 1200);
    } catch (err) {
      setErrors({
        password: '',
        confirmPassword: '',
        general: err instanceof Error ? err.message : 'Failed to set password. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <Box sx={shellSx}>
        <CircularProgress />
      </Box>
    );
  }

  if (inviteError) {
    return (
      <Box sx={shellSx}>
        <Card sx={cardSx}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#1a1a1a' }}>
              Link no longer works
            </Typography>
            <Typography variant="body2" sx={{ color: '#6a6a6a', mb: 3 }}>
              {inviteError}
            </Typography>
            <Button
              href="/login"
              variant="contained"
              sx={{ backgroundColor: '#1a1a1a', borderRadius: '999px', textTransform: 'none', px: 3 }}
            >
              Go to login
            </Button>
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={shellSx}>
      <Card sx={cardSx}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              mb: 2,
              background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
              boxShadow: '0 8px 24px rgba(26, 26, 26, 0.2)',
            }}
          >
            <Typography variant="h4" sx={{ color: '#fff' }}>S</Typography>
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#1a1a1a', letterSpacing: '-0.02em' }}>
            Set your password
          </Typography>
          <Typography variant="body2" sx={{ color: '#4a4a4a', textAlign: 'center' }}>
            {invitee ? `Activating the account for ${invitee.username}` : 'Choose a password to activate your account'}
          </Typography>
        </Box>

        {errors.general && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
            {errors.general}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="New password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#4a4a4a' }}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={fieldSx}
          />

          <TextField
            fullWidth
            label="Confirm password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            sx={{ ...fieldSx, mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{
              backgroundColor: '#1a1a1a',
              color: '#fff',
              py: 1.5,
              borderRadius: '999px',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 8px 24px rgba(26, 26, 26, 0.2)',
              '&:hover': { backgroundColor: '#2a2a2a' },
              '&:disabled': { backgroundColor: '#4a4a4a', color: '#999' },
            }}
          >
            {isSubmitting ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Set password & continue'}
          </Button>
        </Box>
      </Card>

      <Snackbar
        open={showSuccess}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          Password set! Redirecting...
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Box sx={shellSx}>
          <CircularProgress />
        </Box>
      }
    >
      <SetPasswordForm />
    </Suspense>
  );
}
