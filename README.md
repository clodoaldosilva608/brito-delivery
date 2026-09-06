# 🍔 Brito — Marketplace de Delivery Multi-Loja

Plataforma SaaS completa onde qualquer restaurante cria sua loja e clientes navegam, montam carrinho e finalizam pedidos. Com mapa OpenStreetMap, tempo real via SSE, e painel administrativo completo.

![Brito](https://img.shields.io/badge/Brito-Delivery_Platform-E85D2C?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTVMMTIgMnoiLz48L3N2Zz4=)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitetura](#-arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Modelo de Dados](#-modelo-de-dados)
- [APIs](#-apis)
- [Tempo Real (SSE)](#-tempo-real-sse)
- [Mapas](#-mapas)
- [Autenticação e Permissões](#-autenticação-e-permissões)
- [Contas Demo](#-contas-demo)
- [Como Rodar Localmente](#-como-rodar-localmente)
- [Deploy](#-deploy)
- [Roadmap](#-roadmap)
- [Licença](#-licença)

---

## 🎯 Visão Geral

O **Brito** é um marketplace de delivery de comida onde:

- **Donos de restaurantes** criam sua loja, cadastram cardápio, configuram pagamentos e gerenciam pedidos em tempo real
- **Clientes** navegam por lojas, adicionam itens ao carrinho, escolhem forma de pagamento (Pix, cartão ou na entrega) e acompanham o status do pedido
- **Admin master** tem acesso a todas as lojas e configurações do sistema

A aplicação foi inspirada no [GoDelivery](https://appgodelivery.com.br) e implementa todas as funcionalidades principais de um marketplace de delivery moderno.

### Identidade Visual

- **Cores**: Carvão escuro (fundo) + vermelho profundo (primária) + dourado (destaques)
- **Energia**: Refinada como restaurante, ágil como fast food
- **Tipografia**: Inter (sans-serif) com pesos bold para títulos

---

## ✨ Funcionalidades

### 👤 Área do Cliente

| Funcionalidade | Descrição |
|---|---|
| 🏠 **Início** | Hero, busca por texto, 8 categorias (Pizza, Hambúrguer, Japonês, etc.), lista de lojas com foto, nota, tempo e taxa de entrega |
| 🏪 **Página da Loja** | Capa, logo, descrição, stats (nota, tempo, taxa, pedido mínimo), **mapa OpenStreetMap** da localização, cardápio por seções |
| 🍽️ **Modal de Item** | Foto, descrição, preço, campo de observações, seletor de quantidade |
| 🛒 **Carrinho** | Itens de uma loja por vez (bloqueio multi-loja), quantidades +/-, subtotal + taxa de entrega, validação de pedido mínimo |
| 💳 **Checkout** | Dados do cliente, endereço com **CEP via ViaCEP** (preenche rua/bairro/cidade), **mapa de entrega** em tempo real, 3 formas de pagamento |
| 📦 **Meus Pedidos** | Histórico com status, dados da loja, itens, endereço, forma de pagamento, **status em tempo real via SSE** |
| 🔐 **Auth** | Cadastro e login por email/senha com validação Zod |

### Formas de Pagamento (sem cobrança automática)

| Método | Comportamento |
|---|---|
| **Pix** | Mostra a chave Pix da loja com botão "Copiar" |
| **Cartão** | Abre o link de pagamento externo cadastrado (Mercado Pago, Stripe, etc.) |
| **Na entrega** | Dinheiro ou cartão na porta, com campo de troco |

### 🏪 Área do Dono

| Funcionalidade | Descrição |
|---|---|
| 📊 **Dashboard** | Banner de período de teste (30 dias), checklist de onboarding (9 passos), link público da loja, grid com 14 seções de configuração |
| 📦 **Painel de Pedidos (KDS)** | Pedidos em **tempo real via SSE** (sem poll), tabs Ativos/Entregues/Cancelados, workflow de status (Aguardando → Aceitar → Preparo → Saiu → Entregue) |
| 🍔 **Gerenciar Cardápio** | CRUD de seções e itens (nome, descrição, preço, foto, toggle disponível) |
| ⚙️ **14 Seções de Configuração** | Veja tabela abaixo |

#### Seções de Configuração Administrativa

| # | Seção | Funcionalidade |
|---|---|---|
| 1 | **Personalizar Loja** | Logo circular + até 4 banners com links (rotação automática) |
| 2 | **Informações da Loja** | Nome, telefone, WhatsApp, email, endereço completo, Instagram/TikTok/Facebook, link de compartilhamento |
| 3 | **Status da Loja** | Horário por dia (Seg-Dom) com toggle aberto/fechado + horários |
| 4 | **Configuração de Entrega** | 3 modalidades: Taxa Fixa / Base+KM / Por Áreas, entrega grátis acima de |
| 5 | **Entregadores** | CRUD completo (nome, telefone) |
| 6 | **Mensagens Automáticas** | 6 templates WhatsApp (Recebido/Aceito/Preparo/Saiu/Entregue/Cancelado) com variáveis {nome}/{numero}/{link} |
| 7 | **Impressora** | 3 modos (Navegador/PrintNode/QZ Tray), vias, largura, auto-print |
| 8 | **Pagamento Online** | Gateway Stripe/Mercado Pago + Pix/link manual |
| 9 | **Áreas da Cozinha** | CRUD de estações (Fritura, Chapa, Bar) com cores |
| 10 | **KDS da Cozinha** | Display dedicado para a cozinha |
| 11 | **Domínio Próprio** | Configuração de DNS + verificação |
| 12 | **Integrações** | 99Food (marketplace) + Gami (logística) |
| 13 | **Usuários e Permissões** | Membros + convites + roles (Dono/Gerente/Staff) |
| 14 | **Clientes** | Lista derivada de pedidos (nome, telefone, total gasto, nº pedidos) |
| 15 | **Relatórios** | KPIs, gráfico de tendência 7 dias, top 5 produtos, formas de pagamento |
| 16 | **Estoque** | Toggle disponível/indisponível por item |

---

## 🛠 Stack Tecnológico

| Camada | Tecnologia | Versão |
|---|---|---|
| **Framework** | Next.js (App Router, Turbopack) | 16.1.3 |
| **Linguagem** | TypeScript | 5.x |
| **Banco de Dados** | Prisma ORM + SQLite | 6.19 |
| **UI Components** | shadcn/ui (New York) + Radix UI | - |
| **Styling** | Tailwind CSS | 4.x |
| **Ícones** | Lucide React | 0.525 |
| **Animações** | Framer Motion | 12.x |
| **Estado** | Zustand (persist) | 5.x |
| **Validação** | Zod | 4.x |
| **Auth** | bcryptjs + jsonwebtoken (JWT em cookies httpOnly) | - |
| **Mapas** | Leaflet + OpenStreetMap tiles + Nominatim geocoding | 1.9 |
| **CEP** | ViaCEP API | - |
| **Tempo Real** | Server-Sent Events (SSE) + EventEmitter | - |
| **Runtime** | Bun | 1.3 |

---

## 🏗 Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    NAVEGADOR (CLIENTE)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Home    │  │  Store   │  │ Checkout │  │ Orders  │ │
│  │  View    │  │  View    │  │  View    │  │  View   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │              │              │              │      │
│  ┌────┴──────────────┴──────────────┴──────────────┴────┐│
│  │              Zustand Store (persist)                 ││
│  │  • useNav (view state)  • useCart (multi-loja)      ││
│  │  • useSession (auth)    • useRealtimeOrders (SSE)   ││
│  └───────────────────────┬─────────────────────────────┘│
│                          │                               │
│  ┌───────────────────────┴─────────────────────────────┐│
│  │              EventSource (SSE)                       ││
│  │  /api/realtime/stream?rooms=store:xxx,customer:yyy  ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                           │ HTTP
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  NEXT.JS (SERVER)                        │
│  ┌─────────────────────────────────────────────────────┐│
│  │              API Routes (18 endpoints)               ││
│  │  • Auth (signup/login/logout/me)                    ││
│  │  • Public (stores, geocode, cep)                    ││
│  │  • Orders (create, list, status)                    ││
│  │  • Owner (CRUD stores, menu, drivers, areas)        ││
│  │  • Realtime (SSE stream)                            ││
│  └───────────────────────┬─────────────────────────────┘│
│                          │                               │
│  ┌───────────────────────┴─────────────────────────────┐│
│  │              EventEmitter (global)                   ││
│  │  emitOrderEvent() → /api/realtime/stream            ││
│  └───────────────────────┬─────────────────────────────┘│
│                          │                               │
│  ┌───────────────────────┴─────────────────────────────┐│
│  │              Prisma Client                           ││
│  └───────────────────────┬─────────────────────────────┘│
└──────────────────────────┼──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              SQLite DATABASE                            │
│  Profile · UserRole · Store · MenuSection · MenuItem    │
│  Order · OrderItem · DeliveryDriver · KitchenArea       │
│  StoreMember                                             │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura do Projeto

```
brito/
├── prisma/
│   └── schema.prisma              # 10 modelos Prisma
├── scripts/
│   ├── seed.ts                    # Seed: 5 lojas, 47 itens, 6 perfis
│   └── create-admin.ts            # Cria conta admin master
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (lang=pt-BR)
│   │   ├── page.tsx               # Router state-based (26 views)
│   │   ├── globals.css            # Tema Brito (carvão/vermelho/dourado)
│   │   └── api/
│   │       ├── auth/              # signup, login, logout, me
│   │       ├── stores/            # lista, detalhe por slug
│   │       ├── cep/               # ViaCEP proxy
│   │       ├── geocode/           # Nominatim proxy
│   │       ├── orders/            # create, list (me/store), status
│   │       ├── realtime/          # SSE stream
│   │       └── my/stores/         # CRUD lojas, menu, drivers, areas
│   ├── components/
│   │   ├── site-header.tsx        # Header com auth + cart
│   │   ├── site-footer.tsx
│   │   ├── home-view.tsx          # Vitrine de lojas
│   │   ├── store-view.tsx         # Página da loja + mapa
│   │   ├── cart-view.tsx          # Carrinho (bloqueio multi-loja)
│   │   ├── checkout-view.tsx      # Checkout + ViaCEP + mapa + 3 pagamentos
│   │   ├── orders-view.tsx        # Meus pedidos (SSE)
│   │   ├── auth-view.tsx          # Login/cadastro
│   │   ├── dashboard-view.tsx     # Painel do dono (onboarding + 14 seções)
│   │   ├── create-store-view.tsx  # Criar nova loja
│   │   ├── owner-menu-view.tsx    # CRUD cardápio
│   │   ├── owner-orders-view.tsx  # KDS (tempo real)
│   │   ├── admin-views.tsx        # 16 seções admin
│   │   └── mini-map.tsx           # Componente Leaflet + useGeocode
│   ├── lib/
│   │   ├── auth.ts                # bcrypt + JWT + cookies
│   │   ├── db.ts                  # Prisma client singleton
│   │   ├── store.ts               # Zustand (nav + cart + session + formatBRL)
│   │   ├── events.ts              # EventEmitter global (realtime)
│   │   └── realtime.ts            # Hook useRealtimeOrders (SSE)
│   └── types/
│       └── leaflet.d.ts           # Types para Leaflet
├── mini-services/
│   └── order-realtime/            # (legado, substituído por SSE)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🗄 Modelo de Dados

```prisma
Profile          // Usuário (email, senha hash, nome, telefone)
  ├── UserRole   // Roles: CUSTOMER | OWNER | ADMIN
  ├── Store[]    // Lojas que possui
  ├── Order[]    // Pedidos que fez
  └── StoreMember[] // Membros de lojas (permissões)

Store             // Loja (40+ campos)
  ├── logo, cover, banners (JSON)
  ├── endereço completo + redes sociais
  ├── businessHours (JSON por dia)
  ├── deliveryConfig (3 modalidades)
  ├── paymentConfig (Pix, link, gateway)
  ├── printerConfig (modo, vias, largura)
  ├── autoMessages (JSON templates WhatsApp)
  ├── customDomain + trialEndsAt
  ├── MenuSection[] → MenuItem[]
  ├── DeliveryDriver[]
  ├── KitchenArea[]
  ├── StoreMember[]
  └── Order[] → OrderItem[]
```

### Roles e Permissões

| Role | Acesso |
|---|---|
| **CUSTOMER** | Navegar lojas, fazer pedidos, ver próprios pedidos |
| **OWNER** | Tudo de CUSTOMER + gerenciar próprias lojas |
| **ADMIN** | Tudo de OWNER + gerenciar TODAS as lojas do sistema |

---

## 🔌 APIs

### Autenticação

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/auth/signup` | Criar conta (nome, email, senha) |
| POST | `/api/auth/login` | Login (retorna profile + roles) |
| POST | `/api/auth/logout` | Logout (limpa cookie) |
| GET | `/api/auth/me` | Profile atual logado |

### Públicas

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/stores?q=&category=` | Lista lojas com busca e filtro |
| GET | `/api/stores/[slug]` | Detalhe da loja + cardápio completo |
| GET | `/api/cep?cep=` | Consulta ViaCEP |
| GET | `/api/geocode?q=` | Geocoding via Nominatim (OpenStreetMap) |

### Pedidos

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/orders` | Criar pedido (valida itens, min order, calcula total) |
| GET | `/api/orders/me` | Pedidos do cliente logado |
| GET | `/api/orders/store?storeId=` | Pedidos de uma loja (dono ou ADMIN) |
| PATCH | `/api/orders/[id]/status` | Atualizar status (emite evento SSE) |

### Dono / Admin

| Método | Endpoint | Descrição |
|---|---|---|
| GET/POST | `/api/my/stores` | Listar / criar loja |
| GET/PATCH/DELETE | `/api/my/stores/[id]` | Detalhe / atualizar / desativar |
| GET/POST | `/api/my/stores/[id]/menu/sections` | CRUD seções |
| PATCH/DELETE | `/api/my/stores/[id]/menu/sections/[sectionId]` | Editar seção |
| POST | `/api/my/stores/[id]/menu/items` | Criar item |
| PATCH/DELETE | `/api/my/stores/[id]/menu/items/[itemId]` | Editar / excluir item |
| GET/POST | `/api/my/stores/[id]/drivers` | CRUD entregadores |
| DELETE | `/api/my/stores/[id]/drivers/[driverId]` | Excluir entregador |
| GET/POST | `/api/my/stores/[id]/kitchen-areas` | CRUD áreas de cozinha |
| DELETE | `/api/my/stores/[id]/kitchen-areas/[areaId]` | Excluir área |
| GET | `/api/my/stores/[id]/customers` | Clientes (agregado de pedidos) |
| GET | `/api/my/stores/[id]/reports` | Relatório (KPIs + gráficos) |

### Tempo Real

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/realtime/stream?rooms=` | SSE stream (Server-Sent Events) |

---

## ⚡ Tempo Real (SSE)

A aplicação usa **Server-Sent Events** para atualizações em tempo real, sem necessidade de WebSocket ou poll.

### Como funciona

1. **Cliente cria pedido** → API `POST /api/orders` → `emitOrderEvent()` no EventEmitter global
2. **Dono tem aba aberta** no painel de pedidos → hook `useRealtimeOrders(["store:xxx"])` mantém conexão SSE
3. **EventEmitter emite** → endpoint `/api/realtime/stream` recebe o evento → envia para todos os clientes conectados na room
4. **Cliente recebe** → atualiza UI instantaneamente + toast "Novo pedido!"

### Eventos

| Evento | Quem recebe | Quando |
|---|---|---|
| `order:new` | Dono da loja (room `store:xxx`) | Cliente cria pedido |
| `order:status` | Cliente (room `customer:xxx`) + Dono (room `store:xxx`) | Status do pedido muda |

### Rooms

- `store:[storeId]` — dono da loja recebe novos pedidos e mudanças de status
- `customer:[profileId]` — cliente recebe mudanças de status dos seus pedidos

---

## 🗺 Mapas

A aplicação usa **Leaflet** + **OpenStreetMap** (gratuito, sem API key necessária).

### Onde aparecem

1. **Página da loja** — mapa mostrando a localização do restaurante (geocodificada do endereço)
2. **Checkout** — mapa do endereço de entrega (atualiza quando o cliente digita o CEP)

### Geocoding

- API `/api/geocode?q=endereço` consulta **Nominatim** (OpenStreetMap)
- Hook `useGeocode` com debounce de 600ms
- Converte endereço textual → latitude/longitude

---

## 🔐 Autenticação e Permissões

### Implementação

- **Senhas**: bcryptjs (hash com salt de 10 rounds)
- **Sessão**: JWT assinado com `JWT_SECRET`, armazenado em cookie httpOnly
- **Duração**: 7 dias
- **Cookies**: `httpOnly: true`, `sameSite: "lax"`, `secure` em produção

### Roles

```typescript
// Como verificar permissões no servidor
const session = await requireAuth();        // qualquer usuário logado
const session = await requireOwner();       // OWNER ou ADMIN
const isAdmin = session.roles.includes("ADMIN"); // ADMIN master
```

### Redirect após login

- **OWNER ou ADMIN** → redireciona para o dashboard (painel do dono)
- **CUSTOMER** (apenas) → redireciona para a home (landing page)

---

## 👤 Contas Demo

| Tipo | Email | Senha | Acesso |
|---|---|---|---|
| **Admin Master** | `clodoaldo608@gmail.com` | `88677488` | Todas as lojas + todas as configurações |
| **Dono** | `marco@brito.demo` | `senha123` | Pizza Forneiro (própria loja) |
| **Cliente** | `cliente@brito.demo` | `senha123` | Fazer pedidos |

### Lojas de Demonstração (seed)

| Loja | Categoria | Itens | Taxa | Pedido Mín. |
|---|---|---|---|---|
| Pizza Forneiro | Pizza | 10 | R$ 7,90 | R$ 25 |
| Burger Vila | Hambúrguer | 10 | R$ 5,90 | R$ 20 |
| Sushi Tanaka | Japonês | 10 | R$ 9,90 | R$ 35 |
| Doceria Mel | Doces | 9 | R$ 4,90 | R$ 15 |
| Verde Saudável | Saudável | 8 | R$ 6,50 | R$ 22 |

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+ ou [Bun](https://bun.sh/) 1.0+
- Git

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/brito.git
cd brito

# 2. Instale as dependências
bun install
# ou: npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env e defina JWT_SECRET com uma string aleatória forte

# 4. Crie o banco de dados e rode as migrations
bun run db:push
# ou: npx prisma db push

# 5. (Opcional) Popule com dados de demonstração
bun run scripts/seed.ts

# 6. (Opcional) Crie a conta admin master
bun run scripts/create-admin.ts

# 7. Inicie o servidor de desenvolvimento
bun run dev
# ou: npm run dev
```

Acesse: `http://localhost:3000`

### Scripts disponíveis

| Script | Descrição |
|---|---|
| `bun run dev` | Inicia servidor de desenvolvimento (porta 3000) |
| `bun run build` | Build de produção |
| `bun run start` | Inicia servidor de produção |
| `bun run lint` | Verifica código com ESLint |
| `bun run db:push` | Sincroniza schema Prisma com o banco |
| `bun run db:generate` | Regenera Prisma Client |
| `bun run scripts/seed.ts` | Popula banco com dados demo |
| `bun run scripts/create-admin.ts` | Cria conta admin master |

---

## 🌐 Deploy

### Vercel (recomendado)

1. Faça push do código para o GitHub
2. Importe o repositório na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente:
   - `DATABASE_URL` — URL do banco (PostgreSQL recomendado para produção)
   - `JWT_SECRET` — string aleatória forte (use `openssl rand -base64 32`)
4. Deploy

### Produção com PostgreSQL

Para produção, recomenda-se migrar de SQLite para PostgreSQL:

1. Troque o provider no `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Configure `DATABASE_URL` com a URL do PostgreSQL
3. Rode `prisma db push` para criar as tabelas
4. Rode o seed

### Variáveis de Ambiente de Produção

```env
DATABASE_URL="postgresql://user:pass@host:5432/brito"
JWT_SECRET="sua-string-aleatoria-muito-longa"
NODE_ENV="production"
```

---

## 🗺 Roadmap

### ✅ Implementado

- [x] Marketplace multi-loja (5 lojas demo)
- [x] Auth com JWT + bcrypt (CUSTOMER / OWNER / ADMIN)
- [x] Cardápio por seções com CRUD completo
- [x] Carrinho com bloqueio multi-loja
- [x] Checkout com ViaCEP + 3 formas de pagamento
- [x] Tempo real via SSE (novos pedidos + mudanças de status)
- [x] Mapa OpenStreetMap (loja + entrega)
- [x] Painel admin com 16 seções de configuração
- [x] Dashboard com KPIs e gráficos
- [x] Lista de clientes (agregado de pedidos)
- [x] KDS (Kitchen Display System)
- [x] Admin master com acesso a todas as lojas

### 🔄 Próximos passos

- [ ] **Supabase** — migrar banco + auth + storage para imagens
- [ ] **Mercado Pago SDK** — cobrança real no lugar dos links manuais
- [ ] **Upload de imagens** — logo/banners via Supabase Storage (atualmente URLs)
- [ ] **WhatsApp API (Whapi)** — envio real das mensagens automáticas
- [ ] **PrintNode / QZ Tray** — impressão silenciosa real
- [ ] **99Food webhook** — receber pedidos de marketplace
- [ ] **Gami API** — solicitar motoboys terceirizados
- [ ] **Facebook Login** — auth social
- [ ] **Multi-idioma** — i18n com next-intl
- [ ] **PWA** — app instalável com notificações push
- [ ] **WebSockets em produção** — migrar SSE para Supabase Realtime (multi-instância)

---

## 📄 Licença

Este projeto é privado e proprietário. Todos os direitos reservados.

---

## 🤝 Contribuição

Este é um projeto privado. Para contribuir:

1. Crie uma branch: `git checkout -b feature/nova-feature`
2. Faça commit: `git commit -m 'feat: adiciona nova feature'`
3. Push: `git push origin feature/nova-feature`
4. Abra um Pull Request

---

<div align="center">
  <p>Feito com 🔥 por Clodoaldo</p>
  <p>© 2024 Brito. Todos os direitos reservados.</p>
</div>
