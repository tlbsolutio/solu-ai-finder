import { useState, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

// Design system
const C = {
  primary: [0, 180, 216] as [number, number, number],     // cyan-500
  primaryDark: [0, 139, 167] as [number, number, number],  // cyan-600
  dark: [15, 23, 42] as [number, number, number],          // slate-900
  text: [30, 41, 59] as [number, number, number],          // slate-800
  textLight: [100, 116, 139] as [number, number, number],  // slate-500
  white: [255, 255, 255] as [number, number, number],
  bg: [248, 250, 252] as [number, number, number],         // slate-50
  border: [226, 232, 240] as [number, number, number],     // slate-200
  red: [239, 68, 68] as [number, number, number],
  orange: [249, 115, 22] as [number, number, number],
  green: [34, 197, 94] as [number, number, number],
  yellow: [234, 179, 8] as [number, number, number],
  purple: [139, 92, 246] as [number, number, number],
  blue: [59, 130, 246] as [number, number, number],
};

const PACK_NAMES: Record<number, string> = {
  1: "Contexte & Strategie", 2: "Clients & Marche", 3: "Organisation",
  4: "Ressources Humaines", 5: "Communication", 6: "Operations",
  7: "Systemes d'Information", 8: "Communication Interne",
  9: "Qualite & Conformite", 10: "KPIs & Pilotage",
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

function addPageFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  doc.setFillColor(...C.bg);
  doc.rect(0, PAGE_H - 14, PAGE_W, 14, "F");
  doc.setFontSize(7);
  doc.setTextColor(...C.textLight);
  doc.text("solutio.work", MARGIN, PAGE_H - 6);
  doc.text(`${pageNum} / ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 6, { align: "right" });
}

function drawSectionHeader(doc: jsPDF, y: number, title: string, color: [number, number, number] = C.primary): number {
  doc.setFillColor(...color);
  doc.roundedRect(MARGIN, y, CONTENT_W, 10, 2, 2, "F");
  doc.setFontSize(11);
  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), MARGIN + 5, y + 7);
  return y + 16;
}

function drawMetricCard(doc: jsPDF, x: number, y: number, w: number, label: string, value: string, color: [number, number, number]) {
  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.border);
  doc.roundedRect(x, y, w, 22, 2, 2, "FD");
  doc.setFillColor(...color);
  doc.roundedRect(x, y, 3, 22, 1.5, 0, "F");
  doc.setFontSize(16);
  doc.setTextColor(...C.dark);
  doc.setFont("helvetica", "bold");
  doc.text(value, x + 10, y + 10);
  doc.setFontSize(7);
  doc.setTextColor(...C.textLight);
  doc.setFont("helvetica", "normal");
  doc.text(label, x + 10, y + 17);
}

function drawTag(doc: jsPDF, x: number, y: number, text: string, bgColor: [number, number, number], textColor: [number, number, number] = C.white): number {
  const w = doc.getTextWidth(text) + 6;
  doc.setFillColor(...bgColor);
  doc.roundedRect(x, y - 3.5, w, 5.5, 1.5, 1.5, "F");
  doc.setFontSize(6.5);
  doc.setTextColor(...textColor);
  doc.setFont("helvetica", "bold");
  doc.text(text, x + 3, y);
  return w + 2;
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - 20) {
    doc.addPage();
    return 24;
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
  // Replace chars that jsPDF Helvetica can't render
  return text
    .replace(/[\u2018\u2019]/g, "'")  // smart quotes
    .replace(/[\u201C\u201D]/g, '"')  // smart double quotes
    .replace(/\u2026/g, "...")         // ellipsis
    .replace(/\u2013/g, "-")          // en-dash
    .replace(/\u2014/g, " - ")        // em-dash
    .replace(/\u2022/g, "- ")         // bullet
    .replace(/\u00A0/g, " ")          // nbsp
    .replace(/[\u2192\u2794\u27A1]/g, "->")  // arrows
    .replace(/[\u2713\u2714]/g, "[x]")       // checkmarks
    .replace(/[\u2717\u2718]/g, "[ ]");      // crossmarks
}

function drawWrappedText(doc: jsPDF, text: string, x: number, y: number, maxW: number, lineH: number = 4.5): number {
  if (!text) return y;
  // Clean markdown but preserve numbers and punctuation
  const clean = text
    .replace(/\*\*/g, "")       // bold markers
    .replace(/^#{1,6}\s*/gm, "") // heading markers
    .replace(/\n{3,}/g, "\n\n"); // excessive newlines

  // Split by paragraphs for better spacing
  const paragraphs = clean.split(/\n\n+/);
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Check if paragraph starts with a numbered item (e.g. "1." "2.")
    const isNumbered = /^\d+[.)]\s/.test(trimmed);
    const isBullet = /^[-*]\s/.test(trimmed);

    if (isNumbered || isBullet) {
      // Bold the first line of numbered/bullet items
      doc.setFont("helvetica", "bold");
    }

    const lines = doc.splitTextToSize(trimmed, maxW);
    for (let i = 0; i < lines.length; i++) {
      y = ensureSpace(doc, y, lineH + 2);
      if (y < 30) y = 24;
      doc.text(lines[i], x, y);
      y += lineH;
      if (i === 0 && (isNumbered || isBullet)) {
        doc.setFont("helvetica", "normal");
      }
    }
    y += 1.5; // paragraph spacing
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

  // Grid
  for (let lvl = 1; lvl <= levels; lvl++) {
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    const pts = Array.from({ length: numAxes }, (_, i) => getPoint(i, lvl));
    for (let i = 0; i < pts.length; i++) {
      const next = pts[(i + 1) % pts.length];
      doc.line(pts[i][0], pts[i][1], next[0], next[1]);
    }
  }

  // Axes
  for (let i = 0; i < numAxes; i++) {
    const [x, y] = getPoint(i, levels);
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.15);
    doc.line(cx, cy, x, y);
  }

  // Filled area
  const validEntries = Object.entries(scores).filter(([, v]) => v !== null && v !== undefined);
  if (validEntries.length > 0) {
    const fillPts = Array.from({ length: numAxes }, (_, i) => {
      const s = scores[i + 1];
      return getPoint(i, s ?? 0);
    });
    doc.setFillColor(0, 180, 216);
    doc.setGState(doc.GState({ opacity: 0.15 }));
    const polyX = fillPts.map((p) => p[0]);
    const polyY = fillPts.map((p) => p[1]);
    // Draw polygon manually
    doc.setDrawColor(...C.primary);
    doc.setLineWidth(0.8);
    doc.setGState(doc.GState({ opacity: 1 }));
    for (let i = 0; i < fillPts.length; i++) {
      const next = fillPts[(i + 1) % fillPts.length];
      doc.line(fillPts[i][0], fillPts[i][1], next[0], next[1]);
    }

    // Dots
    for (let i = 0; i < numAxes; i++) {
      const s = scores[i + 1];
      if (s !== null && s !== undefined) {
        const [px, py] = getPoint(i, s);
        doc.setFillColor(...C.primary);
        doc.circle(px, py, 1.5, "F");
      }
    }
  }

  // Labels
  for (let i = 0; i < numAxes; i++) {
    const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
    const labelR = radius + 8;
    const lx = cx + labelR * Math.cos(angle);
    const ly = cy + labelR * Math.sin(angle);
    doc.setFontSize(6);
    doc.setTextColor(...C.text);
    doc.setFont("helvetica", "normal");
    doc.text(PACK_NAMES[i + 1] || "", lx, ly, { align: "center" });
  }

  // Center score
  const validScores = Object.values(scores).filter((s): s is number => s !== null && s !== undefined);
  if (validScores.length > 0) {
    const avg = (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1);
    doc.setFillColor(...C.primary);
    doc.circle(cx, cy, 7, "F");
    doc.setFontSize(9);
    doc.setTextColor(...C.white);
    doc.setFont("helvetica", "bold");
    doc.text(avg, cx, cy - 1, { align: "center" });
    doc.setFontSize(5);
    doc.text("/5", cx, cy + 3, { align: "center" });
  }
}

export function useCartPdfExport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePdf = useCallback(async (data: CartDataForPdf) => {
    setIsLoading(true);
    setError(null);

    try {
      const { session, packResumes, processus, outils, equipes, irritants, taches, quickwins } = data;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pages: number[] = [1];
      const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

      // ==================== PAGE 1: COVER ====================
      // Full-page gradient background
      doc.setFillColor(...C.dark);
      doc.rect(0, 0, PAGE_W, PAGE_H, "F");

      // Accent stripe
      doc.setFillColor(...C.primary);
      doc.rect(0, 0, 6, PAGE_H, "F");

      // Decorative circles
      doc.setFillColor(0, 180, 216);
      doc.setGState(doc.GState({ opacity: 0.05 }));
      doc.circle(170, 50, 60, "F");
      doc.circle(40, 230, 40, "F");
      doc.setGState(doc.GState({ opacity: 1 }));

      // Logo text
      doc.setFontSize(12);
      doc.setTextColor(...C.primary);
      doc.setFont("helvetica", "bold");
      doc.text("SOLUTIO.WORK", MARGIN + 10, 40);

      // Title
      doc.setFontSize(32);
      doc.setTextColor(...C.white);
      doc.setFont("helvetica", "bold");
      doc.text("Rapport de", MARGIN + 10, 85);
      doc.text("Cartographie", MARGIN + 10, 100);
      doc.setTextColor(...C.primary);
      doc.text("Organisationnelle", MARGIN + 10, 115);

      // Session name
      doc.setFontSize(14);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFont("helvetica", "normal");
      const sessionName = session.nom.length > 50 ? session.nom.slice(0, 50) + "..." : session.nom;
      doc.text(sessionName, MARGIN + 10, 140);

      // Date
      doc.setFontSize(10);
      doc.text(date, MARGIN + 10, 150);

      // Stats bar at bottom
      const statsY = 230;
      doc.setFillColor(30, 41, 59); // slightly lighter than bg
      doc.roundedRect(MARGIN + 10, statsY, CONTENT_W - 20, 30, 3, 3, "F");

      const stats = [
        { label: "Packs completes", value: `${session.packs_completed}/10` },
        { label: "Processus", value: `${processus.length}` },
        { label: "Outils", value: `${outils.length}` },
        { label: "Quick Wins", value: `${quickwins.length}` },
      ];
      const statW = (CONTENT_W - 20) / stats.length;
      stats.forEach((s, i) => {
        const sx = MARGIN + 10 + i * statW + statW / 2;
        doc.setFontSize(16);
        doc.setTextColor(...C.primary);
        doc.setFont("helvetica", "bold");
        doc.text(s.value, sx, statsY + 13, { align: "center" });
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.setFont("helvetica", "normal");
        doc.text(s.label, sx, statsY + 21, { align: "center" });
      });

      // ==================== PAGE 2: SYNTHESE ====================
      doc.addPage();
      pages.push(2);
      let y = 20;

      // Radar chart + key metrics
      y = drawSectionHeader(doc, y, "Synthese & Maturite Organisationnelle");

      // Build radar scores
      const radarScores: Record<number, number | null> = {};
      for (let i = 1; i <= 10; i++) {
        const pr = packResumes.find((r) => r.bloc === i);
        radarScores[i] = pr?.score_maturite ?? null;
      }

      // Draw radar on left
      drawRadarChart(doc, MARGIN + 42, y + 42, 30, radarScores);

      // Metrics on right
      const metricsX = MARGIN + 95;
      const cardW = 35;
      drawMetricCard(doc, metricsX, y + 5, cardW, "Processus", processus.length.toString(), C.blue);
      drawMetricCard(doc, metricsX + cardW + 4, y + 5, cardW, "Outils & SI", outils.length.toString(), C.green);
      drawMetricCard(doc, metricsX, y + 32, cardW, "Equipes", equipes.length.toString(), C.orange);
      drawMetricCard(doc, metricsX + cardW + 4, y + 32, cardW, "Irritants", irritants.length.toString(), C.red);
      drawMetricCard(doc, metricsX, y + 59, cardW, "Quick Wins", quickwins.length.toString(), C.yellow);
      drawMetricCard(doc, metricsX + cardW + 4, y + 59, cardW, "Taches manuelles", taches.length.toString(), C.purple);

      y += 90;

      // Pack scores table
      y = drawSectionHeader(doc, y, "Scores par Pack");
      const packRows = packResumes
        .sort((a, b) => a.bloc - b.bloc)
        .map((pr) => {
          const score = pr.score_maturite ?? 0;
          const filled = Math.round(score);
          const bar = "|".repeat(filled) + ".".repeat(5 - filled);
          return [
            `Pack ${pr.bloc}`,
            PACK_NAMES[pr.bloc] || "",
            `${score.toFixed(1)}/5`,
            bar,
            pr.resume ? (pr.resume.length > 80 ? pr.resume.slice(0, 80) + "..." : pr.resume) : "-",
          ];
        });

      autoTable(doc, {
        startY: y,
        head: [["#", "Pack", "Score", "Niveau", "Resume"]],
        body: packRows,
        margin: { left: MARGIN, right: MARGIN },
        styles: { fontSize: 7, cellPadding: 2, textColor: C.text, lineColor: C.border, lineWidth: 0.1 },
        headStyles: { fillColor: C.dark, textColor: C.white, fontStyle: "bold", fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 12 },
          1: { cellWidth: 30 },
          2: { cellWidth: 14, halign: "center" },
          3: { cellWidth: 16, fontStyle: "bold", textColor: C.primary },
          4: { cellWidth: "auto" },
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      y = (doc as any).lastAutoTable?.finalY + 8 || y + 60;

      // ==================== RESUME EXECUTIF ====================
      const resumeText = normalizeAiText(session.ai_resume_executif);
      if (resumeText) {
        y = ensureSpace(doc, y, 40);
        if (y < 30) y = 24;
        y = drawSectionHeader(doc, y, "Resume Executif");
        doc.setFontSize(8);
        doc.setTextColor(...C.text);
        doc.setFont("helvetica", "normal");
        y = drawWrappedText(doc, resumeText, MARGIN + 2, y + 2, CONTENT_W - 4);
        y += 6;
      }

      // ==================== FORCES ====================
      const forcesText = normalizeAiText(session.ai_forces);
      if (forcesText) {
        y = ensureSpace(doc, y, 40);
        if (y < 30) y = 24;
        y = drawSectionHeader(doc, y, "Forces Identifiees", C.green);
        doc.setFontSize(8);
        doc.setTextColor(...C.text);
        doc.setFont("helvetica", "normal");
        y = drawWrappedText(doc, forcesText, MARGIN + 2, y + 2, CONTENT_W - 4);
        y += 6;
      }

      // ==================== DYSFONCTIONNEMENTS ====================
      const dysText = normalizeAiText(session.ai_dysfonctionnements);
      if (dysText) {
        y = ensureSpace(doc, y, 40);
        if (y < 30) y = 24;
        y = drawSectionHeader(doc, y, "Dysfonctionnements Majeurs", C.red);
        doc.setFontSize(8);
        doc.setTextColor(...C.text);
        doc.setFont("helvetica", "normal");
        y = drawWrappedText(doc, dysText, MARGIN + 2, y + 2, CONTENT_W - 4);
        y += 6;
      }

      // ==================== PROCESSUS ====================
      if (processus.length > 0) {
        doc.addPage();
        pages.push(pages.length + 1);
        y = 24;
        y = drawSectionHeader(doc, y, `Processus Detectes (${processus.length})`, C.blue);

        const procRows = processus.map((p) => {
          const critColor = p.niveau_criticite === "High" ? "Critique" : p.niveau_criticite === "Medium" ? "Moyen" : "Faible";
          return [p.nom, p.type || "-", critColor, p.description ? (p.description.length > 60 ? p.description.slice(0, 60) + "..." : p.description) : "-"];
        });

        autoTable(doc, {
          startY: y,
          head: [["Processus", "Type", "Criticite", "Description"]],
          body: procRows,
          margin: { left: MARGIN, right: MARGIN },
          styles: { fontSize: 7, cellPadding: 2.5, textColor: C.text, lineColor: C.border, lineWidth: 0.1 },
          headStyles: { fillColor: C.blue, textColor: C.white, fontStyle: "bold" },
          columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 }, 1: { cellWidth: 25 }, 2: { cellWidth: 18 } },
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

      // ==================== OUTILS ====================
      if (outils.length > 0) {
        y = ensureSpace(doc, y, 30);
        if (y < 30) y = 24;
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
          margin: { left: MARGIN, right: MARGIN },
          styles: { fontSize: 7, cellPadding: 2.5, textColor: C.text, lineColor: C.border, lineWidth: 0.1 },
          headStyles: { fillColor: C.green, textColor: C.white, fontStyle: "bold" },
          columnStyles: { 0: { fontStyle: "bold", cellWidth: 35 }, 1: { cellWidth: 25 }, 2: { cellWidth: 20 } },
          alternateRowStyles: { fillColor: [240, 253, 244] },
        });
        y = (doc as any).lastAutoTable?.finalY + 8 || y + 40;
      }

      // ==================== EQUIPES ====================
      if (equipes.length > 0) {
        y = ensureSpace(doc, y, 30);
        if (y < 30) y = 24;
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
          margin: { left: MARGIN, right: MARGIN },
          styles: { fontSize: 7, cellPadding: 2.5, textColor: C.text, lineColor: C.border, lineWidth: 0.1 },
          headStyles: { fillColor: C.orange, textColor: C.white, fontStyle: "bold" },
          columnStyles: { 0: { fontStyle: "bold", cellWidth: 35 }, 2: { cellWidth: 15, halign: "center" } },
          alternateRowStyles: { fillColor: [255, 247, 237] },
        });
        y = (doc as any).lastAutoTable?.finalY + 8 || y + 40;
      }

      // ==================== IRRITANTS ====================
      if (irritants.length > 0) {
        y = ensureSpace(doc, y, 30);
        if (y < 30) y = 24;
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
          margin: { left: MARGIN, right: MARGIN },
          styles: { fontSize: 7, cellPadding: 2.5, textColor: C.text, lineColor: C.border, lineWidth: 0.1 },
          headStyles: { fillColor: C.red, textColor: C.white, fontStyle: "bold" },
          columnStyles: { 0: { fontStyle: "bold", cellWidth: 45 }, 1: { cellWidth: 20 }, 2: { cellWidth: 15, halign: "center" } },
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

      // ==================== QUICK WINS ====================
      if (quickwins.length > 0) {
        doc.addPage();
        pages.push(pages.length + 1);
        y = 24;
        y = drawSectionHeader(doc, y, `Quick Wins & Actions Rapides (${quickwins.length})`, C.yellow);

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
          margin: { left: MARGIN, right: MARGIN },
          styles: { fontSize: 7, cellPadding: 2.5, textColor: C.text, lineColor: C.border, lineWidth: 0.1 },
          headStyles: { fillColor: [161, 98, 7], textColor: C.white, fontStyle: "bold" },
          columnStyles: { 0: { cellWidth: 14, halign: "center", fontStyle: "bold" }, 2: { cellWidth: 16 }, 3: { cellWidth: 16 }, 4: { cellWidth: 25 } },
          alternateRowStyles: { fillColor: [254, 252, 232] },
          didParseCell: (data) => {
            if (data.column.index === 0 && data.section === "body") {
              const val = data.cell.raw as string;
              if (val === "P1") data.cell.styles.textColor = C.red;
              else if (val === "P2") data.cell.styles.textColor = C.orange;
              else data.cell.styles.textColor = C.textLight;
            }
          },
        });
        y = (doc as any).lastAutoTable?.finalY + 8 || y + 40;
      }

      // ==================== ANALYSE TRANSVERSALE ====================
      const analyseTransText = normalizeAiText(session.ai_analyse_transversale);
      if (analyseTransText) {
        doc.addPage();
        pages.push(pages.length + 1);
        y = 24;
        y = drawSectionHeader(doc, y, "Analyse Transversale", C.purple);
        doc.setFontSize(8);
        doc.setTextColor(...C.text);
        doc.setFont("helvetica", "normal");
        y = drawWrappedText(doc, analyseTransText, MARGIN + 2, y + 2, CONTENT_W - 4);
        y += 6;
      }

      // ==================== PLAN D'OPTIMISATION ====================
      const planText = normalizeAiText(session.ai_plan_optimisation);
      if (planText) {
        y = ensureSpace(doc, y, 40);
        if (y < 30) { doc.addPage(); pages.push(pages.length + 1); y = 24; }
        y = drawSectionHeader(doc, y, "Plan d'Optimisation", C.primaryDark);
        doc.setFontSize(8);
        doc.setTextColor(...C.text);
        doc.setFont("helvetica", "normal");
        y = drawWrappedText(doc, planText, MARGIN + 2, y + 2, CONTENT_W - 4);
        y += 6;
      }

      // ==================== VISION CIBLE ====================
      const visionText = normalizeAiText(session.ai_vision_cible);
      if (visionText) {
        y = ensureSpace(doc, y, 40);
        if (y < 30) { doc.addPage(); pages.push(pages.length + 1); y = 24; }
        y = drawSectionHeader(doc, y, "Vision Cible a 18 Mois", C.blue);
        doc.setFontSize(8);
        doc.setTextColor(...C.text);
        doc.setFont("helvetica", "normal");
        y = drawWrappedText(doc, visionText, MARGIN + 2, y + 2, CONTENT_W - 4);
        y += 6;
      }

      // ==================== ENRICHED ANALYSIS ====================
      const crossPackText = normalizeAiText((session as any).ai_cross_pack_analysis);
      const impactQuantText = normalizeAiText((session as any).ai_impact_quantification);
      const targetVisionText = normalizeAiText((session as any).ai_target_vision);

      if (crossPackText || impactQuantText || targetVisionText) {
        doc.addPage();
        pages.push(pages.length + 1);
        y = 24;

        if (crossPackText) {
          y = drawSectionHeader(doc, y, "Analyse Causale Inter-Packs", C.purple);
          doc.setFontSize(8);
          doc.setTextColor(...C.text);
          doc.setFont("helvetica", "normal");
          y = drawWrappedText(doc, crossPackText, MARGIN + 2, y + 2, CONTENT_W - 4);
          y += 8;
        }

        if (impactQuantText) {
          y = ensureSpace(doc, y, 40);
          if (y < 30) { doc.addPage(); pages.push(pages.length + 1); y = 24; }
          y = drawSectionHeader(doc, y, "Quantification d'Impact Financier", C.green);
          doc.setFontSize(8);
          doc.setTextColor(...C.text);
          doc.setFont("helvetica", "normal");
          y = drawWrappedText(doc, impactQuantText, MARGIN + 2, y + 2, CONTENT_W - 4);
          y += 8;
        }

        if (targetVisionText) {
          y = ensureSpace(doc, y, 40);
          if (y < 30) { doc.addPage(); pages.push(pages.length + 1); y = 24; }
          y = drawSectionHeader(doc, y, "Vision Cible Detaillee 18 Mois", C.blue);
          doc.setFontSize(8);
          doc.setTextColor(...C.text);
          doc.setFont("helvetica", "normal");
          y = drawWrappedText(doc, targetVisionText, MARGIN + 2, y + 2, CONTENT_W - 4);
        }
      }

      // ==================== BACK COVER ====================
      doc.addPage();
      pages.push(pages.length + 1);
      doc.setFillColor(...C.dark);
      doc.rect(0, 0, PAGE_W, PAGE_H, "F");
      doc.setFillColor(...C.primary);
      doc.rect(0, 0, 6, PAGE_H, "F");

      doc.setFontSize(24);
      doc.setTextColor(...C.white);
      doc.setFont("helvetica", "bold");
      doc.text("Merci.", MARGIN + 10, 120);

      doc.setFontSize(11);
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "normal");
      doc.text("Ce rapport a ete genere automatiquement par", MARGIN + 10, 140);
      doc.setTextColor(...C.primary);
      doc.setFont("helvetica", "bold");
      doc.text("solutio.work", MARGIN + 10, 148);

      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "normal");
      doc.text("Cartographie & Optimisation Organisationnelle", MARGIN + 10, 162);
      doc.text("Propulse par Intelligence Artificielle", MARGIN + 10, 169);

      doc.setFontSize(8);
      doc.text(date, MARGIN + 10, 185);

      // Add page numbers to all pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 2; i < totalPages; i++) {
        doc.setPage(i);
        addPageFooter(doc, i - 1, totalPages - 2); // Exclude cover & back cover
      }

      // Save
      const fileName = `Cartographie_${session.nom.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);

    } catch (err: unknown) {
      console.error("Erreur export PDF:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { generatePdf, isLoading, error };
}
