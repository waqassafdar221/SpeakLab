'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
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
import { adminApi, VendorListItem } from '@/lib/api';

export default function VendorsManagementSection() {
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = await adminApi.listVendors();
        setVendors(data);
      } catch (err) {
        console.error('Failed to fetch vendors:', err);
        setError('Failed to load vendors');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVendors();
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
          Vendors
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a4a4a' }}>
          B2B partner accounts and how many customers each one manages
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

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
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Vendor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Customers</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ color: '#9a9a9a', textAlign: 'center', py: 4 }}>
                    No vendors yet — create one from "Create User".
                  </TableCell>
                </TableRow>
              )}
              {vendors.map((vendor) => (
                <TableRow
                  key={vendor.id}
                  sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' } }}
                >
                  <TableCell>{vendor.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{vendor.username}</TableCell>
                  <TableCell>{vendor.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={vendor.customer_count}
                      size="small"
                      sx={{ backgroundColor: '#1a1a1a', color: '#fff', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#6a6a6a' }}>
                    {vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : '—'}
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
