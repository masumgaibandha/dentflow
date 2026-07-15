import { z } from "zod";

// Mirrors frontend/src/validators/auth.ts's passwordSchema - the two apps
// ship separately, so this is intentionally duplicated rather than shared,
// same as the isValidImageRef() pattern in the treatments module. This is
// the actual security boundary: the frontend checklist is a convenience,
// never trusted on its own.
//
// No .trim() - stripping whitespace here would silently change the password
// being hashed. Leading/trailing spaces are rejected instead of stripped.
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password must be at most 64 characters")
  .refine((value) => value === value.trim(), "Password must not start or end with a space")
  .refine((value) => /[A-Z]/.test(value), "Password must contain at least one uppercase letter")
  .refine((value) => /[a-z]/.test(value), "Password must contain at least one lowercase letter")
  .refine((value) => /[0-9]/.test(value), "Password must contain at least one number")
  .refine((value) => /[^A-Za-z0-9]/.test(value), "Password must contain at least one special character");

export const registerSchema = z.object({
  clinicName: z.string().trim().min(2, "Clinic name is required"),
  adminName: z.string().trim().min(2, "Your name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
