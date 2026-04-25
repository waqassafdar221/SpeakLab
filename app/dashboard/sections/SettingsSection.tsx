'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Button,
  TextField,
  IconButton,
  InputAdornment,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { userApi, TokenManager } from '@/lib/api';
import { useRouter } from 'next/navigation';

/* ── Password strength helpers ── */
function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '#e8e8e8' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 1, label: 'Weak', color: '#ef4444' };
  if (score === 2) return { score: 2, label: 'Fair', color: '#f97316' };
  if (score === 3) return { score: 3, label: 'Good', color: '#eab308' };
  return { score: 4, label: 'Strong', color: '#22c55e' };
}

function StrengthBar({ password }: { password: string }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: i <= score ? color : '#e8e8e8',
              transition: 'background-color 0.25s ease',
            }}
          />
        ))}
      </Box>
      <Typography variant="caption" sx={{ color, fontWeight: 600 }}>{label}</Typography>
    </Box>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 1.75,
        borderBottom: '1px solid rgba(26,26,26,0.06)',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: '#f6f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#4a4a4a' }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: '#9a9a9a', fontWeight: 500, display: 'block', mb: 0.2 }}>{label}</Typography>
        <Typography variant="body2" sx={{ color: '#1a1a1a', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

function SecurityRow({ icon, title, sub, badge }: { icon: React.ReactNode; title: string; sub: string; badge?: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.75, borderBottom: '1px solid rgba(26,26,26,0.06)', '&:last-of-type': { borderBottom: 'none' } }}>
      <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: '#f6f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#4a4a4a' }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>{title}</Typography>
        <Typography variant="caption" sx={{ color: '#9a9a9a' }}>{sub}</Typography>
      </Box>
      {badge && (
        <Chip label={badge} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 600, backgroundColor: 'rgba(26,26,26,0.07)', color: '#6a6a6a', borderRadius: '6px' }} />
      )}
    </Box>
  );
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#f6f5f1',
    fontSize: '0.9rem',
    '& fieldset': { borderColor: 'transparent' },
    '&:hover fieldset': { borderColor: 'rgba(26,26,26,0.2)' },
    '&.Mui-focused fieldset': { borderColor: '#1a1a1a', borderWidth: '1.5px' },
  },
};

export default function SettingsSection() {
  const router = useRouter();

  /* account info */
  const [userData, setUserData] = useState({ username: '', email: '', role: '', createdAt: '', credits: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  /* password change */
  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    userApi.getMe().then((data) => {
      setUserData({
        username: data.username,
        email: data.email || '—',
        role: data.is_admin ? 'Administrator' : 'User',
        createdAt: new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        credits: data.credits,
      });
    }).catch(() => {
      setLoadError('Failed to load account settings');
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const handleChangePassword = async () => {
    setPwError('');
    setPwSuccess(false);
    if (!currentPw) { setPwError('Enter your current password'); return; }
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters'); return; }
    if (getStrength(newPw).score < 2) { setPwError('Choose a stronger password'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return; }
    setPwLoading(true);
    try {
      await userApi.changePassword(currentPw, newPw);
      setPwSuccess(true);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setTimeout(() => { setShowPwForm(false); setPwSuccess(false); }, 1800);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => { TokenManager.remove(); router.push('/login'); };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#1a1a1a' }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1, letterSpacing: '-0.02em' }}>
          Settings
        </Typography>
        <Typography variant="body1" sx={{ color: '#6a6a6a' }}>
          Your account details and preferences
        </Typography>
      </Box>

      {loadError && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{loadError}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' }, gap: 3, alignItems: 'start' }}>

        {/* LEFT — Profile */}
        <Card sx={{ p: 3, borderRadius: '16px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
            <Avatar sx={{ width: 64, height: 64, background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)', fontSize: '1.6rem', fontWeight: 700, flexShrink: 0 }}>
              {userData.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2, mb: 0.5 }}>
                {userData.username}
              </Typography>
              <Chip
                label={userData.role}
                size="small"
                sx={{
                  height: 22, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em', borderRadius: '6px',
                  backgroundColor: userData.role === 'Administrator' ? '#1a1a1a' : 'rgba(26,26,26,0.08)',
                  color: userData.role === 'Administrator' ? '#fff' : '#4a4a4a',
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ mb: 0.5, borderColor: 'rgba(26,26,26,0.06)' }} />
          <InfoRow icon={<PersonOutlineIcon sx={{ fontSize: 18 }} />} label="Username" value={userData.username} />
          <InfoRow icon={<EmailOutlinedIcon sx={{ fontSize: 18 }} />} label="Email Address" value={userData.email} />
          <InfoRow icon={<ShieldOutlinedIcon sx={{ fontSize: 18 }} />} label="Account Role" value={userData.role} />
          <InfoRow icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 18 }} />} label="Member Since" value={userData.createdAt} />
          <InfoRow icon={<CreditCardOutlinedIcon sx={{ fontSize: 18 }} />} label="Available Credits" value={userData.credits.toLocaleString()} />
        </Card>

        {/* RIGHT — Security + Change Password + Sign out */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          {/* Security overview */}
          <Card sx={{ p: 3, borderRadius: '16px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>Security</Typography>
            <Typography variant="caption" sx={{ color: '#9a9a9a', display: 'block', mb: 2 }}>Account security overview</Typography>
            <SecurityRow icon={<LockOutlinedIcon sx={{ fontSize: 18 }} />} title="Password" sub="Your password is set and protected" badge="Protected" />
            <SecurityRow icon={<DevicesOutlinedIcon sx={{ fontSize: 18 }} />} title="Two-Factor Authentication" sub="Add an extra layer of security" badge="Not enabled" />
          </Card>

          {/* Change password card */}
          <Card sx={{ p: 3, borderRadius: '16px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            {/* Header row — always visible */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: '#f6f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#4a4a4a' }}>
                  <LockOutlinedIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a1a' }}>Change Password</Typography>
                  <Typography variant="caption" sx={{ color: '#9a9a9a' }}>Update your account password</Typography>
                </Box>
              </Box>
              {!showPwForm && (
                <Button
                  size="small"
                  onClick={() => { setShowPwForm(true); setPwError(''); setPwSuccess(false); }}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    px: 1.75,
                    py: 0.6,
                    backgroundColor: '#1a1a1a',
                    color: '#fff',
                    '&:hover': { backgroundColor: '#2a2a2a' },
                  }}
                >
                  Change
                </Button>
              )}
            </Box>

            {/* Collapsible form */}
            {showPwForm && (
              <>
                <Divider sx={{ my: 2, borderColor: 'rgba(26,26,26,0.06)' }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* Current password */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#4a4a4a', display: 'block', mb: 0.75 }}>
                  Current Password
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  sx={fieldSx}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowCurrent(v => !v)} edge="end" sx={{ color: '#9a9a9a' }}>
                          {showCurrent ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* New password + strength bar */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#4a4a4a', display: 'block', mb: 0.75 }}>
                  New Password
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  sx={fieldSx}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowNew(v => !v)} edge="end" sx={{ color: '#9a9a9a' }}>
                          {showNew ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <StrengthBar password={newPw} />
              </Box>

              {/* Confirm password */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#4a4a4a', display: 'block', mb: 0.75 }}>
                  Confirm New Password
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  sx={{
                    ...fieldSx,
                    '& .MuiOutlinedInput-root': {
                      ...fieldSx['& .MuiOutlinedInput-root'],
                      '& fieldset': {
                        borderColor: confirmPw && newPw && confirmPw === newPw ? '#22c55e' : 'transparent',
                      },
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {confirmPw && newPw && confirmPw === newPw
                          ? <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#22c55e' }} />
                          : (
                            <IconButton size="small" onClick={() => setShowConfirm(v => !v)} edge="end" sx={{ color: '#9a9a9a' }}>
                              {showConfirm ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                            </IconButton>
                          )
                        }
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {pwError && (
                <Alert severity="error" sx={{ borderRadius: '10px', py: 0.5, fontSize: '0.82rem' }}>{pwError}</Alert>
              )}
              {pwSuccess && (
                <Alert severity="success" sx={{ borderRadius: '10px', py: 0.5, fontSize: '0.82rem' }}>
                  Password changed successfully
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleChangePassword}
                  disabled={pwLoading || !currentPw || !newPw || !confirmPw}
                  sx={{
                    backgroundColor: '#1a1a1a',
                    color: '#fff',
                    py: 1.25,
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': { backgroundColor: '#2a2a2a', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' },
                    '&:disabled': { backgroundColor: '#e8e8e8', color: '#aaa', boxShadow: 'none' },
                  }}
                >
                  {pwLoading
                    ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CircularProgress size={16} sx={{ color: '#fff' }} /><span>Updating…</span></Box>
                    : 'Update Password'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => { setShowPwForm(false); setCurrentPw(''); setNewPw(''); setConfirmPw(''); setPwError(''); setPwSuccess(false); }}
                  disabled={pwLoading}
                  sx={{
                    borderColor: 'rgba(26,26,26,0.2)',
                    color: '#6a6a6a',
                    py: 1.25,
                    px: 2.5,
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    '&:hover': { borderColor: '#1a1a1a', color: '#1a1a1a', backgroundColor: 'rgba(26,26,26,0.03)' },
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
              </>
            )}
          </Card>

          {/* Sign out card */}
          <Card sx={{ p: 3, borderRadius: '16px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>Sign Out</Typography>
            <Typography variant="body2" sx={{ color: '#6a6a6a', mb: 2.5 }}>
              You will be returned to the login page.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon sx={{ fontSize: '1rem' }} />}
              onClick={handleLogout}
              sx={{
                borderColor: 'rgba(26,26,26,0.2)',
                color: '#1a1a1a',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '10px',
                px: 3,
                py: 1,
                '&:hover': { borderColor: '#1a1a1a', backgroundColor: 'rgba(26,26,26,0.04)' },
              }}
            >
              Sign Out
            </Button>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
