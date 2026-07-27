"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ExtractedTask } from "@/types/task";

const VoiceDumpButton = dynamic(
  () => import("./VoiceDumpButton").then((m) => m.VoiceDumpButton),
  { ssr: false }
);

type State = "idle" | "processing" | "reviewing" | "error";

const PLACEHOLDER =
  "Just type whatever's in your head. Doesn't need to make sense.\n\ne.g. \"ugh need to call the dentist back, also that report is due friday and i haven't started, forgot to reply to sarah's email, groceries, mom's birthday is next week and i have no gift idea, laundry is piling up...\"";

export function DumpInput() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [extracted, setExtracted] = useState<ExtractedTask[]>([]);
  const [ignoredNotes, setIgnoredNotes] = useState<string[]>([]);

  async function handleSubmit() {
    if (!text.trim() || state === "processing") return;
    setState("processing");
    setErrorMessage("");

    try {
      const res = await fetch("/api/ai/parse-dump", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: text }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      setExtracted(data.tasks ?? []);
      setIgnoredNotes(data.ignoredNotes ?? []);
      setState("reviewing");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Couldn't process that dump."
      );
      setState("error");
    }
  }

  function handleDone() {
    router.push("/focus");
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {(state === "idle" || state === "processing" || state === "error") && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-ink-text-muted">
                Type it out, or:
              </span>
              <VoiceDumpButton
                disabled={state === "processing"}
                onFinalTranscript={(phrase) =>
                  setText((prev) => (prev ? `${prev} ${phrase}` : phrase))
                }
              />
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={PLACEHOLDER}
              rows={10}
              autoFocus
              disabled={state === "processing"}
            />
            {state === "error" && (
              <p className="mt-3 text-sm text-alert">{errorMessage}</p>
            )}
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!text.trim() || state === "processing"}
                size="lg"
              >
                {state === "processing"
                  ? "Making sense of it..."
                  : "Turn this into tasks"}
              </Button>
            </div>
          </motion.div>
        )}

        {state === "reviewing" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-ink-text-muted">
              Found <span className="font-semibold">{extracted.length}</span>{" "}
              {extracted.length === 1 ? "task" : "tasks"} in there. You
              don&apos;t need to look at all of them — just hit focus and
              we&apos;ll hand you one at a time.
            </p>

            <ul className="space-y-2">
              {extracted.map((t, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-paper-border bg-paper-card px-4 py-3 text-sm text-ink-text"
                >
                  {t.title}
                </li>
              ))}
            </ul>

            {ignoredNotes.length > 0 && (
              <details className="text-sm text-ink-text-muted">
                <summary className="cursor-pointer">
                  {ignoredNotes.length} other thing(s) noted, no action needed
                </summary>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {ignoredNotes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </details>
            )}

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setText("");
                  setState("idle");
                }}
              >
                Dump more
              </Button>
              <Button onClick={handleDone} size="lg">
                Start focusing →
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
