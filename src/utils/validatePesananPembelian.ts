import type { PesananPembelianFormErrors, PesananPembelianFormValues } from '../types/barangMasuk';

/**
 * Validasi form Pesanan Pembelian.
 * Flow: Pilih Produk -> Masukkan Jumlah -> Data Pesanan Valid?
 * (TIDAK -> Notifikasi / Pesan Kesalahan -> Perbaiki PO -> Validasi kembali)
 */
export function validatePesananPembelianForm(
  values: PesananPembelianFormValues,
): PesananPembelianFormErrors {
  const errors: PesananPembelianFormErrors = {};

  if (!values.pemasokId) {
    errors.pemasokId = 'Supplier wajib dipilih.';
  }

  if (values.items.length === 0) {
    errors.items = 'Minimal satu produk harus ditambahkan ke pesanan.';
    return errors;
  }

  const hasInvalidItem = values.items.some((item) => {
    const jumlah = Number(item.jumlah);
    const harga = Number(item.hargaSatuan);
    return (
      !item.produkId ||
      !item.jumlah.trim() ||
      Number.isNaN(jumlah) ||
      jumlah <= 0 ||
      !item.hargaSatuan.trim() ||
      Number.isNaN(harga) ||
      harga <= 0
    );
  });

  if (hasInvalidItem) {
    errors.items = 'Setiap produk harus dipilih dengan jumlah dan harga satuan lebih besar dari 0.';
  }

  return errors;
}

export function isPesananPembelianFormValid(errors: PesananPembelianFormErrors): boolean {
  return Object.keys(errors).length === 0;
}
