import { useEffect, useState } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
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
import { fetchSatuanBarang } from '../../../services/satuanBarangService';
import type { Pemasok } from '../../../types/pemasok';
import type { Produk } from '../../../types/produk';
import type { SatuanBarang } from '../../../types/satuanBarang';

interface PesananPembelianFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PesananPembelianFormValues, pemasokNama: string) => Promise<void>;
}

const EMPTY_ITEM: POItemFormValues = { produkId: '', satuan: '', jumlah: '', hargaSatuan: '' };

/** Satuan default yang otomatis dipilih saat sebuah produk dipilih. */
function getDefaultSatuanKode(produk?: Produk): string {
  return produk?.satuanPembelian?.kode ?? produk?.satuan?.kode ?? '';
}

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
  const [satuanBarangOptions, setSatuanBarangOptions] = useState<SatuanBarang[]>([]);
  const [satuanDropdownOpen, setSatuanDropdownOpen] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setPemasokId('');
    setItems([{ ...EMPTY_ITEM }]);
    setErrors({});
    setSubmitError(null);
    setSatuanDropdownOpen(null);
    fetchPemasok().then((data) => setPemasokOptions(data.filter((p) => p.status === 'aktif')));
    fetchProduk().then((data) => setProdukOptions(data.filter((p) => p.status === 'aktif')));
    fetchSatuanBarang().then((data) =>
      setSatuanBarangOptions(data.filter((s: SatuanBarang) => s.status === 'aktif'))
    );
  }, [open]);

  function updateItem(index: number, patch: Partial<POItemFormValues>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function handleProdukChange(index: number, produkId: string) {
    const produk = produkOptions.find((p) => p.id === produkId);
    updateItem(index, { produkId, satuan: getDefaultSatuanKode(produk) });
  }

  function selectSatuan(index: number, kode: string) {
    updateItem(index, { satuan: kode });
    setSatuanDropdownOpen(null);
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
                {/* Kolom Produk */}
                <select
                  className="input-field col-span-4"
                  value={item.produkId}
                  onChange={(e) => handleProdukChange(index, e.target.value)}
                  disabled={submitting}
                >
                  <option value="">Pilih produk</option>
                  {produkOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.kodeProduk} — {p.namaProduk}
                    </option>
                  ))}
                </select>

                {/* Kolom Jumlah */}
                <input
                  type="number"
                  min={0}
                  className="input-field col-span-2"
                  placeholder="Jumlah"
                  value={item.jumlah}
                  onChange={(e) => updateItem(index, { jumlah: e.target.value })}
                  disabled={submitting}
                />

                {/* Dropdown Satuan dari Satuan Barang */}
                <div className="col-span-2 relative">
                  <button
                    type="button"
                    className="input-field w-full flex items-center justify-between gap-1 text-left"
                    onClick={() =>
                      setSatuanDropdownOpen(satuanDropdownOpen === index ? null : index)
                    }
                    disabled={submitting}
                  >
                    <span className={item.satuan ? 'text-slate-800' : 'text-slate-400'}>
                      {item.satuan || 'Satuan'}
                    </span>
                    <ChevronDown
                      size={12}
                      className={`shrink-0 transition-transform ${satuanDropdownOpen === index ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {satuanDropdownOpen === index && (
                    <div className="absolute bottom-full left-0 min-w-[140px] mb-0.5 bg-white border border-surface-border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                      {satuanBarangOptions.length === 0 ? (
                        <p className="px-3 py-2 text-[11px] text-slate-400">
                          Belum ada satuan barang aktif.
                        </p>
                      ) : (
                        satuanBarangOptions.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-slate-50 ${
                              item.satuan === s.kodeSatuan
                                ? 'bg-brand-600/10 text-brand-700 font-medium'
                                : 'text-slate-700'
                            }`}
                            onClick={() => selectSatuan(index, s.kodeSatuan)}
                          >
                            <span className="font-medium">{s.kodeSatuan}</span>
                            <span className="text-slate-400 ml-1">— {s.namaSatuan}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Kolom Harga Satuan */}
                <input
                  type="number"
                  min={0}
                  className="input-field col-span-3"
                  placeholder="Harga satuan"
                  value={item.hargaSatuan}
                  onChange={(e) => updateItem(index, { hargaSatuan: e.target.value })}
                  disabled={submitting}
                />

                {/* Tombol Hapus */}
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
