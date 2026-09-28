export type ProductCategory =
  | 'Cómputo y laptops'
  | 'Almacenamiento y RAM'
  | 'Periféricos y audio'
  | 'Redes y conectividad'
  | 'Cables y accesorios';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  description?: string;
  origin?: string; // Brand / Distributor / Origin
  brand?: string;
  specs?: string;
  warranty?: string;
  lastSoldAt?: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia';

export interface Sale {
  id: string;
  receiptNumber: string; // e.g., 'V-0104'
  date: string; // ISO string
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  customerName?: string;
  notes?: string;
}

export type MovementType = 'entrada' | 'venta' | 'ajuste' | 'baja';

export interface Movement {
  id: string;
  date: string; // ISO string
  productId: string;
  productName: string;
  sku: string;
  type: MovementType;
  quantity: number; // positive for entrada, negative for venta/baja/ajuste
  previousStock: number;
  newStock: number;
  reason: string;
  responsible: string;
  saleId?: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
  email: string;
  pin: string;
  avatarInitials: string;
}

export type ActiveTab = 'hoy' | 'inventario' | 'ventas' | 'movimientos' | 'reportes';

export type ThemeMode = 'light' | 'dark' | 'system';
