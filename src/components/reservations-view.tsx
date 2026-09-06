"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNav, formatBRL } from "@/lib/store";
import { toast } from "sonner";
import {
  Calendar, Clock, Users, Phone, Mail, User,
  ChevronLeft, Loader2, CalendarCheck, Sparkles, PartyPopper,
} from "lucide-react";

const TIME_SLOTS = [
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
];

const OCCASIONS = [
  { id: "none", label: "Só comer", icon: "🍽️" },
  { id: "birthday", label: "Aniversário", icon: "🎂" },
  { id: "anniversary", label: "Aniversário de namoro", icon: "💞" },
  { id: "business", label: "Jantar de negócios", icon: "💼" },
  { id: "friends", label: "Com amigos", icon: "👥" },
  { id: "romantic", label: "Encontro romântico", icon: "🌹" },
];

export function ReservationsView() {
  const { setView } = useNav();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    partySize: 2,
    date: new Date().toISOString().slice(0, 10),
    time: "19:30",
    occasion: "none",
    notes: "",
  });

  const today = new Date().toISOString().slice(0, 10);
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((d) => setRestaurantId(d.restaurant.id))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) {
      toast.error("Carregando restaurante…", { description: "Tente novamente em 2 segundos" });
      return;
    }
    if (!form.customerName || !form.phone || !form.date || !form.time) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, restaurantId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao criar reserva");
      }
      setSuccess(true);
      toast.success("Reserva confirmada!");
    } catch (e: any) {
      toast.error("Não foi possível criar a reserva", { description: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container-cluvi py-12">
        <button
          onClick={() => setView("home")}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Voltar ao início
        </button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-chart-2 to-chart-2/70 p-8 text-center text-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="grid place-items-center h-16 w-16 rounded-full bg-white/20 mx-auto mb-3"
              >
                <PartyPopper className="h-8 w-8" />
              </motion.div>
              <h2 className="text-2xl font-bold">Reserva confirmada!</h2>
              <p className="opacity-90 text-sm mt-1">Te esperamos na A Varanda do Chef</p>
            </div>
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between text-sm py-2 border-b">
                <span className="text-muted-foreground">Nome</span>
                <span className="font-medium">{form.customerName}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b">
                <span className="text-muted-foreground">Data</span>
                <span className="font-medium">
                  {new Date(form.date + "T00:00:00").toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b">
                <span className="text-muted-foreground">Hora</span>
                <span className="font-medium">{form.time}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b">
                <span className="text-muted-foreground">Pessoas</span>
                <span className="font-medium">{form.partySize}</span>
              </div>
              {form.occasion !== "none" && (
                <div className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Ocasião</span>
                  <span className="font-medium">
                    {OCCASIONS.find((o) => o.id === form.occasion)?.label}
                  </span>
                </div>
              )}
              <div className="bg-secondary rounded-xl p-3 text-xs text-muted-foreground text-center">
                <Mail className="h-3.5 w-3.5 inline mr-1" />
                Enviar confirmação para {form.email || "seu e-mail"}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setView("menu")}>
                  Ver o cardápio
                </Button>
                <Button className="flex-1" onClick={() => { setSuccess(false); setForm({ ...form, customerName: "", phone: "" }); }}>
                  Nova reserva
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container-cluvi py-6">
      <button
        onClick={() => setView("home")}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-3"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Voltar ao início
      </button>

      <div className="grid gap-8 lg:grid-cols-2 items-start">
        {/* Esquerda: info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="mb-3">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Reservas online
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Reserve sua mesa na
            <span className="block text-primary mt-1">A Varanda do Chef</span>
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Cozinha de autor com ingredientes locais. Confirmação imediata por SMS e e-mail.
            Para grupos maiores que 8 pessoas, fale conosco diretamente.
          </p>

          <div className="mt-6 grid gap-3">
            {[
              { icon: Clock, title: "Horário", desc: "Seg a Sex: 12:00 — 23:00 · Sáb e Dom: 11:00 — 00:00" },
              { icon: Users, title: "Capacidade", desc: "Salão interno (40), terraço (24) e balcão (6)" },
              { icon: CalendarCheck, title: "Política", desc: "Cancele grátis até 2 horas antes. Chegue 10 min antes." },
              { icon: Sparkles, title: "Ocasiões especiais", desc: "Decoração e bolo disponíveis com 24h de antecedência" },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 p-3 rounded-xl bg-secondary/50">
                <div className="grid place-items-center h-10 w-10 rounded-lg bg-primary/10 text-primary shrink-0">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{item.title}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Pratos em destaque */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3">Pratos em destaque</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "Feijoada Completa", price: 48, emoji: "🍲" },
                { name: "Salmão na Parrilla", price: 62, emoji: "🐟" },
                { name: "Ceviche de Manga", price: 28, emoji: "🥭" },
              ].map((d) => (
                <div key={d.name} className="rounded-xl border p-3 text-center bg-card">
                  <div className="text-2xl mb-1">{d.emoji}</div>
                  <div className="text-[11px] font-medium leading-tight">{d.name}</div>
                  <div className="text-[10px] text-primary font-bold mt-1">{formatBRL(d.price)}</div>
                </div>
              ))}
            </div>
            <Button variant="link" size="sm" className="mt-2 px-0" onClick={() => setView("menu")}>
              Ver cardápio completo →
            </Button>
          </div>
        </motion.div>

        {/* Direita: formulário */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Complete sua reserva</CardTitle>
              <CardDescription>Levará menos de 1 minuto</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="name" className="text-xs">Nome *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="name"
                        className="pl-9 h-10"
                        placeholder="Seu nome"
                        value={form.customerName}
                        onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs">Telefone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="phone"
                        className="pl-9 h-10"
                        placeholder="+55 41 99999-9999"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-xs">E-mail (opcional)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-9 h-10"
                      placeholder="seu@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="date" className="text-xs">Data *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        id="date"
                        type="date"
                        className="pl-9 h-10"
                        min={today}
                        max={maxDate}
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="time" className="text-xs">Hora *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                      <select
                        id="time"
                        className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm appearance-none"
                        value={form.time}
                        onChange={(e) => setForm({ ...form, time: e.target.value })}
                      >
                        {TIME_SLOTS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Pessoas</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setForm({ ...form, partySize: Math.max(1, form.partySize - 1) })}
                    >
                      −
                    </Button>
                    <div className="flex-1 text-center font-semibold">{form.partySize}</div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setForm({ ...form, partySize: Math.min(20, form.partySize + 1) })}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Ocasião</Label>
                  <div className="grid grid-cols-3 gap-1.5 mt-1">
                    {OCCASIONS.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setForm({ ...form, occasion: o.id })}
                        className={`text-xs py-2 px-1 rounded-lg border transition-colors flex flex-col items-center gap-0.5 ${
                          form.occasion === o.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <span className="text-base">{o.icon}</span>
                        <span className="leading-tight">{o.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-xs">Observações (alergias, preferências)</Label>
                  <Textarea
                    id="notes"
                    rows={2}
                    placeholder="Ex. Mesa perto da janela, alergia a castanhas…"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="text-sm resize-none"
                  />
                </div>

                <Button type="submit" className="w-full h-11" disabled={submitting}>
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Confirmando…</>
                  ) : (
                    <><CalendarCheck className="h-4 w-4 mr-2" /> Confirmar reserva</>
                  )}
                </Button>

                <p className="text-[10px] text-center text-muted-foreground">
                  Ao reservar você aceita a política de cancelamento. Receberá confirmação por SMS.
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
