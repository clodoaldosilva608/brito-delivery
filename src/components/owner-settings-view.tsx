"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNav } from "@/lib/store";
import { toast } from "sonner";
import { ChevronLeft, Loader2, Save, Power } from "lucide-react";

interface StoreData {
  id: string;
  name: string;
  description: string | null;
  category: string;
  logoUrl: string | null;
  coverUrl: string | null;
  address: string | null;
  cep: string | null;
  phone: string | null;
  openingHours: string | null;
  deliveryFee: number;
  minOrder: number;
  avgDeliveryMin: number;
  pixKey: string | null;
  paymentLink: string | null;
  isOpen: boolean;
  isActive: boolean;
}

export function OwnerSettingsView() {
  const { activeStoreId, setView } = useNav();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<StoreData | null>(null);

  useEffect(() => {
    if (!activeStoreId) {
      setView("dashboard");
      return;
    }
    setLoading(true);
    fetch(`/api/my/stores/${activeStoreId}`)
      .then((r) => r.json())
      .then((d) => {
        setStore(d.store);
        setForm(d.store);
      })
      .finally(() => setLoading(false));
  }, [activeStoreId, setView]);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/my/stores/${activeStoreId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Configurações salvas");
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const toggleOpen = async () => {
    if (!store) return;
    try {
      const res = await fetch(`/api/my/stores/${activeStoreId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: !store.isOpen }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStore(data.store);
      setForm(data.store);
      toast.success(data.store.isOpen ? "Loja aberta" : "Loja fechada");
    } catch {
      toast.error("Erro");
    }
  };

  if (loading || !form) {
    return <div className="container-brito py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></div>;
  }

  return (
    <div className="container-brito py-6">
      <button
        onClick={() => setView("dashboard")}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-3"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Voltar ao painel
      </button>

      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold">Configurações · {form.name}</h1>
          <p className="text-sm text-muted-foreground">Dados da loja e pagamento</p>
        </div>
        <Button variant={form.isOpen ? "default" : "outline"} onClick={toggleOpen}>
          <Power className="h-4 w-4 mr-1.5" />
          {form.isOpen ? "Aberta" : "Fechada"}
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Info básica */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold">Informações</h3>
            <div>
              <Label className="text-xs">Nome</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10" />
            </div>
            <div>
              <Label className="text-xs">Descrição</Label>
              <Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="resize-none text-sm" />
            </div>
            <div>
              <Label className="text-xs">Categoria</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-10" />
            </div>
            <div>
              <Label className="text-xs">Telefone</Label>
              <Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-10" />
            </div>
            <div>
              <Label className="text-xs">Endereço</Label>
              <Input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} className="h-10" />
            </div>
            <div>
              <Label className="text-xs">Horário</Label>
              <Input value={form.openingHours || ""} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} className="h-10" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          {/* Mídia */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-bold">Mídia</h3>
              <div>
                <Label className="text-xs">URL do logo</Label>
                <Input value={form.logoUrl || ""} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} className="h-10" />
              </div>
              <div>
                <Label className="text-xs">URL da capa</Label>
                <Input value={form.coverUrl || ""} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} className="h-10" />
              </div>
            </CardContent>
          </Card>

          {/* Entrega */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-bold">Entrega</h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Taxa (R$)</Label>
                  <Input type="number" step="0.01" value={form.deliveryFee} onChange={(e) => setForm({ ...form, deliveryFee: parseFloat(e.target.value) || 0 })} className="h-10" />
                </div>
                <div>
                  <Label className="text-xs">Mín. (R$)</Label>
                  <Input type="number" step="0.01" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: parseFloat(e.target.value) || 0 })} className="h-10" />
                </div>
                <div>
                  <Label className="text-xs">Tempo (min)</Label>
                  <Input type="number" value={form.avgDeliveryMin} onChange={(e) => setForm({ ...form, avgDeliveryMin: parseInt(e.target.value) || 30 })} className="h-10" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pagamento */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-bold flex items-center gap-2">
                Pagamento
                <Badge variant="secondary" className="text-[10px]">Sem cobrança automática</Badge>
              </h3>
              <div>
                <Label className="text-xs">Chave Pix</Label>
                <Input value={form.pixKey || ""} onChange={(e) => setForm({ ...form, pixKey: e.target.value })} placeholder="email, CPF, telefone ou aleatória" className="h-10" />
                <p className="text-[10px] text-muted-foreground mt-1">Mostrada ao cliente para copiar no checkout.</p>
              </div>
              <div>
                <Label className="text-xs">Link de pagamento (cartão)</Label>
                <Input value={form.paymentLink || ""} onChange={(e) => setForm({ ...form, paymentLink: e.target.value })} placeholder="https://mpago.la/…" className="h-10" />
                <p className="text-[10px] text-muted-foreground mt-1">Link externo (Mercado Pago, Stripe, etc.) aberto no checkout.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <Button onClick={save} disabled={saving} className="min-w-40">
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando…</> : <><Save className="h-4 w-4 mr-2" /> Salvar alterações</>}
        </Button>
      </div>
    </div>
  );
}
