/**
 * Cabang Service — terhubung ke backend real API
 */
import type { Cabang, CabangFormValues } from '../types/cabang';

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

// Backend pakai: kode, nama, telepon, alamat, status.
// Frontend pakai: kodeCabang, namaCabang, telepon, alamat, status.
function mapCabang(c: any): Cabang {
  return {
    id: c.id,
    kodeCabang: c.kode,
    namaCabang: c.nama,
    alamat: c.alamat ?? '',
    telepon: c.telepon ?? '',
    status: c.status,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

function toBackendPayload(values: CabangFormValues) {
  return {
    kode: values.kodeCabang,
    nama: values.namaCabang,
    telepon: values.telepon,
    alamat: values.alamat,
    status: values.status,
  };
}

export async function fetchCabang(): Promise<Cabang[]> {
  const res = await fetch(`${getApiBase()}/cabang`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return (data as any[]).map(mapCabang);
}

export async function isKodeCabangDuplicate(kode: string, excludeId?: string): Promise<boolean> {
  const list = await fetchCabang();
  return list.some(
    (item) => item.kodeCabang.toLowerCase() === kode.trim().toLowerCase() && item.id !== excludeId,
  );
}

export async function createCabang(values: CabangFormValues): Promise<Cabang> {
  const res = await fetch(`${getApiBase()}/cabang`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(toBackendPayload(values)),
  });
  const data = await handleResponse(res);
  return mapCabang(data);
}

export async function updateCabang(id: string, values: CabangFormValues): Promise<Cabang> {
  const res = await fetch(`${getApiBase()}/cabang/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(toBackendPayload(values)),
  });
  const data = await handleResponse(res);
  return mapCabang(data);
}

export async function deleteCabang(id: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/cabang/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Gagal menghapus cabang');
  }
}