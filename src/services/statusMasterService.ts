import { delay } from './storage';

export interface MasterStatus {
  id: string;
  modul: string; // 'PO', 'SO', 'QC', dll
  kode: string;
  label: string;
  tone: 'success' | 'danger' | 'warning' | 'neutral' | 'info';
  isDeletable: boolean;
}

const STORAGE_KEY = 'wms_master_status_v1';

const INITIAL_STATUS: MasterStatus[] = [
  // PO Statuses
  { id: 'ms_po_1', modul: 'PO', kode: 'draft', label: 'Draft', tone: 'neutral', isDeletable: false },
  { id: 'ms_po_2', modul: 'PO', kode: 'menunggu_pengiriman', label: 'Menunggu Pengiriman', tone: 'neutral', isDeletable: false },
  { id: 'ms_po_3', modul: 'PO', kode: 'barang_datang', label: 'Barang Datang', tone: 'warning', isDeletable: false },
  { id: 'ms_po_4', modul: 'PO', kode: 'pengecualian', label: 'Pengecualian', tone: 'danger', isDeletable: false },
  { id: 'ms_po_5', modul: 'PO', kode: 'menunggu_qc', label: 'Menunggu QC', tone: 'warning', isDeletable: false },
  { id: 'ms_po_6', modul: 'PO', kode: 'perlu_repack', label: 'Perlu Repack', tone: 'warning', isDeletable: false },
  { id: 'ms_po_7', modul: 'PO', kode: 'siap_penyimpanan', label: 'Siap Disimpan', tone: 'success', isDeletable: false },
  { id: 'ms_po_8', modul: 'PO', kode: 'karantina', label: 'Karantina', tone: 'danger', isDeletable: false },
  { id: 'ms_po_9', modul: 'PO', kode: 'retur', label: 'Retur', tone: 'danger', isDeletable: false },
  { id: 'ms_po_10', modul: 'PO', kode: 'disimpan', label: 'Disimpan', tone: 'success', isDeletable: false },
  
  // SO Statuses
  { id: 'ms_so_1', modul: 'SO', kode: 'draft', label: 'Draft', tone: 'neutral', isDeletable: false },
  { id: 'ms_so_2', modul: 'SO', kode: 'menunggu_alokasi', label: 'Menunggu Alokasi', tone: 'neutral', isDeletable: false },
  { id: 'ms_so_3', modul: 'SO', kode: 'perlu_pengisian_ulang', label: 'Perlu Pengisian Ulang', tone: 'warning', isDeletable: false },
  { id: 'ms_so_4', modul: 'SO', kode: 'siap_diambil', label: 'Siap Diambil (Picking)', tone: 'info', isDeletable: false },
  { id: 'ms_so_5', modul: 'SO', kode: 'sedang_diambil', label: 'Sedang Diambil', tone: 'warning', isDeletable: false },
  { id: 'ms_so_6', modul: 'SO', kode: 'siap_packing', label: 'Siap Packing', tone: 'info', isDeletable: false },
  { id: 'ms_so_7', modul: 'SO', kode: 'sedang_packing', label: 'Sedang Packing', tone: 'warning', isDeletable: false },
  { id: 'ms_so_8', modul: 'SO', kode: 'siap_kirim', label: 'Siap Kirim', tone: 'success', isDeletable: false },
  { id: 'ms_so_9', modul: 'SO', kode: 'terkirim', label: 'Dikirim', tone: 'success', isDeletable: false },
  { id: 'ms_so_10', modul: 'SO', kode: 'selesai', label: 'Selesai', tone: 'success', isDeletable: false },
  { id: 'ms_so_11', modul: 'SO', kode: 'batal', label: 'Dibatalkan', tone: 'danger', isDeletable: false },
];

function getStored(): MasterStatus[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STATUS));
      return INITIAL_STATUS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STATUS;
  }
}

function setStored(data: MasterStatus[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function fetchMasterStatuses(): Promise<MasterStatus[]> {
  return delay(getStored());
}

export async function fetchStatusesByModul(modul: string): Promise<MasterStatus[]> {
  const all = getStored();
  return delay(all.filter(s => s.modul === modul));
}

export async function createStatus(data: Omit<MasterStatus, 'id' | 'isDeletable'>): Promise<MasterStatus> {
  const all = getStored();
  const newStatus: MasterStatus = {
    ...data,
    id: `ms_${Date.now()}`,
    isDeletable: true
  };
  setStored([...all, newStatus]);
  return delay(newStatus);
}

export async function updateStatus(id: string, data: Partial<Omit<MasterStatus, 'id' | 'isDeletable' | 'kode'>>): Promise<MasterStatus> {
  const all = getStored();
  const target = all.find(s => s.id === id);
  if (!target) throw new Error('Status tidak ditemukan');
  
  const updated = { ...target, ...data };
  setStored(all.map(s => s.id === id ? updated : s));
  return delay(updated);
}

export async function deleteStatus(id: string): Promise<void> {
  const all = getStored();
  const target = all.find(s => s.id === id);
  if (!target) throw new Error('Status tidak ditemukan');
  if (!target.isDeletable) throw new Error('Status bawaan sistem tidak dapat dihapus');
  
  setStored(all.filter(s => s.id !== id));
  return delay(undefined as void);
}
