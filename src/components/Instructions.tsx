'use client';

import { motion } from 'framer-motion';
import {
  LogIn,
  Navigation,
  Mail,
  Download,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

  const steps = [
    { icon: LogIn, titleKey: 'instructionsStep1' as const, detailKey: 'instructionsStep1Detail' as const },
    { icon: Navigation, titleKey: 'instructionsStep2' as const, detailKey: 'instructionsStep2Detail' as const, hasDirectLink: true },
    { icon: Mail, titleKey: 'instructionsStep3' as const, detailKey: 'instructionsStep3Detail' as const },
    { icon: Download, titleKey: 'instructionsStep4' as const, detailKey: 'instructionsStep4Detail' as const },
  ];

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
                  {index === 0 ? (
                    <a
                      href="https://www.iec.co.il"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {t(step.detailKey)}
                    </a>
                  ) : (
                    t(step.detailKey)
                  )}
                </p>
                {step.hasDirectLink && (
                  <div className="mt-2 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href="https://www.iec.co.il/consumption-info-menu/remote-reading-info"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t('instructionsDirectLink')}
                        <ExternalLink className="ms-1.5 h-3.5 w-3.5" />
                      </a>
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {t('instructionsStep2Path')}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* No smart meter note */}
          <motion.div
            variants={itemVariants}
            className="mt-4 flex items-start gap-4 rounded-lg bg-muted/50 p-4"
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
