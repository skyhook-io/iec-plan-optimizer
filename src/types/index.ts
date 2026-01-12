// IEC Smart Meter Usage Record (from CSV)
export interface UsageRecord {
  date: Date;
  time: string; // e.g., "00:15"
  kwhUsage: number;
}

// Parsed usage data with metadata
export interface ParsedUsageData {
  customerName: string;
  address: string;
  meterCode: string;
  meterNumber: string;
  contractNumber: string;
  records: UsageRecord[];
  startDate: Date;
  endDate: Date;
  totalKwh: number;
}

// Days of week (0 = Sunday, 6 = Saturday - JavaScript standard)
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// Time window for discount application
export interface DiscountWindow {
  days: DayOfWeek[]; // Which days this applies (0=Sunday, 1=Monday, etc.)
  startHour: number; // e.g., 7 for 7:00
  endHour: number; // e.g., 17 for 17:00 (if endHour < startHour, spans midnight)
  discount: number; // e.g., 0.16 = 16%
}

// Electricity provider plan
export interface ElectricityPlan {
  id: string;
  provider: string;
  providerHebrew: string;
  planName: string;
  planNameHebrew: string;

  // Plan type
  requiresSmartMeter: boolean;

  // Discount structure
  // For fixed plans: single discount all the time
  // For time-based plans: discount only during specific windows
  discountWindows: DiscountWindow[];

  // Default discount outside of windows (usually 0)
  defaultDiscount: number;

  // Optional cap on monthly savings (e.g., Yellow app has 50 NIS/month limit)
  maxMonthlySavings?: number;

  // Bill-based tiered discount (e.g., Cellcom "חשבון קטן הנחה גדולה")
  // Discount depends on monthly bill amount - sorted by maxBill ascending
  billBasedTiers?: {
    maxBill: number; // Upper limit for this tier (use Infinity for "and above")
    discount: number; // e.g., 0.10 = 10%
  }[];

  // Requires existing membership/subscription with the provider
  // e.g., Hot Energy for HOT TV customers, Amisragas for gas customers
  requiresMembership?: {
    type: 'tv' | 'internet' | 'mobile' | 'gas' | 'app' | 'other';
    descriptionHebrew: string;
    descriptionEnglish: string;
  };

  // Display discount range when discount varies by membership status
  // The main discount is used for ranking, but UI shows the range
  discountRange?: {
    min: number; // e.g., 0.06 = 6%
    max: number; // e.g., 0.07 = 7%
    minLabelHebrew: string;
    minLabelEnglish: string;
    maxLabelHebrew: string;
    maxLabelEnglish: string;
  };

  conditions?: string[];
  conditionsHebrew?: string[];
  sourceUrl: string;
  lastUpdated: string;
}

// Calculation result for a plan
export interface PlanResult {
  plan: ElectricityPlan;
  totalUsageKwh: number;
  baselineCost: number; // Without any discount (IEC standard rate)
  discountedCost: number; // With this plan
  savings: number; // Savings in NIS (after cap if applicable)
  savingsPercent: number; // Effective discount percentage
  savingsCapped: boolean; // True if savings were limited by maxMonthlySavings
  uncappedSavings?: number; // What savings would be without the cap
  breakdown: {
    discountedUsageKwh: number; // kWh that got a discount
    discountedCost: number;
    discountedSavings: number;
    regularUsageKwh: number; // kWh at regular rate
    regularCost: number;
  };
}

// Language support
export type Language = 'he' | 'en';

// App state
export interface AppState {
  language: Language;
  usageData: ParsedUsageData | null;
  results: PlanResult[] | null;
  isCalculating: boolean;
  error: string | null;
}
