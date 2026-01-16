import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove accents (è → e)
    .replace(/[^a-z0-9]+/g, '-')       // Replace /, spaces, etc. with -
    .replace(/^-+|-+$/g, '')           // Remove leading/trailing -
    .replace(/-{2,}/g, '-');           // Remove double hyphens
}
