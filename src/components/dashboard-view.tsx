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
  _count: { orders: number; menuItems: number };
}

export function DashboardView() {
  const { setView, activeStoreId, setActiveStoreId } = useNav();
  const { profile } = useSession();
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      setView("auth");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch("/api/my/stores")
      .then((r) => r.json())
      .then((d) => setStores(d.stores || []))
      .finally(() => setLoading(false));
     
  }, [profile]);

  const goToStoreSection = (storeId: string, view: any) => {
    setActiveStoreId(storeId);
    setView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!profile) {
    return <div className="container-brito py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></div>;
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

      {loading ? (
        <Card><CardContent className="p-6 text-center text-muted-foreground">Carregando…</CardContent></Card>
      ) : stores.length === 0 ? (
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
      ) : (
        <div className="space-y-4">
          {stores.map((s, idx) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card>
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
                        {s.isOpen && s.isActive && <Badge className="text-[10px] bg-chart-2/15 text-chart-2 border-chart-2/30">Aberta</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {s._count.menuItems} itens no cardápio · {s._count.orders} pedidos totais
                      </div>
                      <div className="text-xs mt-1 flex gap-3">
                        <span className={s.pixKey ? "text-chart-2" : "text-muted-foreground"}>
                          Pix: {s.pixKey ? "configurado" : "pendente"}
                        </span>
                        <span className={s.paymentLink ? "text-chart-2" : "text-muted-foreground"}>
                          Cartão: {s.paymentLink ? "configurado" : "pendente"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button variant="outline" size="sm" className="h-auto py-2 flex-col gap-1" onClick={() => goToStoreSection(s.id, "owner-orders")}>
                      <Package className="h-4 w-4" />
                      <span className="text-xs">Pedidos</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-auto py-2 flex-col gap-1" onClick={() => goToStoreSection(s.id, "owner-menu")}>
                      <UtensilsCrossed className="h-4 w-4" />
                      <span className="text-xs">Cardápio</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-auto py-2 flex-col gap-1" onClick={() => goToStoreSection(s.id, "owner-settings")}>
                      <Settings className="h-4 w-4" />
                      <span className="text-xs">Config</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-auto py-2 flex-col gap-1" onClick={() => { setActiveStoreId(s.id); setView("store"); }}>
                      <ArrowRight className="h-4 w-4" />
                      <span className="text-xs">Ver pública</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
