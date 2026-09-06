"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useNav, useCart, formatBRL } from "@/lib/store";
import { MiniMap, useGeocode } from "@/components/mini-map";
import { toast } from "sonner";
import {
  Star, Clock, Truck, MapPin, Phone, ChevronLeft, Plus, Minus, X,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
}
interface MenuSection {
  id: string;
  name: string;
  items: MenuItem[];
}
interface StoreData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  logoUrl: string | null;
  coverUrl: string | null;
  address: string | null;
  phone: string | null;
  openingHours: string | null;
  deliveryFee: number;
  minOrder: number;
  avgDeliveryMin: number;
  rating: number;
  isOpen: boolean;
  pixKey: string | null;
  paymentLink: string | null;
  menuSections: MenuSection[];
}

export function StoreView() {
  const { storeSlug, setView } = useNav();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    if (!storeSlug) {
      setView("home");
      return;
    }
    let active = true;
     
    setLoading(true);
    fetch(`/api/stores/${storeSlug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Loja não encontrada");
        return r.json();
      })
      .then((d) => { if (active) setStore(d.store); })
      .catch((e) => { if (active) toast.error(e.message); })
      .finally(() => setLoading(false));
  }, [storeSlug, setView]);

  if (loading) {
    return (
      <div className="container-brito py-8">
        <Skeleton className="h-64 rounded-2xl mb-6" />
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container-brito py-16 text-center">
        <p className="text-muted-foreground">Loja não encontrada.</p>
        <Button variant="link" onClick={() => setView("home")}>Voltar ao início</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Cover */}
      <div className="relative h-48 md:h-64 bg-secondary overflow-hidden">
        {store.coverUrl ? (
           
          <img src={store.coverUrl} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-6xl opacity-30">🍽️</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <button
          onClick={() => setView("home")}
          className="absolute top-4 left-4 inline-flex items-center gap-1 text-xs bg-background/80 backdrop-blur px-3 py-1.5 rounded-full hover:bg-background transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Voltar
        </button>
        {!store.isOpen && (
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur">Fechado agora</Badge>
          </div>
        )}
      </div>

      {/* Header info */}
      <div className="container-brito -mt-12 relative">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-secondary border-4 border-background shrink-0">
            {store.logoUrl ? (
               
              <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center text-2xl font-bold">{store.name.charAt(0)}</div>
            )}
          </div>
          <div className="flex-1 pt-10">
            <h1 className="text-2xl md:text-3xl font-bold">{store.name}</h1>
            {store.description && (
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-2xl">{store.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-4 text-sm flex-wrap">
          <span className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="font-semibold">{store.rating.toFixed(1)}</span>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" />
            {store.avgDeliveryMin} min
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Truck className="h-4 w-4" />
            {store.deliveryFee === 0 ? "Entrega grátis" : `Entrega ${formatBRL(store.deliveryFee)}`}
          </span>
          {store.minOrder > 0 && (
            <span className="text-muted-foreground">Mín. {formatBRL(store.minOrder)}</span>
          )}
          {store.openingHours && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {store.openingHours}
            </span>
          )}
        </div>

        {store.address && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {store.address}
          </div>
        )}

        {/* Mapa da localização da loja */}
        {store.address && (
          <StoreLocationMap address={store.address} storeName={store.name} />
        )}
      </div>

      {/* Menu */}
      <div className="container-brito py-8 flex-1">
        {store.menuSections.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            Esta loja ainda não cadastrou o cardápio.
          </div>
        ) : (
          <div className="space-y-8">
            {store.menuSections.map((section) => (
              <section key={section.id}>
                <h2 className="text-lg md:text-xl font-bold mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 rounded-full gradient-line" />
                  {section.name}
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {section.items.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onClick={() => item.isAvailable && setSelectedItem(item)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Item modal */}
      <AnimatePresence>
        {selectedItem && (
          <ItemModal
            item={selectedItem}
            store={store}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ItemCard({ item, onClick }: { item: MenuItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={!item.isAvailable}
      className={`group flex gap-3 p-3 rounded-xl border bg-card text-left transition-all ${
        item.isAvailable
          ? "hover:border-primary/40 hover:shadow-md cursor-pointer"
          : "opacity-50 cursor-not-allowed"
      }`}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
        )}
        <div className="mt-2 font-bold text-primary">{formatBRL(item.price)}</div>
        {!item.isAvailable && (
          <Badge variant="secondary" className="mt-1 text-[10px]">Indisponível</Badge>
        )}
      </div>
      {item.imageUrl && (
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary shrink-0">
          { }
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
    </button>
  );
}

function ItemModal({ item, store, onClose }: { item: MenuItem; store: StoreData; onClose: () => void }) {
  const cart = useCart();
  const { setView } = useNav();
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");

  const handleAdd = () => {
    const ok = cart.add(
      {
        itemId: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        notes: notes.trim() || undefined,
      },
      {
        id: store.id,
        name: store.name,
        slug: store.slug,
        deliveryFee: store.deliveryFee,
        minOrder: store.minOrder,
      },
      qty
    );
    if (!ok) {
      toast.error("Carrinho com itens de outra loja", {
        description: "Esvazie o carrinho para pedir desta loja.",
        action: { label: "Esvaziar", onClick: () => { cart.clear(); onClose(); setView("cart"); } },
      });
      return;
    }
    toast.success(`${qty}× ${item.name} adicionado`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {item.imageUrl ? (
            <div className="aspect-[16/10] overflow-hidden bg-secondary">
              { }
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-[16/10] bg-secondary grid place-items-center text-5xl opacity-40">🍽️</div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 grid place-items-center h-8 w-8 rounded-full bg-background/80 backdrop-blur hover:bg-background"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-bold">{item.name}</h3>
          {item.description && (
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
          )}
          <div className="mt-2 text-xl font-bold text-primary">{formatBRL(item.price)}</div>

          <div className="mt-4">
            <label className="text-sm font-medium">Observações</label>
            <Textarea
              placeholder="Ex. sem cebola, ponto da carne, molho à parte…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 resize-none text-sm"
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQty(Math.max(1, qty - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQty(qty + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button className="flex-1 h-11" onClick={handleAdd}>
              Adicionar · {formatBRL(item.price * qty)}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StoreLocationMap({ address, storeName }: { address: string; storeName: string }) {
  const { coords, loading, error } = useGeocode(address);

  if (loading) {
    return (
      <div className="mt-3 h-[200px] rounded-xl bg-secondary animate-pulse grid place-items-center">
        <span className="text-xs text-muted-foreground">Carregando mapa…</span>
      </div>
    );
  }

  if (error || !coords) {
    return null;
  }

  return (
    <div className="mt-3">
      <MiniMap
        lat={coords.lat}
        lng={coords.lng}
        zoom={16}
        label={storeName}
        height="200px"
      />
    </div>
  );
}
