'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Zap,
  ArrowLeft,
  ArrowRight,
  Calendar,
  FileText,
  MapPin,
  User,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { PlanCard } from '@/components/PlanCard';
import { UsageChart } from '@/components/UsageChart';
import { LanguageToggle } from '@/components/LanguageToggle';
import { TopPicksComparison } from '@/components/TopPicksComparison';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PLANS_LAST_UPDATED } from '@/data/plans';

export default function ResultsPage() {
  const router = useRouter();
  const { t, language, isRtl } = useI18n();
  const { results, usageData, reset } = useAppStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for hydration before checking data
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Redirect to home if no results (only after hydration)
  useEffect(() => {
    if (isHydrated && (!results || !usageData)) {
      router.push(language === 'en' ? '/en' : '/');
    }
  }, [results, usageData, router, isHydrated, language]);

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Zap className="h-8 w-8 text-primary animate-pulse mx-auto" />
          <p className="mt-4 text-muted-foreground">{language === 'he' ? 'טוען...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!results || !usageData) {
    return null;
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US');
  };

  const daysDiff = Math.ceil(
    (usageData.endDate.getTime() - usageData.startDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Filter out IEC baseline for the main display
  const filteredResults = results.filter(
    (r) => r.plan.id !== 'iec-baseline'
  );

  // Separate fixed and time-of-use plans
  // Fixed plans don't require smart meter (discount applies all the time)
  // Time-of-use plans require smart meter (discount only during specific windows)
  const fixedPlans = filteredResults.filter(
    (r) => !r.plan.requiresSmartMeter
  );
  const timeOfUsePlans = filteredResults.filter(
    (r) => r.plan.requiresSmartMeter
  );

  const handleNewAnalysis = () => {
    reset();
    router.push(language === 'en' ? '/en' : '/');
  };

  const Arrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleNewAnalysis}>
              <Arrow className="h-4 w-4" />
              <span className="ms-2">
                {language === 'he' ? 'ניתוח חדש' : 'New Analysis'}
              </span>
            </Button>
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="font-semibold">
                {language === 'he' ? 'מחשבון חשמל חכם' : 'Smart Electricity'}
              </span>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold md:text-3xl">{t('resultsTitle')}</h1>
          <p className="mt-1 text-muted-foreground">{t('resultsSubtitle')}</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sidebar - File Info & Usage Chart */}
          <div className="space-y-6 lg:col-span-1">
            {/* File Info */}
            <motion.div
              initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card dir={isRtl ? 'rtl' : 'ltr'}>
                <CardHeader>
                  <CardTitle className="text-lg">{t('fileInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {usageData.customerName && (
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t('customer')}
                        </p>
                        <p className="font-medium">{usageData.customerName}</p>
                      </div>
                    </div>
                  )}

                  {usageData.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t('address')}
                        </p>
                        <p className="font-medium">{usageData.address}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t('dateRange')}
                      </p>
                      <p className="font-medium">
                        {formatDate(usageData.startDate)} -{' '}
                        {formatDate(usageData.endDate)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ({daysDiff}{' '}
                        {language === 'he' ? 'ימים' : 'days'})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t('totalRecords')}
                      </p>
                      <p className="font-medium">
                        {usageData.records.length.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Usage Chart */}
            <motion.div
              initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <UsageChart usageData={usageData} topPlan={timeOfUsePlans[0]} />
            </motion.div>
          </div>

          {/* Main Content - Plan Results */}
          <div className="lg:col-span-2">
            {/* Top Picks Comparison */}
            <TopPicksComparison topPlans={filteredResults} />

            <motion.div
              initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Tabs defaultValue="all">
                <TabsList className="mb-6">
                  <TabsTrigger value="all">
                    {language === 'he' ? 'כל התוכניות' : 'All Plans'}
                    <span className="ms-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
                      {filteredResults.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="fixed">
                    {language === 'he' ? 'הנחה קבועה' : 'Fixed Discount'}
                    <span className="ms-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
                      {fixedPlans.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="tou">
                    {language === 'he' ? 'תעריף משתנה' : 'Time-of-Use'}
                    <span className="ms-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
                      {timeOfUsePlans.length}
                    </span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <div className="grid gap-6 md:grid-cols-2 items-stretch">
                    {filteredResults.map((result, index) => (
                      <PlanCard
                        key={result.plan.id}
                        result={result}
                        rank={index}
                        usageData={usageData}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="fixed">
                  <div className="grid gap-6 md:grid-cols-2 items-stretch">
                    {fixedPlans.map((result, index) => (
                      <PlanCard
                        key={result.plan.id}
                        result={result}
                        rank={index}
                        usageData={usageData}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="tou">
                  {timeOfUsePlans.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 items-stretch">
                      {timeOfUsePlans.map((result, index) => (
                        <PlanCard
                          key={result.plan.id}
                          result={result}
                          rank={index}
                          usageData={usageData}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">
                        {language === 'he'
                          ? 'אין תוכניות תעריף משתנה זמינות'
                          : 'No time-of-use plans available'}
                      </p>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center text-sm text-muted-foreground">
            <p>{t('disclaimer')}</p>
            <p className="mt-2">
              {t('lastUpdated')}: {PLANS_LAST_UPDATED}
            </p>
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
