# SPEC: shadniwind (github.com/deicod/shadniwind)
shadcn-style *source-distributed* UI components for React Native (iOS/Android) + React Native Web, built on react-native-unistyles v3, with an internal PortalHost overlay foundation (Option A).

This document is intended to be handed to an implementation agent to derive milestones/tasks.

---

## 0. Executive summary
shadniwind is a **static registry** of installable “items” (tokens, primitives, components) that are **copied as source files** into a consumer app (the shadcn/ui distribution model). Each installed component is editable in-app.

Target platforms from day 1:
- iOS + Android (React Native)
- Web (react-native-web / Expo Web)

Key constraints from Unistyles v3:
- Requires **New Architecture** and **React Native 0.78+**
- Expo requires **SDK 53+**
- Requires **react-native-nitro-modules** and **react-native-edge-to-edge**
- **Not supported on Expo Go**
- Not supported on old architecture (Fabric-only) :contentReference[oaicite:0]{index=0}

---

## 1. Goals
1) Provide a reusable UI system for new projects without Tailwind-className dependencies (Uniwind/NativeWind not required).
2) Unistyles-first styling:
   - themes + semantic tokens
   - variants/compound variants for component variants (variant/size/state)
   - web pseudo-states where applicable (hover/focus-visible) using Unistyles web facilities
3) Source distribution through a registry:
   - install = copy files + add npm deps
   - upgrade = reinstall items, review diffs
4) Cross-platform behavior:
   - consistent APIs across iOS/Android/Web
   - explicit caveats where parity is not feasible
5) Overlay foundation shipped early (PortalHost) to enable Dialog/Popover/Tooltip/Toast/Menu components.

---

## 2. Non-goals (initial)
- Pixel-perfect parity with shadcn/ui web implementation.
- Expo Go support (blocked by native code requirements). :contentReference[oaicite:1]{index=1}
- Supporting platforms outside iOS/Android/Web.
- Writing a new CLI (use shadcn registry support).

---

## 3. Assumptions / constraints
### 3.1 Runtime constraints (must be documented prominently)
- React Native: 0.78+ with New Architecture enabled. :contentReference[oaicite:2]{index=2}
- Expo: SDK 53+ and dev client / prebuild flow (no Expo Go). :contentReference[oaicite:3]{index=3}
- Unistyles initialization must happen **before application code creates stylesheets** (i.e., before any `StyleSheet.create` runs). :contentReference[oaicite:4]{index=4}

### 3.2 Distribution constraints
- Registry items must be installable into varied app structures.
- Installed code should not assume Tailwind, CSS variables, Next.js, or DOM-only APIs.

---

## 4. Definitions
- **Registry item**: a JSON document describing files + dependencies to be installed into a consumer project (shadcn registry-item.json schema). :contentReference[oaicite:5]{index=5}
- **Installed layout**: standard locations in consumer projects:
  - `lib/*` (tokens, unistyles init, primitives)
  - `components/ui/*` (UI components)
- **Tier**: complexity grouping used for roadmap and acceptance criteria.

---

## 5. System architecture
shadniwind consists of 3 layers.

### 5.1 Tokens & theme layer (installed first)
Provides:
- semantic tokens (colors/radius/typography/spacing)
- light/dark theme definitions
- Unistyles `StyleSheet.configure(...)` module
- TS module augmentation for Unistyles theme types

Deliverables (installed files):
- `lib/tokens.ts`
- `lib/unistyles.ts` (calls `StyleSheet.configure`)
- `lib/unistyles.d.ts`

Rules:
- `lib/unistyles.ts` must be imported exactly once at startup, before any other code that calls `StyleSheet.create`. :contentReference[oaicite:6]{index=6}

### 5.2 Primitives layer (cross-platform building blocks)
Primitives are stable internal APIs used by all advanced components. Platform differences use `.native.ts(x)` and `.web.ts(x)`.

Required primitives (minimum set):
- `portal` (Option A)
- `overlay` (dismiss layer, scrim, outside-press detection)
- `positioning` (anchor measurement + placement + collision handling)
- `focus` (focus trap/restore on web; minimal/no-op on native)
- `roving-focus` (keyboard navigation for menus/tabs/listbox on web)
- `scroll-lock` (web scroll lock; native best-effort)
- `press` utilities (compose handlers, pressed/disabled patterns)
- `a11y` utilities (role/aria prop mappings for RN Web)

### 5.3 Components layer
Public components, generally matching shadcn component names and prop conventions where sensible.

Each component must:
- use Unistyles `StyleSheet.create((theme) => ...)`
- define variants for `variant`, `size`, and relevant states (`disabled`, `focused`, `pressed`, `open`, etc.)
- have explicit platform notes when behavior differs.

---

## 6. Registry design & hosting
### 6.1 Hosting
- Static hosting via GitHub Pages.
- Endpoints:
  - `https://deicod.github.io/shadniwind/registry.json`
  - `https://deicod.github.io/shadniwind/r/{name}.json`

### 6.2 Registry schema
Registry items must follow the shadcn registry-item.json schema, including:
- `files[]` (with `path`, `type`, `content`)
- `dependencies[]` (npm deps)
- `registryDependencies[]` (other items to install) :contentReference[oaicite:7]{index=7}

### 6.3 Source-of-truth vs published artifacts
To avoid maintaining giant embedded JSON by hand:

Source-of-truth (typed TS/TSX files):
- `registry-src/shadniwind/lib/*`
- `registry-src/shadniwind/primitives/*`
- `registry-src/shadniwind/ui/*`

Generated artifacts (published):
- `public/registry.json`
- `public/r/*.json`

### 6.4 Registry generator
Provide `scripts/build-registry.ts` that:
1) reads item manifests (e.g., `registry-src/items/<name>.manifest.json`)
2) embeds file contents from `registry-src/shadniwind/**`
3) outputs `public/r/<name>.json` and updates `public/registry.json`

Validation:
- Validate generated JSON against schema (Ajv) using a pinned copy of schema (or validate against the official schema URL).
- CI fails if generation changes git-tracked outputs (dirty tree).

---

## 7. Consumer installation contract
### 7.1 components.json (consumer)
Consumers configure a registry namespace in `components.json` pointing to your `{name}.json` endpoint.

### 7.2 Required install order
1) `@shadniwind/tokens` (or `tokens`)
2) Import `lib/unistyles.ts` once at startup, before other imports that create stylesheets. :contentReference[oaicite:8]{index=8}
3) `@shadniwind/portal` (or `portal`)
4) Mount `PortalProvider` + a root `PortalHost` near the app root.

### 7.3 Expo / RN setup notes (must be in README)
- Unistyles requires RN 0.78+ and New Architecture; Expo SDK 53+; requires nitro-modules + edge-to-edge; not Expo Go. :contentReference[oaicite:9]{index=9}

---

## 8. Tokens & theming (spec)
### 8.1 Semantic token set (minimum)
Colors:
- background / foreground
- card / cardForeground
- popover / popoverForeground
- primary / primaryForeground
- secondary / secondaryForeground
- muted / mutedForeground
- accent / accentForeground
- destructive / destructiveForeground
- border / input / ring

Radius:
- sm / md / lg

Typography:
- font families (sans, mono)
- sizes (xs/sm/md/lg/xl)
- line heights
- weights (normal/medium/semibold/bold)

Spacing:
- `space(n)` helper (e.g., 4px scale) or explicit scale.

### 8.2 Themes
- Must include `light` and `dark` theme names to support adaptive theme mode. :contentReference[oaicite:10]{index=10}
- Adaptive themes enabled by default in configure.

---

## 9. Portal primitive (Option A) — specification
### 9.1 Public API
- `PortalProvider({ children })`
- `PortalHost({ name = "root" })`
- `Portal({ name = "root", children })`

### 9.2 Requirements
- Multiple hosts by name
- Multiple mounted nodes per host
- Updates propagate reliably
- Dismiss layers handled by higher primitives (overlay), not the portal itself
- Recommended root host placement: last in root tree, absolutely positioned, pointerEvents “box-none”.

---

## 10. Forms strategy (because shadcn lists Form + Field + Item)
shadcn lists:
- `Form`
- `Field`
- `Item`
and also separate docs for React Hook Form and TanStack Form. :contentReference[oaicite:11]{index=11}

shadniwind approach:
- `form-core`: purely presentational wrappers and consistent spacing/label/error display; no dependency on a form library.
- `form-rhf`: integration helpers and typed wrappers for React Hook Form (optional registry item).
- `form-tsf`: integration helpers for TanStack Form (optional registry item).

---

## 11. Quality and consistency rules (global)
- TypeScript strict.
- No DOM-only APIs in shared code; web-only code goes in `.web.ts(x)` or guarded behind platform checks.
- Prefer relative imports inside installed files (avoid alias dependency).
- Accessibility:
  - set appropriate `accessibilityRole`
  - on web, apply focus-visible ring styles (using Unistyles web pseudo support where available)
  - keyboard support for menus/listbox-like components on web.

---

## 12. CI / tooling requirements
- Node 20+ recommended.
- Lint + format (Biome or ESLint/Prettier, pick one).
- Typecheck.
- Registry build + schema validation.
- Optional: minimal render tests for Tier 1; unit tests for portal/positioning.

---

## 13. Versioning
- Publish registry paths with versioned roots:
  - `/v1/registry.json` and `/v1/r/{name}.json`
- Keep `/r/{name}.json` as “latest stable” pointing to v1 until a breaking v2 is introduced.

---

## 14. Milestones (high-level)
M0: Repo scaffold + registry generator + GitHub Pages
M1: tokens + unistyles init + portal
M2: Tier 1 component set complete (see Appendix A)
M3: Overlay primitives + first overlay components (Tooltip/Popover/Toast)
M4: Dialog family + Drawer/Sheet
M5+: Remaining catalog expansion (Select/Combobox/Menus/etc.)
M6+: Big feature components (Calendar/Date Picker/Data Table/Chart/Carousel)

---

## 15. Acceptance criteria (global)
1) Expo dev-client app (SDK 53+) installs tokens, imports unistyles init early, mounts PortalHost, and renders Tier 1 components.
2) Bare RN app does the same.
3) Web build renders Tier 1 components with visible focus indication and correct theming.
4) Registry artifacts are reproducible and schema-valid; CI fails if out of sync.
5) Each component item includes minimal docs: props, variants, platform caveats, and example usage.

---

# Appendix A: shadcn component catalog mapping (1:1 list)
Source list: shadcn Components page. :contentReference[oaicite:12]{index=12}

Legend for required primitives:
- T = tokens/unistyles init
- P = portal
- O = overlay (dismiss layer, scrim, outside-press)
- Pos = positioning (anchor, placement, collision)
- F = focus (trap/restore; web-first)
- RF = roving focus (keyboard navigation for menus/listbox)
- K = keyboard shortcuts (Esc, arrows, Enter, typeahead)
- G = gestures (drag/pan; native)
- V = virtualization (large lists/tables)
- W = web-first / web-only behavior

Tiers:
- Tier 1: simple, no portal/positioning required
- Tier 2: portal + basic overlay/positioning
- Tier 3: complex focus/keyboard/gestures/composition
- Tier 4: big feature components (data viz, complex widgets)

| Component (shadcn) | shadniwind item | Tier | Required | Platform notes / caveats |
|---|---:|:---:|---|---|
| Accordion | accordion | 2 | T, O, K (web), RF (web) | Native: implement as controlled collapsibles; Web: add keyboard semantics. |
| Alert Dialog | alert-dialog | 3 | T, P, O, F, K | Requires focus trap/restore on web; native uses modal-like behavior. |
| Alert | alert | 1 | T | Simple presentational container. |
| Aspect Ratio | aspect-ratio | 1 | T | Web: CSS aspect-ratio; native: layout trick with measured width/height. |
| Avatar | avatar | 1 | T | Image loading states; fallback initials. |
| Badge | badge | 1 | T | Pure presentational. |
| Breadcrumb | breadcrumb | 2 | T, K (web) | Web: links + aria-current; native: navigation integration left to consumer. |
| Button Group | button-group | 2 | T | Implement grouping + separators + consistent radii; optional roving focus on web. |
| Button | button | 1 | T | Pressed/disabled/loading variants; web focus-visible ring. |
| Calendar | calendar | 4 | T, K, RF | Web: rich keyboard nav; native: must decide grid implementation and locale formatting. |
| Card | card | 1 | T | Pure presentational. |
| Carousel | carousel | 4 | T, G, K (web) | Native gestures; web arrow keys; snapping; accessibility varies. |
| Chart | chart | 4 | T | Choose charting strategy (SVG-based cross-platform recommended); document limitations. |
| Checkbox | checkbox | 2 | T, K (web) | Native: Pressable + icon; Web: role/aria-checked + space toggle. |
| Collapsible | collapsible | 2 | T, K (web) | Similar to accordion but single-item. |
| Combobox | combobox | 3 | T, P, O, Pos, RF, K, F (web) | Hard: typeahead, listbox semantics, IME; native vs web differences must be documented. |
| Command | command | 3 | T, P, O, RF, K | Command palette pattern; web keyboard-first; native fallback acceptable. |
| Context Menu | context-menu | 3 | T, P, O, Pos, RF, K (web) | Web: right-click + keyboard; native: long-press trigger. |
| Data Table | data-table | 4 | T, V, K (web) | Likely web-first features; native table is “list”/“grid” approximation; document scope. |
| Date Picker | date-picker | 4 | T, P, O, Pos, K, RF | Native: may use platform picker or custom; web: calendar + input. |
| Dialog | dialog | 3 | T, P, O, F, K | Focus trap/restore on web; scroll lock. |
| Drawer | drawer | 3 | T, P, O, G, K (web) | Native pan gestures; web: slide-in + focus management. |
| Dropdown Menu | dropdown-menu | 3 | T, P, O, Pos, RF, K | Web semantics matter; native: press trigger. |
| Empty | empty | 1 | T | Empty-state component; content slots. |
| Field | field | 2 | T | Part of forms system; presentational wrapper (label/help/error). |
| Form | form-core (+ form-rhf / form-tsf) | 3 | T, K (web) | Core is presentational; integrations are optional items. |
| Hover Card | hover-card | 3 | T, P, O, Pos, K (web) | Web-first (hover/focus). Native fallback: press-and-hold or omit hover semantics. |
| Input Group | input-group | 2 | T | Addons, icons, button attachments; composition focus. |
| Input OTP | input-otp | 3 | T, K, F (web) | OTP UX differs by platform; must handle paste, autofill hints, numeric keyboard. |
| Input | input | 1 | T | Focus/disabled variants; web focus ring. |
| Item | item | 2 | T | Shadcn “FormItem”-like wrapper; part of form-core. |
| Kbd | kbd | 1 | T | Web-first; on native render as pill text. |
| Label | label | 2 | T | Web: label-for semantics not identical in RN; document recommended usage. |
| Menubar | menubar | 3 | T, P, O, RF, K, F (web) | Web-first (arrow navigation). Native may be limited and/or not shipped initially. |
| Native Select | native-select | 2 | T | Web: `<select>` style equivalent; native: platform picker. |
| Navigation Menu | navigation-menu | 4 | T, P, O, Pos, RF, K, F (web) | Web-first mega-menu behavior; native navigation is usually different—document as web-focused. |
| Pagination | pagination | 2 | T, K (web) | Provide headless + UI; consumer wires to data source/router. |
| Popover | popover | 3 | T, P, O, Pos, F (web), K | Core overlay primitive; anchor measurement and collision handling required. |
| Progress | progress | 1 | T | Determinate/indeterminate. |
| Radio Group | radio-group | 3 | T, RF, K (web) | Web: roving tab index; native: simple selection list. |
| Resizable | resizable | 4 | T, W | Web-first; native support likely “not supported” or very limited. |
| Scroll Area | scroll-area | 2 | T | Native uses ScrollView; web adds styled scrollbars optionally; document differences. |
| Select | select | 3 | T, P, O, Pos, RF, K, F (web) | Similar complexity to combobox; typeahead on web; native uses overlay list. |
| Separator | separator | 1 | T | Horizontal/vertical. |
| Sheet | sheet | 3 | T, P, O, F (web), K | A dialog variant; often right/left/bottom; can share with drawer. |
| Sidebar | sidebar | 4 | T, K (web) | Often layout + responsive behavior; provide building blocks rather than monolith. |
| Skeleton | skeleton | 1 | T | Animated shimmer optional; keep dependency-free if possible. |
| Slider | slider | 3 | T, G, K (web) | Native: gesture-driven; web: arrow keys and aria-valuenow semantics. |
| Sonner | sonner | 3 | T, P, O, K (web) | Toast system; queue, stacking, dismiss; “Sonner” name kept for parity. |
| Spinner | spinner | 1 | T | Simple activity indicator wrapper. |
| Switch | switch | 2 | T, K (web) | Web: role=switch; native: Pressable/animated knob. |
| Table | table | 2 (web) / 3 (native) | T, V | Web: real table-like rendering; native: list/grid approximation; document limitations. |
| Tabs | tabs | 3 | T, RF, K (web) | Web semantics; native simpler but keep consistent API. |
| Textarea | textarea | 1 | T | Wrap multiline TextInput. |
| Toast | toast | 3 | T, P, O, K (web) | If both Toast and Sonner exist, define Toast as low-level primitive and Sonner as system. |
| Toggle Group | toggle-group | 3 | T, RF, K (web) | Multi/single selection; roving focus on web. |
| Toggle | toggle | 2 | T | Pressable toggle; aria-pressed on web. |
| Tooltip | tooltip | 3 | T, P, O, Pos, K (web) | Web: hover/focus; native: long-press or press with delay. |
| Typography | typography | 1 | T | Text presets (h1–h6, p, small, muted, etc.). |

---

## Appendix B: Tier 1 “must ship” set (minimum viable catalog)
Tier 1 items recommended to complete before starting Tier 2/3 overlays:
- tokens, typography, button, button-group, input, textarea, input-group, label
- card, badge, alert, separator, avatar, skeleton, spinner, progress, empty
- (optional but high value) scroll-area, pagination

---

## Appendix C: Registry item naming conventions
- Namespace: `@shadniwind/<item>`
- Kebab-case item names matching component slug (e.g., `alert-dialog`, `radio-group`)
- Installed paths:
  - `lib/*` for tokens/primitives
  - `components/ui/*` for UI

---

## Appendix D: Hard requirements to place at top of README
- Unistyles v3 requires New Architecture + RN 0.78+; Expo SDK 53+; depends on nitro-modules and edge-to-edge; not Expo Go. :contentReference[oaicite:13]{index=13}
- Configure Unistyles before app code runs / before any `StyleSheet.create`. :contentReference[oaicite:14]{index=14}
