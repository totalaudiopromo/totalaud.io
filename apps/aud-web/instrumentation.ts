/**
 * Next.js Instrumentation
 * Registers Sentry for server-side and edge runtimes.
 * Required since @sentry/nextjs v8+ with Next.js 15.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

/**
 * Captures server-side request errors and reports them to Sentry.
 * Next.js calls this hook automatically for uncaught errors in
 * server components, route handlers, and middleware.
 */
export async function onRequestError(
  error: unknown,
  request: {
    path: string
    method: string
    headers: Record<string, string | string[] | undefined>
  },
  context: {
    routerKind: string
    routePath: string
    routeType: string
  }
) {
  const { captureRequestError } = await import('@sentry/nextjs')
  captureRequestError(error, request, context)
}
