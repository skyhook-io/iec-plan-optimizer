import type {
  UsageRecord,
  ParsedUsageData,
  ElectricityPlan,
  PlanResult,
  DayOfWeek,
} from '@/types';
import { electricityPlans, IEC_BASE_RATE, VAT_RATE } from '@/data/plans';

/**
 * Check if a usage record falls within a discount window
 */
function getDiscountForRecord(
  record: UsageRecord,
  plan: ElectricityPlan
): number {
  const hour = parseInt(record.time.split(':')[0], 10);
  const dayOfWeek = record.date.getDay() as DayOfWeek;

  // Check each discount window
  for (const window of plan.discountWindows) {
    // Check if the day matches
    if (!window.days.includes(dayOfWeek)) {
      continue;
    }

    // Check if the hour matches
    // Handle overnight windows (e.g., 23:00 - 07:00)
    if (window.startHour > window.endHour) {
      // Overnight: e.g., 23-7 means 23,0,1,2,3,4,5,6
      if (hour >= window.startHour || hour < window.endHour) {
        return window.discount;
      }
    } else if (window.startHour === 0 && window.endHour === 24) {
      // All day
      return window.discount;
    } else {
      // Normal window: e.g., 7-17
      if (hour >= window.startHour && hour < window.endHour) {
        return window.discount;
      }
    }
  }

  // No window matched, use default discount
  return plan.defaultDiscount;
}

interface UsageBreakdown {
  discountedKwh: number;
  discountedSavings: number;
  regularKwh: number;
  totalKwh: number;
}

/**
 * Get discount for a bill amount based on tiered structure
 * Exported for use in NoSmartMeterCalculator
 */
export function getDiscountForBillAmount(
  billAmount: number,
  tiers: NonNullable<ElectricityPlan['billBasedTiers']>
): number {
  for (const tier of tiers) {
    if (billAmount <= tier.maxBill) {
      return tier.discount;
    }
  }
  // Fallback to last tier if no match (shouldn't happen with Infinity)
  return tiers[tiers.length - 1]?.discount ?? 0;
}

/**
 * Calculate usage breakdown for plans with bill-based tiered discounts
 * Groups records by month, calculates monthly bill, applies appropriate tier discount
 */
function calculateBillBasedBreakdown(
  records: UsageRecord[],
  plan: ElectricityPlan
): UsageBreakdown {
  if (!plan.billBasedTiers || plan.billBasedTiers.length === 0) {
    return { discountedKwh: 0, discountedSavings: 0, regularKwh: 0, totalKwh: 0 };
  }

  // Group records by month (year-month key)
  const monthlyUsage: Map<string, UsageRecord[]> = new Map();
  for (const record of records) {
    const key = `${record.date.getFullYear()}-${record.date.getMonth()}`;
    const existing = monthlyUsage.get(key) || [];
    existing.push(record);
    monthlyUsage.set(key, existing);
  }

  let totalDiscountedKwh = 0;
  let totalDiscountedSavings = 0;
  let totalKwh = 0;

  // Calculate savings for each month
  for (const [, monthRecords] of monthlyUsage) {
    const monthKwh = monthRecords.reduce((sum, r) => sum + r.kwhUsage, 0);
    const monthBill = monthKwh * IEC_BASE_RATE;
    totalKwh += monthKwh;

    // Get discount for this month's bill amount
    const discount = getDiscountForBillAmount(monthBill, plan.billBasedTiers);

    if (discount > 0) {
      totalDiscountedKwh += monthKwh;
      totalDiscountedSavings += monthBill * discount;
    }
  }

  return {
    discountedKwh: totalDiscountedKwh,
    discountedSavings: totalDiscountedSavings,
    regularKwh: 0, // All usage gets the tiered discount
    totalKwh,
  };
}

function calculateUsageBreakdown(
  records: UsageRecord[],
  plan: ElectricityPlan
): UsageBreakdown {
  // Use bill-based calculation if plan has tiered discounts
  if (plan.billBasedTiers && plan.billBasedTiers.length > 0) {
    return calculateBillBasedBreakdown(records, plan);
  }

  let discountedKwh = 0;
  let discountedSavings = 0;
  let regularKwh = 0;

  for (const record of records) {
    const discount = getDiscountForRecord(record, plan);
    const cost = record.kwhUsage * IEC_BASE_RATE;

    if (discount > 0) {
      discountedKwh += record.kwhUsage;
      discountedSavings += cost * discount;
    } else {
      regularKwh += record.kwhUsage;
    }
  }

  return {
    discountedKwh,
    discountedSavings,
    regularKwh,
    totalKwh: discountedKwh + regularKwh,
  };
}

function calculatePlanResult(
  plan: ElectricityPlan,
  records: UsageRecord[],
  totalKwh: number,
  numMonths: number = 12
): PlanResult {
  const breakdown = calculateUsageBreakdown(records, plan);
  const vatMultiplier = 1 + VAT_RATE;

  // All costs include VAT (18%)
  const baselineCost = totalKwh * IEC_BASE_RATE * vatMultiplier;
  let savings = breakdown.discountedSavings * vatMultiplier;
  let savingsCapped = false;
  let uncappedSavings: number | undefined;

  // Apply monthly savings cap if plan has one (caps are typically advertised including VAT)
  if (plan.maxMonthlySavings) {
    const maxTotalSavings = plan.maxMonthlySavings * numMonths;
    if (savings > maxTotalSavings) {
      uncappedSavings = savings;
      savings = maxTotalSavings;
      savingsCapped = true;
    }
  }

  const discountedCost = baselineCost - savings;
  const savingsPercent = baselineCost > 0 ? (savings / baselineCost) * 100 : 0;

  return {
    plan,
    totalUsageKwh: totalKwh,
    baselineCost,
    discountedCost,
    savings,
    savingsPercent,
    savingsCapped,
    uncappedSavings,
    breakdown: {
      discountedUsageKwh: breakdown.discountedKwh,
      discountedCost: (breakdown.discountedKwh * IEC_BASE_RATE - breakdown.discountedSavings) * vatMultiplier,
      discountedSavings: breakdown.discountedSavings * vatMultiplier,
      regularUsageKwh: breakdown.regularKwh,
      regularCost: breakdown.regularKwh * IEC_BASE_RATE * vatMultiplier,
    },
  };
}

export function calculateAllPlans(usageData: ParsedUsageData): PlanResult[] {
  // Calculate number of months in the data period using actual calendar months
  const startYear = usageData.startDate.getFullYear();
  const startMonth = usageData.startDate.getMonth();
  const endYear = usageData.endDate.getFullYear();
  const endMonth = usageData.endDate.getMonth();
  const numMonths = Math.max(1, (endYear - startYear) * 12 + (endMonth - startMonth));

  // Calculate result for each plan
  const results = electricityPlans.map((plan) =>
    calculatePlanResult(plan, usageData.records, usageData.totalKwh, numMonths)
  );

  // Sort by savings (highest first)
  results.sort((a, b) => b.savings - a.savings);

  return results;
}

// Extrapolate to annual savings based on the data period
export function extrapolateToAnnual(
  results: PlanResult[],
  startDate: Date,
  endDate: Date
): PlanResult[] {
  const daysDiff = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If we have a full year or more, no need to extrapolate
  if (daysDiff >= 365) {
    return results;
  }

  const multiplier = 365 / daysDiff;

  return results.map((result) => ({
    ...result,
    totalUsageKwh: result.totalUsageKwh * multiplier,
    baselineCost: result.baselineCost * multiplier,
    discountedCost: result.discountedCost * multiplier,
    savings: result.savings * multiplier,
    breakdown: {
      discountedUsageKwh: result.breakdown.discountedUsageKwh * multiplier,
      discountedCost: result.breakdown.discountedCost * multiplier,
      discountedSavings: result.breakdown.discountedSavings * multiplier,
      regularUsageKwh: result.breakdown.regularUsageKwh * multiplier,
      regularCost: result.breakdown.regularCost * multiplier,
    },
  }));
}

// Get usage breakdown by time period for charts
export interface TimeBreakdown {
  discountedKwh: number;
  regularKwh: number;
  totalKwh: number;
  discountedPercent: number;
  regularPercent: number;
}

export function getUsageBreakdownForCharts(
  usageData: ParsedUsageData,
  plan?: ElectricityPlan
): TimeBreakdown {
  // If no plan specified, use the best time-of-use plan for breakdown
  const targetPlan = plan || electricityPlans.find((p) => p.requiresSmartMeter);

  if (!targetPlan) {
    return {
      discountedKwh: 0,
      regularKwh: usageData.totalKwh,
      totalKwh: usageData.totalKwh,
      discountedPercent: 0,
      regularPercent: 100,
    };
  }

  const breakdown = calculateUsageBreakdown(usageData.records, targetPlan);

  return {
    discountedKwh: breakdown.discountedKwh,
    regularKwh: breakdown.regularKwh,
    totalKwh: breakdown.totalKwh,
    discountedPercent:
      breakdown.totalKwh > 0
        ? (breakdown.discountedKwh / breakdown.totalKwh) * 100
        : 0,
    regularPercent:
      breakdown.totalKwh > 0
        ? (breakdown.regularKwh / breakdown.totalKwh) * 100
        : 0,
  };
}

// Format currency in NIS
export function formatNIS(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format percentage
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Format kWh
export function formatKwh(value: number): string {
  return `${value.toFixed(0)} kWh`;
}

// Data point for hourly usage chart
export interface HourlyUsagePoint {
  time: string; // "00:00", "00:15", etc.
  hour: number;
  minute: number;
  avgKwh: number;
  discount: number; // Discount percentage for this time slot (for a specific plan)
}

/**
 * Calculate average usage for each 15-minute slot across all days
 * Returns 96 data points (24 hours * 4 slots per hour)
 */
export function getHourlyUsageProfile(
  usageData: ParsedUsageData,
  plan?: ElectricityPlan
): HourlyUsagePoint[] {
  // Group usage by time slot
  const slotTotals: Map<string, { total: number; count: number }> = new Map();

  for (const record of usageData.records) {
    const time = record.time;
    const existing = slotTotals.get(time) || { total: 0, count: 0 };
    existing.total += record.kwhUsage;
    existing.count += 1;
    slotTotals.set(time, existing);
  }

  // Generate all 96 time slots
  const result: HourlyUsagePoint[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const slotData = slotTotals.get(time);
      const avgKwh = slotData ? slotData.total / slotData.count : 0;

      // Calculate discount for this hour (using weekday as reference - days 0-4)
      let discount = 0;
      if (plan) {
        for (const window of plan.discountWindows) {
          // Check if this applies to weekdays (most common case)
          const appliesToWeekday = window.days.some(d => d >= 0 && d <= 4);
          if (!appliesToWeekday) continue;

          if (window.startHour > window.endHour) {
            // Overnight window
            if (hour >= window.startHour || hour < window.endHour) {
              discount = window.discount;
              break;
            }
          } else if (window.startHour === 0 && window.endHour === 24) {
            // All day
            discount = window.discount;
            break;
          } else {
            if (hour >= window.startHour && hour < window.endHour) {
              discount = window.discount;
              break;
            }
          }
        }
        if (discount === 0) {
          discount = plan.defaultDiscount;
        }
      }

      result.push({
        time,
        hour,
        minute,
        avgKwh,
        discount,
      });
    }
  }

  return result;
}
