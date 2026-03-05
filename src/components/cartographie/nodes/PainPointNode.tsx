import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AlertTriangle } from "lucide-react";

function getGraviteColor(gravite?: number) {
  if (!gravite) return "border-red-500/30";
  if (gravite >= 4) return "border-red-500/70";
  if (gravite >= 3) return "border-orange-500/50";
  return "border-amber-500/40";
}

function getGraviteGlow(gravite?: number) {
  if (!gravite) return "shadow-red-500/5";
  if (gravite >= 4) return "shadow-red-500/20";
  if (gravite >= 3) return "shadow-orange-500/15";
  return "shadow-amber-500/10";
}

export const PainPointNode = memo(({ data }: NodeProps) => {
  const d = data as { label: string; gravite?: number; description?: string };

  return (
    <div className={`bg-slate-800 rounded-xl border ${getGraviteColor(d.gravite)} shadow-lg ${getGraviteGlow(d.gravite)} px-3.5 py-2.5 min-w-[140px] max-w-[190px] hover:border-red-400/60 transition-colors`}>
      <Handle type="target" position={Position.Top} className="!bg-red-500 !w-2 !h-2 !border-slate-800" />
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-400" />
        </div>
        <span className="text-xs font-semibold text-slate-100 truncate">{d.label}</span>
      </div>
      {d.gravite != null && (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < d.gravite! ? "bg-red-500" : "bg-slate-600"}`} />
          ))}
          <span className="text-[10px] text-slate-400 ml-1">Gravite {d.gravite}/5</span>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-red-500 !w-2 !h-2 !border-slate-800" />
    </div>
  );
});

PainPointNode.displayName = "PainPointNode";
