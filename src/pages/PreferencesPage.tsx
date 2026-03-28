import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CheckboxGroup } from "../components/CheckboxGroup";
import { Input } from "../components/Input";
import { Section } from "../components/Section";
import { useParticipantPreferences, useSavePreferences } from "../hooks/queries";
import { defaultPreferencesValues, preferencesSchema, type PreferencesFormValues } from "../schemas/preferencesSchema";

const tagOptions = [
  { label: "Beach", value: "beach" },
  { label: "City", value: "city" },
  { label: "Nature", value: "nature" },
  { label: "Adventure", value: "adventure" },
  { label: "Relaxation", value: "relaxation" },
  { label: "Nightlife", value: "nightlife" },
  { label: "Culture", value: "culture" }
];

function boolItems(prefix: "accessibility" | "dietary" | "sustainability", entries: Array<{ key: string; label: string }>) {
  return entries.map((entry) => ({
    path: `${prefix}.${entry.key}` as const,
    label: entry.label
  }));
}

export function PreferencesPage() {
  const { tripId = "", participantId = "" } = useParams();
  const saveMutation = useSavePreferences(tripId, participantId);
  const existing = useParticipantPreferences(participantId);

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: defaultPreferencesValues
  });

  const availability = useFieldArray({
    control: form.control,
    name: "availability_windows"
  });

  useEffect(() => {
    if (!existing.data) return;
    const payload = {
      ...defaultPreferencesValues,
      ...existing.data,
      availability_windows: (existing.data.availability_windows ?? []).map((window: any) => ({
        start_date: window.start_date,
        end_date: window.end_date
      }))
    };
    form.reset(payload);
  }, [existing.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    await saveMutation.mutateAsync(values);
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <Section title="Participant Preferences" subtitle="You can edit and save this any time.">
        <Card className="space-y-6">
          <Section title="Availability">
            <div className="space-y-2">
              {availability.fields.map((field, index) => (
                <div key={field.id} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                  <Input type="date" {...form.register(`availability_windows.${index}.start_date`)} />
                  <Input type="date" {...form.register(`availability_windows.${index}.end_date`)} />
                  <Button type="button" variant="ghost" onClick={() => availability.remove(index)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                onClick={() => availability.append({ start_date: "", end_date: "" })}
              >
                Add date range
              </Button>
              {form.formState.errors.availability_windows ? (
                <p className="text-sm text-red-600">{form.formState.errors.availability_windows.message as string}</p>
              ) : null}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm font-semibold">Preferred trip length (days)</span>
                <Input type="number" {...form.register("preferred_trip_length")} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold">Flexibility notes</span>
                <Input {...form.register("flexibility_notes")} />
              </label>
            </div>
          </Section>

          <Section title="Travel details">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm font-semibold">Departure airport/station</span>
                <Input {...form.register("departure_location")} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold">Max travel time (hours)</span>
                <Input type="number" {...form.register("max_travel_time_hours")} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold">Acceptable alternatives (comma separated)</span>
                <Input
                  value={form.watch("alternative_locations").join(", ")}
                  onChange={(event) =>
                    form.setValue(
                      "alternative_locations",
                      event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold">Transport preference</span>
                <select className="w-full rounded-xl border border-slate-300 p-2" {...form.register("transport_preference")}>
                  <option value="plane">Plane</option>
                  <option value="train">Train</option>
                  <option value="either">Either</option>
                </select>
              </label>
            </div>
          </Section>

          <Section title="Budget">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm font-semibold">Total trip budget (GBP)</span>
                <Input type="number" {...form.register("total_budget")} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold">Budget flexibility (GBP)</span>
                <Input type="number" {...form.register("budget_flexibility")} />
              </label>
            </div>
          </Section>

          <CheckboxGroup
            label="Trip preferences"
            options={tagOptions}
            selected={form.watch("trip_preferences")}
            onChange={(next) => form.setValue("trip_preferences", next as PreferencesFormValues["trip_preferences"])}
          />

          <Section title="Accessibility requirements">
            <div className="grid gap-2 md:grid-cols-2">
              {boolItems("accessibility", [
                { key: "ground_floor", label: "Ground floor accommodation" },
                { key: "lift_access", label: "Lift access" },
                { key: "step_free_access", label: "Step-free access" },
                { key: "wheelchair_accessible", label: "Wheelchair accessible accommodation" },
                { key: "accessible_bathroom", label: "Accessible bathroom" },
                { key: "reduced_walking", label: "Reduced walking" },
                { key: "close_to_public_transport", label: "Close to public transport" }
              ]).map((item) => (
                <label key={item.path} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm">
                  <input type="checkbox" {...form.register(item.path as any)} />
                  {item.label}
                </label>
              ))}
            </div>
            <label className="space-y-1">
              <span className="text-sm font-semibold">Notes</span>
              <Input {...form.register("accessibility.notes")} />
            </label>
          </Section>

          <Section title="Dietary requirements">
            <div className="grid gap-2 md:grid-cols-2">
              {boolItems("dietary", [
                { key: "vegetarian", label: "Vegetarian" },
                { key: "vegan", label: "Vegan" },
                { key: "halal", label: "Halal" },
                { key: "kosher", label: "Kosher" },
                { key: "gluten_free", label: "Gluten-free" },
                { key: "dairy_free", label: "Dairy-free" },
                { key: "nut_allergy", label: "Nut allergy" }
              ]).map((item) => (
                <label key={item.path} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm">
                  <input type="checkbox" {...form.register(item.path as any)} />
                  {item.label}
                </label>
              ))}
            </div>
            <label className="space-y-1">
              <span className="text-sm font-semibold">Notes</span>
              <Input {...form.register("dietary.notes")} />
            </label>
          </Section>

          <Section title="Sustainability preferences">
            <div className="grid gap-2 md:grid-cols-2">
              {boolItems("sustainability", [
                { key: "prefer_train_over_plane", label: "Prefer train over plane" },
                { key: "willing_longer_for_lower_emissions", label: "Willing to travel longer for lower emissions" },
                { key: "prefer_eco_accommodation", label: "Prefer eco-friendly accommodation" },
                { key: "sustainable_activities", label: "Prefer sustainable activities" }
              ]).map((item) => (
                <label key={item.path} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm">
                  <input type="checkbox" {...form.register(item.path as any)} />
                  {item.label}
                </label>
              ))}
            </div>
          </Section>

          <Section title="Travel documentation">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm font-semibold">Passport nationality</span>
                <Input {...form.register("passport_nationality")} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold">Country of residence</span>
                <Input {...form.register("residence_country")} />
              </label>
            </div>
            <label className="space-y-1">
              <span className="text-sm font-semibold">Visa notes</span>
              <Input {...form.register("visa_notes")} />
            </label>
          </Section>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save preferences"}
            </Button>
            <Link to={`/trip/${tripId}/dashboard?participantId=${participantId}`} className="inline-flex">
              <Button type="button" variant="ghost">
                Go to dashboard
              </Button>
            </Link>
          </div>

          {saveMutation.isSuccess ? <p className="text-sm text-emerald-700">Preferences saved.</p> : null}
          {saveMutation.error ? <p className="text-sm text-red-600">{String(saveMutation.error)}</p> : null}
        </Card>
      </Section>
    </form>
  );
}
