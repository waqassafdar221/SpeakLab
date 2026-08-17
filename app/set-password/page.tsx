'use client';

import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { authApi } from '@/lib/api';
import PasswordActivationForm, { shellSx } from '@/app/components/PasswordActivationForm';

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Box sx={shellSx}>
          <CircularProgress />
        </Box>
      }
    >
      <PasswordActivationForm
        getInfo={authApi.getInvite}
        submit={authApi.setPassword}
        headline="Set your password"
        linkMissingMessage="This invite link is missing its token."
        linkInvalidMessage="This invite link is invalid or has expired."
        activatingLabel={(username) => `Activating the account for ${username}`}
        fallbackLabel="Choose a password to activate your account"
        submitLabel="Set password & continue"
        successMessage="Password set! Redirecting..."
      />
    </Suspense>
  );
}
