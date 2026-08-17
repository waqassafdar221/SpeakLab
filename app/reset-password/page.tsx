'use client';

import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { authApi } from '@/lib/api';
import PasswordActivationForm, { shellSx } from '@/app/components/PasswordActivationForm';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Box sx={shellSx}>
          <CircularProgress />
        </Box>
      }
    >
      <PasswordActivationForm
        getInfo={authApi.getResetInfo}
        submit={authApi.resetPassword}
        headline="Reset your password"
        linkMissingMessage="This reset link is missing its token."
        linkInvalidMessage="This reset link is invalid or has expired."
        activatingLabel={(username) => `Resetting the password for ${username}`}
        fallbackLabel="Choose a new password for your account"
        submitLabel="Reset password & continue"
        successMessage="Password reset! Redirecting..."
      />
    </Suspense>
  );
}
