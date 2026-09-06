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
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro ao enviar");
      setSuccess(true);
      toast.success("Mensagem enviada!");
    } catch (e: any) {
      toast.error("Não foi possível enviar", { description: e.message });
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center"
        >
          <div className="grid place-items-center h-16 w-16 rounded-full bg-chart-2/15 text-chart-2 mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Recebemos sua mensagem!</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Nossa equipe comercial vai entrar em contato em menos de 24 horas. Enquanto isso,
            explore a demo ao vivo.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => setView("menu")}>Ver demo do cardápio</Button>
            <Button onClick={() => setSuccess(false)}>Enviar outra mensagem</Button>
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
        Voltar ao início
      </button>

      <div className="grid gap-8 lg:grid-cols-2 items-start">
        {/* Esquerda: info */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Vamos falar do seu
            <span className="block text-primary mt-1">restaurante</span>
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Conte sobre seu negócio e um especialista da Cluvi vai entrar em contato para agendar
            uma demo personalizada. Sem compromisso, sem custos ocultos.
          </p>

          <div className="mt-6 space-y-3">
            <a
              href="https://wa.me/554130442616"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-chart-2/5 border border-chart-2/20 hover:bg-chart-2/10 transition-colors group"
            >
              <div className="grid place-items-center h-11 w-11 rounded-lg bg-chart-2 text-white shrink-0">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">WhatsApp Comercial</div>
                <div className="text-xs text-muted-foreground">Resposta imediata · Seg-Sáb 8h-20h</div>
              </div>
              <Send className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </a>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">E-mail</div>
                  <div className="text-sm font-medium">contato@cluvi.com</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">Telefone</div>
                  <div className="text-sm font-medium">+55 41 3044 2616</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 sm:col-span-2">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">Escritórios</div>
                  <div className="text-sm font-medium">Curitiba · São Paulo · Florianópolis</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
              <Calendar className="h-5 w-5 text-primary shrink-0" />
              <div>
                <div className="text-sm font-semibold">Agende uma consultoria gratuita</div>
                <div className="text-xs text-muted-foreground">
                  30 minutos com um especialista em digitalização gastronômica
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Direita: formulário */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Solicite sua demo</CardTitle>
              <CardDescription>Entraremos em contato em menos de 24 horas</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="c-name" className="text-xs">Nome *</Label>
                    <Input
                      id="c-name"
                      className="h-10"
                      placeholder="Seu nome"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="c-phone" className="text-xs">Telefone</Label>
                    <Input
                      id="c-phone"
                      className="h-10"
                      placeholder="+55 41 99999-9999"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="c-email" className="text-xs">E-mail *</Label>
                  <Input
                    id="c-email"
                    type="email"
                    className="h-10"
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="c-rest" className="text-xs">Nome do restaurante</Label>
                  <Input
                    id="c-rest"
                    className="h-10"
                    placeholder="Ex. A Varanda do Chef"
                    value={form.restaurantName}
                    onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="c-msg" className="text-xs">Conte sobre seu negócio *</Label>
                  <Textarea
                    id="c-msg"
                    rows={4}
                    placeholder="Ex. Temos 3 unidades, fazemos 200 pedidos por dia e queremos reduzir tempos de espera…"
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
                    <><Send className="h-4 w-4 mr-2" /> Enviar solicitação</>
                  )}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground">
                  Ao enviar você aceita nossa política de privacidade.
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
