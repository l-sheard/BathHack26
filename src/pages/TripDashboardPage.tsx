import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { BookingChecklist } from "../components/BookingChecklist";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Modal } from "../components/Modal";
import { ProgressTracker } from "../components/ProgressTracker";
import { Section } from "../components/Section";
import { TripOptionCard } from "../components/TripOptionCard";
import { VotePanel } from "../components/VotePanel";
import {
  useBookingProgress,
  useCastVote,
  useGenerateOptions,
  useTrip,
  useTripOptions,
  useTripParticipants,
  useVotes,
  useSaveBookingProgress
} from "../hooks/queries";
import { makeShareLink } from "../lib/utils";

export function TripDashboardPage() {
  const { tripId = "" } = useParams();
  const [search] = useSearchParams();
  const participantId = search.get("participantId") ?? undefined;
  const [isShareOpen, setIsShareOpen] = useState(false);

  const trip = useTrip(tripId);
  const participants = useTripParticipants(tripId);
  const options = useTripOptions(tripId);
  const votes = useVotes(tripId);
  const bookingProgress = useBookingProgress(tripId);

  const generateOptions = useGenerateOptions(tripId);
  const voteMutation = useCastVote(tripId, participantId ?? "");
  const bookingMutation = useSaveBookingProgress(tripId, participantId ?? "");

  const progressItems = useMemo(() => {
    const rows = participants.data ?? [];
    return rows.map((row: any) => ({
      label: row.name,
      done: (row.participant_preferences?.length ?? 0) > 0
    }));
  }, [participants.data]);

  const selectedBooking = (bookingProgress.data ?? []).find((entry: any) => entry.participant_id === participantId);

  const voteSummary = useMemo(() => {
    const allVotes = votes.data ?? [];
    const allOptions = options.data ?? [];
    return allOptions.map((option: any) => ({
      id: option.id,
      destination: option.destination,
      count: allVotes.filter((vote: any) => vote.trip_option_id === option.id).length
    }));
  }, [votes.data, options.data]);

  const bookingSummary = useMemo(() => {
    const entries = bookingProgress.data ?? [];
    const total = entries.length || 1;
    return {
      transport: entries.filter((entry: any) => entry.transport_booked).length,
      accommodation: entries.filter((entry: any) => entry.accommodation_booked).length,
      visa: entries.filter((entry: any) => entry.visa_arranged).length,
      insurance: entries.filter((entry: any) => entry.insurance_arranged).length,
      total
    };
  }, [bookingProgress.data]);

  if (trip.isLoading) {
    return <p className="text-sm text-slate-600">Loading dashboard...</p>;
  }

  if (trip.error) {
    return <p className="text-sm text-red-600">{String(trip.error)}</p>;
  }

  return (
    <div className="space-y-6">
      <Section title={trip.data?.name ?? "Trip dashboard"} subtitle={trip.data?.description ?? "Manage your group flow"}>
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              {participants.data?.length ?? 0} participant(s) · {progressItems.filter((item) => item.done).length} completed forms
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => setIsShareOpen(true)}>
                Share link
              </Button>
              <Button disabled={generateOptions.isPending} onClick={() => generateOptions.mutate()}>
                {generateOptions.isPending ? "Generating options..." : "Generate trip options"}
              </Button>
            </div>
          </div>

          <ProgressTracker items={progressItems} />

          <div className="grid gap-3 md:grid-cols-2">
            <Card className="space-y-2 bg-slate-50 shadow-none">
              <h3 className="font-semibold">Vote summary</h3>
              {voteSummary.length === 0 ? (
                <p className="text-sm text-slate-500">No options yet.</p>
              ) : (
                voteSummary.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>{item.destination}</span>
                    <span>{item.count} vote(s)</span>
                  </div>
                ))
              )}
            </Card>

            <Card className="space-y-2 bg-slate-50 shadow-none">
              <h3 className="font-semibold">Booking progress summary</h3>
              <div className="text-sm text-slate-700">Transport: {bookingSummary.transport}/{bookingSummary.total}</div>
              <div className="text-sm text-slate-700">Accommodation: {bookingSummary.accommodation}/{bookingSummary.total}</div>
              <div className="text-sm text-slate-700">Visa: {bookingSummary.visa}/{bookingSummary.total}</div>
              <div className="text-sm text-slate-700">Insurance: {bookingSummary.insurance}/{bookingSummary.total}</div>
            </Card>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Participants</h3>
            <div className="grid gap-2 md:grid-cols-2">
              {(participants.data ?? []).map((participant: any) => (
                <div key={participant.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                  <div className="font-semibold">{participant.name}</div>
                  <div className="text-slate-500">{participant.email ?? "No email"}</div>
                  <div className="mt-2">
                    <Link to={`/trip/${tripId}/preferences/${participant.id}`} className="text-ocean hover:underline">
                      Edit preferences
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Section>

      <Section title="Trip options" subtitle="Three generated options: cheapest, best match, and most sustainable.">
        {(options.data?.length ?? 0) === 0 ? (
          <Card>
            <p className="text-sm text-slate-600">No options yet. Generate options from the dashboard actions.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {(options.data ?? []).map((option: any) => (
              <TripOptionCard key={option.id} option={option} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Voting">
        <VotePanel
          options={(options.data ?? []).map((option: any) => ({
            id: option.id,
            option_rank: option.option_rank,
            destination: option.destination
          }))}
          votes={(votes.data ?? []) as any[]}
          participantId={participantId}
          loading={voteMutation.isPending}
          onVote={(optionId) => voteMutation.mutate(optionId)}
        />
      </Section>

      <Section title="Booking progress">
        <BookingChecklist
          value={selectedBooking}
          loading={bookingMutation.isPending}
          onSave={(payload) => {
            if (!participantId) return;
            bookingMutation.mutate(payload);
          }}
        />
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
