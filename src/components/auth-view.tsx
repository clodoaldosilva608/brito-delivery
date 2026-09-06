"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNav, useSession } from "@/lib/store";
import { toast } from "sonner";
import { Loader2, UtensilsCrossed, Store, ChevronLeft } from "lucide-react";

export function AuthView() {
  const { setView } = useNav();
  const { refresh } = useSession();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "signup") {
      if (form.name.trim().length < 2) e.name = "Nome muito curto";
      if (form.phone && form.phone.replace(/\D/g, "").length < 10) e.phone = "Telefone inválido";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "E-mail inválido";
    if (form.password.length < 6) e.password = "Mínimo 6 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: any = { email: form.email, password: form.password };
      if (mode === "signup") {
        payload.name = form.name;
        payload.phone = form.phone;
      }
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro");
      }
      await refresh();
      toast.success(mode === "login" ? "Bem-vindo de volta!" : "Conta criada!");
      // Redirect: owners e admins vão para o dashboard, clientes para home
      const roles = data.profile?.roles || [];
      if (roles.includes("OWNER") || roles.includes("ADMIN")) {
        setView("dashboard");
      } else {
        setView("home");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-brito py-8">
      <button
        onClick={() => setView("home")}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-3"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Voltar ao início
      </button>

      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-secondary rounded-xl mb-5">
            <button
              onClick={() => setMode("login")}
              className={`py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Cadastrar
            </button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-5">
                <div className="grid place-items-center h-14 w-14 rounded-2xl bg-primary text-primary-foreground font-black text-2xl mx-auto mb-3">
                  B
                </div>
                <h1 className="text-xl font-bold">
                  {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {mode === "login" ? "Entre para acompanhar seus pedidos" : "Cliente ou dono de loja — a mesma conta"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "signup" && (
                  <div>
                    <Label className="text-xs">Nome completo</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Seu nome"
                      className="h-10"
                    />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>
                )}
                <div>
                  <Label className="text-xs">E-mail</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="seu@email.com"
                    className="h-10"
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>
                {mode === "signup" && (
                  <div>
                    <Label className="text-xs">Telefone (opcional)</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="h-10"
                    />
                    {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                  </div>
                )}
                <div>
                  <Label className="text-xs">Senha</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••"
                    className="h-10"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                  {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                </div>

                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Aguarde…</>
                  ) : (
                    mode === "login" ? "Entrar" : "Criar conta"
                  )}
                </Button>
              </form>

              <div className="mt-4 pt-4 border-t text-center">
                <p className="text-xs text-muted-foreground mb-3">
                  {mode === "login" ? "Ainda não tem conta?" : "Já tem conta?"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErrors({}); }}
                >
                  {mode === "login" ? "Criar nova conta" : "Entrar com conta existente"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Demo credentials hint */}
          <div className="mt-4 p-3 rounded-lg bg-secondary/50 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Contas demo:</p>
            <p>Cliente: cliente@brito.demo / senha123</p>
            <p>Dono: marco@brito.demo / senha123</p>
          </div>

          {/* CTA owner */}
          {mode === "signup" && (
            <button
              onClick={() => setView("create-store")}
              className="mt-4 w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition-colors"
            >
              <Store className="h-4 w-4" />
              <span className="text-sm font-medium">Quero abrir minha loja</span>
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
