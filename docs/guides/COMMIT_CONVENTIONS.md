# Commit Message Conventions

## Format

```
<type>(<scope>): <subject>

<body>

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Rules

### 1. Use UK Spelling

| US Spelling | UK Spelling (Use This) |
|-------------|------------------------|
| optimize | optimise |
| optimization | optimisation |
| color | colour |
| behavior | behaviour |
| center | centre |
| organize | organise |
| analyze | analyse |
| customize | customise |
| synchronize | synchronise |
| initialize | initialise |
| finalize | finalise |
| capitalize | capitalise |
| summarize | summarise |
| prioritize | prioritise |

### 2. No Emojis

Do not use emojis in commit messages. Keep them professional and clean.

**Bad:**
```
feat: add feature ✨
fix: bug fix 🐛
docs: update README 📚
```

**Good:**
```
feat: add new feature
fix: resolve authentication bug
docs: update installation instructions
```

### 3. Clear, Concise Titles

Keep subject lines under 72 characters. Be direct and descriptive.

**Bad:**
```
feat: this is a really amazing new feature that does lots of cool things and makes everything better
```

**Good:**
```
feat(auth): add JWT-based authentication
```

### 4. Type and Scope

**Types:**
- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation changes
- `style`: formatting, missing semicolons, etc.
- `refactor`: code restructuring without behaviour change
- `test`: adding tests
- `chore`: maintenance tasks

**Scopes:**
- `api`: API routes
- `auth`: authentication
- `ui`: user interface
- `db`: database
- `railway`: deployment
- `config`: configuration files
- etc.

### 5. Subject Line

- Use lowercase
- Use imperative mood ("add" not "added" or "adds")
- No period at end
- Maximum 72 characters

**Examples:**
```
feat(api): add rate limiting middleware
fix(auth): resolve token expiration issue
docs(readme): update installation steps
```

### 6. Body

- Explain what and why, not how
- Wrap at 72 characters
- Separate from subject with blank line
- Use bullet points for multiple changes

**Example:**
```
feat(railway): optimise Railway deployment configuration

Enhanced Railway deployment with improved build caching.

Configuration files:
- railway.json: added Turborepo filter and health checks
- nixpacks.toml: explicit build phases for better caching

Build time improvements:
- First build: ~3-5 min
- Incremental: ~1-2 min (with cache)
```

### 7. Co-Authorship

Always include when collaborating with AI tools:

```
Co-Authored-By: Claude <noreply@anthropic.com>
```

## Examples

### Good Commits

```
feat(auth): implement JWT authentication

Added JWT-based authentication for API routes. Users can now
register and login with email/password. Tokens expire after
24 hours and refresh tokens are supported.

Co-Authored-By: Claude <noreply@anthropic.com>
```

```
fix(db): resolve connection pool exhaustion

Fixed issue where database connections were not being properly
released back to the pool. Added connection timeout and maximum
pool size configuration.

Co-Authored-By: Claude <noreply@anthropic.com>
```

```
docs(api): add endpoint documentation

Created comprehensive API documentation with request/response
examples for all endpoints. Added authentication requirements
and rate limit information.

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Bad Commits

```
feat: added some stuff ✨🎉
```

```
fix: fixed the bug that was breaking everything
```

```
Update README.md
```

```
WIP
```

## Template

Use the `.gitmessage` template:

```bash
git config commit.template .gitmessage
```

This will pre-populate your commit messages with the correct format.

## Checking Commits

Before pushing, review your commit messages:

```bash
git log --oneline -5
```

If you need to amend the last commit:

```bash
git commit --amend
```

If you need to rewrite multiple commits:

```bash
git rebase -i HEAD~3  # for last 3 commits
```

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Commit Best Practices](https://chris.beams.io/posts/git-commit/)
- [UK vs US Spelling Guide](https://www.oxfordinternationalenglish.com/differences-in-british-and-american-spelling/)
