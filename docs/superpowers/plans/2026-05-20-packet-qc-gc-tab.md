# PacketQC GC Reference Tab — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "GC Reference" tab to the PacketQC React app that shows GC verification steps and categorized return reasons, cleanly separated from the recruiter checklist.

**Architecture:** A `TabBar` component sits below the header; `activeTab` state in `App` switches between the existing recruiter layout (unchanged) and a new full-width `GCReference` component. `GCReference` lives in a new `gc-reference.jsx` file that follows the exact same pattern as the existing `reference-drawer.jsx`.

**Tech Stack:** React 18 (CDN UMD), Babel Standalone (CDN), no build step, all CSS via custom properties already defined in `Packet QC.html`.

---

## File Map

| Status | File | What changes |
|---|---|---|
| Copy in | `Packet QC.html` | Copied from /tmp/packetqcfinal/ — this is the current React app |
| Copy in | `qc-data.js` | Copied from /tmp/packetqcfinal/ — section/item definitions |
| Copy in | `reference-drawer.jsx` | Copied from /tmp/packetqcfinal/ — existing reference slide-over |
| Copy in | `assets/` | Logos and sticker GIFs from /tmp/packetqcfinal/assets/ |
| **Create** | `gc-reference.jsx` | New — GCReference component with two accordion groups |
| **Modify** | `Packet QC.html` | Add script tag, TabBar component, activeTab state, conditional render |

---

## Task 1: Migrate new React app files into worktree

The worktree currently has the old single-file PacketQC.html. The new multi-file React app lives in /tmp/packetqcfinal/. Copy it in before any feature work.

**Files:**
- Create: `Packet QC.html` (from /tmp/packetqcfinal/)
- Create: `qc-data.js` (from /tmp/packetqcfinal/)
- Create: `reference-drawer.jsx` (from /tmp/packetqcfinal/)
- Create: `assets/logos/army-logo-reverse.svg`, `assets/logos/army-star.svg`
- Create: `assets/stickers/stars-1.gif`, `assets/stickers/stars-2.gif`

- [ ] **Step 1: Copy the React app source files**

```bash
WORKTREE="/Users/lucaskraat/Desktop/ARTIFACTS/.claude/worktrees/gracious-hofstadter-59432c"
SRC="/tmp/packetqcfinal"

cp "$SRC/Packet QC.html"       "$WORKTREE/Packet QC.html"
cp "$SRC/qc-data.js"           "$WORKTREE/qc-data.js"
cp "$SRC/reference-drawer.jsx" "$WORKTREE/reference-drawer.jsx"
```

- [ ] **Step 2: Copy the assets directory**

```bash
WORKTREE="/Users/lucaskraat/Desktop/ARTIFACTS/.claude/worktrees/gracious-hofstadter-59432c"
SRC="/tmp/packetqcfinal"

mkdir -p "$WORKTREE/assets/logos" "$WORKTREE/assets/stickers"
cp "$SRC/assets/logos/army-logo-reverse.svg" "$WORKTREE/assets/logos/"
cp "$SRC/assets/logos/army-star.svg"         "$WORKTREE/assets/logos/"
cp "$SRC/assets/stickers/stars-1.gif"        "$WORKTREE/assets/stickers/"
cp "$SRC/assets/stickers/stars-2.gif"        "$WORKTREE/assets/stickers/"
```

- [ ] **Step 3: Verify the worktree has all required files**

```bash
WORKTREE="/Users/lucaskraat/Desktop/ARTIFACTS/.claude/worktrees/gracious-hofstadter-59432c"
ls "$WORKTREE/Packet QC.html" \
   "$WORKTREE/qc-data.js" \
   "$WORKTREE/reference-drawer.jsx" \
   "$WORKTREE/assets/logos/army-star.svg" \
   "$WORKTREE/assets/stickers/stars-2.gif" \
   "$WORKTREE/fonts/G.I.-750.ttf"
```

Expected: all six paths print without error.

- [ ] **Step 4: Open the app in a browser to confirm the existing app loads**

Open this path in your browser:
```
/Users/lucaskraat/Desktop/ARTIFACTS/.claude/worktrees/gracious-hofstadter-59432c/Packet QC.html
```

Expected: Army black/gold theme loads, checklist visible, no console errors.

- [ ] **Step 5: Commit the migrated source files**

```bash
cd "/Users/lucaskraat/Desktop/ARTIFACTS/.claude/worktrees/gracious-hofstadter-59432c"
git add "Packet QC.html" qc-data.js reference-drawer.jsx assets/
git commit -m "$(cat <<'EOF'
chore: migrate new React app source files into worktree

Replaces old single-file PacketQC.html with the multi-file
React 18 + Babel standalone redesign. Adds qc-data.js,
reference-drawer.jsx, and assets (logos, stickers).

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Create gc-reference.jsx

New standalone component file. Follows the exact same export-to-window pattern as `reference-drawer.jsx`. Contains all GC verification step data and return reason data inline, and renders two collapsible accordion sections.

**Files:**
- Create: `gc-reference.jsx`

- [ ] **Step 1: Create gc-reference.jsx with the full component**

```bash
cat > "/Users/lucaskraat/Desktop/ARTIFACTS/.claude/worktrees/gracious-hofstadter-59432c/gc-reference.jsx" << 'ENDOFFILE'
// gc-reference.jsx — GC Reference tab content
// Exports GCReference to window

const GC_STEPS = [
  { n:1,  text:'Confirm SC QC initiation in RZ — verify "Initiate Station Commander Checkpoint" was clicked by the recruiter in RZ. A remark in the SC Remarks field does NOT count as initiation and will be an automatic return.' },
  { n:2,  text:'"Station Live Scan Authorized" must be entered in Contact History in RZ — NOT in SC Remarks. This is the single most common NO-GO. The entry must appear in Contact History specifically, not anywhere else in the applicant record.' },
  { n:3,  text:'Check GENESIS completeness — Person Tab (legal name, status, physical description, ethnicity, DOB/POB, address, DL info, marital status), Screening Tabs 1 & 2 (all aliases, immediate family, psychological criteria, technology info, group associations, contact method). No blanks anywhere. Alias Tab must be populated for every prior legal name — maiden name, adoption name, or court-ordered name change.' },
  { n:4,  text:'Validate residences — 10 years back or to the applicant\'s 16th birthday, whichever is less. No unexplained gaps. DL address must match the most recent residence entry exactly. Any gap between entries must have an explanation in remarks — "between residences" is not acceptable.' },
  { n:5,  text:'Validate employment — same 10-year window. Part-time, seasonal, summer, and self-employment must all be included. Gaps between jobs must be explained in remarks. Do not leave any period of non-employment unaccounted for.' },
  { n:6,  text:'Confirm SF 86 Validation Report was run and all flags resolved before SC QC initiation. GC checks the report run date — if run before a retest or profile change, it must be re-run. Every flag must have been addressed, not just noted.' },
  { n:7,  text:'Cross-check all dates across DD 2807-2, UMF 680-3A, and GENESIS — any date mismatch between these three sources is an automatic return. DOB, POB, dates of incidents, and treatment dates must match exactly across all three documents.' },
  { n:8,  text:'Verify DD 369 returns — all three jurisdictions (city, county, state) must be in hand before projection. Each must be dated within 6 months. Each must be run separately under every alias the applicant has used — IAW UM 21-022, hand-jamming an alias onto an already-returned form is not acceptable.' },
  { n:9,  text:'Confirm Live Scan validity — valid 120 days from the date of the scan. If the scan will be expired by the MEPS appointment date, the applicant must redo before projecting. No exceptions.' },
  { n:10, text:'Verify UF 601-210.15 was completed within the 3–7 calendar day window before the projected MEPS date. Completed too early = expired by MEPS date. Completed same-day or too late = procedural defect. Either is a return.' },
  { n:11, text:'Check MIRS 1.1 is current — must be printed the same day as packet submission. Data changes after a retest or profile update. A MIRS printed before a score change or profile update is stale and will be returned, especially in waiver packets.' },
  { n:12, text:'Moral waiver packet review (always check — confirm a waiver was not incorrectly initiated for a non-waiver offense):\n• UF 601-210.08: offenses listed newest to oldest; only waived offense(s) asterisked; AFQT on form matches current RZ score\n• DD Form 370: three references present (employment, school, personal); no family members as personal references; college/vo-tech references include transcript\n• Court dockets: all three components per offense — charging document + court finding/sentencing + final disposition\n• DD 369: covers every jurisdiction where an offense occurred, within 6 months, run under all aliases\n• FL 601-210.04: present if applicant was confined 24+ hours in any institution (jail, detention, juvenile facility, inpatient program)\n• DA Form 3072-2: all income entries are monthly — not annual, not weekly. Do not include anticipated military pay\n• Marijuana/paraphernalia possession or use: confirm NO waiver packet was initiated — AR 601-210 para 4-6 (Mar 2026) removed the waiver requirement. If a packet was opened, it must be withdrawn. Verify offense classification (possession/use vs. distribution) with GC before assuming.' },
];

const GC_RETURNS = [
  { type:"category", text:"GENESIS Errors" },
  { type:"nogo",     text:'Live Scan authorization entered in SC Remarks instead of Contact History in RZ — wrong field, automatic return regardless of whether the scan itself is valid.' },
  { type:"nogo",     text:'Alias Tab empty when applicant has a prior legal name (maiden name, adoption name, court-ordered name change) — every prior legal name must appear in the Alias Tab.' },
  { type:"nogo",     text:'Residence or employment gaps left unexplained — any period not covered by an entry must have an explanation in remarks.' },
  { type:"nogo",     text:'DL address does not match the most recent residence entry in GENESIS — these must be identical.' },
  { type:"nogo",     text:'SF 86 Validation Report flags not resolved before SC QC initiation — GC checks the report; unresolved flags stop processing.' },
  { type:"nogo",     text:'LPR applicant: I-551 alien number, expiration date, or category code missing in GENESIS Citizenship Tab — all three fields required.' },

  { type:"category", text:"Document Defects" },
  { type:"nogo",     text:'Source documents blurry, cut off, or mislabeled in GENESIS uploads — GC cannot verify what they cannot read. Every upload must be legible and correctly labeled.' },
  { type:"nogo",     text:'Foreign-language document present without a certified English translation — machine translations are not accepted. Both original and certified translation must be in the packet.' },
  { type:"nogo",     text:'Photocopy submitted for an identity document (SSC, BC, I-551, Naturalization Certificate) — originals or certified copies (raised seal or certifying stamp) only.' },
  { type:"nogo",     text:'Multi-page document not numbered (Page X of Y) or total page count missing from the first page.' },

  { type:"category", text:"Timing Failures" },
  { type:"nogo",     text:'UF 601-210.15 completed too early — expired by the MEPS appointment date. Must be completed within the 3–7 calendar day window before the projected MEPS date.' },
  { type:"nogo",     text:'Live Scan expired — valid 120 days from scan date. If expired by MEPS date, applicant must redo before projecting.' },
  { type:"nogo",     text:'Temp Res beyond 7-day validity (UR 601-210 para 24-3) — if MEPS date shifts past 7 days from the Temp Res date, recreate it. Maximum 3 per applicant.' },
  { type:"nogo",     text:'MIRS 1.1 stale — must be printed the same day as packet submission. An outdated MIRS is a common waiver packet return reason.' },
  { type:"nogo",     text:'DD 368 (MSO release) expired or approval not received before MEPS scheduling — must be approved and unexpired before any MEPS processing.' },

  { type:"category", text:"Waiver Errors" },
  { type:"nogo",     text:'Unnecessary waiver initiated for marijuana possession or use offense — AR 601-210 para 4-6 (Mar 2026) removed the waiver requirement. Confirm offense classification (possession/use vs. distribution) with GC before assuming.' },
  { type:"nogo",     text:'AFQT on UF 601-210.08 does not match current ASVAB score in RZ — must match most recent score. If applicant retested after the form was completed, the form must be redone.' },
  { type:"nogo",     text:'Court docket incomplete — all three components required per offense: charging document + court finding/sentencing + final disposition. One missing component = return.' },
  { type:"nogo",     text:'DD 369 not run under all aliases — hand-jamming an alias onto an already-run form is not acceptable (IAW UM 21-022). Each alias requires a separate run.' },
  { type:"nogo",     text:'DD 369 does not cover the jurisdiction where an offense occurred — must cover all locations where the applicant lived, worked, attended school, or committed an offense during the last 3 years.' },
  { type:"nogo",     text:'FL 601-210.04 missing when applicant was confined 24+ hours in any institution (jail, detention, juvenile facility, inpatient program) — institution must fill out and sign page 2.' },
  { type:"nogo",     text:'DA Form 3072-2 income entries are annual or weekly instead of monthly — all income must be entered as a monthly figure.' },

  { type:"category", text:"SC Checkpoint Errors" },
  { type:"nogo",     text:'SC QC not formally initiated in RZ — recruiter remarked in SC Remarks instead of clicking "Initiate Station Commander Checkpoint." SC and ASC must receive the automatic RZ email for the checkpoint to count.' },
  { type:"nogo",     text:'Complex prescreen submitted but no MEPS disposition received before projection — do not schedule for MEPS until MEPS returns a disposition on the prescreen.' },

  { type:"category", text:"Citizenship / LPR Issues" },
  { type:"nogo",     text:'LPR applicant projected without confirmed I-551 alien number, expiration date, and category code in GENESIS Citizenship Tab — all three required. Any missing field stops MEPS processing.' },
  { type:"nogo",     text:'Naturalized citizen: Naturalization Certificate not present as a certified original or raised-seal copy — photocopies not acceptable.' },
  { type:"nogo",     text:'Foreign-born citizen: Consular Report of Birth Abroad (FS-240) or Certification of Report of Birth (DS-1350) missing — required for all applicants born outside the U.S. to U.S. citizen parents.' },
];

/* ── GCRefAccordion ───────────────────────────────────── */
const GCRefAccordion = ({ title, icon, items, defaultOpen = true }) => {
  const [open, setOpen] = React.useState(defaultOpen);

  const renderItem = (item, i) => {
    if (item.type === "category") return (
      <div key={i} style={{
        fontFamily:'"GI",Arial,sans-serif', fontWeight:700, fontSize:10,
        textTransform:"uppercase", letterSpacing:".1em", color:"var(--gold)",
        padding:"14px 0 5px", borderBottom:"1px solid var(--border-mid)"
      }}>{item.text}</div>
    );
    if (item.type === "nogo") return (
      <div key={i} style={{ display:"flex", gap:8, padding:"7px 0",
        borderBottom:"1px solid var(--border)", alignItems:"flex-start" }}>
        <span style={{ color:"var(--danger)", fontWeight:700, fontSize:13,
          flexShrink:0, lineHeight:1.5 }}>✗</span>
        <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:400, fontSize:12.5,
          color:"var(--fg-alt)", lineHeight:1.65 }}>{item.text}</div>
      </div>
    );
    // step (numbered)
    return (
      <div key={i} style={{ display:"flex", gap:12, padding:"8px 0",
        borderBottom:"1px solid var(--border)" }}>
        <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:700, fontSize:11,
          color:"var(--gold)", opacity:.6, width:20, flexShrink:0, paddingTop:2 }}>{item.n}</div>
        <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:400, fontSize:12.5,
          color:"var(--fg-alt)", lineHeight:1.65, whiteSpace:"pre-line" }}>{item.text}</div>
      </div>
    );
  };

  return (
    <div style={{ marginBottom:10, border:"1px solid var(--border-mid)",
      borderLeft:"3px solid rgba(255,204,1,.4)" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width:"100%", background:"transparent", border:"none",
        borderBottom:open ? "1px solid var(--border)" : "none",
        padding:"12px 16px", display:"flex", alignItems:"center", gap:10,
        cursor:"pointer", textAlign:"left" }}>
        <span style={{ fontSize:16 }}>{icon}</span>
        <span style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:700, fontSize:12,
          textTransform:"uppercase", letterSpacing:".05em", color:"var(--fg)", flex:1 }}>
          {title}
        </span>
        <span style={{ color:"var(--fg-muted)", fontSize:12,
          transform:open ? "rotate(180deg)" : "none", transition:"transform .2s" }}>▾</span>
      </button>
      {open && (
        <div style={{ padding:"4px 16px 12px" }}>
          {items.map(renderItem)}
        </div>
      )}
    </div>
  );
};

/* ── GCReference ──────────────────────────────────────── */
const GCReference = () => (
  <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"auto",
    background:"var(--bg)" }}>
    <div style={{ maxWidth:860, margin:"0 auto", width:"100%", padding:"28px 32px 56px" }}>

      {/* Header */}
      <div style={{ marginBottom:24, paddingBottom:16, borderBottom:"2px solid var(--gold)" }}>
        <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:700, fontSize:8,
          textTransform:"uppercase", letterSpacing:".16em",
          color:"rgba(255,204,1,.4)", marginBottom:4 }}>
          AR 601-210 · USMEPCOM 601-23 · UM 21-022
        </div>
        <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:700, fontSize:20,
          textTransform:"uppercase", color:"var(--gold)", lineHeight:1.1, marginBottom:8 }}>
          GC Reference
        </div>
        <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:400, fontSize:13,
          color:"var(--fg-muted)", lineHeight:1.55, maxWidth:640 }}>
          What the Guidance Counselor checks before approving a packet for MEPS.
          Use this to self-audit from the GC&apos;s perspective before submitting.
        </div>
      </div>

      <GCRefAccordion
        title="GC Verification Steps"
        icon="✓"
        items={GC_STEPS}
        defaultOpen={true}
      />
      <GCRefAccordion
        title="Common Return Reasons"
        icon="✗"
        items={GC_RETURNS}
        defaultOpen={true}
      />

      <div style={{ height:24 }}/>
    </div>
  </div>
);

Object.assign(window, { GCReference });
ENDOFFILE
```

- [ ] **Step 2: Verify the file was written and has content**

```bash
wc -l "/Users/lucaskraat/Desktop/ARTIFACTS/.claude/worktrees/gracious-hofstadter-59432c/gc-reference.jsx"
```

Expected: 130 or more lines (the file is substantial).

- [ ] **Step 3: Commit gc-reference.jsx**

```bash
cd "/Users/lucaskraat/Desktop/ARTIFACTS/.claude/worktrees/gracious-hofstadter-59432c"
git add gc-reference.jsx
git commit -m "$(cat <<'EOF'
feat: add gc-reference.jsx with GC verification steps and return reasons

New standalone React component (GCReference) for the GC Reference tab.
Two accordion sections: 12 GC verification steps in order, and 30+
return reasons organized by category (GENESIS, Document Defects, Timing,
Waiver Errors, SC Checkpoint, Citizenship/LPR). Includes full moral
waiver packet review checklist and Mar 2026 marijuana waiver policy.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Wire TabBar and conditional rendering into Packet QC.html

Three precise edits to `Packet QC.html`:
1. Add the gc-reference.jsx script tag in the `<body>` load order
2. Add the `TabBar` component definition before `App`
3. Add `activeTab` state + `<TabBar>` + conditional render inside `App`

**Files:**
- Modify: `Packet QC.html`

- [ ] **Step 1: Add the gc-reference.jsx script tag**

Find this line in `Packet QC.html` (line 70–71 area):

```html
<script src="qc-data.js"></script>
<script type="text/babel" src="reference-drawer.jsx"></script>
```

Add `gc-reference.jsx` immediately after `reference-drawer.jsx`:

```html
<script src="qc-data.js"></script>
<script type="text/babel" src="reference-drawer.jsx"></script>
<script type="text/babel" src="gc-reference.jsx"></script>
```

- [ ] **Step 2: Add the TabBar component before the App function**

Find this exact line in `Packet QC.html` (it's the first line of the `App` definition, around line 701):

```javascript
const App = () => {
```

Insert the `TabBar` component immediately before it:

```javascript
/* ── Tab Bar ─────────────────────────────────────────── */
const TabBar = ({ activeTab, setActiveTab }) => (
  <div style={{ display:"flex", background:"#0c0a0e",
    borderBottom:"1px solid var(--border-str)", flexShrink:0 }}>
    {[
      { id:"recruiter", label:"⬛  Recruiter Checklist" },
      { id:"gc",        label:"📋  GC Reference" }
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

const App = () => {
```

- [ ] **Step 3: Add activeTab state inside App**

Find this block inside the `App` function (around line 719 — it's the last `useState` in the state declarations block):

```javascript
  const [refOpen,        setRefOpen]        = useState(false);
  const [tweaks,         setTweaks]         = useState(false);
```

Add `activeTab` state on the line immediately after `tweaks`:

```javascript
  const [refOpen,        setRefOpen]        = useState(false);
  const [tweaks,         setTweaks]         = useState(false);
  const [activeTab,      setActiveTab]      = useState("recruiter");
```

- [ ] **Step 4: Add TabBar to App's JSX and wrap content in conditional**

Find this block in the App's return statement (around line 869–873):

```jsx
    <Header theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")}
        onRefOpen={() => setRefOpen(true)}
        total={total} done={done} flagged={flagged}/>
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
```

Replace it with:

```jsx
    <Header theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")}
        onRefOpen={() => setRefOpen(true)}
        total={total} done={done} flagged={flagged}/>
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab}/>
      {activeTab === "gc" ? <GCReference/> : <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
```

- [ ] **Step 5: Close the conditional — wrap the closing tag of the content div**

Find this line in the App's return (the closing tag of the left+main panel wrapper, right before the sticker, around line 930):

```jsx
      </div>

      {/* ── STICKER ── */}
```

Replace it with:

```jsx
      </div>}

      {/* ── STICKER ── */}
```

- [ ] **Step 6: Open the app in a browser and verify tab switching**

Open:
```
/Users/lucaskraat/Desktop/ARTIFACTS/.claude/worktrees/gracious-hofstadter-59432c/Packet QC.html
```

Check all of the following:

**Recruiter Checklist tab (default):**
- Tab bar is visible below the header with two labeled tabs
- "Recruiter Checklist" tab is active (gold underline, gold text)
- Sidebar and checklist render exactly as before
- Profile form, filter bar, search, section notes, help modals all work

**GC Reference tab:**
- Click "GC Reference" — sidebar disappears, full-width GC content renders
- "GC Verification Steps" accordion is present and open, showing 12 numbered steps
- Step 12 (moral waiver) shows bullet points (•) on separate lines
- "Common Return Reasons" accordion is present and open
- Category headers appear in gold between groups (GENESIS Errors, Document Defects, etc.)
- Each return reason has a red ✗ prefix
- Clicking back to "Recruiter Checklist" restores the full sidebar+checklist

**Console:** No errors in browser dev tools console.

- [ ] **Step 7: Commit the wired-up Packet QC.html**

```bash
cd "/Users/lucaskraat/Desktop/ARTIFACTS/.claude/worktrees/gracious-hofstadter-59432c"
git add "Packet QC.html"
git commit -m "$(cat <<'EOF'
feat: add GC Reference tab to PacketQC app

Adds TabBar component below header switching between Recruiter
Checklist (existing layout, unchanged) and GC Reference (full-width
GCReference component). activeTab state in App controls rendering.
Zero changes to checklist logic, help modals, or qc-data.js.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Done — Verification Checklist

Before calling this complete, confirm:

- [ ] Tab bar renders below the header in both dark and light themes
- [ ] Switching tabs does not reset checklist state (statuses, notes, timestamps survive tab switches)
- [ ] GC Reference tab scrolls independently (not the page)
- [ ] All 12 GC verification steps present and readable
- [ ] Step 12 bullet points render on separate lines (pre-line whitespace)
- [ ] All 6 category headers present in Common Return Reasons
- [ ] All return reason entries have ✗ prefix
- [ ] Marijuana/Mar 2026 policy note present in both Step 12 and Waiver Errors category
- [ ] No console errors in dark or light theme
- [ ] Existing features unaffected: sticker animation, help modals, reference drawer, compact mode, search/filter
