import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import type { PerhitunganStok } from '../../../types/perhitunganStok';

interface PersetujuanFormModalProps {
  open: boolean;
  tugas: PerhitunganStok | null;
  onClose: () => void;
  onSubmit: (disetujui: boolean) => Promise<void>;
}

export default function PersetujuanFormModal({
  open,
  tugas,
  onClose,
  onSubmit,
}: PersetujuanFormModalProps) {
  const [submitting, setSubmitting] = useState<'ya' | 'tidak' | null>(null);

  if (!tugas) return null;

  async function handleSubmit(disetujui: boolean) {
    setSubmitting(disetujui ? 'ya' : 'tidak');
    try {
      await onSubmit(disetujui);
      onClose();
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <Modal
      title={`Persetujuan Penyesuaian Stok — ${tugas.produkNama}`}
      open={open}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={Boolean(submitting)}>
            Batal
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-status-danger text-white text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            onClick={() => handleSubmit(false)}
            disabled={Boolean(submitting)}
          >
            {submitting === 'tidak' ? 'Menyimpan...' : 'Tolak'}
          </button>
          <button type="button" className="btn-primary" onClick={() => handleSubmit(true)} disabled={Boolean(submitting)}>
            {submitting === 'ya' ? 'Menyimpan...' : 'Setujui'}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="text-xs text-slate-600 bg-slate-50 rounded-md px-3 py-2 space-y-1">
          <p>
            Jumlah sistem: <span className="font-medium">{tugas.jumlahSistem} {tugas.satuan}</span>
          </p>
          <p>
            Jumlah fisik: <span className="font-medium">{tugas.jumlahFisik} {tugas.satuan}</span>
          </p>
          <p>
            Selisih:{' '}
            <span className="font-medium">
              {tugas.selisih !== undefined && tugas.selisih > 0 ? '+' : ''}
              {tugas.selisih} {tugas.satuan}
            </span>
          </p>
          {tugas.catatanPenyebab && <p>Catatan: {tugas.catatanPenyebab}</p>}
        </div>
        <p className="text-[11px] text-slate-400">
          Jika disetujui, stok di Persediaan akan langsung disesuaikan sebesar selisih di atas. Jika ditolak,
          tugas ini akan kembali ke tahap investigasi.
        </p>
      </div>
    </Modal>
  );
}
