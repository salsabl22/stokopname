import { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export interface ToastData {
  id: number;
  type: 'success' | 'error';
  message: string;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: number) => void;
}

function ToastItem({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === 'success';

  return (
    <div
      className={`flex items-start gap-2.5 w-80 px-3.5 py-3 rounded-md shadow-lg border text-xs ${
        isSuccess
          ? 'bg-white border-status-success/30 text-slate-700'
          : 'bg-white border-status-danger/30 text-slate-700'
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 size={16} className="text-status-success shrink-0 mt-0.5" />
      ) : (
        <XCircle size={16} className="text-status-danger shrink-0 mt-0.5" />
      )}
      <p className="flex-1 leading-relaxed">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600"
        aria-label="Tutup notifikasi"
      >
        <X size={14} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: number) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
