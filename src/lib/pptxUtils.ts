import type PptxGenJS from "pptxgenjs";

export const COLORS = {
  primary: "1E3A5F",
  primaryLight: "2B5A8A",
  gold: "C5A55A",
  darkBg: "1A1A2E",
  lightBg: "F8F9FA",
  white: "FFFFFF",
  black: "333333",
  gray: "666666",
  lightGray: "E5E5E5",
  success: "22C55E",
  warning: "F59E0B",
  danger: "EF4444",
};

export function getScoreColor(score: number): string {
  if (score >= 4) return COLORS.success;
  if (score >= 3) return COLORS.warning;
  return COLORS.danger;
}

export function getMaturite(score: number): string {
  if (score >= 4.5) return "Excellent";
  if (score >= 3.5) return "Bon";
  if (score >= 2.5) return "Moyen";
  if (score >= 1.5) return "Faible";
  return "Critique";
}

export function addHeader(slide: PptxGenJS.Slide, title: string) {
  slide.addShape("rect", { x: 0, y: 0, w: "100%", h: 0.6, fill: { color: COLORS.primary } });
  slide.addText(title, {
    x: 0.5, y: 0.1, w: 9, h: 0.4,
    color: COLORS.white, fontSize: 14, bold: true, fontFace: "Arial",
  });
}

export function addContentBox(slide: PptxGenJS.Slide, text: string, options: { x: number; y: number; w: number; h: number }) {
  slide.addShape("rect", {
    ...options,
    fill: { color: COLORS.lightBg },
    line: { color: COLORS.lightGray, width: 0.5 },
    rectRadius: 0.05,
  });
  slide.addText(text, {
    x: options.x + 0.1, y: options.y + 0.05, w: options.w - 0.2, h: options.h - 0.1,
    color: COLORS.black, fontSize: 9, fontFace: "Arial", valign: "top", wrap: true,
  });
}

export function addFooter(slide: PptxGenJS.Slide, pageNumber: number) {
  slide.addText(`Cartographie Solutio — Page ${pageNumber}`, {
    x: 0.5, y: 5.2, w: 9, h: 0.3,
    color: COLORS.gray, fontSize: 7, fontFace: "Arial",
  });
}

export function addTitleSlide(pptx: PptxGenJS, title: string, subtitle: string) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.darkBg };
  slide.addText(title, {
    x: 1, y: 1.5, w: 8, h: 1,
    color: COLORS.white, fontSize: 28, bold: true, fontFace: "Arial", align: "center",
  });
  slide.addText(subtitle, {
    x: 1, y: 2.8, w: 8, h: 0.6,
    color: COLORS.gold, fontSize: 14, fontFace: "Arial", align: "center",
  });
  slide.addText("Solutio — Cartographie organisationnelle", {
    x: 1, y: 4, w: 8, h: 0.4,
    color: COLORS.gray, fontSize: 10, fontFace: "Arial", align: "center",
  });
}

export function addEndSlide(pptx: PptxGenJS) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.darkBg };
  slide.addText("Merci", {
    x: 1, y: 1.8, w: 8, h: 1,
    color: COLORS.white, fontSize: 32, bold: true, fontFace: "Arial", align: "center",
  });
  slide.addText("Document genere par Solutio — solutio.work", {
    x: 1, y: 3.2, w: 8, h: 0.5,
    color: COLORS.gold, fontSize: 12, fontFace: "Arial", align: "center",
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "percent", minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(value / 100);
}

// Dynamic import — pptxgenjs (~400KB) only loaded when generating a deck
export async function createPptx(): Promise<PptxGenJS> {
  const { default: PptxGenJSLib } = await import("pptxgenjs");
  const pptx = new PptxGenJSLib();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Solutio";
  pptx.company = "Solutio";
  return pptx;
}
