'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Slider,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SpeedIcon from '@mui/icons-material/Speed';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import BoltIcon from '@mui/icons-material/Bolt';
import DownloadIcon from '@mui/icons-material/Download';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import { ttsApi, userApi, PublicVoice, VoiceMetadata, buildProxyUrl } from '@/lib/api';

const LANGUAGE_FLAGS: Record<string, string> = {
  English: '🇬🇧', Arabic: '🇸🇦', Hindi: '🇮🇳', Urdu: '🇵🇰',
  French: '🇫🇷', Chinese: '🇨🇳', German: '🇩🇪', Japanese: '🇯🇵',
  Vietnamese: '🇻🇳', Turkish: '🇹🇷', Korean: '🇰🇷', Spanish: '🇪🇸', Afrikaans: '🇿🇦',
};

const PREVIEW_TEXT: Record<string, string[]> = {
  English: ['The morning breeze carries a calm and gentle melody.', 'A quiet evening often brings peace to the heart.'],
  Arabic: ['في صباحٍ هادئٍ تشرق الشمس بلطفٍ على المدينة.', 'في المساء الجميل تهدأ القلوب وتطمئن النفوس.'],
  Hindi: ['सुबह की ठंडी हवा मन को शांति देती है।', 'शाम का शांत वातावरण दिल को सुकून देता है।'],
  Urdu: ['آج موسم خوشگوار ہے اور ہوا بہت نرم چل رہی ہے۔', 'پرسکون شام دل کو سکون دیتی ہے۔'],
  French: ['La brise du matin apporte une sensation de calme.', 'Le soir tranquille apaise doucement le cœur.'],
  Chinese: ['清晨的微风让人感到宁静。', '安静的夜晚总能带来平和。'],
  German: ['Die frische Morgenluft fühlt sich angenehm ruhig an.', 'Ein ruhiger Abend bringt oft innere Gelassenheit.'],
  Japanese: ['朝のやわらかな風は心を落ち着かせます。', '静かな夜には穏やかな時間が流れます。'],
  Vietnamese: ['Làn gió buổi sáng mang lại cảm giác rất yên bình.', 'Buổi tối tĩnh lặng luôn khiến lòng nhẹ nhàng.'],
  Turkish: ['Sabah esintisi insana huzur veren bir serinlik getirir.', 'Sakin bir akşam kalbe dinginlik verir.'],
  Korean: ['아침의 부드러운 바람은 마음을 편안하게 합니다.', '조용한 저녁은 마음에 평온함을 줍니다.'],
  Spanish: ['La brisa de la mañana transmite una gran tranquilidad.', 'Una tarde serena siempre calma el corazón.'],
  Afrikaans: ["Die sagte oggendwind bring 'n rustige gevoel.", "'n Stil aand bring kalmte in die hart."],
};

type VoiceEntry = { key: string; data: VoiceMetadata };

/* ── Compact slider row ── */
function SliderRow({
  icon, label, value, display, min, max, step, onChange,
}: {
  icon: React.ReactNode; label: string; value: number; display: string;
  min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ color: '#9a9a9a', display: 'flex', flexShrink: 0 }}>{icon}</Box>
      <Typography variant="caption" sx={{ fontWeight: 600, color: '#4a4a4a', width: 38, flexShrink: 0 }}>{label}</Typography>
      <Slider
        size="small"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(_, v) => onChange(v as number)}
        sx={{
          flex: 1,
          color: '#1a1a1a',
          '& .MuiSlider-thumb': { width: 14, height: 14 },
          py: 0,
        }}
      />
      <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a1a', width: 36, textAlign: 'right', flexShrink: 0 }}>
        {display}
      </Typography>
    </Box>
  );
}

/* ── Mini audio player ── */
function AudioPlayer({ src, creditsUsed }: { src: string; creditsUsed: number }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    audio.onended = () => { setPlaying(false); setCurrentTime(0); };
    audio.play().then(() => setPlaying(true)).catch(() => {});
    return () => { audio.pause(); audio.src = ''; };
  }, [src]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `speakstudio_${Date.now()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // silently fail
    } finally {
      setDownloading(false);
    }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2e2e2e 100%)',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <IconButton
        onClick={toggle}
        size="small"
        sx={{
          width: 38,
          height: 38,
          backgroundColor: '#fff',
          color: '#1a1a1a',
          flexShrink: 0,
          '&:hover': { backgroundColor: '#f0f0f0' },
        }}
      >
        {playing ? <PauseIcon sx={{ fontSize: 18 }} /> : <PlayArrowIcon sx={{ fontSize: 18 }} />}
      </IconButton>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ position: 'relative', height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', mb: 0.75 }}>
          <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, borderRadius: 2, backgroundColor: '#fff', transition: 'width 0.1s linear' }} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
            {fmt(currentTime)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
            {duration > 0 ? fmt(duration) : '--:--'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', fontSize: '0.65rem' }}>
          deducted
        </Typography>
        <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.75rem' }}>
          {creditsUsed} cr
        </Typography>
      </Box>

      <Tooltip title="Download audio">
        <span>
          <IconButton
            size="small"
            onClick={handleDownload}
            disabled={downloading}
            sx={{
              width: 34,
              height: 34,
              backgroundColor: 'rgba(255,255,255,0.12)',
              color: '#fff',
              flexShrink: 0,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.22)' },
              '&:disabled': { opacity: 0.4 },
            }}
          >
            {downloading
              ? <CircularProgress size={14} sx={{ color: '#fff' }} />
              : <DownloadIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}

export default function HomeSection() {
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [publicVoices, setPublicVoices] = useState<PublicVoice>({});
  const [voiceSearch, setVoiceSearch] = useState('');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [credits, setCredits] = useState(0);
  const [username, setUsername] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [costDeducted, setCostDeducted] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(1);
  const [previewLoadingVoice, setPreviewLoadingVoice] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [voicesData, userData] = await Promise.all([ttsApi.getPublicVoices(), userApi.getMe()]);
        setPublicVoices(voicesData);
        setCredits(userData.credits);
        setUsername(userData.username);
        const langs = Array.from(new Set(Object.values(voicesData).map(v => v.language))).sort();
        setAvailableLanguages(langs);
        const firstKey = Object.keys(voicesData)[0];
        if (firstKey) setSelectedVoice(firstKey);
      } catch {
        setError('Failed to load voices. Please refresh.');
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const groupedVoices = useMemo(() => {
    const query = voiceSearch.trim().toLowerCase();
    const grouped: Record<string, VoiceEntry[]> = {};
    Object.entries(publicVoices).forEach(([key, voice]) => {
      if (selectedLanguage !== 'All' && voice.language !== selectedLanguage) return;
      const searchable = `${voice.name} ${voice.country} ${voice.language} ${voice.gender}`.toLowerCase();
      if (query && !searchable.includes(query)) return;
      if (!grouped[voice.language]) grouped[voice.language] = [];
      grouped[voice.language].push({ key, data: voice });
    });
    Object.values(grouped).forEach(v => v.sort((a, b) => a.data.name.localeCompare(b.data.name)));
    return grouped;
  }, [publicVoices, selectedLanguage, voiceSearch]);

  useEffect(() => {
    const flat = Object.values(groupedVoices).flat();
    if (flat.length > 0 && !flat.some(v => v.key === selectedVoice)) setSelectedVoice(flat[0].key);
  }, [groupedVoices, selectedVoice]);

  useEffect(() => () => { previewAudioRef.current?.pause(); }, []);

  const handleGenerate = async () => {
    setError('');
    setAudioUrl(null);
    if (!selectedVoice) { setError('Please select a voice'); return; }
    if (!textInput.trim()) { setError('Please enter some text'); return; }
    setIsLoading(true);
    try {
      const response = await ttsApi.generateSpeech({ text: textInput, public_voice: selectedVoice, speed, pitch, volume });
      setCostDeducted(response.deducted);
      setCredits(prev => prev - response.deducted);
      setAudioUrl(response.output_url);
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate speech. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewVoice = async (voiceKey: string) => {
    try {
      setPreviewLoadingVoice(voiceKey);
      const lang = publicVoices[voiceKey]?.language;
      const texts = PREVIEW_TEXT[lang || ''] || PREVIEW_TEXT.English;
      const previewText = texts[Math.floor(Math.random() * texts.length)];
      const response = await fetch(buildProxyUrl('/tts/demo'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: previewText, public_voice: voiceKey, speed, pitch, volume }),
      });
      const data = await response.json().catch(() => ({} as { detail?: string; output_url?: string }));
      if (!response.ok) throw new Error((data as { detail?: string }).detail || 'Preview failed');
      const url = (data as { output_url?: string }).output_url;
      if (!url) throw new Error('No audio URL returned');
      previewAudioRef.current?.pause();
      const audio = new Audio(buildProxyUrl(url));
      previewAudioRef.current = audio;
      await audio.play();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to play preview');
    } finally {
      setPreviewLoadingVoice(null);
    }
  };

  const cardSx = {
    borderRadius: '16px',
    backgroundColor: '#fff',
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  };

  const totalVoices = Object.keys(publicVoices).length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1, letterSpacing: '-0.02em' }}>
          Welcome back{username ? `, ${username}` : ''}
        </Typography>
        <Typography variant="body1" sx={{ color: '#6a6a6a' }}>
          Quick access to generate speech with public voices
        </Typography>
      </Box>

      {/* Stats strip */}
      {!isLoadingData && (
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
          <Box
            sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              px: 2, py: 1.25, borderRadius: '12px',
              backgroundColor: '#1a1a1a',
            }}
          >
            <BoltIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>
              {credits.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)' }}>credits</Typography>
          </Box>

          <Box
            sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              px: 2, py: 1.25, borderRadius: '12px',
              backgroundColor: '#fff',
              border: '1px solid rgba(0,0,0,0.07)',
            }}
          >
            <RecordVoiceOverIcon sx={{ fontSize: 16, color: '#9a9a9a' }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
              {totalVoices}
            </Typography>
            <Typography variant="caption" sx={{ color: '#9a9a9a' }}>voices available</Typography>
          </Box>
        </Box>
      )}

      {isLoadingData ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: '#1a1a1a' }} />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.3fr 1fr' }, gap: 3, alignItems: 'start' }}>

          {/* ── LEFT: Text input + settings ── */}
          <Card sx={{ ...cardSx, p: 3, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                Generate Speech
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.5, borderRadius: '8px', backgroundColor: '#f6f5f1' }}>
                <BoltIcon sx={{ fontSize: 14, color: '#4a4a4a' }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                  {credits.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: '#9a9a9a' }}>credits</Typography>
              </Box>
            </Box>

            <TextField
              multiline
              minRows={8}
              maxRows={14}
              fullWidth
              placeholder="Type or paste your text here…"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              sx={{
                mb: 0.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f6f5f1',
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                  '&:hover fieldset': { borderColor: 'rgba(26,26,26,0.3)' },
                  '&.Mui-focused fieldset': { borderColor: '#1a1a1a', borderWidth: '1.5px' },
                  '& fieldset': { borderColor: 'transparent' },
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2.5 }}>
              <Typography variant="caption" sx={{ color: textInput.length > 0 ? '#9a9a9a' : 'transparent' }}>
                {textInput.length} characters · {textInput.length} credits
              </Typography>
            </Box>

            {/* Voice Settings */}
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                backgroundColor: '#f6f5f1',
                mb: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#4a4a4a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Voice Settings
                </Typography>
                <Button
                  size="small"
                  startIcon={<RestartAltIcon sx={{ fontSize: '0.85rem' }} />}
                  onClick={() => { setSpeed(1); setPitch(0); setVolume(1); }}
                  sx={{ textTransform: 'none', color: '#9a9a9a', fontSize: '0.75rem', minWidth: 'auto', p: 0, '&:hover': { color: '#1a1a1a', backgroundColor: 'transparent' } }}
                >
                  Reset
                </Button>
              </Box>
              <SliderRow icon={<SpeedIcon sx={{ fontSize: 16 }} />} label="Speed" value={speed} display={`${speed.toFixed(1)}×`} min={0.5} max={2} step={0.05} onChange={setSpeed} />
              <SliderRow icon={<GraphicEqIcon sx={{ fontSize: 16 }} />} label="Pitch" value={pitch} display={`${pitch > 0 ? '+' : ''}${pitch}`} min={-50} max={50} step={1} onChange={setPitch} />
              <SliderRow icon={<VolumeUpIcon sx={{ fontSize: 16 }} />} label="Vol" value={volume} display={`${Math.round(volume * 100)}%`} min={0} max={2} step={0.05} onChange={setVolume} />
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', fontSize: '0.875rem' }}>
                {error}
              </Alert>
            )}

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
                fontSize: '0.95rem',
                fontWeight: 700,
                textTransform: 'none',
                letterSpacing: '0.01em',
                boxShadow: 'none',
                transition: 'all 0.2s ease',
                '&:hover': { backgroundColor: '#2a2a2a', boxShadow: '0 6px 20px rgba(0,0,0,0.18)', transform: 'translateY(-1px)' },
                '&:disabled': { backgroundColor: '#e8e8e8', color: '#aaa', boxShadow: 'none' },
              }}
            >
              {isLoading
                ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CircularProgress size={18} sx={{ color: '#fff' }} /><span>Generating…</span></Box>
                : selectedVoice
                  ? `Generate with ${publicVoices[selectedVoice]?.name || 'selected voice'}`
                  : 'Select a voice first'}
            </Button>

            {audioUrl && (
              <AudioPlayer src={buildProxyUrl(audioUrl)} creditsUsed={costDeducted} />
            )}
          </Card>

          {/* ── RIGHT: Voice picker ── */}
          <Card sx={{ ...cardSx, p: 3, display: 'flex', flexDirection: 'column', height: { lg: 600 } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 2 }}>
              Voices
            </Typography>

            {/* Search */}
            <Box sx={{ position: 'relative', mb: 1.5 }}>
              <SearchIcon sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#9a9a9a' }} />
              <TextField
                fullWidth
                size="small"
                placeholder="Search name, country, gender…"
                value={voiceSearch}
                onChange={(e) => setVoiceSearch(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: '#f6f5f1',
                    pl: 4.5,
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: 'rgba(26,26,26,0.2)' },
                    '&.Mui-focused fieldset': { borderColor: '#1a1a1a' },
                  },
                }}
              />
            </Box>

            {/* Language filter chips */}
            <Box
              sx={{
                display: 'flex',
                gap: 0.75,
                overflowX: 'auto',
                pb: 1.5,
                mb: 0.5,
                '&::-webkit-scrollbar': { height: 3 },
                '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(26,26,26,0.15)', borderRadius: 2 },
              }}
            >
              {['All', ...availableLanguages].map((lang) => (
                <Chip
                  key={lang}
                  label={lang === 'All' ? '🌐 All' : `${LANGUAGE_FLAGS[lang] || '🌐'} ${lang}`}
                  size="small"
                  onClick={() => setSelectedLanguage(lang)}
                  sx={{
                    flexShrink: 0,
                    height: 28,
                    fontSize: '0.78rem',
                    fontWeight: selectedLanguage === lang ? 700 : 500,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedLanguage === lang ? '#1a1a1a' : 'rgba(26,26,26,0.06)',
                    color: selectedLanguage === lang ? '#fff' : '#4a4a4a',
                    border: 'none',
                    transition: 'all 0.15s ease',
                    '&:hover': { backgroundColor: selectedLanguage === lang ? '#2a2a2a' : 'rgba(26,26,26,0.1)' },
                    '& .MuiChip-label': { px: 1.25 },
                  }}
                />
              ))}
            </Box>

            {/* Voice list */}
            {Object.keys(groupedVoices).length === 0 ? (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" sx={{ color: '#9a9a9a' }}>No voices match your search</Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': { width: 4 },
                  '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
                  '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(26,26,26,0.15)', borderRadius: 2 },
                }}
              >
                {Object.entries(groupedVoices)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([language, voices], groupIndex) => (
                    <Box key={language} sx={groupIndex > 0 ? { borderTop: '1px solid rgba(26,26,26,0.05)', mt: 0.5 } : {}}>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          px: 0.5,
                          pt: groupIndex === 0 ? 0.5 : 1.5,
                          pb: 0.75,
                          color: '#9a9a9a',
                          fontWeight: 700,
                          fontSize: '0.68rem',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {LANGUAGE_FLAGS[language] || '🌐'} {language}
                      </Typography>

                      {voices.map(({ key, data }) => {
                        const isSelected = selectedVoice === key;
                        const isFemale = data.gender?.toLowerCase().includes('female');

                        return (
                          <Box
                            key={key}
                            onClick={() => setSelectedVoice(key)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              px: 1.5,
                              py: 1.25,
                              mb: 0.5,
                              borderRadius: '12px',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? '#1a1a1a' : 'transparent',
                              transition: 'all 0.15s ease',
                              '&:hover': {
                                backgroundColor: isSelected ? '#2a2a2a' : 'rgba(26,26,26,0.05)',
                              },
                            }}
                          >
                            {/* Gender tile */}
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '10px',
                                backgroundColor: isSelected
                                  ? 'rgba(255,255,255,0.12)'
                                  : isFemale ? '#fce7f0' : '#dbeafe',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                flexShrink: 0,
                              }}
                            >
                              <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>
                                {isFemale ? '♀' : '♂'}
                              </Typography>
                            </Box>

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 700,
                                  color: isSelected ? '#fff' : '#1a1a1a',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {data.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: isSelected ? 'rgba(255,255,255,0.5)' : '#9a9a9a' }}
                              >
                                {data.country}
                              </Typography>
                            </Box>

                            <Tooltip title="Preview voice">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={(e) => { e.stopPropagation(); handlePreviewVoice(key); }}
                                  disabled={!!previewLoadingVoice}
                                  sx={{
                                    width: 30,
                                    height: 30,
                                    backgroundColor: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(26,26,26,0.07)',
                                    color: isSelected ? '#fff' : '#4a4a4a',
                                    flexShrink: 0,
                                    '&:hover': { backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(26,26,26,0.14)' },
                                    '&:disabled': { opacity: 0.4 },
                                  }}
                                >
                                  {previewLoadingVoice === key
                                    ? <CircularProgress size={12} sx={{ color: 'inherit' }} />
                                    : <PlayArrowIcon sx={{ fontSize: 15 }} />}
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        );
                      })}
                    </Box>
                  ))}
              </Box>
            )}

            {/* Selected voice footer */}
            {selectedVoice && publicVoices[selectedVoice] && (
              <Box
                sx={{
                  mt: 1.5,
                  pt: 1.5,
                  borderTop: '1px solid rgba(26,26,26,0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Typography variant="caption" sx={{ color: '#9a9a9a' }}>Selected:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                  {publicVoices[selectedVoice].name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#9a9a9a' }}>
                  · {publicVoices[selectedVoice].language}
                </Typography>
              </Box>
            )}
          </Card>
        </Box>
      )}

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
          Speech generated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
