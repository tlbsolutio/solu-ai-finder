interface CartoLogoProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Solutio Carto logo — organizational mapping icon
 * Same visual language as the Solutio viking ship: blue line art with connected nodes
 * Represents: network/cartography of teams, processes, tools
 */
export function CartoLogo({ size = 32, className = "", color = "#3b8ad9" }: CartoLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Connecting lines — network edges */}
      <line x1="32" y1="16" x2="16" y2="32" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="16" x2="48" y2="28" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="32" x2="24" y2="48" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="32" x2="48" y2="28" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="48" y1="28" x2="44" y2="48" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="48" x2="44" y2="48" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="16" x2="32" y2="36" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" />
      <line x1="32" y1="36" x2="24" y2="48" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" />
      <line x1="32" y1="36" x2="44" y2="48" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" />

      {/* Central hub node — larger */}
      <circle cx="32" cy="36" r="4" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" />
      <circle cx="32" cy="36" r="1.5" fill={color} />

      {/* Primary nodes — teams/processes */}
      <circle cx="32" cy="16" r="5" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="2" />
      <circle cx="32" cy="16" r="2" fill={color} />

      <circle cx="16" cy="32" r="4.5" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="2" />
      <circle cx="16" cy="32" r="1.8" fill={color} />

      <circle cx="48" cy="28" r="4.5" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="2" />
      <circle cx="48" cy="28" r="1.8" fill={color} />

      {/* Secondary nodes — tools/outputs */}
      <circle cx="24" cy="48" r="3.5" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="1.5" />
      <circle cx="24" cy="48" r="1.3" fill={color} />

      <circle cx="44" cy="48" r="3.5" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="1.5" />
      <circle cx="44" cy="48" r="1.3" fill={color} />

      {/* Tiny satellite nodes — like the Solutio ship's circuit dots */}
      <circle cx="10" cy="20" r="2" fill={color} fillOpacity="0.3" />
      <line x1="10" y1="20" x2="16" y2="32" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />

      <circle cx="54" cy="16" r="2" fill={color} fillOpacity="0.3" />
      <line x1="54" y1="16" x2="48" y2="28" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />

      <circle cx="52" cy="54" r="1.5" fill={color} fillOpacity="0.25" />
      <line x1="52" y1="54" x2="44" y2="48" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />

      <circle cx="14" cy="50" r="1.5" fill={color} fillOpacity="0.25" />
      <line x1="14" y1="50" x2="24" y2="48" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />

      {/* Subtle compass/orientation mark — top right, evokes cartography */}
      <path d="M56 8 L58 4 L60 8 L58 7 Z" fill={color} fillOpacity="0.35" />
      <line x1="58" y1="4" x2="58" y2="11" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <line x1="55" y1="7.5" x2="61" y2="7.5" stroke={color} strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}
