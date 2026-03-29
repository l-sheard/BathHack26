import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Section } from "../components/Section";
import { Badge } from "../components/Badge";
import { useTrip, useTripOptions } from "../hooks/queries";
import { currency } from "../lib/utils";

function formatUkDate(dateValue: string) {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }
  return parsed.toLocaleDateString("en-GB");
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

function TripOptionSummary({
  option,
  imageUrl,
  onClick,
}: {
  option: any;
  imageUrl?: string | null;
  onClick: () => void;
}) {
  const accommodation = option.accommodation_options?.[0];
  const accommodationMeta = parseAccommodationMeta(accommodation);
  const transportPlans = option.transport_plans ?? [];
  const flightCount = transportPlans.filter(
    (plan: any) => plan.mode === "plane",
  ).length;
  const trainCount = transportPlans.filter(
    (plan: any) => plan.mode === "train",
  ).length;
  const resolvedImageUrl = imageUrl ?? option.image_url;

  return (
    <div
      className="cursor-pointer rounded-lg transition-all hover:shadow-md"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
    >
      <Card className="overflow-hidden border-violet-400/40 bg-gradient-to-br from-violet-600/30 to-fuchsia-500/10 shadow-xl backdrop-blur-lg transition-all duration-200 hover:shadow-2xl">
        <div className="grid md:grid-cols-[320px_1fr]">
          <div className="relative h-56 w-full overflow-hidden md:h-full md:min-h-[220px]">
            {resolvedImageUrl ? (
              <img
                src={resolvedImageUrl}
                alt={option.destination}
                className="h-full w-full rounded-2xl object-cover"
                onError={(e) => {
                  console.error("Image failed to load:", resolvedImageUrl, e);
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No image available
              </div>
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
              <div className="rounded-lg border border-violet-300/30 bg-white/10 p-3 text-sm backdrop-blur-md">
                <div className="font-semibold">Per person</div>
                <div className="text-lg font-bold text-white">
                  {currency(option.estimated_per_person)}
                </div>
              </div>

              <div className="rounded-lg border border-violet-300/30 bg-white/10 p-3 text-sm backdrop-blur-md">
                <div className="font-semibold">Accommodation</div>
                <div>{accommodation?.name ?? "TBD"}</div>
                <div className="mt-1 text-xs text-slate-600">
                  Price: {currency(accommodation?.nightly_cost ?? 0)} / night
                </div>
                <div className="text-xs text-slate-600">
                  Beds: {accommodationMeta.numBeds ?? "TBD"}
                </div>
                <div className="text-xs text-slate-600">
                  Location: {accommodationMeta.location ?? "Central area"}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Facilities:{" "}
                  {accommodationMeta.facilities.length > 0
                    ? accommodationMeta.facilities.slice(0, 4).join(", ")
                    : "TBD"}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Transport: {flightCount} flight leg{flightCount === 1 ? "" : "s"},{" "}
              {trainCount} train leg{trainCount === 1 ? "" : "s"}
            </p>

            <p className="text-xs italic text-slate-500">
              Click to see full details →
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function TripOptionsPage() {
  const navigate = useNavigate();
  const { tripId } = useParams<{ tripId: string }>();
  const [searchParams] = useSearchParams();

  const trip = useTrip(tripId || "");
  const options = useTripOptions(tripId || "");

  const fallbackImages: Record<string, string> = {
    Paris: "/paris.jpg",
    London: "/london.jpg",
    Rome: "/rome.jpg",
  };

  const participantId = searchParams.get("participantId");
  const participantQuery = participantId
    ? `?participantId=${participantId}`
    : "";

  const tripStart = trip.data?.start_date ?? options.data?.[0]?.start_date;
  const tripEnd = trip.data?.end_date ?? options.data?.[0]?.end_date;

  const overallDateText =
    tripStart && tripEnd
      ? `${formatUkDate(tripStart)} to ${formatUkDate(tripEnd)}`
      : "Dates not set yet";

  return (
    <div className="space-y-6">
      <Section
        title="Trip Options"
        subtitle="Choose your favorite option or go back to invite more participants"
      >
        <Card className="space-y-3">
          <div className="rounded-lg bg-ocean/10 p-3">
            <p className="text-ocean text-xs font-semibold uppercase tracking-wide">
              Selected trip dates
            </p>
            <p className="text-base font-semibold text-ink">
              {overallDateText}
            </p>
          </div>

          <p className="text-sm text-slate-600">
            Three personalized trip options have been created based on your
            group's preferences. Click any option to see full details.
          </p>

          <div className="flex gap-2">
            <Button
              onClick={() =>
                navigate(`/trip/${tripId}/dashboard${participantQuery}`)
              }
            >
              Go to dashboard
            </Button>

            <Button
              variant="ghost"
              onClick={() =>
                navigate(`/trip/${tripId}/dashboard${participantQuery}`)
              }
            >
              Back
            </Button>
          </div>
        </Card>
      </Section>

      {options.isLoading && (
        <p className="text-sm text-slate-600">Loading options...</p>
      )}

      {options.error && (
        <p className="text-sm text-red-600">{String(options.error)}</p>
      )}

      {options.data && options.data.length > 0 ? (
        <div className="space-y-4">
          {options.data.map((option: any) => (
            <TripOptionSummary
              key={option.id}
              option={option}
              imageUrl={fallbackImages[option.destination]}
              onClick={() =>
                navigate(
                  `/trip/${tripId}/options/${option.id}${participantQuery}`,
                )
              }
            />
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-slate-600">
            No options generated yet. Go back and try again.
          </p>
        </Card>
      )}
    </div>
  );
}
