import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {
  CounterModel,
  UserModel,
  ProductModel,
  OrderModel,
  AuditLogModel,
  BannerModel,
  CategoryModel
} from '../models/index.ts';
import type {
  IProduct,
  IOrder,
  IUser,
  IAuditLog,
  IBanner,
  ICategory
} from '../models/index.ts';
import { isMongoConnected } from './mongodb.ts';

import { memoryStore, initSeedData } from './fixtures/mock-data.ts';

initSeedData();

// Storage Service Wrapper
export const dbService = {
  // Counter
  async getNextOrderNumber(): Promise<string> {
    if (isMongoConnected()) {
      try {
        const counter: any = await (CounterModel as any).findOneAndUpdate(
          { _id: 'order_number' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        if (counter && counter.seq) {
          return `#DQ-${counter.seq}`;
        }
      } catch (err) {
        console.warn('Counter mongo query error, fallback to memory:', err);
      }
    }
    memoryStore.counter += 1;
    return `#DQ-${memoryStore.counter}`;
  },

  // Products
  async getCatalogProducts(params: { search?: string; category?: string; sort?: string }) {
    let list: any[] = [];
    if (isMongoConnected()) {
      try {
        const query: any = { isPaused: false };
        if (params.category && params.category !== 'todos') {
          query.category = new RegExp(`^${params.category}$`, 'i');
        }
        if (params.search) {
          query.$or = [
            { title: new RegExp(params.search, 'i') },
            { brand: new RegExp(params.search, 'i') },
            { sku: new RegExp(params.search, 'i') }
          ];
        }
        let sortOption: any = { createdAt: -1 };
        if (params.sort === 'min') sortOption = { priceBulk: 1 };
        if (params.sort === 'max') sortOption = { priceBulk: -1 };
        if (params.sort === 'brand') sortOption = { brand: 1 };

        list = await ProductModel.find(query).sort(sortOption).lean();
      } catch (err) {
        console.warn('Mongo catalog query failed, falling back:', err);
        list = memoryStore.products.filter(p => !p.isPaused);
      }
    } else {
      list = memoryStore.products.filter(p => !p.isPaused);
    }

    if (!isMongoConnected() || list.length === 0) {
      list = memoryStore.products.filter(p => !p.isPaused);
      if (params.category && params.category !== 'todos') {
        const catLower = params.category.toLowerCase();
        list = list.filter(p => p.category.toLowerCase() === catLower);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
        );
      }
      if (params.sort === 'min') {
        list.sort((a, b) => a.priceBulk - b.priceBulk);
      } else if (params.sort === 'max') {
        list.sort((a, b) => b.priceBulk - a.priceBulk);
      } else if (params.sort === 'brand') {
        list.sort((a, b) => a.brand.localeCompare(b.brand));
      } else if (params.sort === 'bulk') {
        list.sort((a, b) => (b.priceUnit * b.unitsPerBulk - b.priceBulk) - (a.priceUnit * a.unitsPerBulk - a.priceBulk));
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

  async getProductById(id: string) {
    if (isMongoConnected()) {
      try {
        if (mongoose.Types.ObjectId.isValid(id)) {
          const byId = await ProductModel.findById(id).lean();
          if (byId) return byId;
        }
        const bySlug = await ProductModel.findOne({ slug: id }).lean();
        if (bySlug) return bySlug;
      } catch (e) {
        console.warn('Mongo getProductById error:', e);
      }
    }
    return memoryStore.products.find(p => p._id === id || p.slug === id) || null;
  },

  async createProduct(data: any, user: { id: string; name: string; role: string }) {
    let created: any = null;
    const now = new Date().toISOString();
    const productPayload = {
      ...data,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      createdAt: now,
      updatedAt: now
    };

    if (isMongoConnected()) {
      try {
        created = await ProductModel.create(productPayload);
      } catch (e) {
        console.warn('Mongo createProduct failed:', e);
      }
    }

    if (!created) {
      created = {
        _id: 'prod_' + Date.now(),
        ...productPayload
      };
      memoryStore.products.unshift(created);
    }

    await this.createAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'CREATE',
      entity: 'Product',
      entityId: created._id.toString(),
      beforeSnapshot: null,
      afterSnapshot: created
    });

    return created;
  },

  async updateProduct(id: string, updates: any, user: { id: string; name: string; role: string }) {
    const before = await this.getProductById(id);
    let updated: any = null;

    if (isMongoConnected()) {
      try {
        updated = await ProductModel.findByIdAndUpdate(
          id,
          { ...updates, updatedAt: new Date() },
          { new: true }
        ).lean();
      } catch (e) {
        console.warn('Mongo updateProduct error:', e);
      }
    }

    if (!updated) {
      const idx = memoryStore.products.findIndex(p => p._id === id);
      if (idx !== -1) {
        memoryStore.products[idx] = {
          ...memoryStore.products[idx],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        updated = memoryStore.products[idx];
      }
    }

    if (updated) {
      await this.createAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: updates.isPaused !== undefined && before && updates.isPaused !== before.isPaused ? 'PAUSE' : 'UPDATE',
        entity: 'Product',
        entityId: id,
        beforeSnapshot: before,
        afterSnapshot: updated
      });
    }

    return updated;
  },

  async deleteProduct(id: string, user: { id: string; name: string; role: string }) {
    const before = await this.getProductById(id);
    if (!before) return false;

    if (isMongoConnected()) {
      try {
        await ProductModel.findByIdAndDelete(id);
      } catch (e) {
        console.warn(e);
      }
    }

    const idx = memoryStore.products.findIndex(p => p._id === id);
    if (idx !== -1) {
      memoryStore.products.splice(idx, 1);
    }

    await this.createAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'DELETE',
      entity: 'Product',
      entityId: id,
      beforeSnapshot: before,
      afterSnapshot: null
    });

    return true;
  },

  // Orders
  async createOrder(data: {
    customer: { firstName: string; lastName: string; phone: string; businessName?: string };
    items: Array<{ productId: string; purchaseType: 'unit' | 'bulk'; quantity: number }>;
  }) {
    // Calculate totals server-side using current DB product prices
    let calculatedItems: any[] = [];
    let totalAmount = 0;

    for (const item of data.items) {
      const product = await this.getProductById(item.productId);
      if (!product) continue;

      const unitPrice = item.purchaseType === 'bulk' ? product.priceBulk : product.priceUnit;
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
    const now = new Date().toISOString();

    const orderPayload = {
      orderNumber,
      customer: data.customer,
      items: calculatedItems,
      totalAmount,
      status: 'Solicitado' as const,
      statusHistory: [
        {
          status: 'Solicitado',
          changedBy: 'Cliente Web',
          timestamp: now
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    let created: any = null;
    if (isMongoConnected()) {
      try {
        created = await OrderModel.create(orderPayload);
      } catch (e) {
        console.warn('Mongo createOrder error:', e);
      }
    }

    if (!created) {
      created = {
        _id: 'ord_' + Date.now(),
        ...orderPayload
      };
      memoryStore.orders.unshift(created);
    }

    return created;
  },

  async getOrders(filterStatus?: string) {
    if (isMongoConnected()) {
      try {
        const query: any = {};
        if (filterStatus && filterStatus !== 'all') {
          query.status = filterStatus;
        }
        return await OrderModel.find(query).sort({ createdAt: -1 }).lean();
      } catch (e) {
        console.warn(e);
      }
    }

    let list = [...memoryStore.orders];
    if (filterStatus && filterStatus !== 'all') {
      list = list.filter(o => o.status === filterStatus);
    }
    return list;
  },

  async updateOrderStatus(id: string, newStatus: 'Solicitado' | 'Contestado', user: { id: string; name: string; role: string }) {
    let before: any = null;
    let updated: any = null;
    const now = new Date().toISOString();

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
      const idx = memoryStore.orders.findIndex(o => o._id === id || o.orderNumber === id);
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
        action: 'STATUS_CHANGE',
        entity: 'Order',
        entityId: id,
        beforeSnapshot: before,
        afterSnapshot: updated
      });
    }

    return updated;
  },

  // Audit Logs
  async createAuditLog(entry: {
    userId: string;
    userName: string;
    userRole: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PAUSE' | 'STATUS_CHANGE';
    entity: 'Product' | 'Order' | 'Banner' | 'User' | 'Category';
    entityId: string;
    beforeSnapshot: any;
    afterSnapshot: any;
  }) {
    const payload = {
      ...entry,
      createdAt: new Date().toISOString()
    };

    if (isMongoConnected()) {
      try {
        await AuditLogModel.create(payload);
        return;
      } catch (e) {
        console.warn('Mongo audit log error:', e);
      }
    }

    memoryStore.auditLogs.unshift({
      _id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
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
  async findUserByEmail(email: string) {
    const normalized = email.toLowerCase().trim();
    if (isMongoConnected()) {
      try {
        return await UserModel.findOne({ email: normalized }).lean();
      } catch (e) {
        console.warn(e);
      }
    }
    return memoryStore.users.find(u => u.email.toLowerCase() === normalized) || null;
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

  async createUser(userData: { name: string; email: string; password: string; role: 'superadmin' | 'admin' }, adminUser: { id: string; name: string; role: string }) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const now = new Date().toISOString();
    const payload = {
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      password: hashedPassword,
      role: userData.role || 'admin',
      isActive: true,
      createdAt: now,
      updatedAt: now
    };

    let created: any = null;
    if (isMongoConnected()) {
      try {
        created = await UserModel.create(payload);
      } catch (e) {
        console.warn(e);
      }
    }

    if (!created) {
      created = {
        _id: 'usr_' + Date.now(),
        ...payload
      };
      memoryStore.users.push(created);
    }

    const { password, ...safeUser } = created;

    await this.createAuditLog({
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'CREATE',
      entity: 'User',
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
    return memoryStore.banners.filter(b => b.isActive).sort((a, b) => (a.order || 0) - (b.order || 0));
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

  async createBanner(
    data: { title?: string; imageUrl: string; targetCategory?: string; isActive?: boolean; order?: number },
    adminUser: { id: string; name: string; role: string }
  ) {
    let created: any;
    if (isMongoConnected()) {
      try {
        created = await BannerModel.create({
          title: data.title || '',
          imageUrl: data.imageUrl,
          targetCategory: data.targetCategory || 'all',
          isActive: data.isActive !== undefined ? data.isActive : true,
          order: data.order !== undefined ? Number(data.order) : 0
        });
        created = created.toObject();
      } catch (e) {
        console.warn('Mongo create banner error:', e);
      }
    }

    if (!created) {
      created = {
        _id: 'banner_' + Date.now(),
        title: data.title || '',
        imageUrl: data.imageUrl,
        targetCategory: data.targetCategory || 'all',
        isActive: data.isActive !== undefined ? data.isActive : true,
        order: data.order !== undefined ? Number(data.order) : 0
      };
      memoryStore.banners.push(created);
    }

    await this.createAuditLog({
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'CREATE',
      entity: 'Banner',
      entityId: created._id.toString(),
      beforeSnapshot: null,
      afterSnapshot: created
    });

    return created;
  },

  async updateBanner(
    id: string,
    data: Partial<IBanner>,
    adminUser: { id: string; name: string; role: string }
  ) {
    let beforeSnapshot: any = null;
    let updated: any = null;

    if (isMongoConnected()) {
      try {
        beforeSnapshot = await BannerModel.findById(id).lean();
        if (beforeSnapshot) {
          updated = await BannerModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
        }
      } catch (e) {
        console.warn('Mongo update banner error:', e);
      }
    }

    if (!updated) {
      const idx = memoryStore.banners.findIndex(b => b._id.toString() === id);
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
        action: 'UPDATE',
        entity: 'Banner',
        entityId: id,
        beforeSnapshot,
        afterSnapshot: updated
      });
    }

    return updated;
  },

  async deleteBanner(
    id: string,
    adminUser: { id: string; name: string; role: string }
  ) {
    let beforeSnapshot: any = null;

    if (isMongoConnected()) {
      try {
        beforeSnapshot = await BannerModel.findById(id).lean();
        if (beforeSnapshot) {
          await BannerModel.findByIdAndDelete(id);
        }
      } catch (e) {
        console.warn('Mongo delete banner error:', e);
      }
    }

    if (!beforeSnapshot) {
      const idx = memoryStore.banners.findIndex(b => b._id.toString() === id);
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
        action: 'DELETE',
        entity: 'Banner',
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
          console.log('🌱 Seeding initial categories into MongoDB...');
          const initial = [
            { name: 'Almacén', slug: 'almacen', order: 1, isActive: true },
            { name: 'Bebidas', slug: 'bebidas', order: 2, isActive: true },
            { name: 'Golosinas', slug: 'golosinas', order: 3, isActive: true },
            { name: 'Limpieza', slug: 'limpieza', order: 4, isActive: true },
            { name: 'Snacks', slug: 'snacks', order: 5, isActive: true },
            { name: 'Sin categoría', slug: 'sin-categoria', order: 999, isActive: true }
          ];
          await CategoryModel.insertMany(initial);
          console.log('✅ Initial categories seeded.');
        }
      } catch (e) {
        console.warn('Error ensuring categories in mongo:', e);
      }
    }
  },

  async getCategories(includeInactive = false) {
    await this.ensureInitialCategories();

    let categories: any[] = [];
    if (isMongoConnected()) {
      try {
        const query = includeInactive ? {} : { isActive: true };
        categories = await CategoryModel.find(query).sort({ order: 1, name: 1 }).lean();

        // Calculate product counts per category
        const counts = await ProductModel.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        const countMap = new Map(counts.map(c => [c._id, c.count]));

        return categories.map(cat => ({
          ...cat,
          productCount: countMap.get(cat.name) || 0
        }));
      } catch (e) {
        console.warn('Mongo getCategories error:', e);
      }
    }

    // Memory store fallback
    const list = includeInactive ? memoryStore.categories : memoryStore.categories.filter(c => c.isActive);
    return list.map(cat => ({
      ...cat,
      productCount: memoryStore.products.filter(p => p.category === cat.name).length
    })).sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  async createCategory(
    data: { name: string; slug?: string; order?: number; isActive?: boolean },
    adminUser: { id: string; name: string; role: string }
  ) {
    const name = data.name.trim();
    const slug = data.slug
      ? data.slug.toLowerCase().trim()
      : name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    let created: any;
    if (isMongoConnected()) {
      try {
        const existing = await CategoryModel.findOne({
          $or: [{ name: new RegExp(`^${name}$`, 'i') }, { slug }]
        });
        if (existing) {
          throw new Error('Ya existe una categoría con ese nombre o slug.');
        }

        created = await CategoryModel.create({
          name,
          slug,
          order: data.order !== undefined ? Number(data.order) : 0,
          isActive: data.isActive !== undefined ? data.isActive : true
        });
        created = created.toObject();
      } catch (e: any) {
        if (e.message.includes('Ya existe')) throw e;
        console.warn('Mongo create category error:', e);
      }
    }

    if (!created) {
      const existing = memoryStore.categories.find(c => c.name.toLowerCase() === name.toLowerCase() || c.slug === slug);
      if (existing) {
        throw new Error('Ya existe una categoría con ese nombre o slug.');
      }
      created = {
        _id: 'cat_' + Date.now(),
        name,
        slug,
        order: data.order !== undefined ? Number(data.order) : 0,
        isActive: data.isActive !== undefined ? data.isActive : true
      };
      memoryStore.categories.push(created);
    }

    await this.createAuditLog({
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'CREATE',
      entity: 'Category',
      entityId: created._id.toString(),
      beforeSnapshot: null,
      afterSnapshot: created
    });

    return created;
  },

  async updateCategory(
    id: string,
    data: { name?: string; slug?: string; order?: number; isActive?: boolean },
    adminUser: { id: string; name: string; role: string }
  ) {
    let beforeSnapshot: any = null;
    let updated: any = null;

    if (isMongoConnected()) {
      try {
        beforeSnapshot = await CategoryModel.findById(id).lean();
        if (beforeSnapshot) {
          // If name is changing, check uniqueness and update products
          if (data.name && data.name.trim() !== beforeSnapshot.name) {
            const newName = data.name.trim();
            const existing = await CategoryModel.findOne({
              _id: { $ne: id },
              name: new RegExp(`^${newName}$`, 'i')
            });
            if (existing) {
              throw new Error('Ya existe otra categoría con ese nombre.');
            }
            await ProductModel.updateMany({ category: beforeSnapshot.name }, { $set: { category: newName } });
          }

          updated = await CategoryModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
        }
      } catch (e: any) {
        if (e.message.includes('Ya existe')) throw e;
        console.warn('Mongo update category error:', e);
      }
    }

    if (!updated) {
      const idx = memoryStore.categories.findIndex(c => c._id.toString() === id);
      if (idx !== -1) {
        beforeSnapshot = { ...memoryStore.categories[idx] };
        if (data.name && data.name.trim() !== beforeSnapshot.name) {
          const newName = data.name.trim();
          const existing = memoryStore.categories.find(c => c._id.toString() !== id && c.name.toLowerCase() === newName.toLowerCase());
          if (existing) {
            throw new Error('Ya existe otra categoría con ese nombre.');
          }
          memoryStore.products.forEach(p => {
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
        action: 'UPDATE',
        entity: 'Category',
        entityId: id,
        beforeSnapshot,
        afterSnapshot: updated
      });
    }

    return updated;
  },

  async deleteCategory(
    id: string,
    reassignToCategoryId: string | undefined,
    adminUser: { id: string; name: string; role: string }
  ) {
    let catToDelete: any = null;
    let targetCategoryName = 'Sin categoría';

    if (isMongoConnected()) {
      try {
        catToDelete = await CategoryModel.findById(id).lean();
        if (!catToDelete) return { success: false, error: 'Categoría no encontrada.' };

        // Prevent deleting 'Sin categoría' directly
        if (catToDelete.name.toLowerCase() === 'sin categoría' || catToDelete.slug === 'sin-categoria') {
          throw new Error('No se puede eliminar la categoría de resguardo "Sin categoría".');
        }

        // Determine destination category for products
        if (reassignToCategoryId && reassignToCategoryId !== id) {
          const target = await CategoryModel.findById(reassignToCategoryId).lean();
          if (target) {
            targetCategoryName = target.name;
          }
        } else {
          // Ensure "Sin categoría" exists
          let defaultCat = await CategoryModel.findOne({ slug: 'sin-categoria' });
          if (!defaultCat) {
            defaultCat = await CategoryModel.create({
              name: 'Sin categoría',
              slug: 'sin-categoria',
              order: 999,
              isActive: true
            });
          }
          targetCategoryName = defaultCat.name;
        }

        // Reassign products to target category
        const reassignResult = await ProductModel.updateMany(
          { category: catToDelete.name },
          { $set: { category: targetCategoryName } }
        );

        // Update any banners pointing to this category
        await BannerModel.updateMany(
          { targetCategory: { $in: [catToDelete.name, catToDelete.slug] } },
          { $set: { targetCategory: 'all' } }
        );

        // Delete the category
        await CategoryModel.findByIdAndDelete(id);

        await this.createAuditLog({
          userId: adminUser.id,
          userName: adminUser.name,
          userRole: adminUser.role,
          action: 'DELETE',
          entity: 'Category',
          entityId: id,
          beforeSnapshot: { ...catToDelete, reassignedCount: reassignResult.modifiedCount, targetCategory: targetCategoryName },
          afterSnapshot: null
        });

        return {
          success: true,
          reassignedCount: reassignResult.modifiedCount,
          targetCategory: targetCategoryName
        };
      } catch (e: any) {
        console.warn('Mongo delete category error:', e);
        throw e;
      }
    }

    // Memory fallback
    const idx = memoryStore.categories.findIndex(c => c._id.toString() === id);
    if (idx === -1) return { success: false, error: 'Categoría no encontrada.' };
    catToDelete = memoryStore.categories[idx];

    if (catToDelete.name.toLowerCase() === 'sin categoría' || catToDelete.slug === 'sin-categoria') {
      throw new Error('No se puede eliminar la categoría de resguardo "Sin categoría".');
    }

    if (reassignToCategoryId && reassignToCategoryId !== id) {
      const target = memoryStore.categories.find(c => c._id.toString() === reassignToCategoryId);
      if (target) targetCategoryName = target.name;
    } else {
      let defaultCat = memoryStore.categories.find(c => c.slug === 'sin-categoria');
      if (!defaultCat) {
        defaultCat = { _id: 'cat_default', name: 'Sin categoría', slug: 'sin-categoria', order: 999, isActive: true };
        memoryStore.categories.push(defaultCat);
      }
      targetCategoryName = defaultCat.name;
    }

    let reassignedCount = 0;
    memoryStore.products.forEach(p => {
      if (p.category === catToDelete.name) {
        p.category = targetCategoryName;
        reassignedCount++;
      }
    });

    memoryStore.banners.forEach(b => {
      if (b.targetCategory === catToDelete.name || b.targetCategory === catToDelete.slug) {
        b.targetCategory = 'all';
      }
    });

    memoryStore.categories.splice(idx, 1);

    await this.createAuditLog({
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'DELETE',
      entity: 'Category',
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
