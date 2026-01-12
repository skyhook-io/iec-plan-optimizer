'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, Clock, Zap, ExternalLink, ChevronDown, BarChart3 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { formatNIS, formatPercent, getHourlyUsageProfile } from '@/lib/calculator';
import type { PlanResult, ParsedUsageData } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { UsageProfileChart } from './UsageProfileChart';

interface PlanCardProps {
  result: PlanResult;
  rank: number;
  isRecommended?: boolean;
  usageData?: ParsedUsageData;
}

export function PlanCard({ result, rank, isRecommended, usageData }: PlanCardProps) {
  const { t, language, isRtl } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);
  const { plan, savings, savingsPercent, baselineCost, discountedCost, breakdown } = result;

  const providerName = language === 'he' ? plan.providerHebrew : plan.provider;
  const planName = language === 'he' ? plan.planNameHebrew : plan.planName;
  const conditions = language === 'he' ? plan.conditionsHebrew : plan.conditions;

  const isTimeOfUse = plan.requiresSmartMeter;
  const hasBillBasedTiers = plan.billBasedTiers && plan.billBasedTiers.length > 0;
  const hasMembership = !!plan.requiresMembership;
  const hasDiscountRange = !!plan.discountRange;

  // For fixed plans, get the main discount from the first discount window
  // For time-of-use plans, show "Time-based" badge
  // For tiered plans, show the effective discount
  const getMainDiscount = () => {
    if (isTimeOfUse) return null;
    if (hasBillBasedTiers) {
      // Show the effective discount from the result
      return savingsPercent / 100;
    }
    if (plan.discountWindows.length > 0) {
      return plan.discountWindows[0].discount;
    }
    return plan.defaultDiscount;
  };

  const mainDiscount = getMainDiscount();
  const discountDisplay = isTimeOfUse
    ? t('timeOfUse')
    : hasBillBasedTiers
      ? `${formatPercent(savingsPercent)}*`
      : hasDiscountRange
        ? `${formatPercent(plan.discountRange!.min * 100)}-${formatPercent(plan.discountRange!.max * 100)}`
        : mainDiscount
          ? formatPercent(mainDiscount * 100)
          : '0%';

  // Generate usage profile data for time-of-use plans
  const usageProfileData = isTimeOfUse && usageData
    ? getHourlyUsageProfile(usageData, plan)
    : null;

  const discountedPercent = breakdown.discountedUsageKwh / (breakdown.discountedUsageKwh + breakdown.regularUsageKwh) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      layout
      className="h-full"
    >
      <Card
        dir={isRtl ? 'rtl' : 'ltr'}
        className={cn(
          'relative overflow-hidden transition-shadow hover:shadow-lg cursor-pointer h-full flex flex-col',
          isRecommended && 'border-primary ring-2 ring-primary/20',
          isExpanded && 'ring-2 ring-primary/10'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isRecommended && (
          <div className="absolute top-0 left-0 right-0 bg-primary px-4 py-1.5 text-center text-sm font-medium text-primary-foreground">
            {t('recommended')}
          </div>
        )}

        <CardHeader className={cn(isRecommended && 'pt-10')}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{providerName}</p>
              <CardTitle className="text-xl" dir="auto">
                {planName}
                {hasMembership && <span className="text-amber-500">*</span>}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isTimeOfUse ? 'secondary' : 'outline'}>
                {isTimeOfUse ? (
                  <Clock className="me-1 h-3 w-3" />
                ) : (
                  <Zap className="me-1 h-3 w-3" />
                )}
                {discountDisplay}
              </Badge>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </motion.div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1">
          {/* Savings highlight */}
          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/30">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <TrendingDown className="h-5 w-5" />
              <span className="text-sm font-medium">{t('annualSavings')}</span>
            </div>
            <p className="mt-1 text-3xl font-bold text-green-700 dark:text-green-400">
              {formatNIS(savings)}
            </p>
            <p className="text-sm text-green-600 dark:text-green-500">
              {formatPercent(savingsPercent)} {t('discount')}
            </p>
            {result.savingsCapped && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                {language === 'he'
                  ? `* מוגבל ל-${plan.maxMonthlySavings} ₪ לחודש`
                  : `* Capped at ${plan.maxMonthlySavings} NIS/month`}
              </p>
            )}
            {hasMembership && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                * {language === 'he'
                  ? plan.requiresMembership!.descriptionHebrew
                  : plan.requiresMembership!.descriptionEnglish}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {language === 'he'
                ? 'כולל מע"מ. ההנחה היא על צריכה בלבד.'
                : 'Incl. VAT. Discount on usage only.'}
            </p>
          </div>

          {/* Cost comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">{t('withPlan')}</p>
              <p className="text-lg font-semibold">{formatNIS(discountedCost)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('currentCost')}</p>
              <p className="text-lg font-semibold line-through opacity-60">
                {formatNIS(baselineCost)}
              </p>
            </div>
          </div>

          {/* Expanded content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                {/* Usage breakdown for this plan */}
                {isTimeOfUse && (
                  <>
                    <Separator className="my-4" />
                    <div className="rounded-lg bg-muted/50 p-3 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {language === 'he' ? 'התפלגות הצריכה שלך' : 'Your Usage Breakdown'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">
                            {language === 'he' ? 'בשעות הנחה' : 'During discount hours'}
                          </p>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            {breakdown.discountedUsageKwh.toFixed(0)} kWh ({discountedPercent.toFixed(0)}%)
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            {language === 'he' ? 'תעריף רגיל' : 'Regular rate'}
                          </p>
                          <p className="font-semibold">
                            {breakdown.regularUsageKwh.toFixed(0)} kWh ({(100 - discountedPercent).toFixed(0)}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Usage profile chart for time-of-use plans */}
                {usageProfileData && (
                  <>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">
                        {language === 'he' ? 'פרופיל צריכה יומי ממוצע' : 'Average Daily Usage Profile'}
                      </p>
                      <UsageProfileChart data={usageProfileData} plan={plan} />
                    </div>
                  </>
                )}

                {/* Time-of-use breakdown */}
                {isTimeOfUse && plan.discountWindows.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2 text-sm">
                      <p className="font-medium mb-2">
                        {language === 'he' ? 'חלונות הנחה' : 'Discount Windows'}
                      </p>
                      {plan.discountWindows.map((window, index) => {
                        // Format the time window description
                        const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;
                        const timeRange = window.startHour > window.endHour
                          ? `${formatHour(window.startHour)} - ${formatHour(window.endHour)}`
                          : `${formatHour(window.startHour)} - ${formatHour(window.endHour)}`;

                        // Format days
                        const dayNames = language === 'he'
                          ? ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
                          : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        const days = window.days.map(d => dayNames[d]).join('-');

                        return (
                          <div key={index} className="flex justify-between">
                            <span className="text-muted-foreground">
                              {days} {timeRange}
                            </span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {formatPercent(window.discount * 100)} {t('discount')}
                            </span>
                          </div>
                        );
                      })}
                      {plan.defaultDiscount === 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {language === 'he'
                            ? '* ללא הנחה מחוץ לחלונות זמן אלו'
                            : '* No discount outside these time windows'}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Bill-based tiered discount info */}
                {hasBillBasedTiers && plan.billBasedTiers && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2 text-sm">
                      <p className="font-medium mb-2">
                        {language === 'he' ? 'מדרגות הנחה לפי חשבון חודשי' : 'Discount Tiers by Monthly Bill'}
                      </p>
                      {plan.billBasedTiers.map((tier, index) => {
                        const prevMax = index > 0 ? plan.billBasedTiers![index - 1].maxBill : 0;
                        const rangeText = tier.maxBill === Infinity
                          ? (language === 'he' ? `מעל ${prevMax} ₪` : `Over ${prevMax} NIS`)
                          : (language === 'he'
                              ? `עד ${tier.maxBill} ₪`
                              : `Up to ${tier.maxBill} NIS`);
                        return (
                          <div key={index} className="flex justify-between">
                            <span className="text-muted-foreground">{rangeText}</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {formatPercent(tier.discount * 100)} {t('discount')}
                            </span>
                          </div>
                        );
                      })}
                      <p className="text-xs text-muted-foreground mt-2">
                        {language === 'he'
                          ? '* ההנחה המוצגת מחושבת לפי החשבון החודשי הממוצע שלך'
                          : '* Displayed discount is calculated based on your average monthly bill'}
                      </p>
                    </div>
                  </>
                )}

                {/* Fixed plan info */}
                {!isTimeOfUse && !hasBillBasedTiers && (
                  <>
                    <Separator className="my-4" />
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3">
                      {hasDiscountRange ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-400">
                              {language === 'he'
                                ? plan.discountRange!.maxLabelHebrew
                                : plan.discountRange!.maxLabelEnglish}
                            </span>
                            <span className="font-medium text-blue-700 dark:text-blue-400">
                              {formatPercent(plan.discountRange!.max * 100)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-600 dark:text-blue-500">
                              {language === 'he'
                                ? plan.discountRange!.minLabelHebrew
                                : plan.discountRange!.minLabelEnglish}
                            </span>
                            <span className="font-medium text-blue-600 dark:text-blue-500">
                              {formatPercent(plan.discountRange!.min * 100)}
                            </span>
                          </div>
                          <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-2">
                            {language === 'he'
                              ? 'הנחה על כל הצריכה, בכל שעות היממה'
                              : 'Discount on all usage, 24/7'}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          {language === 'he'
                            ? `הנחה קבועה של ${formatPercent((mainDiscount || 0) * 100)} על כל הצריכה, בכל שעות היממה`
                            : `Fixed ${formatPercent((mainDiscount || 0) * 100)} discount on all usage, 24/7`}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Conditions */}
                {conditions && conditions.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        {t('conditions')}
                      </p>
                      <ul className="space-y-1 text-sm">
                        {conditions.map((condition, i) => (
                          <li key={i} className="text-muted-foreground">
                            • {condition}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter onClick={(e) => e.stopPropagation()}>
          <Button className="w-full" asChild>
            <a
              href={plan.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('switchProvider')}
              <ExternalLink className="ms-2 h-4 w-4" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
