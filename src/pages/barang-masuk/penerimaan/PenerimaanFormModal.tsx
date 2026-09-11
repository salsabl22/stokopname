import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import type { PesananPembelian } from '../../../types/barangMasuk';

interface PenerimaanFormModalProps {
  open: boolean;
  po: PesananPembelian | null;
  onClose: () => void;
  onSubmit: (barangSesuai: boolean, jumlahDiterima: Record<string, number>) => Promise<void>;
}

export default function PenerimaanFormModal({ open, po, onClose, onSubmit }: PenerimaanFormModalProps) {
  const [barangSesuai, setBarangSesuai] = useState<'ya' | 'tidak' | ''>('');
  const [jumlahDiterima, setJumlahDiterima] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !po) return;
    setBarangSesuai('');
    setError(null);
    const initial: Record<string, string> = {};
    po.items.forEach((item) => {
      initial[item.id] = String(item.jumlahPesan);
    });
    setJumlahDiterima(initial);
  }, [open, po]);

  if (!po) return null;

  async function handleSubmit() {
    if (!barangSesuai) {
      setError('Pilih hasil pengecekan faktur terlebih dahulu.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (barangSesuai === 'tidak') {
        await onSubmit(false, {});
      } else {
        const parsed: Record<string, number> = {};
        Object.entries(jumlahDiterima).forEach(([id, val]) => {
          parsed[id] = Number(val) || 0;
        });
        await onSubmit(true, parsed);
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={`Penerimaan — ${po.nomorPO}`}
      open={open}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Batal
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Memproses...' : 'Proses Penerimaan'}
          </button>
        </>
      }
    >
      <div className="space-y-3.5">
        {error && (
          <div className="text-xs text-status-danger bg-status-dangerBg rounded-md px-3 py-2">{error}</div>
        )}

        <div>
          <label className="label-field">Pengecekan Faktur — Barang Sesuai Pesanan?</label>
          <div className="flex gap-2">
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                barangSesuai === 'ya'
                  ? 'bg-status-successBg border-status-success text-status-success'
                  : 'border-surface-border text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setBarangSesuai('ya')}
              disabled={submitting}
            >
              Ya, Sesuai
            </button>
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                barangSesuai === 'tidak'
                  ? 'bg-status-dangerBg border-status-danger text-status-danger'
                  : 'border-surface-border text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setBarangSesuai('tidak')}
              disabled={submitting}
            >
              Tidak Sesuai
            </button>
          </div>
          {barangSesuai === 'tidak' && (
            <p className="text-[11px] text-status-danger mt-1.5">
              Barang akan ditandai sebagai Pengecualian dan tidak lanjut ke tahap QC.
            </p>
          )}
        </div>

        {barangSesuai === 'ya' && (
          <div>
            <label className="label-field">Jumlah Diterima per Produk</label>
            <div className="space-y-2">
              {po.items.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 flex-1">
                    {item.produkNama}{' '}
                    <span className="text-slate-400">(pesan {item.jumlahPesan} {item.satuan})</span>
                  </span>
                  <input
                    type="number"
                    min={0}
                    className="input-field w-28"
                    value={jumlahDiterima[item.id] ?? ''}
                    onChange={(e) => setJumlahDiterima((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    disabled={submitting}
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Jika jumlah diterima berbeda dari pesanan, selisih akan otomatis dicatat.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
