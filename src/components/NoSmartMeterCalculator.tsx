'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Zap, TrendingDown, Lightbulb } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { electricityPlans, IEC_BASE_RATE, VAT_RATE } from '@/data/plans';
import { formatNIS, formatPercent, getDiscountForBillAmount } from '@/lib/calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const SMART_METER_COST = 265; // NIS one-time cost
const ASSUMED_DISCOUNT_HOURS_PERCENT = 0.35; // Assume 35% of usage in discount hours for average household

interface NoSmartMeterCalculatorProps {
  onUploadClick?: () => void;
}

export function NoSmartMeterCalculator({ onUploadClick }: NoSmartMeterCalculatorProps) {
  const { language } = useI18n();
  const [monthlyBill, setMonthlyBill] = useState(500);

  // Calculate yearly cost and potential savings
  const calculations = useMemo(() => {
    const vatMultiplier = 1 + VAT_RATE;
    // User's monthly bill includes VAT
    const yearlyCost = monthlyBill * 12;
    // Calculate kWh from pre-VAT cost
    const yearlyKwh = (yearlyCost / vatMultiplier) / IEC_BASE_RATE;

    // Get fixed discount plans (don't require smart meter)
    const fixedPlans = electricityPlans
      .filter((p) => !p.requiresSmartMeter && (p.discountWindows.length > 0 || p.billBasedTiers))
      .map((plan) => {
        let discount: number;
        let savings: number;
        let savingsCapped = false;
        let isTiered = false;

        // Check if this is a bill-based tiered plan
        let minSavings: number | undefined;
        let maxSavings: number | undefined;

        if (plan.billBasedTiers && plan.billBasedTiers.length > 0) {
          // Get discount based on monthly bill amount
          discount = getDiscountForBillAmount(monthlyBill, plan.billBasedTiers);
          savings = yearlyCost * discount;
          isTiered = true;
        } else {
          // Fixed discount plan
          discount = plan.discountWindows[0]?.discount || plan.defaultDiscount;
          savings = yearlyCost * discount;
        }

        // Calculate savings range for plans with discountRange
        if (plan.discountRange) {
          minSavings = yearlyCost * plan.discountRange.min;
          maxSavings = yearlyCost * plan.discountRange.max;
        }

        // Apply monthly cap if exists
        if (plan.maxMonthlySavings) {
          const maxYearlySavings = plan.maxMonthlySavings * 12;
          if (savings > maxYearlySavings) {
            savingsCapped = true;
            savings = maxYearlySavings;
          }
          if (minSavings !== undefined && minSavings > maxYearlySavings) {
            minSavings = maxYearlySavings;
          }
          if (maxSavings !== undefined && maxSavings > maxYearlySavings) {
            maxSavings = maxYearlySavings;
          }
        }

        return {
          plan,
          discount,
          savings,
          savingsCapped,
          isTiered,
          minSavings,
          maxSavings,
          newYearlyCost: yearlyCost - savings,
        };
      })
      .sort((a, b) => b.savings - a.savings);

    // Get best time-of-use plan for "what if" calculation
    const touPlans = electricityPlans
      .filter((p) => p.requiresSmartMeter)
      .map((plan) => {
        // Find the best discount window
        const maxDiscount = Math.max(...plan.discountWindows.map((w) => w.discount));
        // Assume 35% of usage falls in discount hours
        const discountedUsage = yearlyKwh * ASSUMED_DISCOUNT_HOURS_PERCENT;
        // Savings include VAT
        const savings = discountedUsage * IEC_BASE_RATE * maxDiscount * vatMultiplier;
        return {
          plan,
          maxDiscount,
          savings,
          newYearlyCost: yearlyCost - savings,
        };
      })
      .sort((a, b) => b.savings - a.savings);

    const bestTouPlan = touPlans[0];
    const bestFixedPlan = fixedPlans[0];

    // ROI calculation for smart meter
    const additionalSavingsWithSmartMeter = bestTouPlan
      ? bestTouPlan.savings - (bestFixedPlan?.savings || 0)
      : 0;
    const monthsToPayoff =
      additionalSavingsWithSmartMeter > 0
        ? Math.ceil(SMART_METER_COST / (additionalSavingsWithSmartMeter / 12))
        : Infinity;

    return {
      yearlyCost,
      yearlyKwh,
      fixedPlans,
      bestTouPlan,
      bestFixedPlan,
      additionalSavingsWithSmartMeter,
      monthsToPayoff,
    };
  }, [monthlyBill]);

  return (
    <div className="space-y-6">
      {/* Monthly Bill Slider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="h-5 w-5" />
            {language === 'he' ? 'החשבון החודשי שלי' : 'My Monthly Bill'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <span className="text-4xl font-bold">{formatNIS(monthlyBill)}</span>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'he' ? 'לחודש' : 'per month'}
            </p>
          </div>

          <Slider
            value={[monthlyBill]}
            onValueChange={(v) => setMonthlyBill(v[0])}
            min={100}
            max={2000}
            step={50}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatNIS(100)}</span>
            <span>{formatNIS(2000)}</span>
          </div>

          <div className="rounded-lg bg-muted p-3 text-center">
            <p className="text-sm text-muted-foreground">
              {language === 'he' ? 'עלות שנתית משוערת' : 'Estimated yearly cost'}
            </p>
            <p className="text-2xl font-bold">{formatNIS(calculations.yearlyCost)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Fixed Discount Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5" />
            {language === 'he' ? 'תוכניות הנחה קבועה' : 'Fixed Discount Plans'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {language === 'he'
              ? 'לא דורשות מונה חכם - הנחה על כל הצריכה'
              : "No smart meter required - discount on all usage"}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {calculations.fixedPlans.slice(0, 5).map((item, index) => (
            <motion.div
              key={item.plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between rounded-lg border p-3 ${
                index === 0 ? 'border-green-500 bg-green-50 dark:bg-green-950/30' : ''
              }`}
            >
              <div>
                <p className="font-medium">
                  {language === 'he' ? item.plan.providerHebrew : item.plan.provider}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'he' ? item.plan.planNameHebrew : item.plan.planName}
                </p>
                {item.isTiered && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {language === 'he'
                      ? 'הנחה לפי גובה החשבון'
                      : 'Discount varies by bill'}
                  </p>
                )}
                {item.savingsCapped && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    {language === 'he'
                      ? `מוגבל ל-${item.plan.maxMonthlySavings} ₪/חודש`
                      : `Capped at ${item.plan.maxMonthlySavings} NIS/mo`}
                  </p>
                )}
              </div>
              <div className="text-end">
                <Badge variant={index === 0 ? 'default' : 'secondary'}>
                  {item.plan.discountRange
                    ? `${formatPercent(item.plan.discountRange.min * 100)}-${formatPercent(item.plan.discountRange.max * 100)}`
                    : formatPercent(item.discount * 100)}
                  {item.isTiered && '*'}
                  {item.plan.requiresMembership && !item.plan.discountRange && '†'}
                </Badge>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">
                  {language === 'he' ? 'חיסכון' : 'Save'}{' '}
                  {item.minSavings !== undefined && item.maxSavings !== undefined
                    ? `${formatNIS(item.minSavings)}-${formatNIS(item.maxSavings)}`
                    : formatNIS(item.savings)}
                  {language === 'he' ? '/שנה' : '/yr'}
                </p>
              </div>
            </motion.div>
          ))}
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
            {language === 'he'
              ? '† דורש מנוי/חברות קיימת לספק. החיסכון כולל מע"מ והוא רק על צריכה.'
              : '† Requires existing subscription with provider. Savings incl. VAT, on usage only.'}
          </p>
        </CardContent>
      </Card>

      {/* What if you got a smart meter? */}
      {calculations.bestTouPlan && (
        <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-amber-700 dark:text-amber-400">
              <Lightbulb className="h-5 w-5" />
              {language === 'he' ? 'מה אם היה לי מונה חכם?' : 'What if I had a smart meter?'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {language === 'he'
                ? `מונה חכם עולה ${SMART_METER_COST} ₪ התקנה חד פעמית ומאפשר תוכניות תעריף משתנה עם הנחות גבוהות יותר בשעות מסוימות.`
                : `A smart meter costs ${SMART_METER_COST} NIS one-time installation and enables time-of-use plans with higher discounts during certain hours.`}
            </p>

            <div className="rounded-lg bg-white dark:bg-background p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {language === 'he' ? 'התוכנית המומלצת' : 'Recommended plan'}
                </span>
                <Badge variant="outline">
                  {language === 'he'
                    ? calculations.bestTouPlan.plan.providerHebrew
                    : calculations.bestTouPlan.plan.provider}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {language === 'he' ? 'הנחה מקסימלית' : 'Max discount'}
                </span>
                <span className="font-medium">
                  {formatPercent(calculations.bestTouPlan.maxDiscount * 100)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {language === 'he' ? 'חיסכון שנתי משוער*' : 'Est. yearly savings*'}
                </span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {formatNIS(calculations.bestTouPlan.savings)}
                </span>
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm font-medium">
                  {language === 'he' ? 'חיסכון נוסף לעומת הנחה קבועה' : 'Extra savings vs fixed discount'}
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  +{formatNIS(calculations.additionalSavingsWithSmartMeter)}
                  {language === 'he' ? '/שנה' : '/yr'}
                </span>
              </div>

              {calculations.monthsToPayoff < 36 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {language === 'he' ? 'המונה משתלם תוך' : 'Meter pays for itself in'}
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {calculations.monthsToPayoff}{' '}
                    {language === 'he' ? 'חודשים' : 'months'}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {language === 'he'
                ? `* הערכה מבוססת על הנחה ש-${(ASSUMED_DISCOUNT_HOURS_PERCENT * 100).toFixed(0)}% מהצריכה בשעות הנחה. העלה קובץ CSV מהמונה החכם לחישוב מדויק.`
                : `* Estimate based on ${(ASSUMED_DISCOUNT_HOURS_PERCENT * 100).toFixed(0)}% of usage during discount hours. Upload CSV from smart meter for accurate calculation.`}
            </p>

            {onUploadClick && (
              <Button onClick={onUploadClick} className="w-full" variant="outline">
                {language === 'he' ? 'יש לי מונה חכם - אעלה קובץ' : 'I have a smart meter - upload file'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
