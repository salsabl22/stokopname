import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Eye, ShoppingCart, RefreshCcw, Truck } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import { ToastContainer } from '../../../components/ui/Toast';
import { useToast } from '../../../utils/useToast';
import PesananPembelianFormModal from './PesananPembelianFormModal';
import PesananPembelianDetailModal from './PesananPembelianDetailModal';
import PesananPembelianStatusModal from './PesananPembelianStatusModal';
import type { PesananPembelian, PesananPembelianFormValues } from '../../../types/barangMasuk';
import { formatRupiah } from '../../../utils/statusPO';
import { useMasterStatus } from '../../../hooks/useMasterStatus';
import {
  createPesananPembelian,
  fetchAllPO,
  tandaiBarangDatang,
  updatePOStatus,
} from '../../../services/barangMasukService';
import { fetchProduk } from '../../../services/produkService';

export default function PesananPembelianPage() {
  const [data, setData] = useState<PesananPembelian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<PesananPembelian | null>(null);
  const [statusItem, setStatusItem] = useState<PesananPembelian | null>(null);

  const { getLabel, getTone } = useMasterStatus('PO');

  const { toasts, showToast, dismissToast } = useToast();

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchAllPO());
    } catch {
      setError('Gagal memuat data pesanan pembelian. Silakan coba lagi.');
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
        (po) =>
          po.nomorPO.toLowerCase().includes(searchTerm.toLowerCase()) ||
          po.pemasokNama.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [data, searchTerm],
  );

  async function handleFormSubmit(values: PesananPembelianFormValues, pemasokNama: string) {
    const produkList = await fetchProduk();
    await createPesananPembelian(values, pemasokNama, produkList);
    await loadData();
    showToast('success', 'Pesanan pembelian berhasil disimpan.');
  }

  async function handleTandaiDatang(po: PesananPembelian) {
    await tandaiBarangDatang(po.id);
    await loadData();
    showToast('success', `${po.nomorPO} ditandai barang telah datang. Lanjutkan ke Penerimaan.`);
  }

  async function handleEditStatusSubmit(id: string, newStatus: PesananPembelian['status']) {
    await updatePOStatus(id, newStatus);
    await loadData();
    showToast('success', 'Status PO berhasil diperbarui.');
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
              placeholder="Cari nomor PO atau supplier..."
              className="input-field pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="button" className="btn-primary" onClick={() => setFormOpen(true)}>
            <Plus size={14} />
            Buat Pesanan
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
                  <th className="px-4 py-2.5 font-medium">Nomor PO</th>
                  <th className="px-4 py-2.5 font-medium">Supplier</th>
                  <th className="px-4 py-2.5 font-medium">Item</th>
                  <th className="px-4 py-2.5 font-medium">Total</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((po) => (
                  <tr key={po.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-800">{po.nomorPO}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{po.pemasokNama}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{po.items.length} produk</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{formatRupiah(po.totalPesanan)}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone={getTone(po.status)}>{getLabel(po.status)}</Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        {po.status === 'menunggu_pengiriman' && (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-[11px] text-navy-800 hover:underline"
                            onClick={() => handleTandaiDatang(po)}
                          >
                            <Truck size={12} /> Tandai Barang Datang
                          </button>
                        )}
                        <IconButton label="Ubah Status" onClick={() => setStatusItem(po)}>
                          <RefreshCcw size={14} />
                        </IconButton>
                        <IconButton label="Detail" onClick={() => setDetailItem(po)}>
                          <Eye size={14} />
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

      <PesananPembelianFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <PesananPembelianDetailModal
        open={Boolean(detailItem)}
        item={detailItem}
        onClose={() => setDetailItem(null)}
      />

      <PesananPembelianStatusModal
        open={Boolean(statusItem)}
        item={statusItem}
        onClose={() => setStatusItem(null)}
        onSubmit={handleEditStatusSubmit}
      />
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-navy-800 hover:bg-slate-100 transition-colors"
    >
      {children}
    </button>
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
        <ShoppingCart size={20} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">
        {hasFilter ? 'Data tidak ditemukan' : 'Belum ada pesanan pembelian'}
      </p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">
        {hasFilter ? 'Coba ubah kata kunci pencarian.' : 'Buat pesanan pembelian pertama ke supplier.'}
      </p>
      {!hasFilter && (
        <button type="button" className="btn-primary mt-4" onClick={onAdd}>
          <Plus size={14} />
          Buat Pesanan
        </button>
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-status-dangerBg flex items-center justify-center mb-3">
        <ShoppingCart size={20} className="text-status-danger" />
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
