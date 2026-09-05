import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Debug "mo:core/Debug";
import Types "../types/checkin";
import SafetyTimerTypes "../types/safety-timer";
import TrustedTypes "../types/trusted-contacts";
import CheckinLib "../lib/checkin";

mixin (
  activeCheckIns : Map.Map<Principal.Principal, Types.ActiveCheckIn>,
  checkInHistory : Map.Map<Principal.Principal, List.List<Types.CheckInEvent>>,
  checkInState : { var nextCheckInEventId : Nat },
  contacts : Map.Map<Principal.Principal, List.List<TrustedTypes.Contact>>,
  requireSignedIn : (Principal.Principal) -> (),
) {
  /// Records a standalone check-in for the caller at the given location.
  public shared ({ caller }) func checkIn(location : SafetyTimerTypes.LocationSnapshot) : async Types.ActiveCheckIn {
    requireSignedIn(caller);
    CheckinLib.checkIn(activeCheckIns, checkInHistory, checkInState, caller, location);
  };

  /// Records a standalone check-out for the caller at the given location.
  public shared ({ caller }) func checkOut(location : SafetyTimerTypes.LocationSnapshot) : async ?Types.CheckInEvent {
    requireSignedIn(caller);
    CheckinLib.checkOut(activeCheckIns, checkInHistory, checkInState, caller, location);
  };

  /// Returns the caller's active check-in state, or `null` if checked out.
  public shared query ({ caller }) func getCheckInState() : async ?Types.ActiveCheckIn {
    requireSignedIn(caller);
    CheckinLib.getCheckInState(activeCheckIns, caller);
  };

  /// Returns the caller's own check-in/check-out history.
  public shared query ({ caller }) func listCheckInHistory() : async [Types.CheckInEvent] {
    requireSignedIn(caller);
    CheckinLib.listCheckInHistory(checkInHistory, caller);
  };

  /// Returns another user's check-in/check-out history. Only a trusted contact
  /// of `user` may view it.
  public shared query ({ caller }) func getCheckInHistoryFor(user : Principal.Principal) : async [Types.CheckInEvent] {
    requireSignedIn(caller);
    CheckinLib.getCheckInHistoryFor(checkInHistory, contacts, caller, user);
  };
};
