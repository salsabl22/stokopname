import { useEffect, useState } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import type {
  PesananCabangFormErrors,
  PesananCabangFormValues,
  PesananCabangItemFormValues,
} from '../../../types/pesananCabang';
import {
  isPesananCabangFormValid,
  validatePesananCabangForm,
} from '../../../utils/validatePesananCabang';
import { validasiStokUntukPesanan } from '../../../services/pesananCabangService';
import { fetchCabang } from '../../../services/cabangService';
import { fetchProduk } from '../../../services/produkService';
import { fetchSatuanBarang } from '../../../services/satuanBarangService';
import { fetchPersediaan } from '../../../services/persediaanService';
import { stokBebas } from '../../../types/persediaan';
import type { StokItem } from '../../../types/persediaan';
import type { Cabang } from '../../../types/cabang';
import type { Produk } from '../../../types/produk';

interface PesananCabangFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PesananCabangFormValues, cabangNama: string) => Promise<void>;
  /** Label dinamis: "Cabang" (Fotosnaps) atau "Event" (Burger Chill / Keripik Bujangan) */
  labelSingular?: string;
}

const EMPTY_ITEM: PesananCabangItemFormValues = { produkId: '', jumlah: '' };

export default function PesananCabangFormModal({
  open,
  onClose,
  onSubmit,
  labelSingular = 'Cabang',
}: PesananCabangFormModalProps) {
  const [cabangId, setCabangId] = useState('');
  const [items, setItems] = useState<PesananCabangItemFormValues[]>([{ ...EMPTY_ITEM }]);
  const [errors, setErrors] = useState<PesananCabangFormErrors>({});
  const [stokWarning, setStokWarning] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [cabangOptions, setCabangOptions] = useState<Cabang[]>([]);
  const [produkOptions, setProdukOptions] = useState<Produk[]>([]);
  const [satuanOptions, setSatuanOptions] = useState<any[]>([]);
  const [stokList, setStokList] = useState<StokItem[]>([]);

  useEffect(() => {
    if (!open) return;
    setCabangId('');
    setItems([{ ...EMPTY_ITEM }]);
    setErrors({});
    setStokWarning(null);
    fetchCabang().then((data) => setCabangOptions(data.filter((c) => c.status === 'aktif')));
    fetchProduk().then((data) => setProdukOptions(data.filter((p) => p.status === 'aktif')));
    fetchSatuanBarang().then(setSatuanOptions);
    fetchPersediaan().then(setStokList);
  }, [open]);

  // Auto-isi satuan dari produk yang dipilih
  function getSatuanDefault(produkId: string): string {
    const produk = produkOptions.find(p => p.id === produkId);
    if (!produk) return '';
    if ((produk as any).satuan?.namaSatuan) return (produk as any).satuan.namaSatuan;
    if ((produk as any).satuan?.nama) return (produk as any).satuan.nama;
    return '';
  }

  function updateItem(index: number, patch: Partial<PesananCabangItemFormValues>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
    setStokWarning(null);
  }

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function stokBebasFor(produkId: string): number | null {
    const stok = stokList.find((s) => s.produkId === produkId);
    return stok ? stokBebas(stok) : null;
  }

  async function handleSubmit() {
    const values: PesananCabangFormValues = { cabangId, items };
    const validationErrors = validatePesananCabangForm(values);
    setErrors(validationErrors);
    if (!isPesananCabangFormValid(validationErrors)) return;

    // Decision: Stok Cukup? — dicek terhadap Persediaan sebelum pesanan dibuat.
    setStokWarning(null);
    const checkResults = await validasiStokUntukPesanan(
      items.map((it) => ({ produkId: it.produkId, jumlah: Number(it.jumlah) })),
    );
    const kurang = checkResults.filter((r: { cukup: boolean }) => !r.cukup);
    if (kurang.length > 0) {
      const namaProduk = kurang
        .map((k: { produkId: string }) => produkOptions.find((p) => p.id === k.produkId)?.namaProduk ?? k.produkId)
        .join(', ');
      setStokWarning(`Stok tidak cukup untuk: ${namaProduk}. Pesanan tetap bisa dibuat, tapi akan memerlukan Pengisian Ulang saat proses Alokasi.`);
    }

    const cabang = cabangOptions.find((c) => c.id === cabangId)!;
    setSubmitting(true);
    try {
      await onSubmit(values, cabang.namaCabang);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={`Buat Pesanan ${labelSingular}`}
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
        {stokWarning && (
          <div className="flex gap-2 text-xs text-status-warning bg-status-warningBg rounded-md px-3 py-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>{stokWarning}</span>
          </div>
        )}

        <div>
          <label className="label-field">{labelSingular}</label>
          <select
            className="input-field"
            value={cabangId}
            onChange={(e) => setCabangId(e.target.value)}
            disabled={submitting}
          >
            <option value="">Pilih {labelSingular.toLowerCase()}</option>
            {cabangOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.namaCabang}
              </option>
            ))}
          </select>
          {errors.cabangId && (
            <p className="text-[11px] text-status-danger mt-1">{errors.cabangId}</p>
          )}
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
            {items.map((item, index) => {
              const bebas = item.produkId ? stokBebasFor(item.produkId) : null;
              return (
                <div key={index}>
                  <div className="grid grid-cols-12 gap-2 items-start">
                    <select
                      className="input-field col-span-7"
                      value={item.produkId}
                      onChange={(e) => {
                        const satuanAuto = getSatuanDefault(e.target.value);
                        updateItem(index, { produkId: e.target.value, satuan: satuanAuto });
                      }}
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
                      className="input-field col-span-2"
                      placeholder="Jumlah"
                      value={item.jumlah}
                      onChange={(e) => updateItem(index, { jumlah: e.target.value })}
                      disabled={submitting}
                    />
                    <select
                      className="input-field col-span-2"
                      value={(item as any).satuan || ''}
                      onChange={(e) => updateItem(index, { satuan: e.target.value } as any)}
                      disabled={submitting}
                    >
                      <option value="">Satuan</option>
                      {satuanOptions.map((s) => (
                        <option key={s.id} value={s.kodeSatuan}>
                          {s.kodeSatuan} — {s.namaSatuan}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="col-span-1 w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-status-danger hover:bg-status-dangerBg mt-0.5"
                      onClick={() => removeItem(index)}
                      disabled={submitting || items.length === 1}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {item.produkId && bebas !== null && (
                    <p className="text-[11px] text-slate-400 mt-1">Stok bebas saat ini: {bebas}</p>
                  )}
                </div>
              );
            })}
          </div>
          {errors.items && <p className="text-[11px] text-status-danger mt-1.5">{errors.items}</p>}
        </div>
      </div>
    </Modal>
  );
}
