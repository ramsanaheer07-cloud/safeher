import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  type UserRole = {
    #admin;
    #user;
    #guest;
  };

  type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  type Relationship = {
    #family;
    #friend;
    #colleague;
    #other;
  };

  type OldContact = {
    id : Nat;
    name : Text;
    phone : Text;
    relationship : Relationship;
  };

  type NewContact = {
    id : Nat;
    name : Text;
    phone : Text;
    relationship : Relationship;
    principal : ?Principal;
  };

  type Location = {
    latitude : Float;
    longitude : Float;
  };

  type SosAlertStatus = {
    #alerted;
  };

  type SosAlert = {
    id : Nat;
    timestamp : Int;
    location : Location;
    alertedContacts : [Nat];
    status : SosAlertStatus;
  };

  type TimerStatus = {
    #active;
    #stopped;
  };

  type SafetyTimer = {
    startedAtNs : Int;
    durationSec : Nat;
    status : TimerStatus;
    lastCheckInAtNs : Int;
  };

  type LocationSnapshot = {
    latitude : Float;
    longitude : Float;
    accuracyM : ?Float;
    capturedAtNs : Int;
  };

  type ChatId = Nat;
  type MessageId = Nat;

  type ChatType = {
    #direct;
    #support;
    #community;
  };

  type MessageKind = {
    #text;
    #image;
    #location;
  };

  type ChatMessage = {
    id : MessageId;
    sender : Principal;
    kind : MessageKind;
    text : ?Text;
    imageUrl : ?Text;
    location : ?Location;
    timestamp : Int;
  };

  type Chat = {
    id : ChatId;
    chatType : ChatType;
    participant : ?Principal;
    createdAt : Int;
  };

  type FakeCall = {
    active : Bool;
    startedAt : Int;
  };

  type CheckInReminder = {
    enabled : Bool;
    intervalSec : Nat;
    lastSentAt : Int;
  };

  type OldActor = {
    accessControlState : AccessControlState;
    contacts : Map.Map<Principal, List.List<OldContact>>;
    sosAlerts : Map.Map<Principal, List.List<SosAlert>>;
    state : { var nextContactId : Nat; var nextSosAlertId : Nat };
    timers : Map.Map<Principal, SafetyTimer>;
    locations : Map.Map<Principal, LocationSnapshot>;
  };

  type NewActor = {
    accessControlState : AccessControlState;
    contacts : Map.Map<Principal, List.List<NewContact>>;
    sosAlerts : Map.Map<Principal, List.List<SosAlert>>;
    state : { var nextContactId : Nat; var nextSosAlertId : Nat };
    timers : Map.Map<Principal, SafetyTimer>;
    locations : Map.Map<Principal, LocationSnapshot>;
    chats : Map.Map<Principal, List.List<Chat>>;
    messages : Map.Map<ChatId, List.List<ChatMessage>>;
    chatState : { var nextChatId : Nat; var nextMessageId : Nat };
    fakeCall : Map.Map<Principal, FakeCall>;
    discreetMode : Map.Map<Principal, Bool>;
    checkInReminders : Map.Map<Principal, CheckInReminder>;
  };

  public func migration(old : OldActor) : NewActor {
    let newContacts = Map.empty<Principal, List.List<NewContact>>();
    for ((p, list) in old.contacts.entries()) {
      let newList = List.empty<NewContact>();
      for (c in list.toArray().values()) {
        newList.add({
          id = c.id;
          name = c.name;
          phone = c.phone;
          relationship = c.relationship;
          principal = null;
        });
      };
      newContacts.add(p, newList);
    };
    {
      accessControlState = old.accessControlState;
      contacts = newContacts;
      sosAlerts = old.sosAlerts;
      state = old.state;
      timers = old.timers;
      locations = old.locations;
      chats = Map.empty();
      messages = Map.empty();
      chatState = {
        var nextChatId = 0;
        var nextMessageId = 0;
      };
      fakeCall = Map.empty();
      discreetMode = Map.empty();
      checkInReminders = Map.empty();
    };
  };
};
