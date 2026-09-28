import { Product } from '../types';

export const currencyFormatter = new Intl.NumberFormat('es-NI', {
  style: 'currency',
  currency: 'NIO',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const currencyWithDecimalsFormatter = new Intl.NumberFormat('es-NI', {
  style: 'currency',
  currency: 'NIO',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number, showDecimals: boolean = false): string {
  const needsDecimals = showDecimals || amount % 1 !== 0;
  const numStr = amount.toLocaleString('es-NI', {
    minimumFractionDigits: needsDecimals ? 2 : 0,
    maximumFractionDigits: needsDecimals ? 2 : 0,
  });
  return `C$ ${numStr}`;
}

export function formatDateShort(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('es-NI', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('es-NI', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatFullDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('es-NI', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDayDivider(isoString: string): string {
  const d = new Date(isoString);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return 'Hoy';
  if (isYesterday) return 'Ayer';

  const formatted = d.toLocaleDateString('es-NI', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export type StockHealth = 'sano' | 'medio' | 'bajo' | 'agotado';

export function getStockHealth(product: Product): {
  health: StockHealth;
  percentage: number;
  label: string;
  barColor: string;
} {
  if (product.stock === 0) {
    return {
      health: 'agotado',
      percentage: 0,
      label: 'Agotado',
      barColor: '#C4623A', // terracota
    };
  }

  if (product.stock <= product.minStock) {
    const ratio = Math.max(10, Math.min(30, (product.stock / product.minStock) * 30));
    return {
      health: 'bajo',
      percentage: ratio,
      label: 'Bajo stock',
      barColor: '#C4623A', // terracota
    };
  }

  if (product.stock <= product.minStock * 1.8) {
    const ratio = 35 + ((product.stock - product.minStock) / (product.minStock * 0.8)) * 25;
    return {
      health: 'medio',
      percentage: Math.min(60, ratio),
      label: 'Stock medio',
      barColor: '#C99A3B', // ámbar
    };
  }

  const healthyCapacity = Math.max(product.minStock * 3, 20);
  const ratio = Math.min(100, Math.max(65, (product.stock / healthyCapacity) * 100));
  return {
    health: 'sano',
    percentage: ratio,
    label: 'Óptimo',
    barColor: '#5F8468', // salvia
  };
}

export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
