'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
} from '@mui/material';
import { adminApi, Package } from '@/lib/api';

export default function CreateUserSection() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    package_id: 0,
    initial_credits: 0,
  });
  const [packages, setPackages] = useState<Package[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await adminApi.listPackages();
        setPackages(data);
      } catch (err) {
        console.error('Failed to fetch packages:', err);
        setError('Failed to load packages');
      } finally {
        setIsLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'initial_credits' || name === 'package_id' ? parseInt(value) || 0 : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.initial_credits < 0) {
      newErrors.initial_credits = 'Credits cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await adminApi.createUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        package_id: formData.package_id || undefined,
        initial_credits: formData.initial_credits,
      });

      setShowSuccess(true);
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        package_id: 0,
        initial_credits: 0,
      });
    } catch (err) {
      console.error('Failed to create user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingPackages) {
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
          Create New User
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a4a4a' }}>
          Add a new user account to the system
        </Typography>
      </Box>

      {/* Create User Form */}
      <Card
        sx={{
          p: 4,
          maxWidth: 600,
          borderRadius: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Username */}
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
            sx={{ mb: 2 }}
          />

          {/* Email */}
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            sx={{ mb: 2 }}
          />

          {/* Password */}
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            sx={{ mb: 2 }}
          />

          {/* Package Selection */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Package (Optional)</InputLabel>
            <Select
              name="package_id"
              value={formData.package_id}
              label="Package (Optional)"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  package_id: parseInt(String(e.target.value)) || 0,
                }))
              }
            >
              <MenuItem value={0}>None</MenuItem>
              {packages.map((pkg) => (
                <MenuItem key={pkg.id} value={pkg.id}>
                  {pkg.name} ({pkg.credits_per_period} credits)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Initial Credits */}
          <TextField
            fullWidth
            label="Initial Credits"
            name="initial_credits"
            type="number"
            value={formData.initial_credits}
            onChange={handleChange}
            error={!!errors.initial_credits}
            helperText={errors.initial_credits}
            sx={{ mb: 3 }}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{
              backgroundColor: '#1a1a1a',
              color: '#fff',
              py: 1.5,
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#2a2a2a',
              },
              '&:disabled': {
                backgroundColor: '#d0d0d0',
                color: '#6a6a6a',
              },
            }}
          >
            {isLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Create User'}
          </Button>
        </Box>
      </Card>

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
          User created successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
