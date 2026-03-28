import { currency } from "../lib/utils";
import { Badge } from "./Badge";
import { Card } from "./Card";

type Props = {
  option: any;
};

export function TripOptionCard({ option }: Props) {
  const accommodation = option.accommodation_options?.[0];
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-bold text-ink">
            Option {option.option_rank}: {option.destination}
          </h3>
          <p className="text-sm text-slate-600">
            {option.start_date} to {option.end_date}
          </p>
        </div>
        <Badge tone="green">{option.theme.replaceAll("_", " ")}</Badge>
      </div>

      <p className="text-sm text-slate-700">{option.summary}</p>
      <p className="text-xs text-slate-500">{option.rationale}</p>

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
          <h4 className="mb-1 text-sm font-semibold">Restaurants</h4>
          <ul className="space-y-1 text-sm text-slate-700">
            {(option.restaurant_recommendations ?? []).slice(0, 3).map((restaurant: any) => (
              <li key={restaurant.id || restaurant.name}>
                {restaurant.name} ({restaurant.cuisine}) - {restaurant.price_band}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-1 text-sm font-semibold">Itinerary preview</h4>
          <ul className="space-y-1 text-sm text-slate-700">
            {(option.itinerary_days ?? []).slice(0, 3).map((day: any) => (
              <li key={day.id || day.day_number}>
                Day {day.day_number}: {day.title}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h4 className="mb-1 text-sm font-semibold">Visa summary</h4>
        <ul className="text-sm text-slate-700">
          {(option.visa_assessments ?? []).map((visa: any) => (
            <li key={visa.id || visa.nationality}>
              {visa.nationality}: {visa.summary}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="mb-1 text-sm font-semibold">Trade-offs</h4>
        <ul className="list-disc pl-5 text-sm text-slate-700">
          {(option.tradeoffs ?? []).map((tradeoff: string) => (
            <li key={tradeoff}>{tradeoff}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
