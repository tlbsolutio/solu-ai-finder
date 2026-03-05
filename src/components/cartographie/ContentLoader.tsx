import { Loader2 } from "lucide-react";

interface ContentLoaderProps {
  message?: string;
}

export const ContentLoader = ({ message = "Chargement..." }: ContentLoaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
      {message && <p className="mt-3 text-muted-foreground text-sm">{message}</p>}
    </div>
  );
};
