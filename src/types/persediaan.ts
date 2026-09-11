export interface StokItem {
  id: string;
  produkId: string;
  produkKode: string;
  produkNama: string;
  kodeBarcode?: string;
  satuan: string;
  batchNomor?: string;
  /** Available stock (bisa diambil) */
  jumlahTersedia: number;
  /** Reserved stock (sudah dialokasikan untuk SO) */
  jumlahDialokasikan: number;
  /** Quarantine stock */
  jumlahKarantina: number;
  /** Waste stock */
  jumlahWaste: number;
  minimumStok: number;
  lokasiPenyimpanan?: string;
  updatedAt: string;
}

/** 
 * ON HAND = Tersedia + Dialokasikan + Karantina
 */
export function stokOnHand(item: StokItem): number {
  return item.jumlahTersedia + item.jumlahDialokasikan + item.jumlahKarantina;
}

/**
 * STOK BEBAS = Tersedia - Dialokasikan (bisa digunakan untuk order baru)
 */
export function stokBebas(item: StokItem): number {
  return Math.max(0, item.jumlahTersedia - item.jumlahDialokasikan);
}
