import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Popilot] Erreur interface', error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen saas-shell flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-lg w-full rounded-2xl border border-stone-200 bg-white shadow-lg overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400" />
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-stone-900">Une erreur est survenue</h1>
                  <p className="text-sm text-stone-600 mt-1">
                    L&apos;interface n&apos;a pas pu s&apos;afficher correctement. Rechargez la page pour repartir sur une base saine.
                  </p>
                </div>
              </div>
              <p className="text-xs text-rose-800 font-mono break-all bg-rose-50 rounded-xl border border-rose-100 p-3">
                {this.state.error.message}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Recharger la page
                </button>
                <button
                  type="button"
                  onClick={this.handleHome}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm font-semibold hover:bg-stone-50 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Retour à l&apos;accueil
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
