'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Zap,
  ArrowLeft,
  ArrowRight,
  Calendar,
  MapPin,
  User,
  Filter,
  Gauge,
  Banknote,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { PlanCard } from '@/components/PlanCard';
import { LanguageToggle } from '@/components/LanguageToggle';
import { TopPicksComparison } from '@/components/TopPicksComparison';
import { SkyhookLink } from '@/components/SkyhookLink';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PLANS_LAST_UPDATED, IEC_BASE_RATE, VAT_RATE } from '@/data/plans';
import { formatNIS } from '@/lib/calculator';
import { cn } from '@/lib/utils';

export default function ResultsPage() {
  const router = useRouter();
  const { t, language, isRtl } = useI18n();
  const { results, usageData, reset } = useAppStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(new Set());

  // Get unique providers from results
  const allProviders = useMemo(() => {
    if (!results) return [];
    const providers = new Set<string>();
    results.forEach((r) => {
      if (r.plan.id !== 'iec-baseline') {
        providers.add(r.plan.provider);
      }
    });
    return Array.from(providers);
  }, [results]);

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

  const toggleProvider = (provider: string) => {
    setSelectedProviders((prev) => {
      const next = new Set(prev);
      if (next.has(provider)) {
        next.delete(provider);
      } else {
        next.add(provider);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedProviders(new Set());
  };

  // Empty selection means show all
  const hasActiveFilters = selectedProviders.size > 0;

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

  // Filter out IEC baseline and apply provider filter (empty = show all)
  const filteredResults = results.filter(
    (r) => r.plan.id !== 'iec-baseline' &&
      (selectedProviders.size === 0 || selectedProviders.has(r.plan.provider))
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

                  {/* Usage Stats */}
                  {(() => {
                    const totalKwh = usageData.totalKwh;
                    const monthlyKwh = (totalKwh / daysDiff) * 30;
                    const annualKwh = (totalKwh / daysDiff) * 365;
                    const annualCost = annualKwh * IEC_BASE_RATE * (1 + VAT_RATE);
                    const monthlyCost = annualCost / 12;
                    const isExtrapolated = daysDiff < 365;

                    return (
                      <>
                        <div className="flex items-center gap-3">
                          <Gauge className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {language === 'he' ? 'צריכה משוערת' : 'Est. Usage'}
                              {isExtrapolated && '*'}
                            </p>
                            <p className="font-medium">
                              {monthlyKwh.toFixed(0)} kWh/{language === 'he' ? 'חודש' : 'mo'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {annualKwh.toFixed(0)} kWh/{language === 'he' ? 'שנה' : 'yr'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Banknote className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {language === 'he' ? 'עלות צריכה משוערת' : 'Est. Usage Cost'}
                              {isExtrapolated && '*'}
                            </p>
                            <p className="font-medium">
                              {formatNIS(monthlyCost)}/{language === 'he' ? 'חודש' : 'mo'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatNIS(annualCost)}/{language === 'he' ? 'שנה' : 'yr'}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground border-t pt-3">
                          {isExtrapolated && (
                            <span>
                              {language === 'he'
                                ? '* משוער על בסיס הנתונים שהועלו. '
                                : '* Extrapolated from uploaded data. '}
                            </span>
                          )}
                          {language === 'he'
                            ? 'עלות צריכה בלבד, לא כולל חיובים קבועים.'
                            : 'Usage cost only, excludes fixed charges.'}
                        </p>
                      </>
                    );
                  })()}

                </CardContent>
              </Card>
            </motion.div>

          </div>

          {/* Main Content - Plan Results */}
          <div className="lg:col-span-2">
            {/* Top Picks Comparison */}
            <TopPicksComparison topPlans={filteredResults} usageData={usageData} />

            <motion.div
              initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Provider Filter */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {language === 'he' ? 'סינון לפי ספק' : 'Filter by provider'}
                  </span>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs h-6 px-2"
                    >
                      {language === 'he' ? 'נקה' : 'Clear'}
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {allProviders.map((provider) => {
                    const isSelected = selectedProviders.has(provider);
                    const providerHebrew = results?.find(
                      (r) => r.plan.provider === provider
                    )?.plan.providerHebrew;
                    return (
                      <Badge
                        key={provider}
                        variant={isSelected ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer transition-colors',
                          isSelected
                            ? 'bg-primary hover:bg-primary/80'
                            : 'hover:bg-muted'
                        )}
                        onClick={() => toggleProvider(provider)}
                      >
                        {language === 'he' ? providerHebrew : provider}
                      </Badge>
                    );
                  })}
                </div>
              </div>

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
                  <div className="grid gap-6 md:grid-cols-2 items-start">
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
                  <div className="grid gap-6 md:grid-cols-2 items-start">
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
                    <div className="grid gap-6 md:grid-cols-2 items-start">
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
            <SkyhookLink />
          </div>
        </div>
      </footer>
    </div>
  );
}
