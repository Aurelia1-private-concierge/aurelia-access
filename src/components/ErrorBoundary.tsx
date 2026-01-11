import { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("ErrorBoundary caught an error:", error);
    this.setState({ errorInfo });
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="relative min-h-[100dvh] bg-background overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, hsl(var(--destructive) / 0.3) 0%, transparent 50%)`
            }} />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <Logo variant="full" size="lg" linkTo="/" />
            </motion.div>

            {/* Error Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center mb-12 max-w-lg"
            >
              <div className="w-20 h-20 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
              
              <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
                Something Went Wrong
              </h1>
              
              <p className="text-muted-foreground text-lg mb-6">
                We apologize for the inconvenience. Our team has been notified and is working to resolve this issue.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-4 bg-secondary/50 border border-border/30 rounded-lg text-left">
                  <p className="text-sm font-mono text-destructive mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-muted-foreground overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                onClick={this.handleRefresh}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-5"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              
              <Button
                asChild
                variant="outline"
                className="border-primary/30 hover:border-primary hover:bg-primary/10 px-6 py-5"
              >
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Return Home
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="border-primary/30 hover:border-primary hover:bg-primary/10 px-6 py-5"
              >
                <Link to="/orla">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <p className="text-muted-foreground/50 text-sm text-center">
                If this issue persists, please contact your dedicated concierge.
              </p>
            </motion.div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
