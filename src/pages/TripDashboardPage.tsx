import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Modal } from "../components/Modal";
import { Section } from "../components/Section";
import { useTrip, useTripParticipants } from "../hooks/queries";
import { makeShareLink } from "../lib/utils";

export function TripDashboardPage() {
  const { tripId = "" } = useParams();
  const navigate = useNavigate();
  const [isShareOpen, setIsShareOpen] = useState(false);

  const trip = useTrip(tripId);
  const participants = useTripParticipants(tripId);

  if (trip.isLoading) {
    return <p className="text-sm text-slate-600">Loading dashboard...</p>;
  }

  if (trip.error) {
    return <p className="text-sm text-red-600">{String(trip.error)}</p>;
  }

  return (
    <div className="space-y-6">
      <Section title={trip.data?.name ?? "Trip dashboard"} subtitle={trip.data?.description ?? "Manage your group trip"}>
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              {participants.data?.length ?? 0} participant(s) joined
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => setIsShareOpen(true)}>
                Share link
              </Button>
              <Button onClick={() => navigate(`/trip/${tripId}/generate`)}>
                Generate trip options
              </Button>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Participants</h3>
            {(participants.data?.length ?? 0) === 0 ? (
              <p className="text-sm text-slate-600">No participants yet. Share the link to invite others.</p>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {(participants.data ?? []).map((participant: any) => (
                  <div key={participant.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                    <div className="font-semibold">{participant.name}</div>
                    <div className="text-slate-500">{participant.email ?? "No email"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </Section>

      <Modal open={isShareOpen} onClose={() => setIsShareOpen(false)}>
        <h3 className="font-display text-lg font-bold">Share this join link</h3>
        <p className="mt-2 break-all rounded-lg bg-slate-100 p-2 text-sm">
          {makeShareLink(tripId, trip.data?.share_code ?? "")}
        </p>
        <div className="mt-4">
          <Button
            onClick={async () => {
              await navigator.clipboard.writeText(makeShareLink(tripId, trip.data?.share_code ?? ""));
              setIsShareOpen(false);
            }}
          >
            Copy link
          </Button>
        </div>
      </Modal>
    </div>
  );
}
