import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Section } from "../components/Section";
import { useTripOptions } from "../hooks/queries";
import { currency } from "../lib/utils";
import { fetchDestinationImages } from "../services/imageService";

export function TripOptionDetailPage() {
  const { tripId = "", optionId = "" } = useParams();
  const navigate = useNavigate();
  const options = useTripOptions(tripId);
  const option = options.data?.find((item: any) => item.id === optionId);
  const accommodation = option?.accommodation_options?.[0];

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
    return <p className="text-sm text-slate-600">Loading trip option...</p>;
  }

  if (options.error) {
    return <p className="text-sm text-red-600">{String(options.error)}</p>;
  }

  if (!option) {
    return (
      <Card className="space-y-3">
        <p className="text-sm text-slate-600">Trip option not found.</p>
        <Button onClick={() => navigate(`/trip/${tripId}/options`)}>Back to options</Button>
      </Card>
    );
  }

  const resolvedImageUrl = option.image_url ?? fallbackImage;

  return (
    <div className="space-y-6">
      <Section
        title={`Option ${option.option_rank}: ${option.destination}`}
        subtitle="Full option details"
      >
        <Card className="space-y-3">
          <div className="flex gap-2">
            <Button onClick={() => navigate(`/trip/${tripId}/options`)}>Back to options</Button>
            <Button variant="ghost" onClick={() => navigate(`/trip/${tripId}/dashboard`)}>
              Go to dashboard
            </Button>
          </div>
        </Card>
      </Section>

      <Card className="space-y-6 bg-white">
        {resolvedImageUrl && (
          <div className="relative h-72 w-full overflow-hidden rounded-lg bg-slate-200">
            <img
              src={resolvedImageUrl}
              alt={option.destination}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">
                Option {option.option_rank}: {option.destination}
              </h2>
            </div>
            <Badge tone="green">{option.theme.replaceAll("_", " ")}</Badge>
          </div>

          <p className="mt-3 text-sm text-slate-700">{option.summary}</p>
          <p className="mt-2 text-xs text-slate-500">{option.rationale}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <div className="font-semibold">Estimated cost</div>
            <div>Total: {currency(option.estimated_total)}</div>
            <div>Per person: {currency(option.estimated_per_person)}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <div className="font-semibold">Accommodation</div>
            <div>{accommodation?.name ?? "TBD"}</div>
            <div className="text-xs text-slate-500">{accommodation?.description}</div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-semibold">Restaurants</h4>
            <ul className="space-y-1 text-sm text-slate-700">
              {(option.restaurant_recommendations ?? []).map((restaurant: any) => (
                <li key={restaurant.id || restaurant.name}>
                  {restaurant.name} ({restaurant.cuisine}) - {restaurant.price_band}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold">Itinerary</h4>
            <ul className="space-y-1 text-sm text-slate-700">
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
          <ul className="space-y-1 text-sm text-slate-700">
            {(option.visa_assessments ?? []).map((visa: any) => (
              <li key={visa.id || visa.nationality}>
                {visa.nationality}: {visa.summary}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold">Trade-offs</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
            {(option.tradeoffs ?? []).map((tradeoff: string) => (
              <li key={tradeoff}>{tradeoff}</li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
