import { Component, type ReactNode, type ErrorInfo } from "react"

interface ErrorBoundaryProps {
   children: ReactNode
   fallback?: ReactNode
}

interface ErrorBoundaryState {
   hasError: boolean
   error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
   constructor(props: ErrorBoundaryProps) {
      super(props)
      this.state = { hasError: false, error: null }
   }

   static getDerivedStateFromError(error: Error): ErrorBoundaryState {
      return { hasError: true, error }
   }

   componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      console.error("ErrorBoundary caught:", error, errorInfo)
   }

   render() {
      if (this.state.hasError) {
         if (this.props.fallback) {
            return this.props.fallback
         }

         return (
            <div className="flex items-center justify-center h-screen w-screen bg-bg-primary">
               <div className="max-w-md text-center p-8">
                  <div className="w-14 h-14 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center mx-auto mb-5">
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-error"
                     >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                     </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-text-primary mb-2">
                     Something went wrong
                  </h2>
                  <p className="text-sm text-text-muted mb-6 leading-relaxed">
                     An unexpected error occurred. Please try restarting the application.
                  </p>
                  <pre className="text-xs text-left text-text-muted bg-bg-secondary p-4 rounded-lg border border-border overflow-auto max-h-32 mb-6">
                     {this.state.error?.message}
                  </pre>
                  <button
                     onClick={() => {
                        this.setState({ hasError: false, error: null })
                        window.location.reload()
                     }}
                     className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
                  >
                     Reload Application
                  </button>
               </div>
            </div>
         )
      }

      return this.props.children
   }
}
