import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import type { BarcodeFormErrors, BarcodeFormValues } from '../../../types/barcode';
import { EMPTY_BARCODE_FORM } from '../../../types/barcode';
import { generateBarcodeCode, isBarcodeDuplicate } from '../../../services/barcodeService';
import { fetchProduk } from '../../../services/produkService';
import type { Produk } from '../../../types/produk';

interface BarcodeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: BarcodeFormValues, produk: Produk) => Promise<void>;
}

export default function BarcodeFormModal({ open, onClose, onSubmit }: BarcodeFormModalProps) {
  const [values, setValues] = useState<BarcodeFormValues>(EMPTY_BARCODE_FORM);
  const [errors, setErrors] = useState<BarcodeFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [produkOptions, setProdukOptions] = useState<Produk[]>([]);

  useEffect(() => {
    if (!open) return;
    setValues(EMPTY_BARCODE_FORM);
    setErrors({});
    fetchProduk().then((data) => setProdukOptions(data.filter((p) => p.status === 'aktif')));
  }, [open]);

  function handleGenerate() {
    setValues((prev) => ({ ...prev, kodeBarcode: generateBarcodeCode() }));
    setErrors((prev) => ({ ...prev, kodeBarcode: undefined }));
  }

  async function handleSubmit() {
    const nextErrors: BarcodeFormErrors = {};
    if (!values.kodeBarcode.trim()) nextErrors.kodeBarcode = 'Kode barcode wajib diisi atau di-generate.';
    if (!values.produkId) nextErrors.produkId = 'Produk wajib dipilih.';

    if (!nextErrors.kodeBarcode) {
      // Decision: Barcode sudah digunakan?
      const duplicate = await isBarcodeDuplicate(values.kodeBarcode);
      if (duplicate) {
        nextErrors.kodeBarcode = 'Barcode tidak dapat digunakan (sudah terdaftar).';
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const produk = produkOptions.find((p) => p.id === values.produkId);
    if (!produk) {
      setErrors({ produkId: 'Produk tidak ditemukan.' });
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values, produk);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title="Tambah Barcode"
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
          <label className="label-field">Kode Barcode</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input-field"
              placeholder="Ketik manual atau klik Generate"
              value={values.kodeBarcode}
              onChange={(e) => setValues((prev) => ({ ...prev, kodeBarcode: e.target.value }))}
              disabled={submitting}
            />
            <button
              type="button"
              className="btn-secondary shrink-0"
              onClick={handleGenerate}
              disabled={submitting}
            >
              <RefreshCw size={13} />
              Generate
            </button>
          </div>
          {errors.kodeBarcode && <p className="text-[11px] text-status-danger mt-1">{errors.kodeBarcode}</p>}
        </div>

        <div>
          <label className="label-field">Hubungkan dengan Produk</label>
          <select
            className="input-field"
            value={values.produkId}
            onChange={(e) => setValues((prev) => ({ ...prev, produkId: e.target.value }))}
            disabled={submitting}
          >
            <option value="">Pilih produk</option>
            {produkOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.kodeProduk} — {p.namaProduk}
              </option>
            ))}
          </select>
          {errors.produkId && <p className="text-[11px] text-status-danger mt-1">{errors.produkId}</p>}
          {produkOptions.length === 0 && (
            <p className="text-[11px] text-status-warning bg-status-warningBg rounded-md px-3 py-2 mt-1.5">
              Belum ada produk aktif. Tambahkan dulu di Data Master &gt; Produk.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
