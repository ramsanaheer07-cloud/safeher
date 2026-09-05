import { createActor } from "@/backend";
import type { LocationSnapshot, SafetyTimer } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const TIMER_KEY = ["timer"] as const;
const LOCATION_KEY = ["location"] as const;

/**
 * Convert a Motoko nanosecond timestamp to a JS Date. Returns null when the
 * value is out of range so callers can render a safe fallback.
 */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Read the caller's current safety timer (or null when none is active).
 */
export function useTimer() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: TIMER_KEY,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTimer();
    },
    enabled: !!actor && !isFetching,
  });
}

/**
 * Start a safety timer for the given duration in seconds.
 */
export function useStartTimer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (durationSec: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.startTimer(durationSec);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TIMER_KEY });
    },
  });
}

/**
 * Check in with a fresh location snapshot while the timer is active. Calls the
 * safety-timer check-in method (renamed from checkIn to timerCheckIn in the
 * backend to make room for the standalone check-in feature).
 */
export function useCheckIn() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (location: LocationSnapshot) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.timerCheckIn(location);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TIMER_KEY });
    },
  });
}

/**
 * Extend the active timer by the given number of seconds.
 */
export function useExtendTimer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (extraSec: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.extendTimer(extraSec);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TIMER_KEY });
    },
  });
}

/**
 * Stop the active timer early.
 */
export function useStopTimer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.stopTimer();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TIMER_KEY });
    },
  });
}

/**
 * Read the most recently captured location snapshot from the backend.
 */
export function useGetLocation() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: LOCATION_KEY,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLocation();
    },
    enabled: !!actor && !isFetching,
  });
}

/**
 * Resolve the browser's current position into a LocationSnapshot ready for the
 * backend. Rejects when geolocation is unavailable or permission is denied.
 */
export function getCurrentLocation(): Promise<LocationSnapshot> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported on this device."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyM: position.coords.accuracy,
          capturedAtNs: BigInt(Date.now()) * 1_000_000n,
        });
      },
      (error) => {
        reject(new Error(error.message));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}

export type { SafetyTimer };
