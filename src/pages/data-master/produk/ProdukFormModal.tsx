import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import type { ProdukFormErrors, ProdukFormValues } from '../../../types/produk';
import { EMPTY_PRODUK_FORM } from '../../../types/produk';
import { fetchSatuanBarang } from '../../../services/satuanBarangService';
import { useBusinessUnit } from '../../../contexts/BusinessUnitContext';
import type { SatuanBarang } from '../../../types/satuanBarang';

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
  const [satuanOptions, setSatuanOptions] = useState<SatuanBarang[]>([]);

  const { activeUnit } = useBusinessUnit();
  const isFotosnaps = activeUnit === 'FOTOSNAPS';
  const isEdit = Boolean(editingItem);

  useEffect(() => {
    if (!open) return;
    if (editingItem) {
      setValues({
        kodeProduk: editingItem.kodeProduk,
        namaProduk: editingItem.namaProduk,
        kategori: editingItem.kategori || '',
        satuanId: editingItem.satuanId || '',
        satuanPembelianId: editingItem.satuanPembelianId || '',
        konversi: String(editingItem.konversi || '1'),
        status: editingItem.status,
        deskripsi: editingItem.deskripsi || '',
        hargaBeli: editingItem.hargaBeli ? String(editingItem.hargaBeli) : '',
      });
    } else {
      setValues(EMPTY_PRODUK_FORM);
    }
    setErrors({});
    setSubmitError(null);

    fetchSatuanBarang()
      .then((list) => setSatuanOptions(list.filter((s: SatuanBarang) => s.status === 'aktif')))
      .catch(() => setSatuanOptions([]));
  }, [open, editingItem]);

  function handleChange<K extends keyof ProdukFormValues>(key: K, value: ProdukFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): ProdukFormErrors {
    const errs: ProdukFormErrors = {};
    if (!values.kodeProduk.trim()) errs.kodeProduk = 'Kode produk wajib diisi';
    if (!values.namaProduk.trim()) errs.namaProduk = 'Nama produk wajib diisi';
    // Konversi hanya wajib untuk non-Fotosnaps
    if (!isFotosnaps && (!values.konversi || Number(values.konversi) < 1)) {
      errs.konversi = 'Konversi minimal 1';
    }
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

  /** Buat label konversi human-readable dari data satuan yang dipilih */
  function konversiPreview(): string | null {
    if (isFotosnaps) return null;
    const satuanBeli = satuanOptions.find((s) => s.id === values.satuanPembelianId);
    const satuanDasar = satuanOptions.find((s) => s.id === values.satuanId);
    if (!satuanBeli || !satuanDasar) return null;
    if (satuanBeli.id === satuanDasar.id) return null;
    const jumlah = Number(values.konversi) || 0;
    if (jumlah <= 0) return null;
    return `1 ${satuanBeli.kodeSatuan} = ${jumlah} ${satuanDasar.kodeSatuan}`;
  }

  const preview = konversiPreview();

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

        {/* Satuan Dasar */}
        <div>
          <label className="label-field">Satuan Dasar</label>
          <select
            className="input-field"
            value={values.satuanId}
            onChange={(e) => handleChange('satuanId', e.target.value)}
            disabled={submitting}
          >
            <option value="">Pilih satuan dasar</option>
            {satuanOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.kodeSatuan} — {s.namaSatuan}
              </option>
            ))}
          </select>
        </div>

        {/* Satuan Pembelian & Konversi — hanya untuk non-Fotosnaps */}
        {!isFotosnaps && (
          <>
            <div>
              <label className="label-field">Satuan Pembelian</label>
              <select
                className="input-field"
                value={values.satuanPembelianId}
                onChange={(e) => handleChange('satuanPembelianId', e.target.value)}
                disabled={submitting}
              >
                <option value="">Pilih satuan pembelian</option>
                {satuanOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.kodeSatuan} — {s.namaSatuan}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field">Konversi Satuan</label>
              <input
                type="number"
                min={1}
                step="any"
                className="input-field"
                placeholder="Contoh: 50  (artinya 1 Bal = 50 PCS)"
                value={values.konversi}
                onChange={(e) => handleChange('konversi', e.target.value)}
                disabled={submitting}
              />
              {/* Preview konversi human-readable */}
              {preview && (
                <p className="text-[11px] text-brand-600 font-medium mt-1 bg-brand-50 rounded px-2 py-1">
                  ✓ {preview}
                </p>
              )}
              {errors.konversi && <p className="text-[11px] text-status-danger mt-1">{errors.konversi}</p>}
            </div>
          </>
        )}

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
