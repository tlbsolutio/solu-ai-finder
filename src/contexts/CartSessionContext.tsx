import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CartSessionContextType {
  ownerId: string | null;
  tier: "free" | "paid";
  isPaid: boolean;
  loading: boolean;
  ensureSession: () => Promise<string | null>;
  checkTier: () => Promise<void>;
}

const CartSessionContext = createContext<CartSessionContextType | undefined>(undefined);

export function CartSessionProvider({ children }: { children: React.ReactNode }) {
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [tier, setTier] = useState<"free" | "paid">("free");
  const [loading, setLoading] = useState(true);

  const ensureSession = useCallback(async (): Promise<string | null> => {
    let { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) { console.error("Anonymous auth error:", error); return null; }
      session = data.session;
    }
    const uid = session?.user?.id || null;
    setOwnerId(uid);
    return uid;
  }, []);

  const checkTier = useCallback(async () => {
    if (!ownerId) return;
    const { data } = await supabase
      .from("cart_subscriptions")
      .select("status")
      .eq("owner_id", ownerId)
      .eq("status", "active")
      .limit(1)
      .single();
    setTier(data ? "paid" : "free");
  }, [ownerId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await ensureSession();
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setOwnerId(session?.user?.id || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (ownerId) checkTier(); }, [ownerId, checkTier]);

  return (
    <CartSessionContext.Provider value={{ ownerId, tier, isPaid: tier === "paid", loading, ensureSession, checkTier }}>
      {children}
    </CartSessionContext.Provider>
  );
}

export function useCartContext() {
  const ctx = useContext(CartSessionContext);
  if (!ctx) throw new Error("useCartContext must be used within CartSessionProvider");
  return ctx;
}
