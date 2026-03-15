import { useState, useEffect, useCallback, useRef, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCartContext } from "@/contexts/CartSessionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ExternalLink, Download, Filter, Edit2, Check, X, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";

const ADMIN_EMAIL = "tlb@solutio.work";

type AffiliateStatus = "not_started" | "applied" | "approved" | "rejected" | "active";

interface AffiliateRow {
  id: string;
  saas_name: string;
  category: string;
  site_url: string;
  affiliate_url: string | null;
  affiliate_network: string | null;
  commission_type: string | null;
  commission_value: string | null;
  contact_email: string | null;
  notes: string | null;
  status: AffiliateStatus;
  applied_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_OPTIONS: { value: AffiliateStatus; label: string }[] = [
  { value: "not_started", label: "Non demarre" },
  { value: "applied", label: "Candidature" },
  { value: "approved", label: "Approuve" },
  { value: "rejected", label: "Rejete" },
  { value: "active", label: "Actif" },
];

const STATUS_COLORS: Record<AffiliateStatus, string> = {
  not_started: "bg-gray-100 text-gray-700 border-gray-300",
  applied: "bg-blue-50 text-blue-700 border-blue-300",
  approved: "bg-green-50 text-green-700 border-green-300",
  rejected: "bg-red-50 text-red-700 border-red-300",
  active: "bg-emerald-500 text-white border-emerald-600",
};

const ALL_CATEGORIES = [
  "CRM", "ERP", "Gestion de projet", "RH", "Communication", "Collaboration",
  "Comptabilite", "Automatisation", "BI & Reporting", "Qualite & Conformite",
  "Marketing", "Service client", "Gestion documentaire", "Signature electronique",
];

type EditableField = "affiliate_url" | "commission_type" | "commission_value" | "affiliate_network" | "contact_email" | "notes";

const CartAffiliateManager = () => {
  usePageTitle("Gestion Affiliations");
  const navigate = useNavigate();
  const { userEmail, loading: ctxLoading } = useCartContext();
  const { toast } = useToast();

  const [rows, setRows] = useState<AffiliateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Inline editing state
  const [editingCell, setEditingCell] = useState<{ id: string; field: EditableField } | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Admin guard
  useEffect(() => {
    if (!ctxLoading && userEmail !== ADMIN_EMAIL) {
      navigate("/cartographie/sessions", { replace: true });
    }
  }, [ctxLoading, userEmail, navigate]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cart_affiliate_tracking" as any)
        .select("*")
        .order("category")
        .order("saas_name");
      if (error) throw error;
      setRows((data || []) as unknown as AffiliateRow[]);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (userEmail === ADMIN_EMAIL) loadData();
  }, [userEmail, loadData]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const startEdit = (id: string, field: EditableField, currentValue: string | null) => {
    setEditingCell({ id, field });
    setEditValue(currentValue || "");
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    if (!editingCell) return;
    const { id, field } = editingCell;
    const newValue = editValue.trim() || null;

    try {
      const { error } = await supabase
        .from("cart_affiliate_tracking" as any)
        .update({ [field]: newValue, updated_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;

      setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: newValue } : r));
      toast({ title: "Sauvegarde" });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
    cancelEdit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") cancelEdit();
  };

  const updateStatus = async (id: string, newStatus: AffiliateStatus) => {
    try {
      const updates: Record<string, any> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (newStatus === "applied") updates.applied_at = new Date().toISOString();
      if (newStatus === "approved") updates.approved_at = new Date().toISOString();

      const { error } = await supabase
        .from("cart_affiliate_tracking" as any)
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;

      setRows(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
      toast({ title: `Statut mis a jour: ${newStatus}` });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const exportCSV = () => {
    const headers = ["Nom", "Categorie", "Reseau", "Statut", "Commission Type", "Commission Valeur", "URL Affiliation", "Contact", "Notes", "Date candidature", "Date approbation"];
    const csvRows = [headers.join(",")];
    for (const r of rows) {
      csvRows.push([
        `"${r.saas_name}"`,
        `"${r.category}"`,
        `"${r.affiliate_network || ""}"`,
        `"${r.status}"`,
        `"${r.commission_type || ""}"`,
        `"${r.commission_value || ""}"`,
        `"${r.affiliate_url || ""}"`,
        `"${r.contact_email || ""}"`,
        `"${(r.notes || "").replace(/"/g, '""')}"`,
        `"${r.applied_at || ""}"`,
        `"${r.approved_at || ""}"`,
      ].join(","));
    }
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `affiliations_solutio_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (ctxLoading || (userEmail === ADMIN_EMAIL && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (userEmail !== ADMIN_EMAIL) return null;

  // Filtered rows
  const filtered = rows.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
    return true;
  });

  // Stats
  const total = rows.length;
  const applied = rows.filter(r => r.status === "applied").length;
  const approved = rows.filter(r => r.status === "approved").length;
  const active = rows.filter(r => r.status === "active").length;
  const potentialRevenue = rows.filter(r => r.status === "active" && r.commission_value).length;

  const renderEditableCell = (row: AffiliateRow, field: EditableField, displayValue: string | null) => {
    const isEditing = editingCell?.id === row.id && editingCell?.field === field;
    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input
            ref={inputRef}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={saveEdit}
            className="h-7 text-xs w-full min-w-[100px]"
          />
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0" onMouseDown={e => { e.preventDefault(); saveEdit(); }}>
            <Check className="w-3 h-3 text-green-600" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0" onMouseDown={e => { e.preventDefault(); cancelEdit(); }}>
            <X className="w-3 h-3 text-red-500" />
          </Button>
        </div>
      );
    }
    return (
      <button
        className="flex items-center gap-1 text-left text-xs hover:bg-muted/50 rounded px-1 py-0.5 w-full group cursor-pointer"
        onClick={() => startEdit(row.id, field, displayValue)}
      >
        <span className="truncate">{displayValue || <span className="text-muted-foreground italic">--</span>}</span>
        <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
      </button>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 sm:px-6 pt-5 pb-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            <div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Gestion Affiliations SaaS</h1>
              <p className="text-sm text-muted-foreground">Suivi des partenariats d'affiliation pour le catalogue SaaS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/cartographie/admin")}>
              Retour Admin
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-1.5" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total outils", value: total, color: "text-slate-700" },
            { label: "Candidatures", value: applied, color: "text-blue-600" },
            { label: "Approuves", value: approved, color: "text-green-600" },
            { label: "Actifs", value: active, color: "text-emerald-600" },
            { label: "Avec commission", value: potentialRevenue, color: "text-amber-600" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {STATUS_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px] h-8 text-xs">
              <SelectValue placeholder="Categorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les categories</SelectItem>
              {ALL_CATEGORIES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} / {total} outils affiches
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 px-4 sm:px-6 pb-6">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[140px]">Nom</TableHead>
                    <TableHead className="min-w-[120px]">Categorie</TableHead>
                    <TableHead className="min-w-[100px]">Reseau</TableHead>
                    <TableHead className="min-w-[120px]">Statut</TableHead>
                    <TableHead className="min-w-[140px]">Commission</TableHead>
                    <TableHead className="min-w-[180px]">URL Affiliation</TableHead>
                    <TableHead className="min-w-[140px]">Contact</TableHead>
                    <TableHead className="min-w-[140px]">Notes</TableHead>
                    <TableHead className="text-center min-w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        Aucun outil trouve
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(row => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium text-sm">{row.saas_name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{row.category}</TableCell>
                        <TableCell>{renderEditableCell(row, "affiliate_network", row.affiliate_network)}</TableCell>
                        <TableCell>
                          <Select
                            value={row.status}
                            onValueChange={(v) => updateStatus(row.id, v as AffiliateStatus)}
                          >
                            <SelectTrigger className="h-7 w-[130px] border-0 p-0 shadow-none">
                              <Badge
                                variant={row.status === "active" ? "default" : "outline"}
                                className={`text-[10px] ${STATUS_COLORS[row.status]}`}
                              >
                                {STATUS_OPTIONS.find(o => o.value === row.status)?.label || row.status}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map(o => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <div className="w-1/2">{renderEditableCell(row, "commission_type", row.commission_type)}</div>
                            <div className="w-1/2">{renderEditableCell(row, "commission_value", row.commission_value)}</div>
                          </div>
                        </TableCell>
                        <TableCell>{renderEditableCell(row, "affiliate_url", row.affiliate_url)}</TableCell>
                        <TableCell>{renderEditableCell(row, "contact_email", row.contact_email)}</TableCell>
                        <TableCell>{renderEditableCell(row, "notes", row.notes)}</TableCell>
                        <TableCell className="text-center">
                          <a
                            href={row.site_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Site
                          </a>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CartAffiliateManager;
