interface CartoLogoProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Solutio Carto logo — shield + network + fleur-de-lis
 * Imposing crest shape evoking Normandy heritage (Jeanne d'Arc emblem),
 * containing a connected network map. Clean line art, same spirit as Solutio ship.
 */
export function CartoLogo({ size = 32, className = "", color = "#3b8ad9" }: CartoLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* ── Shield outline ── */}
      <path
        d="M28 4 L6 14 L6 34 C6 48 28 60 28 60 C28 60 50 48 50 34 L50 14 Z"
        stroke={color}
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill={color}
        fillOpacity="0.04"
      />

      {/* ── Fleur-de-lis (top of shield) ── */}
      <g transform="translate(28, 11)" fill={color} opacity="0.85">
        {/* Center petal */}
        <path d="M0 -6 C-1.2 -3, -1.5 -1, -0.8 1 L0 2.5 L0.8 1 C1.5 -1, 1.2 -3, 0 -6 Z" />
        {/* Left petal */}
        <path d="M-2 -3 C-4.5 -3.5, -5.5 -1.5, -5 0.5 C-4.5 2.5, -2.5 2, -1.2 1 L-0.5 0 C-1 -0.5, -1.5 -1.5, -2 -3 Z" />
        {/* Right petal */}
        <path d="M2 -3 C4.5 -3.5, 5.5 -1.5, 5 0.5 C4.5 2.5, 2.5 2, 1.2 1 L0.5 0 C1 -0.5, 1.5 -1.5, 2 -3 Z" />
        {/* Base bar */}
        <rect x="-3.5" y="2" width="7" height="1.2" rx="0.6" />
      </g>

      {/* ── Network connections ── */}
      {/* Outer polygon */}
      <path
        d="M28 20 L14 30 L18 46 L38 46 L42 30 Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Spokes to center hub */}
      <line x1="28" y1="20" x2="28" y2="35" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="14" y1="30" x2="28" y2="35" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="42" y1="30" x2="28" y2="35" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="18" y1="46" x2="28" y2="35" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="38" y1="46" x2="28" y2="35" stroke={color} strokeWidth="1.4" strokeLinecap="round" />

      {/* ── Nodes ── */}
      <circle cx="28" cy="20" r="3" fill={color} />
      <circle cx="14" cy="30" r="3" fill={color} />
      <circle cx="42" cy="30" r="3" fill={color} />
      <circle cx="18" cy="46" r="2.8" fill={color} />
      <circle cx="38" cy="46" r="2.8" fill={color} />

      {/* ── Center hub ── */}
      <circle cx="28" cy="35" r="4.5" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" />
      <circle cx="28" cy="35" r="1.8" fill={color} />
    </svg>
  );
}
