<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# jobinit-judge

Complementary annotation/evaluation platform for JobInit. Separate repo, separate Supabase project — architecturally unconnected to the main JobInit app. Domain expert (Shraddha) reviews and judges JobInit's AI outputs here.

This file grows through iteration, not upfront planning. Add a rule here only once a real mistake in a session justifies it — don't pre-write rules for problems that haven't happened yet.

## Stack

- Next.js (App Router), TypeScript, Tailwind v4
- shadcn/ui, Nova preset as starting scaffold — all color/font tokens overridden with real project values in `globals.css`, do not reintroduce Nova defaults
- Font: Inter (`--font-sans`). `Card-Content-Row` labels use `Courier New` via `font-mono`.
- Icons: Lucide

## Commands

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run lint` — lint
- `npm run test:e2e` (or `npx playwright test`) — Playwright test suite in `tests/`; also this repo's only unit-test mechanism. Pure-function tests (e.g. `lib/stages.ts` predicates) are plain `test()` blocks that omit the `page` fixture, run via the same command as the browser-driven specs — there's no separate unit-test runner.

## Backend

Supabase is a committed part of this project — not yet implemented. Case data will be manually curated from JobInit (no live sync, no shared database access between the two apps). **Do not scaffold Supabase client code, tables, or auth unless explicitly instructed** — nothing about current ticket work requires it; all current tickets use hardcoded data.

## Workflow

- Work is tracked as GitHub Issues, one ticket per issue. Each ticket contains its own Structural Facts, States, Interaction behavior, Data shape, and Acceptance criteria — read the full ticket before starting.
- Several components are shared primitives built once and reused across tickets: `TextField`, `StatusPill`/`TogglePill` (tone-driven vs. selection-driven pill variants, split from a shared unexported structural base in `components/blind-call/Pill.tsx` — that base is deliberately not exported, so it can't be rendered directly, unstyled, from elsewhere), `NavDot`/`NavDotStrip`, `CarouselShell`. Check whether a primitive already exists before building a new one for the same job.
- `CarouselShell` wraps all multi-stage flows. Each stage supplies its own `isComplete(): boolean` — `CarouselShell` never needs to know why a stage is complete, only the result. Don't special-case stage logic inside `CarouselShell` itself.
- Same seam, one level down: a field's own "is this filled/valid" rule is colocated with the component that owns that field, not collapsed into the stage's aggregate `isComplete()`. A stage-level function (e.g. `isJDStageComplete` in `lib/stages.ts`) should only compose already-computed field-level predicates — deciding *how* they combine (AND/OR/etc.) is the one thing the stage genuinely knows that no single field does. Field predicates without a component home yet (real inputs not built) live in `lib/stages.ts` as an interim spot — move them to their component when it's built.

## Boundaries

- ✅ **Always:** Reference CSS variables (`bg-primary`, `text-muted-foreground`, etc.) for color — never a hardcoded hex value, anywhere.
- ✅ **Always:** Pair any visually-disabled element (`opacity`) with a real functional disabled state (`disabled` / `aria-disabled` / `pointer-events: none`). Dimming alone is not disabling.
- ✅ **Always:** If content is visually hidden but should remain available to screen readers (e.g. a label shown only in one state), use a visually-hidden pattern (`sr-only`) or `aria-label` — never `display: none`, which removes it from the accessibility tree entirely, not just the layout.
- 🚫 **Never:** Scaffold backend/Supabase code without explicit instruction (see Backend above).
- 🚫 **Never:** Commit secrets or API keys.