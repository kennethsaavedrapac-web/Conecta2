import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAlmud } from '../store/AlmudContext';
import { ActiveTab, Product } from '../types';
import { formatMoney, getStockHealth } from '../lib/formatters';
import {
  Search,
  Receipt,
  Plus,
  ArrowDownLeft,
  Calendar,
  Package,
  ArrowLeftRight,
  BarChart3,
  FileSpreadsheet,
  LogOut,
  User,
  X,
  Sun,
  Moon,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    closeCommandPalette,
    products,
    setActiveTab,
    openLaCaja,
    openNewProduct,
    openMovementModal,
    openProductDrawer,
    currentUser,
    logout,
    resolvedTheme,
    toggleTheme,
    setTheme,
  } = useAlmud();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isCommandPaletteOpen]);

  // Handle escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        closeCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, closeCommandPalette]);

  if (!isCommandPaletteOpen) return null;

  // Filtered lists
  const filteredProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    : products.slice(0, 5);

  type ActionItem = {
    id: string;
    label: string;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    run: () => void;
  };

  const defaultActions: ActionItem[] = [
    {
      id: 'action-sale',
      label: 'Registrar nueva venta',
      description: 'Abrir el terminal de La Caja',
      icon: Receipt,
      run: () => {
        closeCommandPalette();
        openLaCaja();
      },
    },
    {
      id: 'action-stock-in',
      label: 'Registrar entrada de mercancía',
      description: 'Añadir unidades al inventario',
      icon: ArrowDownLeft,
      run: () => {
        closeCommandPalette();
        openMovementModal(undefined, 'entrada');
      },
    },
    {
      id: 'action-new-product',
      label: 'Crear nuevo producto',
      description: 'Registrar hardware, periférico o accesorio tech',
      icon: Plus,
      run: () => {
        closeCommandPalette();
        openNewProduct();
      },
    },
    {
      id: 'action-toggle-theme',
      label: resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro',
      description: 'Alternar tema de interfaz día/noche',
      icon: resolvedTheme === 'dark' ? Sun : Moon,
      run: () => {
        closeCommandPalette();
        toggleTheme();
      },
    },
    {
      id: 'action-nav-hoy',
      label: 'Ir a: Hoy',
      icon: Calendar,
      run: () => {
        setActiveTab('hoy');
        closeCommandPalette();
      },
    },
    {
      id: 'action-nav-inv',
      label: 'Ir a: Inventario',
      icon: Package,
      run: () => {
        setActiveTab('inventario');
        closeCommandPalette();
      },
    },
    {
      id: 'action-nav-mov',
      label: 'Ir a: Movimientos',
      icon: ArrowLeftRight,
      run: () => {
        setActiveTab('movimientos');
        closeCommandPalette();
      },
    },
    {
      id: 'action-nav-rep',
      label: 'Ir a: Reportes',
      icon: BarChart3,
      run: () => {
        setActiveTab('reportes');
        closeCommandPalette();
      },
    },
    {
      id: 'action-logout',
      label: 'Cerrar turno actual',
      description: `Finalizar sesión de ${currentUser?.name || 'usuario'}`,
      icon: LogOut,
      run: () => {
        closeCommandPalette();
        logout();
      },
    },
  ];

  const matchedActions = defaultActions.filter(
    (a) =>
      a.label.toLowerCase().includes(query.toLowerCase()) ||
      a.description?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={closeCommandPalette}
          className="fixed inset-0 bg-[#1F2421]/25 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -8 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-xl bg-[#FBFAF6] border border-[#E4DFD3] rounded-3xl shadow-[0_20px_50px_rgba(31,36,33,0.12)] overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E4DFD3]">
            <Search className="w-5 h-5 text-[#6F7570] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe un producto, acción o comando..."
              className="w-full bg-transparent text-base text-[#1F2421] placeholder-[#6F7570]/60 outline-none"
            />
            <button
              onClick={closeCommandPalette}
              className="text-[#6F7570] hover:text-[#1F2421] p-1 rounded-lg"
              aria-label="Cerrar paleta"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto p-3 space-y-4">
            {/* Products Section */}
            {filteredProducts.length > 0 && (
              <div>
                <p className="px-3 py-1 text-[11px] font-medium tracking-wider text-[#6F7570] uppercase">
                  {query.trim() ? 'Productos encontrados' : 'Productos recientes'}
                </p>
                <div className="space-y-1 mt-1">
                  {filteredProducts.map((prod) => {
                    const health = getStockHealth(prod);
                    return (
                      <button
                        key={prod.id}
                        onClick={() => {
                          closeCommandPalette();
                          openProductDrawer(prod);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F6F3EC] text-left transition-colors group"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-sm font-medium text-[#1F2421] group-hover:text-[#5F8468] transition-colors truncate">
                            {prod.name}
                          </p>
                          <p className="text-xs text-[#6F7570] truncate">
                            {prod.sku} · {prod.category}
                          </p>
                        </div>

                        <div className="text-right shrink-0 flex items-center gap-3">
                          <span
                            className="text-xs px-2 py-0.5 rounded-md tabular-nums font-medium"
                            style={{
                              backgroundColor: `${health.barColor}18`,
                              color: health.barColor,
                            }}
                          >
                            {prod.stock} {prod.unit}s
                          </span>
                          <span className="text-sm font-medium text-[#1F2421] tabular-nums">
                            {formatMoney(prod.price)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions Section */}
            {matchedActions.length > 0 && (
              <div>
                <p className="px-3 py-1 text-[11px] font-medium tracking-wider text-[#6F7570] uppercase">
                  Comandos & Navegación
                </p>
                <div className="space-y-1 mt-1">
                  {matchedActions.map((act) => {
                    const Icon = act.icon;
                    return (
                      <button
                        key={act.id}
                        onClick={act.run}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F6F3EC] text-left transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#F6F3EC] border border-[#E4DFD3] flex items-center justify-center shrink-0 group-hover:border-[#5F8468]/40">
                          <Icon className="w-4 h-4 text-[#5F8468]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[#1F2421] leading-tight">
                            {act.label}
                          </p>
                          {act.description && (
                            <p className="text-xs text-[#6F7570] mt-0.5">{act.description}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredProducts.length === 0 && matchedActions.length === 0 && (
              <div className="py-12 text-center text-[#6F7570]">
                <p className="text-sm">No se encontraron resultados para "{query}"</p>
                <p className="text-xs mt-1 text-[#6F7570]/80">
                  Prueba buscando por nombre de producto, marca, SKU o categoría.
                </p>
              </div>
            )}
          </div>

          {/* Footer Shortcuts hint */}
          <div className="px-5 py-3 bg-[#F6F3EC]/70 border-t border-[#E4DFD3] flex items-center justify-between text-[11px] text-[#6F7570]">
            <div className="flex items-center gap-2">
              <span className="font-mono bg-[#FBFAF6] px-1.5 py-0.5 rounded border border-[#E4DFD3]">
                Esc
              </span>
              <span>para cerrar</span>
            </div>
            <span>Conecta2 · Control de inventario</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
