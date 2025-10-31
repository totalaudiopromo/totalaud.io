#!/usr/bin/env bash
# Documentation Organization Script
# Automatically organizes and validates documentation structure

set -euo pipefail

DOCS_DIR="docs"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colour output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Colour

echo -e "${GREEN}🗂️  Documentation Organization Tool${NC}\n"

# Files that should stay in root
KEEP_IN_ROOT=(
  "README.md"
  "CLAUDE.md"
  "CHANGELOG.md"
  "CONTRIBUTING.md"
  ".cursorrules"
)

# Archive completed phase documentation
archive_completed_phases() {
  echo -e "${YELLOW}📦 Archiving completed phase documentation...${NC}"

  # Move old landing page phases (keep latest only)
  mv LANDING_PAGE_PHASE_1_COMPLETE.md docs/archive/ 2>/dev/null || true
  mv LANDING_PAGE_PHASE_3_COMPLETE.md docs/archive/ 2>/dev/null || true
  mv LANDING_PAGE_PHASE_4_COMPLETE.md docs/archive/ 2>/dev/null || true
  mv LANDING_PAGE_PHASE_4.5_COMPLETE.md docs/archive/ 2>/dev/null || true
  mv LANDING_PAGE_PHASE_3_TESTING.md docs/archive/ 2>/dev/null || true

  # Move old stage documentation (keep latest only)
  mv STAGE_6_7_75_COMPLETION_SUMMARY.md docs/archive/ 2>/dev/null || true
  mv STAGE_8_SESSION_SUMMARY.md docs/archive/ 2>/dev/null || true
  mv STAGE_8_PROGRESS_UPDATE.md docs/archive/ 2>/dev/null || true
  mv STAGE_8_PHASE_3_COMPLETE.md docs/archive/ 2>/dev/null || true

  # Move old theme refactor sessions
  mv THEME_REFACTOR_SESSION_1_SUMMARY.md docs/archive/ 2>/dev/null || true
  mv THEME_REFACTOR_SESSION_2_SUMMARY.md docs/archive/ 2>/dev/null || true

  # Move old phase 9/10 summaries (keep latest only)
  mv PHASE_9.5_FRAMER_COHESION_SUMMARY.md docs/archive/ 2>/dev/null || true
  mv PHASE_9.6_INTERACTION_FIDELITY_COMPLETE.md docs/archive/ 2>/dev/null || true
  mv PHASE_10_3_COMPLETE.md docs/archive/ 2>/dev/null || true

  echo -e "${GREEN}✓ Completed phases archived${NC}"
}

# Organize by category
organize_by_category() {
  echo -e "${YELLOW}📂 Organizing by category...${NC}"

  # Guides
  mv BROWSER_AUTOMATION_GUIDE.md docs/guides/ 2>/dev/null || true
  mv CURSOR_QUICK_START.md docs/guides/ 2>/dev/null || true
  mv GETTING_STARTED.md docs/guides/ 2>/dev/null || true
  mv QUICK_START.md docs/guides/ 2>/dev/null || true
  mv THEME_MOTION_GUIDE.md docs/guides/ 2>/dev/null || true
  mv VISUAL_CONTEXT_WORKFLOW.md docs/guides/ 2>/dev/null || true
  mv WORKFLOW_GUIDE.md docs/guides/ 2>/dev/null || true
  mv LANDING_PAGE_QUICK_REFERENCE.md docs/guides/ 2>/dev/null || true
  mv LANDING_PAGE_TESTING_GUIDE.md docs/guides/ 2>/dev/null || true

  # Specs
  mv LANDING_PAGE_MYSTIQUE.md docs/specs/ 2>/dev/null || true
  mv LANDING_PAGE_PHASE_5_SPEC.md docs/specs/ 2>/dev/null || true
  mv PHASE6_OS_WORKFLOW_SPEC.md docs/specs/ 2>/dev/null || true
  mv SHARED_WORKSPACE_REDESIGN_SPEC.md docs/specs/ 2>/dev/null || true
  mv STAGE_8_IMPLEMENTATION_PLAN.md docs/specs/ 2>/dev/null || true
  mv THEME_REFACTOR_IMPLEMENTATION_PLAN.md docs/specs/ 2>/dev/null || true
  mv WISPR_IMPLEMENTATION_CHECKLIST.md docs/specs/ 2>/dev/null || true

  # Troubleshooting
  mv BROWSER_AUTOMATION_IMPLEMENTATION.md docs/troubleshooting/ 2>/dev/null || true
  mv LINTING_ISSUES.md docs/troubleshooting/ 2>/dev/null || true
  mv MCP_AUTO_APPROVAL_SETUP.md docs/troubleshooting/ 2>/dev/null || true
  mv MCP_TROUBLESHOOTING.md docs/troubleshooting/ 2>/dev/null || true
  mv VERCEL_DASHBOARD_FIX.md docs/troubleshooting/ 2>/dev/null || true
  mv VERCEL_DEPLOYMENT_COMPLETE_SUMMARY.md docs/troubleshooting/ 2>/dev/null || true
  mv VERCEL_DEPLOYMENT_ISSUE.md docs/troubleshooting/ 2>/dev/null || true

  # Phases (current work)
  mv LANDING_PAGE_ALL_PHASES_SUMMARY.md docs/phases/ 2>/dev/null || true
  mv LANDING_PAGE_PHASE_5_COMPLETE.md docs/phases/ 2>/dev/null || true
  mv LANDING_PAGE_PHASE_5_PROGRESS.md docs/phases/ 2>/dev/null || true
  mv PHASE_10_LAUNCH_READINESS.md docs/phases/ 2>/dev/null || true
  mv STAGE_8_COMPLETE.md docs/phases/ 2>/dev/null || true
  mv STAGE_8.5_COMPLETE.md docs/phases/ 2>/dev/null || true
  mv STAGE_8_FINAL_STATUS.md docs/phases/ 2>/dev/null || true

  echo -e "${GREEN}✓ Files organized by category${NC}"
}

# Clean up duplicate/obsolete files
clean_duplicates() {
  echo -e "${YELLOW}🧹 Cleaning duplicates and obsolete files...${NC}"

  # Remove duplicate setup guides (keep most recent)
  rm -f DEVELOPMENT_SETUP_COMPLETE.md 2>/dev/null || true
  rm -f INSTALLATION_NOTE.md 2>/dev/null || true
  rm -f SETUP_COMPLETE.md 2>/dev/null || true

  # Remove duplicate quick references (consolidated into guides)
  rm -f WISPR_QUICK_REF.md 2>/dev/null || true

  # Remove obsolete phase documentation (superseded by PHASE_10)
  rm -f PHASE6_ENHANCEMENTS.md 2>/dev/null || true

  # Remove old migration guides (superseded)
  rm -f STAGE_8_PHASE_3_MIGRATION_GUIDE.md 2>/dev/null || true

  echo -e "${GREEN}✓ Duplicates removed${NC}"
}

# Create documentation index
create_index() {
  echo -e "${YELLOW}📋 Creating documentation index...${NC}"

  cat > docs/INDEX.md << 'EOF'
# Documentation Index

Last updated: $(date +"%Y-%m-%d")

## 📖 Essential Reading

Start here for the most important documentation:

- [README.md](../README.md) - Project overview
- [CLAUDE.md](../CLAUDE.md) - Claude Code configuration and workflow
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [CHANGELOG.md](../CHANGELOG.md) - Version history

## 📚 Guides

Step-by-step guides for common tasks:

- [Getting Started](guides/GETTING_STARTED.md) - Initial setup
- [Quick Start](guides/QUICK_START.md) - Fast development workflow
- [Cursor Quick Start](guides/CURSOR_QUICK_START.md) - Cursor IDE integration
- [Browser Automation Guide](guides/BROWSER_AUTOMATION_GUIDE.md) - Puppeteer/Chrome DevTools
- [Visual Context Workflow](guides/VISUAL_CONTEXT_WORKFLOW.md) - Chrome DevTools MCP
- [Theme & Motion Guide](guides/THEME_MOTION_GUIDE.md) - Design system
- [Landing Page Quick Reference](guides/LANDING_PAGE_QUICK_REFERENCE.md) - Landing page development
- [Landing Page Testing Guide](guides/LANDING_PAGE_TESTING_GUIDE.md) - Testing workflow
- [Workflow Guide](guides/WORKFLOW_GUIDE.md) - Development workflow

## 📐 Specifications

Technical specifications and design documents:

- [Landing Page Mystique](specs/LANDING_PAGE_MYSTIQUE.md) - Landing page design philosophy
- [Landing Page Phase 5 Spec](specs/LANDING_PAGE_PHASE_5_SPEC.md) - Phase 5 requirements
- [Phase 6 OS Workflow Spec](specs/PHASE6_OS_WORKFLOW_SPEC.md) - OS workflow design
- [Shared Workspace Redesign Spec](specs/SHARED_WORKSPACE_REDESIGN_SPEC.md) - Collaboration features
- [Stage 8 Implementation Plan](specs/STAGE_8_IMPLEMENTATION_PLAN.md) - Stage 8 roadmap
- [Theme Refactor Implementation Plan](specs/THEME_REFACTOR_IMPLEMENTATION_PLAN.md) - Theme system redesign
- [Wispr Implementation Checklist](specs/WISPR_IMPLEMENTATION_CHECKLIST.md) - Wispr integration

## 🚀 Current Phase Documentation

Active development phases:

- [Landing Page All Phases Summary](phases/LANDING_PAGE_ALL_PHASES_SUMMARY.md) - Complete overview
- [Landing Page Phase 5 Complete](phases/LANDING_PAGE_PHASE_5_COMPLETE.md) - Phase 5 status
- [Landing Page Phase 5 Progress](phases/LANDING_PAGE_PHASE_5_PROGRESS.md) - Phase 5 tracking
- [Phase 10 Launch Readiness](phases/PHASE_10_LAUNCH_READINESS.md) - Launch preparation
- [Stage 8 Complete](phases/STAGE_8_COMPLETE.md) - Stage 8 completion
- [Stage 8.5 Complete](phases/STAGE_8.5_COMPLETE.md) - Stage 8.5 completion
- [Stage 8 Final Status](phases/STAGE_8_FINAL_STATUS.md) - Stage 8 overview

## 🔧 Troubleshooting

Solutions to common issues:

- [Browser Automation Implementation](troubleshooting/BROWSER_AUTOMATION_IMPLEMENTATION.md) - Puppeteer setup
- [Linting Issues](troubleshooting/LINTING_ISSUES.md) - ESLint/Prettier fixes
- [MCP Auto-Approval Setup](troubleshooting/MCP_AUTO_APPROVAL_SETUP.md) - MCP configuration
- [MCP Troubleshooting](troubleshooting/MCP_TROUBLESHOOTING.md) - MCP debugging
- [Vercel Dashboard Fix](troubleshooting/VERCEL_DASHBOARD_FIX.md) - Vercel issues
- [Vercel Deployment Complete Summary](troubleshooting/VERCEL_DEPLOYMENT_COMPLETE_SUMMARY.md) - Vercel migration
- [Vercel Deployment Issue](troubleshooting/VERCEL_DEPLOYMENT_ISSUE.md) - Vercel debugging

## 📦 Archive

Completed phases and historical documentation:

See [archive/](archive/) for older phase documentation and session summaries.

---

## 🗂️ Documentation Organization Rules

1. **Essential docs stay in root**: README, CLAUDE.md, CHANGELOG, CONTRIBUTING
2. **Guides in guides/**: Step-by-step tutorials and workflows
3. **Specs in specs/**: Technical specifications and design documents
4. **Phases in phases/**: Current active phase documentation only
5. **Troubleshooting in troubleshooting/**: Solutions to common issues
6. **Archive in archive/**: Completed phases and obsolete docs

**Automated cleanup**: Run `pnpm docs:organize` to automatically organize documentation.
EOF

  echo -e "${GREEN}✓ Documentation index created${NC}"
}

# Main execution
main() {
  cd "$ROOT_DIR"

  archive_completed_phases
  organize_by_category
  clean_duplicates
  create_index

  echo -e "\n${GREEN}✅ Documentation organization complete!${NC}"
  echo -e "${YELLOW}📊 Summary:${NC}"
  echo "  - Archived: $(find docs/archive -type f 2>/dev/null | wc -l | xargs) files"
  echo "  - Guides: $(find docs/guides -type f 2>/dev/null | wc -l | xargs) files"
  echo "  - Specs: $(find docs/specs -type f 2>/dev/null | wc -l | xargs) files"
  echo "  - Phases: $(find docs/phases -type f 2>/dev/null | wc -l | xargs) files"
  echo "  - Troubleshooting: $(find docs/troubleshooting -type f 2>/dev/null | wc -l | xargs) files"
  echo "  - Root: $(find . -maxdepth 1 -type f -name "*.md" 2>/dev/null | wc -l | xargs) files"
  echo -e "\n${YELLOW}📖 View documentation index: docs/INDEX.md${NC}"
}

main "$@"
