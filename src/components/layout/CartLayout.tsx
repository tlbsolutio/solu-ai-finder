import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCartContext } from "@/contexts/CartSessionContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRight, LogOut, User, Network, Shield, LayoutDashboard, Crown, HelpCircle } from "lucide-react";

interface Crumb {
  label: string;
  path?: string;
}

function useBreadcrumbs(): Crumb[] {
  const { pathname } = useLocation();
  const crumbs: Crumb[] = [];

  if (pathname === "/cartographie/sessions" || pathname === "/cartographie/sessions/new") {
    crumbs.push({ label: "Diagnostics" });
  } else if (pathname.match(/\/cartographie\/sessions\/[^/]+\/pack\/\d+\/results/)) {
    crumbs.push({ label: "Diagnostics", path: "/cartographie/sessions" });
    crumbs.push({ label: "Dashboard", path: pathname.replace(/\/pack\/.*/, "") });
    const packNum = pathname.match(/pack\/(\d+)/)?.[1];
    crumbs.push({ label: `Pack ${packNum} — Resultats` });
  } else if (pathname.match(/\/cartographie\/sessions\/[^/]+\/pack\/\d+/)) {
    crumbs.push({ label: "Diagnostics", path: "/cartographie/sessions" });
    crumbs.push({ label: "Dashboard", path: pathname.replace(/\/pack\/.*/, "") });
    const packNum = pathname.match(/pack\/(\d+)/)?.[1];
    crumbs.push({ label: `Pack ${packNum}` });
  } else if (pathname.match(/\/cartographie\/sessions\/[^/]+/)) {
    crumbs.push({ label: "Diagnostics", path: "/cartographie/sessions" });
    crumbs.push({ label: "Dashboard" });
  } else if (pathname === "/cartographie/admin") {
    crumbs.push({ label: "Admin" });
  } else if (pathname === "/cartographie/pricing") {
    crumbs.push({ label: "Tarifs" });
  } else if (pathname === "/cartographie/payment-success") {
    crumbs.push({ label: "Confirmation" });
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
      {/* App header */}
      <header className="sticky top-0 z-50 h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-5 flex items-center justify-between gap-2">
        {/* Left: Product identity + Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link to="/cartographie/sessions" className="flex items-center gap-2 shrink-0 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Network className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="hidden sm:flex items-baseline gap-1">
              <span className="text-sm font-bold tracking-tight text-foreground">Solutio</span>
              <span className="text-sm font-bold tracking-tight text-cyan-600">Carto</span>
            </div>
          </Link>

          {crumbs.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground min-w-0">
              <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground/40" />
              {crumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground/40" />}
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
          )}

          {/* Mobile: show only current page */}
          <div className="flex sm:hidden items-center gap-1.5 min-w-0">
            <span className="text-xs font-medium truncate">
              {crumbs[crumbs.length - 1]?.label || "Carto"}
            </span>
          </div>
        </div>

        {/* Right: User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2">
              <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-cyan-600" />
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
              <LayoutDashboard className="w-3.5 h-3.5 mr-2" /> Mes diagnostics
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/cartographie/pricing")}>
              <Crown className="w-3.5 h-3.5 mr-2 text-amber-500" /> Passer en Premium
            </DropdownMenuItem>
            {userEmail === "tlb@solutio.work" && (
              <DropdownMenuItem onClick={() => navigate("/cartographie/admin")}>
                <Shield className="w-3.5 h-3.5 mr-2" /> Administration
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.open("mailto:contact@solutio.work", "_blank")}>
              <HelpCircle className="w-3.5 h-3.5 mr-2" /> Aide & Support
            </DropdownMenuItem>
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
