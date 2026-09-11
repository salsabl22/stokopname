import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import type {
  SatuanBarang,
  SatuanBarangFormErrors,
  SatuanBarangFormValues,
} from '../../../types/satuanBarang';
import { EMPTY_SATUAN_FORM } from '../../../types/satuanBarang';
import { isFormValid, validateSatuanBarangForm } from '../../../utils/validateSatuanBarang';

interface SatuanBarangFormModalProps {
  open: boolean;
  editingItem: SatuanBarang | null;
  onClose: () => void;
  onSubmit: (values: SatuanBarangFormValues) => Promise<void>;
}

export default function SatuanBarangFormModal({
  open,
  editingItem,
  onClose,
  onSubmit,
}: SatuanBarangFormModalProps) {
  const [values, setValues] = useState<SatuanBarangFormValues>(EMPTY_SATUAN_FORM);
  const [errors, setErrors] = useState<SatuanBarangFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEdit = Boolean(editingItem);

  useEffect(() => {
    if (!open) return;
    if (editingItem) {
      setValues({
        kodeSatuan: editingItem.kodeSatuan,
        namaSatuan: editingItem.namaSatuan,
        satuanDasar: editingItem.satuanDasar,
        nilaiKonversi: String(editingItem.nilaiKonversi),
        status: editingItem.status,
      });
    } else {
      setValues(EMPTY_SATUAN_FORM);
    }
    setErrors({});
    setSubmitError(null);
  }, [open, editingItem]);

  function handleChange<K extends keyof SatuanBarangFormValues>(
    key: K,
    value: SatuanBarangFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setSubmitError(null);
    const validationErrors = await validateSatuanBarangForm(values, editingItem?.id);
    setErrors(validationErrors);

    if (!isFormValid(validationErrors)) return;

    setSubmitting(true);
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan data.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit Satuan Barang' : 'Tambah Satuan Barang'}
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
      <div className="space-y-3.5">
        {submitError && (
          <div className="text-xs text-status-danger bg-status-dangerBg rounded-md px-3 py-2">
            {submitError}
          </div>
        )}

        <div>
          <label className="label-field">Kode Satuan</label>
          <input
            type="text"
            className="input-field"
            placeholder="Contoh: BAL"
            value={values.kodeSatuan}
            onChange={(e) => handleChange('kodeSatuan', e.target.value)}
            disabled={submitting}
          />
          {errors.kodeSatuan && (
            <p className="text-[11px] text-status-danger mt-1">{errors.kodeSatuan}</p>
          )}
        </div>

        <div>
          <label className="label-field">Nama Satuan</label>
          <input
            type="text"
            className="input-field"
            placeholder="Contoh: Bal"
            value={values.namaSatuan}
            onChange={(e) => handleChange('namaSatuan', e.target.value)}
            disabled={submitting}
          />
          {errors.namaSatuan && (
            <p className="text-[11px] text-status-danger mt-1">{errors.namaSatuan}</p>
          )}
        </div>

        <div>
          <label className="label-field">Satuan Dasar</label>
          <input
            type="text"
            className="input-field"
            placeholder="Contoh: PCS"
            value={values.satuanDasar}
            onChange={(e) => handleChange('satuanDasar', e.target.value)}
            disabled={submitting}
          />
          {errors.satuanDasar && (
            <p className="text-[11px] text-status-danger mt-1">{errors.satuanDasar}</p>
          )}
        </div>

        <div>
          <label className="label-field">
            Nilai Konversi{' '}
            <span className="text-slate-400 font-normal">
              (1 {values.kodeSatuan || 'satuan'} = ? {values.satuanDasar || 'satuan dasar'})
            </span>
          </label>
          <input
            type="number"
            min={0}
            step="any"
            className="input-field"
            placeholder="Contoh: 20"
            value={values.nilaiKonversi}
            onChange={(e) => handleChange('nilaiKonversi', e.target.value)}
            disabled={submitting}
          />
          {errors.nilaiKonversi && (
            <p className="text-[11px] text-status-danger mt-1">{errors.nilaiKonversi}</p>
          )}
        </div>

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
