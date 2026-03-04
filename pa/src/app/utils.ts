/**
 * Utility functions
 */

/**
 * Remove non-digit characters from a string
 * Used for normalizing CNPJ, phone numbers, etc.
 */
export function normalizeDigits(s?: string): string {
  return (s ?? "").replace(/\D/g, "");
}
