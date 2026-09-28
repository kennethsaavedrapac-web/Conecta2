import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAlmud } from '../store/AlmudContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useAlmud();

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isAlert = toast.type === 'alert';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex items-start gap-3 p-3.5 bg-[#FBFAF6] border border-[#E4DFD3] rounded-2xl shadow-[0_8px_30px_rgba(31,36,33,0.08)]"
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#5F8468]" />}
                {isAlert && <AlertCircle className="w-4 h-4 text-[#C4623A]" />}
                {!isSuccess && !isAlert && <Info className="w-4 h-4 text-[#6F7570]" />}
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <p className="text-sm font-medium text-[#1F2421] leading-tight">{toast.message}</p>
                {toast.description && (
                  <p className="text-xs text-[#6F7570] mt-1 leading-normal">{toast.description}</p>
                )}
              </div>

              <button
                onClick={() => dismissToast(toast.id)}
                className="shrink-0 text-[#6F7570] hover:text-[#1F2421] p-1 rounded-lg transition-colors focus-visible:outline-none"
                aria-label="Cerrar notificación"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
