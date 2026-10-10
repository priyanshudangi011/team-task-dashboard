import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Team Task Management Dashboard',
  description: 'Responsive task dashboard for team planning, status tracking, and assignment workflows.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-50">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
