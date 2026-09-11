import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, PackagePlus, RefreshCcw } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import { ToastContainer } from '../../../components/ui/Toast';
import { useToast } from '../../../utils/useToast';
import type { PesananCabang } from '../../../types/pesananCabang';
import { STATUS_SO_LABEL, STATUS_SO_TONE } from '../../../utils/statusSO';
import { fetchPesananCabangByStatus, cobaAlokasiUlang } from '../../../services/pesananCabangService';
import { fetchPersediaan, tambahStokManual } from '../../../services/persediaanService';
import { stokBebas } from '../../../types/persediaan';
import type { StokItem } from '../../../types/persediaan';
import { useAuth } from '../../../contexts/AuthContext';

export default function PengisianUlangPage() {
  const { user } = useAuth();
  const [pesananList, setPesananList] = useState<PesananCabang[]>([]);
  const [stokRendah, setStokRendah] = useState<StokItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [isiTarget, setIsiTarget] = useState<StokItem | null>(null);
  const [jumlahTambah, setJumlahTambah] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { toasts, showToast, dismissToast } = useToast();

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [pesanan, stok] = await Promise.all([
        fetchPesananCabangByStatus(['perlu_pengisian_ulang']),
        fetchPersediaan(),
      ]);
      setPesananList(pesanan);
      setStokRendah(stok.filter((s) => s.jumlahTersedia <= s.minimumStok));
    } catch {
      setError('Gagal memuat data pengisian ulang. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const relevantStokIds = useMemo(
    () => new Set(pesananList.flatMap((p) => p.items.map((it) => it.produkId))),
    [pesananList],
  );

  async function handleTambahStokSubmit() {
    if (!isiTarget) return;
    const jumlah = Number(jumlahTambah);
    if (!jumlahTambah.trim() || Number.isNaN(jumlah) || jumlah <= 0) return;

    setSubmitting(true);
    try {
      await tambahStokManual(isiTarget.produkId, jumlah, 'Pengisian ulang manual', user?.id);
      showToast('success', `Stok ${isiTarget.produkNama} berhasil ditambah ${jumlah} ${isiTarget.satuan}.`);
      setIsiTarget(null);
      setJumlahTambah('');
      await loadData();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCobaAlokasiUlang(p: PesananCabang) {
    setProcessingId(p.id);
    try {
      const result = await cobaAlokasiUlang(p.id);
      await loadData();
      if (result.status === 'siap_diambil') {
        showToast('success', `${result.nomorPesanan} berhasil dialokasikan ulang, siap diambil.`);
      } else {
        showToast('error', `${result.nomorPesanan} masih belum bisa dialokasikan. Tambah stok lagi.`);
      }
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="card">
        <div className="p-4 border-b border-surface-border">
          <h3 className="text-xs font-semibold text-slate-700">Pesanan Cabang Menunggu Pengisian Ulang</h3>
        </div>
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : pesananList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <PackagePlus size={20} className="text-slate-400 mb-2" />
            <p className="text-xs text-slate-500">Tidak ada pesanan yang menunggu pengisian ulang.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-surface-border">
                  <th className="px-4 py-2.5 font-medium">Nomor Pesanan</th>
                  <th className="px-4 py-2.5 font-medium">Cabang</th>
                  <th className="px-4 py-2.5 font-medium">Item Dibutuhkan</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pesananList.map((p) => (
                  <tr key={p.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-800">{p.nomorPesanan}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{p.cabangNama}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">
                      {p.items.map((it) => `${it.produkNama} (${it.jumlahDipesan} ${it.satuan})`).join(', ')}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={STATUS_SO_TONE[p.status]}>{STATUS_SO_LABEL[p.status]}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleCobaAlokasiUlang(p)}
                        disabled={processingId === p.id}
                      >
                        <RefreshCw size={13} />
                        {processingId === p.id ? 'Memproses...' : 'Coba Alokasi Ulang'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="p-4 border-b border-surface-border">
          <h3 className="text-xs font-semibold text-slate-700">Produk dengan Stok Menipis</h3>
        </div>
        {stokRendah.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <PackagePlus size={20} className="text-slate-400 mb-2" />
            <p className="text-xs text-slate-500">Tidak ada produk dengan stok menipis saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-surface-border">
                  <th className="px-4 py-2.5 font-medium">Produk</th>
                  <th className="px-4 py-2.5 font-medium">Stok Tersedia</th>
                  <th className="px-4 py-2.5 font-medium">Minimum Stok</th>
                  <th className="px-4 py-2.5 font-medium">Stok Bebas</th>
                  <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {stokRendah.map((s) => (
                  <tr key={s.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-800">
                      {s.produkKode} — {s.produkNama}
                      {relevantStokIds.has(s.produkId) && (
                        <span className="ml-1.5 text-[10px] text-status-warning">● dibutuhkan pesanan</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">
                      {s.jumlahTersedia} {s.satuan}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">
                      {s.minimumStok} {s.satuan}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">
                      {stokBebas(s)} {s.satuan}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                          setIsiTarget(s);
                          setJumlahTambah('');
                        }}
                      >
                        <PackagePlus size={13} />
                        Tambah Stok
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        title={`Tambah Stok — ${isiTarget?.produkNama ?? ''}`}
        open={Boolean(isiTarget)}
        onClose={() => setIsiTarget(null)}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setIsiTarget(null)} disabled={submitting}>
              Batal
            </button>
            <button type="button" className="btn-primary" onClick={handleTambahStokSubmit} disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Tambah Stok'}
            </button>
          </>
        }
      >
        <div>
          <label className="label-field">
            Jumlah Tambahan {isiTarget ? `(${isiTarget.satuan})` : ''}
          </label>
          <input
            type="number"
            min={0}
            className="input-field"
            placeholder="Contoh: 100"
            value={jumlahTambah}
            onChange={(e) => setJumlahTambah(e.target.value)}
            disabled={submitting}
          />
        </div>
      </Modal>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="p-4 space-y-2.5">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="h-9 rounded-md bg-slate-100 animate-pulse" />
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <p className="text-sm font-medium text-slate-700">Terjadi kesalahan</p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">{message}</p>
      <button type="button" className="btn-secondary mt-4" onClick={onRetry}>
        <RefreshCcw size={14} />
        Coba Lagi
      </button>
    </div>
  );
}
