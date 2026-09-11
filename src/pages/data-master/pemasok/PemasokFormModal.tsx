import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import type { Pemasok, PemasokFormErrors, PemasokFormValues } from '../../../types/pemasok';
import { EMPTY_PEMASOK_FORM } from '../../../types/pemasok';
import { isPemasokFormValid, validatePemasokForm } from '../../../utils/validatePemasok';

interface PemasokFormModalProps {
  open: boolean;
  editingItem: Pemasok | null;
  onClose: () => void;
  onSubmit: (values: PemasokFormValues) => Promise<void>;
}

export default function PemasokFormModal({
  open,
  editingItem,
  onClose,
  onSubmit,
}: PemasokFormModalProps) {
  const [values, setValues] = useState<PemasokFormValues>(EMPTY_PEMASOK_FORM);
  const [errors, setErrors] = useState<PemasokFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEdit = Boolean(editingItem);

  useEffect(() => {
    if (!open) return;
    if (editingItem) {
      setValues({
        kodePemasok: editingItem.kodePemasok,
        namaPemasok: editingItem.namaPemasok,
        kontak: editingItem.kontak,
        email: editingItem.email,
        alamat: editingItem.alamat,
        status: editingItem.status,
      });
    } else {
      setValues(EMPTY_PEMASOK_FORM);
    }
    setErrors({});
    setSubmitError(null);
  }, [open, editingItem]);

  function handleChange<K extends keyof PemasokFormValues>(key: K, value: PemasokFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setSubmitError(null);
    const validationErrors = await validatePemasokForm(values, editingItem?.id);
    setErrors(validationErrors);
    if (!isPemasokFormValid(validationErrors)) return;

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
      title={isEdit ? 'Edit Supplier' : 'Tambah Supplier'}
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
          <label className="label-field">Kode Supplier</label>
          <input
            type="text"
            className="input-field"
            placeholder="Contoh: SUP-001"
            value={values.kodePemasok}
            onChange={(e) => handleChange('kodePemasok', e.target.value)}
            disabled={submitting}
          />
          {errors.kodePemasok && <p className="text-[11px] text-status-danger mt-1">{errors.kodePemasok}</p>}
        </div>

        <div>
          <label className="label-field">Nama Supplier</label>
          <input
            type="text"
            className="input-field"
            placeholder="Contoh: PT Sumber Pangan Sejahtera"
            value={values.namaPemasok}
            onChange={(e) => handleChange('namaPemasok', e.target.value)}
            disabled={submitting}
          />
          {errors.namaPemasok && <p className="text-[11px] text-status-danger mt-1">{errors.namaPemasok}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Kontak</label>
            <input
              type="text"
              className="input-field"
              placeholder="081234567890"
              value={values.kontak}
              onChange={(e) => handleChange('kontak', e.target.value)}
              disabled={submitting}
            />
            {errors.kontak && <p className="text-[11px] text-status-danger mt-1">{errors.kontak}</p>}
          </div>
          <div>
            <label className="label-field">
              Email <span className="text-slate-400 font-normal">(opsional)</span>
            </label>
            <input
              type="email"
              className="input-field"
              placeholder="nama@perusahaan.com"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={submitting}
            />
            {errors.email && <p className="text-[11px] text-status-danger mt-1">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label className="label-field">Alamat</label>
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder="Alamat lengkap supplier"
            value={values.alamat}
            onChange={(e) => handleChange('alamat', e.target.value)}
            disabled={submitting}
          />
          {errors.alamat && <p className="text-[11px] text-status-danger mt-1">{errors.alamat}</p>}
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
