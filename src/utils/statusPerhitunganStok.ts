import type { StatusPerhitunganStok } from '../types/perhitunganStok';

export const STATUS_SO_CNT_LABEL: Record<StatusPerhitunganStok, string> = {
  ditugaskan: 'Ditugaskan',
  tidak_ada_selisih: 'Sesuai (Tidak Ada Selisih)',
  menunggu_investigasi: 'Menunggu Investigasi',
  menunggu_persetujuan: 'Menunggu Persetujuan',
  disetujui: 'Disetujui',
  ditolak: 'Ditolak',
};

export const STATUS_SO_CNT_TONE: Record<StatusPerhitunganStok, 'success' | 'danger' | 'warning' | 'neutral'> = {
  ditugaskan: 'neutral',
  tidak_ada_selisih: 'success',
  menunggu_investigasi: 'warning',
  menunggu_persetujuan: 'warning',
  disetujui: 'success',
  ditolak: 'danger',
};
