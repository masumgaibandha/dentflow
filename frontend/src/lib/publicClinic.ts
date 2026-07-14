// Single source of truth for "which clinic does the public site show by
// default" - every public page resolves through this instead of duplicating
// the fallback chain (or the demo slug string) in each component.
//
// Resolution order:
//   1. an explicit ?clinic=slug query parameter (always wins - a visitor
//      linking to a specific clinic must see that clinic, never a fallback)
//   2. the authenticated user's own clinic, where the calling page has one
//   3. NEXT_PUBLIC_DEFAULT_CLINIC_SLUG (deployment-level override)
//   4. this assignment build's demo clinic, so the public pages are never a
//      dead end even with no environment configuration at all
//
// This never removes clinic scoping from an API request - it only decides
// which clinic slug gets sent. Every treatment query is still filtered by
// that slug/clinicId server-side (see treatment.service.ts).
export const ASSIGNMENT_DEMO_CLINIC_SLUG = "dentflow-demo";

export function resolveClinicSlug(params: {
  queryClinic?: string | null;
  userClinicSlug?: string;
}): string {
  const trimmedQuery = params.queryClinic?.trim();
  if (trimmedQuery) {
    return trimmedQuery;
  }

  if (params.userClinicSlug) {
    return params.userClinicSlug;
  }

  const envSlug = process.env.NEXT_PUBLIC_DEFAULT_CLINIC_SLUG?.trim();
  if (envSlug) {
    return envSlug;
  }

  return ASSIGNMENT_DEMO_CLINIC_SLUG;
}
