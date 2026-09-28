import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAlmud } from '../store/AlmudContext';
import { MovementType } from '../types';
import {
  X,
  ArrowDownLeft,
  Sliders,
  AlertOctagon,
  ArrowLeftRight,
} from 'lucide-react';

export const MovementModal: React.FC = () => {
  const {
    isMovementModalOpen,
    closeMovementModal,
    movementModalConfig,
    products,
    createMovement,
  } = useAlmud();

  const [selectedProductId, setSelectedProductId] = useState('');
  const [type, setType] = useState<MovementType>('entrada');
  const [quantity, setQuantity] = useState<number | ''>(5);
  const [reason, setReason] = useState('');
  const [responsible, setResponsible] = useState('Turno actual');

  useEffect(() => {
    if (isMovementModalOpen) {
      if (movementModalConfig?.product) {
        setSelectedProductId(movementModalConfig.product.id);
      } else if (products.length > 0) {
        setSelectedProductId(products[0].id);
      }
      setType(movementModalConfig?.defaultType || 'entrada');
      setQuantity(5);
      setReason('');
      setResponsible('Turno actual');
    }
  }, [isMovementModalOpen, movementModalConfig, products]);

  if (!isMovementModalOpen) return null;

  const currentProduct = products.find((p) => p.id === selectedProductId);

  // Compute stock preview
  const prevStock = currentProduct?.stock ?? 0;
  let newStockPreview = prevStock;
  const numQty = typeof quantity === 'number' ? quantity : 0;

  if (type === 'entrada') {
    newStockPreview = prevStock + Math.abs(numQty);
  } else if (type === 'baja') {
    newStockPreview = Math.max(0, prevStock - Math.abs(numQty));
  } else if (type === 'ajuste') {
    // adjustment can be positive or negative
    newStockPreview = Math.max(0, prevStock + numQty);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity === '' || Number(quantity) === 0) return;

    createMovement({
      productId: selectedProductId,
      type,
      quantity: Number(quantity),
      reason: reason.trim() || `Registro manual de ${type}`,
      responsible: responsible.trim() || 'Turno actual',
    });

    closeMovementModal();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeMovementModal}
          className="fixed inset-0 bg-[#1F2421]/25 backdrop-blur-xs"
        />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative z-10 w-full max-w-xl bg-[#FBFAF6] border-t md:border border-[#E4DFD3] md:rounded-t-3xl shadow-[0_-12px_48px_rgba(31,36,33,0.12)] overflow-hidden"
        >
          {/* Grab Bar */}
          <div className="pt-3 pb-1 flex justify-center">
            <div className="w-12 h-1 bg-[#E4DFD3] rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#E4DFD3]">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-[#5F8468]" />
              <h2 className="font-serif text-xl font-normal text-[#1F2421]">
                Registrar movimiento de stock
              </h2>
            </div>
            <button
              onClick={closeMovementModal}
              className="p-1.5 text-[#6F7570] hover:text-[#1F2421] rounded-full hover:bg-[#F6F3EC]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Movement Type Pill Selector */}
            <div>
              <label className="block text-xs font-medium text-[#6F7570] mb-1.5">
                Tipo de movimiento
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-[#F6F3EC] border border-[#E4DFD3] rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('entrada')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    type === 'entrada'
                      ? 'bg-[#FBFAF6] text-[#5F8468] shadow-xs border border-[#5F8468]/30'
                      : 'text-[#6F7570] hover:text-[#1F2421]'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5 text-[#5F8468]" />
                  <span>Entrada</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('ajuste')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    type === 'ajuste'
                      ? 'bg-[#FBFAF6] text-[#C99A3B] shadow-xs border border-[#C99A3B]/30'
                      : 'text-[#6F7570] hover:text-[#1F2421]'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-[#C99A3B]" />
                  <span>Ajuste</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('baja')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    type === 'baja'
                      ? 'bg-[#FBFAF6] text-[#C4623A] shadow-xs border border-[#C4623A]/30'
                      : 'text-[#6F7570] hover:text-[#1F2421]'
                  }`}
                >
                  <AlertOctagon className="w-3.5 h-3.5 text-[#C4623A]" />
                  <span>Baja / Avería</span>
                </button>
              </div>
            </div>

            {/* Product Selector */}
            <div>
              <label className="block text-xs font-medium text-[#6F7570] mb-1">Producto</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F6F3EC] border border-[#E4DFD3] rounded-xl outline-none focus:border-[#5F8468] focus:bg-[#FBFAF6]"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.stock} {p.unit}s en inventario)
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity & Stock preview */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#6F7570] mb-1">
                  Cantidad ({currentProduct?.unit || 'uds'})
                </label>
                <input
                  type="number"
                  step="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="5"
                  className="w-full px-3.5 py-2 text-sm tabular-nums bg-[#F6F3EC] border border-[#E4DFD3] rounded-xl outline-none focus:border-[#5F8468] focus:bg-[#FBFAF6]"
                />
                <p className="text-[11px] text-[#6F7570] mt-1">
                  {type === 'ajuste' ? 'Usa número negativo para restar' : 'Unidades a procesar'}
                </p>
              </div>

              {/* Dynamic Live Preview */}
              <div className="p-3 bg-[#F6F3EC] border border-[#E4DFD3] rounded-xl flex flex-col justify-center">
                <span className="text-[11px] text-[#6F7570]">Efecto en inventario</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xs text-[#6F7570] tabular-nums">{prevStock}</span>
                  <span className="text-xs text-[#6F7570]">→</span>
                  <span className="font-serif text-lg font-medium text-[#1F2421] tabular-nums">
                    {newStockPreview} {currentProduct?.unit}s
                  </span>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-medium text-[#6F7570] mb-1">
                Motivo / Justificación
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  type === 'entrada'
                    ? 'ej. Recepción de lote mayorista #2610'
                    : type === 'baja'
                    ? 'ej. Falla técnica en banco de pruebas (DOA) / Empaque dañado'
                    : 'ej. Ajuste tras conteo físico semanal'
                }
                className="w-full px-3.5 py-2 text-sm bg-[#F6F3EC] border border-[#E4DFD3] rounded-xl outline-none focus:border-[#5F8468] focus:bg-[#FBFAF6]"
              />
            </div>

            {/* Responsible */}
            <div>
              <label className="block text-xs font-medium text-[#6F7570] mb-1">Responsable</label>
              <input
                type="text"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="Turno actual / Kenneth / Soporte Técnico"
                className="w-full px-3.5 py-2 text-sm bg-[#F6F3EC] border border-[#E4DFD3] rounded-xl outline-none focus:border-[#5F8468] focus:bg-[#FBFAF6]"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeMovementModal}
                className="px-4 py-2 text-sm text-[#6F7570] hover:text-[#1F2421]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#5F8468] hover:bg-[#4D6D55] rounded-xl shadow-xs"
              >
                Confirmar movimiento
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
