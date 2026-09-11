/**
 * Produk Service — terhubung ke backend real API
 * getApiBase() dipanggil saat tiap request (dynamic) agar unit bisnis
 * terbaca dari localStorage dengan benar.
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

export async function fetchProduk(filters?: { unitBisnis?: string; kategori?: string; status?: string; search?: string }): Promise<any[]> {
  const params = new URLSearchParams();
  if (filters?.unitBisnis) params.set('unitBisnis', filters.unitBisnis);
  if (filters?.kategori) params.set('kategori', filters.kategori);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.search) params.set('search', filters.search);

  const url = `${getApiBase()}/produk${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url, { headers: authHeaders() });
  return handleResponse(res);
}

export async function fetchProdukById(id: string): Promise<any> {
  const res = await fetch(`${getApiBase()}/produk/${id}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createProduk(values: Record<string, any>): Promise<any> {
  const res = await fetch(`${getApiBase()}/produk`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(values),
  });
  return handleResponse(res);
}

export async function updateProduk(id: string, values: Record<string, any>): Promise<any> {
  const res = await fetch(`${getApiBase()}/produk/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(values),
  });
  return handleResponse(res);
}

export async function deleteProduk(id: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/produk/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Gagal menghapus produk');
  }
}

// Backward-compat: cek kode produk duplikat via API
export async function isKodeProdukDuplicate(kode: string, excludeId?: string): Promise<boolean> {
  try {
    const list = await fetchProduk({ search: kode });
    return list.some(
      (p: any) => p.kodeProduk.toLowerCase() === kode.trim().toLowerCase() && p.id !== excludeId,
    );
  } catch {
    return false;
  }
}
