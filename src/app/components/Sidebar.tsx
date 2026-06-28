import { NavLink } from 'react-router';
import { ChevronRight, X } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { AuthUser } from '../auth/authApi';
import { APP_ROUTES, type NavSection } from '../routes/viewRoutes';
import { NAV_ICON_THEMES } from '../routes/navIconThemes';
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
      className={cn(
        'app-sidebar',
        'fixed inset-y-0 left-0 z-50',
        'md:relative md:z-auto md:shrink-0 md:translate-x-0 md:pointer-events-auto',
        'transition-transform duration-300 ease-out',
        'shadow-xl md:shadow-none',
        open ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none md:translate-x-0'
      )}
      aria-label="Navigation principale"
    >
      <div className="app-sidebar__backdrop" aria-hidden />
      <div className="app-sidebar__sheen" aria-hidden />

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
                  ISO 9001
                </div>
              </div>
            </div>
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="app-sidebar__close md:hidden"
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
                  {items.map((item) => {
                    const iconTheme = NAV_ICON_THEMES[item.id];
                    return (
                      <NavLink
                        key={item.id}
                        to={`/${item.path}`}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          cn('app-sidebar__link', isActive && 'app-sidebar__link--active')
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className="app-sidebar__link-indicator"
                              aria-hidden
                              style={
                                isActive && iconTheme.indicator
                                  ? ({ background: iconTheme.indicator } as CSSProperties)
                                  : undefined
                              }
                            />
                            <span className={cn('app-sidebar__icon-wrap', iconTheme.wrap)}>
                              <AppIcon icon={item.icon} size="sm" className={iconTheme.icon} />
                            </span>
                            <span className="app-sidebar__label">{item.label}</span>
                            {isActive ? (
                              <ChevronRight className="app-sidebar__chevron" aria-hidden />
                            ) : null}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
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
