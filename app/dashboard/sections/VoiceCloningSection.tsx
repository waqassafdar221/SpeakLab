'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function VoiceCloningSection() {
  return (
    <Box>
      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
          Voice Cloning Removed
        </Typography>
        <Typography variant="body1" sx={{ color: '#6a6a6a' }}>
          This feature is currently disabled. Please use Text to Speech with public voices.
        </Typography>
      </Paper>
    </Box>
  );
}
