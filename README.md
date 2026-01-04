# VideoDB Meme Templates

A code-first video meme generator with a curated Meme Bank. Create professional memes instantly using reusable VideoDB Editor templates with popular meme source videos.

## ✨ Features

- **🏦 Meme Bank** - Curated popular meme sources with one-click sync to VideoDB
- **📝 Template System** - Code-based templates for consistent, repeatable meme generation
- **🎬 Real-time Preview** - Watch generated memes instantly in the browser
- **🔒 Smart Collections** - Auto-creates "Memes" collection for organized asset management
- **💻 Modern UI** - React/TypeScript frontend with responsive design
- **🛡️ Safe Execution** - 30-second timeout protection and input validation
- **📖 Code Transparency** - View the Python code powering each template
- **🔄 One-Click Sync** - Upload meme sources directly from URL with one click

## 🚀 Quick Start

See [QUICKSTART.md](QUICKSTART.md) for a 5-minute setup guide.

### Prerequisites

- Python 3.8+
- Node.js 18+ (or Bun)
- VideoDB API key ([Get one free](https://videodb.io))

### Installation

**Backend (Terminal 1):**
```bash
cd makememes.site
export PYTHONPATH=.
uv run python -m uvicorn backend.app:app --reload --port 8000
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm install
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local
npm run dev
```

**Access:** Open [http://localhost:3000](http://localhost:3000)

## 📖 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - Complete technical documentation
- **[frontend/README.md](frontend/README.md)** - Frontend-specific details

## 🏗️ Architecture

### Separated Frontend/Backend

```
┌─────────────────────────────────────┐
│  Next.js Frontend (Port 3000)       │
│  - Templates page                   │
│  - Meme Bank page                   │
│  - Template editor                  │
│  - React + TypeScript + Tailwind    │
└──────────────┬──────────────────────┘
               │ HTTP/REST API
┌──────────────▼──────────────────────┐
│  FastAPI Backend (Port 8000)        │
│  - Template execution               │
│  - Meme Bank management             │
│  - VideoDB integration              │
│  - "Memes" collection handler       │
└──────────────┬──────────────────────┘
               │ VideoDB SDK
┌──────────────▼──────────────────────┐
│  VideoDB Editor API                 │
│  - Video composition                │
│  - Asset management                 │
│  - Stream generation                │
└─────────────────────────────────────┘
```

**Benefits:**
- Independent scaling of frontend and backend
- Modern development experience with hot reload
- Type-safe communication
- Clear separation of concerns

## 🎯 Core Features

### 1. Meme Bank

A curated collection of popular meme source videos that you can sync to your VideoDB account with one click.

**Features:**
- **Check Availability** - See which memes you already have
- **One-Click Sync** - Upload meme sources directly to VideoDB
- **Smart Matching** - Detects existing memes in your collection
- **Asset ID Copy** - Easily copy IDs for use in templates
- **Backend-Driven** - Configure sources in `backend/meme_bank.json`

**How It Works:**
1. Visit `/meme-bank` page
2. Enter your VideoDB API key
3. Click "Check Availability"
4. Sync missing memes with one click
5. Copy asset IDs to use in templates

### 2. Template System

Code-based templates for consistent, repeatable meme generation.

**Current Templates:**
- **TMKOC Jethalal NY Chill** - 2x2 grid meme with custom text overlays

**Template Features:**
- View source code
- See preview (if configured)
- Customize parameters
- Generate instantly
- Fork and modify

### 3. Smart Collections

Automatic "Memes" collection management in VideoDB.

**Features:**
- **Auto-create** - Creates "Memes" collection if it doesn't exist
- **Auto-find** - Finds existing "Memes" collection by name
- **Organized** - All meme assets in one place
- **Easy browsing** - Load and view your meme collection

## 📝 Usage

### Basic Workflow

#### Option 1: Use Meme Bank (Recommended for beginners)

1. Visit **🏦 Meme Bank** page
2. Enter VideoDB API key in header
3. Click "Check Availability"
4. Click "One-Click Sync" for any missing memes
5. Copy the asset ID from synced memes
6. Go to **Templates** page
7. Select a template
8. Paste asset ID and customize parameters
9. Click "Run Template"
10. Watch your meme!

#### Option 2: Use Your Own Assets

1. Upload videos/images to VideoDB
2. Go to **Templates** page
3. Select a template
4. Click "Load Memes Collection" to see your assets
5. Copy asset IDs
6. Fill in template parameters
7. Click "Run Template"
8. Watch your meme!

### Adding Content

#### Add a New Meme Source

Edit `backend/meme_bank.json`:

```json
{
  "meme_sources": [
    {
      "id": "my-meme",
      "name": "My Meme Name",
      "description": "Description of the meme format",
      "category": "Category Name",
      "tags": ["tag1", "tag2"],
      "source_url": "https://your-cdn.com/video.m3u8",
      "preview_url": "https://your-cdn.com/video.m3u8",
      "thumbnail_url": null,
      "media_type": "video"
    }
  ]
}
```

Restart backend to see changes.

#### Add a New Template

1. Create `backend/templates/my_template.py`:

```python
def render(conn, params):
    """
    Required entrypoint function.

    Args:
        conn: VideoDB connection
        params: Validated user parameters

    Returns:
        Dict with stream_url, player_url, metadata
    """
    from videodb.editor import Timeline, Track, Clip, VideoAsset

    # Your template implementation
    timeline = Timeline(conn)
    timeline.resolution = "1280x720"

    # ... build composition ...

    stream_url = timeline.generate_stream()

    return {
        "stream_url": stream_url,
        "player_url": f"https://play.videodb.io/{stream_url}",
        "metadata": params
    }
```

2. Add entry to `backend/templates/registry.json`:

```json
{
  "templates": [
    {
      "template_id": "my_template",
      "name": "My Template Name",
      "description": "What it does",
      "tags": ["category", "format"],
      "difficulty": "basic",
      "code_path": "my_template.py",
      "params_schema": [
        {
          "name": "video_id",
          "type": "video_asset_id",
          "required": true
        }
      ],
      "demo_inputs": {
        "video_id": "sample_id"
      },
      "preview_stream_url": "https://..."
    }
  ]
}
```

3. Restart backend

## 🔌 API Endpoints

### Templates
- `GET /api/templates` - List all templates
- `GET /api/templates/{id}` - Get template details
- `POST /api/run/{id}` - Execute template
- `POST /api/run-custom` - Execute custom code

### Assets
- `GET /api/assets` - Fetch "Memes" collection

### Meme Bank
- `GET /api/meme-bank` - List meme sources
- `GET /api/meme-bank/check` - Check availability
- `POST /api/meme-bank/sync` - Sync meme to collection

Full API documentation in [IMPLEMENTATION.md](IMPLEMENTATION.md).

## 🛠️ Technical Stack

### Backend
- **FastAPI** - Modern async web framework
- **VideoDB SDK** - Official Python SDK
- **Uvicorn** - ASGI server
- **Python 3.12** - Latest stable Python

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **HLS.js** - Video streaming
- **Axios** - HTTP client

## 🔒 Security

- ✅ 30-second timeout per template execution
- ✅ Input validation and type checking
- ✅ API keys never logged or stored server-side
- ✅ Error sanitization (no stack traces exposed)
- ✅ Only curated templates can execute
- ✅ Collection isolation for meme assets

## 📁 Project Structure

```
makememes.site/
├── backend/
│   ├── app.py                      # FastAPI server
│   ├── executor.py                 # Template runner
│   ├── registry.py                 # Template loader
│   ├── validator.py                # Parameter validation
│   ├── meme_bank.json              # Meme sources config
│   ├── requirements.txt            # Python dependencies
│   └── templates/
│       ├── registry.json           # Template metadata
│       └── *.py                    # Template implementations
│
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js pages
│   │   │   ├── page.tsx            # Templates page
│   │   │   ├── meme-bank/          # Meme Bank page
│   │   │   └── template/[id]/      # Template editor
│   │   ├── components/             # React components
│   │   ├── lib/                    # API client
│   │   └── types/                  # TypeScript types
│   └── package.json
│
├── README.md                       # This file
├── QUICKSTART.md                   # 5-minute guide
└── IMPLEMENTATION.md               # Technical docs
```

## 🐛 Troubleshooting

### "Invalid or expired VideoDB API key"
- Verify your key at [VideoDB Console](https://console.videodb.io)
- Ensure no extra spaces when pasting

### "Asset not found"
- Check asset ID exists in your "Memes" collection
- Use "Load Memes Collection" to see available IDs

### "No source URL configured"
- Edit `backend/meme_bank.json`
- Add valid `source_url` for the meme
- Restart backend

### Template execution timeout
- Try shorter duration parameters
- Simplify complex compositions
- Check VideoDB API status

### CORS errors
- Ensure frontend URL is in `backend/app.py` allow_origins
- Check both servers are running
- Verify NEXT_PUBLIC_API_URL in `.env.local`

## 🗺️ Roadmap

**V2 (Coming Soon):**
- [ ] User authentication
- [ ] Template run history
- [ ] More meme templates
- [ ] Advanced filtering
- [ ] Batch processing

**V3 (Future):**
- [ ] Template marketplace
- [ ] User-submitted templates
- [ ] Visual editor
- [ ] Mobile app
- [ ] Analytics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your template or meme source
4. Update documentation
5. Test with real VideoDB assets
6. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 💬 Support

- **Documentation:** [IMPLEMENTATION.md](IMPLEMENTATION.md)
- **Quick Start:** [QUICKSTART.md](QUICKSTART.md)
- **VideoDB Docs:** https://docs.videodb.io
- **Issues:** GitHub Issues

## 🎉 Getting Started

Ready to create memes? Check out the [QUICKSTART.md](QUICKSTART.md) guide and start generating memes in 5 minutes!

**Don't have assets yet?** Visit the **🏦 Meme Bank** to sync popular meme sources with one click!

---

**Made with VideoDB Editor API** | **Powered by Next.js & FastAPI**
