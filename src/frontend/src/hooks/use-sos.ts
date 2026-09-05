import {
  type Location,
  type SosAlert,
  type SosAlertId,
  createActor,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type { SosAlert };

const sosAlertsKey = ["sosAlerts"] as const;

/**
 * Fetch the signed-in user's SOS alert history. Alerts are stored per-user in
 * the backend and only visible to that user.
 */
export function useSosAlerts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: sosAlertsKey,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSosAlerts();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Fetch a single SOS alert by id. */
export function useSosAlert(id: SosAlertId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: [...sosAlertsKey, id],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getSosAlert(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

/**
 * Trigger an SOS alert with the user's live location. On success the alert
 * history is refreshed so the new alert appears immediately.
 */
export function useTriggerSos() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (location: Location) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.triggerSos(location);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sosAlertsKey });
    },
  });
}

/**
 * Resolve the browser's current position as a backend Location, or null when
 * geolocation is unavailable or the user denies permission. The caller decides
 * how to fall back so an emergency alert is never blocked.
 */
export function getCurrentLocation(): Promise<Location | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}
