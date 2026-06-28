import { NavLink } from 'react-router';
import { ChevronRight, X } from 'lucide-react';
import type { AuthUser } from '../auth/authApi';
import { APP_ROUTES, type NavSection } from '../routes/viewRoutes';
import { AppIcon } from './shared/icons';
import { cn } from './ui/utils';

interface SidebarProps {
  user: AuthUser;
  onNavigate?: () => void;
  open?: boolean;
  onClose?: () => void;
}

const SECTIONS: { key: NavSection; title: string }[] = [
  { key: 'personal', title: 'Mon espace' },
  { key: 'management', title: 'Management' },
  { key: 'quality', title: 'Qualité' },
];

const SECTION_ICON_CLASS: Record<NavSection, string> = {
  personal: 'text-sky-600',
  management: 'text-indigo-600',
  quality: 'text-violet-600',
};

function UserInitials({ name }: { name: string }) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function Sidebar({ user, onNavigate, open = false, onClose }: SidebarProps) {
  return (
    <aside
      className={cn('app-sidebar app-sidebar--mobile', open && 'app-sidebar--open')}
      aria-label="Navigation principale"
    >
      <div className="app-sidebar__backdrop" aria-hidden>
        <div className="app-sidebar__orb app-sidebar__orb--1" />
        <div className="app-sidebar__orb app-sidebar__orb--2" />
        <div className="app-sidebar__orb app-sidebar__orb--3" />
      </div>
      <div className="app-sidebar__sheen" aria-hidden />
      <div className="app-sidebar__noise" aria-hidden />

      <div className="app-sidebar__inner">
        <header className="app-sidebar__brand">
          <div className="app-sidebar__logo-row">
            <div className="app-sidebar__logo-mark">
              <div className="app-sidebar__logo-icon" aria-hidden>
                <span>PO</span>
              </div>
              <div className="min-w-0">
                <h1 className="app-sidebar__title">POPILOT</h1>
                <div className="app-sidebar__badge">
                  <span className="app-sidebar__badge-dot" aria-hidden />
                  ISO 9001 Certified
                </div>
              </div>
            </div>
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="app-sidebar__close lg:hidden"
                aria-label="Fermer le menu"
              >
                <AppIcon icon={X} size="sm" />
              </button>
            ) : null}
          </div>
        </header>

        <nav className="app-sidebar__nav">
          {SECTIONS.map(({ key, title }) => {
            const items = APP_ROUTES.filter((item) => item.section === key);
            if (items.length === 0) return null;

            return (
              <div key={key} className="app-sidebar__section">
                <div className="app-sidebar__section-label">{title}</div>
                <div className="app-sidebar__links">
                  {items.map((item) => (
                    <NavLink
                      key={item.id}
                      to={`/${item.path}`}
                      onClick={onNavigate}
                      data-section={key}
                      className={({ isActive }) =>
                        cn('app-sidebar__link', isActive && 'app-sidebar__link--active')
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className="app-sidebar__reflet" aria-hidden />
                          <span className="app-sidebar__link-indicator" aria-hidden />
                          <span className="app-sidebar__icon-wrap">
                            <AppIcon
                              icon={item.icon}
                              size="sm"
                              className={
                                isActive ? SECTION_ICON_CLASS[key] : 'text-slate-500'
                              }
                            />
                          </span>
                          <span className="app-sidebar__label">{item.label}</span>
                          {isActive ? (
                            <ChevronRight className="app-sidebar__chevron" aria-hidden />
                          ) : null}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <footer className="app-sidebar__footer">
          <div className="app-sidebar__user">
            <div className="app-sidebar__avatar">
              <span className="app-sidebar__avatar-inner">
                <UserInitials name={user.name} />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="app-sidebar__user-name">{user.name}</div>
              <div className="app-sidebar__user-role">{user.role}</div>
            </div>
          </div>
        </footer>
      </div>
    </aside>
  );
}
