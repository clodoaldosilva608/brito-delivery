"use client";

import { useEffect } from "react";
import { useNav, useCart, useSession } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  ShoppingCart,
  Store,
  Home,
  Package,
  LayoutDashboard,
  LogIn,
  LogOut,
  UtensilsCrossed,
} from "lucide-react";

export function SiteHeader() {
  const { view, setView } = useNav();
  const totalItems = useCart((s) => s.totalItems());
  const { profile, refresh, loading } = useSession();

  useEffect(() => {
    refresh();
  }, [refresh, view]);

  const handleNav = (v: typeof view) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await refresh();
    handleNav("home");
  };

  const isOwner = profile?.roles?.includes("OWNER");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-lg">
      <div className="container-brito flex h-16 items-center justify-between gap-4">
        <button
          onClick={() => handleNav("home")}
          className="flex items-center gap-2 group"
          aria-label="Brito início"
        >
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground font-black text-lg shadow-sm transition-transform group-hover:scale-105">
            B
          </span>
          <span className="text-xl font-bold tracking-tight">Brito</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => handleNav("home")}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              view === "home" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Início
          </button>
          {profile && (
            <button
              onClick={() => handleNav("orders")}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                view === "orders" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Meus pedidos
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => handleNav("dashboard")}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                ["dashboard", "owner-orders", "owner-menu", "owner-settings", "create-store"].includes(view)
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Minha loja
            </button>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {/* Cart */}
          <button
            onClick={() => handleNav("cart")}
            className="relative grid place-items-center h-9 w-9 rounded-lg hover:bg-muted transition-colors"
            aria-label="Carrinho"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-4 px-1 grid place-items-center">
                {totalItems}
              </span>
            )}
          </button>

          {/* Auth */}
          {!loading && profile ? (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
                <LogOut className="h-4 w-4 mr-1.5" />
                Sair
              </Button>
            </div>
          ) : (
            !loading && (
              <Button size="sm" onClick={() => handleNav("auth")} className="hidden md:inline-flex">
                <LogIn className="h-4 w-4 mr-1.5" />
                Entrar
              </Button>
            )
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary text-primary-foreground font-black">
                    B
                  </span>
                  Brito
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                <MobileItem icon={Home} label="Início" onClick={() => handleNav("home")} active={view === "home"} />
                {profile && (
                  <MobileItem icon={Package} label="Meus pedidos" onClick={() => handleNav("orders")} active={view === "orders"} />
                )}
                {isOwner && (
                  <>
                    <MobileItem icon={LayoutDashboard} label="Painel da loja" onClick={() => handleNav("dashboard")} active={view === "dashboard"} />
                    <MobileItem icon={Store} label="Criar loja" onClick={() => handleNav("create-store")} active={view === "create-store"} />
                  </>
                )}
                <MobileItem icon={ShoppingCart} label="Carrinho" onClick={() => handleNav("cart")} active={view === "cart"} />
                {profile ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-left text-muted-foreground hover:text-foreground hover:bg-muted mt-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair ({profile.name.split(" ")[0]})
                  </button>
                ) : (
                  <Button className="mt-2" onClick={() => handleNav("auth")}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Entrar / Cadastrar
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function MobileItem({ icon: Icon, label, onClick, active }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-left transition-colors ${
        active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
