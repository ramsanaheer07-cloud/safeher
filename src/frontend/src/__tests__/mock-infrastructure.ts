import { vi } from "vitest";

/**
 * Shared mock for `@caffeineai/core-infrastructure` and `@caffeineai/object-storage`.
 *
 * The app's hooks consume `useActor(createActor)` and `useInternetIdentity()`
 * from the former, and the generated `@/backend` wrapper imports `ExternalBlob`
 * from the latter. Both are mocked here so component tests drive real pages
 * with a controllable actor and auth state and no live canister.
 *
 * The hoisted state and `vi.mock` calls live at this module's top level so they
 * are registered before any page module loads. `setup.ts` imports this module
 * first, so the mocks are in place before any test file's page imports are
 * evaluated regardless of import order in the test file. Only plain functions
 * are exported — never the hoisted variable, which Vitest forbids exporting.
 */

const mockState = vi.hoisted(() => ({
  actor: null as unknown,
  auth: {
    isAuthenticated: true,
    isInitializing: false,
    isLoggingIn: false,
    isLoginError: false,
    loginError: null as Error | null,
  },
}));

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: mockState.actor, isFetching: false }),
  useInternetIdentity: () => ({
    identity: null,
    login: () => {},
    clear: () => {},
    isAuthenticated: mockState.auth.isAuthenticated,
    isInitializing: mockState.auth.isInitializing,
    isLoggingIn: mockState.auth.isLoggingIn,
    isLoginError: mockState.auth.isLoginError,
    loginError: mockState.auth.loginError,
  }),
}));

vi.mock("@caffeineai/object-storage", () => ({
  ExternalBlob: class ExternalBlob {},
}));

/** Controllable fake for the backend actor returned by `useActor`. */
export interface MockActor {
  listContacts: ReturnType<typeof vi.fn>;
  addContact: ReturnType<typeof vi.fn>;
  updateContact: ReturnType<typeof vi.fn>;
  removeContact: ReturnType<typeof vi.fn>;
  triggerSos: ReturnType<typeof vi.fn>;
  listSosAlerts: ReturnType<typeof vi.fn>;
  getSosAlert: ReturnType<typeof vi.fn>;
  getTimer: ReturnType<typeof vi.fn>;
  startTimer: ReturnType<typeof vi.fn>;
  timerCheckIn: ReturnType<typeof vi.fn>;
  extendTimer: ReturnType<typeof vi.fn>;
  stopTimer: ReturnType<typeof vi.fn>;
  getLocation: ReturnType<typeof vi.fn>;
  checkIn: ReturnType<typeof vi.fn>;
  checkOut: ReturnType<typeof vi.fn>;
  getCheckInState: ReturnType<typeof vi.fn>;
  listCheckInHistory: ReturnType<typeof vi.fn>;
  getCheckInHistoryFor: ReturnType<typeof vi.fn>;
  listChats: ReturnType<typeof vi.fn>;
  getChat: ReturnType<typeof vi.fn>;
  createDirectChat: ReturnType<typeof vi.fn>;
  sendMessage: ReturnType<typeof vi.fn>;
  listMessages: ReturnType<typeof vi.fn>;
  shareLocation: ReturnType<typeof vi.fn>;
  getSupportChat: ReturnType<typeof vi.fn>;
  getCommunityChat: ReturnType<typeof vi.fn>;
  getFakeCall: ReturnType<typeof vi.fn>;
  startFakeCall: ReturnType<typeof vi.fn>;
  stopFakeCall: ReturnType<typeof vi.fn>;
  getDiscreetMode: ReturnType<typeof vi.fn>;
  setDiscreetMode: ReturnType<typeof vi.fn>;
  getCheckInReminder: ReturnType<typeof vi.fn>;
  setCheckInReminder: ReturnType<typeof vi.fn>;
  checkInReminderStatus: ReturnType<typeof vi.fn>;
  markCheckIn: ReturnType<typeof vi.fn>;
  isCallerAdmin: ReturnType<typeof vi.fn>;
}

export function createMockActor(): MockActor {
  return {
    listContacts: vi.fn(),
    addContact: vi.fn(),
    updateContact: vi.fn(),
    removeContact: vi.fn(),
    triggerSos: vi.fn(),
    listSosAlerts: vi.fn(),
    getSosAlert: vi.fn(),
    getTimer: vi.fn(),
    startTimer: vi.fn(),
    timerCheckIn: vi.fn(),
    extendTimer: vi.fn(),
    stopTimer: vi.fn(),
    getLocation: vi.fn(),
    checkIn: vi.fn(),
    checkOut: vi.fn(),
    getCheckInState: vi.fn(),
    listCheckInHistory: vi.fn(),
    getCheckInHistoryFor: vi.fn(),
    listChats: vi.fn(),
    getChat: vi.fn(),
    createDirectChat: vi.fn(),
    sendMessage: vi.fn(),
    listMessages: vi.fn(),
    shareLocation: vi.fn(),
    getSupportChat: vi.fn(),
    getCommunityChat: vi.fn(),
    getFakeCall: vi.fn(),
    startFakeCall: vi.fn(),
    stopFakeCall: vi.fn(),
    getDiscreetMode: vi.fn(),
    setDiscreetMode: vi.fn(),
    getCheckInReminder: vi.fn(),
    setCheckInReminder: vi.fn(),
    checkInReminderStatus: vi.fn(),
    markCheckIn: vi.fn(),
    isCallerAdmin: vi.fn(),
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  isLoginError: boolean;
  loginError: Error | null;
}

export const defaultAuthState: AuthState = {
  isAuthenticated: true,
  isInitializing: false,
  isLoggingIn: false,
  isLoginError: false,
  loginError: null,
};

/** Point the shared mock at a specific actor and auth state before rendering. */
export function mockInfrastructure(
  actor: MockActor,
  auth: Partial<AuthState> = {},
) {
  mockState.actor = actor;
  mockState.auth = { ...defaultAuthState, ...auth };
}
