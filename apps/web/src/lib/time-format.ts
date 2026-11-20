import { format } from "date-fns";

/**
 * Follows the 12/24-hour clock preference of the user's OS/browser locale
 * (macOS "24-hour time" shows up as an h23 hourCycle in Chrome and WKWebView).
 */
export function detectUses24HourClock(locale?: string): boolean {
  try {
    const options = new Intl.DateTimeFormat(locale, {
      hour: "numeric",
    }).resolvedOptions();
    if (options.hourCycle) {
      return options.hourCycle === "h23" || options.hourCycle === "h24";
    }
    return options.hour12 === false;
  } catch {
    return false;
  }
}

let cached: boolean | null = null;

export function uses24HourClock(): boolean {
  if (cached === null) cached = detectUses24HourClock();
  return cached;
}

/** Test hook: force a clock style, or pass null to re-detect. */
export function setUses24HourClock(value: boolean | null): void {
  cached = value;
}

/** date-fns pattern for a clock time: "h:mm a" (3:30 PM) or "HH:mm" (15:30). */
export function timePattern(): string {
  return uses24HourClock() ? "HH:mm" : "h:mm a";
}

/** Pattern for the start of a range, where the period is shown only once: "h:mm" or "HH:mm". */
export function timePatternNoPeriod(): string {
  return uses24HourClock() ? "HH:mm" : "h:mm";
}

/** "3:30 PM" or "15:30". */
export function formatClockTime(date: Date): string {
  return format(date, timePattern());
}

/**
 * Hour label for timeline gutters and pickers.
 * - "compact": "3pm" or "15:00"
 * - "spaced": "3 PM" or "15:00"
 * - "full": "3:00 PM" or "15:00"
 */
export function formatHourLabel(
  hour: number,
  style: "compact" | "spaced" | "full" = "compact"
): string {
  const date = new Date(2000, 0, 1, hour, 0);
  if (uses24HourClock()) return format(date, "HH:mm");
  if (style === "full") return format(date, "h:mm a");
  if (style === "spaced") return format(date, "h a");
  return format(date, "ha").toLowerCase();
}
