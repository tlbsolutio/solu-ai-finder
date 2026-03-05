import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AlertTriangle } from "lucide-react";

function getGraviteColor(gravite?: number) {
  if (!gravite) return "border-red-200";
  if (gravite >= 4) return "border-red-500";
  if (gravite >= 3) return "border-orange-400";
  return "border-yellow-400";
}

export const PainPointNode = memo(({ data }: NodeProps) => {
  const d = data as { label: string; gravite?: number; description?: string };

  return (
    <div className={`bg-white rounded-lg border-2 ${getGraviteColor(d.gravite)} shadow-sm px-3 py-2 min-w-[130px] max-w-[170px]`}>
      <Handle type="target" position={Position.Top} className="!bg-red-400" />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
        </div>
        <span className="text-xs font-semibold truncate">{d.label}</span>
      </div>
      {d.gravite != null && (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < d.gravite! ? "bg-red-500" : "bg-gray-200"}`} />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">Gravite {d.gravite}/5</span>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-red-400" />
    </div>
  );
});

PainPointNode.displayName = "PainPointNode";
