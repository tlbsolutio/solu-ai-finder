import React, { useState } from "react";
import { CircleDot, ChevronRight, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FormattedTextProps {
  text: string;
  variant?: "success" | "destructive" | "warning" | "default";
  collapseThreshold?: number;
}

const PRIORITY_COLORS: Record<string, string> = {
  P1: "bg-green-100 text-green-800 border-green-300",
  P2: "bg-blue-100 text-blue-800 border-blue-300",
  P3: "bg-gray-100 text-gray-600 border-gray-300",
};

const PACK_BADGE = "bg-purple-100 text-purple-700 border-purple-300";

function renderInlineFormatting(text: string) {
  const parts: React.ReactNode[] = [];
  // Match **bold**, P1/P2/P3 labels, and Pack X references
  const regex = /(\*\*(.*?)\*\*|\b(P[123])\b|(Pack\s+\d+))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      // **bold**
      parts.push(<strong key={match.index} className="font-semibold text-foreground">{match[2]}</strong>);
    } else if (match[3]) {
      // P1, P2, P3
      const p = match[3];
      parts.push(
        <Badge key={match.index} variant="outline" className={`text-[10px] px-1.5 py-0 mx-0.5 ${PRIORITY_COLORS[p] || ""}`}>
          {p}
        </Badge>
      );
    } else if (match[4]) {
      // Pack X
      parts.push(
        <Badge key={match.index} variant="outline" className={`text-[10px] px-1.5 py-0 mx-0.5 ${PACK_BADGE}`}>
          {match[4]}
        </Badge>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : [text];
}

export const FormattedText = React.memo(function FormattedText({ text: rawText, variant = "default", collapseThreshold = 500 }: FormattedTextProps) {
  const [expanded, setExpanded] = useState(false);
  // Defensive: handle JSONB objects that may arrive instead of strings
  const text = typeof rawText === "string"
    ? rawText
    : (rawText && typeof rawText === "object" && "content" in (rawText as any))
      ? String((rawText as any).content)
      : (rawText ? JSON.stringify(rawText, null, 2) : "");
  const lines = text.split("\n").filter(Boolean);
  const isLong = text.length > collapseThreshold;

  const variantColors = {
    success: "text-green-600 dark:text-green-400",
    destructive: "text-red-600 dark:text-red-400",
    warning: "text-orange-600 dark:text-orange-400",
    default: "text-primary",
  };

  const renderLine = (line: string, idx: number) => {
    const trimmed = line.trim();

    // Section headers: ## Heading or **Heading**
    if (trimmed.startsWith("## ")) {
      return (
        <h4 key={idx} className="font-semibold text-base mt-4 mb-1 first:mt-0 text-foreground">
          {renderInlineFormatting(trimmed.replace(/^##\s*/, ""))}
        </h4>
      );
    }
    if (/^\*\*[^*]+\*\*\s*$/.test(trimmed)) {
      const heading = trimmed.replace(/^\*\*/, "").replace(/\*\*\s*$/, "");
      return (
        <h4 key={idx} className="font-semibold text-base mt-4 mb-1 first:mt-0 text-foreground">
          {heading}
        </h4>
      );
    }

    // Lines ending with colon = sub-header
    if (trimmed.endsWith(":") && trimmed.length < 100) {
      return (
        <h4 key={idx} className="font-semibold text-sm mt-3 first:mt-0 text-foreground">
          {renderInlineFormatting(trimmed)}
        </h4>
      );
    }

    // Bullet points (top-level): •, -, *
    if (/^[•\-*]\s/.test(trimmed)) {
      const content = trimmed.replace(/^[•\-*]\s*/, "");
      return (
        <div key={idx} className="flex items-start gap-2 border-l-2 border-primary/20 pl-3 py-0.5">
          <CircleDot className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${variantColors[variant]}`} />
          <p className="text-sm flex-1">{renderInlineFormatting(content)}</p>
        </div>
      );
    }

    // Sub-bullet points (indented)
    if (/^\s+[•\-*]\s/.test(line)) {
      const content = line.replace(/^\s+[•\-*]\s*/, "");
      return (
        <div key={idx} className="flex items-start gap-2 ml-6 border-l-2 border-muted pl-3 py-0.5">
          <ChevronRight className={`h-3 w-3 mt-0.5 flex-shrink-0 ${variantColors[variant]}`} />
          <p className="text-xs flex-1 text-muted-foreground">{renderInlineFormatting(content)}</p>
        </div>
      );
    }

    // Regular paragraph with inline formatting
    return (
      <p key={idx} className="text-sm leading-relaxed">
        {renderInlineFormatting(trimmed)}
      </p>
    );
  };

  // Determine which lines to show
  let visibleLines = lines;
  if (isLong && !expanded) {
    let charCount = 0;
    let cutoff = lines.length;
    for (let i = 0; i < lines.length; i++) {
      charCount += lines[i].length;
      if (charCount >= collapseThreshold) {
        cutoff = i + 1;
        break;
      }
    }
    visibleLines = lines.slice(0, cutoff);
  }

  return (
    <div className="space-y-1.5">
      <div className={`space-y-1.5 ${isLong && !expanded ? "max-h-[300px] overflow-hidden relative" : ""}`}>
        {visibleLines.map((line, idx) => renderLine(line, idx))}
        {isLong && !expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none" />
        )}
      </div>
      {isLong && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronDown className="w-3 h-3 mr-1 rotate-180" />
              Voir moins
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 mr-1" />
              Voir plus
            </>
          )}
        </Button>
      )}
    </div>
  );
});
