import { useEffect, useMemo, useState } from 'react';
import { Search, PackageCheck, RefreshCcw } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import { ToastContainer } from '../../../components/ui/Toast';
import { useToast } from '../../../utils/useToast';
import PenerimaanFormModal from './PenerimaanFormModal';
import type { PesananPembelian } from '../../../types/barangMasuk';
import { useMasterStatus } from '../../../hooks/useMasterStatus';
import { fetchPOByStatus, prosesPenerimaan } from '../../../services/barangMasukService';
import { createException } from '../../../services/pengendalianService';
import { createWaste } from '../../../services/pengendalianService';

export default function PenerimaanPage() {
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
      setData(await fetchPOByStatus(['barang_datang', 'pengecualian']));
    } catch {
      setError('Gagal memuat data penerimaan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const filteredData = useMemo(
    () =>
      data.filter(
        (po) =>
          po.nomorPO.toLowerCase().includes(searchTerm.toLowerCase()) ||
          po.pemasokNama.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [data, searchTerm],
  );

  async function handleSubmit(
    barangSesuai: boolean,
    jumlahDiterima: Record<string, number>,
  ) {
    if (!selectedPO) return;
    const result = await prosesPenerimaan(selectedPO.id, barangSesuai, jumlahDiterima);
    await loadData();

    // Kasus 1: Barang TIDAK sesuai → otomatis masuk Pengembalian ke Supplier
    if (!barangSesuai) {
      try {
        const itemDetail = selectedPO.items
          .map((it) => `${it.produkNama} (${it.jumlahPesan} ${it.satuan})`)
          .join(', ');

        await createException({
          tipe: 'BARANG_TIDAK_SESUAI_FAKTUR',
          referensi: selectedPO.nomorPO,
          keterangan: `Pengembalian otomatis — barang tidak sesuai faktur. Produk: ${itemDetail}`,
          alasanPengembalian: 'Barang tidak sesuai dengan pesanan pembelian',
        });
        showToast('error', `${result.nomorPO} ditandai Tidak Sesuai — otomatis masuk ke Pengembalian Supplier.`);
      } catch {
        showToast('error', `${result.nomorPO} ditandai Pengecualian — barang tidak sesuai pesanan.`);
      }
      return;
    }

    // Kasus 2: Barang sesuai tapi ada selisih jumlah per item
    for (const item of selectedPO.items) {
      const diterima = jumlahDiterima[item.id] ?? item.jumlahPesan;
      const selisih = diterima - item.jumlahPesan;

      if (selisih < 0) {
        // Kurang → masuk Waste (barang tidak lengkap / hilang)
        try {
          await createWaste({
            produkId: item.produkId,
            jumlah: Math.abs(selisih),
            satuan: item.satuan,
            alasan: `Kekurangan saat penerimaan PO ${selectedPO.nomorPO}`,
            referensi: selectedPO.nomorPO,
          });
          showToast(
            'warning',
            `${item.produkNama}: kurang ${Math.abs(selisih)} ${item.satuan} — otomatis dicatat di Waste.`,
          );
        } catch {
          // silent — tidak blokir flow utama
        }
      } else if (selisih > 0) {
        // Lebih → masuk Pengembalian ke Supplier
        try {
          await createException({
            tipe: 'JUMLAH_LEBIH_DARI_PO',
            referensi: selectedPO.nomorPO,
            keterangan: `Kelebihan ${selisih} ${item.satuan} produk ${item.produkNama} saat penerimaan PO ${selectedPO.nomorPO}. Jumlah dipesan: ${item.jumlahPesan}, diterima: ${diterima}. Kelebihan ${selisih} harus dikembalikan ke supplier.`,
            alasanPengembalian: `Jumlah diterima melebihi PO — ${selisih} ${item.satuan} dikembalikan`,
          });
          showToast(
            'warning',
            `${item.produkNama}: lebih ${selisih} ${item.satuan} — otomatis masuk Pengembalian Supplier.`,
          );
        } catch {
          // silent — tidak blokir flow utama
        }
      }
    }

    if (result.jumlahSesuai === false) {
      showToast('warning', `${result.nomorPO} diterima dengan selisih jumlah. Lanjut ke Pemeriksaan Kualitas.`);
    } else {
      showToast('success', `${result.nomorPO} diterima sesuai pesanan. Lanjut ke Pemeriksaan Kualitas.`);
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
                      {po.status === 'barang_datang' && (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setSelectedPO(po)}
                        >
                          Proses Penerimaan
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

      <PenerimaanFormModal
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
        <PackageCheck size={20} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">Tidak ada barang yang menunggu penerimaan</p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">
        Pesanan akan muncul di sini setelah ditandai "Barang Datang" di menu Pesanan Pembelian.
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
