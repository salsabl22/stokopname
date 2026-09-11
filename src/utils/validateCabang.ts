import type { CabangFormErrors, CabangFormValues } from '../types/cabang';
import { isKodeCabangDuplicate } from '../services/cabangService';

/**
 * Validasi form Cabang, mengikuti urutan decision di Flow Map secara persis:
 * 1) Kode Cabang Sudah Ada? -> jika YA, berhenti dengan notifikasi
 *    "Kode cabang telah digunakan" (tidak lanjut cek kelengkapan).
 * 2) Jika kode belum dipakai -> Periksa Kelengkapan -> Lengkap?
 *    -> jika TIDAK, notifikasi "Data belum lengkap".
 * 3) Jika keduanya lolos -> valid, siap Simpan.
 */
export async function validateCabangForm(
  values: CabangFormValues,
  currentId?: string,
): Promise<CabangFormErrors> {
  if (!values.kodeCabang.trim()) {
    return { kodeCabang: 'Kode cabang wajib diisi.' };
  }

  // Langkah 1: Kode Cabang Sudah Ada?
  const duplicate = await isKodeCabangDuplicate(values.kodeCabang, currentId);
  if (duplicate) {
    return {
      kodeCabang: 'Kode cabang telah digunakan.',
      general: 'Kode cabang telah digunakan. Gunakan kode lain.',
    };
  }

  // Langkah 2: Periksa Kelengkapan -> Lengkap?
  const errors: CabangFormErrors = {};
  if (!values.namaCabang.trim()) errors.namaCabang = 'Nama cabang wajib diisi.';
  if (!values.alamat.trim()) errors.alamat = 'Alamat wajib diisi.';
  if (!values.telepon.trim()) errors.telepon = 'Telepon wajib diisi.';

  if (Object.keys(errors).length > 0) {
    return { ...errors, general: 'Data belum lengkap. Lengkapi seluruh field yang wajib diisi.' };
  }

  return {};
}

export function isCabangFormValid(errors: CabangFormErrors): boolean {
  return Object.keys(errors).length === 0;
}
