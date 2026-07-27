'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { settingsStore } from '@/lib/settingsStore';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');

  useEffect(() => {
    // Load theme from settings
    const settings = settingsStore.getSettings();
    setTheme(settings.theme);
    settingsStore.setTheme(settings.theme);
  }, []);

  return (
    <html lang="en" className={theme === 'dark' ? 'dark' : ''}>
      <body className={`${inter.className} bg-gray-950 text-gray-200`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}