'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { useI18n } from '@/lib/i18n';
import { getHourlyUsageProfile, getUsageBreakdownForCharts, formatKwh } from '@/lib/calculator';
import type { ParsedUsageData, PlanResult } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { HourlyUsagePoint } from '@/lib/calculator';

interface UsageChartProps {
  usageData: ParsedUsageData;
  topPlan?: PlanResult;
}

export function UsageChart({ usageData, topPlan }: UsageChartProps) {
  const { t, language, isRtl } = useI18n();

  // Use the top plan or find the best time-of-use plan
  const plan = topPlan?.plan;
  const breakdown = getUsageBreakdownForCharts(usageData, plan);
  const usageProfile = plan ? getHourlyUsageProfile(usageData, plan) : getHourlyUsageProfile(usageData);

  // Get discount windows for visualization
  const discountAreas: { start: number; end: number; discount: number }[] = [];

  if (plan) {
    for (const window of plan.discountWindows) {
      // Only show weekday windows (most representative)
      const appliesToWeekday = window.days.some(d => d >= 0 && d <= 4);
      if (!appliesToWeekday) continue;

      if (window.startHour > window.endHour) {
        // Overnight window - split into two areas
        discountAreas.push({ start: window.startHour, end: 24, discount: window.discount });
        discountAreas.push({ start: 0, end: window.endHour, discount: window.discount });
      } else {
        discountAreas.push({ start: window.startHour, end: window.endHour, discount: window.discount });
      }
    }
  }

  const hourlyTicks = [0, 6, 12, 18];
  const maxKwh = Math.max(...usageProfile.map(d => d.avgKwh), 0.1);

  const planName = plan
    ? (language === 'he' ? plan.planNameHebrew : plan.planName)
    : (language === 'he' ? 'תוכנית מובילה' : 'Top Plan');

  const providerName = plan
    ? (language === 'he' ? plan.providerHebrew : plan.provider)
    : '';

  return (
    <Card dir={isRtl ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{t('usageBreakdown')}</CardTitle>
        {plan && (
          <p className="text-xs text-muted-foreground mt-1">
            {language === 'he'
              ? 'שעות ההנחה מוצגות לפי התוכנית המומלצת עם תעריף משתנה:'
              : 'Discount hours shown for best variable-rate plan:'}
          </p>
        )}
        {plan && (
          <Badge variant="secondary" className="text-xs mt-1 w-fit">
            {providerName} - {planName}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {/* Time-of-day usage chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={usageProfile}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              {/* Discount period backgrounds */}
              {discountAreas.map((area, index) => (
                <ReferenceArea
                  key={index}
                  x1={area.start * 4}
                  x2={area.end * 4}
                  y1={0}
                  y2={maxKwh * 1.1}
                  fill="#10b981"
                  fillOpacity={0.15}
                  stroke="#10b981"
                  strokeOpacity={0.3}
                  strokeDasharray="3 3"
                />
              ))}

              <defs>
                <linearGradient id="usageGradientMain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="hour"
                tickFormatter={(hour) => `${hour}:00`}
                ticks={hourlyTicks}
                tick={{ fontSize: 10 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tickFormatter={(value) => value.toFixed(1)}
                tick={{ fontSize: 10 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
                width={30}
              />
              <Tooltip
                formatter={(value) => [`${(value as number).toFixed(3)} kWh`, language === 'he' ? 'ממוצע' : 'Avg']}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const point = payload[0].payload as HourlyUsagePoint;
                    return point.time;
                  }
                  return '';
                }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="avgKwh"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#usageGradientMain)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-indigo-500/80" />
            <span>{language === 'he' ? 'צריכה ממוצעת' : 'Avg Usage'}</span>
          </div>
          {discountAreas.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-emerald-500/30 border border-emerald-500/50 border-dashed" />
              <span>{language === 'he' ? 'שעות הנחה' : 'Discount Hours'}</span>
            </div>
          )}
        </div>

        {/* Usage breakdown stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">
              {language === 'he' ? 'בשעות הנחה' : 'Discount hours'}
            </p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {breakdown.discountedPercent.toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {formatKwh(breakdown.discountedKwh)}
            </p>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <p className="text-xs text-muted-foreground">
              {language === 'he' ? 'תעריף רגיל' : 'Regular rate'}
            </p>
            <p className="text-lg font-bold">
              {breakdown.regularPercent.toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {formatKwh(breakdown.regularKwh)}
            </p>
          </div>
        </div>

        {/* Total usage */}
        <div className="mt-3 rounded-lg border p-3 text-center">
          <p className="text-xs text-muted-foreground">{t('totalUsage')}</p>
          <p className="text-xl font-bold">{formatKwh(breakdown.totalKwh)}</p>
        </div>

        {breakdown.discountedPercent > 50 && (
          <div className="mt-3 rounded-lg bg-green-50 dark:bg-green-950/30 p-2 text-center">
            <p className="text-xs text-green-700 dark:text-green-400">
              {language === 'he'
                ? 'רוב הצריכה שלך בשעות הנחה!'
                : 'Most of your usage is during discount hours!'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
