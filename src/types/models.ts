export type TransportPreference = "plane" | "train" | "either";

export type TripPreferenceTag =
  | "beach"
  | "city"
  | "nature"
  | "adventure"
  | "relaxation"
  | "nightlife"
  | "culture";

export type AccessibilityNeeds = {
  ground_floor: boolean;
  lift_access: boolean;
  step_free_access: boolean;
  wheelchair_accessible: boolean;
  accessible_bathroom: boolean;
  reduced_walking: boolean;
  close_to_public_transport: boolean;
  notes?: string;
};

export type DietaryNeeds = {
  vegetarian: boolean;
  vegan: boolean;
  halal: boolean;
  kosher: boolean;
  gluten_free: boolean;
  dairy_free: boolean;
  nut_allergy: boolean;
  notes?: string;
};

export type SustainabilityPreferences = {
  prefer_train_over_plane: boolean;
  willing_longer_for_lower_emissions: boolean;
  prefer_eco_accommodation: boolean;
  sustainable_activities: boolean;
};

export type AvailabilityWindow = {
  id?: string;
  start_date: string;
  end_date: string;
};

export type ParticipantPreferenceInput = {
  preferred_trip_length: number;
  flexibility_notes?: string;
  departure_location: string;
  alternative_locations: string[];
  max_travel_time_hours: number;
  transport_preference: TransportPreference;
  total_budget: number;
  trip_preferences: TripPreferenceTag[];
  accessibility: AccessibilityNeeds;
  dietary: DietaryNeeds;
  sustainability: SustainabilityPreferences;
  passport_nationality: string;
  residence_country: string;
  visa_notes?: string;
  availability_windows: AvailabilityWindow[];
};

export type AggregatedConstraints = {
  tripId: string;
  participantCount: number;
  participantIds: string[];
  hardConstraints: {
    overlappingDates: AvailabilityWindow | null;
    maxBudgetPerPerson: number;
    strictDietaryTags: string[];
    strictAccessibility: string[];
  };
  softPreferences: {
    preferenceScores: Record<TripPreferenceTag, number>;
    transportBias: "plane" | "train" | "mixed";
    sustainabilityScore: number;
  };
  perParticipant: Array<{
    participantId: string;
    name: string;
    departure: string;
    maxTravelTimeHours: number;
    transportPreference: TransportPreference;
    budget: number;
    accessibility: AccessibilityNeeds;
    dietary: DietaryNeeds;
    sustainability: SustainabilityPreferences;
    nationality: string;
    residenceCountry: string;
  }>;
};

export type GeneratedOption = {
  optionRank: number;
  theme: "cheapest" | "best_match" | "most_sustainable";
  destination: string;
  startDate: string;
  endDate: string;
  summary: string;
  rationale: string;
  estimatedTotal: number;
  estimatedPerPerson: number;
  tradeoffs: string[];
  validationNotes: string[];
  transportPlans: Array<{
    participantId: string;
    mode: "plane" | "train";
    departure: string;
    durationHours: number;
    details: string;
    estimatedCost: number;
    emissionsLevel: "low" | "medium" | "high";
  }>;
  accommodation: {
    name: string;
    description: string;
    nightlyCost: number;
    accessibilityFeatures: string[];
    ecoRating: number;
  };
  restaurants: Array<{
    name: string;
    cuisine: string;
    priceBand: "$" | "$$" | "$$$";
    dietaryTags: string[];
    explanation: string;
    estimatedCostPerPerson: number;
  }>;
  visaSummaries: Array<{
    nationality: string;
    outcome: "visa_free" | "evisa" | "check_required";
    summary: string;
  }>;
  itinerary: Array<{
    dayNumber: number;
    title: string;
    description: string;
    activityType: string;
    isSustainable: boolean;
    accessibilityLevel: "high" | "medium" | "low";
    estimatedCost: number;
  }>;
  budgetBreakdown: {
    transport: number;
    accommodation: number;
    food: number;
    activities: number;
  };
};
