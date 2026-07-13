import type { UserRole } from "../models/User";

// Populated by requireAuth from the live User record, not decoded directly
// from the JWT - patientId in particular is never trusted from the token
// itself (see requireAuth.ts), only ever loaded fresh from the database.
export interface AuthenticatedUser {
  userId: string;
  clinicId: string;
  role: UserRole;
  patientId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
