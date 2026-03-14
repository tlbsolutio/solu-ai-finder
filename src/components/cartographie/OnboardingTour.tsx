import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";

interface OnboardingTourProps {
  packsCompleted: number;
}

const STEPS = [
  {
    selector: '[data-tour="step-1"]',
    title: "Repondez aux questionnaires",
    description: "Completez les packs thematiques pour alimenter votre diagnostic. Chaque pack prend environ 5 minutes.",
  },
  {
    selector: '[data-tour="step-2"]',
    title: "Suivez votre progression",
    description: "Le radar de maturite se construit au fur et a mesure de vos reponses. Visualisez vos forces et axes d'amelioration.",
  },
  {
    selector: '[data-tour="step-3"]',
    title: "Generez l'analyse complete",
    description: "Une fois 5 packs completes, lancez l'analyse IA pour obtenir votre plan d'actions personnalise.",
  },
];

const STORAGE_KEY = "carto_onboarding_done";

export function OnboardingTour({ packsCompleted }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; arrowDir: "up" | "down" | "left" } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (packsCompleted > 0) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    // Small delay so the page renders first
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, [packsCompleted]);

  const updatePosition = useCallback(() => {
    const step = STEPS[currentStep];
    if (!step) return;
    const target = document.querySelector(step.selector);
    if (!target) {
      setPosition(null);
      return;
    }
    const rect = target.getBoundingClientRect();
    const tooltipHeight = tooltipRef.current?.offsetHeight || 200;
    const tooltipWidth = tooltipRef.current?.offsetWidth || 320;

    // Prefer placing tooltip below the target
    let top = rect.bottom + 12;
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    let arrowDir: "up" | "down" | "left" = "up";

    // If tooltip would go below viewport, place above
    if (top + tooltipHeight > window.innerHeight - 20) {
      top = rect.top - tooltipHeight - 12;
      arrowDir = "down";
    }

    // Clamp horizontal
    if (left < 12) left = 12;
    if (left + tooltipWidth > window.innerWidth - 12) left = window.innerWidth - tooltipWidth - 12;

    setPosition({ top, left, arrowDir });
  }, [currentStep]);

  useEffect(() => {
    if (!visible) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [visible, currentStep, updatePosition]);

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  }, []);

  const next = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      dismiss();
    }
  }, [currentStep, dismiss]);

  if (!visible || !position) {
    // Still try to render invisible to measure, but only if visible
    if (!visible) return null;
    return (
      <div
        ref={tooltipRef}
        style={{ position: "fixed", visibility: "hidden", pointerEvents: "none", zIndex: -1 }}
        className="w-80"
      >
        <div className="p-4">
          <h4 className="font-semibold text-sm">{STEPS[currentStep]?.title}</h4>
          <p className="text-xs mt-1">{STEPS[currentStep]?.description}</p>
        </div>
      </div>
    );
  }

  const step = STEPS[currentStep];

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[1px]"
        onClick={dismiss}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[70] w-80 animate-fade-in-up"
        style={{ top: position.top, left: position.left }}
      >
        {/* Arrow */}
        {position.arrowDir === "up" && (
          <div className="flex justify-center -mt-2 mb-0">
            <div className="w-3 h-3 rotate-45 bg-card/95 border-l border-t border-cyan-300/60" />
          </div>
        )}

        <div className="rounded-xl border border-cyan-300/60 bg-card/95 backdrop-blur-md shadow-xl shadow-cyan-500/10 p-4">
          <h4 className="font-semibold text-sm text-foreground">{step.title}</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.description}</p>

          <div className="flex items-center justify-between mt-4">
            {/* Step dots */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === currentStep ? "bg-cyan-500" : i < currentStep ? "bg-cyan-300" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={dismiss}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
              >
                Passer
              </button>
              <Button
                size="sm"
                className="h-7 px-3 text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white"
                onClick={next}
              >
                {currentStep < STEPS.length - 1 ? "Suivant" : "Terminer"}
              </Button>
            </div>
          </div>
        </div>

        {/* Arrow below */}
        {position.arrowDir === "down" && (
          <div className="flex justify-center -mb-2 mt-0">
            <div className="w-3 h-3 rotate-45 bg-card/95 border-r border-b border-cyan-300/60" />
          </div>
        )}
      </div>
    </>
  );
}
