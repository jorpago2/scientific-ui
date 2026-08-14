import { useEffect, useRef, type RefObject } from "react";
import type { ScientificState } from "./types.js";

export interface ScientificResultTransitionOptions {
  state: ScientificState;
  resultRef: RefObject<HTMLElement | null>;
  onReveal?: () => void;
  completionKey?: string | number | null;
  enabled?: boolean;
  completionStates?: readonly ScientificState[];
}

const defaultCompletionStates: readonly ScientificState[] = ["up-to-date", "validated", "warning", "failed"];

/** Reveals, scrolls to and focuses a result only after a real completion. */
export function useScientificResultTransition({
  state,
  resultRef,
  onReveal,
  completionKey,
  enabled = true,
  completionStates = defaultCompletionStates,
}: ScientificResultTransitionOptions) {
  const previous = useRef({ state, completionKey, mounted: false });
  useEffect(() => {
    const prior = previous.current;
    const isCompletion = completionStates.includes(state);
    const completedRun = prior.state === "running" && isCompletion;
    const completedSynchronousOperation = prior.mounted && completionKey != null && completionKey !== prior.completionKey && isCompletion;
    previous.current = { state, completionKey, mounted: true };
    if (!enabled || (!completedRun && !completedSynchronousOperation)) return;
    onReveal?.();
    const frame = window.requestAnimationFrame(() => {
      const result = resultRef.current;
      if (!result) return;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const stage = result.closest<HTMLElement>(".scientific-workbench__stage");
      const resultBounds = result.getBoundingClientRect();
      const stageBounds = stage?.getBoundingClientRect();
      const resultStartsInView = Boolean(
        stageBounds
        && resultBounds.top >= stageBounds.top
        && resultBounds.top < stageBounds.bottom,
      );
      // Preserve the surrounding heading when the outcome is already visible.
      // Scrolling is only useful when the completed result is outside the stage.
      if (!resultStartsInView) {
        result.scrollIntoView({ block: "nearest", behavior: reducedMotion ? "auto" : "smooth" });
      }
      result.dataset.scientificResultFocusTarget = "true";
      result.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [completionKey, completionStates, enabled, onReveal, resultRef, state]);
}
