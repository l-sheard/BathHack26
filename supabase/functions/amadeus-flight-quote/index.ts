declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

type SerpApiFlight = {
  airline?: string;
  flight_number?: string;
  departure_airport?: {
    id?: string;
  };
  arrival_airport?: {
    id?: string;
  };
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

type FlightQuoteInput = {
  originIata: string;
  destinationIata: string;
  departureDate: string;
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const SERPAPI_API_BASE = Deno.env.get("SERPAPI_API_BASE") ?? "https://serpapi.com/search.json";
const SERPAPI_API_KEY = Deno.env.get("SERPAPI_API_KEY") ?? "";

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const input = (await req.json()) as FlightQuoteInput;
    if (!input.originIata || !input.destinationIata || !input.departureDate) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json"
        }
      });
    }

    if (!SERPAPI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing SERPAPI_API_KEY" }), {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json"
        }
      });
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
      api_key: SERPAPI_API_KEY
    });

    const response = await fetch(`${SERPAPI_API_BASE}?${params.toString()}`);

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `SerpApi lookup failed (${response.status})` }), {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json"
        }
      });
    }

    const data = (await response.json()) as SerpApiResponse;
    const offer = data.best_flights?.[0] ?? data.other_flights?.[0];
    if (!offer) {
      return new Response(JSON.stringify({ error: "No offers found" }), {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json"
        }
      });
    }

    const firstFlight = offer.flights?.[0];
    const lastFlight = offer.flights?.[(offer.flights?.length ?? 1) - 1];
    const carrier = firstFlight?.airline ?? "carrier";
    const flightNumber = firstFlight?.flight_number ?? "";

    const payload = {
      estimatedCostGbp: toGbpAmount(offer.price),
      durationHours: toDurationHours(offer.total_duration),
      details: `Flight ${carrier}${flightNumber} ${firstFlight?.departure_airport?.id ?? input.originIata} -> ${lastFlight?.arrival_airport?.id ?? input.destinationIata}`
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json"
      }
    });
  }
});
