import { storage } from './storage';
import { fetchProduk } from './produkService';
import { fetchPersediaan } from './persediaanService';
import { fetchAllPO } from './barangMasukService';
import { fetchAllPesananCabang } from './pesananCabangService';
import { fetchAllRetur } from './returService';
import { fetchStockMovements } from './stockMovementService';
import type { StokItem } from '../types/persediaan';
import type { StockMovement } from '../types/stockMovement';
import type { UserTask } from '../types/task';

export interface DashboardMetrics {
  totalSKU: number;
  totalFisikStok: number;
  totalStokDialokasikan: number;
  totalStokBebas: number;
  totalProdukMenipis: number;
  poMenungguKedatangan: number;
  poMenungguQC: number;
  poSiapDisimpan: number;
  soMenungguAlokasi: number;
  soSiapDiambil: number;
  soSiapPacking: number;
  soSiapKirim: number;
  returMenunggu: number;
  opnameMenungguInvestigasi: number;
  opnameMenungguPersetujuan: number;
  totalTugasTertunda: number;
  akurasiOpnamePersen: number;
  lowStockItems: StokItem[];
  recentMovements: StockMovement[];
  pendingTasks: UserTask[];
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const [produkList, persediaanList, poList, soList, returList, movementsList] = await Promise.all([
    fetchProduk(),
    fetchPersediaan(),
    fetchAllPO(),
    fetchAllPesananCabang(),
    fetchAllRetur(),
    fetchStockMovements(),
  ]);
  const tasksList = storage.getTasks();

  const totalSKU = produkList.length;
  let totalFisikStok = 0;
  let totalStokDialokasikan = 0;

  persediaanList.forEach(item => {
    totalFisikStok += item.jumlahTersedia;
    totalStokDialokasikan += item.jumlahDialokasikan;
  });

  const lowStockItems = persediaanList.filter(item => item.jumlahTersedia <= item.minimumStok);

  const poMenungguKedatangan = poList.filter(po => po.status === 'menunggu_pengiriman').length;
  const poMenungguQC = poList.filter(po => po.status === 'menunggu_qc').length;
  const poSiapDisimpan = poList.filter(po => po.status === 'siap_penyimpanan').length;

  const soMenungguAlokasi = soList.filter(so => so.status === 'menunggu_alokasi').length;
  const soSiapDiambil = soList.filter(so => so.status === 'siap_diambil').length;
  const soSiapPacking = soList.filter(so => so.status === 'siap_packing').length;
  const soSiapKirim = soList.filter(so => so.status === 'siap_kirim').length;

  const returMenunggu = returList.filter(r => r.status === 'diajukan' || r.status === 'diterima').length;

  // Tasks pending
  const pendingTasks = tasksList.filter(t => t.status !== 'selesai');

  return {
    totalSKU,
    totalFisikStok,
    totalStokDialokasikan,
    totalStokBebas: Math.max(0, totalFisikStok - totalStokDialokasikan),
    totalProdukMenipis: lowStockItems.length,
    poMenungguKedatangan,
    poMenungguQC,
    poSiapDisimpan,
    soMenungguAlokasi,
    soSiapDiambil,
    soSiapPacking,
    soSiapKirim,
    returMenunggu,
    opnameMenungguInvestigasi: 0,
    opnameMenungguPersetujuan: 0,
    totalTugasTertunda: pendingTasks.length,
    akurasiOpnamePersen: 100,
    lowStockItems: lowStockItems.slice(0, 5), // top 5
    recentMovements: [...movementsList].slice(0, 10), // latest 10 (already sorted desc by backend)
    pendingTasks: pendingTasks.slice(0, 5), // top 5
  };
}
