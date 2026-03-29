import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
// import { signInWithEmail } from "../lib/signInWithEmail";
import { Card } from "../components/Card";
import { Input } from "../components/Input";

export function LandingPage() {
  const navigate = useNavigate();
  const [joinTripId, setJoinTripId] = useState("");
  const [joinCode, setJoinCode] = useState("");


  return (
    <div className="relative isolate grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">

      <div className="pointer-events-none fixed right-0 bottom-[-120px] z-0 hidden h-[360px] w-[360px] md:block lg:h-[420px] lg:w-[420px]">
        <img
          src="/earth-cartoon.png"
          alt="Earth"
          className="absolute inset-0 h-full w-full rounded-full object-contain"
          style={{ filter: 'brightness(1.08) contrast(1.12) saturate(1.18)' }}
        />
        {/* Glow overlay that extends outside the earth */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[180%] w-[180%] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(59,130,246,0.32)_0%,rgba(34,211,238,0.18)_60%,rgba(168,85,247,0.12)_80%,transparent_100%)] blur-[48px]" />
      </div>

      <section className="relative z-10 space-y-5">
        {/* Hackathon MVP badge removed */}
        <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl text-blue-600">
          Plan a group trip without the group chat chaos.
        </h1>
        <p className="max-w-xl text-slate-600">
          Create a trip, collect preferences, generate 3 realistic options, vote together, and track booking progress in one place.
        </p>
      </section>
      <Card className="relative z-10 space-y-3 border-violet-400/35 shadow-[0_25px_60px_rgba(124,58,237,0.35)]">
        <div className="pointer-events-none absolute -top-16 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-violet-500/30 blur-3xl" />
        <h2 className="font-display text-xl font-bold">Create or join a trip</h2>
        <Button className="w-full" onClick={() => navigate('/create')}>
          Create Trip
        </Button>
        <div className="space-y-2 border-t border-violet-400/25 pt-3">
          <h3 className="font-semibold">Join a Trip</h3>
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
