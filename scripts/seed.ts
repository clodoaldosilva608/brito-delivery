// scripts/seed.ts
// Seed demo data for Brito - multi-store food delivery platform
import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth";

async function main() {
  console.log("🌱 Seedando Brito - plataforma de delivery multi-loja...");

  // Cleanup
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.menuItem.deleteMany();
  await db.menuSection.deleteMany();
  await db.store.deleteMany();
  await db.userRole.deleteMany();
  await db.profile.deleteMany();

  // ====== PROFILES ======
  const ownerPwd = await hashPassword("senha123");
  const customerPwd = await hashPassword("senha123");

  // Donos de loja
  const owners = [];
  const ownerData = [
    { name: "Marco Aurélio", email: "marco@brito.demo" },
    { name: "Júlia Tanaka", email: "julia@brito.demo" },
    { name: "Pedro Silva", email: "pedro@brito.demo" },
    { name: "Ana Beatriz", email: "ana@brito.demo" },
    { name: "Carlos Mendes", email: "carlos@brito.demo" },
  ];
  for (const o of ownerData) {
    const profile = await db.profile.create({
      data: {
        name: o.name,
        email: o.email,
        phone: "+55 11 98888-0000",
        password: ownerPwd,
        roles: { create: { role: "OWNER" } },
      },
    });
    owners.push(profile);
  }

  // Cliente demo
  const customer = await db.profile.create({
    data: {
      name: "Cliente Demo",
      email: "cliente@brito.demo",
      phone: "+55 11 97777-1111",
      password: customerPwd,
      roles: { create: { role: "CUSTOMER" } },
    },
  });

  console.log(`✓ ${owners.length + 1} profiles criados (5 donos + 1 cliente)`);

  // ====== STORES ======
  const storesData = [
    {
      ownerId: owners[0].id,
      slug: "pizza-forneiro",
      name: "Pizza Forneiro",
      description: "Pizzas artesanais em forno a lenha, massa de fermentação natural de 48h. Ingredientes selecionados e bordas recheadas.",
      category: "pizza",
      logoUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80",
      coverUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80",
      address: "Rua das Oliveiras, 150 - Vila Madalena",
      cep: "05435-010",
      phone: "+55 11 3456-7890",
      openingHours: "Ter-Dom 18h-23h30",
      deliveryFee: 7.9,
      minOrder: 25,
      avgDeliveryMin: 45,
      rating: 4.8,
      pixKey: "marco@brito.demo",
      paymentLink: "https://mpago.la/demo-pizza-forneiro",
    },
    {
      ownerId: owners[1].id,
      slug: "burger-vila",
      name: "Burger Vila",
      description: "Hambúrgueres smash com blend exclusivo de carnes nobres, pão brioche assado na hora e molhos da casa.",
      category: "burger",
      logoUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&q=80",
      coverUrl: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=1200&q=80",
      address: "Av. Paulista, 2000 - Bela Vista",
      cep: "01310-100",
      phone: "+55 11 3456-1111",
      openingHours: "Seg-Dom 12h-23h",
      deliveryFee: 5.9,
      minOrder: 20,
      avgDeliveryMin: 30,
      rating: 4.7,
      pixKey: "julia@brito.demo",
      paymentLink: "https://mpago.la/demo-burger-vila",
    },
    {
      ownerId: owners[2].id,
      slug: "sushi-tanaka",
      name: "Sushi Tanaka",
      description: "Cozinha japonesa autêntica com peixes frescos importados. Combos, sashimis e temakis preparados na hora.",
      category: "japones",
      logoUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&q=80",
      coverUrl: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=1200&q=80",
      address: "Rua Liberdade, 500 - Liberdade",
      cep: "01502-000",
      phone: "+55 11 3456-2222",
      openingHours: "Seg-Sáb 11h30-22h",
      deliveryFee: 9.9,
      minOrder: 35,
      avgDeliveryMin: 50,
      rating: 4.9,
      pixKey: "pedro@brito.demo",
      paymentLink: "https://mpago.la/demo-sushi-tanaka",
    },
    {
      ownerId: owners[3].id,
      slug: "doceria-mel",
      name: "Doceria Mel",
      description: "Doces artesanais, bolos de pote, brigadeiros gourmet e sobremesas sem glúten. Feito com manteiga real e chocolate belga.",
      category: "doces",
      logoUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&q=80",
      coverUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200&q=80",
      address: "Rua dos Pinheiros, 800 - Pinheiros",
      cep: "05422-000",
      phone: "+55 11 3456-3333",
      openingHours: "Ter-Sáb 10h-20h",
      deliveryFee: 4.9,
      minOrder: 15,
      avgDeliveryMin: 25,
      rating: 4.6,
      pixKey: "ana@brito.demo",
      paymentLink: "https://mpago.la/demo-doceria-mel",
    },
    {
      ownerId: owners[4].id,
      slug: "verde-saudavel",
      name: "Verde Saudável",
      description: "Bowls, saladas montadas, sucos naturais e marmitas fitness. Ingredientes orgânicos e contagem calórica em cada prato.",
      category: "saudavel",
      logoUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80",
      coverUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80",
      address: "Rua Haddock Lobo, 300 - Cerqueira César",
      cep: "01414-000",
      phone: "+55 11 3456-4444",
      openingHours: "Seg-Sex 8h-19h, Sáb 9h-16h",
      deliveryFee: 6.5,
      minOrder: 22,
      avgDeliveryMin: 35,
      rating: 4.7,
      pixKey: "carlos@brito.demo",
      paymentLink: "https://mpago.la/demo-verde-saudavel",
    },
  ];

  const stores = [];
  for (const s of storesData) {
    const store = await db.store.create({ data: s });
    stores.push(store);
  }
  console.log(`✓ ${stores.length} lojas criadas`);

  // ====== MENU: helper ======
  type SectionInput = { name: string; items: any[] };

  async function createMenu(storeId: string, sections: SectionInput[]) {
    for (let si = 0; si < sections.length; si++) {
      const sec = sections[si];
      const section = await db.menuSection.create({
        data: { storeId, name: sec.name, position: si },
      });
      for (let ii = 0; ii < sec.items.length; ii++) {
        const it = sec.items[ii];
        await db.menuItem.create({
          data: {
            sectionId: section.id,
            storeId,
            name: it.name,
            description: it.description,
            price: it.price,
            imageUrl: it.imageUrl,
            isAvailable: it.isAvailable ?? true,
            position: ii,
          },
        });
      }
    }
  }

  // ====== Pizza Forneiro ======
  await createMenu(stores[0].id, [
    {
      name: "Pizzas Salgadas",
      items: [
        { name: "Margherita", description: "Molho de tomate San Marzano, mussarela de búfala, manjericão fresco e azeite extra virgem.", price: 42.9, imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80" },
        { name: "Calabresa Artesanal", description: "Calabresa defumada fatiada, cebola roxa, mussarela e orégano.", price: 45.9, imageUrl: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&q=80" },
        { name: "Quatro Queijos", description: "Mussarela, gorgonzola, parmesão e provolone com toque de noz-moscada.", price: 49.9, imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80" },
        { name: "Portuguesa Premium", description: "Presunto, ovos, cebola, ervilha, azeitona preta e mussarela.", price: 47.9, imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80" },
        { name: "Frango com Catupiry", description: "Frango desfiado temperado, catupiry original, cebola e milho.", price: 46.9, imageUrl: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=600&q=80" },
      ],
    },
    {
      name: "Pizzas Doces",
      items: [
        { name: "Chocolate com Morango", description: "Chocolate ao leite derretido, morangos frescos e leite condensado.", price: 39.9, imageUrl: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&q=80" },
        { name: "Brigadeiro Gourmet", description: "Brigadeiro belga 70%, granulado belga e leite condensado.", price: 38.9, imageUrl: "https://images.unsplash.com/photo-1559054663-e8d23213f55c?w=600&q=80" },
      ],
    },
    {
      name: "Bebidas",
      items: [
        { name: "Coca-Cola 2L", description: "Refrigerante gelado.", price: 12.9 },
        { name: "Suco Natural de Laranja 500ml", description: "Laranja espremida na hora.", price: 9.9 },
        { name: "Água com Gás 500ml", description: "Água mineral com gás.", price: 4.9 },
      ],
    },
  ]);

  // ====== Burger Vila ======
  await createMenu(stores[1].id, [
    {
      name: "Smash Burgers",
      items: [
        { name: "Smash Clássico", description: "Blend 120g smash, cheddar duplo, picles, cebola caramelizada e molho da casa no pão brioche.", price: 28.9, imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80" },
        { name: "Smash Bacon", description: "Blend 120g, cheddar, bacon crocante, cebola roxa e maionese defumada.", price: 32.9, imageUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80" },
        { name: "Smash Duplo", description: "Dois blends 120g, cheddar triplo, picles e molho da casa.", price: 38.9, imageUrl: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&q=80" },
        { name: "Smash Vegano", description: "Hambúrguer de grão-de-bico, queijo vegano, rúcula e maionese de ervas.", price: 30.9, imageUrl: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600&q=80" },
      ],
    },
    {
      name: "Acompanhamentos",
      items: [
        { name: "Batata Frita Rústica", description: "Batatas com casca, alecrim e parmesão. Serve 1 pessoa.", price: 16.9, imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80" },
        { name: "Onion Rings", description: "Anéis de cebola empanados com molho barbecue. 8 unidades.", price: 18.9, imageUrl: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&q=80" },
        { name: "Nuggets de Frango", description: "10 nuggets crocantes com molho de sua escolha.", price: 17.9 },
      ],
    },
    {
      name: "Bebidas",
      items: [
        { name: "Milkshake Ovomaltine", description: "500ml com calda e crocante de ovomaltine.", price: 19.9, imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80" },
        { name: "Coca-Cola Lata 350ml", description: "Gelada.", price: 6.9 },
        { name: "Cerveja Artesanal IPA 350ml", description: "IPA local, 6% álcool.", price: 14.9 },
      ],
    },
  ]);

  // ====== Sushi Tanaka ======
  await createMenu(stores[2].id, [
    {
      name: "Combos",
      items: [
        { name: "Combo Tanaka 30 peças", description: "10 nigiris, 12 sashimis, 8 hosomakis variados. Serve 2 pessoas.", price: 89.9, imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80" },
        { name: "Combo Individual 18 peças", description: "6 nigiris, 6 sashimis, 6 hosomakis.", price: 54.9, imageUrl: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&q=80" },
        { name: "Combo Familia 50 peças", description: "Serve 4 pessoas. Variados.", price: 139.9, imageUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80" },
      ],
    },
    {
      name: "Sashimis",
      items: [
        { name: "Sashimi Salmão 10 peças", description: "Fatias frescas de salmão importado.", price: 39.9, imageUrl: "https://images.unsplash.com/photo-1607301405390-d831c242f59b?w=600&q=80" },
        { name: "Sashimi Atum 8 peças", description: "Atum fresco fatiado.", price: 34.9 },
        { name: "Sashimi Mix 12 peças", description: "Salmão, atum e branco.", price: 44.9 },
      ],
    },
    {
      name: "Temakis",
      items: [
        { name: "Temaki Salmão", description: "Cone de algas com salmão, cream cheese e arroz.", price: 22.9, imageUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80" },
        { name: "Temaki Camarão", description: "Camarão tempurá, cream cheese e molho tarê.", price: 24.9 },
      ],
    },
    {
      name: "Bebidas",
      items: [
        { name: "Sake Quente 180ml", description: "Sake tradicional servido quente.", price: 18.9 },
        { name: "Chá Verde Gelado 400ml", description: "Chá verde japonês com gelo.", price: 8.9 },
        { name: "Água Mineral 500ml", description: "Sem gás.", price: 4.5 },
      ],
    },
  ]);

  // ====== Doceria Mel ======
  await createMenu(stores[3].id, [
    {
      name: "Bolos de Pote",
      items: [
        { name: "Bolo de Pote Brigadeiro", description: "Massa de chocolate com brigadeiro belga e granulado. 200ml.", price: 14.9, imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80" },
        { name: "Bolo de Pote Doce de Leite", description: "Massa branca com doce de leite argentino. 200ml.", price: 14.9 },
        { name: "Bolo de Pote Maracujá", description: "Massa branca com cream cheese e coulis de maracujá. 200ml.", price: 15.9 },
      ],
    },
    {
      name: "Brigadeiros Gourmet",
      items: [
        { name: "Brigadeiro Belga (6un)", description: "Chocolate belga 70% com granulado importado.", price: 19.9, imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80" },
        { name: "Brigadeiro Pistache (6un)", description: "Brigadeiro branco com pistache triturado.", price: 24.9 },
        { name: "Brigadeiro Morango (6un)", description: "Brigadeiro branco com liofilizado de morango.", price: 22.9 },
      ],
    },
    {
      name: "Sobremesas",
      items: [
        { name: "Petit Gateau", description: "Bolo de chocolate quente com sorvete de creme.", price: 18.9, imageUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80" },
        { name: "Cheesecake de Frutas Vermelhas", description: "Cheesecake cremoso com calda de frutas vermelhas.", price: 16.9, imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80" },
      ],
    },
  ]);

  // ====== Verde Saudável ======
  await createMenu(stores[4].id, [
    {
      name: "Bowls",
      items: [
        { name: "Bowl Poke Salmão", description: "Base de arroz integral, salmão grelhado, edamame, abacate, manga, gergelim e molho tarê. 450g.", price: 34.9, imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80" },
        { name: "Bowl Vegano", description: "Base de quinoa, grão-de-bico, abacate, beterraba, cenoura e molho de tahine. 450g.", price: 29.9, imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80" },
        { name: "Bowl Frango", description: "Base de arroz integral, frango grelhado, brócolis, cenoura e molho de iogurte. 450g.", price: 32.9, imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80" },
      ],
    },
    {
      name: "Saladas Montadas",
      items: [
        { name: "Salada Caesar Fitness", description: "Alface, frango grelhado, croutons integrais e molho caesar light. 350g.", price: 26.9, imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80" },
        { name: "Salada Mediterrânea", description: "Rúcula, tomate seco, queijo feta, azeitonas e azeite. 350g.", price: 28.9 },
      ],
    },
    {
      name: "Sucos e Vitaminas",
      items: [
        { name: "Suco Verde Detox 400ml", description: "Couve, maçã, gengibre, limão e hortelã.", price: 12.9, imageUrl: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&q=80" },
        { name: "Vitamina de Banana 400ml", description: "Banana, leite, aveia e mel.", price: 11.9 },
        { name: "Suco de Laranja 400ml", description: "Laranja espremida na hora.", price: 9.9 },
      ],
    },
  ]);

  const totalItems = await db.menuItem.count();
  console.log(`✓ ${totalItems} itens de cardápio criados`);

  // ====== PEDIDOS DEMO ======
  const now = Date.now();
  const statuses = ["PENDING", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "DELIVERED", "DELIVERED"];
  const paymentMethods = ["PIX", "CARD", "ON_DELIVERY"];
  let orderNumber = 1000;

  for (let dayOffset = 4; dayOffset >= 0; dayOffset--) {
    const ordersCount = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < ordersCount; i++) {
      const store = stores[Math.floor(Math.random() * stores.length)];
      const items = await db.menuItem.findMany({ where: { storeId: store.id }, take: 10 });
      if (items.length === 0) continue;
      const itemsCount = 1 + Math.floor(Math.random() * 3);
      let subtotal = 0;
      const orderItems: any[] = [];
      for (let j = 0; j < itemsCount; j++) {
        const it = items[Math.floor(Math.random() * items.length)];
        const qty = 1 + Math.floor(Math.random() * 2);
        orderItems.push({
          itemId: it.id,
          name: it.name,
          unitPrice: it.price,
          quantity: qty,
        });
        subtotal += it.price * qty;
      }
      const total = subtotal + store.deliveryFee;
      const hoursAgo = dayOffset * 24 + Math.floor(Math.random() * 20) + 2;
      const createdAt = new Date(now - hoursAgo * 60 * 60 * 1000);
      const status = dayOffset === 0
        ? statuses[Math.floor(Math.random() * statuses.length)]
        : "DELIVERED";
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      orderNumber++;
      await db.order.create({
        data: {
          storeId: store.id,
          customerId: customer.id,
          orderNumber,
          status,
          customerName: customer.name,
          customerPhone: customer.phone || "",
          cep: "01310-100",
          street: "Av. Paulista",
          number: "1000",
          complement: "Apto 42",
          neighborhood: "Bela Vista",
          city: "São Paulo",
          paymentMethod,
          paymentDetail: paymentMethod === "ON_DELIVERY" ? "Dinheiro, troco para R$ 100" : null,
          subtotal,
          deliveryFee: store.deliveryFee,
          total,
          createdAt,
          items: { create: orderItems },
        },
      });
    }
  }
  console.log(`✓ ~${orderNumber - 1000} pedidos demo criados`);

  console.log("\n🎉 Seed concluído!");
  console.log("Login cliente: cliente@brito.demo / senha123");
  console.log("Login dono: marco@brito.demo / senha123");
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
