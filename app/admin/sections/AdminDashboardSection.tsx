'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { adminApi, AdminStats } from '@/lib/api';

export default function AdminDashboardSection() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
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
          Admin Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a4a4a' }}>
          Overview of your platform statistics
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3}>
        {/* Total Users Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: 4,
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: '#1a1a1a',
                  mr: 2,
                }}
              >
                <PeopleIcon sx={{ color: '#fff', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#1a1a1a' }}>
                  {stats?.total_users || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6a6a6a' }}>
                  Total Users
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Total Credits Allocated Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: 4,
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: '#1a1a1a',
                  mr: 2,
                }}
              >
                <AccountBalanceWalletIcon sx={{ color: '#fff', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#1a1a1a' }}>
                  {stats?.total_credits_allocated.toLocaleString() || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6a6a6a' }}>
                  Total Credits Allocated
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#1a1a1a',
            mb: 2,
          }}
        >
          Quick Actions
        </Typography>
        <Typography variant="body2" sx={{ color: '#6a6a6a' }}>
          Use the sidebar to manage users, create new accounts, or allocate credits.
        </Typography>
      </Box>
    </Box>
  );
}
