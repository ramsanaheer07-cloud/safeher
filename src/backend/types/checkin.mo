import Principal "mo:core/Principal";
import SafetyTimerTypes "../types/safety-timer";

module {
  /// The kind of a standalone check-in event: arriving (check-in) or departing
  /// (check-out).
  public type CheckInKind = {
    #checkIn;
    #checkOut;
  };

  /// A single check-in/check-out history event. `location` is the user's
  /// location at the time of the event and `timestamp` is when it occurred.
  public type CheckInEvent = {
    id : Nat;
    kind : CheckInKind;
    location : SafetyTimerTypes.LocationSnapshot;
    timestamp : Int;
  };

  /// The user's active check-in state. `checkedInAtNs` is when they checked in
  /// and `location` is where. Absence of an `ActiveCheckIn` for a user means
  /// they are currently checked out.
  public type ActiveCheckIn = {
    checkedInAtNs : Int;
    location : SafetyTimerTypes.LocationSnapshot;
  };
};
