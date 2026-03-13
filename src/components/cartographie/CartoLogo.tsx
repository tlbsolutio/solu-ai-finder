interface CartoLogoProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Solutio Carto logo — clean line art, same spirit as the Solutio ship.
 * Simple connected nodes forming a map/network shape, single stroke weight.
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
      {/* Connections */}
      <path
        d="M24 8 L12 22 L20 38 L36 38 L40 20 L24 8 Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Inner spokes to center */}
      <line x1="24" y1="8" x2="26" y2="26" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="22" x2="26" y2="26" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="20" x2="26" y2="26" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="38" x2="26" y2="26" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="36" y1="38" x2="26" y2="26" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

      {/* Nodes */}
      <circle cx="24" cy="8" r="3" fill={color} />
      <circle cx="12" cy="22" r="3" fill={color} />
      <circle cx="40" cy="20" r="3" fill={color} />
      <circle cx="20" cy="38" r="3" fill={color} />
      <circle cx="36" cy="38" r="3" fill={color} />

      {/* Center hub */}
      <circle cx="26" cy="26" r="4" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" />
      <circle cx="26" cy="26" r="1.5" fill={color} />
    </svg>
  );
}
