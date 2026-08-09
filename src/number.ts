const SCIENTIFIC_NUMBER_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

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
