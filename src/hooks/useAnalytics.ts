import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type AnalyticsEvent =
  | "pack_completed"
  | "gate_shown"
  | "gate_dismissed"
  | "pricing_viewed"
  | "payment_started"
  | "analysis_generated"
  | "pdf_exported"
  | "session_created"
  | "session_duplicated";

export function useAnalytics(sessionId?: string) {
  const track = useCallback(
    (event: AnalyticsEvent, metadata?: Record<string, unknown>) => {
      try {
        // Fire-and-forget: log to console in dev, could be extended to DB/external service
        if (import.meta.env.DEV) {
          console.log(`[Analytics] ${event}`, { sessionId, ...metadata });
        }
        // Log to Supabase (fire-and-forget, don't await)
        supabase
          .from("cart_analytics_events" as any)
          .insert({
            session_id: sessionId || null,
            event_name: event,
            metadata: metadata || {},
            created_at: new Date().toISOString(),
          })
          .then(() => {})
          .catch(() => {});
      } catch {
        // Analytics should never break the app
      }
    },
    [sessionId]
  );

  return { track };
}
