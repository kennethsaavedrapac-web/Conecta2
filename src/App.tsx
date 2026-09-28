import React from 'react';
import { AlmudProvider, useAlmud } from './store/AlmudContext';
import { Navigation } from './components/Navigation';
import { ToastContainer } from './components/ToastContainer';
import { CommandPalette } from './components/CommandPalette';
import { LaCajaModal } from './components/LaCajaModal';
import { ProductDrawer } from './components/ProductDrawer';
import { MovementModal } from './components/MovementModal';
import { LoginScreen } from './components/LoginScreen';
import { Conecta2Logo } from './components/Conecta2Logo';

// Pages
import { HoyPage } from './pages/HoyPage';
import { InventarioPage } from './pages/InventarioPage';
import { VentasPage } from './pages/VentasPage';
import { MovimientosPage } from './pages/MovimientosPage';
import { ReportesPage } from './pages/ReportesPage';

const AppContent: React.FC = () => {
  const { activeTab, currentUser } = useAlmud();

  if (!currentUser) {
    return (
      <>
        <LoginScreen />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#1F2421] flex flex-col font-sans selection:bg-[#DCE7DC] selection:text-[#1F2421]">
      {/* Navigation */}
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-16 pt-4">
        {activeTab === 'hoy' && <HoyPage key="hoy" />}
        {activeTab === 'inventario' && <InventarioPage key="inventario" />}
        {activeTab === 'ventas' && <VentasPage key="ventas" />}
        {activeTab === 'movimientos' && <MovimientosPage key="movimientos" />}
        {activeTab === 'reportes' && <ReportesPage key="reportes" />}
      </main>

      {/* Quiet Footer */}
      <footer className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-[#E4DFD3]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6F7570] gap-3">
        <div className="flex items-center gap-2">
          <Conecta2Logo className="w-4 h-4" />
          <span className="font-serif font-medium text-[#1F2421]">Conecta2</span>
          <span aria-hidden="true">·</span>
          <span>Control de inventario para tecnología, hardware y redes</span>
        </div>

        <div className="text-[11px] text-[#6F7570]">
          <span>Managua, Nicaragua</span>
        </div>
      </footer>

      {/* Global Overlays & Modals */}
      <LaCajaModal />
      <ProductDrawer />
      <MovementModal />
      <CommandPalette />
      <ToastContainer />
    </div>
  );
};


export default function App() {
  return (
    <AlmudProvider>
      <AppContent />
    </AlmudProvider>
  );
}
