import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download, Eye, EyeOff } from "lucide-react";
import { TeamNode } from "./nodes/TeamNode";
import { ToolNode } from "./nodes/ToolNode";
import { ProcessNode } from "./nodes/ProcessNode";
import { PainPointNode } from "./nodes/PainPointNode";
import { NodeDetailPanel } from "./NodeDetailPanel";
import type {
  CartProcessusV2,
  CartOutilV2,
  CartEquipeV2,
  CartIrritantV2,
  CartPackResume,
} from "@/lib/cartTypes";

const nodeTypes = {
  team: TeamNode,
  tool: ToolNode,
  process: ProcessNode,
  painpoint: PainPointNode,
};

interface OrgMapProps {
  processus: CartProcessusV2[];
  outils: CartOutilV2[];
  equipes: CartEquipeV2[];
  irritants: CartIrritantV2[];
  packResumes?: CartPackResume[];
  aiCartographyJson?: any;
}

function layoutNodes(nodes: Node[]): Node[] {
  const typeGroups: Record<string, Node[]> = {};
  for (const n of nodes) {
    const t = n.type || "process";
    if (!typeGroups[t]) typeGroups[t] = [];
    typeGroups[t].push(n);
  }

  const typeOrder = ["team", "process", "tool", "painpoint"];
  let y = 0;
  const GAP_Y = 120;
  const GAP_X = 200;

  for (const type of typeOrder) {
    const group = typeGroups[type] || [];
    const startX = Math.max(0, (800 - group.length * GAP_X) / 2);
    for (let i = 0; i < group.length; i++) {
      group[i].position = { x: startX + i * GAP_X, y };
    }
    if (group.length > 0) y += GAP_Y;
  }

  return nodes;
}

const EDGE_STYLES: Record<string, { stroke: string; strokeDasharray?: string; animated?: boolean }> = {
  uses: { stroke: "#94a3b8" },
  depends_on: { stroke: "#3b82f6" },
  feeds_into: { stroke: "#22c55e" },
  blocks: { stroke: "#ef4444", animated: true },
  causes: { stroke: "#ef4444", strokeDasharray: "5 5" },
};

function generateFromData(
  processus: CartProcessusV2[],
  outils: CartOutilV2[],
  equipes: CartEquipeV2[],
  irritants: CartIrritantV2[],
  packResumes?: CartPackResume[]
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const getPackScore = (bloc: number) =>
    packResumes?.find((pr) => pr.bloc === bloc)?.score_maturite ?? undefined;

  for (const e of equipes) {
    nodes.push({
      id: `eq-${e.id}`,
      type: "team",
      data: { label: e.nom, maturityScore: getPackScore(4), description: e.mission },
      position: { x: 0, y: 0 },
    });
  }

  for (const p of processus) {
    nodes.push({
      id: `pr-${p.id}`,
      type: "process",
      data: { label: p.nom, maturityScore: getPackScore(6), description: p.description },
      position: { x: 0, y: 0 },
    });
  }

  for (const o of outils) {
    nodes.push({
      id: `ou-${o.id}`,
      type: "tool",
      data: { label: o.nom, maturityScore: o.niveau_usage ? o.niveau_usage : getPackScore(7), description: o.problemes },
      position: { x: 0, y: 0 },
    });
  }

  for (const i of irritants) {
    nodes.push({
      id: `ir-${i.id}`,
      type: "painpoint",
      data: { label: i.intitule, gravite: i.gravite, description: i.description || i.impact },
      position: { x: 0, y: 0 },
    });
  }

  // Generate edges
  const equipeNodes = nodes.filter((n) => n.type === "team");
  const processNodes = nodes.filter((n) => n.type === "process");
  const outilNodes = nodes.filter((n) => n.type === "tool");
  const irritantNodes = nodes.filter((n) => n.type === "painpoint");

  processNodes.forEach((pn, i) => {
    if (equipeNodes.length > 0) {
      edges.push({
        id: `e-eq-pr-${i}`,
        source: equipeNodes[i % equipeNodes.length].id,
        target: pn.id,
        type: "default",
        style: EDGE_STYLES.depends_on,
        label: "gere",
      });
    }
  });

  outilNodes.forEach((on, i) => {
    if (processNodes.length > 0) {
      edges.push({
        id: `e-pr-ou-${i}`,
        source: processNodes[i % processNodes.length].id,
        target: on.id,
        type: "default",
        style: EDGE_STYLES.uses,
        label: "utilise",
      });
    }
  });

  irritantNodes.forEach((irn, i) => {
    if (processNodes.length > 0) {
      edges.push({
        id: `e-pr-ir-${i}`,
        source: processNodes[i % processNodes.length].id,
        target: irn.id,
        type: "default",
        style: EDGE_STYLES.causes,
        label: "cause",
      });
    } else if (equipeNodes.length > 0) {
      edges.push({
        id: `e-eq-ir-${i}`,
        source: equipeNodes[i % equipeNodes.length].id,
        target: irn.id,
        type: "default",
        style: EDGE_STYLES.causes,
        label: "cause",
      });
    }
  });

  return { nodes: layoutNodes(nodes), edges };
}

function parseAiCartography(json: any): { nodes: Node[]; edges: Edge[] } {
  if (!json?.nodes || !json?.edges) return { nodes: [], edges: [] };

  const nodes: Node[] = json.nodes.map((n: any) => ({
    id: n.id,
    type: n.type === "equipe" ? "team" : n.type === "outil" ? "tool" : n.type === "irritant" ? "painpoint" : "process",
    data: { label: n.label, maturityScore: n.maturityScore, gravite: n.gravite, description: n.description },
    position: n.position || { x: 0, y: 0 },
  }));

  const edges: Edge[] = json.edges.map((e: any, i: number) => ({
    id: e.id || `ai-e-${i}`,
    source: e.source,
    target: e.target,
    style: EDGE_STYLES[e.type] || EDGE_STYLES.uses,
    label: e.label,
    animated: e.type === "blocks",
  }));

  const needsLayout = nodes.every((n: Node) => n.position.x === 0 && n.position.y === 0);
  return { nodes: needsLayout ? layoutNodes(nodes) : nodes, edges };
}

export function OrgMap({ processus, outils, equipes, irritants, packResumes, aiCartographyJson }: OrgMapProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (aiCartographyJson) {
      const result = parseAiCartography(aiCartographyJson);
      if (result.nodes.length > 0) return result;
    }
    return generateFromData(processus, outils, equipes, irritants, packResumes);
  }, [processus, outils, equipes, irritants, packResumes, aiCartographyJson]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const toggleType = (type: string) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const filteredNodes = nodes.filter((n) => !hiddenTypes.has(n.type || ""));
  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = edges.filter((e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));

  const handleExportPng = useCallback(() => {
    const el = document.querySelector(".react-flow") as HTMLElement;
    if (!el) return;
    toPng(el, { backgroundColor: "#ffffff", quality: 0.95 }).then((dataUrl) => {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "cartographie-organisationnelle.png";
      a.click();
    });
  }, []);

  const totalNodes = processus.length + outils.length + equipes.length + irritants.length;
  if (totalNodes === 0 && !aiCartographyJson) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground text-sm">
        Completez des packs pour voir la carte s'enrichir
      </div>
    );
  }

  const legendItems = [
    { type: "team", color: "bg-orange-400", label: "Equipes" },
    { type: "process", color: "bg-blue-400", label: "Processus" },
    { type: "tool", color: "bg-indigo-400", label: "Outils" },
    { type: "painpoint", color: "bg-red-400", label: "Irritants" },
  ];

  return (
    <div className="relative" style={{ height: 500 }}>
      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        snapToGrid
        snapGrid={[20, 20]}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Controls position="top-left" />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          nodeColor={(n) => {
            if (n.type === "team") return "#f97316";
            if (n.type === "tool") return "#6366f1";
            if (n.type === "painpoint") return "#ef4444";
            return "#3b82f6";
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />

        <Panel position="top-right">
          <div className="bg-white/90 backdrop-blur rounded-lg shadow-sm border p-2 space-y-1">
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={handleExportPng}>
              <Download className="w-3 h-3 mr-1" />
              Export PNG
            </Button>
            <div className="border-t pt-1 mt-1">
              {legendItems.map(({ type, color, label }) => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className="flex items-center gap-1.5 w-full px-1 py-0.5 text-xs hover:bg-muted rounded"
                >
                  {hiddenTypes.has(type) ? (
                    <EyeOff className="w-3 h-3 text-muted-foreground" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                  <div className={`w-2.5 h-2.5 rounded-full ${color} ${hiddenTypes.has(type) ? "opacity-30" : ""}`} />
                  <span className={hiddenTypes.has(type) ? "text-muted-foreground line-through" : ""}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          edges={edges}
          nodes={nodes}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
