#!/bin/bash

# Pix MCP Server Setup Script
# This script helps you set up the Pix MCP Server for development or production

set -e

echo "🚀 Pix MCP Server Setup"
echo "======================="
echo ""

# Check Node.js version
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 18+."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "🔧 Creating environment configuration..."
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file with your Efí credentials:"
    echo "   - EFI_CLIENT_ID: Your Efí client ID"
    echo "   - EFI_CLIENT_SECRET: Your Efí client secret"
    echo "   - EFI_PIX_KEY: Your Pix key (email, phone, CPF, or random key)"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Run tests
echo ""
echo "🧪 Running tests..."
npm test

# Test the server
echo ""
echo "🎯 Testing server functionality..."
npx tsx examples/test-server.ts

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your Efí credentials"
echo "2. Test with: npm run dev"
echo "3. Build for production: npm run build && npm start"
echo "4. Configure Claude Desktop with the generated mcp_config.json"
echo ""
echo "📚 Documentation:"
echo "- README.md: Complete usage guide"
echo "- CONTRIBUTING.md: Development guidelines"
echo "- examples/: Example usage scripts"
echo ""
echo "🔗 Useful commands:"
echo "- npm run dev: Start development server"
echo "- npm run build: Build for production"
echo "- npm start: Start production server"
echo "- npm test: Run test suite"
echo "- npm run lint: Check code style"
echo ""
