import React from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto my-12 p-8 bg-[#111118] border border-rose-500/30 rounded-2xl shadow-2xl space-y-5 text-center">
          <div className="w-14 h-14 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white font-display">
              {this.props.title || "Interface Component Encountered an Issue"}
            </h2>
            <p className="text-xs text-[#C8B89A] mt-1.5 max-w-md mx-auto leading-relaxed">
              {this.state.error?.message || "An unexpected error occurred while rendering this interface view."}
            </p>
          </div>

          {this.state.error && (
            <div className="bg-[#0A0A0F] text-[#F5E8C7] border border-[#252538] p-4 rounded-xl text-left font-mono text-[11px] overflow-x-auto max-h-40">
              <span className="text-rose-400 font-bold block mb-1">
                {this.state.error.toString()}
              </span>
              <pre className="text-[10px] text-[#8E8271] whitespace-pre-wrap">
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="btn-gold px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload View
            </button>
            <button
              onClick={() => window.location.href = "/dashboard"}
              className="btn-dark px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
