'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import NavbarWrapper from '@/components/NavbarWrapper';

interface AppWrapperProps {
  children: ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NavbarWrapper />
        {children}
      </AuthProvider>
    </ErrorBoundary>
  );
}
