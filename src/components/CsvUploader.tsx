'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, History, Trash2, Calendar, User } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { parseIecCsv, validateUsageData } from '@/lib/csv-parser';
import { calculateAllPlans, extrapolateToAnnual } from '@/lib/calculator';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CsvUploaderProps {
  onSuccess?: () => void;
}

export function CsvUploader({ onSuccess }: CsvUploaderProps) {
  const { t, language, isRtl } = useI18n();
  const {
    usageData,
    setUsageData,
    setResults,
    setIsCalculating,
    setError,
    isCalculating,
    error,
    hasStoredData,
    storedDataDate,
    clearStoredData,
  } = useAppStore();

  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsCalculating(true);
      setFileName(file.name);

      try {
        const text = await file.text();
        const parseResult = parseIecCsv(text);

        if (!parseResult.success || !parseResult.data) {
          setError(
            isRtl
              ? parseResult.error?.messageHebrew || 'שגיאה בעיבוד הקובץ'
              : parseResult.error?.message || 'Error processing file'
          );
          setIsCalculating(false);
          return;
        }

        const validationResult = validateUsageData(parseResult.data);
        if (!validationResult.success) {
          setError(
            isRtl
              ? validationResult.error?.messageHebrew || 'הקובץ לא תקין'
              : validationResult.error?.message || 'Invalid file'
          );
          setIsCalculating(false);
          return;
        }

        setUsageData(parseResult.data);

        // Calculate savings for all plans
        const results = calculateAllPlans(parseResult.data);

        // Extrapolate to annual if needed
        const annualResults = extrapolateToAnnual(
          results,
          parseResult.data.startDate,
          parseResult.data.endDate
        );

        setResults(annualResults);
        setIsCalculating(false);

        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        setError(
          isRtl
            ? 'שגיאה בקריאת הקובץ'
            : 'Error reading file'
        );
        setIsCalculating(false);
      }
    },
    [setUsageData, setResults, setIsCalculating, setError, isRtl, onSuccess]
  );

  const useStoredData = useCallback(() => {
    if (!usageData) return;

    setIsCalculating(true);
    setError(null);

    // Re-calculate with stored data
    const results = calculateAllPlans(usageData);
    const annualResults = extrapolateToAnnual(
      results,
      usageData.startDate,
      usageData.endDate
    );

    setResults(annualResults);
    setIsCalculating(false);

    if (onSuccess) {
      onSuccess();
    }
  }, [usageData, setResults, setIsCalculating, setError, onSuccess]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.csv')) {
        processFile(file);
      } else {
        setError(isRtl ? 'יש להעלות קובץ CSV בלבד' : 'Please upload a CSV file');
      }
    },
    [processFile, setError, isRtl]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatStoredDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const locale = language === 'he' ? 'he-IL' : 'en-US';
    return `${start.toLocaleDateString(locale, options)} - ${end.toLocaleDateString(locale, options)}`;
  };

  return (
    <div className="space-y-4">
      {/* Stored Data Card */}
      <AnimatePresence>
        {hasStoredData && usageData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="overflow-hidden border-primary/30 bg-primary/5">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <History className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-primary">
                      {language === 'he' ? 'נתונים שמורים' : 'Stored Data'}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {usageData.customerName && (
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5" />
                          <span className="truncate">{usageData.customerName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDateRange(usageData.startDate, usageData.endDate)}</span>
                      </div>
                      <p className="text-xs">
                        {usageData.records.length.toLocaleString()}{' '}
                        {language === 'he' ? 'רשומות' : 'records'} •{' '}
                        {usageData.totalKwh.toFixed(0)} kWh
                      </p>
                    </div>
                    {storedDataDate && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {language === 'he' ? 'נשמר ב-' : 'Saved on '}
                        {formatStoredDate(storedDataDate)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle className="h-3 w-3" />
                  <span>
                    {language === 'he'
                      ? 'נשמר במכשיר שלך בלבד - אף פעם לא בענן'
                      : 'Stored on your device only - never in our cloud'}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={useStoredData}
                    className="flex-1"
                    disabled={isCalculating}
                  >
                    {isCalculating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {language === 'he' ? 'השתמש בנתונים אלו' : 'Use This Data'}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearStoredData();
                    }}
                    title={language === 'he' ? 'מחק נתונים' : 'Clear data'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider when stored data exists */}
      {hasStoredData && usageData && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {language === 'he' ? 'או העלה קובץ חדש' : 'or upload new file'}
            </span>
          </div>
        </div>
      )}

      {/* Upload Card */}
      <Card
        className={cn(
          'relative overflow-hidden border-2 border-dashed transition-all duration-200',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          isCalculating && 'pointer-events-none opacity-70'
        )}
      >
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          className="cursor-pointer p-8 md:p-12"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center text-center">
            <AnimatePresence mode="wait">
              {isCalculating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center gap-4"
                >
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-lg font-medium">{t('analyzing')}</p>
                  {fileName && (
                    <p className="text-sm text-muted-foreground">{fileName}</p>
                  )}
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center gap-4"
                >
                  <AlertCircle className="h-12 w-12 text-destructive" />
                  <p className="text-lg font-medium text-destructive">{error}</p>
                  <Button variant="outline" onClick={() => setError(null)}>
                    {t('tryAgain')}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center gap-4"
                >
                  <motion.div
                    animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {isDragging ? (
                      <FileText className="h-12 w-12 text-primary" />
                    ) : (
                      <Upload className="h-12 w-12 text-muted-foreground" />
                    )}
                  </motion.div>

                  <div>
                    <p className="text-lg font-medium">{t('uploadTitle')}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t('uploadSubtitle')}
                    </p>
                  </div>

                  <Button variant="secondary" className="mt-2">
                    {t('uploadButton')}
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    {t('uploadFormats')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Privacy badge */}
        <div className="border-t bg-muted/50 px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            <span>{t('uploadPrivacy')}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
