import type { SatuanBarangFormErrors, SatuanBarangFormValues } from '../types/satuanBarang';
import { isKodeSatuanDuplicate } from '../services/satuanBarangService';

/**
 * Validasi form Satuan Barang.
 * Mengikuti Flow Map: Input Satuan Barang -> Konversi Satuan -> Konversi Valid?
 * -> (TIDAK) Notifikasi / Pesan Kesalahan -> (YA) Simpan -> Database
 */
export async function validateSatuanBarangForm(
  values: SatuanBarangFormValues,
  currentId?: string,
): Promise<SatuanBarangFormErrors> {
  const errors: SatuanBarangFormErrors = {};

  if (!values.kodeSatuan.trim()) {
    errors.kodeSatuan = 'Kode satuan wajib diisi.';
  }

  if (!values.namaSatuan.trim()) {
    errors.namaSatuan = 'Nama satuan wajib diisi.';
  }

  if (!values.satuanDasar.trim()) {
    errors.satuanDasar = 'Satuan dasar wajib diisi.';
  }

  const nilaiKonversi = Number(values.nilaiKonversi);
  if (!values.nilaiKonversi.trim()) {
    errors.nilaiKonversi = 'Nilai konversi wajib diisi.';
  } else if (Number.isNaN(nilaiKonversi) || nilaiKonversi <= 0) {
    errors.nilaiKonversi = 'Nilai konversi harus lebih besar dari 0.';
  }

  // Cek duplikasi kode hanya jika kode sudah terisi (hindari error ganda)
  if (values.kodeSatuan.trim() && !errors.kodeSatuan) {
    const duplicate = await isKodeSatuanDuplicate(values.kodeSatuan, currentId);
    if (duplicate) {
      errors.kodeSatuan = 'Kode satuan sudah digunakan, gunakan kode lain.';
    }
  }

  return errors;
}

export function isFormValid(errors: SatuanBarangFormErrors): boolean {
  return Object.keys(errors).length === 0;
}
