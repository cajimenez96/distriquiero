import dotenv from 'dotenv';
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

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/distri-dev';

async function seed() {
  console.log('--- Iniciando Seeding de DistriQuiero ---');
  console.log(`Conectando a MongoDB en: ${MONGODB_URI}`);

  await mongoose.connect(MONGODB_URI);
  console.log('Conexión establecida con éxito.');

  // 1. Limpieza de colecciones
  console.log('Limpiando colecciones existentes...');
  await Promise.all([
    UserModel.deleteMany({}),
    ProductModel.deleteMany({}),
    OrderModel.deleteMany({}),
    BannerModel.deleteMany({}),
    AuditLogModel.deleteMany({}),
    CounterModel.deleteMany({})
  ]);
  console.log('Colecciones limpias.');

  // 2. Usuarios Iniciales
  console.log('Creando usuarios iniciales...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const superadmin = await UserModel.create({
    name: 'Carlos Jiménez (Master Ops)',
    email: 'admin@distriquiero.com',
    password: hashedPassword,
    role: 'superadmin',
    isActive: true
  });

  const admin = await UserModel.create({
    name: 'Gonzalo Operaciones',
    email: 'operador@distriquiero.com',
    password: hashedPassword,
    role: 'admin',
    isActive: true
  });

  console.log(`Usuarios creados:`);
  console.log(` - Superadmin: ${superadmin.email} (Rol: ${superadmin.role})`);
  console.log(` - Admin: ${admin.email} (Rol: ${admin.role})`);

  // 3. Catálogo de Productos
  console.log('Creando catálogo de productos inicial...');
  const initialProducts = [
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

  const createdProducts = await ProductModel.insertMany(initialProducts);
  console.log(`Se insertaron ${createdProducts.length} productos en la base de datos.`);

  // Mapa para indexar por SKU y slug para asociar a los pedidos
  const productMap: Record<string, any> = {};
  for (const prod of createdProducts) {
    productMap[prod.sku] = prod;
    productMap[prod.slug] = prod;
  }

  // 4. Pedidos de Ejemplo
  console.log('Creando pedidos de ejemplo...');
  const sampleOrders = [
    {
      orderNumber: '#DQ-1082',
      customer: {
        firstName: 'Gonzalo',
        lastName: 'Martínez',
        phone: '+54 9 11 4598-2210',
        businessName: 'Kiosco Central'
      },
      items: [
        {
          productId: productMap['CHOC-BAG-250']._id,
          title: 'Galletitas Chocolinas 250g',
          purchaseType: 'bulk' as const,
          quantity: 2,
          unitPrice: 12000,
          subtotal: 24000
        },
        {
          productId: productMap['ACE-COC-1500']._id,
          title: 'Aceite Girasol 1.5L',
          purchaseType: 'bulk' as const,
          quantity: 1,
          unitPrice: 18500,
          subtotal: 18500
        },
        {
          productId: productMap['YER-PLY-1000']._id,
          title: 'Yerba Mate 1kg',
          purchaseType: 'unit' as const,
          quantity: 6,
          unitPrice: 3900,
          subtotal: 23400
        }
      ],
      totalAmount: 61100,
      status: 'Solicitado' as const,
      statusHistory: [
        {
          status: 'Solicitado',
          changedBy: 'Cliente Web',
          timestamp: new Date(Date.now() - 14 * 60 * 1000)
        }
      ]
    },
    {
      orderNumber: '#DQ-1081',
      customer: {
        firstName: 'Pedro',
        lastName: 'Gómez',
        phone: '+54 9 11 6721-9904',
        businessName: 'Almacén Don Pedro'
      },
      items: [
        {
          productId: productMap['LAV-SKP-3000']._id,
          title: 'Jabón Líquido Skip 3L',
          purchaseType: 'bulk' as const,
          quantity: 5,
          unitPrice: 23000,
          subtotal: 115000
        }
      ],
      totalAmount: 115000,
      status: 'Contestado' as const,
      statusHistory: [
        {
          status: 'Solicitado',
          changedBy: 'Cliente Web',
          timestamp: new Date(Date.now() - 31 * 60 * 1000)
        },
        {
          status: 'Contestado',
          changedBy: superadmin.name,
          timestamp: new Date(Date.now() - 15 * 60 * 1000)
        }
      ]
    },
    {
      orderNumber: '#DQ-1080',
      customer: {
        firstName: 'Mariana',
        lastName: 'Bustos',
        phone: '+54 9 11 3102-4488',
        businessName: 'Minimarket Belgrano'
      },
      items: [
        {
          productId: productMap['BEB-CC-2250']._id,
          title: 'Gaseosa Cola 2.25L',
          purchaseType: 'bulk' as const,
          quantity: 1,
          unitPrice: 19200,
          subtotal: 19200
        },
        {
          productId: productMap['ACE-COC-1500']._id,
          title: 'Aceite Girasol 1.5L',
          purchaseType: 'unit' as const,
          quantity: 12,
          unitPrice: 1850,
          subtotal: 22200
        },
        {
          productId: productMap['GOL-GYM-TRIP']._id,
          title: 'Alfajor Triple Choc.',
          purchaseType: 'unit' as const,
          quantity: 15,
          unitPrice: 450,
          subtotal: 6750
        }
      ],
      totalAmount: 48200,
      status: 'Solicitado' as const,
      statusHistory: [
        {
          status: 'Solicitado',
          changedBy: 'Cliente Web',
          timestamp: new Date(Date.now() - 56 * 60 * 1000)
        }
      ]
    }
  ];

  const createdOrders = await OrderModel.insertMany(sampleOrders);
  console.log(`Se insertaron ${createdOrders.length} pedidos de prueba.`);

  // 5. Contador Correlativo de Pedidos
  console.log('Inicializando contador de pedidos...');
  await CounterModel.create({
    _id: 'order_number',
    seq: 1082
  });
  console.log('Contador inicializado en #DQ-1082.');

  // 6. Banners Promocionales
  console.log('Creando banners promocionales...');
  await BannerModel.create({
    title: 'Súper Ofertas por Bulto',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACHW-TFAXq2hk15NnHLXPboHg5but-Xn8FUeNUz-Y5SXSoemR3CZfRAY-sLgOVN5t58htPr6XAUnoCtcgnS28wAhamugpO0oOL7OlpHC8iNqjnbbhTL-z4RW5gcRPfp6CMvrp50wy31kHPTbVMJAtWlhvrSA7i3bJ5Q3ZgBnKGi1N-c3mrXe3vDdaWOCSnrZm0-ZfOBh9wo-FWAE0q9tz4HxDFRo4MPKAD27nU2DW4uHqD7WSc6Gvnrg',
    targetCategory: 'todos',
    isActive: true,
    order: 1
  });
  console.log('Banner promocional creado.');

  // 7. Auditoría Inicial
  console.log('Registrando log de auditoría inicial...');
  await AuditLogModel.create({
    userId: superadmin._id,
    userName: superadmin.name,
    userRole: superadmin.role,
    action: 'CREATE',
    entity: 'User',
    entityId: superadmin._id.toString(),
    beforeSnapshot: null,
    afterSnapshot: {
      email: superadmin.email,
      role: superadmin.role,
      action: 'DATABASE_INITIAL_SEED'
    }
  });

  console.log('--- Seeding completado exitosamente ---');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error durante el proceso de seeding:', err);
  mongoose.disconnect().finally(() => process.exit(1));
});
