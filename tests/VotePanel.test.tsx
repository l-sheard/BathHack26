import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VotePanel } from "../src/components/VotePanel";

describe("VotePanel", () => {
  it("calls onVote when user clicks vote", () => {
    const onVote = vi.fn();

    render(
      <VotePanel
        options={[
          { id: "o1", option_rank: 1, destination: "Lisbon" },
          { id: "o2", option_rank: 2, destination: "Amsterdam" },
        ]}
        votes={[]}
        participantId="p1"
        onVote={onVote}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Vote" })[0]);
    expect(onVote).toHaveBeenCalledWith("o1");
  });
});
