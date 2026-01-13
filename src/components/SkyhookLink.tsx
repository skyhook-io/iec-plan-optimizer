'use client';

import { trackSkyhookClick } from '@/lib/analytics';

export function SkyhookLink() {
  return (
    <div className="mt-8 pt-6 border-t border-border/50" dir="ltr">
      <p className="text-xs text-muted-foreground/70 mb-3">Powered by</p>
      <a
        href="https://skyhook.io"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block group"
        onClick={trackSkyhookClick}
      >
        <img
          src="/images/skyhook-logo.svg"
          alt="Skyhook"
          className="h-6 opacity-70 group-hover:opacity-100 group-hover:scale-105 group-hover:-translate-y-0.5 transition-all duration-200"
        />
      </a>
      <p className="mt-2 text-xs text-muted-foreground/70">
        Ship like a team twice your size
      </p>
    </div>
  );
}
