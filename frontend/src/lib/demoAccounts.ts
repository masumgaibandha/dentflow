// Single source of truth for the assignment's demo login credentials -
// seeded by `npm run seed:demo` (backend/src/scripts/seedDemo.ts). These are
// normal accounts authenticated through the standard login endpoint, not a
// special auth path - this file only avoids repeating the same three email/
// password pairs in multiple components.
export interface DemoAccount {
  role: "admin" | "staff" | "patient";
  label: string;
  email: string;
  password: string;
  description: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "admin",
    label: "Demo Admin",
    email: "admin@dentflow.demo",
    password: "DemoAdmin123!",
    description: "Full clinic administration - staff, billing, and settings.",
  },
  {
    role: "staff",
    label: "Demo Staff",
    email: "staff@dentflow.demo",
    password: "DemoStaff123!",
    description: "Day-to-day patient care - appointments and records.",
  },
  {
    role: "patient",
    label: "Demo Patient",
    email: "patient@dentflow.demo",
    password: "DemoPatient123!",
    description: "A patient's own portal - appointments, invoices, records.",
  },
];
