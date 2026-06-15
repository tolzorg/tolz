# Tolz

Free online tools platform. No signup, no watermarks, no catch.

## Stack

- **Frontend**: React 19 + Vite 8 + Tailwind CSS 4
- **Backend**: Node.js + Express 5 (stateless — no database, no Redis)
- **Deployment**: Render.com

## Structure

```
client/    React + Vite frontend
server/    Express backend
render.yaml  Render deployment config
```

## Local Development

### Server

```bash
cd server
cp .env.example .env      # edit ALLOWED_ORIGINS as needed
npm install
npm run dev               # starts on port 5000
```

> On Linux/macOS, run `bash bin/install.sh` once to download `yt-dlp` and `ffmpeg`
> into `server/bin/`. On Windows, place `yt-dlp.exe`, `ffmpeg.exe`, and
> `ffprobe.exe` in `server/bin/` manually.

### Client

```bash
cd client
npm install
npm run dev               # Vite dev server on port 5173, proxies /api to port 5000
```

## Render Deployment

1. Connect your repo to Render and select **Blueprint** — it reads `render.yaml`.
2. After the first deploy, set these env vars manually in the Render dashboard:
   - `tolz-api` → `ALLOWED_ORIGINS=https://<tolz-client-url>.onrender.com`
   - `tolz-client` → `VITE_API_URL=https://<tolz-api-url>.onrender.com`
3. Trigger a redeploy of **tolz-client** so `VITE_API_URL` is baked into the build.

The `npm run build` step in `tolz-api` automatically downloads `yt-dlp` and
`ffmpeg` Linux binaries via `server/bin/install.sh`.

## Running Tests

```bash
cd server
npm test
```

## Adding New Tools

1. Add tool entry to `client/src/utils/tools.js`
2. Create `server/tools/<toolName>/` with controller/service/routes
3. Mount routes in `server/routes/index.js`
4. Add `client/src/pages/<ToolName>Page.jsx`
5. Add route in `client/src/App.jsx`
