'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';

export default function ContactAbout() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add backend integration
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <Box
      ref={ref}
      sx={{
        minHeight: 'auto',
        background: 'linear-gradient(135deg, #e8e6df 0%, #d9d7d0 100%)',
        py: { xs: 8, md: 12 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
            },
            gap: { xs: 6, md: 8 },
            alignItems: 'start',
          }}
        >
          {/* Left Column - About SpeakLab */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6 }}
          >
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                  fontWeight: 800,
                  mb: 3,
                  color: '#1a1a1a',
                  letterSpacing: '-0.02em',
                }}
              >
                About{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  SpeakLab
                </Box>
              </Typography>

              <Stack spacing={2.5}>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.05rem' },
                    color: '#2a2a2a',
                    lineHeight: 1.8,
                  }}
                >
                  SpeakLab is a cutting-edge AI voice generation platform that transforms text into
                  natural, human-like speech. Our mission is to democratize voice technology and
                  make professional-quality AI voices accessible to everyone.
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.05rem' },
                    color: '#2a2a2a',
                    lineHeight: 1.8,
                  }}
                >
                  With support for 50+ languages and 200+ premium voices, we empower content
                  creators, educators, developers, and businesses to bring their ideas to life
                  through the power of AI-generated speech.
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.05rem' },
                    color: '#2a2a2a',
                    lineHeight: 1.8,
                  }}
                >
                  Our advanced neural voice synthesis technology delivers studio-quality audio for
                  podcasts, audiobooks, videos, e-learning content, and more. Join thousands of
                  satisfied users who trust SpeakLab for their voice generation needs.
                </Typography>

                {/* Key Stats */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 3,
                    mt: 2,
                    pt: 3,
                    borderTop: '2px solid rgba(26, 26, 26, 0.1)',
                  }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        color: '#1a1a1a',
                        mb: 0.5,
                      }}
                    >
                      50+
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#4a4a4a',
                        fontSize: '0.875rem',
                      }}
                    >
                      Languages
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        color: '#1a1a1a',
                        mb: 0.5,
                      }}
                    >
                      200+
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#4a4a4a',
                        fontSize: '0.875rem',
                      }}
                    >
                      AI Voices
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        color: '#1a1a1a',
                        mb: 0.5,
                      }}
                    >
                      10K+
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#4a4a4a',
                        fontSize: '0.875rem',
                      }}
                    >
                      Happy Users
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>
          </motion.div>

          {/* Right Column - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Box
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                p: { xs: 3, md: 4 },
                border: '1px solid rgba(26, 26, 26, 0.08)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  fontWeight: 700,
                  mb: 1,
                  color: '#1a1a1a',
                }}
              >
                Contact us
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#4a4a4a',
                  mb: 3,
                  fontSize: '0.95rem',
                }}
              >
                Have a question? We'd love to hear from you.
              </Typography>

              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    required
                    name="name"
                    label="Name"
                    variant="outlined"
                    value={formData.name}
                    onChange={handleInputChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        '&:hover fieldset': {
                          borderColor: '#1a1a1a',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1a1a1a',
                        },
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    required
                    name="email"
                    label="Email"
                    type="email"
                    variant="outlined"
                    value={formData.email}
                    onChange={handleInputChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        '&:hover fieldset': {
                          borderColor: '#1a1a1a',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1a1a1a',
                        },
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    required
                    name="message"
                    label="Message"
                    multiline
                    rows={5}
                    variant="outlined"
                    value={formData.message}
                    onChange={handleInputChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        '&:hover fieldset': {
                          borderColor: '#1a1a1a',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1a1a1a',
                        },
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    endIcon={<SendIcon />}
                    sx={{
                      backgroundColor: '#1a1a1a',
                      color: '#ffffff',
                      fontSize: '1rem',
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: '8px',
                      textTransform: 'none',
                      boxShadow: '0 4px 16px rgba(26, 26, 26, 0.2)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: '#2a2a2a',
                        transform: 'translateY(-2px) scale(1.02)',
                        boxShadow: '0 6px 24px rgba(26, 26, 26, 0.3)',
                      },
                    }}
                  >
                    Send Message
                  </Button>
                </Stack>
              </form>
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}
