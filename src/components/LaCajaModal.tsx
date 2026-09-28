import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAlmud } from '../store/AlmudContext';
import { Product, SaleItem, PaymentMethod } from '../types';
import { formatMoney } from '../lib/formatters';
import {
  X,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Send,
  AlertTriangle,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';

export const LaCajaModal: React.FC = () => {
  const { isLaCajaOpen, closeLaCaja, products, createSale } = useAlmud();

  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tarjeta');
  const [customerName, setCustomerName] = useState('');
  const [isSuccessState, setIsSuccessState] = useState(false);
  const [completedSaleTotal, setCompletedSaleTotal] = useState(0);
  const [completedReceipt, setCompletedReceipt] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isLaCajaOpen) {
      setCart([]);
      setSearchQuery('');
      setCustomerName('');
      setIsSuccessState(false);
      setTimeout(() => searchInputRef.current?.focus(), 120);
    }
  }, [isLaCajaOpen]);

  // Keyboard shortcut: ⌘Enter / Ctrl+Enter to cobrar, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLaCajaOpen) return;
      if (e.key === 'Escape') {
        closeLaCaja();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (cart.length > 0 && !isSuccessState) {
          e.preventDefault();
          handleCheckout();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLaCajaOpen, cart, isSuccessState, paymentMethod, customerName]);

  if (!isLaCajaOpen) return null;

  // Search results
  const filteredProducts = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unitPrice,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unitPrice: product.price,
          quantity: 1,
          subtotal: product.price,
        },
      ];
    });
    setSearchQuery('');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: nextQty,
              subtotal: nextQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as SaleItem[]
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const totalAmount = cart.reduce((acc, item) => acc + item.subtotal, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const sale = createSale({
      items: cart,
      paymentMethod,
      customerName: customerName.trim() || undefined,
    });

    setCompletedSaleTotal(sale.total);
    setCompletedReceipt(sale.receiptNumber);
    setIsSuccessState(true);

    setTimeout(() => {
      closeLaCaja();
    }, 1400);
  };

  // Quick suggestions for easy one-click sales
  const popularProducts = products
    .filter((p) => p.category === 'Almacenamiento y RAM' || p.category === 'Periféricos y audio' || p.category === 'Cables y accesorios')
    .slice(0, 4);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
        {/* Scrim Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeLaCaja}
          className="fixed inset-0 bg-[#1F2421]/30 backdrop-blur-xs"
        />

        {/* Bottom Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative z-10 w-full max-w-3xl bg-[#FBFAF6] border-t md:border border-[#E4DFD3] md:rounded-t-3xl shadow-[0_-12px_48px_rgba(31,36,33,0.12)] max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Grab Handle */}
          <div className="pt-3 pb-1 flex justify-center">
            <div className="w-12 h-1 bg-[#E4DFD3] rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#E4DFD3]">
            <div className="flex items-baseline gap-3">
              <h2 className="font-serif text-2xl font-normal text-[#1F2421]">La Caja</h2>
              <span className="text-xs text-[#6F7570]">Registro de mostrador</span>
            </div>
            <button
              onClick={closeLaCaja}
              className="text-[#6F7570] hover:text-[#1F2421] p-1.5 rounded-full hover:bg-[#F6F3EC] transition-colors"
              aria-label="Cerrar caja"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Micro-screen */}
          {isSuccessState ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-16 px-6 text-center flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-14 h-14 rounded-full bg-[#DCE7DC] text-[#5F8468] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="font-serif text-3xl text-[#1F2421] font-normal">
                {formatMoney(completedSaleTotal)}
              </p>
              <p className="text-sm font-medium text-[#5F8468]">
                Venta {completedReceipt} cobrada con éxito
              </p>
              <p className="text-xs text-[#6F7570]">
                Inventario descontado automáticamente.
              </p>
            </motion.div>
          ) : (
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {/* Product search & quick chips */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#6F7570]">
                  Agregar artículos a la venta
                </label>
                <div className="relative">
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#F6F3EC] border border-[#E4DFD3] rounded-xl focus-within:border-[#5F8468] focus-within:bg-[#FBFAF6] transition-colors">
                    <Search className="w-4 h-4 text-[#6F7570] shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && filteredProducts.length > 0) {
                          e.preventDefault();
                          addToCart(filteredProducts[0]);
                        }
                      }}
                      placeholder="Buscar por componente, modelo, marca o SKU (Enter para agregar)..."
                      className="w-full bg-transparent text-sm text-[#1F2421] placeholder-[#6F7570]/60 outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-[#6F7570] hover:text-[#1F2421]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Dropdown */}
                  {filteredProducts.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#FBFAF6] border border-[#E4DFD3] rounded-xl shadow-lg z-20 overflow-hidden divide-y divide-[#E4DFD3]/60">
                      {filteredProducts.map((prod) => (
                        <button
                          key={prod.id}
                          onClick={() => addToCart(prod)}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-[#F6F3EC] transition-colors"
                        >
                          <div className="min-w-0 pr-3">
                            <p className="text-sm font-medium text-[#1F2421] truncate">
                              {prod.name}
                            </p>
                            <p className="text-xs text-[#6F7570]">
                              {prod.sku} · Quedan {prod.stock} {prod.unit}s
                            </p>
                          </div>
                          <span className="text-sm font-medium text-[#1F2421] shrink-0 tabular-nums">
                            {formatMoney(prod.price)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Popular fast chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-[#6F7570] mr-1">Rápido:</span>
                  {popularProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="px-2.5 py-1 text-xs bg-[#F6F3EC] hover:bg-[#E4DFD3] text-[#1F2421] rounded-lg transition-colors border border-[#E4DFD3]/80"
                    >
                      + {p.name.split(' ')[0]} {p.name.split(' ')[1]} ({formatMoney(p.price)})
                    </button>
                  ))}
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-[#6F7570]">
                  <span>Artículos ({cart.length})</span>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setCart([])}
                      className="text-[#C4623A] hover:underline"
                    >
                      Vaciar lista
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-[#E4DFD3] rounded-2xl bg-[#F6F3EC]/40">
                    <ShoppingBag className="w-8 h-8 mx-auto text-[#6F7570]/60 mb-2 stroke-1" />
                    <p className="text-sm font-medium text-[#1F2421]">La venta está vacía</p>
                    <p className="text-xs text-[#6F7570] mt-0.5">
                      Busca un producto arriba o haz clic en los accesos rápidos.
                    </p>
                  </div>
                ) : (
                  <div className="border border-[#E4DFD3] rounded-2xl divide-y divide-[#E4DFD3] bg-[#FBFAF6] overflow-hidden">
                    {cart.map((item) => {
                      const productInfo = products.find((p) => p.id === item.productId);
                      const isLowOrExceeded = productInfo && item.quantity > productInfo.stock;

                      return (
                        <div key={item.productId} className="p-3.5 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-[#1F2421] leading-tight">
                                {item.productName}
                              </p>
                              <p className="text-xs text-[#6F7570] mt-0.5">
                                {formatMoney(item.unitPrice)} c/u · SKU: {item.sku}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {/* Quantity Stepper */}
                              <div className="flex items-center border border-[#E4DFD3] rounded-lg bg-[#F6F3EC] overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item.productId, -1)}
                                  className="w-7 h-7 flex items-center justify-center text-[#6F7570] hover:text-[#1F2421] hover:bg-[#E4DFD3] transition-colors"
                                  aria-label="Disminuir cantidad"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-8 text-center text-xs font-semibold text-[#1F2421] tabular-nums">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.productId, 1)}
                                  className="w-7 h-7 flex items-center justify-center text-[#6F7570] hover:text-[#1F2421] hover:bg-[#E4DFD3] transition-colors"
                                  aria-label="Aumentar cantidad"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <span className="w-20 text-right text-sm font-semibold text-[#1F2421] tabular-nums">
                                {formatMoney(item.subtotal)}
                              </span>

                              <button
                                onClick={() => removeItem(item.productId)}
                                className="text-[#6F7570] hover:text-[#C4623A] p-1 transition-colors"
                                aria-label="Eliminar producto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Inline gentle notice if requested quantity exceeds stock */}
                          {isLowOrExceeded && (
                            <div className="flex items-center gap-1.5 text-xs text-[#C4623A] bg-[#F3DDD1]/40 px-2.5 py-1 rounded-lg">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                Existencia en bodega: {productInfo?.stock ?? 0}{' '}
                                {productInfo?.unit || 'uds'}. Se registrará bajo advertencia.
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Checkout details: Customer & Payment Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Customer name */}
                <div>
                  <label className="block text-xs font-medium text-[#6F7570] mb-1.5">
                    Cliente (opcional)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Mostrador o nombre de cliente..."
                    className="w-full px-3.5 py-2 text-sm bg-[#F6F3EC] border border-[#E4DFD3] rounded-xl outline-none focus:border-[#5F8468] focus:bg-[#FBFAF6] transition-colors"
                  />
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-medium text-[#6F7570] mb-1.5">
                    Método de pago
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F6F3EC] border border-[#E4DFD3] rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('tarjeta')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                        paymentMethod === 'tarjeta'
                          ? 'bg-[#FBFAF6] text-[#1F2421] shadow-xs'
                          : 'text-[#6F7570] hover:text-[#1F2421]'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Tarjeta</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('efectivo')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                        paymentMethod === 'efectivo'
                          ? 'bg-[#FBFAF6] text-[#1F2421] shadow-xs'
                          : 'text-[#6F7570] hover:text-[#1F2421]'
                      }`}
                    >
                      <Banknote className="w-3.5 h-3.5" />
                      <span>Efectivo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('transferencia')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                        paymentMethod === 'transferencia'
                          ? 'bg-[#FBFAF6] text-[#1F2421] shadow-xs'
                          : 'text-[#6F7570] hover:text-[#1F2421]'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Transf.</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Bar with Calculated Total and "Cobrar" action */}
          {!isSuccessState && (
            <div className="flex items-center justify-between px-6 py-4 bg-[#F6F3EC]/80 border-t border-[#E4DFD3]">
              <div>
                <p className="text-xs text-[#6F7570]">Total a cobrar</p>
                <p className="font-serif text-3xl font-medium text-[#1F2421] tabular-nums tracking-tight">
                  {formatMoney(totalAmount)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden md:inline text-xs text-[#6F7570] font-mono">⌘ + Enter</span>
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-[#5F8468] hover:bg-[#4D6D55] disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] rounded-2xl shadow-[0_4px_16px_rgba(95,132,104,0.25)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5F8468]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Cobrar venta</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
