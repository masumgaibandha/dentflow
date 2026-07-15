import { z } from "zod";

const UPPERCASE_RE = /[A-Z]/;
const LOWERCASE_RE = /[a-z]/;
const NUMBER_RE = /[0-9]/;
const SPECIAL_CHAR_RE = /[^A-Za-z0-9]/;

// Single source of truth for the character-class rules - reused by both the
// Zod schema below (authoritative validation) and the live checklist UI on
// the register page (visual feedback only), so the two can never disagree.
export const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { id: "uppercase", label: "One uppercase letter", test: (value: string) => UPPERCASE_RE.test(value) },
  { id: "lowercase", label: "One lowercase letter", test: (value: string) => LOWERCASE_RE.test(value) },
  { id: "number", label: "One number", test: (value: string) => NUMBER_RE.test(value) },
  { id: "special", label: "One special character", test: (value: string) => SPECIAL_CHAR_RE.test(value) },
] as const;

// Deliberately no .trim() - unlike name/email fields, silently stripping
// whitespace from a password would change the value the user actually typed
// (and will later type again to log in). Leading/trailing spaces are
// rejected instead of stripped.
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password must be at most 64 characters")
  .refine((value) => value === value.trim(), "Password must not start or end with a space")
  .refine((value) => UPPERCASE_RE.test(value), "Add an uppercase letter")
  .refine((value) => LOWERCASE_RE.test(value), "Add a lowercase letter")
  .refine((value) => NUMBER_RE.test(value), "Add a number")
  .refine((value) => SPECIAL_CHAR_RE.test(value), "Add a special character");

export const registerFormSchema = z
  .object({
    clinicName: z.string().trim().min(2, "Clinic name is required"),
    adminName: z.string().trim().min(2, "Your name is required"),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const loginFormSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
