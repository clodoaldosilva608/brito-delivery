// scripts/seed.ts
// Seed demo data for Cluvi platform - Portuguese version
import { db } from "../src/lib/db";

async function main() {
  console.log("🌱 Seedando dados de demo Cluvi (PT-BR)...");

  await db.contactMessage.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.reservation.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.table.deleteMany();
  await db.restaurant.deleteMany();

  const restaurant = await db.restaurant.create({
    data: {
      name: "A Varanda do Chef",
      slug: "a-varanda-do-chef",
      description:
        "Cozinha de autor com ingredientes locais. Um lugar onde a tradição encontra a inovação gastronômica.",
      primaryColor: "#E85D2C",
      address: "Rua das Flores, 123 - Jardim Botânico, Curitiba",
      phone: "+55 41 3044 2616",
      email: "ola@avarandadochef.com",
      currency: "BRL",
    },
  });

  console.log("✓ Restaurante criado:", restaurant.name);

  const categoriesData = [
    { name: "Entradas", slug: "entradas", icon: "🥗", position: 0 },
    { name: "Sopas", slug: "sopas", icon: "🍲", position: 1 },
    { name: "Pratos Principais", slug: "principais", icon: "🍽️", position: 2 },
    { name: "Hambúrgueres", slug: "hamburgueres", icon: "🍔", position: 3 },
    { name: "Massas", slug: "massas", icon: "🍝", position: 4 },
    { name: "Sobremesas", slug: "sobremesas", icon: "🍰", position: 5 },
    { name: "Bebidas", slug: "bebidas", icon: "🥤", position: 6 },
    { name: "Café e Chá", slug: "cafe", icon: "☕", position: 7 },
    { name: "Drinks", slug: "drinks", icon: "🍸", position: 8 },
  ];

  const categories = [];
  for (const c of categoriesData) {
    const cat = await db.category.create({
      data: { ...c, restaurantId: restaurant.id },
    });
    categories.push(cat);
  }
  console.log(`✓ ${categories.length} categorias criadas`);

  const cat = (slug: string) => categories.find((c) => c.slug === slug)!;

  const productsData: any[] = [
    // Entradas
    { name: "Ceviche de Manga", description: "Manga verde marinada em limão, coentro e pimenta, acompanhada de chips de banana-da-terra.", price: 28, category: "entradas", isVegan: true, isFeatured: true, prepTimeMin: 10 },
    { name: "Tostones com Guacamole", description: "Tostones crocantes com guacamole caseiro e pico de gallo.", price: 22, category: "entradas", isVegan: true, prepTimeMin: 12 },
    { name: "Bolo de Milho com Queijo", description: "Bolo de milho cremoso com queijo da serra derretido.", price: 18, category: "entradas", prepTimeMin: 10 },
    { name: "Croquetas de Presunto", description: "Croquetas crocantes e cremosas de presunto ibérico (6 unidades).", price: 25, category: "entradas", prepTimeMin: 15 },
    { name: "Tábola de Queijos", description: "Seleção de queijos artesanais, frutas da estação e geleia de pimentão.", price: 42, category: "entradas", isFeatured: true, prepTimeMin: 8 },

    // Sopas
    { name: "Sopa de Feijão Preto", description: "Tradicional sopa de feijão preto com linguiça defumada, arroz e couve.", price: 32, category: "sopas", prepTimeMin: 20 },
    { name: "Caldo de Mocotó", description: "Caldo substancioso de mocotó com legumes, hortelã e vinagrete.", price: 36, category: "sopas", prepTimeMin: 25 },
    { name: "Creme de Abóbora", description: "Cremosa sopa de abóbora com toque de gengibre e croutons.", price: 24, category: "sopas", isVegan: true, prepTimeMin: 12 },
    { name: "Borscht", description: "Sopa de beterraba no estilo leste-europeu com creme azedo.", price: 28, category: "sopas", prepTimeMin: 15 },

    // Pratos Principais
    { name: "Feijoada Completa", description: "O clássico: feijão preto, carnes defumadas, arroz, couve, farofa, laranja e torresmo.", price: 48, category: "principais", isFeatured: true, prepTimeMin: 25 },
    { name: "Frango Grelhado", description: "Filé de frango marinado com ervas, guarnição de batatas rústicas e salada fresca.", price: 38, category: "principais", prepTimeMin: 20 },
    { name: "Salmão na Parrilla", description: "Filé de salmão com molho de maracujá, quinoa e legumes salteados.", price: 62, category: "principais", isFeatured: true, prepTimeMin: 22 },
    { name: "Ancho ao Vinho", description: "Bife ancho em redução de vinho tinto, purê de batata trufado e aspargos.", price: 72, category: "principais", prepTimeMin: 30 },
    { name: "Risoto de Cogumelos", description: "Risoto cremoso com mix de cogumelos, parmesão e azeite de trufa.", price: 44, category: "principais", prepTimeMin: 22 },
    { name: "Costela BBQ", description: "Costela de porco glaceada com BBQ de café, batatas baby e cebolas confitadas.", price: 56, category: "principais", prepTimeMin: 28 },

    // Hambúrgueres
    { name: "Duplo Vício", description: "Duplo blend de 150g, cheddar, bacon, cebola caramelizada, molho da casa.", price: 42, category: "hamburgueres", isFeatured: true, prepTimeMin: 18 },
    { name: "Burger de Frango Crocante", description: "Filé de frango empanado, alface, tomate, maionese de chipotle.", price: 34, category: "hamburgueres", isSpicy: true, prepTimeMin: 16 },
    { name: "Burger Vegano", description: "Hambúrguer de lentilha e beterraba, abacate, rúcula e molho de iogurte vegano.", price: 38, category: "hamburgueres", isVegan: true, prepTimeMin: 18 },
    { name: "Burger Cluvi Especial", description: "Blend 200g, queijo brie, presunto cru, ovo de codorna, pão brioche.", price: 48, category: "hamburgueres", isFeatured: true, prepTimeMin: 20 },

    // Massas
    { name: "Spaghetti Carbonara", description: "Massa com bacon, gema de ovo, queijo pecorino e pimenta-do-reino.", price: 39, category: "massas", prepTimeMin: 18 },
    { name: "Lasanha à Bolonhesa", description: "Camadas de massa com ragu de carne, bechamel e parmesão gratinado.", price: 42, category: "massas", prepTimeMin: 25 },
    { name: "Fettuccine Alfredo", description: "Fettuccine em molho cremoso de parmesão e manteiga.", price: 36, category: "massas", prepTimeMin: 16 },
    { name: "Ravioli de Espinafre", description: "Raviólis recheados com espinafre e ricota em molho de tomate fresco.", price: 41, category: "massas", prepTimeMin: 18 },

    // Sobremesas
    { name: "Pudim de Leite", description: "Pudim clássico de leite condensado com calda de caramelo.", price: 18, category: "sobremesas", isFeatured: true, prepTimeMin: 5 },
    { name: "Petit Gateau", description: "Bolo de chocolate quente com sorvete de creme e calda de frutas vermelhas.", price: 22, category: "sobremesas", prepTimeMin: 8 },
    { name: "Tiramisù", description: "Clássico italiano com café espresso, mascarpone e cacau.", price: 20, category: "sobremesas", prepTimeMin: 5 },
    { name: "Brigadeiro Gourmet", description: "Brigadeiro belga com chocolate 70% e flor de sal (3 unidades).", price: 16, category: "sobremesas", prepTimeMin: 5 },
    { name: "Cheesecake de Maracujá", description: "Torta de queijo com coulis de maracujá.", price: 21, category: "sobremesas", prepTimeMin: 5 },

    // Bebidas
    { name: "Limondade de Coco", description: "Refrescante limonada com creme de coco e gelo batido.", price: 14, category: "bebidas", isFeatured: true, prepTimeMin: 5 },
    { name: "Limonada com Hortelã", description: "Limonada natural com hortelã fresca.", price: 11, category: "bebidas", isVegan: true, prepTimeMin: 4 },
    { name: "Suco de Maracujá", description: "Suco natural de maracujá com água ou leite.", price: 12, category: "bebidas", isVegan: true, prepTimeMin: 4 },
    { name: "Água Tônica Premium", description: "Água tônica com limão e pepino.", price: 10, category: "bebidas", prepTimeMin: 2 },
    { name: "Refrigerante 350ml", description: "Coca-Cola, Guaraná ou Fanta.", price: 8, category: "bebidas", prepTimeMin: 2 },

    // Café e Chá
    { name: "Espresso", description: "Café espresso simples, grãos de origem Cerrado Mineiro.", price: 7, category: "cafe", prepTimeMin: 3 },
    { name: "Capuccino", description: "Espresso com leite vaporizado e espuma cremosa.", price: 11, category: "cafe", prepTimeMin: 4 },
    { name: "Latte de Baunilha", description: "Latte com xarope de baunilha e arte no leite.", price: 13, category: "cafe", prepTimeMin: 5 },
    { name: "Chá Gelado de Frutas Vermelhas", description: "Chá preto com frutas vermelhas e hortelã.", price: 11, category: "cafe", isVegan: true, prepTimeMin: 4 },
    { name: "Chocolate Quente", description: "Chocolate espesso com marshmallows e canela.", price: 12, category: "cafe", prepTimeMin: 5 },

    // Drinks
    { name: "Caipirinha", description: "Cachaça artesanal, limão, açúcar e gelo. O clássico brasileiro.", price: 22, category: "drinks", isFeatured: true, prepTimeMin: 5 },
    { name: "Mojito Cubano", description: "Rum branco, hortelã, limão, açúcar e soda.", price: 26, category: "drinks", prepTimeMin: 5 },
    { name: "Margarita Clássica", description: "Tequila, triple sec, suco de limão e sal.", price: 28, category: "drinks", prepTimeMin: 5 },
    { name: "Aperol Spritz", description: "Aperol, prosecco e soda com laranja.", price: 32, category: "drinks", prepTimeMin: 4 },
    { name: "Negroni", description: "Gin, vermute tinto e Campari com laranja.", price: 34, category: "drinks", prepTimeMin: 4 },
  ];

  for (let i = 0; i < productsData.length; i++) {
    const p = productsData[i];
    await db.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        isFeatured: p.isFeatured ?? false,
        isVegan: p.isVegan ?? false,
        isSpicy: p.isSpicy ?? false,
        prepTimeMin: p.prepTimeMin ?? 15,
        position: i,
        restaurantId: restaurant.id,
        categoryId: cat(p.category).id,
      },
    });
  }
  console.log(`✓ ${productsData.length} produtos criados`);

  const tablesData = [
    { code: "M1", seats: 2, area: "Salão" },
    { code: "M2", seats: 4, area: "Salão" },
    { code: "M3", seats: 4, area: "Salão" },
    { code: "M4", seats: 6, area: "Salão" },
    { code: "T1", seats: 2, area: "Terraço" },
    { code: "T2", seats: 4, area: "Terraço" },
    { code: "T3", seats: 8, area: "Terraço" },
    { code: "B1", seats: 2, area: "Balcão" },
    { code: "B2", seats: 2, area: "Balcão" },
    { code: "B3", seats: 2, area: "Balcão" },
  ];

  for (const t of tablesData) {
    const qrToken = `${restaurant.slug}-${t.code.toLowerCase()}-${Math.random().toString(36).slice(2, 8)}`;
    await db.table.create({
      data: { ...t, qrToken, restaurantId: restaurant.id },
    });
  }
  console.log(`✓ ${tablesData.length} mesas criadas`);

  // Pedidos demo dos últimos 7 dias
  const tables = await db.table.findMany({ where: { restaurantId: restaurant.id } });
  const products = await db.product.findMany({ where: { restaurantId: restaurant.id } });

  const statuses = ["PENDING", "PREPARING", "READY", "DELIVERED", "DELIVERED", "DELIVERED"];
  const channels = ["QR", "QR", "QR", "DELIVERY", "TAKEOUT"];
  const now = Date.now();

  let orderNumber = 1000;
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const ordersCount = 8 + Math.floor(Math.random() * 14);
    for (let i = 0; i < ordersCount; i++) {
      const itemsCount = 1 + Math.floor(Math.random() * 4);
      const items: any[] = [];
      let subtotal = 0;
      for (let j = 0; j < itemsCount; j++) {
        const p = products[Math.floor(Math.random() * products.length)];
        const qty = 1 + Math.floor(Math.random() * 2);
        items.push({
          productId: p.id,
          name: p.name,
          unitPrice: p.price,
          quantity: qty,
        });
        subtotal += p.price * qty;
      }
      const tip = Math.random() > 0.5 ? Math.round(subtotal * 0.1) : 0;
      const total = subtotal + tip;
      const table = Math.random() > 0.3 ? tables[Math.floor(Math.random() * tables.length)] : null;
      const hoursAgo = dayOffset * 24 + Math.floor(Math.random() * 12) + 8;
      const createdAt = new Date(now - hoursAgo * 60 * 60 * 1000);

      orderNumber++;
      await db.order.create({
        data: {
          restaurantId: restaurant.id,
          tableId: table?.id ?? null,
          orderNumber,
          status: dayOffset === 0 ? statuses[Math.floor(Math.random() * statuses.length)] : "DELIVERED",
          channel: channels[Math.floor(Math.random() * channels.length)],
          customerName: ["Carlos", "Maria", "André", "Laura", "João", "Sofia", "Pedro", "Daniela"][Math.floor(Math.random() * 8)],
          subtotal,
          tip,
          total,
          createdAt,
          items: { create: items },
        },
      });
    }
  }
  console.log(`✓ ~${orderNumber - 1000} pedidos demo criados`);

  // Reservas
  const customers = [
    { name: "Camila Restrepo", phone: "+55 41 9555-1212", email: "camila@exemplo.com", size: 2, occasion: "Encontro romântico" },
    { name: "André Gomes", phone: "+55 41 9444-2323", email: "andre@exemplo.com", size: 4, occasion: "Jantar em família" },
    { name: "Laura Jimenez", phone: "+55 41 9333-3434", email: "laura@exemplo.com", size: 6, occasion: "Aniversário" },
    { name: "Sebastião Ortiz", phone: "+55 41 9222-4545", email: "sebas@exemplo.com", size: 2 },
    { name: "Valentina Ruiz", phone: "+55 41 9111-5656", email: "valen@exemplo.com", size: 3 },
    { name: "Felipe Cardoso", phone: "+55 41 9999-6767", email: "felipe@exemplo.com", size: 8, occasion: "Jantar de negócios" },
    { name: "Mariana Lopes", phone: "+55 41 9888-7878", email: "mari@exemplo.com", size: 4 },
    { name: "Santiago Vera", phone: "+55 41 9777-8989", email: "santi@exemplo.com", size: 2, occasion: "Aniversário de namoro" },
  ];

  const times = ["12:30", "13:00", "13:30", "14:00", "19:00", "19:30", "20:00", "20:30", "21:00"];
  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const date = new Date(now + dayOffset * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().slice(0, 10);
    const count = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const c = customers[Math.floor(Math.random() * customers.length)];
      await db.reservation.create({
        data: {
          restaurantId: restaurant.id,
          customerName: c.name,
          phone: c.phone,
          email: c.email,
          partySize: c.size,
          date: dateStr,
          time: times[Math.floor(Math.random() * times.length)],
          occasion: c.occasion ?? null,
          status: dayOffset === 0 && Math.random() > 0.5 ? "SEATED" : "CONFIRMED",
        },
      });
    }
  }
  console.log("✓ Reservas criadas");

  console.log("\n🎉 Seed concluído!");
  console.log(`Restaurante: ${restaurant.name} (slug: ${restaurant.slug})`);
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
