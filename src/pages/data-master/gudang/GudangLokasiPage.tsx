import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Warehouse,
  ChevronRight,
  ChevronDown,
  MapPin,
  Box,
} from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import GudangFormModal from './GudangFormModal';
import NodeFormModal from './NodeFormModal';
import type { Gudang, GudangFormValues, LokasiPenyimpanan, Rak } from '../../../types/gudang';
import {
  createGudang,
  createLokasi,
  createRak,
  deleteGudang,
  deleteLokasi,
  deleteRak,
  fetchGudang,
  fetchLokasiByRak,
  fetchRakByGudang,
  isKodeLokasiDuplicate,
  isKodeRakDuplicate,
} from '../../../services/gudangService';

type DeleteTarget =
  | { type: 'gudang'; id: string; label: string }
  | { type: 'rak'; id: string; label: string }
  | { type: 'lokasi'; id: string; label: string };

export default function GudangLokasiPage() {
  const [gudangList, setGudangList] = useState<Gudang[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGudangId, setSelectedGudangId] = useState<string | null>(null);

  const [gudangFormOpen, setGudangFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadGudang() {
    setLoading(true);
    const data = await fetchGudang();
    setGudangList(data);
    if (!selectedGudangId && data.length > 0) setSelectedGudangId(data[0].id);
    setLoading(false);
  }

  useEffect(() => {
    loadGudang();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateGudang(values: GudangFormValues) {
    const created = await createGudang(values);
    await loadGudang();
    setSelectedGudangId(created.id);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'gudang') {
        await deleteGudang(deleteTarget.id);
        if (selectedGudangId === deleteTarget.id) setSelectedGudangId(null);
        await loadGudang();
      } else if (deleteTarget.type === 'rak') {
        await deleteRak(deleteTarget.id);
      } else {
        await deleteLokasi(deleteTarget.id);
      }
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const selectedGudang = gudangList.find((g) => g.id === selectedGudangId) ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      {/* Daftar Gudang */}
      <div className="card">
        <div className="flex items-center justify-between p-4 border-b border-surface-border">
          <h3 className="text-xs font-semibold text-slate-700">Daftar Gudang</h3>
          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center rounded-md text-navy-800 hover:bg-slate-100"
            onClick={() => setGudangFormOpen(true)}
            title="Tambah Gudang"
          >
            <Plus size={15} />
          </button>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-9 rounded-md bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : gudangList.length === 0 ? (
          <div className="flex flex-col items-center text-center py-10 px-4">
            <Warehouse size={20} className="text-slate-400 mb-2" />
            <p className="text-xs text-slate-500">Belum ada gudang. Tambahkan gudang pertama.</p>
          </div>
        ) : (
          <ul className="p-2 space-y-1">
            {gudangList.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => setSelectedGudangId(g.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-md text-xs transition-colors ${
                    g.id === selectedGudangId
                      ? 'bg-navy-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <p className="font-medium">{g.kodeGudang}</p>
                  <p className={g.id === selectedGudangId ? 'text-slate-300' : 'text-slate-400'}>
                    {g.namaGudang}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Detail struktur gudang terpilih */}
      <div className="card p-4">
        {!selectedGudang ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Warehouse size={20} className="text-slate-400 mb-2" />
            <p className="text-xs text-slate-500">Pilih atau tambahkan gudang untuk melihat struktur lokasi.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">{selectedGudang.namaGudang}</h2>
                <p className="text-xs text-slate-400">{selectedGudang.alamat}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={selectedGudang.status === 'aktif' ? 'success' : 'neutral'}>
                  {selectedGudang.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                </Badge>
                <button
                  type="button"
                  className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-status-danger hover:bg-status-dangerBg"
                  title="Hapus Gudang"
                  onClick={() =>
                    setDeleteTarget({ type: 'gudang', id: selectedGudang.id, label: selectedGudang.namaGudang })
                  }
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <RakTree gudangId={selectedGudang.id} onDelete={setDeleteTarget} />
          </>
        )}
      </div>

      <GudangFormModal
        open={gudangFormOpen}
        onClose={() => setGudangFormOpen(false)}
        onSubmit={handleCreateGudang}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Data"
        description={`"${deleteTarget?.label ?? ''}" beserta seluruh data di bawahnya akan dihapus permanen. Lanjutkan?`}
        confirmLabel="Ya, Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

// ============================================================
// Rak -> Lokasi, masing-masing level bisa expand/collapse
// ============================================================

function RakTree({
  gudangId,
  onDelete,
}: {
  gudangId: string;
  onDelete: (target: DeleteTarget) => void;
}) {
  const [rakList, setRakList] = useState<Rak[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  async function load() {
    setLoading(true);
    setRakList(await fetchRakByGudang(gudangId));
    setLoading(false);
  }

  useEffect(() => {
    load();
    setExpanded({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gudangId]);

  function toggle(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2 mt-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Rak</p>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[11px] text-navy-800 hover:underline"
          onClick={() => setFormOpen(true)}
        >
          <Plus size={12} /> Tambah Rak
        </button>
      </div>

      {loading ? (
        <div className="h-7 rounded-md bg-slate-100 animate-pulse" />
      ) : rakList.length === 0 ? (
        <p className="text-[11px] text-slate-400 py-2">Belum ada rak di gudang ini.</p>
      ) : (
        <ul className="space-y-1">
          {rakList.map((rak) => (
            <li key={rak.id} className="border border-surface-border rounded-md bg-slate-50/50">
              <div className="flex items-center justify-between px-2.5 py-1.5">
                <button
                  type="button"
                  className="flex items-center gap-2 text-[11px] text-slate-700"
                  onClick={() => toggle(rak.id)}
                >
                  {expanded[rak.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  <Box size={12} className="text-slate-400" />
                  <span className="font-medium">{rak.kodeRak}</span>
                  <span className="text-slate-400">{rak.namaRak}</span>
                </button>
                <button
                  type="button"
                  className="w-5 h-5 flex items-center justify-center rounded-md text-slate-400 hover:text-status-danger hover:bg-status-dangerBg"
                  onClick={() => onDelete({ type: 'rak', id: rak.id, label: rak.namaRak })}
                >
                  <Trash2 size={11} />
                </button>
              </div>
              {expanded[rak.id] && (
                <div className="px-2.5 pb-2.5 pl-6">
                  <LokasiList rakId={rak.id} onDelete={onDelete} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <NodeFormModal
        open={formOpen}
        title="Tambah Rak"
        kodeLabel="Kode Rak"
        namaLabel="Nama Rak"
        kodePlaceholder="Contoh: A-01"
        namaPlaceholder="Contoh: Rak A-01"
        onClose={() => setFormOpen(false)}
        checkDuplicate={(kode) => isKodeRakDuplicate(gudangId, kode)}
        duplicateMessage="Kode rak sudah digunakan di gudang ini."
        onSubmit={async (kode, nama) => {
          await createRak(gudangId, kode, nama);
          await load();
        }}
      />
    </div>
  );
}

function LokasiList({
  rakId,
  onDelete,
}: {
  rakId: string;
  onDelete: (target: DeleteTarget) => void;
}) {
  const [lokasiList, setLokasiList] = useState<LokasiPenyimpanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  async function load() {
    setLoading(true);
    setLokasiList(await fetchLokasiByRak(rakId));
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rakId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Lokasi Penyimpanan</p>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[11px] text-navy-800 hover:underline"
          onClick={() => setFormOpen(true)}
        >
          <Plus size={11} /> Tambah Lokasi
        </button>
      </div>

      {loading ? (
        <div className="h-6 rounded-md bg-slate-100 animate-pulse" />
      ) : lokasiList.length === 0 ? (
        <p className="text-[11px] text-slate-400 py-1">Belum ada lokasi di rak ini.</p>
      ) : (
        <ul className="space-y-1">
          {lokasiList.map((lokasi) => (
            <li
              key={lokasi.id}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-white border border-surface-border"
            >
              <span className="flex items-center gap-2 text-[11px] text-slate-600">
                <MapPin size={11} className="text-slate-400" />
                <span className="font-medium text-slate-700">{lokasi.kodeLokasi}</span>
                {lokasi.namaLokasi}
              </span>
              <button
                type="button"
                className="w-5 h-5 flex items-center justify-center rounded-md text-slate-400 hover:text-status-danger hover:bg-status-dangerBg"
                onClick={() => onDelete({ type: 'lokasi', id: lokasi.id, label: lokasi.namaLokasi })}
              >
                <Trash2 size={11} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <NodeFormModal
        open={formOpen}
        title="Tambah Lokasi Penyimpanan"
        kodeLabel="Kode Lokasi"
        namaLabel="Nama Lokasi"
        kodePlaceholder="Contoh: A-01-01"
        namaPlaceholder="Contoh: A-01 Baris 1"
        onClose={() => setFormOpen(false)}
        checkDuplicate={(kode) => isKodeLokasiDuplicate(rakId, kode)}
        duplicateMessage="Kode lokasi sudah digunakan di rak ini."
        onSubmit={async (kode, nama) => {
          await createLokasi(rakId, kode, nama);
          await load();
        }}
      />
    </div>
  );
}
