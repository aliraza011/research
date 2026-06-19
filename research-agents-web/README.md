# Research Agents Web

A Next.js multi-agent research framework where scientist agents brainstorm a hypothesis, critique it, and produce an engineer-ready experiment plan.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Use Grok/xAI

Add this to `.env.local` or Vercel Environment Variables:

```env
XAI_API_KEY=your_xai_api_key_here
XAI_MODEL=grok-4.3
```

Without an API key, the app runs in mock mode.

## Deploy to Vercel

- Framework: Next.js
- Build command: `npm run build`
- Output directory: leave blank
- Root directory: set to this folder if your repo contains this app in a subfolder
