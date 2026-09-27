import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import type { PerhitunganStok } from '../../../types/perhitunganStok';
import { fetchStokByProduk } from '../../../services/persediaanService';
import { hitungStokSistemRealtime } from '../../../services/perhitunganStokService';

interface HitungFormModalProps {
  open: boolean;
  tugas: PerhitunganStok | null;
  onClose: () => void;
  onSubmit: (jumlahFisik: number, jumlahSistemTerkini: number) => Promise<void>;
}

export default function HitungFormModal({ open, tugas, onClose, onSubmit }: HitungFormModalProps) {
  const [jumlahFisik, setJumlahFisik] = useState('');
  const [jumlahSistemTerkini, setJumlahSistemTerkini] = useState<number | null>(null);
  const [loadingStok, setLoadingStok] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch stok bersih (tersedia − dialokasikan) secara real-time setiap modal dibuka
  useEffect(() => {
    if (!open || !tugas) return;
    setJumlahFisik('');
    setError(null);
    setJumlahSistemTerkini(null);
    setLoadingStok(true);

    hitungStokSistemRealtime(tugas.produkId)
      .then((stokRealtime) => {
        setJumlahSistemTerkini(stokRealtime);
      })
      .catch(() => {
        // Fallback ke snapshot tersimpan jika API gagal
        setJumlahSistemTerkini(tugas.jumlahSistem);
      })
      .finally(() => setLoadingStok(false));
  }, [open, tugas]);

  if (!tugas) return null;

  const jumlahSistemDisplay = jumlahSistemTerkini ?? tugas.jumlahSistem;
  const parsed = Number(jumlahFisik);
  const selisihPreview =
    jumlahFisik.trim() && !Number.isNaN(parsed) ? parsed - jumlahSistemDisplay : null;

  async function handleSubmit() {
    if (!jumlahFisik.trim() || Number.isNaN(parsed) || parsed < 0) {
      setError('Masukkan jumlah fisik yang valid (angka, tidak boleh negatif).');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(parsed, jumlahSistemDisplay);
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
          <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting || loadingStok}>
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
          Jumlah tercatat di sistem:{' '}
          {loadingStok ? (
            <span className="italic text-slate-400">Memuat...</span>
          ) : (
            <span className="font-medium text-slate-700">
              {jumlahSistemDisplay} {tugas.satuan}
            </span>
          )}
        </div>

        <div>
          <label className="label-field">Masukan Jumlah yang Ada (hasil hitung fisik)</label>
          <input
            type="number"
            min={0}
            className="input-field"
            placeholder={`Contoh: ${jumlahSistemDisplay}`}
            value={jumlahFisik}
            onChange={(e) => setJumlahFisik(e.target.value)}
            disabled={submitting || loadingStok}
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
