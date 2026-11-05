export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-flame text-ink shadow-glow">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <path d="M12 2.5c1.1 3.8 5.5 6 5.5 11a5.5 5.5 0 0 1-11 0c0-2.2 1.1-3.9 2.2-5 0 1.7.9 2.8 2.2 3.3 0-3.3 0-6 1.1-9.3z" />
        </svg>
      </span>
      <span className="font-display text-xl font-extrabold uppercase leading-none tracking-tight">
        Street Food <span className="text-flame">Rey</span>
      </span>
    </span>
  );
}
