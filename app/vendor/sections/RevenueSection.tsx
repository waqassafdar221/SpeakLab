'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { vendorApi, VendorRevenue } from '@/lib/api';

const cardSx = {
  p: 3,
  borderRadius: '16px',
  backgroundColor: 'rgba(255,255,255,0.9)',
  border: '1px solid rgba(0,0,0,0.06)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
};

function formatMoney(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function RevenueSection() {
  const [revenue, setRevenue] = useState<VendorRevenue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await vendorApi.getRevenue();
        setRevenue(data);
        setError('');
      } catch (err) {
        console.error('Failed to load revenue:', err);
        setError('Failed to load revenue');
      } finally {
        setIsLoading(false);
      }
    };
    load();
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
          sx={{ fontWeight: 800, color: '#1a1a1a', mb: 0.5, letterSpacing: '-0.02em' }}
        >
          Revenue
        </Typography>
        <Typography variant="body2" sx={{ color: '#6a6a6a' }}>
          What you're billing your customers each month
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {/* Stat card */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card sx={cardSx}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  backgroundColor: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AccountBalanceWalletIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a1a', lineHeight: 1 }}>
                  {formatMoney(revenue?.customer_mrr ?? 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6a6a6a', mt: 0.5 }}>
                  Customer MRR
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Customer breakdown */}
      <Card
        sx={{
          borderRadius: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f6f5f1' }}>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Price/mo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(!revenue || revenue.customers.length === 0) && (
                <TableRow>
                  <TableCell colSpan={2} sx={{ color: '#9a9a9a', textAlign: 'center', py: 4 }}>
                    No customers yet.
                  </TableCell>
                </TableRow>
              )}
              {revenue?.customers.map((c) => (
                <TableRow key={c.id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{c.username}</TableCell>
                  <TableCell>
                    {c.monthly_price > 0 ? (
                      <Chip label={formatMoney(c.monthly_price)} size="small" sx={{ backgroundColor: '#1a1a1a', color: '#fff', fontWeight: 600 }} />
                    ) : (
                      <span style={{ color: '#9a9a9a' }}>—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
