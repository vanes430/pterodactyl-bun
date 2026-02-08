#!/bin/bash

# Tentukan script build berdasarkan MODE
if [ "$MODE" == "prod" ]; then
    echo "📦 Running build:PRODUCTION (Minified + Hashed)..."
    bun run build:prod
elif [ "$MODE" == "dev-hash" ]; then
    echo "📦 Running build:DEVELOPMENT-HASHED (Plain + No Minify + Hashed)..."
    bun run build:dev-hash
else
    echo "📦 Running build:DEVELOPMENT (Plain + No Minify + No Hash)..."
    bun run build:dev
fi

if [ $? -ne 0 ]; then
    echo "❌ Build failed, skipping compression."
    exit 1
fi

echo "🗜️ Creating panel.tar.gz..."

# List exclude patterns
EXCLUDES=(
    --exclude='./node_modules'
    --exclude='./vendor'
    --exclude='.git'
    --exclude='.github'
    --exclude='storage/framework/cache/*'
    --exclude='storage/framework/sessions/*'
    --exclude='storage/framework/views/*'
    --exclude='storage/logs/*'
    --exclude='.env'
    --exclude='*.tar.gz'
    --exclude='*.zip'
    --exclude='.direnv'
    --exclude='.vscode'
    --exclude='*.log'
)

# Archive everything else
tar "${EXCLUDES[@]}" -czf panel.tar.gz .

echo "✅ Done! Created panel.tar.gz"
ls -lh panel.tar.gz
