function getApiBase(): string {
  const unit = localStorage.getItem('wms_unit_bisnis');
  const path = unit === 'KERIPIK_BUJANGAN' ? 'keripik-bujangan' : 'fotosnaps';
  return `${import.meta.env.VITE_API_URL || ''}/api/${path}`;
}

export async function loginWithCredentials(
  username: string,
  password: string,
): Promise<{ token: string; user: any }> {
  const res = await fetch(`${getApiBase()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Login gagal. Periksa kembali username dan password Anda.');
  }

  return { token: data.token, user: data.user };
}

export async function fetchCurrentUser(token: string): Promise<any> {
  const res = await fetch(`${getApiBase()}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Sesi tidak valid. Silakan login kembali.');
  }

  return res.json();
}

/**
 * Mendaftarkan akun baru. Akun tidak langsung aktif — menunggu persetujuan admin.
 */
export async function registerUser(data: {
  username: string;
  name: string;
  password: string;
}): Promise<{ message: string; userId: string }> {
  const res = await fetch(`${getApiBase()}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || 'Pendaftaran gagal. Silakan coba lagi.');
  }

  return json;
}
