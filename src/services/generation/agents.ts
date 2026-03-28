import { ACCOMMODATIONS, ACTIVITIES, DESTINATIONS, RESTAURANTS } from "../../data/mockCatalog";
import { supabase } from "../../lib/supabase";
import { fetchDestinationImage } from "../imageService";
import type { AggregatedConstraints, GeneratedOption, TripPreferenceTag } from "../../types/models";
import { generateTripOptionsWithLLM, isAiPlannerEnabled } from "./llmPlanner";

type ParticipantRow = {
  id: string;
  name: string;
  email: string | null;
  participant_preferences: Array<{
    id: string;
    preferred_trip_length: number;
    flexibility_notes: string | null;
    departure_location: string;
    alternative_locations: string[] | null;
    max_travel_time_hours: number;
    transport_preference: "plane" | "train" | "either";
    total_budget: number;
    trip_preferences: TripPreferenceTag[];
    accessibility: Record<string, boolean | string>;
    dietary: Record<string, boolean | string>;
    sustainability: Record<string, boolean>;
    passport_nationality: string;
    residence_country: string;
    visa_notes: string | null;
    availability_windows: Array<{
      start_date: string;
      end_date: string;
    }>;
  }>;
};

type DestinationCandidate = {
  destination: string;
  country: string;
  avgDailyCost: number;
  trainFriendly: boolean;
  ecoScore: number;
  accessibilityScore: number;
  matchScore: number;
};

// TODO: Replace static catalog sources with live provider adapters (flights/trains/hotels/visa) after MVP demo.

function overlapWindows(windowsPerPerson: Array<Array<{ start_date: string; end_date: string }>>) {
  if (windowsPerPerson.length === 0) {
    return null;
  }

  let latestStart = new Date("1900-01-01");
  let earliestEnd = new Date("2999-01-01");

  for (const personWindows of windowsPerPerson) {
    if (personWindows.length === 0) {
      return null;
    }
    const first = personWindows[0];
    const start = new Date(first.start_date);
    const end = new Date(first.end_date);
    if (start > latestStart) latestStart = start;
    if (end < earliestEnd) earliestEnd = end;
  }

  if (latestStart > earliestEnd) {
    return null;
  }

  return {
    start_date: latestStart.toISOString().slice(0, 10),
    end_date: earliestEnd.toISOString().slice(0, 10)
  };
}

function collectStrictTags(participants: AggregatedConstraints["perParticipant"], kind: "dietary" | "accessibility") {
  const tags = new Set<string>();
  for (const participant of participants) {
    const record = participant[kind] as Record<string, unknown>;
    for (const [key, value] of Object.entries(record)) {
      if (value === true) {
        tags.add(key);
      }
    }
  }
  return [...tags];
}

export async function aggregateConstraints(tripId: string): Promise<AggregatedConstraints> {
  const { data, error } = await supabase
    .from("trip_participants")
    .select(
      "id,name,email,participant_preferences(id,preferred_trip_length,flexibility_notes,departure_location,alternative_locations,max_travel_time_hours,transport_preference,total_budget,trip_preferences,accessibility,dietary,sustainability,passport_nationality,residence_country,visa_notes,availability_windows(start_date,end_date))"
    )
    .eq("trip_id", tripId);

  if (error) {
    throw new Error(`Failed to aggregate constraints: ${error.message}`);
  }

  const rows = (data ?? []) as ParticipantRow[];
  const validRows = rows.filter((row) => row.participant_preferences.length > 0);

  const participantCount = rows.length;
  const participants = validRows.map((row) => {
    const pref = row.participant_preferences[0];
    return {
      participantId: row.id,
      name: row.name,
      departure: pref.departure_location,
      maxTravelTimeHours: pref.max_travel_time_hours,
      transportPreference: pref.transport_preference,
      budget: pref.total_budget,
      accessibility: pref.accessibility as AggregatedConstraints["perParticipant"][number]["accessibility"],
      dietary: pref.dietary as AggregatedConstraints["perParticipant"][number]["dietary"],
      sustainability: pref.sustainability as AggregatedConstraints["perParticipant"][number]["sustainability"],
      nationality: pref.passport_nationality,
      residenceCountry: pref.residence_country
    };
  });

  const preferenceScores: Record<TripPreferenceTag, number> = {
    beach: 0,
    city: 0,
    nature: 0,
    adventure: 0,
    relaxation: 0,
    nightlife: 0,
    culture: 0
  };

  let trainVotes = 0;
  let planeVotes = 0;
  let sustainabilityScore = 0;
  let budgetSum = 0;

  for (const row of validRows) {
    const pref = row.participant_preferences[0];
    budgetSum += pref.total_budget;
    for (const tag of pref.trip_preferences) {
      preferenceScores[tag] += 1;
    }
    if (pref.transport_preference === "train") trainVotes += 1;
    if (pref.transport_preference === "plane") planeVotes += 1;
    if (pref.sustainability?.prefer_train_over_plane) sustainabilityScore += 1;
    if (pref.sustainability?.willing_longer_for_lower_emissions) sustainabilityScore += 1;
    if (pref.sustainability?.prefer_eco_accommodation) sustainabilityScore += 1;
    if (pref.sustainability?.sustainable_activities) sustainabilityScore += 1;
  }

  const windowsPerPerson = validRows.map((row) => row.participant_preferences[0].availability_windows ?? []);

  return {
    tripId,
    participantCount,
    participantIds: rows.map((row) => row.id),
    hardConstraints: {
      overlappingDates: overlapWindows(windowsPerPerson),
      maxBudgetPerPerson: validRows.length > 0 ? Math.round(budgetSum / validRows.length) : 800,
      strictDietaryTags: collectStrictTags(participants, "dietary"),
      strictAccessibility: collectStrictTags(participants, "accessibility")
    },
    softPreferences: {
      preferenceScores,
      transportBias: trainVotes === planeVotes ? "mixed" : trainVotes > planeVotes ? "train" : "plane",
      sustainabilityScore
    },
    perParticipant: participants
  };
}

export function generateDestinationCandidates(constraints: AggregatedConstraints): DestinationCandidate[] {
  const topTags = Object.entries(constraints.softPreferences.preferenceScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag as TripPreferenceTag);

  const scoreFor = (candidate: (typeof DESTINATIONS)[number]) => {
    const preferenceMatch = topTags.reduce((acc, tag) => acc + (candidate.tags.includes(tag) ? 15 : 0), 0);
    const budgetFit = constraints.hardConstraints.maxBudgetPerPerson - candidate.avgDailyCost * 4;
    const budgetScore = budgetFit >= 0 ? 25 : Math.max(-20, budgetFit / 10);
    const transportScore =
      constraints.softPreferences.transportBias === "train" ? (candidate.trainFriendly ? 20 : -10) : 10;
    const sustainabilityBoost = Math.round((constraints.softPreferences.sustainabilityScore / Math.max(1, constraints.participantCount * 4)) * candidate.ecoScore);
    return preferenceMatch + budgetScore + transportScore + sustainabilityBoost + candidate.accessibilityScore / 4;
  };

  return DESTINATIONS.map((destination) => ({
    ...destination,
    matchScore: scoreFor(destination)
  })).sort((a, b) => b.matchScore - a.matchScore);
}

export function generateTransportPlan(destination: DestinationCandidate, constraints: AggregatedConstraints) {
  return constraints.perParticipant.map((participant) => {
    const chooseTrain =
      participant.transportPreference === "train" ||
      (participant.transportPreference === "either" && destination.trainFriendly && participant.sustainability.prefer_train_over_plane);

    const mode: "train" | "plane" = chooseTrain ? "train" : "plane";
    const durationHours = mode === "train" ? Math.min(14, participant.maxTravelTimeHours + 2) : Math.min(8, participant.maxTravelTimeHours);
    const estimatedCost = mode === "train" ? 90 + destination.avgDailyCost * 0.25 : 120 + destination.avgDailyCost * 0.35;

    return {
      participantId: participant.participantId,
      mode,
      departure: participant.departure,
      durationHours,
      details: `${mode === "train" ? "Rail" : "Flight"} from ${participant.departure} to ${destination.destination}`,
      estimatedCost: Math.round(estimatedCost),
      emissionsLevel: (mode === "train" ? "low" : destination.ecoScore > 75 ? "medium" : "high") as
        | "low"
        | "medium"
        | "high"
    };
  });
}

export function generateAccommodationOption(destination: DestinationCandidate, constraints: AggregatedConstraints) {
  const candidates = ACCOMMODATIONS.filter((item) => item.destination === destination.destination);
  const needsWheelchair = constraints.hardConstraints.strictAccessibility.includes("wheelchair_accessible");
  const needsLift = constraints.hardConstraints.strictAccessibility.includes("lift_access");
  const preferEco = constraints.perParticipant.some((participant) => participant.sustainability.prefer_eco_accommodation);

  const ranked = candidates
    .map((item) => {
      let score = 0;
      if (needsWheelchair && item.accessibilityFeatures.includes("wheelchair")) score += 30;
      if (needsLift && item.accessibilityFeatures.includes("lift")) score += 20;
      if (preferEco) score += item.ecoRating * 6;
      score -= Math.max(0, item.nightlyCost - constraints.hardConstraints.maxBudgetPerPerson / 4);
      return { ...item, score };
    })
    .sort((a, b) => b.score - a.score);

  return ranked[0] ?? {
    destination: destination.destination,
    name: "Flexible Stay",
    description: "Fallback centrally located stay.",
    nightlyCost: Math.round(destination.avgDailyCost * 0.7),
    accessibilityFeatures: ["step_free"],
    ecoRating: 3,
    score: 0
  };
}

export function generateRestaurantRecommendations(destination: DestinationCandidate, constraints: AggregatedConstraints) {
  const strictDietary = constraints.hardConstraints.strictDietaryTags;
  const avgBudget = constraints.hardConstraints.maxBudgetPerPerson;
  const maxMealCost = avgBudget / 8;

  const destinationRestaurants = RESTAURANTS.filter((restaurant) => restaurant.destination === destination.destination);

  const strictMatches = destinationRestaurants
    .filter((restaurant) => {
      const dietaryMatch =
        strictDietary.length === 0 || strictDietary.some((tag) => restaurant.dietaryTags.includes(tag));
      const budgetMatch = restaurant.baseCost <= maxMealCost + 12;
      return dietaryMatch && budgetMatch;
    })
    .slice(0, 4);

  const fallback = destinationRestaurants
    .filter((restaurant) => restaurant.baseCost <= maxMealCost + 18)
    .slice(0, 4);

  const merged = [...strictMatches, ...fallback].filter(
    (restaurant, index, arr) => arr.findIndex((item) => item.name === restaurant.name) === index
  );

  return merged.slice(0, 4).map((restaurant) => ({
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      priceBand: restaurant.priceBand,
      dietaryTags: restaurant.dietaryTags,
      explanation:
        strictDietary.length > 0 && strictDietary.some((tag) => restaurant.dietaryTags.includes(tag))
          ? `Matches group needs for ${strictDietary.slice(0, 2).join(", ")} within target meal budget.`
          : "Budget-aligned backup with partially compatible dietary coverage.",
      estimatedCostPerPerson: restaurant.baseCost
    }));
}

export function generateItinerary(destination: DestinationCandidate, constraints: AggregatedConstraints) {
  const activities = ACTIVITIES.find((entry) => entry.destination === destination.destination)?.items ?? [];
  const prefersSustainable = constraints.perParticipant.some((participant) => participant.sustainability.sustainable_activities);
  const reducedWalking = constraints.hardConstraints.strictAccessibility.includes("reduced_walking");

  const filtered = activities.filter((activity) => {
    if (prefersSustainable && !activity.sustainable) return false;
    if (reducedWalking && activity.accessibility === "low") return false;
    return true;
  });

  const days = Math.max(3, Math.min(6, Math.round(constraints.hardConstraints.maxBudgetPerPerson / 220)));
  return Array.from({ length: days }).map((_, idx) => {
    const item = filtered[idx % Math.max(1, filtered.length)] ?? activities[0];
    return {
      dayNumber: idx + 1,
      title: item?.title ?? "Flexible free day",
      description: `Day ${idx + 1} in ${destination.destination}: ${item?.title ?? "Light city exploration"}.`,
      activityType: item?.type ?? "city",
      isSustainable: item?.sustainable ?? false,
      accessibilityLevel: (item?.accessibility as "high" | "medium" | "low") ?? "medium",
      estimatedCost: item?.cost ?? 20
    };
  });
}

export function generateVisaAssessments(destination: DestinationCandidate, constraints: AggregatedConstraints) {
  return constraints.perParticipant.map((participant) => {
    const isEUTrip = ["Portugal", "Netherlands", "Croatia", "Denmark", "Slovenia"].includes(destination.country);
    const ukOrEu = ["United Kingdom", "UK", "Ireland", "France", "Germany", "Spain", "Italy"].includes(
      participant.residenceCountry
    );

    const outcome = isEUTrip && ukOrEu ? "visa_free" : isEUTrip ? "evisa" : "check_required";
    const summary =
      outcome === "visa_free"
        ? `Likely visa-free short stay for ${participant.nationality}.`
        : outcome === "evisa"
          ? `Likely eVisa required for ${participant.nationality}.`
          : `Manual embassy check required for ${participant.nationality}.`;

    return {
      nationality: participant.nationality,
      outcome,
      summary
    } as const;
  });
}

export function generateBudgetAssessment(
  _destination: DestinationCandidate,
  constraints: AggregatedConstraints,
  transportPlans: ReturnType<typeof generateTransportPlan>,
  accommodation: ReturnType<typeof generateAccommodationOption>,
  restaurants: ReturnType<typeof generateRestaurantRecommendations>,
  itinerary: ReturnType<typeof generateItinerary>
) {
  const nights = Math.max(2, itinerary.length - 1);
  const transport = transportPlans.reduce((sum, plan) => sum + plan.estimatedCost, 0);
  const accommodationTotal = accommodation.nightlyCost * nights * Math.max(1, constraints.participantCount / 2);
  const food = restaurants.reduce((sum, restaurant) => sum + restaurant.estimatedCostPerPerson * constraints.participantCount, 0);
  const activities = itinerary.reduce((sum, day) => sum + day.estimatedCost * constraints.participantCount, 0);
  const total = Math.round(transport + accommodationTotal + food + activities);

  return {
    total,
    perPerson: Math.round(total / Math.max(1, constraints.participantCount)),
    breakdown: {
      transport: Math.round(transport),
      accommodation: Math.round(accommodationTotal),
      food: Math.round(food),
      activities: Math.round(activities)
    }
  };
}

export function generateOptionSetFromConstraints(constraints: AggregatedConstraints) {
  const ranked = generateDestinationCandidates(constraints);
  if (ranked.length < 3) {
    throw new Error("Not enough destination candidates to generate 3 options.");
  }

  const usedDestinations = new Set<string>();
  const selectDistinct = (orderedCandidates: DestinationCandidate[]) => {
    const candidate = orderedCandidates.find((item) => !usedDestinations.has(item.destination)) ?? orderedCandidates[0];
    usedDestinations.add(candidate.destination);
    return candidate;
  };

  const cheapest = selectDistinct([...ranked].sort((a, b) => a.avgDailyCost - b.avgDailyCost));
  const bestMatch = selectDistinct(ranked);
  const mostSustainable = selectDistinct([...ranked].sort((a, b) => b.ecoScore - a.ecoScore));

  return [
    buildOption(1, "cheapest", cheapest, constraints),
    buildOption(2, "best_match", bestMatch, constraints),
    buildOption(3, "most_sustainable", mostSustainable, constraints)
  ];
}

function normalizeDestination(destination: string) {
  return destination.trim().toLowerCase();
}

function enforceDistinctOptionDestinations(options: GeneratedOption[], constraints: AggregatedConstraints) {
  const ranked = generateDestinationCandidates(constraints);
  const usedDestinations = new Set<string>();

  return options.map((option, index) => {
    const currentKey = normalizeDestination(option.destination);
    if (!usedDestinations.has(currentKey)) {
      usedDestinations.add(currentKey);
      return { ...option, optionRank: index + 1 };
    }

    const replacement = ranked.find((candidate) => !usedDestinations.has(normalizeDestination(candidate.destination)));
    if (!replacement) {
      return { ...option, optionRank: index + 1 };
    }

    usedDestinations.add(normalizeDestination(replacement.destination));
    return buildOption(index + 1, option.theme, replacement, constraints);
  });
}

export function validateTripOption(option: Omit<GeneratedOption, "validationNotes">, constraints: AggregatedConstraints) {
  const notes: string[] = [];

  if (option.estimatedPerPerson > constraints.hardConstraints.maxBudgetPerPerson + 150) {
    notes.push("Estimated cost is above average declared budget.");
  }
  if (constraints.hardConstraints.strictDietaryTags.length > 0 && option.restaurants.length < 2) {
    notes.push("Limited restaurant matches for all dietary requirements.");
  }
  if (
    constraints.hardConstraints.strictAccessibility.includes("wheelchair_accessible") &&
    !option.accommodation.accessibilityFeatures.some((feature) => feature.includes("wheelchair"))
  ) {
    notes.push("Accommodation has limited wheelchair-ready details.");
  }
  if (notes.length === 0) {
    notes.push("All major constraints satisfied for MVP confidence.");
  }

  return notes;
}

function buildOption(
  optionRank: number,
  theme: GeneratedOption["theme"],
  destination: DestinationCandidate,
  constraints: AggregatedConstraints
): GeneratedOption {
  const transportPlans = generateTransportPlan(destination, constraints);
  const accommodation = generateAccommodationOption(destination, constraints);
  const restaurants = generateRestaurantRecommendations(destination, constraints);
  const itinerary = generateItinerary(destination, constraints);
  const visaSummaries = generateVisaAssessments(destination, constraints);
  const budget = generateBudgetAssessment(destination, constraints, transportPlans, accommodation, restaurants, itinerary);

  const base: Omit<GeneratedOption, "validationNotes"> = {
    optionRank,
    theme,
    destination: destination.destination,
    startDate: constraints.hardConstraints.overlappingDates?.start_date ?? new Date().toISOString().slice(0, 10),
    endDate: constraints.hardConstraints.overlappingDates?.end_date ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString().slice(0, 10),
    summary:
      theme === "cheapest"
        ? "Budget-first route with practical logistics and good baseline coverage."
        : theme === "most_sustainable"
          ? "Lower-emission route prioritizing rail and eco stays."
          : "Balanced option optimized for strongest group preferences.",
    rationale:
      theme === "cheapest"
        ? "Prioritizes low daily costs and shorter transfers."
        : theme === "most_sustainable"
          ? "Maximizes train-friendly and eco-scored choices."
          : "Scores highest against group preference tags and accessibility compatibility.",
    estimatedTotal: budget.total,
    estimatedPerPerson: budget.perPerson,
    tradeoffs:
      theme === "cheapest"
        ? ["Lower-end accommodation comfort", "Potentially fewer premium dining options"]
        : theme === "most_sustainable"
          ? ["Possibly longer travel times", "Can cost slightly more"]
          : ["Middle-ground pricing", "Not always the lowest emissions path"],
    transportPlans,
    accommodation: {
      name: accommodation.name,
      description: accommodation.description,
      nightlyCost: accommodation.nightlyCost,
      accessibilityFeatures: accommodation.accessibilityFeatures,
      ecoRating: accommodation.ecoRating
    },
    restaurants,
    visaSummaries,
    itinerary,
    budgetBreakdown: budget.breakdown
  };

  return {
    ...base,
    validationNotes: validateTripOption(base, constraints)
  };
}

export async function generateTripOptions(
  tripId: string,
  onProgress?: (stepId: string, status: "in-progress" | "complete" | "error", message?: string) => void
) {
  const updateProgress = (stepId: string, status: "in-progress" | "complete" | "error", message?: string) => {
    onProgress?.(stepId, status, message);
  };

  updateProgress("gather-preferences", "in-progress");
  const constraints = await aggregateConstraints(tripId);
  updateProgress("gather-preferences", "complete");

  updateProgress("find-dates", "in-progress");
  await new Promise((resolve) => setTimeout(resolve, 800));
  updateProgress("find-dates", "complete");

  updateProgress("select-destination", "in-progress");
  let options: GeneratedOption[];

  if (isAiPlannerEnabled()) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      options = await generateTripOptionsWithLLM(constraints);
      updateProgress("select-destination", "complete");

      updateProgress("plan-transport", "in-progress");
      await new Promise((resolve) => setTimeout(resolve, 800));
      updateProgress("plan-transport", "complete");

      updateProgress("find-accommodation", "in-progress");
      await new Promise((resolve) => setTimeout(resolve, 800));
      updateProgress("find-accommodation", "complete");

      updateProgress("arrange-dining", "in-progress");
      await new Promise((resolve) => setTimeout(resolve, 600));
      updateProgress("arrange-dining", "complete");

      updateProgress("check-visas", "in-progress");
      await new Promise((resolve) => setTimeout(resolve, 600));
      updateProgress("check-visas", "complete");
    } catch (error) {
      console.warn("AI planner failed; falling back to deterministic planner:", error);
      updateProgress("select-destination", "error", String(error));
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateProgress("select-destination", "in-progress");
      options = generateOptionSetFromConstraints(constraints);
      updateProgress("select-destination", "complete");
      updateProgress("plan-transport", "complete");
      updateProgress("find-accommodation", "complete");
      updateProgress("arrange-dining", "complete");
      updateProgress("check-visas", "complete");
    }
  } else {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    options = generateOptionSetFromConstraints(constraints);
    updateProgress("select-destination", "complete");
    updateProgress("plan-transport", "complete");
    updateProgress("find-accommodation", "complete");
    updateProgress("arrange-dining", "complete");
    updateProgress("check-visas", "complete");
  }

  options = enforceDistinctOptionDestinations(options, constraints);

  const { data: existingOptions } = await supabase.from("trip_options").select("id").eq("trip_id", tripId);
  const existingIds = (existingOptions ?? []).map((row: { id: string }) => row.id);
  
  if (existingIds.length > 0) {
    // Delete related records first
    await supabase.from("transport_plans").delete().in("trip_option_id", existingIds);
    await supabase.from("accommodation_options").delete().in("trip_option_id", existingIds);
    await supabase.from("restaurant_recommendations").delete().in("trip_option_id", existingIds);
    await supabase.from("visa_assessments").delete().in("trip_option_id", existingIds);
    await supabase.from("itinerary_days").delete().in("trip_option_id", existingIds);
    await supabase.from("activity_recommendations").delete().in("trip_option_id", existingIds);
    
    // Then delete trip options
    await supabase.from("trip_options").delete().in("id", existingIds);
  }

  updateProgress("save-results", "in-progress");
  for (const option of options) {
    // Fetch destination image
    const imageUrl = await fetchDestinationImage(option.destination);

    const optionPayload = {
      trip_id: tripId,
      option_rank: option.optionRank,
      theme: option.theme,
      destination: option.destination,
      start_date: option.startDate,
      end_date: option.endDate,
      summary: option.summary,
      rationale: option.rationale,
      estimated_total: option.estimatedTotal,
      estimated_per_person: option.estimatedPerPerson,
      tradeoffs: option.tradeoffs,
      validation_notes: option.validationNotes,
      budget_breakdown: option.budgetBreakdown
    };

    let insertedOption: { id: string } | null = null;
    let optionError: { message: string } | null = null;

    const insertWithImage = await supabase
      .from("trip_options")
      .upsert({
        ...optionPayload,
        image_url: imageUrl
      }, {
        onConflict: "trip_id,option_rank"
      })
      .select("id")
      .single();

    insertedOption = insertWithImage.data as { id: string } | null;
    optionError = insertWithImage.error ? { message: insertWithImage.error.message } : null;

    if (optionError?.message.includes("image_url")) {
      const insertWithoutImage = await supabase
        .from("trip_options")
        .upsert(optionPayload, {
          onConflict: "trip_id,option_rank"
        })
        .select("id")
        .single();

      insertedOption = insertWithoutImage.data as { id: string } | null;
      optionError = insertWithoutImage.error ? { message: insertWithoutImage.error.message } : null;
    }

    if (optionError || !insertedOption) {
      throw new Error(optionError?.message ?? "Failed to insert trip option");
    }

    const tripOptionId = insertedOption.id as string;

    await Promise.all([
      supabase.from("transport_plans").insert(
        option.transportPlans.map((plan) => ({
          trip_option_id: tripOptionId,
          participant_id: plan.participantId,
          mode: plan.mode,
          departure: plan.departure,
          duration_hours: plan.durationHours,
          details: plan.details,
          estimated_cost: plan.estimatedCost,
          emissions_level: plan.emissionsLevel
        }))
      ),
      supabase.from("accommodation_options").insert({
        trip_option_id: tripOptionId,
        name: option.accommodation.name,
        description: option.accommodation.description,
        nightly_cost: option.accommodation.nightlyCost,
        accessibility_features: option.accommodation.accessibilityFeatures,
        eco_rating: option.accommodation.ecoRating
      }),
      supabase.from("restaurant_recommendations").insert(
        option.restaurants.map((restaurant) => ({
          trip_option_id: tripOptionId,
          name: restaurant.name,
          cuisine: restaurant.cuisine,
          price_band: restaurant.priceBand,
          dietary_tags: restaurant.dietaryTags,
          explanation: restaurant.explanation,
          estimated_cost_pp: restaurant.estimatedCostPerPerson
        }))
      ),
      supabase.from("visa_assessments").insert(
        option.visaSummaries.map((visa) => ({
          trip_option_id: tripOptionId,
          nationality: visa.nationality,
          outcome: visa.outcome,
          summary: visa.summary
        }))
      ),
      supabase.from("itinerary_days").insert(
        option.itinerary.map((day) => ({
          trip_option_id: tripOptionId,
          day_number: day.dayNumber,
          title: day.title,
          description: day.description,
          activity_type: day.activityType,
          is_sustainable: day.isSustainable,
          accessibility_level: day.accessibilityLevel,
          estimated_cost: day.estimatedCost
        }))
      )
    ]);

    await supabase.from("activity_recommendations").insert(
      option.itinerary.map((day) => ({
        trip_option_id: tripOptionId,
        title: day.title,
        category: day.activityType,
        sustainability_score: day.isSustainable ? 5 : 2,
        accessibility_notes: day.accessibilityLevel === "high" ? "step-free friendly" : "check in advance"
      }))
    );
  }

  updateProgress("save-results", "complete");
  return options;
}
