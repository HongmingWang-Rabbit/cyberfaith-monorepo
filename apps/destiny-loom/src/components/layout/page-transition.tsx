"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { usePathname } from "@/i18n/navigation";

const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      key={pathname}
      variants={prefersReducedMotion ? undefined : pageVariants}
      initial={prefersReducedMotion ? false : "initial"}
      animate="animate"
      exit={prefersReducedMotion ? undefined : "exit"}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/* Staggered grid wrapper for card grids */
const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: "easeOut" } },
};

export function StaggerGrid({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/* Interactive scale wrapper for buttons / cards */
export function ScaleOnTap({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
