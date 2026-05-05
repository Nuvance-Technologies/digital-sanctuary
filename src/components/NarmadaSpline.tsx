export function NarmadaSpline({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 1600"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute left-1/2 top-0 -z-10 h-full -translate-x-1/2 ${className}`}
    >
      <defs>
        <linearGradient id="narmada-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.78 0.18 55)" stopOpacity="0.0" />
          <stop offset="15%" stopColor="oklch(0.55 0.14 240)" stopOpacity="0.55" />
          <stop offset="60%" stopColor="oklch(0.6 0.16 220)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="oklch(0.78 0.18 55)" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d="M100 0 C 40 200, 160 380, 100 560 S 30 920, 100 1100 S 170 1400, 100 1600"
        stroke="url(#narmada-grad)"
        strokeWidth="60"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M100 0 C 40 200, 160 380, 100 560 S 30 920, 100 1100 S 170 1400, 100 1600"
        stroke="oklch(1 0 0 / 0.4)"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}