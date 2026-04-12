'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { voiceCloningApi, ClonedVoice } from '@/lib/api';

export default function VoiceCloningSection() {
  const [openDialog, setOpenDialog] = useState(false);
  const [voiceName, setVoiceName] = useState('');
  const [gender, setGender] = useState('Male');
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [voices, setVoices] = useState<ClonedVoice[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);

  // Fetch cloned voices on mount
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const clonedVoices = await voiceCloningApi.getClonedVoices();
        setVoices(clonedVoices);
      } catch (error) {
        console.error('Failed to fetch cloned voices:', error);
      } finally {
        setIsLoadingVoices(false);
      }
    };

    fetchVoices();
  }, []);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setVoiceName('');
    setGender('Male');
    setAudioFiles([]);
    setErrorMessage('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setAudioFiles(filesArray);
    }
  };

  const handleCreateVoice = async () => {
    if (!voiceName.trim()) {
      setErrorMessage('Please enter a voice name');
      setShowError(true);
      return;
    }

    if (audioFiles.length === 0) {
      setErrorMessage('Please upload at least one audio file');
      setShowError(true);
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      // Upload to voice cloning API
      const uploadResponse = await voiceCloningApi.uploadReference(audioFiles);
      console.log('Upload response:', uploadResponse);
      
      // Save to backend database for this user
      const savedVoice = await voiceCloningApi.saveClonedVoice({
        name: voiceName,
        gender: gender,
        provider_voice_id: uploadResponse.voice_id || uploadResponse.id || voiceName,
        status: 'Ready',
      });
      
      setVoices([...voices, savedVoice]);
      setShowSuccess(true);
      handleCloseDialog();
    } catch (error) {
      console.error('Voice cloning failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload voice reference');
      setShowError(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#1a1a1a',
              mb: 1,
              letterSpacing: '-0.02em',
            }}
          >
            Voice Cloning
          </Typography>
          <Typography variant="body1" sx={{ color: '#4a4a4a' }}>
            Create and manage your custom AI voices
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{
            backgroundColor: '#1a1a1a',
            color: '#fff',
            px: 3,
            py: 1.2,
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: '#2a2a2a',
              transform: 'scale(1.02)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          Create a voice
        </Button>
      </Box>

      {/* Voices Table */}
      {isLoadingVoices ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : voices.length > 0 ? (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f6f5f1' }}>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                  Name
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                  Gender
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                  Created Date
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                  Status
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {voices.map((voice) => (
                <TableRow
                  key={voice.id}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: '#f6f5f1',
                    },
                    '&:hover': {
                      backgroundColor: '#ebe9e0',
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                    {voice.name}
                  </TableCell>
                  <TableCell sx={{ color: '#4a4a4a' }}>{voice.gender || 'N/A'}</TableCell>
                  <TableCell sx={{ color: '#4a4a4a' }}>
                    {new Date(voice.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={voice.status}
                      size="small"
                      sx={{
                        backgroundColor: voice.status === 'Ready' ? '#4caf50' : '#ff9800',
                        color: '#fff',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      sx={{
                        backgroundColor: '#1a1a1a',
                        color: '#fff',
                        '&:hover': {
                          backgroundColor: '#2a2a2a',
                        },
                      }}
                    >
                      <PlayArrowIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
          }}
        >
          <Typography variant="h6" sx={{ color: '#6a6a6a' }}>
            You haven't created any voices yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#9a9a9a', mt: 1 }}>
            Click "Create a voice" to get started
          </Typography>
        </Paper>
      )}

      {/* Create Voice Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#1a1a1a' }}>
          Create a new voice
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Voice Name */}
            <TextField
              fullWidth
              label="Voice Name"
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              required
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#f6f5f1',
                },
              }}
            />

            {/* Gender Selection */}
            <FormLabel component="legend" sx={{ mb: 1, color: '#1a1a1a', fontWeight: 600 }}>
              Gender
            </FormLabel>
            <RadioGroup
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              sx={{ mb: 3 }}
            >
              <FormControlLabel
                value="Male"
                control={<Radio />}
                label="Male"
              />
              <FormControlLabel
                value="Female"
                control={<Radio />}
                label="Female"
              />
            </RadioGroup>

            {/* File Upload */}
            <FormLabel component="legend" sx={{ mb: 1, color: '#1a1a1a', fontWeight: 600 }}>
              Audio Samples (Multiple files supported)
            </FormLabel>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<CloudUploadIcon />}
              sx={{
                py: 1.5,
                borderRadius: '10px',
                borderColor: '#1a1a1a',
                color: '#1a1a1a',
                textTransform: 'none',
                fontSize: '1rem',
                mb: 1,
                '&:hover': {
                  borderColor: '#1a1a1a',
                  backgroundColor: 'rgba(26, 26, 26, 0.04)',
                },
              }}
            >
              {audioFiles.length > 0 ? `${audioFiles.length} file(s) selected` : 'Upload audio samples'}
              <input
                type="file"
                accept="audio/*"
                multiple
                hidden
                onChange={handleFileUpload}
              />
            </Button>
            {audioFiles.length > 0 && (
              <Box sx={{ mt: 1, mb: 1 }}>
                {audioFiles.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
            <Typography variant="caption" sx={{ color: '#6a6a6a', display: 'block' }}>
              Upload clean audio samples (WAV/MP3/M4A). Multiple files recommended for better quality.
            </Typography>
            {errorMessage && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: '8px' }}>
                {errorMessage}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={isUploading}
            sx={{
              color: '#6a6a6a',
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateVoice}
            variant="contained"
            disabled={!voiceName.trim() || audioFiles.length === 0 || isUploading}
            startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              backgroundColor: '#1a1a1a',
              color: '#fff',
              textTransform: 'none',
              fontSize: '1rem',
              px: 3,
              '&:hover': {
                backgroundColor: '#2a2a2a',
              },
              '&:disabled': {
                backgroundColor: '#d0d0d0',
                color: '#6a6a6a',
              },
            }}
          >
            {isUploading ? 'Uploading...' : 'Create Voice'}
          </Button>
        </DialogActions>
        {isUploading && (
          <Box sx={{ px: 3, pb: 2 }}>
            <LinearProgress sx={{ borderRadius: '4px' }} />
          </Box>
        )}
      </Dialog>

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
          Voice cloning initiated successfully! Your voice is being processed.
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={5000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          }}
        >
          {errorMessage || 'Failed to upload voice reference'}
        </Alert>
      </Snackbar>
    </Box>
  );
}
