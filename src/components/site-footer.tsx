"use client";

import { useNav } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Store, Truck, Shield } from "lucide-react";

export function SiteFooter() {
  const { setView } = useNav();

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="container-brito py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground font-black text-lg">
                B
              </span>
              <span className="text-xl font-bold">Brito</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              O marketplace onde restaurantes criam sua loja e clientes pedem comida boa em segundos.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Para clientes</h3>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => setView("home")} className="text-foreground/80 hover:text-primary transition-colors text-left">Buscar restaurantes</button></li>
              <li><button onClick={() => setView("orders")} className="text-foreground/80 hover:text-primary transition-colors text-left">Meus pedidos</button></li>
              <li><button onClick={() => setView("cart")} className="text-foreground/80 hover:text-primary transition-colors text-left">Carrinho</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Para restaurantes</h3>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => setView("create-store")} className="text-foreground/80 hover:text-primary transition-colors text-left">Cadastrar minha loja</button></li>
              <li><button onClick={() => setView("dashboard")} className="text-foreground/80 hover:text-primary transition-colors text-left">Painel do dono</button></li>
              <li><button onClick={() => setView("owner-menu")} className="text-foreground/80 hover:text-primary transition-colors text-left">Gerenciar cardápio</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Diferenciais</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-foreground/80">
                <Truck className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>Pagamento via Pix, cartão ou na entrega</span>
              </li>
              <li className="flex items-start gap-2 text-foreground/80">
                <Store className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>Qualquer restaurante pode abrir loja</span>
              </li>
              <li className="flex items-start gap-2 text-foreground/80">
                <Shield className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>Sem cobrança automática, você controla</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © 2024 Brito. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground items-center">
            <a href="#" className="hover:text-primary transition-colors">Termos</a>
            <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
            <button
              onClick={() => { setView("super-admin-login"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border hover:border-primary/40 hover:text-primary transition-colors"
            >
              <Shield className="h-3 w-3" />
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
