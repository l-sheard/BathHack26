import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { useJoinTrip, useTrip } from "../hooks/queries";

export function JoinTripPage() {
  const { tripId = "" } = useParams();
  const [search] = useSearchParams();
  const code = search.get("code") ?? "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const trip = useTrip(tripId);
  const join = useJoinTrip();

  return (
    <Card className="mx-auto max-w-xl space-y-4">
      <h1 className="font-display text-2xl font-bold">Join trip</h1>
      <p className="text-sm text-slate-600">{trip.data?.name ?? "Loading trip..."}</p>

      <label className="block space-y-1">
        <span className="text-sm font-semibold">Your name</span>
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex" />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold">Email (optional)</span>
        <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="alex@email.com" />
      </label>

      <Button
        disabled={!name.trim() || join.isPending || !code}
        onClick={async () => {
          const participant = await join.mutateAsync({ tripId, name, email, shareCode: code });
          navigate(`/trip/${tripId}/preferences/${participant.id}`);
        }}
      >
        {join.isPending ? "Joining..." : "Join trip"}
      </Button>

      {!code ? <p className="text-sm text-red-600">Missing share code in URL.</p> : null}
      {join.error ? <p className="text-sm text-red-600">{String(join.error)}</p> : null}
    </Card>
  );
}
