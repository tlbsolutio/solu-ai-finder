interface CartoLogoProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Solutio Carto logo — premium organizational cartography icon
 *
 * Design language:
 * - Outer circular bezel with graduated tick marks (cartographic instrument)
 * - 3 concentric orbital rings (layers of the organization)
 * - 6 primary nodes on orbits connected by curved weighted edges
 * - Hexagonal hub at center with inner pulse ring
 * - Flowing Bézier curves between nodes (organic network feel)
 * - Layered gradients, soft glows, and depth through opacity
 * - Subtle compass rose integrated into the bezel (N marker)
 */
export function CartoLogo({ size = 32, className = "", color = "#3b8ad9" }: CartoLogoProps) {
  const id = `cl-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Central glow */}
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="45%">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="60%" stopColor={color} stopOpacity="0.06" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        {/* Edge gradient — warm direction */}
        <linearGradient id={`${id}-e1`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id={`${id}-e2`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.7" />
          <stop offset="100%" stopColor={color} stopOpacity="0.15" />
        </linearGradient>
        {/* Node gradient (glass-like) */}
        <radialGradient id={`${id}-n`} cx="38%" cy="32%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="40%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.04" />
        </radialGradient>
        {/* Hub gradient */}
        <radialGradient id={`${id}-hub`} cx="42%" cy="38%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="30%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.06" />
        </radialGradient>
        {/* Bezel ring gradient */}
        <linearGradient id={`${id}-bz`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="50%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
        {/* Orbit ring gradient */}
        <linearGradient id={`${id}-orb`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* ══════ LAYER 0: Background glow ══════ */}
      <circle cx="40" cy="40" r="34" fill={`url(#${id}-glow)`} />

      {/* ══════ LAYER 1: Outer bezel ring ══════ */}
      <circle cx="40" cy="40" r="36" stroke={`url(#${id}-bz)`} strokeWidth="1.2" fill="none" />
      <circle cx="40" cy="40" r="34" stroke={color} strokeWidth="0.4" fill="none" opacity="0.12" />

      {/* Bezel tick marks (every 30°, like a compass) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180 - Math.PI / 2;
        const isMajor = i % 3 === 0;
        const r1 = isMajor ? 33 : 34;
        const r2 = 36;
        return (
          <line
            key={`tick-${i}`}
            x1={40 + r1 * Math.cos(angle)}
            y1={40 + r1 * Math.sin(angle)}
            x2={40 + r2 * Math.cos(angle)}
            y2={40 + r2 * Math.sin(angle)}
            stroke={color}
            strokeWidth={isMajor ? "1.2" : "0.6"}
            opacity={isMajor ? 0.5 : 0.25}
            strokeLinecap="round"
          />
        );
      })}

      {/* North marker (compass) */}
      <path d="M40 2.5 L41.3 5.8 L40 5 L38.7 5.8 Z" fill={color} opacity="0.6" />

      {/* ══════ LAYER 2: Concentric orbit rings ══════ */}
      <circle cx="40" cy="40" r="27" stroke={`url(#${id}-orb)`} strokeWidth="0.8" fill="none" strokeDasharray="3 4" />
      <circle cx="40" cy="40" r="19" stroke={`url(#${id}-orb)`} strokeWidth="0.7" fill="none" strokeDasharray="2 3" />
      <circle cx="40" cy="40" r="11" stroke={color} strokeWidth="0.5" fill="none" opacity="0.1" />

      {/* ══════ LAYER 3: Curved connections between nodes ══════ */}
      {/* Outer ring connections (Bézier curves) */}
      <path d="M40 13 C28 15, 17 22, 16 32" stroke={`url(#${id}-e1)`} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M40 13 C52 15, 61 22, 62 30" stroke={`url(#${id}-e1)`} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M16 32 C14 44, 18 54, 26 58" stroke={`url(#${id}-e2)`} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M62 30 C64 42, 60 53, 54 58" stroke={`url(#${id}-e2)`} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M26 58 C34 63, 46 63, 54 58" stroke={`url(#${id}-e1)`} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* Cross connection (top to bottom nodes) */}
      <path d="M16 32 C30 36, 50 36, 62 30" stroke={color} strokeWidth="0.8" fill="none" opacity="0.15" strokeDasharray="3 2.5" strokeLinecap="round" />

      {/* ══════ LAYER 4: Inner spokes to hub ══════ */}
      <path d="M40 13 C39 22, 40 28, 40 32" stroke={color} strokeWidth="1.3" fill="none" opacity="0.45" strokeLinecap="round" />
      <path d="M16 32 C24 33, 30 35, 34 38" stroke={color} strokeWidth="1.3" fill="none" opacity="0.45" strokeLinecap="round" />
      <path d="M62 30 C55 32, 50 35, 46 38" stroke={color} strokeWidth="1.3" fill="none" opacity="0.45" strokeLinecap="round" />
      <path d="M26 58 C30 52, 34 46, 37 43" stroke={color} strokeWidth="1.1" fill="none" opacity="0.35" strokeLinecap="round" />
      <path d="M54 58 C50 52, 46 46, 43 43" stroke={color} strokeWidth="1.1" fill="none" opacity="0.35" strokeLinecap="round" />

      {/* ══════ LAYER 5: Secondary mid-orbit nodes ══════ */}
      {/* Between top & left */}
      <circle cx="24" cy="20" r="2.5" fill={`url(#${id}-n)`} stroke={color} strokeWidth="1" />
      <circle cx="24" cy="20" r="1" fill={color} opacity="0.7" />
      {/* Between top & right */}
      <circle cx="56" cy="20" r="2.5" fill={`url(#${id}-n)`} stroke={color} strokeWidth="1" />
      <circle cx="56" cy="20" r="1" fill={color} opacity="0.7" />
      {/* Between left & bottom-left */}
      <circle cx="17" cy="47" r="2.2" fill={`url(#${id}-n)`} stroke={color} strokeWidth="0.9" />
      <circle cx="17" cy="47" r="0.9" fill={color} opacity="0.6" />
      {/* Between right & bottom-right */}
      <circle cx="63" cy="46" r="2.2" fill={`url(#${id}-n)`} stroke={color} strokeWidth="0.9" />
      <circle cx="63" cy="46" r="0.9" fill={color} opacity="0.6" />

      {/* ══════ LAYER 6: Primary nodes ══════ */}
      {/* Top — "Strategy" */}
      <circle cx="40" cy="13" r="5.5" fill={`url(#${id}-n)`} stroke={color} strokeWidth="1.8" />
      <circle cx="40" cy="13" r="2.3" fill={color} opacity="0.9" />

      {/* Left — "Process" */}
      <circle cx="16" cy="32" r="5" fill={`url(#${id}-n)`} stroke={color} strokeWidth="1.7" />
      <circle cx="16" cy="32" r="2.1" fill={color} opacity="0.9" />

      {/* Right — "Technology" */}
      <circle cx="62" cy="30" r="5" fill={`url(#${id}-n)`} stroke={color} strokeWidth="1.7" />
      <circle cx="62" cy="30" r="2.1" fill={color} opacity="0.9" />

      {/* Bottom-left — "People" */}
      <circle cx="26" cy="58" r="4.5" fill={`url(#${id}-n)`} stroke={color} strokeWidth="1.5" />
      <circle cx="26" cy="58" r="1.8" fill={color} opacity="0.85" />

      {/* Bottom-right — "Data" */}
      <circle cx="54" cy="58" r="4.5" fill={`url(#${id}-n)`} stroke={color} strokeWidth="1.5" />
      <circle cx="54" cy="58" r="1.8" fill={color} opacity="0.85" />

      {/* ══════ LAYER 7: Center hub (hexagonal) ══════ */}
      <polygon
        points="40,32 46.5,36 46.5,44 40,48 33.5,44 33.5,36"
        fill={`url(#${id}-hub)`}
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Inner hex ring */}
      <polygon
        points="40,35.5 43.5,37.5 43.5,42.5 40,44.5 36.5,42.5 36.5,37.5"
        fill="none"
        stroke={color}
        strokeWidth="0.6"
        opacity="0.25"
        strokeLinejoin="round"
      />
      {/* Hub center dot */}
      <circle cx="40" cy="40" r="2.5" fill={color} opacity="0.85" />
      {/* Pulse ring */}
      <circle cx="40" cy="40" r="4.5" stroke={color} strokeWidth="0.6" fill="none" opacity="0.2" />

      {/* ══════ LAYER 8: Satellite micro-nodes (outer depth) ══════ */}
      <circle cx="40" cy="4" r="1.3" fill={color} opacity="0.25" />
      <circle cx="9" cy="19" r="1.5" fill={color} opacity="0.18" />
      <line x1="9" y1="19" x2="16" y2="32" stroke={color} strokeWidth="0.6" opacity="0.15" strokeLinecap="round" />
      <circle cx="71" cy="17" r="1.5" fill={color} opacity="0.18" />
      <line x1="71" y1="17" x2="62" y2="30" stroke={color} strokeWidth="0.6" opacity="0.15" strokeLinecap="round" />
      <circle cx="9" cy="60" r="1.2" fill={color} opacity="0.12" />
      <line x1="9" y1="60" x2="26" y2="58" stroke={color} strokeWidth="0.5" opacity="0.1" strokeLinecap="round" />
      <circle cx="71" cy="62" r="1.2" fill={color} opacity="0.12" />
      <line x1="71" y1="62" x2="54" y2="58" stroke={color} strokeWidth="0.5" opacity="0.1" strokeLinecap="round" />
      <circle cx="40" cy="72" r="1.3" fill={color} opacity="0.15" />
    </svg>
  );
}
