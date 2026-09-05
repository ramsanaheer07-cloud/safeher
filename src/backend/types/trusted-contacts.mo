import Principal "mo:core/Principal";

module {
  public type ContactId = Nat;
  public type SosAlertId = Nat;

  public type Relationship = {
    #family;
    #friend;
    #colleague;
    #other;
  };

  public type Contact = {
    id : ContactId;
    name : Text;
    phone : Text;
    relationship : Relationship;
    principal : ?Principal.Principal;
  };

  public type Location = {
    latitude : Float;
    longitude : Float;
  };

  public type SosAlertStatus = {
    #alerted;
  };

  public type SosAlert = {
    id : SosAlertId;
    timestamp : Int;
    location : Location;
    alertedContacts : [ContactId];
    status : SosAlertStatus;
  };
};
