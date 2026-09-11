import { useEffect, useMemo, useState } from 'react';
import { Search, ClipboardCheck, RefreshCcw } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import { ToastContainer } from '../../../components/ui/Toast';
import { useToast } from '../../../utils/useToast';
import QCFormModal from './QCFormModal';
import type { HasilQC, PesananPembelian } from '../../../types/barangMasuk';
import { useMasterStatus } from '../../../hooks/useMasterStatus';
import { fetchPOByStatus, prosesQC } from '../../../services/barangMasukService';

export default function PemeriksaanKualitasPage() {
  const [data, setData] = useState<PesananPembelian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPO, setSelectedPO] = useState<PesananPembelian | null>(null);

  const { getLabel, getTone } = useMasterStatus('PO');
  const { toasts, showToast, dismissToast } = useToast();

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchPOByStatus(['menunggu_qc', 'karantina', 'retur']));
    } catch {
      setError('Gagal memuat data pemeriksaan kualitas. Silakan coba lagi.');
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

  async function handleSubmit(hasilQC: HasilQC, perluRepack: boolean, catatan?: string) {
    if (!selectedPO) return;
    const result = await prosesQC(selectedPO.id, hasilQC, perluRepack, catatan);
    await loadData();
    if (hasilQC === 'baik') {
      showToast(
        'success',
        perluRepack
          ? `${result.nomorPO} lolos QC, perlu repack sebelum disimpan.`
          : `${result.nomorPO} lolos QC dan siap disimpan.`,
      );
    } else if (hasilQC === 'rusak') {
      showToast('error', `${result.nomorPO} ditandai Rusak dan dipindahkan ke Karantina.`);
    } else {
      showToast('error', `${result.nomorPO} ditandai Ditolak dan akan diproses Retur.`);
    }
  }

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="card">
        <div className="p-4 border-b border-surface-border">
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
                  <th className="px-4 py-2.5 font-medium">Nomor PO</th>
                  <th className="px-4 py-2.5 font-medium">Supplier</th>
                  <th className="px-4 py-2.5 font-medium">Item</th>
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
                    <td className="px-4 py-2.5">
                      <Badge tone={getTone(po.status)}>{getLabel(po.status)}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {po.status === 'menunggu_qc' && (
                        <button type="button" className="btn-secondary" onClick={() => setSelectedPO(po)}>
                          Proses QC
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

      <QCFormModal
        open={Boolean(selectedPO)}
        po={selectedPO}
        onClose={() => setSelectedPO(null)}
        onSubmit={handleSubmit}
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
        <ClipboardCheck size={20} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">Tidak ada barang yang menunggu QC</p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">
        Barang akan muncul di sini setelah diproses di menu Penerimaan.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-status-dangerBg flex items-center justify-center mb-3">
        <ClipboardCheck size={20} className="text-status-danger" />
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
