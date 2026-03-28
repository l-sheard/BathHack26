type AccommodationQuoteInput = {
  destination: string;
  country?: string;
  nights: number;
  maxBudgetPerPerson: number;
  groupSize: number;
};

export type LlmAccommodationEstimate = {
  name: string;
  stayType: "hotel" | "apartment";
  description: string;
  nightlyCostGbp: number;
  facilities: string[];
  numBeds: number;
  location: string;
  ecoRating: number;
};

type AccommodationResponse = {
  name?: string;
  stayType?: "hotel" | "apartment";
  description?: string;
  nightlyCostGbp?: number;
  facilities?: string[];
  numBeds?: number;
  location?: string;
  ecoRating?: number;
};

function buildFallbackAccommodation(input: AccommodationQuoteInput): LlmAccommodationEstimate {
  return {
    name: `${input.destination} Central Stay`,
    stayType: "apartment",
    description: `Comfortable apartment-style stay in ${input.destination} with easy access to transit and restaurants.`,
    nightlyCostGbp: Math.max(70, Math.round(input.maxBudgetPerPerson / Math.max(2, input.nights))),
    facilities: ["Wi-Fi", "Kitchen", "Air conditioning", "Lift access"],
    numBeds: Math.max(1, Math.ceil(input.groupSize / 2)),
    location: `${input.destination} city centre`,
    ecoRating: 3
  };
}

export async function fetchAccommodationEstimateWithLLM(
  input: AccommodationQuoteInput
): Promise<LlmAccommodationEstimate | null> {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
    const model = (import.meta.env.VITE_OPENAI_MODEL as string | undefined) ?? "gpt-4o-mini";
    if (!apiKey) {
      return null;
    }

    const nightlyUpperBound = Math.max(120, Math.round(input.maxBudgetPerPerson / Math.max(2, input.nights)) + 90);

    const prompt = [
      "Generate one realistic but simulated accommodation quote in JSON.",
      "Output ONLY valid JSON and no markdown.",
      "Schema:",
      '{"name":"string","stayType":"hotel|apartment","description":"string","nightlyCostGbp":number,"facilities":["string"],"numBeds":number,"location":"string","ecoRating":number}',
      `Destination: ${input.destination}${input.country ? `, ${input.country}` : ""}`,
      `Trip nights: ${input.nights}`,
      `Group size: ${input.groupSize}`,
      `Target budget per person (GBP): ${input.maxBudgetPerPerson}`,
      "Constraints:",
      `- nightlyCostGbp between 60 and ${nightlyUpperBound}`,
      "- numBeds should be enough for the group (at least half of group size rounded up)",
      "- ecoRating integer from 1 to 5",
      "- facilities should include practical amenities like Wi-Fi, kitchen, breakfast, gym, parking, pool"
    ].join("\n");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.5,
        messages: [
          {
            role: "system",
            content: "You output concise valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      return buildFallbackAccommodation(input);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return buildFallbackAccommodation(input);
    }

    const parsed = JSON.parse(content) as AccommodationResponse;
    const fallback = buildFallbackAccommodation(input);
    const stayType = parsed.stayType === "hotel" ? "hotel" : "apartment";
    const nightlyCostRaw = Number(parsed.nightlyCostGbp);
    const nightlyCostGbp = Number.isFinite(nightlyCostRaw) && nightlyCostRaw > 0 ? Math.round(nightlyCostRaw) : fallback.nightlyCostGbp;
    const numBedsRaw = Number(parsed.numBeds);
    const minBeds = Math.max(1, Math.ceil(input.groupSize / 2));
    const numBeds = Number.isFinite(numBedsRaw) && numBedsRaw > 0 ? Math.max(minBeds, Math.round(numBedsRaw)) : fallback.numBeds;
    const ecoRatingRaw = Number(parsed.ecoRating);
    const ecoRating = Number.isFinite(ecoRatingRaw) ? Math.max(1, Math.min(5, Math.round(ecoRatingRaw))) : 3;

    return {
      name: parsed.name?.trim() || `${input.destination} ${stayType === "hotel" ? "Suites" : "Residences"}`,
      stayType,
      description:
        parsed.description?.trim() ||
        `Well-located ${stayType} stay in ${input.destination} with good transit access and practical amenities.`,
      nightlyCostGbp,
      facilities:
        Array.isArray(parsed.facilities) && parsed.facilities.length > 0
          ? parsed.facilities.map((item) => String(item)).slice(0, 8)
          : fallback.facilities,
      numBeds,
      location: parsed.location?.trim() || fallback.location,
      ecoRating
    };
  } catch (error) {
    console.warn("LLM accommodation estimate failed; using fallback:", error);
    return buildFallbackAccommodation(input);
  }
}
