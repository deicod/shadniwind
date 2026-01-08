# Repository Guidelines

## Project Structure & Module Organization
- `registry-src/shadniwind/` contains source-distributed components, primitives, and shared libs used to build the registry.
- `registry-src/items/*.manifest.json` defines registry items and file mappings.
- `public/` holds generated registry artifacts (for GitHub Pages), including `registry.json`, `v1/`, and `r/`.
- `schemas/` contains JSON schemas used by registry tooling.
- `scripts/` contains build tooling like `build-registry.ts`.
- `tests/` contains Node tests (`*.test.ts`) for primitives.
- Planning notes live in `SPEC.md`, `TASKS.md`, and `RESEARCH.md`.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run lint`: run Biome linting across the repo.
- `npm run format`: format files with Biome.
- `npm run check`: run Biome lint + format + import organization.
- `npm run typecheck`: TypeScript typecheck (`tsc --noEmit`).
- `npm run build:registry`: generate registry artifacts into `public/`.
- `npm test`: run `node --test` with the `tsx` loader on `tests/**/*.test.ts`.

## Coding Style & Naming Conventions
- Formatting is enforced by Biome: 2-space indentation, double quotes, trailing commas, and semicolons as needed.
- Use TypeScript and ES modules; prefer explicit imports and typed exports.
- Match file naming patterns: React components in PascalCase (e.g., `PortalHost.tsx`), utilities or stores in kebab-case (e.g., `portal-store.ts`).
- Use Unistyles v3 API only: `StyleSheet.create` + `styles.useVariants`; do not use `createStyleSheet`/`useStyles` (v2).

## Testing Guidelines
- Use the built-in `node:test` runner with `assert` as shown in `tests/`.
- Name tests `*.test.ts` and keep them in `tests/`.
- Run `npm test` locally before opening a PR.

## Commit & Pull Request Guidelines
- Git history only shows `init`, so no formal commit convention is established; use concise, imperative subjects (e.g., "add portal store tests").
- PRs should include a brief description, the commands run (lint/typecheck/test), and any relevant context.
- If you modify `registry-src/` or `schemas/`, run `npm run build:registry` and commit updated `public/` artifacts; CI fails if the working tree is dirty after the build.
