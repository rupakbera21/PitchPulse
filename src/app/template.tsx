"use client";

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Primary Curtain */}
      <motion.div
        className="fixed top-0 left-0 w-full h-screen bg-foreground z-[100] origin-bottom"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
      />
      
      {/* Secondary Curtain (Accent) */}
      <motion.div
        className="fixed top-0 left-0 w-full h-screen bg-primary z-[99] origin-bottom"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
      />
      
      {/* Content Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
      >
        {children}
      </motion.div>
    </>
  );
}
