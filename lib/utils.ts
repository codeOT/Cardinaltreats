/** Format a number as Nigerian Naira */
export const fmt = (n: number): string => `₦${n.toLocaleString()}`;

/** Clamp a value between min and max */
export const clamp = (val: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, val));