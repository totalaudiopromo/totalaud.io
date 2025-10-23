#!/bin/bash
# Safe Development Workflow Script
# Save as: start-work.sh

echo "🔄 Syncing with GitHub..."

# 1. Save any uncommitted work
if [[ -n $(git status -s) ]]; then
  echo "⚠️  You have uncommitted changes. Stashing them..."
  git stash
fi

# 2. Switch to main and pull latest
git checkout main
git pull origin main

# 3. Show recent changes
echo ""
echo "📝 Recent changes:"
git log --oneline -5

# 4. Ask for new branch name
echo ""
read -p "Enter new branch name (or press Enter to stay on main): " branch_name

if [[ -n "$branch_name" ]]; then
  git checkout -b "$branch_name"
  echo "✅ Created and switched to branch: $branch_name"
else
  echo "⚠️  Staying on main branch"
fi

# 5. Restore stashed changes if any
if git stash list | grep -q "stash@{0}"; then
  echo ""
  read -p "Restore stashed changes? (y/n): " restore
  if [[ "$restore" == "y" ]]; then
    git stash pop
    echo "✅ Restored stashed changes"
  fi
fi

echo ""
echo "🎉 Ready to start working!"
echo "Current branch: $(git branch --show-current)"
