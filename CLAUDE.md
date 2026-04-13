# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm install          # Install dependencies
npm start            # Dev server (react-scripts start)
npm run build        # Production build
npm run type-check   # TypeScript type checking (tsc --noEmit)
npm run lint         # Lint with ESLint
npm run lint:fix     # Auto-fix lint issues
npm run format       # Format with Prettier
npm test             # Run tests (Jest via react-scripts)
npm test -- --watchAll=false  # Run tests once (non-interactive)
```

## Architecture

**Tech stack**: React 18 + TypeScript + Create React App, Leaflet/react-leaflet for interactive maps, OpenStreetMap tiles.

**Data flow**: Friend data lives in `src/data/friends.json` (static import). A `friends.example.json` is provided as a template. `friends.json` is in `.gitignore` — it's the user's private data and should not be committed.

**Core types** (`src/types/index.ts`): `Friend` (id, name, province, city, address?, latitude, longitude, avatar?, description?), `MapBounds`, `MapViewport`, `MapRef`.

**Map component**: `MapView` (`src/components/MapView.tsx`) is a unified map component that renders both world and china views via props (`mapType`, `viewport`). It uses `forwardRef` + `useImperativeHandle` to expose a `flyTo(lat, lng, zoom)` method. Markers use custom `L.divIcon` (avatar circles) with HTML-escaped content to prevent XSS. `FriendInfo` popup shows on marker click. Map bounds and default viewports are defined in `src/utils/mapUtils.ts`.

**State management** (all custom hooks, no external state library):
- `useStorage` — generic localStorage/sessionStorage hook with cross-tab sync (uses ref to avoid stale closures)
- `useUserPreferences` — wraps `useStorage` for theme, mapType, language, autoSave
- `useTheme` — light/dark theme via CSS custom properties on `<html>`
- `useFriendsFilter` — search + region filtering with debounced search input
- `useMapNavigation` — holds refs to both map instances, provides `flyToFriend`
- `useKeyboardShortcuts` — global keyboard shortcuts
- `usePerformance` — dev-only render count monitoring and memory/network monitoring
- `useDebounce` — generic debounce hook

**App layout** (`App.tsx`): Header with map toggle (world/china), collapsible sidebar with search/region-filter/friend-list, main area renders `MapView` with the active map type's viewport. `SettingsPanel` is a modal overlay.

## Key Conventions

- The `homepage` field in `package.json` is empty (no public path prefix for GitHub Pages).
- CI/CD pipeline (`.github/workflows/ci-cd.yml`) runs type-check, lint, test, and build on push to `master`/`develop`. Deploys to GitHub Pages from `master` using `peaceiris/actions-gh-pages`.
- Map marker icons fix a known Leaflet issue by deleting `_getIconUrl` and setting CDN URLs manually.
- Region filtering is province-based. Search matches against name, city, province, and address fields.
- `friend.name` and other user data must be escaped with `escapeHtml()` from `mapUtils.ts` before use in HTML template strings (XSS prevention).
- Theme uses CSS custom variables defined in `:root` and `[data-theme="dark"]` selectors. No hardcoded colors in card/overlay components.
