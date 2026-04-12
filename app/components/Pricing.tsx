'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';

// Pricing plans data
const pricingPlans = [
  {
    id: 1,
    name: 'Starter',
    price: '2,999',
    popular: false,
    features: [
      '10,000 characters/month',
      '5 AI voices',
      'Basic audio quality',
      'Commercial use',
      'Email support',
    ],
  },
  {
    id: 2,
    name: 'Creator',
    price: '5,999',
    popular: false,
    features: [
      '50,000 characters/month',
      '15 AI voices',
      'HD audio quality',
      'Commercial use',
      'Priority email support',
    ],
  },
  {
    id: 3,
    name: 'Studio',
    price: '9,999',
    popular: false,
    features: [
      '100,000 characters/month',
      '30 AI voices',
      'Studio audio quality',
      'Multi-language support',
      'Priority support',
    ],
  },
  {
    id: 4,
    name: 'Pro',
    price: '14,999',
    popular: true,
    features: [
      '250,000 characters/month',
      'All 50+ AI voices',
      'Ultra HD audio quality',
      'Voice cloning (beta)',
      'API access',
      '24/7 priority support',
    ],
  },
  {
    id: 5,
    name: 'Agency',
    price: '24,999',
    popular: false,
    features: [
      '500,000 characters/month',
      'All premium voices',
      'Ultra HD + lossless',
      'Voice cloning',
      'API access + webhooks',
      'Dedicated account manager',
    ],
  },
  {
    id: 6,
    name: 'Enterprise',
    price: 'Custom',
    popular: false,
    features: [
      'Unlimited characters',
      'Custom voice creation',
      'White-label solution',
      'On-premise deployment',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
];

export default function Pricing() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <Box
      ref={ref}
      sx={{
        minHeight: 'auto',
        background: 'linear-gradient(135deg, #f6f5f1 0%, #ffffff 50%, #f6f5f1 100%)',
        py: { xs: 6, md: 10 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 800,
                mb: 2,
                color: '#1a1a1a',
                letterSpacing: '-0.02em',
              }}
            >
              Choose your{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                plan
              </Box>
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.1rem' },
                color: '#4a4a4a',
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              Select the perfect plan for your voice generation needs
            </Typography>
          </Box>
        </motion.div>

        {/* Pricing Cards Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {pricingPlans.map((plan, index) => (
            <Box key={plan.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{ height: '100%' }}
              >
                <Card
                  sx={{
                    height: '100%',
                    minHeight: '520px',
                    maxHeight: '520px',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '16px',
                    border: plan.popular
                      ? '2px solid #1a1a1a'
                      : '1px solid rgba(26, 26, 26, 0.08)',
                    backgroundColor: plan.popular
                      ? 'rgba(26, 26, 26, 0.02)'
                      : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: plan.popular
                        ? '0 24px 70px rgba(26, 26, 26, 0.25)'
                        : '0 20px 50px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        backgroundColor: '#1a1a1a',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                  )}

                  <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Plan Name */}
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 1.5,
                        color: '#1a1a1a',
                        mt: plan.popular ? 2 : 0,
                      }}
                    >
                      {plan.name}
                    </Typography>

                    {/* Price */}
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 800,
                          color: '#1a1a1a',
                          display: 'inline',
                          fontSize: { xs: '2rem', md: '2.5rem' },
                        }}
                      >
                        {plan.price === 'Custom' ? plan.price : `PKR ${plan.price}`}
                      </Typography>
                      {plan.price !== 'Custom' && (
                        <Typography
                          component="span"
                          sx={{
                            color: '#4a4a4a',
                            fontSize: '1rem',
                            ml: 1,
                          }}
                        >
                          /month
                        </Typography>
                      )}
                    </Box>

                    {/* Features List */}
                    <List sx={{ mb: 3, flexGrow: 1 }}>
                      {plan.features.map((feature, idx) => (
                        <ListItem
                          key={idx}
                          sx={{
                            px: 0,
                            py: 0.5,
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircleIcon
                              sx={{
                                fontSize: '1.2rem',
                                color: plan.popular ? '#1a1a1a' : '#4a4a4a',
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={feature}
                            primaryTypographyProps={{
                              fontSize: '0.95rem',
                              color: '#1a1a1a',
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>

                    {/* Get Started Button */}
                    <Button
                      variant={plan.popular ? 'contained' : 'outlined'}
                      fullWidth
                      size="large"
                      sx={{
                        py: 1.5,
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        ...(plan.popular
                          ? {
                              backgroundColor: '#1a1a1a',
                              color: '#fff',
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                              '&:hover': {
                                backgroundColor: '#2a2a2a',
                                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
                                transform: 'scale(1.05)',
                              },
                            }
                          : {
                              color: '#1a1a1a',
                              borderColor: '#1a1a1a',
                              borderWidth: '2px',
                              '&:hover': {
                                borderWidth: '2px',
                                backgroundColor: 'rgba(26, 26, 26, 0.04)',
                                transform: 'scale(1.05)',
                              },
                            }),
                      }}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
