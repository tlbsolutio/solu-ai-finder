import { CircleDot, ChevronRight } from "lucide-react";

interface FormattedTextProps {
  text: string;
  variant?: "success" | "destructive" | "warning" | "default";
}

export const FormattedText = ({ text, variant = "default" }: FormattedTextProps) => {
  const lines = text.split('\n').filter(Boolean);

  const variantColors = {
    success: "text-green-600 dark:text-green-400",
    destructive: "text-red-600 dark:text-red-400",
    warning: "text-orange-600 dark:text-orange-400",
    default: "text-primary"
  };

  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        if (line.trim().endsWith(':')) {
          return <h4 key={idx} className="font-semibold text-base mt-3 first:mt-0">{line}</h4>;
        }
        if (line.trim().match(/^[•\-]/)) {
          const content = line.replace(/^[•\-]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2">
              <CircleDot className={`h-4 w-4 mt-0.5 flex-shrink-0 ${variantColors[variant]}`} />
              <p className="text-sm flex-1">{content}</p>
            </div>
          );
        }
        if (line.trim().match(/^\s+[•\-]/)) {
          const content = line.replace(/^\s+[•\-]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 ml-6">
              <ChevronRight className={`h-3 w-3 mt-0.5 flex-shrink-0 ${variantColors[variant]}`} />
              <p className="text-xs flex-1 text-muted-foreground">{content}</p>
            </div>
          );
        }
        // Handle **bold** markers
        const parts = line.split(/\*\*(.*?)\*\*/g);
        if (parts.length > 1) {
          return (
            <p key={idx} className="text-sm leading-relaxed mb-1">
              {parts.map((part, i) =>
                i % 2 === 1 ? <strong key={i} className="font-semibold text-foreground">{part}</strong> : <span key={i}>{part}</span>
              )}
            </p>
          );
        }
        return <p key={idx} className="text-sm leading-relaxed">{line}</p>;
      })}
    </div>
  );
};
