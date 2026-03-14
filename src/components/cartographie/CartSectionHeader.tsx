import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon: React.ElementType;
  count?: number;
  actionLabel?: string;
  onAction?: () => void;
}

export const CartSectionHeader = React.memo(function CartSectionHeader({
  title, description, icon: SIcon, count, actionLabel, onAction,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
          <SIcon className="w-4 h-4 text-cyan-600" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold flex items-center gap-2">
            {title}
            {count !== undefined && count > 0 && (
              <Badge variant="secondary" className="text-xs font-normal">{count}</Badge>
            )}
          </h2>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      {actionLabel && onAction && (
        <Button size="sm" variant="outline" className="shrink-0 text-xs h-8" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
});
