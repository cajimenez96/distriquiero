import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  UserModel,
  ProductModel,
  OrderModel,
  BannerModel,
  AuditLogModel,
  CounterModel
} from '../models/index.ts';

// Cargar variables de producción desde .env.prod o .env como fallback
dotenv.config({ path: path.resolve(process.cwd(), '.env.prod') });
if (!process.env.MONGODB_URI) {
  dotenv.config();
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI no está definido en .env.prod ni en las variables de entorno.');
  process.exit(1);
}

async function seedProduction() {
  console.log('====================================================');
  console.log('🚀 INICIANDO SEEDING DE PRODUCCIÓN - DISTRIQUIERO');
  console.log('====================================================');
  console.log(`📡 Conectando a MongoDB Atlas...`);

  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Conexión con MongoDB Atlas establecida con éxito.');

    // 1. Limpieza de colecciones de producción
    console.log('🧹 Limpiando colecciones existentes en producción...');
    await Promise.all([
      UserModel.deleteMany({}),
      ProductModel.deleteMany({}),
      OrderModel.deleteMany({}), // Bandeja de pedidos limpia para clientes reales
      BannerModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
      CounterModel.deleteMany({})
    ]);
    console.log('✅ Colecciones preparadas.');

    // 2. Usuarios Administradores de Producción
    console.log('👤 Creando usuarios administrativos de producción...');
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const superadmin = await UserModel.create({
      name: 'Carlos Jiménez (Master Ops)',
      email: 'admin@distriquiero.com',
      password: hashedPassword,
      role: 'superadmin',
      isActive: true
    });

    const admin = await UserModel.create({
      name: 'Operador Comercial',
      email: 'operador@distriquiero.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });
    console.log(`✅ Usuarios creados:\n   - Superadmin: admin@distriquiero.com\n   - Admin: operador@distriquiero.com`);

    // 3. Catálogo de Productos Oficiales
    console.log('📦 Creando catálogo de productos inicial...');
    const productsData = [
      {
        title: 'Aceite Girasol 1.5L',
        slug: 'aceite-girasol-cocinero-15l',
        sku: 'ACE-COC-1500',
        brand: 'COCINERO',
        category: 'Almacén',
        description: 'Aceite de girasol refinado puro de primera prensada en botella de 1.5 litros. Esencial para rotación continua en almacenes y gastronomía.',
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDPWuT_kZKX0i2DW7c9cxkBcwY75vUA29IeCOOtscMJcI9V-6zSii1Gp6fV8gG9-8VFkb2Caoe-61sM5xldwkzW1cU9_26FDVlSllGGyTPvn_3-oN41NTFpJv2_GTxARsLf9GeYJJImnCMM1JDB_lsXkZ-9MJcClnAZ9r_oWe-OWwg4gHdctnLiYDvDGWKtjrZAzz5Ch3Lx2GXTg4wxD-hgUTYrr28Oply0NhD37k-3FTnKWNvyITV5bA'
        ],
        priceUnit: 1850,
        priceBulk: 18500,
        unitsPerBulk: 12,
        isOffer: false,
        isPaused: false
      },
      {
        title: 'Chocolinas 250g',
        slug: 'galletitas-chocolinas-bagley-250g',
        sku: 'CHOC-BAG-250',
        brand: 'BAGLEY',
        category: 'Golosinas',
        description: 'Galletitas rellenas y clásicas de chocolate para repostería o consumo directo. Pack cerrado de fábrica con vencimiento prolongado.',
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCblDdeSGWE9ka0XrVJeyo-zHEN_AKkPgeB_Uv7Vx7IJ2WVGkW1VOFR4uxUT9dC4T3clrzvrTQfVDerFs0c8bqfjmn89FCs-Py6AUVDnciJvkZ8AKehH5oc9ztyQ60FLzaHUj1zqGEvTn6SJL2SB3MBKZi-PLX8PwbRaMaFMkk5E6f2bOvkyBUp9XHqRnUENas7YbPiI2BAzIFTzZNnoGt3tAexaE8WuLIiaovxxSa9Sx-LeqV5_pWyIQ'
        ],
        priceUnit: 1200,
        priceBulk: 12000,
        unitsPerBulk: 12,
        isOffer: true,
        isPaused: false
      },
      {
        title: 'Jabón Líquido 3L',
        slug: 'jabon-liquido-skip-3l',
        sku: 'LAV-SKP-3000',
        brand: 'SKIP',
        category: 'Limpieza',
        description: 'Jabón líquido concentrado Skip para lavarropas automático. Presentación económica bidón 3 litros con alta demanda institucional y hogareña.',
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuD4Bc05b8kBMN751KBTjXg6CGTtgN__vJyPOUWtrPqu4dWYXZmLeUtUsUMfDTdxRHDZkUFuQ3bMYIv17xTM3gERDafOaFhdUYcpzlUrqSVQNg9Uv3j5KdgdCSZq_ZONCjhuVxVUOJl65mODXAsvbgf1PoRgPTPZKyIzZU9VKrmwvlj85uLYi28QuYlmqhSj4H1VLXspiZO53xrJrjw1bLBCy-o7iNsk_d5C_EVb7Eda4378LZkFli9Uzg'
        ],
        priceUnit: 4600,
        priceBulk: 23000,
        unitsPerBulk: 6,
        isOffer: false,
        isPaused: false
      },
      {
        title: 'Gaseosa Cola 2.25L',
        slug: 'gaseosa-coca-cola-225l',
        sku: 'BEB-CC-2250',
        brand: 'COCA-COLA',
        category: 'Bebidas',
        description: 'Botella familiar retornable/descartable 2.25L. Pallet o bulto termoformado original de 8 unidades.',
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCJn_aClFifk6vIag6yb435fKm5LFIsxM-VYUvWZc1OYZBhRUh__muPcSxr8ZyRmxTq7R06i_pZ1uDwKaGHO8mBm1kokOeY_XPLwnFaYubDzFCJToUM1e1g2mhJt5uziCHUoZvk8lWuJ1kVcsooJSAxYEMezrJDmtaB05PLgVS5Sa-RRyGw2vQo21uXFWxKhJx8_vTOkKXsepUBAPvYz4fh8CMaIlnzdEefEGZokZOGkJgLWQ4-ZRgh_A'
        ],
        priceUnit: 2400,
        priceBulk: 19200,
        unitsPerBulk: 8,
        isOffer: true,
        isPaused: false
      },
      {
        title: 'Yerba Mate 1kg',
        slug: 'yerba-mate-playadito-1kg',
        sku: 'YER-PLY-1000',
        brand: 'PLAYADITO',
        category: 'Almacén',
        description: 'Yerba mate tradicional elaborada con palo en envase trilaminado impermeable de 1 kg. Máxima frescura.',
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCmO99HDThXSgHnkHMO7vGNdKA5fQeuBi1cwJOzTdf0mMnYAFTLeH4guBITmvCSROkpLosVsyOtXb9w7_qHSz0GMuVeZXF9OtxXblYq22cTPj8fdHiMVBSj422RMuBEHttk978-7IvuJ7LWIZ7VA-DcdyQolmxSQKCu0M0Ou4eVkhR_jWo6gUYlLnfoIj1IyQVnKKUpxB1guP9gCyHQZShXH9oUodLFUORHpeghhqacxWFTjGGRjRnoiA'
        ],
        priceUnit: 3900,
        priceBulk: 35100,
        unitsPerBulk: 10,
        isOffer: false,
        isPaused: false
      },
      {
        title: 'Alfajor Triple Choc.',
        slug: 'alfajor-guaymallen-triple-chocolate',
        sku: 'GOL-GYM-TRIP',
        brand: 'GUAYMALLÉN',
        category: 'Golosinas',
        description: 'Alfajor triple bañado en repostería con generoso relleno de dulce de leche. Caja cerrada display x 40 unidades.',
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDvJKgo2N4p-Xd4FUi8cjCe7LrHPomKnbdx7dPmbKYmXydbeEDkxKi1CoY7bjDg_vskgrjwKjyozJ6UcdkL8iDT8gHcufraSMSoZl4c5h1uUgl8CnzdxrTWZTXa348XaTpHILa3fqBGe0BYgGVxNMSk3MgA7cgWWXR4ZEu4cdHrHmbLT-b2ZtOI6rS7l_X8FUTeSSUel30t8CvvOWlu8jlRpiKN9zaP6O_bTmpbQvz21uE3e3IdH8y7pw'
        ],
        priceUnit: 450,
        priceBulk: 14400,
        unitsPerBulk: 40,
        isOffer: true,
        isPaused: false
      }
    ];

    await ProductModel.insertMany(productsData);
    console.log(`✅ ${productsData.length} productos insertados en el catálogo.`);

    // 4. Contador Correlativo de Pedidos para Producción
    console.log('🔢 Inicializando contador correlativo oficial (#DQ-1000)...');
    await CounterModel.create({
      _id: 'order_number',
      seq: 1000
    });
    console.log('✅ Contador inicializado en #DQ-1000 (el primer pedido real será #DQ-1001).');

    // 5. Banners Promocionales
    console.log('🎨 Creando banners promocionales activos...');
    await BannerModel.create({
      title: 'Súper Ofertas por Bulto Cerrado',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACHW-TFAXq2hk15NnHLXPboHg5but-Xn8FUeNUz-Y5SXSoemR3CZfRAY-sLgOVN5t58htPr6XAUnoCtcgnS28wAhamugpO0oOL7OlpHC8iNqjnbbhTL-z4RW5gcRPfp6CMvrp50wy31kHPTbVMJAtWlhvrSA7i3bJ5Q3ZgBnKGi1N-c3mrXe3vDdaWOCSnrZm0-ZfOBh9wo-FWAE0q9tz4HxDFRo4MPKAD27nU2DW4uHqD7WSc6Gvnrg',
      targetCategory: 'todos',
      isActive: true,
      order: 1
    });
    console.log('✅ Banner promocional creado.');

    // 6. Registro de Auditoría Inicial
    console.log('📝 Registrando log de auditoría inicial...');
    await AuditLogModel.create({
      userId: superadmin._id.toString(),
      userName: superadmin.name,
      userRole: superadmin.role,
      action: 'CREATE',
      entity: 'User',
      entityId: superadmin._id.toString(),
      beforeSnapshot: null,
      afterSnapshot: {
        event: 'Production database seeded and superadmin account initialized',
        email: superadmin.email,
        timestamp: new Date().toISOString()
      }
    });
    console.log('✅ Log de auditoría inicial registrado.');

    console.log('====================================================');
    console.log('🎉 ¡SEEDING DE PRODUCCIÓN COMPLETADO CON ÉXITO!');
    console.log('====================================================');
    console.log('Tu base de datos en MongoDB Atlas está lista para recibir clientes reales.');
  } catch (error: any) {
    console.error('❌ Error durante el seeding de producción:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Conexión cerrada.');
    process.exit(0);
  }
}

seedProduction();
