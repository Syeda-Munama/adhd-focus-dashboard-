"use client";

import { useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskTimer } from "./TaskTimer";
import { CompletionCelebration } from "./CompletionCelebration";
import { EnergyPicker } from "./EnergyPicker";
import { useFocusStore } from "@/stores/focusStore";

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "bg-alert-soft text-alert",
  MEDIUM: "bg-clarity-soft text-clarity-ink",
  LOW: "bg-paper-border/70 text-ink-text-muted",
};

const ENERGY_LABEL: Record<string, string> = {
  LOW: "Low energy",
  MEDIUM: "Some focus needed",
  HIGH: "Deep focus",
};

export function FocusCard() {
  const {
    currentTask,
    remainingCount,
    mode,
    energyFilter,
    matchedEnergy,
    setTask,
    setMode,
    setEnergyFilter,
  } = useFocusStore();

  const fetchNext = useCallback(
    async (energy = energyFilter) => {
      setMode("loading");
      const url = energy ? `/api/tasks/next?energy=${energy}` : "/api/tasks/next";
      const res = await fetch(url);
      const data = await res.json();
      setTask(data.task, data.remainingCount, data.matchedEnergy);
    },
    [energyFilter, setMode, setTask]
  );

  useEffect(() => {
    fetchNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleEnergyChange(energy: typeof energyFilter) {
    setEnergyFilter(energy);
    fetchNext(energy);
  }

  async function handleAction(action: "complete" | "skip" | "snooze") {
    if (!currentTask) return;

    if (action === "complete") {
      await fetch(`/api/tasks/${currentTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      setMode("celebrating");
      return;
    }

    await fetch(`/api/tasks/${currentTask.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    fetchNext();
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-6 flex justify-center">
        <EnergyPicker value={energyFilter} onChange={handleEnergyChange} />
      </div>

      {mode === "loading" && (
        <div className="flex items-center justify-center py-24 text-ink-text-muted">
          Finding your next task...
        </div>
      )}

      {mode === "empty" && (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <p className="text-xl font-medium text-ink-text">
            Nothing pending. Nice.
          </p>
          <p className="text-ink-text-muted">
            Go dump some more thoughts, or just enjoy the empty queue.
          </p>
        </div>
      )}

      {mode === "celebrating" && (
        <CompletionCelebration onNext={() => fetchNext()} />
      )}

      {mode === "task" && currentTask && (
        <>
          <p className="mb-4 text-center text-sm text-ink-text-muted">
            {remainingCount} {remainingCount === 1 ? "task" : "tasks"} waiting
            — you only need to see this one.
          </p>

          {!matchedEnergy && energyFilter && (
            <p className="mb-4 text-center text-sm text-clarity-ink">
              Nothing at that energy level left — here&apos;s the easiest
              thing available instead.
            </p>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentTask.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <Card>
                <CardContent className="flex flex-col items-center gap-6 text-center">
                  <div className="flex flex-wrap justify-center gap-2">
                    {currentTask.category && (
                      <Badge>{currentTask.category}</Badge>
                    )}
                    <Badge className={PRIORITY_STYLES[currentTask.priority]}>
                      {currentTask.priority.toLowerCase()} priority
                    </Badge>
                    <Badge>{ENERGY_LABEL[currentTask.energyLevel]}</Badge>
                  </div>

                  <h1 className="text-2xl font-medium text-ink-text">
                    {currentTask.title}
                  </h1>

                  {currentTask.description && (
                    <p className="text-ink-text-muted">{currentTask.description}</p>
                  )}

                  <TaskTimer estimatedMinutes={currentTask.estimatedMinutes} />

                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <Button
                      variant="success"
                      size="lg"
                      onClick={() => handleAction("complete")}
                    >
                      Done ✓
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleAction("skip")}
                    >
                      Skip for now
                    </Button>
                    <Button variant="ghost" onClick={() => handleAction("snooze")}>
                      Snooze 1hr
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
