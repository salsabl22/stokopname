import { useEffect, useRef, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import type { KondisiBarangRetur, Retur } from '../../../types/retur';

interface PemeriksaanReturModalProps {
  open: boolean;
  retur: Retur | null;
  onClose: () => void;
  onSubmit: (kondisi: KondisiBarangRetur, catatan?: string, foto?: string) => Promise<void>;
}

const KONDISI_OPTIONS: { value: KondisiBarangRetur; label: string; hint: string; tone: string }[] = [
  {
    value: 'baik',
    label: 'Baik',
    hint: 'Stok akan dikembalikan ke Persediaan.',
    tone: 'border-status-success text-status-success bg-status-successBg',
  },
  {
    value: 'rusak',
    label: 'Rusak',
    hint: 'Barang akan dipindahkan ke Karantina.',
    tone: 'border-status-danger text-status-danger bg-status-dangerBg',
  },
  {
    value: 'ditolak',
    label: 'Ditolak',
    hint: 'Barang akan diretur balik ke Supplier.',
    tone: 'border-status-danger text-status-danger bg-status-dangerBg',
  },
];

export default function PemeriksaanReturModal({ open, retur, onClose, onSubmit }: PemeriksaanReturModalProps) {
  const [kondisi, setKondisi] = useState<KondisiBarangRetur | ''>('');
  const [catatan, setCatatan] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setKondisi('');
    setCatatan('');
    setError(null);
    setFotoPreview(null);
  }, [open]);

  if (!retur) return null;

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto maksimal 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setFotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function removeFoto() {
    setFotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit() {
    if (!kondisi) {
      setError('Pilih kondisi barang terlebih dahulu.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(kondisi, catatan.trim() || undefined, fotoPreview || undefined);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  const selected = KONDISI_OPTIONS.find((o) => o.value === kondisi);

  return (
    <Modal
      title={`Periksa Retur — ${retur.nomorRetur}`}
      open={open}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Batal
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Memproses...' : 'Simpan Hasil Periksa'}
          </button>
        </>
      }
    >
      <div className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
        {error && (
          <div className="text-xs text-status-danger bg-status-dangerBg rounded-md px-3 py-2">{error}</div>
        )}

        {/* Info retur */}
        {retur.fotoKerusakan && (
          <div className="rounded-lg border border-surface-border overflow-hidden">
            <p className="text-[11px] text-slate-500 px-3 py-1.5 bg-slate-50 border-b border-surface-border">
              Foto kerusakan dari pengajuan retur
            </p>
            <img
              src={retur.fotoKerusakan}
              alt="Foto dari pengajuan"
              className="w-full max-h-40 object-contain bg-white"
            />
          </div>
        )}

        <div>
          <label className="label-field">Kondisi Barang</label>
          <div className="grid grid-cols-3 gap-2">
            {KONDISI_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`px-2 py-2 rounded-md text-xs font-medium border transition-colors ${
                  kondisi === opt.value ? opt.tone : 'border-surface-border text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => setKondisi(opt.value)}
                disabled={submitting}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {selected && <p className="text-[11px] text-slate-500 mt-1.5">{selected.hint}</p>}
        </div>

        <div>
          <label className="label-field">
            Catatan Pemeriksaan <span className="text-slate-400 font-normal">(opsional)</span>
          </label>
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder="Catatan hasil pemeriksaan..."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            disabled={submitting}
          />
        </div>

        {/* Upload Foto Kerusakan (saat pemeriksaan) */}
        <div>
          <label className="label-field">
            Foto Bukti Pemeriksaan <span className="text-slate-400 font-normal">(opsional)</span>
          </label>
          {fotoPreview ? (
            <div className="relative rounded-lg overflow-hidden border border-surface-border">
              <img
                src={fotoPreview}
                alt="Foto pemeriksaan"
                className="w-full max-h-40 object-contain bg-slate-50"
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
              className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-colors"
              onClick={() => !submitting && fileInputRef.current?.click()}
            >
              <ImageIcon size={22} className="mx-auto text-slate-300 mb-1.5" />
              <p className="text-xs text-slate-500">Upload foto bukti pemeriksaan kerusakan</p>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                disabled={submitting}
              >
                <Upload size={12} />
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
        </div>
      </div>
    </Modal>
  );
}
