import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalize slug to URL-safe format
 * Supports nested paths like "blog/article-title"
 */
export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove accents (è → e)
    .replace(/\s+/g, '-')              // Spaces to hyphens
    .replace(/[^a-z0-9\/-]/g, '')      // Keep / for nested paths
    .replace(/-+/g, '-')               // Collapse multiple hyphens
    .replace(/\/+/g, '/')              // Collapse multiple slashes
    .replace(/^[-\/]+|[-\/]+$/g, '');  // Trim leading/trailing - and /
}
