import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useAlmud } from '../store/AlmudContext';
import { formatMoney, downloadCSV } from '../lib/formatters';
import { Download, TrendingUp, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';

export const ReportesPage: React.FC = () => {
  const { sales, products, openProductDrawer, resolvedTheme } = useAlmud();

  const isDark = resolvedTheme === 'dark';
  const chartStroke = isDark ? '#7AA682' : '#5F8468';
  const chartTick = isDark ? '#9BA49D' : '#6F7570';

  // 1. Chart Data: Daily sales aggregated over the last 14-30 days
  const chartData = useMemo(() => {
    // Generate dates for the past 14 days
    const days: { [dayKey: string]: { label: string; date: Date; total: number; count: number } } = {};
    const now = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
      days[key] = { label, date: d, total: 0, count: 0 };
    }

    sales.forEach((s) => {
      const saleKey = s.date.split('T')[0];
      if (days[saleKey]) {
        days[saleKey].total += s.total;
        days[saleKey].count += 1;
      }
    });

    return Object.values(days).map((item) => ({
      date: item.label,
      total: item.total,
      ventas: item.count,
    }));
  }, [sales]);

  // Total sales in this 14-day window
  const totalWindowRevenue = chartData.reduce((acc, curr) => acc + curr.total, 0);

  // 2. "Lo que mejor se mueve": Top 5 products by quantity sold
  const topProducts = useMemo(() => {
    const productSalesMap: {
      [id: string]: { id: string; name: string; sku: string; units: number; revenue: number };
    } = {};

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            id: item.productId,
            name: item.productName,
            sku: item.sku,
            units: 0,
            revenue: 0,
          };
        }
        productSalesMap[item.productId].units += item.quantity;
        productSalesMap[item.productId].revenue += item.subtotal;
      });
    });

    const sorted = Object.values(productSalesMap).sort((a, b) => b.units - a.units);
    return sorted.slice(0, 5);
  }, [sales]);

  const maxTopUnits = topProducts.length > 0 ? topProducts[0].units : 1;

  // 3. "Lo que se queda quieto": Products with low or zero sales recently
  const slowProducts = useMemo(() => {
    const now = new Date().getTime();
    return products
      .map((p) => {
        const lastDate = p.lastSoldAt ? new Date(p.lastSoldAt).getTime() : new Date(p.createdAt).getTime();
        const daysIdle = Math.max(1, Math.round((now - lastDate) / (1000 * 60 * 60 * 24)));
        return {
          product: p,
          daysIdle,
        };
      })
      .sort((a, b) => b.daysIdle - a.daysIdle)
      .slice(0, 4);
  }, [products]);

  // Export to CSV
  const handleExportCSV = () => {
    let csv = 'Reporte Conecta2 - Control de Inventario y Ventas\n';
    csv += `Generado el: ${new Date().toLocaleString('es-MX')}\n\n`;

    csv += 'INVENTARIO ACTUAL\n';
    csv += 'SKU,Producto,Categoría,Precio (C$),Costo (C$),Stock Actual,Stock Mínimo,Valor Total (C$)\n';
    products.forEach((p) => {
      csv += `"${p.sku}","${p.name}","${p.category}",${p.price},${p.cost},${p.stock},${p.minStock},${p.price * p.stock}\n`;
    });

    csv += '\nVENTAS RECIENTES\n';
    csv += 'Ticket,Fecha,Cliente,Método de Pago,Total (C$)\n';
    sales.forEach((s) => {
      csv += `"${s.receiptNumber}","${s.date}","${s.customerName || 'Mostrador'}","${s.paymentMethod}",${s.total}\n`;
    });

    downloadCSV(`conecta2_reporte_${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-16 max-w-3xl mx-auto py-4 md:py-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#E4DFD3] pb-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-[#1F2421]">
            Reportes
          </h1>
          <p className="text-xs md:text-sm text-[#6F7570] mt-1">
            Lectura serena del rendimiento de tu tienda de tecnología y rotación de inventario
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#1F2421] bg-[#FBFAF6] hover:bg-[#E4DFD3] border border-[#E4DFD3] rounded-xl transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#5F8468]" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* BLOQUE 1: "Ventas del mes" */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#1F2421]">
            El pulso de las últimas semanas
          </h2>
          <p className="text-sm text-[#6F7570] mt-1">
            Has generado <strong className="text-[#1F2421] font-semibold">{formatMoney(totalWindowRevenue)}</strong> en los últimos 14 días. La mayor actividad se concentra los fines de semana.
          </p>
        </div>

        {/* The SINGLE clean Recharts area chart */}
        <div className="p-4 md:p-6 bg-[#FBFAF6] border border-[#E4DFD3] rounded-3xl">
          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSalvia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartStroke} stopOpacity={isDark ? 0.35 : 0.25} />
                    <stop offset="95%" stopColor={chartStroke} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: chartTick, fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: chartTick, fontSize: 11 }}
                  tickFormatter={(val) => `C$${val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#FBFAF6] border border-[#E4DFD3] px-3.5 py-2.5 rounded-2xl shadow-md text-xs">
                          <p className="text-[#6F7570] font-medium">{data.date}</p>
                          <p className="font-serif text-base font-semibold text-[#1F2421] tabular-nums mt-0.5">
                            {formatMoney(data.total)}
                          </p>
                          <p className="text-[11px] text-[#5F8468]">
                            {data.ventas} {data.ventas === 1 ? 'venta' : 'ventas'}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke={chartStroke}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSalvia)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* BLOQUE 2: "Lo que mejor se mueve" */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#1F2421]">
            Lo que mejor se mueve
          </h2>
          <p className="text-sm text-[#6F7570] mt-1">
            Los componentes, hardware y accesorios esenciales que impulsan el volumen del comercio.
          </p>
        </div>

        <div className="p-4 md:p-6 bg-[#FBFAF6] border border-[#E4DFD3] rounded-3xl space-y-4">
          {topProducts.map((item, idx) => {
            const percentage = Math.round((item.units / maxTopUnits) * 100);
            const fullProd = products.find((p) => p.id === item.id);

            return (
              <div
                key={item.id}
                onClick={() => fullProd && openProductDrawer(fullProd)}
                className="space-y-1.5 cursor-pointer group"
              >
                <div className="flex items-baseline justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-medium text-[#6F7570] w-4">
                      {idx + 1}.
                    </span>
                    <span className="font-medium text-[#1F2421] group-hover:text-[#5F8468] transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#6F7570] tabular-nums">
                      {item.units} unidades
                    </span>
                    <span className="font-medium text-[#1F2421] tabular-nums">
                      {formatMoney(item.revenue)}
                    </span>
                  </div>
                </div>

                {/* Fine horizontal fill bar */}
                <div className="h-1.5 w-full bg-[#E4DFD3] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5F8468] rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* BLOQUE 3: "Lo que se queda quieto" */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#1F2421]">
            Lo que se queda quieto
          </h2>
          <p className="text-sm text-[#6F7570] mt-1">
            Artículos con menor rotación o días acumulados sin registrar salida en caja.
          </p>
        </div>

        <div className="p-4 md:p-6 bg-[#FBFAF6] border border-[#E4DFD3] rounded-3xl divide-y divide-[#E4DFD3]">
          {slowProducts.map(({ product, daysIdle }) => (
            <div
              key={product.id}
              onClick={() => openProductDrawer(product)}
              className="py-3 flex items-center justify-between gap-4 cursor-pointer group first:pt-0 last:pb-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#1F2421] group-hover:text-[#5F8468] transition-colors truncate">
                  {product.name}
                </p>
                <p className="text-xs text-[#6F7570]">
                  {product.sku} · Stock actual: {product.stock} {product.unit}s
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F3DDD1]/70 text-[#C4623A] tabular-nums">
                  {daysIdle} días sin venta
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};
