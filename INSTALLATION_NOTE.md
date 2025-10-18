# Installation Note

## pnpm Required

This monorepo uses **pnpm** as the package manager. You'll need to install it before proceeding.

### Install pnpm

```bash
# Using npm (recommended)
npm install -g pnpm

# Or using Homebrew (macOS)
brew install pnpm

# Or using curl
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### Verify Installation

```bash
pnpm --version
# Should output: 8.x.x or higher
```

### Then Install Dependencies

Once pnpm is installed, run:

```bash
pnpm install
```

## Why pnpm?

- **Disk Efficiency:** Shared dependency storage saves space
- **Speed:** Faster than npm/yarn for monorepos
- **Strict:** Better dependency isolation
- **Workspace Support:** Native monorepo support

## Alternative: Use npm (Not Recommended)

If you absolutely cannot use pnpm, you can try npm:

```bash
# Delete pnpm-specific files
rm pnpm-workspace.yaml pnpm-lock.yaml

# Install with npm
npm install
```

⚠️ **Warning:** This is not officially supported and may cause issues with workspace references.

## Next Steps

After installing pnpm and dependencies, see [GETTING_STARTED.md](./GETTING_STARTED.md) for full setup instructions.

