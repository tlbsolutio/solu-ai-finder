import type { Node, Edge } from "@xyflow/react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  node: Node;
  edges: Edge[];
  nodes: Node[];
  onClose: () => void;
}

function getScoreColor(score?: number) {
  if (!score) return "bg-gray-200";
  if (score >= 3.6) return "bg-green-500";
  if (score >= 2.6) return "bg-yellow-500";
  if (score >= 1.6) return "bg-orange-500";
  return "bg-red-500";
}

const typeLabels: Record<string, string> = {
  team: "Equipe",
  process: "Processus",
  tool: "Outil",
  painpoint: "Irritant",
};

export function NodeDetailPanel({ node, edges, nodes, onClose }: Props) {
  const data = node.data as Record<string, any>;
  const type = node.type || "process";

  const incomingEdges = edges.filter((e) => e.target === node.id);
  const outgoingEdges = edges.filter((e) => e.source === node.id);

  const getNodeLabel = (id: string) => {
    const n = nodes.find((n) => n.id === id);
    return (n?.data as any)?.label || id;
  };

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-white border-l shadow-lg z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <span className="text-xs text-muted-foreground">{typeLabels[type] || type}</span>
          <h3 className="font-semibold text-sm">{data.label}</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {data.description && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
            <p className="text-sm">{data.description}</p>
          </div>
        )}

        {data.maturityScore != null && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Score maturite</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getScoreColor(data.maturityScore)}`}
                  style={{ width: `${(data.maturityScore / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{data.maturityScore}/5</span>
            </div>
          </div>
        )}

        {data.gravite != null && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Gravite</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < data.gravite ? "bg-red-500" : "bg-gray-200"}`} />
              ))}
              <span className="text-sm ml-2">{data.gravite}/5</span>
            </div>
          </div>
        )}

        {incomingEdges.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Connexions entrantes ({incomingEdges.length})
            </p>
            <div className="space-y-1">
              {incomingEdges.map((e) => (
                <div key={e.id} className="flex items-center gap-2 text-xs bg-muted/50 rounded px-2 py-1">
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <span>{getNodeLabel(e.source)}</span>
                  {e.label && <span className="text-muted-foreground">({String(e.label)})</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {outgoingEdges.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Connexions sortantes ({outgoingEdges.length})
            </p>
            <div className="space-y-1">
              {outgoingEdges.map((e) => (
                <div key={e.id} className="flex items-center gap-2 text-xs bg-muted/50 rounded px-2 py-1">
                  <ArrowLeft className="w-3 h-3 text-muted-foreground" />
                  <span>{getNodeLabel(e.target)}</span>
                  {e.label && <span className="text-muted-foreground">({String(e.label)})</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
