import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CheckboxGroup } from "../components/CheckboxGroup";
import { Input } from "../components/Input";
import { Section } from "../components/Section";
import {
  useParticipantPreferences,
  useSavePreferences,
} from "../hooks/queries";
import {
  defaultPreferencesValues,
  preferencesSchema,
  type PreferencesFormValues,
} from "../schemas/preferencesSchema";

const tagOptions = [
  { label: "Beach", value: "beach" },
  { label: "City", value: "city" },
  { label: "Nature", value: "nature" },
  { label: "Adventure", value: "adventure" },
  { label: "Relaxation", value: "relaxation" },
  { label: "Nightlife", value: "nightlife" },
  { label: "Culture", value: "culture" },
];

const UK_AIRPORT_OPTIONS = [
  "London Heathrow (LHR)",
  "London Gatwick (LGW)",
  "London Stansted (STN)",
  "London Luton (LTN)",
  "London City (LCY)",
  "Manchester (MAN)",
  "Birmingham (BHX)",
  "Bristol (BRS)",
  "Leeds Bradford (LBA)",
  "Liverpool John Lennon (LPL)",
  "Newcastle (NCL)",
  "East Midlands (EMA)",
  "Southampton (SOU)",
  "Belfast International (BFS)",
  "George Best Belfast City (BHD)",
  "Edinburgh (EDI)",
  "Glasgow (GLA)",
  "Aberdeen (ABZ)",
  "Inverness (INV)",
  "Cardiff (CWL)",
  "Exeter (EXT)",
  "Norwich (NWI)",
  "Bournemouth (BOH)",
  "Teesside International (MME)",
  "Humberside (HUY)",
  "London Southend (SEN)",
  "Isle of Man (IOM)",
  "Jersey (JER)",
  "Guernsey (GCI)",
] as const;

const UK_TRAIN_STATION_OPTIONS = [
  "London St Pancras International",
  "London King's Cross",
  "London Euston",
  "London Paddington",
  "London Liverpool Street",
  "London Victoria",
  "Birmingham New Street",
  "Manchester Piccadilly",
  "Manchester Victoria",
  "Bristol Temple Meads",
  "Leeds",
  "Liverpool Lime Street",
  "Newcastle",
  "Edinburgh Waverley",
  "Glasgow Central",
  "Cardiff Central",
  "Sheffield",
  "Nottingham",
  "Leicester",
  "Reading",
  "York",
  "Cambridge",
  "Oxford",
  "Southampton Central",
  "Exeter St Davids",
] as const;

const COUNTRY_OPTIONS = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
] as const;

function boolItems(
  prefix: "accessibility" | "dietary" | "sustainability",
  entries: Array<{ key: string; label: string }>,
) {
  return entries.map((entry) => ({
    path: `${prefix}.${entry.key}` as const,
    label: entry.label,
  }));
}

export function PreferencesPage() {
  const { tripId = "", participantId = "" } = useParams();
  const [alternativeInput, setAlternativeInput] = useState("");
  const saveMutation = useSavePreferences(tripId, participantId);
  const existing = useParticipantPreferences(participantId);

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: defaultPreferencesValues,
  });

  const availability = useFieldArray({
    control: form.control,
    name: "availability_windows",
  });

  const selectedTransportPreference = form.watch("transport_preference");
  const departureLookupOptions =
    selectedTransportPreference === "train"
      ? UK_TRAIN_STATION_OPTIONS
      : selectedTransportPreference === "plane"
        ? UK_AIRPORT_OPTIONS
        : [...UK_AIRPORT_OPTIONS, ...UK_TRAIN_STATION_OPTIONS];

  const departureLabel =
    selectedTransportPreference === "train"
      ? "Preferred departure train station"
      : selectedTransportPreference === "plane"
        ? "Preferred departure airport"
        : "Preferred departure airport or train station";

  const alternativesLabel =
    selectedTransportPreference === "train"
      ? "Acceptable alternative train stations"
      : selectedTransportPreference === "plane"
        ? "Acceptable alternative airports"
        : "Acceptable alternative departures";

  useEffect(() => {
    if (!existing.data) return;
    const payload = {
      ...defaultPreferencesValues,
      ...existing.data,
      availability_windows: (existing.data.availability_windows ?? []).map(
        (window: any) => ({
          start_date: window.start_date,
          end_date: window.end_date,
        }),
      ),
    };
    form.reset(payload);
  }, [existing.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    await saveMutation.mutateAsync(values);
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <Section
        title="Participant Preferences"
        subtitle="You can edit and save this any time."
      >
        <Card className="space-y-6 text-black rounded-3xl">
          <Section title="Availability">
            <div className="space-y-2">
              {availability.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"
                >
                  <Input
                    type="date"
                    {...form.register(
                      `availability_windows.${index}.start_date`,
                    )}
                  />
                  <Input
                    type="date"
                    {...form.register(`availability_windows.${index}.end_date`)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => availability.remove(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  availability.append({ start_date: "", end_date: "" })
                }
              >
                Add date range
              </Button>
              {form.formState.errors.availability_windows ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.availability_windows.message as string}
                </p>
              ) : null}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm font-semibold">
                  Preferred trip length (days)
                </span>
                <Input
                  type="number"
                  {...form.register("preferred_trip_length")}
                />
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
                <span className="text-sm font-semibold">Travel preference</span>
                <select
                  className="w-full rounded-xl border border-slate-300 p-2"
                  {...form.register("transport_preference")}
                >
                  <option value="plane">Plane</option>
                  <option value="train">Train</option>
                  <option value="either">Either</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold">{departureLabel}</span>
                <Input
                  className="text-black"
                  {...form.register("departure_location")}
                  list="uk-departure-options"
                  placeholder="Start typing to search departures"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold">
                  Max travel time (hours)
                </span>
                <Input
                  type="number"
                  {...form.register("max_travel_time_hours")}
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold">
                  {alternativesLabel}
                </span>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Input
                      value={alternativeInput}
                      onChange={(event) =>
                        setAlternativeInput(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key !== "Enter") return;
                        event.preventDefault();
                        const next = alternativeInput.trim();
                        if (!next) return;
                        const current = form.getValues("alternative_locations");
                        if (current.includes(next)) {
                          setAlternativeInput("");
                          return;
                        }
                        form.setValue(
                          "alternative_locations",
                          [...current, next],
                          { shouldValidate: true },
                        );
                        setAlternativeInput("");
                      }}
                      list="uk-departure-options"
                      placeholder="Type departure and press Enter"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        const next = alternativeInput.trim();
                        if (!next) return;
                        const current = form.getValues("alternative_locations");
                        if (current.includes(next)) {
                          setAlternativeInput("");
                          return;
                        }
                        form.setValue(
                          "alternative_locations",
                          [...current, next],
                          { shouldValidate: true },
                        );
                        setAlternativeInput("");
                      }}
                    >
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {form.watch("alternative_locations").map((departure) => (
                      <span
                        key={departure}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs"
                      >
                        {departure}
                        <button
                          type="button"
                          className="text-black hover:text-black"
                          onClick={() =>
                            form.setValue(
                              "alternative_locations",
                              form
                                .getValues("alternative_locations")
                                .filter((item) => item !== departure),
                              { shouldValidate: true },
                            )
                          }
                        >
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </label>
            </div>
            <datalist id="uk-departure-options">
              {departureLookupOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </Section>

          <Section title="Budget">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm font-semibold">
                  Total trip budget (GBP)
                </span>
                <Input type="number" {...form.register("total_budget")} />
              </label>
            </div>
          </Section>

          <CheckboxGroup
            label="Trip preferences"
            options={tagOptions}
            selected={form.watch("trip_preferences")}
            onChange={(next) =>
              form.setValue(
                "trip_preferences",
                next as PreferencesFormValues["trip_preferences"],
              )
            }
          />

          <Section title="Accessibility requirements">
            <div className="grid gap-2 md:grid-cols-2">
              {boolItems("accessibility", [
                { key: "ground_floor", label: "Ground floor accommodation" },
                { key: "lift_access", label: "Lift access" },
                { key: "step_free_access", label: "Step-free access" },
                {
                  key: "wheelchair_accessible",
                  label: "Wheelchair accessible accommodation",
                },
                { key: "accessible_bathroom", label: "Accessible bathroom" },
                { key: "reduced_walking", label: "Reduced walking" },
                {
                  key: "close_to_public_transport",
                  label: "Close to public transport",
                },
              ]).map((item) => (
                <label
                  key={item.path}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm"
                >
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
                { key: "nut_allergy", label: "Nut allergy" },
              ]).map((item) => (
                <label
                  key={item.path}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm"
                >
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
                {
                  key: "prefer_train_over_plane",
                  label: "Prefer train over plane",
                },
                {
                  key: "willing_longer_for_lower_emissions",
                  label: "Willing to travel longer for lower emissions",
                },
                {
                  key: "prefer_eco_accommodation",
                  label: "Prefer eco-friendly accommodation",
                },
                {
                  key: "sustainable_activities",
                  label: "Prefer sustainable activities",
                },
              ]).map((item) => (
                <label
                  key={item.path}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm"
                >
                  <input type="checkbox" {...form.register(item.path as any)} />
                  {item.label}
                </label>
              ))}
            </div>
          </Section>

          <Section title="Travel documentation">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm font-semibold">
                  Passport nationality
                </span>
                <Input
                  {...form.register("passport_nationality")}
                  list="country-options"
                  placeholder="Start typing to search countries"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold">
                  Country of residence
                </span>
                <Input
                  {...form.register("residence_country")}
                  list="country-options"
                  placeholder="Start typing to search countries"
                />
              </label>
            </div>
            <label className="space-y-1">
              <span className="text-sm font-semibold">Visa notes</span>
              <Input {...form.register("visa_notes")} />
            </label>
            <datalist id="country-options">
              {COUNTRY_OPTIONS.map((country) => (
                <option key={country} value={country} />
              ))}
            </datalist>
          </Section>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save preferences"}
            </Button>
            <Link
              to={`/trip/${tripId}/dashboard?participantId=${participantId}`}
              className="inline-flex"
            >
              <Button type="button" variant="ghost">
                Go to dashboard
              </Button>
            </Link>
          </div>

          {saveMutation.isSuccess ? (
            <p className="text-sm text-emerald-700">Preferences saved.</p>
          ) : null}
          {saveMutation.error ? (
            <p className="text-sm text-red-600">{String(saveMutation.error)}</p>
          ) : null}
        </Card>
      </Section>
    </form>
  );
}
