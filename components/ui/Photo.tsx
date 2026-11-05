"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Image with a warm gradient fallback. All photography on the site is
 * placeholder — swap the URLs in data/*.json or the components.
 */
export function Photo({
  src,
  alt,
  className = "",
  sizes = "100vw",
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-ink-600 via-ink-700 to-flame-700/40 ${className}`}>
      {!failed && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <div className="absolute inset-0 grid place-items-center text-flame/60">
          <svg viewBox="0 0 64 64" className="h-1/3 w-1/3 max-h-20 max-w-20" fill="currentColor" aria-hidden>
            <path d="M8 28c0-11 11-18 24-18s24 7 24 18z" />
            <rect x="6" y="32" width="52" height="7" rx="3.5" />
            <path d="M8 43h48v3a8 8 0 0 1-8 8H16a8 8 0 0 1-8-8z" />
          </svg>
        </div>
      )}
    </div>
  );
}
