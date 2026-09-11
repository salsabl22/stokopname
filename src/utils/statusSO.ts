import type { StatusPesananCabang } from '../types/pesananCabang';

export const STATUS_SO_LABEL: Record<StatusPesananCabang, string> = {
  menunggu_alokasi: 'Menunggu Alokasi',
  perlu_pengisian_ulang: 'Perlu Pengisian Ulang',
  siap_diambil: 'Siap Diambil',
  pengecualian_pengambilan: 'Pengecualian',
  siap_packing: 'Siap Packing',
  siap_kirim: 'Siap Kirim',
  gagal_kirim: 'Gagal Kirim',
  terkirim: 'Terkirim',
};

export const STATUS_SO_TONE: Record<StatusPesananCabang, 'success' | 'danger' | 'warning' | 'neutral'> = {
  menunggu_alokasi: 'neutral',
  perlu_pengisian_ulang: 'warning',
  siap_diambil: 'warning',
  pengecualian_pengambilan: 'danger',
  siap_packing: 'warning',
  siap_kirim: 'warning',
  gagal_kirim: 'danger',
  terkirim: 'success',
};
