"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNav, useSession } from "@/lib/store";
import { toast } from "sonner";
import {
  ChevronLeft, Store, Package, UtensilsCrossed, Settings, ArrowRight, Loader2, Plus,
  Image, Phone, Clock, Truck, Tag, ShoppingBag, CreditCard, Printer, Share2,
  CheckCircle2, Circle, Crown, BarChart3, Users, Megaphone, Boxes,
  MapPin, MessageCircle, Utensils, Monitor, Globe, Plug, UserCog, Package2,
} from "lucide-react";

interface StoreSummary {
  id: string;
  slug: string;
  name: string;
  category: string;
  logoUrl: string | null;
  isActive: boolean;
  isOpen: boolean;
  pixKey: string | null;
  paymentLink: string | null;
  paymentConnected: boolean;
  banners: string | null;
  businessHours: string | null;
  deliveryMode: string;
  customDomain: string | null;
  instagram: string | null;
  trialEndsAt: string | null;
  _count: { orders: number; menuItems: number };
}

const ONBOARDING_STEPS = [
  { key: "logo", label: "Personalizar sua loja", desc: "Envie sua logo e o banner do topo.", view: "admin-customize" },
  { key: "info", label: "Informações da loja", desc: "Telefone/WhatsApp e endereço da loja.", view: "admin-info" },
  { key: "hours", label: "Horário de funcionamento", desc: "Defina os dias e horários de abertura.", view: "admin-status" },
  { key: "delivery", label: "Área de entrega e taxa", desc: "Configure as zonas ou a taxa por distância.", view: "admin-delivery" },
  { key: "categories", label: "Criar categorias", desc: "Ex.: Lanches, Bebidas, Sobremesas.", view: "owner-menu" },
  { key: "products", label: "Cadastrar produtos", desc: "Adicione seus primeiros itens ao cardápio.", view: "owner-menu" },
  { key: "payment", label: "Receber pagamento online", desc: "Conecte o Mercado Pago para PIX e cartão.", view: "admin-payment" },
  { key: "printer", label: "Impressão de pedidos", desc: "Escolha o modo de impressão dos pedidos.", view: "admin-printer" },
  { key: "share", label: "Divulgar o link da loja", desc: "Copie o link e compartilhe com seus clientes.", view: "dashboard" },
];

const ADMIN_SECTIONS = [
  { label: "Pedidos", view: "owner-orders", icon: Package, group: "main" },
  { label: "Produtos", view: "owner-menu", icon: ShoppingBag, group: "main" },
  { label: "Dashboard", view: "admin-reports", icon: BarChart3, group: "main" },
  { label: "Clientes", view: "admin-customers", icon: Users, group: "main" },
  { label: "Relatórios", view: "admin-reports", icon: BarChart3, group: "main" },
  { label: "Marketing", view: "admin-integrations", icon: Megaphone, group: "main" },
  { label: "Administrar", view: "admin-customize", icon: Settings, group: "admin" },
  { label: "Estoque", view: "admin-stock", icon: Boxes, group: "admin" },
];

const ADMIN_CONFIG_SECTIONS = [
  { label: "Personalizar Loja", view: "admin-customize", icon: Image, desc: "Logo e banners" },
  { label: "Informações da Loja", view: "admin-info", icon: Phone, desc: "Contato e endereço" },
  { label: "Status da Loja", view: "admin-status", icon: Clock, desc: "Horário de funcionamento" },
  { label: "Configuração de Entrega", view: "admin-delivery", icon: Truck, desc: "Taxas e áreas" },
  { label: "Entregadores", view: "admin-drivers", icon: MapPin, desc: "Gerenciar entregadores" },
  { label: "Mensagens Automáticas", view: "admin-messages", icon: MessageCircle, desc: "WhatsApp automático" },
  { label: "Configuração de Impressora", view: "admin-printer", icon: Printer, desc: "Impressão de pedidos" },
  { label: "Cardápio Virtual", view: "admin-customize", icon: UtensilsCrossed, desc: "PDF do cardápio" },
  { label: "Pagamento Online", view: "admin-payment", icon: CreditCard, desc: "Stripe / Mercado Pago" },
  { label: "Áreas da Cozinha", view: "admin-kitchen", icon: Utensils, desc: "Estações de preparo" },
  { label: "KDS da Cozinha", view: "admin-kds", icon: Monitor, desc: "Display da cozinha" },
  { label: "Domínio Próprio", view: "admin-domain", icon: Globe, desc: "Domínio customizado" },
  { label: "Integrações", view: "admin-integrations", icon: Plug, desc: "99Food, Gami, etc" },
  { label: "Usuários e Permissões", view: "admin-users", icon: UserCog, desc: "Membros da equipe" },
];

export function DashboardView() {
  const { setView, activeStoreId, setActiveStoreId, view } = useNav();
  const { profile } = useSession();
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!profile) {
      setView("auth");
      return;
    }
    setLoading(true);
    fetch("/api/my/stores")
      .then((r) => r.json())
      .then((d) => setStores(d.stores || []))
      .finally(() => setLoading(false));
     
  }, [profile]);

  const goToStoreSection = (storeId: string, v: typeof view) => {
    setActiveStoreId(storeId);
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copyLink = (slug: string) => {
    const link = `${window.location.origin}/loja/${slug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!profile) {
    return <div className="container-brito py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></div>;
  }

  if (loading) {
    return <div className="container-brito py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></div>;
  }

  if (stores.length === 0) {
    return (
      <div className="container-brito py-8">
        <h1 className="text-2xl font-bold mb-5">Painel do dono</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <Store className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-4">Você ainda não tem lojas.</p>
            <Button onClick={() => setView("create-store")}>
              <Plus className="h-4 w-4 mr-1.5" />
              Criar primeira loja
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-brito py-6">
      <button
        onClick={() => setView("home")}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-3"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Voltar ao início
      </button>

      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold">Painel do dono</h1>
          <p className="text-sm text-muted-foreground">Bem-vindo, {profile.name.split(" ")[0]}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setView("create-store")}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nova loja
        </Button>
      </div>

      {/* Trial banner */}
      <Card className="mb-4 border-accent/30 bg-accent/5">
        <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-lg bg-accent/15 text-accent">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-sm">Período de teste: 30 dias restantes</div>
              <div className="text-xs text-muted-foreground">Aproveite todos os recursos sem custo</div>
            </div>
          </div>
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
            Assinar agora
          </Button>
        </CardContent>
      </Card>

      {stores.map((s) => {
        const completedSteps = [
          !!s.logoUrl,
          !!(s.phone || s.whatsapp),
          !!s.businessHours,
          s.deliveryMode !== "FIXED" || s.deliveryMode === "FIXED",
          s._count.menuItems > 0,
          s._count.menuItems > 0,
          s.paymentConnected || !!s.pixKey,
          false, // printer (sempre tem config padrão)
          false, // share (ação manual)
        ];
        const completedCount = completedSteps.filter(Boolean).length;

        return (
          <div key={s.id} className="mb-6">
            <Card className="mb-4">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary shrink-0">
                    {s.logoUrl ? (
                       
                      <img src={s.logoUrl} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center font-bold">{s.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold truncate">{s.name}</h3>
                      <Badge variant="secondary" className="text-[10px]">{s.category}</Badge>
                      {!s.isActive && <Badge variant="secondary" className="text-[10px]">Inativa</Badge>}
                      {s.isOpen && s.isActive ? (
                        <Badge className="text-[10px] bg-chart-2/15 text-chart-2 border-chart-2/30">Aberta</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Fechada</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {s._count.menuItems} itens · {s._count.orders} pedidos
                    </div>
                  </div>
                </div>

                {/* Store link */}
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/50 mb-3">
                  <span className="text-xs text-muted-foreground shrink-0">Link da sua loja:</span>
                  <code className="flex-1 text-xs font-mono truncate text-primary">{window.location.origin}/loja/{s.slug}</code>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => copyLink(s.slug)}>
                    <Share2 className="h-3 w-3 mr-1" />
                    {copied ? "Copiado!" : "Copiar"}
                  </Button>
                </div>

                {/* Onboarding checklist */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground">Primeiros passos</span>
                    <span className="text-xs font-bold text-primary">{completedCount} de {ONBOARDING_STEPS.length}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(completedCount / ONBOARDING_STEPS.length) * 100}%` }}
                    />
                  </div>
                  <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                    {ONBOARDING_STEPS.map((step, idx) => {
                      const done = completedSteps[idx];
                      const isShare = step.key === "share";
                      return (
                        <button
                          key={step.key}
                          onClick={() => isShare ? copyLink(s.slug) : goToStoreSection(s.id, step.view as any)}
                          className="flex items-start gap-2 p-2 rounded-lg hover:bg-secondary/50 text-left transition-colors"
                        >
                          {done ? (
                            <CheckCircle2 className="h-4 w-4 text-chart-2 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-medium ${done ? "text-muted-foreground line-through" : ""}`}>
                              {idx + 1}. {step.label}
                            </div>
                          </div>
                          {!done && !isShare && (
                            <span className="text-[10px] text-primary font-medium">Configurar</span>
                          )}
                          {isShare && (
                            <span className="text-[10px] text-primary font-medium">Copiar</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button variant="outline" size="sm" className="h-auto py-2 flex-col gap-1" onClick={() => goToStoreSection(s.id, "owner-orders")}>
                    <Package className="h-4 w-4" />
                    <span className="text-xs">Pedidos</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-2 flex-col gap-1" onClick={() => goToStoreSection(s.id, "owner-menu")}>
                    <UtensilsCrossed className="h-4 w-4" />
                    <span className="text-xs">Cardápio</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-2 flex-col gap-1" onClick={() => goToStoreSection(s.id, "admin-customize")}>
                    <Settings className="h-4 w-4" />
                    <span className="text-xs">Administrar</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-2 flex-col gap-1" onClick={() => { setActiveStoreId(s.id); setView("store"); }}>
                    <ArrowRight className="h-4 w-4" />
                    <span className="text-xs">Ver pública</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Admin config sections grid */}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {ADMIN_CONFIG_SECTIONS.map((sec) => (
                <button
                  key={sec.view}
                  onClick={() => goToStoreSection(s.id, sec.view as any)}
                  className="group flex items-center gap-3 p-3 rounded-xl border bg-card hover:border-primary/40 hover:shadow-sm transition-all text-left"
                >
                  <div className="grid place-items-center h-9 w-9 rounded-lg bg-secondary group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                    <sec.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{sec.label}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{sec.desc}</div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
