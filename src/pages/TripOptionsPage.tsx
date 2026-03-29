import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Section } from "../components/Section";
import { Badge } from "../components/Badge";
import { useTrip, useTripOptions, useVotes, useCastVote } from "../hooks/queries";
import { currency } from "../lib/utils";
import { fetchDestinationImages } from "../services/imageService";

function formatUkDate(dateValue: string) {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  return parsed.toLocaleDateString("en-GB");
}

function parseAccommodationMeta(accommodation: any) {
  const features = Array.isArray(accommodation?.accessibility_features)
    ? accommodation.accessibility_features.map((item: unknown) => String(item))
    : [];

  const facilities: string[] = [];
  let numBeds: number | null = null;
  let location: string | null = null;

  for (const feature of features) {
    if (feature.startsWith("beds:")) {
      const value = Number(feature.slice(5));
      if (Number.isFinite(value) && value > 0) {
        numBeds = Math.round(value);
      }
      continue;
    }

    if (feature.startsWith("location:")) {
      location = feature.slice("location:".length).trim();
      continue;
    }

    facilities.push(feature);
  }

  return {
    facilities,
    numBeds,
    location
  };
}

    // Removed duplicate import of VotePanel
function TripOptionSummary({
  option,
  imageUrl,
  onClick,
  onVote,
  votes,
  participantId,
  voting,
  selectedOption,
}: {
  option: any;
  imageUrl?: string | null;
  onClick: () => void;
  onVote: (optionId: string) => void;
  votes: Array<{ participant_id: string; trip_option_id: string }>;
  participantId?: string;
  voting?: boolean;
  selectedOption?: string | null;
}) {
  const accommodation = option.accommodation_options?.[0];
  const accommodationMeta = parseAccommodationMeta(accommodation);
  const transportPlans = option.transport_plans ?? [];
  const flightCount = transportPlans.filter((plan: any) => plan.mode === "plane").length;
  const trainCount = transportPlans.filter((plan: any) => plan.mode === "train").length;
  const resolvedImageUrl = imageUrl ?? option.image_url;
  // Debug logging for image troubleshooting
  console.log('TripOptionSummary', { option, imageUrl, optionImageUrl: option.image_url, resolvedImageUrl });
  const currentVote = votes.find((vote) => vote.participant_id === participantId)?.trip_option_id;
  // Use selectedOption if set, otherwise fall back to backend vote
  const selected = selectedOption ? selectedOption === option.id : currentVote === option.id;
  // Determine button text: 'Selected' if chosen but not submitted, 'Voted' if submitted
  let buttonText = 'Vote for this option';
  if (selected) {
    if (selectedOption && selectedOption === option.id) {
      buttonText = 'Selected';
    } else if (currentVote === option.id) {
      buttonText = 'Voted';
    }
  }
  return (
    <div 
      className="cursor-pointer rounded-lg transition-all hover:shadow-md" 
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-violet-600/30 to-fuchsia-500/10 border-violet-400/40 shadow-xl backdrop-blur-lg hover:shadow-2xl transition-all duration-200">
        <div className="grid md:grid-cols-[320px_1fr]">
          <div className="relative h-56 w-full overflow-hidden md:h-full md:min-h-[220px]">
            {resolvedImageUrl ? (
              <>
                <img
                  src={resolvedImageUrl}
                  alt={option.destination}
                  className="h-full w-full object-cover rounded-2xl"
                  onError={e => {
                    console.error('Image failed to load:', resolvedImageUrl, e);
                  }}
                />
                {/* Gradient overlay temporarily removed for debugging */}
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">No image available</div>
            )}
          </div>

          <div className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">
                  Option {option.option_rank}: {option.destination}
                </h3>
              </div>
              <Badge tone="green">{option.theme.replaceAll("_", " ")}</Badge>
            </div>

            <p className="text-sm text-slate-700">{option.summary}</p>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg bg-white/10 backdrop-blur-md p-3 text-sm border border-violet-300/30">
                <div className="font-semibold">Per person</div>
                <div className="text-lg font-bold text-white">{currency(option.estimated_per_person)}</div>
              </div>
              <div className="rounded-lg bg-white/10 backdrop-blur-md p-3 text-sm border border-violet-300/30">
                <div className="font-semibold">Accommodation</div>
                <div>{accommodation?.name ?? "TBD"}</div>
                <div className="mt-1 text-xs text-slate-600">Price: {currency(accommodation?.nightly_cost ?? 0)} / night</div>
                <div className="text-xs text-slate-600">Beds: {accommodationMeta.numBeds ?? "TBD"}</div>
                <div className="text-xs text-slate-600">Location: {accommodationMeta.location ?? "Central area"}</div>
                <div className="mt-1 text-xs text-slate-500">
                  Facilities: {accommodationMeta.facilities.length > 0 ? accommodationMeta.facilities.slice(0, 4).join(", ") : "TBD"}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Transport: {flightCount} flight leg{flightCount === 1 ? "" : "s"}, {trainCount} train leg{trainCount === 1 ? "" : "s"}
            </p>

            <div className="flex gap-2 items-center mt-2">
              <button
                className={`px-4 py-2 rounded font-semibold text-white ${selected ? 'bg-green-600' : 'bg-violet-600 hover:bg-violet-700'} transition`}
                disabled={voting || !participantId}
                onClick={(e) => { e.stopPropagation(); onVote(option.id); }}
              >
                {buttonText}
              </button>
              {selected && <span className="text-xs text-green-700 font-bold">Your vote</span>}
            </div>

            <p className="text-xs text-slate-500 italic">Click to see full details →</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function TripOptionsPage() {
  const { tripId = "" } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const participantId = search.get("participantId") ?? undefined;
  const trip = useTrip(tripId);
  const options = useTripOptions(tripId);
  const votes = useVotes(tripId);
  const [fallbackImages, setFallbackImages] = useState<Record<string, string | null>>({});
  const [voteError, setVoteError] = useState<string | null>(null);
  const [voteSuccess, setVoteSuccess] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitClicked, setSubmitClicked] = useState(false);

  const castVote = useCastVote(tripId, participantId ?? "");

  useEffect(() => {
    const currentOptions = options.data ?? [];
    if (currentOptions.length === 0) {
      return;
    }

    const uniqueDestinations = Array.from(
      new Set(currentOptions.map((option: any) => option.destination).filter(Boolean))
    ) as string[];

    if (uniqueDestinations.length === 0) {
      return;
    }

    let isCancelled = false;
    fetchDestinationImages(uniqueDestinations)
      .then((imagesByDestination) => {
        if (!isCancelled) {
          setFallbackImages(imagesByDestination);
        }
      })
      .catch(() => {
        // Ignore image fallback failures to keep the page usable.
      });

    return () => {
      isCancelled = true;
    };
  }, [options.data]);

  useEffect(() => {
    if (castVote.isSuccess) {
      setVoteSuccess(true);
      setVoteError(null);
      setTimeout(() => setVoteSuccess(false), 2000);
    }
    if (castVote.isError) {
      setVoteError(castVote.error instanceof Error ? castVote.error.message : String(castVote.error));
      setVoteSuccess(false);
      // Log error for debugging
      // eslint-disable-next-line no-console
      console.error("Vote error:", castVote.error);
    }
  }, [castVote.isSuccess, castVote.isError, castVote.error]);

  const handleVote = (optionId: string) => {
    setVoteError(null);
    setVoteSuccess(false);
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setSubmitClicked(true);
    // Only cast vote if not already voted for this option
    const alreadyVoted = votes.data?.find(
      (v) => v.participant_id === participantId && v.trip_option_id === selectedOption
    );
    if (!alreadyVoted) {
      castVote.mutate(selectedOption, {
        onSuccess: () => {
          navigate(`/trip/${tripId}/dashboard${participantId ? `?participantId=${participantId}` : ""}`);
        },
        onError: () => {
          setSubmitClicked(false);
        }
      });
    } else {
      navigate(`/trip/${tripId}/dashboard${participantId ? `?participantId=${participantId}` : ""}`);
    }
  };

  const tripStart = trip.data?.start_date ?? options.data?.[0]?.start_date;
  const tripEnd = trip.data?.end_date ?? options.data?.[0]?.end_date;
  const overallDateText =
    tripStart && tripEnd
      ? `${formatUkDate(tripStart)} to ${formatUkDate(tripEnd)}`
      : "Dates not set yet";

  return (
    <div className="space-y-6">
      <Section
        title="Trip Options"
        subtitle="Choose your favorite option or go back to invite more participants"
      >
        <Card className="space-y-3">
          <div className="rounded-lg bg-ocean/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ocean">Selected trip dates</p>
            <p className="text-base font-semibold text-ink">{overallDateText}</p>
          </div>
          <p className="text-sm text-slate-600">
            Three personalized trip options have been created based on your group's preferences. Click any option to see full details.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => navigate(`/trip/${tripId}/dashboard${participantId ? `?participantId=${participantId}` : ""}`)}>
              Go to dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate(`/trip/${tripId}/dashboard${participantId ? `?participantId=${participantId}` : ""}`)}
            >
              Back
            </Button>
          </div>
        </Card>
      </Section>

      {voteError && <div className="text-red-600 font-semibold">Voting failed: {voteError}</div>}
      {voteSuccess && <div className="text-green-600 font-semibold">Vote registered!</div>}

      {options.isLoading && <p className="text-sm text-slate-600">Loading options...</p>}
      {options.error && <p className="text-sm text-red-600">{String(options.error)}</p>}

      {options.data && options.data.length > 0 ? (
        <>
          <div className="space-y-4">
            {options.data.map((option: any) => (
              <TripOptionSummary
                key={option.id}
                option={option}
                imageUrl={fallbackImages[option.destination]}
                onClick={() => navigate(`/trip/${tripId}/options/${option.id}${participantId ? `?participantId=${participantId}` : ""}`)}
                onVote={handleVote}
                votes={votes.data ?? []}
                participantId={participantId}
                voting={castVote.isPending}
                selectedOption={selectedOption}
              />
            ))}
          </div>
          {/* Show submit button if an option is selected */}
          {selectedOption && (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleSubmit}
                disabled={castVote.isPending || submitClicked}
                className="px-8 py-2 text-lg"
              >
                Submit
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <p className="text-sm text-slate-600">No options generated yet. Go back and try again.</p>
        </Card>
      )}
    </div>
  );
}
