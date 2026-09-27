import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Eye, Trash2, PackageX, RefreshCcw, FileDown, FileSpreadsheet } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import ProdukFormModal from './ProdukFormModal';
import ProdukDetailModal from './ProdukDetailModal';
import type { ProdukFormValues, StatusProduk } from '../../../types/produk';
import { createProduk, deleteProduk, fetchProduk, updateProduk } from '../../../services/produkService';
import { useBusinessUnit } from '../../../contexts/BusinessUnitContext';
import { exportToExcel, exportToPdf } from '../../../utils/exportUtils';

type StatusFilter = 'semua' | StatusProduk;

export default function ProdukPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('semua');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [detailItem, setDetailItem] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { activeUnit, activeUnitInfo } = useBusinessUnit();

  /** Format konversi ke bentuk human-readable, e.g. "1 Bal = 50 PCS" */
  function formatKonversi(item: any): string {
    if (!item.satuanPembelian || !item.satuan) return String(item.konversi ?? '-');
    const jumlah = item.konversi ?? 1;
    const satuanBeli = item.satuanPembelian?.kode || item.satuanPembelian?.nama || '';
    const satuanDasar = item.satuan?.kode || item.satuan?.nama || '';
    if (!satuanBeli || !satuanDasar || satuanBeli === satuanDasar) return String(jumlah);
    return `1 ${satuanBeli} = ${jumlah} ${satuanDasar}`;
  }



  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchProduk({ unitBisnis: activeUnit }));
    } catch {
      setError('Gagal memuat data produk. Pastikan backend berjalan.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [activeUnit]); // reload saat unit bisnis berganti

  // Map data untuk export (flatten satuan object)
  const filteredData = useMemo(() => {
    return data
      .filter((item) => {
        const matchesSearch =
          item.kodeProduk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.namaProduk?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'semua' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .map(item => ({ ...item }));
  }, [data, searchTerm, statusFilter]);

  function openAddForm() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEditForm(item: any) {
    setEditingItem(item);
    setFormOpen(true);
  }

  async function handleFormSubmit(values: ProdukFormValues) {
    if (editingItem) {
      await updateProduk(editingItem.id, { ...values, unitBisnis: activeUnit });
    } else {
      await createProduk({ ...values, unitBisnis: activeUnit });
    }
    await loadData();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduk(deleteTarget.id);
      await loadData();
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  function handleExportExcel() {
    exportToExcel(
      filteredData,
      [
        { header: 'Kode Produk', key: 'kodeProduk', width: 15 },
        { header: 'Nama Produk', key: 'namaProduk', width: 30 },
        { header: 'Konversi', key: 'konversi', width: 20 },
        { header: 'Status', key: 'status', width: 10 },
      ],
      { filename: `Produk_${activeUnit}`, title: 'Data Produk', unitBisnis: activeUnitInfo.label },
    );
  }

  function handleExportPdf() {
    exportToPdf(
      filteredData,
      [
        { header: 'Kode', key: 'kodeProduk', width: 15 },
        { header: 'Nama Produk', key: 'namaProduk', width: 30 },
        { header: 'Konversi', key: 'konversi', width: 20 },
        { header: 'Status', key: 'status', width: 10 },
      ],
      { filename: `Produk_${activeUnit}`, title: 'Data Produk', unitBisnis: activeUnitInfo.label },
    );
  }

  return (
    <div>
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-surface-border">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode atau nama produk..."
              className="input-field pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              className="input-field w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="semua">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
            <button type="button" className="btn-secondary flex items-center gap-1.5 text-xs" onClick={handleExportExcel} title="Export Excel">
              <FileSpreadsheet size={13} /> Excel
            </button>
            <button type="button" className="btn-secondary flex items-center gap-1.5 text-xs" onClick={handleExportPdf} title="Export PDF">
              <FileDown size={13} /> PDF
            </button>
            <button type="button" className="btn-primary flex items-center gap-1.5" onClick={openAddForm}>
              <Plus size={14} />
              Tambah Produk
            </button>
          </div>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : filteredData.length === 0 ? (
          <EmptyState
            hasFilter={Boolean(searchTerm) || statusFilter !== 'semua'}
            onAdd={openAddForm}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-surface-border">
                  <th className="px-4 py-2.5 font-medium">Kode Produk</th>
                  <th className="px-4 py-2.5 font-medium">Nama Produk</th>
                  {/* Konversi hanya tampil untuk non-Fotosnaps */}
                  {activeUnit !== 'FOTOSNAPS' && (
                    <th className="px-4 py-2.5 font-medium">Konversi</th>
                  )}
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-800">{item.kodeProduk}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{item.namaProduk}</td>
                    {activeUnit !== 'FOTOSNAPS' && (
                      <td className="px-4 py-2.5 text-xs text-slate-600 font-medium">
                        {formatKonversi(item)}
                      </td>
                    )}
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

      <ProdukFormModal
        open={formOpen}
        editingItem={editingItem}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ProdukDetailModal open={Boolean(detailItem)} item={detailItem} onClose={() => setDetailItem(null)} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Produk"
        description={`Data produk "${deleteTarget?.namaProduk ?? ''}" (${deleteTarget?.kodeProduk ?? ''}) akan dihapus permanen dan tidak dapat dikembalikan. Lanjutkan?`}
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
      className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${tone === 'danger'
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
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-9 rounded-md bg-slate-100 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ hasFilter, onAdd }: { hasFilter: boolean; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <PackageX size={20} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">
        {hasFilter ? 'Data tidak ditemukan' : 'Belum ada produk'}
      </p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">
        {hasFilter
          ? 'Coba ubah kata kunci pencarian atau filter.'
          : 'Tambahkan produk pertama untuk mulai mengelola stok.'}
      </p>
      {!hasFilter && (
        <button type="button" className="btn-primary mt-4" onClick={onAdd}>
          <Plus size={14} />
          Tambah Produk
        </button>
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-status-dangerBg flex items-center justify-center mb-3">
        <PackageX size={20} className="text-status-danger" />
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
