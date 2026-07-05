import { z } from "zod";
import type { AggregatedConstraints, GeneratedOption } from "../../types/models";

const optionSchema = z.object({
  optionRank: z.number().int().min(1).max(3),
  theme: z.enum(["cheapest", "best_match", "most_sustainable"]),
  destination: z.string().min(2),
  destinationIata: z
    .string()
    .length(3)
    .describe("The primary international airport IATA code serving this destination, e.g. LIS, BCN, AGP."),
  startDate: z.string().min(8),
  endDate: z.string().min(8),
  summary: z.string().min(10),
  rationale: z.string().min(10),
  estimatedTotal: z.number().positive(),
  estimatedPerPerson: z.number().positive(),
  tradeoffs: z.array(z.string()).min(1),
  validationNotes: z.array(z.string()).min(1),
  transportPlans: z.array(
    z.object({
      participantId: z.string().min(1),
      mode: z.enum(["plane", "train"]),
      departure: z.string().min(1),
      durationHours: z.number().positive(),
      details: z.string().min(5),
      estimatedCost: z.number().positive(),
      emissionsLevel: z.enum(["low", "medium", "high"])
    })
  ),
  accommodation: z.object({
    name: z.string().min(2),
    description: z.string().min(5),
    nightlyCost: z.number().positive(),
    facilities: z.array(z.string().min(2)).min(1),
    numBeds: z.number().int().positive(),
    location: z.string().min(2),
    accessibilityFeatures: z.array(z.string()),
    ecoRating: z.number().int().min(1).max(5)
  }),
  restaurants: z.array(
    z.object({
      name: z.string().min(2),
      cuisine: z.string().min(2),
      priceBand: z.enum(["$", "$$", "$$$"]),
      dietaryTags: z.array(z.string()),
      explanation: z.string().min(5),
      estimatedCostPerPerson: z.number().positive()
    })
  ),
  visaSummaries: z.array(
    z.object({
      nationality: z.string().min(2),
      outcome: z.enum(["visa_free", "evisa", "check_required"]),
      summary: z.string().min(5)
    })
  ),
  itinerary: z.array(
    z.object({
      dayNumber: z.number().int().min(1),
      title: z.string().min(3),
      description: z.string().min(8),
      activityType: z.string().min(3),
      isSustainable: z.boolean(),
      accessibilityLevel: z.enum(["high", "medium", "low"]),
      estimatedCost: z.number().positive()
    })
  ),
  budgetBreakdown: z.object({
    transport: z.number().nonnegative(),
    accommodation: z.number().nonnegative(),
    food: z.number().nonnegative(),
    activities: z.number().nonnegative()
  })
});

const plannerSchema = z.object({
  options: z.array(optionSchema).length(3)
});

function buildPlannerPrompt(constraints: AggregatedConstraints) {
  const rankedTags = Object.entries(constraints.softPreferences.preferenceScores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);

  const topTagsLine =
    rankedTags.length > 0
      ? `This group's requested trip themes, ranked by how many participants picked them: ${rankedTags
          .map(([tag, score]) => `${tag} (${score})`)
          .join(", ")}. Every option's destination MUST genuinely deliver the top-ranked theme(s) — e.g. if "beach" ranks highest, all 3 destinations should be real beach/coastal destinations, not landlocked or unrelated cities picked for other reasons.`
      : "This group did not specify strong theme preferences; use budget, transport, and sustainability signals instead.";

  const maxTravelTimeHours = Math.min(...constraints.perParticipant.map((p) => p.maxTravelTimeHours));
  const departures = [...new Set(constraints.perParticipant.map((p) => p.departure))].join(", ");

  const budgetLine = `The group's average budget per person is ${constraints.hardConstraints.maxBudgetPerPerson} (same currency as costs below). The "cheapest" option must be a genuinely low-cost destination and route for this budget, not just a low-cost-sounding city with an unrealistic flight price.`;

  return [
    "You are a travel planning AI for a group-trip hackathon app.",
    "Return exactly 3 options using themes in this order: cheapest, best_match, most_sustainable.",
    "Each option must use a different real-world destination city, chosen from your own knowledge of real cities worldwide. No duplicate destinations across the 3 options.",
    "Do not default to the same handful of well-known European city-break destinations (e.g. Amsterdam, Copenhagen, Lisbon, Split, Barcelona) unless they are genuinely the best fit. Actively consider a wide range of countries and city sizes, and vary your choices meaningfully between different groups' constraints.",
    topTagsLine,
    `HARD CONSTRAINT: no participant should need more than ${maxTravelTimeHours} hours of one-way travel time. Participants depart from: ${departures}. Do not propose long-haul or intercontinental destinations that would exceed this for any participant, even for the "most_sustainable" option — a long-haul flight is never the sustainable choice; sustainability means short distance, train-reachable, or otherwise low-emission travel from these specific departure points.`,
    budgetLine,
    "Also weigh transport bias and sustainability signals (softPreferences.transportBias, softPreferences.sustainabilityScore), strict dietary/accessibility needs, and realistic visa feasibility for the participants' nationalities.",
    "Respect group constraints. Keep options realistic and internally consistent. Use your own general knowledge of real-world accommodation, dining, and transport costs and options for whichever destination you choose — do not invent implausible details.",
    "For each option, also return destinationIata: the IATA code of the destination's primary international airport, so real flight prices can be looked up afterward.",
    "All 3 options must share the same startDate and endDate, taken from hardConstraints.overlappingDates when it is present. If overlappingDates is null, propose sensible shared dates using each participant's preferredTripLengthDays, flexibilityNotes, and availabilityWindows in perParticipant.",
    "Each option must include transport, accommodation, restaurants, visa summaries, itinerary, and budget breakdown.",
    "Accommodation must include: name, description, nightlyCost, facilities, numBeds, location, accessibilityFeatures, and ecoRating.",
    "Budget breakdown totals should approximately align with estimatedTotal and estimatedPerPerson.",
    "\nCONSTRAINTS_JSON:\n" + JSON.stringify(constraints)
  ].join("\n");
}

function normalizeOptions(raw: z.infer<typeof plannerSchema>["options"]): GeneratedOption[] {
  const orderedThemes: Array<GeneratedOption["theme"]> = ["cheapest", "best_match", "most_sustainable"];
  const byTheme = new Map(raw.map((option) => [option.theme, option]));

  return orderedThemes.map((theme, index) => {
    const option = byTheme.get(theme) ?? raw[index];
    return {
      ...option,
      optionRank: index + 1,
      theme
    };
  });
}

export function isAiPlannerEnabled() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  return Boolean(apiKey);
}

export async function generateTripOptionsWithLLM(constraints: AggregatedConstraints): Promise<GeneratedOption[]> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  const model = (import.meta.env.VITE_OPENAI_MODEL as string | undefined) ?? "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("Missing VITE_OPENAI_API_KEY for AI planner.");
  }

  const { ChatOpenAI } = (await import("@langchain/openai")) as {
    ChatOpenAI: new (args: Record<string, unknown>) => {
      withStructuredOutput: (schema: typeof plannerSchema) => {
        invoke: (input: string) => Promise<z.infer<typeof plannerSchema>>;
      };
    };
  };

  const llm = new ChatOpenAI({
    apiKey,
    model,
    temperature: 0.85,
    configuration: {
      // This app currently runs generation from the frontend for MVP speed.
      // Move to a server/edge function before production usage.
      dangerouslyAllowBrowser: true
    } as Record<string, unknown>
  });

  const structured = llm.withStructuredOutput(plannerSchema);
  const response = await structured.invoke(buildPlannerPrompt(constraints));

  return normalizeOptions(response.options);
}
