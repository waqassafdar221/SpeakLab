'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Button,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { TokenManager, userApi } from '@/lib/api';

// Import dashboard sections
import HomeSection from './sections/HomeSection';
import TextToSpeechSection from './sections/TextToSpeechSection';
import TranscriptionSection from './sections/TranscriptionSection';
import CreditsSection from './sections/CreditsSection';
import SettingsSection from './sections/SettingsSection';

const drawerWidth = 240;

const navItems = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  { id: 'tts', label: 'Text to Speech', icon: <RecordVoiceOverIcon /> },
  { id: 'transcription', label: 'Audio to Text', icon: <SubtitlesIcon /> },
  { id: 'credits', label: 'Credits', icon: <AccountBalanceWalletIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
];

export default function DashboardPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState('home');
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userRole, setUserRole] = useState('User');
  const [memberSince, setMemberSince] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = TokenManager.get();
      if (!token) {
        router.push('/login');
      } else {
        try {
          const userData = await userApi.getMe();
          setIsAdmin(userData.is_admin);
          setUserName(userData.username);
          setUserRole(userData.is_admin ? 'Administrator' : 'User');
          
          // Format member since date
          if (userData.created_at) {
            const createdDate = new Date(userData.created_at);
            setMemberSince(createdDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
          }
          
          // Format expiry date
          if (userData.expiry_date) {
            const expDate = new Date(userData.expiry_date);
            setExpiryDate(expDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
          }
          
          setIsChecking(false);
        } catch (error) {
          console.error('Failed to get user info:', error);
          setIsChecking(false);
        }
      }
    };

    checkAuth();
  }, [router]);

  // Show loading screen while checking auth
  if (isChecking) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f6f5f1',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (sectionId: string) => {
    setSelectedSection(sectionId);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const renderSection = () => {
    switch (selectedSection) {
      case 'home':
        return <HomeSection />;
      case 'tts':
        return <TextToSpeechSection />;
      case 'transcription':
        return <TranscriptionSection />;
      case 'credits':
        return <CreditsSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <HomeSection />;
    }
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        backgroundColor: '#ffffff',
        borderRight: '1px solid rgba(26,26,26,0.07)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Brand */}
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '0.85rem',
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          S
        </Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.02em', lineHeight: 1 }}
        >
          SpeakStudio
        </Typography>
      </Box>

      <Box sx={{ mx: 2, borderBottom: '1px solid rgba(26,26,26,0.07)', mb: 1.5 }} />

      {/* Navigation */}
      <List sx={{ px: 1.5, flexGrow: 1, pt: 0 }}>
        {navItems.map((item) => {
          const active = selectedSection === item.id;
          return (
            <ListItemButton
              key={item.id}
              selected={active}
              onClick={() => handleNavClick(item.id)}
              sx={{
                borderRadius: '10px',
                mb: 0.5,
                px: 1.5,
                py: 1,
                transition: 'all 0.15s ease',
                backgroundColor: active ? '#1a1a1a' : 'transparent',
                '&.Mui-selected': {
                  backgroundColor: '#1a1a1a',
                  '&:hover': { backgroundColor: '#2a2a2a' },
                },
                '&:hover': {
                  backgroundColor: active ? '#2a2a2a' : 'rgba(26,26,26,0.05)',
                },
              }}
            >
              <ListItemIcon sx={{ color: active ? '#fff' : '#6a6a6a', minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 500,
                  color: active ? '#fff' : '#4a4a4a',
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Admin button */}
      {isAdmin && (
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <Button
            fullWidth
            startIcon={<AdminPanelSettingsIcon sx={{ fontSize: '1rem' }} />}
            onClick={() => router.push('/admin')}
            sx={{
              backgroundColor: 'rgba(26,26,26,0.06)',
              color: '#1a1a1a',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              py: 1,
              justifyContent: 'flex-start',
              px: 1.5,
              '&:hover': { backgroundColor: 'rgba(26,26,26,0.1)' },
            }}
          >
            Admin Panel
          </Button>
        </Box>
      )}

      {/* User footer */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(26,26,26,0.07)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
              fontSize: '0.875rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#9a9a9a', display: 'block' }}>
              {userRole}
              {!isAdmin && expiryDate && (
                <Box component="span" sx={{ color: new Date(expiryDate) < new Date() ? '#ef4444' : '#9a9a9a' }}>
                  {' · '}Expires {expiryDate}
                </Box>
              )}
            </Typography>
          </Box>
        </Box>

        <Box
          component="a"
          href="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 0.75,
            px: 1,
            borderRadius: '8px',
            textDecoration: 'none',
            transition: 'background 0.15s',
            '&:hover': { backgroundColor: 'rgba(26,26,26,0.05)' },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: '0.9rem', color: '#9a9a9a' }} />
          <Typography variant="caption" sx={{ color: '#9a9a9a', fontWeight: 500 }}>
            Back to Home
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1300,
          }}
        >
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              backgroundColor: '#1a1a1a',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#2a2a2a',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
        }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: '#f6f5f1',
          minHeight: '100vh',
          p: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 10, md: 4 },
          maxWidth: '100%',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
