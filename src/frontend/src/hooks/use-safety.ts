import {
  type CheckInReminder,
  type CheckInReminderStatus,
  type FakeCall,
  createActor,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const fakeCallKey = ["fakeCall"] as const;
const discreetKey = ["discreetMode"] as const;
const checkInKey = ["checkInReminder"] as const;
const checkInStatusKey = ["checkInReminderStatus"] as const;
const adminKey = ["isAdmin"] as const;

/**
 * Read the current fake-call state, or null when no fake call is active.
 */
export function useFakeCall() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: fakeCallKey,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getFakeCall();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Start a fake incoming call, then refresh the fake-call state. */
export function useStartFakeCall() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.startFakeCall();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: fakeCallKey });
    },
  });
}

/** End the active fake call, then refresh the fake-call state. */
export function useStopFakeCall() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.stopFakeCall();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: fakeCallKey });
    },
  });
}

/** Read whether discreet mode is currently enabled. */
export function useDiscreetMode() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: discreetKey,
    queryFn: async () => {
      if (!actor) return false;
      return actor.getDiscreetMode();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Enable or disable discreet mode, then refresh its state. */
export function useSetDiscreetMode() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.setDiscreetMode(enabled);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: discreetKey });
    },
  });
}

/** Read the current auto check-in reminder, or null when none is set. */
export function useCheckInReminder() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: checkInKey,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCheckInReminder();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Set the auto check-in reminder interval in seconds, then refresh it. */
export function useSetCheckInReminder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (intervalSec: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.setCheckInReminder(intervalSec);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: checkInKey });
    },
  });
}

/**
 * Poll the live check-in reminder status, which reports whether the reminder
 * interval has elapsed since the last check-in (overdue) and when it became
 * overdue. Used to detect a missed check-in so trusted contacts can be
 * notified.
 */
export function useCheckInReminderStatus() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: checkInStatusKey,
    queryFn: async () => {
      if (!actor) return null;
      return actor.checkInReminderStatus();
    },
    enabled: !!actor && !isFetching,
    // Poll so a missed check-in is detected promptly and contacts are notified.
    refetchInterval: 15000,
  });
}

/**
 * Mark the current check-in as done, refreshing the reminder's last-sent time
 * so the overdue state clears. Returns the refreshed reminder, or null when
 * none is set.
 */
export function useMarkCheckIn() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.markCheckIn();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: checkInStatusKey });
      void queryClient.invalidateQueries({ queryKey: checkInKey });
    },
  });
}

/**
 * Whether the signed-in caller holds the admin role. Used to gate admin-only
 * navigation entries in the app shell.
 */
export function useIsAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: adminKey,
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export type { CheckInReminder, CheckInReminderStatus, FakeCall };
