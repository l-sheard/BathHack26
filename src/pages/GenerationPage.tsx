import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Section } from "../components/Section";
import { useGenerateOptions } from "../hooks/queries";

const GENERATION_STEPS = [
  { id: "gather-preferences", title: "Gathering preferences", description: "Collecting constraints from all participants..." },
  { id: "find-dates", title: "Finding overlapping dates", description: "Determining when everyone is available..." },
  { id: "select-destination", title: "Selecting destinations", description: "Analyzing and ranking destination options..." },
  { id: "plan-transport", title: "Planning transport", description: "Finding flights and trains for each participant..." },
  { id: "find-accommodation", title: "Finding accommodation", description: "Selecting hotels and stays matching preferences..." },
  { id: "arrange-dining", title: "Arranging dining", description: "Curating restaurants for dietary requirements..." },
  { id: "check-visas", title: "Checking visas", description: "Assessing visa requirements for all nationalities..." },
  { id: "save-results", title: "Saving results", description: "Storing trip options in your dashboard..." }
];

const STEP_THOUGHT_PROMPTS: Record<string, string[]> = {
  "gather-preferences": [
    "Aggregating individual budgets into a group-friendly target range.",
    "Checking transport biases (train, plane, or mixed) across participants.",
    "Scanning for strict constraints like dietary and accessibility needs."
  ],
  "find-dates": [
    "Intersecting all participant availability windows.",
    "Estimating trip length from common overlap and flexibility hints.",
    "Flagging low-overlap windows to avoid risky options."
  ],
  "select-destination": [
    "Scoring destinations by cost, preference fit, accessibility, and sustainability.",
    "Ensuring final options are distinct so the group has real variety.",
    "Balancing cheapest, best match, and sustainability themes."
  ],
  "plan-transport": [
    "Estimating per-participant transport cost and travel time.",
    "Applying preference bias for rail-first or flight-first routing.",
    "Normalizing quotes so totals are comparable across options."
  ],
  "find-accommodation": [
    "Simulating realistic stay options with beds, facilities, and location context.",
    "Checking accommodation fit against group comfort and budget.",
    "Rebalancing total option cost after stay selection."
  ],
  "arrange-dining": [
    "Selecting food spots that satisfy dietary constraints.",
    "Keeping dining choices aligned to expected spend per person.",
    "Blending safe picks with varied cuisines."
  ],
  "check-visas": [
    "Comparing nationalities and destination country requirements.",
    "Classifying outcome as visa-free, eVisa, or manual check.",
    "Adding practical notes for any uncertain cases."
  ],
  "save-results": [
    "Persisting option summaries, transport, accommodation, and itinerary.",
    "Final consistency pass before redirecting to options.",
    "Preparing data for quick review and voting."
  ]
};

type StepStatus = "pending" | "in-progress" | "complete" | "error";

interface StepWithStatus {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  detail?: string;
  error?: string;
}

export function GenerationPage() {
  const { tripId = "" } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const participantId = search.get("participantId") ?? undefined;
  const [progressSteps, setProgressSteps] = useState<StepWithStatus[]>(
    GENERATION_STEPS.map((s) => ({ ...s, status: "pending" as const }))
  );
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [thoughtIndex, setThoughtIndex] = useState(0);
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const generateOptions = useGenerateOptions(tripId, (stepId, status, message) => {
    setCurrentStep(status === "complete" ? null : stepId);
    setProgressSteps((prev) =>
      prev.map((s) =>
        s.id === stepId
          ? {
              ...s,
              status,
              detail: message ?? s.detail,
              error: status === "error" ? message : undefined
            }
          : s
      )
    );

  });

  useEffect(() => {
    generateOptions.mutate();
  }, [tripId]);

  useEffect(() => {
    if (generateOptions.isSuccess) {
      const timer = setTimeout(() => {
        navigate(`/trip/${tripId}/options${participantId ? `?participantId=${participantId}` : ""}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [generateOptions.isSuccess, tripId, navigate, participantId]);

  useEffect(() => {
    if (!currentStep) {
      return;
    }

    const timer = setInterval(() => {
      setThoughtIndex((prev) => prev + 1);
    }, 2200);

    return () => clearInterval(timer);
  }, [currentStep]);

  useEffect(() => {
    const fallbackStep = progressSteps.find((step) => step.status === "pending")?.id;
    const targetStepId = currentStep ?? fallbackStep ?? progressSteps[progressSteps.length - 1]?.id;
    if (!targetStepId) {
      return;
    }

    const node = stepRefs.current[targetStepId];
    if (!node) {
      return;
    }

    node.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, [progressSteps, currentStep]);

  return (
    <div className="min-h-screen bg-cream text-ink py-8">
      <div className="mx-auto w-full max-w-4xl px-4">
        <Section
          title="Planning your group trip"
          subtitle="AI agents are working together to create the perfect options for your group"
        >
          <Card className="space-y-8">
            <div className="relative max-h-[62vh] overflow-y-auto pr-2 snap-y snap-mandatory pl-6">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200" />
              {progressSteps.map((step, index) => {
                const isComplete = step.status === "complete";
                const isActive = step.id === currentStep;
                const isError = step.status === "error";

                return (
                  <div
                    key={step.id}
                    ref={(node) => {
                      stepRefs.current[step.id] = node;
                    }}
                    className={`relative mb-5 pl-7 snap-start ${index === progressSteps.length - 1 ? "mb-0" : ""}`}
                  >
                    <div
                      className={`absolute left-0 top-1.5 h-[10px] w-[10px] rounded-full ${
                        isComplete
                          ? "bg-emerald-500"
                          : isActive
                            ? "bg-ocean animate-pulse"
                            : isError
                              ? "bg-red-500"
                              : "bg-slate-300"
                      }`}
                    />

                    <div className="space-y-1.5">
                          <h3
                            className={`font-semibold text-lg transition-colors ${
                              isActive
                                ? "text-ocean"
                                : isComplete
                                  ? "text-emerald-700"
                                  : isError
                                    ? "text-red-600"
                                    : "text-slate-600"
                            }`}
                          >
                            {index + 1}. {step.title}
                          </h3>
                          <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>

                          {step.detail && (
                            <p className="text-xs text-slate-700">
                              <span className="font-medium text-slate-500">update:</span> {step.detail}
                            </p>
                          )}

                          {isActive && (
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                  <span className="inline-block w-2.5 h-2.5 bg-ocean rounded-full animate-bounce" />
                                  <span
                                    className="inline-block w-2.5 h-2.5 bg-ocean rounded-full animate-bounce"
                                    style={{ animationDelay: "0.2s" }}
                                  />
                                  <span
                                    className="inline-block w-2.5 h-2.5 bg-ocean rounded-full animate-bounce"
                                    style={{ animationDelay: "0.4s" }}
                                  />
                                </div>
                                <span className="text-sm text-ocean font-medium">Agent thinking...</span>
                              </div>

                              <p className="text-xs text-ocean/90 pl-1">
                                {STEP_THOUGHT_PROMPTS[step.id]?.[thoughtIndex % Math.max(1, STEP_THOUGHT_PROMPTS[step.id]?.length ?? 1)]}
                              </p>
                            </div>
                          )}

                          {isError && step.error && (
                            <p className="text-sm text-red-700">Error: {step.error}</p>
                          )}

                          {isComplete && (
                            <div className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                              <span>✓</span>
                              <span>Complete</span>
                            </div>
                          )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="border-t border-slate-200 pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Progress</div>
                  <div className="text-2xl font-bold text-ocean">
                    {progressSteps.filter((s) => s.status === "complete").length}/{progressSteps.length}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-slate-600 mb-1">Current Step</div>
                  <div className="text-base font-semibold text-ink">
                    {currentStep
                      ? progressSteps.find((s) => s.id === currentStep)?.title
                      : generateOptions.isSuccess
                        ? "Complete!"
                        : "Starting..."}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-slate-600 mb-1">Status</div>
                  <div className={`text-base font-semibold ${generateOptions.isSuccess ? "text-emerald-700" : generateOptions.isError ? "text-red-700" : "text-ocean"}`}>
                    {generateOptions.isSuccess ? "Done" : generateOptions.isError ? "Error" : "In progress"}
                  </div>
                </div>
              </div>

            </div>

            {/* Success message */}
            {generateOptions.isSuccess && (
              <div className="pt-2">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <p className="font-semibold text-emerald-900">Trip options generated successfully!</p>
                    <p className="text-sm text-emerald-700 mt-1">
                      Your AI agents have created 3 personalized trip options. Redirecting to dashboard...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {generateOptions.isError && (
              <div className="pt-2">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="font-semibold text-red-900">Generation failed</p>
                    <p className="text-sm text-red-700 mt-1">{String(generateOptions.error)}</p>
                    <Button
                      variant="ghost"
                      className="mt-3 text-red-600 hover:text-red-700"
                      onClick={() => navigate(`/trip/${tripId}/dashboard`)}
                    >
                      Back to dashboard
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Section>
      </div>
    </div>
  );
}
