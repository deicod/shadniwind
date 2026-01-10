# TASKS: shadniwind

Task tracking for shadniwind implementation based on [SPEC.md](./SPEC.md).

This document is structured for **concurrent multi-agent implementation**. Tasks are organized into waves where all tasks within a wave can be executed in parallel once their dependencies are satisfied.

---

## Dependency Legend

```
[BLOCKER]     = This task blocks other tasks; complete first
[DEP: X]      = Depends on task/group X being completed
[PARALLEL]    = Can be done in parallel with sibling tasks
[INDEPENDENT] = No dependencies within its wave
```

---

## Wave 0: Foundation (Sequential Bootstrap)

> **Agents: 1** | These tasks are sequential and must be done first by a single agent.

### 0.1 Repository Bootstrap [BLOCKER]
- [x] Initialize git repository
- [x] Create package.json with project metadata
- [x] Configure TypeScript (tsconfig.json) with strict mode
- [x] Setup Biome for linting and formatting
- [x] Create .gitignore
- [x] Create directory structure:
  - [x] `registry-src/shadniwind/lib/`
  - [x] `registry-src/shadniwind/primitives/`
  - [x] `registry-src/shadniwind/ui/`
  - [x] `registry-src/items/`
  - [x] `public/`
  - [x] `public/r/`
  - [x] `scripts/`

---

## Wave 1: Core Infrastructure (3 Parallel Streams)

> **Agents: 3** | After Wave 0 completes, these 3 work streams can proceed in parallel.

### Stream 1A: Registry Generator [DEP: 0.1] [BLOCKER for all components]
- [x] Create `scripts/build-registry.ts`
- [x] Implement manifest reading from `registry-src/items/<name>.manifest.json`
- [x] Implement file content embedding from `registry-src/shadniwind/**`
- [x] Generate `public/r/<name>.json` for each item
- [x] Generate `public/registry.json` index
- [x] Add JSON schema validation (Ajv)
- [x] Add versioned paths (`/v1/registry.json`, `/v1/r/{name}.json`)

### Stream 1B: CI/CD Pipeline [DEP: 0.1] [PARALLEL]
- [x] Setup GitHub Actions workflow
- [x] Add lint check step
- [x] Add typecheck step
- [x] Add registry build step
- [x] Add schema validation step
- [x] Add dirty tree check (fail if generated outputs changed)
- [x] Configure GitHub Pages deployment

### Stream 1C: Documentation [DEP: 0.1] [PARALLEL]
- [x] Create README.md with hard requirements (RN 0.78+, Expo SDK 53+, New Arch, etc.)
- [x] Document installation contract and required install order
- [x] Document components.json consumer configuration

---

## Wave 2: Tokens & Portal (2 Parallel Streams)

> **Agents: 2** | After Stream 1A (Registry Generator) completes.

### Stream 2A: Tokens & Theme Layer [DEP: 1A] [BLOCKER for all components]
- [x] Create `lib/tokens.ts` with semantic token set:
  - [x] Colors (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring)
  - [x] Radius (sm, md, lg)
  - [x] Typography (font families, sizes, line heights, weights)
  - [x] Spacing (space helper or explicit scale)
- [x] Create `lib/unistyles.ts` with `StyleSheet.configure(...)` call
- [x] Create `lib/unistyles.d.ts` for TypeScript module augmentation
- [x] Define `light` and `dark` themes
- [x] Enable adaptive themes by default
- [x] Create manifest: `registry-src/items/tokens.manifest.json`

### Stream 2B: Portal Primitive [DEP: 1A] [BLOCKER for overlay components]
- [x] Create `primitives/portal/PortalProvider.tsx`
- [x] Create `primitives/portal/PortalHost.tsx`
- [x] Create `primitives/portal/Portal.tsx`
- [x] Create `primitives/portal/index.ts` exports
- [x] Implement multiple hosts by name
- [x] Implement multiple mounted nodes per host
- [x] Ensure updates propagate reliably
- [x] Add recommended root host placement (absolute, pointerEvents "box-none")
- [x] Create manifest: `registry-src/items/portal.manifest.json`
- [x] Write unit tests for portal primitive

---

## Wave 3: Tier 1 Components (15 Parallel Streams)

> **Agents: Up to 15** | After Stream 2A (Tokens) completes. All Tier 1 components are independent.

### 3.1 Typography [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/typography.tsx` with text presets (h1-h6, p, small, muted, etc.)
- [x] Add Unistyles variants
- [x] Create manifest: `registry-src/items/typography.manifest.json`

### 3.2 Button [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/button.tsx`
- [x] Implement variants: variant, size
- [x] Implement states: pressed, disabled, loading
- [x] Add web focus-visible ring
- [x] Create manifest: `registry-src/items/button.manifest.json`

### 3.3 Input [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/input.tsx`
- [x] Implement focus/disabled variants
- [x] Add web focus ring
- [x] Create manifest: `registry-src/items/input.manifest.json`

### 3.4 Textarea [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/textarea.tsx` (multiline TextInput wrapper)
- [x] Create manifest: `registry-src/items/textarea.manifest.json`

### 3.5 Card [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/card.tsx` (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- [x] Create manifest: `registry-src/items/card.manifest.json`

### 3.6 Badge [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/badge.tsx`
- [x] Implement variant styles
- [x] Create manifest: `registry-src/items/badge.manifest.json`

### 3.7 Alert [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/alert.tsx`
- [x] Implement variant styles (default, destructive)
- [x] Create manifest: `registry-src/items/alert.manifest.json`

### 3.8 Separator [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/separator.tsx`
- [x] Support horizontal/vertical orientation
- [x] Create manifest: `registry-src/items/separator.manifest.json`

### 3.9 Avatar [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/avatar.tsx`
- [x] Implement image loading states
- [x] Implement fallback initials
- [x] Create manifest: `registry-src/items/avatar.manifest.json`

### 3.10 Skeleton [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/skeleton.tsx`
- [x] Optional animated shimmer (dependency-free)
- [x] Create manifest: `registry-src/items/skeleton.manifest.json`

### 3.11 Spinner [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/spinner.tsx` (activity indicator wrapper)
- [x] Create manifest: `registry-src/items/spinner.manifest.json`

### 3.12 Progress [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/progress.tsx`
- [x] Support determinate/indeterminate modes
- [x] Create manifest: `registry-src/items/progress.manifest.json`

### 3.13 Empty [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/empty.tsx` (empty-state component with content slots)
- [x] Create manifest: `registry-src/items/empty.manifest.json`

### 3.14 Aspect Ratio [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/aspect-ratio.tsx`
- [x] Web: CSS aspect-ratio
- [x] Native: layout trick with measured width/height
- [x] Create manifest: `registry-src/items/aspect-ratio.manifest.json`

### 3.15 Kbd [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/kbd.tsx`
- [x] Web-first; native render as pill text
- [x] Create manifest: `registry-src/items/kbd.manifest.json`

---

## Wave 4: Overlay Primitives (7 Parallel Streams)

> **Agents: Up to 7** | After Stream 2B (Portal) completes. All primitives are independent.

### 4.1 Overlay Primitive [DEP: 2B] [INDEPENDENT]
- [x] Create `primitives/overlay/index.tsx`
- [x] Implement dismiss layer
- [x] Implement scrim/backdrop
- [x] Implement outside-press detection
- [x] Platform-specific files (`.native.tsx`, `.web.tsx`) as needed
- [x] Create manifest

### 4.2 Positioning Primitive [DEP: 2B] [INDEPENDENT]
- [x] Create `primitives/positioning/index.tsx`
- [x] Implement anchor measurement
- [x] Implement placement (top, bottom, left, right, etc.)
- [x] Implement collision handling
- [x] Platform-specific files as needed
- [x] Create manifest

### 4.3 Focus Primitive [DEP: 2A] [INDEPENDENT]
- [x] Create `primitives/focus/index.tsx`
- [x] Web: focus trap and restore
- [x] Native: minimal/no-op implementation
- [x] Create `.web.tsx` and `.native.tsx` variants
- [x] Create manifest

### 4.4 Roving Focus Primitive [DEP: 2A] [INDEPENDENT]
- [x] Create `primitives/roving-focus/index.tsx`
- [x] Web: keyboard navigation for menus/tabs/listbox
- [x] Native: simplified or no-op
- [x] Create manifest

### 4.5 Scroll Lock Primitive [DEP: 2A] [INDEPENDENT]
- [x] Create `primitives/scroll-lock/index.tsx`
- [x] Web: scroll lock implementation
- [x] Native: best-effort implementation
- [x] Create manifest

### 4.6 Press Utilities [DEP: 2A] [INDEPENDENT]
- [x] Create `primitives/press/index.tsx`
- [x] Compose handlers utility
- [x] Pressed/disabled patterns
- [x] Create manifest

### 4.7 A11y Utilities [DEP: 2A] [INDEPENDENT]
- [x] Create `primitives/a11y/index.tsx`
- [x] Role/aria prop mappings for RN Web
- [x] Create manifest

---

## Wave 5: Simple Tier 2 Components (13 Parallel Streams)

> **Agents: Up to 13** | After Wave 2A (Tokens) completes. These don't need overlay primitives.

### 5.1 Checkbox [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/checkbox.tsx`
- [x] Native: Pressable + icon
- [x] Web: role/aria-checked + space toggle
- [x] Create manifest

### 5.2 Switch [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/switch.tsx`
- [x] Web: role=switch
- [x] Native: Pressable/animated knob
- [x] Create manifest

### 5.3 Toggle [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/toggle.tsx`
- [x] aria-pressed on web
- [x] Create manifest

### 5.4 Label [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/label.tsx`
- [x] Document web label-for semantics differences in RN
- [x] Create manifest

### 5.5 Collapsible [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/collapsible.tsx`
- [x] Single-item accordion
- [x] Create manifest

### 5.6 Scroll Area [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/scroll-area.tsx`
- [x] Native: ScrollView wrapper
- [x] Web: styled scrollbars optional
- [x] Create manifest

### 5.7 Pagination [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/pagination.tsx`
- [x] Headless + UI components
- [x] Consumer wires to data source/router
- [x] Create manifest

### 5.8 Breadcrumb [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/breadcrumb.tsx`
- [x] Web: links + aria-current
- [x] Native: navigation integration left to consumer
- [x] Create manifest

### 5.9 Native Select [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/native-select.tsx`
- [x] Web: `<select>` style equivalent
- [x] Native: platform picker
- [x] Create manifest

### 5.10 Table [DEP: 2A] [INDEPENDENT]
- [x] Create `ui/table.tsx`
- [x] Web: real table-like rendering
- [x] Native: list/grid approximation
- [x] Document limitations
- [x] Create manifest

### 5.11 Button Group [DEP: 3.2] [INDEPENDENT]
- [x] Create `ui/button-group.tsx`
- [x] Grouping + separators + consistent radii
- [x] Optional roving focus on web
- [x] Create manifest

### 5.12 Input Group [DEP: 3.3] [INDEPENDENT]
- [x] Create `ui/input-group.tsx`
- [x] Addons, icons, button attachments
- [x] Create manifest

### 5.13 Form Core [DEP: 2A, 5.4] [INDEPENDENT]
- [x] Create `ui/form-core.tsx`
- [x] Presentational wrappers
- [x] Consistent spacing/label/error display
- [x] No form library dependency
- [x] Create manifest

---

## Wave 6: First Overlay Components (4 Parallel Streams)

> **Agents: 4** | After Wave 4 (Overlay Primitives) completes.

### 6.1 Tooltip [DEP: 4.1, 4.2] [INDEPENDENT]
- [x] Create `ui/tooltip.tsx`
- [x] Web: hover/focus trigger
- [x] Native: long-press or press with delay
- [x] Create manifest

### 6.2 Popover [DEP: 4.1, 4.2, 4.3] [INDEPENDENT]
- [x] Create `ui/popover.tsx`
- [x] Anchor measurement and collision handling
- [x] Create manifest

### 6.3 Toast [DEP: 4.1] [INDEPENDENT]
- [x] Create `ui/toast.tsx`
- [x] Basic toast primitive
- [x] Create manifest

### 6.4 Sonner [DEP: 6.3]
- [x] Create `ui/sonner.tsx`
- [x] Toast queue management
- [x] Stacking behavior
- [x] Dismiss functionality
- [x] Create manifest

---

## Wave 7: Dialog Family (4 Parallel Streams)

> **Agents: 4** | After Wave 4 (Overlay Primitives) completes.

### 7.1 Dialog [DEP: 4.1, 4.3, 4.5] [INDEPENDENT]
- [x] Create `ui/dialog.tsx`
- [x] Web: focus trap/restore
- [x] Scroll lock integration
- [x] Create manifest

### 7.2 Alert Dialog [DEP: 4.1, 4.3, 4.5] [INDEPENDENT]
- [x] Create `ui/alert-dialog.tsx`
- [x] Web: focus trap/restore
- [x] Native: modal-like behavior
- [x] Create manifest

### 7.3 Sheet [DEP: 4.1, 4.3, 4.5] [INDEPENDENT]
- [x] Create `ui/sheet.tsx`
- [x] Dialog variant (right/left/bottom positions)
- [x] Create manifest

### 7.4 Drawer [DEP: 4.1, 4.3, 4.5] [INDEPENDENT]
- [x] Create `ui/drawer.tsx`
- [x] Native: pan gestures (may need gesture primitive)
- [x] Web: slide-in + focus management
- [x] Create manifest

---

## Wave 8: Roving Focus Components (6 Parallel Streams)

> **Agents: 6** | After Stream 4.4 (Roving Focus) completes.

### 8.1 Radio Group [DEP: 4.4] [INDEPENDENT]
- [x] Create `ui/radio-group.tsx`
- [x] Web: roving tab index
- [x] Native: simple selection list
- [x] Create manifest

### 8.2 Tabs [DEP: 4.4] [INDEPENDENT]
- [x] Create `ui/tabs.tsx`
- [x] Web semantics with roving focus
- [x] Native: simpler but consistent API
- [x] Create manifest

### 8.3 Toggle Group [DEP: 4.4] [INDEPENDENT]
- [x] Create `ui/toggle-group.tsx`
- [x] Multi/single selection
- [x] Roving focus on web
- [x] Create manifest

### 8.4 Accordion [DEP: 5.5, 4.4] [INDEPENDENT]
- [x] Create `ui/accordion.tsx`
- [x] Native: controlled collapsibles
- [x] Web: keyboard semantics
- [x] Create manifest

### 8.5 Slider [DEP: 4.4] [INDEPENDENT]
- [x] Create `ui/slider.tsx`
- [x] Native: gesture-driven
- [x] Web: arrow keys and aria-valuenow
- [x] Create manifest

### 8.6 Input OTP [DEP: 4.3, 4.4] [INDEPENDENT]
- [x] Create `ui/input-otp.tsx`
- [x] Handle paste, autofill hints, numeric keyboard
- [x] Platform-specific UX
- [x] Create manifest

---

## Wave 9: Complex Overlay Components (6 Parallel Streams)

> **Agents: 6** | After Waves 4 and 8 complete.

### 9.1 Select [DEP: 4.1, 4.2, 4.3, 4.4] [INDEPENDENT]
- [x] Create `ui/select.tsx`
- [x] Typeahead on web
- [x] Native: overlay list
- [x] Create manifest

### 9.2 Combobox [DEP: 4.1, 4.2, 4.3, 4.4] [INDEPENDENT]
- [x] Create `ui/combobox.tsx`
- [x] Typeahead, listbox semantics, IME handling
- [x] Document native vs web differences
- [x] Create manifest

### 9.3 Dropdown Menu [DEP: 4.1, 4.2, 4.4] [INDEPENDENT]
- [x] Create `ui/dropdown-menu.tsx`
- [x] Web semantics
- [x] Native: press trigger
- [x] Create manifest

### 9.4 Context Menu [DEP: 4.1, 4.2, 4.4] [INDEPENDENT]
- [x] Create `ui/context-menu.tsx`
- [x] Web: right-click + keyboard
- [x] Native: long-press trigger
- [x] Create manifest

### 9.5 Command [DEP: 4.1, 4.4] [INDEPENDENT]
- [x] Create `ui/command.tsx`
- [x] Command palette pattern
- [x] Web: keyboard-first
- [x] Native: fallback acceptable
- [x] Create manifest

### 9.6 Hover Card [DEP: 4.1, 4.2] [INDEPENDENT]
- [x] Create `ui/hover-card.tsx`
- [x] Web-first (hover/focus)
- [x] Native fallback: press-and-hold or omit hover semantics
- [x] Create manifest

---

## Wave 10: Forms Extensions (4 Parallel Streams)

> **Agents: 4** | After Stream 5.13 (Form Core) completes.

### 10.1 Field [DEP: 5.13] [INDEPENDENT]
- [x] Create `ui/field.tsx`
- [x] Part of forms system
- [x] Presentational wrapper (label/help/error)
- [x] Create manifest

### 10.2 Item [DEP: 5.13] [INDEPENDENT]
- [x] Create `ui/item.tsx`
- [x] FormItem-like wrapper
- [x] Part of form-core
- [x] Create manifest

### 10.3 Form RHF [DEP: 5.13] [INDEPENDENT]
- [x] Create `ui/form-rhf.tsx`
- [x] React Hook Form integration helpers
- [x] Typed wrappers
- [x] Create manifest

### 10.4 Form TSF [DEP: 5.13] [INDEPENDENT]
- [x] Create `ui/form-tsf.tsx`
- [x] TanStack Form integration helpers
- [x] Create manifest

---

## Wave 11: Menubar [DEP: 4.1, 4.2, 4.3, 4.4]

> **Agents: 1** | Complex component, best done by single focused agent.

### 11.1 Menubar
- [x] Create `ui/menubar.tsx`
- [x] Web-first (arrow navigation)
- [x] Native: may be limited or not shipped initially
- [x] Create manifest

---

## Wave 12: Big Feature Components (8 Parallel Streams)

> **Agents: Up to 8** | After Waves 4-9 complete. These are complex, independent features.

### 12.1 Calendar [DEP: 4.4] [INDEPENDENT]
- [x] Create `ui/calendar.tsx`
- [x] Web: rich keyboard nav
- [x] Native: grid implementation and locale formatting
- [x] Create manifest

### 12.2 Date Picker [DEP: 12.1, 6.2] [SEQUENTIAL after 12.1]
- [x] Create `ui/date-picker.tsx`
- [x] Native: may use platform picker or custom
- [x] Web: calendar + input
- [x] Create manifest

### 12.3 Data Table [DEP: 5.10] [INDEPENDENT]
- [ ] Create `ui/data-table.tsx`
- [ ] Web-first features
- [ ] Native: "list"/"grid" approximation
- [ ] Document scope and limitations
- [ ] Create manifest

### 12.4 Chart [DEP: 2A] [INDEPENDENT]
- [ ] Create `ui/chart.tsx`
- [ ] SVG-based cross-platform recommended
- [ ] Document limitations
- [ ] Create manifest

### 12.5 Carousel [DEP: 2A] [INDEPENDENT]
- [ ] Create `ui/carousel.tsx`
- [ ] Native gestures
- [ ] Web: arrow keys
- [ ] Snapping behavior
- [ ] Create manifest

### 12.6 Navigation Menu [DEP: 4.1, 4.2, 4.4] [INDEPENDENT]
- [ ] Create `ui/navigation-menu.tsx`
- [ ] Web-first mega-menu behavior
- [ ] Document as web-focused
- [ ] Native navigation is usually different
- [ ] Create manifest

### 12.7 Sidebar [DEP: 2A] [INDEPENDENT]
- [ ] Create `ui/sidebar.tsx`
- [ ] Layout + responsive behavior
- [ ] Provide building blocks rather than monolith
- [ ] Create manifest

### 12.8 Resizable [DEP: 2A] [INDEPENDENT]
- [ ] Create `ui/resizable.tsx`
- [ ] Web-first
- [ ] Native: "not supported" or very limited
- [ ] Document limitations
- [ ] Create manifest

---

## Wave 13: Acceptance Testing

> **Agents: 3** | After all components complete.

### 13.1 Expo Test App [PARALLEL]
- [ ] Expo dev-client app (SDK 53+) installs tokens
- [ ] Imports unistyles init early
- [ ] Mounts PortalHost
- [ ] Renders Tier 1 components

### 13.2 Bare RN Test App [PARALLEL]
- [ ] Bare RN app installs tokens
- [ ] Same verification as Expo test

### 13.3 Web Build Verification [PARALLEL]
- [ ] Web build renders Tier 1 components
- [ ] Visible focus indication
- [ ] Correct theming

### 13.4 Registry Validation [PARALLEL]
- [ ] Registry artifacts are reproducible
- [ ] Schema-valid
- [ ] CI fails if out of sync

### 13.5 Documentation Audit [PARALLEL]
- [ ] Each component includes props documentation
- [ ] Variants documented
- [ ] Platform caveats noted
- [ ] Example usage provided

---

## Concurrency Summary

| Wave | Parallel Streams | Dependencies | Description |
|------|-----------------|--------------|-------------|
| 0 | 1 | None | Bootstrap (sequential) |
| 1 | 3 | Wave 0 | Registry, CI/CD, Docs |
| 2 | 2 | Stream 1A | Tokens, Portal |
| 3 | 15 | Stream 2A | Tier 1 Components |
| 4 | 7 | Stream 2A/2B | Overlay Primitives |
| 5 | 13 | Stream 2A | Simple Tier 2 Components |
| 6 | 4 | Wave 4 | First Overlay Components |
| 7 | 4 | Wave 4 | Dialog Family |
| 8 | 6 | Stream 4.4 | Roving Focus Components |
| 9 | 6 | Waves 4+8 | Complex Overlay Components |
| 10 | 4 | Stream 5.13 | Forms Extensions |
| 11 | 1 | Wave 4+8 | Menubar |
| 12 | 8 | Various | Big Feature Components |
| 13 | 5 | All | Acceptance Testing |

**Maximum Theoretical Parallelism:** 15 agents (Wave 3)
**Recommended Practical Parallelism:** 5-8 agents

---

## Critical Path

The longest dependency chain determines minimum time to completion:

```
Wave 0 (Bootstrap)
    │
    ▼
Wave 1A (Registry Generator)
    │
    ▼
Wave 2A (Tokens) ─────────────────┬─────────────────────────────┐
    │                              │                             │
    ▼                              ▼                             ▼
Wave 2B (Portal)            Wave 3 (Tier 1)              Wave 5 (Tier 2)
    │                              │                             │
    ▼                              │                             ▼
Wave 4 (Overlay Primitives)        │                      Wave 5.13 (Form Core)
    │                              │                             │
    ├──────────────┬───────────────┤                             ▼
    ▼              ▼               ▼                       Wave 10 (Forms)
Wave 6         Wave 7          Wave 8
(Tooltip...)   (Dialog...)     (Tabs...)
    │              │               │
    └──────────────┴───────────────┘
                   │
                   ▼
              Wave 9 (Select, Combobox...)
                   │
                   ▼
              Wave 12 (Big Features)
                   │
                   ▼
              Wave 13 (Acceptance)
```

**Critical Path Length:** ~8-10 waves depending on agent availability

---

## Agent Assignment Recommendations

### Minimal Team (3 agents)
- **Agent A:** Infrastructure (Waves 0, 1A, 1B)
- **Agent B:** Core primitives (Waves 2A, 2B, 4)
- **Agent C:** Components (Waves 3, 5, 6+)

### Standard Team (5 agents)
- **Agent A:** Infrastructure + Registry
- **Agent B:** Tokens + Theme
- **Agent C:** Portal + Overlay Primitives
- **Agent D:** Tier 1 Components
- **Agent E:** Tier 2/3 Components

### Full Team (8 agents)
- **Agent A:** Infrastructure (Waves 0, 1)
- **Agent B:** Tokens (Wave 2A)
- **Agent C:** Portal + Core Primitives (Waves 2B, 4.1-4.3)
- **Agent D:** Keyboard Primitives (Waves 4.4-4.7)
- **Agent E:** Tier 1 Components batch 1 (3.1-3.8)
- **Agent F:** Tier 1 Components batch 2 (3.9-3.15)
- **Agent G:** Overlay Components (Waves 6, 7)
- **Agent H:** Complex Components (Waves 8, 9, 12)
