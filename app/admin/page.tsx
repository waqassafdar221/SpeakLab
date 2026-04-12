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
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { TokenManager, userApi, authApi } from '@/lib/api';

// Import admin sections
import AdminDashboardSection from './sections/AdminDashboardSection';
import UsersManagementSection from './sections/UsersManagementSection';
import CreateUserSection from './sections/CreateUserSection';

const drawerWidth = 240;

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'users', label: 'Manage Users', icon: <PeopleIcon /> },
  { id: 'create-user', label: 'Create User', icon: <PersonAddIcon /> },
];

export default function AdminPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check authentication and admin status on mount
  useEffect(() => {
    const checkAdmin = async () => {
      const token = TokenManager.get();
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const userData = await userApi.getMe();
        if (!userData.is_admin) {
          router.push('/dashboard');
        } else {
          setIsAdmin(true);
          setIsChecking(false);
        }
      } catch (error) {
        console.error('Failed to verify admin:', error);
        router.push('/login');
      }
    };

    checkAdmin();
  }, [router]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSectionChange = (sectionId: string) => {
    setSelectedSection(sectionId);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    router.push('/login');
  };

  const renderSection = () => {
    switch (selectedSection) {
      case 'dashboard':
        return <AdminDashboardSection />;
      case 'users':
        return <UsersManagementSection />;
      case 'create-user':
        return <CreateUserSection />;
      default:
        return <AdminDashboardSection />;
    }
  };

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

  const drawer = (
    <Box
      sx={{
        height: '100%',
        backgroundColor: '#1a1a1a',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo/Brand */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          SpeakLab
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          Admin Panel
        </Typography>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, py: 2 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.id}
            selected={selectedSection === item.id}
            onClick={() => handleSectionChange(item.id)}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: '8px',
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      {/* Logout Button */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          }}
        >
          <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile Menu Button */}
      {isMobile && (
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1300,
            backgroundColor: '#1a1a1a',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#2a2a2a',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            border: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          backgroundColor: '#f6f5f1',
          minHeight: '100vh',
          ml: { md: 0 },
          mt: { xs: 8, md: 0 },
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
