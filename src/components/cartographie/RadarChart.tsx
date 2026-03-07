interface RadarProps {
  scores: Record<number, number | null>;
  size?: number;
  showLegend?: boolean;
  animated?: boolean;
}

const PACK_SHORT_LABELS: Record<number, string> = {
  1: "Contexte", 2: "Clients", 3: "Orga", 4: "RH", 5: "Comm.",
  6: "Ops", 7: "SI", 8: "Com.Int", 9: "Qualite", 10: "KPIs",
};

const SCORE_COLORS: Record<string, string> = {
  critique: "#ef4444",
  emergent: "#f97316",
  developpement: "#eab308",
  mature: "#22c55e",
  optimise: "#06b6d4",
};

function getScoreColor(score: number): string {
  if (score < 1.5) return SCORE_COLORS.critique;
  if (score < 2.5) return SCORE_COLORS.emergent;
  if (score < 3.5) return SCORE_COLORS.developpement;
  if (score < 4.5) return SCORE_COLORS.mature;
  return SCORE_COLORS.optimise;
}

function getScoreLabel(score: number): string {
  if (score < 1.5) return "Critique";
  if (score < 2.5) return "Emergent";
  if (score < 3.5) return "En developpement";
  if (score < 4.5) return "Mature";
  return "Optimise";
}

export function RadarChart({ scores, size = 240, showLegend = false, animated = true }: RadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.34;
  const numAxes = 10;
  const levels = 5;

  const getPoint = (axis: number, value: number): [number, number] => {
    const angle = (Math.PI * 2 * axis) / numAxes - Math.PI / 2;
    const r = (value / levels) * maxR;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  const getLabelPoint = (axis: number): [number, number] => {
    const angle = (Math.PI * 2 * axis) / numAxes - Math.PI / 2;
    const r = maxR + 26;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  const gridPolygons = Array.from({ length: levels }, (_, lvl) => {
    const level = lvl + 1;
    return Array.from({ length: numAxes }, (_, i) => {
      const [x, y] = getPoint(i, level);
      return `${x},${y}`;
    }).join(" ");
  });

  const filledPoints = Array.from({ length: numAxes }, (_, i) => {
    const bloc = i + 1;
    const score = scores[bloc];
    const value = score !== null && score !== undefined ? score : 0;
    const [x, y] = getPoint(i, value);
    return `${x},${y}`;
  }).join(" ");

  const dots = Array.from({ length: numAxes }, (_, i) => {
    const bloc = i + 1;
    const score = scores[bloc];
    const hasScore = score !== null && score !== undefined;
    const value = hasScore ? score! : 0;
    const [x, y] = getPoint(i, value);
    return { x, y, hasScore, bloc, score: value };
  });

  const validScores = Object.values(scores).filter((s) => s !== null && s !== undefined) as number[];
  const overallScore = validScores.length > 0
    ? (validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : null;

  const overallScoreStr = overallScore?.toFixed(1) ?? null;
  const overallColor = overallScore ? getScoreColor(overallScore) : "#06b6d4";

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} className="overflow-visible" role="img" aria-label="Radar de maturite organisationnelle">
        <defs>
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={overallColor} stopOpacity={0.25} />
            <stop offset="100%" stopColor={overallColor} stopOpacity={0.05} />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Grid levels with subtle fill */}
        {gridPolygons.map((pts, lvl) => (
          <polygon
            key={lvl}
            points={pts}
            fill={lvl === 0 ? "hsl(var(--muted) / 0.1)" : "none"}
            stroke="hsl(var(--border))"
            strokeWidth={lvl === 4 ? 0.8 : 0.3}
            opacity={0.5}
          />
        ))}

        {/* Axis lines */}
        {Array.from({ length: numAxes }, (_, i) => {
          const [x, y] = getPoint(i, levels);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="hsl(var(--border))" strokeWidth={0.3} opacity={0.4} />;
        })}

        {/* Filled area with gradient */}
        {validScores.length > 0 && (
          <polygon
            points={filledPoints}
            fill="url(#radarFill)"
            stroke={overallColor}
            strokeWidth={2}
            strokeLinejoin="round"
            filter="url(#glow)"
            className={animated ? "animate-[fade-in_0.8s_ease-out]" : ""}
          />
        )}

        {/* Score dots with color coding */}
        {dots.map(({ x, y, hasScore, bloc, score }) => (
          <g key={bloc}>
            {hasScore && (
              <>
                <circle cx={x} cy={y} r={6} fill={getScoreColor(score)} opacity={0.15} />
                <circle cx={x} cy={y} r={4} fill={getScoreColor(score)} stroke="white" strokeWidth={1.5} />
              </>
            )}
            {!hasScore && (
              <circle cx={x} cy={y} r={2.5} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="2,2" />
            )}
          </g>
        ))}

        {/* Axis labels with score values */}
        {Array.from({ length: numAxes }, (_, i) => {
          const [x, y] = getLabelPoint(i);
          const score = scores[i + 1];
          const hasScore = score !== null && score !== undefined;
          return (
            <g key={i}>
              <text
                x={x} y={y - (hasScore ? 5 : 0)}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={9}
                fill="hsl(var(--foreground))"
                className="font-semibold"
              >
                {PACK_SHORT_LABELS[i + 1]}
              </text>
              {hasScore && (
                <text
                  x={x} y={y + 7}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={8}
                  fill={getScoreColor(score!)}
                  className="font-bold"
                >
                  {score!.toFixed(1)}
                </text>
              )}
            </g>
          );
        })}

        {/* Center score circle with gradient */}
        {overallScoreStr && (
          <>
            <circle cx={cx} cy={cy} r={22} fill={overallColor} opacity={0.1} />
            <circle cx={cx} cy={cy} r={18} fill={overallColor} />
            <text x={cx} y={cy - 3} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight="bold" fill="white">{overallScoreStr}</text>
            <text x={cx} y={cy + 8} textAnchor="middle" dominantBaseline="middle" fontSize={7} fill="white" opacity={0.8}>/5</text>
          </>
        )}
      </svg>

      {/* Score label */}
      {overallScore && (
        <div className="text-center">
          <p className="text-xs font-medium text-muted-foreground">Score global de maturite</p>
          <p className="text-xs font-semibold" style={{ color: overallColor }}>
            {getScoreLabel(overallScore)}
          </p>
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
          {Object.entries(SCORE_COLORS).map(([key, color]) => (
            <div key={key} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-muted-foreground capitalize">{key === "developpement" ? "En dev." : key}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
