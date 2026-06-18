import { Bell, ChevronDown, FolderKanban, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { AuthUser } from '../auth/authApi';
import { useAuth } from '../auth/AuthContext';
import { useProjectContext } from '../context/ProjectContext';
import { LOGIN_PATH } from '../routes/viewRoutes';
import { AppIcon } from './shared/icons';
import { IconButton } from './shared/IconButton';
import { SearchField } from './shared/SearchField';

interface HeaderProps {
  user: AuthUser;
  onMenuClick?: () => void;
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { visibleProjects, activeProjectId, setActiveProjectId, activeProject } = useProjectContext();

  const handleLogout = () => {
    logout();
    navigate(LOGIN_PATH, { replace: true });
  };

  return (
    <header className="bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 shrink-0">
      <div className="flex items-center gap-3 sm:gap-4">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-1 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            aria-label="Ouvrir le menu"
          >
            <AppIcon icon={Menu} size="md" />
          </button>
        ) : null}

        <div className="relative shrink-0 min-w-0 max-w-[min(100%,14rem)] sm:max-w-none">
          <label htmlFor="active-project" className="sr-only">
            Projet actif
          </label>
          <div className="form-select-wrap rounded-xl border border-indigo-200 bg-indigo-50/50 min-w-[10rem] sm:min-w-[14rem]">
            <AppIcon icon={FolderKanban} size="sm" className="form-select-icon text-indigo-600" />
            <select
              id="active-project"
              value={activeProjectId ?? ''}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="form-select form-select-with-icon bg-transparent border-0 shadow-none focus:shadow-none text-sm font-semibold text-indigo-900 min-h-[2.5rem] py-2 pr-9"
            >
              {visibleProjects.length === 0 ? (
                <option value="">Aucun projet</option>
              ) : (
                visibleProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))
              )}
            </select>
            <AppIcon icon={ChevronDown} size="xs" className="form-select-chevron text-indigo-500" />
          </div>
        </div>

        <div className="flex-1 min-w-0 max-w-xl hidden sm:block">
          <SearchField
            placeholder={
              activeProject
                ? `Rechercher dans ${activeProject.name}...`
                : 'Rechercher un projet, une tâche...'
            }
            className="saas-input text-sm"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
          <span className="hidden md:inline text-sm text-slate-600 truncate max-w-[8rem]">{user.name}</span>
          <div className="relative">
            <IconButton icon={Bell} label="Notifications" className="text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full pointer-events-none" />
          </div>
          <IconButton icon={LogOut} label="Se déconnecter" onClick={handleLogout} className="text-slate-600" />
        </div>
      </div>
    </header>
  );
}
