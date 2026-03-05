import { useState, useCallback } from "react";
import {
  COLORS, addHeader, addFooter, addContentBox, addTitleSlide, addEndSlide, createPptx,
} from "@/lib/pptxUtils";
import type {
  CartSessionV2, CartProcessusV2, CartOutilV2, CartEquipeV2,
  CartIrritantV2, CartTacheV2, CartQuickwinV2,
} from "@/lib/cartTypes";

export interface CartDataForPptx {
  session: CartSessionV2;
  processus: CartProcessusV2[];
  outils: CartOutilV2[];
  equipes: CartEquipeV2[];
  irritants: CartIrritantV2[];
  taches: CartTacheV2[];
  quickwins: CartQuickwinV2[];
}

function truncateText(text: string, max: number): string {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "..." : text;
}

export function useCartPptxExport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePptx = useCallback(async (data: CartDataForPptx) => {
    setIsLoading(true);
    setError(null);

    try {
      const { session } = data;
      const pptx = createPptx();
      let page = 1;

      // SLIDE 1: Title
      addTitleSlide(pptx, "Cartographie & Optimisation", session.nom);

      // SLIDE 2: Resume executif
      if (session.ai_resume_executif) {
        const slide = pptx.addSlide();
        addHeader(slide, "Resume Executif");
        addContentBox(slide, truncateText(session.ai_resume_executif, 1200), { x: 0.4, y: 1.2, w: 9.2, h: 3.6 });
        addFooter(slide, ++page);
      }

      // SLIDE 3: Forces
      if (session.ai_forces) {
        const slide = pptx.addSlide();
        addHeader(slide, "Forces identifiees");
        addContentBox(slide, truncateText(session.ai_forces, 1000), { x: 0.4, y: 1.2, w: 9.2, h: 3.6 });
        addFooter(slide, ++page);
      }

      // SLIDE 4: Dysfonctionnements
      if (session.ai_dysfonctionnements) {
        const slide = pptx.addSlide();
        addHeader(slide, "Dysfonctionnements majeurs");
        addContentBox(slide, truncateText(session.ai_dysfonctionnements, 1000), { x: 0.4, y: 1.2, w: 9.2, h: 3.6 });
        addFooter(slide, ++page);
      }

      // SLIDE 5: Processus
      if (data.processus.length > 0) {
        const slide = pptx.addSlide();
        addHeader(slide, `Processus (${data.processus.length})`);
        data.processus.slice(0, 8).forEach((p, i) => {
          const y = 1.2 + i * 0.45;
          slide.addText(`${i + 1}. ${truncateText(p.nom, 45)}`, {
            x: 0.5, y, w: 5, h: 0.38, fontSize: 9, color: COLORS.black, fontFace: "Arial",
          });
          slide.addText(p.type || "", {
            x: 5.6, y, w: 2, h: 0.38, fontSize: 8, color: COLORS.gray, fontFace: "Arial",
          });
          slide.addText(p.niveau_criticite || "", {
            x: 7.8, y, w: 1.8, h: 0.38, fontSize: 8,
            color: p.niveau_criticite === "High" ? COLORS.danger : COLORS.gray, fontFace: "Arial",
          });
        });
        addFooter(slide, ++page);
      }

      // SLIDE 6: Outils
      if (data.outils.length > 0) {
        const slide = pptx.addSlide();
        addHeader(slide, `Outils & SI (${data.outils.length})`);
        data.outils.slice(0, 8).forEach((o, i) => {
          const y = 1.2 + i * 0.45;
          slide.addText(`${i + 1}. ${truncateText(o.nom, 40)}`, {
            x: 0.5, y, w: 4.5, h: 0.38, fontSize: 9, color: COLORS.black, fontFace: "Arial",
          });
          slide.addText(o.type_outil || "", {
            x: 5.2, y, w: 2, h: 0.38, fontSize: 8, color: COLORS.gray, fontFace: "Arial",
          });
          slide.addText(o.niveau_usage ? `Usage: ${o.niveau_usage}/5` : "", {
            x: 7.5, y, w: 2, h: 0.38, fontSize: 8, color: COLORS.gray, fontFace: "Arial",
          });
        });
        addFooter(slide, ++page);
      }

      // SLIDE 7: Equipes
      if (data.equipes.length > 0) {
        const slide = pptx.addSlide();
        addHeader(slide, `Equipes (${data.equipes.length})`);
        data.equipes.slice(0, 8).forEach((e, i) => {
          const y = 1.2 + i * 0.45;
          slide.addText(`${i + 1}. ${truncateText(e.nom, 25)}`, {
            x: 0.5, y, w: 2.5, h: 0.38, fontSize: 9, bold: true, color: COLORS.black, fontFace: "Arial",
          });
          slide.addText(truncateText(e.mission || "", 50), {
            x: 3.2, y, w: 4.5, h: 0.38, fontSize: 8, color: COLORS.gray, fontFace: "Arial",
          });
          slide.addText(e.charge_estimee ? `Charge: ${e.charge_estimee}/5` : "", {
            x: 7.8, y, w: 1.8, h: 0.38, fontSize: 8, color: COLORS.gray, fontFace: "Arial",
          });
        });
        addFooter(slide, ++page);
      }

      // SLIDE 8: Irritants
      if (data.irritants.length > 0) {
        const slide = pptx.addSlide();
        addHeader(slide, `Irritants (${data.irritants.length})`);
        const sorted = [...data.irritants].sort((a, b) => (b.gravite || 0) - (a.gravite || 0));
        sorted.slice(0, 6).forEach((ir, i) => {
          const y = 1.2 + i * 0.55;
          slide.addText(`${ir.intitule}`, {
            x: 0.5, y, w: 6, h: 0.4, fontSize: 9, bold: true, color: COLORS.black, fontFace: "Arial",
          });
          slide.addText(ir.impact || "", {
            x: 6.6, y, w: 2, h: 0.4, fontSize: 8, color: COLORS.gray, fontFace: "Arial",
          });
          slide.addText(ir.gravite ? `${ir.gravite}/5` : "", {
            x: 8.8, y, w: 0.8, h: 0.4, fontSize: 8, color: (ir.gravite || 0) >= 4 ? COLORS.danger : COLORS.warning, fontFace: "Arial",
          });
        });
        addFooter(slide, ++page);
      }

      // SLIDE 9: Analyse transversale
      if (session.ai_analyse_transversale) {
        const slide = pptx.addSlide();
        addHeader(slide, "Analyse transversale");
        addContentBox(slide, truncateText(session.ai_analyse_transversale, 1000), { x: 0.4, y: 1.2, w: 9.2, h: 3.6 });
        addFooter(slide, ++page);
      }

      // SLIDE 10: Vision cible
      if (session.ai_vision_cible) {
        const slide = pptx.addSlide();
        addHeader(slide, "Vision cible");
        addContentBox(slide, truncateText(session.ai_vision_cible, 1000), { x: 0.4, y: 1.2, w: 9.2, h: 3.6 });
        addFooter(slide, ++page);
      }

      // SLIDE 11: Plan optimisation
      if (session.ai_plan_optimisation) {
        const slide = pptx.addSlide();
        addHeader(slide, "Plan d'optimisation");
        addContentBox(slide, truncateText(session.ai_plan_optimisation, 1000), { x: 0.4, y: 1.2, w: 9.2, h: 3.6 });
        addFooter(slide, ++page);
      }

      // End slide
      addEndSlide(pptx);

      const fileName = `Cartographie_${session.nom.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pptx`;
      await pptx.writeFile({ fileName });

    } catch (err: unknown) {
      console.error("Erreur export PPTX Cartographie:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { generatePptx, isLoading, error };
}

export default useCartPptxExport;
