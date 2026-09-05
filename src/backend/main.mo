import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import OQL "mo:caffeineai-oql";
import Entity "mo:caffeineai-oql/Entity";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import FloatValue "mo:caffeineai-oql/FloatValue";
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Types "types/trusted-contacts";
import SafetyTimerTypes "types/safety-timer";
import ChatAndSafetyTypes "types/chat-and-safety";
import CheckinTypes "types/checkin";
import TrustedContactsApi "mixins/trusted-contacts-api";
import SafetyTimerApi "mixins/safety-timer-api";
import ChatAndSafetyApi "mixins/chat-and-safety-api";
import CheckinApi "mixins/checkin-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let contacts : Map.Map<Principal.Principal, List.List<Types.Contact>>;
  let sosAlerts : Map.Map<Principal.Principal, List.List<Types.SosAlert>>;
  let state : { var nextContactId : Types.ContactId; var nextSosAlertId : Types.SosAlertId };
  let timers : Map.Map<Principal.Principal, SafetyTimerTypes.SafetyTimer>;
  let locations : Map.Map<Principal.Principal, SafetyTimerTypes.LocationSnapshot>;
  let chats : Map.Map<Principal.Principal, List.List<ChatAndSafetyTypes.Chat>>;
  let messages : Map.Map<ChatAndSafetyTypes.ChatId, List.List<ChatAndSafetyTypes.ChatMessage>>;
  let chatState : { var nextChatId : ChatAndSafetyTypes.ChatId; var nextMessageId : ChatAndSafetyTypes.MessageId };
  let fakeCall : Map.Map<Principal.Principal, ChatAndSafetyTypes.FakeCall>;
  let discreetMode : Map.Map<Principal.Principal, Bool>;
  let checkInReminders : Map.Map<Principal.Principal, ChatAndSafetyTypes.CheckInReminder>;
  let activeCheckIns : Map.Map<Principal.Principal, CheckinTypes.ActiveCheckIn>;
  let checkInHistory : Map.Map<Principal.Principal, List.List<CheckinTypes.CheckInEvent>>;
  let checkInState : { var nextCheckInEventId : Nat };
  func requireSignedIn(caller : Principal.Principal) {
    let role = AccessControl.getUserRole(accessControlState, caller);
    if (role == #guest) {
      Runtime.trap("Unauthorized: Please sign in to access trusted contacts");
    };
  };
  include MixinAuthorization(accessControlState, null);
  include TrustedContactsApi(contacts, sosAlerts, state, accessControlState, requireSignedIn);
  include SafetyTimerApi(timers, locations);
  include ChatAndSafetyApi(chats, messages, chatState, fakeCall, discreetMode, checkInReminders, requireSignedIn);
  include CheckinApi(activeCheckIns, checkInHistory, checkInState, contacts, requireSignedIn);

  // --- OQL entity helpers ---
  func relationshipToText(r : Types.Relationship) : Text {
    switch r {
      case (#family) "family";
      case (#friend) "friend";
      case (#colleague) "colleague";
      case (#other) "other";
    };
  };

  func sosStatusToText(s : Types.SosAlertStatus) : Text {
    switch s {
      case (#alerted) "alerted";
    };
  };

  func timerStatusToText(s : SafetyTimerTypes.TimerStatus) : Text {
    switch s {
      case (#active) "active";
      case (#stopped) "stopped";
    };
  };

  func accuracyToFloat(a : ?Float) : Float {
    switch a {
      case (?v) v;
      case null -1.0;
    };
  };

  func chatTypeToText(t : ChatAndSafetyTypes.ChatType) : Text {
    switch t {
      case (#direct) "direct";
      case (#support) "support";
      case (#community) "community";
    };
  };

  func participantToText(p : ?Principal.Principal) : Text {
    switch p {
      case (?pr) pr.toText();
      case null "";
    };
  };

  func messageKindToText(k : ChatAndSafetyTypes.MessageKind) : Text {
    switch k {
      case (#text) "text";
      case (#image) "image";
      case (#location) "location";
    };
  };

  func optTextToText(t : ?Text) : Text {
    switch t {
      case (?v) v;
      case null "";
    };
  };

  func checkInKindToText(k : CheckinTypes.CheckInKind) : Text {
    switch k {
      case (#checkIn) "checkIn";
      case (#checkOut) "checkOut";
    };
  };

  func locationLat(l : ?Types.Location) : Float {
    switch l {
      case (?loc) loc.latitude;
      case null -1.0;
    };
  };

  func locationLng(l : ?Types.Location) : Float {
    switch l {
      case (?loc) loc.longitude;
      case null -1.0;
    };
  };

  func contactRows() : Iter.Iter<(Principal.Principal, Types.Contact)> {
    let rows = List.empty<(Principal.Principal, Types.Contact)>();
    for ((p, list) in contacts.entries()) {
      for (c in list.toArray().values()) {
        rows.add((p, c));
      };
    };
    rows.toArray().values();
  };

  func sosAlertRows() : Iter.Iter<(Principal.Principal, Types.SosAlert)> {
    let rows = List.empty<(Principal.Principal, Types.SosAlert)>();
    for ((p, list) in sosAlerts.entries()) {
      for (a in list.toArray().values()) {
        rows.add((p, a));
      };
    };
    rows.toArray().values();
  };

  func timerRows() : Iter.Iter<(Principal.Principal, SafetyTimerTypes.SafetyTimer)> {
    timers.entries();
  };

  func locationRows() : Iter.Iter<(Principal.Principal, SafetyTimerTypes.LocationSnapshot)> {
    locations.entries();
  };

  func chatRows() : Iter.Iter<(Principal.Principal, ChatAndSafetyTypes.Chat)> {
    let rows = List.empty<(Principal.Principal, ChatAndSafetyTypes.Chat)>();
    for ((p, list) in chats.entries()) {
      for (c in list.toArray().values()) {
        rows.add((p, c));
      };
    };
    rows.toArray().values();
  };

  func messageRows() : Iter.Iter<(ChatAndSafetyTypes.ChatId, ChatAndSafetyTypes.ChatMessage)> {
    let rows = List.empty<(ChatAndSafetyTypes.ChatId, ChatAndSafetyTypes.ChatMessage)>();
    for ((chatId, list) in messages.entries()) {
      for (m in list.toArray().values()) {
        rows.add((chatId, m));
      };
    };
    rows.toArray().values();
  };

  func checkInEventRows() : Iter.Iter<(Principal.Principal, CheckinTypes.CheckInEvent)> {
    let rows = List.empty<(Principal.Principal, CheckinTypes.CheckInEvent)>();
    for ((p, list) in checkInHistory.entries()) {
      for (e in list.toArray().values()) {
        rows.add((p, e));
      };
    };
    rows.toArray().values();
  };

  func activeCheckInRows() : Iter.Iter<(Principal.Principal, CheckinTypes.ActiveCheckIn)> {
    activeCheckIns.entries();
  };

  include Expose({
    entities = [
      OQL.Entity.manual<(Principal.Principal, Types.Contact)>("contact", contactRows, "Contact", "id")
        .sample((Principal.fromText("aaaaa-aa"), { id = 0; name = ""; phone = ""; relationship = #other; principal = null }))
        .payload("user", func ((p, _)) = p)
        .payload("id", func ((_, c)) = c.id)
        .payload("name", func ((_, c)) = c.name)
        .payload("phone", func ((_, c)) = c.phone)
        .payload("relationship", func ((_, c)) = relationshipToText(c.relationship))
        .payload("principal", func ((_, c)) = participantToText(c.principal))
        .ownedBy("user")
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<(Principal.Principal, Types.SosAlert)>("sosAlert", sosAlertRows, "SosAlert", "id")
        .sample((Principal.fromText("aaaaa-aa"), { id = 0; timestamp = 0; location = { latitude = 0.0; longitude = 0.0 }; alertedContacts = []; status = #alerted }))
        .payload("user", func ((p, _)) = p)
        .payload("id", func ((_, a)) = a.id)
        .payload("timestamp", func ((_, a)) = a.timestamp)
        .payload("latitude", func ((_, a)) = a.location.latitude)
        .payload("longitude", func ((_, a)) = a.location.longitude)
        .payload("alertedCount", func ((_, a)) = a.alertedContacts.size())
        .payload("status", func ((_, a)) = sosStatusToText(a.status))
        .ownedBy("user")
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<(Principal.Principal, SafetyTimerTypes.SafetyTimer)>("timer", timerRows, "SafetyTimer", "startedAtNs")
        .sample((Principal.fromText("aaaaa-aa"), { startedAtNs = 0; durationSec = 0; status = #stopped; lastCheckInAtNs = 0 }))
        .payload("user", func ((p, _)) = p)
        .payload("startedAtNs", func ((_, t)) = t.startedAtNs)
        .payload("durationSec", func ((_, t)) = t.durationSec)
        .payload("status", func ((_, t)) = timerStatusToText(t.status))
        .payload("lastCheckInAtNs", func ((_, t)) = t.lastCheckInAtNs)
        .ownedBy("user")
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<(Principal.Principal, SafetyTimerTypes.LocationSnapshot)>("location", locationRows, "LocationSnapshot", "capturedAtNs")
        .sample((Principal.fromText("aaaaa-aa"), { latitude = 0.0; longitude = 0.0; accuracyM = null; capturedAtNs = 0 }))
        .payload("user", func ((p, _)) = p)
        .payload("latitude", func ((_, l)) = l.latitude)
        .payload("longitude", func ((_, l)) = l.longitude)
        .payload("accuracyM", func ((_, l)) = accuracyToFloat(l.accuracyM))
        .payload("capturedAtNs", func ((_, l)) = l.capturedAtNs)
        .ownedBy("user")
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<(Principal.Principal, ChatAndSafetyTypes.Chat)>("chat", chatRows, "Chat", "id")
        .sample((Principal.fromText("aaaaa-aa"), { id = 0; chatType = #direct; participant = null; createdAt = 0 }))
        .payload("user", func ((p, _)) = p)
        .payload("id", func ((_, c)) = c.id)
        .payload("chatType", func ((_, c)) = chatTypeToText(c.chatType))
        .payload("participant", func ((_, c)) = participantToText(c.participant))
        .payload("createdAt", func ((_, c)) = c.createdAt)
        .ownedBy("user")
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<(ChatAndSafetyTypes.ChatId, ChatAndSafetyTypes.ChatMessage)>("message", messageRows, "ChatMessage", "id")
        .sample((0, { id = 0; sender = Principal.fromText("aaaaa-aa"); kind = #text; text = null; imageUrl = null; location = null; timestamp = 0 }))
        .payload("chatId", func ((cid, _)) = cid)
        .payload("id", func ((_, m)) = m.id)
        .payload("sender", func ((_, m)) = m.sender)
        .payload("kind", func ((_, m)) = messageKindToText(m.kind))
        .payload("text", func ((_, m)) = optTextToText(m.text))
        .payload("imageUrl", func ((_, m)) = optTextToText(m.imageUrl))
        .payload("latitude", func ((_, m)) = locationLat(m.location))
        .payload("longitude", func ((_, m)) = locationLng(m.location))
        .payload("timestamp", func ((_, m)) = m.timestamp)
        .ownedBy("sender")
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<(Principal.Principal, CheckinTypes.CheckInEvent)>("checkInEvent", checkInEventRows, "CheckInEvent", "id")
        .sample((Principal.fromText("aaaaa-aa"), { id = 0; kind = #checkIn; location = { latitude = 0.0; longitude = 0.0; accuracyM = null; capturedAtNs = 0 }; timestamp = 0 }))
        .payload("user", func ((p, _)) = p)
        .payload("id", func ((_, e)) = e.id)
        .payload("kind", func ((_, e)) = checkInKindToText(e.kind))
        .payload("latitude", func ((_, e)) = e.location.latitude)
        .payload("longitude", func ((_, e)) = e.location.longitude)
        .payload("accuracyM", func ((_, e)) = accuracyToFloat(e.location.accuracyM))
        .payload("capturedAtNs", func ((_, e)) = e.location.capturedAtNs)
        .payload("timestamp", func ((_, e)) = e.timestamp)
        .ownedBy("user")
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<(Principal.Principal, CheckinTypes.ActiveCheckIn)>("activeCheckIn", activeCheckInRows, "ActiveCheckIn", "checkedInAtNs")
        .sample((Principal.fromText("aaaaa-aa"), { checkedInAtNs = 0; location = { latitude = 0.0; longitude = 0.0; accuracyM = null; capturedAtNs = 0 } }))
        .payload("user", func ((p, _)) = p)
        .payload("checkedInAtNs", func ((_, a)) = a.checkedInAtNs)
        .payload("latitude", func ((_, a)) = a.location.latitude)
        .payload("longitude", func ((_, a)) = a.location.longitude)
        .payload("accuracyM", func ((_, a)) = accuracyToFloat(a.location.accuracyM))
        .payload("capturedAtNs", func ((_, a)) = a.location.capturedAtNs)
        .ownedBy("user")
        .controllerOrScoped()
        .build(),
    ];
  });

  include ApiDocMixin();
};
