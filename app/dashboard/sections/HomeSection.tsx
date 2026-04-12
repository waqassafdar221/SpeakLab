'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
  Stack,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { ttsApi, userApi, PublicVoice, buildProxyUrl } from '@/lib/api';

export default function HomeSection() {
  const [textInput, setTextInput] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [credits, setCredits] = useState(0);
  const [username, setUsername] = useState('User');
  const [publicVoices, setPublicVoices] = useState<PublicVoice>({});
  const [selectedPublicVoice, setSelectedPublicVoice] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [costDeducted, setCostDeducted] = useState(0);

  // Fetch public voices and user info on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [voicesData, userData] = await Promise.all([
          ttsApi.getPublicVoices(),
          userApi.getMe(),
        ]);
        setPublicVoices(voicesData);
        setCredits(userData.credits);
        setUsername(userData.username);

        const firstVoiceKey = Object.keys(voicesData)[0];
        if (firstVoiceKey) {
          setSelectedPublicVoice(firstVoiceKey);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load voices. Please refresh the page.');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleGenerate = async () => {
    setError('');
    setAudioUrl(null);

    if (!selectedPublicVoice) {
      setError('Please select a voice');
      return;
    }

    if (!textInput.trim()) {
      setError('Please enter text to generate speech');
      return;
    }

    setIsLoading(true);
    try {
      const response = await ttsApi.generateSpeech({
        text: textInput,
        public_voice: selectedPublicVoice,
      });

      setCostDeducted(response.deducted);
      setCredits(prev => prev - response.deducted);
      setAudioUrl(response.output_url);
      setShowSuccess(true);
    } catch (err) {
      console.error('TTS generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate speech. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#1a1a1a',
            mb: 1,
            letterSpacing: '-0.02em',
          }}
        >
          Welcome back, {username}!
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a4a4a' }}>
          Quick access to generate speech with public voices
        </Typography>
      </Box>

      {isLoadingData ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Main Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' },
              gap: 3,
            }}
          >
            {/* Left Column - Text Generation */}
            <Card
              sx={{
                p: 3,
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#1a1a1a',
                  mb: 2,
                }}
              >
                Quick Text to Speech
              </Typography>

              {/* Voice Selection */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select voice</InputLabel>
                <Select
                  value={selectedPublicVoice}
                  label="Select voice"
                  onChange={(e) => setSelectedPublicVoice(e.target.value)}
                  sx={{
                    borderRadius: '12px',
                    backgroundColor: '#f6f5f1',
                    '&:hover': {
                      backgroundColor: '#ebe9e0',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#fff',
                    },
                  }}
                >
                  {Object.entries(publicVoices).map(([key, voice]) => (
                    <MenuItem key={key} value={key}>
                      {voice.name} ({voice.country})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                multiline
                minRows={8}
                maxRows={12}
                fullWidth
                placeholder="Type or paste your text here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                sx={{
                  mb: 2,
                  flexGrow: 1,
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

              {/* Character Counter */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#6a6a6a',
                    fontWeight: 500,
                  }}
                >
                  {textInput.length} characters
                </Typography>
              </Box>

              {/* Error Message */}
              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                  {error}
                </Alert>
              )}

              {/* Audio Player */}
              {audioUrl && (
                <Box sx={{ mb: 2 }}>
                  <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>
                    Speech generated! {costDeducted} credits deducted.
                  </Alert>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      backgroundColor: '#f6f5f1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <PlayArrowIcon sx={{ color: '#1a1a1a' }} />
                    <audio
                      controls
                      src={buildProxyUrl(audioUrl)}
                      style={{ flex: 1 }}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </Box>
                </Box>
              )}

              {/* Generate Button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleGenerate}
                disabled={!selectedPublicVoice || !textInput.trim() || isLoading}
                sx={{
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                py: 1.5,
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                mb: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: '#2a2a2a',
                  transform: 'scale(1.02)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                },
                '&:disabled': {
                  backgroundColor: '#d0d0d0',
                  color: '#6a6a6a',
                },
              }}
            >
                {isLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Generate Speech'}
              </Button>

              {/* Credits Info */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexWrap: 'wrap',
                  mt: 2,
                }}
              >
                <Chip
                  label={`Credits: ${credits}`}
                  sx={{
                    backgroundColor: '#1a1a1a',
                    color: '#fff',
                    fontWeight: 600,
                  }}
                />
                <Typography variant="caption" sx={{ color: '#6a6a6a' }}>
                  1 credit per character
                </Typography>
              </Box>
            </Card>

            {/* Right Column - Voices List */}
            <Card
              sx={{
                p: 3,
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#1a1a1a',
                  mb: 2,
                }}
              >
                Available Voices
              </Typography>

              {Object.keys(publicVoices).length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexGrow: 1,
                    textAlign: 'center',
                    p: 3,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ color: '#6a6a6a', mb: 2 }}
                  >
                    No voices available
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: '#9a9a9a' }}
                  >
                    Please refresh the page
                  </Typography>
                </Box>
              ) : (
                <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                  {Object.entries(publicVoices).map(([key, voice]) => {
                    const isSelected = selectedPublicVoice === key;
                    return (
                      <ListItem
                        key={key}
                        sx={{
                          borderRadius: '12px',
                          mb: 1,
                          backgroundColor: isSelected ? '#1a1a1a' : '#f6f5f1',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: isSelected ? '#2a2a2a' : '#ebe9e0',
                          },
                        }}
                        onClick={() => setSelectedPublicVoice(key)}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              backgroundColor: isSelected ? '#fff' : '#1a1a1a',
                              color: isSelected ? '#1a1a1a' : '#fff',
                              width: 40,
                              height: 40,
                            }}
                          >
                            {voice.language?.charAt(0).toUpperCase() || 'V'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={voice.name}
                          secondary={`${voice.country} • ${voice.gender}`}
                          primaryTypographyProps={{
                            fontWeight: 600,
                            color: isSelected ? '#fff' : '#1a1a1a',
                          }}
                          secondaryTypographyProps={{
                            color: isSelected ? 'rgba(255, 255, 255, 0.7)' : '#6a6a6a',
                          }}
                        />
                        {isSelected && (
                          <Chip
                            label="Selected"
                            size="small"
                            sx={{
                              backgroundColor: '#fff',
                              color: '#1a1a1a',
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Card>
          </Box>
        </>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          sx={{
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          }}
        >
          Speech generated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
