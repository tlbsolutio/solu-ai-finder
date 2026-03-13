interface CartoLogoProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Solutio Carto logo — Viking round shield with light network map.
 * Fewer elements, more breathing room. Pure line art, single color.
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
      {/* Shield: outer rim */}
      <circle cx="28" cy="28" r="26" stroke={color} strokeWidth="2.2" />

      {/* Shield: inner rim */}
      <circle cx="28" cy="28" r="21.5" stroke={color} strokeWidth="1.2" />

      {/* Shield: boss (umbo) */}
      <circle cx="28" cy="28" r="4" stroke={color} strokeWidth="1.8" />
      <circle cx="28" cy="28" r="1.5" fill={color} />

      {/* Network: connections */}
      <line x1="19" y1="13" x2="40" y2="17" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="19" y1="13" x2="13" y2="33" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="40" y1="17" x2="42" y2="36" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="13" y1="33" x2="33" y2="44" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="42" y1="36" x2="33" y2="44" stroke={color} strokeWidth="1.3" strokeLinecap="round" />

      {/* Spokes to boss */}
      <line x1="19" y1="13" x2="26" y2="25" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="40" y1="17" x2="31" y2="26" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="13" y1="33" x2="24" y2="29" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="42" y1="36" x2="32" y2="30" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="33" y1="44" x2="29" y2="32" stroke={color} strokeWidth="1.2" strokeLinecap="round" />

      {/* Nodes */}
      <circle cx="19" cy="13" r="2.5" fill={color} />
      <circle cx="40" cy="17" r="2.5" fill={color} />
      <circle cx="13" cy="33" r="2.3" fill={color} />
      <circle cx="42" cy="36" r="2.3" fill={color} />
      <circle cx="33" cy="44" r="2.3" fill={color} />
    </svg>
  );
}
