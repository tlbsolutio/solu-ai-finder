import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaywallOverlayProps {
  onUnlock: () => void;
  itemCount?: number;
  label?: string;
}

export function PaywallOverlay({ onUnlock, itemCount, label = "elements" }: PaywallOverlayProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
      {/* Gradient fade from transparent to solid */}
      <div
        className="h-32"
        style={{
          background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0.95) 70%, rgba(255,255,255,1) 100%)",
        }}
      />
      {/* Glassmorphism card */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl pb-6 pt-2 px-4">
        <div className="max-w-sm mx-auto text-center space-y-3 pointer-events-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-500/15 border border-cyan-200/40 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">
              {itemCount && itemCount > 0
                ? `+ ${itemCount} autres ${label}`
                : `Contenu ${label} reserve`}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Debloquez la version complete pour voir l'ensemble du diagnostic
            </p>
          </div>
          <Button
            onClick={onUnlock}
            className="w-full max-w-[260px] h-10 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:opacity-90 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Sparkles className="w-4 h-4 mr-2" />
            Debloquer
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
