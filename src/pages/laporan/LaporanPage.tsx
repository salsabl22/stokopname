import { useState, useEffect, useMemo } from 'react';
import { Download, FileText, Table, RefreshCcw, TrendingUp, Package, ArrowDown, ArrowUp } from 'lucide-react';
import { fetchPersediaan } from '../../services/persediaanService';
import { fetchAllPO } from '../../services/barangMasukService';
import { fetchAllPesananCabang } from '../../services/pesananCabangService';
import { fetchAllRetur } from '../../services/returService';
import { fetchStockMovements } from '../../services/stockMovementService';
import { exportToPdf, exportToExcel } from '../../utils/exportUtils';

type TipeLaporan = 'persediaan' | 'barang_masuk' | 'barang_keluar' | 'retur' | 'aktivitas';

const LAPORAN_TABS: { id: TipeLaporan; label: string; icon: React.ReactNode }[] = [
  { id: 'persediaan', label: 'Persediaan', icon: <Package size={15} /> },
  { id: 'barang_masuk', label: 'Barang Masuk (PO)', icon: <ArrowDown size={15} /> },
  { id: 'barang_keluar', label: 'Barang Keluar (SO)', icon: <ArrowUp size={15} /> },
  { id: 'retur', label: 'Retur', icon: <RefreshCcw size={15} /> },
  { id: 'aktivitas', label: 'Pergerakan Stok', icon: <TrendingUp size={15} /> },
];

async function loadDataForTab(tab: TipeLaporan): Promise<any[]> {
  switch (tab) {
    case 'persediaan': {
      const list = await fetchPersediaan();
      return list.map((item) => ({
        produkKode: item.produkKode,
        produkNama: item.produkNama,
        satuan: item.satuan,
        jumlahTersedia: item.jumlahTersedia,
        jumlahDialokasikan: item.jumlahDialokasikan,
        jumlahKarantina: item.jumlahKarantina,
        jumlahWaste: item.jumlahWaste,
        minimumStok: item.minimumStok,
        lokasiPenyimpanan: item.lokasiPenyimpanan,
        updatedAt: new Date(item.updatedAt).toLocaleString('id-ID'),
      }));
    }
    case 'barang_masuk': {
      const list = await fetchAllPO();
      return list.map((item) => ({
        nomorPO: item.nomorPO,
        tanggal: new Date(item.tanggal).toLocaleString('id-ID'),
        pemasokNama: item.pemasokNama,
        totalItem: item.items.length,
        totalPesanan: item.totalPesanan.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
        status: item.status,
        hasilQC: item.hasilQC || '-',
        createdAt: new Date(item.createdAt).toLocaleString('id-ID'),
      }));
    }
    case 'barang_keluar': {
      const list = await fetchAllPesananCabang();
      return list.map((item) => ({
        nomorPesanan: item.nomorPesanan,
        tanggal: new Date(item.tanggal).toLocaleString('id-ID'),
        cabangNama: item.cabangNama,
        totalItem: item.items.length,
        status: item.status,
        createdAt: new Date(item.createdAt).toLocaleString('id-ID'),
      }));
    }
    case 'retur': {
      const list = await fetchAllRetur();
      return list.map((item) => ({
        nomorRetur: item.nomorRetur,
        tanggal: new Date(item.tanggal).toLocaleString('id-ID'),
        sumber: item.sumber === 'cabang' ? `Cabang: ${item.cabangNama}` : `Internal: ${item.poNomor ?? '-'}`,
        alasan: item.alasan,
        jumlahItem: item.items.length,
        status: item.status,
        kondisiBarang: item.kondisiBarang || '-',
        createdAt: new Date(item.createdAt).toLocaleString('id-ID'),
      }));
    }
    case 'aktivitas': {
      const list = await fetchStockMovements();
      return list.map((item) => ({
        waktu: new Date(item.timestamp).toLocaleString('id-ID'),
        produkKode: item.produkKode,
        produkNama: item.produkNama,
        tipe: item.tipe,
        jumlah: `${item.jumlah} ${item.satuan}`,
        sumber: item.sumber,
        tujuan: item.tujuan,
        referensi: item.referensi,
        operator: item.operator || '-',
      }));
    }
    default:
      return [];
  }
}

const COLUMNS_MAP: Record<TipeLaporan, { header: string; key: string }[]> = {
  persediaan: [
    { header: 'Kode Produk', key: 'produkKode' },
    { header: 'Nama Produk', key: 'produkNama' },
    { header: 'Satuan', key: 'satuan' },
    { header: 'Tersedia', key: 'jumlahTersedia' },
    { header: 'Dialokasikan', key: 'jumlahDialokasikan' },
    { header: 'Karantina', key: 'jumlahKarantina' },
    { header: 'Waste', key: 'jumlahWaste' },
    { header: 'Min. Stok', key: 'minimumStok' },
    { header: 'Lokasi', key: 'lokasiPenyimpanan' },
    { header: 'Diperbarui', key: 'updatedAt' },
  ],
  barang_masuk: [
    { header: 'Nomor PO', key: 'nomorPO' },
    { header: 'Tanggal', key: 'tanggal' },
    { header: 'Supplier', key: 'pemasokNama' },
    { header: 'Jml Item', key: 'totalItem' },
    { header: 'Total Nilai', key: 'totalPesanan' },
    { header: 'Status', key: 'status' },
    { header: 'Hasil QC', key: 'hasilQC' },
  ],
  barang_keluar: [
    { header: 'Nomor SO', key: 'nomorPesanan' },
    { header: 'Tanggal', key: 'tanggal' },
    { header: 'Cabang', key: 'cabangNama' },
    { header: 'Jml Item', key: 'totalItem' },
    { header: 'Status', key: 'status' },
  ],
  retur: [
    { header: 'Nomor Retur', key: 'nomorRetur' },
    { header: 'Tanggal', key: 'tanggal' },
    { header: 'Sumber', key: 'sumber' },
    { header: 'Alasan', key: 'alasan' },
    { header: 'Jml Item', key: 'jumlahItem' },
    { header: 'Status', key: 'status' },
    { header: 'Kondisi Barang', key: 'kondisiBarang' },
  ],
  aktivitas: [
    { header: 'Waktu', key: 'waktu' },
    { header: 'Kode Produk', key: 'produkKode' },
    { header: 'Nama Produk', key: 'produkNama' },
    { header: 'Tipe', key: 'tipe' },
    { header: 'Jumlah', key: 'jumlah' },
    { header: 'Dari', key: 'sumber' },
    { header: 'Ke', key: 'tujuan' },
    { header: 'Referensi', key: 'referensi' },
    { header: 'Operator', key: 'operator' },
  ],
};

const STATUS_OPTIONS_MAP: Record<string, string[]> = {
  barang_masuk: ['menunggu_pengiriman', 'barang_datang', 'menunggu_qc', 'siap_penyimpanan', 'disimpan', 'karantina', 'retur', 'pengecualian'],
  barang_keluar: ['menunggu_alokasi', 'siap_diambil', 'siap_packing', 'siap_kirim', 'gagal_kirim', 'terkirim', 'pengecualian_pengambilan'],
  retur: ['diajukan', 'diterima', 'pengecualian', 'kembali_ke_stok', 'karantina', 'retur_pemasok'],
};

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState<TipeLaporan>('persediaan');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterMulai, setFilterMulai] = useState('');
  const [filterSampai, setFilterSampai] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [kpiCards, setKpiCards] = useState<{ label: string; value: number; color: string }[]>([]);

  async function loadData(tab: TipeLaporan) {
    setLoading(true);
    setFilterStatus('all');
    try {
      setData(await loadDataForTab(tab));
    } finally {
      setLoading(false);
    }
  }

  async function loadKpi() {
    const [allPO, allSO, allRetur, allPersediaan] = await Promise.all([
      fetchAllPO(),
      fetchAllPesananCabang(),
      fetchAllRetur(),
      fetchPersediaan(),
    ]);
    const stokRendah = allPersediaan.filter((s) => s.jumlahTersedia <= s.minimumStok).length;

    setKpiCards([
      { label: 'Total PO', value: allPO.length, color: 'text-blue-600' },
      { label: 'Total SO', value: allSO.length, color: 'text-green-600' },
      { label: 'Total Retur', value: allRetur.length, color: 'text-orange-600' },
      { label: 'Stok Rendah', value: stokRendah, color: stokRendah > 0 ? 'text-red-600' : 'text-slate-500' },
    ]);
  }

  useEffect(() => {
    loadData(activeTab);
    loadKpi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const columns = COLUMNS_MAP[activeTab];
  const statusOptions = STATUS_OPTIONS_MAP[activeTab] || [];

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Filter Status
      if (filterStatus !== 'all' && item.status !== undefined) {
        if (item.status !== filterStatus) return false;
      }
      // Filter Tanggal
      if (filterMulai || filterSampai) {
        const dateStr = item.tanggal || item.waktu || item.updatedAt;
        if (dateStr) {
          // Parse localized date string or ISO
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return true; // skip if can't parse
          if (filterMulai) {
            const mulai = new Date(filterMulai);
            mulai.setHours(0, 0, 0, 0);
            if (d < mulai) return false;
          }
          if (filterSampai) {
            const endD = new Date(filterSampai);
            endD.setHours(23, 59, 59, 999);
            if (d > endD) return false;
          }
        }
      }
      return true;
    });
  }, [data, filterStatus, filterMulai, filterSampai]);

  const activeLabel = LAPORAN_TABS.find((t) => t.id === activeTab)?.label || '';

  const handleExportPDF = () => {
    exportToPdf(filteredData, columns, { filename: `Laporan_${activeLabel}`, title: `Laporan ${activeLabel}` });
  };

  const handleExportExcel = () => {
    exportToExcel(filteredData, columns, { filename: `Laporan_${activeLabel}`, title: `Laporan ${activeLabel}` });
  };

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="card p-4">
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-slate-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Tabs */}
        <div className="flex gap-0 border-b border-surface-border overflow-x-auto">
          {LAPORAN_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 border-b border-surface-border">
          <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
            <div className="flex gap-2 items-center">
              <label className="text-xs text-slate-500 whitespace-nowrap">Mulai:</label>
              <input
                type="date"
                className="input-field text-xs py-1.5 px-2"
                value={filterMulai}
                onChange={(e) => setFilterMulai(e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-xs text-slate-500 whitespace-nowrap">Sampai:</label>
              <input
                type="date"
                className="input-field text-xs py-1.5 px-2"
                value={filterSampai}
                onChange={(e) => setFilterSampai(e.target.value)}
              />
            </div>
            {statusOptions.length > 0 && (
              <div className="flex gap-2 items-center">
                <label className="text-xs text-slate-500 whitespace-nowrap">Status:</label>
                <select
                  className="input-field text-xs py-1.5 px-2"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {(filterMulai || filterSampai || filterStatus !== 'all') && (
              <button
                type="button"
                className="text-xs text-slate-500 hover:text-slate-700 underline"
                onClick={() => {
                  setFilterMulai('');
                  setFilterSampai('');
                  setFilterStatus('all');
                }}
              >
                Reset Filter
              </button>
            )}
            <span className="text-xs text-slate-500 border-l border-slate-200 pl-3">
              {filteredData.length} item ditemukan
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={loading || filteredData.length === 0}
              className="btn-secondary flex items-center gap-1.5 text-xs disabled:opacity-50"
            >
              <FileText size={14} />
              Export PDF
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={loading || filteredData.length === 0}
              className="btn-secondary flex items-center gap-1.5 text-xs disabled:opacity-50"
            >
              <Download size={14} />
              Export Excel
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-6 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-9 rounded-md bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center">
            <Table size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">Tidak ada data untuk laporan ini</p>
            {(filterMulai || filterSampai || filterStatus !== 'all') && (
              <p className="text-xs text-slate-400 mt-1">Coba ubah atau reset filter untuk melihat semua data.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-surface-border">
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-2.5 font-medium whitespace-nowrap">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, i) => (
                  <tr key={i} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-2.5 text-xs text-slate-700 whitespace-nowrap max-w-xs truncate">
                        {String(row[col.key] ?? '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer summary */}
        {filteredData.length > 0 && (
          <div className="px-4 py-2.5 border-t border-surface-border bg-slate-50/50 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Menampilkan {filteredData.length} dari {data.length} data
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => loadData(activeTab)}
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700"
              >
                <RefreshCcw size={11} />
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
