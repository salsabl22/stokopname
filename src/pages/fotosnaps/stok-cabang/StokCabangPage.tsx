import { useEffect, useState, useMemo } from 'react';
import {
  RefreshCcw,
  Scale,
  PackageX,
  TrendingDown,
  TrendingUp,
  Minus,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Store,
  AlertTriangle,
} from 'lucide-react';
import { useBusinessUnit } from '../../../contexts/BusinessUnitContext';
import { fetchStokCabang } from '../../../services/stokCabangService';
import type { StokCabang } from '../../../services/stokCabangService';

// ─── Helpers ───────────────────────────────────────────────────────────────

function getMonthRange(): { start: string; end: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
  return { start: `${y}-${m}-01`, end: `${y}-${m}-${lastDay}` };
}

function StokBadge({ nilai }: { nilai: number }) {
  if (nilai > 0)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
        <TrendingUp size={10} /> {nilai.toLocaleString('id-ID')}
      </span>
    );
  if (nilai < 0)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-600">
        <AlertTriangle size={10} /> {nilai.toLocaleString('id-ID')}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
      <Minus size={10} /> 0
    </span>
  );
}

// ─── Cabang Card ─────────────────────────────────────────────────────────────

function CabangCard({ cabang }: { cabang: StokCabang }) {
  const [expanded, setExpanded] = useState(true);
  const warningCount = cabang.items.filter((i) => i.sisaStok < 0).length;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/60 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
            <Store size={18} className="text-brand-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{cabang.cabangNama}</p>
            <p className="text-[11px] text-slate-400">
              {cabang.items.length} produk
              {warningCount > 0 && (
                <span className="ml-2 text-red-500 font-medium">
                  · {warningCount} stok minus
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 mr-2">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Masuk</p>
            <p className="text-sm font-bold text-emerald-600">{cabang.totalMasuk.toLocaleString('id-ID')}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Keluar</p>
            <p className="text-sm font-bold text-orange-500">{cabang.totalKeluar.toLocaleString('id-ID')}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Sisa Stok</p>
            <p className={`text-sm font-bold ${cabang.totalSisa >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
              {cabang.totalSisa.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="text-slate-400">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        </div>
      </button>

      {/* Detail Table */}
      {expanded && (
        <div className="border-t border-surface-border overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-slate-400 bg-slate-50/70">
                <th className="px-4 py-2 font-medium">Kode</th>
                <th className="px-4 py-2 font-medium">Nama Produk</th>
                <th className="px-4 py-2 font-medium text-right">Satuan</th>
                <th className="px-4 py-2 font-medium text-right">
                  <span className="inline-flex items-center gap-1">
                    <TrendingUp size={10} /> Masuk
                  </span>
                </th>
                <th className="px-4 py-2 font-medium text-right">
                  <span className="inline-flex items-center gap-1">
                    <TrendingDown size={10} /> Keluar
                  </span>
                </th>
                <th className="px-4 py-2 font-medium text-right">Sisa Stok</th>
                <th className="px-4 py-2 font-medium text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {cabang.items.map((item) => {
                const isNegative = item.sisaStok < 0;
                return (
                  <tr
                    key={item.produkId}
                    className={`border-b border-surface-border last:border-0 transition-colors ${
                      isNegative ? 'bg-red-50/40' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <td className="px-4 py-2.5 text-[11px] text-slate-500 font-mono">
                      {item.produkKode}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-800">
                      {item.produkNama}
                      {isNegative && (
                        <span className="ml-1.5 text-[10px] text-red-500 font-normal">⚠ minus</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500 text-right">
                      {item.satuan}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-right font-medium text-emerald-600">
                      {item.barangMasuk.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-right font-medium text-orange-500">
                      {item.barangKeluar.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-right font-bold text-slate-800">
                      {item.sisaStok.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <StokBadge nilai={item.sisaStok} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Subtotal baris */}
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                <td className="px-4 py-2.5 text-xs text-slate-500 italic" colSpan={3}>
                  Total {cabang.cabangNama}
                </td>
                <td className="px-4 py-2.5 text-xs text-right text-emerald-600">
                  {cabang.totalMasuk.toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-2.5 text-xs text-right text-orange-500">
                  {cabang.totalKeluar.toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-2.5 text-xs text-right text-slate-800">
                  {cabang.totalSisa.toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <StokBadge nilai={cabang.totalSisa} />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function StokCabangPage() {
  const { activeUnit } = useBusinessUnit();
  const { start, end } = getMonthRange();

  const [data, setData] = useState<StokCabang[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMulai, setFilterMulai] = useState(start);
  const [filterSampai, setFilterSampai] = useState(end);

  // Guard: hanya Fotosnaps
  if (activeUnit !== 'FOTOSNAPS') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <PackageX size={48} className="text-slate-300 mb-4" />
        <p className="text-slate-600 font-semibold">Fitur ini khusus Fotosnaps</p>
        <p className="text-slate-400 text-sm mt-1">
          Ganti unit bisnis ke Fotosnaps untuk mengakses Perhitungan Stok Cabang.
        </p>
      </div>
    );
  }

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchStokCabang({
        startDate: filterMulai || undefined,
        endDate: filterSampai || undefined,
      });
      setData(result);
    } catch {
      setError('Gagal memuat data stok cabang.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [filterMulai, filterSampai]);

  // Ringkasan global
  const summary = useMemo(() => ({
    totalMasuk: data.reduce((s, c) => s + c.totalMasuk, 0),
    totalKeluar: data.reduce((s, c) => s + c.totalKeluar, 0),
    totalSisa: data.reduce((s, c) => s + c.totalSisa, 0),
    totalCabang: data.length,
    cabangMinus: data.filter((c) => c.totalSisa < 0).length,
  }), [data]);

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Cabang Aktif" value={summary.totalCabang} color="text-brand-600" icon={<Store size={16} />} />
        <SummaryCard label="Total Masuk (Pengiriman)" value={summary.totalMasuk} color="text-emerald-600" icon={<TrendingUp size={16} />} />
        <SummaryCard label="Total Keluar (Penjualan)" value={summary.totalKeluar} color="text-orange-500" icon={<TrendingDown size={16} />} />
        <SummaryCard
          label="Sisa Stok Keseluruhan"
          value={summary.totalSisa}
          color={summary.totalSisa >= 0 ? 'text-slate-800' : 'text-red-600'}
          icon={<Scale size={16} />}
          warn={summary.cabangMinus > 0}
          warnText={`${summary.cabangMinus} cabang minus`}
        />
      </div>

      {/* Filter */}
      <div className="card px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <CalendarDays size={14} className="text-slate-400" />
          <label className="text-xs text-slate-500">Periode:</label>
          <input
            type="date"
            className="input-field text-xs py-1.5 px-2"
            value={filterMulai}
            onChange={(e) => setFilterMulai(e.target.value)}
          />
          <span className="text-slate-400 text-xs">—</span>
          <input
            type="date"
            className="input-field text-xs py-1.5 px-2"
            value={filterSampai}
            onChange={(e) => setFilterSampai(e.target.value)}
          />
          <button
            className="text-xs text-slate-400 hover:text-slate-600 underline"
            onClick={() => { setFilterMulai(start); setFilterSampai(end); }}
          >
            Bulan ini
          </button>
        </div>
        <button
          className="btn-secondary flex items-center gap-1.5 text-xs"
          onClick={loadData}
        >
          <RefreshCcw size={13} /> Refresh
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-[11px] text-slate-500 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          Barang Masuk = Pengiriman dari gudang pusat ke cabang
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-400" />
          Barang Keluar = Penjualan dari cabang ke konsumen
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-40 animate-pulse bg-slate-50" />
          ))}
        </div>
      ) : error ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3">
          <PackageX size={36} className="text-status-danger" />
          <p className="text-sm text-slate-600">{error}</p>
          <button className="btn-secondary flex items-center gap-1.5 text-xs" onClick={loadData}>
            <RefreshCcw size={13} /> Coba Lagi
          </button>
        </div>
      ) : data.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3">
          <Scale size={40} className="text-slate-300" />
          <p className="text-sm text-slate-500">Belum ada data stok cabang untuk periode ini</p>
          <p className="text-xs text-slate-400">
            Data akan muncul setelah ada pengiriman (SO terkirim) dan/atau penjualan cabang.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((cabang) => (
            <CabangCard key={cabang.cabangId} cabang={cabang} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Summary Card ──────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  color,
  icon,
  warn,
  warnText,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  warn?: boolean;
  warnText?: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </span>
        <span className={`${color} opacity-70`}>{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString('id-ID')}</p>
      {warn && warnText && (
        <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
          <AlertTriangle size={10} /> {warnText}
        </p>
      )}
    </div>
  );
}
