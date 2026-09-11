import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  Boxes,
  RefreshCcw,
  Clock,
  TrendingUp,
  Download,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { fetchDashboardMetrics, type DashboardMetrics } from '../services/dashboardService';
import Badge from '../components/ui/Badge';
import { TIPE_MOVEMENT_LABEL, TIPE_MOVEMENT_TONE } from '../types/stockMovement';
import { PRIORITAS_TUGAS_TONE } from '../types/task';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardMetrics();
      setMetrics(data);
    } catch {
      setError('Gagal memuat data ringkasan dasbor.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const exportToPDF = () => {
    if (!metrics) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Laporan Ringkasan Dasbor WMS', 14, 15);
    
    doc.setFontSize(11);
    doc.text(`Total SKU: ${metrics.totalSKU}`, 14, 25);
    doc.text(`Total Fisik Stok: ${metrics.totalFisikStok}`, 14, 32);
    
    // Pergerakan Stok Table
    if (metrics.recentMovements.length > 0) {
      doc.text('Histori Pergerakan Stok Terbaru', 14, 45);
      const tableData = metrics.recentMovements.map(m => [
        new Date(m.timestamp).toLocaleString('id-ID'),
        TIPE_MOVEMENT_LABEL[m.tipe],
        m.produkNama,
        `${m.jumlah} ${m.satuan}`,
        m.sumber,
        m.tujuan
      ]);
      
      autoTable(doc, {
        startY: 50,
        head: [['Waktu', 'Tipe', 'Produk', 'Jumlah', 'Dari', 'Ke']],
        body: tableData,
      });
    }

    doc.save('WMS_Laporan_Dasbor.pdf');
  };

  const exportToExcel = () => {
    if (!metrics) return;
    
    // Summary Sheet
    const summaryData = [
      ['Metric', 'Nilai'],
      ['Total SKU', metrics.totalSKU],
      ['Total Fisik Stok', metrics.totalFisikStok],
      ['Stok Bebas', metrics.totalStokBebas],
      ['Produk Menipis', metrics.totalProdukMenipis],
      ['Akurasi Opname (%)', metrics.akurasiOpnamePersen],
    ];
    
    // Movements Sheet
    const movementsData = metrics.recentMovements.map(m => ({
      Waktu: new Date(m.timestamp).toLocaleString('id-ID'),
      Tipe: TIPE_MOVEMENT_LABEL[m.tipe],
      Produk: m.produkNama,
      Kode: m.produkKode,
      Jumlah: m.jumlah,
      Satuan: m.satuan,
      Sumber: m.sumber,
      Tujuan: m.tujuan,
      Referensi: m.referensi
    }));

    const wb = XLSX.utils.book_new();
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    const wsMovements = XLSX.utils.json_to_sheet(movementsData);

    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');
    XLSX.utils.book_append_sheet(wb, wsMovements, 'Pergerakan Stok');

    XLSX.writeFile(wb, 'WMS_Laporan_Dasbor.xlsx');
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !metrics) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm font-medium text-slate-700">{error || 'Terjadi kesalahan'}</p>
        <button type="button" className="btn-secondary mt-3 inline-flex items-center gap-1.5" onClick={loadData}>
          <RefreshCcw size={14} />
          Muat Ulang
        </button>
      </div>
    );
  }

  // Data for chart
  const pipelineData = [
    {
      name: 'Pesanan Masuk',
      Menunggu: metrics.poMenungguKedatangan,
      Proses: metrics.poMenungguQC,
      Siap: metrics.poSiapDisimpan,
    },
    {
      name: 'Pesanan Keluar',
      Menunggu: metrics.soMenungguAlokasi,
      Proses: metrics.soSiapDiambil + metrics.soSiapPacking,
      Siap: metrics.soSiapKirim,
    }
  ];

  return (
    <div className="space-y-5">
      {/* HEADER BANNER */}
      <div className="card p-5 bg-gradient-to-r from-navy-900 to-navy-800 text-white border-0 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-status-success/20 text-status-success border border-status-success/30">
              Operasional Aktif
            </span>
            <span className="text-xs text-slate-300">WMS Pusat Distribusi</span>
          </div>
          <h1 className="text-lg font-bold text-white mt-1">Pusat Kendali Pergudangan</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Pantau arus logistik, saldo persediaan real-time, dan status tugas gudang hari ini.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors flex items-center gap-1.5 backdrop-blur-sm"
            onClick={exportToPDF}
          >
            <FileText size={13} />
            Export PDF
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors flex items-center gap-1.5 backdrop-blur-sm"
            onClick={exportToExcel}
          >
            <Download size={13} />
            Export Excel
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded-md bg-status-success hover:opacity-90 text-xs font-medium text-white shadow transition-colors flex items-center gap-1.5"
            onClick={() => navigate('/pengendalian/perhitungan-stok')}
          >
            <ClipboardList size={13} />
            Hitung Stok
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card p-4 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Persediaan</span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Boxes size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">{metrics.totalFisikStok.toLocaleString()}</span>
            <span className="text-xs font-medium text-slate-500">unit fisik</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{metrics.totalSKU} Barang Aktif</span>
            <span className="text-status-success font-medium">{metrics.totalStokBebas} Bebas</span>
          </div>
        </div>

        <div className="card p-4 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Peringatan Stok</span>
            <div className="w-8 h-8 rounded-lg bg-status-warningBg text-status-warning flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-status-warning">{metrics.totalProdukMenipis}</span>
            <span className="text-xs font-medium text-slate-500">barang hampir habis</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Perlu Pengisian Ulang</span>
            <button
              type="button"
              className="text-status-warning hover:opacity-90 font-medium hover:underline inline-flex items-center gap-0.5"
              onClick={() => navigate('/operasional/pengisian-ulang')}
            >
              Lihat Detail <ArrowRight size={10} />
            </button>
          </div>
        </div>

        <div className="card p-4 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tugas Karyawan</span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <ClipboardList size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">{metrics.totalTugasTertunda}</span>
            <span className="text-xs font-medium text-slate-500">tugas belum selesai</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Antrean Hari Ini</span>
            <button
              type="button"
              className="text-brand-600 hover:opacity-90 font-medium hover:underline inline-flex items-center gap-0.5"
              onClick={() => navigate('/tugas-saya')}
            >
              Buka Tugas <ArrowRight size={10} />
            </button>
          </div>
        </div>

        <div className="card p-4 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Akurasi Perhitungan</span>
            <div className="w-8 h-8 rounded-lg bg-status-successBg text-status-success flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-status-success">{metrics.akurasiOpnamePersen}%</span>
            <span className="text-xs font-medium text-slate-500">cocok dengan sistem</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{metrics.opnameMenungguPersetujuan} butuh persetujuan</span>
            <button
              type="button"
              className="text-status-success hover:opacity-90 font-medium hover:underline inline-flex items-center gap-0.5"
              onClick={() => navigate('/pengendalian/perhitungan-stok')}
            >
              Kelola <ArrowRight size={10} />
            </button>
          </div>
        </div>
      </div>

      {/* CHART & GRAPHS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="text-xs font-semibold text-slate-800 mb-4">Grafik Status Pesanan (Keluar vs Masuk)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Menunggu" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Proses" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Siap" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Summary (Replacing previous complex text boxes with simpler jargon) */}
        <div className="card p-4 flex flex-col justify-center">
           <h3 className="text-xs font-semibold text-slate-800 mb-4">Ringkasan Aktivitas Gudang</h3>
           
           <div className="space-y-4">
             <div className="flex justify-between items-center p-3 rounded-lg bg-status-successBg/50 border border-status-success/20">
               <div>
                 <span className="text-xs font-medium text-status-success">Barang Masuk Siap Disimpan</span>
                 <p className="text-[10px] text-status-success mt-0.5">Sudah lolos uji kualitas</p>
               </div>
               <span className="text-xl font-bold text-status-success">{metrics.poSiapDisimpan}</span>
             </div>

             <div className="flex justify-between items-center p-3 rounded-lg bg-status-warningBg/50 border border-status-warning/20">
               <div>
                 <span className="text-xs font-medium text-status-warning">Barang Keluar Sedang Dikemas</span>
                 <p className="text-[10px] text-status-warning mt-0.5">Proses ambil dan bungkus</p>
               </div>
               <span className="text-xl font-bold text-status-warning">{metrics.soSiapDiambil + metrics.soSiapPacking}</span>
             </div>
             
             <div className="flex justify-between items-center p-3 rounded-lg bg-brand-50/50 border border-brand-100">
               <div>
                 <span className="text-xs font-medium text-brand-700">Pesanan Siap Kirim</span>
                 <p className="text-[10px] text-brand-600 mt-0.5">Tinggal dikirim ke tujuan</p>
               </div>
               <span className="text-xl font-bold text-brand-600">{metrics.soSiapKirim}</span>
             </div>
           </div>
        </div>
      </div>

      {/* TWO COLUMN SECTION: PERINGATAN STOK MENIPIS & TUGAS OPERASIONAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card: Peringatan Stok Menipis */}
        <div className="card">
          <div className="flex items-center justify-between p-4 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-status-warning" />
              <h3 className="text-xs font-semibold text-slate-800">Peringatan Barang Hampir Habis</h3>
            </div>
            <button
              type="button"
              className="text-xs text-slate-500 hover:text-navy-900 font-medium"
              onClick={() => navigate('/operasional/persediaan')}
            >
              Lihat Semua
            </button>
          </div>

          {metrics.lowStockItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 size={24} className="mx-auto text-status-success mb-1.5" />
              Seluruh barang berada dalam batas aman.
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {metrics.lowStockItems.map((item) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-800">{item.produkNama}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">{item.lokasiPenyimpanan}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <span className="text-xs font-bold text-status-warning">
                        {item.jumlahTersedia} {item.satuan}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-medium text-slate-700 transition-colors"
                      onClick={() => navigate('/operasional/pengisian-ulang')}
                    >
                      Isi Ulang
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card: Tugas Operasional Hari Ini */}
        <div className="card">
          <div className="flex items-center justify-between p-4 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-brand-500" />
              <h3 className="text-xs font-semibold text-slate-800">Tugas Karyawan Tertunda</h3>
            </div>
            <button
              type="button"
              className="text-xs text-slate-500 hover:text-navy-900 font-medium"
              onClick={() => navigate('/tugas-saya')}
            >
              Lihat Semua
            </button>
          </div>

          {metrics.pendingTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 size={24} className="mx-auto text-status-success mb-1.5" />
              Tidak ada tugas tertunda saat ini. Semua selesai!
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {metrics.pendingTasks.map((task) => (
                <div key={task.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800">{task.judul}</span>
                      <Badge tone={PRIORITAS_TUGAS_TONE[task.prioritas]}>{task.prioritas}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-xs">{task.deskripsi}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary text-[11px] py-1 px-2.5"
                    onClick={() => navigate(task.targetUrl)}
                  >
                    Kerjakan
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RECENT STOCK MOVEMENTS AUDIT TRAIL */}
      <div className="card">
        <div className="flex items-center justify-between p-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} className="text-brand-500" />
            <h3 className="text-xs font-semibold text-slate-800">Catatan Perubahan Stok Terbaru</h3>
          </div>
          <button
            type="button"
            className="text-xs text-slate-500 hover:text-navy-900 font-medium"
            onClick={() => navigate('/operasional/pergerakan-stok')}
          >
            Lihat Lengkap
          </button>
        </div>

        {metrics.recentMovements.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">Belum ada aktivitas tercatat.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] tracking-wide text-slate-400 border-b border-surface-border bg-slate-50/50">
                  <th className="px-4 py-2.5 font-medium">Waktu</th>
                  <th className="px-4 py-2.5 font-medium">Aktivitas</th>
                  <th className="px-4 py-2.5 font-medium">Barang</th>
                  <th className="px-4 py-2.5 font-medium">Jumlah</th>
                  <th className="px-4 py-2.5 font-medium">Dari &rarr; Ke</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentMovements.map((m) => (
                  <tr key={m.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(m.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })},{' '}
                      {new Date(m.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={TIPE_MOVEMENT_TONE[m.tipe]}>{TIPE_MOVEMENT_LABEL[m.tipe]}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-800">
                      {m.produkNama}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-slate-700">
                      {m.jumlah} {m.satuan}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">
                      <span className="text-slate-500">{m.sumber}</span> &rarr;{' '}
                      <span className="font-medium text-slate-700">{m.tujuan}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-28 rounded-lg bg-slate-100 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-slate-100 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-44 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-44 rounded-lg bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}
