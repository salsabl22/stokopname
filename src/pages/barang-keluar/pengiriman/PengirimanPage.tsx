import { useEffect, useMemo, useState } from 'react';
import { Search, Send, RefreshCcw } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import { ToastContainer } from '../../../components/ui/Toast';
import { useToast } from '../../../utils/useToast';
import PengirimanFormModal from './PengirimanFormModal';
import type { PesananCabang } from '../../../types/pesananCabang';
import { STATUS_SO_LABEL, STATUS_SO_TONE } from '../../../utils/statusSO';
import { fetchPesananCabangByStatus, prosesPengiriman } from '../../../services/pesananCabangService';

export default function PengirimanPage() {
  const [data, setData] = useState<PesananCabang[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<PesananCabang | null>(null);

  const { toasts, showToast, dismissToast } = useToast();

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchPesananCabangByStatus(['siap_kirim', 'gagal_kirim', 'terkirim']));
    } catch {
      setError('Gagal memuat data pengiriman. Silakan coba lagi.');
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
        (p) =>
          p.nomorPesanan.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.cabangNama.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [data, searchTerm],
  );

  async function handleSubmit(kurir: string, nomorResi: string, berhasil: boolean) {
    if (!selected) return;
    const result = await prosesPengiriman(selected.id, kurir, nomorResi, berhasil);
    await loadData();
    if (berhasil) {
      showToast('success', `${result.nomorPesanan} berhasil dikirim. Status pengiriman tersimpan.`);
    } else {
      showToast('error', `${result.nomorPesanan} gagal dikirim. Silakan buat ulang dokumen pengiriman.`);
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
              placeholder="Cari nomor pesanan atau cabang..."
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
                  <th className="px-4 py-2.5 font-medium">Nomor Pesanan</th>
                  <th className="px-4 py-2.5 font-medium">Cabang</th>
                  <th className="px-4 py-2.5 font-medium">Kurir</th>
                  <th className="px-4 py-2.5 font-medium">No. Resi</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((p) => (
                  <tr key={p.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-800">{p.nomorPesanan}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{p.cabangNama}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{p.kurir || '-'}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{p.nomorResi || '-'}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone={STATUS_SO_TONE[p.status]}>{STATUS_SO_LABEL[p.status]}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {(p.status === 'siap_kirim' || p.status === 'gagal_kirim') && (
                        <button type="button" className="btn-secondary" onClick={() => setSelected(p)}>
                          {p.status === 'gagal_kirim' ? 'Buat Ulang Dokumen' : 'Buat Dokumen Pengiriman'}
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

      <PengirimanFormModal
        open={Boolean(selected)}
        pesanan={selected}
        onClose={() => setSelected(null)}
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
        <Send size={20} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">Tidak ada barang yang siap dikirim</p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">
        Barang akan muncul di sini setelah selesai di-packing.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-status-dangerBg flex items-center justify-center mb-3">
        <Send size={20} className="text-status-danger" />
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
