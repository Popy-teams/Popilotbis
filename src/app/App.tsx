import { Navigate, Route, Routes } from 'react-router';
import { useAuth } from './auth/AuthContext';
import { useProjectContext } from './context/ProjectContext';
import { AuthPage } from './auth/AuthPage';
import { AppLayout } from './layouts/AppLayout';
import { VIEW_ELEMENTS } from './routes/AppViewRoutes';
import { APP_ROUTES, DEFAULT_VIEW, getRoutePath, LOGIN_PATH } from './routes/viewRoutes';
import { PublicSurveyPage } from './components/satisfaction/PublicSurveyPage';

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen saas-shell flex items-center justify-center">
      <div className="text-slate-600">Chargement...</div>
    </div>
  );
}

function ProjectsLoadingScreen() {
  return (
    <div className="min-h-screen saas-shell flex flex-col items-center justify-center gap-3 p-6">
      <div className="h-10 w-10 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
      <p className="text-sm text-stone-600">Chargement des projets…</p>
    </div>
  );
}

function AuthenticatedRoutes() {
  const { user } = useAuth();
  const { ready } = useProjectContext();
  const homePath = `/${getRoutePath(DEFAULT_VIEW)}`;

  if (!user) return <Navigate to={LOGIN_PATH} replace />;
  if (!ready) return <ProjectsLoadingScreen />;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to={getRoutePath(DEFAULT_VIEW)} replace />} />
        {APP_ROUTES.map(({ id, path }) => (
          <Route key={id} path={path} element={VIEW_ELEMENTS[id]} />
        ))}
        <Route path="*" element={<Navigate to={getRoutePath(DEFAULT_VIEW)} replace />} />
      </Route>
      <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const homePath = `/${getRoutePath(DEFAULT_VIEW)}`;

  if (loading) return <AuthLoadingScreen />;

  return (
    <Routes>
      <Route
        path={LOGIN_PATH}
        element={user ? <Navigate to={homePath} replace /> : <AuthPage />}
      />
      <Route path="/enquete/:token" element={<PublicSurveyPage />} />
      <Route path="/*" element={<AuthenticatedRoutes />} />
    </Routes>
  );
}

export type { ViewType } from './routes/viewRoutes';
