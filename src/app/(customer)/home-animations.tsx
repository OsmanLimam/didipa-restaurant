'use client';

import { motion, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';
import { heroContainer, heroItem, staggerContainer, staggerItem, sectionReveal } from '@/lib/animations';

// Hero section animation wrapper - staggered reveal of children
export function HeroAnimations({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={heroContainer}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

// Individual hero item (badge, title, subtitle, buttons)
export function HeroItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={heroItem} className={className}>
      {children}
    </motion.div>
  );
}

// Stagger grid for cards/items
export function StaggerGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Individual stagger item
export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

// Section reveal on scroll
export function SectionReveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.section
      variants={sectionReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// Fade in on scroll
export function FadeIn({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Wrapper for homepage - kept for backwards compat but now actually animates
export function HomeAnimations({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
