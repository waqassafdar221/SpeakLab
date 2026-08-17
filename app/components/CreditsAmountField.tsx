'use client';

import React from 'react';
import { Box, TextField, Chip } from '@mui/material';

const PRESETS = [
  { label: '100K', value: 100_000 },
  { label: '500K', value: 500_000 },
  { label: '1M', value: 1_000_000 },
  { label: '2M', value: 2_000_000 },
  { label: '3M', value: 3_000_000 },
  { label: '5M', value: 5_000_000 },
  { label: '10M', value: 10_000_000 },
];

interface CreditsAmountFieldProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  error?: boolean;
  helperText?: string;
  sx?: object;
}

export default function CreditsAmountField({
  label = 'Initial Credits',
  value,
  onChange,
  error,
  helperText,
  sx,
}: CreditsAmountFieldProps) {
  return (
    <Box sx={sx}>
      <TextField
        fullWidth
        type="number"
        label={label}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        error={error}
        helperText={helperText}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
        {PRESETS.map((preset) => {
          const selected = value === preset.value;
          return (
            <Chip
              key={preset.value}
              label={preset.label}
              size="small"
              onClick={() => onChange(preset.value)}
              sx={{
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: selected ? '#1a1a1a' : 'transparent',
                color: selected ? '#fff' : '#4a4a4a',
                border: selected ? '1px solid #1a1a1a' : '1px solid rgba(0,0,0,0.15)',
                '&:hover': {
                  backgroundColor: selected ? '#2a2a2a' : 'rgba(0,0,0,0.05)',
                },
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
