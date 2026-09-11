import { useState, useEffect, useRef } from 'react';
import { RotateCcw, Plus, Check, Camera, X, Image, Upload } from 'lucide-react';
import { fetchExceptions, createException, resolveException } from '../../../services/pengendalianService';
import { useAuth } from '../../../contexts/AuthContext';

const ALASAN_PENGEMBALIAN = [
  'BARANG_RUSAK_DARI_PEMASOK',
  'KUALITAS_TIDAK_SESUAI_PESANAN',
  'JUMLAH_LEBIH_DARI_PO',
  'BARANG_KADALUWARSA',
  'SALAH_PRODUK_DIKIRIM',
  'KEMASAN_RUSAK',
  'LAINNYA',
];

function getApiBase(): string {
  const unit = localStorage.getItem('wms_unit_bisnis');
  const path = unit === 'KERIPIK_BUJANGAN' ? 'keripik-bujangan' : 'fotosnaps';
  return `${import.meta.env.VITE_API_URL || ''}/api/${path}`;
}

interface FotoItem {
  file: File;
  preview: string;
  keterangan: string;
  timestamp: string;
}

export default function PengembalianPemasokPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tipe: '', referensi: '', keterangan: '', alasanPengembalian: '' });
  const [fotos, setFotos] = useState<FotoItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchExceptions();
      // Filter hanya yang tipe pengembalian pemasok atau semua (backend sudah filter)
      setItems(data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const now = new Date();
    const timestamp = now.toLocaleString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFotos(prev => [...prev, {
          file,
          preview: ev.target?.result as string,
          keterangan: '',
          timestamp,
        }]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeFoto(idx: number) {
    setFotos(prev => prev.filter((_, i) => i !== idx));
  }

  function updateFotoKeterangan(idx: number, ket: string) {
    setFotos(prev => prev.map((f, i) => i === idx ? { ...f, keterangan: ket } : f));
  }

  async function uploadFotos(exceptionId: string): Promise<string[]> {
    const uploaded: string[] = [];
    for (const foto of fotos) {
      try {
        const formData = new FormData();
        formData.append('foto', foto.file);
        formData.append('keterangan', foto.keterangan);
        formData.append('timestamp', foto.timestamp);

        const res = await fetch(`${getApiBase()}/upload/foto-pengembalian/${exceptionId}`, {          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          uploaded.push(data.filePath);
        }
      } catch {
        // log upload error
      }
    }
    return uploaded;
  }

  async function handleCreate() {
    if (!form.tipe || !form.keterangan) {
      alert('Alasan pengembalian dan keterangan wajib diisi.');
      return;
    }
    setUploading(true);
    try {
      const exc = await createException({
        tipe: form.tipe,
        referensi: form.referensi,
        keterangan: form.keterangan,
        alasanPengembalian: form.alasanPengembalian,
      });

      // Upload fotos jika ada
      if (fotos.length > 0 && exc?.id) {
        await uploadFotos(exc.id);
      }

      setShowForm(false);
      setForm({ tipe: '', referensi: '', keterangan: '', alasanPengembalian: '' });
      setFotos([]);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Gagal menyimpan pengembalian ke supplier.');
    } finally {
      setUploading(false);
    }
  }

  async function handleResolve(id: string) {
    try {
      await resolveException(id);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Gagal menyelesaikan pengembalian.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="p-4 flex justify-between items-center border-b border-surface-border">
          <div>
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <RotateCcw size={15} className="text-amber-600" />
              Pengembalian ke Supplier
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Catat dan kelola pengembalian barang ke supplier dengan bukti foto kondisi barang
            </p>
          </div>
          <button
            type="button"
            className="btn-primary flex items-center gap-1.5 text-xs"
            onClick={() => setShowForm(true)}
          >
            <Plus size={14} /> Catat Pengembalian
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <div className="p-4 border-b border-surface-border bg-amber-50/30">
            <h3 className="text-xs font-semibold text-slate-700 mb-3">Form Pengembalian ke Supplier</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="label-field">Alasan Pengembalian *</label>
                <select
                  className="input-field"
                  value={form.tipe}
                  onChange={e => setForm(p => ({ ...p, tipe: e.target.value }))}
                >
                  <option value="">-- Pilih Alasan --</option>
                  {ALASAN_PENGEMBALIAN.map(t => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">No. PO / Referensi</label>
                <input
                  className="input-field"
                  value={form.referensi}
                  onChange={e => setForm(p => ({ ...p, referensi: e.target.value }))}
                  placeholder="e.g. PO-2026-0001"
                />
              </div>
              <div>
                <label className="label-field">Keterangan Detail *</label>
                <input
                  className="input-field"
                  value={form.keterangan}
                  onChange={e => setForm(p => ({ ...p, keterangan: e.target.value }))}
                  placeholder="Jelaskan kondisi barang yang dikembalikan..."
                />
              </div>
              <div>
                <label className="label-field">Catatan Tambahan</label>
                <input
                  className="input-field"
                  value={form.alasanPengembalian}
                  onChange={e => setForm(p => ({ ...p, alasanPengembalian: e.target.value }))}
                  placeholder="Catatan untuk supplier..."
                />
              </div>
            </div>

            {/* FOTO UPLOAD */}
            <div className="mb-3">
              <label className="label-field mb-2 flex items-center gap-1.5">
                <Camera size={13} /> Foto Bukti Kondisi Barang
              </label>
              <div className="flex gap-2 flex-wrap">
                {fotos.map((foto, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={foto.preview}
                      alt={`foto-${idx + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border border-surface-border"
                    />
                    {/* Timestamp overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[9px] px-1 py-0.5 rounded-b-lg text-center">
                      {foto.timestamp}
                    </div>
                    <button
                      type="button"
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFoto(idx)}
                    >
                      <X size={10} />
                    </button>
                    <input
                      type="text"
                      placeholder="Ket. foto..."
                      className="mt-1 w-24 text-[10px] border border-surface-border rounded px-1 py-0.5"
                      value={foto.keterangan}
                      onChange={e => updateFotoKeterangan(idx, e.target.value)}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-brand-400 hover:text-brand-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={18} />
                  <span className="text-[10px]">Tambah Foto</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
              <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                <Image size={11} /> Timestamp otomatis tercatat saat foto dipilih. Gunakan kamera untuk foto langsung.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary text-xs" onClick={() => { setShowForm(false); setFotos([]); }}>
                Batal
              </button>
              <button
                type="button"
                className="btn-primary text-xs flex items-center gap-1.5"
                onClick={handleCreate}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <><Check size={12} /> Simpan Pengembalian</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TABLE */}
        {loading ? (
          <div className="p-4 space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-9 bg-slate-100 rounded-md animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <RotateCcw size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">Tidak ada pengembalian ke supplier</p>
            <p className="text-xs text-slate-400 mt-1">Tekan "Catat Pengembalian" untuk mencatat</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase text-slate-400 border-b border-surface-border">
                  <th className="px-4 py-2.5 font-medium">No. EXC</th>
                  <th className="px-4 py-2.5 font-medium">Alasan</th>
                  <th className="px-4 py-2.5 font-medium">Referensi</th>
                  <th className="px-4 py-2.5 font-medium">Keterangan</th>
                  <th className="px-4 py-2.5 font-medium">Foto</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Waktu</th>
                  <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-600">{item.nomorEXC || '-'}</td>
                    <td className="px-4 py-2.5 text-xs font-medium text-amber-700">{item.tipe?.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{item.referensi || '-'}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600 max-w-[180px] truncate">{item.keterangan}</td>
                    <td className="px-4 py-2.5 text-xs">
                      {item.fotos?.length > 0 ? (
                        <div className="flex gap-1">
                          {item.fotos.slice(0, 3).map((f: any, i: number) => (
                            <img
                              key={i}
                              src={`${import.meta.env.VITE_API_URL || ''}/${f.filePath}`}
                              alt={`foto-${i + 1}`}
                              className="w-8 h-8 object-cover rounded border border-surface-border"
                              title={f.timestamp ? new Date(f.timestamp).toLocaleString('id-ID') : ''}
                            />
                          ))}
                          {item.fotos.length > 3 && (
                            <div className="w-8 h-8 bg-slate-100 rounded border border-surface-border flex items-center justify-center text-[10px] text-slate-500">
                              +{item.fotos.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-[10px]">Tidak ada</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        item.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {item.status === 'pending' ? 'Menunggu' : 'Selesai'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {item.status === 'pending' && (
                        <button
                          type="button"
                          className="btn-secondary p-1.5 text-green-600 flex items-center gap-1 text-xs"
                          onClick={() => handleResolve(item.id)}
                        >
                          <Check size={12} /> Selesai
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
