import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Upload, X, ImageIcon } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import type { ReturFormErrors, ReturFormValues, ReturItemFormValues, SumberRetur } from '../../../types/retur';
import { isReturFormValid, validateReturForm } from '../../../utils/validateRetur';
import { fetchCabang } from '../../../services/cabangService';
import { fetchProduk } from '../../../services/produkService';
import { fetchPOByStatus } from '../../../services/barangMasukService';
import type { Cabang } from '../../../types/cabang';
import type { Produk } from '../../../types/produk';
import type { PesananPembelian } from '../../../types/barangMasuk';

interface ReturFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    values: ReturFormValues,
    meta: { cabangNama?: string; poNomor?: string; pemasokNama?: string },
    fotoKerusakan?: string,
  ) => Promise<void>;
}

const EMPTY_ITEM: ReturItemFormValues = { produkId: '', jumlah: '' };

export default function ReturFormModal({ open, onClose, onSubmit }: ReturFormModalProps) {
  const [sumber, setSumber] = useState<SumberRetur>('cabang');
  const [cabangId, setCabangId] = useState('');
  const [poId, setPoId] = useState('');
  const [items, setItems] = useState<ReturItemFormValues[]>([{ ...EMPTY_ITEM }]);
  const [alasan, setAlasan] = useState('');
  const [errors, setErrors] = useState<ReturFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [cabangOptions, setCabangOptions] = useState<Cabang[]>([]);
  const [produkOptions, setProdukOptions] = useState<Produk[]>([]);
  const [poOptions, setPoOptions] = useState<PesananPembelian[]>([]);

  // Foto kerusakan
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setSumber('cabang');
    setCabangId('');
    setPoId('');
    setItems([{ ...EMPTY_ITEM }]);
    setAlasan('');
    setErrors({});
    setFotoPreview(null);
    fetchCabang().then((data) => setCabangOptions(data.filter((c) => c.status === 'aktif')));
    fetchProduk().then(setProdukOptions);
    fetchPOByStatus(['retur']).then(setPoOptions);
  }, [open]);

  const selectedPO = poOptions.find((po) => po.id === poId);

  function updateItem(index: number, patch: Partial<ReturItemFormValues>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }
  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }
  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSumberChange(value: SumberRetur) {
    setSumber(value);
    setCabangId('');
    setPoId('');
    if (value === 'internal') {
      setItems([{ ...EMPTY_ITEM }]);
    }
  }

  function handlePoChange(id: string) {
    setPoId(id);
    const po = poOptions.find((p) => p.id === id);
    if (po) {
      setItems(po.items.map((it) => ({ produkId: it.produkId, jumlah: String(it.jumlahDiterima ?? it.jumlahPesan) })));
    }
  }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validasi ukuran (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto maksimal 5MB');
      return;
    }
    
    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (JPG, PNG, WEBP, dll)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function removeFoto() {
    setFotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit() {
    const values: ReturFormValues = { sumber, cabangId, poId, items, alasan };
    const validationErrors = validateReturForm(values);
    setErrors(validationErrors);
    if (!isReturFormValid(validationErrors)) return;

    const cabang = cabangOptions.find((c) => c.id === cabangId);
      setSubmitting(true);
      setSubmitError(null);
      try {
        await onSubmit(
          values,
          {
            cabangNama: cabang?.namaCabang,
            poNomor: selectedPO?.nomorPO,
            pemasokNama: selectedPO?.pemasokNama,
          },
          fotoPreview || undefined,
        );
        onClose();
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Gagal mengajukan retur.');
      } finally {
        setSubmitting(false);
      }
  }

  return (
    <Modal
      title="Ajukan Retur"
      open={open}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Batal
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Menyimpan...' : 'Kirim Pengajuan'}
          </button>
        </>
      }
    >
      <div className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
        <div>
          <label className="label-field">Sumber Retur</label>
          <div className="flex gap-2">
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                sumber === 'cabang'
                  ? 'bg-navy-900 border-navy-900 text-white'
                  : 'border-surface-border text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => handleSumberChange('cabang')}
              disabled={submitting}
            >
              Dari Cabang
            </button>
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                sumber === 'internal'
                  ? 'bg-navy-900 border-navy-900 text-white'
                  : 'border-surface-border text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => handleSumberChange('internal')}
              disabled={submitting}
            >
              Internal / Barang Ditolak
            </button>
          </div>
        </div>

        {sumber === 'cabang' ? (
          <div>
            <label className="label-field">Cabang</label>
            <select
              className="input-field"
              value={cabangId}
              onChange={(e) => setCabangId(e.target.value)}
              disabled={submitting}
            >
              <option value="">Pilih cabang</option>
              {cabangOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.namaCabang}
                </option>
              ))}
            </select>
            {errors.cabangId && <p className="text-[11px] text-status-danger mt-1">{errors.cabangId}</p>}
          </div>
        ) : (
          <div>
            <label className="label-field">Pesanan Pembelian (Hasil QC: Ditolak)</label>
            <select
              className="input-field"
              value={poId}
              onChange={(e) => handlePoChange(e.target.value)}
              disabled={submitting}
            >
              <option value="">Pilih PO</option>
              {poOptions.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.nomorPO} — {po.pemasokNama}
                </option>
              ))}
            </select>
            {errors.poId && <p className="text-[11px] text-status-danger mt-1">{errors.poId}</p>}
            {poOptions.length === 0 && (
              <p className="text-[11px] text-status-warning bg-status-warningBg rounded-md px-3 py-2 mt-1.5">
                Tidak ada PO dengan hasil QC "Ditolak" saat ini.
              </p>
            )}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label-field mb-0">Item Retur</label>
            {sumber === 'cabang' && (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-navy-800 hover:underline"
                onClick={addItem}
              >
                <Plus size={13} /> Tambah Produk
              </button>
            )}
          </div>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-start">
                <select
                  className="input-field col-span-7"
                  value={item.produkId}
                  onChange={(e) => updateItem(index, { produkId: e.target.value })}
                  disabled={submitting || sumber === 'internal'}
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
                  className="input-field col-span-4"
                  placeholder="Jumlah"
                  value={item.jumlah}
                  onChange={(e) => updateItem(index, { jumlah: e.target.value })}
                  disabled={submitting || sumber === 'internal'}
                />
                {sumber === 'cabang' && (
                  <button
                    type="button"
                    className="col-span-1 w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-status-danger hover:bg-status-dangerBg mt-0.5"
                    onClick={() => removeItem(index)}
                    disabled={submitting || items.length === 1}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.items && <p className="text-[11px] text-status-danger mt-1.5">{errors.items}</p>}
          {sumber === 'internal' && (
            <p className="text-[11px] text-slate-400 mt-1.5">
              Item otomatis mengikuti item pada PO yang dipilih.
            </p>
          )}
        </div>

        <div>
          <label className="label-field">Alasan / Identifikasi Transaksi</label>
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder="Jelaskan alasan pengajuan retur..."
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            disabled={submitting}
          />
          {errors.alasan && <p className="text-[11px] text-status-danger mt-1">{errors.alasan}</p>}
        </div>

        {/* Upload Foto Kerusakan */}
        <div>
          <label className="label-field">
            Foto Kerusakan <span className="text-slate-400 font-normal">(opsional)</span>
          </label>
          {fotoPreview ? (
            <div className="relative rounded-lg overflow-hidden border border-surface-border">
              <img
                src={fotoPreview}
                alt="Foto kerusakan"
                className="w-full max-h-48 object-contain bg-slate-50"
              />
              <button
                type="button"
                onClick={removeFoto}
                disabled={submitting}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-colors"
              onClick={() => !submitting && fileInputRef.current?.click()}
            >
              <ImageIcon size={28} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs text-slate-500">Klik untuk upload foto kerusakan</p>
              <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WEBP — Maks. 5MB</p>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                disabled={submitting}
              >
                <Upload size={13} />
                Pilih Foto
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFotoChange}
            disabled={submitting}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Upload foto untuk mendokumentasikan kondisi kerusakan barang yang akan diretur.
          </p>
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
