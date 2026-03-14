import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ContentLoader } from "./ContentLoader";

interface Props {
  children: React.ReactNode;
}

export function AuthGuard({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && !session.user.is_anonymous) {
        setAuthenticated(true);
      } else {
        navigate("/cartographie/login?redirect=" + encodeURIComponent(location.pathname), { replace: true });
      }
      setChecking(false);
    };
    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user || session.user.is_anonymous) {
        navigate("/cartographie/login?reason=expired", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  if (checking) return <ContentLoader message="Verification de votre session..." />;
  if (!authenticated) return null;

  return <>{children}</>;
}
