import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

type StepStatus = "pending" | "in-progress" | "complete" | "error";

interface StepWithStatus {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  error?: string;
}

export function GenerationPage() {
  const { tripId = "" } = useParams();
  const navigate = useNavigate();
  const [progressSteps, setProgressSteps] = useState<StepWithStatus[]>(
    GENERATION_STEPS.map((s) => ({ ...s, status: "pending" as const }))
  );
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const generateOptions = useGenerateOptions(tripId, (stepId, status, message) => {
    setCurrentStep(status === "complete" ? null : stepId);
    setProgressSteps((prev) =>
      prev.map((s) =>
        s.id === stepId
          ? { ...s, status, error: status === "error" ? message : undefined }
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
        navigate(`/trip/${tripId}/options`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [generateOptions.isSuccess, tripId, navigate]);

  return (
    <div className="min-h-screen bg-cream text-ink py-8">
      <div className="mx-auto w-full max-w-4xl px-4">
        <Section
          title="Planning your group trip"
          subtitle="AI agents are working together to create the perfect options for your group"
        >
          <Card className="space-y-8">
            <div className="space-y-4">
              {progressSteps.map((step, index) => {
                const isComplete = step.status === "complete";
                const isActive = step.id === currentStep;
                const isError = step.status === "error";

                return (
                  <div key={step.id} className="relative">
                    <div className="flex gap-6">
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-base transition-all ${
                            isComplete
                              ? "bg-emerald-500 text-white shadow-lg"
                              : isActive
                                ? "bg-ocean text-white ring-4 ring-ocean/30 animate-pulse"
                                : isError
                                  ? "bg-red-500 text-white"
                                  : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          {isComplete ? "✓" : isActive ? "⚙" : isError ? "!" : index + 1}
                        </div>
                        {index < progressSteps.length - 1 && (
                          <div
                            className={`w-1 h-16 mt-3 transition-colors ${
                              isComplete ? "bg-emerald-500" : "bg-slate-200"
                            }`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-2">
                        <div className="space-y-2">
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
                            {step.title}
                          </h3>
                          <p className="text-sm text-slate-600">{step.description}</p>

                          {isActive && (
                            <div className="mt-3 flex items-center gap-3">
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
                          )}

                          {isError && step.error && (
                            <div className="mt-3 rounded-lg bg-red-50 p-3 border border-red-200">
                              <p className="text-sm text-red-700">{step.error}</p>
                            </div>
                          )}

                          {isComplete && (
                            <div className="mt-2 text-sm text-emerald-700 font-medium flex items-center gap-2">
                              <span>✓</span>
                              <span>Complete</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="border-t border-slate-200 pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-sm text-slate-600 mb-1">Progress</div>
                  <div className="text-2xl font-bold text-ocean">
                    {progressSteps.filter((s) => s.status === "complete").length}/{progressSteps.length}
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-sm text-slate-600 mb-1">Current Step</div>
                  <div className="text-base font-semibold text-ink">
                    {currentStep
                      ? progressSteps.find((s) => s.id === currentStep)?.title
                      : generateOptions.isSuccess
                        ? "Complete!"
                        : "Starting..."}
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-sm text-slate-600 mb-1">Status</div>
                  <div className={`text-base font-semibold ${generateOptions.isSuccess ? "text-emerald-700" : generateOptions.isError ? "text-red-700" : "text-ocean"}`}>
                    {generateOptions.isSuccess ? "Done" : generateOptions.isError ? "Error" : "In progress"}
                  </div>
                </div>
              </div>
            </div>

            {/* Success message */}
            {generateOptions.isSuccess && (
              <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200">
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
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
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
