import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Types "../types/chat-and-safety";
import TrustedTypes "../types/trusted-contacts";

module {
  /// Traps unless the caller is a participant of the given chat. For direct
  /// chats the caller must be one of the two participants; for support and
  /// community chats the caller must have access to that chat (i.e. it is in
  /// the caller's chat list).
  func requireMembership(
    chats : Map.Map<Principal.Principal, List.List<Types.Chat>>,
    caller : Principal.Principal,
    chatId : Types.ChatId,
  ) {
    switch (getChat(chats, caller, chatId)) {
      case (?_) {};
      case null { Runtime.trap("Unauthorized: You are not a member of this chat") };
    };
  };

  func addChatToUser(
    chats : Map.Map<Principal.Principal, List.List<Types.Chat>>,
    user : Principal.Principal,
    chat : Types.Chat,
  ) {
    switch (chats.get(user)) {
      case (?list) { list.add(chat) };
      case null {
        let list = List.empty<Types.Chat>();
        list.add(chat);
        chats.add(user, list);
      };
    };
  };

  /// Returns the caller's chats.
  public func listChats(
    chats : Map.Map<Principal.Principal, List.List<Types.Chat>>,
    caller : Principal.Principal,
  ) : [Types.Chat] {
    switch (chats.get(caller)) {
      case (?list) list.toArray();
      case null [];
    };
  };

  /// Returns a single chat by id, if it belongs to the caller.
  public func getChat(
    chats : Map.Map<Principal.Principal, List.List<Types.Chat>>,
    caller : Principal.Principal,
    chatId : Types.ChatId,
  ) : ?Types.Chat {
    switch (chats.get(caller)) {
      case null null;
      case (?list) list.find(func c = c.id == chatId);
    };
  };

  /// Creates a private 1-on-1 chat with a trusted contact and returns it.
  public func createDirectChat(
    chats : Map.Map<Principal.Principal, List.List<Types.Chat>>,
    state : { var nextChatId : Types.ChatId },
    caller : Principal.Principal,
    participant : Principal.Principal,
  ) : Types.Chat {
    let chat : Types.Chat = {
      id = state.nextChatId;
      chatType = #direct;
      participant = ?participant;
      createdAt = Time.now();
    };
    state.nextChatId += 1;
    addChatToUser(chats, caller, chat);
    addChatToUser(chats, participant, chat);
    chat;
  };

  /// Sends a text or image message to a chat and returns the stored message.
  public func sendMessage(
    chats : Map.Map<Principal.Principal, List.List<Types.Chat>>,
    messages : Map.Map<Types.ChatId, List.List<Types.ChatMessage>>,
    state : { var nextMessageId : Types.MessageId },
    caller : Principal.Principal,
    chatId : Types.ChatId,
    kind : Types.MessageKind,
    text : ?Text,
    imageUrl : ?Text,
  ) : Types.ChatMessage {
    requireMembership(chats, caller, chatId);
    let message : Types.ChatMessage = {
      id = state.nextMessageId;
      sender = caller;
      kind;
      text;
      imageUrl;
      location = null;
      timestamp = Time.now();
    };
    state.nextMessageId += 1;
    switch (messages.get(chatId)) {
      case (?list) { list.add(message) };
      case null {
        let list = List.empty<Types.ChatMessage>();
        list.add(message);
        messages.add(chatId, list);
      };
    };
    message;
  };

  /// Returns the messages of a chat.
  public func listMessages(
    chats : Map.Map<Principal.Principal, List.List<Types.Chat>>,
    messages : Map.Map<Types.ChatId, List.List<Types.ChatMessage>>,
    caller : Principal.Principal,
    chatId : Types.ChatId,
  ) : [Types.ChatMessage] {
    requireMembership(chats, caller, chatId);
    switch (messages.get(chatId)) {
      case (?list) list.toArray();
      case null [];
    };
  };

  /// Shares a live location as a message within a chat.
  public func shareLocation(
    chats : Map.Map<Principal.Principal, List.List<Types.Chat>>,
    messages : Map.Map<Types.ChatId, List.List<Types.ChatMessage>>,
    state : { var nextMessageId : Types.MessageId },
    caller : Principal.Principal,
    chatId : Types.ChatId,
    location : TrustedTypes.Location,
  ) : Types.ChatMessage {
    requireMembership(chats, caller, chatId);
    let message : Types.ChatMessage = {
      id = state.nextMessageId;
      sender = caller;
      kind = #location;
      text = null;
      imageUrl = null;
      location = ?location;
      timestamp = Time.now();
    };
    state.nextMessageId += 1;
    switch (messages.get(chatId)) {
      case (?list) { list.add(message) };
      case null {
        let list = List.empty<Types.ChatMessage>();
        list.add(message);
        messages.add(chatId, list);
      };
    };
    message;
  };

  /// Returns (creating if needed) the caller's dedicated support/helpline chat.
  public func getSupportChat(
    chats : Map.Map<Principal.Principal, List.List<Types.Chat>>,
    state : { var nextChatId : Types.ChatId },
    caller : Principal.Principal,
  ) : Types.Chat {
    switch (chats.get(caller)) {
      case (?list) {
        switch (list.find(func c = c.chatType == #support)) {
          case (?chat) chat;
          case null {
            let chat : Types.Chat = {
              id = state.nextChatId;
              chatType = #support;
              participant = null;
              createdAt = Time.now();
            };
            state.nextChatId += 1;
            list.add(chat);
            chat;
          };
        };
      };
      case null {
        let chat : Types.Chat = {
          id = state.nextChatId;
          chatType = #support;
          participant = null;
          createdAt = Time.now();
        };
        state.nextChatId += 1;
        let list = List.empty<Types.Chat>();
        list.add(chat);
        chats.add(caller, list);
        chat;
      };
    };
  };

  /// Returns (creating if needed) the anonymous community chat for the caller.
  public func getCommunityChat(
    chats : Map.Map<Principal.Principal, List.List<Types.Chat>>,
    state : { var nextChatId : Types.ChatId },
    caller : Principal.Principal,
  ) : Types.Chat {
    switch (chats.get(caller)) {
      case (?list) {
        switch (list.find(func c = c.chatType == #community)) {
          case (?chat) chat;
          case null {
            let chat : Types.Chat = {
              id = state.nextChatId;
              chatType = #community;
              participant = null;
              createdAt = Time.now();
            };
            state.nextChatId += 1;
            list.add(chat);
            chat;
          };
        };
      };
      case null {
        let chat : Types.Chat = {
          id = state.nextChatId;
          chatType = #community;
          participant = null;
          createdAt = Time.now();
        };
        state.nextChatId += 1;
        let list = List.empty<Types.Chat>();
        list.add(chat);
        chats.add(caller, list);
        chat;
      };
    };
  };

  /// Starts a fake incoming call for the caller.
  public func startFakeCall(
    fakeCall : Map.Map<Principal.Principal, Types.FakeCall>,
    caller : Principal.Principal,
  ) : Types.FakeCall {
    let call : Types.FakeCall = {
      active = true;
      startedAt = Time.now();
    };
    fakeCall.add(caller, call);
    call;
  };

  /// Stops the caller's active fake call, if any.
  public func stopFakeCall(
    fakeCall : Map.Map<Principal.Principal, Types.FakeCall>,
    caller : Principal.Principal,
  ) : ?Types.FakeCall {
    let previous = fakeCall.get(caller);
    fakeCall.remove(caller);
    previous;
  };

  /// Returns the caller's current fake-call state, if any.
  public func getFakeCall(
    fakeCall : Map.Map<Principal.Principal, Types.FakeCall>,
    caller : Principal.Principal,
  ) : ?Types.FakeCall {
    fakeCall.get(caller);
  };

  /// Enables or disables discreet mode for the caller and returns the new state.
  public func setDiscreetMode(
    discreetMode : Map.Map<Principal.Principal, Bool>,
    caller : Principal.Principal,
    enabled : Bool,
  ) : Bool {
    discreetMode.add(caller, enabled);
    enabled;
  };

  /// Returns whether discreet mode is enabled for the caller.
  public func getDiscreetMode(
    discreetMode : Map.Map<Principal.Principal, Bool>,
    caller : Principal.Principal,
  ) : Bool {
    switch (discreetMode.get(caller)) {
      case (?v) v;
      case null false;
    };
  };

  /// Configures the caller's auto safety check-in reminder and returns it.
  public func setCheckInReminder(
    checkInReminders : Map.Map<Principal.Principal, Types.CheckInReminder>,
    caller : Principal.Principal,
    intervalSec : Nat,
  ) : Types.CheckInReminder {
    let reminder : Types.CheckInReminder = {
      enabled = true;
      intervalSec;
      lastSentAt = Time.now();
    };
    checkInReminders.add(caller, reminder);
    reminder;
  };

  /// Returns the caller's auto safety check-in reminder, if any.
  public func getCheckInReminder(
    checkInReminders : Map.Map<Principal.Principal, Types.CheckInReminder>,
    caller : Principal.Principal,
  ) : ?Types.CheckInReminder {
    checkInReminders.get(caller);
  };

  /// Marks a check-in for the caller's auto safety check-in reminder, updating
  /// the last check-in time to now. Returns the updated reminder, or `null` if
  /// the caller has no reminder configured.
  public func markCheckIn(
    checkInReminders : Map.Map<Principal.Principal, Types.CheckInReminder>,
    caller : Principal.Principal,
  ) : ?Types.CheckInReminder {
    switch (checkInReminders.get(caller)) {
      case (?reminder) {
        let updated = { reminder with lastSentAt = Time.now() };
        checkInReminders.add(caller, updated);
        ?updated;
      };
      case null { null };
    };
  };

  /// Computes the caller's auto safety check-in reminder status, reporting
  /// whether the check-in interval has elapsed since the last check-in. Returns
  /// `null` if the caller has no reminder configured.
  public func checkInReminderStatus(
    checkInReminders : Map.Map<Principal.Principal, Types.CheckInReminder>,
    caller : Principal.Principal,
  ) : ?Types.CheckInReminderStatus {
    switch (checkInReminders.get(caller)) {
      case (?reminder) {
        let now = Time.now();
        let intervalNs = reminder.intervalSec * 1000000000;
        let overdueSince = reminder.lastSentAt + intervalNs.toInt();
        let overdue = now > overdueSince;
        ?{
          enabled = reminder.enabled;
          intervalSec = reminder.intervalSec;
          lastSentAt = reminder.lastSentAt;
          overdue;
          overdueSince;
        };
      };
      case null { null };
    };
  };
};
