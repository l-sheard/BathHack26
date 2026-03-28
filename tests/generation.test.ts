import { describe, expect, it } from "vitest";
import {
  generateAccommodationOption,
  generateBudgetAssessment,
  generateDestinationCandidates,
  generateItinerary,
  generateOptionSetFromConstraints,
  generateRestaurantRecommendations,
  generateTransportPlan
} from "../src/services/generation/agents";
import type { AggregatedConstraints } from "../src/types/models";

const constraints: AggregatedConstraints = {
  tripId: "trip-1",
  participantCount: 2,
  participantIds: ["p1", "p2"],
  hardConstraints: {
    overlappingDates: { start_date: "2026-06-12", end_date: "2026-06-16" },
    maxBudgetPerPerson: 850,
    strictDietaryTags: ["vegetarian", "halal"],
    strictAccessibility: ["step_free_access", "reduced_walking"]
  },
  softPreferences: {
    preferenceScores: {
      beach: 0,
      city: 2,
      nature: 1,
      adventure: 1,
      relaxation: 1,
      nightlife: 0,
      culture: 2
    },
    transportBias: "train",
    sustainabilityScore: 6
  },
  perParticipant: [
    {
      participantId: "p1",
      name: "Lara",
      departure: "London",
      maxTravelTimeHours: 8,
      transportPreference: "train",
      budget: 900,
      accessibility: {
        ground_floor: false,
        lift_access: true,
        step_free_access: true,
        wheelchair_accessible: false,
        accessible_bathroom: false,
        reduced_walking: true,
        close_to_public_transport: true
      },
      dietary: {
        vegetarian: true,
        vegan: false,
        halal: false,
        kosher: false,
        gluten_free: false,
        dairy_free: false,
        nut_allergy: false
      },
      sustainability: {
        prefer_train_over_plane: true,
        willing_longer_for_lower_emissions: true,
        prefer_eco_accommodation: true,
        sustainable_activities: true
      },
      nationality: "British",
      residenceCountry: "United Kingdom"
    },
    {
      participantId: "p2",
      name: "Sam",
      departure: "Bristol",
      maxTravelTimeHours: 9,
      transportPreference: "either",
      budget: 800,
      accessibility: {
        ground_floor: false,
        lift_access: false,
        step_free_access: true,
        wheelchair_accessible: false,
        accessible_bathroom: false,
        reduced_walking: true,
        close_to_public_transport: true
      },
      dietary: {
        vegetarian: false,
        vegan: false,
        halal: true,
        kosher: false,
        gluten_free: false,
        dairy_free: false,
        nut_allergy: false
      },
      sustainability: {
        prefer_train_over_plane: true,
        willing_longer_for_lower_emissions: false,
        prefer_eco_accommodation: false,
        sustainable_activities: true
      },
      nationality: "Irish",
      residenceCountry: "Ireland"
    }
  ]
};

describe("generation agents", () => {
  it("filters restaurants by dietary and budget", () => {
    const destination = generateDestinationCandidates(constraints)[0];
    const restaurants = generateRestaurantRecommendations(destination, constraints);
    expect(restaurants.length).toBeGreaterThan(0);
    expect(restaurants.some((item) => item.dietaryTags.includes("vegetarian") || item.dietaryTags.includes("halal"))).toBe(true);
  });

  it("computes budget assessment with breakdown", () => {
    const destination = generateDestinationCandidates(constraints)[0];
    const transport = generateTransportPlan(destination, constraints);
    const accommodation = generateAccommodationOption(destination, constraints);
    const restaurants = generateRestaurantRecommendations(destination, constraints);
    const itinerary = generateItinerary(destination, constraints);

    const budget = generateBudgetAssessment(destination, constraints, transport, accommodation, restaurants, itinerary);

    expect(budget.total).toBeGreaterThan(0);
    expect(budget.perPerson).toBeGreaterThan(0);
    expect(budget.breakdown.transport + budget.breakdown.accommodation + budget.breakdown.food + budget.breakdown.activities).toBe(
      budget.total
    );
  });

  it("returns at least three ranked destination candidates", () => {
    const candidates = generateDestinationCandidates(constraints);
    expect(candidates.length).toBeGreaterThanOrEqual(3);
    expect(candidates[0].matchScore).toBeGreaterThanOrEqual(candidates[2].matchScore);
  });

  it("builds exactly three distinct trip options", () => {
    const options = generateOptionSetFromConstraints(constraints);
    expect(options).toHaveLength(3);
    expect(new Set(options.map((option) => option.optionRank)).size).toBe(3);
    expect(options.every((option) => option.restaurants.length > 0)).toBe(true);
  });
});
