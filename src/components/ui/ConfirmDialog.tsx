import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Ya, lanjutkan',
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal
      title={title}
      open={open}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
            Batal
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-status-danger text-white text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Memproses...' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-3">
        <div className="w-9 h-9 shrink-0 rounded-full bg-status-warningBg text-status-warning flex items-center justify-center">
          <AlertTriangle size={17} />
        </div>
        <p className="text-xs text-slate-600 leading-relaxed pt-1.5">{description}</p>
      </div>
    </Modal>
  );
}
