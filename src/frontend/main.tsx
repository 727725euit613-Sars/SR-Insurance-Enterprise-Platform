import React, { Component, type ReactNode, type ErrorInfo } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in React tree:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          backgroundColor: "#070C18",
          color: "#F8FAFC",
          padding: "40px",
          fontFamily: "system-ui, -apple-system, sans-serif"
        }}>
          <div style={{
            maxWidth: "800px",
            margin: "0 auto",
            backgroundColor: "rgba(30, 41, 59, 0.8)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
          }}>
            <h1 style={{ color: "#EF4444", fontSize: "22px", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "10px" }}>
              <span>⚠️</span> Application Render Error
            </h1>
            <p style={{ color: "#CBD5E1", fontSize: "14px", lineHeight: "1.6" }}>
              An error occurred during component rendering:
            </p>
            <pre style={{
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              color: "#FCA5A5",
              padding: "16px",
              borderRadius: "8px",
              overflowX: "auto",
              fontSize: "13px",
              marginTop: "12px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word"
            }}>
              {this.state.error?.toString()}
            </pre>
            {this.state.errorInfo?.componentStack && (
              <details style={{ marginTop: "16px" }}>
                <summary style={{ color: "#93C5FD", cursor: "pointer", fontSize: "13px" }}>View Component Stack Trace</summary>
                <pre style={{
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  color: "#94A3B8",
                  padding: "16px",
                  borderRadius: "8px",
                  overflowX: "auto",
                  fontSize: "12px",
                  marginTop: "8px",
                  whiteSpace: "pre-wrap"
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{
                marginTop: "24px",
                backgroundColor: "#2563EB",
                color: "#FFFFFF",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "13px"
              }}
            >
              Clear Storage & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);