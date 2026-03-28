type FlightQuoteInput = {
  originIata: string;
  destinationIata: string;
  departureDate: string;
};

export type FlightQuote = {
  estimatedCostGbp: number;
  durationHours: number;
  details: string;
  source?: "live" | "mock-llm";
};

type SerpApiFlight = {
  airline?: string;
  flight_number?: string;
  departure_airport?: { id?: string };
  arrival_airport?: { id?: string };
};

type SerpApiFlightResult = {
  price?: number | string;
  total_duration?: number | string;
  flights?: SerpApiFlight[];
};

type SerpApiResponse = {
  best_flights?: SerpApiFlightResult[];
  other_flights?: SerpApiFlightResult[];
};

function toDurationHours(durationValue?: number | string) {
  if (typeof durationValue === "number" && Number.isFinite(durationValue)) {
    if (durationValue > 24) {
      return Math.round((durationValue / 60) * 10) / 10;
    }
    return Math.round(durationValue * 10) / 10;
  }

  if (typeof durationValue === "string") {
    const hoursMatch = durationValue.match(/(\d+)\s*h/);
    const minsMatch = durationValue.match(/(\d+)\s*m/);
    const hours = Number(hoursMatch?.[1] ?? 0);
    const mins = Number(minsMatch?.[1] ?? 0);
    const parsed = hours + mins / 60;
    if (parsed > 0) {
      return Math.round(parsed * 10) / 10;
    }
  }

  return 4;
}

function toGbpAmount(value?: number | string) {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.replace(/[^\d.]/g, ""))
        : Number.NaN;
  const amount = Number(numericValue);
  if (!Number.isFinite(amount) || amount <= 0) {
    return 160;
  }
  return Math.round(amount);
}

function buildFallbackQuote(input: FlightQuoteInput): FlightQuote {
  return {
    estimatedCostGbp: 160,
    durationHours: 4,
    details: `Flight SkyJet ${input.originIata} -> ${input.destinationIata}`,
    source: "mock-llm"
  };
}

type MockQuoteResponse = {
  airline?: string;
  flightNumber?: string;
  durationHours?: number;
  estimatedCostGbp?: number;
};

export async function fetchMockFlightQuoteWithLLM(input: FlightQuoteInput): Promise<FlightQuote | null> {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
    const model = (import.meta.env.VITE_OPENAI_MODEL as string | undefined) ?? "gpt-4o-mini";
    if (!apiKey) {
      return null;
    }

    const prompt = [
      "Generate one realistic but simulated one-way flight quote in JSON.",
      "Output ONLY valid JSON and no markdown.",
      "Schema:",
      '{"airline":"string","flightNumber":"string","durationHours":number,"estimatedCostGbp":number}',
      `Route: ${input.originIata} -> ${input.destinationIata}`,
      `Departure date: ${input.departureDate}`,
      "Constraints:",
      "- durationHours between 1.0 and 12.0",
      "- estimatedCostGbp between 60 and 500",
      "- airline should look like a real carrier name"
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
      return buildFallbackQuote(input);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return buildFallbackQuote(input);
    }

    const parsed = JSON.parse(content) as MockQuoteResponse;
    const airline = parsed.airline?.trim() || "MockAir";
    const flightNumber = parsed.flightNumber?.trim() || "MA101";
    const durationHours = Number(parsed.durationHours);
    const estimatedCostGbp = Number(parsed.estimatedCostGbp);

    return {
      estimatedCostGbp:
        Number.isFinite(estimatedCostGbp) && estimatedCostGbp > 0 ? Math.round(estimatedCostGbp) : 160,
      durationHours: Number.isFinite(durationHours) && durationHours > 0 ? Math.round(durationHours * 10) / 10 : 4,
      details: `Flight ${airline} ${flightNumber} ${input.originIata} -> ${input.destinationIata}`,
      source: "mock-llm"
    };
  } catch (error) {
    console.warn("LLM mock flight quote failed; using static mock fallback:", error);
    return buildFallbackQuote(input);
  }
}

export async function fetchFlightQuote(input: FlightQuoteInput): Promise<FlightQuote | null> {
  try {
    const apiKey = import.meta.env.VITE_SERPAPI_API_KEY as string | undefined;
    const apiBase =
      (import.meta.env.VITE_SERPAPI_API_BASE as string | undefined) ?? "https://serpapi.com/search.json";

    if (!apiKey) {
      return null;
    }

    const params = new URLSearchParams({
      engine: "google_flights",
      departure_id: input.originIata,
      arrival_id: input.destinationIata,
      outbound_date: input.departureDate,
      type: "2",
      adults: "1",
      currency: "GBP",
      hl: "en",
      gl: "uk",
      api_key: apiKey
    });

    const response = await fetch(`${apiBase}?${params.toString()}`);
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as SerpApiResponse;
    const offer = data.best_flights?.[0] ?? data.other_flights?.[0];

    if (!offer) {
      return null;
    }

    const firstFlight = offer.flights?.[0];
    const lastFlight = offer.flights?.[(offer.flights?.length ?? 1) - 1];
    const carrier = firstFlight?.airline ?? "carrier";
    const flightNumber = firstFlight?.flight_number ?? "";
    const flightLabel = [carrier, flightNumber].filter(Boolean).join(" ");

    return {
      estimatedCostGbp: toGbpAmount(offer.price),
      durationHours: toDurationHours(offer.total_duration),
      details: `Flight ${flightLabel} ${firstFlight?.departure_airport?.id ?? input.originIata} -> ${lastFlight?.arrival_airport?.id ?? input.destinationIata}`,
      source: "live"
    };
  } catch (error) {
    console.warn("Live flight lookup failed; using fallback estimate:", error);
    return null;
  }
}
