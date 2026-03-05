import { useCallback, useEffect, useMemo, useState } from "react";
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
  MarkerType,
  ConnectionLineType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
// ELK loaded dynamically to keep main bundle small (~1.6MB)
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, EyeOff, Maximize2, LayoutGrid } from "lucide-react";
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

const NODE_WIDTH = 180;
const NODE_HEIGHT = 80;

let elkInstance: any = null;
async function getElk() {
  if (!elkInstance) {
    const ELK = (await import("elkjs/lib/elk.bundled.js")).default;
    elkInstance = new ELK();
  }
  return elkInstance;
}

async function elkLayout(nodes: Node[], edges: Edge[], direction = "RIGHT"): Promise<Node[]> {
  if (nodes.length === 0) return nodes;

  const graph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": direction,
      "elk.spacing.nodeNode": "60",
      "elk.layered.spacing.nodeNodeBetweenLayers": "100",
      "elk.layered.spacing.edgeNodeBetweenLayers": "50",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
      "elk.padding": "[top=60,left=60,bottom=60,right=60]",
      "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
    },
    children: nodes.map((n) => ({
      id: n.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  };

  try {
    const elk = await getElk();
    const laid = await elk.layout(graph);
    const posMap = new Map<string, { x: number; y: number }>();
    for (const child of laid.children || []) {
      posMap.set(child.id, { x: child.x || 0, y: child.y || 0 });
    }
    return nodes.map((n) => ({
      ...n,
      position: posMap.get(n.id) || n.position,
    }));
  } catch {
    return fallbackLayout(nodes);
  }
}

function fallbackLayout(nodes: Node[]): Node[] {
  const typeGroups: Record<string, Node[]> = {};
  for (const n of nodes) {
    const t = n.type || "process";
    if (!typeGroups[t]) typeGroups[t] = [];
    typeGroups[t].push(n);
  }
  const typeOrder = ["team", "process", "tool", "painpoint"];
  let y = 0;
  for (const type of typeOrder) {
    const group = typeGroups[type] || [];
    const startX = Math.max(0, (900 - group.length * 220) / 2);
    for (let i = 0; i < group.length; i++) {
      group[i].position = { x: startX + i * 220, y };
    }
    if (group.length > 0) y += 140;
  }
  return nodes;
}

const EDGE_COLORS: Record<string, string> = {
  uses: "#818cf8",       // indigo
  depends_on: "#60a5fa", // blue
  feeds_into: "#34d399", // green
  blocks: "#f87171",     // red
  causes: "#fb923c",     // orange
  default: "#94a3b8",    // slate
};

function buildEdgeStyle(type: string, animated?: boolean): Partial<Edge> {
  const color = EDGE_COLORS[type] || EDGE_COLORS.default;
  return {
    style: {
      stroke: color,
      strokeWidth: 2,
      ...(type === "causes" ? { strokeDasharray: "6 4" } : {}),
    },
    animated: animated || type === "blocks",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color,
      width: 16,
      height: 16,
    },
  };
}

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

  const equipeNodes = nodes.filter((n) => n.type === "team");
  const processNodes = nodes.filter((n) => n.type === "process");
  const outilNodes = nodes.filter((n) => n.type === "tool");
  const irritantNodes = nodes.filter((n) => n.type === "painpoint");

  // Equipe → Processus
  processNodes.forEach((pn, i) => {
    if (equipeNodes.length > 0) {
      const eq = equipeNodes[i % equipeNodes.length];
      edges.push({
        id: `e-eq-pr-${i}`,
        source: eq.id,
        target: pn.id,
        label: "gere",
        ...buildEdgeStyle("feeds_into"),
      });
    }
  });

  // Processus → Outil
  outilNodes.forEach((on, i) => {
    if (processNodes.length > 0) {
      const pr = processNodes[i % processNodes.length];
      edges.push({
        id: `e-pr-ou-${i}`,
        source: pr.id,
        target: on.id,
        label: "utilise",
        ...buildEdgeStyle("uses"),
      });
    }
  });

  // Irritant → Processus (blocks)
  irritantNodes.forEach((irn, i) => {
    if (processNodes.length > 0) {
      const pr = processNodes[i % processNodes.length];
      edges.push({
        id: `e-ir-pr-${i}`,
        source: irn.id,
        target: pr.id,
        label: "bloque",
        ...buildEdgeStyle("blocks"),
      });
    }
  });

  // Cross-link processus if > 1
  if (processNodes.length > 1) {
    for (let i = 0; i < processNodes.length - 1; i++) {
      edges.push({
        id: `e-pr-pr-${i}`,
        source: processNodes[i].id,
        target: processNodes[i + 1].id,
        label: "alimente",
        ...buildEdgeStyle("feeds_into"),
      });
    }
  }

  return { nodes, edges };
}

function parseAiCartography(json: any): { nodes: Node[]; edges: Edge[] } {
  if (!json?.nodes || !json?.edges) return { nodes: [], edges: [] };

  const nodes: Node[] = json.nodes.map((n: any) => ({
    id: n.id,
    type: n.type === "equipe" ? "team" : n.type === "outil" ? "tool" : n.type === "irritant" ? "painpoint" : "process",
    data: { label: n.label, maturityScore: n.maturityScore, gravite: n.gravite, description: n.description },
    position: { x: 0, y: 0 },
  }));

  const edges: Edge[] = json.edges.map((e: any, i: number) => ({
    id: e.id || `ai-e-${i}`,
    source: e.source,
    target: e.target,
    label: e.label,
    ...buildEdgeStyle(e.type || "default", e.animated),
  }));

  return { nodes, edges };
}

export function OrgMap({ processus, outils, equipes, irritants, packResumes, aiCartographyJson }: OrgMapProps) {
  const { nodes: rawNodes, edges: rawEdges } = useMemo(() => {
    if (aiCartographyJson) {
      const result = parseAiCartography(aiCartographyJson);
      if (result.nodes.length > 0) return result;
    }
    return generateFromData(processus, outils, equipes, irritants, packResumes);
  }, [processus, outils, equipes, irritants, packResumes, aiCartographyJson]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rawNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rawEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());
  const [layoutDone, setLayoutDone] = useState(false);

  // Apply ELK layout
  useEffect(() => {
    if (rawNodes.length === 0) return;
    setLayoutDone(false);
    elkLayout(rawNodes, rawEdges).then((laidOut) => {
      setNodes(laidOut);
      setEdges(rawEdges);
      setLayoutDone(true);
    });
  }, [rawNodes, rawEdges]);

  // Hover highlighting: dim non-connected nodes/edges
  const connectedNodeIds = useMemo(() => {
    if (!hoveredNode) return null;
    const ids = new Set<string>([hoveredNode]);
    for (const e of edges) {
      if (e.source === hoveredNode) ids.add(e.target);
      if (e.target === hoveredNode) ids.add(e.source);
    }
    return ids;
  }, [hoveredNode, edges]);

  const displayNodes = useMemo(() => {
    if (!connectedNodeIds) return nodes;
    return nodes.map((n) => ({
      ...n,
      style: {
        ...n.style,
        opacity: connectedNodeIds.has(n.id) ? 1 : 0.2,
        transition: "opacity 0.2s ease",
      },
    }));
  }, [nodes, connectedNodeIds]);

  const displayEdges = useMemo(() => {
    if (!connectedNodeIds) return edges;
    return edges.map((e) => ({
      ...e,
      style: {
        ...e.style,
        opacity: connectedNodeIds.has(e.source) && connectedNodeIds.has(e.target) ? 1 : 0.1,
        transition: "opacity 0.2s ease",
      },
    }));
  }, [edges, connectedNodeIds]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onNodeMouseEnter = useCallback((_: React.MouseEvent, node: Node) => {
    setHoveredNode(node.id);
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, []);

  const toggleType = (type: string) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const filteredNodes = displayNodes.filter((n) => !hiddenTypes.has(n.type || ""));
  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = displayEdges.filter((e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));

  const handleExportPng = useCallback(() => {
    const el = document.querySelector(".react-flow") as HTMLElement;
    if (!el) return;
    toPng(el, { backgroundColor: "#0f172a", quality: 0.95 }).then((dataUrl) => {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "cartographie-organisationnelle.png";
      a.click();
    });
  }, []);

  const handleReLayout = useCallback(async () => {
    const laidOut = await elkLayout(nodes, edges);
    setNodes(laidOut);
  }, [nodes, edges]);

  const totalNodes = processus.length + outils.length + equipes.length + irritants.length;
  if (totalNodes === 0 && !aiCartographyJson) {
    return (
      <div className="h-[500px] flex items-center justify-center text-muted-foreground text-sm bg-slate-950 rounded-lg">
        <div className="text-center space-y-2">
          <LayoutGrid className="w-8 h-8 mx-auto text-slate-600" />
          <p>Completez des packs pour voir la carte s'enrichir</p>
        </div>
      </div>
    );
  }

  const legendItems = [
    { type: "team", color: "bg-orange-500", label: "Equipes", count: equipes.length },
    { type: "process", color: "bg-blue-500", label: "Processus", count: processus.length },
    { type: "tool", color: "bg-indigo-500", label: "Outils", count: outils.length },
    { type: "painpoint", color: "bg-red-500", label: "Irritants", count: irritants.length },
  ];

  // Dynamic height based on node count
  const mapHeight = Math.max(500, Math.min(800, 400 + filteredNodes.length * 8));

  return (
    <div className="relative rounded-lg overflow-hidden" style={{ height: mapHeight }}>
      {!layoutDone && (
        <div className="absolute inset-0 z-50 bg-slate-950 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-400">Calcul du layout...</p>
          </div>
        </div>
      )}
      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        snapToGrid
        snapGrid={[20, 20]}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1.2 }}
        minZoom={0.2}
        maxZoom={2.5}
        style={{ background: "#0f172a" }}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { strokeWidth: 2 },
        }}
      >
        <Controls
          position="top-left"
          className="!bg-slate-800 !border-slate-700 !shadow-lg [&>button]:!bg-slate-800 [&>button]:!border-slate-700 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-700"
        />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="!bg-slate-900 !border-slate-700"
          maskColor="rgba(15, 23, 42, 0.7)"
          nodeColor={(n) => {
            if (n.type === "team") return "#f97316";
            if (n.type === "tool") return "#6366f1";
            if (n.type === "painpoint") return "#ef4444";
            return "#3b82f6";
          }}
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#334155"
        />

        {/* Top-right: Legend + Controls */}
        <Panel position="top-right">
          <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-3 space-y-2 min-w-[160px]">
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700/50 h-7"
                onClick={handleExportPng}
              >
                <Download className="w-3 h-3 mr-1" />
                PNG
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700/50 h-7"
                onClick={handleReLayout}
              >
                <Maximize2 className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </div>

            <div className="border-t border-slate-700/50 pt-2 space-y-0.5">
              {legendItems.map(({ type, color, label, count }) => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className="flex items-center gap-2 w-full px-2 py-1 text-xs rounded-md hover:bg-slate-800 transition-colors"
                >
                  {hiddenTypes.has(type) ? (
                    <EyeOff className="w-3 h-3 text-slate-500" />
                  ) : (
                    <Eye className="w-3 h-3 text-slate-400" />
                  )}
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${color} ${hiddenTypes.has(type) ? "opacity-20" : ""}`}
                  />
                  <span className={`flex-1 text-left ${hiddenTypes.has(type) ? "text-slate-600 line-through" : "text-slate-300"}`}>
                    {label}
                  </span>
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-slate-600 text-slate-400">
                    {count}
                  </Badge>
                </button>
              ))}
            </div>

            <div className="border-t border-slate-700/50 pt-2">
              <p className="text-[10px] text-slate-500 text-center">
                {filteredNodes.length} noeuds • {filteredEdges.length} liens
              </p>
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
