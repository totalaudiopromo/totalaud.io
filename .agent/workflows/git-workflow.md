---
description: Mandatory git workflow - checks status, remote, and branches before work.
---

# Git Workflow

When this workflow is active, you must follow the mandatory git checks from .cursorrules.

## Mandatory Steps

1. **Check Status**: git status
2. **Fetch Remote**: git fetch origin
3. **Sync Check**: If behind, ask user: "You're behind main by X commits. Pull latest changes?"
4. **Branch Check**: If on main, ask: "Shall I create a new feature branch for this work?"
5. **Naming**: Use feature/, fix/, refactor/, style/ scopes.

## Commit Guidelines

- **British English ONLY**: optimise, colour, behaviour, organise.
- **NO Emojis**: Never use emojis in commit messages or chat responses.
- **Format**: type(scope): subject (lowercase, imperative).
- **Footer**: Co-Authored-By: Claude <noreply@anthropic.com>

## Example

```
feat(api): add user authentication with JWT

Implemented JWT-based authentication for API routes.
Users can now register and login securely.

Co-Authored-By: Claude <noreply@anthropic.com>
```
