"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNav } from "@/lib/store";
import { toast } from "sonner";
import {
  ChevronLeft, Loader2, Save, Plus, Trash2, Image as ImageIcon, Upload,
  Phone, Globe, Clock, Truck, MapPin, MessageCircle, Printer, CreditCard,
  Utensils, Monitor, Plug, UserCog, BarChart3, Users, Copy, CheckCircle2, Power,
} from "lucide-react";

interface StoreData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  logoUrl: string | null;
  coverUrl: string | null;
  banners: string | null;
  // Address
  address: string | null;
  cep: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  // Contact
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  // Social
  instagram: string | null;
  tiktok: string | null;
  facebook: string | null;
  // Hours
  openingHours: string | null;
  businessHours: string | null;
  isOpen: boolean;
  // Delivery
  deliveryActive: boolean;
  deliveryMode: string;
  deliveryFee: number;
  deliveryBaseFee: number;
  deliveryPerKm: number;
  deliveryMaxKm: number;
  freeDeliveryAbove: number | null;
  minOrder: number;
  avgDeliveryMin: number;
  // Payment
  pixKey: string | null;
  paymentLink: string | null;
  paymentGateway: string | null;
  paymentConnected: boolean;
  // Printer
  printerMode: string;
  printerCopies: number;
  printerWidth: string;
  printerAutoPrint: boolean;
  printerAutoReport: boolean;
  // Messages
  autoMessagesEnabled: boolean;
  autoMessages: string | null;
  trackingText: string | null;
  // Domain
  customDomain: string | null;
  domainVerified: boolean;
  trialEndsAt: string | null;
}

const DAYS = [
  { key: "mon", label: "Segunda-feira" },
  { key: "tue", label: "Terça-feira" },
  { key: "wed", label: "Quarta-feira" },
  { key: "thu", label: "Quinta-feira" },
  { key: "fri", label: "Sexta-feira" },
  { key: "sat", label: "Sábado" },
  { key: "sun", label: "Domingo" },
];

const DEFAULT_BUSINESS_HOURS = JSON.stringify(
  DAYS.reduce((acc, d) => {
    acc[d.key] = { open: false, from: "18:00", to: "23:00" };
    return acc;
  }, {} as any)
);

const DEFAULT_AUTO_MESSAGES = JSON.stringify({
  PENDING: "Olá {nome}! 👋 Recebemos seu pedido #{numero} e estamos confirmando!",
  ACCEPTED: "Olá {nome}! ✅ Seu pedido #{numero} foi aceito e está sendo preparado!",
  PREPARING: "Olá {nome}! 👨‍🍳 Seu pedido #{numero} está sendo preparado com carinho!",
  OUT_FOR_DELIVERY: "Olá {nome}! 🛵 Seu pedido #{numero} saiu para entrega!",
  DELIVERED: "Olá {nome}! ✅ Seu pedido #{numero} foi entregue! Obrigado pela preferência! 🙏",
  CANCELLED: "Olá {nome}! ❌ Infelizmente seu pedido #{numero} foi cancelado. Entre em contato para mais informações.",
});

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pedido Recebido (Pendente)",
  ACCEPTED: "Pedido Aceito",
  PREPARING: "Em Preparo",
  OUT_FOR_DELIVERY: "Saiu para Entrega",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

function useStoreData() {
  const { activeStoreId, setView } = useNav();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    if (!activeStoreId) { setView("dashboard"); return; }
    setLoading(true);
    fetch(`/api/my/stores/${activeStoreId}`)
      .then((r) => r.json())
      .then((d) => setStore(d.store))
      .finally(() => setLoading(false));
  }, [activeStoreId, setView]);

  useEffect(() => { load(); }, [load]);

  const save = async (data: Partial<StoreData>) => {
    if (!activeStoreId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/my/stores/${activeStoreId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      const d = await res.json();
      setStore(d.store);
      toast.success("Configurações salvas");
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return { store, loading, saving, save, setStore, activeStoreId };
}

function AdminShell({ title, subtitle, icon: Icon, children }: any) {
  const { setView } = useNav();
  return (
    <div className="container-brito py-6">
      <button onClick={() => setView("dashboard")} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-3">
        <ChevronLeft className="h-3.5 w-3.5" />
        Voltar ao painel
      </button>
      <div className="flex items-center gap-3 mb-5">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function LoadingShell() {
  return <div className="container-brito py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></div>;
}

// ====== PERSONALIZAR LOJA ======
export function AdminCustomizeView() {
  const { store, loading, saving, save } = useStoreData();
  const [banners, setBanners] = useState<any[]>([]);
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (store) {
      setLogoUrl(store.logoUrl || "");
      try { setBanners(store.banners ? JSON.parse(store.banners) : []); } catch { setBanners([]); }
    }
  }, [store]);

  if (loading || !store) return <LoadingShell />;

  const addBanner = () => {
    if (banners.length >= 4) return toast.error("Máximo de 4 banners");
    setBanners([...banners, { url: "", link: "" }]);
  };
  const updateBanner = (i: number, field: string, val: string) => {
    setBanners(banners.map((b, idx) => idx === i ? { ...b, [field]: val } : b));
  };
  const removeBanner = (i: number) => setBanners(banners.filter((_, idx) => idx !== i));

  const handleSave = () => {
    save({
      logoUrl: logoUrl || null,
      banners: JSON.stringify(banners.filter((b) => b.url)),
    });
  };

  return (
    <AdminShell title="Personalizar Loja" subtitle="Adicione a logo e imagem do banner da sua loja" icon={ImageIcon}>
      <div className="grid gap-5">
        {/* Logo */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-bold mb-3">Logo da Loja</h3>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-secondary border-2 border-border shrink-0">
                {logoUrl ? (
                   
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center"><Upload className="h-6 w-6 text-muted-foreground" /></div>
                )}
              </div>
              <div className="flex-1">
                <Label className="text-xs">URL da logo</Label>
                <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." className="h-10" />
                <p className="text-[10px] text-muted-foreground mt-1">💡 A logo será exibida em formato circular. Use uma imagem quadrada (200×200px ou maior).</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banners */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold">Banners da Loja</h3>
                <p className="text-xs text-muted-foreground">{banners.length} de 4 banners</p>
              </div>
              <Button size="sm" variant="outline" onClick={addBanner} disabled={banners.length >= 4}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Banner
              </Button>
            </div>
            <div className="space-y-3">
              {banners.map((b, i) => (
                <div key={i} className="p-3 rounded-lg border space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">Banner {i + 1}</span>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 ml-auto text-muted-foreground hover:text-destructive" onClick={() => removeBanner(i)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Input value={b.url} onChange={(e) => updateBanner(i, "url", e.target.value)} placeholder="URL da imagem (1920×600px)" className="h-9" />
                  <Input value={b.link || ""} onChange={(e) => updateBanner(i, "link", e.target.value)} placeholder="Link do banner (opcional)" className="h-9" />
                </div>
              ))}
              {banners.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">Adicione até 4 banners. Eles serão exibidos em rotação automática.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="min-w-40">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando…</> : <><Save className="h-4 w-4 mr-2" /> Salvar</>}
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}

// ====== INFORMAÇÕES DA LOJA ======
export function AdminInfoView() {
  const { store, loading, saving, save } = useStoreData();
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name || "",
        description: store.description || "",
        phone: store.phone || "",
        whatsapp: store.whatsapp || "",
        email: store.email || "",
        cep: store.cep || "",
        street: store.street || "",
        number: store.number || "",
        complement: store.complement || "",
        neighborhood: store.neighborhood || "",
        city: store.city || "",
        state: store.state || "",
        instagram: store.instagram || "",
        tiktok: store.tiktok || "",
        facebook: store.facebook || "",
      });
    }
  }, [store]);

  if (loading || !store) return <LoadingShell />;

  const lookupCep = async () => {
    if (!form.cep || form.cep.replace(/\D/g, "").length !== 8) return toast.error("CEP inválido");
    try {
      const r = await fetch(`/api/cep?cep=${form.cep}`);
      const d = await r.json();
      setForm({ ...form, street: d.street || "", neighborhood: d.neighborhood || "", city: d.city || "", state: d.state || "" });
      toast.success("Endereço preenchido");
    } catch { toast.error("CEP não encontrado"); }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/loja/${store.slug}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  return (
    <AdminShell title="Informações da Loja" subtitle="Configure as informações básicas da sua loja" icon={Phone}>
      <div className="grid gap-5">
        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold">Dados básicos</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label className="text-xs">Nome da Loja</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10" /></div>
              <div><Label className="text-xs">Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-10" /></div>
              <div><Label className="text-xs">Telefone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" className="h-10" /></div>
              <div><Label className="text-xs">WhatsApp</Label><Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="(00) 00000-0000" className="h-10" /></div>
            </div>
            <div><Label className="text-xs">Descrição</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="resize-none text-sm" /></div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold">Endereço</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs">CEP</Label>
                <div className="flex gap-2">
                  <Input value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} placeholder="00000-000" className="h-10" />
                  <Button variant="outline" size="sm" onClick={lookupCep} className="h-10">Buscar</Button>
                </div>
              </div>
              <div className="sm:col-span-2"><Label className="text-xs">Rua</Label><Input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="h-10" /></div>
              <div><Label className="text-xs">Número</Label><Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="h-10" /></div>
              <div><Label className="text-xs">Complemento</Label><Input value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} className="h-10" /></div>
              <div><Label className="text-xs">Bairro</Label><Input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className="h-10" /></div>
              <div><Label className="text-xs">Cidade</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="h-10" /></div>
              <div><Label className="text-xs">Estado</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} maxLength={2} className="h-10" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold">Redes sociais</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div><Label className="text-xs">Instagram</Label><Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@sualoja" className="h-10" /></div>
              <div><Label className="text-xs">TikTok</Label><Input value={form.tiktok} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} placeholder="@sualoja" className="h-10" /></div>
              <div><Label className="text-xs">Facebook</Label><Input value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} placeholder="facebook.com/sualoja" className="h-10" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-bold mb-2">Link para compartilhar</h3>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary">
              <code className="flex-1 text-xs font-mono truncate">{window.location.origin}/loja/{store.slug}</code>
              <Button size="sm" variant="ghost" onClick={copyShareLink}><Copy className="h-3.5 w-3.5 mr-1" /> Copiar</Button>
              <a href={`https://wa.me/?text=${encodeURIComponent(`Peça na nossa loja: ${window.location.origin}/loja/${store.slug}`)}`} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-chart-2 hover:bg-chart-2/90"><MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp</Button>
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => save(form)} disabled={saving} className="min-w-40">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando…</> : <><Save className="h-4 w-4 mr-2" /> Salvar Alterações</>}
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}

// ====== STATUS DA LOJA (horário por dia) ======
export function AdminStatusView() {
  const { store, loading, saving, save } = useStoreData();
  const [hours, setHours] = useState<any>({});

  useEffect(() => {
    if (store) {
      try { setHours(JSON.parse(store.businessHours || DEFAULT_BUSINESS_HOURS)); } catch { setHours(JSON.parse(DEFAULT_BUSINESS_HOURS)); }
    }
  }, [store]);

  if (loading || !store) return <LoadingShell />;

  const toggleDay = (day: string) => {
    setHours({ ...hours, [day]: { ...hours[day], open: !hours[day]?.open } });
  };
  const updateTime = (day: string, field: string, val: string) => {
    setHours({ ...hours, [day]: { ...hours[day], [field]: val } });
  };

  return (
    <AdminShell title="Status da Loja" subtitle="Configure se a loja está aberta ou fechada em cada dia da semana" icon={Clock}>
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Horário de funcionamento</h3>
            <div className="flex items-center gap-2">
              <Badge variant={store.isOpen ? "default" : "secondary"}>{store.isOpen ? "Aberta agora" : "Fechada"}</Badge>
              <Button size="sm" variant="outline" onClick={() => save({ isOpen: !store.isOpen })}>
                <Power className="h-3.5 w-3.5 mr-1" />
                {store.isOpen ? "Fechar" : "Abrir"}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {DAYS.map((d) => (
              <div key={d.key} className="flex items-center gap-3 p-3 rounded-lg border">
                <span className="text-sm font-medium w-32">{d.label}</span>
                <Button size="sm" variant={hours[d.key]?.open ? "default" : "outline"} onClick={() => toggleDay(d.key)} className="min-w-24">
                  {hours[d.key]?.open ? "Aberto" : "Fechado"}
                </Button>
                {hours[d.key]?.open && (
                  <div className="flex items-center gap-2">
                    <Input type="time" value={hours[d.key]?.from || ""} onChange={(e) => updateTime(d.key, "from", e.target.value)} className="h-8 w-28" />
                    <span className="text-xs text-muted-foreground">até</span>
                    <Input type="time" value={hours[d.key]?.to || ""} onChange={(e) => updateTime(d.key, "to", e.target.value)} className="h-8 w-28" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end mt-4">
        <Button onClick={() => save({ businessHours: JSON.stringify(hours) })} disabled={saving} className="min-w-40">
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando…</> : <><Save className="h-4 w-4 mr-2" /> Salvar</>}
        </Button>
      </div>
    </AdminShell>
  );
}

// ====== CONFIGURAÇÃO DE ENTREGA ======
export function AdminDeliveryView() {
  const { store, loading, saving, save } = useStoreData();
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (store) {
      setForm({
        deliveryActive: store.deliveryActive,
        deliveryMode: store.deliveryMode || "FIXED",
        deliveryFee: store.deliveryFee,
        deliveryBaseFee: store.deliveryBaseFee,
        deliveryPerKm: store.deliveryPerKm,
        deliveryMaxKm: store.deliveryMaxKm,
        freeDeliveryAbove: store.freeDeliveryAbove,
        minOrder: store.minOrder,
      });
    }
  }, [store]);

  if (loading || !store) return <LoadingShell />;

  const calcExample = form.deliveryBaseFee + (5 * form.deliveryPerKm);

  return (
    <AdminShell title="Configuração de Entrega" subtitle="Configure como a taxa de entrega é calculada" icon={Truck}>
      <div className="grid gap-5">
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold">Entrega ativa</h3>
                <p className="text-xs text-muted-foreground">Ativa ou desativa a opção de entrega</p>
              </div>
              <Button size="sm" variant={form.deliveryActive ? "default" : "outline"} onClick={() => setForm({ ...form, deliveryActive: !form.deliveryActive })}>
                {form.deliveryActive ? "Ativada" : "Desativada"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold">Modalidade de Cálculo</h3>
            <div className="grid gap-2">
              <button
                onClick={() => setForm({ ...form, deliveryMode: "FIXED" })}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${form.deliveryMode === "FIXED" ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <div className={`h-4 w-4 rounded-full border-2 mt-0.5 ${form.deliveryMode === "FIXED" ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                <div>
                  <div className="text-sm font-semibold">Taxa Fixa</div>
                  <div className="text-xs text-muted-foreground">Valor único para todas as entregas</div>
                </div>
              </button>
              <button
                onClick={() => setForm({ ...form, deliveryMode: "BASE_KM" })}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${form.deliveryMode === "BASE_KM" ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <div className={`h-4 w-4 rounded-full border-2 mt-0.5 ${form.deliveryMode === "BASE_KM" ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                <div>
                  <div className="text-sm font-semibold">Taxa Base + Valor por KM</div>
                  <div className="text-xs text-muted-foreground">Calcula a distância e aplica taxa base + valor por quilômetro</div>
                </div>
              </button>
              <button
                onClick={() => setForm({ ...form, deliveryMode: "AREAS" })}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${form.deliveryMode === "AREAS" ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <div className={`h-4 w-4 rounded-full border-2 mt-0.5 ${form.deliveryMode === "AREAS" ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                <div>
                  <div className="text-sm font-semibold">Por Áreas de Entrega</div>
                  <div className="text-xs text-muted-foreground">Define áreas com taxas fixas por bairro ou região</div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {form.deliveryMode === "FIXED" && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-bold">Taxa fixa</h3>
              <div><Label className="text-xs">Taxa de Entrega (R$)</Label><Input type="number" step="0.01" value={form.deliveryFee} onChange={(e) => setForm({ ...form, deliveryFee: parseFloat(e.target.value) || 0 })} className="h-10" /></div>
            </CardContent>
          </Card>
        )}

        {form.deliveryMode === "BASE_KM" && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-bold">Configuração Base + KM</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div><Label className="text-xs">Taxa Base (R$)</Label><Input type="number" step="0.01" value={form.deliveryBaseFee} onChange={(e) => setForm({ ...form, deliveryBaseFee: parseFloat(e.target.value) || 0 })} className="h-10" /></div>
                <div><Label className="text-xs">Taxa por KM (R$)</Label><Input type="number" step="0.01" value={form.deliveryPerKm} onChange={(e) => setForm({ ...form, deliveryPerKm: parseFloat(e.target.value) || 0 })} className="h-10" /></div>
                <div><Label className="text-xs">Distância Máxima (KM)</Label><Input type="number" value={form.deliveryMaxKm} onChange={(e) => setForm({ ...form, deliveryMaxKm: parseFloat(e.target.value) || 10 })} className="h-10" /></div>
              </div>
              <div className="p-3 rounded-lg bg-secondary text-xs">
                <strong>Exemplo (5km):</strong> R$ {form.deliveryBaseFee.toFixed(2)} + (5km × R$ {form.deliveryPerKm.toFixed(2)}) = R$ {calcExample.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold">Outras configurações</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label className="text-xs">Pedido mínimo (R$)</Label><Input type="number" step="0.01" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: parseFloat(e.target.value) || 0 })} className="h-10" /></div>
              <div><Label className="text-xs">Entrega Grátis acima de (R$)</Label><Input type="number" step="0.01" value={form.freeDeliveryAbove || ""} onChange={(e) => setForm({ ...form, freeDeliveryAbove: e.target.value ? parseFloat(e.target.value) : null })} placeholder="Deixe vazio para desativar" className="h-10" /></div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => save(form)} disabled={saving} className="min-w-40">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando…</> : <><Save className="h-4 w-4 mr-2" /> Salvar Configurações</>}
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}

// ====== ENTREGADORES ======
export function AdminDriversView() {
  const { store, activeStoreId } = useStoreData();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: "", phone: "" });

  const load = useCallback(() => {
    if (!activeStoreId) return;
    setLoading(true);
    fetch(`/api/my/stores/${activeStoreId}/drivers`)
      .then((r) => r.json())
      .then((d) => setDrivers(d.drivers || []))
      .finally(() => setLoading(false));
  }, [activeStoreId]);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!newDriver.name || !newDriver.phone) return toast.error("Preencha nome e telefone");
    try {
      const res = await fetch(`/api/my/stores/${activeStoreId}/drivers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDriver),
      });
      if (!res.ok) throw new Error();
      toast.success("Entregador adicionado");
      setNewDriver({ name: "", phone: "" });
      setAdding(false);
      load();
    } catch { toast.error("Erro ao adicionar"); }
  };

  const remove = async (id: string) => {
    try {
      await fetch(`/api/my/stores/${activeStoreId}/drivers/${id}`, { method: "DELETE" });
      toast.success("Removido");
      load();
    } catch { toast.error("Erro"); }
  };

  if (!store) return <LoadingShell />;

  return (
    <AdminShell title="Entregadores" subtitle="Gerencie os entregadores da sua loja" icon={MapPin}>
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Entregadores Cadastrados ({drivers.length})</h3>
            <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="h-4 w-4 mr-1" /> Novo Entregador</Button>
          </div>
          {adding && (
            <div className="p-3 rounded-lg border mb-3 space-y-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <Input value={newDriver.name} onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })} placeholder="Nome" className="h-9" />
                <Input value={newDriver.phone} onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })} placeholder="Telefone" className="h-9" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={add}>Adicionar</Button>
                <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancelar</Button>
              </div>
            </div>
          )}
          {loading ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Carregando…</p>
          ) : drivers.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">Nenhum entregador cadastrado. Clique em &ldquo;Novo Entregador&rdquo; para adicionar.</p>
          ) : (
            <div className="space-y-2">
              {drivers.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="grid place-items-center h-9 w-9 rounded-full bg-secondary"><MapPin className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.phone}</div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => remove(d.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
}

// ====== MENSAGENS AUTOMÁTICAS ======
export function AdminMessagesView() {
  const { store, loading, saving, save } = useStoreData();
  const [enabled, setEnabled] = useState(false);
  const [messages, setMessages] = useState<any>({});
  const [trackingText, setTrackingText] = useState("");

  useEffect(() => {
    if (store) {
      setEnabled(store.autoMessagesEnabled);
      setTrackingText(store.trackingText || "📍 Acompanhe em tempo real: {link}");
      try { setMessages(JSON.parse(store.autoMessages || DEFAULT_AUTO_MESSAGES)); } catch { setMessages(JSON.parse(DEFAULT_AUTO_MESSAGES)); }
    }
  }, [store]);

  if (loading || !store) return <LoadingShell />;

  const updateMsg = (status: string, val: string) => setMessages({ ...messages, [status]: val });

  const handleSave = () => {
    save({
      autoMessagesEnabled: enabled,
      autoMessages: JSON.stringify(messages),
      trackingText,
    });
  };

  return (
    <AdminShell title="Mensagens Automáticas de WhatsApp" subtitle="Personalize as mensagens enviadas aos clientes em cada etapa do pedido" icon={MessageCircle}>
      <div className="grid gap-5">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold">Envio automático ao mudar o status</h3>
                <p className="text-xs text-muted-foreground">Envia a mensagem via WhatsApp automaticamente quando o operador atualiza o status</p>
              </div>
              <Button size="sm" variant={enabled ? "default" : "outline"} onClick={() => setEnabled(!enabled)}>
                {enabled ? "Ativado" : "Desativado"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(STATUS_LABELS).map((s) => (
                <Badge key={s} variant="secondary" className="text-[10px]">{STATUS_LABELS[s]}</Badge>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mb-4">
              <strong>Variáveis disponíveis:</strong> {"{nome}"} (nome do cliente), {"{numero}"} (número do pedido), {"{link}"} (link de rastreamento)
            </div>
            <div className="space-y-4">
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <div key={status}>
                  <Label className="text-xs font-semibold">{label}</Label>
                  <Textarea
                    value={messages[status] || ""}
                    onChange={(e) => updateMsg(status, e.target.value)}
                    rows={2}
                    className="mt-1 resize-none text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Label className="text-xs font-semibold">Texto do link de rastreamento</Label>
              <Input value={trackingText} onChange={(e) => setTrackingText(e.target.value)} className="h-10 mt-1" />
              <p className="text-[10px] text-muted-foreground mt-1">Este texto será adicionado às mensagens onde o checkbox &ldquo;Incluir link&rdquo; está marcado</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="min-w-40">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando…</> : <><Save className="h-4 w-4 mr-2" /> Salvar Mensagens</>}
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}

// ====== CONFIGURAÇÃO DE IMPRESSORA ======
export function AdminPrinterView() {
  const { store, loading, saving, save } = useStoreData();
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (store) {
      setForm({
        printerMode: store.printerMode || "BROWSER",
        printerCopies: store.printerCopies || 1,
        printerWidth: store.printerWidth || "80mm",
        printerAutoPrint: store.printerAutoPrint,
        printerAutoReport: store.printerAutoReport,
      });
    }
  }, [store]);

  if (loading || !store) return <LoadingShell />;

  const modes = [
    { id: "BROWSER", label: "Navegador (Padrão)", desc: "Abre a janela de impressão do navegador. Funciona em qualquer impressora." },
    { id: "PRINTNODE", label: "PrintNode (Nuvem)", desc: "Impressão silenciosa pela nuvem. Requer o cliente PrintNode instalado." },
    { id: "QZ", label: "QZ Tray (Direto)", desc: "Impressão silenciosa direto para a impressora térmica. Requer QZ Tray instalado." },
  ];

  return (
    <AdminShell title="Configuração de Impressora" subtitle="Configure as opções de impressão para os pedidos" icon={Printer}>
      <div className="grid gap-5">
        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold">Modo de Impressão</h3>
            <div className="space-y-2">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setForm({ ...form, printerMode: m.id })}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all w-full ${form.printerMode === m.id ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <div className={`h-4 w-4 rounded-full border-2 mt-0.5 ${form.printerMode === m.id ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                  <div>
                    <div className="text-sm font-semibold">{m.label}</div>
                    <div className="text-xs text-muted-foreground">{m.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold">Opções</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Número de Vias</Label>
                <Input type="number" min={1} max={5} value={form.printerCopies} onChange={(e) => setForm({ ...form, printerCopies: parseInt(e.target.value) || 1 })} className="h-10" />
              </div>
              <div>
                <Label className="text-xs">Largura do Papel</Label>
                <select value={form.printerWidth} onChange={(e) => setForm({ ...form, printerWidth: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="58mm">58mm</option>
                  <option value="80mm">80mm</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><div className="text-sm font-medium">Impressão Automática</div><div className="text-xs text-muted-foreground">Imprimir automaticamente ao receber um novo pedido</div></div>
                <Button size="sm" variant={form.printerAutoPrint ? "default" : "outline"} onClick={() => setForm({ ...form, printerAutoPrint: !form.printerAutoPrint })}>{form.printerAutoPrint ? "On" : "Off"}</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><div className="text-sm font-medium">Relatório de Fechamento</div><div className="text-xs text-muted-foreground">Imprimir automaticamente o relatório do dia quando a loja fechar</div></div>
                <Button size="sm" variant={form.printerAutoReport ? "default" : "outline"} onClick={() => setForm({ ...form, printerAutoReport: !form.printerAutoReport })}>{form.printerAutoReport ? "On" : "Off"}</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => save(form)} disabled={saving} className="min-w-40">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando…</> : <><Save className="h-4 w-4 mr-2" /> Salvar Configurações</>}
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}

// ====== PAGAMENTO ONLINE ======
export function AdminPaymentView() {
  const { store, loading, saving, save } = useStoreData();
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (store) {
      setForm({
        pixKey: store.pixKey || "",
        paymentLink: store.paymentLink || "",
        paymentGateway: store.paymentGateway || null,
        paymentConnected: store.paymentConnected,
      });
    }
  }, [store]);

  if (loading || !store) return <LoadingShell />;

  const connect = (gateway: string) => {
    setForm({ ...form, paymentGateway: gateway, paymentConnected: true });
    toast.success(`${gateway === "stripe" ? "Stripe" : "Mercado Pago"} conectado (demo)`);
  };

  return (
    <AdminShell title="Pagamento Online" subtitle="Configure os métodos de pagamento online disponíveis no checkout" icon={CreditCard}>
      <div className="grid gap-5">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Gateway de Pagamento</h3>
              <Badge variant={form.paymentConnected ? "default" : "secondary"}>{form.paymentConnected ? "Conectada" : "Não conectada"}</Badge>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                onClick={() => connect("stripe")}
                className={`p-4 rounded-xl border text-left transition-all ${form.paymentGateway === "stripe" ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}
              >
                <div className="font-bold text-sm mb-1">Stripe</div>
                <div className="text-xs text-muted-foreground">Cartão + PIX via Stripe</div>
                {form.paymentGateway === "stripe" && <Badge className="mt-2 text-[10px]">Conectado</Badge>}
              </button>
              <button
                onClick={() => connect("mercadopago")}
                className={`p-4 rounded-xl border text-left transition-all ${form.paymentGateway === "mercadopago" ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}
              >
                <div className="font-bold text-sm mb-1">Mercado Pago</div>
                <div className="text-xs text-muted-foreground">Checkout Pro</div>
                {form.paymentGateway === "mercadopago" && <Badge className="mt-2 text-[10px]">Conectado</Badge>}
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold">Pagamento manual (sem gateway)</h3>
            <div>
              <Label className="text-xs">Chave Pix</Label>
              <Input value={form.pixKey} onChange={(e) => setForm({ ...form, pixKey: e.target.value })} placeholder="email, CPF, telefone ou aleatória" className="h-10" />
            </div>
            <div>
              <Label className="text-xs">Link de pagamento (cartão)</Label>
              <Input value={form.paymentLink} onChange={(e) => setForm({ ...form, paymentLink: e.target.value })} placeholder="https://mpago.la/…" className="h-10" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => save(form)} disabled={saving} className="min-w-40">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando…</> : <><Save className="h-4 w-4 mr-2" /> Salvar</>}
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}

// ====== ÁREAS DA COZINHA ======
export function AdminKitchenView() {
  const { store } = useStoreData();
  const { activeStoreId, setView } = useNav();
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newArea, setNewArea] = useState({ name: "", color: "#E85D2C" });

  const load = useCallback(() => {
    if (!activeStoreId) return;
    setLoading(true);
    fetch(`/api/my/stores/${activeStoreId}/kitchen-areas`)
      .then((r) => r.json())
      .then((d) => setAreas(d.areas || []))
      .finally(() => setLoading(false));
  }, [activeStoreId]);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!newArea.name) return toast.error("Nome obrigatório");
    try {
      const res = await fetch(`/api/my/stores/${activeStoreId}/kitchen-areas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArea),
      });
      if (!res.ok) throw new Error();
      toast.success("Área criada");
      setNewArea({ name: "", color: "#E85D2C" });
      load();
    } catch { toast.error("Erro"); }
  };

  const remove = async (id: string) => {
    try {
      await fetch(`/api/my/stores/${activeStoreId}/kitchen-areas/${id}`, { method: "DELETE" });
      toast.success("Removida");
      load();
    } catch { toast.error("Erro"); }
  };

  if (!store) return <LoadingShell />;

  return (
    <AdminShell title="Áreas da Cozinha" subtitle="Gerencie as áreas/estações de preparo da sua cozinha" icon={Utensils}>
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Áreas da Cozinha ({areas.length})</h3>
            <div className="flex gap-2">
              <Input value={newArea.name} onChange={(e) => setNewArea({ ...newArea, name: e.target.value })} placeholder="Ex: Fritura, Chapa, Bar" className="h-9 w-40" />
              <Button size="sm" onClick={add}><Plus className="h-4 w-4 mr-1" /> Nova Área</Button>
            </div>
          </div>
          {loading ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Carregando…</p>
          ) : areas.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">Nenhuma área cadastrada. Crie áreas como Fritura, Chapa, Bar, etc.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {areas.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: a.color }} />
                  <span className="flex-1 text-sm font-medium">{a.name}</span>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => remove(a.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardContent className="p-5">
          <h3 className="font-bold mb-2">KDS da Cozinha</h3>
          <p className="text-xs text-muted-foreground mb-3">Acesse o sistema de display da cozinha para acompanhar pedidos em tempo real</p>
          <Button onClick={() => setView("admin-kds")}><Monitor className="h-4 w-4 mr-2" /> Abrir KDS da Cozinha</Button>
        </CardContent>
      </Card>
    </AdminShell>
  );
}

// ====== KDS DA COZINHA ======
export function AdminKdsView() {
  return <AdminShell title="KDS da Cozinha" subtitle="Display da cozinha para acompanhamento de pedidos em tempo real" icon={Monitor}>
    <Card>
      <CardContent className="p-8 text-center">
        <Monitor className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-muted-foreground mb-4">O KDS mostra os pedidos em preparo em tempo real, organizados por área da cozinha.</p>
        <p className="text-xs text-muted-foreground">Use o painel de &ldquo;Pedidos&rdquo; para gerenciar o status dos pedidos. O KDS dedicado será exibido em uma tela separada para a cozinha.</p>
      </CardContent>
    </Card>
  </AdminShell>;
}

// ====== DOMÍNIO PRÓPRIO ======
export function AdminDomainView() {
  const { store, loading, saving, save } = useStoreData();
  const [domain, setDomain] = useState("");

  useEffect(() => { if (store) setDomain(store.customDomain || ""); }, [store]);

  if (loading || !store) return <LoadingShell />;

  const verify = () => {
    save({ customDomain: domain, domainVerified: true });
    toast.success("Domínio verificado (demo)");
  };

  return (
    <AdminShell title="Domínio Próprio" subtitle="Conecte seu domínio para sua loja ter um endereço próprio" icon={Globe}>
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Status atual</h3>
            <Badge variant={store.domainVerified ? "default" : "secondary"}>{store.domainVerified ? "Configurado" : "Não configurado"}</Badge>
          </div>
          <div>
            <Label className="text-xs">Seu domínio</Label>
            <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="minhaloja.com.br" className="h-10" />
            <p className="text-[10px] text-muted-foreground mt-1">Digite sem https:// e sem www.</p>
          </div>
          <Button onClick={verify} disabled={saving}><Globe className="h-4 w-4 mr-2" /> Verificar DNS</Button>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardContent className="p-5">
          <h3 className="font-bold mb-3">Como configurar (passo a passo)</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1. Acesse o painel do seu provedor (Registro.br, GoDaddy, Cloudflare etc.)</li>
            <li>2. Vá em Zona DNS ou Gerenciar DNS</li>
            <li>3. Crie 2 registros do tipo A apontando para o IP:</li>
          </ol>
          <div className="mt-3 p-3 rounded-lg bg-secondary font-mono text-xs space-y-1">
            <div>A &nbsp; @ &nbsp; 185.158.133.1</div>
            <div>A &nbsp; www &nbsp; 185.158.133.1</div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">⏱️ A propagação do DNS pode levar de alguns minutos até 72h.</p>
        </CardContent>
      </Card>
    </AdminShell>
  );
}

// ====== INTEGRAÇÕES ======
export function AdminIntegrationsView() {
  return <AdminShell title="Integrações" subtitle="Conecte o app às ferramentas que você já usa" icon={Plug}>
    <div className="grid gap-4">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold">Marketplaces</h3>
              <p className="text-xs text-muted-foreground">Receba pedidos de plataformas externas dentro do seu painel</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="grid place-items-center h-10 w-10 rounded-lg bg-secondary"><Plug className="h-5 w-5" /></div>
              <div className="flex-1">
                <div className="font-semibold text-sm">99Food</div>
                <div className="text-xs text-muted-foreground">Receba pedidos do 99Food direto no seu painel</div>
              </div>
              <Badge variant="secondary" className="text-[10px]">Não conectado</Badge>
              <Button size="sm" variant="outline" onClick={() => toast.info("Integração 99Food (demo)")}>Configurar</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <h3 className="font-bold mb-3">Logística</h3>
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <div className="grid place-items-center h-10 w-10 rounded-lg bg-secondary"><Truck className="h-5 w-5" /></div>
            <div className="flex-1">
              <div className="font-semibold text-sm">Gami</div>
              <div className="text-xs text-muted-foreground">Solicite motoboys terceirizados da Gami</div>
            </div>
            <Badge variant="secondary" className="text-[10px]">Não conectado</Badge>
            <Button size="sm" variant="outline" onClick={() => toast.info("Integração Gami (demo)")}>Configurar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </AdminShell>;
}

// ====== USUÁRIOS E PERMISSÕES ======
export function AdminUsersView() {
  const { store } = useStoreData();
  const { profile } = useStoreData();

  if (!store) return <LoadingShell />;

  return <AdminShell title="Usuários e Permissões" subtitle="Cadastre quem pode acessar o painel desta loja" icon={UserCog}>
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Membros (1)</h3>
          <Button size="sm" onClick={() => toast.info("Convite por email (demo)")}><Plus className="h-4 w-4 mr-1" /> Adicionar usuário</Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <div className="grid place-items-center h-10 w-10 rounded-full bg-primary/15 text-primary font-bold">
              {(profile?.name || store.name).charAt(0)}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{profile?.name || "Dono"} (você)</div>
              <div className="text-xs text-muted-foreground">{profile?.email}</div>
            </div>
            <Badge className="text-[10px]">Dono</Badge>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-semibold mb-2">Convites pendentes (0)</h4>
          <p className="text-xs text-muted-foreground">Nenhum convite pendente.</p>
        </div>
      </CardContent>
    </Card>
  </AdminShell>;
}

// ====== CLIENTES ======
export function AdminCustomersView() {
  const { activeStoreId, store } = useStoreData();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeStoreId) return;
    setLoading(true);
    fetch(`/api/my/stores/${activeStoreId}/customers`)
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers || []))
      .finally(() => setLoading(false));
  }, [activeStoreId]);

  if (!store) return <LoadingShell />;

  return <AdminShell title="Clientes" subtitle={`${customers.length} clientes que já fizeram pedidos`} icon={Users}>
    <Card>
      <CardContent className="p-5">
        {loading ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Carregando…</p>
        ) : customers.length === 0 ? (
          <p className="text-xs text-muted-foreground py-8 text-center">Nenhum cliente ainda.</p>
        ) : (
          <div className="space-y-2">
            {customers.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="grid place-items-center h-9 w-9 rounded-full bg-secondary font-bold text-sm">{c.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.phone}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">R$ {c.totalSpent.toFixed(2)}</div>
                  <div className="text-[10px] text-muted-foreground">{c.ordersCount} pedidos</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </AdminShell>;
}

// ====== RELATÓRIOS / DASHBOARD ======
export function AdminReportsView() {
  const { activeStoreId, store } = useStoreData();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeStoreId) return;
    setLoading(true);
    fetch(`/api/my/stores/${activeStoreId}/reports`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [activeStoreId]);

  if (loading || !store || !data) return <LoadingShell />;

  const kpis = data.kpis;

  return <AdminShell title="Dashboard" subtitle="Visão geral das vendas e pedidos" icon={BarChart3}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-5">
        <KpiCard label="Vendas hoje" value={`R$ ${kpis.todayRevenue.toFixed(2)}`} sub={`${kpis.todayOrdersCount} pedidos`} />
        <KpiCard label="Vendas 7 dias" value={`R$ ${kpis.weekRevenue.toFixed(2)}`} sub="última semana" />
        <KpiCard label="Total geral" value={`R$ ${kpis.totalRevenue.toFixed(2)}`} sub={`${kpis.totalOrders} pedidos`} />
        <KpiCard label="Ticket médio" value={`R$ ${kpis.avgTicket.toFixed(2)}`} sub="por pedido" />
      </div>

      <Card className="mb-4">
        <CardContent className="p-5">
          <h3 className="font-bold mb-3">Tendência de vendas (7 dias)</h3>
          <div className="h-40 flex items-end gap-2">
            {data.dailyTrend.map((d: any, i: number) => {
              const maxRev = Math.max(...data.dailyTrend.map((x: any) => x.revenue), 1);
              const h = (d.revenue / maxRev) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-primary/20 rounded-t-md flex items-end" style={{ height: "100%" }}>
                    <div className="w-full bg-primary rounded-t-md transition-all" style={{ height: `${Math.max(h, 2)}%` }} />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{d.label.split(" ")[0]}</span>
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
              {data.topProducts.map((p: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{p.name}</span>
                  <span className="font-medium">{p.qty} un.</span>
                </div>
              ))}
              {data.topProducts.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Sem dados ainda.</p>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h3 className="font-bold mb-3">Formas de pagamento</h3>
            <div className="space-y-2">
              {data.paymentBreakdown.map((p: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{p.name === "PIX" ? "Pix" : p.name === "CARD" ? "Cartão" : "Na entrega"}</span>
                  <span className="font-medium">{p.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  </AdminShell>;
}

function KpiCard({ label, value, sub }: any) {
  return (
    <Card><CardContent className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
    </CardContent></Card>
  );
}

// ====== ESTOQUE ======
export function AdminStockView() {
  const { activeStoreId, store } = useStoreData();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!activeStoreId) return;
    setLoading(true);
    fetch(`/api/my/stores/${activeStoreId}`)
      .then((r) => r.json())
      .then((d) => {
        const allItems = (d.store?.menuSections || []).flatMap((s: any) => s.items);
        setItems(allItems);
      })
      .finally(() => setLoading(false));
  }, [activeStoreId]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/my/stores/${activeStoreId}/menu/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !current }),
      });
      load();
    } catch { toast.error("Erro"); }
  };

  if (!store) return <LoadingShell />;

  return <AdminShell title="Estoque" subtitle="Controle de disponibilidade dos produtos" icon={Boxes}>
    <Card>
      <CardContent className="p-5">
        {loading ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Carregando…</p>
        ) : items.length === 0 ? (
          <p className="text-xs text-muted-foreground py-8 text-center">Nenhum produto cadastrado.</p>
        ) : (
          <div className="space-y-2">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="flex-1">
                  <div className="text-sm font-medium">{it.name}</div>
                  <div className="text-xs text-muted-foreground">R$ {it.price.toFixed(2)}</div>
                </div>
                <Button size="sm" variant={it.isAvailable ? "default" : "outline"} onClick={() => toggle(it.id, it.isAvailable)}>
                  {it.isAvailable ? "Disponível" : "Indisponível"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </AdminShell>;
}
