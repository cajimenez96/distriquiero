export type UserRole = 'superadmin' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export type PurchaseType = 'unit' | 'bulk';

export interface CartItem {
  product: Product;
  purchaseType: PurchaseType;
  quantity: number; // units or bulks depending on purchaseType
}

export type OrderStatus = 'Solicitado' | 'Contestado';

export interface OrderItem {
  productId: string;
  title: string;
  purchaseType: PurchaseType;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  phone: string;
  businessName?: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  changedBy: string;
  timestamp: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'PAUSE' | 'STATUS_CHANGE';
export type AuditEntity = 'Product' | 'Order' | 'Banner' | 'User' | 'Category';

export interface AuditLog {
  _id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  beforeSnapshot: any | null;
  afterSnapshot: any | null;
  createdAt: string;
}

export interface Banner {
  _id: string;
  title: string;
  imageUrl: string;
  targetCategory?: string;
  isActive: boolean;
  order: number;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderSubmissionResponse {
  success: boolean;
  order: Order;
  whatsappUrl: string;
  formattedMessage: string;
}
