import { describe, expect, it } from "vitest";
import { eventSurface, isNotReplied, responseLabel } from "./event-response";

const status = (responseStatus: Parameters<typeof isNotReplied>[0]["responseStatus"]) => ({ responseStatus });

describe("isNotReplied", () => {
  it("is true only for an invitation still waiting for an answer", () => {
    expect(isNotReplied(status("needsAction"))).toBe(true);
    expect(isNotReplied(status("accepted"))).toBe(false);
    expect(isNotReplied(status("tentative"))).toBe(false);
    expect(isNotReplied(status("declined"))).toBe(false);
  });

  it("is false for events with no invitation, like your own or an iCloud event", () => {
    expect(isNotReplied(status(null))).toBe(false);
  });
});

describe("eventSurface", () => {
  const fill = "rgba(59, 130, 246, 0.2)";

  it("fills a replied event with the calendar's tint", () => {
    expect(eventSurface(status("accepted"), "#3B82F6", fill)).toEqual({ backgroundColor: fill });
    expect(eventSurface(status(null), "#3B82F6", fill)).toEqual({ backgroundColor: fill });
  });

  it("draws an unanswered invitation as an outline on the page background", () => {
    const surface = eventSurface(status("needsAction"), "#3B82F6", fill);
    expect(surface.backgroundColor).toBe("hsl(var(--background))");
    expect(surface.boxShadow).toBe("inset 0 0 0 1px #3B82F6");
  });
});

describe("responseLabel", () => {
  it("names each answer, and nothing for events with no invitation", () => {
    expect(responseLabel(status("accepted"))).toBe("Going");
    expect(responseLabel(status("tentative"))).toBe("Maybe");
    expect(responseLabel(status("needsAction"))).toBe("Not replied");
    expect(responseLabel(status("declined"))).toBe("Declined");
    expect(responseLabel(status(null))).toBeNull();
  });
});
