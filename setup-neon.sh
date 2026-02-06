#!/bin/bash

echo "🌟 SPICE Neon Database Setup Script"
echo "=================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your Neon credentials."
fi

# Check for required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is not set in .env"
    echo "Please add your Neon database URL to .env"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run database migration
echo "🗄️  Setting up database schema..."
npm run db:push

# Build the application
echo "🔨 Building the application..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your actual Neon database URL"
echo "2. Get your Vercel Blob token and add it to .env"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Test the profile setup workflow"
echo ""
echo "For production deployment:"
echo "1. Set up your environment variables in Vercel"
echo "2. Run 'vercel --prod' to deploy"