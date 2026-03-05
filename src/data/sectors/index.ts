import btpData from "./btp.json";
import commerceData from "./commerce.json";
import servicesData from "./services.json";
import santeData from "./sante.json";
import industrieData from "./industrie.json";
import techData from "./tech.json";
import restaurationData from "./restauration.json";
import immobilierData from "./immobilier.json";
import transportData from "./transport.json";

export interface SectorKPI {
  nom: string;
  benchmark: string;
  unite: string;
}

export interface SectorData {
  id: string;
  nom: string;
  codesNAF: string[];
  motsCles: string[];
  vocabulaireConfirmation: string[];
  questionsDiscriminantes: string[];
  kpis: SectorKPI[];
  outilsMetiers: string[];
  reglementations: string[];
  risquesSpecifiques: string[];
}

export const SECTORS: SectorData[] = [
  btpData,
  commerceData,
  servicesData,
  santeData,
  industrieData,
  techData,
  restaurationData,
  immobilierData,
  transportData,
] as SectorData[];

export const SECTOR_MAP: Record<string, SectorData> = Object.fromEntries(
  SECTORS.map((s) => [s.id, s])
);

export function getSectorById(id: string): SectorData | null {
  return SECTOR_MAP[id] ?? null;
}

export function detectSectorByNAF(nafCode: string): SectorData | null {
  const prefix = nafCode.replace(/[^0-9]/g, "").slice(0, 2);
  if (!prefix) return null;
  return SECTORS.find((s) => s.codesNAF.some((naf) => prefix.startsWith(naf))) ?? null;
}

export function detectSectorByKeywords(text: string): { sector: SectorData; confidence: number } | null {
  const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let bestSector: SectorData | null = null;
  let bestScore = 0;

  for (const sector of SECTORS) {
    let score = 0;
    const allKeywords = [...sector.motsCles, ...sector.vocabulaireConfirmation];
    for (const kw of allKeywords) {
      const normalizedKw = kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalized.includes(normalizedKw)) {
        score += normalizedKw.length > 5 ? 2 : 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestSector = sector;
    }
  }

  if (!bestSector || bestScore === 0) return null;

  const confidence = Math.min(bestScore / 6, 1);
  return { sector: bestSector, confidence };
}
