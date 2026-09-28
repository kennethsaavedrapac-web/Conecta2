import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAlmud } from '../store/AlmudContext';
import { Sale, PaymentMethod } from '../types';
import {
  formatMoney,
  formatTime,
  formatDayDivider,
  formatFullDate,
} from '../lib/formatters';
import {
  Plus,
  Receipt,
  Search,
  CreditCard,
  Banknote,
  Send,
  X,
  Printer,
  Calendar,
} from 'lucide-react';

type PeriodFilter = 'hoy' | '7dias' | 'mes';

export const VentasPage: React.FC = () => {
  const { sales, openLaCaja } = useAlmud();
  const [period, setPeriod] = useState<PeriodFilter>('hoy');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSaleForDetail, setSelectedSaleForDetail] = useState<Sale | null>(null);

  // Filter sales by selected period
  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter((sale) => {
      const saleDate = new Date(sale.date);

      // Period matching
      if (period === 'hoy') {
        if (saleDate.toDateString() !== now.toDateString()) return false;
      } else if (period === '7dias') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        if (saleDate < sevenDaysAgo) return false;
      } else if (period === 'mes') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        if (saleDate < thirtyDaysAgo) return false;
      }

      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesReceipt = sale.receiptNumber.toLowerCase().includes(q);
        const matchesCustomer = sale.customerName?.toLowerCase().includes(q);
        const matchesItems = sale.items.some((it) => it.productName.toLowerCase().includes(q));
        if (!matchesReceipt && !matchesCustomer && !matchesItems) return false;
      }

      return true;
    });
  }, [sales, period, searchQuery]);

  // Group by day string
  const groupedSales = useMemo(() => {
    const groups: { [dateStr: string]: Sale[] } = {};
    filteredSales.forEach((sale) => {
      const dayKey = new Date(sale.date).toDateString();
      if (!groups[dayKey]) groups[dayKey] = [];
      groups[dayKey].push(sale);
    });
    return groups;
  }, [filteredSales]);

  // Period total sum
  const periodTotal = filteredSales.reduce((sum, s) => sum + s.total, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 max-w-4xl mx-auto py-4 md:py-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#E4DFD3] pb-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-[#1F2421]">
            Ventas
          </h1>
          <p className="text-xs md:text-sm text-[#6F7570] mt-1">
            Historial de tickets, métodos de pago y cobros de mostrador
          </p>
        </div>

        <button
          onClick={openLaCaja}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#5F8468] hover:bg-[#4D6D55] rounded-xl shadow-xs transition-colors self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5F8468]"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva venta (Caja)</span>
        </button>
      </div>

      {/* Period Selector & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Period Pills */}
        <div className="flex items-center gap-1 p-1 bg-[#FBFAF6] border border-[#E4DFD3] rounded-2xl w-fit">
          <button
            onClick={() => setPeriod('hoy')}
            className={`px-4 py-1.5 text-xs font-medium rounded-xl transition-all ${
              period === 'hoy'
                ? 'bg-[#1F2421] text-white shadow-xs'
                : 'text-[#6F7570] hover:text-[#1F2421]'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setPeriod('7dias')}
            className={`px-4 py-1.5 text-xs font-medium rounded-xl transition-all ${
              period === '7dias'
                ? 'bg-[#1F2421] text-white shadow-xs'
                : 'text-[#6F7570] hover:text-[#1F2421]'
            }`}
          >
            Últimos 7 días
          </button>
          <button
            onClick={() => setPeriod('mes')}
            className={`px-4 py-1.5 text-xs font-medium rounded-xl transition-all ${
              period === 'mes'
                ? 'bg-[#1F2421] text-white shadow-xs'
                : 'text-[#6F7570] hover:text-[#1F2421]'
            }`}
          >
            Último mes
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FBFAF6] border border-[#E4DFD3] rounded-xl focus-within:border-[#5F8468] transition-colors">
            <Search className="w-3.5 h-3.5 text-[#6F7570]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ticket o cliente..."
              className="w-full bg-transparent text-xs text-[#1F2421] placeholder-[#6F7570]/60 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#6F7570] hover:text-[#1F2421]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Period summary banner */}
      <div className="px-4 py-3 bg-[#FBFAF6] border border-[#E4DFD3] rounded-2xl flex items-center justify-between text-xs text-[#6F7570]">
        <span>
          {filteredSales.length} {filteredSales.length === 1 ? 'venta registrada' : 'ventas registradas'} en este periodo
        </span>
        <span className="text-sm font-semibold text-[#1F2421] tabular-nums">
          Total: {formatMoney(periodTotal)}
        </span>
      </div>

      {/* Grouped Sales List */}
      {Object.keys(groupedSales).length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[#E4DFD3] rounded-3xl bg-[#FBFAF6]/70 p-8 space-y-3">
          <Receipt className="w-8 h-8 mx-auto text-[#6F7570]/60 stroke-1" />
          <h3 className="font-serif text-xl font-normal text-[#1F2421]">Sin ventas en este periodo</h3>
          <p className="text-sm text-[#6F7570] max-w-sm mx-auto">
            {searchQuery
              ? `No encontramos ventas que coincidan con "${searchQuery}".`
              : 'No hay registros de ventas para el filtro de tiempo seleccionado.'}
          </p>
          <button
            onClick={openLaCaja}
            className="mt-2 text-xs font-medium text-[#5F8468] hover:underline"
          >
            Registrar una nueva venta ahora →
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSales).map(([dateKey, daySales]) => {
            const firstSaleDate = daySales[0]?.date;
            const dividerTitle = firstSaleDate ? formatDayDivider(firstSaleDate) : dateKey;
            const daySum = daySales.reduce((acc, s) => acc + s.total, 0);

            return (
              <div key={dateKey} className="space-y-3">
                {/* Date divider in Fraunces serif */}
                <div className="flex items-baseline justify-between border-b border-[#E4DFD3] pb-2">
                  <h2 className="font-serif text-lg font-medium text-[#1F2421]">
                    {dividerTitle}
                  </h2>
                  <span className="text-xs text-[#6F7570] tabular-nums">
                    {daySales.length} {daySales.length === 1 ? 'venta' : 'ventas'} · {formatMoney(daySum)}
                  </span>
                </div>

                {/* Day sales items */}
                <div className="divide-y divide-[#E4DFD3]">
                  {daySales.map((sale) => {
                    const itemsSummary = sale.items
                      .map((i) => `${i.quantity}× ${i.productName}`)
                      .join(', ');

                    return (
                      <div
                        key={sale.id}
                        onClick={() => setSelectedSaleForDetail(sale)}
                        className="py-3.5 px-2 -mx-2 hover:bg-[#FBFAF6] rounded-xl transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4"
                      >
                        {/* Time & Receipt & Items */}
                        <div className="min-w-0 flex-1 flex items-start sm:items-center gap-3">
                          <span className="text-xs font-mono text-[#6F7570] tabular-nums shrink-0 mt-0.5 sm:mt-0">
                            {formatTime(sale.date)}
                          </span>
                          <span className="text-xs font-mono text-[#6F7570] shrink-0 mt-0.5 sm:mt-0">
                            {sale.receiptNumber}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-[#1F2421] group-hover:text-[#5F8468] transition-colors truncate">
                              {sale.customerName ? `${sale.customerName} — ` : ''}
                              {itemsSummary}
                            </p>
                          </div>
                        </div>

                        {/* Payment Method & Total */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-16 sm:pl-0">
                          {/* Payment method soft pill */}
                          <span className="px-2 py-0.5 text-[11px] rounded-md font-medium capitalize bg-[#F6F3EC] text-[#6F7570] border border-[#E4DFD3]/80">
                            {sale.paymentMethod}
                          </span>

                          <span className="text-sm font-semibold text-[#1F2421] tabular-nums w-20 text-right">
                            {formatMoney(sale.total)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sale Detail Modal */}
      <AnimatePresence>
        {selectedSaleForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSaleForDetail(null)}
              className="fixed inset-0 bg-[#1F2421]/25 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative z-10 w-full max-w-md bg-[#FBFAF6] border border-[#E4DFD3] rounded-3xl shadow-[0_20px_50px_rgba(31,36,33,0.12)] p-6 space-y-5"
            >
              <div className="flex items-start justify-between border-b border-[#E4DFD3] pb-3">
                <div>
                  <span className="text-xs text-[#6F7570] font-mono">
                    {selectedSaleForDetail.receiptNumber}
                  </span>
                  <h3 className="font-serif text-xl font-normal text-[#1F2421]">
                    Comprobante de venta
                  </h3>
                  <p className="text-xs text-[#6F7570]">
                    {formatFullDate(selectedSaleForDetail.date)} · {formatTime(selectedSaleForDetail.date)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSaleForDetail(null)}
                  className="p-1 text-[#6F7570] hover:text-[#1F2421] rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedSaleForDetail.customerName && (
                <div className="text-xs text-[#6F7570]">
                  <span className="font-medium text-[#1F2421]">Cliente:</span>{' '}
                  {selectedSaleForDetail.customerName}
                </div>
              )}

              {/* Items Breakdown */}
              <div className="space-y-2 border-b border-[#E4DFD3] pb-4">
                <p className="text-xs font-medium text-[#6F7570]">Desglose de artículos</p>
                <div className="divide-y divide-[#E4DFD3]/60">
                  {selectedSaleForDetail.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium text-[#1F2421]">{item.productName}</p>
                        <p className="text-[#6F7570]">
                          {item.quantity} × {formatMoney(item.unitPrice)}
                        </p>
                      </div>
                      <span className="font-semibold text-[#1F2421] tabular-nums">
                        {formatMoney(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Total */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <p className="text-xs text-[#6F7570]">Método</p>
                  <p className="text-xs font-medium text-[#1F2421] capitalize">
                    {selectedSaleForDetail.paymentMethod}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#6F7570]">Total cobrado</p>
                  <p className="font-serif text-2xl font-medium text-[#1F2421] tabular-nums">
                    {formatMoney(selectedSaleForDetail.total)}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedSaleForDetail(null)}
                  className="px-4 py-2 text-xs font-medium text-[#1F2421] bg-[#F6F3EC] hover:bg-[#E4DFD3] rounded-xl transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
