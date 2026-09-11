import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Eye, Trash2, Truck, RefreshCcw } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import PemasokFormModal from './PemasokFormModal';
import PemasokDetailModal from './PemasokDetailModal';
import type { Pemasok, PemasokFormValues, StatusPemasok } from '../../../types/pemasok';
import {
  createPemasok,
  deletePemasok,
  fetchPemasok,
  updatePemasok,
} from '../../../services/pemasokService';

type StatusFilter = 'semua' | StatusPemasok;

export default function PemasokPage() {
  const [data, setData] = useState<Pemasok[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('semua');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Pemasok | null>(null);
  const [detailItem, setDetailItem] = useState<Pemasok | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Pemasok | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchPemasok());
    } catch {
      setError('Gagal memuat data supplier. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.kodePemasok.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaPemasok.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'semua' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  function openAddForm() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEditForm(item: Pemasok) {
    setEditingItem(item);
    setFormOpen(true);
  }

  async function handleFormSubmit(values: PemasokFormValues) {
    if (editingItem) {
      await updatePemasok(editingItem.id, values);
    } else {
      await createPemasok(values);
    }
    await loadData();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePemasok(deleteTarget.id);
      await loadData();
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-surface-border">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode atau nama supplier..."
              className="input-field pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              className="input-field w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="semua">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
            <button type="button" className="btn-primary" onClick={openAddForm}>
              <Plus size={14} />
              Tambah Supplier
            </button>
          </div>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : filteredData.length === 0 ? (
          <EmptyState hasFilter={Boolean(searchTerm) || statusFilter !== 'semua'} onAdd={openAddForm} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-surface-border">
                  <th className="px-4 py-2.5 font-medium">Kode</th>
                  <th className="px-4 py-2.5 font-medium">Nama Supplier</th>
                  <th className="px-4 py-2.5 font-medium">Kontak</th>
                  <th className="px-4 py-2.5 font-medium">Email</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-800">{item.kodePemasok}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{item.namaPemasok}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{item.kontak}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{item.email || '-'}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone={item.status === 'aktif' ? 'success' : 'neutral'}>
                        {item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton label="Detail" onClick={() => setDetailItem(item)}>
                          <Eye size={14} />
                        </IconButton>
                        <IconButton label="Edit" onClick={() => openEditForm(item)}>
                          <Pencil size={14} />
                        </IconButton>
                        <IconButton label="Hapus" tone="danger" onClick={() => setDeleteTarget(item)}>
                          <Trash2 size={14} />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PemasokFormModal
        open={formOpen}
        editingItem={editingItem}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <PemasokDetailModal open={Boolean(detailItem)} item={detailItem} onClose={() => setDetailItem(null)} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Supplier"
        description={`Data supplier "${deleteTarget?.namaPemasok ?? ''}" akan dihapus permanen dan tidak dapat dikembalikan. Lanjutkan?`}
        confirmLabel="Ya, Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  tone = 'default',
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
        tone === 'danger'
          ? 'text-slate-400 hover:text-status-danger hover:bg-status-dangerBg'
          : 'text-slate-400 hover:text-navy-800 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

function TableSkeleton() {
  return (
    <div className="p-4 space-y-2.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-9 rounded-md bg-slate-100 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ hasFilter, onAdd }: { hasFilter: boolean; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <Truck size={20} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">
        {hasFilter ? 'Data tidak ditemukan' : 'Belum ada supplier'}
      </p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">
        {hasFilter
          ? 'Coba ubah kata kunci pencarian atau filter status.'
          : 'Tambahkan supplier pertama untuk mulai mencatat pembelian.'}
      </p>
      {!hasFilter && (
        <button type="button" className="btn-primary mt-4" onClick={onAdd}>
          <Plus size={14} />
          Tambah Pemasok
        </button>
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-status-dangerBg flex items-center justify-center mb-3">
        <Truck size={20} className="text-status-danger" />
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
