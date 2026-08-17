'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { adminApi, AuditLogEntry } from '@/lib/api';

function actionLabel(action: string): string {
  const words = action.replace(/[._]/g, ' ').split(' ');
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function actionColor(action: string): 'error' | 'info' | 'default' {
  if (action.endsWith('.delete')) return 'error';
  if (action.endsWith('.create')) return 'info';
  return 'default';
}

export default function AuditLogSection() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLog = async () => {
      setIsLoading(true);
      try {
        const data = await adminApi.getAuditLog({ page: page + 1, pageSize: rowsPerPage });
        setEntries(data.items);
        setTotal(data.total);
        setError('');
      } catch (err) {
        console.error('Failed to fetch audit log:', err);
        setError('Failed to load audit log');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLog();
  }, [page, rowsPerPage]);

  return (
    <Box>
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
          Audit Log
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a4a4a' }}>
          Every account created, deleted, or changed by admins and vendors
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      <Card
        sx={{
          borderRadius: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f6f5f1' }}>
                  <TableCell sx={{ fontWeight: 700 }}>When</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actor</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Target</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ color: '#9a9a9a', textAlign: 'center', py: 4 }}>
                      No activity recorded yet.
                    </TableCell>
                  </TableRow>
                )}
                {entries.map((entry) => (
                  <TableRow key={entry.id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' } }}>
                    <TableCell sx={{ color: '#6a6a6a', whiteSpace: 'nowrap' }}>
                      {entry.created_at ? new Date(entry.created_at).toLocaleString() : '—'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{entry.actor_username}</TableCell>
                    <TableCell>
                      <Chip label={actionLabel(entry.action)} size="small" color={actionColor(entry.action)} />
                    </TableCell>
                    <TableCell sx={{ color: '#6a6a6a' }}>
                      {entry.target_username ?? (entry.target_id ? `#${entry.target_id}` : '—')}
                    </TableCell>
                    <TableCell sx={{ color: '#6a6a6a' }}>{entry.details ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      </Card>
    </Box>
  );
}
