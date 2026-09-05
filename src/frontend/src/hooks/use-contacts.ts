import { type Contact, type Relationship, createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const contactsKey = ["contacts"] as const;

/**
 * Fetch the signed-in user's trusted contacts. Contacts are stored per-user in
 * the backend and only visible to that user.
 */
export function useContacts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: contactsKey,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listContacts();
    },
    enabled: !!actor && !isFetching,
  });
}

export interface ContactInput {
  name: string;
  phone: string;
  relationship: Relationship;
}

/** Add a new trusted contact, then refresh the list. */
export function useAddContact() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ContactInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.addContact(
        input.name,
        input.phone,
        input.relationship,
        null,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contactsKey });
    },
  });
}

/** Update an existing trusted contact, then refresh the list. */
export function useUpdateContact() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: Contact["id"];
      input: ContactInput;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateContact(
        id,
        input.name,
        input.phone,
        input.relationship,
        null,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contactsKey });
    },
  });
}

/** Remove a trusted contact, then refresh the list. */
export function useRemoveContact() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: Contact["id"]) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.removeContact(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contactsKey });
    },
  });
}
