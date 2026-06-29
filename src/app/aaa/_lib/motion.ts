import type { Variants } from "framer-motion";

// Custom ease-out curve shared across the landing page.
export const EASE_OUT = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** Fade + rise up. Used by individual elements inside a stagger container. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

/** Parent container that staggers its children's entrance. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

/** Default IntersectionObserver options: animate once, when 30% visible. */
export const viewportOnce = { once: true, amount: 0.3 } as const;
