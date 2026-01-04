# QuickStart Guide - VideoDB Meme Templates

Get up and running in 5 minutes with meme generation and the Meme Bank.

---

## Prerequisites

- ✅ Python 3.8+ installed
- ✅ Node.js 18+ installed (or Bun)
- ✅ VideoDB API key ([Get free key](https://videodb.io))

---

## Setup Steps

### 1. Backend (2 minutes)

**Using uv (Recommended):**
```bash
# Navigate to project
cd makememes.site

# Set Python path and start server
export PYTHONPATH=.
uv run python -m uvicorn backend.app:app --reload --port 8000
```

**Or use the startup script:**
```bash
./start-backend.sh
```

✅ Backend running on **http://localhost:8000**

### 2. Frontend (2 minutes)

Open a **new terminal**:

```bash
# Navigate to frontend
cd frontend

# Install dependencies (first time only)
npm install
# or: bun install

# Create environment file
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local

# Start frontend dev server
npm run dev
# or: bun dev
```

✅ Frontend running on **http://localhost:3000**

### 3. Test It Out (1 minute)

1. Open **http://localhost:3000** in your browser
2. Enter your VideoDB API key in the header
3. Visit the **🏦 Meme Bank** to sync popular meme sources
4. Click any template from the Templates page
5. Fill in parameters using asset IDs from your collection
6. Click "Run Template"
7. Watch your meme generate instantly

---

## Quick Commands

### Backend
```bash
# Start (recommended)
export PYTHONPATH=. && uv run python -m uvicorn backend.app:app --reload --port 8000

# Or use startup script
./start-backend.sh

# Check templates loaded
python -c "from backend.registry import load_registry; print(f'{len(load_registry())} templates loaded')"
```

### Frontend
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

---

## What's Available

### Navigation

- **Templates** - Browse and use meme templates
- **🏦 Meme Bank** - Curated popular meme sources with one-click sync

### Features

**Meme Bank:**
1. Check which popular memes you already have in VideoDB
2. One-click sync missing memes to your "Memes" collection
3. Copy asset IDs directly to use in templates
4. Add your own memes by editing `backend/meme_bank.json`

**Templates:**
- Currently: TMKOC Jethalal NY Chill template
- View template code and preview
- Customize parameters
- Generate meme videos instantly

**Smart Collections:**
- Auto-creates/finds "Memes" collection in VideoDB
- All meme sources organized in one place
- Easy asset management

---

## Typical Workflow

### Option 1: Use Meme Bank

1. **Go to Meme Bank** (`/meme-bank`)
2. **Enter API key** in header
3. **Click "Check Availability"**
4. **Sync missing memes** with one click
5. **Copy asset ID** from available memes
6. **Go to Templates** and create your meme

### Option 2: Use Your Own Assets

1. **Upload videos** to VideoDB
2. **Load your collection** in template editor
3. **Copy asset IDs**
4. **Fill in template parameters**
5. **Generate meme**

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'videodb'"
```bash
source .venv/bin/activate
uv pip install videodb
```

### "Failed to connect to http://localhost:8000"
- Backend not running? Start it in another terminal
- Wrong port? Check NEXT_PUBLIC_API_URL in .env.local

### "Invalid or expired VideoDB API key"
- Get new key from https://console.videodb.io
- Make sure no extra spaces when pasting

### CORS Error
Backend should allow localhost:3000. Check `backend/app.py`:
```python
allow_origins=["http://localhost:3000"]
```

### "No source URL configured for this meme"
- Edit `backend/meme_bank.json`
- Add valid `source_url` for the meme
- Restart backend

---

## API Endpoints

- **GET** `/api/templates` - List all templates
- **GET** `/api/templates/{id}` - Get template details
- **POST** `/api/run/{id}` - Execute template
- **GET** `/api/assets` - Fetch your "Memes" collection
- **GET** `/api/meme-bank` - List meme sources
- **GET** `/api/meme-bank/check` - Check meme availability
- **POST** `/api/meme-bank/sync` - Sync meme to collection

---

## Next Steps

### 1. Explore Meme Bank
- Visit `/meme-bank`
- Sync popular meme sources
- Start with TMKOC template

### 2. Try Templates
- Go to `/` (Templates page)
- Click on TMKOC template
- Use synced assets from Meme Bank
- Generate your first meme

### 3. Add Your Own
- **Add templates**: Create `.py` file in `backend/templates/`
- **Add memes**: Edit `backend/meme_bank.json`
- **Restart backend** to see changes

### 4. Read the Docs
- `README.md` - Full documentation
- `IMPLEMENTATION.md` - Technical details
- `frontend/README.md` - Frontend specifics

---

## Project Structure

```
makememes.site/
├── backend/
│   ├── app.py              # API server
│   ├── executor.py         # Template runner
│   ├── registry.py         # Template loader
│   ├── meme_bank.json      # Meme sources config
│   └── templates/
│       ├── registry.json           # Template metadata
│       └── tmkoc_jethalal_ny_1.py  # Example template
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                # Templates page
│   │   │   ├── meme-bank/page.tsx      # Meme Bank page
│   │   │   └── template/[id]/page.tsx  # Template editor
│   │   └── components/
│   │       ├── TemplateGrid.tsx    # Template cards
│   │       ├── MemeBank.tsx        # Meme Bank UI
│   │       └── ...
│   └── package.json
│
└── README.md
```

---

## Development Workflow

### Making Changes

**Backend changes** (Python):
- Edit files in `backend/`
- Server auto-reloads (--reload flag)
- For `meme_bank.json` changes: restart server

**Frontend changes** (React/TypeScript):
- Edit files in `frontend/src/`
- Hot module replacement (instant updates)
- No restart needed

**Adding a template**:
1. Create `backend/templates/my_template.py`
2. Add entry to `backend/templates/registry.json`
3. Restart backend
4. Template appears in frontend

**Adding a meme source**:
1. Edit `backend/meme_bank.json`
2. Add entry with name, description, source_url
3. Restart backend
4. Meme appears in Meme Bank

---

## Production Deployment

### Option 1: Separate Services

**Backend** → Railway/Render/Fly.io
```bash
uvicorn backend.app:app --host 0.0.0.0 --port 8000 --workers 4
```

**Frontend** → Vercel (recommended)
```bash
cd frontend
vercel deploy
```

### Option 2: Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - PYTHONPATH=.

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
```

---

## Tips & Best Practices

💡 **Start with Meme Bank** - Easiest way to get started with pre-configured sources

💡 **Check Availability First** - Save time by syncing only what you need

💡 **Use "Memes" Collection** - All meme assets auto-organized

💡 **Copy Asset IDs** - Click to copy, makes filling forms easier

💡 **Preview Templates** - Hover over template cards to see preview

💡 **View Code** - Understand what each template does before running

💡 **Save Your Config** - Keep track of commonly used asset IDs

💡 **Experiment** - Templates run fast (10-30s), try different parameters!

---

## Common Use Cases

### Use Case 1: TMKOC Meme
1. Visit Meme Bank
2. Sync "TMKOC Jethalal Sunday" video
3. Go to Templates → TMKOC template
4. Enter the synced asset ID
5. Customize text overlays
6. Generate meme

### Use Case 2: Custom Text Overlay
1. Upload your own video to VideoDB
2. Visit Templates page
3. Select text overlay template (if available)
4. Enter your video_id
5. Add custom text
6. Generate meme

### Use Case 3: Browse & Discover
1. Check Meme Bank for inspiration
2. See what popular meme formats are available
3. Sync the ones you like
4. Create memes using templates

---

## Getting Help

1. **Check README.md** - Comprehensive documentation
2. **Check IMPLEMENTATION.md** - Technical implementation details
3. **Check frontend/README.md** - Frontend-specific info
4. **VideoDB Docs** - https://docs.videodb.io
5. **Console Logs** - Backend terminal shows detailed errors

---

## Status

✅ **Backend**: Templates + Meme Bank ready
✅ **Frontend**: Modern React UI with navigation
✅ **Meme Bank**: One-click sync functional
✅ **Collections**: Auto-create "Memes" collection
✅ **API**: All endpoints working
✅ **Docs**: Complete
✅ **Ready for**: Production use

---

**You're all set!** Start creating memes at **http://localhost:3000** 🎬

Try the **🏦 Meme Bank** first to get started quickly with popular sources!
