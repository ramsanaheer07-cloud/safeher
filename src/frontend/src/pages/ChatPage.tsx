import {
  type Chat,
  type ChatId,
  type ChatMessage,
  type ChatType,
  type Location,
  MessageKind,
} from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import {
  useChats,
  useCommunityChat,
  useCreateDirectChat,
  useMessages,
  useSendMessage,
  useShareLocation,
  useSupportChat,
} from "@/hooks/use-chat";
import { useContacts } from "@/hooks/use-contacts";
import { loadConfig } from "@caffeineai/core-infrastructure";
import { ExternalBlob, StorageClient } from "@caffeineai/object-storage";
import { HttpAgent } from "@icp-sdk/core/agent";
import type { Identity } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import {
  ArrowLeft,
  ImagePlus,
  LifeBuoy,
  MapPin,
  MessageCircle,
  Send,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTime(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Chat & Safety. Backend-backed messaging: private 1-on-1 chats with trusted
 * contacts, a dedicated support/helpline chat, and an anonymous community chat.
 * Supports text, image, and live-location messages.
 */
export function ChatPage() {
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);

  return (
    <div className="space-y-6" data-ocid="chat_page">
      {activeChat ? (
        <ThreadView chat={activeChat} onBack={() => setActiveChat(null)} />
      ) : (
        <ChatList
          onOpen={setActiveChat}
          onNewChat={() => setNewChatOpen(true)}
        />
      )}

      <NewChatDialog
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        onCreated={(chat) => {
          setNewChatOpen(false);
          setActiveChat(chat);
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chat list                                                           */
/* ------------------------------------------------------------------ */

function ChatList({
  onOpen,
  onNewChat,
}: {
  onOpen: (chat: Chat) => void;
  onNewChat: () => void;
}) {
  const { data: chats, isLoading, isError, refetch } = useChats();
  const support = useSupportChat();
  const community = useCommunityChat();
  const { data: contacts } = useContacts();

  const loading = isLoading || support.isLoading || community.isLoading;
  const error = isError || support.isError || community.isError;

  const supportChat = support.data;
  const communityChat = community.data;
  const directChats = (chats ?? []).filter((c) => c.chatType === "direct");

  // Resolve a participant principal to the trusted contact's name so direct
  // chats are easy to identify instead of showing a raw principal string.
  const contactNameByPrincipal = new Map<string, string>();
  for (const contact of contacts ?? []) {
    if (contact.principal) {
      contactNameByPrincipal.set(contact.principal.toString(), contact.name);
    }
  }

  const directChatTitle = (chat: Chat): string => {
    if (!chat.participant) return "Direct chat";
    return (
      contactNameByPrincipal.get(chat.participant.toString()) ??
      chat.participant.toString()
    );
  };

  return (
    <div className="space-y-6">
      <section className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Chat &amp; Safety
        </h1>
        <p className="mt-1 text-muted-foreground">
          Message trusted contacts, reach support, or talk anonymously.
        </p>
      </section>

      {loading ? (
        <ChatListSkeleton />
      ) : error ? (
        <ChatListError onRetry={() => void refetch()} />
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Support &amp; Community
            </h2>
            <ul className="space-y-3" data-ocid="chat_support_list">
              {supportChat && (
                <ChatRow
                  index={1}
                  icon={<LifeBuoy className="h-5 w-5" aria-hidden="true" />}
                  iconClass="bg-primary/15 text-primary"
                  title="Support & Helpline"
                  subtitle="Talk to a trained supporter, privately"
                  onClick={() => onOpen(supportChat)}
                />
              )}
              {communityChat && (
                <ChatRow
                  index={2}
                  icon={<Users className="h-5 w-5" aria-hidden="true" />}
                  iconClass="bg-accent/15 text-accent"
                  title="Community"
                  subtitle="Anonymous group chat, no identity shown"
                  onClick={() => onOpen(communityChat)}
                />
              )}
            </ul>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Trusted Contacts
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                data-ocid="chat_new_button"
                onClick={onNewChat}
                className="h-8 px-2 text-primary"
              >
                <MessageCircle className="mr-1 h-4 w-4" aria-hidden="true" />
                New chat
              </Button>
            </div>

            {directChats.length > 0 ? (
              <ul className="space-y-3" data-ocid="chat_direct_list">
                {directChats.map((chat, index) => (
                  <ChatRow
                    key={chat.id.toString()}
                    index={index + 1}
                    icon={
                      <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    }
                    iconClass="bg-primary/15 text-primary"
                    title={directChatTitle(chat)}
                    subtitle="Private 1-on-1 conversation"
                    onClick={() => onOpen(chat)}
                  />
                ))}
              </ul>
            ) : (
              <div
                data-ocid="chat_direct_empty_state"
                className="rounded-2xl bg-card p-5 text-center shadow-subtle"
              >
                <p className="text-sm text-muted-foreground">
                  No direct chats yet. Start one with a trusted contact.
                </p>
                <Button
                  type="button"
                  data-ocid="chat_direct_empty_button"
                  onClick={onNewChat}
                  className="mt-4 w-full"
                >
                  <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                  Start a chat
                </Button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function ChatRow({
  index,
  icon,
  iconClass,
  title,
  subtitle,
  onClick,
}: {
  index: number;
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <li
      data-ocid={`chat_item.${index}`}
      className="animate-fade-up flex items-center gap-4 rounded-2xl bg-card p-4 shadow-subtle transition-smooth hover:shadow-elevated"
      style={{ animationDelay: `${0.05 * index}s` }}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
      >
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconClass}`}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display font-bold text-foreground">
            {title}
          </span>
          <span className="mt-0.5 block truncate text-sm text-muted-foreground">
            {subtitle}
          </span>
        </span>
      </button>
    </li>
  );
}

function ChatListSkeleton() {
  return (
    <div className="space-y-3" data-ocid="chat_loading_state">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-subtle"
        >
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatListError({ onRetry }: { onRetry: () => void }) {
  return (
    <section
      data-ocid="chat_error_state"
      className="animate-fade-up flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-subtle"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <MessageCircle className="h-8 w-8" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-display text-lg font-bold text-foreground">
        Couldn&apos;t load chats
      </h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Something went wrong while fetching your conversations. Please try
        again.
      </p>
      <Button
        type="button"
        variant="outline"
        data-ocid="chat_retry_button"
        onClick={onRetry}
        className="mt-6 w-full"
      >
        Try again
      </Button>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Thread view                                                         */
/* ------------------------------------------------------------------ */

function ThreadView({ chat, onBack }: { chat: Chat; onBack: () => void }) {
  const { data: messages, isLoading, isError, refetch } = useMessages(chat.id);
  const sendMessage = useSendMessage();
  const shareLocation = useShareLocation();
  const { data: contacts } = useContacts();
  const [draft, setDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isSupport = chat.chatType === "support";
  const isCommunity = chat.chatType === "community";

  const participantName = chat.participant
    ? (contacts ?? []).find(
        (c) =>
          c.principal &&
          c.principal.toString() === chat.participant?.toString(),
      )?.name
    : undefined;

  const title = isSupport
    ? "Support & Helpline"
    : isCommunity
      ? "Community"
      : (participantName ?? chat.participant?.toString() ?? "Direct chat");

  // Keep the thread scrolled to the latest message as new ones arrive.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && (messages?.length ?? 0) > 0) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const canSend = draft.trim().length > 0;

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    sendMessage.mutate(
      { chatId: chat.id, kind: MessageKind.text, text },
      {
        onError: () => {
          setDraft((current) => (current === "" ? text : current));
          toast.error("Could not send message");
        },
      },
    );
  };

  const { identity } = useAuth();

  const handleImagePicked = async (file: File) => {
    if (!file) return;
    if (!identity) {
      toast.error("Could not upload image");
      return;
    }
    setUploading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const url = await uploadImage(bytes, file.type, file.name, identity);
      sendMessage.mutate(
        { chatId: chat.id, kind: MessageKind.image, imageUrl: url },
        {
          onError: () => toast.error("Could not send image"),
        },
      );
    } catch {
      toast.error("Could not upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location sharing is not supported on this device");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        shareLocation.mutate(
          { chatId: chat.id, location },
          {
            onError: () => toast.error("Could not share location"),
          },
        );
      },
      () => toast.error("Could not access your location"),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  return (
    <div
      className="flex h-[calc(100dvh-12rem)] flex-col"
      data-ocid="chat_thread"
    >
      <div className="flex items-center gap-2 pb-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-ocid="chat_back_button"
          aria-label="Back to chats"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-bold text-foreground">
            {title}
          </h1>
          <p className="text-xs text-muted-foreground">
            {isCommunity
              ? "Anonymous — your identity is hidden"
              : isSupport
                ? "Private support conversation"
                : "Private 1-on-1 chat"}
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-card p-4 shadow-subtle"
        data-ocid="chat_messages"
      >
        {isLoading ? (
          <MessagesSkeleton />
        ) : isError ? (
          <div
            data-ocid="chat_messages_error_state"
            className="flex flex-col items-center py-10 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Couldn&apos;t load messages.
            </p>
            <Button
              type="button"
              variant="outline"
              data-ocid="chat_messages_retry_button"
              onClick={() => void refetch()}
              className="mt-4"
            >
              Try again
            </Button>
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageBubble
              key={message.id.toString()}
              message={message}
              isCommunity={isCommunity}
              index={index}
            />
          ))
        ) : (
          <div
            data-ocid="chat_messages_empty_state"
            className="flex flex-col items-center py-10 text-center"
          >
            <MessageCircle className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No messages yet. Say hello — you&apos;re not alone here.
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          data-ocid="chat_image_input"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImagePicked(file);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-ocid="chat_image_button"
          aria-label="Send an image"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <ImagePlus className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-ocid="chat_location_button"
          aria-label="Share your live location"
          onClick={handleShareLocation}
        >
          <MapPin className="h-5 w-5" aria-hidden="true" />
        </Button>

        <div className="message-input flex min-w-0 flex-1 items-center px-3 py-1">
          <input
            type="text"
            data-ocid="chat_message_input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message…"
            aria-label="Message"
            className="min-w-0 flex-1 bg-transparent py-2 text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        <Button
          type="button"
          size="icon"
          data-ocid="chat_send_button"
          aria-label="Send message"
          disabled={!canSend || sendMessage.isPending}
          onClick={handleSend}
        >
          <Send className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isCommunity,
  index,
}: {
  message: ChatMessage;
  isCommunity: boolean;
  index: number;
}) {
  const { identity } = useAuth();
  const isMine =
    !isCommunity &&
    !!identity &&
    message.sender.toString() === identity.getPrincipal().toString();

  const bubbleClass = isCommunity
    ? "chat-bubble-anon"
    : isMine
      ? "chat-bubble-out"
      : "chat-bubble-in";

  const alignClass = isCommunity
    ? "self-start"
    : isMine
      ? "self-end"
      : "self-start";

  return (
    <div
      data-ocid={`chat_message.${index + 1}`}
      className={`flex max-w-[85%] flex-col ${alignClass}`}
    >
      <div className={`px-4 py-2.5 ${bubbleClass}`}>
        {message.kind === MessageKind.image && message.imageUrl ? (
          <a
            href={message.imageUrl}
            target="_blank"
            rel="noreferrer"
            data-ocid={`chat_image_link.${index + 1}`}
            className="block overflow-hidden rounded-xl"
          >
            <img
              src={message.imageUrl}
              alt="Shared media"
              className="max-h-64 w-full rounded-xl object-cover"
            />
          </a>
        ) : message.kind === MessageKind.location && message.location ? (
          <LocationMessage location={message.location} />
        ) : (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.text}
          </p>
        )}
      </div>
      <span className="mt-1 px-1 text-[11px] text-muted-foreground">
        {formatTime(message.timestamp)}
      </span>
    </div>
  );
}

function LocationMessage({ location }: { location: Location }) {
  const mapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noreferrer"
      data-ocid="chat_location_link"
      className="flex items-center gap-2"
    >
      <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="text-sm font-medium">Live location shared</span>
    </a>
  );
}

function MessagesSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
        >
          <Skeleton className="h-10 w-2/3 rounded-2xl" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* New direct chat                                                      */
/* ------------------------------------------------------------------ */

function NewChatDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (chat: Chat) => void;
}) {
  const { data: contacts, isLoading, isError, refetch } = useContacts();
  const createDirectChat = useCreateDirectChat();

  const handleStart = (participant: Principal) => {
    createDirectChat.mutate(participant, {
      onSuccess: (chat) => {
        toast.success("Chat started");
        onCreated(chat);
      },
      onError: () => toast.error("Could not start chat"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-ocid="chat_new_dialog">
        <DialogHeader>
          <DialogTitle>Start a chat</DialogTitle>
          <DialogDescription>
            Choose a trusted contact to start a private 1-on-1 conversation.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3" data-ocid="chat_new_loading_state">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div data-ocid="chat_new_error_state" className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Couldn&apos;t load your contacts.
            </p>
            <Button
              type="button"
              variant="outline"
              data-ocid="chat_new_retry_button"
              onClick={() => void refetch()}
              className="mt-4"
            >
              Try again
            </Button>
          </div>
        ) : contacts && contacts.length > 0 ? (
          <ul
            className="max-h-72 space-y-2 overflow-y-auto"
            data-ocid="chat_new_contact_list"
          >
            {contacts.map((contact, index) => (
              <li key={contact.id.toString()}>
                <Button
                  type="button"
                  variant="outline"
                  data-ocid={`chat_new_contact.${index + 1}`}
                  disabled={createDirectChat.isPending || !contact.principal}
                  onClick={() => {
                    if (!contact.principal) {
                      toast.info(
                        "This contact hasn't set up their account yet, so you can't chat with them yet.",
                      );
                      return;
                    }
                    handleStart(contact.principal);
                  }}
                  className="h-auto w-full justify-start px-4 py-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="ml-3 min-w-0 text-left">
                    <span className="block truncate font-display font-bold text-foreground">
                      {contact.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {contact.principal
                        ? contact.relationship
                        : "Not set up for chat yet"}
                    </span>
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div
            data-ocid="chat_new_empty_state"
            className="flex flex-col items-center py-6 text-center"
          >
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              You don&apos;t have any trusted contacts yet. Add some first to
              start a private chat.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            data-ocid="chat_new_cancel_button"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Object storage upload                                               */
/* ------------------------------------------------------------------ */

async function uploadImage(
  bytes: Uint8Array<ArrayBuffer>,
  contentType: string,
  filename: string,
  identity: Identity,
): Promise<string> {
  const config = await loadConfig();
  const agent = await HttpAgent.create({
    identity,
    host: config.backend_host,
  });
  const client = new StorageClient(
    config.bucket_name,
    config.storage_gateway_url,
    config.backend_canister_id,
    config.project_id,
    agent,
  );
  const blob = ExternalBlob.fromBytes(bytes, contentType, filename);
  const { hash } = await client.putFile(
    await blob.getBytes(),
    undefined,
    contentType,
    filename,
  );
  return client.getDirectURL(hash);
}
