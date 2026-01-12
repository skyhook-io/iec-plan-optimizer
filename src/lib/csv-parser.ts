import Papa from 'papaparse';
import type { ParsedUsageData, UsageRecord } from '@/types';

// Parse date from DD/MM/YYYY format (Israeli format)
function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

// Parse kWh value (handles numbers with or without leading zero)
function parseKwh(value: string): number {
  const cleaned = value.replace(',', '.').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Clean string value (remove extra quotes and whitespace)
function cleanString(value: string): string {
  return value.replace(/^["'\s]+|["'\s]+$/g, '').trim();
}

export interface ParseError {
  message: string;
  messageHebrew: string;
  row?: number;
}

export interface ParseResult {
  success: boolean;
  data?: ParsedUsageData;
  error?: ParseError;
}

export function parseIecCsv(csvContent: string): ParseResult {
  // Parse CSV with PapaParse
  const parsed = Papa.parse(csvContent, {
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    return {
      success: false,
      error: {
        message: `CSV parsing error: ${parsed.errors[0].message}`,
        messageHebrew: `שגיאה בקריאת הקובץ: ${parsed.errors[0].message}`,
        row: parsed.errors[0].row,
      },
    };
  }

  const rows = parsed.data as string[][];

  if (rows.length < 10) {
    return {
      success: false,
      error: {
        message: 'File too short - does not appear to be a valid IEC usage file',
        messageHebrew: 'הקובץ קצר מדי - לא נראה כקובץ צריכה תקין של חברת החשמל',
      },
    };
  }

  try {
    // Extract customer info from header rows
    // Row 1: "שם לקוח","כתובת"
    // Row 2: customer name, address
    let customerName = '';
    let address = '';
    let meterCode = '';
    let meterNumber = '';
    let contractNumber = '';

    // Find customer name row (usually row 2-3)
    for (let i = 0; i < Math.min(10, rows.length); i++) {
      const row = rows[i];
      if (row.length >= 2) {
        const firstCell = cleanString(row[0] || '');
        const secondCell = cleanString(row[1] || '');

        // Check if this looks like header row
        if (firstCell === 'שם לקוח' || firstCell === 'customer name') {
          continue;
        }

        // Check if this looks like meter info row
        if (firstCell === 'קוד מונה' || firstCell === 'meter code') {
          continue;
        }

        // Check if this is a data row with customer name (Hebrew text, not numbers)
        if (firstCell && /[\u0590-\u05FF]/.test(firstCell) && secondCell) {
          customerName = firstCell;
          address = secondCell;
        }

        // Check if this is meter info
        if (/^\d+$/.test(firstCell) && firstCell.length <= 6) {
          meterCode = firstCell;
          meterNumber = cleanString(row[1] || '');
          contractNumber = cleanString(row[2] || '');
        }
      }
    }

    // Find the start of usage data (look for "תאריך" or "date" header)
    let dataStartIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const firstCell = cleanString(row[0] || '').toLowerCase();
      if (
        firstCell === 'תאריך' ||
        firstCell === 'date' ||
        firstCell.includes('תאריך')
      ) {
        dataStartIndex = i + 1;
        break;
      }
    }

    // If we didn't find a header, try to find the first row with date pattern
    if (dataStartIndex === -1) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const firstCell = cleanString(row[0] || '');
        // Check for DD/MM/YYYY pattern
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(firstCell)) {
          dataStartIndex = i;
          break;
        }
      }
    }

    if (dataStartIndex === -1) {
      return {
        success: false,
        error: {
          message: 'Could not find usage data in file',
          messageHebrew: 'לא נמצאו נתוני צריכה בקובץ',
        },
      };
    }

    // Parse usage records
    const records: UsageRecord[] = [];
    let minDate: Date | null = null;
    let maxDate: Date | null = null;
    let totalKwh = 0;

    for (let i = dataStartIndex; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 3) continue;

      const dateStr = cleanString(row[0] || '');
      const timeStr = cleanString(row[1] || '');
      const kwhStr = cleanString(row[2] || '');

      // Skip rows that don't look like data
      if (!dateStr || !timeStr) continue;

      // Check for DD/MM/YYYY pattern
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) continue;

      // Check for HH:MM pattern
      if (!/^\d{2}:\d{2}$/.test(timeStr)) continue;

      const date = parseDate(dateStr);
      const kwh = parseKwh(kwhStr);

      // Skip invalid dates
      if (isNaN(date.getTime())) continue;

      records.push({
        date,
        time: timeStr,
        kwhUsage: kwh,
      });

      totalKwh += kwh;

      if (!minDate || date < minDate) minDate = date;
      if (!maxDate || date > maxDate) maxDate = date;
    }

    if (records.length === 0) {
      return {
        success: false,
        error: {
          message: 'No valid usage records found in file',
          messageHebrew: 'לא נמצאו רשומות צריכה תקינות בקובץ',
        },
      };
    }

    return {
      success: true,
      data: {
        customerName,
        address,
        meterCode,
        meterNumber,
        contractNumber,
        records,
        startDate: minDate!,
        endDate: maxDate!,
        totalKwh,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: `Error parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        messageHebrew: `שגיאה בעיבוד הקובץ: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`,
      },
    };
  }
}

// Validate that the file has enough data for meaningful analysis
export function validateUsageData(data: ParsedUsageData): ParseResult {
  // Check minimum records (at least 1 week of 15-min intervals = 672 records)
  if (data.records.length < 100) {
    return {
      success: false,
      error: {
        message: `File contains only ${data.records.length} records. For accurate analysis, we recommend at least 1 month of data.`,
        messageHebrew: `הקובץ מכיל רק ${data.records.length} רשומות. לניתוח מדויק, מומלץ להעלות לפחות חודש של נתונים.`,
      },
    };
  }

  // Check date range
  const daysDiff = Math.ceil(
    (data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff < 7) {
    return {
      success: false,
      error: {
        message: `File contains only ${daysDiff} days of data. For accurate analysis, we recommend at least 1 month of data.`,
        messageHebrew: `הקובץ מכיל רק ${daysDiff} ימים של נתונים. לניתוח מדויק, מומלץ להעלות לפחות חודש של נתונים.`,
      },
    };
  }

  return { success: true, data };
}
