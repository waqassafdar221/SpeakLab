'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Avatar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { authApi } from '@/lib/api';

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authApi.forgotPassword(email);
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Forgot password?
          </Typography>
          <Typography variant="body2" sx={{ color: '#4a4a4a', textAlign: 'center' }}>
            Enter your email and we'll send you a link to reset it
          </Typography>
        </Box>

        {message ? (
          <Alert severity="success" sx={{ borderRadius: '8px' }}>
            {message}
          </Alert>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: '#f6f5f1',
                    '&:hover': { backgroundColor: '#ebe9e0' },
                    '&.Mui-focused': {
                      backgroundColor: '#fff',
                      '& fieldset': { borderColor: '#1a1a1a', borderWidth: '2px' },
                    },
                  },
                }}
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
                {isSubmitting ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Send reset link'}
              </Button>
            </Box>
          </>
        )}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography
            component="a"
            href="/login"
            variant="body2"
            sx={{
              color: '#6a6a6a',
              textDecoration: 'none',
              fontSize: '0.875rem',
              '&:hover': { color: '#1a1a1a' },
            }}
          >
            ← Back to login
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
