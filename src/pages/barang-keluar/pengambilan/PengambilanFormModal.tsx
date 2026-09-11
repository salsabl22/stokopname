import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import type { PesananCabang } from '../../../types/pesananCabang';

interface PengambilanFormModalProps {
  open: boolean;
  pesanan: PesananCabang | null;
  onClose: () => void;
  onSubmit: (
    sudahSesuai: boolean,
    jumlahDiambil: Record<string, number>,
    catatan?: string,
  ) => Promise<void>;
}

export default function PengambilanFormModal({
  open,
  pesanan,
  onClose,
  onSubmit,
}: PengambilanFormModalProps) {
  const [sudahSesuai, setSudahSesuai] = useState<'ya' | 'tidak' | ''>('');
  const [jumlahDiambil, setJumlahDiambil] = useState<Record<string, string>>({});
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !pesanan) return;
    setSudahSesuai('');
    setCatatan('');
    setError(null);
    const initial: Record<string, string> = {};
    pesanan.items.forEach((item) => {
      initial[item.id] = String(item.jumlahDipesan);
    });
    setJumlahDiambil(initial);
  }, [open, pesanan]);

  if (!pesanan) return null;

  async function handleSubmit() {
    if (!sudahSesuai) {
      setError('Pilih hasil pengecekan barang & lokasi terlebih dahulu.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (sudahSesuai === 'tidak') {
        await onSubmit(false, {}, catatan.trim() || undefined);
      } else {
        const parsed: Record<string, number> = {};
        Object.entries(jumlahDiambil).forEach(([id, val]) => {
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
      title={`Pengambilan — ${pesanan.nomorPesanan}`}
      open={open}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Batal
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Memproses...' : 'Konfirmasi Pengambilan'}
          </button>
        </>
      }
    >
      <div className="space-y-3.5">
        {error && (
          <div className="text-xs text-status-danger bg-status-dangerBg rounded-md px-3 py-2">{error}</div>
        )}

        <div>
          <label className="label-field">Scan Barcode Barang & Lokasi — Sudah Sesuai?</label>
          <div className="flex gap-2">
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                sudahSesuai === 'ya'
                  ? 'bg-status-successBg border-status-success text-status-success'
                  : 'border-surface-border text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setSudahSesuai('ya')}
              disabled={submitting}
            >
              Ya, Sesuai
            </button>
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                sudahSesuai === 'tidak'
                  ? 'bg-status-dangerBg border-status-danger text-status-danger'
                  : 'border-surface-border text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setSudahSesuai('tidak')}
              disabled={submitting}
            >
              Tidak Sesuai
            </button>
          </div>
        </div>

        {sudahSesuai === 'ya' && (
          <div>
            <label className="label-field">Jumlah Diambil per Produk</label>
            <div className="space-y-2">
              {pesanan.items.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 flex-1">
                    {item.produkNama}{' '}
                    <span className="text-slate-400">
                      (pesan {item.jumlahDipesan} {item.satuan})
                    </span>
                  </span>
                  <input
                    type="number"
                    min={0}
                    className="input-field w-28"
                    value={jumlahDiambil[item.id] ?? ''}
                    onChange={(e) => setJumlahDiambil((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    disabled={submitting}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {sudahSesuai === 'tidak' && (
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
            <p className="text-[11px] text-status-danger mt-1.5">
              Alokasi stok untuk pesanan ini akan dilepas kembali dan masuk status Pengecualian.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
