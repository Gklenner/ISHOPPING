"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { captureError } from "@/lib/error-tracking"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
    captureError(error, { errorInfo })
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Algo deu errado</h2>
              <p className="text-muted-foreground mb-6">Desculpe pelo inconveniente. Nossa equipe foi notificada.</p>
              <Button onClick={this.handleReload}>Tentar novamente</Button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

