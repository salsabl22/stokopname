import { useEffect, useMemo, useState } from 'react';
import { Search, TrendingUp, RefreshCcw, ArrowDownRight, ArrowUpRight, ArrowRightLeft } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import { fetchStockMovements } from '../../../services/stockMovementService';
import type { StockMovement, TipeMovement } from '../../../types/stockMovement';
import { TIPE_MOVEMENT_LABEL, TIPE_MOVEMENT_TONE } from '../../../types/stockMovement';

export default function PergerakanStokPage() {
  const [data, setData] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipe, setFilterTipe] = useState<string>('all');

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchStockMovements());
    } catch {
      setError('Gagal memuat histori pergerakan stok.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((m) => {
      const matchSearch =
        m.produkNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.produkKode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.referensi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.sumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.tujuan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.keterangan ?? '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchTipe = filterTipe === 'all' || m.tipe === filterTipe;
      return matchSearch && matchTipe;
    });
  }, [data, searchTerm, filterTipe]);

  const summary = useMemo(() => {
    const total = data.length;
    const masuk = data.filter((m) => ['MASUK', 'RETUR'].includes(m.tipe)).length;
    const keluar = data.filter((m) => ['KELUAR', 'WASTE'].includes(m.tipe)).length;
    const internal = data.filter((m) => ['PINDAH', 'ADJUSTMENT'].includes(m.tipe)).length;
    return { total, masuk, keluar, internal };
  }, [data]);

  return (
    <div className="space-y-4">
      {/* SUMMARY BADGES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Total Mutasi Tercatat</span>
            <span className="text-xl font-bold text-slate-800 mt-0.5 block">{summary.total}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <TrendingUp size={16} />
          </div>
        </div>

        <div className="card p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Aktivitas Masuk</span>
            <span className="text-xl font-bold text-emerald-600 mt-0.5 block">{summary.masuk}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowDownRight size={16} />
          </div>
        </div>

        <div className="card p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Aktivitas Keluar</span>
            <span className="text-xl font-bold text-rose-600 mt-0.5 block">{summary.keluar}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowUpRight size={16} />
          </div>
        </div>

        <div className="card p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Audit / Transfer Internal</span>
            <span className="text-xl font-bold text-indigo-600 mt-0.5 block">{summary.internal}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ArrowRightLeft size={16} />
          </div>
        </div>
      </div>

      {/* FILTER & TABLE */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-surface-border">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari produk, referensi, atau lokasi..."
              className="input-field pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              className="input-field text-xs py-1.5 px-2.5 w-auto"
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value)}
            >
              <option value="all">Semua Tipe Mutasi</option>
              <option value="MASUK">Barang Masuk</option>
              <option value="KELUAR">Barang Keluar</option>
              <option value="PINDAH">Perpindahan Lokasi</option>
              <option value="ADJUSTMENT">Penyesuaian Stok</option>
              <option value="WASTE">Waste</option>
              <option value="RETUR">Retur</option>
            </select>

            <button type="button" className="btn-secondary py-1.5 px-2.5 text-xs" onClick={loadData}>
              <RefreshCcw size={13} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-4 space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 rounded-md bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-slate-700">{error}</p>
            <button type="button" className="btn-secondary mt-3 inline-flex items-center gap-1.5" onClick={loadData}>
              <RefreshCcw size={14} /> Coba Lagi
            </button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <TrendingUp size={20} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700">Tidak ada mutasi stok yang sesuai</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Mutasi baru akan dicatat secara otomatis ketika ada transaksi PO, Pengambilan, Transfer, atau Opname.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-surface-border bg-slate-50/50">
                  <th className="px-4 py-2.5 font-medium">Waktu Transaksi</th>
                  <th className="px-4 py-2.5 font-medium">Tipe</th>
                  <th className="px-4 py-2.5 font-medium">Produk</th>
                  <th className="px-4 py-2.5 font-medium">Jumlah</th>
                  <th className="px-4 py-2.5 font-medium">Satuan</th>
                  <th className="px-4 py-2.5 font-medium">Alur Mutasi (Dari &rarr; Ke)</th>
                  <th className="px-4 py-2.5 font-medium">Referensi / No. Dok</th>
                  <th className="px-4 py-2.5 font-medium">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((m) => (
                  <tr key={m.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(m.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })},{' '}
                      {new Date(m.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={TIPE_MOVEMENT_TONE[m.tipe as TipeMovement]}>
                        {TIPE_MOVEMENT_LABEL[m.tipe as TipeMovement] || m.tipe}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-800">
                      {m.produkNama} <span className="text-slate-400 font-normal">({m.produkKode})</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-bold text-slate-800">
                      {m.jumlah}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-800">
                      {m.satuan}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600 max-w-xs">
                      <span className="text-slate-500">{m.sumber}</span> &rarr;{' '}
                      <span className="font-medium text-slate-700">{m.tujuan}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono font-medium text-slate-700">{m.referensi}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500 max-w-xs truncate">{m.keterangan || '-'}</td>
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
