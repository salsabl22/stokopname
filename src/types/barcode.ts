// Tipe data untuk modul Data Master > Barcode
// Flow: Input Barcode / Generate -> Hubungkan dengan Produk ->
// Barcode sudah digunakan? -> YA: notif; TIDAK: Simpan -> Database.
// Barcode harus unik.

export interface BarcodeItem {
  id: string;
  kodeBarcode: string;
  produkId: string;
  produkNama: string;
  produkKode: string;
  createdAt: string;
}

export interface BarcodeFormValues {
  kodeBarcode: string;
  produkId: string;
}

export interface BarcodeFormErrors {
  kodeBarcode?: string;
  produkId?: string;
}

export const EMPTY_BARCODE_FORM: BarcodeFormValues = {
  kodeBarcode: '',
  produkId: '',
};
