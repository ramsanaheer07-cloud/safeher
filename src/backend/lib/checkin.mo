import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Types "../types/checkin";
import SafetyTimerTypes "../types/safety-timer";
import TrustedTypes "../types/trusted-contacts";

module {
  /// Records a standalone check-in for the caller at the given location and
  /// returns the new active check-in state.
  public func checkIn(
    activeCheckIns : Map.Map<Principal.Principal, Types.ActiveCheckIn>,
    checkInHistory : Map.Map<Principal.Principal, List.List<Types.CheckInEvent>>,
    state : { var nextCheckInEventId : Nat },
    caller : Principal.Principal,
    location : SafetyTimerTypes.LocationSnapshot,
  ) : Types.ActiveCheckIn {
    let now = Time.now();
    let active : Types.ActiveCheckIn = {
      checkedInAtNs = now;
      location;
    };
    activeCheckIns.add(caller, active);
    let event : Types.CheckInEvent = {
      id = state.nextCheckInEventId;
      kind = #checkIn;
      location;
      timestamp = now;
    };
    state.nextCheckInEventId += 1;
    switch (checkInHistory.get(caller)) {
      case (?list) { list.add(event) };
      case null {
        let list = List.empty<Types.CheckInEvent>();
        list.add(event);
        checkInHistory.add(caller, list);
      };
    };
    active;
  };

  /// Records a standalone check-out for the caller at the given location,
  /// clearing the active check-in state and returning the recorded event.
  /// Returns `null` if the caller is not currently checked in.
  public func checkOut(
    activeCheckIns : Map.Map<Principal.Principal, Types.ActiveCheckIn>,
    checkInHistory : Map.Map<Principal.Principal, List.List<Types.CheckInEvent>>,
    state : { var nextCheckInEventId : Nat },
    caller : Principal.Principal,
    location : SafetyTimerTypes.LocationSnapshot,
  ) : ?Types.CheckInEvent {
    switch (activeCheckIns.get(caller)) {
      case null null;
      case (?_) {
        activeCheckIns.remove(caller);
        let now = Time.now();
        let event : Types.CheckInEvent = {
          id = state.nextCheckInEventId;
          kind = #checkOut;
          location;
          timestamp = now;
        };
        state.nextCheckInEventId += 1;
        switch (checkInHistory.get(caller)) {
          case (?list) { list.add(event) };
          case null {
            let list = List.empty<Types.CheckInEvent>();
            list.add(event);
            checkInHistory.add(caller, list);
          };
        };
        ?event;
      };
    };
  };

  /// Returns the caller's active check-in state, or `null` if checked out.
  public func getCheckInState(
    activeCheckIns : Map.Map<Principal.Principal, Types.ActiveCheckIn>,
    caller : Principal.Principal,
  ) : ?Types.ActiveCheckIn {
    activeCheckIns.get(caller);
  };

  /// Returns the caller's own check-in/check-out history.
  public func listCheckInHistory(
    checkInHistory : Map.Map<Principal.Principal, List.List<Types.CheckInEvent>>,
    caller : Principal.Principal,
  ) : [Types.CheckInEvent] {
    switch (checkInHistory.get(caller)) {
      case (?list) list.toArray();
      case null [];
    };
  };

  /// Returns another user's check-in/check-out history. Traps unless the caller
  /// is a trusted contact of `user` (authorized via the trusted-contacts
  /// relationship).
  public func getCheckInHistoryFor(
    checkInHistory : Map.Map<Principal.Principal, List.List<Types.CheckInEvent>>,
    contacts : Map.Map<Principal.Principal, List.List<TrustedTypes.Contact>>,
    caller : Principal.Principal,
    user : Principal.Principal,
  ) : [Types.CheckInEvent] {
    let isTrustedContact = switch (contacts.get(user)) {
      case null false;
      case (?list) {
        list.toArray().any(func c = c.principal == ?caller);
      };
    };
    if (not isTrustedContact) {
      Runtime.trap("Unauthorized: You are not a trusted contact of this user");
    };
    switch (checkInHistory.get(user)) {
      case (?list) list.toArray();
      case null [];
    };
  };
};
