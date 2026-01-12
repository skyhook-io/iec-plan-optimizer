import type { ElectricityPlan, DayOfWeek } from '@/types';

// Israeli electricity base rate (NIS per kWh) - 54.51 agorot (as of Jan 2026)
export const IEC_BASE_RATE = 0.5451;

// VAT rate in Israel
export const VAT_RATE = 0.18;

// Last updated timestamp for plans data
export const PLANS_LAST_UPDATED = '2026-01-12';

// Helper for weekdays (Sunday=0 to Thursday=4)
const WEEKDAYS: DayOfWeek[] = [0, 1, 2, 3, 4]; // Sun-Thu
const ALL_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6]; // Sun-Sat

// Electricity plans from Israeli providers
export const electricityPlans: ElectricityPlan[] = [
  // ===========================================
  // Super Power (סופר פאוור) - Electra Power
  // ===========================================
  {
    id: 'super-power-power',
    provider: 'Super Power',
    providerHebrew: 'סופר פאוור',
    planName: 'POWER Plan',
    planNameHebrew: 'מסלול POWER',
    requiresSmartMeter: false,
    discountWindows: [
      { days: ALL_DAYS, startHour: 0, endHour: 24, discount: 0.065 },
    ],
    defaultDiscount: 0.065,
    conditionsHebrew: ['ללא צורך במונה חכם', 'הנחה בכל שעות היום בכל השבוע'],
    sourceUrl: 'https://super-power.co.il/',
    lastUpdated: PLANS_LAST_UPDATED,
  },
  {
    id: 'super-power-day',
    provider: 'Super Power',
    providerHebrew: 'סופר פאוור',
    planName: 'Day Plan',
    planNameHebrew: 'מסלול יום',
    requiresSmartMeter: true,
    discountWindows: [
      { days: WEEKDAYS, startHour: 7, endHour: 17, discount: 0.16 },
    ],
    defaultDiscount: 0,
    conditionsHebrew: ['נדרש מונה חכם', 'הנחה בימים א-ה בין 7:00-17:00'],
    sourceUrl: 'https://super-power.co.il/',
    lastUpdated: PLANS_LAST_UPDATED,
  },
  {
    id: 'super-power-night-plus',
    provider: 'Super Power',
    providerHebrew: 'סופר פאוור',
    planName: 'Night Plus Plan',
    planNameHebrew: 'מסלול לילה פלוס',
    requiresSmartMeter: true,
    discountWindows: [
      { days: WEEKDAYS, startHour: 23, endHour: 7, discount: 0.21 },
    ],
    defaultDiscount: 0,
    conditionsHebrew: ['נדרש מונה חכם', 'הנחה בימים א-ה בין 23:00-7:00'],
    sourceUrl: 'https://super-power.co.il/',
    lastUpdated: PLANS_LAST_UPDATED,
  },
  {
    id: 'super-power-green',
    provider: 'Super Power',
    providerHebrew: 'סופר פאוור',
    planName: 'GREEN Plan',
    planNameHebrew: 'מסלול GREEN',
    requiresSmartMeter: false,
    discountWindows: [
      { days: ALL_DAYS, startHour: 0, endHour: 24, discount: 0.035 },
    ],
    defaultDiscount: 0.035,
    conditionsHebrew: ['100% חשמל ירוק מאנרגיה סולארית', 'הנחה בכל ימות השבוע'],
    sourceUrl: 'https://super-power.co.il/',
    lastUpdated: PLANS_LAST_UPDATED,
  },

  // ===========================================
  // Pazgas (פזגז חשמל)
  // ===========================================
  {
    id: 'pazgas-24-7',
    provider: 'Pazgas',
    providerHebrew: 'פזגז חשמל',
    planName: '24/7 Discount',
    planNameHebrew: 'הנחה 24/7',
    requiresSmartMeter: false,
    discountWindows: [
      { days: ALL_DAYS, startHour: 0, endHour: 24, discount: 0.06 },
    ],
    defaultDiscount: 0.06,
    conditionsHebrew: ['ללא צורך במונה חכם', 'הנחה קבועה בכל שעות היממה'],
    sourceUrl: 'https://www.paz.co.il/gas-and-renewable-energy/pazgas',
    lastUpdated: PLANS_LAST_UPDATED,
  },
  {
    id: 'pazgas-yellow',
    provider: 'Pazgas',
    providerHebrew: 'פזגז חשמל',
    planName: 'Yellow Cashback',
    planNameHebrew: 'צבירה לארנק באפליקציית yellow',
    requiresSmartMeter: false,
    discountWindows: [
      { days: ALL_DAYS, startHour: 0, endHour: 24, discount: 0.10 },
    ],
    defaultDiscount: 0.10,
    maxMonthlySavings: 50, // Capped at 50 NIS/month
    requiresMembership: {
      type: 'app',
      descriptionHebrew: 'נדרש רישום לאפליקציית Yellow',
      descriptionEnglish: 'Requires Yellow app registration',
    },
    conditions: [
      'Max 50 NIS/month (600 NIS/year)',
      'Requires Yellow app registration',
      'No smart meter required',
    ],
    conditionsHebrew: [
      'עד 50 ש"ח בחודש / 600 ש"ח בשנה',
      'מותנה ברישום לאפליקציית yellow',
      'ללא צורך במונה חכם',
    ],
    sourceUrl: 'https://www.paz.co.il/gas-and-renewable-energy/pazgas',
    lastUpdated: PLANS_LAST_UPDATED,
  },

  // ===========================================
  // Cellcom Energy (סלקום אנרג'י)
  // ===========================================
  {
    id: 'cellcom-variable',
    provider: 'Cellcom Energy',
    providerHebrew: 'סלקום אנרג\'י',
    planName: 'Small Bill Big Discount',
    planNameHebrew: 'חשבון קטן הנחה גדולה',
    requiresSmartMeter: false,
    discountWindows: [], // Uses billBasedTiers instead
    defaultDiscount: 0, // Uses billBasedTiers instead
    billBasedTiers: [
      { maxBill: 149, discount: 0.10 }, // Up to 149 NIS: 10%
      { maxBill: 199, discount: 0.08 }, // Up to 199 NIS: 8%
      { maxBill: 299, discount: 0.06 }, // Up to 299 NIS: 6%
      { maxBill: Infinity, discount: 0.05 }, // 300+ NIS: 5%
    ],
    conditions: [
      'Discount varies by monthly bill',
      'Up to 149 NIS: 10%',
      '150-199 NIS: 8%',
      '200-299 NIS: 6%',
      '300+ NIS: 5%',
    ],
    conditionsHebrew: [
      'הנחה משתנה לפי גובה החשבון החודשי',
      'עד 149 ש"ח: 10%',
      '150-199 ש"ח: 8%',
      '200-299 ש"ח: 6%',
      '300+ ש"ח: 5%',
      'ללא צורך במונה חכם',
    ],
    sourceUrl: 'https://cellcom.co.il/production/Private/1/energy3/',
    lastUpdated: PLANS_LAST_UPDATED,
  },
  {
    id: 'cellcom-day',
    provider: 'Cellcom Energy',
    providerHebrew: 'סלקום אנרג\'י',
    planName: 'Save During Day',
    planNameHebrew: 'חוסכים ביום',
    requiresSmartMeter: true,
    discountWindows: [
      { days: WEEKDAYS, startHour: 7, endHour: 17, discount: 0.15 },
    ],
    defaultDiscount: 0,
    conditionsHebrew: ['נדרש מונה חכם', 'הנחה בימים א-ה בין 7:00-17:00'],
    sourceUrl: 'https://cellcom.co.il/production/Private/1/energy3/',
    lastUpdated: PLANS_LAST_UPDATED,
  },
  {
    id: 'cellcom-family',
    provider: 'Cellcom Energy',
    providerHebrew: 'סלקום אנרג\'י',
    planName: 'Save for Family',
    planNameHebrew: 'חוסכים למשפחה',
    requiresSmartMeter: true,
    discountWindows: [
      { days: WEEKDAYS, startHour: 14, endHour: 20, discount: 0.18 },
    ],
    defaultDiscount: 0,
    conditionsHebrew: ['נדרש מונה חכם', 'הנחה בימים א-ה בין 14:00-20:00'],
    sourceUrl: 'https://cellcom.co.il/production/Private/1/energy3/',
    lastUpdated: PLANS_LAST_UPDATED,
  },
  {
    id: 'cellcom-night',
    provider: 'Cellcom Energy',
    providerHebrew: 'סלקום אנרג\'י',
    planName: 'Save at Night',
    planNameHebrew: 'חוסכים בלילה',
    requiresSmartMeter: true,
    discountWindows: [
      { days: WEEKDAYS, startHour: 23, endHour: 7, discount: 0.20 },
    ],
    defaultDiscount: 0,
    conditionsHebrew: ['נדרש מונה חכם', 'הנחה בימים א-ה בין 23:00-7:00'],
    sourceUrl: 'https://cellcom.co.il/production/Private/1/energy3/',
    lastUpdated: PLANS_LAST_UPDATED,
  },
  {
    id: 'cellcom-fixed',
    provider: 'Cellcom Energy',
    providerHebrew: 'סלקום אנרג\'י',
    planName: 'Fixed Savings',
    planNameHebrew: 'חוסכים קבוע',
    requiresSmartMeter: false,
    discountWindows: [
      { days: ALL_DAYS, startHour: 0, endHour: 24, discount: 0.055 }, // 5% year 1, 6% year 2+
    ],
    defaultDiscount: 0.055,
    conditionsHebrew: ['5% בשנה הראשונה, 6% בשנה השנייה+', 'ללא צורך במונה חכם'],
    sourceUrl: 'https://cellcom.co.il/production/Private/1/energy3/',
    lastUpdated: PLANS_LAST_UPDATED,
  },

  // ===========================================
  // Hot Energy (הוט אנרג'י)
  // ===========================================
  {
    id: 'hot-24-7',
    provider: 'Hot Energy',
    providerHebrew: 'הוט אנרג\'י',
    planName: 'Saving 24/7',
    planNameHebrew: 'חוסכים 24/7',
    requiresSmartMeter: false,
    discountWindows: [
      { days: ALL_DAYS, startHour: 0, endHour: 24, discount: 0.05 },
    ],
    defaultDiscount: 0.05,
    requiresMembership: {
      type: 'other',
      descriptionHebrew: 'ללקוחות הוט אנרג\'י',
      descriptionEnglish: 'For Hot Energy customers',
    },
    conditionsHebrew: ['ללא צורך במונה חכם', 'ללקוחות הוט אנרג\'י'],
    sourceUrl: 'https://www.hot.net.il/heb/hotenergy/',
    lastUpdated: PLANS_LAST_UPDATED,
  },
  {
    id: 'hot-fixed',
    provider: 'Hot Energy',
    providerHebrew: 'הוט אנרג\'י',
    planName: 'Fixed Discount HOT',
    planNameHebrew: 'חוסכים קבוע HOT',
    requiresSmartMeter: false,
    discountWindows: [
      { days: ALL_DAYS, startHour: 0, endHour: 24, discount: 0.07 },
    ],
    defaultDiscount: 0.07,
    maxMonthlySavings: 100, // Capped at 100 NIS/month
    requiresMembership: {
      type: 'tv',
      descriptionHebrew: 'ללקוחות HOT/NEXT/הוט מובייל',
      descriptionEnglish: 'For HOT/NEXT/Hot Mobile customers',
    },
    conditions: [
      'Max 100 NIS/month',
      'For HOT/NEXT/Hot Mobile customers',
      'No smart meter required',
    ],
    conditionsHebrew: [
      'עד 100 ש"ח בחודש',
      'ללקוחות HOT/NEXT/הוט מובייל',
      'ללא צורך במונה חכם',
    ],
    sourceUrl: 'https://www.hot.net.il/heb/hotenergy/',
    lastUpdated: PLANS_LAST_UPDATED,
  },
  {
    id: 'hot-day',
    provider: 'Hot Energy',
    providerHebrew: 'הוט אנרג\'י',
    planName: 'Saving During Day',
    planNameHebrew: 'חוסכים ביום',
    requiresSmartMeter: true,
    discountWindows: [
      { days: WEEKDAYS, startHour: 7, endHour: 17, discount: 0.15 },
    ],
    defaultDiscount: 0,
    conditionsHebrew: ['נדרש מונה חכם', 'הנחה בימים א-ה בין 7:00-17:00'],
    sourceUrl: 'https://www.hot.net.il/heb/hotenergy/',
    lastUpdated: PLANS_LAST_UPDATED,
  },
  {
    id: 'hot-night',
    provider: 'Hot Energy',
    providerHebrew: 'הוט אנרג\'י',
    planName: 'Saving During Night',
    planNameHebrew: 'חוסכים בלילה',
    requiresSmartMeter: true,
    discountWindows: [
      { days: WEEKDAYS, startHour: 23, endHour: 7, discount: 0.20 },
    ],
    defaultDiscount: 0,
    conditionsHebrew: ['נדרש מונה חכם', 'הנחה בימים א-ה בין 23:00-7:00'],
    sourceUrl: 'https://www.hot.net.il/heb/hotenergy/',
    lastUpdated: PLANS_LAST_UPDATED,
  },

  // ===========================================
  // Partner Power (פרטנר פאוור)
  // ===========================================
  {
    id: 'partner-fixed',
    provider: 'Partner Power',
    providerHebrew: 'פרטנר פאוור',
    planName: 'Fixed Discount All Day',
    planNameHebrew: 'הנחה קבועה כל היום',
    requiresSmartMeter: false,
    discountWindows: [
      { days: ALL_DAYS, startHour: 0, endHour: 24, discount: 0.06 }, // 5%→6%→7% avg
    ],
    defaultDiscount: 0.06,
    conditionsHebrew: ['5% שנה 1, 6% שנה 2, 7% שנה 3', 'ללא צורך במונה חכם'],
    sourceUrl: 'https://www.partner.co.il/n/partnerpower',
    lastUpdated: PLANS_LAST_UPDATED,
  },
  {
    id: 'partner-day',
    provider: 'Partner Power',
    providerHebrew: 'פרטנר פאוור',
    planName: 'Work From Home',
    planNameHebrew: 'עובדים מהבית',
    requiresSmartMeter: true,
    discountWindows: [
      { days: WEEKDAYS, startHour: 7, endHour: 17, discount: 0.15 },
    ],
    defaultDiscount: 0,
    conditionsHebrew: ['נדרש מונה חכם', 'הנחה בימים א-ה בין 7:00-17:00'],
    sourceUrl: 'https://www.partner.co.il/n/partnerpower',
    lastUpdated: PLANS_LAST_UPDATED,
  },
  {
    id: 'partner-night',
    provider: 'Partner Power',
    providerHebrew: 'פרטנר פאוור',
    planName: 'Night Owls',
    planNameHebrew: 'חיות לילה',
    requiresSmartMeter: true,
    discountWindows: [
      { days: WEEKDAYS, startHour: 23, endHour: 7, discount: 0.20 },
    ],
    defaultDiscount: 0,
    conditionsHebrew: ['נדרש מונה חכם', 'הנחה בימים א-ה בין 23:00-7:00'],
    sourceUrl: 'https://www.partner.co.il/n/partnerpower',
    lastUpdated: PLANS_LAST_UPDATED,
  },

  // ===========================================
  // Bezeq Energy (בזק אנרג'יה)
  // ===========================================
  {
    id: 'bezeq-24-7',
    provider: 'Bezeq Energy',
    providerHebrew: 'בזק אנרג\'יה',
    planName: 'Smart Saver 24/7',
    planNameHebrew: 'חוסכים חכם 24/7',
    requiresSmartMeter: false,
    discountWindows: [
      { days: ALL_DAYS, startHour: 0, endHour: 24, discount: 0.06 },
    ],
    defaultDiscount: 0.06,
    conditionsHebrew: ['ללא צורך במונה חכם', 'הנחה בכל שעות היממה'],
    sourceUrl: 'https://www.bezeq.co.il/benergy/',
    lastUpdated: PLANS_LAST_UPDATED,
  },
  {
    id: 'bezeq-day',
    provider: 'Bezeq Energy',
    providerHebrew: 'בזק אנרג\'יה',
    planName: 'Smart Daytime Saver',
    planNameHebrew: 'חוסכים חכם ביום',
    requiresSmartMeter: true,
    discountWindows: [
      { days: WEEKDAYS, startHour: 7, endHour: 17, discount: 0.15 },
    ],
    defaultDiscount: 0,
    conditionsHebrew: ['נדרש מונה חכם', 'הנחה בימים א-ה בין 7:00-17:00'],
    sourceUrl: 'https://www.bezeq.co.il/benergy/',
    lastUpdated: PLANS_LAST_UPDATED,
  },
  {
    id: 'bezeq-night',
    provider: 'Bezeq Energy',
    providerHebrew: 'בזק אנרג\'יה',
    planName: 'Smart Nighttime Saver',
    planNameHebrew: 'חוסכים חכם בלילה',
    requiresSmartMeter: true,
    discountWindows: [
      { days: WEEKDAYS, startHour: 23, endHour: 7, discount: 0.20 },
    ],
    defaultDiscount: 0,
    conditionsHebrew: ['נדרש מונה חכם', 'הנחה בימים א-ה בין 23:00-7:00'],
    sourceUrl: 'https://www.bezeq.co.il/benergy/',
    lastUpdated: PLANS_LAST_UPDATED,
  },

  // ===========================================
  // Amisragas (אמישראגז חשמל)
  // ===========================================
  {
    id: 'amisragas-fixed',
    provider: 'Amisragas',
    providerHebrew: 'אמישראגז חשמל',
    planName: 'Fixed Savings',
    planNameHebrew: 'חיסכון קבוע',
    requiresSmartMeter: false,
    discountWindows: [
      { days: ALL_DAYS, startHour: 0, endHour: 24, discount: 0.065 }, // Average for ranking
    ],
    defaultDiscount: 0.065,
    discountRange: {
      min: 0.06,
      max: 0.07,
      minLabelHebrew: 'לקוחות חדשים',
      minLabelEnglish: 'New customers',
      maxLabelHebrew: 'לקוחות גז קיימים',
      maxLabelEnglish: 'Existing gas customers',
    },
    requiresMembership: {
      type: 'gas',
      descriptionHebrew: 'הנחה גבוהה יותר ללקוחות גז קיימים',
      descriptionEnglish: 'Higher discount for existing gas customers',
    },
    conditionsHebrew: [
      '6% ללקוחות חדשים, 7% ללקוחות גז קיימים',
      'ללא צורך במונה חכם',
      'הנחה בכל שעות היממה',
    ],
    sourceUrl: 'https://www.amisragas.co.il/electricity/',
    lastUpdated: PLANS_LAST_UPDATED,
  },

  // ===========================================
  // IEC Baseline (no discount) - for comparison
  // ===========================================
  {
    id: 'iec-baseline',
    provider: 'IEC (Israel Electric)',
    providerHebrew: 'חברת החשמל',
    planName: 'Standard Rate',
    planNameHebrew: 'תעריף רגיל (ללא הנחה)',
    requiresSmartMeter: false,
    discountWindows: [],
    defaultDiscount: 0,
    conditionsHebrew: ['תעריף ברירת מחדל של חח"י'],
    sourceUrl: 'https://www.iec.co.il',
    lastUpdated: PLANS_LAST_UPDATED,
  },
];

// Get all unique providers
export const getProviders = (): string[] => {
  return [...new Set(electricityPlans.map((p) => p.provider))];
};

// Get plans by provider
export const getPlansByProvider = (provider: string): ElectricityPlan[] => {
  return electricityPlans.filter((p) => p.provider === provider);
};

// Get only plans that require smart meter
export const getSmartMeterPlans = (): ElectricityPlan[] => {
  return electricityPlans.filter((p) => p.requiresSmartMeter);
};

// Get only plans that don't require smart meter
export const getNonSmartMeterPlans = (): ElectricityPlan[] => {
  return electricityPlans.filter((p) => !p.requiresSmartMeter);
};
