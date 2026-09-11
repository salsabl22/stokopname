import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import type { GudangFormErrors, GudangFormValues } from '../../../types/gudang';
import { EMPTY_GUDANG_FORM } from '../../../types/gudang';
import { isKodeGudangDuplicate } from '../../../services/gudangService';

interface GudangFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: GudangFormValues) => Promise<void>;
}

export default function GudangFormModal({ open, onClose, onSubmit }: GudangFormModalProps) {
  const [values, setValues] = useState<GudangFormValues>(EMPTY_GUDANG_FORM);
  const [errors, setErrors] = useState<GudangFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(EMPTY_GUDANG_FORM);
      setErrors({});
    }
  }, [open]);

  function handleChange<K extends keyof GudangFormValues>(key: K, value: GudangFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    const nextErrors: GudangFormErrors = {};
    if (!values.kodeGudang.trim()) nextErrors.kodeGudang = 'Kode gudang wajib diisi.';
    if (!values.namaGudang.trim()) nextErrors.namaGudang = 'Nama gudang wajib diisi.';
    if (!values.alamat.trim()) nextErrors.alamat = 'Alamat wajib diisi.';

    if (!nextErrors.kodeGudang) {
      const duplicate = await isKodeGudangDuplicate(values.kodeGudang);
      if (duplicate) nextErrors.kodeGudang = 'Kode gudang sudah digunakan.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit(values);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title="Tambah Gudang"
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
        <div>
          <label className="label-field">Kode Gudang</label>
          <input
            type="text"
            className="input-field"
            placeholder="Contoh: GDG-01"
            value={values.kodeGudang}
            onChange={(e) => handleChange('kodeGudang', e.target.value)}
            disabled={submitting}
          />
          {errors.kodeGudang && <p className="text-[11px] text-status-danger mt-1">{errors.kodeGudang}</p>}
        </div>
        <div>
          <label className="label-field">Nama Gudang</label>
          <input
            type="text"
            className="input-field"
            placeholder="Contoh: Gudang Utama Bandung"
            value={values.namaGudang}
            onChange={(e) => handleChange('namaGudang', e.target.value)}
            disabled={submitting}
          />
          {errors.namaGudang && <p className="text-[11px] text-status-danger mt-1">{errors.namaGudang}</p>}
        </div>
        <div>
          <label className="label-field">Alamat</label>
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder="Alamat lengkap gudang"
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
