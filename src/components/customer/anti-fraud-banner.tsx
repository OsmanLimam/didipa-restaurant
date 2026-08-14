'use client';

import { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AntiFraudBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-red-600 text-white text-xs sm:text-sm"
      >
        <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <p className="truncate">
              <strong>Stay Safe!</strong> Only order through this official DidiPa app. Call{' '}
              <a href="tel:+233536828150" className="underline font-semibold">053 682 8150</a>{' '}
              to verify. Do NOT trust other numbers.
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 hover:bg-red-700 rounded p-0.5 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
