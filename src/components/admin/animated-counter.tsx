'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1.2, className = '' }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, value, duration]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </motion.span>
  );
}

// Stat card with animated counter
interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
}

export function AnimatedStatCard({ label, value, prefix = '', suffix = '', icon, trend }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
      className="bg-card border rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        {icon}
      </div>
      <div className="flex items-end gap-2">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} className="text-2xl font-bold" />
        {trend && (
          <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </motion.div>
  );
}
