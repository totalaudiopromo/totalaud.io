#!/usr/bin/env bash
# Documentation Validation Script
# Ensures documentation stays organized and minimal

set -euo pipefail

# Colour output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Colour

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Files allowed in root
ALLOWED_IN_ROOT=(
  "README.md"
  "CLAUDE.md"
  "CHANGELOG.md"
  "CONTRIBUTING.md"
)

# Maximum files allowed in each category
MAX_GUIDES=15
MAX_SPECS=10
MAX_PHASES=5  # Only current active phases
MAX_TROUBLESHOOTING=10

echo -e "${GREEN}🔍 Documentation Validation${NC}\n"

errors=0
warnings=0

# Check root directory
echo -e "${YELLOW}Checking root directory...${NC}"
root_md_count=$(find . -maxdepth 1 -type f -name "*.md" | wc -l | xargs)
root_md_files=$(find . -maxdepth 1 -type f -name "*.md" -exec basename {} \;)

# Check if any disallowed files exist in root
for file in $root_md_files; do
  if [[ ! " ${ALLOWED_IN_ROOT[@]} " =~ " ${file} " ]]; then
    echo -e "${RED}  ✗ Disallowed file in root: $file${NC}"
    echo -e "${YELLOW}    Run 'pnpm docs:organize' to fix${NC}"
    ((errors++))
  fi
done

if [ "$errors" -eq 0 ]; then
  echo -e "${GREEN}  ✓ Root directory clean ($root_md_count files)${NC}"
fi

# Check category limits
check_category_limit() {
  local category=$1
  local max=$2
  local path="docs/$category"

  if [ -d "$path" ]; then
    local count=$(find "$path" -type f -name "*.md" 2>/dev/null | wc -l | xargs)
    if [ "$count" -gt "$max" ]; then
      echo -e "${YELLOW}  ⚠ Too many files in $category: $count (max: $max)${NC}"
      echo -e "${YELLOW}    Consider archiving older documentation${NC}"
      ((warnings++))
    else
      echo -e "${GREEN}  ✓ $category: $count/$max files${NC}"
    fi
  fi
}

echo -e "\n${YELLOW}Checking category limits...${NC}"
check_category_limit "guides" $MAX_GUIDES
check_category_limit "specs" $MAX_SPECS
check_category_limit "phases" $MAX_PHASES
check_category_limit "troubleshooting" $MAX_TROUBLESHOOTING

# Check for duplicate content
echo -e "\n${YELLOW}Checking for potential duplicates...${NC}"
duplicates=$(find docs -type f -name "*COMPLETE*.md" -o -name "*SUMMARY*.md" | wc -l | xargs)
if [ "$duplicates" -gt 10 ]; then
  echo -e "${YELLOW}  ⚠ Found $duplicates completion/summary docs${NC}"
  echo -e "${YELLOW}    Consider consolidating similar documentation${NC}"
  ((warnings++))
else
  echo -e "${GREEN}  ✓ Duplicate check passed${NC}"
fi

# Summary
echo -e "\n${GREEN}════════════════════════════════════════${NC}"
if [ "$errors" -eq 0 ] && [ "$warnings" -eq 0 ]; then
  echo -e "${GREEN}✅ Documentation validation passed!${NC}"
  exit 0
elif [ "$errors" -eq 0 ]; then
  echo -e "${YELLOW}⚠️  Validation passed with $warnings warning(s)${NC}"
  exit 0
else
  echo -e "${RED}❌ Validation failed with $errors error(s) and $warnings warning(s)${NC}"
  echo -e "\n${YELLOW}Fix errors by running:${NC}"
  echo -e "  pnpm docs:organize"
  exit 1
fi
