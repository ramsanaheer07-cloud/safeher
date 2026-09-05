import { type Contact, Relationship } from "@/backend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type ContactInput,
  useAddContact,
  useContacts,
  useRemoveContact,
  useUpdateContact,
} from "@/hooks/use-contacts";
import { Pencil, Phone, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const relationshipLabels: Record<Relationship, string> = {
  family: "Family",
  friend: "Friend",
  colleague: "Colleague",
  other: "Other",
};

const relationshipOptions = Object.keys(relationshipLabels) as Relationship[];

interface ContactFormState {
  name: string;
  phone: string;
  relationship: Relationship;
}

const emptyForm: ContactFormState = {
  name: "",
  phone: "",
  relationship: Relationship.friend,
};

function toFormState(contact: Contact): ContactFormState {
  return {
    name: contact.name,
    phone: contact.phone,
    relationship: contact.relationship,
  };
}

/**
 * Trusted Contacts. Backend-backed CRUD: signed-in users add, edit, and remove
 * the people who get their alert in an emergency. Contacts are stored per-user
 * in the backend and only visible to that user.
 */
export function ContactsPage() {
  const { data: contacts, isLoading, isError, refetch } = useContacts();
  const addContact = useAddContact();
  const updateContact = useUpdateContact();
  const removeContact = useRemoveContact();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState<ContactFormState>(emptyForm);
  const [removing, setRemoving] = useState<Contact | null>(null);

  // Reset the form whenever the dialog opens for a fresh add or a specific edit.
  useEffect(() => {
    if (formOpen) {
      setForm(editing ? toFormState(editing) : emptyForm);
    }
  }, [formOpen, editing]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (contact: Contact) => {
    setEditing(contact);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const canSubmit = form.name.trim().length > 0 && form.phone.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const input: ContactInput = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      relationship: form.relationship,
    };
    if (editing) {
      updateContact.mutate(
        { id: editing.id, input },
        {
          onSuccess: () => {
            toast.success("Contact updated");
            closeForm();
          },
          onError: () => toast.error("Could not update contact"),
        },
      );
    } else {
      addContact.mutate(input, {
        onSuccess: () => {
          toast.success("Contact added");
          closeForm();
        },
        onError: () => toast.error("Could not add contact"),
      });
    }
  };

  const handleRemove = () => {
    if (!removing) return;
    removeContact.mutate(removing.id, {
      onSuccess: () => {
        toast.success("Contact removed");
        setRemoving(null);
      },
      onError: () => toast.error("Could not remove contact"),
    });
  };

  const isSaving = addContact.isPending || updateContact.isPending;

  return (
    <div className="space-y-6" data-ocid="contacts_page">
      <section className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Trusted Contacts
        </h1>
        <p className="mt-1 text-muted-foreground">
          The people who get your alert in an emergency.
        </p>
      </section>

      {isLoading ? (
        <ContactsSkeleton />
      ) : isError ? (
        <ContactsError onRetry={() => void refetch()} />
      ) : contacts && contacts.length > 0 ? (
        <ContactsList
          contacts={contacts}
          onEdit={openEdit}
          onRemove={setRemoving}
        />
      ) : (
        <ContactsEmpty onAdd={openAdd} />
      )}

      <Button
        type="button"
        data-ocid="contacts_add_button"
        onClick={openAdd}
        className="w-full"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add a contact
      </Button>

      <ContactFormDialog
        open={formOpen}
        editing={editing}
        form={form}
        isSaving={isSaving}
        canSubmit={canSubmit}
        onChange={setForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={removing !== null}
        onOpenChange={(open) => {
          if (!open) setRemoving(null);
        }}
      >
        <AlertDialogContent data-ocid="contacts_delete_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove contact?</AlertDialogTitle>
            <AlertDialogDescription>
              {removing
                ? `${removing.name} will no longer be alerted in an emergency. You can add them again anytime.`
                : "This contact will no longer be alerted in an emergency."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="contacts_delete_cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="contacts_delete_confirm_button"
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ContactsList({
  contacts,
  onEdit,
  onRemove,
}: {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onRemove: (contact: Contact) => void;
}) {
  return (
    <ul className="space-y-3" data-ocid="contacts_list">
      {contacts.map((contact, index) => (
        <li
          key={contact.id.toString()}
          data-ocid={`contacts_item.${index + 1}`}
          className="animate-fade-up flex items-center gap-4 rounded-2xl bg-card p-4 shadow-subtle"
          style={{ animationDelay: `${0.05 * (index + 1)}s` }}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Users className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display font-bold text-foreground">
              {contact.name}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {contact.phone}
            </p>
            <span className="mt-1.5 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {relationshipLabels[contact.relationship]}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-ocid={`contacts_edit_button.${index + 1}`}
              aria-label={`Edit ${contact.name}`}
              onClick={() => onEdit(contact)}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-ocid={`contacts_delete_button.${index + 1}`}
              aria-label={`Remove ${contact.name}`}
              className="text-destructive hover:text-destructive"
              onClick={() => onRemove(contact)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ContactsEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <section
      data-ocid="contacts_empty_state"
      className="animate-fade-up flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-subtle"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Users className="h-8 w-8" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-display text-lg font-bold text-foreground">
        No contacts yet
      </h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Add the people you trust most so they can be alerted with your live
        location in an emergency.
      </p>
      <Button
        type="button"
        data-ocid="contacts_empty_add_button"
        onClick={onAdd}
        className="mt-6 w-full"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add a contact
      </Button>
    </section>
  );
}

function ContactsError({ onRetry }: { onRetry: () => void }) {
  return (
    <section
      data-ocid="contacts_error_state"
      className="animate-fade-up flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-subtle"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <Users className="h-8 w-8" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-display text-lg font-bold text-foreground">
        Couldn&apos;t load contacts
      </h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Something went wrong while fetching your trusted contacts. Please try
        again.
      </p>
      <Button
        type="button"
        variant="outline"
        data-ocid="contacts_retry_button"
        onClick={onRetry}
        className="mt-6 w-full"
      >
        Try again
      </Button>
    </section>
  );
}

function ContactsSkeleton() {
  return (
    <div className="space-y-3" data-ocid="contacts_loading_state">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-subtle"
        >
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ContactFormDialog({
  open,
  editing,
  form,
  isSaving,
  canSubmit,
  onChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  editing: Contact | null;
  form: ContactFormState;
  isSaving: boolean;
  canSubmit: boolean;
  onChange: (form: ContactFormState) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-ocid="contacts_form_dialog">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit contact" : "Add a contact"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the details for this trusted contact."
              : "Add someone you trust so they can be alerted in an emergency."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-name">Name</Label>
            <Input
              id="contact-name"
              data-ocid="contacts_name_input"
              placeholder="e.g. Maya"
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-phone">Phone</Label>
            <Input
              id="contact-phone"
              data-ocid="contacts_phone_input"
              type="tel"
              inputMode="tel"
              placeholder="e.g. +1 555 123 4567"
              value={form.phone}
              onChange={(e) => onChange({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-relationship">Relationship</Label>
            <Select
              value={form.relationship}
              onValueChange={(value) =>
                onChange({ ...form, relationship: value as Relationship })
              }
            >
              <SelectTrigger
                id="contact-relationship"
                data-ocid="contacts_relationship_select"
                className="w-full"
              >
                <SelectValue placeholder="Select a relationship" />
              </SelectTrigger>
              <SelectContent>
                {relationshipOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {relationshipLabels[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            data-ocid="contacts_form_cancel_button"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-ocid="contacts_form_submit_button"
            disabled={!canSubmit || isSaving}
            onClick={onSubmit}
          >
            {isSaving ? "Saving…" : editing ? "Save changes" : "Add contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
