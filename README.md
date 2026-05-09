# SQLose

**ephemeral SQL environments. spin up. query. throw away.**

## Structure

```
apps/
  desktop/          — Electron + React frontend
packages/
  ui/               — Shared UI components (sidebar, tables, modals, etc.)
  core/             — Core logic (query execution, drivers, Docker, import)
  shared/           — Shared types, styles, and utilities
```

## Getting Started

```sh
bun install
bun dev
```

## Architecture

- **Electron** with transparent frameless window (`titleBarStyle: "hidden"`)
- **React** with Zustand for state management, TanStack Query for async state
- **Monaco Editor** for SQL editing with optional Vim bindings
- **ResizablePane** — horizontal split layout (sidebar | main content)
- SQL drivers for SQLite, PostgreSQL, MySQL (via Docker environments)

## Layout

The root layout uses a flex container. The `ResizablePane` component must receive `className="flex-1 min-w-0"` to fill the full window width — flex children don't auto-expand without `flex-grow`.
