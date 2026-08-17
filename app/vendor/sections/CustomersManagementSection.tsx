'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import { vendorApi, AdminUser, AdminStats, VendorRevenue } from '@/lib/api';

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

function StatCard({
  icon,
  value,
  label,
  iconBg = '#1a1a1a',
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  iconBg?: string;
}) {
  return (
    <Card sx={cardSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: '12px',
            backgroundColor: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a1a', lineHeight: 1 }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6a6a6a', mt: 0.5 }}>
            {label}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

function avatarColor(seed: string): string {
  const palette = ['#1a1a1a', '#2f7d68', '#8a4fc4', '#c2410c', '#1d6fa5'];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export default function CustomersManagementSection() {
  const [customers, setCustomers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [revenue, setRevenue] = useState<VendorRevenue | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminUser | null>(null);
  const [newCredits, setNewCredits] = useState(0);
  const [newPrice, setNewPrice] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await vendorApi.listCustomers({ page: page + 1, pageSize: rowsPerPage, search });
      setCustomers(data.items);
      setTotal(data.total);
      setError('');
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setError('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const [statsData, revenueData] = await Promise.all([vendorApi.getStats(), vendorApi.getRevenue()]);
      setStats(statsData);
      setRevenue(revenueData);
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(0);
      setSearch(searchInput);
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleEditClick = (customer: AdminUser) => {
    setSelectedCustomer(customer);
    setNewCredits(customer.credits);
    setNewPrice(customer.monthly_price);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (customer: AdminUser) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  };

  const handleUpdateCredits = async () => {
    if (!selectedCustomer) return;

    try {
      await Promise.all([
        vendorApi.updateCustomerCredits(selectedCustomer.id, newCredits),
        vendorApi.updateCustomerPrice(selectedCustomer.id, newPrice),
      ]);
      setSuccessMessage('Account updated successfully');
      setShowSuccess(true);
      setEditDialogOpen(false);
      fetchCustomers();
      fetchSummary();
    } catch (err) {
      console.error('Failed to update account:', err);
      setError('Failed to update account');
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      await vendorApi.deleteCustomer(selectedCustomer.id);
      setSuccessMessage('Customer deleted successfully');
      setShowSuccess(true);
      setDeleteDialogOpen(false);
      fetchCustomers();
      fetchSummary();
    } catch (err) {
      console.error('Failed to delete customer:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
    }
  };

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
          Manage Customers
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a4a4a' }}>
          View and manage the customer accounts you've created
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {/* Stat cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={<PeopleIcon sx={{ color: '#fff', fontSize: 28 }} />}
            value={total}
            label="Total Customers"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={<AccountBalanceWalletIcon sx={{ color: '#fff', fontSize: 28 }} />}
            value={formatMoney(revenue?.customer_mrr ?? 0)}
            label="Monthly Revenue"
            iconBg="#2f7d68"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={<WarningAmberIcon sx={{ color: '#fff', fontSize: 28 }} />}
            value={stats?.expired_users ?? 0}
            label="Expired Accounts"
            iconBg="#c2410c"
          />
        </Grid>
      </Grid>

      {/* Search */}
      <TextField
        placeholder="Search by username or email"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        size="small"
        sx={{
          mb: 2.5,
          width: { xs: '100%', sm: 320 },
          '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: '#9a9a9a' }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Customers Table */}
      <Card
        sx={{
          borderRadius: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f6f5f1' }}>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Credits</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Price/mo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Expires</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ border: 0, py: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <PersonOffOutlinedIcon sx={{ fontSize: 32, color: '#c9c7bf' }} />
                      <Typography sx={{ color: '#9a9a9a' }}>
                        {search ? 'No customers match your search.' : 'No customers yet — create one from "Create Customer".'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              {customers.map((customer) => (
                <TableRow
                  key={customer.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          backgroundColor: avatarColor(customer.username),
                        }}
                      >
                        {customer.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a1a', lineHeight: 1.3 }}>
                          {customer.username}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: '#9a9a9a', lineHeight: 1.3 }}>
                          {customer.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={customer.credits.toLocaleString()}
                      size="small"
                      sx={{
                        backgroundColor: '#1a1a1a',
                        color: '#fff',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: customer.monthly_price > 0 ? '#1a1a1a' : '#9a9a9a', fontWeight: customer.monthly_price > 0 ? 600 : 400 }}>
                    {customer.monthly_price > 0 ? formatMoney(customer.monthly_price) : '—'}
                  </TableCell>
                  <TableCell>
                    {customer.invite_pending ? (
                      <Chip label="Pending" size="small" color="warning" variant="outlined" />
                    ) : (
                      <Chip label="Active" size="small" color="success" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell sx={{ color: '#6a6a6a' }}>
                    {customer.expiry_date ? new Date(customer.expiry_date).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(customer)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(customer)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        )}
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      </Card>

      {/* Edit Account Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} PaperProps={{ sx: { borderRadius: '16px', minWidth: 360 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: '0.875rem',
                fontWeight: 700,
                backgroundColor: selectedCustomer ? avatarColor(selectedCustomer.username) : '#1a1a1a',
              }}
            >
              {selectedCustomer?.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a1a' }}>
                {selectedCustomer?.username}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#9a9a9a' }}>Edit account</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="number"
            label="Credits"
            value={newCredits}
            onChange={(e) => setNewCredits(parseInt(e.target.value) || 0)}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            type="number"
            label="Monthly Price"
            inputProps={{ step: '0.01', min: 0 }}
            value={newPrice}
            onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ color: '#6a6a6a', textTransform: 'none' }}>Cancel</Button>
          <Button
            onClick={handleUpdateCredits}
            variant="contained"
            sx={{
              backgroundColor: '#1a1a1a',
              textTransform: 'none',
              borderRadius: '10px',
              px: 2.5,
              '&:hover': { backgroundColor: '#2a2a2a' },
            }}
          >
            Save changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle>Delete Customer</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete customer: <strong>{selectedCustomer?.username}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#6a6a6a', textTransform: 'none' }}>Cancel</Button>
          <Button
            onClick={handleDeleteCustomer}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', borderRadius: '10px', px: 2.5 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ borderRadius: '12px' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
