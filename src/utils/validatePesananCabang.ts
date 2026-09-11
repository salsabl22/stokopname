import type { PesananCabangFormErrors, PesananCabangFormValues } from '../types/pesananCabang';

/**
 * Validasi form Pesanan Cabang.
 * Flow: Input Pilih Cabang -> Pilih Produk -> Masukan Jumlah -> Validasi
 * Pesanan (gagal -> Tampilkan Kesalahan).
 */
export function validatePesananCabangForm(values: PesananCabangFormValues): PesananCabangFormErrors {
  const errors: PesananCabangFormErrors = {};

  if (!values.cabangId) {
    errors.cabangId = 'Cabang wajib dipilih.';
  }

  if (values.items.length === 0) {
    errors.items = 'Minimal satu produk harus ditambahkan ke pesanan.';
    return errors;
  }

  const hasInvalidItem = values.items.some((item) => {
    const jumlah = Number(item.jumlah);
    return !item.produkId || !item.jumlah.trim() || Number.isNaN(jumlah) || jumlah <= 0;
  });

  if (hasInvalidItem) {
    errors.items = 'Setiap produk harus dipilih dengan jumlah lebih besar dari 0.';
  }

  return errors;
}

export function isPesananCabangFormValid(errors: PesananCabangFormErrors): boolean {
  return Object.keys(errors).length === 0;
}
