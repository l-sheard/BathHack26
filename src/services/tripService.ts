import { supabase } from "../lib/supabase";
import { randomCode } from "../lib/utils";
import type { PreferencesFormValues } from "../schemas/preferencesSchema";

export async function createTrip(input: {
  name: string;
  description?: string;
}) {
  const shareCode = randomCode(8);
  const { data, error } = await supabase
    .from("trips")
    .insert({
      name: input.name,
      description: input.description,
      start_date: null,
      end_date: null,
      share_code: shareCode
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getTrip(tripId: string) {
  const { data, error } = await supabase.from("trips").select("*").eq("id", tripId).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function joinTrip(
  tripId: string,
  payload: {
    name: string;
    email?: string;
    shareCode: string;
  }
) {
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id,share_code,start_date,end_date")
    .eq("id", tripId)
    .single();
  if (tripError) throw new Error("Trip not found");
  if (trip.share_code !== payload.shareCode) throw new Error("Invalid join code");

  const { data: participant, error } = await supabase
    .from("trip_participants")
    .insert({
      trip_id: tripId,
      name: payload.name,
      email: payload.email || null
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("booking_progress").insert({
    trip_id: tripId,
    participant_id: participant.id,
    transport_booked: false,
    accommodation_booked: false,
    visa_arranged: false,
    insurance_arranged: false
  });

  const fallbackStart = trip.start_date ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 10);
  const fallbackEnd =
    trip.end_date ??
    new Date(new Date(fallbackStart).getTime() + 1000 * 60 * 60 * 24 * 4).toISOString().slice(0, 10);

  const { data: preference, error: preferenceError } = await supabase
    .from("participant_preferences")
    .insert({
      trip_id: tripId,
      participant_id: participant.id,
      preferred_trip_length: 4,
      flexibility_notes: null,
      departure_location: "London Heathrow (LHR)",
      alternative_locations: [],
      max_travel_time_hours: 8,
      transport_preference: "either",
      total_budget: 900,
      trip_preferences: ["city", "culture", "relaxation"],
      accessibility: {
        ground_floor: false,
        lift_access: false,
        step_free_access: false,
        wheelchair_accessible: false,
        accessible_bathroom: false,
        reduced_walking: false,
        close_to_public_transport: true,
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
        sustainable_activities: false
      },
      passport_nationality: "British",
      residence_country: "United Kingdom",
      visa_notes: null
    })
    .select("id")
    .single();

  if (preferenceError) {
    throw new Error(preferenceError.message);
  }

  const { error: availabilityError } = await supabase.from("availability_windows").insert({
    participant_preference_id: preference.id,
    start_date: fallbackStart,
    end_date: fallbackEnd
  });

  if (availabilityError) {
    throw new Error(availabilityError.message);
  }

  return participant;
}

export async function upsertParticipantPreferences(
  tripId: string,
  participantId: string,
  values: PreferencesFormValues
) {
  const { data: existing, error: existingError } = await supabase
    .from("participant_preferences")
    .select("id")
    .eq("participant_id", participantId)
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);

  const payload = {
    trip_id: tripId,
    participant_id: participantId,
    preferred_trip_length: values.preferred_trip_length,
    flexibility_notes: values.flexibility_notes || null,
    departure_location: values.departure_location,
    alternative_locations: values.alternative_locations,
    max_travel_time_hours: values.max_travel_time_hours,
    transport_preference: values.transport_preference,
    total_budget: values.total_budget,
    trip_preferences: values.trip_preferences,
    accessibility: values.accessibility,
    dietary: values.dietary,
    sustainability: values.sustainability,
    passport_nationality: values.passport_nationality,
    residence_country: values.residence_country,
    visa_notes: values.visa_notes || null
  };

  let preferenceId = existing?.id as string | undefined;

  if (!existing) {
    const { data: inserted, error: insertError } = await supabase
      .from("participant_preferences")
      .insert(payload)
      .select("id")
      .single();
    if (insertError) throw new Error(insertError.message);
    preferenceId = inserted.id as string;
  } else {
    const { error: updateError } = await supabase
      .from("participant_preferences")
      .update(payload)
      .eq("id", existing.id);
    if (updateError) throw new Error(updateError.message);
  }

  if (!preferenceId) throw new Error("Failed to resolve participant preferences");

  await supabase.from("availability_windows").delete().eq("participant_preference_id", preferenceId);

  const { error: availabilityError } = await supabase.from("availability_windows").insert(
    values.availability_windows.map((window: { start_date: string; end_date: string }) => ({
      participant_preference_id: preferenceId,
      start_date: window.start_date,
      end_date: window.end_date
    }))
  );

  if (availabilityError) throw new Error(availabilityError.message);

  return { id: preferenceId };
}

export async function getParticipantPreferences(participantId: string) {
  const { data, error } = await supabase
    .from("participant_preferences")
    .select("*,availability_windows(*)")
    .eq("participant_id", participantId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getTripParticipants(tripId: string) {
  const { data, error } = await supabase
    .from("trip_participants")
    .select("id,name,email,joined_at,participant_preferences(id)")
    .eq("trip_id", tripId)
    .order("joined_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTripOptions(tripId: string) {
  const { data, error } = await supabase
    .from("trip_options")
    .select(
      "*,transport_plans(*),accommodation_options(*),restaurant_recommendations(*),visa_assessments(*),itinerary_days(*)"
    )
    .eq("trip_id", tripId)
    .order("option_rank", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function castVote(tripId: string, participantId: string, tripOptionId: string) {
  const { error } = await supabase.from("votes").upsert(
    {
      trip_id: tripId,
      participant_id: participantId,
      trip_option_id: tripOptionId
    },
    { onConflict: "trip_id,participant_id" }
  );

  if (error) throw new Error(error.message);
}

export async function getVotes(tripId: string) {
  const { data, error } = await supabase.from("votes").select("*").eq("trip_id", tripId);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getBookingProgress(tripId: string) {
  const { data, error } = await supabase
    .from("booking_progress")
    .select("*,trip_participants(name)")
    .eq("trip_id", tripId);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function upsertBookingProgress(
  tripId: string,
  participantId: string,
  updates: {
    transport_booked: boolean;
    accommodation_booked: boolean;
    visa_arranged: boolean;
    insurance_arranged: boolean;
  }
) {
  const { error } = await supabase.from("booking_progress").upsert(
    {
      trip_id: tripId,
      participant_id: participantId,
      ...updates
    },
    { onConflict: "trip_id,participant_id" }
  );

  if (error) throw new Error(error.message);
}
