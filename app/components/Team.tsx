'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
} from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';

// Team members data
const teamMembers = [
  {
    id: 1,
    name: 'Waqas Safdar',
    role: 'Founder & CEO',
    bio: 'Visionary entrepreneur leading the company’s mission, strategy, and growth. Passionate about building innovative AI solutions and making advanced voice technology accessible to everyone.',
    avatar: '',
    social: {
      linkedin: '#',
      twitter: '#',
      github: '#',
    },
  },
  {
    id: 2,
    name: 'Rizwan Attiq',
    role: 'Co-Founder',
    bio: 'Co-founder focused on business development, strategic partnerships, and expanding the company’s reach. Dedicated to turning bold ideas into sustainable growth opportunities.',
    avatar: '',
    social: {
      linkedin: '#',
      twitter: '#',
      github: '#',
    },
  },
  {
    id: 3,
    name: 'Muhammad Sohaib Safdar',
    role: 'CTO',
    bio: 'Technology leader driving product innovation and technical excellence. Specializes in AI systems, scalable architecture, and building cutting-edge voice technology solutions.',
    avatar: '',
    social: {
      linkedin: '#',
      twitter: '#',
      github: '#',
    },
  },
  {
    id: 4,
    name: 'Alina Tariq',
    role: 'Managing Director',
    bio: 'Dynamic leader overseeing daily operations, team coordination, and organizational growth. Committed to ensuring smooth execution of business goals and long-term success.',
    avatar: '',
    social: {
      linkedin: '#',
      twitter: '#',
      github: '#',
    },
  },
];

export default function Team() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <Box
      ref={ref}
      sx={{
        minHeight: 'auto',
        background: 'linear-gradient(135deg, #ffffff 0%, #f6f5f1 50%, #ffffff 100%)',
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
              Meet the{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                team
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
              The passionate minds behind SpeakLab
            </Typography>
          </Box>
        </motion.div>

        {/* Team Cards Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}
        >
          {teamMembers.map((member, index) => (
            <Box key={member.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{ height: '100%' }}
              >
                <Card
                  sx={{
                    height: '100%',
                    minHeight: '380px',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '16px',
                    border: '1px solid rgba(26, 26, 26, 0.08)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      flexGrow: 1,
                    }}
                  >
                    {/* Avatar */}
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        mb: 2,
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
                        fontSize: '3rem',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      {member.avatar}
                    </Avatar>

                    {/* Name */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 0.5,
                        color: '#1a1a1a',
                      }}
                    >
                      {member.name}
                    </Typography>

                    {/* Role */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: '#4a4a4a',
                        fontWeight: 600,
                        mb: 2,
                        fontSize: '0.875rem',
                      }}
                    >
                      {member.role}
                    </Typography>

                    {/* Bio */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#4a4a4a',
                        lineHeight: 1.6,
                        mb: 2,
                        flexGrow: 1,
                        fontSize: '0.9rem',
                      }}
                    >
                      {member.bio}
                    </Typography>

                    {/* Social Icons */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        justifyContent: 'center',
                      }}
                    >
                      <IconButton
                        size="small"
                        href={member.social.linkedin}
                        sx={{
                          color: '#1a1a1a',
                          backgroundColor: 'rgba(26, 26, 26, 0.05)',
                          '&:hover': {
                            backgroundColor: '#1a1a1a',
                            color: '#fff',
                          },
                        }}
                      >
                        <LinkedInIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        href={member.social.twitter}
                        sx={{
                          color: '#1a1a1a',
                          backgroundColor: 'rgba(26, 26, 26, 0.05)',
                          '&:hover': {
                            backgroundColor: '#1a1a1a',
                            color: '#fff',
                          },
                        }}
                      >
                        <TwitterIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        href={member.social.github}
                        sx={{
                          color: '#1a1a1a',
                          backgroundColor: 'rgba(26, 26, 26, 0.05)',
                          '&:hover': {
                            backgroundColor: '#1a1a1a',
                            color: '#fff',
                          },
                        }}
                      >
                        <GitHubIcon fontSize="small" />
                      </IconButton>
                    </Box>
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
