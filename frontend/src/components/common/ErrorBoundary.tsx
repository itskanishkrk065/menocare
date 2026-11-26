import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React component error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.removeItem('menocare_token');
    localStorage.removeItem('menocare_user');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
          <div className="bg-cream rounded-2xl border border-[#E2DBD0] shadow-warm-lg p-8 max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 bg-peach-soft text-peach rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6 text-[#A64134]" />
            </div>
            <h2 className="text-base font-serif font-semibold text-charcoal">Something unexpected happened</h2>
            <p className="text-sm text-charcoal-muted">
              We encountered an issue displaying this page. Reloading will safely refresh your view without losing saved information.
            </p>
            {this.state.error?.message && (
              <div className="bg-white/80 rounded-xl p-3 text-xs font-mono text-charcoal-muted text-left overflow-auto max-h-32 border border-[#E2DBD0]">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-oat-light hover:bg-oat text-charcoal rounded-xl text-xs font-medium border border-[#E2DBD0] transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-sage-dark hover:bg-[#3E5437] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Session
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
