'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { ttsApi, userApi, PublicVoice, buildProxyUrl } from '@/lib/api';

// Language to flag emoji mapping
const LANGUAGE_FLAGS: { [language: string]: string } = {
  'English': '🇬🇧',
  'Arabic': '🇸🇦',
  'Hindi': '🇮🇳',
  'Urdu': '🇵🇰',
  'French': '🇫🇷',
  'Chinese': '🇨🇳',
  'German': '🇩🇪',
  'Japanese': '🇯🇵',
  'Vietnamese': '🇻🇳',
  'Turkish': '🇹🇷',
  'Korean': '🇰🇷',
  'Spanish': '🇪🇸',
  'Afrikaans': '🇿🇦',
};

export default function TextToSpeechSection() {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [publicVoices, setPublicVoices] = useState<PublicVoice>({});
  const [voicesByCountry, setVoicesByCountry] = useState<{ [country: string]: Array<{ key: string; data: any }> }>({});
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [credits, setCredits] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [costDeducted, setCostDeducted] = useState(0);

  // Fetch public voices and user credits on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [voicesData, userData] = await Promise.all([
          ttsApi.getPublicVoices(),
          userApi.getMe(),
        ]);
        setPublicVoices(voicesData);
        setCredits(userData.credits);
        
        // Get unique languages
        const languages = Array.from(new Set(Object.values(voicesData).map(v => v.language))).sort();
        setAvailableLanguages(languages);
        
        // Group voices by country
        const grouped: { [country: string]: Array<{ key: string; data: any }> } = {};
        Object.entries(voicesData).forEach(([key, voice]) => {
          const country = voice.country;
          if (!grouped[country]) {
            grouped[country] = [];
          }
          grouped[country].push({ key, data: voice });
        });
        setVoicesByCountry(grouped);
        
        // Set first voice as default
        const firstVoiceKey = Object.keys(voicesData)[0];
        if (firstVoiceKey) {
          setSelectedVoice(firstVoiceKey);
          setSelectedLanguage(voicesData[firstVoiceKey].language);
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

  // Filter voices by selected language
  const filteredVoicesByCountry = React.useMemo(() => {
    const filtered: { [country: string]: Array<{ key: string; data: any }> } = {};
    Object.entries(voicesByCountry).forEach(([country, voices]) => {
      const countryVoices = voices.filter(v => v.data.language === selectedLanguage);
      if (countryVoices.length > 0) {
        filtered[country] = countryVoices;
      }
    });
    return filtered;
  }, [voicesByCountry, selectedLanguage]);

  // Reset voice selection when language changes
  useEffect(() => {
    const voicesForLanguage = Object.values(filteredVoicesByCountry).flat();
    if (voicesForLanguage.length > 0 && !voicesForLanguage.find(v => v.key === selectedVoice)) {
      setSelectedVoice(voicesForLanguage[0].key);
    }
  }, [selectedLanguage, filteredVoicesByCountry, selectedVoice]);

  const handleGenerate = async () => {
    setError('');
    setAudioUrl(null);
    
    if (!selectedVoice) {
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
        public_voice: selectedVoice,
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
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
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
          Text to Speech
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a4a4a' }}>
          Convert text to speech using public AI voices
        </Typography>
      </Box>

      {/* Main Card */}
      <Card
        sx={{
          p: 4,
          borderRadius: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
        }}
      >
        {isLoadingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Language Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select language</InputLabel>
              <Select
                value={selectedLanguage}
                label="Select language"
                onChange={(e) => setSelectedLanguage(e.target.value)}
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
                {availableLanguages.map((language) => (
                  <MenuItem key={language} value={language}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: '1.2rem' }}>{LANGUAGE_FLAGS[language] || '🌐'}</span>
                      <span>{language}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Voice Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select voice</InputLabel>
              <Select
                value={selectedVoice}
                label="Select voice"
                onChange={(e) => setSelectedVoice(e.target.value)}
                disabled={isLoadingData}
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
                {Object.entries(filteredVoicesByCountry)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([country, voices]) => [
                    <MenuItem key={`header-${country}`} disabled sx={{ fontWeight: 700, color: '#1a1a1a', backgroundColor: 'rgba(0,0,0,0.03)' }}>
                      {country}
                    </MenuItem>,
                    ...voices.map(({ key, data }) => (
                      <MenuItem key={key} value={key} sx={{ pl: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <Typography sx={{ flexGrow: 1 }}>{data.name}</Typography>
                          <Chip
                            label={data.gender}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              backgroundColor: data.gender === 'Female' ? '#e91e63' : '#2196f3',
                              color: '#fff',
                            }}
                          />
                        </Box>
                      </MenuItem>
                    ))
                  ])}
              </Select>
            </FormControl>

        {/* Text Input */}
        <TextField
          multiline
          minRows={10}
          maxRows={15}
          fullWidth
          label="Text to speak"
          placeholder="Enter the text you want to convert to speech..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          helperText={`${textInput.length} characters`}
          sx={{
            mb: 2,
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

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}

        {/* Generate Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleGenerate}
          disabled={!selectedVoice || !textInput.trim() || isLoading}
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

        {/* Audio Player */}
        {audioUrl && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>
              Speech generated successfully! {costDeducted} credits deducted.
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

        {/* Credits Info */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#6a6a6a', mb: 1 }}>
            This will use your account credits (1 credit per character)
          </Typography>
          <Chip
            label={`Credits left: ${credits}`}
            sx={{
              backgroundColor: '#1a1a1a',
              color: '#fff',
              fontWeight: 600,
            }}
          />
        </Box>
        </>
        )}
      </Card>

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
