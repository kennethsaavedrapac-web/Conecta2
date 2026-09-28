import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useAlmud } from '../store/AlmudContext';
import { Product, ProductCategory } from '../types';
import { formatMoney, getStockHealth } from '../lib/formatters';
import {
  Search,
  Plus,
  ChevronRight,
  PackageOpen,
  Filter,
  X,
} from 'lucide-react';

type StockFilter = 'todos' | 'bajo' | 'agotados' | ProductCategory;

const STOCK_FILTERS: { id: StockFilter; label: string }[] = [
  { id: 'todos', label: 'Todos los productos' },
  { id: 'bajo', label: 'Stock bajo' },
  { id: 'agotados', label: 'Agotados' },
  { id: 'Cómputo y laptops', label: 'Laptops y cómputo' },
  { id: 'Almacenamiento y RAM', label: 'Almacenamiento & RAM' },
  { id: 'Periféricos y audio', label: 'Periféricos & audio' },
  { id: 'Redes y conectividad', label: 'Redes & WiFi' },
  { id: 'Cables y accesorios', label: 'Cables & adaptadores' },
];

export const InventarioPage: React.FC = () => {
  const { products, openProductDrawer, openNewProduct } = useAlmud();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<StockFilter>('todos');

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search text match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.origin && p.origin.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Filter category or stock state
      if (selectedFilter === 'todos') return true;
      if (selectedFilter === 'bajo') return p.stock > 0 && p.stock <= p.minStock;
      if (selectedFilter === 'agotados') return p.stock === 0;
      return p.category === selectedFilter;
    });
  }, [products, searchQuery, selectedFilter]);

  // Counts for filters
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 max-w-4xl mx-auto py-4 md:py-8"
    >
      {/* Top Header: Title & New Product */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#E4DFD3] pb-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-[#1F2421]">
            Inventario
          </h1>
          <p className="text-xs md:text-sm text-[#6F7570] mt-1">
            {products.length} productos registrados · Control de stock, mínimos y costos
          </p>
        </div>

        <button
          onClick={openNewProduct}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#5F8468] hover:bg-[#4D6D55] rounded-xl shadow-xs transition-colors self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5F8468]"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo producto</span>
        </button>
      </div>

      {/* Search Bar & Filter Pills */}
      <div className="space-y-3">
        {/* Broad Search Input */}
        <div className="relative">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#FBFAF6] border border-[#E4DFD3] rounded-2xl focus-within:border-[#5F8468] focus-within:shadow-[0_2px_12px_rgba(95,132,104,0.08)] transition-all">
            <Search className="w-4 h-4 text-[#6F7570] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, origen, SKU o categoría..."
              className="w-full bg-transparent text-sm text-[#1F2421] placeholder-[#6F7570]/60 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#6F7570] hover:text-[#1F2421]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs / Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {STOCK_FILTERS.map((f) => {
            const isActive = selectedFilter === f.id;
            let badge = null;
            if (f.id === 'bajo' && lowStockCount > 0) {
              badge = lowStockCount;
            } else if (f.id === 'agotados' && outOfStockCount > 0) {
              badge = outOfStockCount;
            }

            return (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#1F2421] text-white shadow-xs'
                    : 'bg-[#FBFAF6] text-[#6F7570] hover:text-[#1F2421] border border-[#E4DFD3]'
                }`}
              >
                <span>{f.label}</span>
                {badge !== null && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-full tabular-nums ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : f.id === 'agotados'
                        ? 'bg-[#C4623A] text-white'
                        : 'bg-[#F3DDD1] text-[#C4623A]'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product List in Spacious Rows */}
      {filteredProducts.length === 0 ? (
        /* Empty State with minimal line illustration and warm message */
        <div className="py-16 text-center border border-dashed border-[#E4DFD3] rounded-3xl bg-[#FBFAF6]/70 p-8 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#F6F3EC] border border-[#E4DFD3] flex items-center justify-center text-[#6F7570]">
            <PackageOpen className="w-8 h-8 stroke-1 text-[#6F7570]" />
          </div>
          <h3 className="font-serif text-xl font-normal text-[#1F2421]">
            No encontramos productos
          </h3>
          <p className="text-sm text-[#6F7570] max-w-sm mx-auto">
            {searchQuery
              ? `No hay coincidencias para "${searchQuery}". Intenta con otro término o limpia los filtros.`
              : 'No hay artículos registrados bajo este filtro en el inventario de la tienda.'}
          </p>
          {(searchQuery || selectedFilter !== 'todos') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('todos');
              }}
              className="mt-2 text-xs font-medium text-[#5F8468] hover:underline"
            >
              Restablecer todos los filtros
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-[#E4DFD3]">
          {filteredProducts.map((prod) => {
            const health = getStockHealth(prod);
            const isOutOfStock = prod.stock === 0;

            return (
              <div
                key={prod.id}
                onClick={() => openProductDrawer(prod)}
                className="py-4 px-3 -mx-3 hover:bg-[#FBFAF6] rounded-2xl transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Product Name, SKU & Category */}
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-medium text-[#1F2421] group-hover:text-[#5F8468] transition-colors truncate">
                      {prod.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#6F7570] mt-0.5">
                    <span className="font-mono text-[11px] text-[#6F7570]/90">{prod.sku}</span>
                    <span aria-hidden="true">·</span>
                    <span>{prod.category}</span>
                    {prod.origin && (
                      <>
                        <span aria-hidden="true" className="hidden sm:inline">·</span>
                        <span className="hidden sm:inline truncate max-w-xs">{prod.origin}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Price, Stock Level Bar & Amount */}
                <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E4DFD3]/40">
                  {/* Price */}
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-[#1F2421] tabular-nums">
                      {formatMoney(prod.price)}
                    </p>
                    <p className="text-[11px] text-[#6F7570] tabular-nums">
                      Costo: {formatMoney(prod.cost)}
                    </p>
                  </div>

                  {/* Level bar + Stock count */}
                  <div className="flex items-center gap-3">
                    <div className="w-20 md:w-28 flex flex-col gap-1 items-end">
                      <div className="h-1.5 w-full bg-[#E4DFD3] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.max(isOutOfStock ? 0 : 8, health.percentage))}%`,
                            backgroundColor: health.barColor,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-[#6F7570] tabular-nums">
                        mín. {prod.minStock} {prod.unit}s
                      </span>
                    </div>

                    <div className="w-16 text-right">
                      <span
                        className={`text-xs font-semibold tabular-nums px-2 py-0.5 rounded ${
                          isOutOfStock
                            ? 'text-[#C4623A] bg-[#F3DDD1]'
                            : health.health === 'bajo'
                            ? 'text-[#C4623A] bg-[#F3DDD1]/70'
                            : health.health === 'medio'
                            ? 'text-[#C99A3B] bg-[#F8ECD5]'
                            : 'text-[#5F8468] bg-[#DCE7DC]/70'
                        }`}
                      >
                        {prod.stock} {prod.unit}s
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#6F7570]/60 group-hover:text-[#5F8468] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
