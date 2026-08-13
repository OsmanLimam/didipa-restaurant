import { type Variants } from 'framer-motion';

// Fade up from below
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// Fade in
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

// Scale up from small
export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

// Stagger container for grid items
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

// Stagger item (children of staggerContainer)
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// Slide in from left
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// Slide in from right
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// Hero section staggered reveal
export const heroContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

export const heroItem: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// Number counter animation
export const countUp = {
  duration: 1.5,
  ease: 'easeOut' as const,
};

// Card hover tap animation
export const cardHover = {
  whileHover: { y: -4, shadow: '0 10px 30px rgba(0,0,0,0.12)' },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
};

// Button press animation
export const buttonPress = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.97 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 17 },
};

// Cart bounce animation
export const cartBounce: Variants = {
  idle: { scale: 1 },
  bounce: {
    scale: [1, 1.3, 0.9, 1.15, 1],
    transition: { duration: 0.5 },
  },
};

// Page transition
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// Section reveal on scroll (used with whileInView)
export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};
