import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import type { PerhitunganStok } from '../../../types/perhitunganStok';

interface InvestigasiFormModalProps {
  open: boolean;
  tugas: PerhitunganStok | null;
  onClose: () => void;
  onSubmit: (barangBermasalah: boolean, catatan: string) => Promise<void>;
}

export default function InvestigasiFormModal({
  open,
  tugas,
  onClose,
  onSubmit,
}: InvestigasiFormModalProps) {
  const [barangBermasalah, setBarangBermasalah] = useState<'ya' | 'tidak' | ''>('');
  const [catatan, setCatatan] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBarangBermasalah('');
    setCatatan('');
    setError(null);
  }, [open]);

  if (!tugas) return null;

  async function handleSubmit() {
    if (!barangBermasalah) {
      setError('Pilih hasil investigasi terlebih dahulu.');
      return;
    }
    if (!catatan.trim()) {
      setError(
        barangBermasalah === 'ya'
          ? 'Catatan kondisi barang wajib diisi sebelum dipindah ke Karantina.'
          : 'Penyebab selisih wajib dijelaskan.',
      );
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(barangBermasalah === 'ya', catatan.trim());
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={`Investigasi Pengecualian — ${tugas.produkNama}`}
      open={open}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Batal
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Memproses...' : 'Ajukan Persetujuan Penyesuaian'}
          </button>
        </>
      }
    >
      <div className="space-y-3.5">
        {error && (
          <div className="text-xs text-status-danger bg-status-dangerBg rounded-md px-3 py-2">{error}</div>
        )}

        <div className="text-xs text-status-warning bg-status-warningBg rounded-md px-3 py-2">
          Selisih ditemukan: {tugas.selisih !== undefined && tugas.selisih > 0 ? '+' : ''}
          {tugas.selisih} {tugas.satuan}
        </div>

        <div>
          <label className="label-field">Barang Bermasalah?</label>
          <div className="flex gap-2">
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                barangBermasalah === 'ya'
                  ? 'bg-status-dangerBg border-status-danger text-status-danger'
                  : 'border-surface-border text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setBarangBermasalah('ya')}
              disabled={submitting}
            >
              Ya, Bermasalah
            </button>
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                barangBermasalah === 'tidak'
                  ? 'bg-status-successBg border-status-success text-status-success'
                  : 'border-surface-border text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setBarangBermasalah('tidak')}
              disabled={submitting}
            >
              Tidak, Sebab Lain
            </button>
          </div>
          {barangBermasalah === 'ya' && (
            <p className="text-[11px] text-status-danger mt-1.5">
              Barang akan dipindahkan ke status Karantina.
            </p>
          )}
        </div>

        <div>
          <label className="label-field">
            {barangBermasalah === 'ya' ? 'Catatan Kondisi Barang' : 'Tentukan Penyebab Selisih'}
          </label>
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder={
              barangBermasalah === 'ya'
                ? 'Contoh: kemasan rusak, kadaluarsa...'
                : 'Contoh: kesalahan input, barang terselip di lokasi lain...'
            }
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            disabled={submitting}
          />
        </div>
      </div>
    </Modal>
  );
}
