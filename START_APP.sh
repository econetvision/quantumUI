#!/bin/bash

echo "🌌 QuantumUI - Starting App"
echo "============================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Run: cp .env.example .env"
    echo "Then edit .env with your DATABASE_URL"
    exit 1
fi

# Check if database is initialized
if [ ! -d node_modules/@prisma/client ]; then
    echo "🔧 Initializing database..."
    npm run db:generate
fi

echo "✅ Starting development server..."
echo ""
echo "Visit: http://localhost:3000"
echo "Demo Mode: All tracks free, no login required"
echo ""

npm run dev
