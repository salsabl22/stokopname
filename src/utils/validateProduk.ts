import type { ProdukFormErrors, ProdukFormValues } from '../types/produk';
import { isKodeProdukDuplicate } from '../services/produkService';

/**
 * Validasi form Produk.
 * Flow: Input Data Produk -> Validasi -> Database.
 */
export async function validateProdukForm(
  values: ProdukFormValues,
  currentId?: string,
): Promise<ProdukFormErrors> {
  const errors: ProdukFormErrors = {};

  if (!values.kodeProduk.trim()) {
    errors.kodeProduk = 'Kode produk wajib diisi.';
  }

  if (!values.namaProduk.trim()) {
    errors.namaProduk = 'Nama produk wajib diisi.';
  }

  if (!values.kategori.trim()) {
    errors.kategori = 'Kategori wajib dipilih.';
  }

  if (!values.satuanId.trim()) {
    errors.satuanId = 'Satuan wajib dipilih.';
  }

  if (!values.satuanPembelianId.trim()) {
    errors.satuanPembelianId = 'Satuan pembelian wajib dipilih.';
  }

  const konversi = Number(values.konversi);
  if (!values.konversi.trim()) {
    errors.konversi = 'Konversi wajib diisi.';
  } else if (Number.isNaN(konversi) || konversi <= 0) {
    errors.konversi = 'Konversi harus lebih besar dari 0.';
  }

  if (values.kodeProduk.trim() && !errors.kodeProduk) {
    const duplicate = await isKodeProdukDuplicate(values.kodeProduk, currentId);
    if (duplicate) {
      errors.kodeProduk = 'Kode produk sudah digunakan, gunakan kode lain.';
    }
  }

  return errors;
}

export function isProdukFormValid(errors: ProdukFormErrors): boolean {
  return Object.keys(errors).length === 0;
}