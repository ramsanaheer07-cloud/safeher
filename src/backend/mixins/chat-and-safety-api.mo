import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Types "../types/chat-and-safety";
import TrustedTypes "../types/trusted-contacts";
import ChatAndSafetyLib "../lib/chat-and-safety";

mixin (
  chats : Map.Map<Principal.Principal, List.List<Types.Chat>>,
  messages : Map.Map<Types.ChatId, List.List<Types.ChatMessage>>,
  state : { var nextChatId : Types.ChatId; var nextMessageId : Types.MessageId },
  fakeCall : Map.Map<Principal.Principal, Types.FakeCall>,
  discreetMode : Map.Map<Principal.Principal, Bool>,
  checkInReminders : Map.Map<Principal.Principal, Types.CheckInReminder>,
  requireSignedIn : (Principal.Principal) -> (),
) {
  /// Returns the caller's chats.
  public shared query ({ caller }) func listChats() : async [Types.Chat] {
    requireSignedIn(caller);
    ChatAndSafetyLib.listChats(chats, caller);
  };

  /// Returns a single chat by id, if it belongs to the caller.
  public shared query ({ caller }) func getChat(chatId : Types.ChatId) : async ?Types.Chat {
    requireSignedIn(caller);
    ChatAndSafetyLib.getChat(chats, caller, chatId);
  };

  /// Creates a private 1-on-1 chat with a trusted contact.
  public shared ({ caller }) func createDirectChat(participant : Principal.Principal) : async Types.Chat {
    requireSignedIn(caller);
    ChatAndSafetyLib.createDirectChat(chats, state, caller, participant);
  };

  /// Sends a text or image message to a chat.
  public shared ({ caller }) func sendMessage(chatId : Types.ChatId, kind : Types.MessageKind, text : ?Text, imageUrl : ?Text) : async Types.ChatMessage {
    requireSignedIn(caller);
    ChatAndSafetyLib.sendMessage(chats, messages, state, caller, chatId, kind, text, imageUrl);
  };

  /// Returns the messages of a chat.
  public shared query ({ caller }) func listMessages(chatId : Types.ChatId) : async [Types.ChatMessage] {
    requireSignedIn(caller);
    ChatAndSafetyLib.listMessages(chats, messages, caller, chatId);
  };

  /// Shares a live location as a message within a chat.
  public shared ({ caller }) func shareLocation(chatId : Types.ChatId, location : TrustedTypes.Location) : async Types.ChatMessage {
    requireSignedIn(caller);
    ChatAndSafetyLib.shareLocation(chats, messages, state, caller, chatId, location);
  };

  /// Returns (creating if needed) the caller's support/helpline chat.
  public shared ({ caller }) func getSupportChat() : async Types.Chat {
    requireSignedIn(caller);
    ChatAndSafetyLib.getSupportChat(chats, state, caller);
  };

  /// Returns (creating if needed) the anonymous community chat for the caller.
  public shared ({ caller }) func getCommunityChat() : async Types.Chat {
    requireSignedIn(caller);
    ChatAndSafetyLib.getCommunityChat(chats, state, caller);
  };

  /// Starts a fake incoming call for the caller.
  public shared ({ caller }) func startFakeCall() : async Types.FakeCall {
    requireSignedIn(caller);
    ChatAndSafetyLib.startFakeCall(fakeCall, caller);
  };

  /// Stops the caller's active fake call, if any.
  public shared ({ caller }) func stopFakeCall() : async ?Types.FakeCall {
    requireSignedIn(caller);
    ChatAndSafetyLib.stopFakeCall(fakeCall, caller);
  };

  /// Returns the caller's current fake-call state, if any.
  public shared query ({ caller }) func getFakeCall() : async ?Types.FakeCall {
    requireSignedIn(caller);
    ChatAndSafetyLib.getFakeCall(fakeCall, caller);
  };

  /// Enables or disables discreet mode for the caller.
  public shared ({ caller }) func setDiscreetMode(enabled : Bool) : async Bool {
    requireSignedIn(caller);
    ChatAndSafetyLib.setDiscreetMode(discreetMode, caller, enabled);
  };

  /// Returns whether discreet mode is enabled for the caller.
  public shared query ({ caller }) func getDiscreetMode() : async Bool {
    requireSignedIn(caller);
    ChatAndSafetyLib.getDiscreetMode(discreetMode, caller);
  };

  /// Configures the caller's auto safety check-in reminder.
  public shared ({ caller }) func setCheckInReminder(intervalSec : Nat) : async Types.CheckInReminder {
    requireSignedIn(caller);
    ChatAndSafetyLib.setCheckInReminder(checkInReminders, caller, intervalSec);
  };

  /// Returns the caller's auto safety check-in reminder, if any.
  public shared query ({ caller }) func getCheckInReminder() : async ?Types.CheckInReminder {
    requireSignedIn(caller);
    ChatAndSafetyLib.getCheckInReminder(checkInReminders, caller);
  };

  /// Marks a check-in for the caller's auto safety check-in reminder, updating
  /// the last check-in time. Returns the updated reminder, or `null` if the
  /// caller has no reminder configured.
  public shared ({ caller }) func markCheckIn() : async ?Types.CheckInReminder {
    requireSignedIn(caller);
    ChatAndSafetyLib.markCheckIn(checkInReminders, caller);
  };

  /// Returns the caller's auto safety check-in reminder status, reporting
  /// whether the check-in interval has elapsed since the last check-in. The
  /// frontend polls this to detect a missed check-in and notify trusted
  /// contacts. Returns `null` if the caller has no reminder configured.
  public shared query ({ caller }) func checkInReminderStatus() : async ?Types.CheckInReminderStatus {
    requireSignedIn(caller);
    ChatAndSafetyLib.checkInReminderStatus(checkInReminders, caller);
  };
};
