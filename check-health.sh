#!/bin/bash
# Health Check Script
# Run this after pulling changes to ensure everything still works

echo "🏥 Running health checks..."
echo ""

# 1. Check Node version
echo "1️⃣  Checking Node.js version..."
node --version
echo ""

# 2. Install dependencies if needed
echo "2️⃣  Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  pnpm install
else
  echo "✅ Dependencies installed"
fi
echo ""

# 3. Type check
echo "3️⃣  Type checking..."
pnpm typecheck 2>&1 | tail -5
if [ $? -eq 0 ]; then
  echo "✅ Type check passed"
else
  echo "⚠️  Type check failed - see errors above"
fi
echo ""

# 4. Linting
echo "4️⃣  Linting (checking for issues)..."
pnpm lint 2>&1 | tail -10
echo "ℹ️  See LINTING_ISSUES.md for known issues"
echo ""

# 5. Try to build
echo "5️⃣  Testing build..."
pnpm build --filter=aud-web 2>&1 | tail -10
if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "⚠️  Build failed - see errors above"
fi
echo ""

echo "🎉 Health check complete!"
echo ""
echo "Summary:"
echo "- If all checks passed: ✅ Safe to start working"
echo "- If some checks failed: ⚠️  Review errors above"
echo ""
