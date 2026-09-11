/**
 * Util terpusat untuk cek hak akses (role & permission) di sisi frontend.
 *
 * Struktur `permissions` mengikuti model Prisma `Permission` di backend:
 *  { modul: string, lihat, buat, ubah, hapus, proses, setujui, export: boolean }
 *
 * Role dengan akses penuh HARUS sama persis dengan nama role di backend
 * (lihat backend/prisma/seed.ts dan backend/src/middleware/authMiddleware.ts).
 */

export const FULL_ACCESS_ROLE = 'SUPER ADMIN';

export type Aksi = 'lihat' | 'buat' | 'ubah' | 'hapus' | 'proses' | 'setujui' | 'export';

export interface PermissionLike {
  modul: string;
  lihat?: boolean;
  buat?: boolean;
  ubah?: boolean;
  hapus?: boolean;
  proses?: boolean;
  setujui?: boolean;
  export?: boolean;
}

export interface AuthUserLike {
  role?: string;
  permissions?: PermissionLike[];
}

/** True jika role user adalah role dengan akses penuh ke semua modul. */
export function isFullAccessRole(user: AuthUserLike | null | undefined): boolean {
  return user?.role === FULL_ACCESS_ROLE;
}

/**
 * Cek apakah user boleh melakukan `aksi` pada `modul` tertentu.
 * SUPER ADMIN selalu diloloskan. Permission dengan modul 'semua' berlaku
 * sebagai wildcard untuk semua modul (mengikuti logika backend).
 */
export function canAccess(
  user: AuthUserLike | null | undefined,
  modul: string,
  aksi: Aksi = 'lihat',
): boolean {
  if (!user) return false;
  if (isFullAccessRole(user)) return true;

  const permissions = user.permissions || [];
  const perm = permissions.find((p) => p.modul === modul || p.modul === 'semua');
  return Boolean(perm?.[aksi]);
}

/** Shortcut khusus untuk cek hak "lihat" (tampilkan menu/route). */
export function canView(user: AuthUserLike | null | undefined, modul: string): boolean {
  return canAccess(user, modul, 'lihat');
}
