import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Product, Sale, SaleItem, Movement, MovementType, PaymentMethod, ActiveTab, User, ThemeMode } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_MOVEMENTS } from '../data/initialData';
import { INITIAL_USERS } from '../data/teamData';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'alert' | 'info';
  description?: string;
}

interface AlmudContextType {
  // Theme
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;

  // Auth
  currentUser: User | null;
  users: User[];
  login: (identifier: string, pin: string) => { success: boolean; error?: string };
  quickLogin: (userId: string) => void;
  logout: () => void;

  // Data
  products: Product[];
  sales: Sale[];
  movements: Movement[];
  
  // Navigation & Modals
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isLaCajaOpen: boolean;
  openLaCaja: () => void;
  closeLaCaja: () => void;
  selectedProductForDrawer: Product | null;
  openProductDrawer: (product: Product) => void;
  closeProductDrawer: () => void;
  isNewProductOpen: boolean;
  openNewProduct: () => void;
  closeNewProduct: () => void;
  isMovementModalOpen: boolean;
  movementModalConfig: { product?: Product; defaultType?: MovementType } | null;
  openMovementModal: (product?: Product, defaultType?: MovementType) => void;
  closeMovementModal: () => void;
  isCommandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  
  // Toast
  toasts: ToastMessage[];
  showToast: (message: string, options?: { type?: 'success' | 'alert' | 'info'; description?: string }) => void;
  dismissToast: (id: string) => void;

  // Actions
  createSale: (data: { items: SaleItem[]; paymentMethod: PaymentMethod; customerName?: string; notes?: string }) => Sale;
  createMovement: (data: { productId: string; type: MovementType; quantity: number; reason: string; responsible?: string }) => void;
  createProduct: (productData: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetStoreToDefault: () => void;

  // Computed metrics
  todaySales: Sale[];
  todayRevenue: number;
  todaySalesCount: number;
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
  attentionProducts: Product[];
  quickRestockProduct: (product: Product, quantityToAdd: number) => void;
}

const AlmudContext = createContext<AlmudContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'conecta2_products_v1',
  SALES: 'conecta2_sales_v1',
  MOVEMENTS: 'conecta2_movements_v1',
  AUTH_USER: 'conecta2_auth_user_v1',
  THEME: 'conecta2_theme_mode_v1',
};

export const AlmudProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
    } catch (e) {
      console.error('Error reading theme from localStorage', e);
    }
    return 'system';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.error('Error saving theme', e);
    }
  }, [theme, resolvedTheme]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const currentResolved = prev === 'system' ? (systemPrefersDark ? 'dark' : 'light') : prev;
      return currentResolved === 'dark' ? 'light' : 'dark';
    });
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading auth user from localStorage', e);
    }
    // Default to null — require login
    return null;
  });

  const users = INITIAL_USERS;

  // Load from localStorage with fallback to INITIAL_*
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading products from localStorage', e);
    }
    return INITIAL_PRODUCTS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SALES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading sales from localStorage', e);
    }
    return INITIAL_SALES;
  });

  const [movements, setMovements] = useState<Movement[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading movements from localStorage', e);
    }
    return INITIAL_MOVEMENTS;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('hoy');
  const [isLaCajaOpen, setIsLaCajaOpen] = useState(false);
  const [selectedProductForDrawer, setSelectedProductForDrawer] = useState<Product | null>(null);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementModalConfig, setMovementModalConfig] = useState<{ product?: Product; defaultType?: MovementType } | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync auth to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      }
    } catch (e) {
      console.error('Failed to save auth state', e);
    }
  }, [currentUser]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    } catch (e) {
      console.error('Failed to save sales', e);
    }
  }, [sales]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    } catch (e) {
      console.error('Failed to save movements', e);
    }
  }, [movements]);

  // Toast helper
  const showToast = (message: string, options?: { type?: 'success' | 'alert' | 'info'; description?: string }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = {
      id,
      message,
      type: options?.type || 'info',
      description: options?.description,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Keyboard shortcut for ⌘K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Computed metrics
  const todaySales = useMemo(() => {
    const todayStr = new Date().toDateString();
    return sales.filter((s) => new Date(s.date).toDateString() === todayStr);
  }, [sales]);

  const todayRevenue = useMemo(() => {
    return todaySales.reduce((acc, s) => acc + s.total, 0);
  }, [todaySales]);

  const todaySalesCount = todaySales.length;

  const outOfStockProducts = useMemo(() => {
    return products.filter((p) => p.stock <= 0);
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock > 0 && p.stock <= p.minStock);
  }, [products]);

  const attentionProducts = useMemo(() => {
    return [...outOfStockProducts, ...lowStockProducts].sort((a, b) => a.stock - b.stock);
  }, [outOfStockProducts, lowStockProducts]);

  // Keep drawer product in sync with products state if edited
  useEffect(() => {
    if (selectedProductForDrawer) {
      const fresh = products.find((p) => p.id === selectedProductForDrawer.id);
      if (fresh) setSelectedProductForDrawer(fresh);
    }
  }, [products]);

  // Auth handlers
  const login = (identifier: string, pin: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPin = pin.trim();

    // Match by email, name or PIN directly
    const user = users.find(
      (u) =>
        (u.email.toLowerCase() === cleanId || u.name.toLowerCase().includes(cleanId) || u.pin === cleanPin) &&
        u.pin === cleanPin
    );

    if (user) {
      setCurrentUser(user);
      showToast(`Sesión iniciada`, {
        type: 'success',
        description: `Bienvenido/a al turno, ${user.name} (${user.role})`,
      });
      return { success: true };
    }

    return {
      success: false,
      error: 'Credenciales inválidas. Comprueba tu correo o PIN (ej. PIN 1234, 2468 o 1357)',
    };
  };

  const quickLogin = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      showToast(`Turno activo: ${user.name}`, {
        type: 'info',
        description: user.role,
      });
    }
  };

  const logout = () => {
    const prevName = currentUser?.name;
    setCurrentUser(null);
    showToast(`Turno cerrado`, {
      type: 'info',
      description: prevName ? `Hasta luego, ${prevName}` : 'Sesión finalizada',
    });
  };

  // Action: Create Sale
  const createSale = ({
    items,
    paymentMethod,
    customerName,
    notes,
  }: {
    items: SaleItem[];
    paymentMethod: PaymentMethod;
    customerName?: string;
    notes?: string;
  }): Sale => {
    const nextReceiptNum = `V-${String(sales.length + 101).padStart(4, '0')}`;
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const nowIso = new Date().toISOString();
    const responsibleName = currentUser ? currentUser.name : 'Caja principal';

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      receiptNumber: nextReceiptNum,
      date: nowIso,
      items,
      total: totalAmount,
      paymentMethod,
      customerName: customerName?.trim() || undefined,
      notes: notes?.trim() || undefined,
    };

    // Update stocks and generate movements
    const newMovements: Movement[] = [];
    const updatedProducts = products.map((prod) => {
      const soldItem = items.find((it) => it.productId === prod.id);
      if (!soldItem) return prod;

      const previousStock = prod.stock;
      const newStock = Math.max(0, previousStock - soldItem.quantity);

      newMovements.push({
        id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date: nowIso,
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        type: 'venta',
        quantity: -soldItem.quantity,
        previousStock,
        newStock,
        reason: `Venta ${nextReceiptNum}${customerName ? ` (${customerName})` : ''}`,
        responsible: responsibleName,
        saleId: newSale.id,
      });

      return {
        ...prod,
        stock: newStock,
        lastSoldAt: nowIso,
      };
    });

    setProducts(updatedProducts);
    setSales((prev) => [newSale, ...prev]);
    setMovements((prev) => [...newMovements, ...prev]);

    showToast(`Venta ${nextReceiptNum} completada`, {
      type: 'success',
      description: `C$ ${totalAmount.toLocaleString('es-NI')} registrados · Atendido por ${responsibleName}`,
    });

    return newSale;
  };

  // Action: Create Movement
  const createMovement = ({
    productId,
    type,
    quantity,
    reason,
    responsible,
  }: {
    productId: string;
    type: MovementType;
    quantity: number;
    reason: string;
    responsible?: string;
  }) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const previousStock = prod.stock;
    let newStock = previousStock;

    if (type === 'entrada') {
      newStock = previousStock + Math.abs(quantity);
    } else if (type === 'venta' || type === 'baja') {
      newStock = Math.max(0, previousStock - Math.abs(quantity));
    } else if (type === 'ajuste') {
      // quantity can be delta (+ or -)
      newStock = Math.max(0, previousStock + quantity);
    }

    const actualDelta = newStock - previousStock;
    const nowIso = new Date().toISOString();
    const effectiveResponsible =
      responsible?.trim() || (currentUser ? currentUser.name : 'Turno actual');

    const newMov: Movement = {
      id: `mov-${Date.now()}`,
      date: nowIso,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      type,
      quantity: actualDelta,
      previousStock,
      newStock,
      reason: reason.trim() || `Movimiento de ${type}`,
      responsible: effectiveResponsible,
    };

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
    setMovements((prev) => [newMov, ...prev]);

    const sign = actualDelta >= 0 ? '+' : '';
    showToast(`Movimiento registrado`, {
      type: 'info',
      description: `${prod.name}: ${sign}${actualDelta} ${prod.unit}s (${effectiveResponsible})`,
    });
  };

  // Action: Quick restock for "Necesita atención"
  const quickRestockProduct = (product: Product, quantityToAdd: number) => {
    createMovement({
      productId: product.id,
      type: 'entrada',
      quantity: quantityToAdd,
      reason: 'Reposición rápida de almacén',
      responsible: 'Turno actual',
    });
  };

  // Action: Create Product
  const createProduct = (productData: Omit<Product, 'id' | 'createdAt'>): Product => {
    const nowIso = new Date().toISOString();
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: nowIso,
    };

    setProducts((prev) => [newProd, ...prev]);

    if (newProd.stock > 0) {
      const initialMov: Movement = {
        id: `mov-${Date.now()}`,
        date: nowIso,
        productId: newProd.id,
        productName: newProd.name,
        sku: newProd.sku,
        type: 'entrada',
        quantity: newProd.stock,
        previousStock: 0,
        newStock: newProd.stock,
        reason: 'Inventario inicial de alta de producto',
        responsible: 'Administración Conecta2',
      };
      setMovements((prev) => [initialMov, ...prev]);
    }

    showToast(`Producto creado`, {
      type: 'success',
      description: `${newProd.name} agregado al inventario`,
    });

    return newProd;
  };

  // Action: Update Product
  const updateProduct = (id: string, updates: Partial<Product>) => {
    const existing = products.find((p) => p.id === id);
    if (!existing) return;

    if (updates.stock !== undefined && updates.stock !== existing.stock) {
      const delta = updates.stock - existing.stock;
      const nowIso = new Date().toISOString();
      const mov: Movement = {
        id: `mov-${Date.now()}`,
        date: nowIso,
        productId: existing.id,
        productName: updates.name || existing.name,
        sku: updates.sku || existing.sku,
        type: 'ajuste',
        quantity: delta,
        previousStock: existing.stock,
        newStock: updates.stock,
        reason: 'Ajuste manual desde ficha de producto',
        responsible: 'Administración Conecta2',
      };
      setMovements((prev) => [mov, ...prev]);
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    showToast(`Producto actualizado`, {
      type: 'info',
      description: `Los cambios en ${updates.name || existing.name} se han guardado`,
    });
  };

  // Action: Delete Product
  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (selectedProductForDrawer?.id === id) {
      setSelectedProductForDrawer(null);
    }
    showToast(`Producto eliminado`, {
      type: 'alert',
      description: `${prod?.name || 'El producto'} fue retirado del inventario`,
    });
  };

  // Reset to initial demo data
  const resetStoreToDefault = () => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.MOVEMENTS);
    setProducts(INITIAL_PRODUCTS);
    setSales(INITIAL_SALES);
    setMovements(INITIAL_MOVEMENTS);
    setSelectedProductForDrawer(null);
    showToast(`Datos restaurados`, {
      type: 'info',
      description: 'El cuaderno de comercio volvió a los datos iniciales de ejemplo',
    });
  };

  return (
    <AlmudContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        currentUser,
        users,
        login,
        quickLogin,
        logout,
        products,
        sales,
        movements,
        activeTab,
        setActiveTab,
        isLaCajaOpen,
        openLaCaja: () => setIsLaCajaOpen(true),
        closeLaCaja: () => setIsLaCajaOpen(false),
        selectedProductForDrawer,
        openProductDrawer: (prod) => setSelectedProductForDrawer(prod),
        closeProductDrawer: () => setSelectedProductForDrawer(null),
        isNewProductOpen,
        openNewProduct: () => setIsNewProductOpen(true),
        closeNewProduct: () => setIsNewProductOpen(false),
        isMovementModalOpen,
        movementModalConfig,
        openMovementModal: (product, defaultType) => {
          setMovementModalConfig({ product, defaultType });
          setIsMovementModalOpen(true);
        },
        closeMovementModal: () => {
          setIsMovementModalOpen(false);
          setMovementModalConfig(null);
        },
        isCommandPaletteOpen,
        openCommandPalette: () => setIsCommandPaletteOpen(true),
        closeCommandPalette: () => setIsCommandPaletteOpen(false),
        toasts,
        showToast,
        dismissToast,
        createSale,
        createMovement,
        createProduct,
        updateProduct,
        deleteProduct,
        resetStoreToDefault,
        todaySales,
        todayRevenue,
        todaySalesCount,
        lowStockProducts,
        outOfStockProducts,
        attentionProducts,
        quickRestockProduct,
      }}
    >
      {children}
    </AlmudContext.Provider>
  );
};

export const useAlmud = () => {
  const context = useContext(AlmudContext);
  if (!context) {
    throw new Error('useAlmud must be used within an AlmudProvider');
  }
  return context;
};

export const useConecta2 = useAlmud;
export const Conecta2Provider = AlmudProvider;
