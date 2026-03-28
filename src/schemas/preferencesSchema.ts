import { z } from "zod";

const availabilitySchema = z.object({
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required")
});

export const preferencesSchema = z.object({
  preferred_trip_length: z.coerce.number().min(2).max(21),
  flexibility_notes: z.string().optional(),
  departure_location: z.string().min(2, "Departure location is required"),
  alternative_locations: z.array(z.string()).default([]),
  max_travel_time_hours: z.coerce.number().min(1).max(24),
  transport_preference: z.enum(["plane", "train", "either"]),
  total_budget: z.coerce.number().min(100),
  budget_flexibility: z.coerce.number().min(0).max(1000).optional(),
  trip_preferences: z
    .array(z.enum(["beach", "city", "nature", "adventure", "relaxation", "nightlife", "culture"]))
    .min(1, "Select at least one trip preference"),
  accessibility: z.object({
    ground_floor: z.boolean(),
    lift_access: z.boolean(),
    step_free_access: z.boolean(),
    wheelchair_accessible: z.boolean(),
    accessible_bathroom: z.boolean(),
    reduced_walking: z.boolean(),
    close_to_public_transport: z.boolean(),
    notes: z.string().optional()
  }),
  dietary: z.object({
    vegetarian: z.boolean(),
    vegan: z.boolean(),
    halal: z.boolean(),
    kosher: z.boolean(),
    gluten_free: z.boolean(),
    dairy_free: z.boolean(),
    nut_allergy: z.boolean(),
    notes: z.string().optional()
  }),
  sustainability: z.object({
    prefer_train_over_plane: z.boolean(),
    willing_longer_for_lower_emissions: z.boolean(),
    prefer_eco_accommodation: z.boolean(),
    sustainable_activities: z.boolean()
  }),
  passport_nationality: z.string().min(2),
  residence_country: z.string().min(2),
  visa_notes: z.string().optional(),
  availability_windows: z.array(availabilitySchema).min(1, "Add at least one date range")
});

export type PreferencesFormValues = z.infer<typeof preferencesSchema>;

export const defaultPreferencesValues: PreferencesFormValues = {
  preferred_trip_length: 5,
  flexibility_notes: "",
  departure_location: "",
  alternative_locations: [],
  max_travel_time_hours: 6,
  transport_preference: "either",
  total_budget: 700,
  budget_flexibility: 120,
  trip_preferences: ["city"],
  accessibility: {
    ground_floor: false,
    lift_access: false,
    step_free_access: false,
    wheelchair_accessible: false,
    accessible_bathroom: false,
    reduced_walking: false,
    close_to_public_transport: false,
    notes: ""
  },
  dietary: {
    vegetarian: false,
    vegan: false,
    halal: false,
    kosher: false,
    gluten_free: false,
    dairy_free: false,
    nut_allergy: false,
    notes: ""
  },
  sustainability: {
    prefer_train_over_plane: false,
    willing_longer_for_lower_emissions: false,
    prefer_eco_accommodation: false,
    sustainable_activities: true
  },
  passport_nationality: "",
  residence_country: "",
  visa_notes: "",
  availability_windows: [{ start_date: "", end_date: "" }]
};
