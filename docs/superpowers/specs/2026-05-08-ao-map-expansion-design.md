# AO Map Expansion — Design Spec
**Date:** 2026-05-08  
**File:** `recruiting-map.html`  
**Scope:** Expand existing Leaflet-based recruiting map with Army brand redesign, demographic overlay, satellite tile, custom SVG pins, and enhanced high school visit tracking.

---

## 1. Approach

Expand `recruiting-map.html` in place (Option B). No new files; everything ships as a single HTML file consistent with the rest of the Toolbox. Leaflet 1.9.4 stays as the map engine.

---

## 2. Theme — U.S. Army Design System

Replace the current blue-dark palette entirely with the official Army brand tokens.

| Token | Value | Usage |
|---|---|---|
| Army Black | `#221F20` | Page background, marker faces |
| Army Gold | `#FFCC01` | Accents, CTAs, active states, hot ZIPs |
| Army Green | `#2F372F` | Sidebar, panels, secondary fills |
| White | `#FFFFFF` | Body text on dark surfaces |
| Field Gray | `#727365` | Muted labels, borders |
| Highlight Red | `#CF0000` | Danger states, overdue visit badges |
| Highlight Green | `#2DAA27` | Success, recently visited badges |

**Typography:** G.I. font (400/530/750 weights). The six TTF files from the Army design skill must be copied into a `fonts/` subfolder in the project repo (they cannot be hot-linked from the skill bundle — GitHub Pages serves the project directory only). Fallback: Arial Black / Arial. All section headers and panel titles in uppercase. Body/data text in sentence case.

**Shape:** Zero border-radius on all cards, panels, and buttons. Army style is square and sharp. Exception: map pin circles use `border-radius: 50%` only for the pulse ring on the recruiting station.

**No emojis anywhere.** All markers use custom SVG icons. No drop shadows on UI elements.

**Tile toggle:** Three flat buttons in the sidebar MAP TILE section — `DARK` / `STREET` / `SAT`. Replaces the current single theme toggle button in the header (header is removed to reclaim space). Dark mode map tile changes with dark/street selection; satellite is always the Esri World Imagery layer.

---

## 3. Map Tiles

| Name | Label | Provider | URL Pattern |
|---|---|---|---|
| Dark | `DARK` | CartoDB Dark Matter | `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png` |
| Street | `STREET` | Esri World Street Map | `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}` |
| Satellite | `SAT` | Esri World Imagery | `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}` |

Default on load: DARK. All three are free, no API key required.

---

## 4. ZIP Codes & Boundaries

All ZIP codes in the Lincoln AO must be present in `AO_ZIPS`. The full audited list for Lincoln NE and surrounding recruiter AO:

**Lincoln city ZIPs:** 68501, 68502, 68503, 68504, 68505, 68506, 68507, 68508, 68510, 68512, 68514, 68516, 68517, 68520, 68521, 68522, 68523, 68524, 68526, 68527, 68528, 68529, 68532, 68588

**Surrounding AO ZIPs:** 68317 (Bennet), 68333 (Crete), 68336 (Davey), 68347 (Eagle), 68366 (Greenwood), 68428 (Raymond), 68462 (Waverly)

Boundaries are loaded live from the OpenDataDE Nebraska GeoJSON (Census TIGER/Line derived). Filter client-side to `AO_ZIPS`. Verify all ZIPs return features from the source; log any missing ones to console.

---

## 5. Demographic ZIP Overlay

**Data source:** U.S. Census ACS 5-year estimates, hardcoded as a JS object keyed by ZIP. No runtime API call.

**Fields per ZIP:**
- `pop1724`: count of residents aged 17–24
- `popTotal`: total ZIP population
- `pct1724`: percentage (derived: `pop1724 / popTotal`)

**Color scale:** Linear gradient from Army Green (`#2F372F`, low density) to Army Gold (`#FFCC01`, high density), based on `pop1724` value relative to AO min/max. Rendered as `fillColor` on each ZIP polygon.

**Toggle:** "17–24 POPULATION" checkbox in the sidebar MAP LAYERS section. When checked, demographic fill overrides the priority fill. When unchecked, priority fill (HOT/WARM/COLD) is restored.

**ZIP detail panel — demographic section:**
- Total 17–24 count
- Percentage of ZIP population
- AO rank ("2nd highest in AO")

**Legend:** Adds a horizontal gradient swatch labeled "LOW → HIGH · 17–24 POP" below the existing priority legend rows.

---

## 6. Custom SVG Map Pins

All markers use `L.divIcon` with inline SVG. No emojis. Pin shape: circle face on a pointed base (standard teardrop pin), flat Army-style fill.

| Type | Face Color | Icon Color | Symbol |
|---|---|---|---|
| High School | Army Black `#221F20` | Army Gold `#FFCC01` | Graduation cap SVG |
| University | Army Green `#2F372F` | Army Gold `#FFCC01` | Column/pillars SVG |
| Police Dept | `#1a2a4a` (dark navy) | White | Shield SVG |
| Courthouse | Army Green `#2F372F` | White | Scales SVG |
| Taco Bell | `#CF0000` | White | Bell SVG |
| Recruiting Station | Army Gold `#FFCC01` | Army Black | Army 5-point star SVG + pulse ring |
| Custom dropped pin | White | Army Black | Crosshair / plus SVG |

**Visit status badge:** High school pins show a small circular badge (top-right of pin):
- Gold: never visited
- Green (`#2DAA27`): visited within 30 days
- Army Gold dimmed: visited 30–90 days ago
- Red (`#CF0000`): 90+ days since last visit

Badge is driven by `noteStore[id].lastVisit` date diff. Recalculates on note save.

---

## 7. Location Data Accuracy

All coordinates must be verified against current public records before commit. Additions / corrections needed:

**High Schools — verify/update list:**
- Lincoln High School, Lincoln Northeast, Lincoln East, Lincoln Southeast, Lincoln Southwest, Lincoln North Star (all LPS)
- Pius X High School (private)
- Waverly High School
- Raymond Central High School
- Bennet High School
- Crete High School
- Add any missing private/charter schools in the AO (e.g., Lincoln Christian, Parkview Christian) — verify current enrollment and coordinates at implementation time

**Personnel data — pre-populate from public LPS directory:**
Each school object gets: `principal`, `counselor`, `counselorPhone`, `counselorEmail`. These are editable in the detail panel and overwritten on Save. Sourced from LPS.org staff directories and district pages at implementation time.

**Police:** Verify LPD HQ, Lancaster County Sheriff, UNL PD addresses/coordinates. Add any substations if applicable.

**Courthouses:** Verify Lancaster County Courthouse, U.S. District Court coordinates.

---

## 8. High School Detail Panel

### Quick-action bar (top of panel)
Three gold buttons, full-width, arranged horizontally:
- `→ GET DIRECTIONS` — opens `https://www.google.com/maps/dir/?api=1&destination=<encoded address>` in new tab
- `COPY ADDRESS` — copies address string to clipboard via `navigator.clipboard`
- `CALL COUNSELOR` — `tel:` link using saved counselor phone (button disabled/grayed if no phone saved)

### Personnel section
Pre-populated, editable fields:
- Principal (text input)
- Counselor (text input)
- Counselor Phone (tel input)
- Counselor Email (email input)
- Recruiting POC (text input)

### Visit tracking section
- Last Visit (date input)
- Next Planned Visit (date input)
- Priority select: HOT / WARM / COLD / Unset
- Contacts Made (number input)
- AAR / Notes (textarea)
- Follow-Up Action (text input)

### Enrollment & info (read-only)
- Enrollment count
- Grade range

All fields save to `noteStore[item.id]` on SAVE. Visit badge on pin recalculates immediately after save.

---

## 9. Drop a Pin Tool

A crosshair button in the map toolbar (top-left, below zoom controls). 

**Behavior:**
1. Click button → cursor changes to crosshair, button highlights gold
2. Click anywhere on map → custom marker placed, detail panel opens
3. User names the pin and adds notes, clicks SAVE
4. Marker persists in `noteStore` as `custom-<timestamp>` key
5. Exported with JSON, imported back correctly
6. Right-click custom pin → option to delete it

Custom pins appear in search results.

---

## 10. Distance from Station Tooltip

On ZIP polygon hover: a small tooltip appears showing:
- ZIP code
- Straight-line distance in miles from recruiting station (`40.8181, -96.6828`)
- Calculated using Haversine formula client-side

Not a drive-time estimate — labeled clearly as "~X mi straight-line from station."

---

## 11. Sidebar Reorganization

Sidebar sections in order, all uppercase headers, square borders between sections:

1. **MAP LAYERS** — all layer checkboxes including new "17–24 POPULATION" toggle
2. **MAP TILE** — three buttons: DARK / STREET / SAT
3. **ZIP PRIORITY** — existing HOT/WARM/COLD filter dropdown
4. **STATION STATS** — visited count, contacts, HOT ZIPs, AAR notes
5. **DATA** — Export JSON / Import JSON buttons

---

## 12. Index Page Integration

Add the AO Map to `index.html` tool card grid as a new card:
- Title: `AO OPERATIONS MAP`
- Description: "Interactive recruiting area map. ZIP demographics, school contacts, visit tracking."
- Links to `recruiting-map.html`
- Icon: map pin SVG (Army style)

---

## 13. Out of Scope

- Real-time drive-time polygons (requires a routing API)
- MEPS / job center / DMV locations (can be added in a future pass)
- Route optimizer
- Calendar sync
- Any backend / server — this is a static GitHub Pages app
