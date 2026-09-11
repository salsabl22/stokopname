import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import type { ProdukFormErrors, ProdukFormValues } from '../../../types/produk';
import { EMPTY_PRODUK_FORM, KATEGORI_PRODUK_OPTIONS } from '../../../types/produk';
import { fetchSatuanBarang } from '../../../services/satuanBarangService';

interface ProdukFormModalProps {
  open: boolean;
  editingItem: any | null;
  onClose: () => void;
  onSubmit: (values: ProdukFormValues) => Promise<void>;
}

export default function ProdukFormModal({
  open,
  editingItem,
  onClose,
  onSubmit,
}: ProdukFormModalProps) {
  const [values, setValues] = useState<ProdukFormValues>(EMPTY_PRODUK_FORM);
  const [errors, setErrors] = useState<ProdukFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [satuanOptions, setSatuanOptions] = useState<any[]>([]);
  const [loadingSatuan, setLoadingSatuan] = useState(false);

  const isEdit = Boolean(editingItem);

  // Ambil satuan yang dipilih untuk display di label konversi
  const satuanDasarLabel = satuanOptions.find(s => s.id === values.satuanId)?.kode || '?';
  const satuanBeliLabel = satuanOptions.find(s => s.id === values.satuanPembelianId)?.kode || '?';

  useEffect(() => {
    if (!open) return;
    if (editingItem) {
      setValues({
        kodeProduk: editingItem.kodeProduk,
        namaProduk: editingItem.namaProduk,
        kategori: editingItem.kategori,
        satuanId: editingItem.satuanId || '',
        satuanPembelianId: editingItem.satuanPembelianId || '',
        konversi: String(editingItem.konversi),
        minimumStok: String(editingItem.minimumStok),
        status: editingItem.status,
        deskripsi: editingItem.deskripsi || '',
        hargaBeli: editingItem.hargaBeli ? String(editingItem.hargaBeli) : '',
      });
    } else {
      setValues(EMPTY_PRODUK_FORM);
    }
    setErrors({});
    setSubmitError(null);

    setLoadingSatuan(true);
    fetchSatuanBarang()
      .then((data) => setSatuanOptions(data))
      .catch(() => setSatuanOptions([]))
      .finally(() => setLoadingSatuan(false));
  }, [open, editingItem]);

  function handleChange<K extends keyof ProdukFormValues>(key: K, value: ProdukFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): ProdukFormErrors {
    const errs: ProdukFormErrors = {};
    if (!values.kodeProduk.trim()) errs.kodeProduk = 'Kode produk wajib diisi';
    if (!values.namaProduk.trim()) errs.namaProduk = 'Nama produk wajib diisi';
    if (!values.kategori) errs.kategori = 'Pilih kategori';
    if (!values.satuanId) errs.satuanId = 'Pilih satuan dasar';
    if (!values.konversi || Number(values.konversi) < 1) errs.konversi = 'Konversi minimal 1';
    if (values.minimumStok === '' || Number(values.minimumStok) < 0) errs.minimumStok = 'Minimum stok tidak boleh negatif';
    return errs;
  }

  async function handleSubmit() {
    setSubmitError(null);
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit Produk' : 'Tambah Produk'}
      open={open}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Batal
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </>
      }
    >
      <div className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
        {submitError && (
          <div className="text-xs text-status-danger bg-status-dangerBg rounded-md px-3 py-2">
            {submitError}
          </div>
        )}

        {/* Kode Produk */}
        <div>
          <label className="label-field">Kode Produk</label>
          <input
            type="text"
            className="input-field"
            placeholder="Contoh: FOTO-001"
            value={values.kodeProduk}
            onChange={(e) => handleChange('kodeProduk', e.target.value)}
            disabled={submitting || isEdit}
          />
          {errors.kodeProduk && <p className="text-[11px] text-status-danger mt-1">{errors.kodeProduk}</p>}
        </div>

        {/* Nama Produk */}
        <div>
          <label className="label-field">Nama Produk</label>
          <input
            type="text"
            className="input-field"
            placeholder="Contoh: Roll Film"
            value={values.namaProduk}
            onChange={(e) => handleChange('namaProduk', e.target.value)}
            disabled={submitting}
          />
          {errors.namaProduk && <p className="text-[11px] text-status-danger mt-1">{errors.namaProduk}</p>}
        </div>

        {/* Kategori */}
        <div>
          <label className="label-field">Kategori</label>
          <select
            className="input-field"
            value={values.kategori}
            onChange={(e) => handleChange('kategori', e.target.value)}
            disabled={submitting}
          >
            <option value="">Pilih kategori</option>
            {KATEGORI_PRODUK_OPTIONS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          {errors.kategori && <p className="text-[11px] text-status-danger mt-1">{errors.kategori}</p>}
        </div>

        {/* Satuan Dasar & Satuan Pembelian */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Satuan Dasar *</label>
            <select
              className="input-field"
              value={values.satuanId}
              onChange={(e) => handleChange('satuanId', e.target.value)}
              disabled={submitting || loadingSatuan}
            >
              <option value="">Pilih satuan</option>
              {satuanOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.kode} — {s.nama}
                </option>
              ))}
            </select>
            {errors.satuanId && <p className="text-[11px] text-status-danger mt-1">{errors.satuanId}</p>}
          </div>

          <div>
            <label className="label-field">Satuan Pembelian</label>
            <select
              className="input-field"
              value={values.satuanPembelianId}
              onChange={(e) => handleChange('satuanPembelianId', e.target.value)}
              disabled={submitting || loadingSatuan}
            >
              <option value="">Sama dengan dasar</option>
              {satuanOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.kode} — {s.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        {satuanOptions.length === 0 && !loadingSatuan && (
          <p className="text-[11px] text-status-warning bg-status-warningBg rounded-md px-3 py-2">
            Belum ada data Satuan Barang. Tambahkan dulu di Data Master &gt; Satuan Barang.
          </p>
        )}

        {/* Konversi & Min Stok */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">
              Konversi{' '}
              <span className="text-slate-400 font-normal">
                (1 {satuanBeliLabel} = ? {satuanDasarLabel})
              </span>
            </label>
            <input
              type="number"
              min={1}
              step="any"
              className="input-field"
              placeholder="Contoh: 20"
              value={values.konversi}
              onChange={(e) => handleChange('konversi', e.target.value)}
              disabled={submitting}
            />
            {errors.konversi && <p className="text-[11px] text-status-danger mt-1">{errors.konversi}</p>}
          </div>

          <div>
            <label className="label-field">Minimum Stok ({satuanDasarLabel})</label>
            <input
              type="number"
              min={0}
              step="any"
              className="input-field"
              placeholder="Contoh: 30"
              value={values.minimumStok}
              onChange={(e) => handleChange('minimumStok', e.target.value)}
              disabled={submitting}
            />
            {errors.minimumStok && (
              <p className="text-[11px] text-status-danger mt-1">{errors.minimumStok}</p>
            )}
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="label-field">Deskripsi (opsional)</label>
          <input
            type="text"
            className="input-field"
            placeholder="Keterangan singkat produk..."
            value={values.deskripsi || ''}
            onChange={(e) => handleChange('deskripsi', e.target.value)}
            disabled={submitting}
          />
        </div>

        {/* Status */}
        <div>
          <label className="label-field">Status</label>
          <select
            className="input-field"
            value={values.status}
            onChange={(e) => handleChange('status', e.target.value as 'aktif' | 'nonaktif')}
            disabled={submitting}
          >
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}
