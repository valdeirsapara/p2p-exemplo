# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16.1 application for managing P2P camera streams. It provides a web interface to manage cameras (câmeras) and clients (clientes) that integrates with a backend RecAPI service for camera streaming and management.

## Environment Setup

Required environment variables in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/
NEXT_PUBLIC_RECAPI_URL=http://localhost:8000
RECAPI_TOKEN=<your_token_here>
USERNAME=<your_username>
PASSWORD=<your_password>
```

The application validates environment variables at startup using Zod schemas in `src/env.ts`. Missing or invalid variables will cause the application to fail with helpful error messages.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

The development server runs on http://localhost:3000.

## Architecture

### Dual API Pattern

The application uses two separate API layers:

1. **Next.js API Routes** (`src/app/api/*`): Internal API routes that proxy requests to the external RecAPI
   - Located in `src/app/api/cameras/`, `src/app/api/clientes/`, `src/app/api/auth/`
   - Handle authentication, request forwarding, and error normalization
   - All routes return NextResponse with consistent error handling

2. **RecAPI Client** (`src/lib/recapi-client.ts`): Type-safe client for the external RecAPI service
   - Provides methods like `cameras.list()`, `clientes.create()`, etc.
   - Used by Next.js API routes to communicate with the backend
   - Configured with authentication token via Axios interceptors

### API Client Usage

**In Next.js API routes (server-side):**
```typescript
import { cameras } from "@/lib/recapi-client";
const camerasList = await cameras.list(params);
```

**In frontend components (client-side):**
```typescript
import { api } from "@/lib/api";
const response = await api.get("/api/cameras");
```

Frontend components should NEVER call the RecAPI directly - always go through Next.js API routes.

### Authentication Flow

- Cookie-based authentication using `auth_token` cookie set to "authenticated"
- Middleware in `src/middleware.ts` protects all routes except `/login` and `/api/auth/*`
- Login endpoint validates against USERNAME/PASSWORD env vars and sets cookie
- RECAPI_TOKEN is added to all RecAPI requests via Axios interceptor

### Type System

- All RecAPI types are defined in `src/lib/recapi-types.ts` based on the OpenAPI specification
- Key types: `Camera`, `Cliente`, `StreamInfo`, `CameraCreateRequest`, etc.
- The RecAPI client is fully typed and provides autocomplete for all endpoints

### Component Structure

```
src/components/
├── ui/               # shadcn/ui components (Button, Input, Table, etc.)
├── dialogs/          # Application dialogs (CreateCameraDialog, PreviewCameraDialog, etc.)
├── cameras/          # Camera-specific components (CamerasTable)
├── home/             # Home page components (CamerasGrid)
├── hls-player.tsx    # HLS video streaming component using hls.js
├── sidebar-wrapper.tsx
├── side-bar.tsx
└── header-bar.tsx
```

### Page Structure

```
src/app/
├── page.tsx          # Home page - displays cameras grid
├── cameras/page.tsx  # Cameras management page
├── clientes/page.tsx # Clients management page
├── login/page.tsx    # Login page
└── api/              # Next.js API routes (proxy to RecAPI)
```

### State Management

- Uses @tanstack/react-query for server state management
- QueryClient configured in `src/app/providers.tsx`
- Components use `refreshKey` pattern for manual refetching (increment key to trigger refresh)
- Example: After creating a camera, increment refreshKey to refresh the table

### Styling

- Tailwind CSS 4 with custom configuration
- shadcn/ui components (New York style variant)
- Path aliases configured: `@/*` maps to `src/*`
- Components use `cn()` utility from `src/lib/utils.ts` for conditional classes

### Video Streaming

The `HLSPlayer` component (`src/components/hls-player.tsx`) handles HLS video streaming:
- Uses hls.js for browsers that don't support HLS natively
- Includes automatic error recovery for network and media errors
- Safari uses native HLS support
- Configured with low latency mode enabled
- Displays loading/error states with visual feedback
- Includes detailed console logging with `[HLSPlayer]` prefix for debugging
- Automatic retry logic (up to 3 attempts) for network errors
- Shows the stream URL in error state for debugging

**Debugging HLS Issues:**
- Check browser console for `[HLSPlayer]` logs to see connection attempts
- Verify the `streaming_url` field is populated in the camera object
- Test the manifest URL directly in browser (should return .m3u8 file)
- Use `ffplay <url>` to verify stream is accessible from network
- Common issues: CORS misconfiguration, manifest not generated yet, wrong URL format

## Key Patterns

### Creating New API Endpoints

1. Add type definitions to `src/lib/recapi-types.ts` if needed
2. Add method to `RecApiClient` in `src/lib/recapi-client.ts`
3. Create Next.js API route in `src/app/api/[resource]/route.ts`
4. Use consistent error handling with try/catch and NextResponse

### Creating New Pages

1. Create page in `src/app/[route]/page.tsx`
2. Use "use client" directive for interactive pages
3. Include `<HeaderBar>` for consistent page headers
4. Wrap data-fetching components with loading states and error handling

### Working with Forms

- Use shadcn/ui Dialog components for forms
- Pass `onSuccess` callback to trigger parent component refreshes
- Display errors using ErrorAlertDialog component
- Use DeleteConfirmDialog for destructive actions

## Important Notes

- The RecAPI backend expects Token authentication: `Authorization: Token <RECAPI_TOKEN>`
- All cameras have a `streaming_url` field populated by the backend
- Streaming status has states: "rodando", "parado", "erro", "iniciando"
- Client deletion is soft delete (sets `desativado_em` timestamp)
- Camera serials are unique identifiers from the physical devices
