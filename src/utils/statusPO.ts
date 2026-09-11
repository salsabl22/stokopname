import type { StatusPO } from '../types/barangMasuk';

export const STATUS_PO_LABEL: Record<StatusPO, string> = {
  menunggu_pengiriman: 'Menunggu Pengiriman',
  barang_datang: 'Barang Datang',
  pengecualian: 'Pengecualian',
  menunggu_qc: 'Menunggu QC',
  perlu_repack: 'Perlu Repack',
  siap_penyimpanan: 'Siap Disimpan',
  karantina: 'Karantina',
  retur: 'Retur',
  disimpan: 'Disimpan',
};

export const STATUS_PO_TONE: Record<StatusPO, 'success' | 'danger' | 'warning' | 'neutral'> = {
  menunggu_pengiriman: 'neutral',
  barang_datang: 'warning',
  pengecualian: 'danger',
  menunggu_qc: 'warning',
  perlu_repack: 'warning',
  siap_penyimpanan: 'success',
  karantina: 'danger',
  retur: 'danger',
  disimpan: 'success',
};

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    value,
  );
}
