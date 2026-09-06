"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart, useNav, useSession, formatBRL } from "@/lib/store";
import { MiniMap, useGeocode } from "@/components/mini-map";
import { toast } from "sonner";
import {
  ChevronLeft, Loader2, Copy, ExternalLink, Wallet, CreditCard, Truck, CheckCircle2, MapPin,
} from "lucide-react";

type PaymentMethod = "PIX" | "CARD" | "ON_DELIVERY";

export function CheckoutView() {
  const cart = useCart();
  const { setView } = useNav();
  const { profile } = useSession();

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ orderNumber: number; total: number; paymentMethod: PaymentMethod; pixKey?: string | null; paymentLink?: string | null } | null>(null);

  const [form, setForm] = useState({
    customerName: profile?.name || "",
    customerPhone: profile?.phone || "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    notes: "",
  });

  const [payment, setPayment] = useState<PaymentMethod>("PIX");
  const [troco, setTroco] = useState("");
  const [cepLoading, setCepLoading] = useState(false);

  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + cart.deliveryFee;

  const fetchCep = async () => {
    const cep = form.cep.replace(/\D/g, "");
    if (cep.length !== 8) {
      toast.error("CEP inválido", { description: "Digite 8 dígitos" });
      return;
    }
    setCepLoading(true);
    try {
      const res = await fetch(`/api/cep?cep=${cep}`);
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Erro ao consultar CEP");
      }
      const data = await res.json();
      setForm((f) => ({
        ...f,
        street: data.street || "",
        neighborhood: data.neighborhood || "",
        city: data.city || "",
      }));
      toast.success("Endereço preenchido");
    } catch (e: any) {
      toast.error("CEP não encontrado", { description: e.message });
    } finally {
      setCepLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!cart.storeId || cart.items.length === 0) {
      toast.error("Carrinho vazio");
      return;
    }
    if (!form.customerName || !form.customerPhone || !form.cep || !form.street || !form.number || !form.neighborhood || !form.city) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    let paymentDetail: string | null = null;
    if (payment === "ON_DELIVERY") {
      paymentDetail = troco ? `Dinheiro, troco para R$ ${troco}` : "Dinheiro";
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: cart.storeId,
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          cep: form.cep,
          street: form.street,
          number: form.number,
          complement: form.complement || null,
          neighborhood: form.neighborhood,
          city: form.city,
          paymentMethod: payment,
          paymentDetail,
          notes: form.notes || null,
          items: cart.items.map((i) => ({
            itemId: i.itemId,
            quantity: i.quantity,
            notes: i.notes || null,
          })),
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Erro ao criar pedido");
      }
      const { order } = await res.json();
      setSuccess({
        orderNumber: order.orderNumber,
        total: order.total,
        paymentMethod: payment,
        pixKey: cart.storeId ? (await fetch(`/api/stores/${cart.storeSlug}`).then(r => r.json())).store?.pixKey : null,
        paymentLink: cart.storeId ? (await fetch(`/api/stores/${cart.storeSlug}`).then(r => r.json())).store?.paymentLink : null,
      });
      cart.clear();
    } catch (e: any) {
      toast.error("Não foi possível finalizar", { description: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (success) {
    return (
      <div className="container-brito py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-primary to-primary/70 p-8 text-center text-primary-foreground">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="grid place-items-center h-16 w-16 rounded-full bg-white/20 mx-auto mb-3"
              >
                <CheckCircle2 className="h-9 w-9" />
              </motion.div>
              <h2 className="text-2xl font-bold">Pedido #{success.orderNumber} criado!</h2>
              <p className="opacity-90 text-sm mt-1">Total {formatBRL(success.total)}</p>
            </div>
            <CardContent className="p-6">
              {success.paymentMethod === "PIX" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Pague via Pix usando a chave da loja:</p>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
                    <code className="flex-1 text-sm font-mono break-all">{success.pixKey || "—"}</code>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(success.pixKey || "");
                        toast.success("Chave Pix copiada!");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Copiar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Após pagar, a loja confirmará o recebimento.</p>
                </div>
              )}
              {success.paymentMethod === "CARD" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Pague pelo link de pagamento da loja:</p>
                  <a
                    href={success.paymentLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir link de pagamento
                    </Button>
                  </a>
                  <p className="text-xs text-muted-foreground">Você será redirecionado para o checkout seguro.</p>
                </div>
              )}
              {success.paymentMethod === "ON_DELIVERY" && (
                <div className="p-3 rounded-lg bg-secondary text-sm">
                  Pague em dinheiro ou cartão na entrega.
                </div>
              )}
              <div className="flex gap-2 mt-5">
                <Button variant="outline" className="flex-1" onClick={() => setView("orders")}>
                  Ver meus pedidos
                </Button>
                <Button className="flex-1" onClick={() => setView("home")}>
                  Voltar ao início
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!cart.storeId || cart.items.length === 0) {
    return (
      <div className="container-brito py-16 text-center">
        <p className="text-muted-foreground">Carrinho vazio.</p>
        <Button variant="link" onClick={() => setView("home")}>Ver restaurantes</Button>
      </div>
    );
  }

  return (
    <div className="container-brito py-6">
      <button
        onClick={() => setView("cart")}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-3"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Voltar ao carrinho
      </button>

      <h1 className="text-2xl font-bold mb-1">Finalizar pedido</h1>
      <p className="text-sm text-muted-foreground mb-5">{cart.storeName}</p>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          {/* Dados */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-bold mb-3">Seus dados</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Nome *</Label>
                  <Input
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    placeholder="Seu nome"
                    className="h-10"
                  />
                </div>
                <div>
                  <Label className="text-xs">Telefone *</Label>
                  <Input
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="h-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Endereço de entrega
              </h3>
              <div className="grid gap-3">
                <div>
                  <Label className="text-xs">CEP *</Label>
                  <div className="flex gap-2">
                    <Input
                      value={form.cep}
                      onChange={(e) => setForm({ ...form, cep: e.target.value })}
                      placeholder="00000-000"
                      className="h-10"
                      maxLength={9}
                    />
                    <Button variant="outline" onClick={fetchCep} disabled={cepLoading} className="h-10">
                      {cepLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Rua *</Label>
                    <Input
                      value={form.street}
                      onChange={(e) => setForm({ ...form, street: e.target.value })}
                      placeholder="Rua / Avenida"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Número *</Label>
                    <Input
                      value={form.number}
                      onChange={(e) => setForm({ ...form, number: e.target.value })}
                      placeholder="123"
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label className="text-xs">Complemento</Label>
                    <Input
                      value={form.complement}
                      onChange={(e) => setForm({ ...form, complement: e.target.value })}
                      placeholder="Apto 42"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Bairro *</Label>
                    <Input
                      value={form.neighborhood}
                      onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                      placeholder="Bairro"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Cidade *</Label>
                    <Input
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Cidade"
                      className="h-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mapa do endereço de entrega */}
          <DeliveryMap form={form} />

          {/* Pagamento */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-bold mb-3">Forma de pagamento</h3>
              <div className="grid gap-2">
                <PaymentOption
                  active={payment === "PIX"}
                  onClick={() => setPayment("PIX")}
                  icon={Wallet}
                  title="Pix"
                  desc="Copie a chave e pague no app do seu banco"
                />
                <PaymentOption
                  active={payment === "CARD"}
                  onClick={() => setPayment("CARD")}
                  icon={CreditCard}
                  title="Cartão"
                  desc="Você será redirecionado para o link de pagamento"
                />
                <PaymentOption
                  active={payment === "ON_DELIVERY"}
                  onClick={() => setPayment("ON_DELIVERY")}
                  icon={Truck}
                  title="Na entrega"
                  desc="Dinheiro ou cartão na porta"
                />
              </div>

              {payment === "ON_DELIVERY" && (
                <div className="mt-3">
                  <Label className="text-xs">Troco para quanto? (opcional)</Label>
                  <Input
                    value={troco}
                    onChange={(e) => setTroco(e.target.value)}
                    placeholder="R$ 50,00"
                    className="h-10"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notas */}
          <Card>
            <CardContent className="p-5">
              <Label className="text-xs">Observações para a loja (opcional)</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Ex. deixar na portaria, sem tocar campainha…"
                rows={2}
                className="mt-1 resize-none text-sm"
              />
            </CardContent>
          </Card>
        </div>

        {/* Resumo */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="p-5">
              <h3 className="font-bold mb-3">Resumo do pedido</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto scroll-thin mb-3">
                {cart.items.map((i) => (
                  <div key={i.itemId + (i.notes || "")} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{i.quantity}× {i.name}</span>
                    <span>{formatBRL(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm pt-3 border-t">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatBRL(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxa de entrega</span>
                  <span>{cart.deliveryFee === 0 ? "Grátis" : formatBRL(cart.deliveryFee)}</span>
                </div>
                <div className="pt-2 border-t flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">{formatBRL(total)}</span>
                </div>
              </div>
              <Button
                className="w-full mt-4 h-11"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Confirmando…</>
                ) : (
                  <>Confirmar pedido · {formatBRL(total)}</>
                )}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                Ao confirmar você concorda com os termos do serviço.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({ active, onClick, icon: Icon, title, desc }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
        active ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border hover:bg-muted"
      }`}
    >
      <div className={`grid place-items-center h-10 w-10 rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <div className={`h-4 w-4 rounded-full border-2 ${active ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
        {active && <div className="h-full w-full rounded-full bg-primary-foreground scale-50" />}
      </div>
    </button>
  );
}

function DeliveryMap({ form }: { form: { street: string; number: string; neighborhood: string; city: string } }) {
  const fullAddress = `${form.street}, ${form.number}, ${form.neighborhood}, ${form.city}, Brasil`;
  const { coords, loading, error } = useGeocode(
    form.street && form.number && form.city ? fullAddress : null
  );

  if (!form.street || !form.city) return null;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Localização da entrega
          </h3>
          <div className="h-[180px] rounded-xl bg-secondary animate-pulse grid place-items-center">
            <span className="text-xs text-muted-foreground">Carregando mapa…</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !coords) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Localização da entrega
        </h3>
        <MiniMap
          lat={coords.lat}
          lng={coords.lng}
          zoom={16}
          label={`${form.street}, ${form.number}`}
          height="180px"
        />
        {coords.displayName && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{coords.displayName}</p>
        )}
      </CardContent>
    </Card>
  );
}
