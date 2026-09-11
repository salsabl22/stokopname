import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import type { PesananCabang } from '../../../types/pesananCabang';

interface PengirimanFormModalProps {
  open: boolean;
  pesanan: PesananCabang | null;
  onClose: () => void;
  onSubmit: (kurir: string, nomorResi: string, berhasil: boolean) => Promise<void>;
}

export default function PengirimanFormModal({
  open,
  pesanan,
  onClose,
  onSubmit,
}: PengirimanFormModalProps) {
  const [kurir, setKurir] = useState('');
  const [nomorResi, setNomorResi] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<'gagal' | 'berhasil' | null>(null);

  useEffect(() => {
    if (!open || !pesanan) return;
    setKurir(pesanan.kurir ?? '');
    setNomorResi(pesanan.nomorResi ?? '');
    setError(null);
  }, [open, pesanan]);

  if (!pesanan) return null;

  async function handleSubmit(berhasil: boolean) {
    if (!kurir.trim() || !nomorResi.trim()) {
      setError('Kurir dan nomor resi wajib diisi untuk membuat dokumen pengiriman.');
      return;
    }
    setError(null);
    setSubmitting(berhasil ? 'berhasil' : 'gagal');
    try {
      await onSubmit(kurir.trim(), nomorResi.trim(), berhasil);
      onClose();
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <Modal
      title={`Pengiriman — ${pesanan.nomorPesanan}`}
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
            {submitting === 'gagal' ? 'Menyimpan...' : 'Tandai Gagal (Buat Ulang Dokumen)'}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleSubmit(true)}
            disabled={Boolean(submitting)}
          >
            {submitting === 'berhasil' ? 'Menyimpan...' : 'Pengiriman Berhasil'}
          </button>
        </>
      }
    >
      <div className="space-y-3.5">
        {error && (
          <div className="text-xs text-status-danger bg-status-dangerBg rounded-md px-3 py-2">{error}</div>
        )}

        <div>
          <label className="label-field">Kurir</label>
          <input
            type="text"
            className="input-field"
            placeholder="Contoh: JNE, Armada Internal"
            value={kurir}
            onChange={(e) => setKurir(e.target.value)}
            disabled={Boolean(submitting)}
          />
        </div>

        <div>
          <label className="label-field">Nomor Resi</label>
          <input
            type="text"
            className="input-field"
            placeholder="Contoh: RESI-00123"
            value={nomorResi}
            onChange={(e) => setNomorResi(e.target.value)}
            disabled={Boolean(submitting)}
          />
        </div>

        <p className="text-[11px] text-slate-400">
          Simpan sebagai dokumen pengiriman terlebih dahulu, lalu tandai hasilnya setelah barang benar-benar
          diserahkan ke kurir. Jika gagal, dokumen bisa dibuat ulang dengan data baru.
        </p>
      </div>
    </Modal>
  );
}
