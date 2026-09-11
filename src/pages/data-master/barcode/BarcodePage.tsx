import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Trash2, ScanLine, RefreshCcw } from 'lucide-react';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { ToastContainer } from '../../../components/ui/Toast';
import { useToast } from '../../../utils/useToast';
import BarcodeFormModal from './BarcodeFormModal';
import type { BarcodeItem, BarcodeFormValues } from '../../../types/barcode';
import { createBarcode, deleteBarcode, fetchBarcode } from '../../../services/barcodeService';
import type { Produk } from '../../../types/produk';

export default function BarcodePage() {
  const [data, setData] = useState<BarcodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BarcodeItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toasts, showToast, dismissToast } = useToast();

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchBarcode());
    } catch {
      setError('Gagal memuat data barcode. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        item.kodeBarcode.includes(searchTerm) ||
        item.produkNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.produkKode.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [data, searchTerm]);

  async function handleFormSubmit(values: BarcodeFormValues, produk: Produk) {
    await createBarcode(values.kodeBarcode, produk.id, produk.kodeProduk, produk.namaProduk);
    await loadData();
    showToast('success', 'Barcode berhasil disimpan dan dihubungkan dengan produk.');
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBarcode(deleteTarget.id);
      await loadData();
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
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
              placeholder="Cari kode barcode atau produk..."
              className="input-field pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="button" className="btn-primary" onClick={() => setFormOpen(true)}>
            <Plus size={14} />
            Tambah Barcode
          </button>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : filteredData.length === 0 ? (
          <EmptyState hasFilter={Boolean(searchTerm)} onAdd={() => setFormOpen(true)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-surface-border">
                  <th className="px-4 py-2.5 font-medium">Kode Barcode</th>
                  <th className="px-4 py-2.5 font-medium">Kode Produk</th>
                  <th className="px-4 py-2.5 font-medium">Nama Produk</th>
                  <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-800 font-mono">
                      {item.kodeBarcode}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{item.produkKode}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{item.produkNama}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          aria-label="Hapus"
                          title="Hapus"
                          onClick={() => setDeleteTarget(item)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-status-danger hover:bg-status-dangerBg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BarcodeFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleFormSubmit} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Barcode"
        description={`Barcode "${deleteTarget?.kodeBarcode ?? ''}" akan dihapus permanen. Lanjutkan?`}
        confirmLabel="Ya, Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
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

function EmptyState({ hasFilter, onAdd }: { hasFilter: boolean; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <ScanLine size={20} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">
        {hasFilter ? 'Data tidak ditemukan' : 'Belum ada barcode'}
      </p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">
        {hasFilter
          ? 'Coba ubah kata kunci pencarian.'
          : 'Tambahkan barcode pertama dan hubungkan dengan produk.'}
      </p>
      {!hasFilter && (
        <button type="button" className="btn-primary mt-4" onClick={onAdd}>
          <Plus size={14} />
          Tambah Barcode
        </button>
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-status-dangerBg flex items-center justify-center mb-3">
        <ScanLine size={20} className="text-status-danger" />
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
