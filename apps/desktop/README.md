# SQLLab Desktop

Electron-based SQL client with multi-database support (Postgres, MySQL, SQLite), Vim-mode editor, and Docker-powered environments.

## Setup

```bash
# Install dependencies (uses bun)
bun install

# Start development
bun run dev

# Build for production
bun run build

# Type check
bun run typecheck

# Lint
bun run lint
```

## Testing

```bash
# Run all tests
bun run test

# Watch mode
bun run test:watch

# With coverage
bun run test -- --coverage
```

### Test Structure

| Test Type | Location | Tool |
|-----------|----------|------|
| Unit/logic | `src/**/*.test.ts` | Vitest |
| Component | `src/components/*.test.tsx` | React Testing Library |
| Integration | `src/lib/workflows.integration.test.tsx` | Vitest + mocked IPC |
| IPC handlers | `electron/ipc-handlers.test.ts` | Vitest |
| E2E | `e2e/app.spec.ts` | Playwright |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Enter` | Execute query |
| `Cmd/Ctrl + K` | Open command palette |
| `Cmd/Ctrl + T` | New tab |
| `Cmd/Ctrl + W` | Close tab |
| `Cmd/Ctrl + Tab` | Next tab |
| `Cmd/Ctrl + Shift + Tab` | Previous tab |
| `Escape` | Close palette/settings |

## Vim Mode

Toggle Vim mode in Settings (`Cmd/Ctrl + K` > search "Vim").

### Supported Modes

- **NORMAL** -- default mode, navigation and operations
- **INSERT** -- text entry (`i`, `a`, `o`, etc.)
- **VISUAL** -- character selection (`v`)
- **VISUAL LINE** -- line selection (`V`)
- **VISUAL BLOCK** -- block selection (`Ctrl+V`)

### Common Motions

- `h`/`j`/`k`/`l` -- directional navigation
- `w`/`b` -- word forward/backward
- `0`/`$` -- line start/end
- `gg`/`G` -- file start/end
- `{`/`}` -- paragraph navigation

### Common Operations

- `dd` -- delete line
- `yy` -- yank (copy) line
- `p`/`P` -- paste after/before
- `u` -- undo
- `Ctrl+r` -- redo
- `/` -- search forward
- `?` -- search backward

## Architecture

```
apps/desktop/
├── electron/           # Electron main process
│   ├── main.ts         # Window management, app lifecycle
│   ├── preload.ts      # Context bridge (typed IPC API)
│   └── ipc-handlers.ts # IPC handler registration
├── src/
│   ├── App.tsx         # Root layout
│   ├── main.tsx        # React entry point
│   ├── components/     # UI components
│   │   ├── SQLEditor.tsx
│   │   ├── TabBar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ResultsPanel.tsx
│   │   ├── EnvironmentActions.tsx
│   │   ├── CommandPalette.tsx
│   │   └── SettingsPanel.tsx
│   ├── stores/         # Zustand state stores
│   │   ├── workspaceStore.ts
│   │   ├── environmentStore.ts
│   │   ├── editorStore.ts
│   │   └── settingsStore.ts
│   └── lib/            # Shared utilities
│       ├── api.ts      # IPC API wrapper
│       ├── types.ts    # Type definitions
│       └── query/      # TanStack Query hooks
└── packages/           # Monorepo packages
    ├── core/           # Backend logic (Docker, DB drivers)
    ├── shared/         # Shared types and errors
    └── ui/             # Design system components
```

## Tech Stack

- **Desktop**: Electron, Vite, vite-plugin-electron
- **Frontend**: React 19, TypeScript 6, Tailwind CSS 4
- **State**: Zustand (persisted), TanStack Query
- **Editor**: Monaco Editor, monaco-vim
- **Animation**: motion/react
- **Error Handling**: neverthrow (typed Results)
- **Testing**: Vitest, React Testing Library, Playwright
