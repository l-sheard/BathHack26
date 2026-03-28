import { describe, expect, it } from "vitest";
import { preferencesSchema } from "../src/schemas/preferencesSchema";

describe("preferences schema", () => {
  it("accepts valid payload", () => {
    const result = preferencesSchema.safeParse({
      preferred_trip_length: 4,
      flexibility_notes: "",
      departure_location: "London",
      alternative_locations: ["Bristol"],
      max_travel_time_hours: 7,
      transport_preference: "either",
      total_budget: 800,
      budget_flexibility: 120,
      trip_preferences: ["city", "culture"],
      accessibility: {
        ground_floor: false,
        lift_access: true,
        step_free_access: true,
        wheelchair_accessible: false,
        accessible_bathroom: false,
        reduced_walking: false,
        close_to_public_transport: true,
        notes: ""
      },
      dietary: {
        vegetarian: true,
        vegan: false,
        halal: false,
        kosher: false,
        gluten_free: false,
        dairy_free: false,
        nut_allergy: false,
        notes: ""
      },
      sustainability: {
        prefer_train_over_plane: true,
        willing_longer_for_lower_emissions: true,
        prefer_eco_accommodation: true,
        sustainable_activities: true
      },
      passport_nationality: "British",
      residence_country: "United Kingdom",
      visa_notes: "",
      availability_windows: [{ start_date: "2026-06-12", end_date: "2026-06-16" }]
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing availability", () => {
    const result = preferencesSchema.safeParse({
      preferred_trip_length: 4,
      departure_location: "London",
      alternative_locations: [],
      max_travel_time_hours: 7,
      transport_preference: "either",
      total_budget: 800,
      trip_preferences: ["city"],
      accessibility: {
        ground_floor: false,
        lift_access: false,
        step_free_access: false,
        wheelchair_accessible: false,
        accessible_bathroom: false,
        reduced_walking: false,
        close_to_public_transport: false
      },
      dietary: {
        vegetarian: false,
        vegan: false,
        halal: false,
        kosher: false,
        gluten_free: false,
        dairy_free: false,
        nut_allergy: false
      },
      sustainability: {
        prefer_train_over_plane: false,
        willing_longer_for_lower_emissions: false,
        prefer_eco_accommodation: false,
        sustainable_activities: false
      },
      passport_nationality: "British",
      residence_country: "United Kingdom",
      availability_windows: []
    });

    expect(result.success).toBe(false);
  });
});
