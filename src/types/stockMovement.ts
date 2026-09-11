export type TipeMovement = 'MASUK' | 'KELUAR' | 'PINDAH' | 'ADJUSTMENT' | 'WASTE' | 'RETUR';

export interface StockMovement {
  id: string;
  timestamp: string;
  produkId: string;
  produkKode: string;
  produkNama: string;
  jumlah: number;
  satuan: string;
  tipe: TipeMovement;
  sumber: string;
  tujuan: string;
  referensi: string;
  keterangan?: string;
  operator?: string;
}

export const TIPE_MOVEMENT_LABEL: Record<TipeMovement, string> = {
  MASUK: 'Barang Masuk',
  KELUAR: 'Barang Keluar',
  PINDAH: 'Perpindahan Lokasi',
  ADJUSTMENT: 'Penyesuaian Stok',
  WASTE: 'Waste',
  RETUR: 'Retur',
};

export const TIPE_MOVEMENT_TONE: Record<TipeMovement, 'success' | 'danger' | 'warning' | 'neutral'> = {
  MASUK: 'success',
  KELUAR: 'danger',
  PINDAH: 'neutral',
  ADJUSTMENT: 'warning',
  WASTE: 'danger',
  RETUR: 'success',
};
