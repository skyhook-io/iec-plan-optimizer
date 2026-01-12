'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Info, CheckCircle, AlertCircle, Zap, ArrowLeftRight, Users } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function ElectricityMarketExplainer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { language, isRtl } = useI18n();
  const isHe = language === 'he';

  return (
    <div className="rounded-xl border bg-card/50 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start gap-3 p-4 text-start hover:bg-muted/50 transition-colors"
      >
        <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm">
            {isHe ? 'מה זה הרפורמה בשוק החשמל?' : 'What is the electricity market reform?'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isHe
              ? 'מיולי 2024, אפשר לקנות חשמל מספקים פרטיים במקום מחברת החשמל - ולחסוך כסף. החשמל נשאר אותו חשמל בדיוק, רק החיוב מגיע מחברה אחרת.'
              : 'Since July 2024, you can buy electricity from private providers instead of IEC - and save money. The electricity is exactly the same, only the billing comes from a different company.'}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t pt-4">
              {/* Safety myth */}
              <div className="flex gap-3">
                <Zap className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">
                    {isHe ? 'זה בטוח?' : 'Is it safe?'}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isHe
                      ? 'לחלוטין. חברת החשמל ממשיכה לייצר ולהוליך את החשמל לכולם באותה איכות - לא משנה מאיזה ספק קונים. אם ספק פושט רגל, חוזרים אוטומטית לחברת החשמל ללא ניתוק.'
                      : 'Absolutely. IEC continues to generate and deliver electricity to everyone at the same quality - regardless of which provider you buy from. If a provider goes bankrupt, you automatically return to IEC without interruption.'}
                  </p>
                </div>
              </div>

              {/* How it works */}
              <div className="flex gap-3">
                <ArrowLeftRight className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">
                    {isHe ? 'איך עוברים?' : 'How does switching work?'}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isHe
                      ? 'המעבר פשוט ולא דורש התחייבות. נרשמים אצל ספק חדש, והמעבר מתבצע בסוף החודש. אין צורך במונה חכם - גם עם מונה רגיל אפשר לעבור. מקבלי קצבאות (ביטוח לאומי, משרד הביטחון וכו\') שומרים על ההנחות שלהם.'
                      : 'Switching is simple and requires no commitment. Sign up with a new provider, and the switch happens at the end of the month. No smart meter required - you can switch with a regular meter too. Those receiving subsidies (National Insurance, Defense Ministry, etc.) keep their discounts.'}
                  </p>
                </div>
              </div>

              {/* Providers */}
              <div className="flex gap-3">
                <Users className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">
                    {isHe ? 'מי הספקים?' : 'Who are the providers?'}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isHe
                      ? 'פועלים כיום כ-7 ספקים פרטיים: סופר-פאוור, סלקום אנרג׳י, פרטנר פאוור, בזק אנרג׳י, פזגז חשמל, אמישראגז חשמל, ו-HOT אנרג׳י. כל אחד מציע מסלולים שונים - חלקם עם הנחה קבועה, וחלקם עם הנחות לפי שעות.'
                      : 'Currently about 7 private providers operate: Super-Power, Cellcom Energy, Partner Power, Bezeq Energy, Pazgas Electric, Amisragas Electric, and HOT Energy. Each offers different plans - some with fixed discounts, others with time-based discounts.'}
                  </p>
                </div>
              </div>

              {/* Who benefits */}
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">
                    {isHe ? 'למי זה הכי משתלם?' : 'Who benefits most?'}
                  </h4>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    <li>
                      {isHe
                        ? '• צריכה גבוהה (משפחות, רכב חשמלי, דוד חשמל) - החיסכון יכול להגיע למאות ואלפי שקלים בשנה'
                        : '• High consumption (families, EV, electric water heater) - savings can reach hundreds to thousands of shekels per year'}
                    </li>
                    <li>
                      {isHe
                        ? '• בעלי מונה חכם - יכולים ליהנות ממסלולי שעות אם דפוס הצריכה מתאים (למשל צריכה גבוהה בלילה או בסופ״ש)'
                        : '• Smart meter owners - can benefit from time-of-use plans if usage pattern fits (e.g., high night or weekend consumption)'}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Considerations */}
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">
                    {isHe ? 'מה כדאי לדעת?' : 'What should you know?'}
                  </h4>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    <li>
                      {isHe
                        ? '• ללא מונה חכם - מקבלים הנחה אחידה (עד 6.5%), לא ניתן ליהנות ממסלולי שעות מוזלות'
                        : '• Without smart meter - you get a flat discount (up to 6.5%), cannot benefit from time-based plans'}
                    </li>
                    <li>
                      {isHe
                        ? '• תנאים - חלק מהמסלולים דורשים להיות לקוח של החברה, או מוגבלים עד תקרת צריכה מסוימת'
                        : '• Conditions - some plans require being an existing customer, or apply only up to a consumption threshold'}
                    </li>
                    <li>
                      {isHe
                        ? '• מבצעים - חלק מההנחות מוגבלות בזמן, כדאי לבדוק מתי הן מסתיימות'
                        : '• Promotions - some discounts are time-limited, worth checking when they expire'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
