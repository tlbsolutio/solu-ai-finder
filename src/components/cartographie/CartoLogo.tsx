interface CartoLogoProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Solutio Carto logo — organizational cartography icon
 * Refined network graph with layered depth: gradient fills, soft glows,
 * curved connections, and a hexagonal center hub evoking structure & mapping.
 */
export function CartoLogo({ size = 32, className = "", color = "#3b8ad9" }: CartoLogoProps) {
  const id = `carto-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Radial glow behind center */}
        <radialGradient id={`${id}-glow`} cx="50%" cy="53%" r="40%">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        {/* Gradient for primary connections */}
        <linearGradient id={`${id}-edge`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.7" />
          <stop offset="100%" stopColor={color} stopOpacity="0.25" />
        </linearGradient>
        {/* Node fill gradient */}
        <radialGradient id={`${id}-node`} cx="40%" cy="35%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.06" />
        </radialGradient>
        {/* Hub fill gradient */}
        <radialGradient id={`${id}-hub`} cx="45%" cy="40%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.08" />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <circle cx="32" cy="34" r="26" fill={`url(#${id}-glow)`} />

      {/* ── Curved connections (outer ring) ── */}
      <path d="M32 13 Q22 20 14 30" stroke={`url(#${id}-edge)`} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M32 13 Q42 18 50 26" stroke={`url(#${id}-edge)`} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M14 30 Q14 42 22 50" stroke={`url(#${id}-edge)`} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M50 26 Q52 40 44 50" stroke={`url(#${id}-edge)`} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M22 50 Q33 54 44 50" stroke={`url(#${id}-edge)`} strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* ── Inner connections to hub ── */}
      <line x1="32" y1="13" x2="32" y2="28" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      <line x1="14" y1="30" x2="26" y2="34" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      <line x1="50" y1="26" x2="38" y2="32" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      <line x1="22" y1="50" x2="28" y2="40" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <line x1="44" y1="50" x2="36" y2="40" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />

      {/* ── Cross connections (mesh depth) ── */}
      <line x1="14" y1="30" x2="50" y2="26" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.15" strokeDasharray="4 3" />
      <line x1="32" y1="13" x2="22" y2="50" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.12" strokeDasharray="4 3" />
      <line x1="32" y1="13" x2="44" y2="50" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.12" strokeDasharray="4 3" />

      {/* ── Center hub — hexagonal shape ── */}
      <polygon
        points="32,28 38,31.5 38,38.5 32,42 26,38.5 26,31.5"
        fill={`url(#${id}-hub)`}
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Hub inner dot */}
      <circle cx="32" cy="35" r="2.2" fill={color} opacity="0.8" />

      {/* ── Primary nodes (5 outer) ── */}
      {/* Top */}
      <circle cx="32" cy="13" r="5.5" fill={`url(#${id}-node)`} stroke={color} strokeWidth="1.8" />
      <circle cx="32" cy="13" r="2.2" fill={color} opacity="0.85" />

      {/* Left */}
      <circle cx="14" cy="30" r="5" fill={`url(#${id}-node)`} stroke={color} strokeWidth="1.8" />
      <circle cx="14" cy="30" r="2" fill={color} opacity="0.85" />

      {/* Right */}
      <circle cx="50" cy="26" r="5" fill={`url(#${id}-node)`} stroke={color} strokeWidth="1.8" />
      <circle cx="50" cy="26" r="2" fill={color} opacity="0.85" />

      {/* Bottom-left */}
      <circle cx="22" cy="50" r="4" fill={`url(#${id}-node)`} stroke={color} strokeWidth="1.5" />
      <circle cx="22" cy="50" r="1.6" fill={color} opacity="0.8" />

      {/* Bottom-right */}
      <circle cx="44" cy="50" r="4" fill={`url(#${id}-node)`} stroke={color} strokeWidth="1.5" />
      <circle cx="44" cy="50" r="1.6" fill={color} opacity="0.8" />

      {/* ── Satellite micro-nodes (peripheral depth) ── */}
      <circle cx="8" cy="18" r="1.8" fill={color} opacity="0.2" />
      <line x1="8" y1="18" x2="14" y2="30" stroke={color} strokeWidth="0.8" opacity="0.2" strokeLinecap="round" />

      <circle cx="56" cy="14" r="1.8" fill={color} opacity="0.2" />
      <line x1="56" y1="14" x2="50" y2="26" stroke={color} strokeWidth="0.8" opacity="0.2" strokeLinecap="round" />

      <circle cx="10" cy="52" r="1.4" fill={color} opacity="0.15" />
      <line x1="10" y1="52" x2="22" y2="50" stroke={color} strokeWidth="0.7" opacity="0.15" strokeLinecap="round" />

      <circle cx="54" cy="56" r="1.4" fill={color} opacity="0.15" />
      <line x1="54" y1="56" x2="44" y2="50" stroke={color} strokeWidth="0.7" opacity="0.15" strokeLinecap="round" />

      {/* ── Compass mark — top-right (cartography feel) ── */}
      <g opacity="0.4">
        <path d="M57 6 L58.5 2 L60 6 L58.5 5.2 Z" fill={color} />
        <line x1="58.5" y1="2" x2="58.5" y2="9" stroke={color} strokeWidth="0.7" />
        <line x1="55.5" y1="5.5" x2="61.5" y2="5.5" stroke={color} strokeWidth="0.7" />
      </g>
    </svg>
  );
}
