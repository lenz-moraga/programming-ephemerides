/**
 * Pure utility functions for ephemeris generation.
 * These are extracted from the API route to make them independently testable.
 */

export interface EphemerisPayload {
  day: number
  month: number
  year: number
}

/**
 * Formats a date into a zero-padded display string (YYYY-MM-DD).
 */
export function formatDisplayDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * Validates that the given day and month values are within calendar bounds.
 */
export function isValidDayMonth(day: number, month: number): boolean {
  return (
    Number.isInteger(day) &&
    Number.isInteger(month) &&
    day >= 1 &&
    day <= 31 &&
    month >= 1 &&
    month <= 12
  )
}

/**
 * Builds the OpenAI prompt for a given day and month.
 */
export function buildEphemerisPrompt(day: number, month: number): string {
  return `Generate a historical programming or technology event that occurred on ${month}/${day} (any year). 
  The response should be in Spanish and include:
  - The year it happened
  - A brief description of the event
  - Why it's significant in programming/technology history
  
  Format: "DD/MM/YYYY - Description of the event and its significance."
  
  Make it factual and historically accurate.`
}

/**
 * Builds the JSON payload used when calling the generation API
 * (e.g., from GitHub Actions scripts).
 */
export function buildGenerationPayload(day: number, month: number, year: number): EphemerisPayload {
  return { day, month, year }
}
