import { z } from "zod";
import { ACCOMMODATIONS, DESTINATIONS, RESTAURANTS } from "../../data/mockCatalog";
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
  const destinationContext = DESTINATIONS.map((item) => ({
    destination: item.destination,
    country: item.country,
    tags: item.tags,
    avgDailyCost: item.avgDailyCost,
    trainFriendly: item.trainFriendly,
    ecoScore: item.ecoScore,
    accessibilityScore: item.accessibilityScore
  }));

  const accommodationContext = ACCOMMODATIONS.map((item) => ({
    destination: item.destination,
    name: item.name,
    nightlyCost: item.nightlyCost,
    accessibilityFeatures: item.accessibilityFeatures,
    ecoRating: item.ecoRating
  }));

  const restaurantContext = RESTAURANTS.map((item) => ({
    destination: item.destination,
    name: item.name,
    cuisine: item.cuisine,
    priceBand: item.priceBand,
    dietaryTags: item.dietaryTags,
    baseCost: item.baseCost
  }));

  return [
    "You are a travel planning AI for a group-trip hackathon app.",
    "Return exactly 3 options using themes in this order: cheapest, best_match, most_sustainable.",
    "Each option must use a different destination city. No duplicate destinations across the 3 options.",
    "Respect group constraints. Keep options realistic and internally consistent.",
    "Use only destinations and inventory from the provided context.",
    "Each option must include transport, accommodation, restaurants, visa summaries, itinerary, and budget breakdown.",
    "Budget breakdown totals should approximately align with estimatedTotal and estimatedPerPerson.",
    "Prefer train and eco-friendly choices if sustainability signals are strong.",
    "\nCONSTRAINTS_JSON:\n" + JSON.stringify(constraints),
    "\nDESTINATIONS_JSON:\n" + JSON.stringify(destinationContext),
    "\nACCOMMODATIONS_JSON:\n" + JSON.stringify(accommodationContext),
    "\nRESTAURANTS_JSON:\n" + JSON.stringify(restaurantContext)
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

  const langchainModuleName = "@langchain/openai";
  const { ChatOpenAI } = (await import(langchainModuleName)) as {
    ChatOpenAI: new (args: Record<string, unknown>) => {
      withStructuredOutput: (schema: typeof plannerSchema) => {
        invoke: (input: string) => Promise<z.infer<typeof plannerSchema>>;
      };
    };
  };

  const llm = new ChatOpenAI({
    apiKey,
    model,
    temperature: 0.3,
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
