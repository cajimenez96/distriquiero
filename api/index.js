// server/app.ts
import express from "express";
import dotenv from "dotenv";

// server/lib/mongodb.ts
import mongoose from "mongoose";
var cached = global.mongooseCache;
if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}
async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5e3
    };
    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log("MongoDB successfully connected via Mongoose.");
      return mongooseInstance;
    }).catch((err) => {
      console.warn("MongoDB connection could not be established; continuing with in-memory persistence layer:", err.message);
      cached.promise = null;
      return null;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    return null;
  }
  return cached.conn;
}
function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// server/routes/auth.ts
import { Router } from "express";
import bcrypt3 from "bcryptjs";

// server/lib/db-store.ts
import bcrypt2 from "bcryptjs";
import mongoose3 from "mongoose";

// server/models/index.ts
import mongoose2, { Schema } from "mongoose";
var CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1e3 }
});
var CounterModel = mongoose2.models.Counter || mongoose2.model("Counter", CounterSchema);
var UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["superadmin", "admin"], default: "admin" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
var UserModel = mongoose2.models.User || mongoose2.model("User", UserSchema);
var ProductSchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  sku: { type: String, default: "", trim: true },
  brand: { type: String, default: "", trim: true },
  category: { type: String, required: true, index: true },
  description: { type: String, default: "" },
  images: [{ type: String }],
  priceUnit: { type: Number, required: true, min: 0 },
  priceBulk: { type: Number, required: true, min: 0 },
  unitsPerBulk: { type: Number, required: true, min: 1, default: 12 },
  isOffer: { type: Boolean, default: false },
  isPaused: { type: Boolean, default: false }
}, { timestamps: true });
var ProductModel = mongoose2.models.Product || mongoose2.model("Product", ProductSchema);
var OrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  customer: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    businessName: { type: String, default: "" }
  },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    title: { type: String, required: true },
    purchaseType: { type: String, enum: ["unit", "bulk"], required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["Solicitado", "Contestado"], default: "Solicitado" },
  statusHistory: [{
    status: { type: String, required: true },
    changedBy: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
var OrderModel = mongoose2.models.Order || mongoose2.model("Order", OrderSchema);
var AuditLogSchema = new Schema({
  userId: { type: Schema.Types.Mixed, required: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  action: {
    type: String,
    enum: ["CREATE", "UPDATE", "DELETE", "PAUSE", "STATUS_CHANGE"],
    required: true
  },
  entity: {
    type: String,
    enum: ["Product", "Order", "Banner", "User", "Category"],
    required: true
  },
  entityId: { type: String, required: true },
  beforeSnapshot: { type: Schema.Types.Mixed, default: null },
  afterSnapshot: { type: Schema.Types.Mixed, default: null }
}, { timestamps: { createdAt: true, updatedAt: false } });
AuditLogSchema.index({ createdAt: -1 });
var AuditLogModel = mongoose2.models.AuditLog || mongoose2.model("AuditLog", AuditLogSchema);
var BannerSchema = new Schema({
  title: { type: String, default: "" },
  imageUrl: { type: String, required: true },
  targetCategory: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
});
var BannerModel = mongoose2.models.Banner || mongoose2.model("Banner", BannerSchema);
var CategorySchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
var CategoryModel = mongoose2.models.Category || mongoose2.model("Category", CategorySchema);

// server/lib/fixtures/mock-data.ts
import bcrypt from "bcryptjs";
var memoryStore = {
  counter: 1082,
  users: [],
  products: [],
  orders: [],
  auditLogs: [],
  banners: [],
  categories: []
};
async function initSeedData() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  memoryStore.users = [
    {
      _id: "usr_superadmin_01",
      name: "Carlos Jim\xE9nez (Master Ops)",
      email: "admin@distriquiero.com",
      password: hashedPassword,
      role: "superadmin",
      isActive: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      _id: "usr_admin_02",
      name: "Gonzalo Operaciones",
      email: "operador@distriquiero.com",
      password: hashedPassword,
      role: "admin",
      isActive: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ];
  memoryStore.products = [
    {
      _id: "prod_chocolinas_250g",
      title: "Galletitas Chocolinas Original 250g",
      slug: "galletitas-chocolinas-original-250g",
      sku: "GAL-CHO-250",
      brand: "Bagley",
      category: "Almac\xE9n",
      description: "Galletitas dulces de chocolate sabor intenso. Ideal para chocotorta y reventa en kiosco o almac\xE9n.",
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuACHW-TFAXq2hk15NnHLXPboHg5but-Xn8FUeNUz-Y5SXSoemR3CZfRAY-sLgOVN5t58htPr6XAUnoCtcgnS28wAhamugpO0oOL7OlpHC8iNqjnbbhTL-z4RW5gcRPfp6CMvrp50wy31kHPTbVMJAtWlhvrSA7i3bJ5Q3ZgBnKGi1N-c3mrXe3vDdaWOCSnrZm0-ZfOBh9wo-FWAE0q9tz4HxDFRo4MPKAD27nU2DW4uHqD7WSc6Gvnrg"
      ],
      priceUnit: 1200,
      priceBulk: 12e3,
      unitsPerBulk: 12,
      isOffer: true,
      isPaused: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      _id: "prod_coca_cola_500",
      title: "Coca-Cola Sabor Original 500ml",
      slug: "coca-cola-sabor-original-500ml",
      sku: "BEB-COC-500",
      brand: "Coca-Cola",
      category: "Bebidas",
      description: "Gaseosa cola en botella descartable 500ml. Pack cerrado directo de embotelladora.",
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDFXW_example_beverage_coca_cola_bottle_pack_clean_studio_render_product"
      ],
      priceUnit: 950,
      priceBulk: 9600,
      unitsPerBulk: 12,
      isOffer: false,
      isPaused: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      _id: "prod_bonobon_leche",
      title: "Bomb\xF3n Bon o Bon Chocolate con Leche (Caja x 18 u.)",
      slug: "bombon-bon-o-bon-chocolate-leche-caja-x-18",
      sku: "GOL-BON-18",
      brand: "Arcor",
      category: "Golosinas",
      description: "Bombones rellenos con crema de man\xED y oblea crujiente, ba\xF1o de chocolate.",
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBonobon_box_choc_milk_arcor_candy_wholesale_box_pack_white_bg"
      ],
      priceUnit: 400,
      priceBulk: 5900,
      unitsPerBulk: 18,
      isOffer: true,
      isPaused: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      _id: "prod_lay_clasicas_95g",
      title: "Papas Fritas Lays Cl\xE1sicas 95g",
      slug: "papas-fritas-lays-clasicas-95g",
      sku: "SNK-LAY-95",
      brand: "Lay's",
      category: "Snacks",
      description: "Papas fritas tradicionales saladas en bolsa de 95g. Caja cerrada.",
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuLays_chips_bag_95g_crisps_salty_snack_pack"
      ],
      priceUnit: 1400,
      priceBulk: 13900,
      unitsPerBulk: 12,
      isOffer: false,
      isPaused: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      _id: "prod_lavandina_ayudin_1l",
      title: "Lavandina Ayud\xEDn Com\xFAn 1 Litro",
      slug: "lavandina-ayudin-comun-1-litro",
      sku: "LMP-AYU-1000",
      brand: "Ayud\xEDn",
      category: "Limpieza",
      description: "Lavandina concentrada m\xE1xima desinfecci\xF3n. Fardo de 12 botellas.",
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAyudin_bleach_cleaner_bottle_case_household"
      ],
      priceUnit: 890,
      priceBulk: 9200,
      unitsPerBulk: 12,
      isOffer: false,
      isPaused: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      _id: "prod_yerba_playadito_1k",
      title: "Yerba Mate Playadito con Palo 1 Kg",
      slug: "yerba-mate-playadito-con-palo-1-kg",
      sku: "ALM-PLA-1000",
      brand: "Playadito",
      category: "Almac\xE9n",
      description: "Yerba mate tradicional elaborada con palo. Fardo mayorista de 10 paquetes.",
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuPlayadito_yerba_mate_yellow_bag_1kg_traditional"
      ],
      priceUnit: 3800,
      priceBulk: 34500,
      unitsPerBulk: 10,
      isOffer: true,
      isPaused: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      _id: "prod_alfajor_guaymallen_blanco",
      title: "Alfajor Guaymall\xE9n Blanco Dulce de Leche (Caja x 40 u.)",
      slug: "alfajor-guaymallen-blanco-caja-40",
      sku: "GOL-GUAY-40",
      brand: "Guaymall\xE9n",
      category: "Golosinas",
      description: "Cl\xE1sico alfajor simple relleno con dulce de leche y ba\xF1o de reposter\xEDa fantas\xEDa blanco.",
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuGuaymallen_white_alfajores_box_40_units_dulce_de_leche"
      ],
      priceUnit: 250,
      priceBulk: 8800,
      unitsPerBulk: 40,
      isOffer: false,
      isPaused: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      _id: "prod_rollo_cocina_elegante",
      title: "Rollo de Cocina Elegante 3x50 pa\xF1os (Pack 8 bultos)",
      slug: "rollo-cocina-elegante-pack-8",
      sku: "LMP-ELE-PACK8",
      brand: "Elegante",
      category: "Limpieza",
      description: "Rollos de papel absorbente de m\xE1xima resistencia. Bols\xF3n x 8 paquetes de 3 rollos.",
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuPaper_towels_kitchen_roll_elegante_pack_cleaning"
      ],
      priceUnit: 1600,
      priceBulk: 10900,
      unitsPerBulk: 8,
      isOffer: false,
      isPaused: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ];
  memoryStore.orders = [
    {
      _id: "ord_1080",
      orderNumber: "#DQ-1080",
      status: "Entregado",
      client: {
        businessName: "Kiosco El Tr\xE9bol",
        contactName: "Mariana L\xF3pez",
        whatsapp: "+5491155443322",
        address: "Av. Corrientes 3450, Almagro, CABA",
        deliveryType: "Env\xEDo a Comercio",
        preferredSchedule: "10:00 a 14:00 hs",
        paymentMethod: "Transferencia bancaria previa"
      },
      items: [
        {
          productId: "prod_bonobon_leche",
          title: "Bomb\xF3n Bon o Bon Chocolate con Leche (Caja x 18 u.)",
          brand: "Arcor",
          category: "Golosinas",
          format: "BULK",
          unitsPerBulk: 18,
          quantity: 4,
          unitPrice: 5900,
          subtotal: 23600
        },
        {
          productId: "prod_alfajor_guaymallen_blanco",
          title: "Alfajor Guaymall\xE9n Blanco Dulce de Leche (Caja x 40 u.)",
          brand: "Guaymall\xE9n",
          category: "Golosinas",
          format: "BULK",
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
        subtotalBulks: 5e4,
        totalSavings: 8400,
        orderTotal: 5e4
      },
      whatsappRawMessage: "Pedido #DQ-1080 - Kiosco El Tr\xE9bol",
      internalNotes: "Cliente habitual, coordinar despacho por la ma\xF1ana.",
      history: [
        {
          status: "Solicitado",
          changedBy: "Cliente (WhatsApp)",
          note: "Ingreso inicial por tienda mayorista.",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString()
        },
        {
          status: "Contestado",
          changedBy: "Gonzalo Operaciones",
          note: "Confirmado stock en dep\xF3sito.",
          timestamp: new Date(Date.now() - 22 * 60 * 60 * 1e3).toISOString()
        },
        {
          status: "Entregado",
          changedBy: "Gonzalo Operaciones",
          note: "Despachado y recibido conforme.",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1e3).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1e3).toISOString()
    },
    {
      _id: "ord_1081",
      orderNumber: "#DQ-1081",
      status: "Contestado",
      client: {
        businessName: "Despensa Los Amigos",
        contactName: "Rub\xE9n Fontana",
        whatsapp: "+5491144332211",
        address: "San Mart\xEDn 1290, San Justo",
        deliveryType: "Retiro en Dep\xF3sito",
        preferredSchedule: "Tarde",
        paymentMethod: "Efectivo contra entrega"
      },
      items: [
        {
          productId: "prod_yerba_playadito_1k",
          title: "Yerba Mate Playadito con Palo 1 Kg",
          brand: "Playadito",
          category: "Almac\xE9n",
          format: "BULK",
          unitsPerBulk: 10,
          quantity: 2,
          unitPrice: 34500,
          subtotal: 69e3
        }
      ],
      summary: {
        totalItems: 2,
        totalPackages: 2,
        subtotalUnits: 0,
        subtotalBulks: 69e3,
        totalSavings: 7e3,
        orderTotal: 69e3
      },
      whatsappRawMessage: "Pedido #DQ-1081 - Despensa Los Amigos",
      internalNotes: "Retira con furg\xF3n propio.",
      history: [
        {
          status: "Solicitado",
          changedBy: "Cliente (WhatsApp)",
          note: "Ingreso inicial por tienda mayorista.",
          timestamp: new Date(Date.now() - 120 * 60 * 1e3).toISOString()
        },
        {
          status: "Contestado",
          changedBy: "Carlos Jim\xE9nez (Master Ops)",
          note: "Coordinado horario de retiro 16:00hs.",
          timestamp: new Date(Date.now() - 95 * 60 * 1e3).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 120 * 60 * 1e3).toISOString(),
      updatedAt: new Date(Date.now() - 95 * 60 * 1e3).toISOString()
    }
  ];
  memoryStore.auditLogs = [
    {
      _id: "audit_01",
      userId: "usr_superadmin_01",
      userName: "Carlos Jim\xE9nez (Master Ops)",
      userRole: "superadmin",
      action: "UPDATE",
      entity: "Product",
      entityId: "prod_chocolinas_250g",
      beforeSnapshot: { priceBulk: 12800, isOffer: false },
      afterSnapshot: { priceBulk: 12e3, isOffer: true },
      createdAt: new Date(Date.now() - 35 * 60 * 1e3).toISOString()
    },
    {
      _id: "audit_02",
      userId: "usr_superadmin_01",
      userName: "Carlos Jim\xE9nez (Master Ops)",
      userRole: "superadmin",
      action: "STATUS_CHANGE",
      entity: "Order",
      entityId: "ord_1081",
      beforeSnapshot: { status: "Solicitado" },
      afterSnapshot: { status: "Contestado" },
      createdAt: new Date(Date.now() - 15 * 60 * 1e3).toISOString()
    }
  ];
  memoryStore.banners = [
    {
      _id: "banner_01",
      title: "S\xFAper Ofertas por Bulto",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuACHW-TFAXq2hk15NnHLXPboHg5but-Xn8FUeNUz-Y5SXSoemR3CZfRAY-sLgOVN5t58htPr6XAUnoCtcgnS28wAhamugpO0oOL7OlpHC8iNqjnbbhTL-z4RW5gcRPfp6CMvrp50wy31kHPTbVMJAtWlhvrSA7i3bJ5Q3ZgBnKGi1N-c3mrXe3vDdaWOCSnrZm0-ZfOBh9wo-FWAE0q9tz4HxDFRo4MPKAD27nU2DW4uHqD7WSc6Gvnrg",
      targetCategory: "offers",
      isActive: true,
      order: 1
    }
  ];
  memoryStore.categories = [
    { _id: "cat_01", name: "Almac\xE9n", slug: "almacen", order: 1, isActive: true },
    { _id: "cat_02", name: "Bebidas", slug: "bebidas", order: 2, isActive: true },
    { _id: "cat_03", name: "Golosinas", slug: "golosinas", order: 3, isActive: true },
    { _id: "cat_04", name: "Limpieza", slug: "limpieza", order: 4, isActive: true },
    { _id: "cat_05", name: "Snacks", slug: "snacks", order: 5, isActive: true },
    { _id: "cat_06", name: "Sin categor\xEDa", slug: "sin-categoria", order: 999, isActive: true }
  ];
}

// server/lib/db-store.ts
initSeedData();
var dbService = {
  // Counter
  async getNextOrderNumber() {
    if (isMongoConnected()) {
      try {
        const counter = await CounterModel.findOneAndUpdate(
          { _id: "order_number" },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        if (counter && counter.seq) {
          return `#DQ-${counter.seq}`;
        }
      } catch (err) {
        console.warn("Counter mongo query error, fallback to memory:", err);
      }
    }
    memoryStore.counter += 1;
    return `#DQ-${memoryStore.counter}`;
  },
  // Products
  async getCatalogProducts(params) {
    let list = [];
    if (isMongoConnected()) {
      try {
        const query = { isPaused: false };
        if (params.category && params.category !== "todos") {
          query.category = new RegExp(`^${params.category}$`, "i");
        }
        if (params.search) {
          query.$or = [
            { title: new RegExp(params.search, "i") },
            { brand: new RegExp(params.search, "i") },
            { sku: new RegExp(params.search, "i") }
          ];
        }
        let sortOption = { createdAt: -1 };
        if (params.sort === "min") sortOption = { priceBulk: 1 };
        if (params.sort === "max") sortOption = { priceBulk: -1 };
        if (params.sort === "brand") sortOption = { brand: 1 };
        list = await ProductModel.find(query).sort(sortOption).lean();
      } catch (err) {
        console.warn("Mongo catalog query failed, falling back:", err);
        list = memoryStore.products.filter((p) => !p.isPaused);
      }
    } else {
      list = memoryStore.products.filter((p) => !p.isPaused);
    }
    if (!isMongoConnected() || list.length === 0) {
      list = memoryStore.products.filter((p) => !p.isPaused);
      if (params.category && params.category !== "todos") {
        const catLower = params.category.toLowerCase();
        list = list.filter((p) => p.category.toLowerCase() === catLower);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (p) => p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
        );
      }
      if (params.sort === "min") {
        list.sort((a, b) => a.priceBulk - b.priceBulk);
      } else if (params.sort === "max") {
        list.sort((a, b) => b.priceBulk - a.priceBulk);
      } else if (params.sort === "brand") {
        list.sort((a, b) => a.brand.localeCompare(b.brand));
      } else if (params.sort === "bulk") {
        list.sort((a, b) => b.priceUnit * b.unitsPerBulk - b.priceBulk - (a.priceUnit * a.unitsPerBulk - a.priceBulk));
      }
    }
    return list;
  },
  async getAllProductsAdmin() {
    if (isMongoConnected()) {
      try {
        return await ProductModel.find().sort({ createdAt: -1 }).lean();
      } catch (e) {
        console.warn(e);
      }
    }
    return memoryStore.products;
  },
  async getProductById(id) {
    if (isMongoConnected()) {
      try {
        if (mongoose3.Types.ObjectId.isValid(id)) {
          const byId = await ProductModel.findById(id).lean();
          if (byId) return byId;
        }
        const bySlug = await ProductModel.findOne({ slug: id }).lean();
        if (bySlug) return bySlug;
      } catch (e) {
        console.warn("Mongo getProductById error:", e);
      }
    }
    return memoryStore.products.find((p) => p._id === id || p.slug === id) || null;
  },
  async createProduct(data, user) {
    let created = null;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const productPayload = {
      ...data,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      createdAt: now,
      updatedAt: now
    };
    if (isMongoConnected()) {
      try {
        created = await ProductModel.create(productPayload);
      } catch (e) {
        console.warn("Mongo createProduct failed:", e);
      }
    }
    if (!created) {
      created = {
        _id: "prod_" + Date.now(),
        ...productPayload
      };
      memoryStore.products.unshift(created);
    }
    await this.createAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "CREATE",
      entity: "Product",
      entityId: created._id.toString(),
      beforeSnapshot: null,
      afterSnapshot: created
    });
    return created;
  },
  async updateProduct(id, updates, user) {
    const before = await this.getProductById(id);
    let updated = null;
    if (isMongoConnected()) {
      try {
        updated = await ProductModel.findByIdAndUpdate(
          id,
          { ...updates, updatedAt: /* @__PURE__ */ new Date() },
          { new: true }
        ).lean();
      } catch (e) {
        console.warn("Mongo updateProduct error:", e);
      }
    }
    if (!updated) {
      const idx = memoryStore.products.findIndex((p) => p._id === id);
      if (idx !== -1) {
        memoryStore.products[idx] = {
          ...memoryStore.products[idx],
          ...updates,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        updated = memoryStore.products[idx];
      }
    }
    if (updated) {
      await this.createAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: updates.isPaused !== void 0 && before && updates.isPaused !== before.isPaused ? "PAUSE" : "UPDATE",
        entity: "Product",
        entityId: id,
        beforeSnapshot: before,
        afterSnapshot: updated
      });
    }
    return updated;
  },
  async deleteProduct(id, user) {
    const before = await this.getProductById(id);
    if (!before) return false;
    if (isMongoConnected()) {
      try {
        await ProductModel.findByIdAndDelete(id);
      } catch (e) {
        console.warn(e);
      }
    }
    const idx = memoryStore.products.findIndex((p) => p._id === id);
    if (idx !== -1) {
      memoryStore.products.splice(idx, 1);
    }
    await this.createAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "DELETE",
      entity: "Product",
      entityId: id,
      beforeSnapshot: before,
      afterSnapshot: null
    });
    return true;
  },
  // Orders
  async createOrder(data) {
    let calculatedItems = [];
    let totalAmount = 0;
    for (const item of data.items) {
      const product = await this.getProductById(item.productId);
      if (!product) continue;
      const unitPrice = item.purchaseType === "bulk" ? product.priceBulk : product.priceUnit;
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;
      calculatedItems.push({
        productId: product._id,
        title: product.title,
        purchaseType: item.purchaseType,
        quantity: item.quantity,
        unitPrice,
        subtotal
      });
    }
    const orderNumber = await this.getNextOrderNumber();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const orderPayload = {
      orderNumber,
      customer: data.customer,
      items: calculatedItems,
      totalAmount,
      status: "Solicitado",
      statusHistory: [
        {
          status: "Solicitado",
          changedBy: "Cliente Web",
          timestamp: now
        }
      ],
      createdAt: now,
      updatedAt: now
    };
    let created = null;
    if (isMongoConnected()) {
      try {
        created = await OrderModel.create(orderPayload);
      } catch (e) {
        console.warn("Mongo createOrder error:", e);
      }
    }
    if (!created) {
      created = {
        _id: "ord_" + Date.now(),
        ...orderPayload
      };
      memoryStore.orders.unshift(created);
    }
    return created;
  },
  async getOrders(filterStatus) {
    if (isMongoConnected()) {
      try {
        const query = {};
        if (filterStatus && filterStatus !== "all") {
          query.status = filterStatus;
        }
        return await OrderModel.find(query).sort({ createdAt: -1 }).lean();
      } catch (e) {
        console.warn(e);
      }
    }
    let list = [...memoryStore.orders];
    if (filterStatus && filterStatus !== "all") {
      list = list.filter((o) => o.status === filterStatus);
    }
    return list;
  },
  async updateOrderStatus(id, newStatus, user) {
    let before = null;
    let updated = null;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (isMongoConnected()) {
      try {
        before = await OrderModel.findById(id).lean();
        if (before) {
          updated = await OrderModel.findByIdAndUpdate(
            id,
            {
              status: newStatus,
              $push: {
                statusHistory: {
                  status: newStatus,
                  changedBy: user.name,
                  timestamp: now
                }
              },
              updatedAt: now
            },
            { new: true }
          ).lean();
        }
      } catch (e) {
        console.warn(e);
      }
    }
    if (!updated) {
      const idx = memoryStore.orders.findIndex((o) => o._id === id || o.orderNumber === id);
      if (idx !== -1) {
        before = { ...memoryStore.orders[idx] };
        memoryStore.orders[idx].status = newStatus;
        memoryStore.orders[idx].statusHistory.push({
          status: newStatus,
          changedBy: user.name,
          timestamp: now
        });
        memoryStore.orders[idx].updatedAt = now;
        updated = memoryStore.orders[idx];
      }
    }
    if (updated) {
      await this.createAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "STATUS_CHANGE",
        entity: "Order",
        entityId: id,
        beforeSnapshot: before,
        afterSnapshot: updated
      });
    }
    return updated;
  },
  // Audit Logs
  async createAuditLog(entry) {
    const payload = {
      ...entry,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (isMongoConnected()) {
      try {
        await AuditLogModel.create(payload);
        return;
      } catch (e) {
        console.warn("Mongo audit log error:", e);
      }
    }
    memoryStore.auditLogs.unshift({
      _id: "audit_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      ...payload
    });
  },
  async getAuditLogs(limit = 50) {
    if (isMongoConnected()) {
      try {
        return await AuditLogModel.find().sort({ createdAt: -1 }).limit(limit).lean();
      } catch (e) {
        console.warn(e);
      }
    }
    return memoryStore.auditLogs.slice(0, limit);
  },
  // Users
  async findUserByEmail(email) {
    const normalized = email.toLowerCase().trim();
    if (isMongoConnected()) {
      try {
        return await UserModel.findOne({ email: normalized }).lean();
      } catch (e) {
        console.warn(e);
      }
    }
    return memoryStore.users.find((u) => u.email.toLowerCase() === normalized) || null;
  },
  async getAllUsers() {
    if (isMongoConnected()) {
      try {
        return await UserModel.find({}, { password: 0 }).sort({ createdAt: -1 }).lean();
      } catch (e) {
        console.warn(e);
      }
    }
    return memoryStore.users.map(({ password, ...rest }) => rest);
  },
  async createUser(userData, adminUser) {
    const hashedPassword = await bcrypt2.hash(userData.password, 10);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const payload = {
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      password: hashedPassword,
      role: userData.role || "admin",
      isActive: true,
      createdAt: now,
      updatedAt: now
    };
    let created = null;
    if (isMongoConnected()) {
      try {
        created = await UserModel.create(payload);
      } catch (e) {
        console.warn(e);
      }
    }
    if (!created) {
      created = {
        _id: "usr_" + Date.now(),
        ...payload
      };
      memoryStore.users.push(created);
    }
    const { password, ...safeUser } = created;
    await this.createAuditLog({
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: "CREATE",
      entity: "User",
      entityId: created._id.toString(),
      beforeSnapshot: null,
      afterSnapshot: safeUser
    });
    return safeUser;
  },
  // Banners
  async getBanners() {
    if (isMongoConnected()) {
      try {
        return await BannerModel.find({ isActive: true }).sort({ order: 1 }).lean();
      } catch (e) {
        console.warn(e);
      }
    }
    return memoryStore.banners.filter((b) => b.isActive).sort((a, b) => (a.order || 0) - (b.order || 0));
  },
  async getAllBannersAdmin() {
    if (isMongoConnected()) {
      try {
        return await BannerModel.find().sort({ order: 1 }).lean();
      } catch (e) {
        console.warn(e);
      }
    }
    return [...memoryStore.banners].sort((a, b) => (a.order || 0) - (b.order || 0));
  },
  async createBanner(data, adminUser) {
    let created;
    if (isMongoConnected()) {
      try {
        created = await BannerModel.create({
          title: data.title || "",
          imageUrl: data.imageUrl,
          targetCategory: data.targetCategory || "all",
          isActive: data.isActive !== void 0 ? data.isActive : true,
          order: data.order !== void 0 ? Number(data.order) : 0
        });
        created = created.toObject();
      } catch (e) {
        console.warn("Mongo create banner error:", e);
      }
    }
    if (!created) {
      created = {
        _id: "banner_" + Date.now(),
        title: data.title || "",
        imageUrl: data.imageUrl,
        targetCategory: data.targetCategory || "all",
        isActive: data.isActive !== void 0 ? data.isActive : true,
        order: data.order !== void 0 ? Number(data.order) : 0
      };
      memoryStore.banners.push(created);
    }
    await this.createAuditLog({
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: "CREATE",
      entity: "Banner",
      entityId: created._id.toString(),
      beforeSnapshot: null,
      afterSnapshot: created
    });
    return created;
  },
  async updateBanner(id, data, adminUser) {
    let beforeSnapshot = null;
    let updated = null;
    if (isMongoConnected()) {
      try {
        beforeSnapshot = await BannerModel.findById(id).lean();
        if (beforeSnapshot) {
          updated = await BannerModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
        }
      } catch (e) {
        console.warn("Mongo update banner error:", e);
      }
    }
    if (!updated) {
      const idx = memoryStore.banners.findIndex((b) => b._id.toString() === id);
      if (idx !== -1) {
        beforeSnapshot = { ...memoryStore.banners[idx] };
        memoryStore.banners[idx] = { ...memoryStore.banners[idx], ...data };
        updated = memoryStore.banners[idx];
      }
    }
    if (updated) {
      await this.createAuditLog({
        userId: adminUser.id,
        userName: adminUser.name,
        userRole: adminUser.role,
        action: "UPDATE",
        entity: "Banner",
        entityId: id,
        beforeSnapshot,
        afterSnapshot: updated
      });
    }
    return updated;
  },
  async deleteBanner(id, adminUser) {
    let beforeSnapshot = null;
    if (isMongoConnected()) {
      try {
        beforeSnapshot = await BannerModel.findById(id).lean();
        if (beforeSnapshot) {
          await BannerModel.findByIdAndDelete(id);
        }
      } catch (e) {
        console.warn("Mongo delete banner error:", e);
      }
    }
    if (!beforeSnapshot) {
      const idx = memoryStore.banners.findIndex((b) => b._id.toString() === id);
      if (idx !== -1) {
        beforeSnapshot = memoryStore.banners[idx];
        memoryStore.banners.splice(idx, 1);
      }
    }
    if (beforeSnapshot) {
      await this.createAuditLog({
        userId: adminUser.id,
        userName: adminUser.name,
        userRole: adminUser.role,
        action: "DELETE",
        entity: "Banner",
        entityId: id,
        beforeSnapshot,
        afterSnapshot: null
      });
      return true;
    }
    return false;
  },
  // Categories
  async ensureInitialCategories() {
    if (isMongoConnected()) {
      try {
        const count = await CategoryModel.countDocuments();
        if (count === 0) {
          console.log("\u{1F331} Seeding initial categories into MongoDB...");
          const initial = [
            { name: "Almac\xE9n", slug: "almacen", order: 1, isActive: true },
            { name: "Bebidas", slug: "bebidas", order: 2, isActive: true },
            { name: "Golosinas", slug: "golosinas", order: 3, isActive: true },
            { name: "Limpieza", slug: "limpieza", order: 4, isActive: true },
            { name: "Snacks", slug: "snacks", order: 5, isActive: true },
            { name: "Sin categor\xEDa", slug: "sin-categoria", order: 999, isActive: true }
          ];
          await CategoryModel.insertMany(initial);
          console.log("\u2705 Initial categories seeded.");
        }
      } catch (e) {
        console.warn("Error ensuring categories in mongo:", e);
      }
    }
  },
  async getCategories(includeInactive = false) {
    await this.ensureInitialCategories();
    let categories = [];
    if (isMongoConnected()) {
      try {
        const query = includeInactive ? {} : { isActive: true };
        categories = await CategoryModel.find(query).sort({ order: 1, name: 1 }).lean();
        const counts = await ProductModel.aggregate([
          { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);
        const countMap = new Map(counts.map((c) => [c._id, c.count]));
        return categories.map((cat) => ({
          ...cat,
          productCount: countMap.get(cat.name) || 0
        }));
      } catch (e) {
        console.warn("Mongo getCategories error:", e);
      }
    }
    const list = includeInactive ? memoryStore.categories : memoryStore.categories.filter((c) => c.isActive);
    return list.map((cat) => ({
      ...cat,
      productCount: memoryStore.products.filter((p) => p.category === cat.name).length
    })).sort((a, b) => (a.order || 0) - (b.order || 0));
  },
  async createCategory(data, adminUser) {
    const name = data.name.trim();
    const slug = data.slug ? data.slug.toLowerCase().trim() : name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    let created;
    if (isMongoConnected()) {
      try {
        const existing = await CategoryModel.findOne({
          $or: [{ name: new RegExp(`^${name}$`, "i") }, { slug }]
        });
        if (existing) {
          throw new Error("Ya existe una categor\xEDa con ese nombre o slug.");
        }
        created = await CategoryModel.create({
          name,
          slug,
          order: data.order !== void 0 ? Number(data.order) : 0,
          isActive: data.isActive !== void 0 ? data.isActive : true
        });
        created = created.toObject();
      } catch (e) {
        if (e.message.includes("Ya existe")) throw e;
        console.warn("Mongo create category error:", e);
      }
    }
    if (!created) {
      const existing = memoryStore.categories.find((c) => c.name.toLowerCase() === name.toLowerCase() || c.slug === slug);
      if (existing) {
        throw new Error("Ya existe una categor\xEDa con ese nombre o slug.");
      }
      created = {
        _id: "cat_" + Date.now(),
        name,
        slug,
        order: data.order !== void 0 ? Number(data.order) : 0,
        isActive: data.isActive !== void 0 ? data.isActive : true
      };
      memoryStore.categories.push(created);
    }
    await this.createAuditLog({
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: "CREATE",
      entity: "Category",
      entityId: created._id.toString(),
      beforeSnapshot: null,
      afterSnapshot: created
    });
    return created;
  },
  async updateCategory(id, data, adminUser) {
    let beforeSnapshot = null;
    let updated = null;
    if (isMongoConnected()) {
      try {
        beforeSnapshot = await CategoryModel.findById(id).lean();
        if (beforeSnapshot) {
          if (data.name && data.name.trim() !== beforeSnapshot.name) {
            const newName = data.name.trim();
            const existing = await CategoryModel.findOne({
              _id: { $ne: id },
              name: new RegExp(`^${newName}$`, "i")
            });
            if (existing) {
              throw new Error("Ya existe otra categor\xEDa con ese nombre.");
            }
            await ProductModel.updateMany({ category: beforeSnapshot.name }, { $set: { category: newName } });
          }
          updated = await CategoryModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
        }
      } catch (e) {
        if (e.message.includes("Ya existe")) throw e;
        console.warn("Mongo update category error:", e);
      }
    }
    if (!updated) {
      const idx = memoryStore.categories.findIndex((c) => c._id.toString() === id);
      if (idx !== -1) {
        beforeSnapshot = { ...memoryStore.categories[idx] };
        if (data.name && data.name.trim() !== beforeSnapshot.name) {
          const newName = data.name.trim();
          const existing = memoryStore.categories.find((c) => c._id.toString() !== id && c.name.toLowerCase() === newName.toLowerCase());
          if (existing) {
            throw new Error("Ya existe otra categor\xEDa con ese nombre.");
          }
          memoryStore.products.forEach((p) => {
            if (p.category === beforeSnapshot.name) p.category = newName;
          });
        }
        memoryStore.categories[idx] = { ...memoryStore.categories[idx], ...data };
        updated = memoryStore.categories[idx];
      }
    }
    if (updated) {
      await this.createAuditLog({
        userId: adminUser.id,
        userName: adminUser.name,
        userRole: adminUser.role,
        action: "UPDATE",
        entity: "Category",
        entityId: id,
        beforeSnapshot,
        afterSnapshot: updated
      });
    }
    return updated;
  },
  async deleteCategory(id, reassignToCategoryId, adminUser) {
    let catToDelete = null;
    let targetCategoryName = "Sin categor\xEDa";
    if (isMongoConnected()) {
      try {
        catToDelete = await CategoryModel.findById(id).lean();
        if (!catToDelete) return { success: false, error: "Categor\xEDa no encontrada." };
        if (catToDelete.name.toLowerCase() === "sin categor\xEDa" || catToDelete.slug === "sin-categoria") {
          throw new Error('No se puede eliminar la categor\xEDa de resguardo "Sin categor\xEDa".');
        }
        if (reassignToCategoryId && reassignToCategoryId !== id) {
          const target = await CategoryModel.findById(reassignToCategoryId).lean();
          if (target) {
            targetCategoryName = target.name;
          }
        } else {
          let defaultCat = await CategoryModel.findOne({ slug: "sin-categoria" });
          if (!defaultCat) {
            defaultCat = await CategoryModel.create({
              name: "Sin categor\xEDa",
              slug: "sin-categoria",
              order: 999,
              isActive: true
            });
          }
          targetCategoryName = defaultCat.name;
        }
        const reassignResult = await ProductModel.updateMany(
          { category: catToDelete.name },
          { $set: { category: targetCategoryName } }
        );
        await BannerModel.updateMany(
          { targetCategory: { $in: [catToDelete.name, catToDelete.slug] } },
          { $set: { targetCategory: "all" } }
        );
        await CategoryModel.findByIdAndDelete(id);
        await this.createAuditLog({
          userId: adminUser.id,
          userName: adminUser.name,
          userRole: adminUser.role,
          action: "DELETE",
          entity: "Category",
          entityId: id,
          beforeSnapshot: { ...catToDelete, reassignedCount: reassignResult.modifiedCount, targetCategory: targetCategoryName },
          afterSnapshot: null
        });
        return {
          success: true,
          reassignedCount: reassignResult.modifiedCount,
          targetCategory: targetCategoryName
        };
      } catch (e) {
        console.warn("Mongo delete category error:", e);
        throw e;
      }
    }
    const idx = memoryStore.categories.findIndex((c) => c._id.toString() === id);
    if (idx === -1) return { success: false, error: "Categor\xEDa no encontrada." };
    catToDelete = memoryStore.categories[idx];
    if (catToDelete.name.toLowerCase() === "sin categor\xEDa" || catToDelete.slug === "sin-categoria") {
      throw new Error('No se puede eliminar la categor\xEDa de resguardo "Sin categor\xEDa".');
    }
    if (reassignToCategoryId && reassignToCategoryId !== id) {
      const target = memoryStore.categories.find((c) => c._id.toString() === reassignToCategoryId);
      if (target) targetCategoryName = target.name;
    } else {
      let defaultCat = memoryStore.categories.find((c) => c.slug === "sin-categoria");
      if (!defaultCat) {
        defaultCat = { _id: "cat_default", name: "Sin categor\xEDa", slug: "sin-categoria", order: 999, isActive: true };
        memoryStore.categories.push(defaultCat);
      }
      targetCategoryName = defaultCat.name;
    }
    let reassignedCount = 0;
    memoryStore.products.forEach((p) => {
      if (p.category === catToDelete.name) {
        p.category = targetCategoryName;
        reassignedCount++;
      }
    });
    memoryStore.banners.forEach((b) => {
      if (b.targetCategory === catToDelete.name || b.targetCategory === catToDelete.slug) {
        b.targetCategory = "all";
      }
    });
    memoryStore.categories.splice(idx, 1);
    await this.createAuditLog({
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: "DELETE",
      entity: "Category",
      entityId: id,
      beforeSnapshot: { ...catToDelete, reassignedCount, targetCategory: targetCategoryName },
      afterSnapshot: null
    });
    return {
      success: true,
      reassignedCount,
      targetCategory: targetCategoryName
    };
  }
};

// server/lib/auth.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.NEXTAUTH_SECRET || "distriquiero_jwt_secret_dev_key_2026";
function signAuthToken(user) {
  const payload = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
function verifyAuthToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.headers["x-auth-token"]) {
    token = req.headers["x-auth-token"];
  }
  if (!token) {
    res.status(401).json({ error: "Acceso no autorizado. Se requiere token de sesi\xF3n." });
    return;
  }
  const payload = verifyAuthToken(token);
  if (!payload) {
    res.status(401).json({ error: "Sesi\xF3n inv\xE1lida o expirada. Vuelva a iniciar sesi\xF3n." });
    return;
  }
  req.user = payload;
  next();
}
function requireSuperadmin(req, res, next) {
  if (!req.user || req.user.role !== "superadmin") {
    res.status(403).json({ error: "Acceso restringido. Se requiere rol de Superadmin." });
    return;
  }
  next();
}

// server/routes/auth.ts
var router = Router();
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Debe ingresar correo y contrase\xF1a." });
      return;
    }
    const user = await dbService.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: "Credenciales inv\xE1lidas. Usuario no encontrado." });
      return;
    }
    if (!user.isActive) {
      res.status(403).json({ error: "Esta cuenta de administrador se encuentra inactiva." });
      return;
    }
    const isValid = await bcrypt3.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ error: "Credenciales inv\xE1lidas. Contrase\xF1a incorrecta." });
      return;
    }
    const token = signAuthToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Error del servidor al procesar autenticaci\xF3n." });
  }
});
router.all("/[:punct:]*nextauth*", async (req, res) => {
  if (req.method === "POST") {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400).json({ error: "Missing credentials" });
      return;
    }
    const user = await dbService.findUserByEmail(email);
    if (user && user.isActive && await bcrypt3.compare(password, user.password)) {
      const token = signAuthToken(user);
      res.json({
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token
      });
      return;
    }
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  res.json({ status: "ok", provider: "credentials" });
});
router.get("/session", async (req, res) => {
  const authHeader = req.headers.authorization;
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  if (!token) {
    res.status(401).json({ user: null });
    return;
  }
  const payload = verifyAuthToken(token);
  if (!payload) {
    res.status(401).json({ user: null });
    return;
  }
  res.json({
    user: payload,
    authenticated: true
  });
});
var auth_default = router;

// server/routes/catalog.ts
import { Router as Router2 } from "express";
var router2 = Router2();
router2.get("/", async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const products = await dbService.getCatalogProducts({
      search: search ? String(search) : void 0,
      category: category ? String(category) : void 0,
      sort: sort ? String(sort) : void 0
    });
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    console.error("Error fetching catalog:", err);
    res.status(500).json({ error: "Error al obtener cat\xE1logo de productos." });
  }
});
router2.get(["/banners", "/banners/list"], async (_req, res) => {
  try {
    const banners = await dbService.getBanners();
    res.json({ success: true, banners });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener banners." });
  }
});
router2.get(["/categories", "/categories/list"], async (_req, res) => {
  try {
    const categories = await dbService.getCategories(false);
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener categor\xEDas." });
  }
});
router2.get("/:id", async (req, res) => {
  try {
    const product = await dbService.getProductById(req.params.id);
    if (!product || product.isPaused) {
      res.status(404).json({ error: "Producto no disponible o dado de baja." });
      return;
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener detalle del producto." });
  }
});
var catalog_default = router2;

// server/routes/orders.ts
import { Router as Router3 } from "express";
import { z } from "zod";

// server/lib/whatsapp.ts
function formatWhatsAppMessage(order, companyPhone) {
  const phone = companyPhone || process.env.COMPANY_WHATSAPP_PHONE || "5491145982210";
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const itemsText = order.items.map((item) => {
    const typeLabel = item.purchaseType === "bulk" ? "(Bulto)" : "(Unidad)";
    const formattedSubtotal = `$${item.subtotal.toLocaleString("es-AR")}`;
    return `\u2022 ${item.quantity}x ${item.title} ${typeLabel} - ${formattedSubtotal}`;
  }).join("\n\n");
  const formattedTotal = `$${order.totalAmount.toLocaleString("es-AR")}`;
  const businessLine = order.customer.businessName ? `Comercio: ${order.customer.businessName}
` : "";
  const message = `\u{1F6D2} NUEVO PEDIDO - DISTRIQUIERO
Pedido: ${order.orderNumber}
Cliente: ${order.customer.firstName} ${order.customer.lastName}
${businessLine}Tel\xE9fono: ${order.customer.phone}

\u{1F4CB} DETALLE DEL PEDIDO:

${itemsText}

\u{1F4B0} TOTAL ESTIMADO: ${formattedTotal}
Pedido generado desde la web. Aguardo confirmaci\xF3n para coordinar entrega y pago.`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
  return {
    whatsappUrl,
    formattedMessage: message
  };
}

// server/routes/orders.ts
var router3 = Router3();
var OrderCreationSchema = z.object({
  customer: z.object({
    firstName: z.string().trim().min(2, "El nombre es obligatorio"),
    lastName: z.string().trim().min(2, "El apellido es obligatorio"),
    phone: z.string().trim().min(6, "El tel\xE9fono es obligatorio"),
    businessName: z.string().trim().optional()
  }),
  items: z.array(z.object({
    productId: z.string(),
    purchaseType: z.enum(["unit", "bulk"]),
    quantity: z.number().int().min(1, "La cantidad debe ser al menos 1")
  })).min(1, "El carrito debe contener al menos un producto")
});
router3.post("/", async (req, res) => {
  try {
    const parseResult = OrderCreationSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Datos de pedido inv\xE1lidos",
        details: parseResult.error.flatten()
      });
      return;
    }
    const { customer, items } = parseResult.data;
    let cleanPhone = customer.phone.replace(/[^0-9+]/g, "");
    if (!cleanPhone.startsWith("+")) {
      if (cleanPhone.startsWith("54")) {
        cleanPhone = "+" + cleanPhone;
      } else {
        cleanPhone = "+54 9 " + cleanPhone;
      }
    }
    const createdOrder = await dbService.createOrder({
      customer: {
        ...customer,
        phone: cleanPhone
      },
      items
    });
    const { whatsappUrl, formattedMessage } = formatWhatsAppMessage(createdOrder);
    res.status(201).json({
      success: true,
      order: createdOrder,
      whatsappUrl,
      formattedMessage
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Error al registrar el pedido en el servidor." });
  }
});
router3.get(["/", "/admin/list"], authMiddleware, async (req, res) => {
  try {
    const status = req.query.status;
    const orders = await dbService.getOrders(status);
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    console.error("Error listing orders:", err);
    res.status(500).json({ error: "Error al obtener lista de pedidos." });
  }
});
router3.patch(["/:id/status", "/admin/:id/status"], authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !["Solicitado", "Contestado"].includes(status)) {
      res.status(400).json({ error: "Estado inv\xE1lido. Debe ser Solicitado o Contestado." });
      return;
    }
    const updated = await dbService.updateOrderStatus(
      req.params.id,
      status,
      {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role
      }
    );
    if (!updated) {
      res.status(404).json({ error: "Pedido no encontrado." });
      return;
    }
    res.json({ success: true, order: updated });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ error: "Error al actualizar estado del pedido." });
  }
});
var orders_default = router3;

// server/routes/adminProducts.ts
import { Router as Router4 } from "express";
import { z as z2 } from "zod";
var router4 = Router4();
var BaseProductSchema = z2.object({
  title: z2.string().trim().min(2, "El t\xEDtulo es requerido"),
  slug: z2.string().trim().optional(),
  sku: z2.string().trim().optional().default(""),
  brand: z2.string().trim().optional().default(""),
  category: z2.string().trim().min(1, "La categor\xEDa es requerida"),
  description: z2.string().optional().default(""),
  images: z2.array(z2.string()).optional().default([]),
  priceUnit: z2.number().min(0, "El precio unitario no puede ser negativo"),
  priceBulk: z2.number().min(0, "El precio mayorista no puede ser negativo"),
  unitsPerBulk: z2.number().int().min(1, "Debe contener al menos 1 unidad por bulto").default(12),
  isOffer: z2.boolean().optional().default(false),
  isPaused: z2.boolean().optional().default(false)
});
var ProductSchema2 = BaseProductSchema.refine(
  (data) => data.priceBulk <= data.priceUnit * data.unitsPerBulk,
  {
    message: "El precio por bulto debe ser menor o igual al total de las unidades sueltas (debe representar un ahorro comercial).",
    path: ["priceBulk"]
  }
);
var ProductUpdateSchema = BaseProductSchema.partial().refine(
  (data) => {
    if (data.priceBulk !== void 0 && data.priceUnit !== void 0 && data.unitsPerBulk !== void 0) {
      return data.priceBulk <= data.priceUnit * data.unitsPerBulk;
    }
    return true;
  },
  {
    message: "El precio por bulto debe ser menor o igual al total de las unidades sueltas.",
    path: ["priceBulk"]
  }
);
router4.get("/", authMiddleware, async (req, res) => {
  try {
    const products = await dbService.getAllProductsAdmin();
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ error: "Error al listar productos de administraci\xF3n." });
  }
});
router4.post("/", authMiddleware, async (req, res) => {
  try {
    const parsed = ProductSchema2.safeParse(req.body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message;
      res.status(400).json({
        error: firstIssue || "Validaci\xF3n fallida",
        details: parsed.error.flatten()
      });
      return;
    }
    const created = await dbService.createProduct(parsed.data, {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role
    });
    res.status(201).json({ success: true, product: created });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Error al registrar el nuevo producto." });
  }
});
router4.put("/:id", authMiddleware, async (req, res) => {
  try {
    const parsed = ProductUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message;
      res.status(400).json({
        error: firstIssue || "Validaci\xF3n fallida",
        details: parsed.error.flatten()
      });
      return;
    }
    const updated = await dbService.updateProduct(req.params.id, parsed.data, {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role
    });
    if (!updated) {
      res.status(404).json({ error: "Producto no encontrado." });
      return;
    }
    res.json({ success: true, product: updated });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Error al actualizar producto." });
  }
});
router4.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const success = await dbService.deleteProduct(req.params.id, {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role
    });
    if (!success) {
      res.status(404).json({ error: "Producto no encontrado." });
      return;
    }
    res.json({ success: true, message: "Producto eliminado y auditado correctamente." });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Error al eliminar producto." });
  }
});
var adminProducts_default = router4;

// server/routes/adminUpload.ts
import { Router as Router5 } from "express";
import multer from "multer";

// server/lib/imagekit.ts
async function uploadToImageKit(fileBuffer, fileName, folder = "/products") {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/distriquiero";
  if (privateKey && publicKey) {
    try {
      const base64File = fileBuffer.toString("base64");
      const formData = new FormData();
      formData.append("file", base64File);
      formData.append("fileName", fileName);
      formData.append("folder", folder);
      formData.append("useUniqueFileName", "true");
      const authHeader = "Basic " + Buffer.from(privateKey + ":").toString("base64");
      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        headers: {
          Authorization: authHeader
        },
        body: formData
      });
      if (response.ok) {
        const result = await response.json();
        return {
          fileId: result.fileId,
          url: result.url,
          name: result.name,
          thumbnailUrl: result.thumbnailUrl || result.url
        };
      }
      console.warn("ImageKit upload returned non-200 status:", await response.text());
    } catch (err) {
      console.warn("ImageKit API error, falling back to local buffer delivery:", err);
    }
  }
  const base64 = fileBuffer.toString("base64");
  const mimeType = fileName.endsWith(".png") ? "image/png" : fileName.endsWith(".webp") ? "image/webp" : "image/jpeg";
  const dataUrl = `data:${mimeType};base64,${base64}`;
  const mockFileId = "ik_local_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  return {
    fileId: mockFileId,
    url: dataUrl,
    name: fileName,
    thumbnailUrl: dataUrl
  };
}

// server/routes/adminUpload.ts
var router5 = Router5();
var ALLOWED_MIME_TYPES = /* @__PURE__ */ new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
var upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Formatos admitidos: JPEG, PNG, WEBP, GIF.`));
    }
  }
});
var handleUploadMiddleware = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Error al procesar archivo de subida." });
    }
    next();
  });
};
router5.post(
  "/",
  authMiddleware,
  handleUploadMiddleware,
  async (req, res) => {
    try {
      if (req.file) {
        const fileName = req.file.originalname || `upload_${Date.now()}.jpg`;
        const result = await uploadToImageKit(req.file.buffer, fileName);
        res.json({
          success: true,
          url: result.url,
          fileId: result.fileId,
          name: result.name,
          thumbnailUrl: result.thumbnailUrl
        });
        return;
      }
      if (req.body && req.body.base64Data) {
        const { base64Data, fileName } = req.body;
        if (typeof base64Data !== "string") {
          res.status(400).json({ error: "Formato de base64 inv\xE1lido." });
          return;
        }
        const matches = base64Data.match(/^data:(image\/(jpeg|png|webp|gif));base64,(.+)$/);
        if (!matches) {
          res.status(400).json({
            error: "Formato de imagen base64 no permitido. Debe ser data:image/(jpeg|png|webp|gif);base64,..."
          });
          return;
        }
        const mimeType = matches[1];
        const buffer = Buffer.from(matches[3], "base64");
        const ext = mimeType.split("/")[1] === "jpeg" ? "jpg" : mimeType.split("/")[1];
        const name = fileName || `product_${Date.now()}.${ext}`;
        const result = await uploadToImageKit(buffer, name);
        res.json({
          success: true,
          url: result.url,
          fileId: result.fileId,
          name: result.name,
          thumbnailUrl: result.thumbnailUrl
        });
        return;
      }
      res.status(400).json({ error: "No se recibi\xF3 ning\xFAn archivo de imagen para subir." });
    } catch (err) {
      console.error("Upload handler error:", err);
      res.status(500).json({ error: "Error al procesar la subida a ImageKit." });
    }
  }
);
var adminUpload_default = router5;

// server/routes/adminAudit.ts
import { Router as Router6 } from "express";
var router6 = Router6();
router6.get("/", authMiddleware, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;
    const logs = await dbService.getAuditLogs(limit);
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: "Error al recuperar registros de auditor\xEDa." });
  }
});
var adminAudit_default = router6;

// server/routes/adminUsers.ts
import { Router as Router7 } from "express";
import { z as z3 } from "zod";
var router7 = Router7();
var UserCreationSchema = z3.object({
  name: z3.string().trim().min(2, "El nombre es requerido"),
  email: z3.string().trim().email("Correo electr\xF3nico inv\xE1lido"),
  password: z3.string().min(6, "La contrase\xF1a debe tener al menos 6 caracteres"),
  role: z3.enum(["superadmin", "admin"]).default("admin")
});
router7.get("/", authMiddleware, requireSuperadmin, async (req, res) => {
  try {
    const users = await dbService.getAllUsers();
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener usuarios administradores." });
  }
});
router7.post("/", authMiddleware, requireSuperadmin, async (req, res) => {
  try {
    const parsed = UserCreationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validaci\xF3n de usuario fallida", details: parsed.error.flatten() });
      return;
    }
    const existing = await dbService.findUserByEmail(parsed.data.email);
    if (existing) {
      res.status(409).json({ error: "Ya existe un usuario registrado con este correo." });
      return;
    }
    const created = await dbService.createUser(parsed.data, {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role
    });
    res.status(201).json({ success: true, user: created });
  } catch (err) {
    console.error("Error creating admin user:", err);
    res.status(500).json({ error: "Error al registrar nuevo administrador." });
  }
});
var adminUsers_default = router7;

// server/routes/adminCategories.ts
import { Router as Router8 } from "express";
var router8 = Router8();
router8.get("/", authMiddleware, async (_req, res) => {
  try {
    const categories = await dbService.getCategories(true);
    res.json({ success: true, count: categories.length, categories });
  } catch (err) {
    console.error("Error in GET /api/admin/categories:", err);
    res.status(500).json({ error: "Error al recuperar categor\xEDas administrativas." });
  }
});
router8.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, slug, order, isActive } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ error: "El nombre de la categor\xEDa es obligatorio." });
      return;
    }
    const category = await dbService.createCategory(
      { name, slug, order, isActive },
      req.user
    );
    res.status(201).json({ success: true, category });
  } catch (err) {
    console.error("Error in POST /api/admin/categories:", err);
    res.status(400).json({ error: err.message || "Error al crear la categor\xEDa." });
  }
});
router8.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name, slug, order, isActive } = req.body;
    const updateData = {};
    if (name !== void 0) {
      if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({ error: "El nombre de la categor\xEDa no puede estar vac\xEDo." });
        return;
      }
      updateData.name = name.trim();
    }
    if (slug !== void 0) updateData.slug = slug.trim();
    if (order !== void 0) updateData.order = Number(order);
    if (isActive !== void 0) updateData.isActive = Boolean(isActive);
    const updated = await dbService.updateCategory(req.params.id, updateData, req.user);
    if (!updated) {
      res.status(404).json({ error: "Categor\xEDa no encontrada." });
      return;
    }
    res.json({ success: true, category: updated });
  } catch (err) {
    console.error("Error in PUT /api/admin/categories/:id:", err);
    res.status(400).json({ error: err.message || "Error al actualizar la categor\xEDa." });
  }
});
router8.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { reassignToCategoryId } = req.body || {};
    const result = await dbService.deleteCategory(
      req.params.id,
      reassignToCategoryId,
      req.user
    );
    if (!result.success) {
      res.status(400).json({ error: result.error || "Error al eliminar la categor\xEDa." });
      return;
    }
    res.json({
      success: true,
      message: "Categor\xEDa eliminada con \xE9xito.",
      reassignedCount: result.reassignedCount,
      targetCategory: result.targetCategory
    });
  } catch (err) {
    console.error("Error in DELETE /api/admin/categories/:id:", err);
    res.status(400).json({ error: err.message || "Error al eliminar la categor\xEDa." });
  }
});
var adminCategories_default = router8;

// server/routes/adminBanners.ts
import { Router as Router9 } from "express";
var router9 = Router9();
router9.get("/", authMiddleware, async (_req, res) => {
  try {
    const banners = await dbService.getAllBannersAdmin();
    res.json({ success: true, count: banners.length, banners });
  } catch (err) {
    console.error("Error in GET /api/admin/banners:", err);
    res.status(500).json({ error: "Error al recuperar banners administrativos." });
  }
});
router9.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, imageUrl, targetCategory, isActive, order } = req.body;
    if (!imageUrl || typeof imageUrl !== "string") {
      res.status(400).json({ error: "La URL de la imagen es obligatoria." });
      return;
    }
    const banner = await dbService.createBanner(
      { title, imageUrl, targetCategory, isActive, order },
      req.user
    );
    res.status(201).json({ success: true, banner });
  } catch (err) {
    console.error("Error in POST /api/admin/banners:", err);
    res.status(400).json({ error: err.message || "Error al crear el banner." });
  }
});
router9.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, imageUrl, targetCategory, isActive, order } = req.body;
    const updateData = {};
    if (title !== void 0) updateData.title = String(title).trim();
    if (imageUrl !== void 0) updateData.imageUrl = String(imageUrl).trim();
    if (targetCategory !== void 0) updateData.targetCategory = String(targetCategory).trim();
    if (isActive !== void 0) updateData.isActive = Boolean(isActive);
    if (order !== void 0) updateData.order = Number(order);
    const updated = await dbService.updateBanner(req.params.id, updateData, req.user);
    if (!updated) {
      res.status(404).json({ error: "Banner no encontrado." });
      return;
    }
    res.json({ success: true, banner: updated });
  } catch (err) {
    console.error("Error in PUT /api/admin/banners/:id:", err);
    res.status(400).json({ error: err.message || "Error al actualizar el banner." });
  }
});
router9.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const success = await dbService.deleteBanner(req.params.id, req.user);
    if (!success) {
      res.status(404).json({ error: "Banner no encontrado o ya eliminado." });
      return;
    }
    res.json({ success: true, message: "Banner eliminado correctamente." });
  } catch (err) {
    console.error("Error in DELETE /api/admin/banners/:id:", err);
    res.status(400).json({ error: err.message || "Error al eliminar el banner." });
  }
});
var adminBanners_default = router9;

// server/app.ts
dotenv.config();
var app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use((req, _res, next) => {
  const url = req.originalUrl || req.url;
  if (url.startsWith("/api") || url.startsWith("/catalog") || url.startsWith("/auth") || url.startsWith("/orders") || url.startsWith("/admin")) {
    console.log(`[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] ${req.method} ${url}`);
  }
  next();
});
app.use(async (_req, _res, next) => {
  try {
    if (!isMongoConnected() && process.env.MONGODB_URI) {
      await connectToDatabase();
    }
  } catch (err) {
    console.warn("Deferred MongoDB connection in serverless middleware:", err.message);
  }
  next();
});
app.get(["/api/health", "/health"], (_req, res) => {
  res.json({
    status: "ok",
    app: "DistriQuiero Direct Wholesale & Retail Commerce",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    database: isMongoConnected() ? "connected" : "fallback-memory"
  });
});
app.use(["/api/auth", "/auth"], auth_default);
app.use(["/api/catalog", "/catalog"], catalog_default);
app.use(["/api/orders", "/orders"], orders_default);
app.use(["/api/admin/products", "/admin/products"], adminProducts_default);
app.use(["/api/admin/upload", "/admin/upload"], adminUpload_default);
app.use(["/api/admin/audit-logs", "/admin/audit-logs"], adminAudit_default);
app.use(["/api/admin/users", "/admin/users"], adminUsers_default);
app.use(["/api/admin/categories", "/admin/categories"], adminCategories_default);
app.use(["/api/admin/banners", "/admin/banners"], adminBanners_default);
var app_default = app;
export {
  app_default as default
};
