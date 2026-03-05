import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCartContext } from "@/contexts/CartSessionContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRight, LogOut, User, Network } from "lucide-react";

interface Crumb {
  label: string;
  path?: string;
}

function useBreadcrumbs(): Crumb[] {
  const { pathname } = useLocation();
  const crumbs: Crumb[] = [{ label: "Cartographie", path: "/cartographie" }];

  if (pathname === "/cartographie/sessions" || pathname === "/cartographie/sessions/new") {
    crumbs.push({ label: "Sessions" });
  } else if (pathname.match(/\/cartographie\/sessions\/[^/]+\/pack\/\d+\/results/)) {
    crumbs.push({ label: "Sessions", path: "/cartographie/sessions" });
    crumbs.push({ label: "Dashboard", path: pathname.replace(/\/pack\/.*/, "") });
    const packNum = pathname.match(/pack\/(\d+)/)?.[1];
    crumbs.push({ label: `Pack ${packNum} — Resultats` });
  } else if (pathname.match(/\/cartographie\/sessions\/[^/]+\/pack\/\d+/)) {
    crumbs.push({ label: "Sessions", path: "/cartographie/sessions" });
    crumbs.push({ label: "Dashboard", path: pathname.replace(/\/pack\/.*/, "") });
    const packNum = pathname.match(/pack\/(\d+)/)?.[1];
    crumbs.push({ label: `Pack ${packNum}` });
  } else if (pathname.match(/\/cartographie\/sessions\/[^/]+/)) {
    crumbs.push({ label: "Sessions", path: "/cartographie/sessions" });
    crumbs.push({ label: "Dashboard" });
  }

  return crumbs;
}

interface CartLayoutProps {
  children: React.ReactNode;
}

export default function CartLayout({ children }: CartLayoutProps) {
  const navigate = useNavigate();
  const { userEmail, userName, signOut } = useCartContext();
  const crumbs = useBreadcrumbs();

  const handleSignOut = async () => {
    await signOut();
    navigate("/cartographie/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Slim top bar */}
      <header className="sticky top-0 z-50 h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-5 flex items-center justify-between gap-2">
        {/* Left: Logo + Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link to="/" className="shrink-0">
            <img
              src="/lovable-uploads/876ba1fd-d1e8-4a94-939e-0a2357028335.png"
              alt="Solutio"
              className="h-6 w-auto"
            />
          </Link>

          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground min-w-0">
            {crumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground/50" />}
                {crumb.path ? (
                  <Link to={crumb.path} className="hover:text-foreground transition-colors truncate max-w-[100px]">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium truncate max-w-[140px]">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Mobile: show only current page */}
          <div className="flex sm:hidden items-center gap-1.5 min-w-0">
            <Network className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <span className="text-xs font-medium truncate">
              {crumbs[crumbs.length - 1]?.label}
            </span>
          </div>
        </div>

        {/* Right: User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="hidden sm:inline text-xs text-muted-foreground max-w-[120px] truncate">
                {userName || userEmail || "Compte"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium truncate">{userName || "Utilisateur"}</p>
              {userEmail && <p className="text-xs text-muted-foreground truncate">{userEmail}</p>}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/cartographie/sessions")}>
              <Network className="w-3.5 h-3.5 mr-2" /> Mes sessions
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="w-3.5 h-3.5 mr-2" /> Se deconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Page content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
