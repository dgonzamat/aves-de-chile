# CLAUDE.md — aves-de-chile

## Project Overview

A React application for exploring Chilean bird species using data from the iNaturalist API. Users can browse birds by catalog, region, taxonomic family, or interactive map. Deployed to GitHub Pages and Netlify.

**Live site:** https://dgonzamat.github.io/aves-de-chile/

## Tech Stack

- **React 18** with **TypeScript 5** (strict mode)
- **Vite 5** — build tool and dev server
- **Tailwind CSS 3** — styling (utility-first)
- **Leaflet** — interactive maps
- **Vitest** + **@testing-library/react** — testing
- **ESLint** — linting (flat config)
- **date-fns** — date formatting
- **DOMPurify** — HTML sanitization for Wikipedia content
- **Lucide React** — icons

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + Vite production build |
| `npm run lint` | Run ESLint (zero warnings allowed) |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:ui` | Interactive Vitest UI dashboard |
| `npm run test:coverage` | Single run with code coverage |
| `npm run preview` | Preview production build locally |

**Install dependencies:** `npm install --legacy-peer-deps`

## Project Structure

```
src/
├── components/           # React components (PascalCase filenames)
│   ├── __tests__/        # Component tests (*.test.tsx)
│   ├── App.tsx           # Not here — App.tsx is in src/ root
│   ├── BirdCard.tsx      # Bird card in grid view
│   ├── BirdDetails.tsx   # Full detail overlay for a species
│   └── ...               # Other UI components
├── services/
│   ├── iNaturalistApi.ts # API client (singleton class)
│   └── __tests__/        # Service tests + mocks/
├── types/
│   └── index.ts          # TypeScript interfaces (Bird, BirdDetails, Filters)
├── test/
│   └── setup.ts          # Vitest setup (auto-cleanup)
├── App.tsx               # Main app component (state, tabs, filters)
├── main.tsx              # Entry point with Error Boundary
├── constants.ts          # Regions, months, sorting options
└── index.css             # Global styles + Tailwind layers
```

## Architecture

### Data Flow

1. **iNaturalistApi** (singleton) fetches from `https://api.inaturalist.org/v1`
2. Responses are validated (must have taxon, photos, coordinates) and transformed into `Bird`/`BirdDetails` types
3. Region assignment: computed from coordinates using closest-region Euclidean distance
4. **App.tsx** manages all state via `useState`/`useEffect` — no external state library
5. Details are cached in a `useRef` map to avoid re-fetching

### Key Data Constants

- Chile Place ID: `7182`
- Geographic bounds: Lat -56.0 to -17.5, Lng -75.0 to -66.0
- 16 Chilean regions defined in `constants.ts`

### API Handling

- No authentication required for iNaturalist API
- Built-in retry with exponential backoff for 429 (rate limit) responses
- Debounced search/filter inputs (300ms)
- Pagination: 50 results per page

### UI Tabs

1. **Catalog** — paginated grid of bird cards
2. **Regions** — filter by Chilean region
3. **Families** — filter by taxonomic family
4. **Map** — Leaflet map with observation markers

## Conventions

### Naming

- **Components:** PascalCase files and exports (`BirdCard.tsx`)
- **Types/Interfaces:** PascalCase, singular (`Bird`, `Filters`)
- **Constants:** SCREAMING_SNAKE_CASE (`REGIONES_CHILE`, `MESES`)
- **Services:** camelCase files (`iNaturalistApi.ts`)

### TypeScript

- Strict mode enabled — no `any` types
- `noUnusedLocals` and `noUnusedParameters` enforced
- All component props defined as interfaces
- Target: ES2020

### Styling

- Tailwind CSS utilities as the primary styling method
- Custom CSS in `index.css` using `@layer components`
- CSS custom properties for theming (`--color-primary`, `--card-shadow`)
- Custom animations: `fade-in`, `slide-up`, `spin-slow`
- Font: Plus Jakarta Sans (Google Fonts)
- Responsive breakpoints: `sm`/`md`/`lg`

### Testing

- Test files colocated in `__tests__/` directories next to source
- Naming: `*.test.tsx` for components, `*.test.ts` for services
- Mock `global.fetch` for API tests
- Mock data in `services/__tests__/mocks/responses.ts`
- Use `describe()` blocks for grouping, test edge cases (missing photos, API errors, rate limits)

### Components

- Use `React.memo` for card-like components
- Images use `loading="lazy"` and `srcSet` for responsive sizing
- Error Boundary wraps the entire app in `main.tsx`
- Detail views are full-screen overlays

## Deployment

### GitHub Actions (`.github/workflows/deploy.yml`)

- Triggers on push to `main` or manual dispatch
- Node 20, `npm install --legacy-peer-deps`, `npm run build`
- Copies `dist/index.html` to `dist/404.html` for SPA routing
- Deploys to both gh-pages branch and GitHub Actions Pages

### Netlify (`netlify.toml`)

- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect: all routes → `/index.html`

### Vite Base Path

- Configured as `/aves-de-chile/` in `vite.config.ts` for GitHub Pages

## Common Tasks

### Adding a new component

1. Create `src/components/MyComponent.tsx` (PascalCase)
2. Define props interface at the top of the file
3. Add tests in `src/components/__tests__/MyComponent.test.tsx`
4. Style with Tailwind utilities

### Modifying API calls

1. Edit `src/services/iNaturalistApi.ts`
2. Update types in `src/types/index.ts` if the data shape changes
3. Update or add tests in `src/services/__tests__/`
4. The API client handles rate limiting automatically

### Adding a new filter

1. Add the filter option to `src/constants.ts`
2. Update the `Filters` type in `src/types/index.ts`
3. Wire it into `App.tsx` state and pass to the API service

## Gotchas

- **`--legacy-peer-deps`** is required for `npm install` due to peer dependency conflicts
- **ESLint uses zero-warning policy** — `--max-warnings 0` means any warning fails the lint
- **Base path** — all assets must work under `/aves-de-chile/` prefix
- **iNaturalist rate limits** — the API service handles 429s automatically, but avoid making excessive parallel requests
- **Region assignment** is computed client-side from coordinates, not from the API
