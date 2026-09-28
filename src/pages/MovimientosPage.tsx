import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useAlmud } from '../store/AlmudContext';
import { Movement, MovementType } from '../types';
import { formatTime, formatDayDivider } from '../lib/formatters';
import {
  ArrowLeftRight,
  Plus,
  Search,
  X,
  ArrowDownLeft,
  Sliders,
  AlertOctagon,
  Receipt,
} from 'lucide-react';

type FilterType = 'todos' | MovementType;

const TYPE_FILTERS: { id: FilterType; label: string }[] = [
  { id: 'todos', label: 'Todos los movimientos' },
  { id: 'entrada', label: 'Entradas' },
  { id: 'venta', label: 'Ventas' },
  { id: 'ajuste', label: 'Ajustes' },
  { id: 'baja', label: 'Bajas / Averías' },
];

export const MovimientosPage: React.FC = () => {
  const { movements, openMovementModal, openProductDrawer, products } = useAlmud();
  const [selectedType, setSelectedType] = useState<FilterType>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter movements
  const filteredMovements = useMemo(() => {
    return movements.filter((mov) => {
      // Type match
      if (selectedType !== 'todos' && mov.type !== selectedType) return false;

      // Text search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesProduct = mov.productName.toLowerCase().includes(q);
        const matchesSku = mov.sku.toLowerCase().includes(q);
        const matchesReason = mov.reason.toLowerCase().includes(q);
        const matchesResponsible = mov.responsible.toLowerCase().includes(q);
        if (!matchesProduct && !matchesSku && !matchesReason && !matchesResponsible) return false;
      }

      return true;
    });
  }, [movements, selectedType, searchQuery]);

  // Group by day string
  const groupedMovements = useMemo(() => {
    const groups: { [dateStr: string]: Movement[] } = {};
    filteredMovements.forEach((mov) => {
      const dayKey = new Date(mov.date).toDateString();
      if (!groups[dayKey]) groups[dayKey] = [];
      groups[dayKey].push(mov);
    });
    return groups;
  }, [filteredMovements]);

  // Dot color & icon according to type
  const getTypeConfig = (type: MovementType) => {
    switch (type) {
      case 'entrada':
        return {
          dotBg: 'bg-[#5F8468]',
          textColor: 'text-[#5F8468]',
          badgeBg: 'bg-[#DCE7DC]',
          label: 'Entrada',
          icon: ArrowDownLeft,
        };
      case 'venta':
        return {
          dotBg: 'bg-[#1F2421]',
          textColor: 'text-[#1F2421]',
          badgeBg: 'bg-[#E4DFD3]',
          label: 'Venta',
          icon: Receipt,
        };
      case 'ajuste':
        return {
          dotBg: 'bg-[#C99A3B]',
          textColor: 'text-[#C99A3B]',
          badgeBg: 'bg-[#F8ECD5]',
          label: 'Ajuste',
          icon: Sliders,
        };
      case 'baja':
        return {
          dotBg: 'bg-[#C4623A]',
          textColor: 'text-[#C4623A]',
          badgeBg: 'bg-[#F3DDD1]',
          label: 'Avería / Baja',
          icon: AlertOctagon,
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 max-w-3xl mx-auto py-4 md:py-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#E4DFD3] pb-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-[#1F2421]">
            Movimientos
          </h1>
          <p className="text-xs md:text-sm text-[#6F7570] mt-1">
            Línea de tiempo de existencias: entradas de mercancía, bajas por avería, ventas y ajustes
          </p>
        </div>

        <button
          onClick={() => openMovementModal()}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#5F8468] hover:bg-[#4D6D55] rounded-xl shadow-xs transition-colors self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5F8468]"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar movimiento</span>
        </button>
      </div>

      {/* Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {TYPE_FILTERS.map((f) => {
            const isActive = selectedType === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedType(f.id)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#1F2421] text-white shadow-xs'
                    : 'bg-[#FBFAF6] text-[#6F7570] hover:text-[#1F2421] border border-[#E4DFD3]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FBFAF6] border border-[#E4DFD3] rounded-xl focus-within:border-[#5F8468] transition-colors">
            <Search className="w-3.5 h-3.5 text-[#6F7570]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar motivo, producto..."
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

      {/* Vertical Timeline */}
      {Object.keys(groupedMovements).length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[#E4DFD3] rounded-3xl bg-[#FBFAF6]/70 p-8 space-y-3">
          <ArrowLeftRight className="w-8 h-8 mx-auto text-[#6F7570]/60 stroke-1" />
          <h3 className="font-serif text-xl font-normal text-[#1F2421]">Sin movimientos</h3>
          <p className="text-sm text-[#6F7570] max-w-sm mx-auto">
            No se encontraron eventos de almacén que coincidan con tus filtros.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedMovements).map(([dateKey, dayMovements]) => {
            const firstDate = dayMovements[0]?.date;
            const dividerTitle = firstDate ? formatDayDivider(firstDate) : dateKey;

            return (
              <div key={dateKey} className="space-y-4">
                {/* Date header in Fraunces serif */}
                <div className="flex items-baseline justify-between border-b border-[#E4DFD3] pb-2">
                  <h2 className="font-serif text-lg font-medium text-[#1F2421]">
                    {dividerTitle}
                  </h2>
                  <span className="text-xs text-[#6F7570] tabular-nums">
                    {dayMovements.length} {dayMovements.length === 1 ? 'registro' : 'registros'}
                  </span>
                </div>

                {/* Timeline thread */}
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#E4DFD3]">
                  {dayMovements.map((mov) => {
                    const cfg = getTypeConfig(mov.type);
                    const isPositive = mov.quantity > 0;
                    const linkedProduct = products.find((p) => p.id === mov.productId);

                    return (
                      <div key={mov.id} className="relative group">
                        {/* Colored dot on the line */}
                        <div
                          className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ${cfg.dotBg} border-2 border-[#FBFAF6] ring-1 ring-[#E4DFD3] group-hover:scale-125 transition-transform`}
                        />

                        {/* Event Content */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                              <span
                                onClick={() => linkedProduct && openProductDrawer(linkedProduct)}
                                className="text-sm font-medium text-[#1F2421] hover:text-[#5F8468] transition-colors cursor-pointer"
                              >
                                {mov.productName}
                              </span>
                              <span className="text-xs text-[#6F7570] font-mono">
                                {mov.sku}
                              </span>
                            </div>

                            <p className="text-xs text-[#6F7570] mt-0.5">{mov.reason}</p>

                            <div className="flex items-center gap-2 text-[11px] text-[#6F7570] mt-1">
                              <span className="font-mono tabular-nums">{formatTime(mov.date)}</span>
                              <span aria-hidden="true">·</span>
                              <span>{mov.responsible}</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">
                                Stock anterior: {mov.previousStock} → Nuevo: {mov.newStock}
                              </span>
                            </div>
                          </div>

                          {/* Delta quantity badge */}
                          <div className="shrink-0 flex items-center sm:self-center gap-2 pt-1 sm:pt-0">
                            <span
                              className={`text-xs font-semibold tabular-nums px-2.5 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.textColor}`}
                            >
                              {isPositive ? `+${mov.quantity}` : mov.quantity}{' '}
                              {linkedProduct?.unit || 'uds'}
                            </span>
                          </div>
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
    </motion.div>
  );
};
