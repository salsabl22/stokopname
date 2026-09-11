import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import type { Cabang, CabangFormErrors, CabangFormValues } from '../../../types/cabang';
import { EMPTY_CABANG_FORM } from '../../../types/cabang';
import { isCabangFormValid, validateCabangForm } from '../../../utils/validateCabang';

interface CabangFormModalProps {
  open: boolean;
  editingItem: Cabang | null;
  onClose: () => void;
  onSubmit: (values: CabangFormValues) => Promise<void>;
}

export default function CabangFormModal({
  open,
  editingItem,
  onClose,
  onSubmit,
}: CabangFormModalProps) {
  const [values, setValues] = useState<CabangFormValues>(EMPTY_CABANG_FORM);
  const [errors, setErrors] = useState<CabangFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEdit = Boolean(editingItem);

  useEffect(() => {
    if (!open) return;
    if (editingItem) {
      setValues({
        kodeCabang: editingItem.kodeCabang,
        namaCabang: editingItem.namaCabang,
        alamat: editingItem.alamat,
        telepon: editingItem.telepon,
        status: editingItem.status,
      });
    } else {
      setValues(EMPTY_CABANG_FORM);
    }
    setErrors({});
    setSubmitError(null);
  }, [open, editingItem]);

  function handleChange<K extends keyof CabangFormValues>(key: K, value: CabangFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setSubmitError(null);
    // Urutan sesuai flow map: cek kode duplikat dulu, baru cek kelengkapan.
    const validationErrors = await validateCabangForm(values, editingItem?.id);
    setErrors(validationErrors);
    if (!isCabangFormValid(validationErrors)) return;

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
      title={isEdit ? 'Edit Cabang' : 'Tambah Cabang'}
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
        {(submitError || errors.general) && (
          <div className="text-xs text-status-danger bg-status-dangerBg rounded-md px-3 py-2">
            {submitError || errors.general}
          </div>
        )}

        <div>
          <label className="label-field">Kode Cabang</label>
          <input
            type="text"
            className="input-field"
            placeholder="Contoh: CBG-BDG"
            value={values.kodeCabang}
            onChange={(e) => handleChange('kodeCabang', e.target.value)}
            disabled={submitting}
          />
          {errors.kodeCabang && <p className="text-[11px] text-status-danger mt-1">{errors.kodeCabang}</p>}
        </div>

        <div>
          <label className="label-field">Nama Cabang</label>
          <input
            type="text"
            className="input-field"
            placeholder="Contoh: Cabang Bandung"
            value={values.namaCabang}
            onChange={(e) => handleChange('namaCabang', e.target.value)}
            disabled={submitting}
          />
          {errors.namaCabang && <p className="text-[11px] text-status-danger mt-1">{errors.namaCabang}</p>}
        </div>

        <div>
          <label className="label-field">Telepon</label>
          <input
            type="text"
            className="input-field"
            placeholder="0221234567"
            value={values.telepon}
            onChange={(e) => handleChange('telepon', e.target.value)}
            disabled={submitting}
          />
          {errors.telepon && <p className="text-[11px] text-status-danger mt-1">{errors.telepon}</p>}
        </div>

        <div>
          <label className="label-field">Alamat</label>
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder="Alamat lengkap cabang"
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
