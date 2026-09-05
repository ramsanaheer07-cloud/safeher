import { ChatType, MessageKind } from "@/backend";
import { ChatPage } from "@/pages/ChatPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  type MockActor,
  createMockActor,
  mockInfrastructure,
} from "./mock-infrastructure";

function renderPage(_actor: MockActor) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ChatPage />
    </QueryClientProvider>,
  );
}

const supportChat = {
  id: 1n,
  chatType: ChatType.support,
  createdAt: 1n,
};

const communityChat = {
  id: 2n,
  chatType: ChatType.community,
  createdAt: 2n,
};

describe("ChatPage", () => {
  it("lists the support and community chats", async () => {
    const actor = createMockActor();
    actor.listChats.mockResolvedValue([]);
    actor.getSupportChat.mockResolvedValue(supportChat);
    actor.getCommunityChat.mockResolvedValue(communityChat);
    actor.listContacts.mockResolvedValue([]);
    mockInfrastructure(actor);
    renderPage(actor);

    expect(await screen.findByText("Support & Helpline")).toBeInTheDocument();
    expect(screen.getByText("Community")).toBeInTheDocument();
  });

  it("sends a text message and displays it in the thread", async () => {
    const user = userEvent.setup();
    const actor = createMockActor();
    actor.listChats.mockResolvedValue([]);
    actor.getSupportChat.mockResolvedValue(supportChat);
    actor.getCommunityChat.mockResolvedValue(communityChat);
    actor.listContacts.mockResolvedValue([]);
    actor.listMessages.mockResolvedValue([]);
    actor.sendMessage.mockResolvedValue({
      id: 1n,
      kind: MessageKind.text,
      text: "hello",
      sender: { toString: () => "me" } as never,
      timestamp: 1n,
    });
    mockInfrastructure(actor);
    renderPage(actor);

    await screen.findByText("Support & Helpline");
    await user.click(screen.getByText("Support & Helpline"));

    const input = await screen.findByLabelText("Message");
    await user.type(input, "hello");
    await user.click(screen.getByLabelText("Send message"));

    await waitFor(() => {
      expect(actor.sendMessage).toHaveBeenCalledWith(
        1n,
        MessageKind.text,
        "hello",
        null,
      );
    });
  });

  it("renders an incoming text message in the thread", async () => {
    const actor = createMockActor();
    actor.listChats.mockResolvedValue([]);
    actor.getSupportChat.mockResolvedValue(supportChat);
    actor.getCommunityChat.mockResolvedValue(communityChat);
    actor.listContacts.mockResolvedValue([]);
    actor.listMessages.mockResolvedValue([
      {
        id: 1n,
        kind: MessageKind.text,
        text: "You're not alone",
        sender: { toString: () => "supporter" } as never,
        timestamp: 1n,
      },
    ]);
    mockInfrastructure(actor);
    renderPage(actor);

    await screen.findByText("Support & Helpline");
    await userEvent.click(screen.getByText("Support & Helpline"));

    expect(await screen.findByText("You're not alone")).toBeInTheDocument();
  });

  it("renders an image message in the thread", async () => {
    const actor = createMockActor();
    actor.listChats.mockResolvedValue([]);
    actor.getSupportChat.mockResolvedValue(supportChat);
    actor.getCommunityChat.mockResolvedValue(communityChat);
    actor.listContacts.mockResolvedValue([]);
    actor.listMessages.mockResolvedValue([
      {
        id: 1n,
        kind: MessageKind.image,
        imageUrl: "https://img/1",
        sender: { toString: () => "supporter" } as never,
        timestamp: 1n,
      },
    ]);
    mockInfrastructure(actor);
    renderPage(actor);

    await screen.findByText("Support & Helpline");
    await userEvent.click(screen.getByText("Support & Helpline"));

    const img = await screen.findByAltText("Shared media");
    expect(img).toHaveAttribute("src", "https://img/1");
  });

  it("renders a shared location message in the thread", async () => {
    const actor = createMockActor();
    actor.listChats.mockResolvedValue([]);
    actor.getSupportChat.mockResolvedValue(supportChat);
    actor.getCommunityChat.mockResolvedValue(communityChat);
    actor.listContacts.mockResolvedValue([]);
    actor.listMessages.mockResolvedValue([
      {
        id: 1n,
        kind: MessageKind.location,
        location: { latitude: 1.5, longitude: 2.5 },
        sender: { toString: () => "supporter" } as never,
        timestamp: 1n,
      },
    ]);
    mockInfrastructure(actor);
    renderPage(actor);

    await screen.findByText("Support & Helpline");
    await userEvent.click(screen.getByText("Support & Helpline"));

    expect(await screen.findByText("Live location shared")).toBeInTheDocument();
    expect(screen.getByTestId("chat_location_link")).toHaveAttribute(
      "href",
      "https://www.google.com/maps?q=1.5,2.5",
    );
  });

  it("starts a private 1-on-1 chat with a trusted contact", async () => {
    const user = userEvent.setup();
    const actor = createMockActor();
    actor.listChats.mockResolvedValue([]);
    actor.getSupportChat.mockResolvedValue(supportChat);
    actor.getCommunityChat.mockResolvedValue(communityChat);
    const principal = { toString: () => "abc-123" } as never;
    actor.listContacts.mockResolvedValue([
      {
        id: 1n,
        name: "Ada",
        phone: "+1",
        relationship: "friend",
        principal,
      },
    ]);
    actor.createDirectChat.mockResolvedValue({
      id: 3n,
      chatType: ChatType.direct,
      participant: principal,
      createdAt: 3n,
    });
    actor.listMessages.mockResolvedValue([]);
    mockInfrastructure(actor);
    renderPage(actor);

    await screen.findByText("Support & Helpline");
    await user.click(screen.getByTestId("chat_new_button"));

    await user.click(await screen.findByText("Ada"));

    await waitFor(() => {
      expect(actor.createDirectChat).toHaveBeenCalledWith(principal);
    });
  });

  it("lists a direct chat using the trusted contact's name", async () => {
    const actor = createMockActor();
    const principal = { toString: () => "abc-123" } as never;
    actor.listChats.mockResolvedValue([
      {
        id: 3n,
        chatType: ChatType.direct,
        participant: principal,
        createdAt: 3n,
      },
    ]);
    actor.getSupportChat.mockResolvedValue(supportChat);
    actor.getCommunityChat.mockResolvedValue(communityChat);
    actor.listContacts.mockResolvedValue([
      {
        id: 1n,
        name: "Ada",
        phone: "+1",
        relationship: "friend",
        principal,
      },
    ]);
    mockInfrastructure(actor);
    renderPage(actor);

    expect(await screen.findByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("Private 1-on-1 conversation")).toBeInTheDocument();
  });
});
