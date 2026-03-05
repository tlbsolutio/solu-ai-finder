import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ContentLoader } from "./ContentLoader";

interface Props {
  children: React.ReactNode;
}

export function AuthGuard({ children }: Props) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && !session.user.is_anonymous) {
        setAuthenticated(true);
      } else {
        navigate("/cartographie/login", { replace: true });
      }
      setChecking(false);
    };
    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user || session.user.is_anonymous) {
        navigate("/cartographie/login", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (checking) return <ContentLoader />;
  if (!authenticated) return null;

  return <>{children}</>;
}
