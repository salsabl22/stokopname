import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import type {
  PesananPembelianFormErrors,
  PesananPembelianFormValues,
  POItemFormValues,
} from '../../../types/barangMasuk';
import { isPesananPembelianFormValid, validatePesananPembelianForm } from '../../../utils/validatePesananPembelian';
import { formatRupiah } from '../../../utils/statusPO';
import { fetchPemasok } from '../../../services/pemasokService';
import { fetchProduk } from '../../../services/produkService';
import type { Pemasok } from '../../../types/pemasok';
import type { Produk } from '../../../types/produk';

interface PesananPembelianFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PesananPembelianFormValues, pemasokNama: string) => Promise<void>;
}

const EMPTY_ITEM: POItemFormValues = { produkId: '', jumlah: '', hargaSatuan: '' };

export default function PesananPembelianFormModal({
  open,
  onClose,
  onSubmit,
}: PesananPembelianFormModalProps) {
  const [pemasokId, setPemasokId] = useState('');
  const [items, setItems] = useState<POItemFormValues[]>([{ ...EMPTY_ITEM }]);
  const [errors, setErrors] = useState<PesananPembelianFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pemasokOptions, setPemasokOptions] = useState<Pemasok[]>([]);
  const [produkOptions, setProdukOptions] = useState<Produk[]>([]);

  useEffect(() => {
    if (!open) return;
    setPemasokId('');
    setItems([{ ...EMPTY_ITEM }]);
    setErrors({});
    fetchPemasok().then((data) => setPemasokOptions(data.filter((p) => p.status === 'aktif')));
    fetchProduk().then((data) => setProdukOptions(data.filter((p) => p.status === 'aktif')));
  }, [open]);

  function updateItem(index: number, patch: Partial<POItemFormValues>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const total = items.reduce((sum, it) => {
    const jumlah = Number(it.jumlah) || 0;
    const harga = Number(it.hargaSatuan) || 0;
    return sum + jumlah * harga;
  }, 0);

  async function handleSubmit() {
    const values: PesananPembelianFormValues = { pemasokId, items };
    const validationErrors = validatePesananPembelianForm(values);
    setErrors(validationErrors);
    if (!isPesananPembelianFormValid(validationErrors)) return;

    const pemasok = pemasokOptions.find((p) => p.id === pemasokId)!;
      setSubmitting(true);
      setSubmitError(null);
      try {
        await onSubmit(values, pemasok.namaPemasok);
        onClose();
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Gagal menyimpan pesanan pembelian.');
      } finally {
        setSubmitting(false);
      }
  }

  return (
    <Modal
      title="Buat Pesanan Pembelian"
      open={open}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Batal
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Menyimpan...' : 'Simpan Pesanan'}
          </button>
        </>
      }
    >
      <div className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
        <div>
          <label className="label-field">Supplier</label>
          <select
            className="input-field"
            value={pemasokId}
            onChange={(e) => setPemasokId(e.target.value)}
            disabled={submitting}
          >
            <option value="">Pilih supplier</option>
            {pemasokOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.namaPemasok}
              </option>
            ))}
          </select>
          {errors.pemasokId && <p className="text-[11px] text-status-danger mt-1">{errors.pemasokId}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label-field mb-0">Item Pesanan</label>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs text-navy-800 hover:underline"
              onClick={addItem}
            >
              <Plus size={13} /> Tambah Produk
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-start">
                <select
                  className="input-field col-span-5"
                  value={item.produkId}
                  onChange={(e) => updateItem(index, { produkId: e.target.value })}
                  disabled={submitting}
                >
                  <option value="">Pilih produk</option>
                  {produkOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.kodeProduk} — {p.namaProduk}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  className="input-field col-span-3"
                  placeholder="Jumlah"
                  value={item.jumlah}
                  onChange={(e) => updateItem(index, { jumlah: e.target.value })}
                  disabled={submitting}
                />
                <input
                  type="number"
                  min={0}
                  className="input-field col-span-3"
                  placeholder="Harga satuan"
                  value={item.hargaSatuan}
                  onChange={(e) => updateItem(index, { hargaSatuan: e.target.value })}
                  disabled={submitting}
                />
                <button
                  type="button"
                  className="col-span-1 w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-status-danger hover:bg-status-dangerBg mt-0.5"
                  onClick={() => removeItem(index)}
                  disabled={submitting || items.length === 1}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          {errors.items && <p className="text-[11px] text-status-danger mt-1.5">{errors.items}</p>}
          {produkOptions.length === 0 && (
            <p className="text-[11px] text-status-warning bg-status-warningBg rounded-md px-3 py-2 mt-2">
              Belum ada produk aktif. Tambahkan dulu di Data Master &gt; Produk.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-surface-border">
          <span className="text-xs font-medium text-slate-600">Total Pesanan</span>
          <span className="text-sm font-semibold text-slate-800">{formatRupiah(total)}</span>
        </div>
        {submitError && (
          <p className="text-[11px] text-status-danger bg-status-dangerBg rounded-md px-3 py-2">
            {submitError}
          </p>
        )}
      </div>
    </Modal>
  );
}
