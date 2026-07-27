"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const MESSAGES = [
  "Nice. One down.",
  "That's a win. Keep going or stop here — both are fine.",
  "Done. Your brain is a little lighter now.",
  "Look at that. Actually finished.",
];

export function CompletionCelebration({ onNext }: { onNext: () => void }) {
  // Picked once via useState's lazy initializer, not on every render —
  // otherwise the message would flicker/change on unrelated re-renders.
  const [message] = useState(
    () => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 15 }}
      >
        <CheckCircle2 className="h-16 w-16 text-calm" strokeWidth={1.5} />
      </motion.div>
      <p className="text-lg font-medium text-ink-text">{message}</p>
      <button
        onClick={onNext}
        className="text-sm font-medium text-clarity-ink hover:opacity-70"
      >
        Show me the next one →
      </button>
    </motion.div>
  );
}
