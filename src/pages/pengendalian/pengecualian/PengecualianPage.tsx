import { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Check } from 'lucide-react';
import { fetchExceptions, createException, resolveException } from '../../../services/pengendalianService';

const TIPE_EXCEPTION = [
  'BARCODE_TIDAK_DIKENAL',
  'BARANG_TIDAK_SESUAI_PO',
  'JUMLAH_KURANG',
  'JUMLAH_LEBIH',
  'LOKASI_PENUH',
  'BARANG_RUSAK',
  'SATUAN_TIDAK_SESUAI',
  'KONVERSI_TIDAK_VALID',
  'STOK_TIDAK_CUKUP',
];

export default function PengecualianPage() {
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [_loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tipe: '', referensi: '', keterangan: '' });

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchExceptions();
      setExceptions(data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleCreate() {
    try {
      await createException(form);
      setShowForm(false);
      setForm({ tipe: '', referensi: '', keterangan: '' });
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Gagal menyimpan exception.');
    }
  }

  async function handleResolve(id: string) {
    try {
      await resolveException(id);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Gagal menyelesaikan exception.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="p-4 flex justify-between items-center border-b border-surface-border">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Pengecualian / Exception</h2>
            <p className="text-xs text-slate-400 mt-0.5">Catat dan selesaikan masalah/pengecualian operasional</p>
          </div>
          <button
            type="button"
            className="btn-primary flex items-center gap-1.5 text-xs"
            onClick={() => setShowForm(true)}
          >
            <Plus size={14} /> Tambah Exception
          </button>
        </div>

        {showForm && (
          <div className="p-4 border-b border-surface-border bg-amber-50/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="label-field">Tipe Exception</label>
                <select className="input-field" value={form.tipe} onChange={e => setForm(p => ({ ...p, tipe: e.target.value }))}>
                  <option value="">-- Pilih Tipe --</option>
                  {TIPE_EXCEPTION.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="label-field">Referensi (No. PO/SO)</label>
                <input className="input-field" value={form.referensi} onChange={e => setForm(p => ({ ...p, referensi: e.target.value }))} placeholder="e.g. PO-2026-0001" />
              </div>
              <div>
                <label className="label-field">Keterangan</label>
                <input className="input-field" value={form.keterangan} onChange={e => setForm(p => ({ ...p, keterangan: e.target.value }))} placeholder="Jelaskan masalah..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button type="button" className="btn-secondary text-xs" onClick={() => setShowForm(false)}>Batal</button>
              <button type="button" className="btn-primary text-xs" onClick={handleCreate}>Simpan</button>
            </div>
          </div>
        )}

        {exceptions.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">Tidak ada exception aktif</p>
            <p className="text-xs text-slate-400 mt-1">Tekan "Tambah Exception" jika ada masalah operasional</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase text-slate-400 border-b border-surface-border">
                  <th className="px-4 py-2.5 font-medium">Tipe</th>
                  <th className="px-4 py-2.5 font-medium">Referensi</th>
                  <th className="px-4 py-2.5 font-medium">Keterangan</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Waktu</th>
                  <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {exceptions.map(ex => (
                  <tr key={ex.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-xs font-medium text-amber-700">{ex.tipe?.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{ex.referensi || '-'}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600 max-w-[200px] truncate">{ex.keterangan}</td>
                    <td className="px-4 py-2.5 text-xs">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        ex.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {ex.status === 'pending' ? 'Menunggu' : 'Selesai'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-400">{new Date(ex.createdAt).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-2.5 text-right">
                      {ex.status === 'pending' && (
                        <button type="button" className="btn-secondary p-1.5 text-green-600 flex items-center gap-1 text-xs" onClick={() => handleResolve(ex.id)}>
                          <Check size={12} /> Selesaikan
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
