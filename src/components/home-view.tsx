"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNav, formatBRL } from "@/lib/store";
import { Search, Star, Clock, Truck, Store as StoreIcon, UtensilsCrossed } from "lucide-react";

interface StoreListItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  logoUrl: string | null;
  coverUrl: string | null;
  deliveryFee: number;
  minOrder: number;
  avgDeliveryMin: number;
  rating: number;
  isOpen: boolean;
}

const CATEGORIES = [
  { id: "all", label: "Todas", icon: "🍴" },
  { id: "pizza", label: "Pizza", icon: "🍕" },
  { id: "burger", label: "Hambúrguer", icon: "🍔" },
  { id: "japones", label: "Japonês", icon: "🍣" },
  { id: "doces", label: "Doces", icon: "🍰" },
  { id: "saudavel", label: "Saudável", icon: "🥗" },
  { id: "mexicano", label: "Mexicano", icon: "🌮" },
  { id: "brasileira", label: "Brasileira", icon: "🍚" },
];

const CATEGORY_LABELS: Record<string, string> = {
  pizza: "Pizza",
  burger: "Hambúrguer",
  japones: "Japonês",
  doces: "Doces",
  saudavel: "Saudável",
  mexicano: "Mexicano",
  brasileira: "Brasileira",
};

export function HomeView() {
  const { goToStore } = useNav();
  const [stores, setStores] = useState<StoreListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (category !== "all") params.set("category", category);
    let active = true;
     
    setLoading(true);
    fetch(`/api/stores?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => { if (active) setStores(d.stores || []); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search, category]);

  const openStore = (slug: string) => {
    goToStore(slug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative overflow-hidden hero-glow">
        <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none" />
        <div className="container-brito relative py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/30 hover:bg-primary/20">
              <UtensilsCrossed className="h-3.5 w-3.5 mr-1.5" />
              Marketplace de delivery
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
              Comida boa,
              <br />
              <span className="text-gold-gradient">no capricho.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Peça das melhores cozinhas da cidade. Pix, cartão ou na entrega — você escolhe.
              E se você é dono de restaurante, abra sua loja aqui em minutos.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-8 max-w-xl"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar restaurante ou prato…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-14 text-base rounded-2xl bg-card border-border shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="border-y border-border bg-card/50">
        <div className="container-brito py-5">
          <div className="flex gap-2 overflow-x-auto scroll-hidden">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === c.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                }`}
              >
                <span className="text-base">{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* STORES LIST */}
      <section className="py-8 flex-1">
        <div className="container-brito">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl md:text-2xl font-bold">
              {loading ? "Carregando lojas…" : `${stores.length} ${stores.length === 1 ? "loja encontrada" : "lojas encontradas"}`}
            </h2>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-2xl" />
              ))}
            </div>
          ) : stores.length === 0 ? (
            <div className="py-16 text-center">
              <StoreIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Nenhuma loja encontrada para &ldquo;{search || CATEGORY_LABELS[category]}&rdquo;
              </p>
              <button
                onClick={() => { setSearch(""); setCategory("all"); }}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stores.map((store, idx) => (
                <motion.button
                  key={store.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => openStore(store.slug)}
                  className="group text-left"
                >
                  <Card className="overflow-hidden card-glow h-full hover:ring-2 hover:ring-primary/40 transition-all">
                    {/* Cover */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                      {store.coverUrl ? (
                         
                        <img
                          src={store.coverUrl}
                          alt={store.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-5xl opacity-40">🍽️</div>
                      )}
                      {!store.isOpen && (
                        <div className="absolute inset-0 bg-background/70 grid place-items-center">
                          <Badge variant="secondary" className="text-xs">Fechado agora</Badge>
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-background/90 text-foreground border-0 text-xs">
                          {CATEGORY_LABELS[store.category] || store.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary shrink-0 -mt-8 border-2 border-card">
                          {store.logoUrl ? (
                             
                            <img src={store.logoUrl} alt={`${store.name} logo`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full grid place-items-center font-bold text-lg">{store.name.charAt(0)}</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base leading-tight truncate group-hover:text-primary transition-colors">
                            {store.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                            {store.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                          <span className="font-semibold text-foreground">{store.rating.toFixed(1)}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {store.avgDeliveryMin} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Truck className="h-3.5 w-3.5" />
                          {store.deliveryFee === 0 ? "Grátis" : formatBRL(store.deliveryFee)}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
