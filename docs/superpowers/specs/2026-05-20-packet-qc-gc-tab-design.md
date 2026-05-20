# PacketQC — GC Reference Tab (Phase 1) Design Spec

## Goal

Add a "GC Reference" tab to the PacketQC React app so that GC-perspective content (what the Guidance Counselor verifies, common return reasons, moral waiver packet review) is cleanly separated from the recruiter checklist — without changing any checklist logic, help modals, or profile behavior.

## Context

PacketQC is a multi-file React 18 app (CDN + Babel standalone, no build step) used by Army recruiters to quality-check enlistment packets before submission. The app currently has:
- A fixed header (Army logo, theme toggle, compact toggle, reference drawer button)
- A 270px left sidebar (packet overview, section nav, profile form)
- A right main content area (the recruiter checklist with conditional sections)
- A slide-over reference drawer (`reference-drawer.jsx`) with accordion sections

The user's core insight: some content in the reference drawer is framed from the GC's perspective (what causes a NO-GO, what GC verifies) rather than the recruiter's. That content belongs in a dedicated tab that recruiters can consult to anticipate returns — not buried in a slide-over.

---

## Architecture

Phase 1 is a structural change only. No checklist items, help modals, profile logic, or `qc-data.js` content changes.

### Tab switching

A `TabBar` component is added between the `Header` and the main content area in `Packet QC.html`. It renders two tabs:

- **Recruiter Checklist** (default, active on load)
- **GC Reference**

`activeTab` state (`"recruiter"` | `"gc"`) lives at the `App` level and is passed down to `TabBar` and used to conditionally render content:

```
activeTab === "recruiter"  →  sidebar + checklist (existing layout, unchanged)
activeTab === "gc"         →  full-width GCReference component (sidebar hidden)
```

### New files

| File | Purpose |
|---|---|
| `gc-reference.jsx` | New standalone component — `GCReference` — exports to `window` |

### Modified files

| File | Change |
|---|---|
| `Packet QC.html` | (1) Add `TabBar` component (~30 lines inline JSX); (2) add `activeTab` useState; (3) conditional render based on `activeTab`; (4) add `<script src="gc-reference.jsx" type="text/babel">` after `reference-drawer.jsx` load |

`reference-drawer.jsx` and `qc-data.js` are **not touched** in Phase 1.

---

## TabBar Component

~30 lines, inline in `Packet QC.html`. Styled to match the existing Army Black/Gold design system (same CSS variables).

Visual behavior:
- Sits flush against the bottom of the `Header`
- Two buttons, full-width row with a bottom border (`var(--border)`)
- Active tab has a gold bottom underline (`var(--gold)`) and full-opacity gold text
- Inactive tab has muted text (`var(--fg-muted)`)
- Background matches header (`#0c0a0e`)

```jsx
const TabBar = ({ activeTab, setActiveTab }) => (
  <div style={{
    display:"flex", background:"#0c0a0e",
    borderBottom:"1px solid var(--border-str)"
  }}>
    {[
      { id:"recruiter", label:"⬛  Recruiter Checklist" },
      { id:"gc",        label:"📋  GC Reference" }
    ].map(({ id, label }) => (
      <button key={id} onClick={() => setActiveTab(id)} style={{
        background:"transparent", border:"none",
        borderBottom: activeTab===id ? "2px solid var(--gold)" : "2px solid transparent",
        padding:"10px 20px",
        fontFamily:'"GI",Arial,sans-serif', fontWeight:700, fontSize:11,
        textTransform:"uppercase", letterSpacing:".06em",
        color: activeTab===id ? "var(--gold)" : "var(--fg-muted)",
        cursor:"pointer", transition:"color .15s"
      }}>{label}</button>
    ))}
  </div>
);
```

---

## GCReference Component (`gc-reference.jsx`)

Standalone React component, same pattern as `reference-drawer.jsx`. Exports `GCReference` to `window`. Uses `GCRefAccordion` (local to this file) for collapsible sections — identical visual style to `RefAccordion` in the reference drawer.

### Full-width layout

When the GC tab is active, the sidebar is hidden and `GCReference` renders full-width with a max-width container for readability. Header matches the reference drawer style (gold title, regulation subtitle).

### Two accordion groups

#### Group 1 — GC Verification Steps

Ordered steps (type `"step"`) walking through what the GC does from packet receipt to MEPS scheduling. Approximately 12 steps:

1. Confirm SC QC initiation in RZ — verify "Initiate Station Commander Checkpoint" was clicked (not just a remark in SC Remarks field)
2. Verify "Station Live Scan Authorized" is in Contact History in RZ — not SC Remarks; this is the single most common NO-GO
3. Check GENESIS completeness — Person Tab, Screening Tabs 1 & 2, all aliases, Alias Tab populated for any prior legal name
4. Validate residences — 10 years or back to age 16, no unexplained gaps, DL address matches most recent entry
5. Validate employment — same 10-year window, part-time/seasonal/self-employment included, gaps explained in remarks
6. Confirm SF 86 Validation Report was run and all flags resolved before SC QC initiation
7. Cross-check all dates across DD 2807-2, UMF 680-3A, and GENESIS — any mismatch is an automatic return
8. Verify DD 369 returns — all three jurisdictions (city, county, state) in hand, within 6 months, run separately under every alias (IAW UM 21-022)
9. Confirm Live Scan validity — 120 days from scan date; if expired, must redo before projecting
10. Verify UF 601-210.15 completed within the 3–7 calendar day window of the projected MEPS date
11. Check MIRS 1.1 is current — must be printed same day as packet submission; data changes after retest or profile update
12. **Moral waiver packet review** (always shown in the GC tab — it's a reference, not conditional logic):
    - UF 601-210.08: offenses newest to oldest, only waived offense(s) asterisked, AFQT matches current RZ score
    - DD Form 370: three references present (employment, school, personal); no family members as personal references; college/vo-tech includes transcript
    - Court dockets: all three components per offense (charging doc + court finding/sentencing + final disposition)
    - DD 369: covers every jurisdiction where an offense occurred, within 6 months, run under all aliases
    - FL 601-210.04: present if applicant was confined 24+ hours in any institution
    - DA Form 3072-2: all income entries are monthly (not annual or weekly)
    - Marijuana/paraphernalia possession or use offenses: confirm no waiver packet was initiated — per AR 601-210 para 4-6 (Mar 2026) these no longer require a waiver; verify offense classification with GC before assuming

#### Group 2 — Common Return Reasons

Type `"nogo"` items organized into labeled sub-categories. Between groups, `GCReference` renders a category header div (bold, uppercase, 10px, gold — a local rendering detail, not a new item type in the existing system). Categories:

**GENESIS Errors**
- Live Scan authorization entered in SC Remarks instead of Contact History (RZ)
- Alias Tab empty when applicant has a prior legal name (maiden, adoption, court-ordered change)
- Residence or employment gaps unexplained in remarks
- DL address does not match most recent residence entry
- SF 86 Validation Report flags not resolved before SC QC initiation
- LPR applicant: I-551 alien number, expiration date, or category code missing in Citizenship Tab

**Document Defects**
- Source documents blurry, cut off, or mislabeled in GENESIS uploads — GC cannot verify what they can't read
- Foreign-language document present without certified English translation (machine translations not accepted)
- Photocopy submitted for identity document (SSC, BC, I-551, Naturalization Certificate) — originals or certified copies only
- Multi-page document not numbered (Page X of Y) or total page count missing from first page

**Timing Failures**
- UF 601-210.15 completed too early — expired by the time of MEPS appointment
- Live Scan expired (120-day limit) — applicant must redo scan before projection
- Temp Res beyond 7-day validity — must be recreated (max 3 per applicant per UR 601-210 para 24-3)
- MIRS 1.1 printed before a retest or profile update — data is stale; reprint same day as submission
- DD 368 (MSO release) expired or approval not received before MEPS scheduling

**Waiver Errors**
- Unnecessary waiver initiated for marijuana possession or use offense — AR 601-210 para 4-6 (Mar 2026) removed the waiver requirement; contact GC to confirm offense classification before assuming
- AFQT on UF 601-210.08 does not match current ASVAB score in RZ
- Court docket incomplete — missing charging document, court finding, or final disposition for one or more offenses
- DD 369 not run under all aliases — hand-jamming an alias onto an existing form is not acceptable (UM 21-022)
- DD 369 doesn't cover jurisdiction where offense occurred
- FL 601-210.04 missing when applicant was confined 24+ hours
- DA Form 3072-2 income entries are annual or weekly instead of monthly

**SC Checkpoint Errors**
- SC QC not formally initiated in RZ — recruiter remarked instead of clicking "Initiate Station Commander Checkpoint"
- Complex prescreen submitted but no MEPS disposition received — do not schedule until MEPS returns a disposition

**Citizenship / LPR Issues**
- LPR applicant projected without confirmed I-551 alien number, expiration, and category code in GENESIS
- Naturalized citizen: Naturalization Certificate not present as a certified original or raised-seal copy
- Foreign-born citizen: birth abroad document (FS-240 or DS-1350) missing or expired

---

## What Does NOT Change in Phase 1

- `qc-data.js` — all section definitions, conditions, help modals, profile defaults unchanged
- `reference-drawer.jsx` — existing reference drawer stays exactly as-is; the GC tab does not replace it
- All checklist item logic, three-state toggles, section notes, search/filter, compact mode
- Theme tokens — `GCReference` uses all existing CSS custom properties; no new design tokens

---

## Phase 2 (Separate Spec — Content Sprint)

After Phase 1 ships, Phase 2 will:
- Read AR 601-210 (Mar 2026), waiver QC checklist, MARP Processing Guide, SC QC slides cover-to-cover
- Fill every help modal reg citation gap in `qc-data.js`
- Expand tips for all existing sections
- Add missing program sections: OCS, FLRI (Future Leader Resource Initiative), ATP (Army Training Plan)
- Add any additional regulation-sourced content identified during the read

Phase 2 does not start until Phase 1 is shipped and reviewed.

---

## Success Criteria

- Clicking "GC Reference" tab hides the sidebar and renders the GC content full-width
- Clicking "Recruiter Checklist" restores the sidebar and checklist exactly as before
- All GC Verification Steps present and accurate to AR 601-210 / USMEPCOM regs
- All return reasons present under correct categories
- Moral waiver review section complete — including the Mar 2026 marijuana waiver change
- No existing checklist functionality broken
- Visual style indistinguishable from existing design system (same fonts, same tokens, same accordion pattern)
