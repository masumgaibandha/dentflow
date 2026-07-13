import { z } from "zod";

// .strict() rejects the request outright (400) if it contains any other key -
// in particular clinicId/patientId/dentistId/treatmentId, which must never be
// accepted from the client for this endpoint. sortBy is intentionally not a
// parameter at all: it's fixed to startTime (see portal.service.ts).
export const portalAppointmentsQuerySchema = z
  .object({
    when: z.enum(["upcoming", "past"]).default("upcoming"),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  })
  .strict();

export type PortalAppointmentsQuery = z.infer<typeof portalAppointmentsQuerySchema>;
