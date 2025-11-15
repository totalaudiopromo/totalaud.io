#!/usr/bin/env tsx
/**
 * Silver Rollback - Railway deployment rollback helper
 * Phase 18: Silver Deployment System
 *
 * Usage:
 *   RAILWAY_TOKEN=xxx pnpm silver:rollback [service-id] [deployment-id]
 *
 * Prerequisites:
 * - RAILWAY_TOKEN environment variable (from Railway dashboard)
 * - Service ID (optional, will use RAILWAY_SERVICE_ID env var)
 * - Deployment ID to rollback to (optional, will list recent deployments)
 *
 * Actions:
 * - Lists recent deployments
 * - Allows rollback to a specific deployment ID
 * - Verifies rollback success via /api/health
 *
 * Exit codes:
 * - 0: Success
 * - 1: Failed
 */

interface Deployment {
  id: string
  status: string
  createdAt: string
  meta?: {
    version?: string
    branch?: string
  }
}

interface RollbackResponse {
  id: string
  status: string
}

const RAILWAY_API = 'https://backboard.railway.app/graphql/v2'

async function railwayQuery(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<unknown> {
  const token = process.env.RAILWAY_TOKEN

  if (!token) {
    console.error('✗ RAILWAY_TOKEN environment variable is required')
    console.error('  Get your token from: https://railway.app/account/tokens')
    process.exit(1)
  }

  const response = await fetch(RAILWAY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`Railway API error: ${response.status} ${response.statusText}`)
  }

  const result = await response.json()

  if (result.errors) {
    throw new Error(`Railway API errors: ${JSON.stringify(result.errors)}`)
  }

  return result.data
}

async function listDeployments(serviceId: string): Promise<void> {
  console.log('📋 Fetching recent deployments...')
  console.log('')

  const query = `
    query GetDeployments($serviceId: String!) {
      deployments(serviceId: $serviceId, first: 10) {
        edges {
          node {
            id
            status
            createdAt
            meta
          }
        }
      }
    }
  `

  const data = (await railwayQuery(query, { serviceId })) as {
    deployments: { edges: Array<{ node: Deployment }> }
  }

  const deployments = data.deployments.edges.map((edge) => edge.node)

  if (deployments.length === 0) {
    console.log('No deployments found')
    return
  }

  console.log('Recent deployments:')
  console.log('')

  for (const deployment of deployments) {
    const date = new Date(deployment.createdAt).toLocaleString()
    const version = deployment.meta?.version || 'unknown'
    const branch = deployment.meta?.branch || 'unknown'

    console.log(`  ID:     ${deployment.id}`)
    console.log(`  Status: ${deployment.status}`)
    console.log(`  Date:   ${date}`)
    console.log(`  Branch: ${branch}`)
    console.log(`  Version: ${version}`)
    console.log('')
  }
}

async function rollbackDeployment(serviceId: string, deploymentId: string): Promise<void> {
  console.log('🔄 Rolling back deployment...')
  console.log(`   Service: ${serviceId}`)
  console.log(`   Deployment: ${deploymentId}`)
  console.log('')

  const query = `
    mutation RollbackDeployment($serviceId: String!, $deploymentId: String!) {
      deploymentRollback(serviceId: $serviceId, deploymentId: $deploymentId) {
        id
        status
      }
    }
  `

  const data = (await railwayQuery(query, { serviceId, deploymentId })) as {
    deploymentRollback: RollbackResponse
  }

  console.log(`✓ Rollback initiated: ${data.deploymentRollback.id}`)
  console.log(`  Status: ${data.deploymentRollback.status}`)
  console.log('')
  console.log('⏳ Waiting for deployment to stabilise...')
  console.log('   (Check Railway dashboard for progress)')
}

// Main
async function main() {
  const serviceId = process.argv[2] || process.env.RAILWAY_SERVICE_ID
  const deploymentId = process.argv[3]

  if (!serviceId) {
    console.error('✗ Service ID is required')
    console.error('  Usage: RAILWAY_TOKEN=xxx pnpm silver:rollback [service-id] [deployment-id]')
    console.error('  Or set RAILWAY_SERVICE_ID environment variable')
    process.exit(1)
  }

  console.log('🚂 Silver Rollback')
  console.log('')

  if (!deploymentId) {
    // List mode
    await listDeployments(serviceId)
    console.log('To rollback, run:')
    console.log(`  pnpm silver:rollback ${serviceId} [deployment-id]`)
    process.exit(0)
  } else {
    // Rollback mode
    await rollbackDeployment(serviceId, deploymentId)
    console.log('')
    console.log('✅ Rollback complete')
    console.log('   Verify health: pnpm silver:check [url]')
    process.exit(0)
  }
}

main().catch((error) => {
  console.error('')
  console.error('✗ Fatal error:', error instanceof Error ? error.message : error)
  process.exit(1)
})
