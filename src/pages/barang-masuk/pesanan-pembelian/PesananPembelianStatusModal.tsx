import { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import { useMasterStatus } from '../../../hooks/useMasterStatus';
import type { PesananPembelian } from '../../../types/barangMasuk';

interface Props {
  open: boolean;
  item: PesananPembelian | null;
  onClose: () => void;
  onSubmit: (id: string, status: PesananPembelian['status']) => Promise<void>;
}

export default function PesananPembelianStatusModal({ open, item, onClose, onSubmit }: Props) {
  const [status, setStatus] = useState<PesananPembelian['status']>('menunggu_pengiriman');
  const [loading, setLoading] = useState(false);
  const { statuses, getLabel } = useMasterStatus('PO');

  useEffect(() => {
    if (item) {
      setStatus(item.status);
    }
  }, [item]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;
    setLoading(true);
    try {
      await onSubmit(item.id, status);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  if (!item) return null;

  return (
    <Modal open={open} onClose={onClose} title="Edit Status Pesanan">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="text-xs text-slate-500 mb-1">Status Saat Ini</div>
          <div className="text-sm font-medium text-slate-900">{getLabel(item.status)}</div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Pilih Status Baru</label>
          <select
            className="input-field w-full"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            required
          >
            {statuses.map((s) => (
              <option key={s.kode} value={s.kode}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-surface-border">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
            Batal
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Status'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
