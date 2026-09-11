import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import type { HasilQC, PesananPembelian } from '../../../types/barangMasuk';

interface QCFormModalProps {
  open: boolean;
  po: PesananPembelian | null;
  onClose: () => void;
  onSubmit: (hasilQC: HasilQC, perluRepack: boolean, catatan?: string) => Promise<void>;
}

const QC_OPTIONS: { value: HasilQC; label: string; tone: string }[] = [
  { value: 'baik', label: 'Baik', tone: 'border-status-success text-status-success bg-status-successBg' },
  { value: 'rusak', label: 'Rusak', tone: 'border-status-danger text-status-danger bg-status-dangerBg' },
  { value: 'ditolak', label: 'Ditolak', tone: 'border-status-danger text-status-danger bg-status-dangerBg' },
];

export default function QCFormModal({ open, po, onClose, onSubmit }: QCFormModalProps) {
  const [hasilQC, setHasilQC] = useState<HasilQC | ''>('');
  const [perluRepack, setPerluRepack] = useState<'ya' | 'tidak' | ''>('');
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setHasilQC('');
    setPerluRepack('');
    setCatatan('');
    setError(null);
  }, [open]);

  if (!po) return null;

  async function handleSubmit() {
    if (!hasilQC) {
      setError('Pilih hasil pemeriksaan kualitas terlebih dahulu.');
      return;
    }
    if (hasilQC === 'baik' && !perluRepack) {
      setError('Tentukan apakah barang perlu repack.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(hasilQC, perluRepack === 'ya', catatan.trim() || undefined);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={`Pemeriksaan Kualitas — ${po.nomorPO}`}
      open={open}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Batal
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Memproses...' : 'Simpan Hasil QC'}
          </button>
        </>
      }
    >
      <div className="space-y-3.5">
        {error && (
          <div className="text-xs text-status-danger bg-status-dangerBg rounded-md px-3 py-2">{error}</div>
        )}

        <div>
          <label className="label-field">Hasil QC</label>
          <div className="grid grid-cols-3 gap-2">
            {QC_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`px-2 py-2 rounded-md text-xs font-medium border transition-colors ${
                  hasilQC === opt.value ? opt.tone : 'border-surface-border text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => setHasilQC(opt.value)}
                disabled={submitting}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {hasilQC === 'baik' && (
          <div>
            <label className="label-field">Perlu Repack?</label>
            <div className="flex gap-2">
              <button
                type="button"
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                  perluRepack === 'ya'
                    ? 'bg-status-warningBg border-status-warning text-status-warning'
                    : 'border-surface-border text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => setPerluRepack('ya')}
                disabled={submitting}
              >
                Ya, Perlu Repack
              </button>
              <button
                type="button"
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                  perluRepack === 'tidak'
                    ? 'bg-status-successBg border-status-success text-status-success'
                    : 'border-surface-border text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => setPerluRepack('tidak')}
                disabled={submitting}
              >
                Tidak Perlu
              </button>
            </div>
          </div>
        )}

        {hasilQC === 'rusak' && (
          <p className="text-[11px] text-status-danger bg-status-dangerBg rounded-md px-3 py-2">
            Barang akan dipindahkan ke status Karantina.
          </p>
        )}
        {hasilQC === 'ditolak' && (
          <p className="text-[11px] text-status-danger bg-status-dangerBg rounded-md px-3 py-2">
            Barang akan diproses sebagai Retur / Pengembalian ke supplier.
          </p>
        )}

        <div>
          <label className="label-field">
            Catatan <span className="text-slate-400 font-normal">(opsional)</span>
          </label>
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder="Catatan hasil pemeriksaan..."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            disabled={submitting}
          />
        </div>
      </div>
    </Modal>
  );
}
