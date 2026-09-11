/**
 * Pengendalian Service — terhubung ke backend real API
 * Mencakup: Waste, ExceptionLog (Pengembalian ke Pemasok), Perhitungan Stok
 */

const getApiBase = () => {
  const unit = localStorage.getItem('wms_unit_bisnis') === 'KERIPIK_BUJANGAN' ? 'keripik-bujangan' : 'fotosnaps';
  return `${import.meta.env.VITE_API_URL || ''}/api/${unit}`;
};

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

// ---- WASTES ----
export async function fetchWastes(): Promise<any[]> {
  const res = await fetch(`${getApiBase()}/pengendalian/waste`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createWaste(data: any): Promise<any> {
  const res = await fetch(`${getApiBase()}/pengendalian/waste`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ---- EXCEPTIONS (Pengembalian ke Pemasok) ----
export async function fetchExceptions(): Promise<any[]> {
  const res = await fetch(`${getApiBase()}/pengendalian/exceptions`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createException(data: any): Promise<any> {
  const res = await fetch(`${getApiBase()}/pengendalian/exceptions`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function resolveException(id: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/pengendalian/exceptions/${id}/resolve`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Gagal menyelesaikan pengembalian');
  }
}

// ---- STOCK OPNAME / PERHITUNGAN STOK ----
export async function fetchPerhitunganStok(): Promise<any[]> {
  const res = await fetch(`${getApiBase()}/pengendalian/stock-opname`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createPerhitunganStok(data: any): Promise<any> {
  const res = await fetch(`${getApiBase()}/pengendalian/stock-opname`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}