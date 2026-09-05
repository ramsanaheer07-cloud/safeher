mixin () {
  public query func getApiDoc() : async Text {
    "# Girl Safety App — Backend API\n" #
    "\n" #
    "The backend is a Motoko canister for a girl-safety application. It stores a\n" #
    "user's trusted contacts, records emergency SOS alerts, and manages a per-user\n" #
    "safety timer with live location sharing. All data is stored per-user and is\n" #
    "only ever visible to the user who owns it (or to the platform controller via\n" #
    "the OQL query layer).\n" #
    "\n" #
    "## Identity and registration\n" #
    "\n" #
    "The app's frontend pins an Internet Identity derivation origin, published at\n" #
    "`/.well-known/ii-derivation-origin` when available. An agent already holding\n" #
    "the user's Internet Identity authorization derives the correct per-app\n" #
    "principal against that origin (for example\n" #
    "`icp identity link web <name> --app <host>`). Such a delegation acts with the\n" #
    "user's full authority in this app until it expires.\n" #
    "\n" #
    "Registration happens only when a caller signs in through the app's own\n" #
    "frontend. A principal that never did so is unregistered even when it belongs\n" #
    "to the app's owner, and a signed-in caller derived against a different origin\n" #
    "is a different principal than the one the frontend registered.\n" #
    "\n" #
    "To register a direct API caller, call `_initialize_access_control` once as a\n" #
    "signed-in (non-anonymous) caller before any role-guarded call, guarded queries\n" #
    "included. The first caller to register becomes `#admin`; every subsequent\n" #
    "caller becomes `#user`. Anonymous callers are ignored by registration.\n" #
    "\n" #
    "## Authentication and authorization\n" #
    "\n" #
    "Roles are `#admin`, `#user`, and `#guest`. Anonymous callers resolve to\n" #
    "`#guest`. A signed-in but unregistered caller traps with\n" #
    "`User is not registered` when their role is looked up.\n" #
    "\n" #
    "- **Trusted contacts and SOS** (`listContacts`, `addContact`, `updateContact`,\n" #
    "  `removeContact`, `triggerSos`, `listSosAlerts`, `getSosAlert`) require a\n" #
    "  signed-in (non-anonymous) caller. An anonymous caller receives a trap:\n" #
    "  `Unauthorized: Please sign in to access trusted contacts`.\n" #
    "- **Safety timer** (`startTimer`, `getTimer`, `timerCheckIn`, `extendTimer`,\n" #
    "  `stopTimer`, `getLocation`) do **not** check the caller's role. They operate\n" #
    "  on the caller's principal directly, so an anonymous caller can create a\n" #
    "  timer keyed to the anonymous principal.\n" #
    "- **Check-in and check-out** (`checkIn`, `checkOut`, `getCheckInState`,\n" #
    "  `listCheckInHistory`, `getCheckInHistoryFor`) require a signed-in\n" #
    "  (non-anonymous) caller. An anonymous caller receives a trap:\n" #
    "  `Unauthorized: Please sign in to access trusted contacts`.\n" #
    "- **Chat and safety** (`listChats`, `getChat`, `createDirectChat`,\n" #
    "  `sendMessage`, `listMessages`, `shareLocation`, `getSupportChat`,\n" #
    "  `getCommunityChat`, `startFakeCall`, `stopFakeCall`, `getFakeCall`,\n" #
    "  `setDiscreetMode`, `getDiscreetMode`, `setCheckInReminder`,\n" #
    "  `getCheckInReminder`, `markCheckIn`, `checkInReminderStatus`) require a\n" #
    "  signed-in (non-anonymous) caller. An anonymous caller receives a trap:\n" #
    "  `Unauthorized: Please sign in to access trusted contacts`.\n" #
    "- `assignCallerUserRole(user, role)` requires the caller to be `#admin`;\n" #
    "  otherwise it traps with `Unauthorized: Only admins can assign user roles`.\n" #
    "- `isCallerAdmin` and `getCallerUserRole` are read-only role queries.\n" #
    "\n" #
    "## Public methods\n" #
    "\n" #
    "### Access control\n" #
    "\n" #
    "- `_internet_identity_sign_in_start() : async Blob` — begins an Internet\n" #
    "  Identity sign-in, returning a challenge blob.\n" #
    "- `_internet_identity_sign_in_finish() : async Result<(), Error>` — completes\n" #
    "  the sign-in and registers the caller (first caller becomes `#admin`).\n" #
    "- `_initialize_access_control() : async ()` — registers the caller directly\n" #
    "  (first caller becomes `#admin`, later callers `#user`).\n" #
    "- `getCallerUserRole() : async UserRole` — the caller's role (`#admin`,\n" #
    "  `#user`, or `#guest`).\n" #
    "- `assignCallerUserRole(user : Principal, role : UserRole) : async ()` —\n" #
    "  admin-only role assignment.\n" #
    "- `isCallerAdmin() : async Bool` — whether the caller is `#admin`.\n" #
    "\n" #
    "### Trusted contacts\n" #
    "\n" #
    "- `listContacts() : async [Contact]` — the caller's contacts.\n" #
    "- `addContact(name : Text, phone : Text, relationship : Relationship,\n" #
    "  principal : ?Principal) : async Contact` — adds a contact and returns it.\n" #
    "  `principal` is the contact's Internet Computer principal, used to resolve\n" #
    "  the contact to a chat participant; it may be `null` if the contact does not\n" #
    "  yet have a principal.\n" #
    "- `updateContact(id : Nat, name : Text, phone : Text,\n" #
    "  relationship : Relationship, principal : ?Principal) : async ?Contact` —\n" #
    "  updates a contact by id; returns `null` if the id is not found.\n" #
    "- `removeContact(id : Nat) : async Bool` — removes a contact by id; returns\n" #
    "  whether a contact was removed.\n" #
    "- `triggerSos(location : Location) : async SosAlert` — records an SOS alert\n" #
    "  against the caller's current contacts and returns the alert.\n" #
    "- `listSosAlerts() : async [SosAlert]` — the caller's SOS alerts.\n" #
    "- `getSosAlert(id : Nat) : async ?SosAlert` — a single SOS alert by id.\n" #
    "\n" #
    "### Safety timer\n" #
    "\n" #
    "- `startTimer(durationSec : Nat) : async SafetyTimer` — starts a timer for the\n" #
    "  caller with the given duration.\n" #
    "- `getTimer() : async ?SafetyTimer` — the caller's current timer, if any.\n" #
    "- `timerCheckIn(location : LocationSnapshot) : async SafetyTimer` — records a\n" #
    "  live location and updates the timer's last check-in time. Traps with\n" #
    "  `No active safety timer to check in` if the caller has no timer.\n" #
    "- `extendTimer(extraSec : Nat) : async SafetyTimer` — extends the caller's\n" #
    "  timer duration. Traps with `No active safety timer to extend` if none.\n" #
    "- `stopTimer() : async ?SafetyTimer` — stops the caller's timer early and\n" #
    "  returns it; `null` if none.\n" #
    "- `getLocation() : async ?LocationSnapshot` — the caller's most recent live\n" #
    "  location snapshot, if any.\n" #
    "\n" #
    "### Check-in and check-out\n" #
    "\n" #
    "These are the standalone arrival/departure check-in endpoints, distinct from\n" #
    "the safety-timer `timerCheckIn`. They record where and when the user arrived\n" #
    "or departed, keep an active check-in state, and build a per-user history.\n" #
    "\n" #
    "- `checkIn(location : LocationSnapshot) : async ActiveCheckIn` — records a\n" #
    "  standalone check-in for the caller at the given location and returns the\n" #
    "  new active check-in state. Overwrites any previous active check-in.\n" #
    "- `checkOut(location : LocationSnapshot) : async ?CheckInEvent` — records a\n" #
    "  standalone check-out for the caller at the given location, clears the\n" #
    "  active check-in state, and returns the recorded event. Returns `null` if\n" #
    "  the caller is not currently checked in.\n" #
    "- `getCheckInState() : async ?ActiveCheckIn` — the caller's active check-in\n" #
    "  state, or `null` if checked out.\n" #
    "- `listCheckInHistory() : async [CheckInEvent]` — the caller's own\n" #
    "  check-in/check-out history.\n" #
    "- `getCheckInHistoryFor(user : Principal) : async [CheckInEvent]` — another\n" #
    "  user's check-in/check-out history. Only a trusted contact of `user` may\n" #
    "  view it; otherwise it traps with\n" #
    "  `Unauthorized: You are not a trusted contact of this user`.\n" #
    "\n" #
    "### Chat and safety\n" #
    "\n" #
    "- `listChats() : async [Chat]` — the caller's chats.\n" #
    "- `getChat(chatId : Nat) : async ?Chat` — a single chat by id, if it belongs\n" #
    "  to the caller; `null` otherwise.\n" #
    "- `createDirectChat(participant : Principal) : async Chat` — creates a private\n" #
    "  1-on-1 chat with a trusted contact and returns it. The chat is added to both\n" #
    "  the caller's and the participant's chat lists.\n" #
    "- `sendMessage(chatId : Nat, kind : MessageKind, text : ?Text,\n" #
    "  imageUrl : ?Text) : async ChatMessage` — sends a text or image message to a\n" #
    "  chat and returns the stored message. The caller must be a participant of\n" #
    "  the chat; otherwise it traps with\n" #
    "  `Unauthorized: You are not a member of this chat`.\n" #
    "- `listMessages(chatId : Nat) : async [ChatMessage]` — the messages of a chat.\n" #
    "  The caller must be a participant of the chat; otherwise it traps with\n" #
    "  `Unauthorized: You are not a member of this chat`.\n" #
    "- `shareLocation(chatId : Nat, location : Location) : async ChatMessage` —\n" #
    "  shares a live location as a message within a chat. The caller must be a\n" #
    "  participant of the chat; otherwise it traps with\n" #
    "  `Unauthorized: You are not a member of this chat`.\n" #
    "- `getSupportChat() : async Chat` — returns (creating if needed) the caller's\n" #
    "  dedicated support/helpline chat.\n" #
    "- `getCommunityChat() : async Chat` — returns (creating if needed) the\n" #
    "  caller's anonymous community chat.\n" #
    "- `startFakeCall() : async FakeCall` — starts a fake incoming call for the\n" #
    "  caller.\n" #
    "- `stopFakeCall() : async ?FakeCall` — stops the caller's active fake call, if\n" #
    "  any, and returns it.\n" #
    "- `getFakeCall() : async ?FakeCall` — the caller's current fake-call state, if\n" #
    "  any.\n" #
    "- `setDiscreetMode(enabled : Bool) : async Bool` — enables or disables discreet\n" #
    "  mode for the caller and returns the new state.\n" #
    "- `getDiscreetMode() : async Bool` — whether discreet mode is enabled for the\n" #
    "  caller.\n" #
    "- `setCheckInReminder(intervalSec : Nat) : async CheckInReminder` — configures\n" #
    "  the caller's auto safety check-in reminder and returns it.\n" #
    "- `getCheckInReminder() : async ?CheckInReminder` — the caller's auto safety\n" #
    "  check-in reminder, if any.\n" #
    "- `markCheckIn() : async ?CheckInReminder` — marks a check-in for the\n" #
    "  caller's auto safety check-in reminder, updating the last check-in time to\n" #
    "  now. Returns the updated reminder, or `null` if the caller has no reminder\n" #
    "  configured.\n" #
    "- `checkInReminderStatus() : async ?CheckInReminderStatus` — the caller's\n" #
    "  auto safety check-in reminder status, reporting whether the check-in\n" #
    "  interval has elapsed since the last check-in. The frontend polls this to\n" #
    "  detect a missed check-in and notify trusted contacts. Returns `null` if\n" #
    "  the caller has no reminder configured.\n" #
    "\n" #
    "### OQL data query layer\n" #
    "\n" #
    "- `schema() : async Text` — JSON schema of the queryable entities.\n" #
    "- `execute(qJson : Text) : async Result` — runs a JSON query over the\n" #
    "  queryable entities.\n" #
    "\n" #
    "The queryable entities are `contact`, `sosAlert`, `timer`, `location`,\n" #
    "`chat`, `message`, `checkInEvent`, and `activeCheckIn`. Each is authorized\n" #
    "`controllerOrScoped`: a signed-in user reads only their own rows, while the\n" #
    "platform controller reads all rows to answer aggregate questions. `chat` rows\n" #
    "are scoped by the owning user; `message` rows are scoped by the message\n" #
    "`sender`; `checkInEvent` and `activeCheckIn` rows are scoped by the owning\n" #
    "user.\n" #
    "\n" #
    "### API documentation\n" #
    "\n" #
    "- `getApiDoc() : async Text` — this document.\n" #
    "\n" #
    "## Units and encodings\n" #
    "\n" #
    "- **Timestamps** are nanoseconds since the Unix epoch (`Int`), e.g.\n" #
    "  `startedAtNs`, `lastCheckInAtNs`, `capturedAtNs`, and SOS `timestamp`.\n" #
    "- **Identifiers** (`Contact.id`, `SosAlert.id`) are `Nat`, assigned\n" #
    "  monotonically per user from a shared counter.\n" #
    "- **Relationships** are a variant: `#family`, `#friend`, `#colleague`,\n" #
    "  `#other`.\n" #
    "- **Contact** is `{ id : Nat; name : Text; phone : Text;\n" #
    "  relationship : Relationship; principal : ?Principal }`. `principal` is the\n" #
    "  contact's Internet Computer principal, used to resolve the contact to a\n" #
    "  chat participant for `createDirectChat`; it is `null` when the contact has\n" #
    "  no principal yet.\n" #
    "- **SOS status** is a variant: `#alerted`.\n" #
    "- **Timer status** is a variant: `#active`, `#stopped`.\n" #
    "- **Location** is `{ latitude : Float; longitude : Float }` (decimal degrees).\n" #
    "- **LocationSnapshot** is `{ latitude : Float; longitude : Float;\n" #
    "  accuracyM : ?Float; capturedAtNs : Int }`. `accuracyM` is optional; when\n" #
    "  absent it is `null`.\n" #
    "- **Phone** is stored as free-form `Text`; no normalization is applied.\n" #
    "- **Chat type** is a variant: `#direct`, `#support`, `#community`. For\n" #
    "  `#direct` chats, `participant` is the other party's principal; for\n" #
    "  `#support` and `#community` it is `null`.\n" #
    "- **Message kind** is a variant: `#text`, `#image`, `#location`. Exactly one\n" #
    "  of `text`, `imageUrl`, or `location` is populated depending on `kind`; the\n" #
    "  others are `null`.\n" #
    "- **ChatMessage** is `{ id : Nat; sender : Principal; kind : MessageKind;\n" #
    "  text : ?Text; imageUrl : ?Text; location : ?Location; timestamp : Int }`.\n" #
    "- **Chat** is `{ id : Nat; chatType : ChatType; participant : ?Principal;\n" #
    "  createdAt : Int }`.\n" #
    "- **FakeCall** is `{ active : Bool; startedAt : Int }`.\n" #
    "- **CheckInReminder** is `{ enabled : Bool; intervalSec : Nat;\n" #
    "  lastSentAt : Int }`.\n" #
    "- **CheckInReminderStatus** is `{ enabled : Bool; intervalSec : Nat;\n" #
    "  lastSentAt : Int; overdue : Bool; overdueSince : Int }`. `overdue` is true\n" #
    "  when the check-in interval has elapsed since `lastSentAt`; `overdueSince`\n" #
    "  is the timestamp at which the interval elapsed (in the past when overdue,\n" #
    "  in the future otherwise).\n" #
    "- **Identifiers** (`Chat.id`, `ChatMessage.id`) are `Nat`, assigned\n" #
    "  monotonically from a shared counter.\n" #
    "- **CheckInEvent** is `{ id : Nat; kind : CheckInKind; location :\n" #
    "  LocationSnapshot; timestamp : Int }`. `kind` is a variant: `#checkIn` for\n" #
    "  arrival, `#checkOut` for departure. `location` is the user's location at\n" #
    "  the time of the event and `timestamp` is when it occurred (nanoseconds\n" #
    "  since the Unix epoch).\n" #
    "- **ActiveCheckIn** is `{ checkedInAtNs : Int; location : LocationSnapshot\n" #
    "  }`. `checkedInAtNs` is when the user checked in and `location` is where.\n" #
    "  Absence of an `ActiveCheckIn` for a user means they are currently checked\n" #
    "  out.\n" #
    "- **CheckInEvent.id** is a `Nat`, assigned monotonically from a shared\n" #
    "  counter across all users.\n" #
    "\n" #
    "## Lifecycle and polling\n" #
    "\n" #
    "A safety timer is created by `startTimer` with `status = #active`. The\n" #
    "frontend computes remaining time from `startedAtNs` and `durationSec`.\n" #
    "`checkIn` refreshes `lastCheckInAtNs` and stores a live location snapshot.\n" #
    "`extendTimer` increases `durationSec`. `stopTimer` sets `status = #stopped`.\n" #
    "There is no server-side expiry; the timer remains in the map until stopped.\n" #
    "\n" #
    "A standalone check-in is created by `checkIn`, which sets the caller's\n" #
    "`ActiveCheckIn` and appends a `#checkIn` event to their history. `checkOut`\n" #
    "clears the active state and appends a `#checkOut` event. `getCheckInState`\n" #
    "reports whether the user is currently checked in; the frontend computes\n" #
    "elapsed time since check-in from `checkedInAtNs`. `listCheckInHistory`\n" #
    "returns the caller's own events, and `getCheckInHistoryFor` returns another\n" #
    "user's events to a trusted contact.\n" #
    "\n" #
    "A chat is created by `createDirectChat`, `getSupportChat`, or\n" #
    "`getCommunityChat`. `getSupportChat` and `getCommunityChat` are idempotent:\n" #
    "they return the existing chat of that type if one already exists for the\n" #
    "caller, creating it only on first use. Messages are appended to a chat in\n" #
    "creation order via `sendMessage` and `shareLocation`.\n" #
    "\n" #
    "Poll safely: call `getTimer` (a query) to read the current timer state, and\n" #
    "`getLocation` to read the latest snapshot, rather than polling update\n" #
    "endpoints.\n" #
    "\n" #
    "An auto safety check-in reminder is configured by `setCheckInReminder`,\n" #
    "which sets `lastSentAt` to the configuration time. The frontend polls\n" #
    "`checkInReminderStatus` (a query) periodically; when `overdue` becomes true,\n" #
    "the check-in interval has elapsed since the last check-in and the frontend\n" #
    "should notify the caller's trusted contacts. The user marks a check-in by\n" #
    "calling `markCheckIn`, which refreshes `lastSentAt` and clears the overdue\n" #
    "state on the next poll.\n" #
    "\n" #
    "## Mutation retry safety\n" #
    "\n" #
    "- `addContact` and `triggerSos` are not idempotent: each call creates a new\n" #
    "  record with a fresh id, so retrying a failed request may create duplicates.\n" #
    "  The returned record carries the new id; use it to deduplicate on the client.\n" #
    "- `updateContact` and `removeContact` are idempotent by id: updating or\n" #
    "  removing a non-existent id is a no-op (`updateContact` returns `null`,\n" #
    "  `removeContact` returns `false`).\n" #
    "- `startTimer` overwrites any existing timer for the caller. `timerCheckIn`\n" #
    "  and `extendTimer` trap if no timer exists. `stopTimer` is a no-op returning\n" #
    "  `null` when no timer exists.\n" #
    "- `checkIn` (standalone) overwrites any existing active check-in for the\n" #
    "  caller and appends a `#checkIn` event. `checkOut` is a no-op returning\n" #
    "  `null` when the caller is not checked in. Neither is idempotent: each call\n" #
    "  appends a new history event with a fresh id, so retrying a failed request\n" #
    "  may create duplicate events. The returned record carries the new id; use\n" #
    "  it to deduplicate on the client.\n" #
    "- `createDirectChat`, `sendMessage`, and `shareLocation` are not idempotent:\n" #
    "  each call creates a new record with a fresh id, so retrying a failed\n" #
    "  request may create duplicate chats or messages. The returned record carries\n" #
    "  the new id; use it to deduplicate on the client.\n" #
    "- `getSupportChat` and `getCommunityChat` are idempotent: they return the\n" #
    "  existing chat of that type rather than creating a duplicate.\n" #
    "- `startFakeCall` overwrites any existing fake-call state for the caller.\n" #
    "  `stopFakeCall` is a no-op returning `null` when no fake call is active.\n" #
    "- `setDiscreetMode` and `setCheckInReminder` overwrite the caller's previous\n" #
    "  setting. `markCheckIn` refreshes `lastSentAt` on the caller's reminder and\n" #
    "  is idempotent in effect (repeated calls just move `lastSentAt` forward).\n" #
    "  `checkInReminderStatus` is a read-only query.\n" #
    "\n" #
    "## Errors, traps, and limits\n" #
    "\n" #
    "- Anonymous callers to trusted-contacts/SOS and chat-and-safety methods trap\n" #
    "  with `Unauthorized: Please sign in to access trusted contacts`.\n" #
    "- A signed-in but unregistered caller traps with `User is not registered`\n" #
    "  when their role is looked up.\n" #
    "- `timerCheckIn` traps with `No active safety timer to check in` and\n" #
    "  `extendTimer` with `No active safety timer to extend` when the caller has\n" #
    "  no timer.\n" #
    "- `getCheckInHistoryFor` traps with\n" #
    "  `Unauthorized: You are not a trusted contact of this user` when the caller\n" #
    "  is not a trusted contact of the requested user.\n" #
    "- `assignCallerUserRole` traps with\n" #
    "  `Unauthorized: Only admins can assign user roles` for non-admins.\n" #
    "- `execute` traps with `OQL: invalid query — <detail>` on malformed JSON.\n" #
    "\n" #
    "## Non-obvious gotchas\n" #
    "\n" #
    "- The safety-timer endpoints do not enforce sign-in, unlike the trusted\n" #
    "  contacts endpoints. An anonymous caller can create a timer keyed to the\n" #
    "  anonymous principal.\n" #
    "- The standalone check-in endpoints (`checkIn`, `checkOut`, `getCheckInState`,\n" #
    "  `listCheckInHistory`, `getCheckInHistoryFor`) DO enforce sign-in, unlike\n" #
    "  the safety-timer endpoints. They are distinct from the safety-timer\n" #
    "  `timerCheckIn`, which records a live location against an active safety\n" #
    "  timer and does not touch the standalone check-in state or history.\n" #
    "- SOS alerts record the ids of the caller's contacts at trigger time\n" #
    "  (`alertedContacts`); they are not live references, so later contact edits do\n" #
    "  not change past alerts.\n" #
    "- The OQL query layer exposes per-user data with `controllerOrScoped`\n" #
    "  authorization: a signed-in user reads only their own rows, while the\n" #
    "  platform controller can read all rows to answer aggregate questions.\n" #
    "- `listMessages`, `sendMessage`, and `shareLocation` verify that the caller\n" #
    "  is a participant of the target chat before reading or writing messages. For\n" #
    "  direct chats the caller must be one of the two participants; for support\n" #
    "  and community chats the caller must have access to that chat. A caller who\n" #
    "  is not a member traps with `Unauthorized: You are not a member of this\n" #
    "  chat`.\n" #
    "- `createDirectChat` adds the chat to both the caller's and the\n" #
    "  participant's chat lists, so the participant sees the chat even though\n" #
    "  they did not create it.\n" #
    "- `getSupportChat` and `getCommunityChat` create at most one chat of each\n" #
    "  type per user; repeated calls return the same chat.\n"
  };
};
