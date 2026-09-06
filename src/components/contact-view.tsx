"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNav } from "@/lib/store";
import { toast } from "sonner";
import {
  ChevronLeft, Loader2, Mail, Phone, MapPin, Send, CheckCircle2,
  MessageCircle, Calendar,
} from "lucide-react";

export function ContactView() {
  const { setView } = useNav();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    restaurantName: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Completa los campos obligatorios");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al enviar");
      setSuccess(true);
      toast.success("¡Mensaje enviado!");
    } catch (e: any) {
      toast.error("No se pudo enviar", { description: e.message });
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center"
        >
          <div className="grid place-items-center h-16 w-16 rounded-full bg-chart-2/15 text-chart-2 mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">¡Hemos recibido tu mensaje!</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Nuestro equipo comercial te contactará en menos de 24 horas. Mientras tanto,
            explora la demo en vivo.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => setView("menu")}>Ver demo de menú</Button>
            <Button onClick={() => setSuccess(false)}>Enviar otro mensaje</Button>
          </div>
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
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Hablemos de tu
            <span className="block text-primary mt-1">restaurante</span>
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Cuéntanos sobre tu negocio y un especialista de Cluvi te contactará para agendar
            una demo personalizada. Sin compromiso, sin costos ocultos.
          </p>

          <div className="mt-6 space-y-3">
            <a
              href="https://api.whatsapp.com/send/?phone=573044426160"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-chart-2/5 border border-chart-2/20 hover:bg-chart-2/10 transition-colors group"
            >
              <div className="grid place-items-center h-11 w-11 rounded-lg bg-chart-2 text-white shrink-0">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">WhatsApp Comercial</div>
                <div className="text-xs text-muted-foreground">Respuesta inmediata · Lun-Sáb 8am-8pm</div>
              </div>
              <Send className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </a>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">Email</div>
                  <div className="text-sm font-medium">contact@cluvi.com</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">Teléfono</div>
                  <div className="text-sm font-medium">+57 304 442 6160</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 sm:col-span-2">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">Oficinas</div>
                  <div className="text-sm font-medium">Medellín · Bogotá · Ciudad de México</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
              <Calendar className="h-5 w-5 text-primary shrink-0" />
              <div>
                <div className="text-sm font-semibold">Agenda una consultoría gratuita</div>
                <div className="text-xs text-muted-foreground">
                  30 minutos con un experto en digitalización gastronómica
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Solicita tu demo</CardTitle>
              <CardDescription>Te contactaremos en menos de 24 horas</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="c-name" className="text-xs">Nombre *</Label>
                    <Input
                      id="c-name"
                      className="h-10"
                      placeholder="Tu nombre"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="c-phone" className="text-xs">Teléfono</Label>
                    <Input
                      id="c-phone"
                      className="h-10"
                      placeholder="+57 300 000 0000"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="c-email" className="text-xs">Email *</Label>
                  <Input
                    id="c-email"
                    type="email"
                    className="h-10"
                    placeholder="tu@correo.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="c-rest" className="text-xs">Nombre del restaurante</Label>
                  <Input
                    id="c-rest"
                    className="h-10"
                    placeholder="Ej. El Balcón del Chef"
                    value={form.restaurantName}
                    onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="c-msg" className="text-xs">Cuéntanos sobre tu negocio *</Label>
                  <Textarea
                    id="c-msg"
                    rows={4}
                    placeholder="Ej. Tenemos 3 sedes, hacemos 200 pedidos diarios y queremos reducir tiempos de espera…"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    className="resize-none"
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={submitting}>
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando…</>
                  ) : (
                    <><Send className="h-4 w-4 mr-2" /> Enviar solicitud</>
                  )}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground">
                  Al enviar aceptas nuestra política de privacidad.
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
