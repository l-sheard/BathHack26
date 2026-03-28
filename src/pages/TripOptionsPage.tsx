import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Section } from "../components/Section";
import { Badge } from "../components/Badge";
import { useTrip, useTripOptions } from "../hooks/queries";
import { currency } from "../lib/utils";
import { fetchDestinationImages } from "../services/imageService";

function formatUkDate(dateValue: string) {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  return parsed.toLocaleDateString("en-GB");
}

function TripOptionSummary({
  option,
  imageUrl,
  onClick
}: {
  option: any;
  imageUrl?: string | null;
  onClick: () => void;
}) {
  const accommodation = option.accommodation_options?.[0];
  const transportPlans = option.transport_plans ?? [];
  const flightCount = transportPlans.filter((plan: any) => plan.mode === "plane").length;
  const trainCount = transportPlans.filter((plan: any) => plan.mode === "train").length;
  const resolvedImageUrl = imageUrl ?? option.image_url;
  return (
    <div 
      className="cursor-pointer rounded-lg transition-all hover:shadow-md" 
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-[320px_1fr]">
          <div className="relative h-56 w-full overflow-hidden bg-slate-200 md:h-full md:min-h-[220px]">
            {resolvedImageUrl ? (
              <>
                <img
                  src={resolvedImageUrl}
                  alt={option.destination}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">No image available</div>
            )}
          </div>

          <div className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">
                  Option {option.option_rank}: {option.destination}
                </h3>
              </div>
              <Badge tone="green">{option.theme.replaceAll("_", " ")}</Badge>
            </div>

            <p className="text-sm text-slate-700">{option.summary}</p>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3 text-sm">
                <div className="font-semibold">Per person</div>
                <div className="text-lg font-bold text-ocean">{currency(option.estimated_per_person)}</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-sm">
                <div className="font-semibold">Accommodation</div>
                <div>{accommodation?.name ?? "TBD"}</div>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Transport: {flightCount} flight leg{flightCount === 1 ? "" : "s"}, {trainCount} train leg{trainCount === 1 ? "" : "s"}
            </p>

            <p className="text-xs text-slate-500 italic">Click to see full details →</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function TripOptionsPage() {
  const { tripId = "" } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const participantId = search.get("participantId") ?? undefined;
  const trip = useTrip(tripId);
  const options = useTripOptions(tripId);
  const [fallbackImages, setFallbackImages] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const currentOptions = options.data ?? [];
    if (currentOptions.length === 0) {
      return;
    }

    const uniqueDestinations = Array.from(
      new Set(currentOptions.map((option: any) => option.destination).filter(Boolean))
    ) as string[];

    if (uniqueDestinations.length === 0) {
      return;
    }

    let isCancelled = false;
    fetchDestinationImages(uniqueDestinations)
      .then((imagesByDestination) => {
        if (!isCancelled) {
          setFallbackImages(imagesByDestination);
        }
      })
      .catch(() => {
        // Ignore image fallback failures to keep the page usable.
      });

    return () => {
      isCancelled = true;
    };
  }, [options.data]);

  const tripStart = trip.data?.start_date ?? options.data?.[0]?.start_date;
  const tripEnd = trip.data?.end_date ?? options.data?.[0]?.end_date;
  const overallDateText =
    tripStart && tripEnd
      ? `${formatUkDate(tripStart)} to ${formatUkDate(tripEnd)}`
      : "Dates not set yet";

  return (
    <div className="space-y-6">
      <Section
        title="Your AI-Generated Trip Options"
        subtitle="Choose your favorite option or go back to invite more participants"
      >
        <Card className="space-y-3">
          <div className="rounded-lg bg-ocean/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ocean">Selected trip dates</p>
            <p className="text-base font-semibold text-ink">{overallDateText}</p>
          </div>
          <p className="text-sm text-slate-600">
            Three personalized trip options have been created based on your group's preferences. Click any option to see full details.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => navigate(`/trip/${tripId}/dashboard${participantId ? `?participantId=${participantId}` : ""}`)}>
              Go to dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate(`/trip/${tripId}/dashboard${participantId ? `?participantId=${participantId}` : ""}`)}
            >
              Back
            </Button>
          </div>
        </Card>
      </Section>

      {options.isLoading && <p className="text-sm text-slate-600">Loading options...</p>}
      {options.error && <p className="text-sm text-red-600">{String(options.error)}</p>}

      {options.data && options.data.length > 0 ? (
        <div className="space-y-4">
          {options.data.map((option: any) => (
            <TripOptionSummary
              key={option.id}
              option={option}
              imageUrl={fallbackImages[option.destination]}
              onClick={() => navigate(`/trip/${tripId}/options/${option.id}${participantId ? `?participantId=${participantId}` : ""}`)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-slate-600">No options generated yet. Go back and try again.</p>
        </Card>
      )}
    </div>
  );
}
