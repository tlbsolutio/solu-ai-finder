interface RadarProps {
  scores: Record<number, number | null>;
  size?: number;
}

const PACK_SHORT_LABELS: Record<number, string> = {
  1: "Contexte", 2: "Clients", 3: "Orga", 4: "RH", 5: "Comm.",
  6: "Ops", 7: "SI", 8: "Com.Int", 9: "Qualite", 10: "KPIs",
};

export function RadarChart({ scores, size = 220 }: RadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.35;
  const numAxes = 10;
  const levels = 5;

  const getPoint = (axis: number, value: number): [number, number] => {
    const angle = (Math.PI * 2 * axis) / numAxes - Math.PI / 2;
    const r = (value / levels) * maxR;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  const getLabelPoint = (axis: number): [number, number] => {
    const angle = (Math.PI * 2 * axis) / numAxes - Math.PI / 2;
    const r = maxR + 24;
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
    return { x, y, hasScore, bloc };
  });

  const validScores = Object.values(scores).filter((s) => s !== null && s !== undefined) as number[];
  const overallScore = validScores.length > 0
    ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
    : null;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="overflow-visible">
        {gridPolygons.map((pts, lvl) => (
          <polygon key={lvl} points={pts} fill="none" stroke="hsl(var(--border))" strokeWidth={0.5} opacity={0.6} />
        ))}
        {Array.from({ length: numAxes }, (_, i) => {
          const [x, y] = getPoint(i, levels);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} opacity={0.6} />;
        })}
        {validScores.length > 0 && (
          <polygon points={filledPoints} fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth={1.5} />
        )}
        {dots.map(({ x, y, hasScore, bloc }) => (
          <circle key={bloc} cx={x} cy={y} r={hasScore ? 4 : 2} fill={hasScore ? "hsl(var(--primary))" : "hsl(var(--muted))"} stroke="white" strokeWidth={1} />
        ))}
        {Array.from({ length: numAxes }, (_, i) => {
          const [x, y] = getLabelPoint(i);
          return (
            <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="hsl(var(--muted-foreground))" className="font-medium">
              {PACK_SHORT_LABELS[i + 1]}
            </text>
          );
        })}
        {overallScore && (
          <>
            <circle cx={cx} cy={cy} r={18} fill="hsl(var(--primary))" />
            <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle" fontSize={11} fontWeight="bold" fill="white">{overallScore}</text>
            <text x={cx} y={cy + 8} textAnchor="middle" dominantBaseline="middle" fontSize={7} fill="white" opacity={0.8}>/5</text>
          </>
        )}
      </svg>
      {overallScore && <p className="text-xs text-muted-foreground">Score global de maturite</p>}
    </div>
  );
}
