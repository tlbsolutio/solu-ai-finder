import { useEffect, useRef } from "react";
import type { CartProcessusV2, CartOutilV2, CartEquipeV2, CartIrritantV2 } from "@/lib/cartTypes";

interface Props {
  processus: CartProcessusV2[];
  outils: CartOutilV2[];
  equipes: CartEquipeV2[];
  irritants: CartIrritantV2[];
}

interface Node {
  id: string;
  label: string;
  type: "processus" | "outil" | "equipe" | "irritant";
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  source: string;
  target: string;
}

export function OrgMiniMap({ processus, outils, equipes, irritants }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalNodes = processus.length + outils.length + equipes.length + irritants.length;

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    let cancelled = false;
    let simulation: any;

    async function render() {
      const d3 = await import("d3");
      if (cancelled || !svgRef.current || !containerRef.current) return;

      const width = containerRef.current.offsetWidth || 600;
      const height = 280;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
      svg.attr("width", width).attr("height", height);

      if (totalNodes === 0) return;

      const MAX_NODES = 30;

      const nodes: Node[] = [
        ...equipes.slice(0, 6).map((e) => ({ id: `eq-${e.id}`, label: e.nom, type: "equipe" as const })),
        ...processus.slice(0, 8).map((p) => ({ id: `pr-${p.id}`, label: p.nom, type: "processus" as const })),
        ...outils.slice(0, 8).map((o) => ({ id: `ou-${o.id}`, label: o.nom, type: "outil" as const })),
        ...irritants.slice(0, 8).map((i) => ({ id: `ir-${i.id}`, label: i.intitule, type: "irritant" as const })),
      ].slice(0, MAX_NODES);

      const links: Link[] = [];
      const equipeNodes = nodes.filter((n) => n.type === "equipe");
      const processusNodes = nodes.filter((n) => n.type === "processus");
      const outilNodes = nodes.filter((n) => n.type === "outil");
      const irritantNodes = nodes.filter((n) => n.type === "irritant");

      processusNodes.forEach((pn, i) => {
        if (equipeNodes.length > 0) {
          links.push({ source: equipeNodes[i % equipeNodes.length].id, target: pn.id });
        }
      });
      outilNodes.forEach((on, i) => {
        if (processusNodes.length > 0) {
          links.push({ source: processusNodes[i % processusNodes.length].id, target: on.id });
        }
      });
      irritantNodes.forEach((irn, i) => {
        if (processusNodes.length > 0) {
          links.push({ source: processusNodes[i % processusNodes.length].id, target: irn.id });
        } else if (equipeNodes.length > 0) {
          links.push({ source: equipeNodes[i % equipeNodes.length].id, target: irn.id });
        }
      });

      const nodeColors: Record<string, string> = {
        equipe: "#f97316",
        processus: "#3b82f6",
        outil: "#22c55e",
        irritant: "#ef4444",
      };

      const nodeRadius: Record<string, number> = {
        equipe: 12,
        processus: 10,
        outil: 9,
        irritant: 7,
      };

      const defs = svg.append("defs");
      defs.append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -3 6 6")
        .attr("refX", 14)
        .attr("refY", 0)
        .attr("markerWidth", 4)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-3L6,0L0,3")
        .attr("fill", "#94a3b8");

      const linkSel = svg.append("g")
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke", "#cbd5e1")
        .attr("stroke-width", 1)
        .attr("marker-end", "url(#arrow)");

      const nodeGroup = svg.append("g")
        .selectAll("g")
        .data(nodes)
        .enter()
        .append("g")
        .call(
          d3.drag<SVGGElement, Node>()
            .on("start", (event, d: any) => {
              if (!event.active) simulation.alphaTarget(0.3).restart();
              d.fx = d.x;
              d.fy = d.y;
            })
            .on("drag", (event, d: any) => {
              d.fx = event.x;
              d.fy = event.y;
            })
            .on("end", (event, d: any) => {
              if (!event.active) simulation.alphaTarget(0);
              d.fx = null;
              d.fy = null;
            }) as any
        );

      nodeGroup.append("circle")
        .attr("r", (d) => nodeRadius[d.type])
        .attr("fill", (d) => nodeColors[d.type])
        .attr("fill-opacity", 0.8)
        .attr("stroke", "white")
        .attr("stroke-width", 1.5);

      nodeGroup.append("text")
        .attr("dy", (d) => nodeRadius[d.type] + 10)
        .attr("text-anchor", "middle")
        .attr("font-size", 8)
        .attr("fill", "#64748b")
        .text((d) => d.label.length > 15 ? d.label.slice(0, 15) + "..." : d.label);

      simulation = d3.forceSimulation<Node>(nodes as any)
        .force("link", d3.forceLink(links as any).id((d: any) => d.id).distance(70))
        .force("charge", d3.forceManyBody().strength(-120))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide(20))
        .on("tick", () => {
          linkSel
            .attr("x1", (d: any) => d.source.x)
            .attr("y1", (d: any) => d.source.y)
            .attr("x2", (d: any) => d.target.x)
            .attr("y2", (d: any) => d.target.y);

          nodeGroup.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
        });
    }

    render();

    return () => {
      cancelled = true;
      if (simulation) simulation.stop();
    };
  }, [processus, outils, equipes, irritants]);

  if (totalNodes === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
        Completez des packs pour voir la carte s'enrichir
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div className="flex gap-4 mt-2 flex-wrap">
        {[
          { color: "#f97316", label: "Equipes" },
          { color: "#3b82f6", label: "Processus" },
          { color: "#22c55e", label: "Outils" },
          { color: "#ef4444", label: "Irritants" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
