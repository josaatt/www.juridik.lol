# Quick Start Guide - Kom Igång

Denna guide hjälper dig att få Life Triage System igång på **5-10 minuter**.

## Alternativ 1: Automatisk Setup (Rekommenderas)

```bash
cd life-triage
./setup.sh
```

Scriptet guidar dig genom:
1. ✅ Gemini API-nyckel
2. ✅ Email-konfiguration
3. ✅ GitHub-setup
4. ✅ Installation av dependencies

Sedan är du klar!

## Alternativ 2: Manuell Setup

### Steg 1: Skaffa Gemini API-nyckel (2 min)

1. Gå till: https://ai.google.dev/
2. Klicka på **"Get API key in Google AI Studio"**
3. Logga in med Google-konto
4. Klicka **"Create API key"**
5. Kopiera nyckeln

**Tips:** Gratis tier ger 15 requests/minut - mer än tillräckligt för personligt bruk!

### Steg 2: Konfigurera Email (3 min)

Du behöver IMAP-åtkomst till `triage@fredrikivarsson.fi` (eller annat email).

#### Om du använder Gmail:

1. Gå till: https://myaccount.google.com/apppasswords
2. Skapa ett "App Password" för "Mail"
3. Kopiera lösenordet (16 tecken)
4. Använd:
   - Host: `imap.gmail.com`
   - Port: `993`
   - User: `din-email@gmail.com`
   - Password: `app password från steg 2`

#### Om du har egen domän (fredrikivarsson.fi):

1. Kontakta din hosting-leverantör
2. Skapa email: `triage@fredrikivarsson.fi`
3. Aktivera IMAP
4. Få IMAP-inställningar (host, port, user, password)

### Steg 3: Skapa GitHub Repository (2 min)

1. Gå till: https://github.com/new
2. Repository name: `obsidian-vault`
3. Privacy: **Private** (rekommenderas) eller Public
4. ✅ Initialize with README
5. Klicka **"Create repository"**

### Steg 4: Skapa GitHub Token (2 min)

1. Gå till: https://github.com/settings/tokens
2. Klicka **"Generate new token (classic)"**
3. Note: `Life Triage System`
4. Select scopes: ✅ **repo** (Full control of private repositories)
5. Klicka **"Generate token"**
6. **Kopiera token OMEDELBART** (visas bara en gång!)

### Steg 5: Konfigurera .env (1 min)

```bash
cd life-triage
cp .env.example .env
nano .env  # eller din favorit-editor
```

Fyll i:

```env
# Från Steg 1
GEMINI_API_KEY=AIzaSy...din_nyckel

# Från Steg 2
EMAIL_HOST=imap.gmail.com
EMAIL_PORT=993
EMAIL_USER=triage@fredrikivarsson.fi
EMAIL_PASSWORD=ditt_app_password

# Från Steg 3 & 4
GITHUB_REPO_URL=https://github.com/dittnamn/obsidian-vault.git
GITHUB_TOKEN=ghp_...din_token
GITHUB_BRANCH=main

# Vault-sökväg (kan vara relativ)
OBSIDIAN_VAULT_PATH=./obsidian-vault

# Server-port
PORT=3000
NODE_ENV=development
```

Spara och stäng (Ctrl+X, Y, Enter i nano).

### Steg 6: Installera Dependencies (1 min)

```bash
npm install
```

### Steg 7: Starta Systemet! (0 sek)

```bash
npm start
```

Du bör se:

```
🚀 Life Triage System running on port 3000
📍 Environment: development
🔧 Initializing GitHub sync...
📥 Cloning repository...
✅ Repository cloned
✅ GitHub sync initialized
🔧 Initializing Obsidian vault...
📊 Creating Obsidian Bases...
  ✅ Master base created
  ✅ Tasks base created
  ✅ Meetings base created
  ✅ Finance base created
  ✅ Ideas base created
  ✅ People base created
  ✅ Projects base created
✅ Created 7 bases
✅ Obsidian vault initialized
📧 Starting email monitoring...
✅ IMAP connection ready
📂 Inbox opened
📪 No new emails
```

**SYSTEMET ÄR IGÅNG!** 🎉

## Steg 8: Testa Med Email (2 min)

Skicka ett test-email:

**Till:** `triage@fredrikivarsson.fi` (eller din email)

**Ämne:** Test

**Text:**
```
Möte med Anna imorgon kl 15:00 på kontoret.

TODO:
- Förbereda presentation
- Ta med kaffe
```

**Bifoga:** (valfritt) En skärmdump av din kalender

### Vad händer:

1. Systemet ser det nya emailet
2. Gemini AI analyserar texten (+ bilden om bifogad)
3. Extraherar: datum, personer, uppgifter
4. Skapar markdown-note i `obsidian-vault/Inbox/`
5. Skapar Canvas-visualisering i `obsidian-vault/Canvas/`
6. Skapar/uppdaterar person-note för "Anna"
7. Uppdaterar Daily note
8. Commitar till GitHub

**I terminalen ser du:**

```
📨 New email received: "Test"
🖼️  Processing image: screenshot.png
🤖 Triage complete: {
  type: 'meeting',
  category: 'work',
  priority: 'medium'
}
📄 Created note: Inbox/2025-11-11-143022-mote-med-anna.md
  🎨 Created canvas: Canvas/2025-11-11-143022-mote-med-anna.canvas
  👤 Updated person note: People/anna.md
✅ Synced to GitHub
```

## Steg 9: Öppna I Obsidian (3 min)

### Installera Obsidian (om du inte har det)

1. Gå till: https://obsidian.md/
2. Ladda ner för ditt OS
3. Installera

### Öppna Vault

1. Öppna Obsidian
2. Klicka **"Open folder as vault"**
3. Välj: `life-triage/obsidian-vault`

### Aktivera Bases Plugin

1. Klicka ⚙️ **Settings** (nedre vänster)
2. Gå till **Core plugins**
3. Hitta **"Bases"**
4. Sätt till **ON** ✅
5. Stäng settings

### Utforska!

**Prova Bases:**
1. I filträdet, hitta `All-Triage-Items.base`
2. Klicka på den
3. **BOOM!** - Du ser din note som en databas! 📊

**Prova Canvas:**
1. Öppna mappen `Canvas/`
2. Klicka på `.canvas`-filen
3. Se visuell karta över ditt möte! 🎨

**Kolla People:**
1. Öppna `People/anna.md`
2. Se att interaktionen loggades automatiskt! 👤

**Kolla Daily Note:**
1. Öppna `Daily/2025-11-11.md`
2. Se dagens triage-log! 📅

## Steg 10: Använd Det! (Varje dag)

### Snabb workflow:

1. **Skicka email** till din triage-adress med vad som helst:
   - Tankar
   - Skärmdumpar
   - Fakturor (som PDF)
   - Mötesinbjudningar
   - Idéer
   - Voice notes (om bifogat som audio)

2. **AI triagerar** automatiskt

3. **Öppna Obsidian** när du vill se:
   - `Tasks.base` → Alla uppgifter
   - `Meetings.base` → Kommande möten
   - `Finance.base` → Fakturor att betala
   - Canvas-filer → Visuella överblickar

4. **Allt är i Git** → Säkerhetskopierat automatiskt!

## Användningsexempel

### 📸 Skärmdump av mötesinbjudan

**Email:**
- Bifoga: Screenshot med "Möte 15 nov kl 14:00 med Anna & Johan"
- Skicka!

**Resultat:**
- Note med datum: 2025-11-15
- Länkar till Anna & Johan (person-notes skapade)
- Syns i Meetings.base
- Canvas visar alla tre personer

### 💰 Foto av faktura

**Email:**
- Bifoga: Foto på faktura (5000 kr, förfaller 30 nov)
- Skicka!

**Resultat:**
- Note i Finance/
- OCR läser belopp och datum
- Syns i Finance.base med "Due Soon" filter
- Påminnelse att betala före deadline

### 💡 Snabb idé

**Email:**
- Text: "Idé: Bygga en AI-bot som läser juridiska dokument"
- Skicka!

**Resultat:**
- Note i Resources/
- Kategoriserad som "idea"
- Syns i Ideas.base
- Canvas skapad för att expandera idén senare

## Felsökning

### "IMAP connection failed"

**Problem:** Email-credentials fel

**Lösning:**
```bash
# Testa IMAP manuellt
telnet imap.gmail.com 993
# Ska säga "Connected"

# Dubbelkolla .env:
cat .env | grep EMAIL
```

### "Gemini API error"

**Problem:** API-nyckel fel eller quota slut

**Lösning:**
1. Testa nyckel: https://ai.google.dev/
2. Kolla quota: https://ai.google.dev/pricing
3. Om gratis tier slut → vänta eller aktivera billing

### "GitHub push failed"

**Problem:** Token saknar permissions

**Lösning:**
1. Skapa ny token med `repo` scope
2. Uppdatera i `.env`
3. Starta om: `npm start`

### "No new emails" men du skickat ett

**Problem:** Email hamnade i annat fält än INBOX

**Lösning:**
```bash
# Kolla vilken mapp det är
# I src/email-receiver.js, ändra rad:
this.imap.openBox('INBOX', false, (err) => {
# Till:
this.imap.openBox('Inbox', false, (err) => {
# (versaler kan skilja!)
```

## Extra Tips

### Development Mode (Auto-reload)

```bash
npm run dev
```

Servern startar om automatiskt vid kodändringar.

### Kör I Bakgrunden (Production)

```bash
# Installera PM2
npm install -g pm2

# Starta
pm2 start src/server.js --name life-triage

# Se logs
pm2 logs life-triage

# Stoppa
pm2 stop life-triage

# Auto-start vid boot
pm2 startup
pm2 save
```

### Docker (För deployment)

```bash
# Bygg
docker-compose up -d

# Logs
docker-compose logs -f

# Stoppa
docker-compose down
```

### Obsidian Sync (Mobil-åtkomst)

1. I Obsidian: Settings → Core Plugins → Sync (ON)
2. Betala för Obsidian Sync (~$4/mån)
3. Installera Obsidian på mobil
4. Allt syncar automatiskt!

Alternativt: Använd Git plugin i Obsidian för manuell sync.

## Nästa Nivå

När du känner dig bekväm:

1. **Anpassa prompts** i `src/gemini-processor.js`
2. **Lägg till custom bases** i `src/base-generator.js`
3. **Tweaka canvas-layout** i `src/canvas-generator.js`
4. **Integrera med kalender** (Google Calendar API)
5. **Webhook från andra appar** → POST till `/api/triage`

## Resurser

- **README.md** - Full dokumentation
- **OBSIDIAN-GUIDE.md** - Djupdykning i Bases & Canvas
- **SETUP.md** - Troubleshooting guide
- **Obsidian Forum** - https://forum.obsidian.md/
- **JSON Canvas Spec** - https://jsoncanvas.org/

## Behöver Hjälp?

**Fråga mig!** Jag kan hjälpa med:
- Debugga problem
- Anpassa systemet
- Lägga till features
- Optimera workflows

**Grattis!** Du har nu ett AI-drivet life management system! 🎉

---

*Tiden för setup: ~10-15 minuter*
*Tiden du sparar: Oändlig* ✨
