import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { useCreateTrip } from "../hooks/queries";

export function CreateTripPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const createTrip = useCreateTrip();
  const navigate = useNavigate();

  return (
    <Card className="mx-auto max-w-2xl space-y-4">
      <h1 className="font-display text-2xl font-bold">Create Trip</h1>
      <p className="text-sm text-slate-600">Set up your trip and share a link for others to join.</p>

      <label className="block space-y-1">
        <span className="text-sm font-semibold">Trip name</span>
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Summer Escape" />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold">Description</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="A 5-day trip with friends"
          className="min-h-20 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm font-semibold">Optional start date</span>
          <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-semibold">Optional end date</span>
          <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </label>
      </div>

      <Button
        disabled={!name.trim() || createTrip.isPending}
        onClick={async () => {
          const trip = await createTrip.mutateAsync({
            name,
            description,
            start_date: startDate || undefined,
            end_date: endDate || undefined
          });
          navigate(`/trip/${trip.id}/dashboard`);
        }}
      >
        {createTrip.isPending ? "Creating..." : "Create trip"}
      </Button>

      {createTrip.error ? <p className="text-sm text-red-600">{String(createTrip.error)}</p> : null}
    </Card>
  );
}
