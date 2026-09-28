import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAlmud } from '../store/AlmudContext';
import { ActiveTab } from '../types';
import { Conecta2Logo } from './Conecta2Logo';
import {
  Calendar,
  Package,
  Receipt,
  ArrowLeftRight,
  BarChart3,
  Plus,
  Command,
  LogOut,
  User,
  Users,
  ChevronDown,
  Check,
  Sun,
  Moon,
} from 'lucide-react';

const TABS: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'hoy', label: 'Hoy', icon: Calendar },
  { id: 'inventario', label: 'Inventario', icon: Package },
  { id: 'ventas', label: 'Ventas', icon: Receipt },
  { id: 'movimientos', label: 'Movimientos', icon: ArrowLeftRight },
  { id: 'reportes', label: 'Reportes', icon: BarChart3 },
];

export const Navigation: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    openLaCaja,
    openCommandPalette,
    attentionProducts,
    currentUser,
    users,
    quickLogin,
    logout,
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  } = useAlmud();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const attentionCount = attentionProducts.length;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Desktop Floating Pill Navigation */}
      <header className="sticky top-5 z-40 hidden md:flex justify-center px-4 w-full pointer-events-none">
        <nav
          aria-label="Navegación principal"
          className="pointer-events-auto flex items-center justify-between gap-4 px-3 py-2 bg-[#FBFAF6]/95 backdrop-blur-md border border-[#E4DFD3] rounded-full shadow-[0_4px_24px_rgba(31,36,33,0.04)] max-w-5xl w-full"
        >
          {/* Brand Wordmark with Conecta2 Isotype */}
          <button
            onClick={() => setActiveTab('hoy')}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5F8468] rounded-full"
            aria-label="Conecta2 Inicio"
          >
            <Conecta2Logo className="w-7 h-7 transition-transform group-hover:scale-105" />
            <span className="font-serif text-2xl font-medium tracking-tight text-[#1F2421] group-hover:text-[#5F8468] transition-colors">
              Conecta<span className="text-[#5F8468]">2</span>
            </span>
          </button>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 p-1 bg-[#F6F3EC]/70 rounded-full border border-[#E4DFD3]/60">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const hasAlert = tab.id === 'inventario' && attentionCount > 0;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-1.5 text-sm font-medium transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5F8468] ${
                    isActive ? 'text-[#1F2421]' : 'text-[#6F7570] hover:text-[#1F2421]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Sliding animated indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 bg-[#FBFAF6] rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-[#E4DFD3]"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-1.5">
                    {tab.label}
                    {hasAlert && (
                      <span
                        className="inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[11px] font-semibold text-white bg-[#C4623A] rounded-full tabular-nums leading-none shadow-xs"
                        title={`${attentionCount} producto${attentionCount > 1 ? 's' : ''} requieren atención`}
                      >
                        {attentionCount}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Actions: Command palette, User pill & Nueva venta */}
          <div className="flex items-center gap-2 pr-1">
            {/* Command Palette */}
            <button
              onClick={openCommandPalette}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#6F7570] hover:text-[#1F2421] bg-[#F6F3EC]/80 hover:bg-[#E4DFD3]/60 border border-[#E4DFD3] rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5F8468]"
              title="Buscar o ejecutar comandos (⌘K)"
              aria-label="Abrir paleta de comandos"
            >
              <Command className="w-3.5 h-3.5 text-[#6F7570]" />
              <span className="text-[11px] font-mono tracking-wider font-medium">⌘K</span>
            </button>

            {/* Quick Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 text-[#6F7570] hover:text-[#1F2421] bg-[#F6F3EC]/80 hover:bg-[#E4DFD3]/60 border border-[#E4DFD3] rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5F8468]"
              title={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label="Alternar modo oscuro o claro"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#E5B255]" />
              ) : (
                <Moon className="w-4 h-4 text-[#6F7570]" />
              )}
            </button>

            {/* Current User Session Pill */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 text-xs bg-[#F6F3EC]/80 hover:bg-[#E4DFD3]/60 border border-[#E4DFD3] rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5F8468]"
                title="Usuario activo y turno"
              >
                <div className="w-5 h-5 rounded-full bg-[#5F8468] text-white flex items-center justify-center text-[10px] font-medium font-serif leading-none">
                  {currentUser?.avatarInitials || 'U'}
                </div>
                <span className="max-w-[85px] truncate font-medium text-[#1F2421]">
                  {currentUser?.name.split(' ')[0] || 'Turno'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#6F7570]" />
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 mt-2 w-64 bg-[#FBFAF6] border border-[#E4DFD3] rounded-2xl shadow-[0_12px_36px_rgba(31,36,33,0.12)] p-2.5 space-y-2 z-50 pointer-events-auto"
                  >
                    {/* Active User Card */}
                    <div className="p-2.5 bg-[#F6F3EC] rounded-xl border border-[#E4DFD3]/70">
                      <p className="text-[11px] uppercase tracking-wider text-[#6F7570] font-medium">
                        Turno en curso
                      </p>
                      <p className="text-sm font-semibold text-[#1F2421] mt-0.5">
                        {currentUser?.name}
                      </p>
                      <p className="text-xs text-[#5F8468] font-medium">{currentUser?.role}</p>
                      <p className="text-[11px] text-[#6F7570] mt-0.5 truncate">{currentUser?.email}</p>
                    </div>

                    {/* Theme Selector segmented control */}
                    <div className="pt-1 space-y-1">
                      <p className="px-2 text-[10px] uppercase tracking-wider text-[#6F7570] font-medium">
                        Modo de interfaz
                      </p>
                      <div className="grid grid-cols-3 gap-1 p-1 bg-[#F6F3EC] rounded-xl border border-[#E4DFD3]/70 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setTheme('light')}
                          className={`py-1 px-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 ${
                            theme === 'light'
                              ? 'bg-[#FBFAF6] text-[#1F2421] shadow-xs'
                              : 'text-[#6F7570] hover:text-[#1F2421]'
                          }`}
                        >
                          <Sun className="w-3 h-3 text-[#E5B255]" />
                          <span>Claro</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTheme('dark')}
                          className={`py-1 px-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 ${
                            theme === 'dark'
                              ? 'bg-[#FBFAF6] text-[#1F2421] shadow-xs'
                              : 'text-[#6F7570] hover:text-[#1F2421]'
                          }`}
                        >
                          <Moon className="w-3 h-3 text-[#7AA682]" />
                          <span>Oscuro</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTheme('system')}
                          className={`py-1 px-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 ${
                            theme === 'system'
                              ? 'bg-[#FBFAF6] text-[#1F2421] shadow-xs'
                              : 'text-[#6F7570] hover:text-[#1F2421]'
                          }`}
                        >
                          <span>Auto</span>
                        </button>
                      </div>
                    </div>

                    {/* Switch user section */}
                    <div className="pt-1 space-y-1">
                      <p className="px-2 text-[10px] uppercase tracking-wider text-[#6F7570] font-medium">
                        Cambiar de colaborador / perfil
                      </p>
                      {users.map((u) => {
                        const isCurrent = currentUser?.id === u.id;
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              quickLogin(u.id);
                              setIsUserMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                              isCurrent
                                ? 'bg-[#5F8468]/10 text-[#5F8468] font-semibold'
                                : 'hover:bg-[#F6F3EC] text-[#1F2421]'
                            }`}
                          >
                            <span className="truncate">{u.name}</span>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-[#5F8468]" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Logout Button */}
                    <div className="pt-1 border-t border-[#E4DFD3]">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#C4623A] hover:bg-[#F3DDD1]/40 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Cerrar turno (Salir)</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={openLaCaja}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-[#5F8468] hover:bg-[#4D6D55] active:scale-[0.98] rounded-full transition-all shadow-[0_2px_8px_rgba(95,132,104,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#5F8468]"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva venta</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Top Brand & Action Bar */}
      <header className="sticky top-0 z-30 flex md:hidden items-center justify-between px-4 py-3 bg-[#FBFAF6]/95 backdrop-blur-md border-b border-[#E4DFD3]">
        <div className="flex items-center gap-2">
          <Conecta2Logo className="w-6 h-6" />
          <span className="font-serif text-xl font-medium text-[#1F2421]">
            Conecta<span className="text-[#5F8468]">2</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile User indicator */}
          <button
            onClick={logout}
            title={`Turno de ${currentUser?.name || ''} (Tocar para cerrar turno)`}
            className="flex items-center gap-1 px-2 py-1 bg-[#F6F3EC] border border-[#E4DFD3] rounded-full text-xs text-[#1F2421]"
          >
            <div className="w-4 h-4 rounded-full bg-[#5F8468] text-white flex items-center justify-center text-[9px] font-serif">
              {currentUser?.avatarInitials || 'U'}
            </div>
            <span className="text-[11px] font-medium max-w-[60px] truncate">
              {currentUser?.name.split(' ')[0]}
            </span>
          </button>

          <button
            onClick={openCommandPalette}
            className="p-2 text-[#6F7570] hover:text-[#1F2421] border border-[#E4DFD3] rounded-full bg-[#F6F3EC]"
            aria-label="Buscar"
          >
            <Command className="w-4 h-4" />
          </button>
          <button
            onClick={openLaCaja}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#5F8468] rounded-full shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Venta</span>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Fixed Navigation Bar */}
      <nav
        aria-label="Navegación móvil"
        className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden items-center justify-around py-2 px-3 bg-[#FBFAF6]/95 backdrop-blur-md border-t border-[#E4DFD3] shadow-[0_-4px_16px_rgba(0,0,0,0.03)]"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const hasAlert = tab.id === 'inventario' && attentionCount > 0;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
                isActive ? 'text-[#5F8468]' : 'text-[#6F7570]'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {hasAlert && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-[#C4623A] rounded-full border-2 border-[#FBFAF6]" />
                )}
              </div>
              <span className="text-[11px] font-medium leading-none">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
