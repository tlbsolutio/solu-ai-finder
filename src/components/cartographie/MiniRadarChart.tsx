// Simplified radar chart for the teaser/quick scan
interface MiniRadarProps {
  scores: Record<string, number>;
  size?: number;
}

const AXIS_LABELS: Record<string, string> = {
  "1": "Contexte", "2": "Clients", "3": "Orga", "4": "RH", "5": "Comm.",
  "6": "Ops", "7": "SI", "8": "Com.Int", "9": "Qualite", "10": "KPIs",
};

export function MiniRadarChart({ scores, size = 200 }: MiniRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.32;
  const numAxes = 10;
  const levels = 5;

  const getPoint = (axis: number, value: number): [number, number] => {
    const angle = (Math.PI * 2 * axis) / numAxes - Math.PI / 2;
    const r = (value / levels) * maxR;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  const getLabelPoint = (axis: number): [number, number] => {
    const angle = (Math.PI * 2 * axis) / numAxes - Math.PI / 2;
    const r = maxR + 20;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  const gridPolygons = Array.from({ length: levels }, (_, lvl) => {
    return Array.from({ length: numAxes }, (_, i) => {
      const [x, y] = getPoint(i, lvl + 1);
      return `${x},${y}`;
    }).join(" ");
  });

  const filledPoints = Array.from({ length: numAxes }, (_, i) => {
    const value = scores[String(i + 1)] || 0;
    const [x, y] = getPoint(i, value);
    return `${x},${y}`;
  }).join(" ");

  const validScores = Object.values(scores).filter(s => s > 0);
  const avg = validScores.length > 0
    ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
    : null;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="overflow-visible">
        {gridPolygons.map((pts, lvl) => (
          <polygon key={lvl} points={pts} fill="none" stroke="hsl(var(--border))" strokeWidth={0.5} opacity={0.5} />
        ))}
        {Array.from({ length: numAxes }, (_, i) => {
          const [x, y] = getPoint(i, levels);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} opacity={0.5} />;
        })}
        {validScores.length > 0 && (
          <polygon points={filledPoints} fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth={2} />
        )}
        {Array.from({ length: numAxes }, (_, i) => {
          const value = scores[String(i + 1)] || 0;
          const [x, y] = getPoint(i, value);
          return <circle key={i} cx={x} cy={y} r={3} fill="hsl(var(--primary))" stroke="white" strokeWidth={1} />;
        })}
        {Array.from({ length: numAxes }, (_, i) => {
          const [x, y] = getLabelPoint(i);
          return (
            <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={8} fill="hsl(var(--muted-foreground))" className="font-medium">
              {AXIS_LABELS[String(i + 1)]}
            </text>
          );
        })}
        {avg && (
          <>
            <circle cx={cx} cy={cy} r={16} fill="hsl(var(--primary))" />
            <text x={cx} y={cy - 1} textAnchor="middle" dominantBaseline="middle" fontSize={10} fontWeight="bold" fill="white">{avg}</text>
            <text x={cx} y={cy + 8} textAnchor="middle" dominantBaseline="middle" fontSize={6} fill="white" opacity={0.8}>/5</text>
          </>
        )}
      </svg>
    </div>
  );
}
