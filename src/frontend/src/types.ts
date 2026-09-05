export type Relationship =
  | "family"
  | "friend"
  | "partner"
  | "colleague"
  | "other";

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship: Relationship;
}

export type TimerStatus = "active" | "paused" | "completed" | "cancelled";

export interface SafetyTimer {
  id: string;
  durationMinutes: number;
  startedAt: number;
  status: TimerStatus;
}

export type ResourceCategory =
  | "helplines"
  | "self-defense"
  | "travel-safety"
  | "digital-safety";

export interface SafetyResource {
  id: string;
  title: string;
  category: ResourceCategory;
  summary: string;
  content: string;
}

export type NavKey =
  | "home"
  | "sos"
  | "contacts"
  | "timer"
  | "resources"
  | "chat"
  | "fake-call"
  | "discreet"
  | "safety-tools"
  | "check-in";

// Chat and safety types re-exported from the backend contract so pages can
// import them from a single shared module.
export type {
  Chat,
  ChatId,
  ChatMessage,
  ChatType,
  MessageKind,
  FakeCall,
  CheckInReminder,
  Location,
  ActiveCheckIn,
  CheckInEvent,
  CheckInKind,
} from "@/backend";
