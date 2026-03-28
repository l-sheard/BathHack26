import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";

export function LandingPage() {
  return (
    <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
      <section className="space-y-5">
        <p className="inline-flex rounded-full bg-ocean/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ocean">
          Hackathon MVP
        </p>
        <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
          Plan a group trip without the group chat chaos.
        </h1>
        <p className="max-w-xl text-slate-700">
          Create a trip, collect preferences, generate 3 realistic options, vote together, and track booking progress in one place.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/create">
            <Button className="px-6 py-3 text-base">Create a Trip</Button>
          </Link>
        </div>
      </section>
      <Card className="space-y-3">
        <h2 className="font-display text-xl font-bold">What you can do in minutes</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Share one join link with all participants</li>
          <li>Collect travel, accessibility, and dietary constraints</li>
          <li>Auto-generate 3 trip options with cost and itinerary</li>
          <li>Vote and track transport/accommodation/visa/insurance bookings</li>
        </ul>
      </Card>
    </div>
  );
}
