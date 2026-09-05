import { ContactsPage } from "@/pages/ContactsPage";
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
      <ContactsPage />
    </QueryClientProvider>,
  );
}

const ada = {
  id: 1n,
  name: "Ada",
  phone: "+1 555 100",
  relationship: "friend" as const,
};

describe("ContactsPage", () => {
  it("lists each contact's name, phone, and relationship", async () => {
    const actor = createMockActor();
    actor.listContacts.mockResolvedValue([ada]);
    mockInfrastructure(actor);
    renderPage(actor);

    expect(await screen.findByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("+1 555 100")).toBeInTheDocument();
    expect(screen.getByText("Friend")).toBeInTheDocument();
  });

  it("adds a contact and refreshes the list", async () => {
    const user = userEvent.setup();
    const actor = createMockActor();
    actor.listContacts.mockResolvedValue([]);
    actor.addContact.mockResolvedValue({
      id: 2n,
      name: "Lin",
      phone: "+2",
      relationship: "family",
    });
    mockInfrastructure(actor);
    renderPage(actor);

    await screen.findByText("No contacts yet");

    await user.click(screen.getByTestId("contacts_add_button"));
    await user.type(screen.getByLabelText("Name"), "Lin");
    await user.type(screen.getByLabelText("Phone"), "+2");
    await user.click(screen.getByRole("button", { name: "Add contact" }));

    await waitFor(() => {
      expect(actor.addContact).toHaveBeenCalledWith(
        "Lin",
        "+2",
        "friend",
        null,
      );
    });
  });

  it("edits an existing contact", async () => {
    const user = userEvent.setup();
    const actor = createMockActor();
    actor.listContacts.mockResolvedValue([ada]);
    actor.updateContact.mockResolvedValue({ ...ada, name: "Ada Lovelace" });
    mockInfrastructure(actor);
    renderPage(actor);

    await screen.findByText("Ada");
    await user.click(screen.getByRole("button", { name: "Edit Ada" }));

    const nameInput = screen.getByLabelText("Name");
    await user.clear(nameInput);
    await user.type(nameInput, "Ada Lovelace");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(actor.updateContact).toHaveBeenCalledWith(
        1n,
        "Ada Lovelace",
        "+1 555 100",
        "friend",
        null,
      );
    });
  });

  it("removes a contact after confirmation", async () => {
    const user = userEvent.setup();
    const actor = createMockActor();
    actor.listContacts.mockResolvedValue([ada]);
    actor.removeContact.mockResolvedValue(true);
    mockInfrastructure(actor);
    renderPage(actor);

    await screen.findByText("Ada");
    await user.click(screen.getByRole("button", { name: "Remove Ada" }));

    const dialog = screen.getByTestId("contacts_delete_dialog");
    await user.click(within(dialog).getByRole("button", { name: "Remove" }));

    await waitFor(() => {
      expect(actor.removeContact).toHaveBeenCalledWith(1n);
    });
  });
});
