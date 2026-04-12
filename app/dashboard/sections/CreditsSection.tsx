'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { userApi } from '@/lib/api';

export default function CreditsSection() {
  const [credits, setCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await userApi.getMe();
        setCredits(userData.credits);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load credits information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#1a1a1a',
            mb: 1,
            letterSpacing: '-0.02em',
          }}
        >
          Credits
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a4a4a' }}>
          Manage your account credits and usage
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {/* Credits Overview Card */}
      <Card
        sx={{
          p: 4,
          borderRadius: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
          mb: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#1a1a1a',
            mb: 3,
          }}
        >
          Available Credits
        </Typography>

        {/* Current Credits Display */}
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            px: 3,
            backgroundColor: '#f6f5f1',
            borderRadius: '16px',
            mb: 3,
          }}
        >
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1 }}>
            {credits.toLocaleString()}
          </Typography>
          <Typography variant="body1" sx={{ color: '#6a6a6a' }}>
            Credits Available
          </Typography>
          <Typography variant="caption" sx={{ color: '#6a6a6a', display: 'block', mt: 2 }}>
            1 credit = 1 character for TTS generation
          </Typography>
        </Box>

        {/* Info Box */}
        <Box
          sx={{
            p: 3,
            backgroundColor: '#fff3cd',
            borderRadius: '12px',
            border: '1px solid #ffc107',
          }}
        >
          <Typography variant="body2" sx={{ color: '#856404', fontWeight: 600, mb: 1 }}>
            💡 How Credits Work
          </Typography>
          <Typography variant="body2" sx={{ color: '#856404' }}>
            • Each character in your text costs 1 credit<br />
            • Credits are deducted when generating speech<br />
            • Contact admin to purchase more credits
          </Typography>
        </Box>
      </Card>

      {/* Purchase More Credits Card */}
      <Card
        sx={{
          p: 4,
          borderRadius: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#1a1a1a',
            mb: 2,
          }}
        >
          Need More Credits?
        </Typography>
        <Typography variant="body2" sx={{ color: '#6a6a6a', mb: 3 }}>
          Contact your administrator to request additional credits for your account.
        </Typography>
        <Button
          variant="contained"
          disabled
          fullWidth
          sx={{
            borderRadius: '12px',
            backgroundColor: '#d0d0d0',
            color: '#6a6a6a',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            py: 1.5,
          }}
        >
          Contact Admin
        </Button>
      </Card>
    </Box>
  );
}
