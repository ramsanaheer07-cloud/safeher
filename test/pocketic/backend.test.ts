import { createIdentity, PocketIc } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: _SERVICE;

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor } = await pic.setupCanister<_SERVICE>({ idlFactory, wasm: BACKEND_WASM }));
  // Trusted-contacts and SOS methods are role-guarded: an anonymous caller
  // traps with "Unauthorized: Please sign in to access trusted contacts".
  // Register a non-anonymous caller so those methods are reachable.
  actor.setIdentity(createIdentity("girl-safety-test-user"));
  await actor._initialize_access_control();
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers an empty-state read instead of trapping", async () => {
  await expect(actor.listContacts()).resolves.toEqual([]);
  await expect(actor.getTimer()).resolves.toEqual([]);
  await expect(actor.getLocation()).resolves.toEqual([]);
});

it("round-trips a contact through the real canister", async () => {
  const contact = await actor.addContact("Ada", "+1", { friend: null }, []);
  expect(contact.name).toBe("Ada");
  expect(await actor.listContacts()).toContainEqual(
    expect.objectContaining({ id: contact.id, name: "Ada", phone: "+1", relationship: { friend: null } }),
  );
});

it("updates and removes a contact", async () => {
  const contact = await actor.addContact("Grace", "+2", { family: null }, []);
  const updated = await actor.updateContact(contact.id, "Grace Hopper", "+3", { colleague: null }, []);
  expect(updated).toEqual([expect.objectContaining({ id: contact.id, name: "Grace Hopper" })]);
  await expect(actor.removeContact(contact.id)).resolves.toBe(true);
  await expect(actor.removeContact(contact.id)).resolves.toBe(false);
});

it("triggers an SOS alert that lists the caller's contacts", async () => {
  const contact = await actor.addContact("Lin", "+4", { other: null }, []);
  const alert = await actor.triggerSos({ latitude: 1.5, longitude: 2.5 });
  expect(alert.alertedContacts).toContain(contact.id);
  expect(alert.location).toEqual({ latitude: 1.5, longitude: 2.5 });
  expect(await actor.listSosAlerts()).toContainEqual(expect.objectContaining({ id: alert.id }));
  expect(await actor.getSosAlert(alert.id)).toEqual([expect.objectContaining({ id: alert.id })]);
});

it("starts, extends, checks in, and stops a safety timer", async () => {
  const started = await actor.startTimer(900n);
  expect(started.status).toEqual({ active: null });
  expect(await actor.getTimer()).toEqual([expect.objectContaining({ status: { active: null } })]);

  const extended = await actor.extendTimer(300n);
  expect(extended.durationSec).toBe(1200n);

  const checkedIn = await actor.timerCheckIn({ latitude: 3.0, longitude: 4.0, capturedAtNs: 1n, accuracyM: [5] });
  expect(checkedIn.status).toEqual({ active: null });
  expect(await actor.getLocation()).toEqual([
    expect.objectContaining({ latitude: 3.0, longitude: 4.0, accuracyM: [5] }),
  ]);

  const stopped = await actor.stopTimer();
  expect(stopped).toEqual([expect.objectContaining({ status: { stopped: null } })]);
  await expect(actor.getTimer()).resolves.toEqual([expect.objectContaining({ status: { stopped: null } })]);
});

it("records a standalone check-in, shows active state, and checks out", async () => {
  // Empty state before any check-in.
  await expect(actor.getCheckInState()).resolves.toEqual([]);
  await expect(actor.listCheckInHistory()).resolves.toEqual([]);

  const active = await actor.checkIn({ latitude: 1.5, longitude: 2.5, capturedAtNs: 1n, accuracyM: [5] });
  expect(active.location).toEqual(expect.objectContaining({ latitude: 1.5, longitude: 2.5, accuracyM: [5] }));
  expect(await actor.getCheckInState()).toEqual([
    expect.objectContaining({
      location: expect.objectContaining({ latitude: 1.5, longitude: 2.5, accuracyM: [5] }),
    }),
  ]);

  const history = await actor.listCheckInHistory();
  expect(history).toHaveLength(1);
  expect(history[0]).toMatchObject({ kind: { checkIn: null }, location: { latitude: 1.5, longitude: 2.5 } });

  const checkedOut = await actor.checkOut({ latitude: 3.5, longitude: 4.5, capturedAtNs: 2n, accuracyM: [8] });
  expect(checkedOut).toEqual([expect.objectContaining({ kind: { checkOut: null } })]);
  await expect(actor.getCheckInState()).resolves.toEqual([]);
  expect(await actor.listCheckInHistory()).toHaveLength(2);
});

it("lets a trusted contact view another user's check-in history", async () => {
  const a = createIdentity("checkin-user-a");
  const b = createIdentity("checkin-user-b");

  // User A registers, checks in, and adds B as a trusted contact.
  actor.setIdentity(a);
  await actor._initialize_access_control();
  await actor.checkIn({ latitude: 10.0, longitude: 20.0, capturedAtNs: 1n, accuracyM: [] });
  const contact = await actor.addContact("B", "+5", { friend: null }, [b.getPrincipal()]);
  expect(contact.principal).toEqual([b.getPrincipal()]);

  // User B registers and, as a trusted contact, can view A's history.
  actor.setIdentity(b);
  await actor._initialize_access_control();
  const viewed = await actor.getCheckInHistoryFor(a.getPrincipal());
  expect(viewed).toHaveLength(1);
  expect(viewed[0]).toMatchObject({ kind: { checkIn: null }, location: { latitude: 10.0, longitude: 20.0 } });

  // Reset the caller to the registered test user so later tests are unaffected.
  actor.setIdentity(createIdentity("girl-safety-test-user"));
});

it("creates a direct chat and round-trips text, image, and location messages", async () => {
  const other = createIdentity("chat-participant").getPrincipal();
  const chat = await actor.createDirectChat(other);
  expect(chat.chatType).toEqual({ direct: null });
  expect(chat.participant).toEqual([other]);

  const text = await actor.sendMessage(chat.id, { text: null }, ["hello"], []);
  expect(text.kind).toEqual({ text: null });
  expect(text.text).toEqual(["hello"]);

  const image = await actor.sendMessage(chat.id, { image: null }, [], ["https://img/1"]);
  expect(image.kind).toEqual({ image: null });
  expect(image.imageUrl).toEqual(["https://img/1"]);

  const location = await actor.shareLocation(chat.id, { latitude: 1.25, longitude: 2.5 });
  expect(location.kind).toEqual({ location: null });
  expect(location.location).toEqual([{ latitude: 1.25, longitude: 2.5 }]);

  const messages = await actor.listMessages(chat.id);
  expect(messages).toHaveLength(3);
  expect(await actor.getChat(chat.id)).toEqual([expect.objectContaining({ id: chat.id })]);
});

it("provides support and community chats", async () => {
  const support = await actor.getSupportChat();
  expect(support.chatType).toEqual({ support: null });
  const community = await actor.getCommunityChat();
  expect(community.chatType).toEqual({ community: null });
});

it("starts and stops a fake call", async () => {
  const started = await actor.startFakeCall();
  expect(started.active).toBe(true);
  expect(await actor.getFakeCall()).toEqual([expect.objectContaining({ active: true })]);
  // stopFakeCall returns the previous (active) state and removes the call.
  const stopped = await actor.stopFakeCall();
  expect(stopped).toEqual([expect.objectContaining({ active: true })]);
  await expect(actor.getFakeCall()).resolves.toEqual([]);
});

it("toggles discreet mode", async () => {
  await expect(actor.getDiscreetMode()).resolves.toBe(false);
  await expect(actor.setDiscreetMode(true)).resolves.toBe(true);
  await expect(actor.getDiscreetMode()).resolves.toBe(true);
});

it("sets, reads, and marks a check-in reminder", async () => {
  const reminder = await actor.setCheckInReminder(1800n);
  expect(reminder.enabled).toBe(true);
  expect(reminder.intervalSec).toBe(1800n);
  expect(await actor.getCheckInReminder()).toEqual([expect.objectContaining({ intervalSec: 1800n })]);
  const status = await actor.checkInReminderStatus();
  expect(status).toEqual([expect.objectContaining({ enabled: true, intervalSec: 1800n })]);
  const marked = await actor.markCheckIn();
  expect(marked).toEqual([expect.objectContaining({ enabled: true })]);
});
