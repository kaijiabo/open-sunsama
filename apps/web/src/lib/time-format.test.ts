import { afterEach, describe, expect, it } from "vitest";
import {
  detectUses24HourClock,
  formatClockTime,
  formatHourLabel,
  setUses24HourClock,
} from "./time-format";

const AFTERNOON = new Date(2026, 10, 20, 15, 5);

afterEach(() => setUses24HourClock(null));

describe("detectUses24HourClock", () => {
  it("reads the locale's hour cycle", () => {
    expect(detectUses24HourClock("en-US")).toBe(false);
    expect(detectUses24HourClock("en-GB")).toBe(true);
    expect(detectUses24HourClock("de-DE")).toBe(true);
  });

  it("honors an explicit hour-cycle extension", () => {
    expect(detectUses24HourClock("en-US-u-hc-h23")).toBe(true);
    expect(detectUses24HourClock("en-GB-u-hc-h12")).toBe(false);
  });
});

describe("12-hour clock", () => {
  it("keeps the existing output", () => {
    setUses24HourClock(false);
    expect(formatClockTime(AFTERNOON)).toBe("3:05 PM");
    expect(formatHourLabel(15)).toBe("3pm");
    expect(formatHourLabel(0)).toBe("12am");
    expect(formatHourLabel(15, "spaced")).toBe("3 PM");
    expect(formatHourLabel(0, "full")).toBe("12:00 AM");
  });
});

describe("24-hour clock", () => {
  it("shows hours 00-23 without AM/PM", () => {
    setUses24HourClock(true);
    expect(formatClockTime(AFTERNOON)).toBe("15:05");
    expect(formatClockTime(new Date(2026, 10, 20, 0, 7))).toBe("00:07");
    expect(formatHourLabel(15)).toBe("15:00");
    expect(formatHourLabel(9, "spaced")).toBe("09:00");
    expect(formatHourLabel(0, "full")).toBe("00:00");
  });
});
