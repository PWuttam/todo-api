#!/bin/bash
# ==========================================
#  GitHub Labels Setup Script for todo-api
#  Author: Takuya (PWuttam)
#  Created: 2025-10-20
# ==========================================

REPO="PWuttam/todo-api"

echo "🔧 Setting up default labels for $REPO ..."

# --- 学習・開発用の基本ラベルを追加 ---
gh label create "learning"   --repo "$REPO" --color "FFCC00" --description "Learning logs and study progress"   2>/dev/null || echo "✅ 'learning' already exists"
gh label create "typescript" --repo "$REPO" --color "3178C6" --description "TypeScript related work"            2>/dev/null || echo "✅ 'typescript' already exists"
gh label create "refactor"   --repo "$REPO" --color "A2EEEF" --description "Code refactoring and improvement"   2>/dev/null || echo "✅ 'refactor' already exists"
gh label create "docs"       --repo "$REPO" --color "0366D6" --description "Documentation and notes"            2>/dev/null || echo "✅ 'docs' already exists"
gh label create "automation" --repo "$REPO" --color "00BFA5" --description "Automation scripts and workflow"    2>/dev/null || echo "✅ 'automation' already exists"

echo "🎉 All labels created or verified successfully!"