'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useI18n } from '@/lib/i18n';
import { getHourlyUsageProfile, formatKwh } from '@/lib/calculator';
import type { ParsedUsageData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HourlyUsagePoint } from '@/lib/calculator';

interface UsageChartProps {
  usageData: ParsedUsageData;
}

export function UsageChart({ usageData }: UsageChartProps) {
  const { t, language, isRtl } = useI18n();

  const usageProfile = getHourlyUsageProfile(usageData);
  const hourlyTicks = [0, 6, 12, 18];

  return (
    <Card dir={isRtl ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{t('usageBreakdown')}</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          {language === 'he'
            ? 'פרופיל צריכה יומי ממוצע'
            : 'Average daily usage profile'}
        </p>
      </CardHeader>
      <CardContent>
        {/* Time-of-day usage chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={usageProfile}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
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
        <div className="mt-3 flex items-center justify-center text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-indigo-500/80" />
            <span>{language === 'he' ? 'צריכה ממוצעת (kWh)' : 'Avg Usage (kWh)'}</span>
          </div>
        </div>

        {/* Total usage */}
        <div className="mt-4 rounded-lg border p-3 text-center">
          <p className="text-xs text-muted-foreground">{t('totalUsage')}</p>
          <p className="text-xl font-bold">{formatKwh(usageData.totalKwh)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
