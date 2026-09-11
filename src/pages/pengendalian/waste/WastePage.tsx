import { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { fetchWastes, createWaste } from '../../../services/pengendalianService';
import { fetchProduk } from '../../../services/produkService';

export default function WastePage() {
  const [wastes, setWastes] = useState<any[]>([]);
  const [_loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ produkId: '', batchId: '', lokasiId: '', petugasId: '', jumlah: '', satuan: 'PCS', alasan: '', referensi: '' });
  const [produkList, setProdukList] = useState<any[]>([]);

  async function loadData() {
    setLoading(true);
    try {
      const [wasteRes, produkRes] = await Promise.all([
        fetchWastes(),
        fetchProduk(),
      ]);
      setWastes(wasteRes);
      setProdukList(produkRes);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleCreate() {
    try {
      await createWaste({
        produkId: form.produkId,
        batchId: form.batchId || null,
        lokasiId: form.lokasiId || null,
        petugasId: form.petugasId || null,
        jumlah: Number(form.jumlah),
        satuan: form.satuan,
        alasan: form.alasan,
        referensi: form.referensi,
      });
      setShowForm(false);
      setForm({ produkId: '', batchId: '', lokasiId: '', petugasId: '', jumlah: '', satuan: 'PCS', alasan: '', referensi: '' });
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Gagal mencatat waste.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="p-4 flex justify-between items-center border-b border-surface-border">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Waste / Barang Tidak Layak</h2>
            <p className="text-xs text-slate-400 mt-0.5">Catat barang yang dinyatakan waste dan kurangi dari inventory</p>
          </div>
          <button
            type="button"
            className="btn-primary flex items-center gap-1.5 text-xs"
            onClick={() => { setShowForm(true); loadData(); }}
          >
            <Plus size={14} /> Catat Waste
          </button>
        </div>

        {showForm && (
          <div className="p-4 border-b border-surface-border bg-red-50/30">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="label-field">Produk</label>
                <select className="input-field" value={form.produkId} onChange={e => setForm(p => ({ ...p, produkId: e.target.value }))}>
                  <option value="">-- Pilih Produk --</option>
                  {produkList.map(pr => <option key={pr.id} value={pr.id}>{pr.namaProduk}</option>)}
                </select>
              </div>
              <div>
                <label className="label-field">Jumlah</label>
                <input type="number" className="input-field" value={form.jumlah} onChange={e => setForm(p => ({ ...p, jumlah: e.target.value }))} min="1" />
              </div>
              <div>
                <label className="label-field">Alasan</label>
                <input className="input-field" value={form.alasan} onChange={e => setForm(p => ({ ...p, alasan: e.target.value }))} placeholder="e.g. Kadaluwarsa" />
              </div>
              <div>
                <label className="label-field">Batch ID (Opsional)</label>
                <input className="input-field" value={form.batchId} onChange={e => setForm(p => ({ ...p, batchId: e.target.value }))} placeholder="ID Batch" />
              </div>
              <div>
                <label className="label-field">Lokasi ID (Opsional)</label>
                <input className="input-field" value={form.lokasiId} onChange={e => setForm(p => ({ ...p, lokasiId: e.target.value }))} placeholder="ID Lokasi" />
              </div>
              <div>
                <label className="label-field">Petugas ID (Opsional)</label>
                <input className="input-field" value={form.petugasId} onChange={e => setForm(p => ({ ...p, petugasId: e.target.value }))} placeholder="ID Petugas" />
              </div>
              <div>
                <label className="label-field">Satuan</label>
                <input className="input-field" value={form.satuan} onChange={e => setForm(p => ({ ...p, satuan: e.target.value }))} placeholder="PCS" />
              </div>
              <div>
                <label className="label-field">Referensi</label>
                <input className="input-field" value={form.referensi} onChange={e => setForm(p => ({ ...p, referensi: e.target.value }))} placeholder="No. PO/Retur" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button type="button" className="btn-secondary text-xs" onClick={() => setShowForm(false)}>Batal</button>
              <button type="button" className="btn-primary bg-red-600 hover:bg-red-700 text-xs border-red-600" onClick={handleCreate}>Simpan Waste</button>
            </div>
          </div>
        )}

        {wastes.length === 0 && !showForm ? (
          <div className="p-12 text-center">
            <Trash2 size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">Belum ada catatan waste</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase text-slate-400 border-b border-surface-border">
                  <th className="px-4 py-2.5 font-medium">No. Waste</th>
                  <th className="px-4 py-2.5 font-medium">Produk</th>
                  <th className="px-4 py-2.5 font-medium">Batch</th>
                  <th className="px-4 py-2.5 font-medium">Jumlah</th>
                  <th className="px-4 py-2.5 font-medium">Alasan</th>
                  <th className="px-4 py-2.5 font-medium">Referensi</th>
                  <th className="px-4 py-2.5 font-medium">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {wastes.map(w => (
                  <tr key={w.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-600">{w.nomorWaste}</td>
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-800">{w.produk?.namaProduk || '-'}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">{w.batch?.nomorBatch || '-'}</td>
                    <td className="px-4 py-2.5 text-xs text-status-danger font-medium">-{w.jumlah} {w.satuan}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{w.alasan}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{w.referensi || '-'}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-400">{new Date(w.createdAt).toLocaleString('id-ID')}</td>
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
