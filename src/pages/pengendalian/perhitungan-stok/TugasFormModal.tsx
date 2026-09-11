import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import { fetchProduk } from '../../../services/produkService';
import type { Produk } from '../../../types/produk';

interface TugasFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (produk: Produk) => Promise<void>;
}

export default function TugasFormModal({ open, onClose, onSubmit }: TugasFormModalProps) {
  const [produkId, setProdukId] = useState('');
  const [produkOptions, setProdukOptions] = useState<Produk[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setProdukId('');
    setError(null);
    fetchProduk().then((data) => setProdukOptions(data.filter((p) => p.status === 'aktif')));
  }, [open]);

  async function handleSubmit() {
    const produk = produkOptions.find((p) => p.id === produkId);
    if (!produk) {
      setError('Pilih produk yang akan dihitung.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(produk);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat tugas perhitungan.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title="Buat Tugas Perhitungan Stok"
      open={open}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Batal
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Menyimpan...' : 'Buat Tugas'}
          </button>
        </>
      }
    >
      <div className="space-y-3.5">
        {error && (
          <div className="text-xs text-status-danger bg-status-dangerBg rounded-md px-3 py-2">{error}</div>
        )}
        <div>
          <label className="label-field">Tentukan Produk</label>
          <select
            className="input-field"
            value={produkId}
            onChange={(e) => setProdukId(e.target.value)}
            disabled={submitting}
          >
            <option value="">Pilih produk</option>
            {produkOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.kodeProduk} — {p.namaProduk}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Jumlah sistem akan diambil otomatis dari data Persediaan saat ini.
          </p>
        </div>
      </div>
    </Modal>
  );
}
