# OPAT Calculator Revamp — Command Center Design

**Date:** 2026-05-09
**Tool:** `OPAT_Calculator.html`
**Scope:** Full ground-up visual and UX revamp of the OPAT Calculator page only. Index and other tools unchanged.

---

## Context

The OPAT (Occupational Physical Assessment Test) Calculator is used by Army recruiters at a desk to pre-screen applicants before MEPS. It scores four physical events and maps the result to a Physical Demand Category (PDC) band: GOLD, GRAY, or BLACK. The primary output — the PDC grade — is currently buried in a thin status strip at the top. The tool has strong functional bones but its dark tactical/terminal aesthetic diverges from Army brand identity.

---

## Design direction

**Command Center** — Army brand-compliant redesign using the official "Be All You Can Be." visual system. Army Black canvas, G.I. typeface, Army Gold accents, exposed-grid layout device. The PDC result is promoted to a dominant hero panel. Event inputs are reorganized into a clean 2×2 exposed-grid structure.

---

## Color system

All colors from the official Army brand palette:

| Token | Hex | Usage |
|---|---|---|
| Army Black | `#221F20` | Primary background, header, result panel |
| Army Gold | `#FFCC01` | Active grade, accents, borders, CTA |
| Army Green | `#2F372F` | Content area background |
| White | `#FFFFFF` | Type on dark, grid borders |
| Field Green 01 | `#3F4B36` | Subtle cell backgrounds |
| Gray 01 | `#A8A6A2` | Muted/inactive type |
| Gray 02 | `#6E6C68` | Dividers, ghost borders |
| Highlight Red | `#A02E2E` | Below-minimum (WHITE band) warning |

No gradients. No drop shadows. No rounded corners > 0px.

---

## Typography

**G.I.** typeface (locally hosted, six TTF files in `fonts/` directory — copied from us-army-design skill bundle).

| Role | Size | Weight | Case |
|---|---|---|---|
| PDC grade display | clamp(80px, 12vw, 140px) | 750 | UPPERCASE |
| Event name | 22–26px | 750 | UPPERCASE |
| Section label | 11px | 530 | UPPERCASE |
| Table header | 12px | 530 | UPPERCASE |
| Body / inputs | 16px | 400 | Sentence |
| Micro / captions | 10–11px | 530 | UPPERCASE, 1px tracking |

Fallback chain: `'G.I.', Eurostile, 'DIN Next', Archivo, system-ui, sans-serif`.

---

## Page structure

Three vertical zones stacked top to bottom:

```
┌─────────────────────────────────────────────────┐
│  HEADER BAR (sticky, 64px, Army Black)          │
├─────────────────────────────────────────────────┤
│  PDC RESULT PANEL (full-width, ~180px)          │
├─────────────────────────────────────────────────┤
│  CONTENT AREA (Army Green)                      │
│  ┌──── EVENT GRID (2×2 exposed-grid) ────────┐  │
│  └────────────────────────────────────────────┘  │
│  ┌──── PERFORMANCE ANALYSIS (2-col) ─────────┐  │
│  └────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## Section 1 — Header bar

- **Background:** Army Black (`#221F20`)
- **Border-bottom:** 2px solid Army Gold
- **Height:** 64px, sticky (position: sticky, top: 0, z-index: 50)
- **Left:** Army star SVG (20px) + "U.S. ARMY" wordmark in G.I. 530, then a `|` separator, then `OPAT` label in G.I. 750 gold
- **Right:** `FOR OFFICIAL USE ONLY — UNOFFICIAL TOOL` in micro-type (10px, Gray 01), `UPDATED OCT 2021` badge in 10px caption
- **Back link:** `← RECRUITING TOOLBOX` in G.I. 530 small, links to `index.html`

---

## Section 2 — PDC result panel

The hero. Recruiter sees grade immediately on page load.

- **Background:** Army Black
- **Border-bottom:** 2px solid `rgba(255,255,255,0.12)`
- **Padding:** 32px 5%
- **Layout:** two columns — grade display (flex-grow) | band status chips (fixed width ~280px)

**Left — grade display:**
- Micro label: `PHYSICAL DEMAND CATEGORY` (10px, Gray 01, 1px tracking)
- Grade value: PDC band name in G.I. 750, `clamp(80px, 12vw, 140px)`, Army Gold, line-height 0.9
- Below grade: two stat pills in a row — `LOWEST EVENT: [SLJ]` and `PDC QUALIFIED: [GRAY AND BELOW]` — in 11px caption, white type, 1px Army Gold left border each, 12px left padding

**Right — band status chips:**
Three hard-bordered cells stacked vertically (`BLACK / GRAY / GOLD`), each 40px tall, 2px border:
- Active band: Army Gold fill, Army Black type, G.I. 750
- Inactive bands: transparent fill, Gray 02 border, Gray 01 type
- Each chip shows band name + brief descriptor (`HEAVY PDC / SIGNIFICANT PDC / MODERATE PDC`)
- `✓` checkmark prefix on qualifying bands, `✗` on disqualifying

**Color states for grade display:**
- GOLD band: grade text in Army Gold
- GRAY band: grade text in `#A8A6A2` (Gray 01)
- BLACK band: grade text in White
- BELOW MINIMUM: grade text in Highlight Red, micro warning below

---

## Section 3 — Event input grid

**Section header:** Full-width 2px-bordered cell, `01 // EVENT INPUTS & SCORING`, 11px G.I. 530, Army Gold, Army Green background.

**Grid:** 2×2 exposed-grid. Outer border 2px white at 15% opacity. Inner cell borders 2px white at 10% opacity. Cell background: Field Green 01 (`#3F4B36`).

### Each event cell structure

```
EVENT 01 / SLJ                          [SLJ]
STANDING LONG JUMP

JUMP DISTANCE (IN)              55 IN (4'7")
[━━━━━━━━◆━━━━━━━━━━━━━━━━━━━━━━━━━] ┌─────┐
20"   GOLD 47"   GRAY 55"   BLACK 63"  │  55 │
                                        └─────┘
[— GRAY  LOWER BODY POWER]
```

- **Top-left:** `EVENT 0N / [ABBREV]` in 10px G.I. 530, Army Gold
- **Top-right:** abbreviation badge — 2px gold border, 10px G.I. 750, Army Gold (`[SLJ]`)
- **Title:** event name in G.I. 750, 22px, white, UPPERCASE
- **Metric label + live value:** label in 11px Gray 01, value in 16px G.I. 530 white flush-right
- **Number input:** Army Black fill, 2px Army Gold border, G.I. 400, 16px, white type — primary entry method
- **Slider:** below input, full cell width. Track divided into color zones. Thumb: 14×14px solid Army Gold square (no border-radius). Zone colors: `rgba(255,204,1,0.3)` for gold zone, `rgba(168,166,162,0.3)` for gray zone, `rgba(255,255,255,0.15)` for black zone.
- **Threshold markers:** vertical tick marks at GOLD/GRAY/BLACK thresholds with micro labels below
- **Grade badge:** bottom-left, hard-bordered pill — `— GRAY` or `— GOLD` or `— BLACK`. Active: gold fill, black type. Inactive: transparent, white type.
- **Descriptor:** small caption beside badge (`LOWER BODY POWER`)

### SDL cell additions
Quick-select threshold buttons (`60 / 120 / 140 / 160+ / 180 / 190 / 200 / 210 / 220`): flat Army Black buttons, 2px white border at 15%, 11px G.I. 530. Active threshold: 2px gold border, gold type. Asterisked thresholds (`140* / 160*+`) retain the asterisk notation.

### IAR cell
Two side-by-side number inputs: `LEVEL (1–10+)` and `SHUTTLE (1–13)`. Below: computed `TOTAL SHUTTLES: 40` in G.I. 530 gold. Threshold reference cards for GOLD/GRAY/BLACK displayed as a 3-cell mini-grid below the inputs.

---

## Section 4 — Performance analysis

**Section header:** `02 // PERFORMANCE ANALYSIS`, same style as section 3 header.

**Layout:** two columns inside the exposed-grid system, equal width.

### Left cell — Event profile radar

- Background: Army Black
- Spider chart axes: 1px white lines
- Filled polygon: Army Gold at 20% opacity fill, 2px solid Army Gold stroke
- Threshold rings: GOLD/GRAY/BLACK as dashed 1px lines in respective colors (gold/gray-01/white)
- Axis labels: G.I. 530 11px, white, positioned outside the chart
- Label: `EVENT PROFILE // RADAR` micro-type top-left

### Right cell — Scoring thresholds table

- Background: Army Black
- Header row: Army Gold fill, Army Black type, G.I. 530 12px UPPERCASE
- Columns: `PDC | SLJ | SPT | SDL | IAR | STATUS`
- Rows: BLACK / GRAY / GOLD / WHITE (below minimum)
  - Left edge: 3px color strip (white/gray-01/gold/red) as visual band indicator
  - Status cell: `✓ QUALIFIED` in gold or `✗` in red
  - Row borders: 1px `rgba(255,255,255,0.08)`
- **YOUR SCORE row:** separated by 2px Army Gold top rule, `YOUR SCORE` label in Army Gold G.I. 750, values in white, band result in gold/gray/white/red depending on PDC

---

## Interaction behavior

All existing JS logic (scoring calculations, real-time updates, radar chart) is preserved exactly. Only the visual layer changes.

- **Slider input:** updates number field and grade badge in real time
- **Number field input:** updates slider thumb position in real time
- **Grade changes:** PDC result panel updates immediately; band chip swaps fill; grade color follows band (gold/gray/white/red)
- **Hover on table rows:** `rgba(255,204,1,0.05)` background tint
- **Input focus:** 3px solid Army Gold outline, 3px offset (brand spec)
- **Button active:** fill ↔ outline swap (no shrink, no bounce)
- **Easing:** `cubic-bezier(0.85, 0, 0.15, 1)` for all transitions, 150–200ms

---

## Assets required

- G.I. font files (6 TTFs) — copy from us-army-design skill bundle at:
  `/Users/lucaskraat/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/c9d6711b-93eb-43eb-8d87-b5e364734c6e/65b3ab87-f7ad-49d5-aff8-2236e2d5d517/skills/us-army-design/fonts/`
- Army star SVG — inline or copy from skill bundle `assets/logos/`
- No external photo assets needed (this is a calculator, not a marketing page)
- No CDN font dependencies — all fonts self-hosted
- Remove existing Google Fonts import (`IBM Plex Mono`, `Bebas Neue`) — replaced entirely by G.I.

---

## Out of scope

- Changes to any other tool pages
- Changes to `index.html`
- New calculator features or scoring logic
- Mobile-responsive overhaul (desktop-first; basic responsiveness only)
- Radar chart library swap (keep existing implementation)
