import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useAuth } from '../auth/AuthContext';
import { LOGIN_PATH } from '../routes/viewRoutes';

export function AppLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => {
      if (mq.matches) setSidebarOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  if (!user) return <Navigate to={LOGIN_PATH} replace />;

  return (
    <div className="flex h-dvh min-h-0 saas-shell overflow-hidden">
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 bg-stone-900/25 backdrop-blur-[2px] z-40 md:hidden transition-opacity"
          aria-label="Fermer le menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <Sidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0 w-full">
        <Header user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
