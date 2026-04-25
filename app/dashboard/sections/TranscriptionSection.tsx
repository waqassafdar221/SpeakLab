'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Divider,
  Tooltip,
  Stack,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import { motion, AnimatePresence } from 'framer-motion';
import { buildProxyUrl } from '@/lib/api';

type Status = 'idle' | 'recording' | 'transcribing' | 'done' | 'error';

const SUPPORTED_FORMATS = ['MP3', 'WAV', 'M4A', 'OGG', 'WEBM', 'FLAC'];

function RecordingWave() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px', height: 20 }}>
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

function formatTime(s: number): string {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  return `${m}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function TranscriptionSection() {
  const [status, setStatus] = useState<Status>('idle');
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState('');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [fileName, setFileName] = useState('');
  const [showCopiedSnack, setShowCopiedSnack] = useState(false);

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
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
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
    setShowCopiedSnack(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName ? `${fileName.replace(/\.[^.]+$/, '')}_transcript.txt` : 'transcript.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  const cardSx = {
    p: 3,
    borderRadius: '16px',
    backgroundColor: 'rgba(255,255,255,0.9)',
    border: '1px solid rgba(0,0,0,0.05)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1, letterSpacing: '-0.02em' }}>
          Audio to Text
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a4a4a' }}>
          Transcribe any audio file or recording — powered by SpeakStudio
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.3fr' }, gap: 3, alignItems: 'start' }}>
        {/* Left — Upload / Record */}
        <Card sx={{ ...cardSx, minHeight: 480 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 2 }}>
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
              minHeight: 160,
              border: `2px dashed ${isDragging ? '#1a1a1a' : 'rgba(26,26,26,0.15)'}`,
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              p: 3,
              mb: 2,
              cursor: status === 'idle' ? 'pointer' : 'default',
              backgroundColor: isDragging ? 'rgba(26,26,26,0.06)' : '#f6f5f1',
              transition: 'all 0.2s ease',
              '&:hover': status === 'idle' ? { backgroundColor: 'rgba(26,26,26,0.06)', borderColor: '#1a1a1a' } : {},
            }}
          >
            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div key="idle" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ textAlign: 'center' }}>
                  <CloudUploadIcon sx={{ fontSize: 44, color: '#4a4a4a', mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 0.5 }}>
                    {isDragging ? 'Drop audio here' : 'Drag & drop or click to upload'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6a6a6a' }}>Supports {SUPPORTED_FORMATS.join(', ')} · Max 25MB</Typography>
                </motion.div>
              )}
              {status === 'recording' && (
                <motion.div key="recording" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ textAlign: 'center' }}>
                  <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                    <Box sx={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
                      <MicIcon sx={{ fontSize: 28, color: '#ef4444' }} />
                    </Box>
                  </motion.div>
                  <RecordingWave />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#ef4444', mt: 1 }}>{formatTime(recordingTime)}</Typography>
                  <Typography variant="caption" sx={{ color: '#6a6a6a' }}>Recording... Click Stop when done</Typography>
                </motion.div>
              )}
              {status === 'transcribing' && (
                <motion.div key="transcribing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ textAlign: 'center' }}>
                  <CircularProgress size={44} sx={{ color: '#1a1a1a', mb: 1.5 }} thickness={3} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>Transcribing audio...</Typography>
                  {fileName && <Typography variant="caption" sx={{ color: '#6a6a6a', mt: 0.5 }}>{fileName}</Typography>}
                </motion.div>
              )}
              {(status === 'done' || status === 'error') && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ textAlign: 'center' }}>
                  <GraphicEqIcon sx={{ fontSize: 44, color: '#4a4a4a', mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>{fileName || 'Audio processed'}</Typography>
                  <Typography variant="caption" sx={{ color: '#6a6a6a' }}>Upload a new file or record again</Typography>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          <input ref={fileInputRef} type="file" accept=".mp3,.wav,.mp4,.m4a,.ogg,.webm,.flac" style={{ display: 'none' }} onChange={handleFileInput} />

          <Divider sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#6a6a6a', px: 1 }}>or record</Typography>
          </Divider>

          {/* Record / Stop */}
          {status === 'recording' ? (
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={stopRecording}
              startIcon={<StopIcon />}
              sx={{ backgroundColor: '#ef4444', color: '#fff', py: 1.5, borderRadius: '12px', fontWeight: 600, textTransform: 'none', boxShadow: '0 8px 24px rgba(239,68,68,0.25)', '&:hover': { backgroundColor: '#dc2626' } }}
            >
              Stop Recording
            </Button>
          ) : (
            <Button
              variant={status === 'idle' ? 'contained' : 'outlined'}
              size="large"
              fullWidth
              disabled={status === 'transcribing'}
              onClick={status === 'idle' ? startRecording : handleReset}
              startIcon={status === 'idle' ? <MicIcon /> : <DeleteOutlineIcon />}
              sx={
                status === 'idle'
                  ? { backgroundColor: '#1a1a1a', color: '#fff', py: 1.5, borderRadius: '12px', fontWeight: 600, textTransform: 'none', '&:hover': { backgroundColor: '#2a2a2a', transform: 'scale(1.01)' }, '&:disabled': { backgroundColor: '#d0d0d0', color: '#6a6a6a' } }
                  : { borderColor: '#1a1a1a', color: '#1a1a1a', py: 1.5, borderRadius: '12px', fontWeight: 600, textTransform: 'none', '&:hover': { borderColor: '#1a1a1a', backgroundColor: 'rgba(26,26,26,0.06)' } }
              }
            >
              {status === 'idle' ? 'Record Audio' : 'Start Over'}
            </Button>
          )}

          {/* Format info */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
            {SUPPORTED_FORMATS.map((fmt) => (
              <Chip key={fmt} label={fmt} size="small" sx={{ height: '20px', fontSize: '0.65rem', fontWeight: 600, backgroundColor: 'rgba(26,26,26,0.06)', color: '#4a4a4a' }} />
            ))}
          </Box>
        </Card>

        {/* Right — Results */}
        <Card sx={{ ...cardSx, minHeight: 480 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>Transcription</Typography>
            {status === 'done' && transcript && (
              <Stack direction="row" spacing={0.5}>
                <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                  <IconButton
                    size="small"
                    onClick={handleCopy}
                    sx={{ backgroundColor: copied ? 'rgba(34,197,94,0.1)' : 'rgba(26,26,26,0.06)', color: copied ? '#16a34a' : '#1a1a1a', '&:hover': { backgroundColor: 'rgba(26,26,26,0.1)' } }}
                  >
                    {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download as .txt">
                  <IconButton size="small" onClick={handleDownload} sx={{ backgroundColor: 'rgba(26,26,26,0.06)', color: '#1a1a1a', '&:hover': { backgroundColor: 'rgba(26,26,26,0.1)' } }}>
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Box>

          {/* Text area */}
          <Box
            sx={{
              flex: 1,
              minHeight: 320,
              borderRadius: '12px',
              backgroundColor: '#f6f5f1',
              p: 2.5,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-track': { backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '3px' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(26,26,26,0.2)', borderRadius: '3px' },
            }}
          >
            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <GraphicEqIcon sx={{ fontSize: 52, color: 'rgba(26,26,26,0.12)', mb: 2 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(26,26,26,0.4)', fontWeight: 500 }}>Transcription will appear here</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(26,26,26,0.3)', mt: 0.5 }}>Upload a file or start recording</Typography>
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
                  <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={36} sx={{ color: '#1a1a1a', mb: 2 }} thickness={3} />
                    <Typography variant="body2" sx={{ color: '#4a4a4a' }}>Processing audio...</Typography>
                  </Box>
                </motion.div>
              )}
              {status === 'error' && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1 }}>
                  <Alert severity="error" sx={{ borderRadius: '8px' }}>{error}</Alert>
                </motion.div>
              )}
              {status === 'done' && (
                <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} style={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ color: '#1a1a1a', lineHeight: 1.85, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                    {transcript || <Box component="span" sx={{ color: '#6a6a6a', fontStyle: 'italic' }}>No speech detected in this audio.</Box>}
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          {/* Metadata footer */}
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', minHeight: 28 }}>
            {status === 'done' && (
              <>
                {language && (
                  <Chip
                    label={`Language: ${language.toUpperCase()}`}
                    size="small"
                    sx={{ height: 24, fontSize: '0.72rem', fontWeight: 600, backgroundColor: '#1a1a1a', color: '#fff' }}
                  />
                )}
                {duration > 0 && (
                  <Chip label={`${duration}s audio`} size="small" sx={{ height: 24, fontSize: '0.72rem', fontWeight: 600, backgroundColor: 'rgba(26,26,26,0.08)', color: '#4a4a4a' }} />
                )}
                {wordCount > 0 && (
                  <Chip label={`${wordCount} words`} size="small" sx={{ height: 24, fontSize: '0.72rem', fontWeight: 600, backgroundColor: 'rgba(26,26,26,0.08)', color: '#4a4a4a' }} />
                )}
                {transcript && (
                  <Chip label={`${transcript.length} chars`} size="small" sx={{ height: 24, fontSize: '0.72rem', fontWeight: 600, backgroundColor: 'rgba(26,26,26,0.08)', color: '#4a4a4a' }} />
                )}
              </>
            )}
            {status === 'idle' && (
              <Typography variant="caption" sx={{ color: 'rgba(26,26,26,0.35)' }}>
                Supports 98+ languages · Powered by SpeakStudio · No file size limits
              </Typography>
            )}
          </Box>
        </Card>
      </Box>

      <Snackbar
        open={showCopiedSnack}
        autoHideDuration={2000}
        onClose={() => setShowCopiedSnack(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowCopiedSnack(false)} severity="success" sx={{ borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          Transcript copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}
