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
  Snackbar,
  Grid,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import { vendorApi, Package } from '@/lib/api';
import CreditsAmountField from '@/app/components/CreditsAmountField';

const fieldSx = {
  mb: 2.5,
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#f6f5f1',
    transition: 'background-color 0.2s ease',
    '&:hover': { backgroundColor: '#ebe9e0' },
    '&.Mui-focused': {
      backgroundColor: '#fff',
      '& fieldset': { borderColor: '#1a1a1a', borderWidth: '2px' },
    },
  },
};

export default function CreateCustomerSection() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    package_id: 0,
    initial_credits: 0,
    monthly_price: 0,
  });
  const [packages, setPackages] = useState<Package[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Customer created successfully!');
  const [justCreated, setJustCreated] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await vendorApi.listPackages();
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
      [name]: name === 'initial_credits' || name === 'package_id'
        ? parseInt(value) || 0
        : name === 'monthly_price'
        ? parseFloat(value) || 0
        : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setJustCreated(false);
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

    if (formData.initial_credits < 0) {
      newErrors.initial_credits = 'Credits cannot be negative';
    }

    if (formData.monthly_price < 0) {
      newErrors.monthly_price = 'Price cannot be negative';
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
      const result = await vendorApi.createCustomer({
        username: formData.username,
        email: formData.email,
        package_id: formData.package_id || undefined,
        initial_credits: formData.initial_credits,
        monthly_price: formData.monthly_price,
      });

      setSuccessMessage(
        result.email_sent
          ? `Customer created — an invite email was sent to ${formData.email}.`
          : 'Customer created, but the invite email failed to send.'
      );
      setShowSuccess(true);
      setJustCreated(true);
      // Reset form
      setFormData({
        username: '',
        email: '',
        package_id: 0,
        initial_credits: 0,
        monthly_price: 0,
      });
    } catch (err) {
      console.error('Failed to create customer:', err);
      setError(err instanceof Error ? err.message : 'Failed to create customer');
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

  const selectedPackage = packages.find((p) => p.id === formData.package_id);

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
          Create New Customer
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a4a4a' }}>
          Give a customer their own login — they'll get an email to set their password
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Form */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            sx={{
              p: { xs: 3, sm: 4 },
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
                sx={fieldSx}
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
                sx={fieldSx}
              />

              {/* Package — interactive cards */}
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#6a6a6a', mb: 1.25, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Package
              </Typography>
              {packages.length === 0 ? (
                <Typography sx={{ fontSize: '0.85rem', color: '#9a9a9a', mb: 2.5 }}>
                  No packages configured yet.
                </Typography>
              ) : (
                <Grid container spacing={1.5} sx={{ mb: 3 }}>
                  <Grid size={6}>
                    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.15 }}>
                      <Box
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, package_id: 0 }));
                          setJustCreated(false);
                        }}
                        sx={{
                          position: 'relative',
                          cursor: 'pointer',
                          borderRadius: '14px',
                          p: 2,
                          height: '100%',
                          border: formData.package_id === 0 ? '2px solid #1a1a1a' : '1px solid rgba(0,0,0,0.1)',
                          backgroundColor: formData.package_id === 0 ? '#1a1a1a' : '#f6f5f1',
                          transition: 'all 0.2s ease',
                          '&:hover': { borderColor: '#1a1a1a' },
                        }}
                      >
                        {formData.package_id === 0 && (
                          <CheckCircleIcon sx={{ position: 'absolute', top: 10, right: 10, fontSize: 18, color: '#fff' }} />
                        )}
                        <InventoryIcon sx={{ fontSize: 20, mb: 1, color: formData.package_id === 0 ? '#fff' : '#1a1a1a' }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: formData.package_id === 0 ? '#fff' : '#1a1a1a' }}>
                          None
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: formData.package_id === 0 ? 'rgba(255,255,255,0.7)' : '#8a8a8a' }}>
                          No package assigned
                        </Typography>
                      </Box>
                    </motion.div>
                  </Grid>
                  {packages.map((pkg) => {
                    const selected = formData.package_id === pkg.id;
                    return (
                      <Grid size={6} key={pkg.id}>
                        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.15 }}>
                          <Box
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, package_id: pkg.id }));
                              setJustCreated(false);
                            }}
                            sx={{
                              position: 'relative',
                              cursor: 'pointer',
                              borderRadius: '14px',
                              p: 2,
                              height: '100%',
                              border: selected ? '2px solid #1a1a1a' : '1px solid rgba(0,0,0,0.1)',
                              backgroundColor: selected ? '#1a1a1a' : '#f6f5f1',
                              transition: 'all 0.2s ease',
                              '&:hover': { borderColor: '#1a1a1a' },
                            }}
                          >
                            {selected && (
                              <CheckCircleIcon sx={{ position: 'absolute', top: 10, right: 10, fontSize: 18, color: '#fff' }} />
                            )}
                            <InventoryIcon sx={{ fontSize: 20, mb: 1, color: selected ? '#fff' : '#1a1a1a' }} />
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: selected ? '#fff' : '#1a1a1a' }}>
                              {pkg.name}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: selected ? 'rgba(255,255,255,0.7)' : '#8a8a8a' }}>
                              {pkg.credits_per_period.toLocaleString()} credits
                            </Typography>
                          </Box>
                        </motion.div>
                      </Grid>
                    );
                  })}
                </Grid>
              )}

              {/* Initial Credits */}
              <CreditsAmountField
                label="Initial Credits"
                value={formData.initial_credits}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, initial_credits: value }));
                  setErrors((prev) => ({ ...prev, initial_credits: '' }));
                  setJustCreated(false);
                }}
                error={!!errors.initial_credits}
                helperText={errors.initial_credits}
                sx={{ mb: 2.5 }}
              />

              {/* Monthly Price */}
              <TextField
                fullWidth
                label="Monthly Price (PKR)"
                name="monthly_price"
                type="number"
                inputProps={{ step: '0.01', min: 0 }}
                value={formData.monthly_price}
                onChange={handleChange}
                error={!!errors.monthly_price}
                helperText={errors.monthly_price || "What you're charging this customer — 0 if not billed"}
                sx={fieldSx}
              />

              {/* Submit Button */}
              <Box sx={{ mt: 1 }}>
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{
                      backgroundColor: justCreated ? '#2f7d68' : '#1a1a1a',
                      color: '#fff',
                      py: 1.5,
                      borderRadius: '999px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 8px 24px rgba(26, 26, 26, 0.2)',
                      transition: 'background-color 0.25s ease',
                      '&:hover': {
                        backgroundColor: justCreated ? '#2f7d68' : '#2a2a2a',
                      },
                      '&:disabled': {
                        backgroundColor: '#d0d0d0',
                        color: '#6a6a6a',
                      },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} sx={{ color: '#fff' }} />
                    ) : justCreated ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 20 }} /> Created
                      </Box>
                    ) : (
                      'Create Customer'
                    )}
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Live preview */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            sx={{
              p: 3,
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
              position: { md: 'sticky' },
              top: { md: 24 },
            }}
          >
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#6a6a6a', mb: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Preview
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <motion.div layout>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    backgroundColor: '#1a1a1a',
                  }}
                >
                  {formData.username.trim() ? formData.username.trim().charAt(0).toUpperCase() : <PersonIcon />}
                </Avatar>
              </motion.div>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formData.username.trim() || 'New customer'}
                </Typography>
                <Chip
                  label="Customer"
                  size="small"
                  sx={{
                    mt: 0.5,
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(26,26,26,0.08)',
                    color: '#1a1a1a',
                  }}
                />
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <MailOutlineIcon sx={{ fontSize: 18, color: '#9a9a9a' }} />
                <Typography sx={{ fontSize: '0.85rem', color: formData.email.trim() ? '#1a1a1a' : '#b0b0b0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formData.email.trim() || 'email@example.com'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <InventoryIcon sx={{ fontSize: 18, color: '#9a9a9a' }} />
                <Typography sx={{ fontSize: '0.85rem', color: '#1a1a1a' }}>
                  {selectedPackage ? selectedPackage.name : 'No package'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 18, color: '#9a9a9a' }} />
                <Typography sx={{ fontSize: '0.85rem', color: '#1a1a1a' }}>
                  {formData.initial_credits.toLocaleString()} initial credits
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <PaidOutlinedIcon sx={{ fontSize: 18, color: '#9a9a9a' }} />
                <Typography sx={{ fontSize: '0.85rem', color: '#1a1a1a' }}>
                  {formData.monthly_price > 0
                    ? `PKR ${formData.monthly_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / month`
                    : 'Not billed'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#9a9a9a', lineHeight: 1.5 }}>
              They won't be able to sign in until they open the invite email and set a password.
            </Typography>
          </Card>
        </Grid>
      </Grid>

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
