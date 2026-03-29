import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Modal } from "../components/Modal";
import { Section } from "../components/Section";
import { useTrip, useTripParticipants, useTripOptions, useVotes } from "../hooks/queries";
import { makeShareLink } from "../lib/utils";



export function TripDashboardPage() {
  const { tripId = "" } = useParams();
  const [search] = useSearchParams();
  const participantId = search.get("participantId") ?? undefined;
  const navigate = useNavigate();
  const [isShareOpen, setIsShareOpen] = useState(false);

  const trip = useTrip(tripId);
  const participants = useTripParticipants(tripId);
  const options = useTripOptions(tripId);
  const votes = useVotes(tripId); // <-- Add this line

  if (trip.isLoading) {
    return <p className="text-sm text-slate-600">Loading dashboard...</p>;
  }

  if (trip.error) {
    return <p className="text-sm text-red-600">{String(trip.error)}</p>;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden py-12">
      {/* Big purple glow background across the whole page */}
      <div className="pointer-events-none fixed z-0 h-[900px] w-[900px] right-[-300px] bottom-[-300px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.32)_0%,rgba(124,58,237,0.18)_60%,rgba(59,130,246,0.12)_80%,transparent_100%)] blur-[140px]" />
      <div className="relative mx-auto max-w-2xl space-y-6">
        <Card className="space-y-4 bg-white/15 backdrop-blur-md shadow-lg">
          <h1 className="text-3xl font-extrabold tracking-tight text-black mb-4 text-center">
            {trip.data?.title || trip.data?.name || "Trip dashboard"}
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              ← Back to all trips
            </Button>
            <div className="text-sm text-slate-600">
              {participants.data?.length ?? 0} participant(s) joined
            </div>
            <div className="flex flex-wrap gap-2">
              {participantId ? (
                <Button variant="ghost" onClick={() => navigate(`/trip/${tripId}/preferences/${participantId}`)}>
                  Fill out my preferences
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => navigate(`/trip/${tripId}/join`)}>
                  Join trip
                </Button>
              )}
              <Button variant="ghost" onClick={() => setIsShareOpen(true)}>
                Share link
              </Button>
              {options.data && options.data.length > 0 ? (
                <Button onClick={() => navigate(`/trip/${tripId}/options${participantId ? `?participantId=${participantId}` : ""}`)}>
                  View trip options
                </Button>
              ) : (
                (() => {
                  // Check if at least one participant has filled preferences
                  const hasPreferences = (participants.data ?? []).some(
                    (p: any) => p.participant_preferences && p.participant_preferences.id
                  );
                  return (
                    <>
                      <Button
                        onClick={() => navigate(`/trip/${tripId}/generation${participantId ? `?participantId=${participantId}` : ""}`)}
                        disabled={!hasPreferences}
                        title={!hasPreferences ? "At least one participant must fill out the trip preference form before generating options." : undefined}
                      >
                        Generate trip options
                      </Button>
                      {!hasPreferences && (
                        <div className="mt-2 text-xs text-red-600">
                          At least one participant must fill out the trip preference form before generating trip options.
                        </div>
                      )}
                    </>
                  );
                })()
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Participants</h3>
            {(participants.data?.length ?? 0) === 0 ? (
              <p className="text-sm text-slate-600">No participants yet. Share the link to invite others.</p>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {(participants.data ?? []).map((participant: any) => {
                  // Check if participant has voted using the votes table
                  const hasVoted = (votes.data ?? []).some((vote: any) => vote.participant_id === participant.id);
                  return (
                    <div key={participant.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                      <div className="font-semibold">{participant.name}</div>
                      <div className="text-slate-500">{participant.email ?? "No email"}</div>
                      <div className={`mt-2 text-xs font-semibold ${hasVoted ? 'text-green-700' : 'text-red-600'}`}>
                        {hasVoted ? 'Voted' : 'Yet to vote'}
                      </div>
                      <Link
                        to={`/trip/${tripId}/preferences/${participant.id}`}
                        className="mt-2 inline-block text-xs font-semibold text-ocean hover:underline"
                      >
                        Edit preferences
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          </Card>

      <Modal open={isShareOpen} onClose={() => setIsShareOpen(false)}>
        <h3 className="font-display text-lg font-bold text-gray-800">Share this join link</h3>
        <p className="mt-2 break-all rounded-lg bg-slate-100 p-2 text-sm text-gray-900">
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
    </div>
  );
}
