import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/trusted-contacts";
import TrustedContactsLib "../lib/trusted-contacts";

mixin (
  contacts : Map.Map<Principal.Principal, List.List<Types.Contact>>,
  sosAlerts : Map.Map<Principal.Principal, List.List<Types.SosAlert>>,
  state : { var nextContactId : Types.ContactId; var nextSosAlertId : Types.SosAlertId },
  accessControlState : AccessControl.AccessControlState,
  requireSignedIn : (Principal.Principal) -> (),
) {
  public shared query ({ caller }) func listContacts() : async [Types.Contact] {
    requireSignedIn(caller);
    TrustedContactsLib.listContacts(contacts, caller);
  };

  public shared ({ caller }) func addContact(name : Text, phone : Text, relationship : Types.Relationship, principal : ?Principal.Principal) : async Types.Contact {
    requireSignedIn(caller);
    TrustedContactsLib.addContact(contacts, state, caller, name, phone, relationship, principal);
  };

  public shared ({ caller }) func updateContact(id : Types.ContactId, name : Text, phone : Text, relationship : Types.Relationship, principal : ?Principal.Principal) : async ?Types.Contact {
    requireSignedIn(caller);
    TrustedContactsLib.updateContact(contacts, caller, id, name, phone, relationship, principal);
  };

  public shared ({ caller }) func removeContact(id : Types.ContactId) : async Bool {
    requireSignedIn(caller);
    TrustedContactsLib.removeContact(contacts, caller, id);
  };

  public shared ({ caller }) func triggerSos(location : Types.Location) : async Types.SosAlert {
    requireSignedIn(caller);
    TrustedContactsLib.triggerSos(sosAlerts, contacts, state, caller, location);
  };

  public shared query ({ caller }) func listSosAlerts() : async [Types.SosAlert] {
    requireSignedIn(caller);
    TrustedContactsLib.listSosAlerts(sosAlerts, caller);
  };

  public shared query ({ caller }) func getSosAlert(id : Types.SosAlertId) : async ?Types.SosAlert {
    requireSignedIn(caller);
    TrustedContactsLib.getSosAlert(sosAlerts, caller, id);
  };
};
