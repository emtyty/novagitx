# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (renderer HMR + Electron)
npm run build     # Production build → out/
npm run pack      # Package app without publishing
npm run dist      # Create distributable (dmg/zip)
```

There is no separate lint or test script. TypeScript errors surface via `npm run build`. ESLint is installed (`eslint`, `typescript-eslint`) but has no dedicated npm script — run `npx eslint src/` directly.

**Important:** `npm run dev` only hot-reloads the renderer. Any change to `src/main/` or `src/preload/` requires killing and restarting the dev server to take effect.

## Architecture

This is an Electron app built with `electron-vite`. There are three isolated processes:

```
src/main/       → Node.js / Electron main process
src/preload/    → Context bridge (runs in renderer context but has Node access)
src/renderer/   → React SPA (no Node access — communicates only via window.git)
```

### Adding a new git operation — the 5-file chain

Every git feature threads through these files in order:

1. **`src/main/ipc/channels.ts`** — add a string constant (e.g. `FOO_BAR: 'git:foo:bar'`)
2. **`src/main/ipc/handlers.ts`** — register `ipcMain.handle(CHANNELS.FOO_BAR, ...)`; calls `GitModule` methods
3. **`src/preload/index.ts`** — expose via `contextBridge`: `ipcRenderer.invoke(CHANNELS.FOO_BAR, ...)`
4. **`src/renderer/api/git.ts`** — add typed wrapper on `window.git.*`; also update the `Window` interface declaration at the top
5. **`src/renderer/hooks/useRepo.ts`** — add `useQuery` / `useMutation` wrapping `gitApi.*`

Skipping any link in this chain causes a "No handler registered" error at runtime.

### Git layer (`src/main/git/`)

`GitModule` is the public API — all IPC handlers instantiate or call it. Internally it delegates to single-responsibility classes:

- **`GitExecutor`** — spawns `git` subprocess, returns `{ stdout, stderr, exitCode }`. Always sets `GIT_TERMINAL_PROMPT=0` and `LANG=en_US.UTF-8`.
- **`RevisionReader`** — parses `git log -z` with NUL-delimited records into `GitRevision[]`
- **`RefResolver`** — parses `git for-each-ref` into `RefGroups`; also attaches refs to revisions and marks HEAD
- **`GraphBuilder`** — assigns `branchLane` and `lanes[]` to revisions for graph rendering
- **`StatusParser`** — parses `git status --porcelain=v1 -z`
- **`DiffParser`** — parses unified diff output into `DiffFile[]` with typed `DiffLine[]`

When adding a new git operation, add the method to `GitModule` and call an existing parser or run `this.executor.run(...)` directly.

### Type duplication

Types are defined in **two places** and must stay in sync:

- `src/main/git/types.ts` — used in Node/main process
- `src/renderer/types/git.ts` — used in renderer; identical shape, no imports from main

### Renderer state management

- **React Query** (`@tanstack/react-query`) — all server/git state. Query keys follow the pattern `['log', repoPath]`, `['refs', repoPath]`, `['status', repoPath]`, etc. After mutations, call `qc.invalidateQueries(...)` for the affected keys.
- **Zustand** (`src/renderer/store/repoStore.ts`) — only for client-side UI state: the active `RepoInfo` and `recentRepos` list. Persisted to localStorage.

### UI conventions

- **`src/renderer/components/ui/`** — shadcn/ui primitives (Radix-based). Do not modify these; treat as a library.
- **`src/renderer/components/git/`** — custom git-specific components. New features go here.
- Tailwind only. CSS variables for theming are in `src/renderer/index.css`. Custom colors (`window`, `titlebar`, `graph-*`, `diff-add`, `diff-del`) are defined in `tailwind.config.ts`.
- Layout constraint: the main panel must fit `h-screen overflow-hidden`. Every scrollable area needs `overflow-y-auto` on the scrolling element and `min-h-0` (or `overflow-hidden`) on all flex/grid ancestors up to the viewport.
- Scrollbar styling uses the `scrollbar-mac` utility class.

### IPC module cache

`src/main/ipc/handlers.ts` caches `GitModule` instances in a `Map<string, GitModule>` keyed by repo path. The `getModule(repoPath)` helper handles lazy instantiation — use it in every handler.
