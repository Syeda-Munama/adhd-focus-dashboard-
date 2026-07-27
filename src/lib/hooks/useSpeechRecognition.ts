"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

type RecognitionState = "idle" | "listening" | "unsupported" | "error";

interface UseSpeechRecognitionResult {
  state: RecognitionState;
  interimTranscript: string;
  start: () => void;
  stop: () => void;
  errorMessage: string | null;
}

function isSpeechRecognitionSupported() {
  return (
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition ?? window.webkitSpeechRecognition)
  );
}

/**
 * Wraps the browser's Web Speech API for voice-to-text capture.
 *
 * Note on browser support: this works well in Chrome and Edge. Firefox
 * has no support, and Safari's support is partial/unreliable as of
 * this writing. `state` becomes "unsupported" when the API isn't
 * present at all, so the UI can hide the mic button rather than show
 * one that silently does nothing.
 *
 * IMPORTANT: this hook reads `window` during its very first render
 * (to decide "unsupported" up front, without needing an effect just
 * to flip that one flag). That's only safe in a component that never
 * renders on the server -- see VoiceDumpButton, which is loaded via
 * `next/dynamic(..., { ssr: false })` for exactly this reason.
 *
 * `onFinalTranscript` fires once per completed phrase (i.e. once
 * `isFinal` is true for a result) -- the caller decides how to merge
 * that into their text (we append with a space in DumpInput).
 */
export function useSpeechRecognition(
  onFinalTranscript: (text: string) => void
): UseSpeechRecognitionResult {
  const [state, setState] = useState<RecognitionState>(() =>
    isSpeechRecognitionSupported() ? "idle" : "unsupported"
  );
  const [interimTranscript, setInterimTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  // Keep the latest callback in a ref so the recognition instance
  // (created once) always calls the current version without needing
  // to be recreated every render. Synced in an effect, not during
  // render -- mutating a ref's .current while rendering is unsafe.
  const onFinalTranscriptRef = useRef(onFinalTranscript);
  useLayoutEffect(() => {
    onFinalTranscriptRef.current = onFinalTranscript;
  });

  useEffect(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    // Support was already determined in the useState initializer above;
    // if it's missing, there's nothing to wire up.
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          onFinalTranscriptRef.current(text.trim());
        } else {
          interim += text;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      // "no-speech" fires constantly during natural pauses -- not a
      // real error, so don't surface it to the user.
      if (event.error === "no-speech") return;
      setErrorMessage(event.message || event.error);
      setState("error");
    };

    recognition.onend = () => {
      setInterimTranscript("");
      setState((current) => (current === "error" ? current : "idle"));
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setErrorMessage(null);
    setState("listening");
    recognitionRef.current.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { state, interimTranscript, start, stop, errorMessage };
}
