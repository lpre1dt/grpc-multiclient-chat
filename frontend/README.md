# 🎨 gRPC Chat - Web Frontend

Modern Next.js-based web interface for the gRPC multi-client chat system.

## Features

- 🎨 Beautiful, responsive UI with TailwindCSS
- 💬 Real-time message updates (polling)
- 👤 User login and management
- 🚫 Block users functionality
- 🗑️ Clear own messages
- 📱 Mobile-responsive design
- ⚡ Fast API routes bridging HTTP to gRPC

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

**Note:** Make sure the gRPC server is running on `localhost:50051`

### Production Build

```bash
npm run build
npm start
```

### Docker

```bash
# From project root
docker-compose up -d frontend
```

## Environment Variables

Create a `.env.local` file for local development:

```bash
GRPC_SERVER_URL=localhost:50051
```

In Docker, this is set to `grpc-server:50051` automatically.

## Architecture

```
Browser Request → Next.js API Route → gRPC Client → gRPC Server
    (HTTP)            (Node.js)        (gRPC)         (:50051)
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/greet` | POST | Login/greet user |
| `/api/send` | POST | Send chat message |
| `/api/messages` | GET | Fetch all messages |
| `/api/clear` | POST | Clear user's messages |
| `/api/block` | POST | Block a user |

## Tech Stack

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **@grpc/grpc-js** - gRPC client
- **@grpc/proto-loader** - Protocol buffer loader

## Project Structure

```
frontend/
├── app/
│   ├── api/              # API routes (gRPC bridge)
│   │   ├── greet/
│   │   ├── send/
│   │   ├── messages/
│   │   ├── clear/
│   │   └── block/
│   ├── page.tsx          # Main chat UI
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── lib/
│   └── grpc-client.ts    # gRPC client wrapper
└── public/               # Static assets
```

## Development

### Adding New Features

1. **New API Route:**
   ```bash
   mkdir -p app/api/my-feature
   touch app/api/my-feature/route.ts
   ```

2. **Update UI:**
   Edit `app/page.tsx`

3. **Add gRPC Method:**
   Edit `lib/grpc-client.ts`

### Styling

Uses TailwindCSS utility classes. See `tailwind.config.js` for theme configuration.

### Type Safety

All components and API routes are TypeScript. Add types as needed.

## Troubleshooting

### Cannot connect to gRPC server

```bash
# Check GRPC_SERVER_URL
echo $GRPC_SERVER_URL

# Test gRPC server is reachable
nc -zv localhost 50051
```

### Build errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Port already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [gRPC-JS Documentation](https://grpc.github.io/grpc/node/)

## License

Part of the gRPC Multi-Client Chat System PVL project.
