import { z } from "zod";
import type { AggregatedConstraints, GeneratedOption } from "../../types/models";

const optionSchema = z.object({
  optionRank: z.number().int().min(1).max(3),
  theme: z.enum(["cheapest", "best_match", "most_sustainable"]),
  destination: z.string().min(2),
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
  return [
    "You are a travel planning AI for a group-trip hackathon app.",
    "Return exactly 3 options using themes in this order: cheapest, best_match, most_sustainable.",
    "Each option must use a different real-world destination city, chosen from your own knowledge of real cities worldwide. No duplicate destinations across the 3 options.",
    "IMPORTANT: Do not default to the same handful of well-known European city-break destinations (e.g. Amsterdam, Copenhagen, Lisbon, Split, Barcelona) unless they are genuinely the best fit. Actively consider a wide range of countries and city sizes, and vary your choices meaningfully between the 3 options and between different groups' constraints.",
    "Base each destination choice explicitly on: budget fit (hardConstraints.maxBudgetPerPerson), the group's top preference tags (softPreferences.preferenceScores), transport bias and sustainability signals (softPreferences.transportBias, softPreferences.sustainabilityScore), strict dietary/accessibility needs, and realistic visa feasibility for the participants' nationalities.",
    "Respect group constraints. Keep options realistic and internally consistent. Use your own general knowledge of real-world accommodation, dining, and transport costs and options for whichever destination you choose — do not invent implausible details.",
    "All 3 options must share the same startDate and endDate, taken from hardConstraints.overlappingDates when it is present. If overlappingDates is null, propose sensible shared dates using each participant's preferredTripLengthDays, flexibilityNotes, and availabilityWindows in perParticipant.",
    "Each option must include transport, accommodation, restaurants, visa summaries, itinerary, and budget breakdown.",
    "Accommodation must include: name, description, nightlyCost, facilities, numBeds, location, accessibilityFeatures, and ecoRating.",
    "Budget breakdown totals should approximately align with estimatedTotal and estimatedPerPerson.",
    "Prefer train and eco-friendly choices if sustainability signals are strong and the destination is realistically well-connected by rail from participants' departure points.",
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
