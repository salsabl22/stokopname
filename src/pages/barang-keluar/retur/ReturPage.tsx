import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Undo2, RefreshCcw, Image } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import { ToastContainer } from '../../../components/ui/Toast';
import { useToast } from '../../../utils/useToast';
import ReturFormModal from './ReturFormModal';
import PenerimaanReturModal from './PenerimaanReturModal';
import PemeriksaanReturModal from './PemeriksaanReturModal';
import type { KondisiBarangRetur, Retur, ReturFormValues } from '../../../types/retur';
import { STATUS_RETUR_LABEL, STATUS_RETUR_TONE } from '../../../utils/statusRetur';
import {
  createRetur,
  fetchAllRetur,
  prosesPemeriksaanRetur,
  prosesPenerimaanRetur,
} from '../../../services/returService';
import { fetchProduk } from '../../../services/produkService';

export default function ReturPage() {
  const [data, setData] = useState<Retur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [penerimaanTarget, setPenerimaanTarget] = useState<Retur | null>(null);
  const [pemeriksaanTarget, setPemeriksaanTarget] = useState<Retur | null>(null);
  const [fotoPreview, setFotoPreview] = useState<{ open: boolean; url: string; nomor: string }>({
    open: false,
    url: '',
    nomor: '',
  });

  const { toasts, showToast, dismissToast } = useToast();

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchAllRetur());
    } catch {
      setError('Gagal memuat data retur. Silakan coba lagi.');
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
        (r) =>
          r.nomorRetur.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.cabangNama ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.poNomor ?? '').toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [data, searchTerm],
  );

  async function handleFormSubmit(
    values: ReturFormValues,
    meta: { cabangNama?: string; poNomor?: string; pemasokNama?: string },
    fotoKerusakan?: string,
  ) {
    const produkList = await fetchProduk();
    await createRetur(values, meta, produkList, fotoKerusakan);
    await loadData();
    showToast('success', 'Pengajuan retur berhasil dikirim ke gudang.');
  }

  async function handlePenerimaanSubmit(sesuai: boolean, catatan?: string) {
    if (!penerimaanTarget) return;
    const result = await prosesPenerimaanRetur(penerimaanTarget.id, sesuai, catatan);
    await loadData();
    if (sesuai) {
      showToast('success', `${result.nomorRetur} sesuai pengajuan. Lanjut ke Pemeriksaan Retur.`);
    } else {
      showToast('error', `${result.nomorRetur} tidak sesuai pengajuan — dicatat sebagai Pengecualian.`);
    }
  }

  async function handlePemeriksaanSubmit(kondisi: KondisiBarangRetur, catatan?: string, foto?: string) {
    if (!pemeriksaanTarget) return;
    const result = await prosesPemeriksaanRetur(pemeriksaanTarget.id, kondisi, catatan, foto);
    await loadData();
    const pesan: Record<KondisiBarangRetur, string> = {
      baik: `${result.nomorRetur} kondisi baik, stok dikembalikan ke Persediaan.`,
      rusak: `${result.nomorRetur} kondisi rusak, dipindahkan ke Karantina.`,
      ditolak: `${result.nomorRetur} ditolak, akan dikirim balik ke Supplier.`,
    };
    showToast(kondisi === 'baik' ? 'success' : 'error', pesan[kondisi]);
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
              placeholder="Cari nomor retur, cabang, atau PO..."
              className="input-field pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="button" className="btn-primary" onClick={() => setFormOpen(true)}>
            <Plus size={14} />
            Ajukan Retur
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
                  <th className="px-4 py-2.5 font-medium">Nomor Retur</th>
                  <th className="px-4 py-2.5 font-medium">Sumber</th>
                  <th className="px-4 py-2.5 font-medium">Item</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Foto</th>
                  <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((r) => (
                  <tr key={r.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-800">{r.nomorRetur}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">
                      {r.sumber === 'cabang' ? `Cabang: ${r.cabangNama}` : `Internal: ${r.poNomor}`}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">
                      {r.items.map((it) => `${it.produkNama} (${it.jumlah} ${it.satuan})`).join(', ')}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={STATUS_RETUR_TONE[r.status]}>{STATUS_RETUR_LABEL[r.status]}</Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      {r.fotoKerusakan ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
                          onClick={() =>
                            setFotoPreview({ open: true, url: r.fotoKerusakan!, nomor: r.nomorRetur })
                          }
                        >
                          <Image size={13} />
                          Lihat Foto
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {r.status === 'diajukan' && (
                        <button type="button" className="btn-secondary" onClick={() => setPenerimaanTarget(r)}>
                          Proses Penerimaan
                        </button>
                      )}
                      {r.status === 'diterima' && (
                        <button type="button" className="btn-secondary" onClick={() => setPemeriksaanTarget(r)}>
                          Proses Pemeriksaan
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

      <ReturFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleFormSubmit} />

      <PenerimaanReturModal
        open={Boolean(penerimaanTarget)}
        retur={penerimaanTarget}
        onClose={() => setPenerimaanTarget(null)}
        onSubmit={handlePenerimaanSubmit}
      />

      <PemeriksaanReturModal
        open={Boolean(pemeriksaanTarget)}
        retur={pemeriksaanTarget}
        onClose={() => setPemeriksaanTarget(null)}
        onSubmit={handlePemeriksaanSubmit}
      />

      {/* Modal Preview Foto */}
      {fotoPreview.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setFotoPreview({ open: false, url: '', nomor: '' })}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-4 max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-800">Foto Kerusakan — {fotoPreview.nomor}</p>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-700 text-lg leading-none"
                onClick={() => setFotoPreview({ open: false, url: '', nomor: '' })}
              >
                ×
              </button>
            </div>
            <img
              src={fotoPreview.url}
              alt="Foto kerusakan"
              className="w-full rounded-lg object-contain max-h-80"
            />
          </div>
        </div>
      )}
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
        <Undo2 size={20} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">
        {hasFilter ? 'Data tidak ditemukan' : 'Belum ada pengajuan retur'}
      </p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">
        {hasFilter ? 'Coba ubah kata kunci pencarian.' : 'Ajukan retur dari cabang atau barang ditolak.'}
      </p>
      {!hasFilter && (
        <button type="button" className="btn-primary mt-4" onClick={onAdd}>
          <Plus size={14} />
          Ajukan Retur
        </button>
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-status-dangerBg flex items-center justify-center mb-3">
        <Undo2 size={20} className="text-status-danger" />
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
