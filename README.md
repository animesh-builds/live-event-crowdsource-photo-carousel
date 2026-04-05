# Event Photo Carousel

A real-time, crowdsourced photo display system for live events — built on a zero-infrastructure architecture using Google's ecosystem as a managed backend.

Solves the fragmented event photo problem: guests capture moments on personal devices, share them across 5 different platforms (or not at all), and the host ends up with 20% of the photos that were actually taken. This system centralizes ingestion via a QR-driven upload flow and renders a cinematic, auto-refreshing carousel for ambient display.

---

## System Design

The architecture makes an unconventional choice: **Google Drive as the persistence layer, Google Forms as the ingestion API, and a Next.js edge function as the read-through cache.** No database. No file upload endpoint. No auth server. The entire write path is offloaded to Google's infrastructure.

This isn't laziness — it's a deliberate constraint-driven design decision. See [Architecture Decision Records](docs/architecture.md) for the full tradeoff analysis.

```
                    ┌─────────────────────────────────────────┐
                    │          INGESTION PIPELINE              │
                    │                                         │
                    │  QR Code ──▶ Google Form ──▶ Drive      │
                    │  (placard)   (file upload)   (folder)   │
                    │                                         │
                    │  ● No app install                       │
                    │  ● No account creation                  │
                    │  ● No server-side upload handling       │
                    │  ● Automatic virus scanning (Google)    │
                    └──────────────────┬──────────────────────┘
                                       │
                            Drive API v3 (recursive)
                            ┌──────────┼──────────┐
                            │  Timeout │  Depth   │
                            │  8s/req  │  max 3   │
                            │  allSettled()        │
                            └──────────┼──────────┘
                                       │
                    ┌──────────────────▼──────────────────────┐
                    │          DISPLAY PIPELINE                │
                    │                                         │
                    │  API Route ──▶ Stale Cache ──▶ Client   │
                    │  (proxy)      (SWR pattern)   (hook)   │
                    │                                         │
                    │  ● Server-side key isolation            │
                    │  ● Graceful degradation on failure      │
                    │  ● Soft refresh (no positional reset)   │
                    │  ● Exponential backoff retry            │
                    └─────────────────────────────────────────┘
```

### Key Engineering Decisions

**Recursive folder traversal with partial failure tolerance.** Google Forms creates unpredictable subfolder structures per response. The fetcher walks the tree up to depth 3 using `Promise.allSettled` — a single poisoned subfolder (permissions changed, deleted mid-fetch, timeout) never crashes the entire tree. Each folder fetch has an independent 8-second timeout via `AbortController`.

**Deterministic visual hashing.** Photo card rotation angles (-3° to +3°) and mosaic heights are derived from a stable hash of the Drive file ID — not `Math.random()`. This eliminates hydration mismatches in SSR, prevents layout shifts on re-render, and ensures visual consistency across refresh cycles.

**Stale-while-revalidate caching at two layers.** The Next.js API route uses `revalidate: 300` for server-side response caching. An in-memory cache in the route handler serves last-known-good data when the Drive API is unreachable. The client hook adds a third layer — it only reshuffles the carousel when `incoming.length !== current.length`, preventing positional disruption for viewers mid-scroll.

**CSS keyframe animation over JavaScript animation loops.** The infinite carousel scroll runs entirely on the compositor thread — `translateX` transforms are GPU-accelerated and don't trigger layout or paint. Three rows at different speeds (28s, 40s, 65s) and alternating directions create a parallax depth illusion.

---

## Fault Tolerance Model

```
Scenario                          Behavior
─────────────────────────────     ──────────────────────────────────
Drive API returns 200             Cache updated, carousel refreshed
Drive API returns 4xx/5xx         Stale cache served, UI unchanged
Drive API times out               Stale cache served, retry scheduled
Network fully offline             Last-known photos persist in memory
Single subfolder fails             Other subfolders still load
Image CDN returns broken image    Card silently removed from DOM
localStorage unavailable          In-memory session fallback for auth
GOOGLE_DRIVE_FOLDER_ID missing    Stale cache if available, else error UI
Empty folder (no photos yet)      Branded empty state with upload CTA
```

---

## Theme Engine

Four pre-built palettes, each designed for different lighting and ambiance conditions. Themes are injected as CSS custom properties at the layout level — every component consumes `var(--color-*)`, zero hardcoded values anywhere in the component tree.

| Key | Character | Background | Grain |
|---|---|---|---|
| `midnight` | Dark, warm, cinematic | `#1C0F0A` burnt umber | Yes |
| `golden` | Rich amber, celebratory | `#141200` deep sepia | Yes |
| `garden` | Deep violet, creative | `#080612` near-black indigo | Yes |
| `minimal` | Light, modern, clean | `#F5EDE0` warm off-white | No |

The atmospheric layer (animated bokeh circles + SVG fractal noise grain) adapts to the active theme. Bokeh colors are pulled from the theme definition. Grain is conditionally rendered based on a `grain: boolean` flag — disabled for light themes where it looks muddy.

All bokeh circle positions, sizes, and animation durations are **deterministic constants** — no runtime randomness, fully SSR-safe.

---

## Documentation

| Document | What it covers |
|---|---|
| [Architecture & ADRs](docs/architecture.md) | System design, tradeoff analysis, rejected alternatives, security model |
| [Product Requirements](docs/prd.md) | Scope, constraints, non-goals, decisions log, backlog |
| [Design Language](docs/design_language.md) | Theme system, typography rationale, component specs, animation contracts |
| [Integration Guide](docs/setup_guide.md) | Google Cloud configuration, Drive API scoping, deployment topology |

---

## Stack

Next.js 14 (App Router) · TypeScript strict · Tailwind CSS · Framer Motion · CSS Keyframes · Google Drive API v3 · qrcode.react · Vercel Edge

---

## License

MIT
