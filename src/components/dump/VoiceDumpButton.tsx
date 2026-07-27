"use client";

import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/lib/hooks/useSpeechRecognition";

export function VoiceDumpButton({
  onFinalTranscript,
  disabled,
}: {
  onFinalTranscript: (text: string) => void;
  disabled?: boolean;
}) {
  const { state, interimTranscript, start, stop, errorMessage } =
    useSpeechRecognition(onFinalTranscript);

  if (state === "unsupported") {
    // Hide rather than show a mic button that silently does nothing --
    // Firefox and some Safari versions don't support this API.
    return null;
  }

  const isListening = state === "listening";

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={isListening ? stop : start}
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full transition-colors disabled:opacity-50",
          isListening
            ? "bg-alert text-white animate-pulse"
            : "bg-paper-border/70 text-ink-text-muted hover:bg-paper-border"
        )}
        aria-label={isListening ? "Stop recording" : "Start voice dump"}
        title={isListening ? "Stop recording" : "Speak your dump instead of typing"}
      >
        {isListening ? (
          <Square className="h-4 w-4" fill="currentColor" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </button>

      {isListening && (
        <p className="max-w-[16rem] text-center text-xs text-ink-text-muted italic">
          {interimTranscript || "Listening..."}
        </p>
      )}

      {state === "error" && errorMessage && (
        <p className="max-w-[16rem] text-center text-xs text-alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
