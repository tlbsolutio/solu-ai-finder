import { Loader2 } from "lucide-react";

interface ContentLoaderProps {
  message?: string;
  variant?: "spinner" | "skeleton";
}

export const ContentLoader = ({ message = "Chargement...", variant = "spinner" }: ContentLoaderProps) => {
  if (variant === "skeleton") {
    return (
      <div className="flex-1 px-4 sm:px-6 py-6 space-y-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="skeleton w-10 h-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <div className="skeleton h-4 w-48" />
            <div className="skeleton h-3 w-32" />
          </div>
        </div>
        <div className="skeleton h-2 w-full rounded-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 animate-fade-in-up">
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
      {message && <p className="mt-4 text-muted-foreground text-sm">{message}</p>}
    </div>
  );
};
