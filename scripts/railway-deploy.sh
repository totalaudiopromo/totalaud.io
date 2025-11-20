#!/bin/bash
# Railway Deployment Automation Script
# totalaud.io - Automated deployment verification

set -e

echo "🚀 Railway Deployment Automation for totalaud.io"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Phase 5: Push Imported OS Branches
echo "📦 PHASE 5: Pushing Imported OS Branches"
echo "----------------------------------------"

if git show-ref --verify --quiet refs/heads/import/meshos-phase-13; then
  echo -e "${GREEN}✓${NC} Branch import/meshos-phase-13 exists"
  echo "  Pushing to origin..."
  git push origin import/meshos-phase-13 || echo -e "${YELLOW}⚠${NC}  Branch may already be pushed"
else
  echo -e "${YELLOW}⚠${NC}  Branch import/meshos-phase-13 not found locally"
fi

if git show-ref --verify --quiet refs/heads/import/operatoros-phase2; then
  echo -e "${GREEN}✓${NC} Branch import/operatoros-phase2 exists"
  echo "  Pushing to origin..."
  git push origin import/operatoros-phase2 || echo -e "${YELLOW}⚠${NC}  Branch may already be pushed"
else
  echo -e "${YELLOW}⚠${NC}  Branch import/operatoros-phase2 not found locally"
fi

echo ""
echo "✅ Phase 5 Complete"
echo ""

# Phase 7: Smoke Test Helper
echo "🧪 PHASE 7: Smoke Test Helper"
echo "-----------------------------"
echo ""
echo "After Railway deployment, run:"
echo ""
echo "  export RAILWAY_URL='https://your-app.railway.app'"
echo "  ./scripts/railway-smoke-tests.sh"
echo ""
echo "Or manually test these URLs:"
echo "  - \${RAILWAY_URL}/api/health"
echo "  - \${RAILWAY_URL}/os/ascii"
echo "  - \${RAILWAY_URL}/os/xp"
echo "  - \${RAILWAY_URL}/os/aqua"
echo "  - \${RAILWAY_URL}/os/daw"
echo "  - \${RAILWAY_URL}/os/analogue"
echo "  - \${RAILWAY_URL}/os/loopos"
echo "  - \${RAILWAY_URL}/os/studio"
echo "  - \${RAILWAY_URL}/demo"
echo ""

echo "✅ Script Complete"
echo ""
echo "📋 Next Steps:"
echo "  1. Complete Railway manual setup (see RAILWAY_SETUP_CHECKLIST.md)"
echo "  2. Add environment variables in Railway dashboard"
echo "  3. Trigger deployment"
echo "  4. Run smoke tests"
echo ""

