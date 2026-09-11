/**
 * Admin Service — terhubung ke backend real API
 * Mengganti implementasi localStorage dengan real API call ke /admin/* endpoints.
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

// ---- ROLES ----
export async function fetchRoles(): Promise<any[]> {
  const res = await fetch(`${getApiBase()}/admin/roles`, { headers: authHeaders() });
  return handleResponse(res);
}

// ---- USERS ----
export async function fetchUsers(): Promise<any[]> {
  const res = await fetch(`${getApiBase()}/admin/users`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createUser(data: any): Promise<any> {
  const res = await fetch(`${getApiBase()}/admin/users`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateUser(id: string, data: any): Promise<any> {
  const res = await fetch(`${getApiBase()}/admin/users/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/admin/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Gagal menghapus user');
  }
}

/**
 * Aktivasi / nonaktifkan user (approve/reject pendaftaran baru)
 * @param isActive true = approve, false = reject/nonaktifkan
 * @param roleId optional, bisa sekaligus assign role
 */
export async function activateUser(id: string, isActive: boolean, roleId?: string): Promise<any> {
  const res = await fetch(`${getApiBase()}/admin/users/${id}/activate`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ isActive, roleId }),
  });
  return handleResponse(res);
}

export async function updateRolePermissions(roleId: string, permData: any): Promise<any> {
  const res = await fetch(`${getApiBase()}/admin/roles/${roleId}/permissions`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(permData),
  });
  return handleResponse(res);
}

export async function updateUserPermissions(userId: string, permData: any): Promise<any> {
  const res = await fetch(`${getApiBase()}/admin/users/${userId}/permissions`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(permData),
  });
  return handleResponse(res);
}
