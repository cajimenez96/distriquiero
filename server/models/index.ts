import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Counter Schema & Model
export interface ICounter {
  _id: string;
  seq: number;
}
const CounterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1000 }
});
export const CounterModel = mongoose.models.Counter || mongoose.model<ICounter>('Counter', CounterSchema);

// 2. User Schema & Model
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'superadmin' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
export const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// 3. Product Schema & Model
export interface IProduct extends Document {
  title: string;
  slug: string;
  sku: string;
  brand: string;
  category: string;
  description: string;
  images: string[];
  priceUnit: number;
  priceBulk: number;
  unitsPerBulk: number;
  isOffer: boolean;
  isPaused: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const ProductSchema = new Schema<IProduct>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  sku: { type: String, default: '', trim: true },
  brand: { type: String, default: '', trim: true },
  category: { type: String, required: true, index: true },
  description: { type: String, default: '' },
  images: [{ type: String }],
  priceUnit: { type: Number, required: true, min: 0 },
  priceBulk: { type: Number, required: true, min: 0 },
  unitsPerBulk: { type: Number, required: true, min: 1, default: 12 },
  isOffer: { type: Boolean, default: false },
  isPaused: { type: Boolean, default: false }
}, { timestamps: true });
export const ProductModel: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

// 4. Order Schema & Model
export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  title: string;
  purchaseType: 'unit' | 'bulk';
  quantity: number;
  unitPrice: number;
  subtotal: number;
}
export interface IOrderStatusHistory {
  status: string;
  changedBy: mongoose.Types.ObjectId | string;
  timestamp: Date;
}
export interface IOrder extends Document {
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    businessName?: string;
  };
  items: IOrderItem[];
  totalAmount: number;
  status: 'Solicitado' | 'Contestado';
  statusHistory: IOrderStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}
const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  customer: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    businessName: { type: String, default: '' }
  },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    title: { type: String, required: true },
    purchaseType: { type: String, enum: ['unit', 'bulk'], required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Solicitado', 'Contestado'], default: 'Solicitado' },
  statusHistory: [{
    status: { type: String, required: true },
    changedBy: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
export const OrderModel: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

// 5. AuditLog Schema & Model
export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId | string;
  userName: string;
  userRole: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PAUSE' | 'STATUS_CHANGE';
  entity: 'Product' | 'Order' | 'Banner' | 'User';
  entityId: string;
  beforeSnapshot: any;
  afterSnapshot: any;
  createdAt: Date;
}
const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: Schema.Types.Mixed, required: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'PAUSE', 'STATUS_CHANGE'],
    required: true
  },
  entity: {
    type: String,
    enum: ['Product', 'Order', 'Banner', 'User'],
    required: true
  },
  entityId: { type: String, required: true },
  beforeSnapshot: { type: Schema.Types.Mixed, default: null },
  afterSnapshot: { type: Schema.Types.Mixed, default: null }
}, { timestamps: { createdAt: true, updatedAt: false } });
AuditLogSchema.index({ createdAt: -1 });
export const AuditLogModel: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

// 6. Banner Schema & Model
export interface IBanner extends Document {
  title: string;
  imageUrl: string;
  targetCategory?: string;
  isActive: boolean;
  order: number;
}
const BannerSchema = new Schema<IBanner>({
  title: { type: String, default: '' },
  imageUrl: { type: String, required: true },
  targetCategory: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
});
export const BannerModel: Model<IBanner> = mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);
