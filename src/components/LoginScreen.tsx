import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAlmud } from '../store/AlmudContext';
import { KeyRound, ArrowRight, UserCheck, ShieldCheck, Sparkles, Sun, Moon } from 'lucide-react';
import { Conecta2Logo } from './Conecta2Logo';

export const LoginScreen: React.FC = () => {
  const { users, login, quickLogin, resolvedTheme, toggleTheme } = useAlmud();

  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !pin.trim()) {
      setError('Por favor ingresa tu correo y tu PIN de 4 dígitos.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    setTimeout(() => {
      const res = login(identifier, pin);
      if (!res.success) {
        setError(res.error || 'Credenciales incorrectas');
        setIsSubmitting(false);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col justify-center items-center px-4 py-12 relative selection:bg-[#DCE7DC] selection:text-[#1F2421]">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 text-[#6F7570] hover:text-[#1F2421] bg-[#FBFAF6] border border-[#E4DFD3] rounded-full shadow-xs transition-colors"
          title={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label="Alternar modo oscuro o claro"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-[#E5B255]" />
          ) : (
            <Moon className="w-4 h-4 text-[#6F7570]" />
          )}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#FBFAF6] border border-[#E4DFD3] rounded-3xl shadow-[0_16px_40px_rgba(31,36,33,0.06)] p-6 sm:p-8 space-y-7"
      >
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Conecta2Logo className="w-16 h-16 drop-shadow-md" withGlow />
          </div>
          <div className="inline-flex items-center gap-1.5">
            <span className="font-serif text-3xl font-medium text-[#1F2421]">
              Conecta<span className="text-[#5F8468]">2</span>
            </span>
          </div>
          <p className="text-xs uppercase tracking-widest text-[#6F7570] font-medium">
            Control de inventario y ventas
          </p>
          <h2 className="font-serif text-xl font-normal text-[#1F2421] pt-1">
            Apertura de turno y acceso
          </h2>
          <p className="text-xs text-[#6F7570] max-w-xs mx-auto">
            Ingresa para registrar ventas de tecnología, hardware, redes y periféricos.
          </p>
        </div>

        {/* Quick Access Team Profiles (Simulated fast login) */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[#6F7570]">
            Acceso rápido por perfil (1 clic)
          </p>
          <div className="grid grid-cols-1 gap-2">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => quickLogin(u.id)}
                className="flex items-center justify-between p-3 rounded-2xl border border-[#E4DFD3] bg-[#F6F3EC]/70 hover:bg-[#F6F3EC] hover:border-[#5F8468]/60 transition-all text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#FBFAF6] border border-[#E4DFD3] flex items-center justify-center font-serif text-sm font-medium text-[#1F2421] group-hover:text-[#5F8468] transition-colors shrink-0">
                    {u.avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1F2421] truncate leading-tight group-hover:text-[#5F8468] transition-colors">
                      {u.name}
                    </p>
                    <p className="text-xs text-[#6F7570] truncate mt-0.5">{u.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-[#6F7570] px-1.5 py-0.5 bg-[#FBFAF6] rounded border border-[#E4DFD3]/60">
                    PIN {u.pin}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#6F7570] group-hover:text-[#5F8468] group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Divider with subtle line */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E4DFD3]" />
          </div>
          <span className="relative px-3 bg-[#FBFAF6] text-[11px] text-[#6F7570]">
            o escribe tus credenciales
          </span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#6F7570] mb-1">
              Correo o nombre
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="kenneth@conecta2.ni o sofia"
              className="w-full px-3.5 py-2.5 text-sm bg-[#F6F3EC] border border-[#E4DFD3] rounded-xl outline-none focus:border-[#5F8468] focus:bg-[#FBFAF6] transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#6F7570]">
                PIN de acceso (4 dígitos)
              </label>
              <span className="text-[11px] text-[#6F7570]/80">Ej. 1234</span>
            </div>
            <div className="relative">
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full px-3.5 py-2.5 text-sm tracking-widest font-mono bg-[#F6F3EC] border border-[#E4DFD3] rounded-xl outline-none focus:border-[#5F8468] focus:bg-[#FBFAF6] transition-colors"
              />
              <KeyRound className="w-4 h-4 text-[#6F7570] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-[#C4623A] bg-[#F3DDD1]/50 p-2.5 rounded-xl border border-[#C4623A]/30 leading-relaxed"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 text-sm font-medium text-white bg-[#5F8468] hover:bg-[#4D6D55] active:scale-[0.99] rounded-xl transition-all shadow-[0_2px_8px_rgba(95,132,104,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5F8468]"
          >
            {isSubmitting ? 'Verificando...' : 'Iniciar turno en Conecta2'}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-1 text-center">
          <p className="text-[11px] text-[#6F7570] flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#5F8468]" />
            <span>Control de turno simulado con persistencia local</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
