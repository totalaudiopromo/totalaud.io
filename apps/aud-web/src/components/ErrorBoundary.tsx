/**
 * Error Boundary Component
 * Phase 12: Critical Pre-Launch Fixes
 *
 * Catches React errors and displays a friendly error UI
 * instead of crashing the entire application.
 */

'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            backgroundColor: '#0F1113',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              textAlign: 'center',
            }}
          >
            {/* Logo */}
            <div style={{ marginBottom: 32 }}>
              <Image
                src="/brand/svg/ta-logo-cyan.svg"
                alt="totalaud.io"
                width={48}
                height={48}
                style={{ opacity: 0.7 }}
              />
            </div>

            {/* Error icon */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: 28,
                color: '#EF4444',
              }}
            >
              !
            </div>

            <h1
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: '#F7F8F9',
                marginBottom: 12,
                letterSpacing: '-0.02em',
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                fontSize: 15,
                color: 'rgba(255, 255, 255, 0.6)',
                lineHeight: 1.6,
                marginBottom: 32,
              }}
            >
              We've encountered an unexpected error. Please try again or return to the workspace.
            </p>

            <div
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={this.handleRetry}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#0F1113',
                  background: 'linear-gradient(135deg, #3AA9BE 0%, #2D8A9C 100%)',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease',
                }}
              >
                Try again
              </button>
              <Link
                href="/workspace"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.7)',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                Go to workspace
              </Link>
            </div>

            {/* Error details (collapsed by default, expandable) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details
                style={{
                  marginTop: 32,
                  textAlign: 'left',
                  padding: 16,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <summary
                  style={{
                    fontSize: 12,
                    color: 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    marginBottom: 8,
                  }}
                >
                  Error details (development only)
                </summary>
                <pre
                  style={{
                    fontSize: 11,
                    color: '#EF4444',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0,
                    fontFamily: 'var(--font-geist-mono), monospace',
                  }}
                >
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
