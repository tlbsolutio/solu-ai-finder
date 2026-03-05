import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Wrench } from "lucide-react";

function getScoreColor(score?: number) {
  if (!score) return "bg-gray-200";
  if (score >= 3.6) return "bg-green-500";
  if (score >= 2.6) return "bg-yellow-500";
  if (score >= 1.6) return "bg-orange-500";
  return "bg-red-500";
}

function getStatusBadge(score?: number) {
  if (!score) return { label: "N/A", className: "bg-gray-100 text-gray-600" };
  if (score >= 3.6) return { label: "Sain", className: "bg-green-100 text-green-700" };
  if (score >= 2.6) return { label: "Attention", className: "bg-yellow-100 text-yellow-700" };
  if (score >= 1.6) return { label: "Alerte", className: "bg-orange-100 text-orange-700" };
  return { label: "Critique", className: "bg-red-100 text-red-700" };
}

export const ToolNode = memo(({ data }: NodeProps) => {
  const d = data as { label: string; maturityScore?: number; description?: string };
  const status = getStatusBadge(d.maturityScore);

  return (
    <div className="bg-white rounded-lg border-2 border-indigo-300 shadow-sm px-3 py-2 min-w-[140px] max-w-[180px]">
      <Handle type="target" position={Position.Top} className="!bg-indigo-400" />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded bg-indigo-100 flex items-center justify-center shrink-0">
          <Wrench className="w-3.5 h-3.5 text-indigo-600" />
        </div>
        <span className="text-xs font-semibold truncate">{d.label}</span>
      </div>
      {d.maturityScore != null && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${getScoreColor(d.maturityScore)}`} style={{ width: `${(d.maturityScore / 5) * 100}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground">{d.maturityScore}/5</span>
          </div>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${status.className}`}>{status.label}</span>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-400" />
    </div>
  );
});

ToolNode.displayName = "ToolNode";
