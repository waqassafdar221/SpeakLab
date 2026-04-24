'use client';

import React from 'react';
import { Box, Container, Typography, Link, Stack } from '@mui/material';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1a1a1a',
        color: '#f6f5f1',
        py: 4,
        borderTop: '1px solid rgba(246, 245, 241, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          {/* Copyright */}
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.95rem',
              color: '#f6f5f1',
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
             {currentYear} SpeakStudio. All rights reserved.
          </Typography>

          {/* Links */}
          <Stack
            direction="row"
            spacing={3}
            sx={{
              alignItems: 'center',
            }}
          >
            <Link
              href="/privacy"
              underline="none"
              sx={{
                color: '#f6f5f1',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#ffffff',
                  textDecoration: 'underline',
                },
              }}
            >
              Privacy Policy
            </Link>
            <Box
              sx={{
                width: '1px',
                height: '16px',
                backgroundColor: 'rgba(246, 245, 241, 0.3)',
              }}
            />
            <Link
              href="/terms"
              underline="none"
              sx={{
                color: '#f6f5f1',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#ffffff',
                  textDecoration: 'underline',
                },
              }}
            >
              Terms of Service
            </Link>
            <Box
              sx={{
                width: '1px',
                height: '16px',
                backgroundColor: 'rgba(246, 245, 241, 0.3)',
              }}
            />
            <Link
              href="/contact"
              underline="none"
              sx={{
                color: '#f6f5f1',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#ffffff',
                  textDecoration: 'underline',
                },
              }}
            >
              Contact
            </Link>
          </Stack>
        </Stack>

        {/* Optional: Tagline or additional info */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 2,
            color: 'rgba(246, 245, 241, 0.6)',
            fontSize: '0.85rem',
          }}
        >
          Powered by AI  Crafted with precision
        </Typography>
      </Container>
    </Box>
  );
}
