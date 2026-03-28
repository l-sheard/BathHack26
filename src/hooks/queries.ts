import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generateTripOptions } from "../services/generation/agents";
import {
  castVote,
  createTrip,
  getBookingProgress,
  getParticipantPreferences,
  getTrip,
  getTripOptions,
  getTripParticipants,
  getVotes,
  joinTrip,
  upsertBookingProgress,
  upsertParticipantPreferences
} from "../services/tripService";
import type { PreferencesFormValues } from "../schemas/preferencesSchema";

export function useTrip(tripId: string) {
  return useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => getTrip(tripId),
    enabled: Boolean(tripId)
  });
}

export function useTripParticipants(tripId: string) {
  return useQuery({
    queryKey: ["participants", tripId],
    queryFn: () => getTripParticipants(tripId),
    enabled: Boolean(tripId)
  });
}

export function useTripOptions(tripId: string) {
  return useQuery({
    queryKey: ["trip-options", tripId],
    queryFn: () => getTripOptions(tripId),
    enabled: Boolean(tripId)
  });
}

export function useVotes(tripId: string) {
  return useQuery({
    queryKey: ["votes", tripId],
    queryFn: () => getVotes(tripId),
    enabled: Boolean(tripId)
  });
}

export function useBookingProgress(tripId: string) {
  return useQuery({
    queryKey: ["booking-progress", tripId],
    queryFn: () => getBookingProgress(tripId),
    enabled: Boolean(tripId)
  });
}

export function useParticipantPreferences(participantId: string) {
  return useQuery({
    queryKey: ["participant-preferences", participantId],
    queryFn: () => getParticipantPreferences(participantId),
    enabled: Boolean(participantId)
  });
}

export function useCreateTrip() {
  return useMutation({
    mutationFn: createTrip
  });
}

export function useJoinTrip() {
  return useMutation({
    mutationFn: ({ tripId, name, email, shareCode }: { tripId: string; name: string; email?: string; shareCode: string }) =>
      joinTrip(tripId, { name, email, shareCode })
  });
}

export function useSavePreferences(tripId: string, participantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: PreferencesFormValues) => upsertParticipantPreferences(tripId, participantId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participant-preferences", participantId] });
      queryClient.invalidateQueries({ queryKey: ["participants", tripId] });
    }
  });
}

export function useGenerateOptions(tripId: string, onProgress?: (stepId: string, status: "in-progress" | "complete" | "error", message?: string) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => generateTripOptions(tripId, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip-options", tripId] });
      queryClient.invalidateQueries({ queryKey: ["votes", tripId] });
    }
  });
}

export function useCastVote(tripId: string, participantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tripOptionId: string) => castVote(tripId, participantId, tripOptionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["votes", tripId] })
  });
}

export function useSaveBookingProgress(tripId: string, participantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: {
      transport_booked: boolean;
      accommodation_booked: boolean;
      visa_arranged: boolean;
      insurance_arranged: boolean;
    }) => upsertBookingProgress(tripId, participantId, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["booking-progress", tripId] })
  });
}
