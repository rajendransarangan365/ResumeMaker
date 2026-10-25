import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { OfflineBanner } from '@/components/OfflineBanner';

const siteUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ATS Resume Intelligence Studio | AI-Powered ATS Resume Builder',
    template: '%s | ATS Resume Intelligence Studio',
  },
  description:
    'Craft ATS-compliant resumes with verified candidate profile tracking, Google Gemini AI optimization, 15 professional templates, live A4 balancing, and instant PDF/Word exports.',
  applicationName: 'ATS Resume Intelligence Studio',
  authors: [{ name: 'ATS Resume Intelligence Studio', url: siteUrl }],
  generator: 'Next.js',
  keywords: [
    'ATS Resume',
    'Resume Builder',
    'AI Resume Maker',
    'Google Gemini AI',
    'Job Description Matcher',
    'Career Gap Assistant',
    'Professional Resume Templates',
    'A4 PDF Resume Export',
    'Word DOCX Resume Export',
    'Applicant Tracking System',
  ],
  creator: 'ATS Resume Intelligence Studio',
  publisher: 'ATS Resume Intelligence Studio',
  category: 'Career & Employment',
  manifest: '/manifest.json',

  // Website Icons & Favicons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icon.svg',
        color: '#2563eb',
      },
    ],
  },

  // Open Graph Metadata (https://ogp.me/) for Facebook, WhatsApp, LinkedIn, Discord
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'ATS Resume Intelligence Studio',
    title: 'ATS Resume Intelligence Studio | AI-Powered ATS Resume Builder',
    description:
      'Craft ATS-compliant resumes with verified candidate profile tracking, Google Gemini AI optimization, 15 professional templates, live A4 balancing, and instant PDF/Word exports.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'ATS Resume Intelligence Studio - AI-Assisted ATS Resume Builder with 15 Professional Templates',
      },
    ],
  },

  // Twitter / X Card Metadata
  twitter: {
    card: 'summary_large_image',
    title: 'ATS Resume Intelligence Studio | AI-Powered ATS Resume Builder',
    description:
      'Craft recruiter-ready, ATS-compliant resumes with Google Gemini AI optimization, 15 professional templates, and verified career history.',
    site: '@ATSResumeStudio',
    creator: '@ATSResumeStudio',
    images: [
      {
        url: '/twitter-image.png',
        width: 1200,
        height: 630,
        alt: 'ATS Resume Intelligence Studio Preview Card',
      },
    ],
  },

  // Search Engine Bot Directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: '/',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        {/* Specific social crawler tags for WhatsApp & Facebook */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:secure_url" content={`${siteUrl}/og-image.png`} />
        <meta name="twitter:image:alt" content="ATS Resume Intelligence Studio" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
      </head>
      <body className="min-h-dvh flex flex-col bg-studio-50 text-studio-900">
        <OfflineBanner />
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
