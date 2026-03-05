import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Wrench } from "lucide-react";

function getScoreColor(score?: number) {
  if (!score) return "bg-slate-600";
  if (score >= 3.6) return "bg-emerald-500";
  if (score >= 2.6) return "bg-amber-500";
  if (score >= 1.6) return "bg-orange-500";
  return "bg-red-500";
}

function getStatusBadge(score?: number) {
  if (!score) return { label: "N/A", className: "bg-slate-700 text-slate-400" };
  if (score >= 3.6) return { label: "Sain", className: "bg-emerald-900/60 text-emerald-300" };
  if (score >= 2.6) return { label: "Attention", className: "bg-amber-900/60 text-amber-300" };
  if (score >= 1.6) return { label: "Alerte", className: "bg-orange-900/60 text-orange-300" };
  return { label: "Critique", className: "bg-red-900/60 text-red-300" };
}

export const ToolNode = memo(({ data }: NodeProps) => {
  const d = data as { label: string; maturityScore?: number; description?: string };
  const status = getStatusBadge(d.maturityScore);

  return (
    <div className="bg-slate-800 rounded-xl border border-indigo-500/40 shadow-lg shadow-indigo-500/10 px-3.5 py-2.5 min-w-[150px] max-w-[200px] hover:border-indigo-400/70 transition-colors">
      <Handle type="target" position={Position.Top} className="!bg-indigo-500 !w-2 !h-2 !border-slate-800" />
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
          <Wrench className="w-4 h-4 text-indigo-400" />
        </div>
        <span className="text-xs font-semibold text-slate-100 truncate">{d.label}</span>
      </div>
      {d.maturityScore != null && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${getScoreColor(d.maturityScore)}`} style={{ width: `${(d.maturityScore / 5) * 100}%` }} />
            </div>
            <span className="text-[10px] text-slate-400">{d.maturityScore}/5</span>
          </div>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${status.className}`}>{status.label}</span>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-2 !h-2 !border-slate-800" />
    </div>
  );
});

ToolNode.displayName = "ToolNode";
