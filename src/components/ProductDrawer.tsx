import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAlmud } from '../store/AlmudContext';
import { Product, ProductCategory } from '../types';
import { formatMoney, getStockHealth, formatDateShort, formatTime } from '../lib/formatters';
import {
  X,
  Package,
  ArrowDownLeft,
  Sliders,
  History,
  Trash2,
  Check,
  TrendingUp,
} from 'lucide-react';

const CATEGORIES: ProductCategory[] = [
  'Cómputo y laptops',
  'Almacenamiento y RAM',
  'Periféricos y audio',
  'Redes y conectividad',
  'Cables y accesorios',
];

export const ProductDrawer: React.FC = () => {
  const {
    selectedProductForDrawer,
    closeProductDrawer,
    isNewProductOpen,
    closeNewProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    movements,
    openMovementModal,
  } = useAlmud();

  const isOpen = Boolean(selectedProductForDrawer || isNewProductOpen);
  const isCreationMode = isNewProductOpen;

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Almacenamiento y RAM');
  const [price, setPrice] = useState<number | ''>('');
  const [cost, setCost] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number | ''>(5);
  const [unit, setUnit] = useState('bolsa');
  const [description, setDescription] = useState('');
  const [origin, setOrigin] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Quick inline entry state
  const [quickEntryAmount, setQuickEntryAmount] = useState<number | ''>('');
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);

  useEffect(() => {
    if (selectedProductForDrawer) {
      setName(selectedProductForDrawer.name);
      setSku(selectedProductForDrawer.sku);
      setCategory(selectedProductForDrawer.category);
      setPrice(selectedProductForDrawer.price);
      setCost(selectedProductForDrawer.cost);
      setStock(selectedProductForDrawer.stock);
      setMinStock(selectedProductForDrawer.minStock);
      setUnit(selectedProductForDrawer.unit || 'pza');
      setDescription(selectedProductForDrawer.description || '');
      setOrigin(selectedProductForDrawer.origin || '');
      setErrors({});
      setConfirmDelete(false);
      setIsQuickEntryOpen(false);
      setQuickEntryAmount('');
    } else if (isNewProductOpen) {
      setName('');
      setSku(`ALM-${Math.floor(100 + Math.random() * 900)}`);
      setCategory('Almacenamiento y RAM');
      setPrice('');
      setCost('');
      setStock(10);
      setMinStock(5);
      setUnit('pza');
      setDescription('');
      setOrigin('');
      setErrors({});
      setConfirmDelete(false);
      setIsQuickEntryOpen(false);
    }
  }, [selectedProductForDrawer, isNewProductOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isCreationMode) closeNewProduct();
    else closeProductDrawer();
  };

  const validate = () => {
    const err: Record<string, string> = {};
    if (!name.trim()) err.name = 'El nombre es obligatorio';
    if (!sku.trim()) err.sku = 'El SKU es obligatorio';
    if (price === '' || Number(price) <= 0) err.price = 'Ingresa un precio de venta válido';
    if (cost === '' || Number(cost) < 0) err.cost = 'Ingresa un costo de adquisición';
    if (stock === '' || Number(stock) < 0) err.stock = 'El stock debe ser 0 o superior';
    if (minStock === '' || Number(minStock) < 0) err.minStock = 'Indica el mínimo deseado';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isCreationMode) {
      createProduct({
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category,
        price: Number(price),
        cost: Number(cost),
        stock: Number(stock),
        minStock: Number(minStock),
        unit: unit.trim() || 'pza',
        description: description.trim() || undefined,
        origin: origin.trim() || undefined,
      });
      closeNewProduct();
    } else if (selectedProductForDrawer) {
      updateProduct(selectedProductForDrawer.id, {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category,
        price: Number(price),
        cost: Number(cost),
        stock: Number(stock),
        minStock: Number(minStock),
        unit: unit.trim() || 'pza',
        description: description.trim() || undefined,
        origin: origin.trim() || undefined,
      });
      closeProductDrawer();
    }
  };

  // Product specific movements history
  const productMovements = selectedProductForDrawer
    ? movements.filter((m) => m.productId === selectedProductForDrawer.id).slice(0, 8)
    : [];

  const health = selectedProductForDrawer ? getStockHealth(selectedProductForDrawer) : null;
  const marginPercentage =
    price && cost && Number(price) > 0
      ? Math.round(((Number(price) - Number(cost)) / Number(price)) * 100)
      : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end pointer-events-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-[#1F2421]/25 backdrop-blur-xs"
        />

        {/* Sliding Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative z-10 w-full max-w-lg bg-[#FBFAF6] border-l border-[#E4DFD3] shadow-[0_0_50px_rgba(31,36,33,0.12)] h-full flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4DFD3]">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-normal text-[#1F2421]">
                {isCreationMode ? 'Nuevo producto' : 'Ficha de producto'}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 text-[#6F7570] hover:text-[#1F2421] rounded-full hover:bg-[#F6F3EC]"
              aria-label="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Quick Status Header (when viewing existing product) */}
            {!isCreationMode && selectedProductForDrawer && health && (
              <div className="p-4 bg-[#F6F3EC] border border-[#E4DFD3] rounded-2xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-[#6F7570] font-mono">
                      {selectedProductForDrawer.sku} · {selectedProductForDrawer.category}
                    </span>
                    <h3 className="font-serif text-lg font-medium text-[#1F2421] mt-0.5">
                      {selectedProductForDrawer.name}
                    </h3>
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full tabular-nums"
                    style={{
                      backgroundColor: `${health.barColor}18`,
                      color: health.barColor,
                    }}
                  >
                    {selectedProductForDrawer.stock} {selectedProductForDrawer.unit}s · {health.label}
                  </span>
                </div>

                {/* Level Bar */}
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-[#E4DFD3] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, health.percentage)}%`,
                        backgroundColor: health.barColor,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#6F7570]">
                    <span>Mínimo deseado: {selectedProductForDrawer.minStock} {selectedProductForDrawer.unit}s</span>
                    <span>Margen: {marginPercentage}%</span>
                  </div>
                </div>

                {/* Action buttons: Registrar entrada / Ajustar */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#E4DFD3]/70">
                  <button
                    type="button"
                    onClick={() => setIsQuickEntryOpen(!isQuickEntryOpen)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-[#5F8468] bg-[#FBFAF6] hover:bg-[#DCE7DC]/50 border border-[#5F8468]/30 rounded-xl transition-colors"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Registrar entrada</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openMovementModal(selectedProductForDrawer, 'ajuste');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-[#1F2421] bg-[#FBFAF6] hover:bg-[#E4DFD3] border border-[#E4DFD3] rounded-xl transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#6F7570]" />
                    <span>Ajustar inventario</span>
                  </button>
                </div>

                {/* Inline Quick Entry Row */}
                {isQuickEntryOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2 flex items-center gap-2"
                  >
                    <input
                      type="number"
                      min="1"
                      placeholder="Cantidad a sumar..."
                      value={quickEntryAmount}
                      onChange={(e) =>
                        setQuickEntryAmount(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="flex-1 px-3 py-1.5 text-xs bg-[#FBFAF6] border border-[#5F8468] rounded-xl outline-none"
                    />
                    <button
                      type="button"
                      disabled={!quickEntryAmount || Number(quickEntryAmount) <= 0}
                      onClick={() => {
                        if (quickEntryAmount && Number(quickEntryAmount) > 0) {
                          openMovementModal(selectedProductForDrawer, 'entrada');
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-[#5F8468] hover:bg-[#4D6D55] disabled:opacity-40 rounded-xl"
                    >
                      Sumar
                    </button>
                  </motion.div>
                )}
              </div>
            )}

            {/* Editable Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6F7570] mb-1">
                  Nombre del producto *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej. SSD NVMe Kingston NV2 1TB PCIe 4.0"
                  className={`w-full px-3.5 py-2 text-sm bg-[#F6F3EC] border ${
                    errors.name ? 'border-[#C4623A]' : 'border-[#E4DFD3]'
                  } rounded-xl outline-none focus:border-[#5F8468] focus:bg-[#FBFAF6] transition-colors`}
                />
                {errors.name && <p className="text-xs text-[#C4623A] mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6F7570] mb-1">SKU / Código *</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="CAF-OAX-250"
                    className={`w-full px-3.5 py-2 text-sm font-mono bg-[#F6F3EC] border ${
                      errors.sku ? 'border-[#C4623A]' : 'border-[#E4DFD3]'
                    } rounded-xl outline-none focus:border-[#5F8468] focus:bg-[#FBFAF6] transition-colors`}
                  />
                  {errors.sku && <p className="text-xs text-[#C4623A] mt-1">{errors.sku}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6F7570] mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 text-sm bg-[#F6F3EC] border border-[#E4DFD3] rounded-xl outline-none focus:border-[#5F8468] focus:bg-[#FBFAF6] transition-colors"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6F7570] mb-1">
                    Precio de venta (C$ Córdobas) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="195"
                    className={`w-full px-3.5 py-2 text-sm tabular-nums bg-[#F6F3EC] border ${
                      errors.price ? 'border-[#C4623A]' : 'border-[#E4DFD3]'
                    } rounded-xl outline-none focus:border-[#5F8468] focus:bg-[#FBFAF6] transition-colors`}
                  />
                  {errors.price && <p className="text-xs text-[#C4623A] mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6F7570] mb-1">
                    Costo de compra (C$ Córdobas) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={cost}
                    onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="110"
                    className={`w-full px-3.5 py-2 text-sm tabular-nums bg-[#F6F3EC] border ${
                      errors.cost ? 'border-[#C4623A]' : 'border-[#E4DFD3]'
                    } rounded-xl outline-none focus:border-[#5F8468] focus:bg-[#FBFAF6] transition-colors`}
                  />
                  {errors.cost && <p className="text-xs text-[#C4623A] mt-1">{errors.cost}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6F7570] mb-1">
                    {isCreationMode ? 'Stock inicial *' : 'Stock actual *'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="10"
                    className={`w-full px-3 py-2 text-sm tabular-nums bg-[#F6F3EC] border ${
                      errors.stock ? 'border-[#C4623A]' : 'border-[#E4DFD3]'
                    } rounded-xl outline-none focus:border-[#5F8468] focus:bg-[#FBFAF6] transition-colors`}
                  />
                  {errors.stock && <p className="text-xs text-[#C4623A] mt-1">{errors.stock}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6F7570] mb-1">Stock mínimo *</label>
                  <input
                    type="number"
                    min="1"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="5"
                    className={`w-full px-3 py-2 text-sm tabular-nums bg-[#F6F3EC] border ${
                      errors.minStock ? 'border-[#C4623A]' : 'border-[#E4DFD3]'
                    } rounded-xl outline-none focus:border-[#5F8468] focus:bg-[#FBFAF6] transition-colors`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6F7570] mb-1">Unidad</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="pza / kit / tubo"
                    className="w-full px-3 py-2 text-sm bg-[#F6F3EC] border border-[#E4DFD3] rounded-xl outline-none focus:border-[#5F8468] focus:bg-[#FBFAF6] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6F7570] mb-1">
                  Marca / Distribuidor / Garantía (opcional)
                </label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="ej. Kingston Original · Garantía local 36 meses"
                  className="w-full px-3.5 py-2 text-sm bg-[#F6F3EC] border border-[#E4DFD3] rounded-xl outline-none focus:border-[#5F8468] focus:bg-[#FBFAF6] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6F7570] mb-1">
                  Especificaciones técnicas y descripción
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ej. 3500 MB/s lectura PCIe 4.0 NVMe, factor M.2 2280..."
                  className="w-full px-3.5 py-2 text-sm bg-[#F6F3EC] border border-[#E4DFD3] rounded-xl outline-none focus:border-[#5F8468] focus:bg-[#FBFAF6] transition-colors resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm text-[#6F7570] hover:text-[#1F2421] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-[#5F8468] hover:bg-[#4D6D55] rounded-xl shadow-xs transition-colors"
                >
                  {isCreationMode ? 'Crear producto' : 'Guardar cambios'}
                </button>
              </div>
            </form>

            {/* Movement History for this product */}
            {!isCreationMode && productMovements.length > 0 && (
              <div className="pt-4 border-t border-[#E4DFD3] space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-[#6F7570]">
                  <History className="w-3.5 h-3.5" />
                  <span>Historial de movimientos de este producto</span>
                </div>

                <div className="space-y-2">
                  {productMovements.map((mov) => {
                    const isPositive = mov.quantity > 0;
                    return (
                      <div
                        key={mov.id}
                        className="flex items-center justify-between p-2.5 bg-[#F6F3EC]/70 border border-[#E4DFD3]/70 rounded-xl text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-medium text-[#1F2421] truncate">{mov.reason}</p>
                          <p className="text-[11px] text-[#6F7570] mt-0.5">
                            {formatDateShort(mov.date)} · {formatTime(mov.date)} · {mov.responsible}
                          </p>
                        </div>
                        <span
                          className={`font-semibold tabular-nums shrink-0 ${
                            isPositive ? 'text-[#5F8468]' : 'text-[#C4623A]'
                          }`}
                        >
                          {isPositive ? `+${mov.quantity}` : mov.quantity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Delete Option */}
            {!isCreationMode && selectedProductForDrawer && (
              <div className="pt-4 border-t border-[#E4DFD3] flex items-center justify-between text-xs">
                {confirmDelete ? (
                  <div className="flex items-center gap-2 w-full justify-between bg-[#F3DDD1]/40 p-2.5 rounded-xl">
                    <span className="text-[#C4623A] font-medium">¿Eliminar definitivamente?</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="px-2.5 py-1 text-xs text-[#6F7570] hover:text-[#1F2421]"
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteProduct(selectedProductForDrawer.id);
                          closeProductDrawer();
                        }}
                        className="px-3 py-1 text-xs font-medium text-white bg-[#C4623A] hover:bg-[#A54F2D] rounded-lg"
                      >
                        Sí, eliminar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 text-[#6F7570] hover:text-[#C4623A] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar este producto del catálogo</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
