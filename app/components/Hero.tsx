'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Card,
  Stack,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import Lottie from 'lottie-react';
import animationData from '@/assets/Anima Bot.json';

const AudioWave = () => {
  const bars = 12;
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.8,
        height: 80,
        px: 3,
      }}
    >
      {[...Array(bars)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            width: '6px',
            borderRadius: '3px',
            background: 'linear-gradient(180deg, rgba(246, 245, 241, 0.9) 0%, rgba(246, 245, 241, 0.6) 100%)',
          }}
          animate={{
            height: [
              20 + Math.random() * 30,
              40 + Math.random() * 40,
              20 + Math.random() * 30,
            ],
          }}
          transition={{
            duration: 0.8 + Math.random() * 0.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.1,
          }}
        />
      ))}
    </Box>
  );
};

export default function Hero() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Box
      ref={ref}
      sx={{
        minHeight: '85vh',
        background: 'linear-gradient(135deg, #f6f5f1 0%, #ffffff 50%, #f6f5f1 100%)',
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 8, md: 12 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, mt: { xs: 4, md: 8 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 6 }} alignItems="center">
          <Box sx={{ flex: 1, width: '100%' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Box sx={{ maxWidth: { xs: '100%', md: '540px' } }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem', lg: '4rem' },
                    fontWeight: 800,
                    lineHeight: 1.1,
                    mb: 3,
                    color: '#1a1a1a',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Create human-sounding{' '}
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    AI voices
                  </Box>{' '}
                  in seconds
                </Typography>
                <Typography variant="body1" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' }, lineHeight: 1.6, color: '#4a4a4a', mb: 4, maxWidth: '500px' }}>
                  Transform text into natural, expressive speech with our advanced AI voice technology.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <Button 
                    variant="contained" 
                    size="large"
                    href="/dashboard"
                    sx={{ 
                      backgroundColor: '#1a1a1a', 
                      color: '#fff', 
                      px: 4, 
                      py: 1.5, 
                      borderRadius: '50px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: '#2a2a2a',
                        transform: 'scale(1.05)',
                        boxShadow: '0 8px 24px rgba(26, 26, 26, 0.3)',
                      },
                    }}
                  >
                    Try Free
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large" 
                    startIcon={<PlayArrowIcon />}
                    onClick={scrollToDemo}
                    sx={{ 
                      color: '#1a1a1a', 
                      borderColor: '#1a1a1a', 
                      px: 4, 
                      py: 1.5, 
                      borderRadius: '50px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        borderColor: '#1a1a1a',
                        backgroundColor: 'rgba(26, 26, 26, 0.04)',
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 16px rgba(26, 26, 26, 0.15)',
                      },
                    }}
                  >
                    See Demo
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {['Real-time', 'Multilingual', 'Studio-quality'].map((f) => <Chip key={f} label={f} />)}
                </Box>
              </Box>
            </motion.div>
          </Box>
          <Box sx={{ flex: 1, width: '100%' }}>
            <motion.div 
              initial={{ opacity: 0, x: 50 }} 
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }} 
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Card 
                sx={{ 
                  p: 4, 
                  borderRadius: '24px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  },
                }}
              >
                <motion.div 
                  animate={{ 
                    y: [0, -15, 0],
                  }} 
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Box sx={{ width: '100%', maxWidth: 300, height: 300, mx: 'auto' }}>
                    <Lottie 
                      animationData={animationData} 
                      loop={true}
                      autoplay={true}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </Box>
                </motion.div>
                <Box sx={{ width: '100%', background: '#1a1a1a', borderRadius: '16px', py: 2, mt: 3 }}>
                  <AudioWave />
                </Box>
              </Card>
            </motion.div>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
