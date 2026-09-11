export type TipeTugas =
  | 'penerimaan'
  | 'penyimpanan'
  | 'pengambilan'
  | 'packing'
  | 'perhitungan_stok'
  | 'persetujuan'
  | 'PENERIMAAN'
  | 'PENYIMPANAN'
  | 'PICKING'
  | 'PACKING'
  | 'PERHITUNGAN_STOK'
  | 'PERSETUJUAN';

export type StatusTugas = 'MENUNGGU' | 'DITUGASKAN' | 'DIKERJAKAN' | 'SELESAI' | 'TERLAMBAT' | 'tertunda' | 'dalam_proses' | 'dikerjakan' | 'selesai' | 'dibatalkan';
export type PrioritasTugas = 'tinggi' | 'sedang' | 'rendah' | 'TINGGI' | 'NORMAL' | 'RENDAH';

export interface UserTask {
  id: string;
  nomorTugas: string;
  tipe: TipeTugas;
  judul: string;
  deskripsi: string;
  referensiId: string;
  referensiNomor: string;
  status: StatusTugas;
  prioritas: PrioritasTugas;
  assignee: string;
  targetUrl: string;
  deadline?: string;
  waktuMulai?: string;
  waktuSelesai?: string;
  catatan?: string;
  createdAt: string;
}

export const TIPE_TUGAS_LABEL: Record<TipeTugas, string> = {
  penerimaan: 'Penerimaan Barang',
  penyimpanan: 'Penyimpanan (Putaway)',
  pengambilan: 'Pengambilan (Picking)',
  packing: 'Pengepakan (Packing)',
  perhitungan_stok: 'Perhitungan Stok',
  persetujuan: 'Persetujuan Manajerial',
  PENERIMAAN: 'Penerimaan Barang',
  PENYIMPANAN: 'Penyimpanan (Putaway)',
  PICKING: 'Pengambilan (Picking)',
  PACKING: 'Pengepakan (Packing)',
  PERHITUNGAN_STOK: 'Perhitungan Stok',
  PERSETUJUAN: 'Persetujuan Manajerial',
};

export const STATUS_TUGAS_LABEL: Record<StatusTugas, string> = {
  tertunda: 'Tertunda',
  dalam_proses: 'Sedang Dikerjakan',
  dikerjakan: 'Sedang Dikerjakan',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
  MENUNGGU: 'Menunggu',
  DITUGASKAN: 'Ditugaskan',
  DIKERJAKAN: 'Dikerjakan',
  SELESAI: 'Selesai',
  TERLAMBAT: 'Terlambat',
};

export const STATUS_TUGAS_TONE: Record<StatusTugas, 'success' | 'danger' | 'warning' | 'neutral' | 'info'> = {
  tertunda: 'warning',
  dalam_proses: 'info',
  dikerjakan: 'info',
  selesai: 'success',
  dibatalkan: 'danger',
  MENUNGGU: 'warning',
  DITUGASKAN: 'neutral',
  DIKERJAKAN: 'info',
  SELESAI: 'success',
  TERLAMBAT: 'danger',
};

export const PRIORITAS_TUGAS_TONE: Record<PrioritasTugas, 'success' | 'danger' | 'warning' | 'neutral'> = {
  tinggi: 'danger',
  sedang: 'warning',
  rendah: 'neutral',
  TINGGI: 'danger',
  NORMAL: 'warning',
  RENDAH: 'neutral',
};
