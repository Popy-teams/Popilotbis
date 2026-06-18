import { NavLink } from 'react-router';
import type { AuthUser } from '../auth/authApi';
import { APP_ROUTES, type NavSection } from '../routes/viewRoutes';
import { X } from 'lucide-react';
import { AppIcon } from './shared/icons';
import { cn } from './ui/utils';

interface SidebarProps {
  user: AuthUser;
  onNavigate?: () => void;
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ user, onNavigate, open = false, onClose }: SidebarProps) {
  const renderNavSection = (section: NavSection, title: string) => (
    <div className={section === 'personal' ? 'mb-4' : undefined}>
      <div className="text-xs uppercase text-indigo-300 font-semibold mb-2 px-4">{title}</div>
      {APP_ROUTES.filter((item) => item.section === section).map((item) => (
        <NavLink
          key={item.id}
          to={`/${item.path}`}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left',
              isActive
                ? 'bg-indigo-600 text-white font-medium shadow-md'
                : 'text-indigo-100 hover:bg-indigo-800/40'
            )
          }
        >
          {({ isActive }) => (
            <>
              <AppIcon icon={item.icon} size="md" className={isActive ? 'text-white' : 'text-indigo-200'} />
              <span className="truncate">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] bg-gradient-to-b from-slate-900 to-indigo-950 text-white flex flex-col border-r border-indigo-900/40',
        'transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:max-w-none lg:shrink-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
      aria-label="Navigation principale"
    >
      <div className="p-6 border-b border-indigo-800/50 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">POPILOT</h1>
          <p className="text-indigo-200/90 text-sm mt-1">ISO 9001 Certified</p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-indigo-800/40 shrink-0"
            aria-label="Fermer le menu"
          >
            <AppIcon icon={X} size="md" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {renderNavSection('personal', 'Mon espace')}
        {renderNavSection('management', 'Management')}
        {renderNavSection('quality', 'Qualité')}
      </nav>

      <div className="p-4 border-t border-indigo-700/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-semibold shrink-0">
            {user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{user.name}</div>
            <div className="text-xs text-indigo-200 truncate capitalize">{user.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
