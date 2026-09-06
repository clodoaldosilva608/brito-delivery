"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNav, useSession, formatBRL } from "@/lib/store";
import { toast } from "sonner";
import { Loader2, Shield, ChevronLeft, Lock, Mail } from "lucide-react";

export function SuperAdminLoginView() {
  const { setView } = useNav();
  const { profile, refresh, loading: sessionLoading } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Se já está logado como admin, redireciona para o painel
  useEffect(() => {
    if (!sessionLoading && profile && profile.roles.includes("ADMIN")) {
      setView("super-admin");
    }
  }, [profile, sessionLoading, setView]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha email e senha");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Credenciais inválidas");
      }
      const roles = data.profile?.roles || [];
      if (!roles.includes("ADMIN")) {
        toast.error("Acesso negado", {
          description: "Esta conta não tem privilégios de administrador.",
        });
        await fetch("/api/auth/logout", { method: "POST" });
        await refresh();
        return;
      }
      await refresh();
      toast.success("Bem-vindo, Admin Master!");
      setView("super-admin");
    } catch (e: any) {
      toast.error("Falha no login", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4 hero-glow">
      <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <button
          onClick={() => setView("home")}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Voltar ao site
        </button>

        <Card className="card-glow">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="grid place-items-center h-16 w-16 rounded-2xl bg-primary text-primary-foreground mx-auto mb-4 shadow-lg"
              >
                <Shield className="h-8 w-8" />
              </motion.div>
              <h1 className="text-2xl font-bold">Painel Super Admin</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Acesso restrito ao administrador master
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label className="text-xs">Email do administrador</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@exemplo.com"
                    className="pl-10 h-11"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Senha</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 h-11"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Autenticando…</>
                ) : (
                  <><Shield className="h-4 w-4 mr-2" /> Acessar painel</>
                )}
              </Button>
            </form>

            <div className="mt-6 p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-xs text-destructive/80">
              <strong>⚠️ Zona restrita:</strong> Esta área é exclusiva para o administrador
              master do sistema. Tentativas de acesso não autorizadas são registradas.
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
