import type { ReturFormErrors, ReturFormValues } from '../types/retur';

/**
 * Validasi form Retur.
 * Flow: Input Data Retur -> Validasi Pengajuan -> Data Retur Valid?
 * (TIDAK -> Tampilkan Kesalahan -> Perbaiki Data Retur -> validasi lagi)
 */
export function validateReturForm(values: ReturFormValues): ReturFormErrors {
  const errors: ReturFormErrors = {};

  if (values.sumber === 'cabang' && !values.cabangId) {
    errors.cabangId = 'Cabang wajib dipilih.';
  }
  if (values.sumber === 'internal' && !values.poId) {
    errors.poId = 'Pesanan pembelian (barang ditolak) wajib dipilih.';
  }

  if (values.items.length === 0) {
    errors.items = 'Minimal satu produk harus ditambahkan ke retur.';
  } else {
    const hasInvalidItem = values.items.some((item) => {
      const jumlah = Number(item.jumlah);
      return !item.produkId || !item.jumlah.trim() || Number.isNaN(jumlah) || jumlah <= 0;
    });
    if (hasInvalidItem) {
      errors.items = 'Setiap produk harus dipilih dengan jumlah lebih besar dari 0.';
    }
  }

  if (!values.alasan.trim()) {
    errors.alasan = 'Alasan / identifikasi transaksi retur wajib diisi.';
  }

  return errors;
}

export function isReturFormValid(errors: ReturFormErrors): boolean {
  return Object.keys(errors).length === 0;
}
