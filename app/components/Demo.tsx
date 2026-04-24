'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Card,
  Paper,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { buildProxyUrl } from '@/lib/api';

// Sample texts for random generation
const sampleTexts = [
  "Welcome to SpeakStudio, where cutting-edge AI technology meets natural human speech. Experience the future of voice generation today.",
  "Artificial intelligence is transforming the way we communicate. Our advanced text-to-speech technology delivers studio-quality results in seconds.",
  "From audiobooks to virtual assistants, our AI voices bring content to life with remarkable clarity and emotion.",
  "Imagine a world where every piece of text can be instantly converted into natural, expressive speech. That world is here with SpeakStudio.",
  "The power of voice has never been more accessible. Create professional voiceovers without expensive equipment or recording studios.",
  "Whether you're creating content for education, entertainment, or business, our AI voices deliver consistent, high-quality results every time.",
];

// Real voice data from our public voices
const voices = [
  { id: 1, name: 'Aria', gender: 'Female', accent: 'United States', avatar: '🇺🇸', key: 'en_us_aria' },
  { id: 2, name: 'Ryan', gender: 'Male', accent: 'United Kingdom', avatar: '🇬🇧', key: 'en_gb_ryan' },
  { id: 3, name: 'Natasha', gender: 'Female', accent: 'Australia', avatar: '🇦🇺', key: 'en_au_natasha' },
  { id: 4, name: 'Liam', gender: 'Male', accent: 'Canada', avatar: '🇨🇦', key: 'en_ca_liam' },
  { id: 5, name: 'Neerja', gender: 'Female', accent: 'India', avatar: '🇮🇳', key: 'en_in_neerja' },
  { id: 6, name: 'Emily', gender: 'Female', accent: 'Ireland', avatar: '🇮🇪', key: 'en_ie_emily' },
  { id: 7, name: 'Mitchell', gender: 'Male', accent: 'New Zealand', avatar: '🇳🇿', key: 'en_nz_mitchell' },
  { id: 8, name: 'Andrew', gender: 'Male', accent: 'United States', avatar: '🇺🇸', key: 'en_us_andrew' },
];

export default function Demo() {
  const [textInput, setTextInput] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<typeof voices[0] | null>(voices[0]);
  const [playingVoiceId, setPlayingVoiceId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [audioCache, setAudioCache] = useState<{ [key: number]: string }>({});
  const [error, setError] = useState<string>('');
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const maxChars = 300;

  const handlePlayVoice = async (voice: typeof voices[0]) => {
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // If clicking the same voice that's playing, just stop it
    if (playingVoiceId === voice.id) {
      setPlayingVoiceId(null);
      return;
    }

    setPlayingVoiceId(voice.id);

    try {
      // Check if we have cached audio for this voice
      if (audioCache[voice.id]) {
        const audio = new Audio(buildProxyUrl(audioCache[voice.id]));
        audioRef.current = audio;
        audio.onended = () => setPlayingVoiceId(null);
        await audio.play();
        return;
      }

      // Generate new audio
      const response = await fetch(buildProxyUrl('/tts/demo'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Hello, this is SpeakStudio. Experience natural, AI-powered voice generation.',
          public_voice: voice.key,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const data = await response.json();
      
      // Cache the audio URL
      setAudioCache((prev) => ({ ...prev, [voice.id]: data.output_url }));

      // Play the audio
      const audio = new Audio(buildProxyUrl(data.output_url));
      audioRef.current = audio;
      audio.onended = () => setPlayingVoiceId(null);
      await audio.play();
    } catch (error) {
      console.error('Error playing voice:', error);
      setPlayingVoiceId(null);
    }
  };

  const handleGenerateVoice = async () => {
    setError('');
    setGeneratedAudioUrl(null);
    
    if (!selectedVoice) {
      setError('Please select a voice');
      return;
    }
    
    if (!textInput.trim()) {
      setError('Please enter some text');
      return;
    }
    
    if (textInput.length > maxChars) {
      setError(`Text must be ${maxChars} characters or less`);
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(buildProxyUrl('/tts/demo'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textInput,
          public_voice: selectedVoice.key,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to generate speech' }));
        throw new Error(errorData.detail || 'Failed to generate speech');
      }

      const data = await response.json();
      setGeneratedAudioUrl(data.output_url);
      
      // Auto-play the generated audio
      const audio = new Audio(buildProxyUrl(data.output_url));
      audioRef.current = audio;
      audio.onended = () => setGeneratedAudioUrl(null);
      await audio.play();
    } catch (error) {
      console.error('Error generating voice:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate speech');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRandomText = () => {
    const randomIndex = Math.floor(Math.random() * sampleTexts.length);
    setTextInput(sampleTexts[randomIndex]);
    setError('');
    setGeneratedAudioUrl(null);
  };

  return (
    <Box
      ref={ref}
      sx={{
        minHeight: 'auto',
        background: 'linear-gradient(135deg, #ffffff 0%, #f6f5f1 50%, #ffffff 100%)',
        py: { xs: 6, md: 8 },
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
          <Box sx={{ textAlign: 'center', mb: 4 }}>
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
              Try it{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                yourself
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
              Enter your text and choose from our collection of natural-sounding voices
            </Typography>
          </Box>
        </motion.div>

        {/* Demo Panels */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            sx={{ alignItems: 'stretch' }}
          >
            {/* Left Panel - Text Input */}
            <Box sx={{ flex: 1 }}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  height: '100%',
                  minHeight: { xs: 'auto', md: '420px' },
                  maxHeight: { md: '420px' },
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(26, 26, 26, 0.08)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: '#1a1a1a',
                  }}
                >
                  Enter Your Text
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleRandomText}
                    sx={{
                      borderColor: '#1a1a1a',
                      color: '#1a1a1a',
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      '&:hover': {
                        borderColor: '#1a1a1a',
                        backgroundColor: 'rgba(26, 26, 26, 0.04)',
                      },
                    }}
                  >
                    🎲 Random Text
                  </Button>
                </Box>

                <TextField
                  multiline
                  minRows={6}
                  maxRows={10}
                  fullWidth
                  placeholder="Type your text here to hear it as AI voice (max 300 characters)"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  error={textInput.length > maxChars}
                  helperText={`${textInput.length} / ${maxChars} characters`}
                  sx={{
                    flex: 1,
                    mb: 1.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#f6f5f1',
                      '&:hover fieldset': {
                        borderColor: '#1a1a1a',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1a1a1a',
                        borderWidth: '2px',
                      },
                    },
                  }}
                />

                {error && (
                  <Alert severity="error" sx={{ mb: 1.5, borderRadius: '8px' }}>
                    {error}
                  </Alert>
                )}

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleGenerateVoice}
                  disabled={!selectedVoice || !textInput.trim() || textInput.length > maxChars || isGenerating}
                  sx={{
                    backgroundColor: '#1a1a1a',
                    color: '#fff',
                    py: 1.8,
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    mt: 'auto',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: '#2a2a2a',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
                      transform: 'scale(1.02) translateY(-2px)',
                    },
                    '&:disabled': {
                      backgroundColor: '#d0d0d0',
                      color: '#6a6a6a',
                    },
                  }}
                >
                  {isGenerating ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Generate Voice'}
                </Button>

                <Typography
                  variant="caption"
                  sx={{
                    textAlign: 'center',
                    color: '#4a4a4a',
                    mt: 1,
                    fontSize: '0.875rem',
                  }}
                >
                  {selectedVoice ? `Selected: ${selectedVoice.name} (${selectedVoice.accent})` : 'Select a voice →'}
                </Typography>
              </Paper>
            </Box>

            {/* Right Panel - Voice Selection */}
            <Box sx={{ flex: 1 }}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  height: '100%',
                  minHeight: { xs: 'auto', md: '420px' },
                  maxHeight: { md: '420px' },
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(26, 26, 26, 0.08)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: '#1a1a1a',
                  }}
                >
                  Choose a Voice
                </Typography>

                <List
                  sx={{
                    flex: 1,
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(26, 26, 26, 0.2)',
                      borderRadius: '4px',
                      '&:hover': {
                        backgroundColor: 'rgba(26, 26, 26, 0.3)',
                      },
                    },
                  }}
                >
                  {voices.map((voice, index) => (
                    <motion.div
                      key={voice.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                    >
                      <ListItem
                        onClick={() => setSelectedVoice(voice)}
                        sx={{
                          mb: 1.5,
                          borderRadius: '12px',
                          backgroundColor: selectedVoice?.id === voice.id ? 'rgba(26, 26, 26, 0.12)' : '#f6f5f1',
                          border: selectedVoice?.id === voice.id ? '2px solid #1a1a1a' : '2px solid transparent',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(26, 26, 26, 0.08)',
                            transform: 'translateX(4px)',
                          },
                        }}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={() => handlePlayVoice(voice)}
                            disabled={playingVoiceId !== null && playingVoiceId !== voice.id}
                            sx={{
                              backgroundColor: playingVoiceId === voice.id ? '#2a2a2a' : '#1a1a1a',
                              color: '#fff',
                              width: 36,
                              height: 36,
                              '&:hover': {
                                backgroundColor: '#2a2a2a',
                              },
                              '&:disabled': {
                                backgroundColor: '#d0d0d0',
                                color: '#6a6a6a',
                              },
                            }}
                          >
                            {playingVoiceId === voice.id ? (
                              <CircularProgress size={16} sx={{ color: '#fff' }} />
                            ) : (
                              <PlayArrowIcon sx={{ fontSize: '1.2rem' }} />
                            )}
                          </IconButton>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
                              fontSize: '1.5rem',
                              width: 48,
                              height: 48,
                            }}
                          >
                            {voice.avatar}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              sx={{
                                fontWeight: 600,
                                fontSize: '1rem',
                                color: '#1a1a1a',
                              }}
                            >
                              {voice.name}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                              <Chip
                                label={voice.gender}
                                size="small"
                                sx={{
                                  height: '20px',
                                  fontSize: '0.7rem',
                                  fontWeight: 500,
                                  backgroundColor:
                                    voice.gender === 'Male'
                                      ? 'rgba(33, 150, 243, 0.15)'
                                      : 'rgba(233, 30, 99, 0.15)',
                                  color:
                                    voice.gender === 'Male' ? '#1976d2' : '#c2185b',
                                }}
                              />
                              <Chip
                                label={voice.accent}
                                size="small"
                                sx={{
                                  height: '20px',
                                  fontSize: '0.7rem',
                                  fontWeight: 500,
                                  backgroundColor: 'rgba(26, 26, 26, 0.08)',
                                  color: '#4a4a4a',
                                }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    </motion.div>
                  ))}
                </List>
              </Paper>
            </Box>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
}
