interface CartoLogoProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Solutio Carto logo — Viking round shield with organic network map inside.
 * Nodes placed asymmetrically, connections feel natural/hand-drawn.
 * Pure line art, single color, no fills/blur.
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

      {/* ── Shield: inner rim ── */}
      <circle cx="28" cy="28" r="22" stroke={color} strokeWidth="1.5" />

      {/* ── Shield: boss (umbo) ── */}
      <circle cx="28" cy="28" r="5" stroke={color} strokeWidth="2" />
      <circle cx="28" cy="28" r="1.8" fill={color} />

      {/* ── Shield: plank lines through boss ── */}
      <line x1="28" y1="6" x2="28" y2="23" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="33" x2="28" y2="50" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6" y1="28" x2="23" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="33" y1="28" x2="50" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

      {/* ── Network: organic connections between nodes ── */}
      <line x1="18" y1="12" x2="38" y2="16" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="18" y1="12" x2="11" y2="31" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="38" y1="16" x2="44" y2="33" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="11" y1="31" x2="17" y2="44" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="44" y1="33" x2="34" y2="45" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="17" y1="44" x2="34" y2="45" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="11" y1="31" x2="38" y2="16" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="18" y1="12" x2="34" y2="45" stroke={color} strokeWidth="1.3" strokeLinecap="round" />

      {/* Spokes to boss */}
      <line x1="18" y1="12" x2="25" y2="24" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="38" y1="16" x2="31" y2="25" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="11" y1="31" x2="23" y2="29" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="44" y1="33" x2="33" y2="30" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="17" y1="44" x2="25" y2="32" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="34" y1="45" x2="30" y2="33" stroke={color} strokeWidth="1.2" strokeLinecap="round" />

      {/* ── Network: nodes (asymmetric positions) ── */}
      <circle cx="18" cy="12" r="2.5" fill={color} />
      <circle cx="38" cy="16" r="2.5" fill={color} />
      <circle cx="11" cy="31" r="2.5" fill={color} />
      <circle cx="44" cy="33" r="2.5" fill={color} />
      <circle cx="17" cy="44" r="2.3" fill={color} />
      <circle cx="34" cy="45" r="2.3" fill={color} />
    </svg>
  );
}
