#!/bin/bash

# 🧪 PRE-MERGE SANITY CHECK SCRIPT
# Verifies that foundation branches can build before merging

set -e

echo "🔍 PRE-MERGE SANITY CHECK"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
FAILED=0

# Function to check branch
check_branch() {
    local BRANCH=$1
    local NAME=$2
    
    echo ""
    echo "${YELLOW}Checking: ${NAME} (${BRANCH})${NC}"
    echo "----------------------------------------"
    
    # Check if branch exists
    if ! git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
        echo "${RED}❌ Branch ${BRANCH} does not exist${NC}"
        FAILED=1
        return 1
    fi
    
    echo "✅ Branch exists"
    
    # Checkout branch
    echo "📦 Checking out branch..."
    git checkout "$BRANCH" 2>&1 | grep -v "Switched to branch" || true
    
    # Check if pnpm is available
    if ! command -v pnpm &> /dev/null; then
        echo "${RED}❌ pnpm not found. Install pnpm first.${NC}"
        FAILED=1
        return 1
    fi
    
    echo "✅ pnpm available"
    
    # Install dependencies
    echo "📥 Installing dependencies..."
    if pnpm install --frozen-lockfile > /dev/null 2>&1; then
        echo "✅ Dependencies installed"
    else
        echo "${YELLOW}⚠️  Installing with lockfile update...${NC}"
        pnpm install 2>&1 | tail -5
    fi
    
    # Check if turbo is available
    if ! pnpm turbo --version > /dev/null 2>&1; then
        echo "${RED}❌ Turbo not available${NC}"
        FAILED=1
        return 1
    fi
    
    # Attempt build
    echo "🔨 Building aud-web..."
    if pnpm turbo build --filter=aud-web > /tmp/build-log.txt 2>&1; then
        echo "${GREEN}✅ Build successful${NC}"
        return 0
    else
        echo "${RED}❌ Build failed${NC}"
        echo ""
        echo "Last 20 lines of build output:"
        tail -20 /tmp/build-log.txt
        FAILED=1
        return 1
    fi
}

# Main execution
echo "Starting sanity check..."
echo ""

# Check OperatorOS branch first (foundation)
check_branch "import/operatoros-phase2" "OperatorOS Foundation"

# Check MeshOS branch
check_branch "import/meshos-phase-13" "MeshOS Orchestration"

# Check Phase 20-31 branch
check_branch "feat/local-phase-20-31-snapshot" "Phase 20-31 Expansion"

# Summary
echo ""
echo "=========================="
echo "📊 SANITY CHECK SUMMARY"
echo "=========================="

if [ $FAILED -eq 0 ]; then
    echo "${GREEN}✅ All branches pass sanity check${NC}"
    echo ""
    echo "✅ Ready to merge in this order:"
    echo "   1. import/operatoros-phase2"
    echo "   2. import/meshos-phase-13"
    echo "   3. feat/local-phase-20-31-snapshot"
    echo ""
    exit 0
else
    echo "${RED}❌ Some branches failed sanity check${NC}"
    echo ""
    echo "⚠️  Fix build errors before merging"
    echo ""
    exit 1
fi

