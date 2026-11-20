import type { CSSProperties } from "react";
import type { CalendarEvent } from "@open-sunsama/types";

type WithResponse = Pick<CalendarEvent, "responseStatus">;

/** An invitation you haven't answered yet. */
export function isNotReplied(event: WithResponse): boolean {
  return event.responseStatus === "needsAction";
}

/**
 * Background and outline for an event. Replied events get the usual tinted
 * fill (`fill`); an invitation you haven't replied to is drawn hollow, an
 * outline in the calendar's color on the page background, as Google
 * Calendar does, so it reads as "not yet yours".
 */
export function eventSurface(
  event: WithResponse,
  color: string,
  fill: string
): CSSProperties {
  return isNotReplied(event)
    ? { backgroundColor: "hsl(var(--background))", boxShadow: `inset 0 0 0 1px ${color}` }
    : { backgroundColor: fill };
}

const RESPONSE_LABELS: Record<NonNullable<CalendarEvent["responseStatus"]>, string> = {
  accepted: "Going",
  tentative: "Maybe",
  needsAction: "Not replied",
  declined: "Declined",
};

/** Your answer, for tooltips. Null for events with no invitation. */
export function responseLabel(event: WithResponse): string | null {
  return event.responseStatus ? RESPONSE_LABELS[event.responseStatus] : null;
}
