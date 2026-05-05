import { motion } from "framer-motion";

interface Props {
  amount: number; // INR
  size?: number;
}

/**
 * Virtual Diya — flame intensity scales with donation amount.
 * 0 = unlit. 1+ = lit; size grows with amount via log scale.
 */
export function VirtualDiya({ amount, size = 220 }: Props) {
  const lit = amount > 0;
  // log-scaled intensity: 100 -> 0.5, 1000 -> 0.75, 10000 -> 1.0+
  const intensity = lit ? Math.min(1.6, 0.4 + Math.log10(Math.max(10, amount)) / 3) : 0;
  const flameH = 60 * intensity;
  const glow = 30 + intensity * 80;

  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size }}
    >
      {/* aura */}
      {lit && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, oklch(0.85 0.2 70 / ${0.55 * intensity}) 0%, transparent 60%)`,
            filter: `blur(${glow / 4}px)`,
          }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* flame */}
      {lit && (
        <div
          className="flame absolute left-1/2 -translate-x-1/2"
          style={{ bottom: size * 0.42, width: 30, height: flameH }}
        >
          <svg viewBox="0 0 30 80" className="h-full w-full diya-aura">
            <defs>
              <radialGradient id="flame-grad" cx="50%" cy="70%" r="60%">
                <stop offset="0%" stopColor="oklch(0.99 0.05 90)" />
                <stop offset="40%" stopColor="oklch(0.88 0.2 70)" />
                <stop offset="80%" stopColor="oklch(0.72 0.22 50)" />
                <stop offset="100%" stopColor="oklch(0.55 0.2 30 / 0)" />
              </radialGradient>
            </defs>
            <path
              d="M15 5 C 5 25, 2 50, 15 78 C 28 50, 25 25, 15 5 Z"
              fill="url(#flame-grad)"
            />
            <ellipse cx="15" cy="60" rx="6" ry="12" fill="oklch(0.55 0.2 250 / 0.6)" />
          </svg>
        </div>
      )}

      {/* embers for large donations */}
      {lit && intensity > 0.9 && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-amber-300"
              style={{ width: 4, height: 4, left: `${40 + i * 4}%`, bottom: size * 0.55 }}
              animate={{
                y: [-10, -80 - i * 8],
                opacity: [1, 0],
                x: [(i - 3) * 4, (i - 3) * 12],
              }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
            />
          ))}
        </>
      )}

      {/* diya bowl */}
      <svg viewBox="0 0 200 100" className="absolute bottom-0 left-0 w-full">
        <defs>
          <linearGradient id="diya-bowl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.65 0.15 50)" />
            <stop offset="60%" stopColor="oklch(0.45 0.14 40)" />
            <stop offset="100%" stopColor="oklch(0.3 0.1 35)" />
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="20" rx="80" ry="10" fill="oklch(0.55 0.14 40)" />
        <path
          d="M20 20 Q 100 100, 180 20 Z"
          fill="url(#diya-bowl)"
        />
        <ellipse cx="100" cy="20" rx="70" ry="6" fill="oklch(0.25 0.06 35)" />
      </svg>
    </div>
  );
}