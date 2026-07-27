"use client";

import { motion } from "framer-motion";

/**
 * Fixed (not randomized) positions/timings for the scattered fragments.
 * Deliberately art-directed rather than random -- a curated scatter
 * reads as intentional, and fixed values avoid any SSR/CSR hydration
 * mismatch that Math.random() positions would cause.
 *
 * Each fragment: top/left as % of the hero container, rotation in deg,
 * float duration/delay in seconds for the ambient drift loop.
 */
const FRAGMENTS: {
  text: string;
  top: string;
  left: string;
  rotate: number;
  duration: number;
  delay: number;
  hideOnMobile?: boolean;
}[] = [
  { text: "call the dentist back", top: "8%", left: "6%", rotate: -6, duration: 11, delay: 0 },
  { text: "report due... friday??", top: "14%", left: "68%", rotate: 4, duration: 13, delay: 0.4 },
  { text: "reply to sarah 😬", top: "38%", left: "2%", rotate: 3, duration: 9, delay: 0.8 },
  { text: "mom's bday, no gift idea", top: "72%", left: "10%", rotate: -3, duration: 12, delay: 0.2, hideOnMobile: true },
  { text: "laundry. so much laundry", top: "80%", left: "62%", rotate: 5, duration: 10, delay: 1.1 },
  { text: "did i pay rent?", top: "20%", left: "40%", rotate: -8, duration: 14, delay: 0.6, hideOnMobile: true },
  { text: "buy milk + eggs", top: "60%", left: "78%", rotate: -4, duration: 11, delay: 1.4 },
  { text: "finish the thing i started", top: "48%", left: "84%", rotate: 6, duration: 9, delay: 0.3, hideOnMobile: true },
];

export function ChaosHero() {
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-3xl sm:h-[480px]">
      {/* Scattered thought fragments -- fade/drift in on load, then
          drift ambiently forever. transform + opacity only, so this
          stays cheap even on low-end devices. */}
      {FRAGMENTS.map((f, i) => (
        <motion.div
          key={f.text}
          className={`absolute font-hand text-xl text-scatter-soft sm:text-2xl ${
            f.hideOnMobile ? "hidden sm:block" : ""
          }`}
          style={{ top: f.top, left: f.left, rotate: f.rotate }}
          initial={{ opacity: 0, y: 12 }}
          animate={{
            opacity: [0, 1, 1],
            y: [12, 0, -10, 0],
          }}
          transition={{
            opacity: { duration: 1.2, delay: i * 0.15 },
            y: {
              duration: f.duration,
              delay: i * 0.15 + 1,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            },
          }}
        >
          {f.text}
        </motion.div>
      ))}

      {/* The one resolved task -- still, bright, arrives after the
          chaos has already settled in. This is the whole thesis. */}
      <motion.div
        className="absolute left-1/2 top-1/2 w-[min(88vw,340px)] -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.85, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.7, type: "spring", stiffness: 200, damping: 18 }}
      >
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 rounded-[28px] bg-clarity/30 blur-2xl"
          />
          <div className="rounded-[28px] border border-clarity/40 bg-ink-soft/90 p-6 text-center shadow-[0_0_60px_-15px_rgba(242,180,65,0.5)] backdrop-blur">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-clarity">
              Right now
            </p>
            <p className="text-xl font-medium text-white sm:text-2xl">
              Reply to Sarah&apos;s email
            </p>
            <p className="mt-2 text-sm text-white/50">~10 min · low energy</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
