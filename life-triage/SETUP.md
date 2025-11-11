# Setup Guide

## Step 1: Get Google Gemini API Key

1. Go to https://ai.google.dev/
2. Click "Get API key in Google AI Studio"
3. Sign in with your Google account
4. Click "Create API key"
5. Copy your API key

## Step 2: Setup Email

You need an email account with IMAP access. Options:

### Option A: Use existing email (Gmail, Outlook, etc.)

**Gmail:**
- Enable IMAP: Settings → Forwarding and POP/IMAP → Enable IMAP
- Create app password: https://myaccount.google.com/apppasswords
- Use `imap.gmail.com` port `993`

**Outlook:**
- Enable IMAP automatically
- Use `outlook.office365.com` port `993`

### Option B: Setup email at fredrikivarsson.fi

Contact your domain hosting provider to:
1. Create email: `triage@fredrikivarsson.fi`
2. Get IMAP settings
3. Enable IMAP access

## Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Create repository: `obsidian-vault` (can be private)
3. Initialize with README
4. Create Personal Access Token:
   - Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token
   - Select scope: `repo` (Full control of private repositories)
   - Copy token

## Step 4: Configure Environment

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` with your credentials:
```env
GEMINI_API_KEY=AIzaSy...your_key_here

EMAIL_HOST=imap.gmail.com  # or your IMAP host
EMAIL_PORT=993
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_app_password

GITHUB_REPO_URL=https://github.com/yourusername/obsidian-vault.git
GITHUB_TOKEN=ghp_your_token_here
GITHUB_BRANCH=main
```

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Test

```bash
# Start in development mode
npm run dev
```

Check console for:
- ✅ IMAP connection ready
- ✅ GitHub sync initialized
- 🚀 Life Triage System running

## Step 7: Send Test Email

Send an email to your triage address:

**Subject:** Test

**Body:**
```
Detta är ett test. Möte med Anna imorgon kl 15:00.
```

Watch the console for processing logs!

## Step 8: Setup Obsidian

1. Install Obsidian: https://obsidian.md/
2. Open vault: Point to `./obsidian-vault` folder
3. Install recommended plugins:
   - Dataview (for queries)
   - Templater (for templates)
   - Git (for manual sync if needed)

## Step 9: Deploy to Production

### Option A: VPS with Docker

```bash
# On your VPS
git clone https://github.com/yourusername/life-triage.git
cd life-triage
cp .env.example .env
nano .env  # Fill in credentials

# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Option B: Direct Node.js

```bash
# On your VPS
npm install -g pm2
pm2 start src/server.js --name life-triage
pm2 save
pm2 startup  # Follow instructions
```

## Verification Checklist

- [ ] Gemini API key working (test with manual API call)
- [ ] Email receiving works (send test email)
- [ ] GitHub sync works (check repository for commits)
- [ ] Obsidian vault readable (open in Obsidian)
- [ ] Daily notes created automatically
- [ ] Images processed and saved
- [ ] Attachments saved correctly

## Common Issues

### "IMAP connection failed"
- Check email/password
- Enable IMAP in email settings
- Check firewall/port 993
- Try EMAIL_TLS=false if using self-signed certs

### "Gemini API error"
- Verify API key is correct
- Check quota: https://ai.google.dev/pricing
- Enable billing if needed

### "GitHub push failed"
- Verify token has `repo` scope
- Check repository exists
- Ensure branch name matches (main vs master)

### "Permission denied" errors
- Check file permissions: `chmod -R 755 obsidian-vault/`
- Ensure git user is configured

## Next Steps

- Customize triage rules in `src/gemini-processor.js`
- Add custom Obsidian templates
- Setup email forwarding to triage address
- Create Obsidian dashboards with Dataview
- Add more integrations (calendar, etc.)

## Support

If you run into issues:
1. Check logs: `docker-compose logs` or `pm2 logs`
2. Verify configuration: All .env variables set?
3. Test individual components
4. Open GitHub issue with logs

Happy triaging! 🚀
