import { Button } from "./Button";
import { Card } from "./Card";

type Props = {
  options: Array<{ id: string; option_rank: number; destination: string }>;
  votes: Array<{ participant_id: string; trip_option_id: string }>;
  participantId?: string;
  onVote: (optionId: string) => void;
  loading?: boolean;
};

export function VotePanel({ options, votes, participantId, onVote, loading }: Props) {
  const voteCounts = options.map((option) => ({
    optionId: option.id,
    count: votes.filter((vote) => vote.trip_option_id === option.id).length
  }));

  const currentVote = votes.find((vote) => vote.participant_id === participantId)?.trip_option_id;

  return (
    <Card className="space-y-3">
      <h3 className="font-display text-lg font-bold">Vote on your preferred option</h3>
      <div className="space-y-2">
        {options.map((option) => {
          const count = voteCounts.find((vote) => vote.optionId === option.id)?.count ?? 0;
          const selected = currentVote === option.id;
          return (
            <div key={option.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <div className="font-semibold">
                  Option {option.option_rank} - {option.destination}
                </div>
                <div className="text-xs text-slate-500">{count} vote(s)</div>
              </div>
              <Button
                variant={selected ? "secondary" : "primary"}
                disabled={loading || !participantId}
                onClick={() => {
                  try {
                    onVote(option.id);
                  } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error("VotePanel vote error:", err);
                  }
                }}
              >
                {selected ? "Selected" : "Vote"}
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
