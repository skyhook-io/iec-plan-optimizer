'use client';

import { motion } from 'framer-motion';
import { Zap, Clock, TrendingDown, ExternalLink, Trophy } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { formatNIS, formatPercent } from '@/lib/calculator';
import type { PlanResult } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TopPicksComparisonProps {
  topPlans: PlanResult[];
}

export function TopPicksComparison({ topPlans }: TopPicksComparisonProps) {
  const { language, isRtl } = useI18n();

  // Take top 2 plans
  const top2 = topPlans.slice(0, 2);

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
        {top2.map((result, index) => {
          const { plan, savings, savingsPercent } = result;
          const providerName = language === 'he' ? plan.providerHebrew : plan.provider;
          const planName = language === 'he' ? plan.planNameHebrew : plan.planName;
          const hasMembership = !!plan.requiresMembership;
          const isTimeOfUse = plan.requiresSmartMeter;

          // Determine styling based on plan type
          const Icon = isTimeOfUse ? Clock : Zap;
          const labelHe = isTimeOfUse ? 'תעריף משתנה' : 'הנחה קבועה';
          const labelEn = isTimeOfUse ? 'Time-of-Use' : 'Fixed Discount';
          const descHe = isTimeOfUse ? 'הנחה גבוהה יותר בשעות מסוימות' : 'הנחה על כל הצריכה, 24/7';
          const descEn = isTimeOfUse ? 'Higher discount during specific hours' : 'Discount on all usage, 24/7';
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

          return (
            <motion.div
              key={plan.id}
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
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'he' ? descHe : descEn}
                    </p>
                  </div>

                  {/* Savings */}
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatNIS(savings)}
                      <span className="text-sm font-normal">
                        {language === 'he' ? '/שנה' : '/yr'}
                      </span>
                    </span>
                  </div>

                  {/* Membership note - always reserve space */}
                  <div className="min-h-[1.25rem] mb-3">
                    {hasMembership && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        * {language === 'he'
                          ? plan.requiresMembership!.descriptionHebrew
                          : plan.requiresMembership!.descriptionEnglish}
                      </p>
                    )}
                  </div>

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
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        {language === 'he'
          ? 'החיסכון כולל מע"מ והוא על צריכה בלבד. גלול למטה לכל התוכניות.'
          : 'Savings incl. VAT, on usage only. Scroll down for all plans.'}
      </p>
    </motion.div>
  );
}
