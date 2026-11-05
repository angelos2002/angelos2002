import { Icon } from "./Icon";

export function Stars({ value, className = "h-4 w-4", label }: { value: number; className?: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={label ?? `${value}/5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="relative inline-block">
            <Icon name="star" className={`${className} text-white/15`} fill="currentColor" stroke="none" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Icon name="star" className={`${className} text-ember drop-shadow-[0_0_6px_rgba(255,181,71,0.6)]`} fill="currentColor" stroke="none" />
            </span>
          </span>
        );
      })}
    </span>
  );
}
