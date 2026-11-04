// src/components/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🚨 [Arab Aura Error Boundary Caught]:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("user_role");
    } catch {
      // ignore
    }
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-amber-500"
        >
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
            {/* الخلفية الجمالية المتوهجة */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* الأيقونة */}
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-3xl shadow-inner">
              ⚠️
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white mb-2">
              عذراً، حدث خطأ غير متوقع
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
              واجه التطبيق استثناءً عارضاً أثناء معالجة الصفحة. لقد تم عزل المشكلة تلقائياً لمنع تعطل المنصة، ويمكنك المتابعة بسهولة:
            </p>

            {this.state.error && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-6 text-start text-[11px] font-mono text-rose-400 overflow-x-auto max-h-24">
                {this.state.error.message || "Unknown Application Exception"}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-400/20 cursor-pointer"
              >
                🔄 إعادة تحميل الصفحة
              </button>
              <button
                onClick={this.handleResetCache}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700 cursor-pointer"
              >
                🏠 العودة للرئيسية
              </button>
            </div>

            <p className="mt-5 text-[10px] text-slate-500 font-medium">
              منصة عرب أورا (3ARB AURA) © 2026 - نظام التعافي الذكي
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
