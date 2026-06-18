import { Navigate, Route, Routes } from 'react-router';
import { useAuth } from './auth/AuthContext';
import { AuthPage } from './auth/AuthPage';
import { AppLayout } from './layouts/AppLayout';
import { VIEW_ELEMENTS } from './routes/AppViewRoutes';
import { APP_ROUTES, DEFAULT_VIEW, getRoutePath, LOGIN_PATH } from './routes/viewRoutes';

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen saas-shell flex items-center justify-center">
      <div className="text-slate-600">Chargement...</div>
    </div>
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

      <Route
        element={user ? <AppLayout /> : <Navigate to={LOGIN_PATH} replace />}
      >
        <Route index element={<Navigate to={getRoutePath(DEFAULT_VIEW)} replace />} />
        {APP_ROUTES.map(({ id, path }) => (
          <Route key={id} path={path} element={VIEW_ELEMENTS[id]} />
        ))}
        <Route path="*" element={<Navigate to={getRoutePath(DEFAULT_VIEW)} replace />} />
      </Route>

      {!user ? <Route path="*" element={<Navigate to={LOGIN_PATH} replace />} /> : null}
    </Routes>
  );
}

export type { ViewType } from './routes/viewRoutes';
