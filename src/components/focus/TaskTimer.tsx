"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function TaskTimer({
  estimatedMinutes,
}: {
  estimatedMinutes: number | null;
}) {
  const initialSeconds = (estimatedMinutes ?? 15) * 60;
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // No effect here to reset state when `estimatedMinutes` changes.
  // The parent (FocusCard) renders this inside a div keyed on
  // currentTask.id, so React already remounts this component fresh
  // with a clean initialSeconds whenever the active task changes —
  // no need to sync it manually via an effect.

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => Math.max(0, s - 1));
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const isOvertime = secondsLeft === 0;
  const progress = 1 - secondsLeft / initialSeconds;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-32 w-32">
        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="#e4e2ef" /* paper-border */
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={isOvertime ? "#e4614a" /* alert */ : "#f2b441" /* clarity */}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 52}
            strokeDashoffset={2 * Math.PI * 52 * (1 - progress)}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xl font-medium text-ink-text tabular-nums">
          {formatTime(secondsLeft)}
        </div>
      </div>

      {isOvertime && (
        <p className="text-xs font-medium text-alert">
          Time&apos;s up — still going? That&apos;s okay, finish when you
          finish.
        </p>
      )}

      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsRunning((r) => !r)}
      >
        {isRunning ? "Pause" : secondsLeft === initialSeconds ? "Start timer" : "Resume"}
      </Button>
    </div>
  );
}
