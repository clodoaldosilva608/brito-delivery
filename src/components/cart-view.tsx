"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart, useNav, formatBRL } from "@/lib/store";
import {
  ShoppingCart, Plus, Minus, Trash2, ChevronLeft, ShoppingBag, AlertCircle,
} from "lucide-react";

export function CartView() {
  const cart = useCart();
  const { setView } = useNav();

  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + cart.deliveryFee;
  const belowMin = cart.minOrder > 0 && subtotal < cart.minOrder;

  const goCheckout = () => {
    if (cart.items.length === 0) return;
    if (belowMin) return;
    setView("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (cart.items.length === 0) {
    return (
      <div className="container-brito py-12">
        <button
          onClick={() => setView("home")}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Continuar comprando
        </button>
        <div className="py-16 text-center">
          <div className="grid place-items-center h-20 w-20 rounded-full bg-secondary mx-auto mb-4">
            <ShoppingBag className="h-9 w-9 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-1">Seu carrinho está vazio</h2>
          <p className="text-sm text-muted-foreground mb-6">Que tal pedir algo gostoso agora?</p>
          <Button onClick={() => setView("home")}>Ver restaurantes</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-brito py-6">
      <button
        onClick={() => setView("home")}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-3"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Continuar comprando
      </button>

      <h1 className="text-2xl font-bold mb-1">Seu carrinho</h1>
      <p className="text-sm text-muted-foreground mb-5">
        {cart.storeName} · {cart.items.length} {cart.items.length === 1 ? "item" : "itens"}
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {cart.items.map((item) => (
              <motion.div
                key={item.itemId + (item.notes || "")}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardContent className="p-3 flex gap-3 items-center">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary shrink-0">
                      {item.imageUrl ? (
                         
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-2xl">🍽️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{item.name}</div>
                      {item.notes && (
                        <div className="text-xs text-muted-foreground italic truncate">"{item.notes}"</div>
                      )}
                      <div className="text-sm font-bold text-primary mt-0.5">{formatBRL(item.price)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => cart.updateQty(item.itemId, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => cart.updateQty(item.itemId, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => cart.remove(item.itemId)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          <button
            onClick={() => { cart.clear(); setView("home"); }}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Esvaziar carrinho
          </button>
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="p-5">
              <h3 className="font-bold mb-3">Resumo</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatBRL(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxa de entrega</span>
                  <span>{cart.deliveryFee === 0 ? "Grátis" : formatBRL(cart.deliveryFee)}</span>
                </div>
                <div className="pt-2 border-t flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">{formatBRL(total)}</span>
                </div>
              </div>

              {belowMin && (
                <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-accent/10 text-accent text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Pedido mínimo de {formatBRL(cart.minOrder)} não atingido. Faltam {formatBRL(cart.minOrder - subtotal)}.</span>
                </div>
              )}

              <Button
                className="w-full mt-4 h-11"
                onClick={goCheckout}
                disabled={belowMin}
              >
                Finalizar pedido
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
