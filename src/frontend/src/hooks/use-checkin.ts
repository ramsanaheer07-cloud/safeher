import {
  type ActiveCheckIn,
  type CheckInEvent,
  type LocationSnapshot,
  createActor,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const checkInStateKey = ["checkInState"] as const;
const checkInHistoryKey = ["checkInHistory"] as const;
const checkInHistoryForKey = ["checkInHistoryFor"] as const;

/**
 * Read the caller's active check-in state, or null when checked out.
 */
export function useCheckInState() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: checkInStateKey,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCheckInState();
    },
    enabled: !!actor && !isFetching,
  });
}

/**
 * Read the caller's check-in / check-out history, newest first.
 */
export function useCheckInHistory() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: checkInHistoryKey,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCheckInHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

/**
 * Read the check-in / check-out history of a trusted contact. The caller must
 * be a trusted contact of the target user for the backend to authorize the
 * call. The principal is converted to a string in the query key because React
 * Query cannot serialize Principal objects.
 */
export function useCheckInHistoryFor(principal: Principal | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: [...checkInHistoryForKey, principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getCheckInHistoryFor(principal);
    },
    enabled: !!actor && !isFetching && principal !== undefined,
  });
}

/**
 * Perform a standalone check-in at the given location, then refresh the active
 * state and history.
 */
export function usePerformCheckIn() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (location: LocationSnapshot): Promise<ActiveCheckIn> => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.checkIn(location);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: checkInStateKey });
      void queryClient.invalidateQueries({ queryKey: checkInHistoryKey });
    },
  });
}

/**
 * Perform a standalone check-out at the given location, then refresh the active
 * state and history.
 */
export function usePerformCheckOut() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      location: LocationSnapshot,
    ): Promise<CheckInEvent | null> => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.checkOut(location);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: checkInStateKey });
      void queryClient.invalidateQueries({ queryKey: checkInHistoryKey });
    },
  });
}

export type { ActiveCheckIn, CheckInEvent };
