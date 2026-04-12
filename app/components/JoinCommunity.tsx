'use client';

import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';

export default function JoinCommunity() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const handleJoinWhatsApp = () => {
    // Replace with your actual WhatsApp group invite link
    window.open('https://chat.whatsapp.com/YOUR_GROUP_INVITE_LINK', '_blank');
  };

  return (
    <Box
      ref={ref}
      sx={{
        minHeight: 'auto',
        background: 'linear-gradient(135deg, #f6f5f1 0%, #ebe9e0 100%)',
        py: { xs: 8, md: 12 },
        px: { xs: 2, sm: 3, md: 4 },
        textAlign: 'center',
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
              fontWeight: 800,
              mb: 2,
              color: '#1a1a1a',
              letterSpacing: '-0.02em',
            }}
          >
            Join the{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Community
            </Box>
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              color: '#4a4a4a',
              maxWidth: '600px',
              mx: 'auto',
              mb: 4,
              lineHeight: 1.7,
            }}
          >
            Get real-time AI updates, early-access features & internal engineering notes.
          </Typography>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleJoinWhatsApp}
              startIcon={<WhatsAppIcon />}
              sx={{
                backgroundColor: '#25D366',
                color: '#ffffff',
                fontSize: { xs: '1rem', md: '1.1rem' },
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(37, 211, 102, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: '#128C7E',
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 12px 32px rgba(37, 211, 102, 0.4)',
                },
                '&:active': {
                  transform: 'translateY(0) scale(1)',
                },
              }}
            >
              Join WhatsApp Group
            </Button>
          </motion.div>

          {/* Optional: Small trust indicator */}
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 3,
              color: '#6a6a6a',
              fontSize: '0.875rem',
            }}
          >
            Join 1,000+ AI enthusiasts and developers
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
}
