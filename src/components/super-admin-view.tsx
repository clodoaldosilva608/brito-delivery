"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useNav, useSession, formatBRL } from "@/lib/store";
import { toast } from "sonner";
import {
  Shield, Store, BarChart3, LogOut, ChevronLeft, ChevronRight,
  Search, Loader2, Trash2, Power, Edit3, Eye, EyeOff, Key,
  TrendingUp, DollarSign, ShoppingBag, AlertCircle, X, Plus,
  CreditCard, Crown, Users, Settings, Save, Clock, CheckCircle2,
  Ban, Package, UtensilsCrossed, Megaphone,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Aguardando", color: "bg-accent/15 text-accent border-accent/30", icon: Clock },
  ACCEPTED: { label: "Aceito", color: "bg-chart-3/15 text-chart-3 border-chart-3/30", icon: CheckCircle2 },
  PREPARING: { label: "Em preparo", color: "bg-chart-3/15 text-chart-3 border-chart-3/30", icon: UtensilsCrossed },
  OUT_FOR_DELIVERY: { label: "A caminho", color: "bg-primary/15 text-primary border-primary/30", icon: Package },
  DELIVERED: { label: "Entregue", color: "bg-muted text-muted-foreground border-border", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelado", color: "bg-destructive/15 text-destructive border-destructive/30", icon: Ban },
};

const PAYMENT_LABELS: Record<string, string> = {
  PIX: "Pix",
  CARD: "Cartão",
  ON_DELIVERY: "Na entrega",
};

const SUB_STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  TRIAL: { label: "Trial", color: "bg-accent/15 text-accent border-accent/30", icon: Clock },
  SUBSCRIBER: { label: "Assinante", color: "bg-chart-2/15 text-chart-2 border-chart-2/30", icon: Crown },
  BLOCKED: { label: "Bloqueado", color: "bg-destructive/15 text-destructive border-destructive/30", icon: Ban },
};

export function SuperAdminView() {
  const { setView } = useNav();
  const { profile, refresh, loading: sessionLoading } = useSession();
  const [tab, setTab] = useState("dashboard");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!sessionLoading && (!profile || !profile.roles.includes("ADMIN"))) {
      setView("super-admin-login");
    }
  }, [profile, sessionLoading, setView]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await refresh();
    setView("home");
  };

  if (sessionLoading || !profile) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile.roles.includes("ADMIN")) {
    return (
      <div className="min-h-screen grid place-items-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-destructive" />
            <h2 className="text-xl font-bold mb-2">Acesso negado</h2>
            <Button onClick={() => setView("home")}>Voltar ao site</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Store detail view (fullscreen)
  if (selectedStoreId) {
    return <StoreDetailView storeId={selectedStoreId} onBack={() => setSelectedStoreId(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-lg">
        <div className="container-brito flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold leading-tight">Super Admin</div>
              <div className="text-[10px] text-muted-foreground">{profile.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setView("home")}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Site
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container-brito py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="dashboard"><BarChart3 className="h-4 w-4 mr-1.5" />Dashboard</TabsTrigger>
            <TabsTrigger value="subscriptions"><CreditCard className="h-4 w-4 mr-1.5" />Assinaturas</TabsTrigger>
            <TabsTrigger value="stores"><Store className="h-4 w-4 mr-1.5" />Lojas</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-1.5" />Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><DashboardTab /></TabsContent>
          <TabsContent value="subscriptions"><SubscriptionsTab /></TabsContent>
          <TabsContent value="stores"><StoresTab onSelectStore={setSelectedStoreId} /></TabsContent>
          <TabsContent value="settings"><SettingsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ====== DASHBOARD TAB ======
function DashboardTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></div>;
  }

  const k = data.kpis;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <KpiCard icon={DollarSign} label="Receita total" value={formatBRL(k.totalRevenue)} sub={`${k.totalOrders} pedidos`} color="text-chart-2" />
        <KpiCard icon={TrendingUp} label="Receita hoje" value={formatBRL(k.todayRevenue)} sub={`${k.todayOrdersCount} hoje`} color="text-primary" />
        <KpiCard icon={BarChart3} label="Receita 30d" value={formatBRL(k.monthRevenue)} sub={`média ${formatBRL(k.avgTicket)}/pedido`} color="text-chart-3" />
        <KpiCard icon={Users} label="Lojistas" value={String(k.totalProfiles)} sub={`+${k.newProfilesThisWeek} esta semana`} color="text-chart-4" />
        <KpiCard icon={Store} label="Lojas" value={String(k.totalStores)} sub={`${k.activeStores} ativas`} color="text-chart-5" />
      </div>

      <Card>
        <CardContent className="p-5">
          <h3 className="font-bold mb-4">Tendência de pedidos (14 dias)</h3>
          <div className="h-48 flex items-end gap-1.5">
            {data.dailyTrend.map((d: any, i: number) => {
              const maxOrders = Math.max(...data.dailyTrend.map((x: any) => x.orders), 1);
              const h = (d.orders / maxOrders) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-primary/20 rounded-t-md flex items-end" style={{ height: "100%" }}>
                    <div className="w-full bg-primary rounded-t-md transition-all" style={{ height: `${Math.max(h, 2)}%` }} title={`${d.orders} pedidos · ${formatBRL(d.revenue)}`} />
                  </div>
                  <span className="text-[8px] text-muted-foreground">{d.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-bold mb-4">Top 5 lojas por receita</h3>
            <div className="space-y-3">
              {data.topStores.map((s: any, i: number) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}º</span>
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-secondary shrink-0">
                    {s.logoUrl ? (
                       
                      <img src={s.logoUrl} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-xs font-bold">{s.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{s.name}</div>
                    <div className="text-[10px] text-muted-foreground">{s.orders} pedidos</div>
                  </div>
                  <div className="text-sm font-bold text-primary">{formatBRL(s.revenue)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-bold mb-3">Status dos pedidos</h3>
              <div className="space-y-2">
                {data.statusBreakdown.map((s: any) => (
                  <div key={s.name} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{STATUS_CONFIG[s.name]?.label || s.name}</span>
                    <span className="font-medium">{s.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h3 className="font-bold mb-3">Formas de pagamento</h3>
              <div className="space-y-2">
                {data.paymentBreakdown.map((p: any) => (
                  <div key={p.name} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{PAYMENT_LABELS[p.name] || p.name}</span>
                    <span className="font-medium">{p.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`grid place-items-center h-8 w-8 rounded-lg bg-secondary ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-bold mt-0.5">{value}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
      </CardContent>
    </Card>
  );
}

// ====== ASSINATURAS TAB ======
function SubscriptionsTab() {
  const [plans, setPlans] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState("plans");
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/subscriptions").then((r) => r.json()),
      fetch("/api/admin/owners").then((r) => r.json()),
    ]).then(([p, o]) => {
      setPlans(p.plans || []);
      setOwners(o.owners || []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const deletePlan = async (id: string, name: string) => {
    if (!confirm(`Excluir o plano "${name}"?`)) return;
    try {
      await fetch(`/api/admin/subscriptions/${id}`, { method: "DELETE" });
      toast.success("Plano excluído");
      load();
    } catch { toast.error("Erro"); }
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></div>;

  return (
    <div className="space-y-4">
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="owners">Lojistas ({owners.length})</TabsTrigger>
        </TabsList>

        {/* PLANOS */}
        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setCreating(true)}><Plus className="h-4 w-4 mr-1" /> Novo Plano</Button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {plans.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-accent" />
                      <h3 className="font-bold">{p.name}</h3>
                    </div>
                    {p.isActive ? <Badge className="text-[10px] bg-chart-2/15 text-chart-2">Ativo</Badge> : <Badge variant="secondary" className="text-[10px]">Inativo</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{p.description}</p>
                  <div className="text-2xl font-bold text-primary mb-1">{formatBRL(p.price)}<span className="text-xs text-muted-foreground font-normal">/{p.billingCycle === "MONTHLY" ? "mês" : "ano"}</span></div>
                  <div className="text-xs text-muted-foreground mb-3">{p._count?.stores || 0} lojas neste plano</div>
                  <div className="space-y-1 mb-3">
                    <div className="text-[10px] text-muted-foreground">Max lojas: <span className="font-medium text-foreground">{p.maxStores}</span></div>
                    <div className="text-[10px] text-muted-foreground">Max itens: <span className="font-medium text-foreground">{p.maxMenuItems}</span></div>
                  </div>
                  {p.features && (
                    <div className="space-y-0.5 mb-3">
                      {JSON.parse(p.features).map((f: string, i: number) => (
                        <div key={i} className="text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-chart-2" />
                          {f}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(p)}><Edit3 className="h-3.5 w-3.5 mr-1" /> Editar</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deletePlan(p.id, p.name)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* LOJISTAS */}
        <TabsContent value="owners" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {owners.map((o) => (
              <Card key={o.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="grid place-items-center h-10 w-10 rounded-full bg-secondary font-bold shrink-0">{o.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{o.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{o.email}</div>
                      {o.phone && <div className="text-xs text-muted-foreground">{o.phone}</div>}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 rounded-lg bg-secondary/50">
                      <div className="text-sm font-bold">{o.totalStores}</div>
                      <div className="text-[10px] text-muted-foreground">Lojas</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-secondary/50">
                      <div className="text-sm font-bold">{o.activeStores}</div>
                      <div className="text-[10px] text-muted-foreground">Ativas</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-secondary/50">
                      <div className="text-sm font-bold">{o.membersCount}</div>
                      <div className="text-[10px] text-muted-foreground">Funcionários</div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {o.stores.map((s: any) => {
                      const cfg = SUB_STATUS_CONFIG[s.subscriptionStatus];
                      return (
                        <div key={s.id} className="flex items-center justify-between gap-2 p-2 rounded-lg border">
                          <div className="min-w-0">
                            <div className="text-xs font-medium truncate">{s.name}</div>
                            <div className="text-[10px] text-muted-foreground">{s.category}</div>
                          </div>
                          <Badge className={`text-[9px] ${cfg?.color}`}>
                            <cfg.icon className="h-2.5 w-2.5 mr-0.5" />
                            {cfg?.label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {editing && <PlanModal plan={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {creating && <PlanModal onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load(); }} />}
    </div>
  );
}

function PlanModal({ plan, onClose, onSaved }: any) {
  const isEdit = !!plan;
  const [form, setForm] = useState({
    name: plan?.name || "",
    description: plan?.description || "",
    price: plan?.price || 0,
    billingCycle: plan?.billingCycle || "MONTHLY",
    features: plan?.features ? JSON.parse(plan.features).join("\n") : "",
    isActive: plan?.isActive ?? true,
    maxStores: plan?.maxStores || 1,
    maxMenuItems: plan?.maxMenuItems || 100,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.name) return toast.error("Nome obrigatório");
    setSaving(true);
    try {
      const features = form.features ? JSON.stringify(form.features.split("\n").filter(Boolean)) : null;
      const body = { ...form, features };
      const url = isEdit ? `/api/admin/subscriptions/${plan.id}` : "/api/admin/subscriptions";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success(isEdit ? "Plano atualizado" : "Plano criado");
      onSaved();
    } catch { toast.error("Erro"); }
    finally { setSaving(false); }
  };

  return (
    <Modal onClose={onClose} title={isEdit ? "Editar plano" : "Novo plano"}>
      <div className="space-y-3">
        <div><Label className="text-xs">Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10" /></div>
        <div><Label className="text-xs">Descrição</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="resize-none text-sm" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label className="text-xs">Preço (R$)</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="h-10" /></div>
          <div><Label className="text-xs">Ciclo</Label><select value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"><option value="MONTHLY">Mensal</option><option value="YEARLY">Anual</option></select></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label className="text-xs">Max lojas</Label><Input type="number" value={form.maxStores} onChange={(e) => setForm({ ...form, maxStores: parseInt(e.target.value) || 1 })} className="h-10" /></div>
          <div><Label className="text-xs">Max itens</Label><Input type="number" value={form.maxMenuItems} onChange={(e) => setForm({ ...form, maxMenuItems: parseInt(e.target.value) || 100 })} className="h-10" /></div>
        </div>
        <div><Label className="text-xs">Features (uma por linha)</Label><Textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={4} placeholder="Cardápio digital&#10;Pedidos via QR&#10;..." className="resize-none text-sm" /></div>
        <div className="flex items-center justify-between p-2 rounded-lg border">
          <span className="text-sm">Plano ativo</span>
          <Button size="sm" variant={form.isActive ? "default" : "outline"} onClick={() => setForm({ ...form, isActive: !form.isActive })}>{form.isActive ? "Ativo" : "Inativo"}</Button>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}{isEdit ? "Salvar" : "Criar"}</Button>
        </div>
      </div>
    </Modal>
  );
}

// ====== LOJAS TAB ======
function StoresTab({ onSelectStore }: { onSelectStore: (id: string) => void }) {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    fetch(`/api/admin/stores?${params}`)
      .then((r) => r.json())
      .then((d) => setStores(d.stores || []))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/stores/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionStatus: status }),
      });
      toast.success(`Status alterado para ${SUB_STATUS_CONFIG[status]?.label}`);
      load();
    } catch { toast.error("Erro"); }
  };

  const filtered = statusFilter === "ALL" ? stores : stores.filter((s) => s.subscriptionStatus === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar lojas…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm">
          <option value="ALL">Todos os status</option>
          <option value="TRIAL">Trial</option>
          <option value="SUBSCRIBER">Assinantes</option>
          <option value="BLOCKED">Bloqueados</option>
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center">
          <div className="text-xs text-muted-foreground">Trial</div>
          <div className="text-lg font-bold text-accent">{stores.filter((s) => s.subscriptionStatus === "TRIAL").length}</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-xs text-muted-foreground">Assinantes</div>
          <div className="text-lg font-bold text-chart-2">{stores.filter((s) => s.subscriptionStatus === "SUBSCRIBER").length}</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-xs text-muted-foreground">Bloqueados</div>
          <div className="text-lg font-bold text-destructive">{stores.filter((s) => s.subscriptionStatus === "BLOCKED").length}</div>
        </CardContent></Card>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhuma loja encontrada.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => {
            const cfg = SUB_STATUS_CONFIG[s.subscriptionStatus];
            return (
              <Card key={s.id} className="hover:border-primary/40 transition-colors cursor-pointer" >
                <CardContent className="p-3 flex items-center gap-3" onClick={() => onSelectStore(s.id)}>
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary shrink-0">
                    {s.logoUrl ? (
                       
                      <img src={s.logoUrl} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center font-bold">{s.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">{s.name}</span>
                      <Badge variant="secondary" className="text-[10px]">{s.category}</Badge>
                      <Badge className={`text-[10px] ${cfg?.color}`}>
                        <cfg.icon className="h-2.5 w-2.5 mr-0.5" />
                        {cfg?.label}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Dono: {s.ownerName}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{s.ordersCount} pedidos · {s.menuItemsCount} itens</div>
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={s.subscriptionStatus}
                      onChange={(e) => changeStatus(s.id, e.target.value)}
                      className="h-7 text-xs px-2 rounded-md border border-input bg-background"
                    >
                      <option value="TRIAL">Trial</option>
                      <option value="SUBSCRIBER">Assinante</option>
                      <option value="BLOCKED">Bloqueado</option>
                    </select>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ====== STORE DETAIL VIEW ======
function StoreDetailView({ storeId, onBack }: { storeId: string; onBack: () => void }) {
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState("edit");

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/stores/${storeId}/detail`)
      .then((r) => r.json())
      .then((d) => setStore(d.store))
      .finally(() => setLoading(false));
  }, [storeId]);

  useEffect(() => { load(); }, [load]);

  if (loading || !store) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const cfg = SUB_STATUS_CONFIG[store.subscriptionStatus];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-lg">
        <div className="container-brito flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-1" /> Voltar</Button>
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-secondary shrink-0">
              {store.logoUrl ? (
                 
                <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center font-bold">{store.name.charAt(0)}</div>
              )}
            </div>
            <div>
              <div className="font-bold leading-tight">{store.name}</div>
              <Badge className={`text-[9px] ${cfg?.color}`}><cfg.icon className="h-2.5 w-2.5 mr-0.5" />{cfg?.label}</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container-brito py-6">
        <Tabs value={subTab} onValueChange={setSubTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
            <TabsTrigger value="edit"><Edit3 className="h-4 w-4 mr-1.5" />Editar</TabsTrigger>
            <TabsTrigger value="orders"><Package className="h-4 w-4 mr-1.5" />Pedidos</TabsTrigger>
            <TabsTrigger value="reports"><BarChart3 className="h-4 w-4 mr-1.5" />Relatórios</TabsTrigger>
            <TabsTrigger value="staff"><Users className="h-4 w-4 mr-1.5" />Funcionários</TabsTrigger>
            <TabsTrigger value="menu"><UtensilsCrossed className="h-4 w-4 mr-1.5" />Cardápio</TabsTrigger>
          </TabsList>

          <TabsContent value="edit"><StoreEditTab store={store} onSaved={load} /></TabsContent>
          <TabsContent value="orders"><StoreOrdersTab store={store} /></TabsContent>
          <TabsContent value="reports"><StoreReportsTab store={store} /></TabsContent>
          <TabsContent value="staff"><StoreStaffTab store={store} /></TabsContent>
          <TabsContent value="menu"><StoreMenuTab store={store} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Store Edit Tab
function StoreEditTab({ store, onSaved }: any) {
  const [form, setForm] = useState({
    name: store.name || "",
    category: store.category || "",
    deliveryFee: store.deliveryFee || 0,
    minOrder: store.minOrder || 0,
    pixKey: store.pixKey || "",
    isActive: store.isActive,
    isOpen: store.isOpen,
    subscriptionStatus: store.subscriptionStatus || "TRIAL",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`/api/admin/stores/${store.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      toast.success("Loja atualizada");
      onSaved();
    } catch { toast.error("Erro"); }
    finally { setSaving(false); }
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <h3 className="font-bold">Editar loja</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label className="text-xs">Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10" /></div>
          <div><Label className="text-xs">Categoria</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-10" /></div>
          <div><Label className="text-xs">Taxa de entrega (R$)</Label><Input type="number" step="0.01" value={form.deliveryFee} onChange={(e) => setForm({ ...form, deliveryFee: parseFloat(e.target.value) || 0 })} className="h-10" /></div>
          <div><Label className="text-xs">Pedido mínimo (R$)</Label><Input type="number" step="0.01" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: parseFloat(e.target.value) || 0 })} className="h-10" /></div>
          <div className="sm:col-span-2"><Label className="text-xs">Chave Pix</Label><Input value={form.pixKey} onChange={(e) => setForm({ ...form, pixKey: e.target.value })} className="h-10" /></div>
          <div>
            <Label className="text-xs">Status da assinatura</Label>
            <select value={form.subscriptionStatus} onChange={(e) => setForm({ ...form, subscriptionStatus: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option value="TRIAL">Trial</option>
              <option value="SUBSCRIBER">Assinante</option>
              <option value="BLOCKED">Bloqueado</option>
            </select>
          </div>
          <div className="flex items-center gap-4 pt-6">
            <div className="flex items-center gap-2"><Button size="sm" variant={form.isActive ? "default" : "outline"} onClick={() => setForm({ ...form, isActive: !form.isActive })}>{form.isActive ? "Ativa" : "Inativa"}</Button></div>
            <div className="flex items-center gap-2"><Button size="sm" variant={form.isOpen ? "default" : "outline"} onClick={() => setForm({ ...form, isOpen: !form.isOpen })}>{form.isOpen ? "Aberta" : "Fechada"}</Button></div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">Dono: {store.owner.name} ({store.owner.email})</div>
        <Button onClick={save} disabled={saving} className="min-w-40">{saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Salvar</Button>
      </CardContent>
    </Card>
  );
}

// Store Orders Tab
function StoreOrdersTab({ store }: any) {
  const changeStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      toast.success(`Status: ${STATUS_CONFIG[status]?.label}`);
    } catch { toast.error("Erro"); }
  };

  return (
    <div className="space-y-2">
      {store.orders.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhum pedido.</CardContent></Card>
      ) : store.orders.map((o: any) => (
        <Card key={o.id}>
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">#{o.orderNumber}</span>
                <span className="text-xs text-muted-foreground">{o.customerName}</span>
              </div>
              <Badge className={`text-[10px] ${STATUS_CONFIG[o.status]?.color}`}>{STATUS_CONFIG[o.status]?.label}</Badge>
            </div>
            <div className="text-xs space-y-0.5 mb-2">
              {o.items.map((it: any) => (
                <div key={it.id} className="flex justify-between">
                  <span className="text-muted-foreground">{it.quantity}× {it.name}</span>
                  <span>{formatBRL(it.unitPrice * it.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t">
              <span className="font-bold text-primary">{formatBRL(o.total)}</span>
              <select
                value={o.status}
                onChange={(e) => changeStatus(o.id, e.target.value)}
                className="h-7 text-xs px-2 rounded-md border border-input bg-background"
              >
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Store Reports Tab
function StoreReportsTab({ store }: any) {
  const r = store.reports;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={DollarSign} label="Receita total" value={formatBRL(r.totalRevenue)} sub={`${r.totalOrders} pedidos`} color="text-chart-2" />
        <KpiCard icon={TrendingUp} label="Receita hoje" value={formatBRL(r.todayRevenue)} sub={`${r.todayOrdersCount} hoje`} color="text-primary" />
        <KpiCard icon={BarChart3} label="Receita 7d" value={formatBRL(r.weekRevenue)} sub="última semana" color="text-chart-3" />
        <KpiCard icon={ShoppingBag} label="Ticket médio" value={formatBRL(r.avgTicket)} sub="por pedido" color="text-chart-4" />
      </div>

      <Card>
        <CardContent className="p-5">
          <h3 className="font-bold mb-4">Tendência (7 dias)</h3>
          <div className="h-40 flex items-end gap-1.5">
            {r.dailyTrend.map((d: any, i: number) => {
              const max = Math.max(...r.dailyTrend.map((x: any) => x.orders), 1);
              const h = (d.orders / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-primary/20 rounded-t-md flex items-end" style={{ height: "100%" }}>
                    <div className="w-full bg-primary rounded-t-md" style={{ height: `${Math.max(h, 2)}%` }} />
                  </div>
                  <span className="text-[8px] text-muted-foreground">{d.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-bold mb-3">Top 5 produtos</h3>
            <div className="space-y-2">
              {r.topProducts.map((p: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{p.name}</span>
                  <span className="font-medium">{p.qty} un.</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h3 className="font-bold mb-3">Formas de pagamento</h3>
            <div className="space-y-2">
              {r.paymentBreakdown.map((p: any) => (
                <div key={p.name} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{PAYMENT_LABELS[p.name] || p.name}</span>
                  <span className="font-medium">{p.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Store Staff Tab (funcionários)
function StoreStaffTab({ store }: any) {
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-bold mb-3">Funcionários ({store.members.length})</h3>
        {store.members.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Nenhum funcionário cadastrado.</p>
        ) : (
          <div className="space-y-2">
            {store.members.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="grid place-items-center h-9 w-9 rounded-full bg-secondary font-bold text-sm">{m.profile.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{m.profile.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{m.profile.email}</div>
                </div>
                <Badge variant="secondary" className="text-[10px]">{m.role}</Badge>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 pt-4 border-t">
          <div className="text-xs text-muted-foreground mb-2">Dono da loja:</div>
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-primary/5">
            <div className="grid place-items-center h-9 w-9 rounded-full bg-primary/15 text-primary font-bold text-sm">{store.owner.name.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{store.owner.name}</div>
              <div className="text-xs text-muted-foreground truncate">{store.owner.email}</div>
            </div>
            <Badge className="text-[10px]">Dono</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Store Menu Tab
function StoreMenuTab({ store }: any) {
  return (
    <div className="space-y-4">
      {store.menuSections.map((sec: any) => (
        <Card key={sec.id}>
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-2">{sec.name}</h3>
            <div className="space-y-1.5">
              {sec.items.map((it: any) => (
                <div key={it.id} className="flex items-center gap-2 p-2 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{it.name}</div>
                    <div className="text-[10px] text-muted-foreground">{formatBRL(it.price)}</div>
                  </div>
                  <Badge variant={it.isAvailable ? "default" : "secondary"} className="text-[9px]">{it.isAvailable ? "Disponível" : "Indisponível"}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ====== CONFIGURAÇÕES TAB ======
function SettingsTab() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !settings) {
    return <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></div>;
  }

  const toggleFeature = (key: string) => {
    setSettings({
      ...settings,
      features: { ...settings.features, [key]: !settings.features[key] },
    });
    toast.success(`Feature ${key} ${settings.features[key] ? "desativada" : "ativada"} (demo)`);
  };

  return (
    <div className="space-y-5">
      {/* Sistema */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <h3 className="font-bold flex items-center gap-2"><Settings className="h-4 w-4" /> Configurações do Sistema</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label className="text-xs">Nome da plataforma</Label><Input value={settings.platformName} onChange={(e) => setSettings({ ...settings, platformName: e.target.value })} className="h-10" /></div>
            <div><Label className="text-xs">Email de suporte</Label><Input value={settings.supportEmail} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} className="h-10" /></div>
            <div><Label className="text-xs">Dias de trial padrão</Label><Input type="number" value={settings.defaultTrialDays} onChange={(e) => setSettings({ ...settings, defaultTrialDays: parseInt(e.target.value) })} className="h-10" /></div>
            <div><Label className="text-xs">Máx. lojas padrão</Label><Input type="number" value={settings.defaultMaxStores} onChange={(e) => setSettings({ ...settings, defaultMaxStores: parseInt(e.target.value) })} className="h-10" /></div>
            <div><Label className="text-xs">Máx. itens de cardápio padrão</Label><Input type="number" value={settings.defaultMaxMenuItems} onChange={(e) => setSettings({ ...settings, defaultMaxMenuItems: parseInt(e.target.value) })} className="h-10" /></div>
            <div><Label className="text-xs">Taxa de entrega padrão (R$)</Label><Input type="number" step="0.01" value={settings.defaultDeliveryFee} onChange={(e) => setSettings({ ...settings, defaultDeliveryFee: parseFloat(e.target.value) })} className="h-10" /></div>
            <div><Label className="text-xs">Pedido mínimo padrão (R$)</Label><Input type="number" step="0.01" value={settings.defaultMinOrder} onChange={(e) => setSettings({ ...settings, defaultMinOrder: parseFloat(e.target.value) })} className="h-10" /></div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas do sistema */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-bold mb-3">Estatísticas do Sistema</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <div className="text-2xl font-bold">{settings.stats.totalStores}</div>
              <div className="text-xs text-muted-foreground">Lojas cadastradas</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <div className="text-2xl font-bold text-chart-2">{settings.stats.activeStores}</div>
              <div className="text-xs text-muted-foreground">Lojas ativas</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <div className="text-2xl font-bold">{settings.stats.totalUsers}</div>
              <div className="text-xs text-muted-foreground">Usuários totais</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="text-center p-3 rounded-lg bg-accent/5">
              <div className="text-xl font-bold text-accent">{settings.trialStoresCount}</div>
              <div className="text-xs text-muted-foreground">Em trial</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-chart-2/5">
              <div className="text-xl font-bold text-chart-2">{settings.subscriberStoresCount}</div>
              <div className="text-xs text-muted-foreground">Assinantes</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-destructive/5">
              <div className="text-xl font-bold text-destructive">{settings.blockedStoresCount}</div>
              <div className="text-xs text-muted-foreground">Bloqueados</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2"><Megaphone className="h-4 w-4" /> Feature Flags</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(settings.features).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between p-2.5 rounded-lg border">
                <span className="text-sm">{key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}</span>
                <Button size="sm" variant={enabled ? "default" : "outline"} onClick={() => toggleFeature(key)} className="h-7 text-xs">
                  {enabled ? "Ativo" : "Inativo"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ====== MODAL ======
function Modal({ children, onClose, title }: any) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card rounded-2xl shadow-2xl p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
