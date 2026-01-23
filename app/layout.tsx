import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://trymyndset.com'),
  title: 'Myndset | AI-Powered Performance Meditation',
  description:
    'Unlock your competitive edge with AI-generated meditation scripts tailored to your goals. Meditation for boardrooms, not yoga studios.',
  keywords: [
    'meditation',
    'performance',
    'AI meditation',
    'personalized meditation',
    'executive meditation',
    'athlete meditation',
    'mental performance',
    'competitive advantage',
  ],
  authors: [{ name: 'Myndset' }],
  creator: 'Myndset',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Myndset',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://trymyndset.com',
    siteName: 'Myndset',
    title: 'Myndset | AI-Powered Performance Meditation',
    description:
      'Unlock your competitive edge with AI-generated meditation scripts tailored to your goals.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Myndset - Performance Meditation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Myndset | AI-Powered Performance Meditation',
    description:
      'Unlock your competitive edge with AI-generated meditation scripts tailored to your goals.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: light)', color: '#0a0a0a' },
  ],
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
