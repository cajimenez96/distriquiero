import bcrypt from 'bcryptjs';

export interface MemoryStore {
  counter: number;
  users: any[];
  products: any[];
  orders: any[];
  auditLogs: any[];
  banners: any[];
}

export const memoryStore: MemoryStore = {
  counter: 1082,
  users: [],
  products: [],
  orders: [],
  auditLogs: [],
  banners: []
};

// Seed initial fallback memory store
export async function initSeedData() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  memoryStore.users = [
    {
      _id: 'usr_superadmin_01',
      name: 'Carlos Jiménez (Master Ops)',
      email: 'admin@distriquiero.com',
      password: hashedPassword,
      role: 'superadmin',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'usr_admin_02',
      name: 'Gonzalo Operaciones',
      email: 'operador@distriquiero.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  memoryStore.products = [
    {
      _id: 'prod_chocolinas_250g',
      title: 'Galletitas Chocolinas Original 250g',
      slug: 'galletitas-chocolinas-original-250g',
      sku: 'GAL-CHO-250',
      brand: 'Bagley',
      category: 'Almacén',
      description: 'Galletitas dulces de chocolate sabor intenso. Ideal para chocotorta y reventa en kiosco o almacén.',
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuACHW-TFAXq2hk15NnHLXPboHg5but-Xn8FUeNUz-Y5SXSoemR3CZfRAY-sLgOVN5t58htPr6XAUnoCtcgnS28wAhamugpO0oOL7OlpHC8iNqjnbbhTL-z4RW5gcRPfp6CMvrp50wy31kHPTbVMJAtWlhvrSA7i3bJ5Q3ZgBnKGi1N-c3mrXe3vDdaWOCSnrZm0-ZfOBh9wo-FWAE0q9tz4HxDFRo4MPKAD27nU2DW4uHqD7WSc6Gvnrg'
      ],
      priceUnit: 1200,
      priceBulk: 12000,
      unitsPerBulk: 12,
      isOffer: true,
      isPaused: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'prod_coca_cola_500',
      title: 'Coca-Cola Sabor Original 500ml',
      slug: 'coca-cola-sabor-original-500ml',
      sku: 'BEB-COC-500',
      brand: 'Coca-Cola',
      category: 'Bebidas',
      description: 'Gaseosa cola en botella descartable 500ml. Pack cerrado directo de embotelladora.',
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDFXW_example_beverage_coca_cola_bottle_pack_clean_studio_render_product'
      ],
      priceUnit: 950,
      priceBulk: 9600,
      unitsPerBulk: 12,
      isOffer: false,
      isPaused: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'prod_bonobon_leche',
      title: 'Bombón Bon o Bon Chocolate con Leche (Caja x 18 u.)',
      slug: 'bombon-bon-o-bon-chocolate-leche-caja-x-18',
      sku: 'GOL-BON-18',
      brand: 'Arcor',
      category: 'Golosinas',
      description: 'Bombones rellenos con crema de maní y oblea crujiente, baño de chocolate.',
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBonobon_box_choc_milk_arcor_candy_wholesale_box_pack_white_bg'
      ],
      priceUnit: 400,
      priceBulk: 5900,
      unitsPerBulk: 18,
      isOffer: true,
      isPaused: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'prod_lay_clasicas_95g',
      title: 'Papas Fritas Lays Clásicas 95g',
      slug: 'papas-fritas-lays-clasicas-95g',
      sku: 'SNK-LAY-95',
      brand: 'Lay\'s',
      category: 'Snacks',
      description: 'Papas fritas tradicionales saladas en bolsa de 95g. Caja cerrada.',
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuLays_chips_bag_95g_crisps_salty_snack_pack'
      ],
      priceUnit: 1400,
      priceBulk: 13900,
      unitsPerBulk: 12,
      isOffer: false,
      isPaused: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'prod_lavandina_ayudin_1l',
      title: 'Lavandina Ayudín Común 1 Litro',
      slug: 'lavandina-ayudin-comun-1-litro',
      sku: 'LMP-AYU-1000',
      brand: 'Ayudín',
      category: 'Limpieza',
      description: 'Lavandina concentrada máxima desinfección. Fardo de 12 botellas.',
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAyudin_bleach_cleaner_bottle_case_household'
      ],
      priceUnit: 890,
      priceBulk: 9200,
      unitsPerBulk: 12,
      isOffer: false,
      isPaused: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'prod_yerba_playadito_1k',
      title: 'Yerba Mate Playadito con Palo 1 Kg',
      slug: 'yerba-mate-playadito-con-palo-1-kg',
      sku: 'ALM-PLA-1000',
      brand: 'Playadito',
      category: 'Almacén',
      description: 'Yerba mate tradicional elaborada con palo. Fardo mayorista de 10 paquetes.',
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuPlayadito_yerba_mate_yellow_bag_1kg_traditional'
      ],
      priceUnit: 3800,
      priceBulk: 34500,
      unitsPerBulk: 10,
      isOffer: true,
      isPaused: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'prod_alfajor_guaymallen_blanco',
      title: 'Alfajor Guaymallén Blanco Dulce de Leche (Caja x 40 u.)',
      slug: 'alfajor-guaymallen-blanco-caja-40',
      sku: 'GOL-GUAY-40',
      brand: 'Guaymallén',
      category: 'Golosinas',
      description: 'Clásico alfajor simple relleno con dulce de leche y baño de repostería fantasía blanco.',
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuGuaymallen_white_alfajores_box_40_units_dulce_de_leche'
      ],
      priceUnit: 250,
      priceBulk: 8800,
      unitsPerBulk: 40,
      isOffer: false,
      isPaused: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'prod_rollo_cocina_elegante',
      title: 'Rollo de Cocina Elegante 3x50 paños (Pack 8 bultos)',
      slug: 'rollo-cocina-elegante-pack-8',
      sku: 'LMP-ELE-PACK8',
      brand: 'Elegante',
      category: 'Limpieza',
      description: 'Rollos de papel absorbente de máxima resistencia. Bolsón x 8 paquetes de 3 rollos.',
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuPaper_towels_kitchen_roll_elegante_pack_cleaning'
      ],
      priceUnit: 1600,
      priceBulk: 10900,
      unitsPerBulk: 8,
      isOffer: false,
      isPaused: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  memoryStore.orders = [
    {
      _id: 'ord_1080',
      orderNumber: '#DQ-1080',
      status: 'Entregado',
      client: {
        businessName: 'Kiosco El Trébol',
        contactName: 'Mariana López',
        whatsapp: '+5491155443322',
        address: 'Av. Corrientes 3450, Almagro, CABA',
        deliveryType: 'Envío a Comercio',
        preferredSchedule: '10:00 a 14:00 hs',
        paymentMethod: 'Transferencia bancaria previa'
      },
      items: [
        {
          productId: 'prod_bonobon_leche',
          title: 'Bombón Bon o Bon Chocolate con Leche (Caja x 18 u.)',
          brand: 'Arcor',
          category: 'Golosinas',
          format: 'BULK',
          unitsPerBulk: 18,
          quantity: 4,
          unitPrice: 5900,
          subtotal: 23600
        },
        {
          productId: 'prod_alfajor_guaymallen_blanco',
          title: 'Alfajor Guaymallén Blanco Dulce de Leche (Caja x 40 u.)',
          brand: 'Guaymallén',
          category: 'Golosinas',
          format: 'BULK',
          unitsPerBulk: 40,
          quantity: 3,
          unitPrice: 8800,
          subtotal: 26400
        }
      ],
      summary: {
        totalItems: 7,
        totalPackages: 7,
        subtotalUnits: 0,
        subtotalBulks: 50000,
        totalSavings: 8400,
        orderTotal: 50000
      },
      whatsappRawMessage: 'Pedido #DQ-1080 - Kiosco El Trébol',
      internalNotes: 'Cliente habitual, coordinar despacho por la mañana.',
      history: [
        {
          status: 'Solicitado',
          changedBy: 'Cliente (WhatsApp)',
          note: 'Ingreso inicial por tienda mayorista.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          status: 'Contestado',
          changedBy: 'Gonzalo Operaciones',
          note: 'Confirmado stock en depósito.',
          timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString()
        },
        {
          status: 'Entregado',
          changedBy: 'Gonzalo Operaciones',
          note: 'Despachado y recibido conforme.',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'ord_1081',
      orderNumber: '#DQ-1081',
      status: 'Contestado',
      client: {
        businessName: 'Despensa Los Amigos',
        contactName: 'Rubén Fontana',
        whatsapp: '+5491144332211',
        address: 'San Martín 1290, San Justo',
        deliveryType: 'Retiro en Depósito',
        preferredSchedule: 'Tarde',
        paymentMethod: 'Efectivo contra entrega'
      },
      items: [
        {
          productId: 'prod_yerba_playadito_1k',
          title: 'Yerba Mate Playadito con Palo 1 Kg',
          brand: 'Playadito',
          category: 'Almacén',
          format: 'BULK',
          unitsPerBulk: 10,
          quantity: 2,
          unitPrice: 34500,
          subtotal: 69000
        }
      ],
      summary: {
        totalItems: 2,
        totalPackages: 2,
        subtotalUnits: 0,
        subtotalBulks: 69000,
        totalSavings: 7000,
        orderTotal: 69000
      },
      whatsappRawMessage: 'Pedido #DQ-1081 - Despensa Los Amigos',
      internalNotes: 'Retira con furgón propio.',
      history: [
        {
          status: 'Solicitado',
          changedBy: 'Cliente (WhatsApp)',
          note: 'Ingreso inicial por tienda mayorista.',
          timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString()
        },
        {
          status: 'Contestado',
          changedBy: 'Carlos Jiménez (Master Ops)',
          note: 'Coordinado horario de retiro 16:00hs.',
          timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 95 * 60 * 1000).toISOString()
    }
  ];

  memoryStore.auditLogs = [
    {
      _id: 'audit_01',
      userId: 'usr_superadmin_01',
      userName: 'Carlos Jiménez (Master Ops)',
      userRole: 'superadmin',
      action: 'UPDATE',
      entity: 'Product',
      entityId: 'prod_chocolinas_250g',
      beforeSnapshot: { priceBulk: 12800, isOffer: false },
      afterSnapshot: { priceBulk: 12000, isOffer: true },
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString()
    },
    {
      _id: 'audit_02',
      userId: 'usr_superadmin_01',
      userName: 'Carlos Jiménez (Master Ops)',
      userRole: 'superadmin',
      action: 'STATUS_CHANGE',
      entity: 'Order',
      entityId: 'ord_1081',
      beforeSnapshot: { status: 'Solicitado' },
      afterSnapshot: { status: 'Contestado' },
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    }
  ];

  memoryStore.banners = [
    {
      _id: 'banner_01',
      title: 'Súper Ofertas por Bulto',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACHW-TFAXq2hk15NnHLXPboHg5but-Xn8FUeNUz-Y5SXSoemR3CZfRAY-sLgOVN5t58htPr6XAUnoCtcgnS28wAhamugpO0oOL7OlpHC8iNqjnbbhTL-z4RW5gcRPfp6CMvrp50wy31kHPTbVMJAtWlhvrSA7i3bJ5Q3ZgBnKGi1N-c3mrXe3vDdaWOCSnrZm0-ZfOBh9wo-FWAE0q9tz4HxDFRo4MPKAD27nU2DW4uHqD7WSc6Gvnrg',
      targetCategory: 'todos',
      isActive: true,
      order: 1
    }
  ];
}
