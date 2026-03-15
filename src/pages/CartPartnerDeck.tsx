import { useState } from "react";
import PptxGenJS from "pptxgenjs";
import { COLORS, createPptx } from "@/lib/pptxUtils";
import { SAAS_CATALOG } from "@/lib/saasRecommendations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Presentation, Download, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";

// Build catalog summary grouped by category
function buildCatalogSummary(): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const s of SAAS_CATALOG) {
    if (!map[s.categorie]) map[s.categorie] = [];
    if (!map[s.categorie].includes(s.nom)) {
      map[s.categorie].push(s.nom);
    }
  }
  return map;
}

function addPartnerFooter(slide: PptxGenJS.Slide, pageNumber: number) {
  slide.addText(`Solutio — Partner Deck 2026  |  Page ${pageNumber}`, {
    x: 0.5, y: 5.2, w: 9, h: 0.3,
    color: COLORS.gray, fontSize: 7, fontFace: "Arial",
  });
}

function addPartnerHeader(slide: PptxGenJS.Slide, title: string) {
  slide.addShape("rect", { x: 0, y: 0, w: "100%", h: 0.7, fill: { color: COLORS.primary } });
  slide.addText(title, {
    x: 0.5, y: 0.12, w: 9, h: 0.46,
    color: COLORS.white, fontSize: 16, bold: true, fontFace: "Arial",
  });
}

function addBulletList(
  slide: PptxGenJS.Slide,
  items: string[],
  opts: { x: number; y: number; w: number; fontSize?: number }
) {
  const { x, y, w, fontSize = 10 } = opts;
  items.forEach((item, i) => {
    slide.addText(item, {
      x,
      y: y + i * 0.42,
      w,
      h: 0.38,
      color: COLORS.black,
      fontSize,
      fontFace: "Arial",
      valign: "top",
      wrap: true,
    });
  });
}

async function generatePartnerDeck() {
  const pptx = createPptx();
  pptx.title = "Solutio Partner Deck";
  pptx.subject = "SaaS Partnership Program";

  // ── SLIDE 1: Title ──
  const s1 = pptx.addSlide();
  s1.background = { color: COLORS.darkBg };
  s1.addText("Solutio", {
    x: 1, y: 1.0, w: 8, h: 0.8,
    color: COLORS.white, fontSize: 36, bold: true, fontFace: "Arial", align: "center",
  });
  s1.addText("SaaS Partnership Program", {
    x: 1, y: 1.9, w: 8, h: 0.6,
    color: COLORS.gold, fontSize: 20, bold: true, fontFace: "Arial", align: "center",
  });
  s1.addText("Contextual SaaS Recommendations for French SMEs", {
    x: 1, y: 2.7, w: 8, h: 0.5,
    color: COLORS.white, fontSize: 13, fontFace: "Arial", align: "center",
  });
  s1.addText("solutio.work", {
    x: 1, y: 3.8, w: 8, h: 0.4,
    color: COLORS.gray, fontSize: 11, fontFace: "Arial", align: "center",
  });

  // ── SLIDE 2: About Solutio ──
  const s2 = pptx.addSlide();
  addPartnerHeader(s2, "About Solutio");
  addBulletList(s2, [
    "Solutio is an AI-powered organizational diagnostic platform for French SMEs (TPE/PME).",
    "Our users complete a comprehensive 10-pack diagnostic covering: Organization, Clients, HR, Processes, Tools, Communication, Quality, KPIs, and more.",
    "AI generates detailed analysis: maturity scores, pain points, action plans, ROI estimates.",
    "Output: Professional PDF/PPTX reports with concrete recommendations.",
  ].map(t => `  ${t}`), { x: 0.4, y: 1.2, w: 9.2, fontSize: 11 });
  addPartnerFooter(s2, 2);

  // ── SLIDE 3: How It Works ──
  const s3 = pptx.addSlide();
  addPartnerHeader(s3, "How It Works");
  addBulletList(s3, [
    "Step 1:  User completes diagnostic questionnaires (150 questions across 10 packs).",
    "Step 2:  AI analyzes responses, identifies pain points and opportunities.",
    "Step 3:  Platform recommends specific SaaS tools based on detected needs.",
    "Step 4:  User sees contextual recommendations with direct links.",
    "",
    "Each recommendation is matched to the user's specific pain points — not generic ads.",
  ].map(t => `  ${t}`), { x: 0.4, y: 1.2, w: 9.2, fontSize: 11 });
  addPartnerFooter(s3, 3);

  // ── SLIDE 4: Our Audience ──
  const s4 = pptx.addSlide();
  addPartnerHeader(s4, "Our Audience");
  const catalogSummary = buildCatalogSummary();
  const categoryCount = Object.keys(catalogSummary).length;
  const toolCount = SAAS_CATALOG.length;
  const categoryList = Object.keys(catalogSummary).join(", ");
  addBulletList(s4, [
    "Target: French SMEs (2-250 employees) undergoing digital transformation.",
    "Decision makers: CEOs, COOs, Operations Directors, IT Managers.",
    "High intent: Users actively diagnosing their organization to improve.",
    `${toolCount} SaaS tools currently recommended across ${categoryCount} categories.`,
    `Categories: ${categoryList}.`,
  ].map(t => `  ${t}`), { x: 0.4, y: 1.2, w: 9.2, fontSize: 11 });
  addPartnerFooter(s4, 4);

  // ── SLIDE 5: Value Proposition ──
  const s5 = pptx.addSlide();
  addPartnerHeader(s5, "Value Proposition for SaaS Partners");
  addBulletList(s5, [
    "Qualified leads: Users have diagnosed a specific need YOUR tool solves.",
    "Contextual placement: Your tool appears when relevant pain points are detected.",
    "Trust: Recommendations come from an AI diagnostic, not generic advertising.",
    "Full funnel: From diagnostic to pain point identification to tool recommendation to signup.",
    "Transparent: Users see pricing, features, and alternatives.",
  ].map(t => `  ${t}`), { x: 0.4, y: 1.2, w: 9.2, fontSize: 11 });
  addPartnerFooter(s5, 5);

  // ── SLIDE 6: Partnership Model ──
  const s6 = pptx.addSlide();
  addPartnerHeader(s6, "Partnership Model");
  addBulletList(s6, [
    "Affiliate / referral link integration.",
    "Your tool appears in diagnostic results when relevant needs are identified.",
    "We support: Impact, ShareASale, CJ, Awin, FirstPromoter, or direct partnerships.",
    "Commission models: CPA, Revenue Share, or Hybrid.",
    "No exclusivity — we recommend the best tools for each use case.",
  ].map(t => `  ${t}`), { x: 0.4, y: 1.2, w: 9.2, fontSize: 11 });
  addPartnerFooter(s6, 6);

  // ── SLIDE 7: Current SaaS Catalog ──
  const s7 = pptx.addSlide();
  addPartnerHeader(s7, "Current SaaS Partners / Catalog");
  const categories = Object.entries(catalogSummary);
  const colSize = Math.ceil(categories.length / 2);
  const leftCol = categories.slice(0, colSize);
  const rightCol = categories.slice(colSize);

  leftCol.forEach(([cat, tools], i) => {
    const y = 1.1 + i * 0.5;
    s7.addText(cat, {
      x: 0.5, y, w: 4, h: 0.22,
      color: COLORS.primary, fontSize: 9, bold: true, fontFace: "Arial",
    });
    s7.addText(tools.join(", "), {
      x: 0.5, y: y + 0.2, w: 4.2, h: 0.22,
      color: COLORS.gray, fontSize: 8, fontFace: "Arial",
    });
  });

  rightCol.forEach(([cat, tools], i) => {
    const y = 1.1 + i * 0.5;
    s7.addText(cat, {
      x: 5.3, y, w: 4, h: 0.22,
      color: COLORS.primary, fontSize: 9, bold: true, fontFace: "Arial",
    });
    s7.addText(tools.join(", "), {
      x: 5.3, y: y + 0.2, w: 4.2, h: 0.22,
      color: COLORS.gray, fontSize: 8, fontFace: "Arial",
    });
  });

  s7.addText(`${toolCount} tools across ${categoryCount} categories — growing.`, {
    x: 0.5, y: 4.8, w: 9, h: 0.3,
    color: COLORS.black, fontSize: 10, bold: true, fontFace: "Arial",
  });
  addPartnerFooter(s7, 7);

  // ── SLIDE 8: Contact ──
  const s8 = pptx.addSlide();
  s8.background = { color: COLORS.darkBg };
  s8.addText("Let's Partner", {
    x: 1, y: 0.8, w: 8, h: 0.7,
    color: COLORS.white, fontSize: 28, bold: true, fontFace: "Arial", align: "center",
  });
  const contactItems = [
    "Thomas Le Berre — Founder & CEO",
    "Email: tlb@solutio.work",
    "Platform: https://solutio.work",
    "Based in Normandy, France",
    "",
    "Let's discuss how Solutio can drive qualified users to your platform.",
  ];
  contactItems.forEach((line, i) => {
    s8.addText(line, {
      x: 1, y: 1.9 + i * 0.42, w: 8, h: 0.38,
      color: i === contactItems.length - 1 ? COLORS.gold : COLORS.white,
      fontSize: i === contactItems.length - 1 ? 11 : 12,
      fontFace: "Arial",
      align: "center",
      italic: i === contactItems.length - 1,
    });
  });

  await pptx.writeFile({ fileName: "Solutio_Partner_Deck_2026.pptx" });
}

const SLIDE_PREVIEWS = [
  { title: "Title Slide", desc: "Solutio — SaaS Partnership Program" },
  { title: "About Solutio", desc: "AI-powered diagnostic platform for French SMEs" },
  { title: "How It Works", desc: "4-step flow from diagnostic to SaaS recommendation" },
  { title: "Our Audience", desc: "Target audience, decision makers, intent signals" },
  { title: "Value Proposition", desc: "Qualified leads, contextual placement, trust" },
  { title: "Partnership Model", desc: "Affiliate networks, commission models, no exclusivity" },
  { title: "SaaS Catalog", desc: "28 tools across 14 categories" },
  { title: "Contact", desc: "Thomas Le Berre — tlb@solutio.work" },
];

const CartPartnerDeck = () => {
  usePageTitle("Partner Deck");
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generatePartnerDeck();
    } catch (err) {
      console.error("Error generating partner deck:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 sm:px-6 pt-5 pb-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/cartographie/admin")}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Admin
            </Button>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight flex items-center gap-2">
                <Presentation className="w-5 h-5 text-primary" />
                Partner Deck
              </h1>
              <p className="text-sm text-muted-foreground">
                Professional PPTX deck for SaaS partnership outreach
              </p>
            </div>
          </div>
          <Button onClick={handleDownload} disabled={downloading} className="gap-2">
            <Download className="w-4 h-4" />
            {downloading ? "Generating..." : "Download Partner Deck"}
          </Button>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 pb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Deck Contents — 8 Slides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SLIDE_PREVIEWS.map((slide, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{slide.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{slide.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CartPartnerDeck;
