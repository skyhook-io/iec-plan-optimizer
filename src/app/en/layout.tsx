import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { I18nProvider } from '@/components/I18nProvider';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Smart Electricity Plan Calculator | IEC Plan Optimizer',
  description:
    'Find the best electricity plan based on your actual smart meter usage. Upload your IEC data and get personalized recommendations.',
  keywords: [
    'electricity',
    'IEC',
    'smart meter',
    'Israel',
    'savings',
    'electricity plan',
  ],
  authors: [{ name: 'IEC Plan Optimizer' }],
  openGraph: {
    title: 'Smart Electricity Plan Calculator',
    description: 'Find the best electricity plan based on your actual smart meter usage',
    type: 'website',
    locale: 'en_US',
  },
};

export default function EnglishLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider locale="en">{children}</I18nProvider>
      </body>
    </html>
  );
}
