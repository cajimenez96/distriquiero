import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {
  CounterModel,
  UserModel,
  ProductModel,
  OrderModel,
  AuditLogModel,
  BannerModel
} from '../models/index.ts';
import type {
  IProduct,
  IOrder,
  IUser,
  IAuditLog,
  IBanner
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
    entity: 'Product' | 'Order' | 'Banner' | 'User';
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
    return memoryStore.banners.filter(b => b.isActive);
  }
};
