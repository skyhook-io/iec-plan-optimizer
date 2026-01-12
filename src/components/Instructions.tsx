'use client';

import { motion } from 'framer-motion';
import {
  LogIn,
  BarChart3,
  Calendar,
  Download,
  HelpCircle,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const steps = [
  {
    icon: LogIn,
    titleKey: 'instructionsStep1' as const,
    detailKey: 'instructionsStep1Detail' as const,
  },
  {
    icon: BarChart3,
    titleKey: 'instructionsStep2' as const,
    detailKey: 'instructionsStep2Detail' as const,
  },
  {
    icon: Calendar,
    titleKey: 'instructionsStep3' as const,
    detailKey: 'instructionsStep3Detail' as const,
  },
  {
    icon: Download,
    titleKey: 'instructionsStep4' as const,
    detailKey: 'instructionsStep4Detail' as const,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Instructions() {
  const { t, isRtl } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('instructionsTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.titleKey}
              variants={itemVariants}
              className="flex items-start gap-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {index + 1}
                  </span>
                  <p className="font-medium">{t(step.titleKey)}</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(step.detailKey)}
                </p>
              </div>
            </motion.div>
          ))}

          {/* No smart meter note */}
          <motion.div
            variants={itemVariants}
            className="mt-6 flex items-start gap-4 rounded-lg bg-muted/50 p-4"
          >
            <HelpCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">{t('noSmartMeter')}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('noSmartMeterDetail')}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
