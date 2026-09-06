"use client";

import { useState } from "react";
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
import { useNav } from "@/lib/store";
import {
  QrCode,
  Sparkles,
  Brain,
  BarChart3,
  Bike,
  CalendarCheck,
  Users,
  Star,
  ArrowRight,
  Check,
  TrendingUp,
  Clock,
  Wallet,
  Bell,
  ShoppingBag,
  ChefHat,
  Heart,
  Zap,
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
                Menús digitales con inteligencia artificial
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
                Cluvi es el futuro
                <br />
                de la <span className="text-primary">gastronomía</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                Una plataforma todo-en-uno que digitaliza tu restaurante: menús QR, pedidos
                en autoservicio, reservas, domicilios y analítica avanzada. Conecta con tus
                comensales como nunca antes.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={() => setView("menu")}
                  className="h-12 px-6 text-base"
                >
                  <QrCode className="h-5 w-5 mr-2" />
                  Ver menú demo
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setView("admin")}
                  className="h-12 px-6 text-base"
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Dashboard en vivo
                </Button>
              </div>

              {/* Trust strip */}
              <div className="mt-10 grid grid-cols-3 gap-6 w-full max-w-md">
                <div>
                  <div className="text-3xl font-bold text-primary">80%</div>
                  <div className="text-xs text-muted-foreground mt-1">Menos tiempo de espera</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">+35%</div>
                  <div className="text-xs text-muted-foreground mt-1">Ticket promedio</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">2.5k</div>
                  <div className="text-xs text-muted-foreground mt-1">Restaurantes activos</div>
                </div>
              </div>
            </motion.div>

            {/* Hero illustration / phone mockup */}
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
                          <div className="text-sm font-bold">El Balcón del Chef</div>
                          <div className="text-[10px] text-muted-foreground">Mesa M2 · 4 personas</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">Autoservicio</Badge>
                    </div>

                    <div className="px-3 pb-3 flex gap-2 overflow-hidden">
                      {["Entradas", "Principales", "Burger", "Postres"].map((c, i) => (
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
                        { name: "Ceviche de Mango", price: "$18.500", img: "🥭" },
                        { name: "Bandeja Paisa", price: "$32.000", img: "🍽️" },
                        { name: "Limonada de Coco", price: "$9.000", img: "🥥" },
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
                        <div className="text-sm font-bold">$59.500</div>
                      </div>
                      <div className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-semibold">
                        Pedir →
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating stats badges */}
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
                    <div className="text-[10px] text-muted-foreground">Ventas hoy</div>
                    <div className="text-xs font-bold">$2.4M COP</div>
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
                    <div className="text-[10px] text-muted-foreground">Pedidos activos</div>
                    <div className="text-xs font-bold">12 en cocina</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integrations strip */}
      <section className="border-y bg-secondary/40">
        <div className="container-cluvi py-8">
          <p className="text-center text-xs uppercase tracking-wider text-muted-foreground mb-5">
            Conecta tu menú Cluvi con
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {[
              "WhatsApp Business",
              "Stripe",
              "Mercado Pago",
              "Wompi",
              "Google Analytics",
              "Meta Ads",
              "Rappi",
              "iZettle",
            ].map((p) => (
              <span key={p} className="text-sm font-semibold text-foreground/70">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES grid */}
      <section className="py-20 md:py-28">
        <div className="container-cluvi">
          <motion.div {...fade()} className="max-w-2xl mx-auto text-center mb-14">
            <Badge variant="secondary" className="mb-3">Portafolio</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Descubre nuestro portafolio
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Todo lo que necesitas para digitalizar tu operación gastronómica, en un solo lugar.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: QrCode,
                title: "Menús digitales",
                desc: "Carta interactiva con fotos, descripciones, alérgenos y traducción automática. Actualiza precios y platillos en tiempo real desde el panel.",
                color: "text-primary",
                bg: "bg-primary/10",
                bullets: ["Fotos profesionales", "Multi-idioma", "Sin descargas"],
              },
              {
                icon: ShoppingBag,
                title: "Autoservicio por QR",
                desc: "Los comensales escanean, ordenan y pagan desde su celular. Reduce tiempos de atención y errores de toma de pedido.",
                color: "text-chart-2",
                bg: "bg-chart-2/10",
                bullets: ["Pedido directo a cocina", "Pago en mesa", "Propina digital"],
              },
              {
                icon: CalendarCheck,
                title: "Reservas online",
                desc: "Sistema de reservas con confirmación automática, calendario de mesas y base de datos de comensales.",
                color: "text-chart-3",
                bg: "bg-chart-3/10",
                bullets: ["Confirmación SMS", "Gestión de mesas", "CRM de clientes"],
              },
              {
                icon: Bike,
                title: "Sistema de domicilios",
                desc: "Tu propio canal de domicilios sin comisiones de terceros. Recibe pedidos, asigna repartidores y cobra online.",
                color: "text-chart-4",
                bg: "bg-chart-4/10",
                bullets: ["0% comisión", "Seguimiento en vivo", "Zonas configurables"],
              },
              {
                icon: Brain,
                title: "Inteligencia artificial",
                desc: "Otto, tu asistente IA, recomienda platillos según preferencias del comensal, sugerencias de up-selling y predicción de demanda.",
                color: "text-chart-5",
                bg: "bg-chart-5/10",
                bullets: ["Recomendador", "Predicción de stock", "Análisis de reseñas"],
              },
              {
                icon: BarChart3,
                title: "Analítica avanzada",
                desc: "Dashboard en tiempo real con KPIs clave: ventas, ticket promedio, productos top, horas pico y comportamiento de comensales.",
                color: "text-primary",
                bg: "bg-primary/10",
                bullets: ["Tiempo real", "Exporta reportes", "Benchmark sectorial"],
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

      {/* IMPACT stats band */}
      <section className="bg-accent text-accent-foreground py-16">
        <div className="container-cluvi">
          <motion.div {...fade()} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold">El menú es la herramienta de venta</h2>
            <p className="mt-2 text-accent-foreground/70">más poderosa de tu restaurante</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { stat: "+35%", label: "Incremento en ticket promedio", icon: Wallet },
              { stat: "-80%", label: "Tiempo de espera en mesa", icon: Clock },
              { stat: "+50%", label: "Rotación de mesas en hora pico", icon: TrendingUp },
              { stat: "24/7", label: "Disponibilidad de reservas", icon: Globe },
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

      {/* SEGMENTS - Adaptable a cualquier negocio */}
      <section className="py-20 md:py-28">
        <div className="container-cluvi">
          <motion.div {...fade()} className="max-w-2xl mx-auto text-center mb-12">
            <Badge variant="secondary" className="mb-3">Segmentos</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Adaptable a cualquier tipo de negocio
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: "Cafés y brunch", icon: "☕", count: "320+ negocios" },
              { name: "Restaurantes", icon: "🍽️", count: "1.2k negocios" },
              { name: "Hoteles y hostales", icon: "🏨", count: "180+ negocios" },
              { name: "Bares", icon: "🍸", count: "450+ negocios" },
              { name: "Cinemas", icon: "🎬", count: "60+ negocios" },
              { name: "Cocina oculta", icon: "👨‍🍳", count: "210+ negocios" },
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

      {/* TESTIMONIALS */}
      <section className="bg-secondary/40 py-20 md:py-28">
        <div className="container-cluvi">
          <motion.div {...fade()} className="max-w-2xl mx-auto text-center mb-12">
            <Badge variant="secondary" className="mb-3">Testimonios</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              La confianza de los mejores
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Más de 2.500 restaurantes ya transformaron su operación con Cluvi.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  "Implementamos Cluvi en 3 sedes y redujimos el tiempo de atención en un 70%. El ticket promedio subió 28% gracias a las sugerencias inteligentes.",
                author: "Marcela Restrepo",
                role: "Gerente, El Balcón del Chef",
                avatar: "MR",
                rating: 5,
              },
              {
                quote:
                  "El dashboard en tiempo real es un cambio de juego. Tomamos decisiones de menú basadas en datos reales, no en intuición. Las reservas se triplicaron.",
                author: "Andrés Gómez",
                role: "Chef dueño, Vicio Hamburguesería",
                avatar: "AG",
                rating: 5,
              },
              {
                quote:
                  "El sistema de domicilios sin comisión nos ahorró $14M al mes. La integración con WhatsApp Business fue instantánea y sin fricción.",
                author: "Laura Jiménez",
                role: "CEO, Sazón Express",
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

      {/* BLOG TEASERS */}
      <section className="py-20 md:py-28">
        <div className="container-cluvi">
          <motion.div {...fade()} className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <Badge variant="secondary" className="mb-3">Blog</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Digitalizamos un sector, artículo a artículo
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
                title: "Cluvi Forward 2025 Medellín: el evento que marcará un antes y un después en la gastronomía",
                excerpt: "Conoce las tendencias, herramientas y casos de éxito que se presentaron en el mayor evento de hospitality tech de la región.",
                color: "bg-chart-5/15 text-chart-5",
              },
              {
                tag: "Producto",
                date: "8 Mar 2025",
                title: "Nuevo Timeline de Reservas en Cluvi: gestión más ágil y precisa para restaurantes",
                excerpt: "Ahora visualizas tu ocupación por hora y mesa en una sola pantalla. Duplica la productividad de tu hostess.",
                color: "bg-primary/15 text-primary",
              },
              {
                tag: "Análisis",
                date: "1 Mar 2025",
                title: "Gestión y Rentabilidad en Restaurantes: Indicadores Clave para un Crecimiento Sostenible",
                excerpt: "Los 7 KPIs que todo dueño de restaurante debe monitorear semanalmente para tomar decisiones basadas en datos.",
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
            <Badge variant="secondary" className="mb-3">Preguntas frecuentes</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Lo que necesitas saber
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible>
              {[
                {
                  q: "¿Necesito instalar algo en mi restaurante?",
                  a: "No. Cluvi es 100% web. Solo necesitas un celular con cámara para escanear el QR de cada mesa y un navegador. Tus comensales tampoco descargan nada: el menú abre directamente en su navegador.",
                },
                {
                  q: "¿Cuánto cuesta implementar Cluvi?",
                  a: "Ofrecemos planes desde $79.000 COP/mes para restaurantes pequeños, hasta planes enterprise con multi-sede. Incluye menú digital, pedidos QR, reservas y dashboard analítico. Agenda una demo para cotizar tu caso.",
                },
                {
                  q: "¿Funciona sin internet?",
                  a: "El menú se carga una vez y funciona offline en el dispositivo del comensal. Los pedidos llegan a tu cocina vía WebSocket en tiempo real cuando hay conexión. Si se cae, los pedidos se encolan y sincronizan al reconectar.",
                },
                {
                  q: "¿Puedo migrar mi menú actual?",
                  a: "Sí. Sube tu carta en PDF o Excel y nuestro equipo la importa sin costo. También puedes usar Otto (nuestra IA) para enriquecer descripciones, sugerir fotos y traducir a 8 idiomas automáticamente.",
                },
                {
                  q: "¿Cómo recibo los pagos?",
                  a: "Integramos con Wompi, Mercado Pago, Stripe e iZettle. El comensal paga en su celular y el dinero llega directo a tu cuenta. Incluye propina digital configurable.",
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
                Empieza a digitalizar tu restaurante hoy
              </h2>
              <p className="mt-4 text-lg opacity-90 max-w-xl mx-auto">
                Sin permanencia, sin costos de implementación. Agenda una demo de 30 minutos
                y verás tu menú funcionando en vivo.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-12 px-6 text-base"
                  onClick={() => setView("contact")}
                >
                  <CalendarCheck className="h-5 w-5 mr-2" />
                  Agenda una demo
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-base bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
                  onClick={() => setView("menu")}
                >
                  Probar demo en vivo
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
