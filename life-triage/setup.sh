#!/bin/bash

# Life Triage System - Interactive Setup Script
# This script will guide you through the setup process

set -e

echo "🚀 Life Triage System - Setup Wizard"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env exists
if [ -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file already exists!${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Using existing .env file..."
        exit 0
    fi
fi

# Create .env from template
cp .env.example .env

echo -e "${BLUE}Step 1: Google Gemini API Key${NC}"
echo "----------------------------------------"
echo "1. Go to: https://ai.google.dev/"
echo "2. Click 'Get API key in Google AI Studio'"
echo "3. Sign in and create an API key"
echo ""
read -p "Paste your Gemini API key: " GEMINI_KEY

if [ -z "$GEMINI_KEY" ]; then
    echo -e "${RED}❌ API key cannot be empty${NC}"
    exit 1
fi

# Update .env
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/GEMINI_API_KEY=.*/GEMINI_API_KEY=$GEMINI_KEY/" .env
else
    sed -i "s/GEMINI_API_KEY=.*/GEMINI_API_KEY=$GEMINI_KEY/" .env
fi

echo -e "${GREEN}✅ Gemini API key configured${NC}"
echo ""

echo -e "${BLUE}Step 2: Email Configuration${NC}"
echo "----------------------------------------"
echo "Configure email account for triage@fredrikivarsson.fi"
echo ""
read -p "IMAP Host (e.g., imap.gmail.com): " EMAIL_HOST
read -p "IMAP Port (default: 993): " EMAIL_PORT
EMAIL_PORT=${EMAIL_PORT:-993}
read -p "Email address: " EMAIL_USER
read -sp "Email password/app password: " EMAIL_PASSWORD
echo ""

# Update .env
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|EMAIL_HOST=.*|EMAIL_HOST=$EMAIL_HOST|" .env
    sed -i '' "s|EMAIL_PORT=.*|EMAIL_PORT=$EMAIL_PORT|" .env
    sed -i '' "s|EMAIL_USER=.*|EMAIL_USER=$EMAIL_USER|" .env
    sed -i '' "s|EMAIL_PASSWORD=.*|EMAIL_PASSWORD=$EMAIL_PASSWORD|" .env
else
    sed -i "s|EMAIL_HOST=.*|EMAIL_HOST=$EMAIL_HOST|" .env
    sed -i "s|EMAIL_PORT=.*|EMAIL_PORT=$EMAIL_PORT|" .env
    sed -i "s|EMAIL_USER=.*|EMAIL_USER=$EMAIL_USER|" .env
    sed -i "s|EMAIL_PASSWORD=.*|EMAIL_PASSWORD=$EMAIL_PASSWORD|" .env
fi

echo -e "${GREEN}✅ Email configured${NC}"
echo ""

echo -e "${BLUE}Step 3: GitHub Configuration${NC}"
echo "----------------------------------------"
echo "1. Create a GitHub repository for your Obsidian vault"
echo "   Go to: https://github.com/new"
echo "   Repository name: obsidian-vault (or your choice)"
echo "   Can be private or public"
echo ""
echo "2. Create a Personal Access Token:"
echo "   Go to: https://github.com/settings/tokens"
echo "   Click 'Generate new token (classic)'"
echo "   Select scope: 'repo' (Full control of private repositories)"
echo ""
read -p "GitHub repository URL (e.g., https://github.com/yourusername/obsidian-vault.git): " GITHUB_REPO
read -p "GitHub Personal Access Token: " GITHUB_TOKEN

# Update .env
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|GITHUB_REPO_URL=.*|GITHUB_REPO_URL=$GITHUB_REPO|" .env
    sed -i '' "s|GITHUB_TOKEN=.*|GITHUB_TOKEN=$GITHUB_TOKEN|" .env
else
    sed -i "s|GITHUB_REPO_URL=.*|GITHUB_REPO_URL=$GITHUB_REPO|" .env
    sed -i "s|GITHUB_TOKEN=.*|GITHUB_TOKEN=$GITHUB_TOKEN|" .env
fi

echo -e "${GREEN}✅ GitHub configured${NC}"
echo ""

echo -e "${BLUE}Step 4: Installing Dependencies${NC}"
echo "----------------------------------------"
npm install

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Next steps:"
echo "1. Start the server:"
echo "   ${YELLOW}npm start${NC}"
echo ""
echo "2. Send a test email to: ${YELLOW}$EMAIL_USER${NC}"
echo ""
echo "3. Open Obsidian vault:"
echo "   ${YELLOW}./obsidian-vault${NC}"
echo ""
echo "4. Enable Bases plugin in Obsidian:"
echo "   Settings → Core Plugins → Bases (ON)"
echo ""
echo "5. Check the logs to see your first triage!"
echo ""
echo "📖 Read the guides:"
echo "   - README.md - Overview and examples"
echo "   - OBSIDIAN-GUIDE.md - Detailed Obsidian usage"
echo "   - SETUP.md - Troubleshooting"
echo ""
echo "Happy triaging! 🎉"
