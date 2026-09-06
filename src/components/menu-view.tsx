"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useCart, useNav, formatBRL, type CartItem } from "@/lib/store";
import { toast } from "sonner";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Flame,
  Leaf,
  Star,
  Clock,
  ChevronLeft,
  ShoppingBag,
  Check,
  Loader2,
} from "lucide-react";

interface MenuProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isFeatured: boolean;
  isVegan: boolean;
  isSpicy: boolean;
  prepTimeMin: number;
}

interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  products: MenuProduct[];
}

interface MenuData {
  restaurant: {
    id: string;
    name: string;
    description: string | null;
    primaryColor: string | null;
    address: string | null;
    phone: string | null;
    currency: string;
  };
  table: { id: string; code: string; seats: number; area: string | null } | null;
  categories: MenuCategory[];
}

export function MenuView() {
  const [data, setData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string>("");
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<null | { orderNumber: number; total: number }>(null);

  const cart = useCart();
  const { setView, setRestaurantId } = useNav();

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setRestaurantId(d.restaurant.id);
        if (d.categories?.length > 0) setActiveCat(d.categories[0].slug);
      })
      .catch((e) => toast.error("Não foi possível carregar o cardápio", { description: e.message }))
      .finally(() => setLoading(false));
  }, [setRestaurantId]);

  const filteredCategories = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data.categories;
    const q = search.toLowerCase();
    return data.categories
      .map((c) => ({
        ...c,
        products: c.products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.description ?? "").toLowerCase().includes(q)
        ),
      }))
      .filter((c) => c.products.length > 0);
  }, [data, search]);

  const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleAdd = (product: MenuProduct) => {
    cart.add({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    setTimeout(() => {
      toast.success(`${product.name} adicionado`, {
        description: `${useCart.getState().totalItems()} itens no carrinho`,
      });
    }, 0);
  };

  const handleCheckout = async () => {
    if (!data || cart.items.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: data.restaurant.id,
          tableId: data.table?.id ?? null,
          channel: data.table ? "QR" : "TAKEOUT",
          tip: Math.round(subtotal * 0.1),
          items: cart.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            notes: i.notes,
          })),
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Erro ao criar pedido");
      }
      const { order } = await res.json();
      setOrderConfirmed({ orderNumber: order.orderNumber, total: order.total });
      cart.clear();
      setCartOpen(false);
    } catch (e: any) {
      toast.error("Não foi possível enviar o pedido", { description: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-app py-20 flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando cardápio…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-muted-foreground">Cardápio não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header do restaurante */}
      <div className="bg-gradient-to-b from-accent to-accent/80 text-accent-foreground">
        <div className="container-app py-6">
          <button
            onClick={() => setView("home")}
            className="inline-flex items-center gap-1 text-xs text-accent-foreground/70 hover:text-primary transition-colors mb-4"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Voltar ao início
          </button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold">{data.restaurant.name}</h1>
                {data.table && (
                  <Badge className="bg-primary text-primary-foreground">
                    {data.table.area} · Mesa {data.table.code}
                  </Badge>
                )}
              </div>
              <p className="mt-1.5 text-sm text-accent-foreground/70 max-w-2xl">
                {data.restaurant.description}
              </p>
              {data.table && (
                <p className="mt-2 text-xs text-accent-foreground/60">
                  Bem-vindo · {data.table.seats} pessoas · Escaneie, peça e pague por aqui
                </p>
              )}
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-xs text-accent-foreground/60">Horário</div>
              <div className="text-sm font-semibold">12:00 — 23:00</div>
            </div>
          </div>
        </div>
      </div>

      {/* Nav sticky de categorias + busca */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-lg border-b">
        <div className="container-app py-3 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar prato…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex-1 overflow-x-auto scroll-hidden">
            <div className="flex gap-2 w-max">
              {data.categories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => {
                    setActiveCat(c.slug);
                    document.getElementById(`cat-${c.slug}`)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                  className={`whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                    activeCat === c.slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                  }`}
                >
                  <span className="mr-1">{c.icon}</span>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo do cardápio */}
      <div className="container-app py-6 flex-1">
        {search.trim() === "" && (
          <FeaturedSection
            products={data.categories.flatMap((c) => c.products).filter((p) => p.isFeatured)}
            onAdd={handleAdd}
          />
        )}

        <div className="space-y-10 mt-8">
          {filteredCategories.map((cat) => (
            <section key={cat.id} id={`cat-${cat.slug}`} className="scroll-mt-32">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{cat.icon}</span>
                <h2 className="text-xl font-bold">{cat.name}</h2>
                <span className="text-xs text-muted-foreground">
                  {cat.products.length} {cat.products.length === 1 ? "prato" : "pratos"}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cat.products.map((p) => (
                  <ProductCard key={p.id} product={p} onAdd={() => handleAdd(p)} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Não encontramos pratos para &ldquo;{search}&rdquo;</p>
            <Button variant="link" onClick={() => setSearch("")}>Limpar busca</Button>
          </div>
        )}
      </div>

      {/* Barra flutuante do carrinho */}
      <AnimatePresence>
        {totalItems > 0 && !cartOpen && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-sm"
          >
            <button
              onClick={() => setCartOpen(true)}
              className="w-full bg-primary text-primary-foreground rounded-2xl shadow-xl px-5 py-3 flex items-center justify-between gap-3 hover:shadow-2xl transition-shadow"
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] font-bold rounded-full h-4 w-4 grid place-items-center">
                    {totalItems}
                  </span>
                </div>
                <span className="text-sm font-semibold">Ver carrinho</span>
              </div>
              <span className="text-sm font-bold">{formatBRL(subtotal)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sheet do carrinho */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="p-5 border-b">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Seu pedido
              {data.table && (
                <Badge variant="secondary" className="ml-1">Mesa {data.table.code}</Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          {cart.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="grid place-items-center h-16 w-16 rounded-full bg-secondary">
                <ShoppingBag className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Seu carrinho está vazio.<br />Adicione alguns pratos do cardápio.
              </p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                  {cart.items.map((item) => (
                    <CartLine key={item.productId} item={item} />
                  ))}
                </div>
              </ScrollArea>

              <SheetFooter className="border-t p-5 flex-col gap-3">
                <div className="space-y-1.5 w-full text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatBRL(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Gorjeta sugerida (10%)</span>
                    <span>{formatBRL(Math.round(subtotal * 0.1))}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-1.5 border-t">
                    <span>Total</span>
                    <span>{formatBRL(subtotal + Math.round(subtotal * 0.1))}</span>
                  </div>
                </div>
                <Button
                  className="w-full h-11"
                  onClick={handleCheckout}
                  disabled={submitting}
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando…</>
                  ) : (
                    <>Enviar à cozinha · {formatBRL(subtotal + Math.round(subtotal * 0.1))}</>
                  )}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground">
                  Ao enviar você aceita os termos. Pagamento na mesa ou ao receber.
                </p>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Diálogo de confirmação */}
      <AnimatePresence>
        {orderConfirmed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setOrderConfirmed(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-card rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid place-items-center h-16 w-16 rounded-full bg-chart-2/15 text-chart-2 mx-auto mb-4">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-1">Pedido confirmado!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Seu pedido está na fila. A cozinha vai prepará-lo em breve.
              </p>
              <div className="bg-secondary rounded-xl p-4 space-y-1 mb-5">
                <div className="text-xs text-muted-foreground">Número do pedido</div>
                <div className="text-2xl font-bold text-primary">#{orderConfirmed.orderNumber}</div>
                <div className="text-xs text-muted-foreground pt-1">Total: {formatBRL(orderConfirmed.total)}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setOrderConfirmed(null);
                    setView("admin");
                  }}
                >
                  Ver na cozinha
                </Button>
                <Button className="flex-1" onClick={() => setOrderConfirmed(null)}>
                  Continuar pedindo
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeaturedSection({ products, onAdd }: { products: MenuProduct[]; onAdd: (p: MenuProduct) => void }) {
  if (products.length === 0) return null;
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Star className="h-5 w-5 fill-chart-4 text-chart-4" />
        <h2 className="text-xl font-bold">Recomendados do chef</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scroll-thin">
        {products.map((p) => (
          <div key={p.id} className="w-64 shrink-0">
            <ProductCard product={p} onAdd={() => onAdd(p)} compact />
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductCard({
  product,
  onAdd,
  compact = false,
}: {
  product: MenuProduct;
  onAdd: () => void;
  compact?: boolean;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group h-full">
      <div className="aspect-[16/10] bg-gradient-to-br from-secondary to-secondary/60 grid place-items-center text-4xl">
        {product.imageUrl ? "🍽️" : "🍽️"}
      </div>
      <CardContent className={`p-4 ${compact ? "" : "flex flex-col h-full"}`}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold leading-tight">{product.name}</h3>
          <div className="flex gap-1 shrink-0">
            {product.isVegan && (
              <span title="Vegano" className="text-chart-2"><Leaf className="h-3.5 w-3.5" /></span>
            )}
            {product.isSpicy && (
              <span title="Picante" className="text-chart-5"><Flame className="h-3.5 w-3.5" /></span>
            )}
          </div>
        </div>
        <p className={`text-xs text-muted-foreground leading-relaxed ${compact ? "line-clamp-2" : "mb-3"}`}>
          {product.description}
        </p>
        <div className={`flex items-center justify-between mt-auto ${compact ? "mt-2" : ""}`}>
          <div>
            <div className="font-bold text-primary">{formatBRL(product.price)}</div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />~{product.prepTimeMin} min
            </div>
          </div>
          <Button size="sm" className="h-8 w-8 p-0" onClick={onAdd} aria-label={`Adicionar ${product.name}`}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CartLine({ item }: { item: CartItem }) {
  const cart = useCart();
  return (
    <div className="flex gap-3 p-2 rounded-xl border border-border/60 bg-card">
      <div className="grid place-items-center h-12 w-12 rounded-lg bg-secondary shrink-0 overflow-hidden">
        <span className="text-xl">🍽️</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{item.name}</div>
        <div className="text-xs text-primary font-bold">{formatBRL(item.price)}</div>
        <div className="flex items-center gap-2 mt-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0"
            onClick={() => cart.updateQty(item.productId, item.quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0"
            onClick={() => cart.updateQty(item.productId, item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 ml-auto text-muted-foreground hover:text-destructive"
            onClick={() => cart.remove(item.productId)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="text-sm font-bold text-right">
        {formatBRL(item.price * item.quantity)}
      </div>
    </div>
  );
}
