'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  adminApi,
  AdminStats,
  UsersGrowthPoint,
  JobsUsagePoint,
} from '@/lib/api';

const cardSx = {
  p: 3,
  borderRadius: '16px',
  backgroundColor: 'rgba(255,255,255,0.9)',
  border: '1px solid rgba(0,0,0,0.06)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
};

const chartCardSx = {
  ...cardSx,
  p: 3,
};

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
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

const tooltipStyle = {
  backgroundColor: '#1a1a1a',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  fontSize: 12,
};

export default function AdminDashboardSection() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersGrowth, setUsersGrowth] = useState<UsersGrowthPoint[]>([]);
  const [jobsUsage, setJobsUsage] = useState<JobsUsagePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, growthData, usageData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getUsersGrowth(),
          adminApi.getJobsUsage(),
        ]);
        setStats(statsData);
        setUsersGrowth(growthData.map((p) => ({ ...p, date: formatDateLabel(p.date) })));
        setJobsUsage(usageData.map((p) => ({ ...p, date: formatDateLabel(p.date) })));
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    load();
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
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: '#1a1a1a', mb: 0.5, letterSpacing: '-0.02em' }}
        >
          Admin Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: '#6a6a6a' }}>
          Platform overview · last 30 days
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {/* Stat cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={<PeopleIcon sx={{ color: '#fff', fontSize: 28 }} />}
            value={stats?.total_users ?? 0}
            label="Total Users"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={<AccountBalanceWalletIcon sx={{ color: '#fff', fontSize: 28 }} />}
            value={(stats?.total_credits_allocated ?? 0).toLocaleString()}
            label="Credits Allocated"
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

      {/* Charts */}
      <Grid container spacing={2.5}>
        {/* Users growth */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={chartCardSx}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
              New Users
            </Typography>
            <Typography variant="caption" sx={{ color: '#9a9a9a' }}>
              Registrations per day
            </Typography>
            <Box sx={{ mt: 2, height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usersGrowth} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9a9a9a' }}
                    tickLine={false}
                    axisLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9a9a9a' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: '#aaa', fontSize: 11 }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(val) => [val ?? 0, 'New users']}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#1a1a1a"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#1a1a1a' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* TTS generations */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={chartCardSx}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
              TTS Generations
            </Typography>
            <Typography variant="caption" sx={{ color: '#9a9a9a' }}>
              Jobs completed per day
            </Typography>
            <Box sx={{ mt: 2, height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobsUsage} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9a9a9a' }}
                    tickLine={false}
                    axisLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9a9a9a' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: '#aaa', fontSize: 11 }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(val) => [val ?? 0, 'Jobs']}
                  />
                  <Bar dataKey="jobs" fill="#1a1a1a" radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Credits consumed */}
        <Grid size={{ xs: 12 }}>
          <Card sx={chartCardSx}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
              Credits Consumed
            </Typography>
            <Typography variant="caption" sx={{ color: '#9a9a9a' }}>
              Characters processed per day (TTS)
            </Typography>
            <Box sx={{ mt: 2, height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={jobsUsage} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="creditsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9a9a9a' }}
                    tickLine={false}
                    axisLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9a9a9a' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: '#aaa', fontSize: 11 }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(val) => [Number(val ?? 0).toLocaleString(), 'Credits']}
                  />
                  <Area
                    type="monotone"
                    dataKey="credits"
                    stroke="#1a1a1a"
                    strokeWidth={2}
                    fill="url(#creditsGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#1a1a1a' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
