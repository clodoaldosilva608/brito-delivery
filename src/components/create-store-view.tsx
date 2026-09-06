"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNav, useSession } from "@/lib/store";
import { toast } from "sonner";
import {
  ChevronLeft, Loader2, Store, Plus, ArrowRight,
} from "lucide-react";

const CATEGORIES = [
  { id: "pizza", label: "Pizza" },
  { id: "burger", label: "Hambúrguer" },
  { id: "japones", label: "Japonês" },
  { id: "doces", label: "Doces" },
  { id: "saudavel", label: "Saudável" },
  { id: "mexicano", label: "Mexicano" },
  { id: "brasileira", label: "Brasileira" },
  { id: "outros", label: "Outros" },
];

interface StoreListItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  isActive: boolean;
  isOpen: boolean;
  _count: { orders: number; menuItems: number };
}

export function CreateStoreView() {
  const { setView } = useNav();
  const { profile, refresh } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [myStores, setMyStores] = useState<StoreListItem[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "burger",
    logoUrl: "",
    coverUrl: "",
    address: "",
    cep: "",
    phone: "",
    openingHours: "",
    deliveryFee: "5.90",
    minOrder: "20.00",
    avgDeliveryMin: "30",
    pixKey: "",
    paymentLink: "",
  });

  const loadStores = () => {
    setLoadingStores(true);
    fetch("/api/my/stores")
      .then((r) => r.json())
      .then((d) => setMyStores(d.stores || []))
      .finally(() => setLoadingStores(false));
  };

  useEffect(() => {
    if (!profile) {
      setView("auth");
      return;
    }
    loadStores();
     
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Nome da loja é obrigatório");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/my/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          category: form.category,
          logoUrl: form.logoUrl || null,
          coverUrl: form.coverUrl || null,
          address: form.address || null,
          cep: form.cep || null,
          phone: form.phone || null,
          openingHours: form.openingHours || null,
          deliveryFee: parseFloat(form.deliveryFee) || 0,
          minOrder: parseFloat(form.minOrder) || 0,
          avgDeliveryMin: parseInt(form.avgDeliveryMin) || 30,
          pixKey: form.pixKey || null,
          paymentLink: form.paymentLink || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro");
      }
      await refresh();
      toast.success("Loja criada!");
      loadStores();
      setShowForm(false);
      setForm({
        name: "", description: "", category: "burger", logoUrl: "", coverUrl: "",
        address: "", cep: "", phone: "", openingHours: "",
        deliveryFee: "5.90", minOrder: "20.00", avgDeliveryMin: "30",
        pixKey: "", paymentLink: "",
      });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!profile) {
    return (
      <div className="container-brito py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
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
          <h1 className="text-2xl font-bold">Minhas lojas</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas lojas e cardápios</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Nova loja
          </Button>
        )}
      </div>

      {/* Existing stores */}
      {!showForm && (
        <div className="space-y-3 mb-6">
          {loadingStores ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">Carregando…</CardContent></Card>
          ) : myStores.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Store className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">Você ainda não tem lojas.</p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Criar primeira loja
                </Button>
              </CardContent>
            </Card>
          ) : (
            myStores.map((s) => (
              <Card key={s.id}>
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold truncate">{s.name}</h3>
                      <Badge variant="secondary" className="text-[10px]">{s.category}</Badge>
                      {!s.isActive && <Badge variant="secondary" className="text-[10px]">Inativa</Badge>}
                      {s.isOpen && s.isActive && <Badge className="text-[10px] bg-chart-2/15 text-chart-2 border-chart-2/30">Aberta</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {s._count.menuItems} itens · {s._count.orders} pedidos
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      useNav.setState({ activeStoreId: s.id, view: "dashboard" });
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Gerenciar
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Form create store */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">Criar nova loja</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Nome da loja *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex. Pizza Forneiro" className="h-10" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Descrição</Label>
                    <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Conte sobre sua cozinha…" rows={2} className="resize-none text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Categoria *</Label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Telefone</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" className="h-10" />
                  </div>
                  <div>
                    <Label className="text-xs">URL do logo</Label>
                    <Input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://…" className="h-10" />
                  </div>
                  <div>
                    <Label className="text-xs">URL da capa</Label>
                    <Input value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} placeholder="https://…" className="h-10" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Endereço</Label>
                    <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Rua, número - bairro" className="h-10" />
                  </div>
                  <div>
                    <Label className="text-xs">CEP</Label>
                    <Input value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} placeholder="00000-000" className="h-10" />
                  </div>
                  <div>
                    <Label className="text-xs">Horário de funcionamento</Label>
                    <Input value={form.openingHours} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} placeholder="Seg-Dom 18h-23h" className="h-10" />
                  </div>
                  <div>
                    <Label className="text-xs">Taxa de entrega (R$)</Label>
                    <Input type="number" step="0.01" value={form.deliveryFee} onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })} className="h-10" />
                  </div>
                  <div>
                    <Label className="text-xs">Pedido mínimo (R$)</Label>
                    <Input type="number" step="0.01" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} className="h-10" />
                  </div>
                  <div>
                    <Label className="text-xs">Tempo médio de entrega (min)</Label>
                    <Input type="number" value={form.avgDeliveryMin} onChange={(e) => setForm({ ...form, avgDeliveryMin: e.target.value })} className="h-10" />
                  </div>
                </div>

                {/* Pagamento */}
                <div className="pt-3 border-t">
                  <h3 className="font-semibold text-sm mb-3">Pagamento</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs">Chave Pix</Label>
                      <Input value={form.pixKey} onChange={(e) => setForm({ ...form, pixKey: e.target.value })} placeholder="email, CPF, telefone ou aleatória" className="h-10" />
                    </div>
                    <div>
                      <Label className="text-xs">Link de pagamento (cartão)</Label>
                      <Input value={form.paymentLink} onChange={(e) => setForm({ ...form, paymentLink: e.target.value })} placeholder="https://mpago.la/…" className="h-10" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Criando…</> : "Criar loja"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
