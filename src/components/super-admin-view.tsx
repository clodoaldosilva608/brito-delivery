"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useNav, useSession, formatBRL } from "@/lib/store";
import { toast } from "sonner";
import {
  Shield, Users, Store, Package, BarChart3, LogOut, ChevronLeft,
  Search, Loader2, Trash2, Power, Edit3, Eye, EyeOff, Key, Crown,
  TrendingUp, DollarSign, ShoppingBag, UserPlus, AlertCircle, X,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Aguardando", color: "bg-accent/15 text-accent border-accent/30" },
  ACCEPTED: { label: "Aceito", color: "bg-chart-3/15 text-chart-3 border-chart-3/30" },
  PREPARING: { label: "Em preparo", color: "bg-chart-3/15 text-chart-3 border-chart-3/30" },
  OUT_FOR_DELIVERY: { label: "A caminho", color: "bg-primary/15 text-primary border-primary/30" },
  DELIVERED: { label: "Entregue", color: "bg-muted text-muted-foreground border-border" },
  CANCELLED: { label: "Cancelado", color: "bg-destructive/15 text-destructive border-destructive/30" },
};

const PAYMENT_LABELS: Record<string, string> = {
  PIX: "Pix",
  CARD: "Cartão",
  ON_DELIVERY: "Na entrega",
};

export function SuperAdminView() {
  const { setView } = useNav();
  const { profile, refresh, loading: sessionLoading } = useSession();
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    // Carrega sessão ao montar
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
            <p className="text-sm text-muted-foreground mb-4">
              Você não tem privilégios de administrador.
            </p>
            <Button onClick={() => setView("home")}>Voltar ao site</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              <ChevronLeft className="h-4 w-4 mr-1" />
              Site
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container-brito py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
            <TabsTrigger value="dashboard"><BarChart3 className="h-4 w-4 mr-1.5" />Dashboard</TabsTrigger>
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-1.5" />Usuários</TabsTrigger>
            <TabsTrigger value="stores"><Store className="h-4 w-4 mr-1.5" />Lojas</TabsTrigger>
            <TabsTrigger value="orders"><Package className="h-4 w-4 mr-1.5" />Pedidos</TabsTrigger>
            <TabsTrigger value="menu"><ShoppingBag className="h-4 w-4 mr-1.5" />Cardápios</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><DashboardTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="stores"><StoresTab /></TabsContent>
          <TabsContent value="orders"><OrdersTab /></TabsContent>
          <TabsContent value="menu"><MenuItemsTab /></TabsContent>
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
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <KpiCard icon={DollarSign} label="Receita total" value={formatBRL(k.totalRevenue)} sub={`${k.totalOrders} pedidos`} color="text-chart-2" />
        <KpiCard icon={TrendingUp} label="Receita hoje" value={formatBRL(k.todayRevenue)} sub={`${k.todayOrdersCount} pedidos hoje`} color="text-primary" />
        <KpiCard icon={BarChart3} label="Receita 30d" value={formatBRL(k.monthRevenue)} sub={`média ${formatBRL(k.avgTicket)}/pedido`} color="text-chart-3" />
        <KpiCard icon={Users} label="Usuários" value={String(k.totalProfiles)} sub={`+${k.newProfilesThisWeek} esta semana`} color="text-chart-4" />
        <KpiCard icon={Store} label="Lojas" value={String(k.totalStores)} sub={`${k.activeStores} ativas`} color="text-chart-5" />
      </div>

      {/* Gráfico de tendência */}
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
        {/* Top lojas */}
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
              {data.topStores.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Sem dados ainda.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Breakdowns */}
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

      {/* Stats extras */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Itens de cardápio" value={k.totalMenuItems} />
        <MiniStat label="Entregadores" value={k.totalDrivers} />
        <MiniStat label="Novas lojas (7d)" value={k.newStoresThisWeek} />
        <MiniStat label="Novos usuários (7d)" value={k.newProfilesThisWeek} />
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

function MiniStat({ label, value }: any) {
  return (
    <Card><CardContent className="p-3">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </CardContent></Card>
  );
}

// ====== USERS TAB ======
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (roleFilter !== "ALL") params.set("role", roleFilter);
    fetch(`/api/admin/profiles?${params}`)
      .then((r) => r.json())
      .then((d) => setUsers(d.profiles || []))
      .finally(() => setLoading(false));
  }, [search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const toggleRole = async (id: string, role: string, currentRoles: string[]) => {
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];
    if (newRoles.length === 0) return toast.error("Usuário precisa de pelo menos 1 role");
    try {
      await fetch(`/api/admin/profiles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: newRoles }),
      });
      toast.success("Roles atualizados");
      load();
    } catch { toast.error("Erro"); }
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Excluir permanentemente o usuário "${name}"? Todos os seus dados serão perdidos.`)) return;
    try {
      const res = await fetch(`/api/admin/profiles/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error);
      }
      toast.success("Usuário excluído");
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const resetPassword = async (id: string) => {
    const newPwd = prompt("Nova senha (mínimo 6 caracteres):");
    if (!newPwd || newPwd.length < 6) return toast.error("Senha muito curta");
    try {
      await fetch(`/api/admin/profiles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newPwd }),
      });
      toast.success("Senha redefinida");
    } catch { toast.error("Erro"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm">
          <option value="ALL">Todos os roles</option>
          <option value="ADMIN">Admin</option>
          <option value="OWNER">Dono</option>
          <option value="CUSTOMER">Cliente</option>
        </select>
        <Button size="sm" onClick={() => setCreating(true)}><UserPlus className="h-4 w-4 mr-1" /> Novo</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : users.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhum usuário encontrado.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="grid place-items-center h-10 w-10 rounded-full bg-secondary font-bold shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{u.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {u.roles.map((r: string) => (
                    <button
                      key={r}
                      onClick={() => toggleRole(u.id, r, u.roles)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
                        r === "ADMIN" ? "bg-primary/15 text-primary" :
                        r === "OWNER" ? "bg-chart-3/15 text-chart-3" :
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <div className="text-right text-[10px] text-muted-foreground hidden sm:block">
                  <div>{u.storesCount} lojas</div>
                  <div>{u.ordersCount} pedidos</div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditing(u)} title="Editar">
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => resetPassword(u.id)} title="Resetar senha">
                    <Key className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteUser(u.id, u.name)} title="Excluir">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <EditUserModal user={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
      )}
      {creating && (
        <CreateUserModal onClose={() => setCreating(false)} onCreated={() => { setCreating(false); load(); }} />
      )}
    </div>
  );
}

function EditUserModal({ user, onClose, onSaved }: any) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`/api/admin/profiles/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      toast.success("Usuário atualizado");
      onSaved();
    } catch { toast.error("Erro"); }
    finally { setSaving(false); }
  };

  return (
    <Modal onClose={onClose} title="Editar usuário">
      <div className="space-y-3">
        <div><Label className="text-xs">Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="h-10" /></div>
        <div><Label className="text-xs">Telefone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10" /></div>
        <div className="text-xs text-muted-foreground">Email: {user.email} (não editável)</div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}Salvar</Button>
        </div>
      </div>
    </Modal>
  );
}

function CreateUserModal({ onClose, onCreated }: any) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [roles, setRoles] = useState<string[]>(["CUSTOMER"]);
  const [saving, setSaving] = useState(false);

  const toggleRole = (r: string) => {
    setRoles(roles.includes(r) ? roles.filter((x) => x !== r) : [...roles, r]);
  };

  const create = async () => {
    if (!form.name || !form.email || !form.password) return toast.error("Preencha nome, email e senha");
    if (form.password.length < 6) return toast.error("Senha mínima 6 caracteres");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, roles }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error);
      }
      toast.success("Usuário criado");
      onCreated();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal onClose={onClose} title="Criar novo usuário">
      <div className="space-y-3">
        <div><Label className="text-xs">Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10" /></div>
        <div><Label className="text-xs">Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-10" /></div>
        <div><Label className="text-xs">Telefone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-10" /></div>
        <div><Label className="text-xs">Senha *</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-10" /></div>
        <div>
          <Label className="text-xs">Roles</Label>
          <div className="flex gap-2 mt-1">
            {["CUSTOMER", "OWNER", "ADMIN"].map((r) => (
              <button
                key={r}
                onClick={() => toggleRole(r)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${roles.includes(r) ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" onClick={create} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}Criar</Button>
        </div>
      </div>
    </Modal>
  );
}

// ====== STORES TAB ======
function StoresTab() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/admin/stores/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      toast.success(!current ? "Loja ativada" : "Loja desativada");
      load();
    } catch { toast.error("Erro"); }
  };

  const deleteStore = async (id: string, name: string) => {
    if (!confirm(`Excluir permanentemente a loja "${name}"? Todos os pedidos e cardápio serão perdidos.`)) return;
    try {
      await fetch(`/api/admin/stores/${id}`, { method: "DELETE" });
      toast.success("Loja excluída");
      load();
    } catch { toast.error("Erro"); }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar lojas…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : stores.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhuma loja encontrada.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {stores.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-3 flex items-center gap-3">
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
                    {s.isActive ? (
                      <Badge className="text-[10px] bg-chart-2/15 text-chart-2 border-chart-2/30">Ativa</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Inativa</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Dono: {s.ownerName} ({s.ownerEmail})
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {s.ordersCount} pedidos · {s.menuItemsCount} itens · {s.driversCount} entregadores
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toggleActive(s.id, s.isActive)} title={s.isActive ? "Desativar" : "Ativar"}>
                    <Power className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteStore(s.id, s.name)} title="Excluir">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ====== ORDERS TAB ======
function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [storeFilter, setStoreFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (storeFilter !== "ALL") params.set("storeId", storeFilter);
    if (search) params.set("q", search);
    fetch(`/api/admin/orders?${params}`)
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  }, [statusFilter, storeFilter, search]);

  useEffect(() => {
    fetch("/api/admin/stores").then((r) => r.json()).then((d) => setStores(d.stores || []));
  }, []);
  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      toast.success(`Status: ${STATUS_CONFIG[status]?.label}`);
      load();
    } catch { toast.error("Erro"); }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Excluir este pedido permanentemente?")) return;
    try {
      await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      toast.success("Pedido excluído");
      load();
    } catch { toast.error("Erro"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por cliente ou telefone…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm">
          <option value="ALL">Todas as lojas</option>
          {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm">
          <option value="ALL">Todos os status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : orders.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhum pedido encontrado.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <Card key={o.id}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-sm">#{o.orderNumber}</span>
                    <span className="text-xs text-muted-foreground truncate">{o.store.name}</span>
                  </div>
                  <Badge className={`text-[10px] ${STATUS_CONFIG[o.status]?.color}`}>{STATUS_CONFIG[o.status]?.label}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {o.customerName} · {o.customerPhone} · {PAYMENT_LABELS[o.paymentMethod] || o.paymentMethod}
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
                  <div className="flex gap-1">
                    <select
                      value={o.status}
                      onChange={(e) => changeStatus(o.id, e.target.value)}
                      className="h-7 text-xs px-2 rounded-md border border-input bg-background"
                    >
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteOrder(o.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ====== MENU ITEMS TAB ======
function MenuItemsTab() {
  const [items, setItems] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("ALL");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (storeFilter !== "ALL") params.set("storeId", storeFilter);
    fetch(`/api/admin/menu-items?${params}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  }, [search, storeFilter]);

  useEffect(() => {
    fetch("/api/admin/stores").then((r) => r.json()).then((d) => setStores(d.stores || []));
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggleAvailable = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/admin/menu-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !current }),
      });
      load();
    } catch { toast.error("Erro"); }
  };

  const editPrice = async (id: string, currentPrice: number) => {
    const val = prompt("Novo preço:", String(currentPrice));
    if (!val) return;
    const price = parseFloat(val.replace(",", "."));
    if (isNaN(price)) return toast.error("Preço inválido");
    try {
      await fetch(`/api/admin/menu-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });
      toast.success("Preço atualizado");
      load();
    } catch { toast.error("Erro"); }
  };

  const deleteItem = async (id: string, name: string) => {
    if (!confirm(`Excluir "${name}"?`)) return;
    try {
      await fetch(`/api/admin/menu-items/${id}`, { method: "DELETE" });
      toast.success("Item excluído");
      load();
    } catch { toast.error("Erro"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar itens…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm">
          <option value="ALL">Todas as lojas</option>
          {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : items.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhum item encontrado.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <Card key={it.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0">
                  {it.imageUrl ? (
                     
                    <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-lg">🍽️</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{it.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{it.store.name} · {it.section?.name}</div>
                </div>
                <button
                  onClick={() => editPrice(it.id, it.price)}
                  className="font-bold text-primary text-sm hover:underline"
                >
                  {formatBRL(it.price)}
                </button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toggleAvailable(it.id, it.isAvailable)} title={it.isAvailable ? "Disponível" : "Indisponível"}>
                  {it.isAvailable ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteItem(it.id, it.name)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
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
        className="bg-card rounded-2xl shadow-2xl p-6 max-w-md w-full relative"
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
