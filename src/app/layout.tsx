import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { I18nProvider } from '@/components/I18nProvider';
import { PostHogProvider } from '@/components/PostHogProvider';
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
  title: 'מחשבון תוכניות חשמל חכם | Smart Electricity Plan Calculator',
  description:
    'מצא את התוכנית המשתלמת ביותר לחשמל על סמך הצריכה האמיתית שלך. Find the best electricity plan based on your actual smart meter usage.',
  keywords: [
    'חשמל',
    'חברת החשמל',
    'מונה חכם',
    'חיסכון',
    'electricity',
    'IEC',
    'smart meter',
    'Israel',
  ],
  authors: [{ name: 'IEC Plan Optimizer' }],
  openGraph: {
    title: 'מחשבון תוכניות חשמל חכם',
    description: 'מצא את התוכנית המשתלמת ביותר לחשמל על סמך הצריכה האמיתית שלך',
    type: 'website',
    locale: 'he_IL',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PostHogProvider>
          <I18nProvider locale="he">{children}</I18nProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
