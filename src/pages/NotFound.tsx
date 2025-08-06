import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground">{t('notfound.title')}</h1>
        <p className="text-xl text-muted-foreground mb-4">{t('notfound.message')}</p>
        <Link to="/" className="text-primary hover:text-primary/80 underline">
          {t('notfound.back_home')}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
