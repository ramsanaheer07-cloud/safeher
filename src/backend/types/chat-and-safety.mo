import Principal "mo:core/Principal";
import TrustedTypes "../types/trusted-contacts";

module {
  public type ChatId = Nat;
  public type MessageId = Nat;

  /// The kind of a chat: a private 1-on-1 chat with a trusted contact, the
  /// dedicated support/helpline chat, or the anonymous community chat.
  public type ChatType = {
    #direct;
    #support;
    #community;
  };

  /// The kind of a message: plain text, an image, or a shared live location.
  public type MessageKind = {
    #text;
    #image;
    #location;
  };

  /// A single message within a chat. Exactly one of `text`, `imageUrl`, or
  /// `location` is populated depending on `kind`.
  public type ChatMessage = {
    id : MessageId;
    sender : Principal;
    kind : MessageKind;
    text : ?Text;
    imageUrl : ?Text;
    location : ?TrustedTypes.Location;
    timestamp : Int;
  };

  /// A chat conversation. For `#direct` chats, `participant` is the other
  /// party's principal. For `#support` and `#community` chats it is `null`.
  public type Chat = {
    id : ChatId;
    chatType : ChatType;
    participant : ?Principal;
    createdAt : Int;
  };

  /// The fake-call feature state for a user, used to escape uncomfortable
  /// situations by simulating an incoming call.
  public type FakeCall = {
    active : Bool;
    startedAt : Int;
  };

  /// Auto safety check-in reminder configuration for a user.
  public type CheckInReminder = {
    enabled : Bool;
    intervalSec : Nat;
    lastSentAt : Int;
  };

  /// The result of checking the auto safety check-in reminder status. `overdue`
  /// is true when the check-in interval has elapsed since `lastSentAt`;
  /// `overdueSince` is the timestamp at which the interval elapsed (in the past
  /// when overdue, in the future otherwise).
  public type CheckInReminderStatus = {
    enabled : Bool;
    intervalSec : Nat;
    lastSentAt : Int;
    overdue : Bool;
    overdueSince : Int;
  };
};
