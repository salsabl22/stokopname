import { useEffect, useMemo, useState } from 'react';
import { Search, Boxes, RefreshCcw } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import type { StokItem } from '../../../types/persediaan';
import { fetchPersediaan } from '../../../services/persediaanService';

export default function PersediaanPage() {
  const [data, setData] = useState<StokItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchPersediaan());
    } catch {
      setError('Gagal memuat data persediaan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(
    () =>
      data.filter(
        (item) =>
          item.kodeBarcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.produkNama.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [data, searchTerm],
  );

  return (
    <div>
      <div className="card">
        <div className="p-4 border-b border-surface-border">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode barcode atau nama produk..."
              className="input-field pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : filteredData.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-surface-border">
                  <th className="px-4 py-2.5 font-medium">Kode Barcode</th>
                  <th className="px-4 py-2.5 font-medium">Nama Produk</th>
                  <th className="px-4 py-2.5 font-medium">Batch</th>
                  <th className="px-4 py-2.5 font-medium text-blue-600">On Hand</th>
                  <th className="px-4 py-2.5 font-medium text-emerald-600">Tersedia (Avail)</th>
                  <th className="px-4 py-2.5 font-medium text-amber-600">Dialokasikan</th>
                  <th className="px-4 py-2.5 font-medium text-rose-600">Karantina/Waste</th>
                  <th className="px-4 py-2.5 font-medium">Lokasi</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => {
                  const rendah = item.jumlahTersedia <= item.minimumStok;
                  return (
                    <tr key={item.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 text-xs font-medium text-slate-800 font-mono">
                        {item.kodeBarcode || '-'}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-600">{item.produkNama}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">
                        {item.batchNomor || '-'}
                      </td>
                      <td className="px-4 py-2.5 text-xs font-bold text-slate-800">
                        {item.jumlahTersedia + item.jumlahDialokasikan + item.jumlahKarantina} {item.satuan}
                      </td>
                      <td className="px-4 py-2.5 text-xs font-medium text-emerald-600">
                        {item.jumlahTersedia} {item.satuan}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-amber-600">
                        {item.jumlahDialokasikan} {item.satuan}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-rose-600 flex flex-col gap-0.5">
                        {item.jumlahKarantina > 0 && <span>KRT: {item.jumlahKarantina}</span>}
                        {item.jumlahWaste > 0 && <span>WST: {item.jumlahWaste}</span>}
                        {item.jumlahKarantina === 0 && item.jumlahWaste === 0 && <span className="text-slate-400">-</span>}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-500 max-w-xs truncate">
                        {item.lokasiPenyimpanan || '-'}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge tone={rendah ? 'danger' : 'success'}>
                          {rendah ? 'Stok Menipis' : 'Aktif'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="p-4 space-y-2.5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-9 rounded-md bg-slate-100 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <Boxes size={20} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">Belum ada data persediaan</p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">
        Persediaan akan terisi otomatis setelah barang selesai melalui tahap Penyimpanan.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-status-dangerBg flex items-center justify-center mb-3">
        <Boxes size={20} className="text-status-danger" />
      </div>
      <p className="text-sm font-medium text-slate-700">Terjadi kesalahan</p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">{message}</p>
      <button type="button" className="btn-secondary mt-4" onClick={onRetry}>
        <RefreshCcw size={14} />
        Coba Lagi
      </button>
    </div>
  );
}
