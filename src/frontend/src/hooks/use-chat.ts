import {
  type Chat,
  type ChatId,
  type ChatMessage,
  type Location,
  type MessageKind,
  createActor,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const chatsKey = ["chats"] as const;
const messagesKey = ["messages"] as const;

/**
 * Fetch the signed-in user's chats (direct, support and community). Chats are
 * stored per-user in the backend and only visible to that user.
 */
export function useChats() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: chatsKey,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listChats();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Fetch a single chat by id, or null when it does not exist. */
export function useChat(chatId: ChatId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: [...chatsKey, chatId?.toString()],
    queryFn: async () => {
      if (!actor || chatId === undefined) return null;
      return actor.getChat(chatId);
    },
    enabled: !!actor && !isFetching && chatId !== undefined,
  });
}

/** Create a private 1-on-1 chat with a trusted contact, then refresh the list. */
export function useCreateDirectChat() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (participant: Principal) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createDirectChat(participant);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatsKey });
    },
  });
}

export interface SendMessageInput {
  chatId: ChatId;
  kind: MessageKind;
  text?: string;
  imageUrl?: string;
}

/** Send a message (text, image or location) to a chat, then refresh its thread. */
export function useSendMessage() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ chatId, kind, text, imageUrl }: SendMessageInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.sendMessage(chatId, kind, text ?? null, imageUrl ?? null);
    },
    onSuccess: (_message, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [...messagesKey, variables.chatId.toString()],
      });
    },
  });
}

/** Fetch the full message thread for a chat. */
export function useMessages(chatId: ChatId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: [...messagesKey, chatId?.toString()],
    queryFn: async () => {
      if (!actor || chatId === undefined) return [];
      return actor.listMessages(chatId);
    },
    enabled: !!actor && !isFetching && chatId !== undefined,
    // Poll so incoming messages from the other party appear in real time.
    refetchInterval: 5000,
  });
}

/** Share a live location snapshot inside a chat, then refresh its thread. */
export function useShareLocation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      chatId,
      location,
    }: {
      chatId: ChatId;
      location: Location;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.shareLocation(chatId, location);
    },
    onSuccess: (_message, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [...messagesKey, variables.chatId.toString()],
      });
    },
  });
}

/** Fetch the dedicated support / helpline chat. */
export function useSupportChat() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: [...chatsKey, "support"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSupportChat();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Fetch the anonymous community chat. */
export function useCommunityChat() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: [...chatsKey, "community"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCommunityChat();
    },
    enabled: !!actor && !isFetching,
  });
}

export type { Chat, ChatId, ChatMessage };
