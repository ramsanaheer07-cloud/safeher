import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/trusted-contacts";

module {
  public func listContacts(
    contacts : Map.Map<Principal.Principal, List.List<Types.Contact>>,
    caller : Principal.Principal,
  ) : [Types.Contact] {
    switch (contacts.get(caller)) {
      case (?list) list.toArray();
      case null [];
    };
  };

  public func addContact(
    contacts : Map.Map<Principal.Principal, List.List<Types.Contact>>,
    state : { var nextContactId : Types.ContactId },
    caller : Principal.Principal,
    name : Text,
    phone : Text,
    relationship : Types.Relationship,
    principal : ?Principal.Principal,
  ) : Types.Contact {
    let contact : Types.Contact = {
      id = state.nextContactId;
      name;
      phone;
      relationship;
      principal;
    };
    state.nextContactId += 1;
    switch (contacts.get(caller)) {
      case (?list) { list.add(contact) };
      case null {
        let list = List.empty<Types.Contact>();
        list.add(contact);
        contacts.add(caller, list);
      };
    };
    contact;
  };

  public func updateContact(
    contacts : Map.Map<Principal.Principal, List.List<Types.Contact>>,
    caller : Principal.Principal,
    id : Types.ContactId,
    name : Text,
    phone : Text,
    relationship : Types.Relationship,
    principal : ?Principal.Principal,
  ) : ?Types.Contact {
    switch (contacts.get(caller)) {
      case null null;
      case (?list) {
        var updated : ?Types.Contact = null;
        let snapshot = list.toArray();
        list.clear();
        for (contact in snapshot.values()) {
          if (contact.id == id) {
            let newContact : Types.Contact = { id; name; phone; relationship; principal };
            updated := ?newContact;
            list.add(newContact);
          } else {
            list.add(contact);
          };
        };
        updated;
      };
    };
  };

  public func removeContact(
    contacts : Map.Map<Principal.Principal, List.List<Types.Contact>>,
    caller : Principal.Principal,
    id : Types.ContactId,
  ) : Bool {
    switch (contacts.get(caller)) {
      case null false;
      case (?list) {
        var removed = false;
        let snapshot = list.toArray();
        list.clear();
        for (contact in snapshot.values()) {
          if (contact.id == id) {
            removed := true;
          } else {
            list.add(contact);
          };
        };
        removed;
      };
    };
  };

  public func triggerSos(
    sosAlerts : Map.Map<Principal.Principal, List.List<Types.SosAlert>>,
    contacts : Map.Map<Principal.Principal, List.List<Types.Contact>>,
    state : { var nextSosAlertId : Types.SosAlertId },
    caller : Principal.Principal,
    location : Types.Location,
  ) : Types.SosAlert {
    let alertedContacts = switch (contacts.get(caller)) {
      case (?list) list.toArray().map(func c = c.id);
      case null [];
    };
    let alert : Types.SosAlert = {
      id = state.nextSosAlertId;
      timestamp = Time.now();
      location;
      alertedContacts;
      status = #alerted;
    };
    state.nextSosAlertId += 1;
    switch (sosAlerts.get(caller)) {
      case (?list) { list.add(alert) };
      case null {
        let list = List.empty<Types.SosAlert>();
        list.add(alert);
        sosAlerts.add(caller, list);
      };
    };
    alert;
  };

  public func listSosAlerts(
    sosAlerts : Map.Map<Principal.Principal, List.List<Types.SosAlert>>,
    caller : Principal.Principal,
  ) : [Types.SosAlert] {
    switch (sosAlerts.get(caller)) {
      case (?list) list.toArray();
      case null [];
    };
  };

  public func getSosAlert(
    sosAlerts : Map.Map<Principal.Principal, List.List<Types.SosAlert>>,
    caller : Principal.Principal,
    id : Types.SosAlertId,
  ) : ?Types.SosAlert {
    switch (sosAlerts.get(caller)) {
      case null null;
      case (?list) list.find(func a = a.id == id);
    };
  };
};
