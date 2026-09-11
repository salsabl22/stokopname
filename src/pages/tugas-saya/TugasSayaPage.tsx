import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  CheckCircle,
  Clock,
  ArrowRight,
  RefreshCcw,
  CheckCircle2,
  ListTodo,
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { ToastContainer } from '../../components/ui/Toast';
import { useToast } from '../../utils/useToast';
import { fetchAllTasks, updateTaskStatus } from '../../services/taskService';
import type { StatusTugas, UserTask } from '../../types/task';
import {
  PRIORITAS_TUGAS_TONE,
  STATUS_TUGAS_LABEL,
  STATUS_TUGAS_TONE,
  TIPE_TUGAS_LABEL,
} from '../../types/task';

export default function TugasSayaPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipe, setFilterTipe] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPrioritas, setFilterPrioritas] = useState<string>('all');

  const { toasts, showToast, dismissToast } = useToast();

  async function loadTasks() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllTasks();
      setTasks(data);
    } catch {
      setError('Gagal memuat daftar tugas operasional.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        t.nomorTugas.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.referensiNomor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.assignee.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTipe = filterTipe === 'all' || t.tipe === filterTipe;
      const matchStatus = filterStatus === 'all' || t.status.toLowerCase() === filterStatus.toLowerCase();
      const matchPrioritas = filterPrioritas === 'all' || t.prioritas.toLowerCase() === filterPrioritas.toLowerCase();

      return matchSearch && matchTipe && matchStatus && matchPrioritas;
    });
  }, [tasks, searchTerm, filterTipe, filterStatus, filterPrioritas]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => ['MENUNGGU', 'DITUGASKAN', 'DIKERJAKAN', 'tertunda', 'dikerjakan'].includes(t.status)).length;
    const highPriority = tasks.filter((t) => ['tinggi', 'TINGGI'].includes(t.prioritas) && !['selesai', 'SELESAI'].includes(t.status)).length;
    const completed = tasks.filter((t) => ['selesai', 'SELESAI'].includes(t.status)).length;
    return { total, pending, highPriority, completed };
  }, [tasks]);

  async function handleToggleStatus(task: UserTask) {
    const isSelesai = ['selesai', 'SELESAI'].includes(task.status);
    const nextStatus: StatusTugas = isSelesai ? 'DITUGASKAN' : 'SELESAI';
    try {
      await updateTaskStatus(task.id, nextStatus);
      await loadTasks();
      showToast(
        'success',
        `Tugas ${task.nomorTugas} ditandai ${nextStatus === 'SELESAI' ? 'Selesai' : 'Ditugaskan'}.`,
      );
    } catch {
      showToast('error', 'Gagal memperbarui status tugas.');
    }
  }

  return (
    <div className="space-y-4">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Total Tugas</span>
            <span className="text-xl font-bold text-slate-800 mt-0.5 block">{stats.total}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <ClipboardList size={16} />
          </div>
        </div>

        <div className="card p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Tugas Tertunda</span>
            <span className="text-xl font-bold text-amber-600 mt-0.5 block">{stats.pending}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={16} />
          </div>
        </div>

        <div className="card p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Prioritas Tinggi</span>
            <span className="text-xl font-bold text-rose-600 mt-0.5 block">{stats.highPriority}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <ListTodo size={16} />
          </div>
        </div>

        <div className="card p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Selesai Dikerjakan</span>
            <span className="text-xl font-bold text-emerald-600 mt-0.5 block">{stats.completed}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={16} />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CARD */}
      <div className="card">
        <div className="p-4 border-b border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor tugas, ref, atau judul..."
              className="input-field pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tipe Filter */}
            <select
              className="input-field text-xs py-1.5 px-2.5 w-auto"
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value)}
            >
              <option value="all">Semua Tipe</option>
              <option value="penerimaan">Penerimaan</option>
              <option value="penyimpanan">Penyimpanan</option>
              <option value="pengambilan">Pengambilan</option>
              <option value="packing">Packing</option>
              <option value="perhitungan_stok">Stock Opname</option>
              <option value="persetujuan">Persetujuan</option>
            </select>

            {/* Status Filter */}
            <select
              className="input-field text-xs py-1.5 px-2.5 w-auto"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="MENUNGGU">Menunggu</option>
              <option value="DITUGASKAN">Ditugaskan</option>
              <option value="DIKERJAKAN">Sedang Dikerjakan</option>
              <option value="SELESAI">Selesai</option>
              <option value="TERLAMBAT">Terlambat</option>
            </select>

            {/* Prioritas Filter */}
            <select
              className="input-field text-xs py-1.5 px-2.5 w-auto"
              value={filterPrioritas}
              onChange={(e) => setFilterPrioritas(e.target.value)}
            >
              <option value="all">Semua Prioritas</option>
              <option value="TINGGI">Tinggi</option>
              <option value="NORMAL">Normal</option>
              <option value="RENDAH">Rendah</option>
            </select>

            <button type="button" className="btn-secondary py-1.5 px-2.5 text-xs" onClick={loadTasks}>
              <RefreshCcw size={13} />
            </button>
          </div>
        </div>

        {/* TASK LIST TABLE */}
        {loading ? (
          <div className="p-4 space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 rounded-md bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-slate-700">{error}</p>
            <button type="button" className="btn-secondary mt-3 inline-flex items-center gap-1.5" onClick={loadTasks}>
              <RefreshCcw size={14} /> Coba Lagi
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <ClipboardList size={20} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700">Tidak ada tugas yang sesuai kriteria</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Coba sesuaikan kata kunci pencarian atau ubah filter tipe dan status tugas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-surface-border bg-slate-50/50">
                  <th className="px-4 py-2.5 font-medium">No. Tugas</th>
                  <th className="px-4 py-2.5 font-medium">Tipe & Judul</th>
                  <th className="px-4 py-2.5 font-medium">Referensi</th>
                  <th className="px-4 py-2.5 font-medium">Prioritas</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Petugas</th>
                  <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((t) => (
                  <tr key={t.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-xs font-mono font-medium text-slate-800">{t.nomorTugas}</td>
                    <td className="px-4 py-2.5">
                      <div className="text-xs font-medium text-slate-800">{t.judul}</div>
                      <div className="text-[11px] text-slate-500">{TIPE_TUGAS_LABEL[t.tipe]}</div>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-600">{t.referensiNomor}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone={PRIORITAS_TUGAS_TONE[t.prioritas]}>{t.prioritas}</Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge tone={STATUS_TUGAS_TONE[t.status] || 'neutral'}>{STATUS_TUGAS_LABEL[t.status] || t.status}</Badge>
                        {t.deadline && (
                           <span className={`text-[10px] ${new Date(t.deadline) < new Date() && !['SELESAI','selesai'].includes(t.status) ? 'text-rose-500 font-medium' : 'text-slate-500'}`}>
                             Batas: {new Date(t.deadline).toLocaleDateString('id-ID')}
                           </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{t.assignee}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          className="btn-secondary text-[11px] py-1 px-2"
                          onClick={() => handleToggleStatus(t)}
                          title="Ubah Status Selesai"
                        >
                          <CheckCircle size={12} className={['selesai', 'SELESAI'].includes(t.status) ? 'text-emerald-600' : 'text-slate-400'} />
                        </button>
                        <button
                          type="button"
                          className="btn-primary text-[11px] py-1 px-2.5 flex items-center gap-1"
                          onClick={() => navigate(t.targetUrl)}
                        >
                          Buka <ArrowRight size={11} />
                        </button>
                      </div>
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
