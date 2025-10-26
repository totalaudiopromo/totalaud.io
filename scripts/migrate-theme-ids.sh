#!/bin/bash

# Theme ID Migration Script
# Theme System Anti-Gimmick Refactor
# Migrates old theme IDs to new posture-based IDs across the codebase

set -e # Exit on error

echo "🎨 Theme ID Migration Script"
echo "============================"
echo ""

# Define the base path
BASE_PATH="/Users/chrisschofield/workspace/active/totalaud.io/apps/aud-web/src"

# Theme ID mappings (old → new)
declare -A THEME_MAP
THEME_MAP["ascii"]="operator"
THEME_MAP["xp"]="guide"
THEME_MAP["aqua"]="map"
THEME_MAP["daw"]="timeline"
THEME_MAP["analogue"]="tape"

# Count of files updated
FILES_UPDATED=0

# Function to update a file
update_file() {
  local file="$1"
  local updated=false

  # Check if file exists
  if [ ! -f "$file" ]; then
    return
  fi

  # Create backup
  cp "$file" "${file}.bak"

  # Perform replacements
  for old in "${!THEME_MAP[@]}"; do
    new="${THEME_MAP[$old]}"

    # Replace string literals: 'ascii' → 'operator'
    if grep -q "'$old'" "$file" 2>/dev/null; then
      sed -i '' "s/'$old'/'$new'/g" "$file"
      updated=true
    fi

    # Replace string literals: "ascii" → "operator"
    if grep -q "\"$old\"" "$file" 2>/dev/null; then
      sed -i '' "s/\"$old\"/\"$new\"/g" "$file"
      updated=true
    fi
  done

  # If file was updated, increment counter and keep backup
  if [ "$updated" = true ]; then
    echo "✅ Updated: $file"
    FILES_UPDATED=$((FILES_UPDATED + 1))
  else
    # Remove backup if no changes
    rm "${file}.bak"
  fi
}

echo "Scanning files for theme ID references..."
echo ""

# Find all TypeScript/TSX files
FILES=$(find "$BASE_PATH" -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" ! -path "*/.next/*")

# Update each file
for file in $FILES; do
  update_file "$file"
done

echo ""
echo "============================"
echo "✨ Migration Complete!"
echo "   Files updated: $FILES_UPDATED"
echo ""
echo "💡 Next steps:"
echo "   1. Review changes: git diff"
echo "   2. Run typecheck: pnpm typecheck"
echo "   3. Test locally: pnpm dev"
echo "   4. Commit changes: git commit -am 'feat(theme): Complete theme ID migration'"
echo ""
