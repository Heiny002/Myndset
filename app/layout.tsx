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
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a0a',
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
