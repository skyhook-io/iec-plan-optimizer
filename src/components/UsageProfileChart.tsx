'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { useI18n } from '@/lib/i18n';
import type { HourlyUsagePoint } from '@/lib/calculator';
import type { ElectricityPlan } from '@/types';

interface UsageProfileChartProps {
  data: HourlyUsagePoint[];
  plan?: ElectricityPlan;
}

export function UsageProfileChart({ data, plan }: UsageProfileChartProps) {
  const { language } = useI18n();

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

  // Sample data to show every hour for x-axis labels
  const hourlyTicks = [0, 4, 8, 12, 16, 20];

  const maxKwh = Math.max(...data.map(d => d.avgKwh));

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {/* Discount period backgrounds */}
          {discountAreas.map((area, index) => (
            <ReferenceArea
              key={index}
              x1={area.start * 4} // Convert hour to 15-min slot index
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
            <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
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
            tickFormatter={(value) => `${value.toFixed(1)}`}
            tick={{ fontSize: 10 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
            width={35}
          />
          <Tooltip
            formatter={(value) => [`${(value as number).toFixed(3)} kWh`, language === 'he' ? 'צריכה ממוצעת' : 'Avg Usage']}
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
            fill="url(#usageGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend - compact inline */}
      <div className="mt-1 flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded bg-indigo-500/80" />
          <span>{language === 'he' ? 'צריכה' : 'Usage'}</span>
        </div>
        {discountAreas.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded bg-emerald-500/30 border border-emerald-500/50" />
            <span>{language === 'he' ? 'הנחה' : 'Discount'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
