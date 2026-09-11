import { useEffect, useMemo, useState } from 'react';
import { Search, Archive, RefreshCcw, PackageCheck } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import { ToastContainer } from '../../../components/ui/Toast';
import { useToast } from '../../../utils/useToast';
import PenyimpananFormModal from './PenyimpananFormModal';
import type { PesananPembelian } from '../../../types/barangMasuk';
import { useMasterStatus } from '../../../hooks/useMasterStatus';
import { fetchPOByStatus, simpanKeGudang, tandaiRepackSelesai } from '../../../services/barangMasukService';

export default function PenyimpananPage() {
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
      setData(await fetchPOByStatus(['perlu_repack', 'siap_penyimpanan', 'disimpan']));
    } catch {
      setError('Gagal memuat data penyimpanan. Silakan coba lagi.');
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

  async function handleRepackSelesai(po: PesananPembelian) {
    await tandaiRepackSelesai(po.id);
    await loadData();
    showToast('success', `${po.nomorPO} selesai repack, siap disimpan.`);
  }

  async function handleSubmitPenyimpanan(lokasiLabel: string) {
    if (!selectedPO) return;
    await simpanKeGudang(selectedPO.id, lokasiLabel);
    await loadData();
    showToast('success', `${selectedPO.nomorPO} berhasil disimpan dan masuk ke Persediaan.`);
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
                  <th className="px-4 py-2.5 font-medium">Lokasi</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((po) => (
                  <tr key={po.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-800">{po.nomorPO}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{po.pemasokNama}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{po.lokasiPenyimpanan || '-'}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone={getTone(po.status)}>{getLabel(po.status)}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {po.status === 'perlu_repack' && (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => handleRepackSelesai(po)}
                        >
                          Tandai Repack Selesai
                        </button>
                      )}
                      {po.status === 'siap_penyimpanan' && (
                        <button type="button" className="btn-primary" onClick={() => setSelectedPO(po)}>
                          Simpan ke Gudang
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

      <PenyimpananFormModal
        open={Boolean(selectedPO)}
        po={selectedPO}
        onClose={() => setSelectedPO(null)}
        onSubmit={handleSubmitPenyimpanan}
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
        <Archive size={20} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">Belum ada barang yang siap disimpan</p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">
        Barang akan muncul di sini setelah lolos Pemeriksaan Kualitas.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-status-dangerBg flex items-center justify-center mb-3">
        <PackageCheck size={20} className="text-status-danger" />
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
