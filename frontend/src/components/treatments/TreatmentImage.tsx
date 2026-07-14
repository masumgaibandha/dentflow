"use client";

import { useState } from "react";

// imageUrl is arbitrary admin-entered text - never validated as a real,
// reachable image at write time - so it can be empty, malformed, or simply
// dead by the time a visitor loads this card. This is the one place that
// falls back to a local, always-available illustration instead.
export const TREATMENT_IMAGE_FALLBACK_SRC = "/services/dental-service-fallback.svg";

export function TreatmentImage({
  src,
  alt,
  className,
}: {
  src: string | undefined;
  alt: string;
  className?: string;
}) {
  const [hasErrored, setHasErrored] = useState(false);

  const resolvedSrc = !hasErrored && src?.trim() ? src : TREATMENT_IMAGE_FALLBACK_SRC;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- imageUrl is an arbitrary admin-supplied URL, not a known host we can allowlist in next.config for next/image
    <img
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => {
        // Only ever flips false -> true once. If the resolved src is
        // already the fallback (e.g. the fallback asset itself somehow
        // failed to load), this still only sets the same value, which
        // React no-ops on - no repeated onError -> setState -> reload loop.
        if (!hasErrored) {
          setHasErrored(true);
        }
      }}
    />
  );
}
