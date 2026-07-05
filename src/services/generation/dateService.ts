import type { AggregatedConstraints, AvailabilityWindow } from "../../types/models";

export type TripDateSelection = {
  startDate: string;
  endDate: string;
  rationale: string;
};

type DateSelectionResponse = {
  startDate?: string;
  endDate?: string;
  rationale?: string;
};

function isValidDateRange(startDate: unknown, endDate: unknown) {
  if (typeof startDate !== "string" || typeof endDate !== "string") return false;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && end.getTime() > start.getTime();
}

function buildDatePrompt(constraints: AggregatedConstraints, rawOverlap: AvailabilityWindow | null) {
  const participantSummaries = constraints.perParticipant.map((participant) => ({
    name: participant.name,
    preferredTripLengthDays: participant.preferredTripLengthDays,
    flexibilityNotes: participant.flexibilityNotes,
    availabilityWindows: participant.availabilityWindows
  }));

  return [
    "You are scheduling a group trip and must choose the single best shared start and end date for the whole group.",
    "Output ONLY valid JSON and no markdown.",
    'Schema: {"startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD","rationale":"string"}',
    "Rules:",
    "- Prefer a date range fully contained within every participant's availability window(s).",
    "- If no range satisfies every participant, choose the range that satisfies the most participants and briefly note who is affected in the rationale.",
    "- Aim for a trip length close to the group's typical preferred trip length, using flexibilityNotes as a hint when relevant.",
    "- endDate must be strictly after startDate.",
    "- Keep the rationale to one or two short sentences explaining the trade-off made.",
    rawOverlap
      ? `A strict full-group availability overlap already exists: ${rawOverlap.start_date} to ${rawOverlap.end_date}. Use it directly unless a better-fitting sub-range makes more sense for the preferred trip length.`
      : "No strict overlap exists across all availability windows; use judgement to find the best compromise.",
    "\nPARTICIPANTS_JSON:\n" + JSON.stringify(participantSummaries)
  ].join("\n");
}

export async function selectTripDatesWithLLM(
  constraints: AggregatedConstraints,
  rawOverlap: AvailabilityWindow | null
): Promise<TripDateSelection | null> {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
    const model = (import.meta.env.VITE_OPENAI_MODEL as string | undefined) ?? "gpt-4o-mini";
    if (!apiKey) {
      return null;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: "You output concise valid JSON only."
          },
          {
            role: "user",
            content: buildDatePrompt(constraints, rawOverlap)
          }
        ]
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return null;
    }

    const parsed = JSON.parse(content) as DateSelectionResponse;
    if (!isValidDateRange(parsed.startDate, parsed.endDate)) {
      return null;
    }

    return {
      startDate: parsed.startDate as string,
      endDate: parsed.endDate as string,
      rationale: parsed.rationale?.trim() || "AI-selected dates based on group availability."
    };
  } catch (error) {
    console.warn("AI date selection failed; using overlap fallback:", error);
    return null;
  }
}
