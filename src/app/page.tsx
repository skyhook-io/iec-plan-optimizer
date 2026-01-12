'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, TrendingDown, Gauge, Calculator } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { CsvUploader } from '@/components/CsvUploader';
import { Instructions } from '@/components/Instructions';
import { LanguageToggle } from '@/components/LanguageToggle';
import { NoSmartMeterCalculator } from '@/components/NoSmartMeterCalculator';
import { PLANS_LAST_UPDATED } from '@/data/plans';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Shield,
    titleHe: 'פרטיות מלאה',
    titleEn: 'Full Privacy',
    descHe: 'הנתונים נשארים במכשיר שלך',
    descEn: 'Data stays on your device',
  },
  {
    icon: Zap,
    titleHe: 'ניתוח מיידי',
    titleEn: 'Instant Analysis',
    descHe: 'תוצאות תוך שניות',
    descEn: 'Results in seconds',
  },
  {
    icon: TrendingDown,
    titleHe: 'חיסכון אמיתי',
    titleEn: 'Real Savings',
    descHe: 'מבוסס על הצריכה שלך',
    descEn: 'Based on your actual usage',
  },
];

type Mode = 'smart-meter' | 'no-smart-meter';

export default function HomePage() {
  const router = useRouter();
  const { t, language, isRtl } = useI18n();
  const [mode, setMode] = useState<Mode>('smart-meter');

  const handleUploadSuccess = () => {
    router.push(language === 'en' ? '/en/results' : '/results');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-semibold">
              {language === 'he' ? 'מחשבון חשמל חכם' : 'Smart Electricity'}
            </span>
          </div>
          <LanguageToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleEn}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="flex flex-col items-center rounded-xl bg-card p-6 text-center shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">
                {language === 'he' ? feature.titleHe : feature.titleEn}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {language === 'he' ? feature.descHe : feature.descEn}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-12 max-w-md"
        >
          <div className="flex rounded-lg border bg-muted/50 p-1">
            <button
              onClick={() => setMode('smart-meter')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-all',
                mode === 'smart-meter'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Gauge className="h-4 w-4" />
              {language === 'he' ? 'יש לי מונה חכם' : 'I have a smart meter'}
            </button>
            <button
              onClick={() => setMode('no-smart-meter')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-all',
                mode === 'no-smart-meter'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Calculator className="h-4 w-4" />
              {language === 'he' ? 'אין לי מונה חכם' : 'No smart meter'}
            </button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="mx-auto mt-8 max-w-5xl">
          <AnimatePresence mode="wait">
            {mode === 'smart-meter' ? (
              <motion.div
                key="smart-meter"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid gap-8 md:grid-cols-2">
                  {/* Upload Section */}
                  <motion.div
                    initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <CsvUploader onSuccess={handleUploadSuccess} />
                  </motion.div>

                  {/* Instructions Section */}
                  <motion.div
                    initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Instructions />
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="no-smart-meter"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="max-w-xl mx-auto"
              >
                <NoSmartMeterCalculator
                  onUploadClick={() => setMode('smart-meter')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

              </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center text-sm text-muted-foreground">
            <p>{t('disclaimer')}</p>
            <p className="mt-2">
              {t('lastUpdated')}: {PLANS_LAST_UPDATED}
            </p>
            <p className="mt-4 text-xs">{t('privacyNote')}</p>
            <div className="mt-8 pt-6 border-t border-border/50" dir="ltr">
              <p className="text-xs text-muted-foreground/70 mb-3">
                Powered by
              </p>
              <a
                href="https://skyhook.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block group"
              >
                <img
                  src="/images/skyhook-logo.svg"
                  alt="Skyhook"
                  className="h-6 opacity-70 group-hover:opacity-100 group-hover:scale-105 group-hover:-translate-y-0.5 transition-all duration-200"
                />
              </a>
              <p className="mt-2 text-xs text-muted-foreground/70">
                Ship like a team twice your size
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
