import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Mail } from "lucide-react";
import { Button } from "@/components/ui";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleContactSupport = () => {
    window.location.href =
      "mailto:info@mordorintelligence.com?subject=Error Report&body=Hello, I encountered an error while using your application.";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
          <div className="max-w-lg w-full mx-auto text-center">
            {/* Animated icon container */}
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto bg-red-50 rounded-full flex items-center justify-center shadow-lg border border-red-100">
                <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" />
              </div>
              <div className="absolute -inset-4 bg-red-100 rounded-full opacity-20 animate-ping"></div>
            </div>

            {/* Error content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Oops! Something went wrong
              </h1>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                We've encountered an unexpected error. Please try refreshing the
                page.
              </p>

              {/* Support message */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700">
                  <strong>If this error keeps persisting</strong>, please reach
                  out to us at:
                </p>
                <a
                  href="mailto:info@mordorintelligence.com"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                >
                  info@mordorintelligence.com
                </a>
              </div>

              {/* Error code hint */}
              <code className="bg-gray-50 rounded-lg p-3 mb-6 block w-full">
                <p className="text-xs text-gray-500 font-mono">
                  Error: {this.state.error?.message || "Unknown Error"}
                </p>
              </code>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  icon={RefreshCw}
                  variant="secondary"
                  className="flex-1"
                >
                  Refresh Page
                </Button>
                <Button
                  onClick={this.handleReset}
                  icon={Home}
                  variant="outline"
                  className="flex-1 "
                >
                  Try Again
                </Button>
              </div>
            </div>

            {/* Support section */}
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-3">
                Need immediate assistance?
              </p>
              <Button
                onClick={this.handleContactSupport}
                icon={Mail}
                variant="ghost"
                size="sm"
              >
                Email Support
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
