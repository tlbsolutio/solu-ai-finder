import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | Solutio Carto` : "Solutio Carto";
    return () => { document.title = prev; };
  }, [title]);
}
