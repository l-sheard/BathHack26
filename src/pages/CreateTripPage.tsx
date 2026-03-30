import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { useCreateTrip, useJoinTrip } from "../hooks/queries";

export function CreateTripPage() {
  const { user } = useUser();
  const [creatorName, setCreatorName] = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createTrip = useCreateTrip();
  const joinTrip = useJoinTrip();
  const navigate = useNavigate();

  return (
    <Card className="mx-auto max-w-2xl space-y-4 text-black rounded-3xl">
      <h1 className="font-display text-2xl font-bold">Create Trip</h1>
      <p className="text-sm text-black">
        Set up your trip and share a link for others to join.
      </p>

      <label className="block space-y-1">
        <span className="text-sm font-semibold">Trip name</span>
        <Input
          className="text-black"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Summer Escape"
        />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm font-semibold">Your name</span>
          <Input
            className="text-black"
            value={creatorName}
            onChange={(event) => setCreatorName(event.target.value)}
            placeholder="Alex"
          />
        </label>

        {user ? (
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Your email</span>
            <Input
              value={user.email}
              readOnly
              disabled
              className="bg-slate-100 text-black cursor-not-allowed"
            />
          </label>
        ) : (
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Your email (optional)</span>
            <Input
              className="text-black"
              value={creatorEmail}
              onChange={(event) => setCreatorEmail(event.target.value)}
              placeholder="alex@email.com"
            />
          </label>
        )}
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-semibold">Description</span>
        <textarea
          className="text-black !text-black"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="A 5-day trip with friends"
          className="min-h-20 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <Button
        disabled={
          !name.trim() ||
          !creatorName.trim() ||
          createTrip.isPending ||
          joinTrip.isPending
        }
        onClick={async () => {
          if (!user) {
            alert("You must be logged in to create a trip.");
            return;
          }
          const trip = await createTrip.mutateAsync({
            name,
            description,
            user_id: user.id,
          });

          const participant = await joinTrip.mutateAsync({
            tripId: trip.id,
            name: creatorName,
            email: user ? user.email : creatorEmail,
            shareCode: trip.share_code,
            user_id: user.id,
          });

          navigate(
            `/trip/${trip.id}/dashboard?participantId=${participant.id}`,
          );
        }}
      >
        {createTrip.isPending || joinTrip.isPending
          ? "Creating..."
          : "Create trip"}
      </Button>

      {createTrip.error ? (
        <p className="text-sm text-red-600">{String(createTrip.error)}</p>
      ) : null}
      {joinTrip.error ? (
        <p className="text-sm text-red-600">{String(joinTrip.error)}</p>
      ) : null}
    </Card>
  );
}
