import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/safety-timer";
import SafetyTimerLib "../lib/safety-timer";

mixin (
  timers : Map.Map<Principal, Types.SafetyTimer>,
  locations : Map.Map<Principal, Types.LocationSnapshot>,
) {
  /// Starts a new safety timer for the caller with the given duration.
  public shared ({ caller }) func startTimer(durationSec : Nat) : async Types.SafetyTimer {
    SafetyTimerLib.startTimer(timers, caller, durationSec);
  };

  /// Returns the caller's current safety timer, if one exists.
  public query ({ caller }) func getTimer() : async ?Types.SafetyTimer {
    SafetyTimerLib.getTimer(timers, caller);
  };

  /// Records a check-in with the caller's current live location.
  public shared ({ caller }) func timerCheckIn(location : Types.LocationSnapshot) : async Types.SafetyTimer {
    SafetyTimerLib.timerCheckIn(timers, locations, caller, location);
  };

  /// Extends the caller's active timer by the given number of seconds.
  public shared ({ caller }) func extendTimer(extraSec : Nat) : async Types.SafetyTimer {
    SafetyTimerLib.extendTimer(timers, caller, extraSec);
  };

  /// Stops the caller's active timer early and returns it.
  public shared ({ caller }) func stopTimer() : async ?Types.SafetyTimer {
    SafetyTimerLib.stopTimer(timers, caller);
  };

  /// Returns the caller's most recent live location snapshot, if any.
  public query ({ caller }) func getLocation() : async ?Types.LocationSnapshot {
    SafetyTimerLib.getLocation(locations, caller);
  };
};
