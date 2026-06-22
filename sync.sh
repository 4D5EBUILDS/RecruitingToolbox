#!/usr/bin/env bash
#
# sync.sh — safe one-command save + publish for RecruitingToolbox.
#
# Why this exists: this repo is sometimes edited locally AND via GitHub's
# web "Add files via upload". When both happen, a plain `git push` gets
# rejected with "Updates were rejected (fetch first)". This script always
# pulls the latest from GitHub *first* (rebasing your local commits on top),
# then pushes — so you never hit that error.
#
# Usage:
#   ./sync.sh "your commit message"
#   ./sync.sh                # uses a default timestamped message
#
set -euo pipefail
cd "$(dirname "$0")"

MSG="${1:-Update site $(date '+%Y-%m-%d %H:%M')}"

echo "→ Staging all changes..."
git add -A

if git diff --cached --quiet; then
  echo "→ No local changes to commit."
else
  echo "→ Committing: $MSG"
  git commit -m "$MSG"
fi

echo "→ Pulling latest from GitHub (rebase)..."
git pull --rebase origin main

echo "→ Pushing to GitHub..."
git push origin main

echo "✓ Done. Site will redeploy in ~1-2 min."
