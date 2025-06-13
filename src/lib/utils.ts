import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncates text to a specified character limit
 * @param text The text to truncate
 * @param limit The character limit
 * @returns The truncated text with ellipsis if needed
 */
export function truncateText(text: string, limit: number): string {
  if (!text || text.length <= limit) return text;
  return text.slice(0, limit).trim() + "...";
}

/**
 * Checks if text needs truncation
 * @param text The text to check
 * @param limit The character limit
 * @returns True if text is longer than the limit
 */
export function needsTruncation(text: string, limit: number): boolean {
  return Boolean(text && text.length > limit);
}
