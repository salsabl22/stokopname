import { useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { buildNavGroups } from './Sidebar';
import { resolveBreadcrumb } from '../../utils/breadcrumb';
import { useAuth } from '../../contexts/AuthContext';
import { useBusinessUnit } from '../../contexts/BusinessUnitContext';

export default function Header() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { activeUnit, activeUnitInfo } = useBusinessUnit();

  // Bangun nav groups dinamis berdasarkan unit bisnis aktif (agar breadcrumb "Cabang"/"Event" sesuai)
  const navGroups = buildNavGroups(activeUnit);
  const breadcrumb = resolveBreadcrumb(location.pathname, navGroups);

  // Resolve user role label
  const roleLabel = (() => {
    const role = (user as any)?.role;
    if (typeof role === 'string') return role === 'ADMIN_MASTER' ? 'Administrator' : role;
    if (role?.name) return role.name;
    return 'Staf';
  })();

  return (
    <header className="h-14 shrink-0 bg-white border-b border-surface-border flex items-center justify-between pl-14 lg:pl-6 pr-4 lg:pr-6 sticky top-0 z-10">
      <div className="leading-tight">
        {breadcrumb.group && (
          <p className="text-[11px] text-slate-400 hidden sm:block">{breadcrumb.group}</p>
        )}
        <h1 className="text-sm font-semibold text-slate-800">{breadcrumb.label}</h1>
      </div>


      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 pl-4 border-l border-surface-border">
          <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-xs font-semibold flex items-center justify-center uppercase">
            {user?.name ? user.name.substring(0, 2) : 'U'}
          </div>
          <div className="leading-tight">
            <p className="text-xs font-medium text-slate-800">{user?.name || 'Guest'}</p>
            <p className="text-[11px] text-slate-400">{roleLabel}</p>
          </div>
          <button
            onClick={logout}
            className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
