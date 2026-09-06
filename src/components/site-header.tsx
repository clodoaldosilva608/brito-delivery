"use client";

import { useState } from "react";
import { useNav } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, QrCode, UtensilsCrossed, LayoutDashboard, CalendarCheck, Phone } from "lucide-react";

export function SiteHeader() {
  const { view, setView } = useNav();
  const [open, setOpen] = useState(false);

  const navItems: { label: string; view: typeof view; icon: any }[] = [
    { label: "Início", view: "home", icon: UtensilsCrossed },
    { label: "Cardápio QR", view: "menu", icon: QrCode },
    { label: "Reservas", view: "reservations", icon: CalendarCheck },
    { label: "Painel", view: "admin", icon: LayoutDashboard },
    { label: "Contato", view: "contact", icon: Phone },
  ];

  const handleNav = (v: typeof view) => {
    setView(v);
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70">
      <div className="container-cluvi flex h-16 items-center justify-between gap-4">
        <button
          onClick={() => handleNav("home")}
          className="flex items-center gap-2 group"
          aria-label="Cluvi início"
        >
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground font-black text-lg shadow-sm transition-transform group-hover:scale-105">
            C
          </span>
          <span className="text-xl font-bold tracking-tight">
            Cluvi
          </span>
          <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1 px-2 py-0.5 rounded-full bg-secondary">
            Demo
          </span>
        </button>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => handleNav(item.view)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                view === item.view
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => handleNav("menu")}
          >
            Ver cardápio demo
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary text-primary-foreground font-black">
                    C
                  </span>
                  Cluvi Demo
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.view}
                    onClick={() => handleNav(item.view)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-left ${
                      view === item.view
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
              <Button
                className="mt-6 w-full"
                onClick={() => handleNav("menu")}
              >
                Abrir cardápio digital
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
