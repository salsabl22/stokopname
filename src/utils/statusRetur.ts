import type { StatusRetur } from '../types/retur';

export const STATUS_RETUR_LABEL: Record<StatusRetur, string> = {
  diajukan: 'Menunggu Diterima Gudang',
  diterima: 'Menunggu Pemeriksaan',
  pengecualian: 'Pengecualian',
  kembali_ke_stok: 'Kembali ke Persediaan',
  karantina: 'Karantina',
  retur_pemasok: 'Retur ke Supplier',
};

export const STATUS_RETUR_TONE: Record<StatusRetur, 'success' | 'danger' | 'warning' | 'neutral'> = {
  diajukan: 'neutral',
  diterima: 'warning',
  pengecualian: 'danger',
  kembali_ke_stok: 'success',
  karantina: 'danger',
  retur_pemasok: 'danger',
};
