'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { userApi } from '@/lib/api';

export default function SettingsSection() {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    role: '',
    createdAt: '',
    credits: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await userApi.getMe();
        setUserData({
          username: data.username,
          email: data.email || 'Not set',
          role: data.is_admin ? 'Administrator' : 'User',
          createdAt: new Date(data.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          credits: data.credits,
        });
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load account settings');
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
          Settings
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a4a4a' }}>
          Manage your account settings and preferences
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {/* Account Information Card */}
      <Card
        sx={{
          p: 4,
          mb: 3,
          borderRadius: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#1a1a1a',
            }}
          >
            Account Information
          </Typography>
          <Chip
            label={userData.role}
            color={userData.role === 'Administrator' ? 'error' : 'primary'}
            sx={{
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
            }}
          />
        </Box>

        <Box sx={{ display: 'grid', gap: 3 }}>
          <TextField
            label="Username"
            value={userData.username}
            disabled
            fullWidth
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: '12px',
                backgroundColor: '#f9f9f9',
              },
            }}
          />
          <TextField
            label="Email Address"
            value={userData.email}
            disabled
            fullWidth
            type="email"
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: '12px',
                backgroundColor: '#f9f9f9',
              },
            }}
          />
          <TextField
            label="Account Role"
            value={userData.role}
            disabled
            fullWidth
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: '12px',
                backgroundColor: '#f9f9f9',
              },
            }}
          />
          <TextField
            label="Member Since"
            value={userData.createdAt}
            disabled
            fullWidth
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: '12px',
                backgroundColor: '#f9f9f9',
              },
            }}
          />
          <TextField
            label="Current Credits"
            value={userData.credits.toLocaleString()}
            disabled
            fullWidth
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: '12px',
                backgroundColor: '#f9f9f9',
              },
            }}
          />
        </Box>

        <Button
          variant="contained"
          disabled
          fullWidth
          sx={{
            mt: 3,
            borderRadius: '12px',
            backgroundColor: '#d0d0d0',
            color: '#6a6a6a',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            py: 1.5,
          }}
        >
          Edit Profile (Contact Admin)
        </Button>
      </Card>

      {/* Security Settings Card */}
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
            mb: 3,
          }}
        >
          Security
        </Typography>

        <Box sx={{ display: 'grid', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              backgroundColor: '#f9f9f9',
              borderRadius: '12px',
            }}
          >
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                Password
              </Typography>
              <Typography variant="body2" sx={{ color: '#6a6a6a' }}>
                Last changed: Contact admin for details
              </Typography>
            </Box>
            <Button
              variant="outlined"
              disabled
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Change
            </Button>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              backgroundColor: '#f9f9f9',
              borderRadius: '12px',
            }}
          >
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                Two-Factor Authentication
              </Typography>
              <Typography variant="body2" sx={{ color: '#6a6a6a' }}>
                Contact admin to enable 2FA
              </Typography>
            </Box>
            <Chip label="Not Available" color="default" size="small" />
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
