import { useEffect, useMemo, useState } from 'react';
import { Search, Boxes, RefreshCcw, Trash2 } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { ToastContainer } from '../../../components/ui/Toast';
import { useToast } from '../../../utils/useToast';
import type { StokItem } from '../../../types/persediaan';
import { fetchPersediaan, deleteInventoryItem, resetAllInventory } from '../../../services/persediaanService';

export default function PersediaanPage() {
  const [data, setData] = useState<StokItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<StokItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const { toasts, showToast, dismissToast } = useToast();

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

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteInventoryItem(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
      showToast('success', `Stok ${deleteTarget.produkNama} berhasil dihapus.`);
    } catch (e: any) {
      showToast('error', e.message || 'Gagal menghapus.');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleResetAll() {
    setResetLoading(true);
    try {
      await resetAllInventory();
      setResetConfirmOpen(false);
      await loadData();
      showToast('success', 'Semua data persediaan & transaksi berhasil direset.');
    } catch (e: any) {
      showToast('error', e.message || 'Gagal mereset.');
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-surface-border">
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
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 text-red-600 border border-red-200 text-xs font-medium hover:bg-red-100 transition-colors"
            onClick={() => setResetConfirmOpen(true)}
          >
            <Trash2 size={13} />
            Reset Semua Data
          </button>
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
                <tr className="text-[11px] uppercase tracking-wide text-slate-800 border-b border-surface-border">
                  <th className="px-4 py-2.5 font-medium">Nama Produk</th>
                  <th className="px-4 py-2.5 font-medium">On Hand</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => {
                  const rendah = item.jumlahTersedia <= item.minimumStok;
                  return (
                    <tr key={item.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 text-xs text-slate-800">{item.produkNama}</td>
                      <td className="px-4 py-2.5 text-xs font-bold text-slate-800">
                        {item.jumlahTersedia} {item.satuan}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge tone={rendah ? 'danger' : 'success'}>
                          {rendah ? 'Stok Menipis' : 'Aktif'}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            aria-label="Hapus"
                            title="Hapus"
                            onClick={() => setDeleteTarget(item)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Item Persediaan"
        description={`Apakah Anda yakin ingin menghapus stok ${deleteTarget?.produkNama}? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <ConfirmDialog
        open={resetConfirmOpen}
        title="Reset Semua Data Persediaan"
        description="PERINGATAN: Tindakan ini akan menghapus SEMUA data persediaan, pergerakan stok, pesanan, dan transaksi secara permanen. Data tidak dapat dipulihkan. Lanjutkan?"
        confirmLabel="Ya, Reset Semua"
        onConfirm={handleResetAll}
        onCancel={() => setResetConfirmOpen(false)}
        loading={resetLoading}
      />
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
