import { useCallback, useState } from 'react';
import type { ToastData } from '../components/ui/Toast';

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((type: ToastData['type'], message: string) => {
    toastIdCounter += 1;
    setToasts((prev) => [...prev, { id: toastIdCounter, type, message }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}
