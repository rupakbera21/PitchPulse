"use client";

import { motion } from "framer-motion";

export function MemphisElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Plus / Cross 1 */}
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 90, 180] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] left-[10%] text-primary drop-shadow-[0_0_15px_rgba(0,210,106,0.8)]"
        style={{ opacity: 0.8 }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 0H22V18H40V22H22V40H18V22H0V18H18V0Z" />
        </svg>
      </motion.div>

      {/* Circle Outline */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[30%] right-[15%] text-team-away drop-shadow-xl"
      >
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="4" xmlns="http://www.w3.org/2000/svg">
          <circle cx="30" cy="30" r="28" />
        </svg>
      </motion.div>

      {/* Zigzag */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[20%] left-[20%] text-team-home drop-shadow-xl"
        style={{ opacity: 0.6 }}
      >
        <svg width="80" height="30" viewBox="0 0 80 30" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 25L20 5L35 25L50 5L65 25L80 5" />
        </svg>
      </motion.div>


      {/* Plus / Cross 2 */}
      <motion.div
        animate={{ y: [0, 40, 0], rotate: [0, -90, -180] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[25%] right-[8%] text-foreground drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]"
        style={{ opacity: 0.8 }}
      >
        <svg width="24" height="24" viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 0H22V18H40V22H22V40H18V22H0V18H18V0Z" />
        </svg>
      </motion.div>
    </div>
  );
}
