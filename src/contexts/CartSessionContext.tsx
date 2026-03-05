import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAIL = "tlb@solutio.work";

interface CartSessionContextType {
  ownerId: string | null;
  userEmail: string | null;
  userName: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  tier: "free" | "paid";
  isPaid: boolean;
  loading: boolean;
  ensureSession: () => Promise<string | null>;
  checkTier: () => Promise<void>;
  signOut: () => Promise<void>;
}

const CartSessionContext = createContext<CartSessionContextType | undefined>(undefined);

export function CartSessionProvider({ children }: { children: React.ReactNode }) {
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tier, setTier] = useState<"free" | "paid">("free");
  const [loading, setLoading] = useState(true);

  const ensureSession = useCallback(async (): Promise<string | null> => {
    let { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // For QuickScan (public), use anonymous auth
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) { console.error("Anonymous auth error:", error); return null; }
      session = data.session;
    }
    const user = session?.user;
    const uid = user?.id || null;
    setOwnerId(uid);
    setUserEmail(user?.email || null);
    setUserName(user?.user_metadata?.full_name || null);
    setIsAuthenticated(!!user && !user.is_anonymous);
    return uid;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setOwnerId(null);
    setUserEmail(null);
    setUserName(null);
    setIsAuthenticated(false);
  }, []);

  const checkTier = useCallback(async () => {
    if (!ownerId) return;
    // Admin always has paid access
    if (userEmail === ADMIN_EMAIL) {
      setTier("paid");
      return;
    }
    const { data } = await supabase
      .from("cart_subscriptions")
      .select("status")
      .eq("owner_id", ownerId)
      .eq("status", "active")
      .limit(1)
      .single();
    setTier(data ? "paid" : "free");
  }, [ownerId, userEmail]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await ensureSession();
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setOwnerId(user?.id || null);
      setUserEmail(user?.email || null);
      setUserName(user?.user_metadata?.full_name || null);
      setIsAuthenticated(!!user && !user.is_anonymous);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (ownerId) checkTier(); }, [ownerId, checkTier]);

  return (
    <CartSessionContext.Provider value={{ ownerId, userEmail, userName, isAuthenticated, isAdmin: userEmail === ADMIN_EMAIL, tier, isPaid: tier === "paid", loading, ensureSession, checkTier, signOut }}>
      {children}
    </CartSessionContext.Provider>
  );
}

export function useCartContext() {
  const ctx = useContext(CartSessionContext);
  if (!ctx) throw new Error("useCartContext must be used within CartSessionProvider");
  return ctx;
}
