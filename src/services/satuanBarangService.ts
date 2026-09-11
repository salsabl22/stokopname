/**
 * SatuanBarang Service — terhubung ke backend real API
 *
 * Backend Prisma schema menggunakan: kode, nama, deskripsi, isActive
 * Frontend type menggunakan: kodeSatuan, namaSatuan, satuanDasar, nilaiKonversi, status
 * Adapter di sini menangani mapping keduanya secara transparan.
 */

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

/**
 * Adapter: ubah format backend → format frontend
 * Backend: { kode, nama, deskripsi, isActive }
 * Frontend: { kodeSatuan, namaSatuan, satuanDasar, nilaiKonversi, status }
 */
function toFrontend(item: any) {
  return {
    id: item.id,
    kodeSatuan: item.kode || item.kodeSatuan || '',
    namaSatuan: item.nama || item.namaSatuan || '',
    satuanDasar: item.satuanDasar || item.deskripsi || '-',
    nilaiKonversi: item.nilaiKonversi || 1,
    status: item.isActive === false ? 'nonaktif' : (item.status || 'aktif'),
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
}

/**
 * Adapter: ubah format frontend form values → format backend
 */
function toBackend(values: any) {
  return {
    kode: values.kodeSatuan || values.kode,
    nama: values.namaSatuan || values.nama,
    deskripsi: values.satuanDasar || values.deskripsi || null,
    isActive: values.status !== 'nonaktif',
    nilaiKonversi: values.nilaiKonversi ? Number(values.nilaiKonversi) : undefined,
    satuanDasar: values.satuanDasar || undefined,
  };
}

// Fetch semua satuan barang dari backend
export async function fetchSatuanBarang(): Promise<any[]> {
  const res = await fetch(`${getApiBase()}/satuan-barang`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return Array.isArray(data) ? data.map(toFrontend) : [];
}

export async function createSatuanBarang(values: Record<string, any>): Promise<any> {
  const res = await fetch(`${getApiBase()}/satuan-barang`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(toBackend(values)),
  });
  const data = await handleResponse(res);
  return toFrontend(data);
}

export async function updateSatuanBarang(id: string, values: Record<string, any>): Promise<any> {
  const res = await fetch(`${getApiBase()}/satuan-barang/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(toBackend(values)),
  });
  const data = await handleResponse(res);
  return toFrontend(data);
}

export async function deleteSatuanBarang(id: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/satuan-barang/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Gagal menghapus satuan');
  }
}

export async function setSatuanBarangStatus(id: string, status: 'aktif' | 'nonaktif'): Promise<void> {
  await updateSatuanBarang(id, { status });
}

// Cek duplikat kode satuan
export async function isKodeSatuanDuplicate(kode: string, excludeId?: string): Promise<boolean> {
  try {
    const list = await fetchSatuanBarang();
    return list.some(
      (s: any) => s.kodeSatuan?.toLowerCase() === kode.trim().toLowerCase() && s.id !== excludeId,
    );
  } catch {
    return false;
  }
}
