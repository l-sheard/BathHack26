import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";

export function LandingPage() {
  const navigate = useNavigate();
  const [joinTripId, setJoinTripId] = useState("");
  const [joinCode, setJoinCode] = useState("");

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
          <Button
            variant="ghost"
            className="px-6 py-3 text-base"
            onClick={() => {
              const tripId = joinTripId.trim();
              const code = joinCode.trim();
              if (!tripId || !code) {
                return;
              }
              navigate(`/trip/${tripId}/join?code=${encodeURIComponent(code)}`);
            }}
            disabled={!joinTripId.trim() || !joinCode.trim()}
          >
            Join a Trip
          </Button>
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

        <div className="space-y-2 border-t border-slate-200 pt-3">
          <h3 className="font-semibold">Join an existing trip</h3>
          <Input
            value={joinTripId}
            onChange={(event) => setJoinTripId(event.target.value)}
            placeholder="Trip ID"
          />
          <Input
            value={joinCode}
            onChange={(event) => setJoinCode(event.target.value)}
            placeholder="Share code"
          />
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate(`/trip/${joinTripId.trim()}/join?code=${encodeURIComponent(joinCode.trim())}`)}
            disabled={!joinTripId.trim() || !joinCode.trim()}
          >
            Continue to join
          </Button>
        </div>
      </Card>
    </div>
  );
}
