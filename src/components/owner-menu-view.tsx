"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNav, formatBRL } from "@/lib/store";
import { toast } from "sonner";
import {
  ChevronLeft, Loader2, Plus, Trash2, GripVertical, Eye, EyeOff, UtensilsCrossed,
} from "lucide-react";

interface MenuItemT {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
}
interface MenuSectionT {
  id: string;
  name: string;
  items: MenuItemT[];
}
interface StoreT {
  id: string;
  name: string;
  menuSections: MenuSectionT[];
}

export function OwnerMenuView() {
  const { activeStoreId, setView } = useNav();
  const [store, setStore] = useState<StoreT | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!activeStoreId) {
      setView("dashboard");
      return;
    }
    setLoading(true);
    fetch(`/api/my/stores/${activeStoreId}`)
      .then((r) => r.json())
      .then((d) => setStore(d.store))
      .finally(() => setLoading(false));
  }, [activeStoreId, setView]);

  useEffect(() => {
    load();
  }, [load]);

  const addSection = async () => {
    const name = prompt("Nome da seção:");
    if (!name) return;
    try {
      const res = await fetch(`/api/my/stores/${activeStoreId}/menu/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      toast.success("Seção criada");
      load();
    } catch {
      toast.error("Erro ao criar seção");
    }
  };

  const renameSection = async (sectionId: string, current: string) => {
    const name = prompt("Novo nome:", current);
    if (!name || name === current) return;
    try {
      await fetch(`/api/my/stores/${activeStoreId}/menu/sections/${sectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      toast.success("Renomeada");
      load();
    } catch {
      toast.error("Erro");
    }
  };

  const deleteSection = async (sectionId: string, name: string) => {
    if (!confirm(`Excluir seção "${name}" e todos os itens?`)) return;
    try {
      await fetch(`/api/my/stores/${activeStoreId}/menu/sections/${sectionId}`, { method: "DELETE" });
      toast.success("Seção excluída");
      load();
    } catch {
      toast.error("Erro");
    }
  };

  const addItem = async (sectionId: string) => {
    const name = prompt("Nome do item:");
    if (!name) return;
    const priceStr = prompt("Preço (R$):", "0.00");
    if (!priceStr) return;
    const price = parseFloat(priceStr.replace(",", "."));
    if (isNaN(price)) return toast.error("Preço inválido");
    const description = prompt("Descrição (opcional):") || "";
    const imageUrl = prompt("URL da foto (opcional):") || "";

    try {
      const res = await fetch(`/api/my/stores/${activeStoreId}/menu/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId,
          name,
          description: description || null,
          price,
          imageUrl: imageUrl || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Item adicionado");
      load();
    } catch {
      toast.error("Erro ao adicionar");
    }
  };

  const toggleAvailable = async (item: MenuItemT) => {
    try {
      await fetch(`/api/my/stores/${activeStoreId}/menu/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      load();
    } catch {
      toast.error("Erro");
    }
  };

  const editItem = async (item: MenuItemT) => {
    const name = prompt("Nome:", item.name);
    if (!name) return;
    const priceStr = prompt("Preço:", String(item.price));
    if (!priceStr) return;
    const price = parseFloat(priceStr.replace(",", "."));
    if (isNaN(price)) return toast.error("Preço inválido");
    const description = prompt("Descrição:", item.description || "") || "";
    const imageUrl = prompt("URL da foto:", item.imageUrl || "") || "";

    try {
      await fetch(`/api/my/stores/${activeStoreId}/menu/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          price,
          imageUrl: imageUrl || null,
        }),
      });
      toast.success("Item atualizado");
      load();
    } catch {
      toast.error("Erro");
    }
  };

  const deleteItem = async (itemId: string, name: string) => {
    if (!confirm(`Excluir "${name}"?`)) return;
    try {
      await fetch(`/api/my/stores/${activeStoreId}/menu/items/${itemId}`, { method: "DELETE" });
      toast.success("Item excluído");
      load();
    } catch {
      toast.error("Erro");
    }
  };

  if (loading) {
    return <div className="container-brito py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></div>;
  }

  if (!store) {
    return <div className="container-brito py-16 text-center text-muted-foreground">Loja não encontrada.</div>;
  }

  return (
    <div className="container-brito py-6">
      <button
        onClick={() => setView("dashboard")}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-3"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Voltar ao painel
      </button>

      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold">Cardápio · {store.name}</h1>
          <p className="text-sm text-muted-foreground">Gerencie seções e itens</p>
        </div>
        <Button onClick={addSection}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nova seção
        </Button>
      </div>

      {store.menuSections.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <UtensilsCrossed className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-4">Nenhuma seção ainda.</p>
            <Button onClick={addSection}>
              <Plus className="h-4 w-4 mr-1.5" />
              Criar primeira seção
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {store.menuSections.map((section) => (
            <Card key={section.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <button
                    onClick={() => renameSection(section.id, section.name)}
                    className="flex items-center gap-2 font-bold hover:text-primary transition-colors"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    {section.name}
                    <Badge variant="secondary" className="text-[10px]">{section.items.length}</Badge>
                  </button>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => addItem(section.id)} className="h-7 text-xs">
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Item
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => deleteSection(section.id, section.name)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {section.items.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-3 text-center">Sem itens. Clique em &ldquo;Item&rdquo; para adicionar.</p>
                ) : (
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border ${item.isAvailable ? "bg-card" : "bg-muted/30 opacity-60"}`}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary shrink-0">
                          {item.imageUrl ? (
                             
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full grid place-items-center text-xl">🍽️</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{item.name}</div>
                          {item.description && <div className="text-xs text-muted-foreground truncate">{item.description}</div>}
                          <div className="text-sm font-bold text-primary">{formatBRL(item.price)}</div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => toggleAvailable(item)}
                            title={item.isAvailable ? "Disponível (ocultar)" : "Indisponível (mostrar)"}
                          >
                            {item.isAvailable ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => editItem(item)} title="Editar">
                            ✏️
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => deleteItem(item.id, item.name)} title="Excluir">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
