import type { PemasokFormErrors, PemasokFormValues } from '../types/pemasok';
import { isKodePemasokDuplicate } from '../services/pemasokService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s]{8,15}$/;

/**
 * Validasi form Pemasok.
 * Flow: Input Pemasok -> Validasi Data -> Simpan -> Database.
 */
export async function validatePemasokForm(
  values: PemasokFormValues,
  currentId?: string,
): Promise<PemasokFormErrors> {
  const errors: PemasokFormErrors = {};

  if (!values.kodePemasok.trim()) {
    errors.kodePemasok = 'Kode supplier wajib diisi.';
  }

  if (!values.namaPemasok.trim()) {
    errors.namaPemasok = 'Nama supplier wajib diisi.';
  }

  if (!values.kontak.trim()) {
    errors.kontak = 'Kontak wajib diisi.';
  } else if (!PHONE_REGEX.test(values.kontak.trim())) {
    errors.kontak = 'Format nomor kontak tidak valid.';
  }

  if (values.email.trim() && !EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Format email tidak valid.';
  }

  if (!values.alamat.trim()) {
    errors.alamat = 'Alamat wajib diisi.';
  }

  if (values.kodePemasok.trim() && !errors.kodePemasok) {
    const duplicate = await isKodePemasokDuplicate(values.kodePemasok, currentId);
    if (duplicate) {
      errors.kodePemasok = 'Kode supplier sudah digunakan, gunakan kode lain.';
    }
  }

  return errors;
}

export function isPemasokFormValid(errors: PemasokFormErrors): boolean {
  return Object.keys(errors).length === 0;
}
