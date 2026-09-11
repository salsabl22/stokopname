import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { canView } from '../utils/permissions';
import ForbiddenPage from '../pages/ForbiddenPage';

interface RequireModuleProps {
  modul: string;
  children: ReactNode;
}

/**
 * Bungkus sebuah <Route element> dengan ini untuk memblokir
 * halaman dari user yang tidak punya hak "lihat" pada modul tersebut.
 * Sidebar sudah menyembunyikan menunya, tapi guard ini mencegah akses
 * langsung lewat URL oleh user yang tidak berhak.
 */
export default function RequireModule({ modul, children }: RequireModuleProps) {
  const { user } = useAuth();

  if (!canView(user, modul)) {
    return <ForbiddenPage />;
  }

  return <>{children}</>;
}
