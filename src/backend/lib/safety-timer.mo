import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Types "../types/safety-timer";

module {
  /// Starts a new safety timer for the caller with the given duration.
  public func startTimer(
    timers : Map.Map<Principal, Types.SafetyTimer>,
    caller : Principal,
    durationSec : Nat,
  ) : Types.SafetyTimer {
    let now = Time.now();
    let timer : Types.SafetyTimer = {
      startedAtNs = now;
      durationSec;
      status = #active;
      lastCheckInAtNs = now;
    };
    timers.add(caller, timer);
    timer;
  };

  /// Returns the caller's current safety timer, if one exists.
  public func getTimer(
    timers : Map.Map<Principal, Types.SafetyTimer>,
    caller : Principal,
  ) : ?Types.SafetyTimer {
    timers.get(caller);
  };

  /// Records a check-in with the caller's current live location.
  public func timerCheckIn(
    timers : Map.Map<Principal, Types.SafetyTimer>,
    locations : Map.Map<Principal, Types.LocationSnapshot>,
    caller : Principal,
    location : Types.LocationSnapshot,
  ) : Types.SafetyTimer {
    locations.add(caller, location);
    let timer = timers.get(caller) ?? Runtime.trap("No active safety timer to check in");
    let updated = { timer with lastCheckInAtNs = Time.now() };
    timers.add(caller, updated);
    updated;
  };

  /// Extends the caller's active timer by the given number of seconds.
  public func extendTimer(
    timers : Map.Map<Principal, Types.SafetyTimer>,
    caller : Principal,
    extraSec : Nat,
  ) : Types.SafetyTimer {
    let timer = timers.get(caller) ?? Runtime.trap("No active safety timer to extend");
    let updated = { timer with durationSec = timer.durationSec + extraSec };
    timers.add(caller, updated);
    updated;
  };

  /// Stops the caller's active timer early and returns it.
  public func stopTimer(
    timers : Map.Map<Principal, Types.SafetyTimer>,
    caller : Principal,
  ) : ?Types.SafetyTimer {
    switch (timers.get(caller)) {
      case (?timer) {
        let updated = { timer with status = #stopped };
        timers.add(caller, updated);
        ?updated;
      };
      case null { null };
    };
  };

  /// Returns the caller's most recent live location snapshot, if any.
  public func getLocation(
    locations : Map.Map<Principal, Types.LocationSnapshot>,
    caller : Principal,
  ) : ?Types.LocationSnapshot {
    locations.get(caller);
  };
};
