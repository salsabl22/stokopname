/**
 * Pemasok Service — terhubung ke backend real API
 * getApiBase() dipanggil saat tiap request (dynamic) agar unit bisnis
 * terbaca dari localStorage dengan benar.
 */
import type { Pemasok, PemasokFormValues } from '../types/pemasok';

function getApiBase(): string {
  const unit = localStorage.getItem('wms_unit_bisnis');
  const path = unit === 'KERIPIK_BUJANGAN' ? 'keripik-bujangan' : 'fotosnaps';
  return `${import.meta.env.VITE_API_URL || ''}/api/${path}`;
}

function getToken(): string {
  return localStorage.getItem('wms_token') || '';
}

function authHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request gagal');
  return data;
}

// Backend pakai nama field: kode, nama, kontak, telepon, email, alamat, status.
// Frontend (tipe Pemasok) pakai: kodePemasok, namaPemasok, kontak, email, alamat, status.
function mapPemasok(p: any): Pemasok {
  return {
    id: p.id,
    kodePemasok: p.kode,
    namaPemasok: p.nama,
    kontak: p.kontak ?? p.telepon ?? '',
    email: p.email ?? '',
    alamat: p.alamat ?? '',
    status: p.status,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

function toBackendPayload(values: PemasokFormValues) {
  return {
    kode: values.kodePemasok,
    nama: values.namaPemasok,
    kontak: values.kontak,
    telepon: values.kontak,
    email: values.email,
    alamat: values.alamat,
    status: values.status,
  };
}

export async function fetchPemasok(): Promise<Pemasok[]> {
  const res = await fetch(`${getApiBase()}/pemasok`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return (data as any[]).map(mapPemasok);
}

export async function isKodePemasokDuplicate(kode: string, excludeId?: string): Promise<boolean> {
  const list = await fetchPemasok();
  return list.some(
    (item) => item.kodePemasok.toLowerCase() === kode.trim().toLowerCase() && item.id !== excludeId,
  );
}

export async function createPemasok(values: PemasokFormValues): Promise<Pemasok> {
  const res = await fetch(`${getApiBase()}/pemasok`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(toBackendPayload(values)),
  });
  const data = await handleResponse(res);
  return mapPemasok(data);
}

export async function updatePemasok(id: string, values: PemasokFormValues): Promise<Pemasok> {
  const res = await fetch(`${getApiBase()}/pemasok/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(toBackendPayload(values)),
  });
  const data = await handleResponse(res);
  return mapPemasok(data);
}

export async function deletePemasok(id: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/pemasok/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Gagal menghapus supplier');
  }
}