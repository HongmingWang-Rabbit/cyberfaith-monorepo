'use client';

import { FC, createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'karma';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const toastConfig: Record<ToastType, { icon: string; gradient: string; border: string }> = {
  success: { icon: '✅', gradient: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30' },
  error: { icon: '❌', gradient: 'from-red-500/20 to-rose-500/20', border: 'border-red-500/30' },
  warning: { icon: '⚠️', gradient: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30' },
  info: { icon: 'ℹ️', gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
  karma: { icon: '⭐', gradient: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove after duration
    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => {
          const config = toastConfig[toast.type];
          return (
            <div
              key={toast.id}
              className={`
                p-4 rounded-xl border backdrop-blur-xl shadow-2xl
                bg-gradient-to-r ${config.gradient} ${config.border}
                animate-slide-in
              `}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{config.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{toast.title}</p>
                  {toast.message && (
                    <p className="text-sm text-muted-foreground mt-0.5">{toast.message}</p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </ToastContext.Provider>
  );
};

// Convenience hooks
export const useSuccessToast = () => {
  const { addToast } = useToast();
  return (title: string, message?: string) => addToast({ type: 'success', title, message });
};

export const useErrorToast = () => {
  const { addToast } = useToast();
  return (title: string, message?: string) => addToast({ type: 'error', title, message });
};

export const useKarmaToast = () => {
  const { addToast } = useToast();
  return (amount: number, reason?: string) => addToast({ 
    type: 'karma', 
    title: `+${amount} Karma`, 
    message: reason 
  });
};

export default ToastProvider;
