#!/bin/bash
# Deploy frontend to Vercel
# Prerequisites: npm install -g vercel, and vercel login

set -e

echo "🚀 Deploying frontend to Vercel..."

cd "$(dirname "$0")/../frontend"

# Install dependencies
npm ci

# Build
npm run build

# Deploy
vercel --prod

echo "✅ Frontend deployed successfully!"
