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
import { adminApi, AdminUser } from '@/lib/api';
import CreditsAmountField from '@/app/components/CreditsAmountField';

export default function UsersManagementSection() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); // MUI TablePagination is 0-indexed; API is 1-indexed
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newCredits, setNewCredits] = useState(0);
  const [newPrice, setNewPrice] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.listUsers({ page: page + 1, pageSize: rowsPerPage, search });
      setUsers(data.items);
      setTotal(data.total);
      setError('');
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, search]);

  // Debounce search input before it triggers a refetch
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(0);
      setSearch(searchInput);
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleEditClick = (user: AdminUser) => {
    setSelectedUser(user);
    setNewCredits(user.credits);
    setNewPrice(user.monthly_price);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (user: AdminUser) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleUpdateCredits = async () => {
    if (!selectedUser) return;

    try {
      await Promise.all([
        adminApi.updateUserCredits(selectedUser.id, newCredits),
        adminApi.updateUserPrice(selectedUser.id, newPrice),
      ]);
      setSuccessMessage('Account updated successfully');
      setShowSuccess(true);
      setEditDialogOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update account:', err);
      setError('Failed to update account');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await adminApi.deleteUser(selectedUser.id);
      setSuccessMessage('User deleted successfully');
      setShowSuccess(true);
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete user');
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
          Manage Users
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a4a4a' }}>
          View and manage all user accounts
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

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

      {/* Users Table */}
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
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Credits</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Price/mo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Vendor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} sx={{ color: '#9a9a9a', textAlign: 'center', py: 4 }}>
                    {search ? 'No users match your search.' : 'No users yet.'}
                  </TableCell>
                </TableRow>
              )}
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    },
                  }}
                >
                  <TableCell>{user.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.credits.toLocaleString()}
                      size="small"
                      sx={{
                        backgroundColor: '#1a1a1a',
                        color: '#fff',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: user.monthly_price > 0 ? '#1a1a1a' : '#9a9a9a', fontWeight: user.monthly_price > 0 ? 600 : 400 }}>
                    {user.monthly_price > 0 ? `PKR ${user.monthly_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role === 'admin' ? 'Admin' : user.role === 'vendor' ? 'Vendor' : 'Customer'}
                      size="small"
                      color={user.role === 'admin' ? 'error' : user.role === 'vendor' ? 'info' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {user.invite_pending ? (
                      <Chip label="Pending" size="small" color="warning" variant="outlined" />
                    ) : (
                      <Chip label="Active" size="small" color="success" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell sx={{ color: '#6a6a6a' }}>
                    {user.vendor_username ?? '—'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(user)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(user)}
                      disabled={user.role === 'admin'}
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
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Account</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Update credits and price for: <strong>{selectedUser?.username}</strong>
          </Typography>
          <CreditsAmountField
            label="Credits"
            value={newCredits}
            onChange={setNewCredits}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            type="number"
            label="Monthly Price (PKR)"
            inputProps={{ step: '0.01', min: 0 }}
            value={newPrice}
            onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateCredits}
            variant="contained"
            sx={{
              backgroundColor: '#1a1a1a',
              '&:hover': { backgroundColor: '#2a2a2a' },
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete user: <strong>{selectedUser?.username}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
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
