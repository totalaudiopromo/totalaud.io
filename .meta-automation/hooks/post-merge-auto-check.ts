/**
 * post-merge-auto-check.ts
 * Runs after any PR merge to main/production.
 * Performs lint + type checks, then posts a summary comment to GitHub.
 */

import { execSync } from 'child_process'
import { Octokit } from '@octokit/rest'

const branch = process.env.GITHUB_REF || ''
const prNumber = process.env.PR_NUMBER
const repo = process.env.GITHUB_REPOSITORY!
const token = process.env.GITHUB_TOKEN!

if (!branch.includes('main')) {
  console.log('Not on main branch — skipping post-merge check.')
  process.exit(0)
}

console.log('🧩 Running post-merge quality checks…')

try {
  execSync('pnpm --filter aud-web lint', { stdio: 'inherit' })
  execSync('pnpm --filter aud-web typecheck', { stdio: 'inherit' })
  console.log('✅ Lint + typecheck passed')
  postComment('✅ All quality checks passed. CI remains green.')
} catch (e) {
  console.error('❌ Quality checks failed')
  postComment(
    '⚠️ Lint/type errors detected post-merge. Please run `pnpm --filter aud-web lint` and `pnpm --filter aud-web typecheck` locally.'
  )
}

async function postComment(message: string) {
  if (!prNumber || !token) return
  const octokit = new Octokit({ auth: token })
  await octokit.issues.createComment({
    owner: repo.split('/')[0],
    repo: repo.split('/')[1],
    issue_number: Number(prNumber),
    body: message,
  })
}
