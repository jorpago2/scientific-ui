const SCIENTIFIC_NUMBER_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

export type ScientificNotation = "auto" | "standard" | "scientific";

export interface ScientificFormatOptions {
  notation?: ScientificNotation;
  significantDigits?: number;
  scientificBelow?: number;
  scientificAbove?: number;
}

/** Deterministic, copy-friendly formatting for scientific values in the UI. */
export function formatScientificValue(value: number, {
  notation = "auto",
  significantDigits = 4,
  scientificBelow = 1e-3,
  scientificAbove = 1e4,
}: ScientificFormatOptions = {}): string {
  if (!Number.isFinite(value)) return "—";
  if (Object.is(value, -0) || value === 0) return "0";
  const digits = Math.max(1, Math.min(12, Math.round(significantDigits)));
  const magnitude = Math.abs(value);
  const useScientific = notation === "scientific" || notation === "auto" && (magnitude < scientificBelow || magnitude >= scientificAbove);
  if (useScientific) {
    const [coefficient, exponent] = value.toExponential(digits - 1).split("e");
    const trimmedCoefficient = coefficient.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
    return `${trimmedCoefficient}e${Number(exponent)}`;
  }
  return new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: digits,
    useGrouping: false,
  }).format(value);
}

export function parseScientificNumber(rawValue: string): number | null {
  const normalized = rawValue.trim().replace(",", ".");
  if (!SCIENTIFIC_NUMBER_PATTERN.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function validateScientificNumber(
  rawValue: string,
  bounds: { min?: number; max?: number } = {},
): string | null {
  const value = parseScientificNumber(rawValue);
  if (value === null) return "Enter a finite number, for example 1.5e-6.";
  if (bounds.min !== undefined && value < bounds.min) return `Enter a value greater than or equal to ${bounds.min}.`;
  if (bounds.max !== undefined && value > bounds.max) return `Enter a value less than or equal to ${bounds.max}.`;
  return null;
}
