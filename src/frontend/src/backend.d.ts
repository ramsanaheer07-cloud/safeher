import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Location {
    latitude: number;
    longitude: number;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface ActiveCheckIn {
    checkedInAtNs: bigint;
    location: LocationSnapshot;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface ChatMessage {
    id: MessageId;
    kind: MessageKind;
    text?: string;
    sender: Principal;
    imageUrl?: string;
    timestamp: bigint;
    location?: Location;
}
export interface SafetyTimer {
    lastCheckInAtNs: bigint;
    status: TimerStatus;
    startedAtNs: bigint;
    durationSec: bigint;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export interface LocationSnapshot {
    latitude: number;
    longitude: number;
    capturedAtNs: bigint;
    accuracyM?: number;
}
export type SosAlertId = bigint;
export interface SosAlert {
    id: SosAlertId;
    status: SosAlertStatus;
    alertedContacts: Array<ContactId>;
    timestamp: bigint;
    location: Location;
}
export interface FakeCall {
    startedAt: bigint;
    active: boolean;
}
export interface CheckInReminder {
    lastSentAt: bigint;
    intervalSec: bigint;
    enabled: boolean;
}
export type ChatId = bigint;
export interface Contact {
    id: ContactId;
    principal?: Principal;
    relationship: Relationship;
    name: string;
    phone: string;
}
export interface CheckInReminderStatus {
    lastSentAt: bigint;
    intervalSec: bigint;
    enabled: boolean;
    overdueSince: bigint;
    overdue: boolean;
}
export type Principal = Principal;
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export interface CheckInEvent {
    id: bigint;
    kind: CheckInKind;
    timestamp: bigint;
    location: LocationSnapshot;
}
export type MessageId = bigint;
export interface Chat {
    id: ChatId;
    createdAt: bigint;
    participant?: Principal;
    chatType: ChatType;
}
export type ContactId = bigint;
export enum ChatType {
    support = "support",
    community = "community",
    direct = "direct"
}
export enum CheckInKind {
    checkIn = "checkIn",
    checkOut = "checkOut"
}
export enum MessageKind {
    text = "text",
    image = "image",
    location = "location"
}
export enum Relationship {
    other = "other",
    colleague = "colleague",
    friend = "friend",
    family = "family"
}
export enum SosAlertStatus {
    alerted = "alerted"
}
export enum TimerStatus {
    active = "active",
    stopped = "stopped"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addContact(name: string, phone: string, relationship: Relationship, principal: Principal | null): Promise<Contact>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkIn(location: LocationSnapshot): Promise<ActiveCheckIn>;
    checkInReminderStatus(): Promise<CheckInReminderStatus | null>;
    checkOut(location: LocationSnapshot): Promise<CheckInEvent | null>;
    createDirectChat(participant: Principal): Promise<Chat>;
    execute(qJson: string): Promise<Result>;
    extendTimer(extraSec: bigint): Promise<SafetyTimer>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getChat(chatId: ChatId): Promise<Chat | null>;
    getCheckInHistoryFor(user: Principal): Promise<Array<CheckInEvent>>;
    getCheckInReminder(): Promise<CheckInReminder | null>;
    getCheckInState(): Promise<ActiveCheckIn | null>;
    getCommunityChat(): Promise<Chat>;
    getDiscreetMode(): Promise<boolean>;
    getFakeCall(): Promise<FakeCall | null>;
    getLocation(): Promise<LocationSnapshot | null>;
    getSosAlert(id: SosAlertId): Promise<SosAlert | null>;
    getSupportChat(): Promise<Chat>;
    getTimer(): Promise<SafetyTimer | null>;
    isCallerAdmin(): Promise<boolean>;
    listChats(): Promise<Array<Chat>>;
    listCheckInHistory(): Promise<Array<CheckInEvent>>;
    listContacts(): Promise<Array<Contact>>;
    listMessages(chatId: ChatId): Promise<Array<ChatMessage>>;
    listSosAlerts(): Promise<Array<SosAlert>>;
    markCheckIn(): Promise<CheckInReminder | null>;
    removeContact(id: ContactId): Promise<boolean>;
    schema(): Promise<string>;
    sendMessage(chatId: ChatId, kind: MessageKind, text: string | null, imageUrl: string | null): Promise<ChatMessage>;
    setCheckInReminder(intervalSec: bigint): Promise<CheckInReminder>;
    setDiscreetMode(enabled: boolean): Promise<boolean>;
    shareLocation(chatId: ChatId, location: Location): Promise<ChatMessage>;
    startFakeCall(): Promise<FakeCall>;
    startTimer(durationSec: bigint): Promise<SafetyTimer>;
    stopFakeCall(): Promise<FakeCall | null>;
    stopTimer(): Promise<SafetyTimer | null>;
    timerCheckIn(location: LocationSnapshot): Promise<SafetyTimer>;
    triggerSos(location: Location): Promise<SosAlert>;
    updateContact(id: ContactId, name: string, phone: string, relationship: Relationship, principal: Principal | null): Promise<Contact | null>;
}
