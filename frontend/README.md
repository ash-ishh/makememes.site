# VideoDB Meme Templates - Frontend

Modern Next.js frontend for the VideoDB Meme Templates application.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Axios** - API client

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Backend API running on port 8000

### Installation

```bash
cd frontend

# Install dependencies
npm install
# or using uv/bun
bun install

# Create environment file
cp .env.local.example .env.local
```

### Development

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The frontend will make API calls to `http://localhost:8000` (configurable via `NEXT_PUBLIC_API_URL`).

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   ├── Header.tsx
│   │   ├── TemplateList.tsx
│   │   ├── TemplateDetail.tsx
│   │   ├── VideoPlayer.tsx
│   │   └── AssetBrowser.tsx
│   ├── lib/              # Utilities
│   │   └── api.ts        # API client
│   └── types/            # TypeScript types
│       └── index.ts
├── public/               # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Environment Variables

Create a `.env.local` file:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Features

### Components

#### Header
- API key input with session storage
- Project title and description

#### TemplateList
- Displays all available templates
- Shows tags and descriptions
- Highlights selected template

#### TemplateDetail
- Dynamic parameter form based on template schema
- Real-time video player
- Asset browser integration
- Error handling with user-friendly messages
- Code viewer for template source

#### VideoPlayer
- HTML5 video player with controls
- Stream URL display and copy functionality

#### AssetBrowser
- Fetches user's VideoDB collection
- Displays videos, images, and audio
- Shows asset IDs for easy copying

### API Integration

The `apiClient` (in `src/lib/api.ts`) provides:

```typescript
// Set API key
apiClient.setApiKey('your-key');

// List templates
const templates = await apiClient.listTemplates();

// Get template details
const template = await apiClient.getTemplate('template_id');

// Run template
const result = await apiClient.runTemplate('template_id', params);

// List user assets
const assets = await apiClient.listAssets();
```

### Type Safety

All API responses and component props are fully typed:

```typescript
interface Template {
  template_id: string;
  name: string;
  description: string;
  tags: string[];
  difficulty: string;
  params_schema?: ParamSchema[];
  demo_inputs?: Record<string, any>;
  code?: string;
}
```

## Customization

### Styling

Tailwind config is in `tailwind.config.ts`. Custom colors:

```typescript
colors: {
  accent: "#d97706",  // Orange
  border: "#e5e7eb",  // Gray
  muted: "#6b7280",   // Gray
}
```

### Adding New Components

1. Create component in `src/components/`
2. Export from component file
3. Import in pages or other components

### API Endpoints

Update API base URL in `.env.local` or `next.config.js`.

## Development Tips

- Components use `'use client'` directive for client-side interactivity
- API key is stored in `sessionStorage` (not persisted across sessions)
- Error boundaries catch and display API errors
- Loading states provide visual feedback

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-api.com`
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Static Export

```bash
# Add to next.config.js
output: 'export'

# Build
npm run build

# Deploy /out folder to CDN
```

## Troubleshooting

### CORS Errors

Ensure backend has correct CORS configuration:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### API Connection Refused

- Check backend is running on port 8000
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## License

MIT
