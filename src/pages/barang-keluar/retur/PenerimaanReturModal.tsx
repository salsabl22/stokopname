import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import type { Retur } from '../../../types/retur';

interface PenerimaanReturModalProps {
  open: boolean;
  retur: Retur | null;
  onClose: () => void;
  onSubmit: (sesuaiPengajuan: boolean, catatan?: string) => Promise<void>;
}

export default function PenerimaanReturModal({ open, retur, onClose, onSubmit }: PenerimaanReturModalProps) {
  const [sesuai, setSesuai] = useState<'ya' | 'tidak' | ''>('');
  const [catatan, setCatatan] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSesuai('');
    setCatatan('');
    setError(null);
  }, [open]);

  if (!retur) return null;

  async function handleSubmit() {
    if (!sesuai) {
      setError('Pilih hasil scan barcode retur terlebih dahulu.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(sesuai === 'ya', catatan.trim() || undefined);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={`Penerimaan Retur — ${retur.nomorRetur}`}
      open={open}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Batal
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Memproses...' : 'Simpan'}
          </button>
        </>
      }
    >
      <div className="space-y-3.5">
        {error && (
          <div className="text-xs text-status-danger bg-status-dangerBg rounded-md px-3 py-2">{error}</div>
        )}

        <div>
          <label className="label-field">Scan Barcode Retur — Sesuai Pengajuan?</label>
          <div className="flex gap-2">
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                sesuai === 'ya'
                  ? 'bg-status-successBg border-status-success text-status-success'
                  : 'border-surface-border text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setSesuai('ya')}
              disabled={submitting}
            >
              Ya, Sesuai
            </button>
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                sesuai === 'tidak'
                  ? 'bg-status-dangerBg border-status-danger text-status-danger'
                  : 'border-surface-border text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setSesuai('tidak')}
              disabled={submitting}
            >
              Tidak Sesuai
            </button>
          </div>
        </div>

        {sesuai === 'tidak' && (
          <div>
            <label className="label-field">Catatan Pengecualian</label>
            <textarea
              className="input-field resize-none"
              rows={2}
              placeholder="Jelaskan ketidaksesuaian yang ditemukan..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              disabled={submitting}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
