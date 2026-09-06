"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNav, formatCOP } from "@/lib/store";
import { toast } from "sonner";
import {
  Calendar, Clock, Users, Phone, Mail, User, MessageSquare,
  ChevronLeft, Loader2, CheckCircle2, CalendarCheck, Sparkles, PartyPopper,
} from "lucide-react";

const TIME_SLOTS = [
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
];

const OCCASIONS = [
  { id: "none", label: "Solo comer", icon: "🍽️" },
  { id: "birthday", label: "Cumpleaños", icon: "🎂" },
  { id: "anniversary", label: "Aniversario", icon: "💞" },
  { id: "business", label: "Cena de negocios", icon: "💼" },
  { id: "friends", label: "Con amigos", icon: "👥" },
  { id: "romantic", label: "Cita romántica", icon: "🌹" },
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

  // Fetch restaurant id on mount
  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((d) => setRestaurantId(d.restaurant.id))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) {
      toast.error("Cargando restaurante…", { description: "Inténtalo de nuevo en 2 segundos" });
      return;
    }
    if (!form.customerName || !form.phone || !form.date || !form.time) {
      toast.error("Completa los campos obligatorios");
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
        throw new Error(err.error || "Error al crear reserva");
      }
      setSuccess(true);
      toast.success("¡Reserva confirmada!");
    } catch (e: any) {
      toast.error("No se pudo crear la reserva", { description: e.message });
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
          Volver al inicio
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
              <h2 className="text-2xl font-bold">¡Reserva confirmada!</h2>
              <p className="opacity-90 text-sm mt-1">Te esperamos en El Balcón del Chef</p>
            </div>
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between text-sm py-2 border-b">
                <span className="text-muted-foreground">Nombre</span>
                <span className="font-medium">{form.customerName}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b">
                <span className="text-muted-foreground">Fecha</span>
                <span className="font-medium">
                  {new Date(form.date + "T00:00:00").toLocaleDateString("es-CO", {
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
                <span className="text-muted-foreground">Personas</span>
                <span className="font-medium">{form.partySize}</span>
              </div>
              {form.occasion !== "none" && (
                <div className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Ocasión</span>
                  <span className="font-medium">
                    {OCCASIONS.find((o) => o.id === form.occasion)?.label}
                  </span>
                </div>
              )}
              <div className="bg-secondary rounded-xl p-3 text-xs text-muted-foreground text-center">
                <Mail className="h-3.5 w-3.5 inline mr-1" />
                Enviar confirmación a {form.email || "tu correo"}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setView("menu")}>
                  Ver el menú
                </Button>
                <Button className="flex-1" onClick={() => { setSuccess(false); setForm({ ...form, customerName: "", phone: "" }); }}>
                  Nueva reserva
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
        Volver al inicio
      </button>

      <div className="grid gap-8 lg:grid-cols-2 items-start">
        {/* Left: info */}
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
            Reserva tu mesa en
            <span className="block text-primary mt-1">El Balcón del Chef</span>
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Cocina de autor con ingredientes locales. Confirmación inmediata por SMS y correo.
            Para grupos mayores a 8 personas, contáctanos directamente.
          </p>

          <div className="mt-6 grid gap-3">
            {[
              { icon: Clock, title: "Horario", desc: "Lun a Vie: 12:00 — 23:00 · Sáb y Dom: 11:00 — 00:00" },
              { icon: Users, title: "Capacidad", desc: "Salón interior (40), terraza (24) y barra (6)" },
              { icon: CalendarCheck, title: "Política", desc: "Cancela gratis hasta 2 horas antes. Llega 10 min antes." },
              { icon: Sparkles, title: "Ocasiones especiales", desc: "Decoración y pastel disponible con 24h de anticipación" },
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

          {/* Featured dishes preview */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3">Platos destacados</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "Bandeja Paisa", price: 32000, emoji: "🍽️" },
                { name: "Salmón Parrilla", price: 42000, emoji: "🐟" },
                { name: "Ceviche Mango", price: 18500, emoji: "🥭" },
              ].map((d) => (
                <div key={d.name} className="rounded-xl border p-3 text-center bg-card">
                  <div className="text-2xl mb-1">{d.emoji}</div>
                  <div className="text-[11px] font-medium leading-tight">{d.name}</div>
                  <div className="text-[10px] text-primary font-bold mt-1">{formatCOP(d.price)}</div>
                </div>
              ))}
            </div>
            <Button variant="link" size="sm" className="mt-2 px-0" onClick={() => setView("menu")}>
              Ver menú completo →
            </Button>
          </div>
        </motion.div>

        {/* Right: form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Completa tu reserva</CardTitle>
              <CardDescription>Te tomará menos de 1 minuto</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="name" className="text-xs">Nombre *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="name"
                        className="pl-9 h-10"
                        placeholder="Tu nombre"
                        value={form.customerName}
                        onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs">Teléfono *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="phone"
                        className="pl-9 h-10"
                        placeholder="+57 300 000 0000"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-xs">Email (opcional)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-9 h-10"
                      placeholder="tu@correo.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="date" className="text-xs">Fecha *</Label>
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
                  <Label className="text-xs">Personas</Label>
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
                  <Label className="text-xs">Ocasión</Label>
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
                  <Label htmlFor="notes" className="text-xs">Notas (alergias, preferencias)</Label>
                  <Textarea
                    id="notes"
                    rows={2}
                    placeholder="Ej. Mesa cerca a ventana, alergia a frutos secos…"
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
                  Al reservar aceptas la política de cancelación. Recibirás confirmación por SMS.
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
