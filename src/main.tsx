import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './app/App.tsx';
import { AuthProvider } from './app/auth/AuthContext.tsx';
import { ProjectProvider } from './app/context/ProjectContext.tsx';
import { PipelineProvider } from './app/context/PipelineContext.tsx';
import { ErrorBoundary } from './app/components/shared/ErrorBoundary.tsx';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <PipelineProvider>
            <App />
          </PipelineProvider>
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>
);
