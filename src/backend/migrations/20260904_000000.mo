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

  type Contact = {
    id : Nat;
    name : Text;
    phone : Text;
    relationship : Relationship;
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

  type OldActor = {};

  type NewActor = {
    accessControlState : AccessControlState;
    contacts : Map.Map<Principal, List.List<Contact>>;
    sosAlerts : Map.Map<Principal, List.List<SosAlert>>;
    state : { var nextContactId : Nat; var nextSosAlertId : Nat };
    timers : Map.Map<Principal, SafetyTimer>;
    locations : Map.Map<Principal, LocationSnapshot>;
  };

  public func migration(_old : OldActor) : NewActor {
    {
      accessControlState = {
        var adminAssigned = false;
        userRoles = Map.empty();
      };
      contacts = Map.empty();
      sosAlerts = Map.empty();
      state = {
        var nextContactId = 0;
        var nextSosAlertId = 0;
      };
      timers = Map.empty();
      locations = Map.empty();
    };
  };
};
