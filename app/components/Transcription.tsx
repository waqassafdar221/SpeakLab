'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Divider,
  Tooltip,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LockIcon from '@mui/icons-material/Lock';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { buildProxyUrl } from '@/lib/api';

type Status = 'idle' | 'recording' | 'transcribing' | 'done' | 'error';

const SUPPORTED_FORMATS = ['MP3', 'WAV', 'M4A', 'OGG', 'WEBM', 'FLAC'];
const DEMO_MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB demo limit (Vercel 4.5MB body cap)
const DEMO_MAX_RECORDING_SECONDS = 60;

function RecordingWave() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px', height: 24 }}>
      {[0.4, 0.7, 1, 0.7, 0.4, 0.8, 0.5].map((scale, i) => (
        <motion.div
          key={i}
          style={{ width: 3, borderRadius: 2, backgroundColor: '#ef4444', height: '100%' }}
          animate={{ scaleY: [scale, 1, scale] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
        />
      ))}
    </Box>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Transcription() {
  const [status, setStatus] = useState<Status>('idle');
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState('');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [fileName, setFileName] = useState('');

  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const sendForTranscription = useCallback(async (blob: Blob, name: string) => {
    setStatus('transcribing');
    setError('');
    setTranscript('');
    const formData = new FormData();
    formData.append('file', blob, name);
    try {
      const response = await fetch(buildProxyUrl('/transcription/transcribe'), {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ detail: 'Transcription failed' }));
        throw new Error(data.detail || 'Transcription failed');
      }
      const data = await response.json();
      setTranscript(data.text || '');
      setLanguage(data.language || '');
      setDuration(data.duration || 0);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed');
      setStatus('error');
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    if (file.size > DEMO_MAX_FILE_SIZE) {
      setError('Demo limit: max 4MB. Login for full 25MB access.');
      setStatus('error');
      return;
    }
    setFileName(file.name);
    sendForTranscription(file, file.name);
  }, [sendForTranscription]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      setRecordingTime(0);

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setFileName('recording.webm');
        sendForTranscription(blob, 'recording.webm');
      };

      recorder.start(250);
      setStatus('recording');

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => {
          if (t + 1 >= DEMO_MAX_RECORDING_SECONDS) {
            mediaRecorderRef.current?.stop();
          }
          return t + 1;
        });
      }, 1000);
    } catch {
      setError('Microphone access denied. Please allow microphone permission.');
      setStatus('error');
    }
  };

  const stopRecording = () => mediaRecorderRef.current?.stop();

  const handleReset = () => {
    setStatus('idle');
    setTranscript('');
    setLanguage('');
    setDuration(0);
    setError('');
    setFileName('');
    setRecordingTime(0);
  };

  const handleCopy = async () => {
    if (!transcript) return;
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  const cardStyle = {
    p: 3,
    borderRadius: '16px',
    height: '100%',
    minHeight: { xs: 'auto', md: '440px' },
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(26,26,26,0.08)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': { boxShadow: '0 20px 50px rgba(0,0,0,0.15)', transform: 'translateY(-4px)' },
  };

  return (
    <Box
      ref={ref}
      sx={{
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)',
        py: { xs: 6, md: 8 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Chip
              label="NEW"
              size="small"
              sx={{
                mb: 2,
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.7rem',
                letterSpacing: '0.08em',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 800,
                mb: 2,
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              Audio to{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Text
              </Box>
            </Typography>
            <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, color: 'rgba(255,255,255,0.6)', maxWidth: '600px', mx: 'auto' }}>
              Upload or record audio to instantly transcribe it — powered by Groq Whisper
            </Typography>
          </Box>
        </motion.div>

        {/* Demo limit banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Box
            sx={{
              mb: 3,
              p: 1.5,
              borderRadius: '10px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              flexWrap: 'wrap',
            }}
          >
            <LockIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
              Demo: 4MB file limit · 60s recording limit
            </Typography>
            <Button
              component="a"
              href="/login"
              size="small"
              endIcon={<ArrowForwardIcon sx={{ fontSize: '0.8rem' }} />}
              sx={{
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                py: 0.3,
                px: 1.2,
                borderRadius: '6px',
                backgroundColor: 'rgba(255,255,255,0.12)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
              }}
            >
              Login for full access
            </Button>
          </Box>
        </motion.div>

        {/* Panels */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'stretch' }}>
            {/* Left — Upload / Record */}
            <Box sx={{ flex: 1 }}>
              <Paper elevation={3} sx={cardStyle}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1a1a1a' }}>
                  Upload or Record
                </Typography>

                {/* Drop zone */}
                <Box
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => status === 'idle' && fileInputRef.current?.click()}
                  sx={{
                    flex: 1,
                    border: `2px dashed ${isDragging ? '#1a1a1a' : 'rgba(26,26,26,0.2)'}`,
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    p: 3,
                    cursor: status === 'idle' ? 'pointer' : 'default',
                    backgroundColor: isDragging ? 'rgba(26,26,26,0.06)' : '#f6f5f1',
                    transition: 'all 0.2s ease',
                    '&:hover': status === 'idle' ? { backgroundColor: 'rgba(26,26,26,0.06)', borderColor: '#1a1a1a' } : {},
                  }}
                >
                  <AnimatePresence mode="wait">
                    {status === 'idle' && (
                      <motion.div key="idle" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ textAlign: 'center' }}>
                        <CloudUploadIcon sx={{ fontSize: 40, color: '#4a4a4a', mb: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 0.5 }}>
                          {isDragging ? 'Drop it here' : 'Drag & drop audio file'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#4a4a4a' }}>or click to browse</Typography>
                      </motion.div>
                    )}
                    {status === 'recording' && (
                      <motion.div key="recording" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ textAlign: 'center' }}>
                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                          <Box sx={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
                            <MicIcon sx={{ fontSize: 28, color: '#ef4444' }} />
                          </Box>
                        </motion.div>
                        <RecordingWave />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#ef4444', mt: 1 }}>
                          {formatTime(recordingTime)} / {formatTime(DEMO_MAX_RECORDING_SECONDS)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#4a4a4a' }}>Recording...</Typography>
                      </motion.div>
                    )}
                    {status === 'transcribing' && (
                      <motion.div key="transcribing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ textAlign: 'center' }}>
                        <CircularProgress size={40} sx={{ color: '#1a1a1a', mb: 1.5 }} thickness={3} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>Transcribing...</Typography>
                        {fileName && <Typography variant="caption" sx={{ color: '#4a4a4a', mt: 0.5 }}>{fileName}</Typography>}
                      </motion.div>
                    )}
                    {(status === 'done' || status === 'error') && (
                      <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ textAlign: 'center' }}>
                        <GraphicEqIcon sx={{ fontSize: 40, color: '#4a4a4a', mb: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>{fileName || 'Audio processed'}</Typography>
                        <Typography variant="caption" sx={{ color: '#4a4a4a' }}>Click below to try another</Typography>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>

                <input ref={fileInputRef} type="file" accept=".mp3,.wav,.mp4,.m4a,.ogg,.webm,.flac" style={{ display: 'none' }} onChange={handleFileInput} />

                {/* Format chips */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5, mb: 1.5 }}>
                  {SUPPORTED_FORMATS.map((fmt) => (
                    <Chip key={fmt} label={fmt} size="small" sx={{ height: '20px', fontSize: '0.65rem', fontWeight: 600, backgroundColor: 'rgba(26,26,26,0.08)', color: '#4a4a4a' }} />
                  ))}
                  <Chip label="Max 4MB (demo)" size="small" sx={{ height: '20px', fontSize: '0.65rem', fontWeight: 600, backgroundColor: 'rgba(239,68,68,0.08)', color: '#ef4444' }} />
                </Box>

                <Divider sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#4a4a4a', px: 1 }}>or</Typography>
                </Divider>

                {status === 'recording' ? (
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={stopRecording}
                    sx={{ backgroundColor: '#ef4444', color: '#fff', py: 1.8, borderRadius: '12px', fontSize: '1rem', fontWeight: 600, textTransform: 'none', boxShadow: '0 8px 24px rgba(239,68,68,0.3)', '&:hover': { backgroundColor: '#dc2626' } }}
                    startIcon={<StopIcon />}
                  >
                    Stop Recording
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    disabled={status === 'transcribing'}
                    onClick={status === 'idle' ? startRecording : handleReset}
                    sx={{ borderColor: '#1a1a1a', color: '#1a1a1a', py: 1.8, borderRadius: '12px', fontSize: '1rem', fontWeight: 600, textTransform: 'none', transition: 'all 0.3s', '&:hover': { borderColor: '#1a1a1a', backgroundColor: 'rgba(26,26,26,0.06)' }, '&:disabled': { borderColor: '#d0d0d0', color: '#6a6a6a' } }}
                    startIcon={status === 'idle' ? <MicIcon /> : <DeleteOutlineIcon />}
                  >
                    {status === 'idle' ? 'Record Audio (max 60s)' : 'Start Over'}
                  </Button>
                )}
              </Paper>
            </Box>

            {/* Right — Results */}
            <Box sx={{ flex: 1 }}>
              <Paper elevation={3} sx={cardStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>Transcription</Typography>
                  {status === 'done' && transcript && (
                    <Tooltip title={copied ? 'Copied!' : 'Copy text'}>
                      <IconButton size="small" onClick={handleCopy} sx={{ backgroundColor: copied ? 'rgba(34,197,94,0.1)' : 'rgba(26,26,26,0.06)', color: copied ? '#16a34a' : '#1a1a1a', '&:hover': { backgroundColor: 'rgba(26,26,26,0.1)' } }}>
                        {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    borderRadius: '12px',
                    backgroundColor: '#f6f5f1',
                    p: 2.5,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-track': { backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '3px' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(26,26,26,0.2)', borderRadius: '3px' },
                  }}
                >
                  <AnimatePresence mode="wait">
                    {status === 'idle' && (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <GraphicEqIcon sx={{ fontSize: 48, color: 'rgba(26,26,26,0.15)', mb: 2 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(26,26,26,0.4)', fontWeight: 500 }}>Your transcription will appear here</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(26,26,26,0.3)', mt: 0.5 }}>Upload a file or record audio to get started</Typography>
                      </motion.div>
                    )}
                    {status === 'recording' && (
                      <motion.div key="recording-placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <RecordingWave />
                        <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600, mt: 2 }}>Listening...</Typography>
                      </motion.div>
                    )}
                    {status === 'transcribing' && (
                      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircularProgress size={32} sx={{ color: '#1a1a1a' }} thickness={3} />
                      </motion.div>
                    )}
                    {status === 'error' && (
                      <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1 }}>
                        <Alert severity="error" sx={{ borderRadius: '8px' }}>{error}</Alert>
                      </motion.div>
                    )}
                    {status === 'done' && (
                      <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} style={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ color: '#1a1a1a', lineHeight: 1.8, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                          {transcript || <Box component="span" sx={{ color: '#6a6a6a', fontStyle: 'italic' }}>No speech detected</Box>}
                        </Typography>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>

                {/* Meta row */}
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                  {status === 'done' && (
                    <>
                      {language && <Chip label={`Language: ${language.toUpperCase()}`} size="small" sx={{ height: '22px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: 'rgba(26,26,26,0.08)', color: '#1a1a1a' }} />}
                      {duration > 0 && <Chip label={`${duration}s`} size="small" sx={{ height: '22px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: 'rgba(26,26,26,0.08)', color: '#4a4a4a' }} />}
                      {wordCount > 0 && <Chip label={`${wordCount} words`} size="small" sx={{ height: '22px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: 'rgba(26,26,26,0.08)', color: '#4a4a4a' }} />}
                    </>
                  )}
                  {status === 'idle' && (
                    <Typography variant="caption" sx={{ color: 'rgba(26,26,26,0.35)' }}>
                      98+ languages · Powered by Groq Whisper
                    </Typography>
                  )}
                </Box>

                {/* Upgrade CTA shown after transcription */}
                {status === 'done' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Box
                      sx={{
                        mt: 2,
                        p: 1.5,
                        borderRadius: '10px',
                        backgroundColor: '#1a1a1a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>
                          Want full access?
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600 }}>
                          No file size limits · Unlimited recording · Download transcript
                        </Typography>
                      </Box>
                      <Button
                        component="a"
                        href="/login"
                        size="small"
                        endIcon={<ArrowForwardIcon sx={{ fontSize: '0.8rem' }} />}
                        sx={{ backgroundColor: '#fff', color: '#1a1a1a', textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', borderRadius: '6px', px: 1.5, whiteSpace: 'nowrap', '&:hover': { backgroundColor: '#f0f0f0' } }}
                      >
                        Login Free
                      </Button>
                    </Box>
                  </motion.div>
                )}
              </Paper>
            </Box>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
}
