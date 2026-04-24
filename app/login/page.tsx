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
  Snackbar,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useRouter } from 'next/navigation';
import { authApi, TokenManager } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    usernameOrEmail: '',
    password: '',
    general: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    setErrors((prev) => ({
      ...prev,
      [name]: '',
      general: '',
    }));
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      usernameOrEmail: '',
      password: '',
      general: '',
    };

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Username or email is required';
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    if (!isValid) {
      newErrors.general = 'Please fill in all fields';
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      try {
        // Call the actual login API
        const response = await authApi.login({
          username: formData.usernameOrEmail,
          password: formData.password,
        });

        // Store the token
        TokenManager.set(response.access_token);

        // Show success message
        console.log('Login success:', response);
        setShowSuccess(true);
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } catch (error) {
        // Handle login error
        console.error('Login error:', error);
        setErrors({
          usernameOrEmail: '',
          password: '',
          general: error instanceof Error ? error.message : 'Login failed. Please check your credentials and try again.',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f6f5f1 0%, #ffffff 50%, #f6f5f1 100%)',
        position: 'relative',
        overflow: 'hidden',
        px: 2,
        py: 4,
      }}
    >
      {/* Decorative background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26, 26, 26, 0.03) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          right: -150,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26, 26, 26, 0.04) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ width: '100%', maxWidth: '460px', zIndex: 1 }}
      >
        <Card
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Brand Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
            }}
          >
            {/* Avatar Icon */}
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mb: 2,
                background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
                boxShadow: '0 8px 24px rgba(26, 26, 26, 0.2)',
              }}
            >
              <Typography variant="h4" sx={{ color: '#fff' }}>
                S
              </Typography>
            </Avatar>

            {/* Title */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 1,
                color: '#1a1a1a',
                letterSpacing: '-0.02em',
              }}
            >
              SpeakStudio
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="body2"
              sx={{
                color: '#4a4a4a',
                textAlign: 'center',
                maxWidth: '320px',
              }}
            >
              Sign in to continue creating AI-powered voices
            </Typography>
          </Box>

          {/* General Error Message */}
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
              {errors.general}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {/* Username/Email Field */}
            <TextField
              fullWidth
              label="Username or Email"
              name="usernameOrEmail"
              type="text"
              variant="outlined"
              margin="normal"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              error={!!errors.usernameOrEmail}
              helperText={errors.usernameOrEmail}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#f6f5f1',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#ebe9e0',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                    '& fieldset': {
                      borderColor: '#1a1a1a',
                      borderWidth: '2px',
                    },
                  },
                },
              }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePassword}
                      edge="end"
                      sx={{ color: '#4a4a4a' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#f6f5f1',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#ebe9e0',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                    '& fieldset': {
                      borderColor: '#1a1a1a',
                      borderWidth: '2px',
                    },
                  },
                },
              }}
            />

            {/* Forgot Password Link */}
            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Typography
                component="a"
                href="#"
                variant="body2"
                sx={{
                  color: '#4a4a4a',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: '#1a1a1a',
                    textDecoration: 'underline',
                  },
                }}
              >
                Forgot password?
              </Typography>
            </Box>

            {/* Sign In Button */}
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
                borderRadius: '999px',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(26, 26, 26, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: '#2a2a2a',
                  boxShadow: '0 12px 32px rgba(26, 26, 26, 0.3)',
                  transform: 'scale(1.02)',
                },
                '&:active': {
                  transform: 'scale(0.98)',
                },
                '&:disabled': {
                  backgroundColor: '#4a4a4a',
                  color: '#999',
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: '#fff' }} />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>

          {/* Additional Links */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography
              variant="body2"
              sx={{ color: '#6a6a6a', fontSize: '0.875rem' }}
            >
              Don't have an account?{' '}
              <Typography
                component="a"
                href="#"
                sx={{
                  color: '#1a1a1a',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign up
              </Typography>
            </Typography>
          </Box>

          {/* Back to Home Link */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography
              component="a"
              href="/"
              variant="body2"
              sx={{
                color: '#6a6a6a',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: '#1a1a1a',
                },
              }}
            >
              ← Back to home
            </Typography>
          </Box>
        </Card>
      </motion.div>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          sx={{
            width: '100%',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          }}
        >
          Logged in successfully! Redirecting...
        </Alert>
      </Snackbar>
    </Box>
  );
}
