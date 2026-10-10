import { useCallback, useRef } from "react";

export function useSound(enabled) {
  const contextRef = useRef(null);
  return useCallback(
    (kind = "click") => {
      if (!enabled) return;
      try {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        const context = contextRef.current || new AudioContextClass();
        contextRef.current = context;
        if (context.state === "suspended") context.resume();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const start = context.currentTime;
        const frequency =
          kind === "success" ? 740 : kind === "error" ? 190 : 420;
        oscillator.type = kind === "error" ? "triangle" : "sine";
        oscillator.frequency.setValueAtTime(frequency, start);
        if (kind === "success")
          oscillator.frequency.exponentialRampToValueAtTime(1040, start + 0.11);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.045, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          start + (kind === "success" ? 0.22 : 0.12),
        );
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.24);
      } catch {
        /* Audio is an optional enhancement. */
      }
    },
    [enabled],
  );
}
