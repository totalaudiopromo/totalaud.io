#!/bin/bash

# 🚀 AUTOMATED MERGE SCRIPT - OS Foundation
# Merges branches in the correct order with safety checks

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🚀 OS FOUNDATION MERGE SCRIPT"
echo "=============================="
echo ""

# Check we're in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "${RED}❌ Not in a git repository${NC}"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: ${CURRENT_BRANCH}"
echo ""

# Confirm action
read -p "Create new branch 'feat/os-foundation' and merge OS branches? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

# Step 1: Create foundation branch
echo ""
echo "${BLUE}Step 1: Creating foundation branch${NC}"
echo "----------------------------------------"
git checkout main
git checkout -b feat/os-foundation
echo "${GREEN}✅ Created branch: feat/os-foundation${NC}"
echo ""

# Step 2: Merge OperatorOS
echo "${BLUE}Step 2: Merging OperatorOS foundation${NC}"
echo "----------------------------------------"
if git merge import/operatoros-phase2 --no-ff -m "feat: merge OperatorOS foundation" 2>&1; then
    echo "${GREEN}✅ OperatorOS merged${NC}"
    
    # Sanity check
    echo "Running build check..."
    if pnpm install --frozen-lockfile > /dev/null 2>&1 && pnpm turbo build --filter=aud-web > /dev/null 2>&1; then
        echo "${GREEN}✅ Build check passed${NC}"
    else
        echo "${YELLOW}⚠️  Build check failed - continuing anyway${NC}"
        echo "Fix build errors before proceeding to next merge"
    fi
else
    echo "${RED}❌ Merge failed - resolve conflicts manually${NC}"
    exit 1
fi
echo ""

# Step 3: Merge MeshOS
echo "${BLUE}Step 3: Merging MeshOS orchestration layer${NC}"
echo "----------------------------------------"
if git merge import/meshos-phase-13 --no-ff -m "feat: merge MeshOS orchestration layer" 2>&1; then
    echo "${GREEN}✅ MeshOS merged${NC}"
    
    # Sanity check
    echo "Running build check..."
    if pnpm install --frozen-lockfile > /dev/null 2>&1 && pnpm turbo build --filter=aud-web > /dev/null 2>&1; then
        echo "${GREEN}✅ Build check passed${NC}"
    else
        echo "${YELLOW}⚠️  Build check failed - continuing anyway${NC}"
        echo "Fix build errors before proceeding to next merge"
    fi
else
    echo "${RED}❌ Merge failed - resolve conflicts manually${NC}"
    exit 1
fi
echo ""

# Step 4: Merge Phase 20-31
echo "${BLUE}Step 4: Merging Phase 20-31 expansion${NC}"
echo "----------------------------------------"
read -p "Merge feat/local-phase-20-31-snapshot? This may have conflicts. (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if git merge feat/local-phase-20-31-snapshot --no-ff -m "feat: merge OS expansion (Phase 20-31)" 2>&1; then
        echo "${GREEN}✅ Phase 20-31 merged${NC}"
        
        # Sanity check
        echo "Running build check..."
        if pnpm install --frozen-lockfile > /dev/null 2>&1 && pnpm turbo build --filter=aud-web > /dev/null 2>&1; then
            echo "${GREEN}✅ Build check passed${NC}"
        else
            echo "${YELLOW}⚠️  Build check failed${NC}"
            echo "Review build errors and fix before merging to main"
        fi
    else
        echo "${YELLOW}⚠️  Conflicts detected - resolve manually${NC}"
        echo "After resolving conflicts, run: git add . && git commit"
        exit 1
    fi
else
    echo "Skipped Phase 20-31 merge"
fi
echo ""

# Summary
echo "=============================="
echo "📊 MERGE SUMMARY"
echo "=============================="
echo "${GREEN}✅ Merged branches:${NC}"
echo "   1. import/operatoros-phase2"
echo "   2. import/meshos-phase-13"
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   3. feat/local-phase-20-31-snapshot"
fi
echo ""
echo "Current branch: feat/os-foundation"
echo ""
echo "Next steps:"
echo "   1. Review merged code"
echo "   2. Fix any build errors"
echo "   3. Run tests: pnpm test"
echo "   4. Merge to main when ready"
echo ""

