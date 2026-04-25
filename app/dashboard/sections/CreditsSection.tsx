'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import { userApi } from '@/lib/api';

function InfoRow({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        py: 1.75,
        borderBottom: '1px solid rgba(26,26,26,0.06)',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: '#f6f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#4a4a4a' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 0.2 }}>{title}</Typography>
        <Typography variant="caption" sx={{ color: '#9a9a9a' }}>{sub}</Typography>
      </Box>
    </Box>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: '14px',
        backgroundColor: 'rgba(255,255,255,0.08)',
        flex: 1,
      }}
    >
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1 }}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', mt: 0.5, display: 'block' }}>
          {sub}
        </Typography>
      )}
    </Box>
  );
}

export default function CreditsSection() {
  const [credits, setCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await userApi.getMe();
        setCredits(userData.credits);
      } catch {
        setError('Failed to load credits information');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#1a1a1a' }} />
      </Box>
    );
  }

  const approxWords   = Math.floor(credits / 5);
  const approxMinutes = Math.floor(credits / 900);
  const approxChars   = credits;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1, letterSpacing: '-0.02em' }}>
          Credits
        </Typography>
        <Typography variant="body1" sx={{ color: '#6a6a6a' }}>
          Your balance and usage breakdown
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>
      )}

      {/* Two-column layout on desktop */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {/* LEFT — Balance card */}
        <Card
          sx={{
            p: 3.5,
            borderRadius: '16px',
            background: 'linear-gradient(145deg, #1a1a1a 0%, #2e2e2e 100%)',
            border: 'none',
            boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <BoltIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Available Balance
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: { xs: '3.5rem', sm: '4.5rem' },
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              mb: 0.5,
            }}
          >
            {credits.toLocaleString()}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.35)', mb: 3 }}>
            credits remaining
          </Typography>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 3 }} />

          {/* Stats row */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <StatTile label="Characters" value={approxChars.toLocaleString()} sub="for TTS" />
            <StatTile label="~Words" value={approxWords.toLocaleString()} sub="approx." />
            <StatTile label="~Minutes" value={approxMinutes.toLocaleString()} sub="of audio" />
          </Box>
        </Card>

        {/* RIGHT — Info + Support */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* How credits work */}
          <Card
            sx={{
              p: 3,
              borderRadius: '16px',
              backgroundColor: '#fff',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
              How Credits Work
            </Typography>
            <Typography variant="caption" sx={{ color: '#9a9a9a', display: 'block', mb: 1.5 }}>
              Understanding your balance
            </Typography>
            <InfoRow
              icon={<TextFieldsIcon sx={{ fontSize: 18 }} />}
              title="1 credit = 1 character"
              sub="Deducted per character when generating speech"
            />
            <InfoRow
              icon={<RecordVoiceOverIcon sx={{ fontSize: 18 }} />}
              title="Instant deduction"
              sub="Credits are used the moment audio is generated"
            />
            <InfoRow
              icon={<AutorenewIcon sx={{ fontSize: 18 }} />}
              title="Plan-based allocation"
              sub="Topped up each period or added by admin"
            />
            <InfoRow
              icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
              title="No expiry on unused credits"
              sub="Your balance carries over until used"
            />
          </Card>

          {/* Get more */}
          <Card
            sx={{
              p: 3,
              borderRadius: '16px',
              backgroundColor: '#fff',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '12px', backgroundColor: '#f6f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <SupportAgentIcon sx={{ fontSize: 20, color: '#4a4a4a' }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
                  Need More Credits?
                </Typography>
                <Typography variant="body2" sx={{ color: '#6a6a6a' }}>
                  Contact your administrator to top up your balance or upgrade your plan.
                </Typography>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
