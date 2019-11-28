import { Event, ScrollEvent, Step } from "@qawolf/types";

export const buildScrollSteps = (events: Event[]): Step[] => {
  const steps: Step[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i] as ScrollEvent;

    // ignore other actions
    if (event.name !== "scroll") continue;

    // ignore system initiated scrolls
    if (!event.isTrusted) continue;

    // skip to the last scroll on this target
    const nextEvent = i + 1 < events.length ? events[i + 1] : null;
    if (
      nextEvent &&
      nextEvent.name === "scroll" //&&
      // TODO add xpath to target
      //   event.target.xpath === nextEvent.target.xpath
    )
      continue;

    steps.push({
      action: "scroll",
      html: event.target,
      // include event index so we can sort in buildSteps
      index: i,
      page: event.page,
      value: event.value
    });
  }

  return steps;
};
