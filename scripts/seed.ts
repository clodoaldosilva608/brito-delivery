// scripts/seed.ts
// Seed demo data for Cluvi platform
import { db } from "../src/lib/db";

async function main() {
  console.log("🌱 Seeding Cluvi demo data...");

  // Cleanup
  await db.contactMessage.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.reservation.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.table.deleteMany();
  await db.restaurant.deleteMany();

  // Create demo restaurant
  const restaurant = await db.restaurant.create({
    data: {
      name: "El Balcón del Chef",
      slug: "el-balcon-del-chef",
      description:
        "Cocina de autor con ingredientes locales. Un lugar donde la tradición se encuentra con la innovación gastronómica.",
      primaryColor: "#E85D2C",
      address: "Calle 10 # 43-21, El Poblado, Medellín",
      phone: "+57 304 442 6160",
      email: "hola@elbalcondelchef.com",
      currency: "COP",
    },
  });

  console.log("✓ Restaurant created:", restaurant.name);

  // Categories
  const categoriesData = [
    { name: "Entradas", slug: "entradas", icon: "🥗", position: 0 },
    { name: "Sopas", slug: "sopas", icon: "🍲", position: 1 },
    { name: "Platos Principales", slug: "principales", icon: "🍽️", position: 2 },
    { name: "Hamburguesas", slug: "hamburguesas", icon: "🍔", position: 3 },
    { name: "Pasta", slug: "pasta", icon: "🍝", position: 4 },
    { name: "Postres", slug: "postres", icon: "🍰", position: 5 },
    { name: "Bebidas", slug: "bebidas", icon: "🥤", position: 6 },
    { name: "Café y Té", slug: "cafe", icon: "☕", position: 7 },
    { name: "Cocteles", slug: "cocteles", icon: "🍸", position: 8 },
  ];

  const categories = [];
  for (const c of categoriesData) {
    const cat = await db.category.create({
      data: { ...c, restaurantId: restaurant.id },
    });
    categories.push(cat);
  }
  console.log(`✓ ${categories.length} categories created`);

  const cat = (slug: string) => categories.find((c) => c.slug === slug)!;

  const productsData = [
    // Entradas
    { name: "Ceviche de Mango", description: "Mango verde marinado en limón, cilantro y ají, acompañado de chips de plátano.", price: 18500, category: "entradas", isVegan: true, isFeatured: true, prepTimeMin: 10, imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600" },
    { name: "Tostones con Guacamole", description: "Tostones crujientes con guacamole casero y pico de gallo.", price: 14000, category: "entradas", isVegan: true, prepTimeMin: 12 },
    { name: "Arepa de Choclo", description: "Arepa dulce de maíz con queso campesino derretido.", price: 12000, category: "entradas", prepTimeMin: 10 },
    { name: "Croquetas de Jamón", description: "Crocantes croquetas cremosas de jamón ibérico (6 unidades).", price: 16500, category: "entradas", prepTimeMin: 15 },
    { name: "Tabla de Quesos", description: "Selección de quesos artesanales, frutas de temporada y mermelada de pimentón.", price: 28000, category: "entradas", isFeatured: true, prepTimeMin: 8 },

    // Sopas
    { name: "Ajiaco Santafereño", description: "Tradicional sopa bogotana con tres papas, pollo desmechado, guascas y alcaparras.", price: 22000, category: "sopas", prepTimeMin: 20 },
    { name: "Sancocho Trifásico", description: "Sopa sustanciosa de res, cerdo y pollo con yuca, plátano y mazorca.", price: 25000, category: "sopas", prepTimeMin: 25 },
    { name: "Crema de Ahuyama", description: "Cremosa sopa de ahuyama con un toque de jengibre y crutones.", price: 16000, category: "sopas", isVegan: true, prepTimeMin: 12 },
    { name: "Borscht", description: "Sopa de remolacha al estilo europeo del este con crema ácida.", price: 19000, category: "sopas", prepTimeMin: 15 },

    // Principales
    { name: "Bandeja Paisa", description: "El clásico: fríjoles, arroz, chicharrón, carne molida, chorizo, huevo frito, plátano, arepa y aguacate.", price: 32000, category: "principales", isFeatured: true, prepTimeMin: 25 },
    { name: "Pollo a la Plancha", description: "Pechuga marinada con hierbas, guarnición de papas rústicas y ensalada fresca.", price: 24500, category: "principales", prepTimeMin: 20 },
    { name: "Salmón a la Parrilla", description: "Filete de salmón con salsa de maracuyá, quinoa y vegetales salteados.", price: 42000, category: "principales", isFeatured: true, prepTimeMin: 22 },
    { name: "Lomo de Res al Vino", description: "Lomo de res en reducción de vino tinto, puré de papa trufado y espárragos.", price: 48000, category: "principales", prepTimeMin: 30 },
    { name: "Risotto de Hongos", description: "Risotto cremoso con mezcla de hongos, parmesano y aceite de trufa.", price: 29000, category: "principales", prepTimeMin: 22 },
    { name: "Costillas BBQ", description: "Costillas de cerdo glaseadas con BBQ de café, papas cambray y cebollas confitadas.", price: 36000, category: "principales", prepTimeMin: 28 },

    // Hamburguesas
    { name: "Vicio Doble", description: "Doble carne de 150g, queso cheddar, tocino, cebolla caramelizada, salsa de la casa.", price: 28000, category: "hamburguesas", isFeatured: true, prepTimeMin: 18 },
    { name: "Burger de Pollo Crispy", description: "Filete de pollo empanizado, lechuga, tomate, mayo de chipotle.", price: 23000, category: "hamburguesas", isSpicy: true, prepTimeMin: 16 },
    { name: "Burger Vegana", description: "Medallón de lentejas y remolacha, aguacate, rúcula y salsa de yogur vegano.", price: 25000, category: "hamburguesas", isVegan: true, prepTimeMin: 18 },
    { name: "Burger Cluvi Especial", description: "Carne 200g, queso brie, jamón serrano, huevo de codorniz, pan brioche.", price: 32000, category: "hamburguesas", isFeatured: true, prepTimeMin: 20 },

    // Pasta
    { name: "Spaghetti Carbonara", description: "Pasta con tocino, yema de huevo, queso pecorino y pimienta negra.", price: 26000, category: "pasta", prepTimeMin: 18 },
    { name: "Lasaña Boloñesa", description: "Capas de pasta con ragú de res, bechamel y parmesano gratinado.", price: 28000, category: "pasta", prepTimeMin: 25 },
    { name: "Fettuccine Alfredo", description: "Fettuccine en salsa cremosa de parmesano y mantequilla.", price: 24000, category: "pasta", prepTimeMin: 16 },
    { name: "Ravioli de Espinaca", description: "Raviolis rellenos de espinaca y ricotta en salsa de tomate fresco.", price: 27000, category: "pasta", prepTimeMin: 18 },

    // Postres
    { name: "Tres Leches", description: "Bizcocho bañado en tres leches con crema y caramelo.", price: 14000, category: "postres", isFeatured: true, prepTimeMin: 5 },
    { name: "Flan de Caramelo", description: "Flan casero con caramelo líquido y nata montada.", price: 12000, category: "postres", prepTimeMin: 5 },
    { name: "Tiramisú", description: "Clásico italiano con café espresso, mascarpone y cacao.", price: 15000, category: "postres", prepTimeMin: 5 },
    { name: "Brownie con Helado", description: "Brownie de chocolate tibio con helado de vainilla y salsa de fresa.", price: 16000, category: "postres", prepTimeMin: 8 },
    { name: "Cheesecake de Maracuyá", description: "Tarta de queso con coulis de maracuyá.", price: 15000, category: "postres", prepTimeMin: 5 },

    // Bebidas
    { name: "Limonada de Coco", description: "Refrescante limonada con crema de coco y hielo frappé.", price: 9000, category: "bebidas", isFeatured: true, prepTimeMin: 5 },
    { name: "Limonada de Hierbabuena", description: "Limonada natural con hierbabuena fresca.", price: 7000, category: "bebidas", isVegan: true, prepTimeMin: 4 },
    { name: "Jugo de Lulo", description: "Jugo natural de lulo con agua o leche.", price: 8000, category: "bebidas", isVegan: true, prepTimeMin: 4 },
    { name: "Agua Tónica Premium", description: "Agua tónica con limón y pepino.", price: 6000, category: "bebidas", prepTimeMin: 2 },
    { name: "Gaseosa 350ml", description: "Coca-Cola, Sprite o Fanta.", price: 5000, category: "bebidas", prepTimeMin: 2 },

    // Café y Té
    { name: "Espresso", description: "Café espresso simple, beans de origen Huila.", price: 4500, category: "cafe", prepTimeMin: 3 },
    { name: "Capuccino", description: "Espresso con leche vaporizada y espuma cremosa.", price: 7000, category: "cafe", prepTimeMin: 4 },
    { name: "Latte Vainilla", description: "Latte con jarabe de vainilla y arte en leche.", price: 8500, category: "cafe", prepTimeMin: 5 },
    { name: "Té Helado de Frutos Rojos", description: "Té negro con frutos rojos y menta.", price: 7000, category: "cafe", isVegan: true, prepTimeMin: 4 },
    { name: "Chocolate Caliente", description: "Chocolate espeso con marshmallows y canela.", price: 8000, category: "cafe", prepTimeMin: 5 },

    // Cocteles
    { name: "Mojito Cubano", description: "Ron blanco, hierbabuena, limón, azúcar y soda.", price: 18000, category: "cocteles", isFeatured: true, prepTimeMin: 5 },
    { name: "Margarita Clásica", description: "Tequila, triple sec, jugo de limón y sal.", price: 20000, category: "cocteles", prepTimeMin: 5 },
    { name: "Aperol Spritz", description: "Aperol, prosecco y soda con naranja.", price: 22000, category: "cocteles", prepTimeMin: 4 },
    { name: "Negroni", description: "Gin, vermut rojo y Campari con naranja.", price: 24000, category: "cocteles", prepTimeMin: 4 },
    { name: "Pisco Sour", description: "Pisco, jugo de limón, clara de huevo y amargo de angostura.", price: 21000, category: "cocteles", prepTimeMin: 6 },
  ];

  for (let i = 0; i < productsData.length; i++) {
    const p = productsData[i] as any;
    await db.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl ?? null,
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
  console.log(`✓ ${productsData.length} products created`);

  // Tables
  const tablesData = [
    { code: "M1", seats: 2, area: "Salón" },
    { code: "M2", seats: 4, area: "Salón" },
    { code: "M3", seats: 4, area: "Salón" },
    { code: "M4", seats: 6, area: "Salón" },
    { code: "T1", seats: 2, area: "Terraza" },
    { code: "T2", seats: 4, area: "Terraza" },
    { code: "T3", seats: 8, area: "Terraza" },
    { code: "B1", seats: 2, area: "Barra" },
    { code: "B2", seats: 2, area: "Barra" },
    { code: "B3", seats: 2, area: "Barra" },
  ];

  for (const t of tablesData) {
    const qrToken = `${restaurant.slug}-${t.code.toLowerCase()}-${Math.random().toString(36).slice(2, 8)}`;
    await db.table.create({
      data: { ...t, qrToken, restaurantId: restaurant.id },
    });
  }
  console.log(`✓ ${tablesData.length} tables created`);

  // Demo orders for stats - last 7 days
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
          customerName: ["Carlos", "María", "Andrés", "Laura", "Juan", "Sofía", "Pedro", "Daniela"][Math.floor(Math.random() * 8)],
          subtotal,
          tip,
          total,
          createdAt,
          items: { create: items },
        },
      });
    }
  }
  console.log(`✓ ~${orderNumber - 1000} demo orders created`);

  // Reservations
  const customers = [
    { name: "Camila Restrepo", phone: "+57 310 555 1212", email: "camila@example.com", size: 2, occasion: "Cita romántica" },
    { name: "Andrés Gómez", phone: "+57 311 444 2323", email: "andres@example.com", size: 4, occasion: "Cena familiar" },
    { name: "Laura Jiménez", phone: "+57 312 333 3434", email: "laura@example.com", size: 6, occasion: "Cumpleaños" },
    { name: "Sebastián Ortiz", phone: "+57 313 222 4545", email: "sebas@example.com", size: 2 },
    { name: "Valentina Ruiz", phone: "+57 314 111 5656", email: "valen@example.com", size: 3 },
    { name: "Felipe Cárdenas", phone: "+57 315 999 6767", email: "felipe@example.com", size: 8, occasion: "Cena de negocios" },
    { name: "Mariana López", phone: "+57 316 888 7878", email: "mari@example.com", size: 4 },
    { name: "Santiago Vera", phone: "+57 317 777 8989", email: "santi@example.com", size: 2, occasion: "Aniversario" },
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
  console.log("✓ Reservations created");

  console.log("\n🎉 Seed completed!");
  console.log(`Restaurant: ${restaurant.name} (slug: ${restaurant.slug})`);
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
