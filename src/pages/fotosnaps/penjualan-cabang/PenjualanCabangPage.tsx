import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCcw,
  ShoppingBag,
  Search,
  CalendarDays,
  TrendingDown,
  Store,
  PackageX,
  X,
  Check,
} from 'lucide-react';
import { useBusinessUnit } from '../../../contexts/BusinessUnitContext';
import {
  fetchPenjualanCabang,
  createPenjualanCabang,
  updatePenjualanCabang,
  deletePenjualanCabang,
  aggregatePenjualanByProduk,
} from '../../../services/penjualanCabangService';
import type { PenjualanCabang, PenjualanCabangFormValues } from '../../../services/penjualanCabangService';
import { fetchCabang } from '../../../services/cabangService';
import { fetchProduk } from '../../../services/produkService';
import type { Cabang } from '../../../types/cabang';
import type { Produk } from '../../../types/produk';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';

// ─── Helpers ───────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatTanggal(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

// ─── Form Modal ─────────────────────────────────────────────────────────────

interface FormModalProps {
  open: boolean;
  editData: PenjualanCabang | null;
  cabangList: Cabang[];
  produkList: Produk[];
  onClose: () => void;
  onSaved: () => void;
}

function PenjualanFormModal({
  open,
  editData,
  cabangList,
  produkList,
  onClose,
  onSaved,
}: FormModalProps) {
  const [tanggal, setTanggal] = useState(todayStr());
  const [cabangId, setCabangId] = useState('');
  const [catatan, setCatatan] = useState('');
  const [rows, setRows] = useState<{ produkId: string; jumlah: string; satuan: string }[]>([
    { produkId: '', jumlah: '', satuan: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (editData) {
      setTanggal(editData.tanggal.slice(0, 10));
      setCabangId(editData.cabangId);
      setCatatan(editData.catatan ?? '');
      setRows(
        editData.items.map((it) => ({
          produkId: it.produkId,
          jumlah: String(it.jumlah),
          satuan: it.satuan,
        })),
      );
    } else {
      setTanggal(todayStr());
      setCabangId('');
      setCatatan('');
      setRows([{ produkId: '', jumlah: '', satuan: '' }]);
    }
    setError(null);
  }, [open, editData]);

  function updateRow(idx: number, patch: Partial<(typeof rows)[0]>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { produkId: '', jumlah: '', satuan: '' }]);
  }

  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    if (!cabangId) { setError('Pilih cabang terlebih dahulu.'); return; }
    if (!tanggal) { setError('Tanggal wajib diisi.'); return; }
    const validRows = rows.filter((r) => r.produkId && Number(r.jumlah) > 0);
    if (validRows.length === 0) { setError('Tambahkan minimal 1 produk dengan jumlah > 0.'); return; }

    const cabang = cabangList.find((c) => c.id === cabangId);
    const produkMap = Object.fromEntries(
      produkList.map((p) => [p.id, { nama: p.namaProduk, kode: p.kodeProduk }]),
    );
    const values: PenjualanCabangFormValues = {
      tanggal,
      cabangId,
      catatan,
      items: validRows,
    };

    setSubmitting(true);
    setError(null);
    try {
      if (editData) {
        await updatePenjualanCabang(editData.id, values, cabang?.namaCabang ?? '', produkMap);
      } else {
        await createPenjualanCabang(values, cabang?.namaCabang ?? '', produkMap);
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-brand-500" />
            <h2 className="text-sm font-semibold text-slate-800">
              {editData ? 'Edit Penjualan' : 'Tambah Penjualan Cabang'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {error && (
            <div className="text-xs text-status-danger bg-status-dangerBg rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Tanggal *</label>
              <input
                type="date"
                className="input-field"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="label-field">Cabang *</label>
              <select
                className="input-field"
                value={cabangId}
                onChange={(e) => setCabangId(e.target.value)}
                disabled={submitting}
              >
                <option value="">Pilih Cabang</option>
                {cabangList.filter((c) => c.status === 'aktif').map((c) => (
                  <option key={c.id} value={c.id}>{c.namaCabang}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label-field mb-0">Produk Terjual</label>
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
                disabled={submitting}
              >
                <Plus size={13} /> Tambah Baris
              </button>
            </div>

            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400 px-1">
                <span className="col-span-5">Produk</span>
                <span className="col-span-3">Jumlah</span>
                <span className="col-span-3">Satuan</span>
                <span className="col-span-1"></span>
              </div>

              {rows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <select
                    className="input-field col-span-5 text-xs"
                    value={row.produkId}
                    onChange={(e) => updateRow(idx, { produkId: e.target.value })}
                    disabled={submitting}
                  >
                    <option value="">Pilih produk</option>
                    {produkList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.kodeProduk} — {p.namaProduk}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    className="input-field col-span-3 text-xs"
                    placeholder="0"
                    value={row.jumlah}
                    onChange={(e) => updateRow(idx, { jumlah: e.target.value })}
                    disabled={submitting}
                  />
                  <input
                    type="text"
                    className="input-field col-span-3 text-xs"
                    placeholder="Lembar, Pcs..."
                    value={row.satuan}
                    onChange={(e) => updateRow(idx, { satuan: e.target.value })}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    disabled={rows.length === 1 || submitting}
                    className="col-span-1 flex items-center justify-center text-slate-300 hover:text-status-danger disabled:opacity-30"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="label-field">Catatan (opsional)</label>
            <textarea
              className="input-field resize-none"
              rows={2}
              placeholder="Catatan tambahan..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              disabled={submitting}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-surface-border">
          <button className="btn-secondary" onClick={onClose} disabled={submitting}>
            Batal
          </button>
          <button className="btn-primary flex items-center gap-1.5" onClick={handleSubmit} disabled={submitting}>
            <Check size={14} />
            {submitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PenjualanCabangPage() {
  const { activeUnit } = useBusinessUnit();

  const [data, setData] = useState<PenjualanCabang[]>([]);
  const [cabangList, setCabangList] = useState<Cabang[]>([]);
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCabang, setFilterCabang] = useState('');
  const [filterMulai, setFilterMulai] = useState('');
  const [filterSampai, setFilterSampai] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PenjualanCabang | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PenjualanCabang | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Guard: hanya Fotosnaps
  if (activeUnit !== 'FOTOSNAPS') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <PackageX size={48} className="text-slate-300 mb-4" />
        <p className="text-slate-600 font-semibold">Fitur ini khusus Fotosnaps</p>
        <p className="text-slate-400 text-sm mt-1">
          Ganti unit bisnis ke Fotosnaps untuk mengakses Penjualan Cabang.
        </p>
      </div>
    );
  }

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [penjualan, cabangs, produks] = await Promise.all([
        fetchPenjualanCabang(),
        fetchCabang(),
        fetchProduk({ unitBisnis: 'FOTOSNAPS' }),
      ]);
      setData(penjualan.sort((a, b) => b.tanggal.localeCompare(a.tanggal)));
      setCabangList(cabangs);
      setProdukList(produks);
    } catch {
      setError('Gagal memuat data. Pastikan koneksi dan server aktif.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => {
    return data.filter((rec) => {
      if (filterCabang && rec.cabangId !== filterCabang) return false;
      if (filterMulai && rec.tanggal.slice(0, 10) < filterMulai) return false;
      if (filterSampai && rec.tanggal.slice(0, 10) > filterSampai) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchCabang = rec.cabangNama.toLowerCase().includes(q);
        const matchProduk = rec.items.some((i) => i.produkNama.toLowerCase().includes(q));
        if (!matchCabang && !matchProduk) return false;
      }
      return true;
    });
  }, [data, filterCabang, filterMulai, filterSampai, searchTerm]);

  // KPI
  const totalTransaksi = filtered.length;
  const totalItemTerjual = filtered.reduce((s, r) => s + r.items.reduce((ss, i) => ss + i.jumlah, 0), 0);
  const aggregasiProduk = useMemo(() => aggregatePenjualanByProduk(filtered), [filtered]);
  const produkTerlaris = useMemo(() => {
    const entries = Object.entries(aggregasiProduk).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return '-';
    const topProdukId = entries[0][0];
    return produkList.find((p) => p.id === topProdukId)?.namaProduk ?? '-';
  }, [aggregasiProduk, produkList]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePenjualanCabang(deleteTarget.id);
      await loadData();
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          icon={<ShoppingBag size={20} className="text-brand-500" />}
          label="Total Transaksi"
          value={totalTransaksi}
          bg="bg-brand-50"
        />
        <KpiCard
          icon={<TrendingDown size={20} className="text-orange-500" />}
          label="Total Unit Terjual"
          value={totalItemTerjual.toLocaleString('id-ID')}
          bg="bg-orange-50"
        />
        <KpiCard
          icon={<Store size={20} className="text-emerald-500" />}
          label="Produk Terlaris"
          value={produkTerlaris}
          bg="bg-emerald-50"
          small
        />
      </div>

      {/* Main Card */}
      <div className="card">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-surface-border">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari cabang / produk..."
                className="input-field pl-8 text-xs w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Cabang */}
            <select
              className="input-field text-xs w-auto"
              value={filterCabang}
              onChange={(e) => setFilterCabang(e.target.value)}
            >
              <option value="">Semua Cabang</option>
              {cabangList.map((c) => (
                <option key={c.id} value={c.id}>{c.namaCabang}</option>
              ))}
            </select>

            {/* Filter Tanggal */}
            <div className="flex items-center gap-1.5">
              <CalendarDays size={13} className="text-slate-400" />
              <input type="date" className="input-field text-xs py-1.5 px-2" value={filterMulai} onChange={(e) => setFilterMulai(e.target.value)} />
              <span className="text-slate-400 text-xs">—</span>
              <input type="date" className="input-field text-xs py-1.5 px-2" value={filterSampai} onChange={(e) => setFilterSampai(e.target.value)} />
            </div>

            {(filterCabang || filterMulai || filterSampai || searchTerm) && (
              <button
                className="text-xs text-slate-400 hover:text-slate-600 underline"
                onClick={() => { setFilterCabang(''); setFilterMulai(''); setFilterSampai(''); setSearchTerm(''); }}
              >
                Reset
              </button>
            )}
          </div>

          <button
            className="btn-primary flex items-center gap-1.5 shrink-0"
            onClick={() => { setEditingItem(null); setFormOpen(true); }}
          >
            <Plus size={14} /> Tambah Penjualan
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 rounded-md bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <PackageX size={36} className="text-status-danger" />
            <p className="text-sm text-slate-600">{error}</p>
            <button className="btn-secondary flex items-center gap-1.5 text-xs" onClick={loadData}>
              <RefreshCcw size={13} /> Coba Lagi
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <ShoppingBag size={36} className="text-slate-300" />
            <p className="text-sm text-slate-500">Belum ada data penjualan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-surface-border">
                  <th className="px-4 py-2.5 font-medium">Tanggal</th>
                  <th className="px-4 py-2.5 font-medium">Cabang</th>
                  <th className="px-4 py-2.5 font-medium">Produk Terjual</th>
                  <th className="px-4 py-2.5 font-medium text-right">Total Unit</th>
                  <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rec) => (
                  <tr key={rec.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                      {formatTanggal(rec.tanggal)}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-800">
                      {rec.cabangNama}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {rec.items.map((it, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]"
                          >
                            {it.produkNama}
                            <span className="text-slate-400">×{it.jumlah}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-right text-slate-800">
                      {rec.items.reduce((s, i) => s + i.jumlah, 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          onClick={() => { setEditingItem(rec); setFormOpen(true); }}
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-status-danger hover:bg-status-dangerBg transition-colors"
                          onClick={() => setDeleteTarget(rec)}
                          title="Hapus"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-4 py-2 border-t border-surface-border bg-slate-50/50 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Menampilkan {filtered.length} dari {data.length} transaksi
            </span>
            <button
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700"
              onClick={loadData}
            >
              <RefreshCcw size={11} /> Refresh
            </button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <PenjualanFormModal
        open={formOpen}
        editData={editingItem}
        cabangList={cabangList}
        produkList={produkList}
        onClose={() => setFormOpen(false)}
        onSaved={loadData}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Penjualan"
        description={`Data penjualan cabang "${deleteTarget?.cabangNama}" tanggal ${formatTanggal(deleteTarget?.tanggal ?? '')} akan dihapus permanen. Lanjutkan?`}
        confirmLabel="Ya, Hapus"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  bg,
  small,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bg: string;
  small?: boolean;
}) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className={`font-bold text-slate-800 truncate ${small ? 'text-sm' : 'text-2xl'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
