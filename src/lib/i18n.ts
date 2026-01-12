'use client';

import { createContext, useContext } from 'react';
import type { Language } from '@/types';

export const translations = {
  he: {
    // App title and metadata
    title: 'מחשבון תוכניות חשמל חכם',
    subtitle: 'מצא את התוכנית המשתלמת ביותר לפי הצריכה שלך',
    description:
      'העלה את נתוני הצריכה מחברת החשמל וקבל המלצה מותאמת אישית לתוכנית החשמל הכי משתלמת עבורך',

    // Navigation
    home: 'בית',
    howItWorks: 'איך זה עובד',
    faq: 'שאלות נפוצות',

    // Upload section
    uploadTitle: 'העלה את נתוני הצריכה שלך',
    uploadSubtitle: 'גרור ושחרר קובץ CSV או לחץ לבחירת קובץ',
    uploadButton: 'בחר קובץ',
    uploadDragDrop: 'גרור ושחרר קובץ כאן',
    uploadFormats: 'קבצי CSV בלבד',
    uploadPrivacy: 'הנתונים שלך נשארים במכשיר שלך ולא נשלחים לשום שרת',

    // Instructions
    instructionsTitle: 'איך להוריד את נתוני הצריכה?',
    instructionsStep1: 'התחבר לאתר חברת החשמל',
    instructionsStep1Detail: 'www.iec.co.il',
    instructionsStep2: 'נווט למצב צריכה עדכני',
    instructionsStep2Detail: 'לאחר התחברות, לחץ על הקישור הישיר או נווט ידנית:',
    instructionsStep2Path: 'פעולות ← מחשבוני צריכה ← לנתוני הצריכה שלך ← מצב צריכה עדכני',
    instructionsDirectLink: 'קישור ישיר',
    instructionsStep3: 'בקש קובץ אקסל במייל',
    instructionsStep3Detail: 'גלול למטה ולחץ על "קבלת קובץ אקסל עם נתוני צריכה מהשנה האחרונה למייל שלך"',
    instructionsStep4: 'הורד את הקובץ מהמייל',
    instructionsStep4Detail: 'קובץ CSV יישלח למייל הרשום בחשבון',
    noSmartMeter: 'אין לך מונה חכם?',
    noSmartMeterDetail:
      'חלק מהתוכניות לא דורשות מונה חכם. ניתן להשתמש בחשבון החשמל הקודם לחישוב משוער.',

    // Results
    resultsTitle: 'התוכניות המומלצות עבורך',
    resultsSubtitle: 'מבוסס על ניתוח הצריכה שלך',
    recommended: 'מומלץ',
    annualSavings: 'חיסכון שנתי משוער',
    monthlySavings: 'חיסכון חודשי',
    currentCost: 'עלות נוכחית (ללא הנחה)',
    withPlan: 'עם התוכנית',
    discount: 'הנחה',
    fixedDiscount: 'הנחה קבועה',
    timeOfUse: 'תעריף משתנה',
    conditions: 'תנאים',
    switchProvider: 'עבור לספק',
    viewDetails: 'צפה בפרטים',
    compareAll: 'השווה את כל התוכניות',

    // Usage breakdown
    usageBreakdown: 'התפלגות הצריכה שלך',
    nightUsage: 'צריכת לילה',
    nightHours: '23:00-07:00',
    dayUsage: 'צריכת יום',
    dayHours: '07:00-14:00 / 20:00-23:00',
    weekendUsage: 'צריכת סופ"ש',
    weekendHours: 'שישי 14:00 - שבת 20:00',
    totalUsage: 'סה"כ צריכה',

    // File info
    fileInfo: 'פרטי הקובץ',
    dateRange: 'טווח תאריכים',
    totalRecords: 'מספר רשומות',
    customer: 'לקוח',
    address: 'כתובת',

    // Errors
    errorTitle: 'שגיאה',
    errorInvalidFile: 'קובץ לא תקין',
    errorParsingFailed: 'עיבוד הקובץ נכשל',
    tryAgain: 'נסה שוב',

    // Loading
    loading: 'טוען...',
    analyzing: 'מנתח את הצריכה שלך...',
    calculating: 'מחשב חיסכון פוטנציאלי...',

    // Footer
    disclaimer:
      'החישובים מבוססים על תעריפי חברת החשמל הנוכחיים והנחות הספקים. התוצאות הן הערכה בלבד.',
    lastUpdated: 'עדכון אחרון',
    dataSource: 'מקור מידע',
    privacyNote: 'כל החישובים מתבצעים על המכשיר שלך. הנתונים שלך לא נשלחים לשום שרת.',

    // Language
    language: 'שפה',
    hebrew: 'עברית',
    english: 'English',
  },
  en: {
    // App title and metadata
    title: 'Smart Electricity Plan Calculator',
    subtitle: 'Find the most cost-effective plan based on your usage',
    description:
      'Upload your usage data from IEC and get personalized recommendations for the best electricity plan for you',

    // Navigation
    home: 'Home',
    howItWorks: 'How It Works',
    faq: 'FAQ',

    // Upload section
    uploadTitle: 'Upload Your Usage Data',
    uploadSubtitle: 'Drag and drop a CSV file or click to select',
    uploadButton: 'Select File',
    uploadDragDrop: 'Drag and drop file here',
    uploadFormats: 'CSV files only',
    uploadPrivacy: 'Your data stays on your device and is never sent to any server',

    // Instructions
    instructionsTitle: 'How to download your usage data?',
    instructionsStep1: 'Log in to IEC website',
    instructionsStep1Detail: 'www.iec.co.il',
    instructionsStep2: 'Navigate to Current Consumption',
    instructionsStep2Detail: 'After signing in, click the direct link or navigate manually:',
    instructionsStep2Path: 'Actions → Consumption Calculators → Your Consumption Data → Current Status',
    instructionsDirectLink: 'Direct Link',
    instructionsStep3: 'Request Excel file by email',
    instructionsStep3Detail: 'Scroll down and click "Get Excel file with last year\'s data to your email"',
    instructionsStep4: 'Download from your email',
    instructionsStep4Detail: 'CSV file will be sent to your registered email',
    noSmartMeter: "Don't have a smart meter?",
    noSmartMeterDetail:
      "Some plans don't require a smart meter. You can use your previous electricity bill for an estimate.",

    // Results
    resultsTitle: 'Recommended Plans for You',
    resultsSubtitle: 'Based on your usage analysis',
    recommended: 'Recommended',
    annualSavings: 'Estimated Annual Savings',
    monthlySavings: 'Monthly Savings',
    currentCost: 'Current Cost (No Discount)',
    withPlan: 'With This Plan',
    discount: 'Discount',
    fixedDiscount: 'Fixed Discount',
    timeOfUse: 'Time-of-Use',
    conditions: 'Conditions',
    switchProvider: 'Switch Provider',
    viewDetails: 'View Details',
    compareAll: 'Compare All Plans',

    // Usage breakdown
    usageBreakdown: 'Your Usage Breakdown',
    nightUsage: 'Night Usage',
    nightHours: '11pm-7am',
    dayUsage: 'Day Usage',
    dayHours: '7am-2pm / 8pm-11pm',
    weekendUsage: 'Weekend Usage',
    weekendHours: 'Friday 2pm - Saturday 8pm',
    totalUsage: 'Total Usage',

    // File info
    fileInfo: 'File Information',
    dateRange: 'Date Range',
    totalRecords: 'Total Records',
    customer: 'Customer',
    address: 'Address',

    // Errors
    errorTitle: 'Error',
    errorInvalidFile: 'Invalid File',
    errorParsingFailed: 'File processing failed',
    tryAgain: 'Try Again',

    // Loading
    loading: 'Loading...',
    analyzing: 'Analyzing your usage...',
    calculating: 'Calculating potential savings...',

    // Footer
    disclaimer:
      'Calculations are based on current IEC rates and provider discounts. Results are estimates only.',
    lastUpdated: 'Last Updated',
    dataSource: 'Data Source',
    privacyNote:
      'All calculations happen on your device. Your data is never sent to any server.',

    // Language
    language: 'Language',
    hebrew: 'עברית',
    english: 'English',
  },
} as const;

export type TranslationKey = keyof typeof translations.he;

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isRtl: boolean;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

export function getTranslation(language: Language, key: TranslationKey): string {
  return translations[language][key] || key;
}
