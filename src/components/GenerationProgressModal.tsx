import type { PropsWithChildren } from "react";
import { cn } from "../lib/utils";
import { Modal } from "./Modal";

type Step = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "complete" | "error";
};

type Props = {
  open: boolean;
  steps: Step[];
  currentStepId: string | null;
  error?: string;
  onClose: () => void;
};

export function GenerationProgressModal({
  open,
  steps,
  currentStepId,
  error,
  onClose,
}: PropsWithChildren<Props>) {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold">
            Generating trip options
          </h2>
          <p className="text-sm text-black mt-1">
            AI is planning the perfect trip for your group...
          </p>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => {
            const isComplete = step.status === "complete";
            const isActive = step.id === currentStepId;
            const isPending = step.status === "pending";

            return (
              <div key={step.id} className="relative">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm",
                        isComplete && "bg-emerald-500 text-black",
                        isActive && "bg-ocean text-black ring-2 ring-ocean/30",
                        isPending && "bg-slate-200 text-black",
                        step.status === "error" && "bg-red-500 text-black",
                      )}
                    >
                      {isComplete ? "✓" : isActive ? "●" : index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          "w-0.5 h-12 mt-2",
                          isComplete ? "bg-emerald-500" : "bg-slate-200",
                        )}
                      />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3
                      className={cn(
                        "font-semibold text-sm",
                        isActive && "text-ocean",
                        isComplete && "text-emerald-700",
                        isPending && "text-black",
                        step.status === "error" && "text-red-600",
                      )}
                    >
                      {step.title}
                    </h3>
                    <p className="text-xs text-black mt-0.5">
                      {step.description}
                    </p>
                    {isActive && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="inline-flex items-center gap-1">
                          <span className="inline-block w-2 h-2 bg-ocean rounded-full animate-pulse" />
                          <span
                            className="inline-block w-2 h-2 bg-ocean rounded-full animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          />
                          <span
                            className="inline-block w-2 h-2 bg-ocean rounded-full animate-pulse"
                            style={{ animationDelay: "0.4s" }}
                          />
                        </div>
                        <span className="text-xs text-ocean font-medium">
                          In progress
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!error && steps.every((s) => s.status !== "pending") && (
          <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-200">
            <p className="text-sm text-emerald-700">
              ✓ Trip options generated! You can now close this and vote on your
              preferred option.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
