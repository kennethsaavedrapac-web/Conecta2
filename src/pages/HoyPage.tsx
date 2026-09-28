import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAlmud } from '../store/AlmudContext';
import { formatMoney, formatTime, getStockHealth } from '../lib/formatters';
import { Product } from '../types';
import { ArrowRight, Sparkles, AlertCircle, ShoppingBag, ArrowUpRight } from 'lucide-react';

export const HoyPage: React.FC = () => {
  const {
    todaySales,
    todayRevenue,
    todaySalesCount,
    attentionProducts,
    setActiveTab,
    openMovementModal,
    openProductDrawer,
    openLaCaja,
  } = useAlmud();

  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  // Current date formatted in Spanish
  const todayFormatted = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const capitalizedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  // Limited to 4 products needing attention
  const topAttention = attentionProducts.slice(0, 4);

  // Latest sales (up to 5 recent sales)
  const recentSales = todaySales.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-12 md:space-y-16 max-w-3xl mx-auto py-4 md:py-8"
    >
      {/* 1. Date & Quiet Greeting */}
      <div className="space-y-3">
        <p className="text-xs md:text-sm font-medium tracking-wide text-[#6F7570]">
          {capitalizedDate} · Conecta2 Tecnología & Hardware
        </p>

        {/* 2. Main Editorial Phrase in Fraunces */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.25] text-[#1F2421] text-balance">
          Hoy has vendido{' '}
          <span
            onMouseEnter={() => setHoveredMetric('revenue')}
            onMouseLeave={() => setHoveredMetric(null)}
            onClick={() => setActiveTab('ventas')}
            className="relative inline-block font-medium text-[#1F2421] border-b-2 border-[#5F8468] hover:text-[#5F8468] transition-colors cursor-pointer px-0.5"
            title="Ver desglose de ventas de hoy"
          >
            {formatMoney(todayRevenue)}
            {hoveredMetric === 'revenue' && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 text-xs font-sans text-white bg-[#1F2421] rounded-md whitespace-nowrap shadow-md pointer-events-none z-20">
                Ver detalle en Ventas →
              </span>
            )}
          </span>{' '}
          en{' '}
          <span
            onMouseEnter={() => setHoveredMetric('salesCount')}
            onMouseLeave={() => setHoveredMetric(null)}
            onClick={() => setActiveTab('ventas')}
            className="relative inline-block font-medium text-[#1F2421] border-b-2 border-[#5F8468] hover:text-[#5F8468] transition-colors cursor-pointer px-0.5"
            title="Ver transacciones"
          >
            {todaySalesCount} {todaySalesCount === 1 ? 'venta' : 'ventas'}
            {hoveredMetric === 'salesCount' && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 text-xs font-sans text-white bg-[#1F2421] rounded-md whitespace-nowrap shadow-md pointer-events-none z-20">
                Ticket promedio:{' '}
                {todaySalesCount > 0
                  ? formatMoney(Math.round(todayRevenue / todaySalesCount))
                  : 'C$ 0'}
              </span>
            )}
          </span>
          .{' '}
          {attentionProducts.length > 0 ? (
            <>
              <span
                onMouseEnter={() => setHoveredMetric('replenish')}
                onMouseLeave={() => setHoveredMetric(null)}
                onClick={() => setActiveTab('inventario')}
                className="relative inline-block font-medium text-[#C4623A] border-b-2 border-[#C4623A] hover:text-[#A54F2D] transition-colors cursor-pointer px-0.5"
                title="Ver productos con stock bajo o agotados"
              >
                {attentionProducts.length}{' '}
                {attentionProducts.length === 1 ? 'producto necesita' : 'productos necesitan'} reposición
                {hoveredMetric === 'replenish' && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 text-xs font-sans text-white bg-[#1F2421] rounded-md whitespace-nowrap shadow-md pointer-events-none z-20">
                    Ir al inventario →
                  </span>
                )}
              </span>
              .
            </>
          ) : (
            <span className="text-[#5F8468]">Tu inventario está en nivel óptimo.</span>
          )}
        </h1>

        {/* Discrete Comparison Line */}
        <p className="text-xs md:text-sm text-[#6F7570] pt-1">
          18% más que el mismo día la semana pasada · Los SSD Kingston y los cables USB-C lideran el turno.
        </p>
      </div>

      {/* 3. Section: "Necesita atención" (Editorial List, max 4 rows, no cards) */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-[#E4DFD3] pb-2">
          <h2 className="font-serif text-lg md:text-xl font-normal text-[#1F2421]">
            Necesita atención
          </h2>
          {attentionProducts.length > 4 && (
            <button
              onClick={() => setActiveTab('inventario')}
              className="text-xs text-[#5F8468] hover:text-[#4D6D55] font-medium flex items-center gap-1 transition-colors"
            >
              <span>Ver todos ({attentionProducts.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {topAttention.length === 0 ? (
          <p className="text-sm text-[#6F7570] py-4">
            No hay productos críticos ni con existencias agotadas en este momento.
          </p>
        ) : (
          <div className="divide-y divide-[#E4DFD3]">
            {topAttention.map((prod) => {
              const health = getStockHealth(prod);
              const isOutOfStock = prod.stock === 0;

              return (
                <div
                  key={prod.id}
                  className="py-3.5 flex items-center justify-between gap-4 group transition-colors"
                >
                  {/* Product Title & Info */}
                  <div
                    onClick={() => openProductDrawer(prod)}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <p className="text-sm font-medium text-[#1F2421] group-hover:text-[#5F8468] transition-colors truncate">
                      {prod.name}
                    </p>
                    <p className="text-xs text-[#6F7570] truncate">
                      {prod.sku} · {prod.category}
                    </p>
                  </div>

                  {/* Fine level bar & remaining count */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-24 sm:w-32 hidden sm:block">
                      <div className="h-1 w-full bg-[#E4DFD3] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.max(5, health.percentage))}%`,
                            backgroundColor: health.barColor,
                          }}
                        />
                      </div>
                    </div>

                    <span
                      className={`text-xs font-semibold tabular-nums px-2 py-0.5 rounded ${
                        isOutOfStock
                          ? 'text-[#C4623A] bg-[#F3DDD1]'
                          : 'text-[#C4623A] bg-[#F3DDD1]/60'
                      }`}
                    >
                      {prod.stock} {prod.unit}s
                    </span>

                    {/* Text Button: "Reponer" */}
                    <button
                      type="button"
                      onClick={() => openMovementModal(prod, 'entrada')}
                      className="text-xs font-medium text-[#5F8468] hover:text-[#4D6D55] hover:underline px-1 py-0.5 transition-colors focus-visible:outline-none"
                    >
                      Reponer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Section: "Últimas ventas" (Clean list with hairline dividers) */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-[#E4DFD3] pb-2">
          <h2 className="font-serif text-lg md:text-xl font-normal text-[#1F2421]">
            Últimas ventas
          </h2>
          <button
            onClick={() => setActiveTab('ventas')}
            className="text-xs text-[#5F8468] hover:text-[#4D6D55] font-medium flex items-center gap-1 transition-colors"
          >
            <span>Ver historial completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentSales.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-[#6F7570]">Aún no se han registrado ventas hoy.</p>
            <button
              onClick={openLaCaja}
              className="mt-3 text-xs font-medium text-[#5F8468] hover:underline"
            >
              Abrir La Caja para registrar la primera venta →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#E4DFD3]">
            {recentSales.map((sale) => {
              const summary = sale.items
                .map((i) => `${i.quantity}x ${i.productName.split(' ')[0]} ${i.productName.split(' ')[1] || ''}`)
                .join(', ');

              return (
                <div
                  key={sale.id}
                  onClick={() => setActiveTab('ventas')}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-[#F6F3EC] px-2 -mx-2 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs font-mono text-[#6F7570] tabular-nums shrink-0">
                      {formatTime(sale.date)}
                    </span>
                    <span className="text-xs text-[#6F7570] font-mono shrink-0">
                      {sale.receiptNumber}
                    </span>
                    <p className="text-sm text-[#1F2421] group-hover:text-[#5F8468] truncate">
                      {sale.customerName ? `${sale.customerName} · ` : ''}
                      {summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-[#6F7570] capitalize hidden sm:inline">
                      {sale.paymentMethod}
                    </span>
                    <span className="text-sm font-semibold text-[#1F2421] tabular-nums">
                      {formatMoney(sale.total)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </motion.div>
  );
};
