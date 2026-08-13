'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

// Animated success checkmark
export function SuccessCheckmark({ show, size = 24 }: { show: boolean; size?: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="flex items-center justify-center"
        >
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Check
              className="text-green-600"
              style={{ width: size, height: size }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Pulse loading dot
export function PulseDot({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`w-2 h-2 rounded-full bg-primary ${className}`}
      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

// Loading skeleton with shimmer effect
export function ShimmerCard() {
  return (
    <motion.div
      className="bg-card border rounded-xl overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
      </div>
    </motion.div>
  );
}

// Order status step animation
export function AnimatedStep({
  isActive,
  isCompleted,
  children,
}: {
  isActive: boolean;
  isCompleted: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-3 ${
        isActive ? 'text-primary font-medium' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
      }`}
    >
      <motion.div
        animate={{
          scale: isActive ? 1.15 : 1,
          backgroundColor: isCompleted ? '#22c55e' : isActive ? '#d97706' : '#e5e7eb',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
      >
        {isCompleted ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            <Check className="h-4 w-4" />
          </motion.div>
        ) : isActive ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
        )}
      </motion.div>
      {children}
    </motion.div>
  );
}

// Cart add success animation (item flies to cart)
export function CartSuccessIndicator({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2"
        >
          <Check className="h-4 w-4" />
          Added to cart!
        </motion.div>
      )}
    </AnimatePresence>
  );
}
