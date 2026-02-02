/**
 * Simple text sanitizer — strips HTML tags and trims whitespace.
 * For plain-text fields (comments, journal entries, display names, dream text).
 * Drizzle uses parameterized queries so SQL injection is already handled.
 */
export function sanitizeText(input: string): string {
  return input
    // Strip HTML tags
    .replace(/<[^>]*>/g, "")
    // Remove null bytes
    .replace(/\0/g, "")
    // Normalize whitespace
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Escape HTML entities for safe rendering.
 * Use for any user content that will be embedded in HTML.
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
  };
  return input.replace(/[&<>"']/g, (c) => map[c] || c);
}
