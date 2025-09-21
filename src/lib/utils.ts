import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateClassesToAttend(
  attended: number,
  total: number,
  target: number
): number {
  if (target === 100) {
    return attended === total ? 0 : Infinity;
  }
  const currentPercentage = total > 0 ? (attended / total) * 100 : 0;
  if (currentPercentage >= target) {
    return 0;
  }
  const needed = Math.ceil(
    (target * total - 100 * attended) / (100 - target)
  );
  return needed > 0 ? needed : 0;
}

export function calculateClassesToBunk(
  attended: number,
  total: number,
  target: number
): number {
  if (target <= 0) return Infinity;
  const currentPercentage = total > 0 ? (attended / total) * 100 : 0;
  if (currentPercentage < target) {
    return 0;
  }
  const bunkable = Math.floor((100 * attended - target * total) / target);
  return bunkable > 0 ? bunkable : 0;
}
