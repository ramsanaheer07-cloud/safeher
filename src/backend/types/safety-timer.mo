module {
  /// Status of a user's safety timer.
  public type TimerStatus = {
    #active;
    #stopped;
  };

  /// A per-user safety timer. `startedAtNs` and `durationSec` let the frontend
  /// compute remaining time and active status. `lastCheckInAtNs` is updated on
  /// each check-in.
  public type SafetyTimer = {
    startedAtNs : Int;
    durationSec : Nat;
    status : TimerStatus;
    lastCheckInAtNs : Int;
  };

  /// A live location snapshot shared while the timer is active.
  public type LocationSnapshot = {
    latitude : Float;
    longitude : Float;
    accuracyM : ?Float;
    capturedAtNs : Int;
  };

  /// A check-in event recorded against an active timer.
  public type CheckIn = {
    atNs : Int;
    location : LocationSnapshot;
  };
};
