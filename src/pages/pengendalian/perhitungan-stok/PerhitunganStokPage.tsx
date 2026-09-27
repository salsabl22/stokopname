import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Scale, RefreshCcw } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import { ToastContainer } from '../../../components/ui/Toast';
import { useToast } from '../../../utils/useToast';
import TugasFormModal from './TugasFormModal';
import HitungFormModal from './HitungFormModal';
import InvestigasiFormModal from './InvestigasiFormModal';
import PersetujuanFormModal from './PersetujuanFormModal';
import type { PerhitunganStok } from '../../../types/perhitunganStok';
import { STATUS_SO_CNT_LABEL, STATUS_SO_CNT_TONE } from '../../../utils/statusPerhitunganStok';
import {
  bukaInvestigasiUlang,
  buatTugasPerhitungan,
  fetchAllPerhitunganStok,
  inputHasilHitung,
  prosesInvestigasi,
  prosesPersetujuan,
} from '../../../services/perhitunganStokService';


export default function PerhitunganStokPage() {
  const [data, setData] = useState<PerhitunganStok[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [tugasFormOpen, setTugasFormOpen] = useState(false);
  const [hitungTarget, setHitungTarget] = useState<PerhitunganStok | null>(null);
  const [investigasiTarget, setInvestigasiTarget] = useState<PerhitunganStok | null>(null);
  const [persetujuanTarget, setPersetujuanTarget] = useState<PerhitunganStok | null>(null);

  const { toasts, showToast, dismissToast } = useToast();

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchAllPerhitunganStok());
    } catch {
      setError('Gagal memuat data perhitungan stok. Silakan coba lagi.');
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
          p.nomor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.produkNama.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [data, searchTerm],
  );

  async function handleBuatTugas(produk: any) {
    const satuanStr = typeof produk.satuan === 'string' ? produk.satuan : (produk.satuan?.kode ?? produk.satuan?.nama ?? 'PCS');
    await buatTugasPerhitungan(produk.id, produk.kodeProduk, produk.namaProduk, satuanStr);
    await loadData();
    showToast('success', 'Tugas perhitungan stok dibuat.');
  }

  async function handleHitungSubmit(jumlahFisik: number, jumlahSistemTerkini: number) {
    if (!hitungTarget) return;
    const result = await inputHasilHitung(hitungTarget.id, jumlahFisik, jumlahSistemTerkini);
    await loadData();
    if (result.adaSelisih) {
      showToast('error', `${result.nomor} ditemukan selisih, perlu investigasi.`);
    } else {
      showToast('success', `${result.nomor} sesuai, tidak ada selisih.`);
    }
  }

  async function handleInvestigasiSubmit(barangBermasalah: boolean, catatan: string) {
    if (!investigasiTarget) return;
    const result = await prosesInvestigasi(investigasiTarget.id, barangBermasalah, catatan);
    await loadData();
    showToast(
      'success',
      barangBermasalah
        ? `${result.nomor} dipindahkan ke Karantina, menunggu persetujuan penyesuaian.`
        : `${result.nomor} penyebab dicatat, menunggu persetujuan penyesuaian.`,
    );
  }

  async function handlePersetujuanSubmit(disetujui: boolean) {
    if (!persetujuanTarget) return;
    const result = await prosesPersetujuan(persetujuanTarget.id, disetujui);
    await loadData();
    if (disetujui) {
      showToast('success', `${result.nomor} disetujui, stok Persediaan telah disesuaikan.`);
    } else {
      showToast('error', `${result.nomor} ditolak. Perlu investigasi ulang.`);
    }
  }

  async function handleInvestigasiUlang(p: PerhitunganStok) {
    await bukaInvestigasiUlang(p.id);
    await loadData();
    showToast('success', `${p.nomor} dibuka kembali untuk investigasi ulang.`);
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
              placeholder="Cari nomor atau nama produk..."
              className="input-field pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="button" className="btn-primary" onClick={() => setTugasFormOpen(true)}>
            <Plus size={14} />
            Buat Tugas Perhitungan
          </button>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : filteredData.length === 0 ? (
          <EmptyState hasFilter={Boolean(searchTerm)} onAdd={() => setTugasFormOpen(true)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-surface-border">
                  <th className="px-4 py-2.5 font-medium">Nomor</th>
                  <th className="px-4 py-2.5 font-medium">Tanggal</th>
                  <th className="px-4 py-2.5 font-medium">Produk</th>
                  <th className="px-4 py-2.5 font-medium">Sistem</th>
                  <th className="px-4 py-2.5 font-medium">Fisik</th>
                  <th className="px-4 py-2.5 font-medium">Selisih</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((p) => (
                  <tr key={p.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-800">{p.nomor}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">
                      {new Date(p.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{p.produkNama}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{p.jumlahSistem} {p.satuan}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">
                      {p.jumlahFisik !== undefined ? `${p.jumlahFisik} ${p.satuan}` : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">
                      {p.selisih !== undefined ? `${p.selisih > 0 ? '+' : ''}${p.selisih} ${p.satuan}` : '-'}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={STATUS_SO_CNT_TONE[p.status]}>{STATUS_SO_CNT_LABEL[p.status]}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {p.status === 'ditugaskan' && (
                        <button type="button" className="btn-secondary" onClick={() => setHitungTarget(p)}>
                          Input Hasil Hitung
                        </button>
                      )}
                      {p.status === 'menunggu_investigasi' && (
                        <button type="button" className="btn-secondary" onClick={() => setInvestigasiTarget(p)}>
                          Investigasi
                        </button>
                      )}
                      {p.status === 'menunggu_persetujuan' && (
                        <button type="button" className="btn-secondary" onClick={() => setPersetujuanTarget(p)}>
                          Proses Persetujuan
                        </button>
                      )}
                      {p.status === 'ditolak' && (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => handleInvestigasiUlang(p)}
                        >
                          Investigasi Ulang
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

      <TugasFormModal open={tugasFormOpen} onClose={() => setTugasFormOpen(false)} onSubmit={handleBuatTugas} />

      <HitungFormModal
        open={Boolean(hitungTarget)}
        tugas={hitungTarget}
        onClose={() => setHitungTarget(null)}
        onSubmit={handleHitungSubmit}
      />

      <InvestigasiFormModal
        open={Boolean(investigasiTarget)}
        tugas={investigasiTarget}
        onClose={() => setInvestigasiTarget(null)}
        onSubmit={handleInvestigasiSubmit}
      />

      <PersetujuanFormModal
        open={Boolean(persetujuanTarget)}
        tugas={persetujuanTarget}
        onClose={() => setPersetujuanTarget(null)}
        onSubmit={handlePersetujuanSubmit}
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
        <Scale size={20} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">
        {hasFilter ? 'Data tidak ditemukan' : 'Belum ada tugas perhitungan stok'}
      </p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">
        {hasFilter ? 'Coba ubah kata kunci pencarian.' : 'Buat tugas perhitungan untuk produk tertentu.'}
      </p>
      {!hasFilter && (
        <button type="button" className="btn-primary mt-4" onClick={onAdd}>
          <Plus size={14} />
          Buat Tugas Perhitungan
        </button>
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-status-dangerBg flex items-center justify-center mb-3">
        <Scale size={20} className="text-status-danger" />
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
