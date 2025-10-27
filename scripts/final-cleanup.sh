#!/usr/bin/env bash
# Final Documentation Cleanup
# Moves remaining non-essential docs to appropriate locations

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo -e "${GREEN}🧹 Final Documentation Cleanup${NC}\n"

# Move feature summaries to archive
echo -e "${YELLOW}Moving feature summaries to archive...${NC}"
mv FEATURES_IMPLEMENTED.md docs/archive/ 2>/dev/null || true
mv FLOW_CANVAS_FEATURES.md docs/archive/ 2>/dev/null || true
mv FLOW_PANE_COMPLETE.md docs/archive/ 2>/dev/null || true
mv FLOW_STUDIO_SESSION_SUMMARY.md docs/archive/ 2>/dev/null || true
mv REALTIME_FEATURES.md docs/archive/ 2>/dev/null || true

# Move implementation summaries to archive
mv IMPLEMENTATION_SUMMARY.md docs/archive/ 2>/dev/null || true
mv SLATE_CYAN_MIGRATION_COMPLETE.md docs/archive/ 2>/dev/null || true
mv REFACTOR_REPORT.md docs/archive/ 2>/dev/null || true

# Move Wispr references to specs (if actively used) or archive
mv WISPR_FLOW_ANALYSIS.md docs/specs/ 2>/dev/null || true
mv WISPR_FLOW_SUMMARY.md docs/specs/ 2>/dev/null || true
mv WISPR_VISUAL_REFERENCE.md docs/specs/ 2>/dev/null || true

# Move landing page audits to archive
mv LANDING_PAGE_CRITIQUE_AND_IMPROVEMENTS.md docs/archive/ 2>/dev/null || true
mv LANDING_PAGE_PERFORMANCE_AUDIT.md docs/archive/ 2>/dev/null || true

# Move setup guides to guides
mv RAILWAY_SETUP.md docs/guides/ 2>/dev/null || true

# Move ChatGPT summary to archive (historical context)
mv CHATGPT_PROJECT_SUMMARY.md docs/archive/ 2>/dev/null || true

# Move commit conventions to guides (consolidate with CONTRIBUTING.md)
mv COMMIT_CONVENTIONS.md docs/guides/ 2>/dev/null || true

# NEXT_STEPS.md - Keep in root for now (actively used)

echo -e "${GREEN}✓ Final cleanup complete${NC}\n"

# Show final count
root_count=$(find . -maxdepth 1 -type f -name "*.md" | wc -l | xargs)
echo -e "${GREEN}📊 Root directory now has $root_count markdown files${NC}"
echo -e "${YELLOW}Remaining files:${NC}"
find . -maxdepth 1 -type f -name "*.md" -exec basename {} \; | sort
