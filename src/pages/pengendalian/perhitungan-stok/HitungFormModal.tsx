import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import type { PerhitunganStok } from '../../../types/perhitunganStok';

interface HitungFormModalProps {
  open: boolean;
  tugas: PerhitunganStok | null;
  onClose: () => void;
  onSubmit: (jumlahFisik: number) => Promise<void>;
}

export default function HitungFormModal({ open, tugas, onClose, onSubmit }: HitungFormModalProps) {
  const [jumlahFisik, setJumlahFisik] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setJumlahFisik('');
    setError(null);
  }, [open]);

  if (!tugas) return null;

  const parsed = Number(jumlahFisik);
  const selisihPreview = jumlahFisik.trim() && !Number.isNaN(parsed) ? parsed - tugas.jumlahSistem : null;

  async function handleSubmit() {
    if (!jumlahFisik.trim() || Number.isNaN(parsed) || parsed < 0) {
      setError('Masukkan jumlah fisik yang valid (angka, tidak boleh negatif).');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(parsed);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={`Perhitungan Stok Manual — ${tugas.produkNama}`}
      open={open}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Batal
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Memproses...' : 'Bandingkan dengan Data'}
          </button>
        </>
      }
    >
      <div className="space-y-3.5">
        {error && (
          <div className="text-xs text-status-danger bg-status-dangerBg rounded-md px-3 py-2">{error}</div>
        )}

        <div className="text-xs text-slate-500 bg-slate-50 rounded-md px-3 py-2">
          Lokasi: {tugas.lokasiPenyimpanan || '-'}
          <br />
          Jumlah tercatat di sistem: <span className="font-medium text-slate-700">{tugas.jumlahSistem} {tugas.satuan}</span>
        </div>

        <div>
          <label className="label-field">Masukan Jumlah yang Ada (hasil hitung fisik)</label>
          <input
            type="number"
            min={0}
            className="input-field"
            placeholder={`Contoh: ${tugas.jumlahSistem}`}
            value={jumlahFisik}
            onChange={(e) => setJumlahFisik(e.target.value)}
            disabled={submitting}
          />
        </div>

        {selisihPreview !== null && (
          <p
            className={`text-[11px] rounded-md px-3 py-2 ${
              selisihPreview === 0
                ? 'text-status-success bg-status-successBg'
                : 'text-status-warning bg-status-warningBg'
            }`}
          >
            {selisihPreview === 0
              ? 'Sesuai — tidak ada selisih.'
              : `Selisih: ${selisihPreview > 0 ? '+' : ''}${selisihPreview} ${tugas.satuan} (${
                  selisihPreview > 0 ? 'lebih dari sistem' : 'kurang dari sistem'
                })`}
          </p>
        )}
      </div>
    </Modal>
  );
}
