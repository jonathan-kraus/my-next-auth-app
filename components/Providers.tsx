'use client';

import { SessionProvider } from 'next-auth/react';
import { StackProvider, StackTheme } from '@stackframe/stack';
import { stackClientApp } from '../stack/client';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <StackProvider app={stackClientApp}>
        <StackTheme>{children}</StackTheme>
      </StackProvider>
    </SessionProvider>
  );
}
