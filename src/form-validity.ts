import { useCallback, useRef, useState } from "react";

export type ScientificFieldValidationReporter = (fieldId: string, message: string | null) => void;

export interface ScientificFormValidityController {
  hasInvalidFields: boolean;
  invalidFieldIds: readonly string[];
  revision: number;
  reportFieldValidity: ScientificFieldValidationReporter;
  isValid: () => boolean;
  resetValidity: () => void;
}

export function updateScientificFieldValidity(
  current: ReadonlyMap<string, string>,
  fieldId: string,
  message: string | null,
): Map<string, string> {
  const next = new Map(current);
  if (message) next.set(fieldId, message);
  else next.delete(fieldId);
  return next;
}

/**
 * Tracks invalid numeric drafts separately from the last committed scientific
 * configuration so execution can never use values different from those shown.
 */
export function useScientificFormValidity(): ScientificFormValidityController {
  const invalidFieldsRef = useRef(new Map<string, string>());
  const [invalidFieldIds, setInvalidFieldIds] = useState<readonly string[]>([]);
  const [revision, setRevision] = useState(0);

  const reportFieldValidity = useCallback<ScientificFieldValidationReporter>((fieldId, message) => {
    invalidFieldsRef.current = updateScientificFieldValidity(invalidFieldsRef.current, fieldId, message);
    setInvalidFieldIds(Array.from(invalidFieldsRef.current.keys()));
  }, []);

  const isValid = useCallback(() => invalidFieldsRef.current.size === 0, []);
  const resetValidity = useCallback(() => {
    invalidFieldsRef.current = new Map();
    setInvalidFieldIds([]);
    setRevision((current) => current + 1);
  }, []);

  return {
    hasInvalidFields: invalidFieldIds.length > 0,
    invalidFieldIds,
    revision,
    reportFieldValidity,
    isValid,
    resetValidity,
  };
}
