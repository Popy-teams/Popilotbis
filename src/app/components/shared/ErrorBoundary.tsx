import { Component, type ErrorInfo, type ReactNode } from 'react';

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

  private handleReset = () => {
    this.setState({ error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen saas-shell flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl border border-rose-200 bg-white p-6 shadow-sm space-y-4">
            <h1 className="text-lg font-semibold text-slate-900">Une erreur est survenue</h1>
            <p className="text-sm text-slate-600">
              L&apos;interface n&apos;a pas pu s&apos;afficher. Vous pouvez réessayer ou recharger la page.
            </p>
            <p className="text-xs text-rose-700 font-mono break-all bg-rose-50 rounded-lg p-3">
              {this.state.error.message}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => this.setState({ error: null })}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50"
              >
                Réessayer
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
              >
                Recharger l&apos;accueil
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
