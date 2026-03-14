import React from "react";

interface RouteErrorBoundaryProps {
  children: React.ReactNode;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class RouteErrorBoundary extends React.Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[RouteErrorBoundary] Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-xl font-semibold text-slate-900 mb-2">
                Oups, quelque chose s'est mal passe
              </h1>
              <p className="text-sm text-slate-500">
                Une erreur inattendue est survenue. Veuillez recharger la page ou revenir a l'accueil.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Recharger la page
              </button>
              <a
                href="/"
                className="w-full inline-block px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors"
              >
                Retour a l'accueil
              </a>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="text-left mt-4">
                <summary className="cursor-pointer text-xs text-slate-400">
                  Details (dev only)
                </summary>
                <pre className="mt-2 text-xs bg-slate-100 p-3 rounded-lg overflow-auto text-slate-600 whitespace-pre-wrap">
                  {this.state.error.message}
                  {"\n\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorBoundary;
