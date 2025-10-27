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
