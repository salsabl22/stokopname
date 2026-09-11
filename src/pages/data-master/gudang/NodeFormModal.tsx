import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';

interface NodeFormModalProps {
  open: boolean;
  title: string;
  kodeLabel: string;
  namaLabel: string;
  kodePlaceholder?: string;
  namaPlaceholder?: string;
  onClose: () => void;
  onSubmit: (kode: string, nama: string) => Promise<void>;
  checkDuplicate: (kode: string) => Promise<boolean>;
  duplicateMessage: string;
}

export default function NodeFormModal({
  open,
  title,
  kodeLabel,
  namaLabel,
  kodePlaceholder,
  namaPlaceholder,
  onClose,
  onSubmit,
  checkDuplicate,
  duplicateMessage,
}: NodeFormModalProps) {
  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [kodeError, setKodeError] = useState<string | null>(null);
  const [namaError, setNamaError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setKode('');
      setNama('');
      setKodeError(null);
      setNamaError(null);
    }
  }, [open]);

  async function handleSubmit() {
    let hasError = false;
    if (!kode.trim()) {
      setKodeError(`${kodeLabel} wajib diisi.`);
      hasError = true;
    } else {
      setKodeError(null);
    }
    if (!nama.trim()) {
      setNamaError(`${namaLabel} wajib diisi.`);
      hasError = true;
    } else {
      setNamaError(null);
    }
    if (hasError) return;

    const duplicate = await checkDuplicate(kode);
    if (duplicate) {
      setKodeError(duplicateMessage);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(kode, nama);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={title}
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
          <label className="label-field">{kodeLabel}</label>
          <input
            type="text"
            className="input-field"
            placeholder={kodePlaceholder}
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            disabled={submitting}
          />
          {kodeError && <p className="text-[11px] text-status-danger mt-1">{kodeError}</p>}
        </div>
        <div>
          <label className="label-field">{namaLabel}</label>
          <input
            type="text"
            className="input-field"
            placeholder={namaPlaceholder}
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            disabled={submitting}
          />
          {namaError && <p className="text-[11px] text-status-danger mt-1">{namaError}</p>}
        </div>
      </div>
    </Modal>
  );
}
