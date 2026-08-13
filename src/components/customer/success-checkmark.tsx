'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface SuccessCheckmarkProps {
  show: boolean;
  size?: number;
  onComplete?: () => void;
}

export function SuccessCheckmark({ show, size = 24, onComplete }: SuccessCheckmarkProps) {
  const strokeWidth = Math.max(2, size / 8);
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="flex items-center justify-center"
        >
          <motion.svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Circle that draws first */}
            <motion.circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#22c55e"
              strokeWidth={strokeWidth}
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                pathLength: {
                  duration: 0.4,
                  ease: 'easeInOut',
                },
              }}
              onAnimationComplete={() => {
                // Circle finished drawing - check will start automatically via delay
              }}
            />

            {/* Check mark that draws after the circle */}
            <motion.path
              d={`M ${size * 0.28} ${size * 0.52} L ${size * 0.42} ${size * 0.66} L ${size * 0.72} ${size * 0.34}`}
              stroke="#22c55e"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                pathLength: {
                  duration: 0.35,
                  delay: 0.35,
                  ease: 'easeOut',
                },
              }}
              onAnimationComplete={() => {
                onComplete?.();
              }}
            />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
