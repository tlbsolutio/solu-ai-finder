import { useState, useCallback } from "react";
// jsPDF + autotable loaded dynamically — only needed on export click
async function loadJsPDF() {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  return { jsPDF, autoTable };
}
import type {
  CartSessionV2, CartPackResume, CartProcessusV2, CartOutilV2,
  CartEquipeV2, CartIrritantV2, CartTacheV2, CartQuickwinV2,
} from "@/lib/cartTypes";

export interface CartDataForPdf {
  session: CartSessionV2;
  packResumes: CartPackResume[];
  processus: CartProcessusV2[];
  outils: CartOutilV2[];
  equipes: CartEquipeV2[];
  irritants: CartIrritantV2[];
  taches: CartTacheV2[];
  quickwins: CartQuickwinV2[];
}

// ─── Solutio Brand System ───────────────────────────────────────────
const C = {
  blue:      [59, 130, 246] as [number, number, number],    // #3B82F6 — primary
  blueLight: [96, 165, 250] as [number, number, number],    // #60A5FA
  blueDark:  [30, 109, 209] as [number, number, number],    // #1E6DD1
  navy:      [2, 6, 23]     as [number, number, number],    // #020617 — footer/dark
  text:      [52, 66, 86]   as [number, number, number],    // #344256
  textMuted: [100, 116, 139] as [number, number, number],   // #64748B
  white:     [255, 255, 255] as [number, number, number],
  bg:        [240, 244, 255] as [number, number, number],   // #F0F4FF — muted
  bgLight:   [248, 250, 252] as [number, number, number],   // #F8FAFC
  border:    [197, 212, 232] as [number, number, number],   // #C5D4E8
  red:       [220, 38, 38]   as [number, number, number],
  orange:    [234, 88, 12]   as [number, number, number],
  green:     [22, 163, 74]   as [number, number, number],
  amber:     [161, 98, 7]    as [number, number, number],
  purple:    [124, 58, 237]  as [number, number, number],
};

const PACK_NAMES: Record<number, string> = {
  1: "Contexte & Strategie", 2: "Clients & Marche", 3: "Organisation",
  4: "Ressources Humaines", 5: "Communication", 6: "Operations",
  7: "Systemes d'Information", 8: "Communication Interne",
  9: "Qualite & Conformite", 10: "KPIs & Pilotage",
};

const PAGE_W = 210;
const PAGE_H = 297;
const ML = 22; // left margin
const MR = 18; // right margin
const CONTENT_W = PAGE_W - ML - MR;

// ─── Drawing helpers ────────────────────────────────────────────────

/** Thin blue accent stripe on the left of every content page */
function drawPageChrome(doc: jsPDF) {
  // Left accent bar
  doc.setFillColor(...C.blue);
  doc.rect(0, 0, 4, PAGE_H, "F");
  // Top thin line
  doc.setFillColor(...C.blue);
  doc.rect(0, 0, PAGE_W, 1.2, "F");
}

function addPageFooter(doc: jsPDF, pageNum: number, totalPages: number, sessionName: string) {
  // Footer separator
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(ML, PAGE_H - 16, PAGE_W - MR, PAGE_H - 16);
  // Left: brand
  doc.setFontSize(7);
  doc.setTextColor(...C.blue);
  doc.setFont("helvetica", "bold");
  doc.text("SOLUTIO", ML, PAGE_H - 10);
  doc.setTextColor(...C.textMuted);
  doc.setFont("helvetica", "normal");
  doc.text(" CARTO", ML + doc.getTextWidth("SOLUTIO"), PAGE_H - 10);
  // Center: session name (truncated)
  const truncName = sessionName.length > 40 ? sessionName.slice(0, 40) + "..." : sessionName;
  doc.setFontSize(6);
  doc.setTextColor(...C.textMuted);
  doc.text(truncName, PAGE_W / 2, PAGE_H - 10, { align: "center" });
  // Right: page number
  doc.setFontSize(7);
  doc.setTextColor(...C.text);
  doc.setFont("helvetica", "bold");
  doc.text(`${pageNum}`, PAGE_W - MR, PAGE_H - 10, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.textMuted);
  doc.text(` / ${totalPages}`, PAGE_W - MR + doc.getTextWidth(` / ${totalPages}`) - doc.getTextWidth(` / ${totalPages}`), PAGE_H - 10);
  // Simpler page num
  doc.setFontSize(7);
  doc.setTextColor(...C.textMuted);
  doc.text(`${pageNum} / ${totalPages}`, PAGE_W - MR, PAGE_H - 10, { align: "right" });
}

function drawSectionHeader(doc: jsPDF, y: number, title: string, accent: [number, number, number] = C.blue): number {
  // Accent left bar + navy background
  doc.setFillColor(...C.navy);
  doc.roundedRect(ML, y, CONTENT_W, 11, 1.5, 1.5, "F");
  doc.setFillColor(...accent);
  doc.rect(ML, y, 3.5, 11, "F");
  // Title text
  doc.setFontSize(9.5);
  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), ML + 8, y + 7.5);
  return y + 17;
}

function drawSubHeader(doc: jsPDF, y: number, title: string): number {
  doc.setFillColor(...C.bg);
  doc.rect(ML, y, CONTENT_W, 8, "F");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.blue);
  doc.setFont("helvetica", "bold");
  doc.text("— " + title.toUpperCase(), ML + 4, y + 5.5);
  return y + 12;
}

function drawMetricCard(doc: jsPDF, x: number, y: number, w: number, label: string, value: string, accent: [number, number, number]) {
  // Card bg
  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, 24, 2, 2, "FD");
  // Left accent
  doc.setFillColor(...accent);
  doc.rect(x, y + 2, 2.5, 20, "F");
  // Value
  doc.setFontSize(18);
  doc.setTextColor(...C.navy);
  doc.setFont("helvetica", "bold");
  doc.text(value, x + 9, y + 12);
  // Label
  doc.setFontSize(6.5);
  doc.setTextColor(...C.textMuted);
  doc.setFont("helvetica", "normal");
  doc.text(label.toUpperCase(), x + 9, y + 19);
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - 22) {
    doc.addPage();
    drawPageChrome(doc);
    return 16;
  }
  return y;
}

function normalizeAiText(raw: unknown): string {
  if (!raw) return "";
  let text = "";
  if (typeof raw === "string") {
    text = raw;
  } else if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.content === "string") text = obj.content;
    else text = JSON.stringify(raw, null, 2);
  } else {
    text = String(raw);
  }
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/\u2013/g, "-")
    .replace(/\u2014/g, " - ")
    .replace(/\u2022/g, "- ")
    .replace(/\u00A0/g, " ")
    .replace(/[\u2192\u2794\u27A1]/g, "->")
    .replace(/[\u2713\u2714]/g, "[x]")
    .replace(/[\u2717\u2718]/g, "[ ]");
}

function drawWrappedText(doc: jsPDF, text: string, x: number, y: number, maxW: number, lineH: number = 4.5): number {
  if (!text) return y;
  const clean = text
    .replace(/\*\*/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\n{3,}/g, "\n\n");

  const paragraphs = clean.split(/\n\n+/);
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    const isNumbered = /^\d+[.)]\s/.test(trimmed);
    const isBullet = /^[-*]\s/.test(trimmed);

    if (isNumbered || isBullet) {
      doc.setFont("helvetica", "bold");
    }

    const lines = doc.splitTextToSize(trimmed, maxW);
    for (let i = 0; i < lines.length; i++) {
      y = ensureSpace(doc, y, lineH + 2);
      if (y < 20) y = 16;
      doc.text(lines[i], x, y);
      y += lineH;
      if (i === 0 && (isNumbered || isBullet)) {
        doc.setFont("helvetica", "normal");
      }
    }
    y += 1.5;
  }
  return y;
}

function drawRadarChart(doc: jsPDF, cx: number, cy: number, radius: number, scores: Record<number, number | null>) {
  const numAxes = 10;
  const levels = 5;

  const getPoint = (axis: number, value: number): [number, number] => {
    const angle = (Math.PI * 2 * axis) / numAxes - Math.PI / 2;
    const r = (value / levels) * radius;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  // Grid rings
  for (let lvl = 1; lvl <= levels; lvl++) {
    doc.setDrawColor(...(lvl === levels ? C.border : C.bgLight));
    doc.setLineWidth(lvl === levels ? 0.3 : 0.15);
    const pts = Array.from({ length: numAxes }, (_, i) => getPoint(i, lvl));
    for (let i = 0; i < pts.length; i++) {
      const next = pts[(i + 1) % pts.length];
      doc.line(pts[i][0], pts[i][1], next[0], next[1]);
    }
  }

  // Axis lines
  for (let i = 0; i < numAxes; i++) {
    const [x, y] = getPoint(i, levels);
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.12);
    doc.line(cx, cy, x, y);
  }

  // Data polygon outline
  const validEntries = Object.entries(scores).filter(([, v]) => v !== null && v !== undefined);
  if (validEntries.length > 0) {
    const fillPts = Array.from({ length: numAxes }, (_, i) => {
      const s = scores[i + 1];
      return getPoint(i, s ?? 0);
    });

    // Polygon border
    doc.setDrawColor(...C.blue);
    doc.setLineWidth(1);
    for (let i = 0; i < fillPts.length; i++) {
      const next = fillPts[(i + 1) % fillPts.length];
      doc.line(fillPts[i][0], fillPts[i][1], next[0], next[1]);
    }

    // Data dots
    for (let i = 0; i < numAxes; i++) {
      const s = scores[i + 1];
      if (s !== null && s !== undefined) {
        const [px, py] = getPoint(i, s);
        doc.setFillColor(...C.blue);
        doc.circle(px, py, 1.5, "F");
      }
    }
  }

  // Axis labels
  for (let i = 0; i < numAxes; i++) {
    const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
    const labelR = radius + 9;
    const lx = cx + labelR * Math.cos(angle);
    const ly = cy + labelR * Math.sin(angle);
    doc.setFontSize(5.5);
    doc.setTextColor(...C.text);
    doc.setFont("helvetica", "normal");
    doc.text(PACK_NAMES[i + 1] || "", lx, ly, { align: "center" });
  }

  // Center score circle
  const validScores = Object.values(scores).filter((s): s is number => s !== null && s !== undefined);
  if (validScores.length > 0) {
    const avg = (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1);
    doc.setFillColor(...C.blue);
    doc.circle(cx, cy, 8, "F");
    doc.setFontSize(10);
    doc.setTextColor(...C.white);
    doc.setFont("helvetica", "bold");
    doc.text(avg, cx, cy, { align: "center" });
    doc.setFontSize(5);
    doc.text("/5", cx, cy + 4, { align: "center" });
  }
}

/** Draw simplified CartoLogo (shield + network) */
function drawCartoLogo(doc: jsPDF, cx: number, cy: number, size: number) {
  const s = size / 56; // scale factor from viewBox 56
  doc.setDrawColor(...C.white);
  doc.setLineWidth(1.2 * s);
  // Outer circle
  doc.circle(cx, cy, 26 * s);
  // Inner circle
  doc.setLineWidth(0.8 * s);
  doc.circle(cx, cy, 21.5 * s);
  // Boss
  doc.setLineWidth(1 * s);
  doc.circle(cx, cy, 4 * s);
  doc.setFillColor(...C.white);
  doc.circle(cx, cy, 1.5 * s, "F");
  // Nodes (offset from center)
  const nodes = [
    [-9, -15], [12, -11], [-15, 5], [14, 8], [5, 16],
  ];
  // Connections (edges between node indices)
  const edges = [[0,1],[0,2],[1,3],[2,4],[3,4]];
  doc.setLineWidth(0.7 * s);
  for (const [a, b] of edges) {
    doc.line(cx + nodes[a][0]*s, cy + nodes[a][1]*s, cx + nodes[b][0]*s, cy + nodes[b][1]*s);
  }
  // Spokes to center
  for (const [nx, ny] of nodes) {
    doc.setLineWidth(0.6 * s);
    doc.line(cx + nx*s, cy + ny*s, cx, cy);
  }
  // Node dots
  for (const [nx, ny] of nodes) {
    doc.setFillColor(...C.white);
    doc.circle(cx + nx*s, cy + ny*s, 2.3 * s, "F");
  }
}

// ─── Main export ────────────────────────────────────────────────────

export function useCartPdfExport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");

  const generatePdf = useCallback(async (data: CartDataForPdf) => {
    setIsLoading(true);
    setError(null);
    setProgress("Preparation du document...");

    try {
      const { jsPDF, autoTable } = await loadJsPDF();
      const { session, packResumes, processus, outils, equipes, irritants, taches, quickwins } = data;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

      // ═══════════ COVER PAGE ═══════════════════════════════════════
      doc.setFillColor(...C.navy);
      doc.rect(0, 0, PAGE_W, PAGE_H, "F");

      // Left accent stripe
      doc.setFillColor(...C.blue);
      doc.rect(0, 0, 5, PAGE_H, "F");

      // Subtle blue gradient circle (decorative)
      doc.setFillColor(...C.blue);
      doc.setGState(doc.GState({ opacity: 0.04 }));
      doc.circle(165, 55, 70, "F");
      doc.circle(45, 240, 45, "F");
      doc.setGState(doc.GState({ opacity: 1 }));

      // Top bar with brand + logo
      doc.setFillColor(...C.blue);
      doc.rect(0, 0, PAGE_W, 1.5, "F");

      // Draw shield logo
      drawCartoLogo(doc, 45, 50, 40);

      // Brand text next to logo
      doc.setFontSize(11);
      doc.setTextColor(...C.white);
      doc.setFont("helvetica", "bold");
      doc.text("SOLUTIO", 70, 47);
      doc.setFontSize(8);
      doc.setTextColor(...C.blueLight);
      doc.setFont("helvetica", "normal");
      doc.text("CARTO", 70, 54);

      // Divider line
      doc.setDrawColor(...C.blue);
      doc.setLineWidth(0.5);
      doc.line(ML + 8, 72, PAGE_W - MR - 8, 72);

      // Main title
      doc.setFontSize(34);
      doc.setTextColor(...C.white);
      doc.setFont("helvetica", "bold");
      doc.text("Rapport de", ML + 8, 98);
      doc.text("Cartographie", ML + 8, 113);
      doc.setTextColor(...C.blue);
      doc.text("Organisationnelle", ML + 8, 128);

      // Session name
      doc.setFontSize(13);
      doc.setTextColor(...C.blueLight);
      doc.setFont("helvetica", "normal");
      const sessionName = session.nom.length > 55 ? session.nom.slice(0, 55) + "..." : session.nom;
      doc.text(sessionName, ML + 8, 148);

      // Date
      doc.setFontSize(10);
      doc.setTextColor(...C.textMuted);
      doc.text(date, ML + 8, 160);

      // Stats bar
      const statsY = 200;
      doc.setFillColor(15, 23, 42); // slightly lighter navy
      doc.setDrawColor(...C.blue);
      doc.setLineWidth(0.5);
      doc.roundedRect(ML + 8, statsY, CONTENT_W - 16, 34, 3, 3, "FD");

      const stats = [
        { label: "PACKS", value: `${session.packs_completed}/10` },
        { label: "PROCESSUS", value: `${processus.length}` },
        { label: "OUTILS", value: `${outils.length}` },
        { label: "IRRITANTS", value: `${irritants.length}` },
        { label: "QUICK WINS", value: `${quickwins.length}` },
      ];
      const statW = (CONTENT_W - 16) / stats.length;
      stats.forEach((s, i) => {
        const sx = ML + 8 + i * statW + statW / 2;
        doc.setFontSize(18);
        doc.setTextColor(...C.blue);
        doc.setFont("helvetica", "bold");
        doc.text(s.value, sx, statsY + 15, { align: "center" });
        doc.setFontSize(6);
        doc.setTextColor(...C.textMuted);
        doc.setFont("helvetica", "normal");
        doc.text(s.label, sx, statsY + 24, { align: "center" });
      });

      // Bottom tagline
      doc.setFontSize(8);
      doc.setTextColor(...C.textMuted);
      doc.setFont("helvetica", "normal");
      doc.text("solutio.work  |  Transformation Digitale & Cartographie Organisationnelle", PAGE_W / 2, PAGE_H - 20, { align: "center" });

      setProgress("Page de couverture..."); await new Promise(r => setTimeout(r, 0));
      // ═══════════ PAGE 2: SYNTHESE ═════════════════════════════════
      doc.addPage();
      drawPageChrome(doc);
      let y = 16;

      y = drawSectionHeader(doc, y, "Synthese & Maturite Organisationnelle");

      // Radar scores
      const radarScores: Record<number, number | null> = {};
      for (let i = 1; i <= 10; i++) {
        const pr = packResumes.find((r) => r.bloc === i);
        radarScores[i] = pr?.score_maturite ?? null;
      }

      // Radar left
      drawRadarChart(doc, ML + 44, y + 44, 32, radarScores);

      // Metrics right
      const mx = ML + 98;
      const cw = 34;
      drawMetricCard(doc, mx, y + 4, cw, "Processus", processus.length.toString(), C.blue);
      drawMetricCard(doc, mx + cw + 3, y + 4, cw, "Outils & SI", outils.length.toString(), C.green);
      drawMetricCard(doc, mx, y + 33, cw, "Equipes", equipes.length.toString(), C.orange);
      drawMetricCard(doc, mx + cw + 3, y + 33, cw, "Irritants", irritants.length.toString(), C.red);
      drawMetricCard(doc, mx, y + 62, cw, "Quick Wins", quickwins.length.toString(), C.amber);
      drawMetricCard(doc, mx + cw + 3, y + 62, cw, "Taches manuelles", taches.length.toString(), C.purple);

      y += 95;

      // Pack scores table
      y = drawSectionHeader(doc, y, "Scores par Pack");
      const packRows = packResumes
        .sort((a, b) => a.bloc - b.bloc)
        .map((pr) => {
          const score = pr.score_maturite ?? 0;
          const bar = "\u2588".repeat(Math.round(score)) + "\u2591".repeat(5 - Math.round(score));
          return [
            `${pr.bloc}`,
            PACK_NAMES[pr.bloc] || "",
            `${score.toFixed(1)}/5`,
            bar,
            pr.resume ? (pr.resume.length > 70 ? pr.resume.slice(0, 70) + "..." : pr.resume) : "-",
          ];
        });

      autoTable(doc, {
        startY: y,
        head: [["#", "Pack", "Score", "", "Resume"]],
        body: packRows,
        margin: { left: ML, right: MR },
        styles: { fontSize: 7, cellPadding: 2.5, textColor: C.text, lineColor: C.border, lineWidth: 0.1 },
        headStyles: { fillColor: C.navy, textColor: C.white, fontStyle: "bold", fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 8, halign: "center", fontStyle: "bold" },
          1: { cellWidth: 32 },
          2: { cellWidth: 16, halign: "center", fontStyle: "bold", textColor: C.blue },
          3: { cellWidth: 14, halign: "center", textColor: C.blue },
          4: { cellWidth: "auto" },
        },
        alternateRowStyles: { fillColor: [240, 244, 255] },
      });

      y = (doc as any).lastAutoTable?.finalY + 8 || y + 60;

      // ═══════════ RESUME EXECUTIF ══════════════════════════════════
      const resumeText = normalizeAiText(session.ai_resume_executif);
      if (resumeText) {
        y = ensureSpace(doc, y, 40);
        if (y < 20) y = 16;
        y = drawSectionHeader(doc, y, "Resume Executif");
        doc.setFontSize(8);
        doc.setTextColor(...C.text);
        doc.setFont("helvetica", "normal");
        y = drawWrappedText(doc, resumeText, ML + 2, y + 2, CONTENT_W - 4);
        y += 6;
      }

      // ═══════════ FORCES ═══════════════════════════════════════════
      const forcesText = normalizeAiText(session.ai_forces);
      if (forcesText) {
        y = ensureSpace(doc, y, 40);
        if (y < 20) y = 16;
        y = drawSectionHeader(doc, y, "Forces Identifiees", C.green);
        doc.setFontSize(8);
        doc.setTextColor(...C.text);
        doc.setFont("helvetica", "normal");
        y = drawWrappedText(doc, forcesText, ML + 2, y + 2, CONTENT_W - 4);
        y += 6;
      }

      // ═══════════ DYSFONCTIONNEMENTS ═══════════════════════════════
      const dysText = normalizeAiText(session.ai_dysfonctionnements);
      if (dysText) {
        y = ensureSpace(doc, y, 40);
        if (y < 20) y = 16;
        y = drawSectionHeader(doc, y, "Dysfonctionnements Majeurs", C.red);
        doc.setFontSize(8);
        doc.setTextColor(...C.text);
        doc.setFont("helvetica", "normal");
        y = drawWrappedText(doc, dysText, ML + 2, y + 2, CONTENT_W - 4);
        y += 6;
      }

      setProgress("Synthese et diagnostic..."); await new Promise(r => setTimeout(r, 0));
      // ═══════════ PROCESSUS ════════════════════════════════════════
      if (processus.length > 0) {
        doc.addPage();
        drawPageChrome(doc);
        y = 16;
        y = drawSectionHeader(doc, y, `Processus Detectes (${processus.length})`, C.blue);

        const procRows = processus.map((p) => {
          const crit = p.niveau_criticite === "High" ? "Critique" : p.niveau_criticite === "Medium" ? "Moyen" : "Faible";
          return [p.nom, p.type || "-", crit, p.description ? (p.description.length > 55 ? p.description.slice(0, 55) + "..." : p.description) : "-"];
        });

        autoTable(doc, {
          startY: y,
          head: [["Processus", "Type", "Criticite", "Description"]],
          body: procRows,
          margin: { left: ML, right: MR },
          styles: { fontSize: 7, cellPadding: 2.5, textColor: C.text, lineColor: C.border, lineWidth: 0.1 },
          headStyles: { fillColor: C.blue, textColor: C.white, fontStyle: "bold" },
          columnStyles: { 0: { fontStyle: "bold", cellWidth: 38 }, 1: { cellWidth: 24 }, 2: { cellWidth: 18 } },
          alternateRowStyles: { fillColor: [239, 246, 255] },
          didParseCell: (data) => {
            if (data.column.index === 2 && data.section === "body") {
              const val = data.cell.raw as string;
              if (val === "Critique") data.cell.styles.textColor = C.red;
              else if (val === "Moyen") data.cell.styles.textColor = C.orange;
              else data.cell.styles.textColor = C.green;
              data.cell.styles.fontStyle = "bold";
            }
          },
        });
        y = (doc as any).lastAutoTable?.finalY + 8 || y + 40;
      }

      // ═══════════ OUTILS ═══════════════════════════════════════════
      if (outils.length > 0) {
        y = ensureSpace(doc, y, 30);
        if (y < 20) y = 16;
        y = drawSectionHeader(doc, y, `Outils & Systemes d'Information (${outils.length})`, C.green);

        const outilRows = outils.map((o) => [
          o.nom,
          o.type_outil || "-",
          o.niveau_usage ? `${o.niveau_usage}/5` : "-",
          o.problemes || "-",
        ]);

        autoTable(doc, {
          startY: y,
          head: [["Outil", "Type", "Usage", "Problemes"]],
          body: outilRows,
          margin: { left: ML, right: MR },
          styles: { fontSize: 7, cellPadding: 2.5, textColor: C.text, lineColor: C.border, lineWidth: 0.1 },
          headStyles: { fillColor: C.green, textColor: C.white, fontStyle: "bold" },
          columnStyles: { 0: { fontStyle: "bold", cellWidth: 34 }, 1: { cellWidth: 24 }, 2: { cellWidth: 18 } },
          alternateRowStyles: { fillColor: [240, 253, 244] },
        });
        y = (doc as any).lastAutoTable?.finalY + 8 || y + 40;
      }

      // ═══════════ EQUIPES ══════════════════════════════════════════
      if (equipes.length > 0) {
        y = ensureSpace(doc, y, 30);
        if (y < 20) y = 16;
        y = drawSectionHeader(doc, y, `Equipes (${equipes.length})`, C.orange);

        const eqRows = equipes.map((e) => [
          e.nom,
          e.mission || "-",
          e.charge_estimee ? `${e.charge_estimee}/5` : "-",
        ]);

        autoTable(doc, {
          startY: y,
          head: [["Equipe", "Mission", "Charge"]],
          body: eqRows,
          margin: { left: ML, right: MR },
          styles: { fontSize: 7, cellPadding: 2.5, textColor: C.text, lineColor: C.border, lineWidth: 0.1 },
          headStyles: { fillColor: C.orange, textColor: C.white, fontStyle: "bold" },
          columnStyles: { 0: { fontStyle: "bold", cellWidth: 35 }, 2: { cellWidth: 15, halign: "center" } },
          alternateRowStyles: { fillColor: [255, 247, 237] },
        });
        y = (doc as any).lastAutoTable?.finalY + 8 || y + 40;
      }

      // ═══════════ IRRITANTS ════════════════════════════════════════
      if (irritants.length > 0) {
        y = ensureSpace(doc, y, 30);
        if (y < 20) y = 16;
        y = drawSectionHeader(doc, y, `Irritants & Risques (${irritants.length})`, C.red);

        const sorted = [...irritants].sort((a, b) => (b.gravite || 0) - (a.gravite || 0));
        const irrRows = sorted.map((ir) => [
          ir.intitule,
          ir.type || "-",
          ir.gravite ? `${ir.gravite}/5` : "-",
          ir.impact || "-",
        ]);

        autoTable(doc, {
          startY: y,
          head: [["Irritant", "Type", "Gravite", "Impact"]],
          body: irrRows,
          margin: { left: ML, right: MR },
          styles: { fontSize: 7, cellPadding: 2.5, textColor: C.text, lineColor: C.border, lineWidth: 0.1 },
          headStyles: { fillColor: C.red, textColor: C.white, fontStyle: "bold" },
          columnStyles: { 0: { fontStyle: "bold", cellWidth: 42 }, 1: { cellWidth: 20 }, 2: { cellWidth: 15, halign: "center" } },
          alternateRowStyles: { fillColor: [254, 242, 242] },
          didParseCell: (data) => {
            if (data.column.index === 2 && data.section === "body") {
              const raw = String(data.cell.raw);
              const num = parseInt(raw);
              if (num >= 4) data.cell.styles.textColor = C.red;
              else if (num >= 3) data.cell.styles.textColor = C.orange;
              data.cell.styles.fontStyle = "bold";
            }
          },
        });
        y = (doc as any).lastAutoTable?.finalY + 8 || y + 40;
      }

      setProgress("Entites et irritants..."); await new Promise(r => setTimeout(r, 0));
      // ═══════════ QUICK WINS ═══════════════════════════════════════
      if (quickwins.length > 0) {
        doc.addPage();
        drawPageChrome(doc);
        y = 16;
        y = drawSectionHeader(doc, y, `Quick Wins & Actions Rapides (${quickwins.length})`, C.amber);

        const sortedQw = [...quickwins].sort((a, b) => {
          const order: Record<string, number> = { P1: 0, P2: 1, P3: 2 };
          return (order[a.priorite_calculee || "P3"] ?? 3) - (order[b.priorite_calculee || "P3"] ?? 3);
        });

        const qwRows = sortedQw.map((qw) => [
          qw.priorite_calculee || "P3",
          qw.intitule,
          qw.impact || "-",
          qw.effort || "-",
          qw.categorie || "-",
        ]);

        autoTable(doc, {
          startY: y,
          head: [["Priorite", "Action", "Impact", "Effort", "Categorie"]],
          body: qwRows,
          margin: { left: ML, right: MR },
          styles: { fontSize: 7, cellPadding: 2.5, textColor: C.text, lineColor: C.border, lineWidth: 0.1 },
          headStyles: { fillColor: C.amber, textColor: C.white, fontStyle: "bold" },
          columnStyles: { 0: { cellWidth: 14, halign: "center", fontStyle: "bold" }, 2: { cellWidth: 18 }, 3: { cellWidth: 18 }, 4: { cellWidth: 26 } },
          alternateRowStyles: { fillColor: [254, 252, 232] },
          didParseCell: (data) => {
            if (data.column.index === 0 && data.section === "body") {
              const val = data.cell.raw as string;
              if (val === "P1") data.cell.styles.textColor = C.red;
              else if (val === "P2") data.cell.styles.textColor = C.orange;
              else data.cell.styles.textColor = C.textMuted;
            }
          },
        });
        y = (doc as any).lastAutoTable?.finalY + 8 || y + 40;
      }

      setProgress("Quick wins et plan d'actions..."); await new Promise(r => setTimeout(r, 0));
      // ═══════════ ANALYSE TRANSVERSALE ═════════════════════════════
      const analyseTransText = normalizeAiText(session.ai_analyse_transversale);
      if (analyseTransText) {
        doc.addPage();
        drawPageChrome(doc);
        y = 16;
        y = drawSectionHeader(doc, y, "Analyse Transversale", C.purple);
        doc.setFontSize(8);
        doc.setTextColor(...C.text);
        doc.setFont("helvetica", "normal");
        y = drawWrappedText(doc, analyseTransText, ML + 2, y + 2, CONTENT_W - 4);
        y += 6;
      }

      // ═══════════ PLAN D'OPTIMISATION ══════════════════════════════
      const planText = normalizeAiText(session.ai_plan_optimisation);
      if (planText) {
        y = ensureSpace(doc, y, 40);
        if (y < 20) { doc.addPage(); drawPageChrome(doc); y = 16; }
        y = drawSectionHeader(doc, y, "Plan d'Optimisation", C.blueDark);
        doc.setFontSize(8);
        doc.setTextColor(...C.text);
        doc.setFont("helvetica", "normal");
        y = drawWrappedText(doc, planText, ML + 2, y + 2, CONTENT_W - 4);
        y += 6;
      }

      // ═══════════ VISION CIBLE ═════════════════════════════════════
      const visionText = normalizeAiText(session.ai_vision_cible);
      if (visionText) {
        y = ensureSpace(doc, y, 40);
        if (y < 20) { doc.addPage(); drawPageChrome(doc); y = 16; }
        y = drawSectionHeader(doc, y, "Vision Cible a 18 Mois", C.blue);
        doc.setFontSize(8);
        doc.setTextColor(...C.text);
        doc.setFont("helvetica", "normal");
        y = drawWrappedText(doc, visionText, ML + 2, y + 2, CONTENT_W - 4);
        y += 6;
      }

      // ═══════════ COUT D'INACTION & KPIs ═══════════════════════════
      const coutInactionText = normalizeAiText(session.ai_cout_inaction_annuel);
      if (coutInactionText) {
        y = ensureSpace(doc, y, 40);
        if (y < 20) { doc.addPage(); drawPageChrome(doc); y = 16; }
        y = drawSectionHeader(doc, y, "Cout Annuel de l'Inaction", C.red);
        doc.setFontSize(8);
        doc.setTextColor(...C.text);
        doc.setFont("helvetica", "normal");
        y = drawWrappedText(doc, coutInactionText, ML + 2, y + 2, CONTENT_W - 4);
        y += 6;
      }

      const kpisText = normalizeAiText(session.ai_kpis_de_suivi);
      if (kpisText) {
        y = ensureSpace(doc, y, 40);
        if (y < 20) { doc.addPage(); drawPageChrome(doc); y = 16; }
        y = drawSectionHeader(doc, y, "KPIs de Suivi", C.green);
        doc.setFontSize(8);
        doc.setTextColor(...C.text);
        doc.setFont("helvetica", "normal");
        y = drawWrappedText(doc, kpisText, ML + 2, y + 2, CONTENT_W - 4);
        y += 6;
      }

      // ═══════════ ENRICHED ANALYSIS ════════════════════════════════
      const crossPackText = normalizeAiText(session.ai_cross_pack_analysis);
      const impactQuantText = normalizeAiText(session.ai_impact_quantification);
      const targetVisionText = normalizeAiText(session.ai_target_vision);

      if (crossPackText || impactQuantText || targetVisionText) {
        doc.addPage();
        drawPageChrome(doc);
        y = 16;

        if (crossPackText) {
          y = drawSectionHeader(doc, y, "Analyse Causale Inter-Packs", C.purple);
          doc.setFontSize(8);
          doc.setTextColor(...C.text);
          doc.setFont("helvetica", "normal");
          y = drawWrappedText(doc, crossPackText, ML + 2, y + 2, CONTENT_W - 4);
          y += 8;
        }

        if (impactQuantText) {
          y = ensureSpace(doc, y, 40);
          if (y < 20) { doc.addPage(); drawPageChrome(doc); y = 16; }
          y = drawSectionHeader(doc, y, "Quantification d'Impact Financier", C.green);
          doc.setFontSize(8);
          doc.setTextColor(...C.text);
          doc.setFont("helvetica", "normal");
          y = drawWrappedText(doc, impactQuantText, ML + 2, y + 2, CONTENT_W - 4);
          y += 8;
        }

        if (targetVisionText) {
          y = ensureSpace(doc, y, 40);
          if (y < 20) { doc.addPage(); drawPageChrome(doc); y = 16; }
          y = drawSectionHeader(doc, y, "Vision Cible Detaillee 18 Mois", C.blue);
          doc.setFontSize(8);
          doc.setTextColor(...C.text);
          doc.setFont("helvetica", "normal");
          y = drawWrappedText(doc, targetVisionText, ML + 2, y + 2, CONTENT_W - 4);
        }
      }

      // ═══════════ TACHES MANUELLES ═════════════════════════════════
      if (taches.length > 0) {
        doc.addPage();
        drawPageChrome(doc);
        y = 16;
        y = drawSectionHeader(doc, y, `Taches Manuelles & Repetitives (${taches.length})`, C.purple);

        const tacheRows = taches.map((t) => [
          t.nom,
          t.frequence || "-",
          t.double_saisie ? "Oui" : "Non",
        ]);

        autoTable(doc, {
          startY: y,
          head: [["Tache", "Frequence", "Double saisie"]],
          body: tacheRows,
          margin: { left: ML, right: MR },
          styles: { fontSize: 7, cellPadding: 2.5, textColor: C.text, lineColor: C.border, lineWidth: 0.1 },
          headStyles: { fillColor: C.purple, textColor: C.white, fontStyle: "bold" },
          columnStyles: { 0: { fontStyle: "bold", cellWidth: 70 }, 1: { cellWidth: 30 }, 2: { cellWidth: 20, halign: "center" } },
          alternateRowStyles: { fillColor: [245, 243, 255] },
        });
      }

      setProgress("Finalisation du rapport..."); await new Promise(r => setTimeout(r, 0));
      // ═══════════ BACK COVER ═══════════════════════════════════════
      doc.addPage();
      doc.setFillColor(...C.navy);
      doc.rect(0, 0, PAGE_W, PAGE_H, "F");
      doc.setFillColor(...C.blue);
      doc.rect(0, 0, 5, PAGE_H, "F");
      doc.rect(0, 0, PAGE_W, 1.5, "F");

      // Decorative
      doc.setFillColor(...C.blue);
      doc.setGState(doc.GState({ opacity: 0.03 }));
      doc.circle(160, 80, 55, "F");
      doc.circle(50, 210, 40, "F");
      doc.setGState(doc.GState({ opacity: 1 }));

      // Shield logo
      drawCartoLogo(doc, PAGE_W / 2, 75, 50);

      // Thank you
      doc.setFontSize(28);
      doc.setTextColor(...C.white);
      doc.setFont("helvetica", "bold");
      doc.text("Merci.", PAGE_W / 2, 120, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor(...C.blueLight);
      doc.setFont("helvetica", "normal");
      doc.text("Votre transformation commence ici.", PAGE_W / 2, 132, { align: "center" });

      // Separator
      doc.setDrawColor(...C.blue);
      doc.setLineWidth(0.5);
      doc.line(70, 145, PAGE_W - 70, 145);

      // Info block
      doc.setFontSize(9);
      doc.setTextColor(...C.textMuted);
      doc.setFont("helvetica", "normal");
      doc.text("Ce rapport a ete genere automatiquement par", PAGE_W / 2, 160, { align: "center" });
      doc.setTextColor(...C.blue);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("solutio.work", PAGE_W / 2, 170, { align: "center" });

      doc.setFontSize(8);
      doc.setTextColor(...C.textMuted);
      doc.setFont("helvetica", "normal");
      doc.text("Cartographie & Optimisation Organisationnelle", PAGE_W / 2, 182, { align: "center" });
      doc.text("Propulse par Intelligence Artificielle", PAGE_W / 2, 189, { align: "center" });

      // Next steps
      doc.setFontSize(10);
      doc.setTextColor(...C.blue);
      doc.setFont("helvetica", "bold");
      doc.text("Prochaines etapes", PAGE_W / 2, 210, { align: "center" });

      const steps = [
        "1. Priorisez vos quick wins P1 pour un impact immediat",
        "2. Planifiez les projets P2 sur 3-9 mois",
        "3. Reservez un RDV strategique : calendly.com/tlb-ov_p/30min",
        "4. Contactez-nous : contact@solutio.work",
      ];
      doc.setFontSize(8);
      doc.setTextColor(...C.textMuted);
      doc.setFont("helvetica", "normal");
      steps.forEach((step, i) => {
        doc.text(step, PAGE_W / 2, 222 + i * 8, { align: "center" });
      });

      doc.setFontSize(7);
      doc.setTextColor(...C.textMuted);
      doc.text(date, PAGE_W / 2, PAGE_H - 20, { align: "center" });

      // ═══════════ PAGE NUMBERS ═════════════════════════════════════
      const totalPages = doc.getNumberOfPages();
      const contentPages = totalPages - 2; // exclude cover + back
      for (let i = 2; i < totalPages; i++) {
        doc.setPage(i);
        addPageFooter(doc, i - 1, contentPages, session.nom);
      }

      // Save
      const fileName = `Cartographie_${session.nom.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);

      setProgress("Telechargement...");

    } catch (err: unknown) {
      console.error("Erreur export PDF:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
      setProgress("");
    }
  }, []);

  const generateBrief = useCallback(async (data: CartDataForPdf) => {
    setIsLoading(true);
    setError(null);
    setProgress("Generation du brief executif...");

    try {
      const { jsPDF, autoTable } = await loadJsPDF();
      const { session, packResumes, quickwins } = data;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      // Header bar
      doc.setFillColor(...C.navy);
      doc.rect(0, 0, PAGE_W, 28, "F");
      doc.setFillColor(...C.blue);
      doc.rect(0, 0, PAGE_W, 1.5, "F");

      doc.setFontSize(14);
      doc.setTextColor(...C.white);
      doc.setFont("helvetica", "bold");
      doc.text("BRIEF EXECUTIF", ML, 14);
      doc.setFontSize(9);
      doc.setTextColor(...C.blueLight);
      doc.setFont("helvetica", "normal");
      doc.text(`${session.nom} — ${new Date().toLocaleDateString("fr-FR")}`, ML, 22);

      let y = 36;

      // Maturity scores row
      doc.setFontSize(10);
      doc.setTextColor(...C.text);
      doc.setFont("helvetica", "bold");
      doc.text("Scores de maturite", ML, y);
      y += 6;

      const scores = Object.values(
        packResumes.reduce((acc, pr) => {
          if (pr.score_maturite != null) acc[pr.bloc] = pr.score_maturite;
          return acc;
        }, {} as Record<number, number>)
      );
      const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      // Score bar
      const barW = PAGE_W - ML - MR;
      doc.setFillColor(...C.bg);
      doc.roundedRect(ML, y, barW, 8, 2, 2, "F");
      const fillW = Math.max(0, (avg / 5) * barW);
      const barColor: [number, number, number] = avg >= 3.5 ? C.green : avg >= 2.5 ? C.amber : C.red;
      doc.setFillColor(...barColor);
      doc.roundedRect(ML, y, fillW, 8, 2, 2, "F");
      doc.setFontSize(8);
      doc.setTextColor(...C.white);
      doc.setFont("helvetica", "bold");
      if (fillW > 20) doc.text(`${avg.toFixed(1)}/5`, ML + fillW - 12, y + 5.5);
      y += 14;

      // Resume executif
      const resumeText = normalizeAiText(session.ai_resume_executif);
      if (resumeText) {
        doc.setFontSize(10);
        doc.setTextColor(...C.text);
        doc.setFont("helvetica", "bold");
        doc.text("Resume executif", ML, y);
        y += 5;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.textMuted);
        const lines = doc.splitTextToSize(resumeText, PAGE_W - ML - MR);
        doc.text(lines.slice(0, 10), ML, y);
        y += Math.min(lines.length, 10) * 3.5 + 6;
      }

      // Top 5 quickwins
      const topQW = quickwins
        .filter(q => q.priorite_calculee === "P1" || q.priorite_calculee === "Top Priority")
        .slice(0, 5);
      if (topQW.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(...C.text);
        doc.setFont("helvetica", "bold");
        doc.text("Quick wins prioritaires", ML, y);
        y += 6;
        topQW.forEach((qw, i) => {
          doc.setFillColor(i % 2 === 0 ? 248 : 240, i % 2 === 0 ? 250 : 244, 252);
          doc.rect(ML, y - 3, PAGE_W - ML - MR, 7, "F");
          doc.setFontSize(8);
          doc.setTextColor(...C.text);
          doc.setFont("helvetica", "normal");
          doc.text(`${i + 1}. ${qw.intitule || ""}`.slice(0, 90), ML + 2, y + 1);
          y += 8;
        });
        y += 4;
      }

      // Axes critiques
      const axesCritiques = (session as any).ai_axes_critiques;
      if (Array.isArray(axesCritiques) && axesCritiques.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(...C.text);
        doc.setFont("helvetica", "bold");
        doc.text("Axes critiques", ML, y);
        y += 6;
        axesCritiques.slice(0, 3).forEach((axe: string, i: number) => {
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...C.red);
          doc.text(`• ${axe.slice(0, 100)}`, ML + 2, y);
          y += 4;
        });
        y += 4;
      }

      // Cout d'inaction
      const coutText = normalizeAiText(session.ai_cout_inaction_annuel);
      if (coutText) {
        doc.setFontSize(10);
        doc.setTextColor(...C.text);
        doc.setFont("helvetica", "bold");
        doc.text("Cout de l'inaction", ML, y);
        y += 5;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.textMuted);
        const cLines = doc.splitTextToSize(coutText, PAGE_W - ML - MR);
        doc.text(cLines.slice(0, 5), ML, y);
        y += Math.min(cLines.length, 5) * 3.5 + 6;
      }

      // Footer
      doc.setFillColor(...C.navy);
      doc.rect(0, PAGE_H - 12, PAGE_W, 12, "F");
      doc.setFontSize(7);
      doc.setTextColor(...C.blueLight);
      doc.text("solutio.work | Cartographie Organisationnelle", PAGE_W / 2, PAGE_H - 5, { align: "center" });

      const fileName = `Brief_${session.nom.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);

    } catch (err: unknown) {
      console.error("Erreur brief PDF:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
      setProgress("");
    }
  }, []);

  const generateTeaser = useCallback(async (data: CartDataForPdf) => {
    setIsLoading(true);
    setError(null);
    setProgress("Generation de l'apercu...");

    try {
      const { jsPDF, autoTable } = await loadJsPDF();
      const { session, packResumes, processus, outils, equipes, irritants, quickwins } = data;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

      // ═══════════ COVER PAGE (same as generatePdf) ═══════════════════
      doc.setFillColor(...C.navy);
      doc.rect(0, 0, PAGE_W, PAGE_H, "F");
      doc.setFillColor(...C.blue);
      doc.rect(0, 0, 5, PAGE_H, "F");
      doc.setFillColor(...C.blue);
      doc.setGState(doc.GState({ opacity: 0.04 }));
      doc.circle(165, 55, 70, "F");
      doc.circle(45, 240, 45, "F");
      doc.setGState(doc.GState({ opacity: 1 }));
      doc.setFillColor(...C.blue);
      doc.rect(0, 0, PAGE_W, 1.5, "F");
      drawCartoLogo(doc, 45, 50, 40);
      doc.setFontSize(11);
      doc.setTextColor(...C.white);
      doc.setFont("helvetica", "bold");
      doc.text("SOLUTIO", 70, 47);
      doc.setFontSize(8);
      doc.setTextColor(...C.blueLight);
      doc.setFont("helvetica", "normal");
      doc.text("CARTO", 70, 54);
      doc.setDrawColor(...C.blue);
      doc.setLineWidth(0.5);
      doc.line(ML + 8, 72, PAGE_W - MR - 8, 72);
      doc.setFontSize(34);
      doc.setTextColor(...C.white);
      doc.setFont("helvetica", "bold");
      doc.text("Rapport de", ML + 8, 98);
      doc.text("Cartographie", ML + 8, 113);
      doc.setTextColor(...C.blue);
      doc.text("Organisationnelle", ML + 8, 128);
      const sessionName = session.nom.length > 55 ? session.nom.slice(0, 55) + "..." : session.nom;
      doc.setFontSize(13);
      doc.setTextColor(...C.blueLight);
      doc.setFont("helvetica", "normal");
      doc.text(sessionName, ML + 8, 148);
      doc.setFontSize(10);
      doc.setTextColor(...C.textMuted);
      doc.text(date, ML + 8, 160);

      const statsY = 200;
      doc.setFillColor(15, 23, 42);
      doc.setDrawColor(...C.blue);
      doc.setLineWidth(0.5);
      doc.roundedRect(ML + 8, statsY, CONTENT_W - 16, 34, 3, 3, "FD");
      const stats = [
        { label: "PACKS", value: `${session.packs_completed}/10` },
        { label: "PROCESSUS", value: `${processus.length}` },
        { label: "OUTILS", value: `${outils.length}` },
        { label: "IRRITANTS", value: `${irritants.length}` },
        { label: "QUICK WINS", value: `${quickwins.length}` },
      ];
      const statW = (CONTENT_W - 16) / stats.length;
      stats.forEach((s, i) => {
        const sx = ML + 8 + i * statW + statW / 2;
        doc.setFontSize(18);
        doc.setTextColor(...C.blue);
        doc.setFont("helvetica", "bold");
        doc.text(s.value, sx, statsY + 15, { align: "center" });
        doc.setFontSize(6);
        doc.setTextColor(...C.textMuted);
        doc.setFont("helvetica", "normal");
        doc.text(s.label, sx, statsY + 24, { align: "center" });
      });
      doc.setFontSize(8);
      doc.setTextColor(...C.textMuted);
      doc.setFont("helvetica", "normal");
      doc.text("solutio.work  |  Transformation Digitale & Cartographie Organisationnelle", PAGE_W / 2, PAGE_H - 20, { align: "center" });
      // Badge "APERCU GRATUIT" on cover
      doc.setFontSize(9);
      doc.setFillColor(...C.blue);
      doc.roundedRect(PAGE_W - MR - 50, 160, 50, 10, 2, 2, "F");
      doc.setTextColor(...C.white);
      doc.setFont("helvetica", "bold");
      doc.text("APERCU GRATUIT", PAGE_W - MR - 25, 167, { align: "center" });

      // ═══════════ PAGE 2: TEASER CONTENT ═════════════════════════════
      doc.addPage();
      drawPageChrome(doc);
      let y = 16;

      y = drawSectionHeader(doc, y, "Synthese & Maturite Organisationnelle");

      // Radar scores — show fully
      const radarScores: Record<number, number | null> = {};
      for (let i = 1; i <= 10; i++) {
        const pr = packResumes.find((r) => r.bloc === i);
        radarScores[i] = pr?.score_maturite ?? null;
      }
      drawRadarChart(doc, ML + 44, y + 44, 32, radarScores);

      // Metrics right
      const mx = ML + 98;
      const cw = 34;
      drawMetricCard(doc, mx, y + 4, cw, "Processus", processus.length.toString(), C.blue);
      drawMetricCard(doc, mx + cw + 3, y + 4, cw, "Outils & SI", outils.length.toString(), C.green);
      drawMetricCard(doc, mx, y + 33, cw, "Equipes", equipes.length.toString(), C.orange);
      drawMetricCard(doc, mx + cw + 3, y + 33, cw, "Irritants", irritants.length.toString(), C.red);

      y += 95;

      // Resume executif — first 3 lines only
      const resumeText = normalizeAiText(session.ai_resume_executif);
      if (resumeText) {
        y = drawSectionHeader(doc, y, "Resume Executif");
        doc.setFontSize(8);
        doc.setTextColor(...C.text);
        doc.setFont("helvetica", "normal");
        const allLines = doc.splitTextToSize(resumeText.replace(/\*\*/g, "").replace(/^#{1,6}\s*/gm, ""), CONTENT_W - 4);
        const previewLines = allLines.slice(0, 3);
        for (const line of previewLines) {
          doc.text(line, ML + 2, y + 2);
          y += 4.5;
        }
        if (allLines.length > 3) {
          doc.setTextColor(...C.textMuted);
          doc.text("...", ML + 2, y + 2);
          y += 6;
        }
        y += 4;
      }

      // Gray placeholder bars for locked content
      const placeholderSections = [
        "Forces Identifiees",
        "Dysfonctionnements Majeurs",
        "Plan d'Optimisation",
        "Vision Cible",
      ];
      for (const sectionTitle of placeholderSections) {
        if (y + 30 > PAGE_H - 50) break; // leave room for CTA
        doc.setFontSize(8);
        doc.setTextColor(...C.textMuted);
        doc.setFont("helvetica", "bold");
        doc.text(sectionTitle, ML + 2, y);
        y += 5;
        // 3 gray bars
        for (let b = 0; b < 3; b++) {
          const barWidth = CONTENT_W - 4 - (b === 2 ? 40 : b === 1 ? 15 : 0);
          doc.setFillColor(220, 220, 220);
          doc.rect(ML + 2, y, barWidth, 4, "F");
          y += 6;
        }
        y += 4;
      }

      // Watermark: "VERSION GRATUITE" rotated
      doc.setGState(doc.GState({ opacity: 0.08 }));
      doc.setFontSize(60);
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "bold");
      // Save state, rotate, draw text, restore
      const centerX = PAGE_W / 2;
      const centerY = PAGE_H / 2;
      doc.text("VERSION GRATUITE", centerX, centerY, {
        align: "center",
        angle: 45,
      });
      doc.setGState(doc.GState({ opacity: 1 }));

      // CTA at the bottom
      const ctaY = PAGE_H - 40;
      doc.setFillColor(...C.navy);
      doc.roundedRect(ML, ctaY, CONTENT_W, 28, 3, 3, "F");
      doc.setFillColor(...C.blue);
      doc.rect(ML, ctaY, 3.5, 28, "F");
      doc.setFontSize(11);
      doc.setTextColor(...C.white);
      doc.setFont("helvetica", "bold");
      doc.text("Debloquez le rapport complet", ML + 10, ctaY + 11);
      doc.setFontSize(8);
      doc.setTextColor(...C.blueLight);
      doc.setFont("helvetica", "normal");
      doc.text("solutio.work/cartographie/pricing", ML + 10, ctaY + 20);

      // Footer
      addPageFooter(doc, 1, 1, session.nom);

      // Save
      const fileName = `Apercu_${session.nom.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);

      setProgress("Telechargement...");
    } catch (err: unknown) {
      console.error("Erreur teaser PDF:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
      setProgress("");
    }
  }, []);

  return { generatePdf, generateBrief, generateTeaser, isLoading, error, progress };
}
