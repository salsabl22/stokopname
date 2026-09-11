import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X, UserCheck, UserX, RefreshCcw, Settings } from 'lucide-react';
import {
  fetchUsers,
  fetchRoles,
  createUser,
  updateUser,
  deleteUser,
  updateUserPermissions,
  updateRolePermissions,
  activateUser,
} from '../../services/adminService';
import { fetchMasterStatuses, createStatus, updateStatus, deleteStatus } from '../../services/statusMasterService';
import type { MasterStatus } from '../../services/statusMasterService';
import { useAuth } from '../../contexts/AuthContext';

type AdminTab = 'pengguna' | 'pendaftaran' | 'peran' | 'khusus' | 'status' | 'pengaturan';

const MODULS = [
  { key: 'data_master', label: 'Data Master' },
  { key: 'barang_masuk', label: 'Barang Masuk' },
  { key: 'operasional', label: 'Operasional' },
  { key: 'barang_keluar', label: 'Barang Keluar' },
  { key: 'stock_opname', label: 'Pengendalian Stok' },
  { key: 'laporan', label: 'Laporan' },
  { key: 'pengaturan_sistem', label: 'Pengaturan Sistem' },
];
const AKSI_LIST = ['lihat', 'buat', 'ubah', 'hapus', 'proses', 'setujui', 'export'] as const;

export default function AdministrasiPage() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('pengguna');
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<MasterStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status form state
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [statusForm, setStatusForm] = useState<Partial<MasterStatus>>({ modul: 'PO', kode: '', label: '', tone: 'neutral' });
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);

  // User form state
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', name: '', password: '', roleId: '', isActive: true });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Approve modal state
  const [approvingUser, setApprovingUser] = useState<any | null>(null);
  const [approveRoleId, setApproveRoleId] = useState('');

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [userRes, roleRes, statusRes] = await Promise.all([
        fetchUsers(),
        fetchRoles(),
        fetchMasterStatuses().catch(() => []),
      ]);
      setUsers(userRes);
      setRoles(roleRes);
      setStatuses(statusRes);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat data administrasi.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  // --- User handlers ---
  async function handleSaveUser() {
    try {
      if (editingUserId) {
        await updateUser(editingUserId, userForm);
      } else {
        await createUser(userForm);
      }
      setShowUserForm(false);
      setEditingUserId(null);
      setUserForm({ username: '', name: '', password: '', roleId: '', isActive: true });
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Gagal menyimpan pengguna.');
    }
  }

  async function handleDeleteUser(id: string) {
    if (!confirm('Yakin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      await deleteUser(id);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Gagal menghapus pengguna.');
    }
  }

  function handleEditUser(u: any) {
    setUserForm({ username: u.username, name: u.name, password: '', roleId: u.roleId || '', isActive: u.isActive });
    setEditingUserId(u.id);
    setShowUserForm(true);
  }

  async function handleToggleUserPermission(userId: string, modul: string, aksi: string, currentVal: boolean) {
    try {
      const u = users.find(x => x.id === userId);
      const rolePerm = u.role?.permissions?.find((p: any) => p.modul === modul || p.modul === 'semua');
      const existingUserPerm = u.userPermissions?.find((p: any) => p.modul === modul);
      // Kalau belum ada override untuk modul ini, mulai dari nilai efektif
      // peran saat ini — supaya toggle 1 aksi tidak diam-diam mencabut
      // aksi lain yang sudah didapat user dari perannya.
      const base = existingUserPerm || {
        lihat: rolePerm?.lihat ?? false,
        buat: rolePerm?.buat ?? false,
        ubah: rolePerm?.ubah ?? false,
        hapus: rolePerm?.hapus ?? false,
        proses: rolePerm?.proses ?? false,
        setujui: rolePerm?.setujui ?? false,
        export: rolePerm?.export ?? false,
      };

      await updateUserPermissions(userId, { modul, ...base, [aksi]: !currentVal });
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Gagal mengubah hak akses.');
    }
  }

  async function handleToggleRolePermission(roleId: string, modul: string, aksi: string, currentVal: boolean) {
    try {
      const role = roles.find(r => r.id === roleId);
      const existingPerm = role?.permissions?.find((p: any) => p.modul === modul || p.modul === 'semua');
      const base = existingPerm || {
        lihat: false, buat: false, ubah: false, hapus: false, proses: false, setujui: false, export: false,
      };

      await updateRolePermissions(roleId, { modul, ...base, [aksi]: !currentVal });
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Gagal mengubah hak akses peran.');
    }
  }

  // --- Approve/Reject handlers ---
  async function handleApproveUser() {
    if (!approvingUser) return;
    try {
      await activateUser(approvingUser.id, true, approveRoleId || undefined);
      setApprovingUser(null);
      setApproveRoleId('');
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Gagal mengaktifkan pengguna.');
    }
  }

  async function handleRejectUser(id: string) {
    if (!confirm('Tolak pendaftaran ini? Pengguna akan tetap terdaftar tapi tidak bisa login.')) return;
    try {
      await activateUser(id, false);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Gagal menolak pendaftaran.');
    }
  }

  // --- Status handlers ---
  async function handleSaveStatus() {
    try {
      if (editingStatusId) {
        await updateStatus(editingStatusId, statusForm);
      } else {
        if (!statusForm.kode || !statusForm.label) throw new Error('Kode dan Label wajib diisi.');
        await createStatus(statusForm as any);
      }
      setShowStatusForm(false);
      setEditingStatusId(null);
      setStatusForm({ modul: 'PO', kode: '', label: '', tone: 'neutral' });
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Gagal menyimpan status.');
    }
  }

  async function handleDeleteStatus(id: string) {
    if (!confirm('Yakin menghapus status ini?')) return;
    try {
      await deleteStatus(id);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Gagal menghapus status.');
    }
  }

  function handleEditStatus(s: MasterStatus) {
    setStatusForm({ modul: s.modul, kode: s.kode, label: s.label, tone: s.tone });
    setEditingStatusId(s.id);
    setShowStatusForm(true);
  }

  const activeUsers = users.filter(u => u.isActive);
  const pendingUsers = users.filter(u => !u.isActive);

  const TABS: { id: AdminTab; label: string; count?: number }[] = [
    { id: 'pengguna', label: 'Pengguna Aktif', count: activeUsers.length },
    { id: 'pendaftaran', label: 'Pendaftaran Baru', count: pendingUsers.length },
    { id: 'peran', label: 'Peran & Akses' },
    { id: 'khusus', label: 'Akses Khusus' },
    { id: 'status', label: 'Status Operasional' },
    { id: 'pengaturan', label: 'Pengaturan' },
  ];

  return (
    <div className="space-y-4">
      <div className="card">
        {/* Tabs */}
        <div className="flex gap-0 border-b border-surface-border overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full text-[10px] font-bold ${
                  tab.id === 'pendaftaran' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
          <div className="ml-auto flex items-center pr-4">
            <button
              type="button"
              onClick={loadData}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              title="Muat ulang data"
            >
              <RefreshCcw size={14} />
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border-b border-red-100">
            {error} —{' '}
            <button type="button" onClick={loadData} className="underline">
              Coba lagi
            </button>
          </div>
        )}

        {/* ========== PENGGUNA AKTIF TAB ========== */}
        {activeTab === 'pengguna' && (
          <div>
            <div className="p-4 flex justify-between items-center border-b border-surface-border">
              <span className="text-xs text-slate-500">{activeUsers.length} pengguna aktif</span>
              <button
                type="button"
                className="btn-primary flex items-center gap-1.5 text-xs"
                onClick={() => {
                  setShowUserForm(true);
                  setEditingUserId(null);
                  setUserForm({ username: '', name: '', password: '', roleId: '', isActive: true });
                }}
              >
                <Plus size={14} /> Tambah Pengguna
              </button>
            </div>

            {showUserForm && (
              <div className="p-4 border-b border-surface-border bg-blue-50/30">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="label-field">Username</label>
                    <input className="input-field" value={userForm.username} onChange={e => setUserForm(p => ({ ...p, username: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label-field">Nama Lengkap</label>
                    <input className="input-field" value={userForm.name} onChange={e => setUserForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label-field">Password {editingUserId && '(kosongkan jika tidak diubah)'}</label>
                    <input className="input-field" type="password" value={userForm.password} onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label-field">Peran (Role)</label>
                    <select className="input-field" value={userForm.roleId} onChange={e => setUserForm(p => ({ ...p, roleId: e.target.value }))}>
                      <option value="">-- Pilih Peran --</option>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button type="button" className="btn-secondary flex items-center gap-1.5 text-xs" onClick={() => setShowUserForm(false)}>
                    <X size={12} /> Batal
                  </button>
                  <button type="button" className="btn-primary flex items-center gap-1.5 text-xs" onClick={handleSaveUser}>
                    <Check size={12} /> Simpan
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-9 bg-slate-100 rounded-md animate-pulse" />)}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] uppercase text-slate-400 border-b border-surface-border">
                      <th className="px-4 py-2.5 font-medium">Nama</th>
                      <th className="px-4 py-2.5 font-medium">Username</th>
                      <th className="px-4 py-2.5 font-medium">Peran</th>
                      <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeUsers.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-xs text-slate-400">Belum ada pengguna aktif</td></tr>
                    ) : activeUsers.map(u => (
                      <tr key={u.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                        <td className="px-4 py-2.5 text-xs font-medium text-slate-800">{u.name}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">@{u.username}</td>
                        <td className="px-4 py-2.5 text-xs">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-700">
                            {u.role?.name || 'Tanpa peran'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex justify-end gap-1">
                            {/* Jangan izinkan edit/hapus diri sendiri */}
                            {u.id !== currentUser?.id && (
                              <>
                                <button type="button" className="btn-secondary p-1.5" onClick={() => handleEditUser(u)} title="Edit">
                                  <Pencil size={12} />
                                </button>
                                <button type="button" className="btn-secondary p-1.5 text-status-danger" onClick={() => handleDeleteUser(u.id)} title="Hapus">
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========== PENDAFTARAN BARU TAB ========== */}
        {activeTab === 'pendaftaran' && (
          <div>
            <div className="p-4 border-b border-surface-border">
              <p className="text-xs text-slate-500">
                Pengguna berikut sudah mendaftar dan menunggu persetujuan. Pilih peran lalu klik <strong>Setujui</strong>.
              </p>
            </div>

            {/* Approve modal */}
            {approvingUser && (
              <div className="p-4 border-b border-amber-200 bg-amber-50">
                <p className="text-xs font-semibold text-amber-800 mb-2">
                  Setujui pendaftaran: <span className="font-mono">{approvingUser.username}</span> ({approvingUser.name})
                </p>
                <div className="flex items-center gap-3">
                  <select
                    className="input-field flex-1 max-w-xs"
                    value={approveRoleId}
                    onChange={e => setApproveRoleId(e.target.value)}
                  >
                    <option value="">-- Pilih Peran (opsional) --</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                  <button type="button" className="btn-primary flex items-center gap-1.5 text-xs" onClick={handleApproveUser}>
                    <UserCheck size={12} /> Setujui & Aktifkan
                  </button>
                  <button type="button" className="btn-secondary text-xs" onClick={() => setApprovingUser(null)}>
                    Batal
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-9 bg-slate-100 rounded-md animate-pulse" />)}</div>
            ) : pendingUsers.length === 0 ? (
              <div className="p-12 text-center">
                <UserCheck size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">Tidak ada pendaftaran yang menunggu</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] uppercase text-slate-400 border-b border-surface-border">
                      <th className="px-4 py-2.5 font-medium">Nama</th>
                      <th className="px-4 py-2.5 font-medium">Username</th>
                      <th className="px-4 py-2.5 font-medium">Mendaftar</th>
                      <th className="px-4 py-2.5 font-medium text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map(u => (
                      <tr key={u.id} className="border-b border-surface-border last:border-0 hover:bg-amber-50/30">
                        <td className="px-4 py-2.5 text-xs font-medium text-slate-800">{u.name}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">@{u.username}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-400">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID') : '-'}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              className="btn-primary flex items-center gap-1 text-xs py-1 px-2"
                              onClick={() => { setApprovingUser(u); setApproveRoleId(''); }}
                            >
                              <UserCheck size={11} /> Setujui
                            </button>
                            <button
                              type="button"
                              className="btn-secondary flex items-center gap-1 text-xs py-1 px-2 text-status-danger"
                              onClick={() => handleRejectUser(u.id)}
                            >
                              <UserX size={11} /> Tolak
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
        )}

        {/* ========== PERAN TAB ========== */}
        {activeTab === 'peran' && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Konfigurasi Hak Akses per Peran</h3>
            <p className="text-xs text-slate-500 mb-4">Klik kotak centang untuk mengubah hak akses peran ini.</p>
            {loading ? (
              <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-md animate-pulse" />)}</div>
            ) : roles.length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada peran tersedia.</p>
            ) : (
              roles.map(role => (
                <div key={role.id} className="mb-6">
                  <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide">{role.name}</h4>
                  <div className="overflow-x-auto border border-surface-border rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-surface-border text-[11px] uppercase text-slate-400">
                          <th className="px-3 py-2 font-medium">Modul</th>
                          {AKSI_LIST.map(a => <th key={a} className="px-3 py-2 font-medium text-center">{a}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {MODULS.map(modul => {
                          const perm = role.permissions?.find((p: any) => p.modul === modul.key || p.modul === 'semua');
                          return (
                            <tr key={modul.key} className="border-b border-surface-border last:border-0">
                              <td className="px-3 py-2 font-medium text-slate-700">{modul.label}</td>
                              {AKSI_LIST.map(aksi => {
                                const isActive = perm?.[aksi] ?? false;
                                return (
                                  <td
                                    key={aksi}
                                    className="px-3 py-2 text-center cursor-pointer hover:bg-slate-50"
                                    onClick={() => handleToggleRolePermission(role.id, modul.key, aksi, isActive)}
                                  >
                                    {isActive ? (
                                      <Check size={12} className="mx-auto text-status-success" />
                                    ) : (
                                      <X size={12} className="mx-auto text-slate-200" />
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========== HAK AKSES KHUSUS TAB ========== */}
        {activeTab === 'khusus' && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Hak Akses Khusus per Pengguna</h3>
            <p className="text-xs text-slate-500 mb-4">Klik kotak centang untuk memberikan atau mencabut akses tambahan di luar peran pengguna.</p>
            {loading ? (
              <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-md animate-pulse" />)}</div>
            ) : activeUsers.length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada pengguna aktif.</p>
            ) : (
              activeUsers.map(u => (
                <div key={u.id} className="mb-6">
                  <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide">
                    {u.name} <span className="text-slate-400 font-normal lowercase">(@{u.username})</span>
                  </h4>
                  <div className="overflow-x-auto border border-surface-border rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-surface-border text-[11px] uppercase text-slate-400">
                          <th className="px-3 py-2 font-medium">Modul</th>
                          {AKSI_LIST.map(a => <th key={a} className="px-3 py-2 font-medium text-center">{a}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {MODULS.map(modul => {
                          const rolePerm = u.role?.permissions?.find((p: any) => p.modul === modul.key || p.modul === 'semua');
                          const userPerm = u.userPermissions?.find((p: any) => p.modul === modul.key);
                          const isOverridden = Boolean(userPerm);
                          return (
                            <tr key={modul.key} className="border-b border-surface-border last:border-0">
                              <td className="px-3 py-2 font-medium text-slate-700">{modul.label}</td>
                              {AKSI_LIST.map(aksi => {
                                // Kalau sudah ada override untuk modul ini, nilai override yang
                                // menentukan (bisa true atau false) — bukan cuma OR dengan peran.
                                const isActive = isOverridden ? Boolean(userPerm?.[aksi]) : Boolean(rolePerm?.[aksi]);
                                const hasRolePerm = rolePerm?.[aksi] ?? false;
                                return (
                                  <td
                                    key={aksi}
                                    className="px-3 py-2 text-center cursor-pointer hover:bg-slate-50"
                                    onClick={() => handleToggleUserPermission(u.id, modul.key, aksi, isActive)}
                                    title={isOverridden ? 'Sudah di-override untuk user ini (klik untuk ubah)' : hasRolePerm ? 'Dari peran (klik untuk override)' : 'Klik untuk toggle'}
                                  >
                                    {isActive ? (
                                      <Check size={14} className={`mx-auto ${isOverridden ? 'text-blue-500' : 'text-green-400'}`} />
                                    ) : (
                                      <div className="w-3.5 h-3.5 mx-auto border border-slate-300 rounded-sm" />
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========== STATUS OPERASIONAL TAB ========== */}
        {activeTab === 'status' && (
          <div>
            <div className="p-4 flex justify-between items-center border-b border-surface-border">
              <span className="text-xs text-slate-500">Kelola status yang digunakan di setiap fitur operasional</span>
              <button
                type="button"
                className="btn-primary flex items-center gap-1.5 text-xs"
                onClick={() => { setShowStatusForm(true); setEditingStatusId(null); setStatusForm({ modul: 'PO', kode: '', label: '', tone: 'neutral' }); }}
              >
                <Plus size={14} /> Tambah Status
              </button>
            </div>

            {showStatusForm && (
              <div className="p-4 border-b border-surface-border bg-blue-50/30">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="label-field">Modul Terkait</label>
                    <select className="input-field" disabled={!!editingStatusId} value={statusForm.modul} onChange={e => setStatusForm(p => ({ ...p, modul: e.target.value }))}>
                      <option value="PO">Pesanan Pembelian (PO)</option>
                      <option value="SO">Pesanan Cabang (SO)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-field">Kode Status</label>
                    <input className="input-field" disabled={!!editingStatusId} placeholder="cth: menunggu_persetujuan" value={statusForm.kode} onChange={e => setStatusForm(p => ({ ...p, kode: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label-field">Label Tampilan</label>
                    <input className="input-field" placeholder="cth: Menunggu Persetujuan" value={statusForm.label} onChange={e => setStatusForm(p => ({ ...p, label: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label-field">Warna</label>
                    <select className="input-field" value={statusForm.tone} onChange={e => setStatusForm(p => ({ ...p, tone: e.target.value as any }))}>
                      <option value="neutral">Abu-abu (Netral)</option>
                      <option value="info">Biru (Info)</option>
                      <option value="success">Hijau (Selesai)</option>
                      <option value="warning">Kuning (Perhatian)</option>
                      <option value="danger">Merah (Masalah)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button type="button" className="btn-secondary flex items-center gap-1.5 text-xs" onClick={() => setShowStatusForm(false)}>
                    <X size={12} /> Batal
                  </button>
                  <button type="button" className="btn-primary flex items-center gap-1.5 text-xs" onClick={handleSaveStatus}>
                    <Check size={12} /> Simpan
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-9 bg-slate-100 rounded-md animate-pulse" />)}</div>
            ) : (
              <div className="overflow-x-auto p-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] uppercase text-slate-400 border-b border-surface-border">
                      <th className="px-4 py-2.5 font-medium">Modul</th>
                      <th className="px-4 py-2.5 font-medium">Kode</th>
                      <th className="px-4 py-2.5 font-medium">Tampilan</th>
                      <th className="px-4 py-2.5 font-medium">Jenis</th>
                      <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statuses.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400">Belum ada status</td></tr>
                    ) : statuses.map(s => (
                      <tr key={s.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                        <td className="px-4 py-2.5 text-xs font-medium text-slate-800">{s.modul}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">{s.kode}</td>
                        <td className="px-4 py-2.5 text-xs">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            s.tone === 'success' ? 'bg-green-100 text-green-700' :
                            s.tone === 'danger' ? 'bg-red-100 text-red-700' :
                            s.tone === 'warning' ? 'bg-orange-100 text-orange-700' :
                            s.tone === 'info' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {s.label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs">
                          {s.isDeletable ? <span className="text-slate-400 italic">Kustom</span> : <span className="text-brand-600 font-medium">Sistem</span>}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex justify-end gap-1">
                            <button type="button" className="btn-secondary p-1.5" onClick={() => handleEditStatus(s)}>
                              <Pencil size={12} />
                            </button>
                            {s.isDeletable && (
                              <button type="button" className="btn-secondary p-1.5 text-status-danger" onClick={() => handleDeleteStatus(s.id)}>
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========== PENGATURAN TAB ========== */}
        {activeTab === 'pengaturan' && (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings size={16} className="text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-700">Pengaturan Sistem</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              <div className="space-y-4">
                <div>
                  <label className="label-field">Nama Sistem</label>
                  <input className="input-field" defaultValue="Stok Opname Jawara" />
                </div>
                <div>
                  <label className="label-field">Zona Waktu</label>
                  <select className="input-field">
                    <option>Asia/Jakarta (WIB)</option>
                    <option>Asia/Makassar (WITA)</option>
                    <option>Asia/Jayapura (WIT)</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Mata Uang</label>
                  <select className="input-field">
                    <option>IDR (Rupiah)</option>
                    <option>USD (US Dollar)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label-field">Format Tanggal</label>
                  <select className="input-field">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Batas Waktu Sesi (Menit)</label>
                  <input className="input-field" type="number" defaultValue="120" min="30" max="1440" />
                </div>
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-brand-600 focus:ring-brand-600" />
                    <span className="text-sm text-slate-700">Aktifkan Notifikasi Otomatis</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-surface-border">
              <button
                type="button"
                className="btn-primary"
                onClick={() => alert('Pengaturan berhasil disimpan!')}
              >
                Simpan Pengaturan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
