'use client';

import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useScrollTrigger,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Demo', href: '#demo' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Team', href: '#team' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
  { label: 'About', href: '#about' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Handle scroll for shadow effect and active section
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Determine active section
      const sections = navLinks
        .filter(link => link.href.startsWith('#'))
        .map(link => link.href.substring(1));
      const scrollPosition = window.scrollY + 100; // Offset for better UX

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // If it's an external route (starts with /), don't prevent default
    if (href.startsWith('/')) {
      if (mobileOpen) {
        setMobileOpen(false);
      }
      return;
    }
    
    // For section links, prevent default and scroll
    e.preventDefault();
    const targetId = href.substring(1);
    const element = document.getElementById(targetId);
    
    if (element) {
      const yOffset = -80; // Offset for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    
    // Close mobile drawer
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  // Mobile drawer content
  const drawer = (
    <Box
      sx={{
        width: 280,
        height: '100%',
        background: 'linear-gradient(135deg, rgba(246, 245, 241, 0.98) 0%, rgba(255, 255, 255, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          SpeakLab
        </Typography>
        <IconButton onClick={handleDrawerToggle} edge="end">
          <CloseIcon />
        </IconButton>
      </Box>
      <List sx={{ pt: 3 }}>
        {navLinks.map((link) => (
          <ListItem key={link.href} disablePadding>
            <ListItemButton
              component="a"
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              sx={{
                py: 1.5,
                px: 3,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemText
                primary={link.label}
                primaryTypographyProps={{
                  fontSize: '1rem',
                  fontWeight: activeSection === link.href.substring(1) ? 600 : 500,
                  color: activeSection === link.href.substring(1) ? '#1a1a1a' : '#4a4a4a',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem sx={{ px: 3, pt: 2 }}>
          <Button
            variant="contained"
            fullWidth
            href="/login"
            sx={{
              backgroundColor: '#1a1a1a',
              color: '#fff',
              py: 1.2,
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                backgroundColor: '#2a2a2a',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
              },
            }}
          >
            Sign In
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: 'transparent',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Box
          sx={{
            backdropFilter: 'blur(16px)',
            backgroundColor: 'rgba(246, 245, 241, 0.85)',
            borderBottom: scrolled
              ? '1px solid rgba(0, 0, 0, 0.08)'
              : '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: scrolled
              ? '0 4px 20px rgba(0, 0, 0, 0.08)'
              : 'none',
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <Toolbar
            sx={{
              maxWidth: '1400px',
              width: '100%',
              mx: 'auto',
              px: { xs: 2, sm: 3, md: 4 },
              py: 1,
            }}
          >
            {/* Left: Brand Logo */}
            <Typography
              variant="h5"
              component="a"
              href="/"
              sx={{
                flexGrow: { xs: 1, md: 0 },
                fontWeight: 700,
                fontSize: { xs: '1.5rem', md: '1.75rem' },
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              SpeakLab
            </Typography>

            {/* Center: Navigation Links (Desktop) */}
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: 'none', md: 'flex' },
                justifyContent: 'center',
                alignItems: 'center',
                gap: 3,
              }}
            >
              {navLinks.map((link) => {
                const isActive = !link.href.startsWith('/') && activeSection === link.href.substring(1);
                return (
                  <Button
                    key={link.href}
                    component="a"
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    sx={{
                      color: isActive ? '#1a1a1a' : '#4a4a4a',
                      fontSize: '0.95rem',
                      fontWeight: isActive ? 600 : 500,
                      textTransform: 'none',
                      position: 'relative',
                      px: 1.5,
                      py: 0.75,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        width: isActive ? '80%' : 0,
                        height: '2px',
                        background: 'linear-gradient(90deg, #1a1a1a 0%, #4a4a4a 100%)',
                        transform: 'translateX(-50%)',
                        transition: 'width 0.3s ease',
                      },
                      '&:hover': {
                        backgroundColor: 'transparent',
                        '&::after': {
                          width: '80%',
                        },
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                );
              })}
            </Box>

            {/* Right: Sign In Button (Desktop) */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              <Button
                variant="contained"
                href="/login"
                sx={{
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  px: 3,
                  py: 1,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#2a2a2a',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Sign In
              </Button>
            </Box>

            {/* Mobile Menu Button */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{
                display: { md: 'none' },
                color: '#1a1a1a',
              }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Box>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Spacer to prevent content from going under fixed header */}
      <Toolbar />
    </>
  );
}
