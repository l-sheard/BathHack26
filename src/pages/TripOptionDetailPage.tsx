import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Section } from "../components/Section";
import { useTripOptions } from "../hooks/queries";
import { currency } from "../lib/utils";
import { fetchDestinationImages } from "../services/imageService";

function formatDurationHours(value: unknown) {
  const hours = Number(value);
  if (!Number.isFinite(hours) || hours <= 0) {
    return "-";
  }

  const wholeHours = Math.floor(hours);
  const mins = Math.round((hours - wholeHours) * 60);

  if (mins <= 0) {
    return `${wholeHours}h`;
  }
  if (wholeHours <= 0) {
    return `${mins}m`;
  }

  return `${wholeHours}h ${mins}m`;
}

function extractAirline(details: unknown) {
  if (typeof details !== "string") {
    return "Unknown airline";
  }

  const normalized = stripQuoteTag(details)
    .replace(/\s*\(from.*\)$/i, "")
    .trim();
  const match = normalized.match(/^Flight\s+(.+?)\s+[A-Z]{3}\s*->/i);
  if (match?.[1]) {
    return match[1].trim();
  }

  return "Unknown airline";
}

function stripQuoteTag(details: unknown) {
  if (typeof details !== "string") {
    return "";
  }

  return details
    .replace(/\s*\[(?:Estimated|Mock quote)\]\s*/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function isEstimatedQuote(details: unknown) {
  return (
    typeof details === "string" && /\[(?:Estimated|Mock quote)\]/i.test(details)
  );
}

function parseAccommodationMeta(accommodation: any) {
  const features = Array.isArray(accommodation?.accessibility_features)
    ? accommodation.accessibility_features.map((item: unknown) => String(item))
    : [];

  const facilities: string[] = [];
  let numBeds: number | null = null;
  let location: string | null = null;

  for (const feature of features) {
    if (feature.startsWith("beds:")) {
      const value = Number(feature.slice(5));
      if (Number.isFinite(value) && value > 0) {
        numBeds = Math.round(value);
      }
      continue;
    }

    if (feature.startsWith("location:")) {
      location = feature.slice("location:".length).trim();
      continue;
    }

    facilities.push(feature);
  }

  return {
    facilities,
    numBeds,
    location,
  };
}

export function TripOptionDetailPage() {
  const { tripId = "", optionId = "" } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const participantId = search.get("participantId") ?? undefined;
  const options = useTripOptions(tripId);
  const option = options.data?.find((item: any) => item.id === optionId);
  const accommodation = option?.accommodation_options?.[0];
  const accommodationMeta = parseAccommodationMeta(accommodation);

  const [fallbackImage, setFallbackImage] = useState<string | null>(null);

  useEffect(() => {
    if (!option?.destination) {
      return;
    }

    let isCancelled = false;
    fetchDestinationImages([option.destination])
      .then((imagesByDestination) => {
        if (!isCancelled) {
          setFallbackImage(imagesByDestination[option.destination] ?? null);
        }
      })
      .catch(() => {
        // Ignore image fallback failures to keep the page usable.
      });

    return () => {
      isCancelled = true;
    };
  }, [option?.destination]);

  if (options.isLoading) {
    return <p className="text-sm text-black">Loading trip option...</p>;
  }

  if (options.error) {
    return <p className="text-sm text-red-600">{String(options.error)}</p>;
  }

  if (!option) {
    return (
      <Card className="space-y-3 text-black rounded-3xl">
        <p className="text-sm text-black">Trip option not found.</p>
        <Button onClick={() => navigate(`/trip/${tripId}/options`)}>
          Back to options
        </Button>
      </Card>
    );
  }

  const resolvedImageUrl = option.image_url ?? fallbackImage;
  const allTransportPlans = option.transport_plans ?? [];
  const transportPlans = participantId
    ? allTransportPlans.filter(
        (plan: any) => plan.participant_id === participantId,
      )
    : allTransportPlans.slice(0, 1);

  return (
    <div className="space-y-6">
      <Section
        title={`Option ${option.option_rank}: ${option.destination}`}
        subtitle="Full option details"
      >
        <Card className="space-y-3 text-black rounded-3xl">
          <div className="flex gap-2">
            <Button
              onClick={() =>
                navigate(
                  `/trip/${tripId}/options${participantId ? `?participantId=${participantId}` : ""}`,
                )
              }
            >
              Back to options
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                navigate(
                  `/trip/${tripId}/dashboard${participantId ? `?participantId=${participantId}` : ""}`,
                )
              }
            >
              Go to dashboard
            </Button>
          </div>
        </Card>
      </Section>

      <Card className="space-y-6 bg-gradient-to-br from-violet-600/30 to-fuchsia-500/10 border-violet-400/40 shadow-xl backdrop-blur-lg text-black rounded-3xl">
        {resolvedImageUrl && (
          <div className="relative h-72 w-full overflow-hidden rounded-2xl">
            <img
              src={resolvedImageUrl}
              alt={option.destination}
              className="h-full w-full object-cover rounded-2xl"
            />
          </div>
        )}

        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-black">
                Option {option.option_rank}: {option.destination}
              </h2>
            </div>
            <Badge tone="green">{option.theme.replaceAll("_", " ")}</Badge>
          </div>

          <p className="mt-3 text-sm text-black">{option.summary}</p>
          <p className="mt-2 text-xs text-black">{option.rationale}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg bg-white/10 backdrop-blur-md p-3 text-sm border border-violet-300/30">
            <div className="font-semibold text-black">Estimated cost</div>
            <div className="text-black">
              Total: {currency(option.estimated_total)}
            </div>
            <div className="text-black">
              Per person: {currency(option.estimated_per_person)}
            </div>
          </div>
          <div className="rounded-lg bg-white/10 backdrop-blur-md p-3 text-sm border border-violet-300/30">
            <div className="font-semibold text-black">Accommodation</div>
            <div className="text-black">{accommodation?.name ?? "TBD"}</div>
            <div className="text-xs text-black">
              {accommodation?.description}
            </div>
            <div className="mt-2 text-xs text-black">
              Price: {currency(accommodation?.nightly_cost ?? 0)} / night
            </div>
            <div className="text-xs text-black">
              Beds: {accommodationMeta.numBeds ?? "TBD"}
            </div>
            <div className="text-xs text-black">
              Location: {accommodationMeta.location ?? "Central area"}
            </div>
            <div className="mt-1 text-xs text-black">
              Facilities:{" "}
              {accommodationMeta.facilities.length > 0
                ? accommodationMeta.facilities.join(", ")
                : "TBD"}
            </div>
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold">Your transport plan</h4>
          {transportPlans.length > 0 ? (
            <div className="space-y-2">
              {transportPlans.map((plan: any, index: number) => (
                <div
                  key={plan.id ?? `${plan.participant_id}-${index}`}
                  className="rounded-xl border border-violet-300/30 bg-white/10 backdrop-blur-md p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-black">
                        {plan.mode === "plane" ? "Flight quote" : "Rail quote"}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-black">
                        {plan.departure} {"->"} {option.destination}
                      </div>
                    </div>
                    <div className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold text-black">
                      {plan.mode === "plane"
                        ? isEstimatedQuote(plan.details)
                          ? "Estimated quote"
                          : "Live quote"
                        : "Estimated"}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg bg-white/10 backdrop-blur-md p-3">
                      <div className="text-[11px] uppercase tracking-wide text-black">
                        Airline
                      </div>
                      <div className="mt-1 text-sm font-semibold text-black">
                        {plan.mode === "plane"
                          ? extractAirline(plan.details)
                          : "Rail operator"}
                      </div>
                    </div>
                    <div className="rounded-lg bg-white/10 backdrop-blur-md p-3">
                      <div className="text-[11px] uppercase tracking-wide text-black">
                        {plan.mode === "plane" ? "Flight time" : "Travel time"}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-black">
                        {formatDurationHours(plan.duration_hours)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-white/10 backdrop-blur-md p-3 text-right">
                      <div className="text-[11px] uppercase tracking-wide text-black">
                        Price
                      </div>
                      <div className="mt-1 text-base font-bold text-black">
                        {currency(plan.estimated_cost ?? 0)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-black">
                    {stripQuoteTag(plan.details)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-black">
              No transport plan was found for your participant in this option.
            </p>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-semibold">Restaurants</h4>
            <ul className="space-y-1 text-sm text-black">
              {(option.restaurant_recommendations ?? []).map(
                (restaurant: any) => (
                  <li key={restaurant.id || restaurant.name}>
                    {restaurant.name} ({restaurant.cuisine}) -{" "}
                    {restaurant.price_band}
                  </li>
                ),
              )}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold">Itinerary</h4>
            <ul className="space-y-1 text-sm text-black">
              {(option.itinerary_days ?? []).map((day: any) => (
                <li key={day.id || day.day_number}>
                  Day {day.day_number}: {day.title}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold">Visa summary</h4>
          <ul className="space-y-1 text-sm text-black">
            {(option.visa_assessments ?? []).map((visa: any) => (
              <li key={visa.id || visa.nationality}>
                {visa.nationality}: {visa.summary}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold">Trade-offs</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-black">
            {(option.tradeoffs ?? []).map((tradeoff: string) => (
              <li key={tradeoff}>{tradeoff}</li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
