const ORDINARY_DIMENSION = /^\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*$/i;
const POSITIVE_COMPOSITE_DIMENSION = /^\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*$/i;

export function canonicalDimension(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const match = input.match(ORDINARY_DIMENSION);
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  return `${Math.min(width, height)}x${Math.max(width, height)}`;
}

export function positiveCompositeDimension(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const match = input.match(POSITIVE_COMPOSITE_DIMENSION);
  if (!match) return null;
  const parts = match.slice(1).map(Number);
  if (parts.some((part) => !Number.isFinite(part) || part <= 0)) return null;
  return parts.join("x");
}
