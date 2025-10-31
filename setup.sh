#!/bin/bash

echo "🚀 Setting up QA Tech Builder..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "To start the development servers:"
echo "  npm run dev"
echo ""
echo "This will start:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:5000"
echo ""
echo "To build for production:"
echo "  npm run build"








