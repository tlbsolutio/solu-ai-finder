import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAIL = "tlb@solutio.work";

interface CartSessionContextType {
  ownerId: string | null;
  userEmail: string | null;
  userName: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  ensureSession: () => Promise<string | null>;
  signOut: () => Promise<void>;
  /** Check if a specific cart session is paid */
  isSessionPaid: (sessionId: string) => boolean;
  /** Fetch paid status for a session (call once per dashboard load) */
  loadSessionTier: (sessionId: string) => Promise<boolean>;
  /** Legacy global isPaid — true only for admin */
  isPaid: boolean;
}

const CartSessionContext = createContext<CartSessionContextType | undefined>(undefined);

export function CartSessionProvider({ children }: { children: React.ReactNode }) {
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  // Cache of paid session IDs
  const [paidSessions, setPaidSessions] = useState<Set<string>>(new Set());

  const isAdmin = userEmail === ADMIN_EMAIL;

  const ensureSession = useCallback(async (): Promise<string | null> => {
    let { data: { session } } = await supabase.auth.getSession();
    if (!session) {
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
    setPaidSessions(new Set());
  }, []);

  const loadSessionTier = useCallback(async (sessionId: string): Promise<boolean> => {
    // Admin always has paid access
    if (userEmail === ADMIN_EMAIL) {
      setPaidSessions(prev => new Set(prev).add(sessionId));
      return true;
    }
    const { data } = await supabase
      .from("cart_subscriptions")
      .select("status")
      .eq("session_id", sessionId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    const paid = !!data;
    setPaidSessions(prev => {
      const next = new Set(prev);
      if (paid) next.add(sessionId);
      else next.delete(sessionId);
      return next;
    });
    return paid;
  }, [userEmail]);

  const isSessionPaid = useCallback((sessionId: string): boolean => {
    if (userEmail === ADMIN_EMAIL) return true;
    return paidSessions.has(sessionId);
  }, [paidSessions, userEmail]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const user = session.user;
        setOwnerId(user.id);
        setUserEmail(user.email || null);
        setUserName(user.user_metadata?.full_name || null);
        setIsAuthenticated(!user.is_anonymous);
      }
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

  return (
    <CartSessionContext.Provider value={{
      ownerId, userEmail, userName, isAuthenticated, isAdmin, loading,
      ensureSession, signOut,
      isSessionPaid, loadSessionTier,
      isPaid: isAdmin, // legacy — only admin gets global paid
    }}>
      {children}
    </CartSessionContext.Provider>
  );
}

export function useCartContext() {
  const ctx = useContext(CartSessionContext);
  if (!ctx) throw new Error("useCartContext must be used within CartSessionProvider");
  return ctx;
}
