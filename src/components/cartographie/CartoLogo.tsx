interface CartoLogoProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Solutio Carto logo — modernized astrolabe
 *
 * Ancient navigation instrument used by Norman explorers.
 * Clean line art: outer ring, cross arms, network nodes at intersections.
 * Reads as: cartography + navigation. Subtle Norman heritage through
 * the astrolabe (Normans = master navigators who mapped the world).
 */
export function CartoLogo({ size = 32, className = "", color = "#3b8ad9" }: CartoLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer ring */}
      <circle cx="24" cy="24" r="20" stroke={color} strokeWidth="2" />

      {/* Inner ring */}
      <circle cx="24" cy="24" r="12" stroke={color} strokeWidth="1.5" />

      {/* Cross arms — cardinal directions */}
      <line x1="24" y1="4" x2="24" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="36" x2="24" y2="44" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="4" y1="24" x2="12" y2="24" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="24" x2="44" y2="24" stroke={color} strokeWidth="2" strokeLinecap="round" />

      {/* Diagonal arms — intercardinal */}
      <line x1="9.9" y1="9.9" x2="15.5" y2="15.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32.5" y1="32.5" x2="38.1" y2="38.1" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="38.1" y1="9.9" x2="32.5" y2="15.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9.9" y1="38.1" x2="15.5" y2="32.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

      {/* Network inside — connecting the intercardinal points */}
      <line x1="15.5" y1="15.5" x2="32.5" y2="15.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32.5" y1="15.5" x2="32.5" y2="32.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32.5" y1="32.5" x2="15.5" y2="32.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15.5" y1="32.5" x2="15.5" y2="15.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Cross inside the square */}
      <line x1="15.5" y1="15.5" x2="32.5" y2="32.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32.5" y1="15.5" x2="15.5" y2="32.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

      {/* Nodes at intersections */}
      <circle cx="24" cy="12" r="2" fill={color} />
      <circle cx="24" cy="36" r="2" fill={color} />
      <circle cx="12" cy="24" r="2" fill={color} />
      <circle cx="36" cy="24" r="2" fill={color} />
      <circle cx="15.5" cy="15.5" r="2" fill={color} />
      <circle cx="32.5" cy="15.5" r="2" fill={color} />
      <circle cx="32.5" cy="32.5" r="2" fill={color} />
      <circle cx="15.5" cy="32.5" r="2" fill={color} />

      {/* Center hub */}
      <circle cx="24" cy="24" r="2.5" fill={color} />
    </svg>
  );
}
