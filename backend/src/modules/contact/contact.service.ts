import { ContactMessage } from "../../models/ContactMessage";
import type { CreateContactMessageInput } from "./contact.validation";

// Write-only by design in this milestone: there is no read/list endpoint, so
// no admin UI or API can enumerate submissions yet - storing is the entire
// scope (no email sending, no notification, see the milestone's explicit
// out-of-scope list).
export async function createContactMessage(input: CreateContactMessageInput) {
  const message = await ContactMessage.create(input);
  return { id: message._id.toString(), createdAt: message.createdAt };
}
