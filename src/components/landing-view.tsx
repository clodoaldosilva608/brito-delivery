"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNav, formatBRL } from "@/lib/store";
import {
  QrCode,
  Sparkles,
  Brain,
  BarChart3,
  Bike,
  CalendarCheck,
  Star,
  ArrowRight,
  Check,
  TrendingUp,
  Clock,
  Wallet,
  Bell,
  ShoppingBag,
  Globe,
} from "lucide-react";

export function LandingView() {
  const { setView } = useNav();
  const prefersReduced = useReducedMotion();
  const fade = (delay = 0) =>
    prefersReduced
      ? { initial: false as any, whileInView: false as any, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as any },
        };

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative overflow-hidden hero-mesh">
        <div className="absolute inset-0 bg-grain opacity-30 pointer-events-none" />
        <div className="container-cluvi relative py-20 md:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div {...fade(0)} className="flex flex-col items-start">
              <Badge className="mb-5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Cardápios digitais com inteligência artificial
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
                Cluvi é o futuro
                <br />
                da <span className="text-primary">gastronomia</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                Uma plataforma all-in-one que digitaliza seu restaurante: cardápios QR, pedidos
                em autosserviço, reservas, delivery e analytics avançado. Conecte-se com seus
                clientes como nunca antes.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={() => setView("menu")}
                  className="h-12 px-6 text-base"
                >
                  <QrCode className="h-5 w-5 mr-2" />
                  Ver cardápio demo
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setView("admin")}
                  className="h-12 px-6 text-base"
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Painel ao vivo
                </Button>
              </div>

              {/* Faixa de confiança */}
              <div className="mt-10 grid grid-cols-3 gap-6 w-full max-w-md">
                <div>
                  <div className="text-3xl font-bold text-primary">80%</div>
                  <div className="text-xs text-muted-foreground mt-1">Menos tempo de espera</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">+35%</div>
                  <div className="text-xs text-muted-foreground mt-1">Ticket médio</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">2,5 mil</div>
                  <div className="text-xs text-muted-foreground mt-1">Restaurantes ativos</div>
                </div>
              </div>
            </motion.div>

            {/* Mockup de celular */}
            <motion.div {...fade(0.15)} className="relative flex justify-center">
              <div className="relative w-full max-w-sm">
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-chart-4/20 blur-3xl" />

                <div className="relative rounded-[2.5rem] border-8 border-accent bg-card p-4 shadow-2xl animate-float-slow">
                  <div className="rounded-[2rem] bg-gradient-to-b from-secondary/60 to-background overflow-hidden">
                    <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground font-black">
                          C
                        </span>
                        <div>
                          <div className="text-sm font-bold">A Varanda do Chef</div>
                          <div className="text-[10px] text-muted-foreground">Mesa M2 · 4 pessoas</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">Autosserviço</Badge>
                    </div>

                    <div className="px-3 pb-3 flex gap-2 overflow-hidden">
                      {["Entradas", "Principais", "Burger", "Sobremesas"].map((c, i) => (
                        <span
                          key={c}
                          className={`text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap ${
                            i === 0
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {c}
                        </span>
                      ))}
                    </div>

                    <div className="px-3 space-y-2.5">
                      {[
                        { name: "Ceviche de Manga", price: formatBRL(28), img: "🥭" },
                        { name: "Feijoada Completa", price: formatBRL(48), img: "🍲" },
                        { name: "Limondade de Coco", price: formatBRL(14), img: "🥥" },
                      ].map((p) => (
                        <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-card border border-border/60 shadow-sm">
                          <div className="grid place-items-center h-12 w-12 rounded-lg bg-secondary text-2xl shrink-0">
                            {p.img}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold truncate">{p.name}</div>
                            <div className="text-[10px] text-primary font-bold">{p.price}</div>
                          </div>
                          <button className="grid place-items-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                            +
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 mx-3 mb-3 p-3 rounded-xl bg-accent text-accent-foreground flex items-center justify-between">
                      <div>
                        <div className="text-[10px] opacity-70">Total</div>
                        <div className="text-sm font-bold">{formatBRL(90)}</div>
                      </div>
                      <div className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-semibold">
                        Pedir →
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges flutuantes */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="absolute -left-8 top-1/4 bg-card border border-border shadow-lg rounded-xl p-3 flex items-center gap-2"
                >
                  <div className="grid place-items-center h-9 w-9 rounded-lg bg-chart-2/15 text-chart-2">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Vendas hoje</div>
                    <div className="text-xs font-bold">R$ 18,2 mil</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -right-6 bottom-12 bg-card border border-border shadow-lg rounded-xl p-3 flex items-center gap-2"
                >
                  <div className="grid place-items-center h-9 w-9 rounded-lg bg-primary/15 text-primary">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Pedidos ativos</div>
                    <div className="text-xs font-bold">12 na cozinha</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Faixa de integrações */}
      <section className="border-y bg-secondary/40">
        <div className="container-cluvi py-8">
          <p className="text-center text-xs uppercase tracking-wider text-muted-foreground mb-5">
            Conecte seu cardápio Cluvi com
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {[
              "WhatsApp Business",
              "Stripe",
              "Mercado Pago",
              "PagSeguro",
              "Google Analytics",
              "Meta Ads",
              "iFood",
              "Stone",
            ].map((p) => (
              <span key={p} className="text-sm font-semibold text-foreground/70">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 md:py-28">
        <div className="container-cluvi">
          <motion.div {...fade()} className="max-w-2xl mx-auto text-center mb-14">
            <Badge variant="secondary" className="mb-3">Portfólio</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Conheça nosso portfólio
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tudo o que você precisa para digitalizar sua operação gastronômica, em um só lugar.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: QrCode,
                title: "Cardápios digitais",
                desc: "Carta interativa com fotos, descrições, alérgenos e tradução automática. Atualize preços e pratos em tempo real pelo painel.",
                color: "text-primary",
                bg: "bg-primary/10",
                bullets: ["Fotos profissionais", "Multi-idioma", "Sem downloads"],
              },
              {
                icon: ShoppingBag,
                title: "Autosserviço via QR",
                desc: "Os clientes escaneiam, pedem e pagam pelo celular. Reduz tempos de atendimento e erros de anotação.",
                color: "text-chart-2",
                bg: "bg-chart-2/10",
                bullets: ["Pedido direto à cozinha", "Pagamento na mesa", "Gorjeta digital"],
              },
              {
                icon: CalendarCheck,
                title: "Reservas online",
                desc: "Sistema de reservas com confirmação automática, calendário de mesas e banco de dados de clientes.",
                color: "text-chart-3",
                bg: "bg-chart-3/10",
                bullets: ["Confirmação por SMS", "Gestão de mesas", "CRM de clientes"],
              },
              {
                icon: Bike,
                title: "Sistema de delivery",
                desc: "Seu próprio canal de delivery sem comissões de terceiros. Receba pedidos, atribua entregadores e cobre online.",
                color: "text-chart-4",
                bg: "bg-chart-4/10",
                bullets: ["0% de comissão", "Rastreamento ao vivo", "Zonas configuráveis"],
              },
              {
                icon: Brain,
                title: "Inteligência artificial",
                desc: "Otto, seu assistente de IA, recomenda pratos conforme preferências do cliente, sugere up-selling e prevê demanda.",
                color: "text-chart-5",
                bg: "bg-chart-5/10",
                bullets: ["Recomendador", "Previsão de estoque", "Análise de avaliações"],
              },
              {
                icon: BarChart3,
                title: "Analytics avançado",
                desc: "Painel em tempo real com KPIs chave: vendas, ticket médio, produtos top, horários de pico e comportamento de clientes.",
                color: "text-primary",
                bg: "bg-primary/10",
                bullets: ["Tempo real", "Exporta relatórios", "Benchmark do setor"],
              },
            ].map((f, i) => (
              <motion.div key={f.title} {...fade(i * 0.05)}>
                <Card className="h-full hover:shadow-lg transition-shadow border-border/60 group">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className={`grid place-items-center h-12 w-12 rounded-xl ${f.bg} ${f.color} mb-4`}>
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                      {f.desc}
                    </p>
                    <ul className="space-y-1.5">
                      {f.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2 text-xs">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-foreground/80">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACTO */}
      <section className="bg-accent text-accent-foreground py-16">
        <div className="container-cluvi">
          <motion.div {...fade()} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold">O cardápio é a ferramenta de venda</h2>
            <p className="mt-2 text-accent-foreground/70">mais poderosa do seu restaurante</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { stat: "+35%", label: "Aumento no ticket médio", icon: Wallet },
              { stat: "-80%", label: "Tempo de espera na mesa", icon: Clock },
              { stat: "+50%", label: "Rotatividade de mesas no pico", icon: TrendingUp },
              { stat: "24/7", label: "Disponibilidade de reservas", icon: Globe },
            ].map((s, i) => (
              <motion.div key={s.label} {...fade(i * 0.08)} className="text-center">
                <div className="grid place-items-center mb-3">
                  <div className="grid place-items-center h-12 w-12 rounded-xl bg-primary/15 text-primary">
                    <s.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-black text-primary">{s.stat}</div>
                <div className="text-xs text-accent-foreground/70 mt-1.5 leading-snug">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEGMENTOS */}
      <section className="py-20 md:py-28">
        <div className="container-cluvi">
          <motion.div {...fade()} className="max-w-2xl mx-auto text-center mb-12">
            <Badge variant="secondary" className="mb-3">Segmentos</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Adaptável a qualquer tipo de negócio
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: "Cafeterias e brunch", icon: "☕", count: "320+ negócios" },
              { name: "Restaurantes", icon: "🍽️", count: "1,2 mil negócios" },
              { name: "Hotéis e pousadas", icon: "🏨", count: "180+ negócios" },
              { name: "Bares", icon: "🍸", count: "450+ negócios" },
              { name: "Cinemas", icon: "🎬", count: "60+ negócios" },
              { name: "Dark kitchen", icon: "👨‍🍳", count: "210+ negócios" },
            ].map((s, i) => (
              <motion.button
                key={s.name}
                {...fade(i * 0.05)}
                onClick={() => setView("menu")}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 text-left hover:border-primary hover:shadow-md transition-all"
              >
                <div className="text-4xl mb-3">{s.icon}</div>
                <div className="font-semibold">{s.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.count}</div>
                <ArrowRight className="absolute top-6 right-6 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="bg-secondary/40 py-20 md:py-28">
        <div className="container-cluvi">
          <motion.div {...fade()} className="max-w-2xl mx-auto text-center mb-12">
            <Badge variant="secondary" className="mb-3">Depoimentos</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              A confiança dos melhores
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Mais de 2.500 restaurantes já transformaram sua operação com a Cluvi.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  "Implementamos a Cluvi em 3 unidades e reduzimos o tempo de atendimento em 70%. O ticket médio subiu 28% graças às sugestões inteligentes.",
                author: "Marcela Restrepo",
                role: "Gerente, A Varanda do Chef",
                avatar: "MR",
                rating: 5,
              },
              {
                quote:
                  "O painel em tempo real é um divisor de águas. Tomamos decisões de cardápio baseadas em dados reais, não em intuição. As reservas triplicaram.",
                author: "André Gomes",
                role: "Chef proprietário, Burger Vício",
                avatar: "AG",
                rating: 5,
              },
              {
                quote:
                  "O sistema de delivery sem comissão nos economizou R$ 14 mil por mês. A integração com WhatsApp Business foi instantânea e sem atrito.",
                author: "Laura Jimenez",
                role: "CEO, Sazão Express",
                avatar: "LJ",
                rating: 5,
              },
            ].map((t, i) => (
              <motion.div key={t.author} {...fade(i * 0.08)}>
                <Card className="h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, idx) => (
                        <Star key={idx} className="h-4 w-4 fill-chart-4 text-chart-4" />
                      ))}
                    </div>
                    <blockquote className="text-sm leading-relaxed text-foreground/90 flex-1">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <div className="mt-5 flex items-center gap-3">
                      <div className="grid place-items-center h-10 w-10 rounded-full bg-primary/15 text-primary font-bold text-sm">
                        {t.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{t.author}</div>
                        <div className="text-xs text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section className="py-20 md:py-28">
        <div className="container-cluvi">
          <motion.div {...fade()} className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <Badge variant="secondary" className="mb-3">Blog</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Digitalizamos um setor, artigo a artigo
              </h2>
            </div>
            <Button variant="outline" onClick={() => setView("contact")}>
              Ver todos
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                tag: "Evento",
                date: "15 Mar 2025",
                title: "Cluvi Forward 2025 Curitiba: o evento que marcará um antes e depois na gastronomia",
                excerpt: "Conheça as tendências, ferramentas e casos de sucesso apresentados no maior evento de hospitality tech da região.",
                color: "bg-chart-5/15 text-chart-5",
              },
              {
                tag: "Produto",
                date: "8 Mar 2025",
                title: "Novo Timeline de Reservas na Cluvi: gestão mais ágil e precisa para restaurantes",
                excerpt: "Agora você visualiza sua ocupação por hora e mesa em uma única tela. Dobre a produtividade da sua hostess.",
                color: "bg-primary/15 text-primary",
              },
              {
                tag: "Análise",
                date: "1 Mar 2025",
                title: "Gestão e Rentabilidade em Restaurantes: Indicadores Chave para um Crescimento Sustentável",
                excerpt: "Os 7 KPIs que todo dono de restaurante deve monitorar semanalmente para tomar decisões baseadas em dados.",
                color: "bg-chart-2/15 text-chart-2",
              },
            ].map((p, i) => (
              <motion.button
                key={p.title}
                {...fade(i * 0.06)}
                onClick={() => setView("contact")}
                className="group text-left"
              >
                <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-[16/10] bg-gradient-to-br from-secondary to-secondary/40 grid place-items-center">
                    <span className="text-5xl opacity-40">📰</span>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${p.color}`}>
                        {p.tag}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{p.date}</span>
                    </div>
                    <h3 className="font-semibold leading-snug mb-2 group-hover:text-primary transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {p.excerpt}
                    </p>
                  </CardContent>
                </Card>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-secondary/40 py-20">
        <div className="container-cluvi">
          <motion.div {...fade()} className="max-w-2xl mx-auto text-center mb-10">
            <Badge variant="secondary" className="mb-3">Perguntas frequentes</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              O que você precisa saber
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible>
              {[
                {
                  q: "Preciso instalar algo no meu restaurante?",
                  a: "Não. A Cluvi é 100% web. Você só precisa de um celular com câmera para escanear o QR de cada mesa e um navegador. Seus clientes também não baixam nada: o cardápio abre direto no navegador deles.",
                },
                {
                  q: "Quanto custa implementar a Cluvi?",
                  a: "Oferecemos planos a partir de R$ 149/mês para restaurantes pequenos, até planos enterprise com multi-unidade. Inclui cardápio digital, pedidos QR, reservas e painel analítico. Agende uma demo para cotizar seu caso.",
                },
                {
                  q: "Funciona sem internet?",
                  a: "O cardápio é carregado uma vez e funciona offline no dispositivo do cliente. Os pedidos chegam na sua cozinha via WebSocket em tempo real quando há conexão. Se cair, os pedidos são enfileirados e sincronizados ao reconectar.",
                },
                {
                  q: "Posso migrar meu cardápio atual?",
                  a: "Sim. Envie sua carta em PDF ou Excel e nossa equipe importa sem custo. Você também pode usar o Otto (nossa IA) para enriquecer descrições, sugerir fotos e traduzir para 8 idiomas automaticamente.",
                },
                {
                  q: "Como recebo os pagamentos?",
                  a: "Integramos com PagSeguro, Mercado Pago, Stripe e Stone. O cliente paga pelo celular e o dinheiro cai direto na sua conta. Inclui gorjeta digital configurável.",
                },
              ].map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-base">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="container-cluvi">
          <motion.div
            {...fade()}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-chart-5 px-6 py-16 md:px-16 md:py-24 text-center text-primary-foreground"
          >
            <div className="absolute inset-0 bg-grain opacity-20" />
            <div className="relative">
              <Sparkles className="h-8 w-8 mx-auto mb-4 opacity-80" />
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-2xl mx-auto">
                Comece a digitalizar seu restaurante hoje
              </h2>
              <p className="mt-4 text-lg opacity-90 max-w-xl mx-auto">
                Sem fidelidade, sem custos de implementação. Agende uma demo de 30 minutos
                e veja seu cardápio funcionando ao vivo.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-12 px-6 text-base"
                  onClick={() => setView("contact")}
                >
                  <CalendarCheck className="h-5 w-5 mr-2" />
                  Agendar uma demo
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-base bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
                  onClick={() => setView("menu")}
                >
                  Testar demo ao vivo
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
