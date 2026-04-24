'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Tooltip,
  Slider,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { ttsApi, userApi, PublicVoice, VoiceMetadata, buildProxyUrl } from '@/lib/api';

type VoiceEntry = {
  key: string;
  data: VoiceMetadata;
};

const PREVIEW_TEXT_BY_LANGUAGE: Record<string, string[]> = {
  English: [
    'The morning breeze carries a calm and gentle melody.',
    'Please listen carefully as the voice speaks with clarity.',
    'A quiet evening often brings peace to the heart.',
  ],
  Arabic: [
    'في صباحٍ هادئٍ تشرق الشمس بلطفٍ على المدينة.',
    'الصوت الواضح يساعدنا على فهم الكلمات بسهولة.',
    'في المساء الجميل تهدأ القلوب وتطمئن النفوس.',
  ],
  Hindi: [
    'सुबह की ठंडी हवा मन को शांति देती है।',
    'स्पष्ट आवाज़ सुनने का अनुभव बहुत सुखद होता है।',
    'शाम का शांत वातावरण दिल को सुकून देता है।',
  ],
  Urdu: [
    'آج موسم خوشگوار ہے اور ہوا بہت نرم چل رہی ہے۔',
    'صاف آواز سننے سے بات آسانی سے سمجھ آتی ہے۔',
    'پرسکون شام دل کو سکون دیتی ہے۔',
  ],
  French: [
    'La brise du matin apporte une sensation de calme.',
    'Une voix claire rend l’écoute plus agréable.',
    'Le soir tranquille apaise doucement le cœur.',
  ],
  Chinese: [
    '清晨的微风让人感到宁静。',
    '清晰的声音让表达更加自然。',
    '安静的夜晚总能带来平和。',
  ],
  German: [
    'Die frische Morgenluft fühlt sich angenehm ruhig an.',
    'Eine klare Stimme macht das Zuhören leichter.',
    'Ein ruhiger Abend bringt oft innere Gelassenheit.',
  ],
  Japanese: [
    '朝のやわらかな風は心を落ち着かせます。',
    '聞き取りやすい声はとても心地よいです。',
    '静かな夜には穏やかな時間が流れます。',
  ],
  Vietnamese: [
    'Làn gió buổi sáng mang lại cảm giác rất yên bình.',
    'Giọng nói rõ ràng giúp người nghe dễ hiểu hơn.',
    'Buổi tối tĩnh lặng luôn khiến lòng nhẹ nhàng.',
  ],
  Turkish: [
    'Sabah esintisi insana huzur veren bir serinlik getirir.',
    'Net bir ses, dinlemeyi çok daha keyifli yapar.',
    'Sakin bir akşam kalbe dinginlik verir.',
  ],
  Korean: [
    '아침의 부드러운 바람은 마음을 편안하게 합니다.',
    '또렷한 목소리는 듣기에 매우 좋습니다.',
    '조용한 저녁은 마음에 평온함을 줍니다.',
  ],
  Spanish: [
    'La brisa de la mañana transmite una gran tranquilidad.',
    'Una voz clara hace que escuchar sea más agradable.',
    'Una tarde serena siempre calma el corazón.',
  ],
  Afrikaans: [
    'Die sagte oggendwind bring ’n rustige gevoel.',
    '’n Duidelike stem maak luister maklik en aangenaam.',
    '’n Stil aand bring kalmte in die hart.',
  ],
};

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
  const [voiceSearch, setVoiceSearch] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [costDeducted, setCostDeducted] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(1);
  const [previewLoadingVoice, setPreviewLoadingVoice] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const groupedVoices = useMemo(() => {
    const query = voiceSearch.trim().toLowerCase();
    const grouped: Record<string, VoiceEntry[]> = {};

    Object.entries(publicVoices).forEach(([key, voice]) => {
      const searchable = `${voice.name} ${voice.country} ${voice.language} ${voice.gender}`.toLowerCase();
      if (query && !searchable.includes(query)) {
        return;
      }

      if (!grouped[voice.language]) {
        grouped[voice.language] = [];
      }

      grouped[voice.language].push({ key, data: voice });
    });

    Object.values(grouped).forEach((voices) => {
      voices.sort((a, b) => a.data.name.localeCompare(b.data.name));
    });

    return grouped;
  }, [publicVoices, voiceSearch]);

  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

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

        const firstVoiceKey = Object.keys(voicesData).sort()[0];
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
        speed,
        pitch,
        volume,
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

  const getGenderAvatar = (gender?: string) => {
    const normalized = (gender || '').toLowerCase();
    if (normalized.includes('female')) {
      return { symbol: '♀', bg: '#f8d7e8', color: '#9c275f' };
    }
    if (normalized.includes('male')) {
      return { symbol: '♂', bg: '#d9ecff', color: '#1b5e9a' };
    }
    return { symbol: '•', bg: '#ececec', color: '#555' };
  };

  const getRandomPreviewText = (language?: string) => {
    const options = PREVIEW_TEXT_BY_LANGUAGE[language || ''] || PREVIEW_TEXT_BY_LANGUAGE.English;
    return options[Math.floor(Math.random() * options.length)];
  };

  const handlePreviewVoice = async (voiceKey: string) => {
    try {
      setError('');
      setPreviewLoadingVoice(voiceKey);
      const previewLanguage = publicVoices[voiceKey]?.language;
      const previewText = getRandomPreviewText(previewLanguage);

      const response = await fetch(buildProxyUrl('/tts/demo'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: previewText,
          public_voice: voiceKey,
          speed,
          pitch,
          volume,
        }),
      });

      const data = await response.json().catch(() => ({} as { detail?: string; output_url?: string }));
      if (!response.ok) {
        throw new Error((data as { detail?: string }).detail || 'Failed to generate voice preview');
      }

      const outputUrl = (data as { output_url?: string }).output_url;
      if (!outputUrl) {
        throw new Error('Preview audio URL is missing');
      }

      const playableUrl = buildProxyUrl(outputUrl);

      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
      }

      const audio = new Audio(playableUrl);
      previewAudioRef.current = audio;
      await audio.play();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to play voice preview');
    } finally {
      setPreviewLoadingVoice(null);
    }
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
              alignItems: 'start',
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
                  {Object.entries(groupedVoices)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .flatMap(([language, voices]) => [
                      <MenuItem
                        key={`lang-${language}`}
                        disabled
                        sx={{ fontWeight: 700, color: '#1a1a1a', backgroundColor: 'rgba(0,0,0,0.03)' }}
                      >
                        {language}
                      </MenuItem>,
                      ...voices.map(({ key, data }) => (
                        <MenuItem key={key} value={key} sx={{ pl: 3 }}>
                          {data.name} ({data.gender})
                        </MenuItem>
                      )),
                    ])}
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

              <Card
                variant="outlined"
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: '#f8f7f3',
                  borderColor: 'rgba(0,0,0,0.08)',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1a1a' }}>
                  Voice Controls
                </Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#4a4a4a', fontWeight: 600 }}>
                      Speed: {speed.toFixed(2)}x
                    </Typography>
                    <Slider
                      value={speed}
                      min={0.5}
                      max={2}
                      step={0.05}
                      onChange={(_, value) => setSpeed(value as number)}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#4a4a4a', fontWeight: 600 }}>
                      Pitch: {pitch > 0 ? `+${pitch}` : pitch} Hz
                    </Typography>
                    <Slider
                      value={pitch}
                      min={-50}
                      max={50}
                      step={1}
                      onChange={(_, value) => setPitch(value as number)}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#4a4a4a', fontWeight: 600 }}>
                      Volume: {Math.round(volume * 100)}%
                    </Typography>
                    <Slider
                      value={volume}
                      min={0}
                      max={2}
                      step={0.05}
                      onChange={(_, value) => setVolume(value as number)}
                    />
                  </Box>
                </Stack>
              </Card>

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
                maxHeight: { xs: 'none', md: 620 },
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
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

              <TextField
                fullWidth
                size="small"
                placeholder="Search by name, language, or gender"
                value={voiceSearch}
                onChange={(e) => setVoiceSearch(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: '#f6f5f1',
                  },
                }}
              />

              {Object.keys(groupedVoices).length === 0 ? (
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
                    No matching voices
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: '#9a9a9a' }}
                  >
                    Try a different search term
                  </Typography>
                </Box>
              ) : (
                <List
                  sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    maxHeight: { xs: 360, md: 500 },
                    pr: 0.5,
                  }}
                >
                  {Object.entries(groupedVoices)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .flatMap(([language, voices]) => [
                      <Typography
                        key={`list-lang-${language}`}
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.75,
                          color: '#4a4a4a',
                          fontWeight: 800,
                          display: 'block',
                          letterSpacing: '0.03em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {language}
                      </Typography>,
                      ...voices.map(({ key, data }) => {
                        const isSelected = selectedPublicVoice === key;
                        const genderAvatar = getGenderAvatar(data.gender);

                        return (
                          <ListItem
                            key={key}
                            sx={{
                              borderRadius: '14px',
                              mb: 1,
                              background: isSelected
                                ? 'linear-gradient(135deg, #1f1f1f 0%, #343434 100%)'
                                : 'linear-gradient(135deg, #fbfbfb 0%, #f2f1eb 100%)',
                              border: isSelected ? '1px solid #2f2f2f' : '1px solid rgba(0,0,0,0.06)',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer',
                              boxShadow: isSelected
                                ? '0 8px 20px rgba(0, 0, 0, 0.2)'
                                : '0 4px 10px rgba(0, 0, 0, 0.05)',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: isSelected
                                  ? '0 10px 24px rgba(0, 0, 0, 0.24)'
                                  : '0 8px 18px rgba(0, 0, 0, 0.1)',
                              },
                            }}
                            onClick={() => setSelectedPublicVoice(key)}
                            secondaryAction={
                              <Tooltip title="Play voice test">
                                <span>
                                  <IconButton
                                    edge="end"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePreviewVoice(key);
                                    }}
                                    disabled={previewLoadingVoice === key}
                                    sx={{
                                      color: isSelected ? '#fff' : '#1a1a1a',
                                      border: isSelected
                                        ? '1px solid rgba(255,255,255,0.35)'
                                        : '1px solid rgba(0,0,0,0.15)',
                                      backgroundColor: isSelected
                                        ? 'rgba(255,255,255,0.08)'
                                        : 'rgba(255,255,255,0.7)',
                                      '&:hover': {
                                        backgroundColor: isSelected
                                          ? 'rgba(255,255,255,0.18)'
                                          : 'rgba(255,255,255,0.95)',
                                      },
                                    }}
                                  >
                                    {previewLoadingVoice === key ? (
                                      <CircularProgress size={18} sx={{ color: isSelected ? '#fff' : '#1a1a1a' }} />
                                    ) : (
                                      <PlayArrowIcon fontSize="small" />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            }
                          >
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  backgroundColor: genderAvatar.bg,
                                  color: genderAvatar.color,
                                  width: 42,
                                  height: 42,
                                  fontWeight: 700,
                                  fontSize: '1.1rem',
                                  border: '1px solid rgba(0,0,0,0.08)',
                                }}
                              >
                                {genderAvatar.symbol}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={data.name}
                              secondary={
                                <Stack direction="row" spacing={0.8} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                                  <Chip
                                    label={data.gender}
                                    size="small"
                                    sx={{
                                      height: 22,
                                      backgroundColor: isSelected ? 'rgba(255,255,255,0.12)' : '#e9e7df',
                                      color: isSelected ? '#fff' : '#333',
                                    }}
                                  />
                                  <Chip
                                    label={data.country}
                                    size="small"
                                    sx={{
                                      height: 22,
                                      backgroundColor: isSelected ? 'rgba(255,255,255,0.12)' : '#e9e7df',
                                      color: isSelected ? '#fff' : '#333',
                                    }}
                                  />
                                </Stack>
                              }
                              primaryTypographyProps={{
                                fontWeight: 700,
                                color: isSelected ? '#fff' : '#1a1a1a',
                                pr: 7,
                              }}
                            />
                            {isSelected && (
                              <Chip
                                label="Selected"
                                size="small"
                                sx={{
                                  ml: 1,
                                  backgroundColor: '#fff',
                                  color: '#1a1a1a',
                                  fontWeight: 700,
                                }}
                              />
                            )}
                          </ListItem>
                        );
                      }),
                    ])}
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
