interface CartoLogoProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Solutio Carto logo — Viking round shield with network map inside.
 * Pure line art, single color, no fills/blur. Norman heritage.
 */
export function CartoLogo({ size = 32, className = "", color = "#3b8ad9" }: CartoLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* ── Shield: outer rim ── */}
      <circle cx="28" cy="28" r="26" stroke={color} strokeWidth="2.5" />

      {/* ── Shield: inner rim (double border like real viking shields) ── */}
      <circle cx="28" cy="28" r="22" stroke={color} strokeWidth="1.5" />

      {/* ── Shield: boss ring (umbo — center metal piece) ── */}
      <circle cx="28" cy="28" r="5" stroke={color} strokeWidth="2" />
      <circle cx="28" cy="28" r="1.8" fill={color} />

      {/* ── Shield: planks (4 structural lines through the boss) ── */}
      <line x1="28" y1="6" x2="28" y2="23" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="33" x2="28" y2="50" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6" y1="28" x2="23" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="33" y1="28" x2="50" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

      {/* ── Network map: connections between nodes ── */}
      {/* Upper triangle */}
      <line x1="20" y1="14" x2="36" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="14" x2="14" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="36" y1="14" x2="42" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

      {/* Lower triangle */}
      <line x1="14" y1="28" x2="20" y2="42" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="42" y1="28" x2="36" y2="42" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="42" x2="36" y2="42" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

      {/* Spokes to center boss */}
      <line x1="20" y1="14" x2="25" y2="25" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="36" y1="14" x2="31" y2="25" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="14" y1="28" x2="23" y2="28" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="42" y1="28" x2="33" y2="28" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="20" y1="42" x2="25" y2="31" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="36" y1="42" x2="31" y2="31" stroke={color} strokeWidth="1.2" strokeLinecap="round" />

      {/* ── Network map: nodes ── */}
      <circle cx="20" cy="14" r="2.5" fill={color} />
      <circle cx="36" cy="14" r="2.5" fill={color} />
      <circle cx="14" cy="28" r="2.5" fill={color} />
      <circle cx="42" cy="28" r="2.5" fill={color} />
      <circle cx="20" cy="42" r="2.5" fill={color} />
      <circle cx="36" cy="42" r="2.5" fill={color} />
    </svg>
  );
}
