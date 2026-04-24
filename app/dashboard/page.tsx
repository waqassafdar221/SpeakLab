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
import CreditsSection from './sections/CreditsSection';
import SettingsSection from './sections/SettingsSection';

const drawerWidth = 240;

const navItems = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  { id: 'tts', label: 'Text to Speech', icon: <RecordVoiceOverIcon /> },
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
        background: 'linear-gradient(180deg, #ebe9e0 0%, #e5e3d8 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
            fontSize: '1rem',
            fontWeight: 700,
          }}
        >
          S
        </Avatar>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          SpeakStudio
        </Typography>
      </Box>

      {/* Navigation List */}
      <List sx={{ pt: 2, px: 1.5, flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.id}
            selected={selectedSection === item.id}
            onClick={() => handleNavClick(item.id)}
            sx={{
              borderRadius: '8px',
              mb: 0.5,
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                backgroundColor: 'rgba(26, 26, 26, 0.08)',
                borderLeft: '3px solid #1a1a1a',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(26, 26, 26, 0.12)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(26, 26, 26, 0.04)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: selectedSection === item.id ? '#1a1a1a' : '#4a4a4a',
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: selectedSection === item.id ? 600 : 500,
                color: selectedSection === item.id ? '#1a1a1a' : '#4a4a4a',
              }}
            />
          </ListItemButton>
        ))}
      </List>

      {/* Admin Panel Button (only for admins) */}
      {isAdmin && (
        <Box sx={{ px: 1.5, pb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AdminPanelSettingsIcon />}
            onClick={() => router.push('/admin')}
            sx={{
              backgroundColor: '#1a1a1a',
              color: '#fff',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              py: 1,
              '&:hover': {
                backgroundColor: '#2a2a2a',
              },
            }}
          >
            Admin Panel
          </Button>
        </Box>
      )}

      {/* User Info at Bottom */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              backgroundColor: '#1a1a1a',
              fontSize: '0.875rem',
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.875rem' }}
            >
              {userName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6a6a6a' }}>
              {userRole}
            </Typography>
          </Box>
        </Box>
        
        {/* Account Info - Only show for non-admin users */}
        {!isAdmin && (
          <Box sx={{ mb: 2, px: 1 }}>
            {memberSince && (
              <Typography variant="caption" sx={{ display: 'block', color: '#6a6a6a', mb: 0.5 }}>
                Member since {memberSince}
              </Typography>
            )}
            {expiryDate && (
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  color: new Date(expiryDate) < new Date() ? '#d32f2f' : '#6a6a6a',
                  fontWeight: new Date(expiryDate) < new Date() ? 600 : 400
                }}
              >
                Expires: {expiryDate}
              </Typography>
            )}
          </Box>
        )}
        
        {/* Back to Home Link */}
        <Box
          component="a"
          href="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.5,
            borderRadius: '8px',
            textDecoration: 'none',
            backgroundColor: 'rgba(26, 26, 26, 0.04)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(26, 26, 26, 0.08)',
            },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: '1rem', color: '#4a4a4a' }} />
          <Typography
            variant="body2"
            sx={{ color: '#4a4a4a', fontWeight: 500, fontSize: '0.875rem' }}
          >
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
