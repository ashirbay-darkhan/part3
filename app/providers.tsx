'use client';

import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/auth/authContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}