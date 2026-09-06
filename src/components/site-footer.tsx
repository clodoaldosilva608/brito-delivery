"use client";

import { useNav } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { QrCode, LayoutDashboard, Mail, Instagram, Linkedin, Facebook, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  const { setView } = useNav();

  return (
    <footer className="mt-auto bg-accent text-accent-foreground">
      <div className="container-app py-14">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Marca */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground font-black text-lg">
                M
              </span>
              <span className="text-xl font-bold">Mesa</span>
            </div>
            <p className="mt-3 text-sm text-accent-foreground/70 leading-relaxed">
              O futuro da gastronomia. Digitalize seu restaurante com cardápios inteligentes,
              pedidos via QR e analytics avançado.
            </p>
            <div className="mt-4 flex gap-2">
              <a href="#" aria-label="Instagram" className="grid place-items-center h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="grid place-items-center h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Facebook" className="grid place-items-center h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Produto */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-foreground/60 mb-4">Produto</h3>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => setView("menu")} className="text-accent-foreground/80 hover:text-primary transition-colors">Cardápio digital</button></li>
              <li><button onClick={() => setView("menu")} className="text-accent-foreground/80 hover:text-primary transition-colors">Pedidos via QR</button></li>
              <li><button onClick={() => setView("reservations")} className="text-accent-foreground/80 hover:text-primary transition-colors">Reservas</button></li>
              <li><button onClick={() => setView("admin")} className="text-accent-foreground/80 hover:text-primary transition-colors">Painel</button></li>
              <li><button onClick={() => setView("contact")} className="text-accent-foreground/80 hover:text-primary transition-colors">Delivery</button></li>
            </ul>
          </div>

          {/* Soluções */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-foreground/60 mb-4">Soluções</h3>
            <ul className="space-y-2.5 text-sm">
              <li><button className="text-accent-foreground/80 hover:text-primary transition-colors text-left">Restaurantes</button></li>
              <li><button className="text-accent-foreground/80 hover:text-primary transition-colors text-left">Cafeterias e brunch</button></li>
              <li><button className="text-accent-foreground/80 hover:text-primary transition-colors text-left">Bares</button></li>
              <li><button className="text-accent-foreground/80 hover:text-primary transition-colors text-left">Hotéis</button></li>
              <li><button className="text-accent-foreground/80 hover:text-primary transition-colors text-left">Dark kitchen</button></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-foreground/60 mb-4">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-accent-foreground/80">
                <Mail className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>contato@exemplo.com</span>
              </li>
              <li className="flex items-start gap-2 text-accent-foreground/80">
                <Phone className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>+55 11 99999-0000</span>
              </li>
              <li className="flex items-start gap-2 text-accent-foreground/80">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>Sua cidade · Sua região</span>
              </li>
            </ul>
            <Button
              size="sm"
              className="mt-4"
              onClick={() => { setView("contact"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              Agende uma demo
            </Button>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-accent-foreground/50">
            © 2024 Mesa. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-xs text-accent-foreground/50">
            <a href="#" className="hover:text-primary transition-colors">Termos</a>
            <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
            <a href="#" className="hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
