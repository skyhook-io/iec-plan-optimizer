'use client';

import { motion } from 'framer-motion';
import { Zap, Clock, TrendingDown, ExternalLink, Trophy } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { formatNIS, formatPercent } from '@/lib/calculator';
import type { PlanResult, ParsedUsageData } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { UsageProfileChart } from './UsageProfileChart';
import { getHourlyUsageProfile } from '@/lib/calculator';

interface TopPicksComparisonProps {
  topPlans: PlanResult[];
  usageData?: ParsedUsageData;
}

export function TopPicksComparison({ topPlans, usageData }: TopPicksComparisonProps) {
  const { language, isRtl } = useI18n();

  // Always show best flat and best variable plan
  const bestFixed = topPlans.find(r => !r.plan.requiresSmartMeter);
  const bestTou = topPlans.find(r => r.plan.requiresSmartMeter);

  // Order by savings (best first)
  const top2 = [bestFixed, bestTou]
    .filter((r): r is PlanResult => r !== undefined)
    .sort((a, b) => b.savings - a.savings);

  if (top2.length === 0) return null;


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-8"
    >
      <h2 className="text-lg font-semibold mb-4">
        {language === 'he' ? 'התוכניות המומלצות עבורך' : 'Top Picks For You'}
      </h2>

      <div className="grid gap-4 md:grid-cols-2 items-stretch">
        {top2.map((result, index) => (
          <TopPickCard
            key={result.plan.id}
            result={result}
            index={index}
            language={language}
            isRtl={isRtl}
            usageData={usageData}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        {language === 'he'
          ? 'החיסכון כולל מע"מ והוא על צריכה בלבד. גלול למטה לכל התוכניות.'
          : 'Savings incl. VAT, on usage only. Scroll down for all plans.'}
      </p>
    </motion.div>
  );
}

interface TopPickCardProps {
  result: PlanResult;
  index: number;
  language: 'he' | 'en';
  isRtl: boolean;
  usageData?: ParsedUsageData;
}

function TopPickCard({ result, index, language, isRtl, usageData }: TopPickCardProps) {
  const { plan, savings, savingsPercent, baselineCost, discountedCost, breakdown } = result;
  const providerName = language === 'he' ? plan.providerHebrew : plan.provider;
  const planName = language === 'he' ? plan.planNameHebrew : plan.planName;
  const conditions = language === 'he' ? plan.conditionsHebrew : plan.conditions;
  const hasMembership = !!plan.requiresMembership;
  const isTimeOfUse = plan.requiresSmartMeter;
  const hasDiscountRange = !!plan.discountRange;

  // Calculate savings range for plans with discountRange
  const savingsRange = hasDiscountRange ? {
    min: baselineCost * plan.discountRange!.min,
    max: baselineCost * plan.discountRange!.max,
  } : null;

  // Determine styling based on plan type
  const Icon = isTimeOfUse ? Clock : Zap;
  const labelHe = isTimeOfUse ? 'תעריף משתנה' : 'הנחה קבועה';
  const labelEn = isTimeOfUse ? 'Time-of-Use' : 'Fixed Discount';
  const colorClass = index === 0
    ? 'border-primary bg-primary/5 dark:bg-primary/10'
    : isTimeOfUse
      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
      : 'border-blue-500 bg-blue-50 dark:bg-blue-950/30';
  const badgeClass = isTimeOfUse
    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
    : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';

  // Get discount display
  const getDiscountDisplay = () => {
    if (isTimeOfUse) {
      const maxDiscount = Math.max(...plan.discountWindows.map(w => w.discount));
      return `${language === 'he' ? 'עד' : 'Up to'} ${formatPercent(maxDiscount * 100)}`;
    }
    if (plan.billBasedTiers && plan.billBasedTiers.length > 0) {
      return `${formatPercent(savingsPercent)}*`;
    }
    if (plan.discountRange) {
      return `${formatPercent(plan.discountRange.min * 100)}-${formatPercent(plan.discountRange.max * 100)}`;
    }
    const discount = plan.discountWindows[0]?.discount || plan.defaultDiscount;
    return formatPercent(discount * 100);
  };

  const usageProfileData = isTimeOfUse && usageData
    ? getHourlyUsageProfile(usageData, plan)
    : null;

  const discountedPercent = breakdown.discountedUsageKwh + breakdown.regularUsageKwh > 0
    ? (breakdown.discountedUsageKwh / (breakdown.discountedUsageKwh + breakdown.regularUsageKwh)) * 100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className="h-full"
    >
      <Card
        dir={isRtl ? 'rtl' : 'ltr'}
        className={cn('relative overflow-hidden h-full flex flex-col', colorClass)}
      >
        {/* Rank indicator */}
        {index === 0 && (
          <div className="absolute top-0 left-0 right-0 bg-primary px-3 py-1 text-center">
            <span className="text-xs font-medium text-primary-foreground flex items-center justify-center gap-1">
              <Trophy className="h-3 w-3" />
              {language === 'he' ? 'מומלץ ביותר' : 'Best Match'}
            </span>
          </div>
        )}

        <CardContent className={cn('p-4 flex-1 flex flex-col', index === 0 && 'pt-8')}>
          {/* Type Badge */}
          <div className="flex items-center justify-between mb-3">
            <Badge className={cn('gap-1', badgeClass)}>
              <Icon className="h-3 w-3" />
              {language === 'he' ? labelHe : labelEn}
            </Badge>
            <Badge variant="outline">
              {getDiscountDisplay()}
            </Badge>
          </div>

          {/* Provider & Plan */}
          <div className="mb-3">
            <p className="text-sm text-muted-foreground">{providerName}</p>
            <p className="font-semibold">
              {planName}
              {hasMembership && <span className="text-amber-500">*</span>}
            </p>
          </div>

          {/* Savings highlight */}
          <div className="rounded-lg bg-green-100/50 dark:bg-green-900/30 p-3 mb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                {language === 'he' ? 'חיסכון שנתי משוער' : 'Est. Annual Savings'}
              </span>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">
              {savingsRange
                ? `${formatNIS(savingsRange.min)}-${formatNIS(savingsRange.max)}`
                : formatNIS(savings)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-500">
              {hasDiscountRange
                ? `${formatPercent(plan.discountRange!.min * 100)}-${formatPercent(plan.discountRange!.max * 100)}`
                : formatPercent(savingsPercent)} {language === 'he' ? 'הנחה' : 'discount'}
            </p>
          </div>

          {/* Cost comparison */}
          <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">
                {language === 'he' ? 'עם התוכנית' : 'With plan'}
              </p>
              <p className="font-semibold">
                {savingsRange
                  ? `${formatNIS(baselineCost - savingsRange.max)}-${formatNIS(baselineCost - savingsRange.min)}`
                  : formatNIS(discountedCost)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {language === 'he' ? 'ללא הנחה' : 'Without discount'}
              </p>
              <p className="font-semibold line-through opacity-60">{formatNIS(baselineCost)}</p>
            </div>
          </div>

          {/* TOU specific: Usage breakdown */}
          {isTimeOfUse && (
            <>
              <Separator className="my-3" />
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">
                  {language === 'he' ? 'צריכה בשעות הנחה:' : 'Usage in discount hours:'}
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {discountedPercent.toFixed(0)}%
                </span>
              </div>

              {/* Usage profile chart */}
              {usageProfileData && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {language === 'he' ? 'פרופיל צריכה יומי' : 'Daily Usage Profile'}
                    </p>
                    {/* Discount windows inline */}
                    {plan.discountWindows.length > 0 && (
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-muted-foreground">
                          {plan.discountWindows[0] && `${plan.discountWindows[0].startHour}:00-${plan.discountWindows[0].endHour}:00`}
                        </span>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {plan.discountWindows[0] && formatPercent(plan.discountWindows[0].discount * 100)}
                        </span>
                      </div>
                    )}
                  </div>
                  <UsageProfileChart data={usageProfileData} plan={plan} />
                </div>
              )}

              {/* Tip for non-top TOU plans */}
              {index > 0 && (
                <div className="rounded-lg bg-purple-100/50 dark:bg-purple-900/30 p-2 mt-2 mb-3">
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    {language === 'he'
                      ? 'טיפ: העברת צריכה לשעות ההנחה עשויה לחסוך יותר.'
                      : 'Tip: Shifting usage to discount hours could save more.'}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Fixed plan info */}
          {!isTimeOfUse && (
            <>
              <Separator className="my-3" />
              <p className="text-xs text-muted-foreground mb-2">
                {language === 'he'
                  ? 'הנחה על כל הצריכה, 24/7, ללא מונה חכם.'
                  : 'Discount on all usage, 24/7, no smart meter.'}
              </p>
              {/* Usage profile chart for fixed plans too */}
              {usageData && (
                <div className="mb-6">
                  <p className="text-xs font-medium mb-1 text-muted-foreground">
                    {language === 'he' ? 'פרופיל צריכה יומי' : 'Daily Usage Profile'}
                  </p>
                  <UsageProfileChart data={getHourlyUsageProfile(usageData)} plan={undefined} />
                </div>
              )}
            </>
          )}

          {/* Membership note */}
          {hasMembership && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
              * {language === 'he'
                ? plan.requiresMembership!.descriptionHebrew
                : plan.requiresMembership!.descriptionEnglish}
            </p>
          )}

          {/* Conditions */}
          {conditions && conditions.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {language === 'he' ? 'תנאים:' : 'Conditions:'}
              </p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {conditions.slice(0, 2).map((condition, i) => (
                  <li key={i}>• {condition}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Spacer to push button to bottom */}
          <div className="flex-1" />

          {/* CTA */}
          <Button size="sm" className="w-full" asChild>
            <a
              href={plan.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {language === 'he' ? 'לאתר הספק' : 'Visit Provider'}
              <ExternalLink className="ms-2 h-3 w-3" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
