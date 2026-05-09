# OPAT Calculator Command Center Revamp — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `OPAT_Calculator.html` with the U.S. Army "Be All You Can Be." visual identity — Army Black canvas, G.I. typeface, exposed-grid layout, dominant PDC result panel — while preserving all scoring logic exactly.

**Architecture:** Single HTML file rewrite. CSS replaced wholesale; HTML restructured around three zones (sticky header / PDC result panel / content area); JS scoring logic preserved with color references updated to new palette. G.I. fonts are already in `fonts/`.

**Tech Stack:** Vanilla HTML/CSS/JS, Chart.js 4.4.1 (CDN, unchanged), G.I. TTF fonts (local)

---

## File

- Modify: `OPAT_Calculator.html` (1369 lines — full rewrite of `<head>`, `<style>`, HTML body, and JS color references)

---

## Task 1: Replace the `<style>` block

**Files:**
- Modify: `OPAT_Calculator.html` lines 11–640

Replace everything between `<style>` and `</style>` tags with the complete Army brand CSS below.

- [ ] **Step 1: Open `OPAT_Calculator.html` and replace lines 11–640 (the entire content of the `<style>` block) with the following:**

```css
/* ── FONTS ─────────────────────────────────────────────────────────────────── */
@font-face{font-family:'G.I.';src:url('fonts/G.I.-400.ttf') format('truetype');font-weight:400;font-style:normal;}
@font-face{font-family:'G.I.';src:url('fonts/G.I.-400Italic.ttf') format('truetype');font-weight:400;font-style:italic;}
@font-face{font-family:'G.I.';src:url('fonts/G.I.-530.ttf') format('truetype');font-weight:530;font-style:normal;}
@font-face{font-family:'G.I.';src:url('fonts/G.I.-530Italic.ttf') format('truetype');font-weight:530;font-style:italic;}
@font-face{font-family:'G.I.';src:url('fonts/G.I.-750.ttf') format('truetype');font-weight:750;font-style:normal;}
@font-face{font-family:'G.I.';src:url('fonts/G.I.-750Italic.ttf') format('truetype');font-weight:750;font-style:italic;}

/* ── VARIABLES ──────────────────────────────────────────────────────────────── */
:root{
  --army-black:  #221F20;
  --army-gold:   #FFCC01;
  --army-green:  #2F372F;
  --white:       #FFFFFF;
  --field-01:    #3F4B36;
  --gray-01:     #A8A6A2;
  --gray-02:     #6E6C68;
  --hi-red:      #A02E2E;
}

/* ── RESET ──────────────────────────────────────────────────────────────────── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{min-height:100%;}
body{
  background:var(--army-black);
  color:var(--white);
  font-family:'G.I.',Eurostile,'DIN Next',Archivo,system-ui,sans-serif;
  font-weight:400;
  font-size:16px;
  overflow-x:hidden;
  hyphens:none;
}

/* ── HEADER ─────────────────────────────────────────────────────────────────── */
.site-header{
  position:sticky;top:0;z-index:50;
  background:var(--army-black);
  border-bottom:2px solid var(--army-gold);
  height:64px;
  display:flex;align-items:center;
  padding:0 5%;gap:16px;
}
.header-back{
  display:flex;align-items:center;gap:8px;
  text-decoration:none;color:var(--gray-01);
  font-weight:530;font-size:11px;letter-spacing:1px;text-transform:uppercase;
  border-right:1px solid var(--gray-02);padding-right:16px;margin-right:4px;
  transition:color 0.15s;
}
.header-back:hover{color:var(--army-gold);}
.header-star{flex-shrink:0;}
.header-wordmark{
  font-weight:750;font-size:13px;letter-spacing:0.5px;
  text-transform:uppercase;color:var(--white);
}
.header-sep{color:var(--gray-02);margin:0 6px;font-weight:400;}
.header-tool{
  font-weight:750;font-size:18px;letter-spacing:0.5px;
  text-transform:uppercase;color:var(--army-gold);
}
.header-subtitle{
  font-weight:530;font-size:10px;letter-spacing:0.5px;
  color:var(--gray-01);text-transform:uppercase;margin-left:4px;
  display:flex;align-items:center;gap:6px;
}
.header-subtitle::before{content:'·';color:var(--gray-02);}
.header-right{margin-left:auto;text-align:right;}
.header-class{
  font-size:10px;font-weight:530;letter-spacing:1px;
  color:var(--gray-01);text-transform:uppercase;
}
.header-time{
  font-size:10px;font-weight:400;color:var(--gray-02);
  letter-spacing:0.5px;margin-top:2px;
}

/* ── PDC RESULT PANEL ────────────────────────────────────────────────────────── */
.pdc-panel{
  background:var(--army-black);
  border-bottom:1px solid rgba(255,255,255,0.1);
  padding:28px 5%;
  display:flex;align-items:center;gap:48px;flex-wrap:wrap;
  animation:fadeUp 0.2s cubic-bezier(0.2,0.6,0,1) both;
}
.pdc-grade-block{flex:1;min-width:240px;}
.pdc-micro{
  font-size:10px;font-weight:530;letter-spacing:1px;
  color:var(--gray-01);text-transform:uppercase;margin-bottom:6px;
}
.pdc-grade{
  font-family:'G.I.',sans-serif;font-weight:750;
  font-size:clamp(72px,12vw,136px);
  line-height:0.88;text-transform:uppercase;letter-spacing:-1px;
  transition:color 0.15s cubic-bezier(0.85,0,0.15,1);
}
.pdc-grade.grade-black{color:var(--white);}
.pdc-grade.grade-gray {color:var(--gray-01);}
.pdc-grade.grade-gold {color:var(--army-gold);}
.pdc-grade.grade-white{color:var(--hi-red);}
.pdc-sub{
  font-size:13px;font-weight:400;color:var(--gray-01);
  margin-top:8px;letter-spacing:0.3px;
}
.pdc-stats{display:flex;gap:20px;margin-top:14px;flex-wrap:wrap;}
.pdc-stat{
  font-size:11px;font-weight:530;letter-spacing:0.5px;
  color:var(--white);text-transform:uppercase;
  border-left:2px solid var(--army-gold);padding-left:10px;
}
.pdc-stat .stat-label{color:var(--gray-01);}

/* band chips */
.band-chips{
  display:flex;flex-direction:column;gap:5px;
  min-width:260px;
}
.band-chip{
  display:flex;align-items:center;gap:12px;
  padding:9px 14px;
  border:2px solid var(--gray-02);
  font-size:12px;font-weight:530;letter-spacing:0.5px;text-transform:uppercase;
  color:var(--gray-02);
  transition:all 0.15s cubic-bezier(0.85,0,0.15,1);
}
.band-chip-name{font-weight:750;}
.band-chip-desc{opacity:0.7;flex:1;}
.band-chip-status{margin-left:auto;font-weight:750;}
.band-chip.active-black{border-color:var(--white);background:rgba(255,255,255,0.08);color:var(--white);}
.band-chip.active-gray {border-color:var(--gray-01);background:rgba(168,166,162,0.08);color:var(--gray-01);}
.band-chip.active-gold {border-color:var(--army-gold);background:rgba(255,204,1,0.1);color:var(--army-gold);}

/* ── SECTION HEADER ──────────────────────────────────────────────────────────── */
.section-hdr{
  padding:10px 5%;
  font-size:11px;font-weight:530;letter-spacing:1px;
  color:var(--army-gold);text-transform:uppercase;
  background:var(--army-green);
  border-top:2px solid rgba(255,255,255,0.1);
  border-bottom:2px solid rgba(255,255,255,0.1);
}

/* ── CONTENT AREA ────────────────────────────────────────────────────────────── */
.content-area{background:var(--army-green);padding:0 5% 48px;}

/* ── EXPOSED GRID ────────────────────────────────────────────────────────────── */
.exp-grid-2{
  display:grid;grid-template-columns:1fr 1fr;
  border:2px solid rgba(255,255,255,0.15);
  margin-bottom:32px;
}
.exp-grid-2col{
  display:grid;grid-template-columns:1fr 1fr;
  border:2px solid rgba(255,255,255,0.15);
  margin-bottom:32px;
}
.grid-cell{
  border:1px solid rgba(255,255,255,0.1);
  margin:-1px 0 0 -1px;
  padding:20px 24px 24px;
  background:var(--field-01);
  animation:fadeUp 0.3s cubic-bezier(0.2,0.6,0,1) both;
}
.grid-cell:nth-child(2){animation-delay:.05s;}
.grid-cell:nth-child(3){animation-delay:.10s;}
.grid-cell:nth-child(4){animation-delay:.15s;}

/* ── EVENT CELL ──────────────────────────────────────────────────────────────── */
.event-eyebrow{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.event-num-lbl{font-size:10px;font-weight:530;letter-spacing:1px;color:var(--army-gold);text-transform:uppercase;}
.event-abbr-badge{
  font-size:10px;font-weight:750;letter-spacing:0.5px;color:var(--army-gold);
  border:2px solid var(--army-gold);padding:2px 8px;text-transform:uppercase;
}
.event-title{font-weight:750;font-size:21px;letter-spacing:0.3px;text-transform:uppercase;color:var(--white);margin-bottom:14px;line-height:1.1;}
.metric-row{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:5px;}
.metric-lbl{font-size:10px;font-weight:530;letter-spacing:0.5px;color:var(--gray-01);text-transform:uppercase;}
.metric-val{font-size:13px;font-weight:530;color:var(--white);}

/* ── INPUTS ──────────────────────────────────────────────────────────────────── */
.input-row{display:flex;align-items:center;gap:10px;margin-bottom:6px;}
input[type=range]{
  flex:1;-webkit-appearance:none;appearance:none;
  height:3px;background:var(--gray-02);outline:none;cursor:pointer;
}
input[type=range]::-webkit-slider-thumb{
  -webkit-appearance:none;width:14px;height:14px;
  background:var(--army-gold);cursor:pointer;border:none;border-radius:0;
}
input[type=range]::-moz-range-thumb{
  width:14px;height:14px;background:var(--army-gold);
  cursor:pointer;border-radius:0;border:none;
}
input[type=number]{
  width:72px;background:var(--army-black);border:2px solid var(--army-gold);
  color:var(--white);font-family:'G.I.',sans-serif;font-weight:400;font-size:15px;
  padding:5px 8px;text-align:center;outline:none;
  -moz-appearance:textfield;
}
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
input[type=number]:focus{outline:3px solid var(--army-gold);outline-offset:3px;}
.input-hint{
  font-size:9px;font-weight:530;letter-spacing:0.5px;
  color:var(--gray-02);text-transform:uppercase;margin-bottom:10px;
}

/* ── THRESHOLD TRACK ─────────────────────────────────────────────────────────── */
.thresh-track{
  height:4px;background:var(--gray-02);
  position:relative;margin:4px 0 5px;overflow:visible;
}
.thresh-fill{
  position:absolute;top:0;left:0;bottom:0;
  transition:width 0.3s cubic-bezier(0.85,0,0.15,1),background 0.2s;
}
.thresh-marker{position:absolute;top:-5px;width:2px;height:14px;background:currentColor;}
.thresh-marker.gold-m {color:var(--army-gold);opacity:0.85;}
.thresh-marker.gray-m {color:var(--gray-01);opacity:0.85;}
.thresh-marker.black-m{color:var(--white);opacity:0.6;}
.thresh-labels{
  display:flex;justify-content:space-between;
  font-size:9px;font-weight:530;letter-spacing:0.5px;
  color:var(--gray-02);text-transform:uppercase;margin-bottom:10px;
}

/* ── GRADE BADGE ─────────────────────────────────────────────────────────────── */
.grade-badge{
  display:inline-flex;align-items:center;gap:8px;
  padding:7px 14px;border:2px solid var(--gray-02);
  margin-top:6px;transition:border-color 0.2s,background 0.2s;
}
.grade-badge.black{border-color:var(--white);background:rgba(255,255,255,0.06);}
.grade-badge.gray {border-color:var(--gray-01);background:rgba(168,166,162,0.08);}
.grade-badge.gold {border-color:var(--army-gold);background:rgba(255,204,1,0.08);}
.grade-badge.white{border-color:var(--hi-red);background:rgba(160,46,46,0.10);}
.grade-badge.none {border-color:var(--gray-02);background:transparent;}
.grade-badge-icon{font-size:14px;}
.grade-badge-text{font-weight:750;font-size:15px;letter-spacing:0.5px;text-transform:uppercase;}
.grade-badge-sub {font-size:9px;font-weight:530;letter-spacing:1px;color:var(--gray-01);text-transform:uppercase;margin-top:1px;}

/* ── SDL LADDER ──────────────────────────────────────────────────────────────── */
.sdl-ladder{display:flex;gap:4px;flex-wrap:wrap;margin:8px 0 4px;}
.sdl-step{
  font-size:10px;font-weight:530;padding:4px 8px;
  border:1px solid var(--gray-02);color:var(--gray-02);
  cursor:pointer;letter-spacing:0.5px;transition:all 0.15s;user-select:none;
}
.sdl-step:hover{border-color:var(--army-gold);color:var(--army-gold);}

/* ── IAR INPUTS ──────────────────────────────────────────────────────────────── */
.iar-inputs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;}
.iar-field-lbl{font-size:10px;font-weight:530;letter-spacing:1px;color:var(--gray-01);text-transform:uppercase;margin-bottom:5px;}
.iar-inputs input[type=number]{width:100%;font-size:22px;padding:10px 12px;}
.iar-total-line{font-size:11px;font-weight:530;letter-spacing:0.5px;color:var(--gray-01);text-transform:uppercase;margin-bottom:10px;}
.iar-total-line strong{color:var(--army-gold);font-weight:750;}
.iar-thresholds{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-bottom:10px;}
.iar-tc{padding:6px 10px;border:2px solid;}
.iar-tc.gc{border-color:var(--army-gold);background:rgba(255,204,1,0.05);}
.iar-tc.sc{border-color:var(--gray-01);background:rgba(168,166,162,0.05);}
.iar-tc.bc{border-color:var(--white);background:rgba(255,255,255,0.04);}
.iar-tb{font-size:9px;font-weight:530;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;}
.iar-tc.gc .iar-tb{color:var(--army-gold);}
.iar-tc.sc .iar-tb{color:var(--gray-01);}
.iar-tc.bc .iar-tb{color:var(--white);}
.iar-tv{font-weight:750;font-size:16px;letter-spacing:0.3px;text-transform:uppercase;}
.iar-tc.gc .iar-tv{color:var(--army-gold);}
.iar-tc.sc .iar-tv{color:var(--gray-01);}
.iar-tc.bc .iar-tv{color:var(--white);}
.iar-ts{font-size:9px;color:var(--gray-02);letter-spacing:0.5px;margin-top:2px;}

/* ── ANALYSIS PANELS ─────────────────────────────────────────────────────────── */
.chart-cell{background:var(--army-black);padding:20px 24px;}
.chart-cell-hdr{
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:14px;padding-bottom:10px;
  border-bottom:1px solid rgba(255,255,255,0.08);
}
.chart-cell-title{font-weight:750;font-size:13px;letter-spacing:0.5px;text-transform:uppercase;color:var(--white);}
.chart-cell-sub{font-size:10px;font-weight:530;letter-spacing:0.5px;color:var(--gray-02);text-transform:uppercase;}
.radar-wrap{position:relative;height:280px;width:100%;}

/* ── THRESHOLD TABLE ─────────────────────────────────────────────────────────── */
.thresh-table{width:100%;border-collapse:collapse;}
.thresh-table th{
  padding:8px 12px;text-align:left;
  font-size:11px;font-weight:530;letter-spacing:1px;text-transform:uppercase;
  background:var(--army-gold);color:var(--army-black);border:none;
}
.thresh-table td{
  padding:8px 12px;
  border-bottom:1px solid rgba(255,255,255,0.06);
  font-size:12px;font-weight:530;letter-spacing:0.5px;
}
.thresh-table tr:last-child td{border-bottom:none;}
.thresh-table tr.row-black td{color:var(--white);}
.thresh-table tr.row-gray  td{color:var(--gray-01);}
.thresh-table tr.row-gold  td{color:var(--army-gold);}
.thresh-table tr.row-white td{color:var(--hi-red);}
.thresh-table td.you{font-weight:750;}
.thresh-table tr.your-row{background:rgba(255,204,1,0.06);}
.thresh-table tr.your-row td{border-top:2px solid var(--army-gold);}
.thresh-table tr.your-row td:first-child{color:var(--army-gold);font-weight:750;}
.band-pip{display:inline-block;width:3px;height:14px;margin-right:8px;vertical-align:middle;}
.band-pip.black{background:var(--white);}
.band-pip.gray {background:var(--gray-01);}
.band-pip.gold {background:var(--army-gold);}
.band-pip.white{background:var(--hi-red);}

/* ── MOS SECTION ─────────────────────────────────────────────────────────────── */
.mos-section{margin-bottom:32px;}
.mos-grid{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
  border:2px solid rgba(255,255,255,0.1);
  background:var(--army-black);
}
.mos-item{
  padding:10px 14px;
  border:1px solid rgba(255,255,255,0.07);
  margin:-1px 0 0 -1px;
  display:flex;align-items:center;justify-content:space-between;gap:8px;
  background:var(--army-black);
}
.mos-code{font-size:11px;font-weight:750;color:var(--gray-01);letter-spacing:0.5px;white-space:nowrap;}
.mos-title{font-size:12px;font-weight:400;color:var(--white);flex:1;}
.mos-dot{width:8px;height:8px;flex-shrink:0;}
.mos-dot.black{background:var(--white);}
.mos-dot.gray {background:var(--gray-01);}
.mos-dot.gold {background:var(--army-gold);}

/* ── FOOTER ──────────────────────────────────────────────────────────────────── */
.site-footer{
  background:var(--army-black);
  border-top:2px solid rgba(255,255,255,0.08);
  padding:16px 5%;
  display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;
  font-size:10px;font-weight:530;letter-spacing:0.5px;
  color:var(--gray-02);text-transform:uppercase;
}

/* ── ANIMATIONS ──────────────────────────────────────────────────────────────── */
@keyframes fadeUp{
  from{opacity:0;transform:translateY(8px);}
  to  {opacity:1;transform:translateY(0);}
}

/* ── RESPONSIVE ──────────────────────────────────────────────────────────────── */
@media(max-width:800px){
  .exp-grid-2,.exp-grid-2col{grid-template-columns:1fr;}
  .pdc-panel{gap:24px;}
  .band-chips{min-width:unset;width:100%;}
  .pdc-grade{font-size:clamp(56px,16vw,96px);}
}
```

- [ ] **Step 2: Verify the `<style>` tags are intact.** The file should still have `<style>` on one line and `</style>` on another surrounding this new CSS. Search for `@font-face` in the saved file to confirm the new content was written.

---

## Task 2: Update `<head>` — remove Google Fonts

**Files:**
- Modify: `OPAT_Calculator.html` lines 7–9

The current head has three lines loading Google Fonts (Rajdhani, Share Tech Mono, Oswald). These are replaced by G.I. via `@font-face` in the new CSS. Remove them.

- [ ] **Step 1: Delete the three Google Fonts lines** (lines 7–9 in the original file; after CSS replacement they may have shifted):

Remove these lines:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet">
```

The `<head>` should now read:
```html
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>OPAT — Occupational Physical Assessment Test</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
<style>
  /* ... new CSS ... */
</style>
</head>
```

- [ ] **Step 2: Confirm Chart.js `<script>` tag is still present** in `<head>`. It must not be removed.

---

## Task 3: Rebuild HTML body — header and PDC result panel

**Files:**
- Modify: `OPAT_Calculator.html` — replace `<body>` open through the end of `</div><!-- result-hero -->` (approximately old lines 642–700)

Replace the old `<header>` block, `<div class="main-wrap">` open, `<div class="status-bar">`, and `<div class="result-hero">` with the following. **Preserve all JS-referenced IDs exactly**: `#timestamp`, `#hero-grade`, `#hero-sub`, `#sb-lowest`, `#sb-pdc`, `#sb-grade`.

- [ ] **Step 1: Replace the old header + status-bar + result-hero HTML.** The old block to remove runs from `<body>` through the closing `</div>` of `.result-hero` (approximately old lines 642–700). Replace with:

```html
<body>

<!-- HEADER -->
<header class="site-header">
  <a class="header-back" href="index.html">← Toolbox</a>
  <svg class="header-star" width="22" height="22" viewBox="0 0 22 22" fill="none" aria-label="U.S. Army">
    <polygon points="11,1.5 13.6,8.2 21,8.2 15.2,12.6 17.4,19.5 11,15.2 4.6,19.5 6.8,12.6 1,8.2 8.4,8.2" fill="#FFCC01"/>
  </svg>
  <span class="header-wordmark">U.S. Army</span>
  <span class="header-sep">|</span>
  <span class="header-tool">OPAT</span>
  <span class="header-subtitle">Occupational Physical Assessment Test</span>
  <div class="header-right">
    <div class="header-class">For Official Use Only &nbsp;·&nbsp; Unofficial Tool &nbsp;·&nbsp; Updated Oct 2021</div>
    <div class="header-time" id="timestamp">--:--:-- UTC</div>
  </div>
</header>

<!-- PDC RESULT PANEL -->
<section class="pdc-panel">
  <div class="pdc-grade-block">
    <div class="pdc-micro">Physical Demand Category</div>
    <div class="pdc-grade grade-white" id="hero-grade">—</div>
    <div class="pdc-sub" id="hero-sub">Enter scores below to calculate.</div>
    <div class="pdc-stats">
      <div class="pdc-stat"><span class="stat-label">Lowest event: </span><span id="sb-lowest">—</span></div>
      <div class="pdc-stat"><span class="stat-label">PDC qualified: </span><span id="sb-pdc">—</span></div>
    </div>
  </div>
  <div class="band-chips">
    <div class="band-chip" id="chip-black">
      <span class="band-chip-name">Black</span>
      <span class="band-chip-desc">Heavy PDC</span>
      <span class="band-chip-status">✗</span>
    </div>
    <div class="band-chip" id="chip-gray">
      <span class="band-chip-name">Gray</span>
      <span class="band-chip-desc">Significant PDC</span>
      <span class="band-chip-status">✗</span>
    </div>
    <div class="band-chip" id="chip-gold">
      <span class="band-chip-name">Gold</span>
      <span class="band-chip-desc">Moderate PDC</span>
      <span class="band-chip-status">✗</span>
    </div>
  </div>
</section>

<!-- hidden compat — JS still writes these; values ignored in new layout -->
<span id="sb-grade" style="display:none"></span>
<div id="hero-mos" style="display:none"></div>

<div class="content-area">
```

- [ ] **Step 2: Confirm the old `<div class="main-wrap">` open tag is removed.** In the new structure `<div class="content-area">` replaces it.

---

## Task 4: Rebuild HTML body — event input grid (section 01)

**Files:**
- Modify: `OPAT_Calculator.html` — replace the old `<div class="section-label">01 // EVENT INPUTS...` block through the closing `</div><!-- /grid -->` (approximately old lines 703–908)

All JS-referenced IDs must be preserved exactly: `#card-slj`, `#card-spt`, `#card-sdl`, `#card-iar`, `#badge-slj`, `#badge-spt`, `#badge-sdl`, `#badge-iar`, `#badge-slj-text`, `#badge-spt-text`, `#badge-sdl-text`, `#badge-iar-text`, `#fill-slj`, `#fill-spt`, `#fill-sdl`, `#val-slj`, `#val-spt`, `#val-sdl`, `#iar-total`, `#rng-slj`, `#txt-slj`, `#rng-spt`, `#txt-spt`, `#rng-sdl`, `#txt-sdl`, `#txt-iar-lvl`, `#txt-iar-sht`, `.sdl-step[data-w]`.

- [ ] **Step 1: Remove old section-label and grid-2 HTML, insert new exposed-grid section:**

```html
<!-- SECTION 01: EVENT INPUTS -->
<div class="section-hdr">01 &nbsp;// &nbsp;Event Inputs &amp; Scoring</div>

<div class="exp-grid-2">

  <!-- SLJ -->
  <div class="grid-cell event-card none" id="card-slj">
    <div class="event-eyebrow">
      <span class="event-num-lbl">Event 01 / SLJ</span>
      <span class="event-abbr-badge">SLJ</span>
    </div>
    <div class="event-title">Standing Long Jump</div>
    <div class="metric-row">
      <span class="metric-lbl">Jump Distance</span>
      <span class="metric-val" id="val-slj">—</span>
    </div>
    <div class="input-row">
      <input type="range" id="rng-slj" min="20" max="110" step="1" value="55">
      <input type="number" id="txt-slj" value="55" min="20" max="110">
    </div>
    <div class="input-hint">Inches &nbsp;·&nbsp; Range: 20–110 in</div>
    <div class="thresh-track">
      <div class="thresh-fill" id="fill-slj" style="width:0%;background:var(--gray-02);"></div>
      <div class="thresh-marker gold-m"  style="left:30.43%;"></div>
      <div class="thresh-marker gray-m"  style="left:38.69%;"></div>
      <div class="thresh-marker black-m" style="left:47.82%;"></div>
    </div>
    <div class="thresh-labels">
      <span>20"</span><span>Gold 47"</span><span>Gray 55"</span><span>Black 63"</span><span>110"</span>
    </div>
    <div class="grade-badge none" id="badge-slj">
      <span class="grade-badge-icon">—</span>
      <div>
        <div class="grade-badge-text" id="badge-slj-text">No Score</div>
        <div class="grade-badge-sub">Lower Body Power</div>
      </div>
    </div>
  </div>

  <!-- SPT -->
  <div class="grid-cell event-card none" id="card-spt">
    <div class="event-eyebrow">
      <span class="event-num-lbl">Event 02 / SPT</span>
      <span class="event-abbr-badge">SPT</span>
    </div>
    <div class="event-title">Seated Power Throw</div>
    <div class="metric-row">
      <span class="metric-lbl">Throw Distance</span>
      <span class="metric-val" id="val-spt">—</span>
    </div>
    <div class="input-row">
      <input type="range" id="rng-spt" min="150" max="700" step="10" value="400">
      <input type="number" id="txt-spt" value="400" min="150" max="700" step="10">
    </div>
    <div class="input-hint">Centimeters &nbsp;·&nbsp; 4.4 lb medicine ball &nbsp;·&nbsp; Range: 150–700 cm</div>
    <div class="thresh-track">
      <div class="thresh-fill" id="fill-spt" style="width:0%;background:var(--gray-02);"></div>
      <div class="thresh-marker gold-m"  style="left:36.36%;"></div>
      <div class="thresh-marker gray-m"  style="left:45.45%;"></div>
      <div class="thresh-marker black-m" style="left:54.55%;"></div>
    </div>
    <div class="thresh-labels">
      <span>150</span><span>Gold 350</span><span>Gray 400</span><span>Black 450</span><span>700</span>
    </div>
    <div class="grade-badge none" id="badge-spt">
      <span class="grade-badge-icon">—</span>
      <div>
        <div class="grade-badge-text" id="badge-spt-text">No Score</div>
        <div class="grade-badge-sub">Upper Body Power</div>
      </div>
    </div>
  </div>

  <!-- SDL -->
  <div class="grid-cell event-card none" id="card-sdl">
    <div class="event-eyebrow">
      <span class="event-num-lbl">Event 03 / SDL</span>
      <span class="event-abbr-badge">SDL</span>
    </div>
    <div class="event-title">Strength Deadlift</div>
    <div class="metric-row">
      <span class="metric-lbl">Max Lift</span>
      <span class="metric-val" id="val-sdl">—</span>
    </div>
    <div class="input-row">
      <input type="range" id="rng-sdl" min="60" max="220" step="20" value="140">
      <input type="number" id="txt-sdl" value="140" min="60" max="220" step="20">
    </div>
    <div class="input-hint">Pounds (hex bar) &nbsp;·&nbsp; Ladder: 60, 120, 140, 160, 180, 190, 200, 210, 220</div>
    <div class="sdl-ladder">
      <div class="sdl-step" id="sdl-60"  data-w="60">60</div>
      <div class="sdl-step" id="sdl-120" data-w="120">120</div>
      <div class="sdl-step" id="sdl-140" data-w="140">140★</div>
      <div class="sdl-step" id="sdl-160" data-w="160">160★</div>
      <div class="sdl-step" id="sdl-180" data-w="180">180</div>
      <div class="sdl-step" id="sdl-190" data-w="190">190</div>
      <div class="sdl-step" id="sdl-200" data-w="200">200</div>
      <div class="sdl-step" id="sdl-210" data-w="210">210</div>
      <div class="sdl-step" id="sdl-220" data-w="220">220</div>
    </div>
    <div class="input-hint">★ = threshold weight (click to select)</div>
    <div class="thresh-track">
      <div class="thresh-fill" id="fill-sdl" style="width:0%;background:var(--gray-02);"></div>
      <div class="thresh-marker gold-m"  style="left:37.5%;"></div>
      <div class="thresh-marker gray-m"  style="left:50%;"></div>
      <div class="thresh-marker black-m" style="left:62.5%;"></div>
    </div>
    <div class="thresh-labels">
      <span>60</span><span>Gold 120</span><span>Gray 140</span><span>Black 160</span><span>220</span>
    </div>
    <div class="grade-badge none" id="badge-sdl">
      <span class="grade-badge-icon">—</span>
      <div>
        <div class="grade-badge-text" id="badge-sdl-text">No Score</div>
        <div class="grade-badge-sub">Lower Body Strength</div>
      </div>
    </div>
  </div>

  <!-- IAR -->
  <div class="grid-cell event-card none" id="card-iar">
    <div class="event-eyebrow">
      <span class="event-num-lbl">Event 04 / IAR</span>
      <span class="event-abbr-badge">IAR</span>
    </div>
    <div class="event-title">Interval Aerobic Run</div>
    <div class="iar-inputs">
      <div>
        <div class="iar-field-lbl">Level (1–10+)</div>
        <input type="number" id="txt-iar-lvl" value="5" min="1" max="15" step="1" oninput="syncIAR()">
      </div>
      <div>
        <div class="iar-field-lbl">Shuttle (1–13)</div>
        <input type="number" id="txt-iar-sht" value="8" min="1" max="13" step="1" oninput="syncIAR()">
      </div>
    </div>
    <div class="iar-total-line">Total shuttles: <strong id="iar-total">—</strong> &nbsp;·&nbsp; Beep test / 20m shuttle run</div>
    <div class="iar-thresholds">
      <div class="iar-tc gc">
        <div class="iar-tb">Gold</div>
        <div class="iar-tv">Lvl 5-4</div>
        <div class="iar-ts">36 shuttles</div>
      </div>
      <div class="iar-tc sc">
        <div class="iar-tb">Gray</div>
        <div class="iar-tv">Lvl 5-8</div>
        <div class="iar-ts">40 shuttles</div>
      </div>
      <div class="iar-tc bc">
        <div class="iar-tb">Black</div>
        <div class="iar-tv">Lvl 6-2</div>
        <div class="iar-ts">43 shuttles</div>
      </div>
    </div>
    <div class="grade-badge none" id="badge-iar">
      <span class="grade-badge-icon">—</span>
      <div>
        <div class="grade-badge-text" id="badge-iar-text">No Score</div>
        <div class="grade-badge-sub">Aerobic Capacity</div>
      </div>
    </div>
  </div>

</div><!-- /exp-grid-2 -->
```

- [ ] **Step 2: Verify the old `<div class="grid grid-2">` and all its contents are removed** and no duplicate event cells exist.

---

## Task 5: Rebuild HTML body — analysis section, MOS reference, and footer

**Files:**
- Modify: `OPAT_Calculator.html` — replace old lines from `<div class="section-label">02 // PERFORMANCE ANALYSIS` through `</footer>` and `</body></html>`

JS-referenced IDs to preserve: `#radar-chart`, `#bar-chart`, `#td-black`, `#td-gray`, `#td-gold`, `#td-white`, `#td-you-slj`, `#td-you-spt`, `#td-you-sdl`, `#td-you-iar`, `#td-you-grade`. `.mos-dot.black/gray/gold` class pattern.

- [ ] **Step 1: Remove old analysis + MOS + footer HTML, insert new:**

```html
<!-- SECTION 02: PERFORMANCE ANALYSIS -->
<div class="section-hdr">02 &nbsp;// &nbsp;Performance Analysis</div>

<div class="exp-grid-2col">

  <!-- RADAR CHART -->
  <div class="grid-cell chart-cell" style="background:var(--army-black);">
    <div class="chart-cell-hdr">
      <span class="chart-cell-title">Event Profile</span>
      <span class="chart-cell-sub">Radar / Performance</span>
    </div>
    <div class="radar-wrap">
      <canvas id="radar-chart"></canvas>
    </div>
  </div>

  <!-- THRESHOLD TABLE -->
  <div class="grid-cell chart-cell" style="background:var(--army-black);padding-bottom:0;">
    <div class="chart-cell-hdr">
      <span class="chart-cell-title">Scoring Thresholds</span>
      <span class="chart-cell-sub" style="color:var(--army-gold);">Your score highlighted</span>
    </div>
    <table class="thresh-table">
      <thead>
        <tr>
          <th>PDC</th><th>SLJ (in)</th><th>SPT (cm)</th><th>SDL (lbs)</th><th>IAR</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr class="row-black">
          <td><span class="band-pip black"></span>Black</td>
          <td>63"</td><td>450</td><td>160</td><td>6-2 (43)</td>
          <td id="td-black">—</td>
        </tr>
        <tr class="row-gray">
          <td><span class="band-pip gray"></span>Gray</td>
          <td>55"</td><td>400</td><td>140</td><td>5-8 (40)</td>
          <td id="td-gray">—</td>
        </tr>
        <tr class="row-gold">
          <td><span class="band-pip gold"></span>Gold</td>
          <td>47"</td><td>350</td><td>120</td><td>5-4 (36)</td>
          <td id="td-gold">—</td>
        </tr>
        <tr class="row-white">
          <td><span class="band-pip white"></span>White</td>
          <td colspan="4">Below Gold minimum (any event)</td>
          <td id="td-white">—</td>
        </tr>
        <tr class="your-row">
          <td>&#9658; Your Score</td>
          <td class="you" id="td-you-slj">—</td>
          <td class="you" id="td-you-spt">—</td>
          <td class="you" id="td-you-sdl">—</td>
          <td class="you" id="td-you-iar">—</td>
          <td class="you" id="td-you-grade">—</td>
        </tr>
      </tbody>
    </table>
  </div>

</div><!-- /exp-grid-2col -->

<!-- BAR CHART -->
<div class="section-hdr" style="margin-bottom:0;">Event vs. Thresholds &nbsp;<span style="font-weight:400;color:var(--gray-02);">— Normalized 0–100%</span></div>
<div style="background:var(--army-black);padding:20px 24px 20px;margin-bottom:32px;border:2px solid rgba(255,255,255,0.1);border-top:none;">
  <div style="position:relative;height:200px;">
    <canvas id="bar-chart"></canvas>
  </div>
</div>

<!-- SECTION 03: MOS REFERENCE -->
<div class="section-hdr">03 &nbsp;// &nbsp;MOS Physical Demand Categories</div>
<div class="mos-section">
  <div class="mos-grid">
    <div class="mos-item"><span class="mos-code">11A/B/C</span><span class="mos-title">Infantry</span><div class="mos-dot black"></div></div>
    <div class="mos-item"><span class="mos-code">12B</span><span class="mos-title">Combat Engineer</span><div class="mos-dot black"></div></div>
    <div class="mos-item"><span class="mos-code">13B</span><span class="mos-title">Field Artillery</span><div class="mos-dot black"></div></div>
    <div class="mos-item"><span class="mos-code">13F</span><span class="mos-title">Fire Support</span><div class="mos-dot black"></div></div>
    <div class="mos-item"><span class="mos-code">19D</span><span class="mos-title">Cavalry Scout</span><div class="mos-dot black"></div></div>
    <div class="mos-item"><span class="mos-code">19K</span><span class="mos-title">Armor Crewman</span><div class="mos-dot black"></div></div>
    <div class="mos-item"><span class="mos-code">68W</span><span class="mos-title">Combat Medic</span><div class="mos-dot black"></div></div>
    <div class="mos-item"><span class="mos-code">11Z</span><span class="mos-title">Inf. Senior SGT</span><div class="mos-dot black"></div></div>
    <div class="mos-item"><span class="mos-code">31A/B</span><span class="mos-title">Military Police</span><div class="mos-dot gray"></div></div>
    <div class="mos-item"><span class="mos-code">25U</span><span class="mos-title">Signal Support</span><div class="mos-dot gray"></div></div>
    <div class="mos-item"><span class="mos-code">92F</span><span class="mos-title">Petroleum Supply</span><div class="mos-dot gray"></div></div>
    <div class="mos-item"><span class="mos-code">79R</span><span class="mos-title">Recruiter</span><div class="mos-dot gray"></div></div>
    <div class="mos-item"><span class="mos-code">17C/E</span><span class="mos-title">Cyber</span><div class="mos-dot gold"></div></div>
    <div class="mos-item"><span class="mos-code">35T</span><span class="mos-title">MI Systems</span><div class="mos-dot gold"></div></div>
    <div class="mos-item"><span class="mos-code">42A</span><span class="mos-title">HR Specialist</span><div class="mos-dot gold"></div></div>
    <div class="mos-item"><span class="mos-code">25B</span><span class="mos-title">IT Specialist</span><div class="mos-dot gold"></div></div>
    <div class="mos-item"><span class="mos-code">68A</span><span class="mos-title">Biomedical</span><div class="mos-dot gold"></div></div>
    <div class="mos-item"><span class="mos-code">09W</span><span class="mos-title">Warrant Off. Cand.</span><div class="mos-dot gold"></div></div>
  </div>
</div>

</div><!-- /content-area -->

<footer class="site-footer">
  <span>Source: FM 7-22 &nbsp;·&nbsp; TRADOC PAM 350-70-14 &nbsp;·&nbsp; OPAT Grading Standards (Oct 2021)</span>
  <span>Not for official use — Educational/training reference only</span>
</footer>

```

- [ ] **Step 2: Close `</body>` and `</html>` tags** immediately after the footer. The file must end:

```html
</footer>

<script>
  /* ... existing script preserved ... */
</script>
</body>
</html>
```

---

## Task 6: Update JavaScript — color references, band chips, chart colors

**Files:**
- Modify: `OPAT_Calculator.html` — `<script>` block only

Four targeted changes to the existing JS. Do not touch scoring logic, IAR calculation, `lowestGrade()`, `normalize()`, input event listeners, or `initCharts()` structure.

- [ ] **Step 1: Update `GRADE_INFO` color values.** Find and replace:

Old:
```js
const GRADE_INFO = {
  black: { label:'BLACK',  sub:'Heavy PDC — Combat Arms eligible', color:'var(--black-c)', icon:'⬛', mos:'Combat Arms (11B, 19D, 12B, 13F...)' },
  gray:  { label:'GRAY',   sub:'Significant PDC — Support MOS eligible', color:'var(--gray-l)',  icon:'▪️', mos:'Significant (31A, 25U, 92F...)' },
  gold:  { label:'GOLD',   sub:'Moderate PDC — Minimum qualified', color:'var(--gold-l)', icon:'🟡', mos:'Moderate (17C, 42A, 25B...)' },
  white: { label:'WHITE',  sub:'Not qualified — BELOW minimum standard', color:'var(--red-l)',  icon:'❌', mos:'NOT QUALIFIED' },
};
```

New:
```js
const GRADE_INFO = {
  black: { label:'BLACK',  sub:'Heavy PDC — Combat Arms eligible',       color:'#FFFFFF',  icon:'', mos:'Combat Arms (11B, 19D, 12B, 13F...)' },
  gray:  { label:'GRAY',   sub:'Significant PDC — Support MOS eligible', color:'#A8A6A2',  icon:'', mos:'Significant (31A, 25U, 92F...)' },
  gold:  { label:'GOLD',   sub:'Moderate PDC — Minimum qualified',       color:'#FFCC01',  icon:'', mos:'Moderate (17C, 42A, 25B...)' },
  white: { label:'WHITE',  sub:'Not qualified — BELOW minimum standard', color:'#A02E2E',  icon:'', mos:'NOT QUALIFIED' },
};
```

- [ ] **Step 2: Update `COLORS` object inside `render()`.** Find and replace:

Old:
```js
const COLORS = {
  black:'rgba(192,200,184,0.8)', gray:'rgba(122,152,120,0.8)',
  gold:'rgba(200,168,48,0.8)',   white:'rgba(224,69,53,0.8)'
};
```

New:
```js
const COLORS = {
  black:'rgba(255,255,255,0.8)',  gray:'rgba(168,166,162,0.8)',
  gold:'rgba(255,204,1,0.85)',    white:'rgba(160,46,46,0.8)'
};
```

- [ ] **Step 3: Update SDL ladder inline styles inside `render()`.** Find and replace the full `document.querySelectorAll('.sdl-step').forEach` block:

Old:
```js
  document.querySelectorAll('.sdl-step').forEach(el => {
    const w = parseInt(el.dataset.w);
    const isActive = w === sdl;
    if(isActive){
      el.style.background = 'rgba(145,184,88,0.2)';
      el.style.color = 'var(--olive-l)';
      el.style.borderColor = 'var(--olive-l)';
    } else if(w === 120){
      el.style.background='transparent'; el.style.color='var(--gold-l)'; el.style.borderColor='var(--gold-l)';
    } else if(w === 140){
      el.style.background='transparent'; el.style.color='var(--gray-l)'; el.style.borderColor='var(--gray-l)';
    } else if(w === 160){
      el.style.background='transparent'; el.style.color='var(--black-c)'; el.style.borderColor='var(--black-c)';
    } else {
      el.style.background='transparent'; el.style.color='var(--text-dimmer)'; el.style.borderColor='var(--border)';
    }
  });
```

New:
```js
  document.querySelectorAll('.sdl-step').forEach(el => {
    const w = parseInt(el.dataset.w);
    const isActive = w === sdl;
    if(isActive){
      el.style.background = 'rgba(255,204,1,0.15)';
      el.style.color = '#FFCC01';
      el.style.borderColor = '#FFCC01';
    } else if(w === 120){
      el.style.background='transparent'; el.style.color='#FFCC01'; el.style.borderColor='#FFCC01';
    } else if(w === 140){
      el.style.background='transparent'; el.style.color='#A8A6A2'; el.style.borderColor='#A8A6A2';
    } else if(w === 160){
      el.style.background='transparent'; el.style.color='#FFFFFF'; el.style.borderColor='#FFFFFF';
    } else {
      el.style.background='transparent'; el.style.color='#6E6C68'; el.style.borderColor='#6E6C68';
    }
  });
```

- [ ] **Step 4: Update fill bar colors inside `render()`.** Find and replace the three `fill-slj/spt/sdl` style background lines:

Old:
```js
  document.getElementById('fill-slj').style.background = gSlj==='black'?'var(--black-c)':gSlj==='gray'?'var(--gray-l)':gSlj==='gold'?'var(--gold-l)':'var(--red-l)';
  document.getElementById('fill-spt').style.background = gSpt==='black'?'var(--black-c)':gSpt==='gray'?'var(--gray-l)':gSpt==='gold'?'var(--gold-l)':'var(--red-l)';
  document.getElementById('fill-sdl').style.background = gSdl==='black'?'var(--black-c)':gSdl==='gray'?'var(--gray-l)':gSdl==='gold'?'var(--gold-l)':'var(--red-l)';
```

New:
```js
  document.getElementById('fill-slj').style.background = gSlj==='black'?'#FFFFFF':gSlj==='gray'?'#A8A6A2':gSlj==='gold'?'#FFCC01':'#A02E2E';
  document.getElementById('fill-spt').style.background = gSpt==='black'?'#FFFFFF':gSpt==='gray'?'#A8A6A2':gSpt==='gold'?'#FFCC01':'#A02E2E';
  document.getElementById('fill-sdl').style.background = gSdl==='black'?'#FFFFFF':gSdl==='gray'?'#A8A6A2':gSdl==='gold'?'#FFCC01':'#A02E2E';
```

- [ ] **Step 5: Add band chip updates inside `render()` after the RESULT HERO block.** Find the existing RESULT HERO section in render():

```js
  // RESULT HERO
  const info = GRADE_INFO[overall];
  const hero = document.getElementById('hero-grade');
  hero.textContent = info.label;
  hero.className = 'result-hero-grade grade-'+overall;
  document.getElementById('hero-sub').textContent = info.sub;
```

Replace with:

```js
  // RESULT HERO
  const info = GRADE_INFO[overall];
  const hero = document.getElementById('hero-grade');
  hero.textContent = info.label;
  hero.className = 'pdc-grade grade-'+overall;
  document.getElementById('hero-sub').textContent = info.sub;

  // Band chips
  ['black','gray','gold'].forEach(band => {
    const chip = document.getElementById('chip-'+band);
    if (!chip) return;
    const eligible = GRADE_ORDER[overall] >= GRADE_ORDER[band];
    chip.className = 'band-chip' + (eligible ? ' active-'+band : '');
    chip.querySelector('.band-chip-status').textContent = eligible ? '✓' : '✗';
  });
```

- [ ] **Step 6: Update Chart.js initialization colors in `initCharts()`.** Find the radar chart `borderColor` for the "Your Score" dataset and the grid/tick/pointLabels colors. Replace the full `initCharts` function:

Old (find these values inside initCharts):
```js
  radarChart = new Chart(document.getElementById('radar-chart'), {
    ...
      datasets: [
        {
          label: 'Your Score',
          data: [0,0,0,0],
          borderColor: '#91b858',
          backgroundColor: 'rgba(145,184,88,0.15)',
          ...
          pointBackgroundColor: '#91b858',
          ...
        },
        {
          label: 'BLACK threshold',
          ...
          borderColor: 'rgba(192,200,184,0.3)',
          backgroundColor: 'rgba(192,200,184,0.04)',
          ...
        },
        {
          label: 'GOLD threshold',
          ...
          borderColor: 'rgba(200,168,48,0.3)',
          backgroundColor: 'rgba(200,168,48,0.04)',
          ...
        }
      ]
    ...
      scales: {
        r: {
          ...
          grid: { color: 'rgba(50,68,48,0.6)' },
          angleLines: { color: 'rgba(50,68,48,0.6)' },
          ...
          pointLabels: {
            color: '#6a806a',
            font: { family: "'Share Tech Mono'", size: 10 }
          }
        }
      }
```

New (replace those specific values — keep all other options unchanged):
```js
          borderColor: '#FFCC01',
          backgroundColor: 'rgba(255,204,1,0.12)',
          pointBackgroundColor: '#FFCC01',

          borderColor: 'rgba(255,255,255,0.25)',
          backgroundColor: 'rgba(255,255,255,0.03)',

          borderColor: 'rgba(255,204,1,0.25)',
          backgroundColor: 'rgba(255,204,1,0.03)',

          grid: { color: 'rgba(255,255,255,0.08)' },
          angleLines: { color: 'rgba(255,255,255,0.08)' },
          pointLabels: {
            color: '#A8A6A2',
            font: { family: "'G.I.'", size: 11 }
          }
```

For the bar chart inside `initCharts`, find and update:
Old:
```js
        { label: 'Your Score %', data: [0,0,0,0], backgroundColor: ['#3d5224','#3d5224','#3d5224','#3d5224'], borderWidth: 0 },
        { label: 'BLACK min', data: [100,100,100,100], type: 'line', borderColor: 'rgba(192,200,184,0.5)', ...},
        { label: 'GOLD min',  data: [40,40,40,40],   type: 'line', borderColor: 'rgba(200,168,48,0.5)', ...},
```
And the axis colors:
```js
        x: { ticks: { color: '#6a806a', font: { family: "'Share Tech Mono'", size: 11 } }, grid: { display: false } },
        y: { ..., ticks: { color: '#6a806a', font: { family: "'Share Tech Mono'", size: 10 }, ... }, grid: { color: 'rgba(50,68,48,0.4)' } }
```

New:
```js
        { label: 'Your Score %', data: [0,0,0,0], backgroundColor: ['#FFCC01','#FFCC01','#FFCC01','#FFCC01'], borderWidth: 0 },
        { label: 'BLACK min', data: [100,100,100,100], type: 'line', borderColor: 'rgba(255,255,255,0.4)', ...},
        { label: 'GOLD min',  data: [40,40,40,40],   type: 'line', borderColor: 'rgba(255,204,1,0.4)', ...},
```
```js
        x: { ticks: { color: '#A8A6A2', font: { family: "'G.I.'", size: 11 } }, grid: { display: false } },
        y: { ..., ticks: { color: '#A8A6A2', font: { family: "'G.I.'", size: 10 }, ... }, grid: { color: 'rgba(255,255,255,0.06)' } }
```

---

## Task 7: Open in browser and verify, then commit

**Files:**
- Read-only verification

- [ ] **Step 1: Open `OPAT_Calculator.html` in a browser** (double-click the file or use a local server). Confirm:
  - Page loads with no console errors
  - Header shows Army star + "U.S. Army | OPAT" with gold bottom border
  - PDC panel shows "—" in large text initially
  - Event grid shows 4 cells in 2×2 layout with G.I. font
  - All 4 sliders and number inputs are interactive

- [ ] **Step 2: Exercise all scoring interactions:**
  - Set SLJ to 60" → badge should show BLACK, fill bar should be white
  - Set SDL quick-select to 120 → badge shows GOLD
  - Set IAR to Level 4, Shuttle 8 → badge should show WHITE (below minimum)
  - Confirm PDC result panel updates grade color and band chips in real time
  - Confirm lowest-event and PDC-qualified stats update correctly

- [ ] **Step 3: Check the threshold table** — your score row at bottom should highlight in gold with correct values.

- [ ] **Step 4: Check the radar and bar charts** — update with gold/army styling when scores change.

- [ ] **Step 5: Commit:**

```bash
git add OPAT_Calculator.html
git commit -m "feat: revamp OPAT calculator with Army Command Center design

- Replace dark tactical aesthetic with Army brand identity
- G.I. typeface, Army Black/Gold/Green palette, exposed-grid layout
- PDC grade promoted to dominant full-width hero panel
- 2x2 exposed-grid event input section with Army-brand inputs
- Band eligibility chips replace legacy MOS tag display
- All scoring logic, charts, and JS behavior preserved

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] G.I. typeface — @font-face in Task 1 CSS, Google Fonts removed in Task 2
- [x] Army Black/Gold/Green palette — all :root vars in Task 1
- [x] No gradients, no drop shadows, no rounded corners — enforced throughout CSS
- [x] Sticky header bar with 2px gold border — Task 1 CSS + Task 3 HTML
- [x] PDC result as dominant hero panel — Task 3 HTML, pdc-grade clamp(72px–136px)
- [x] Band status chips replacing mos-tags — Task 3 HTML + Task 6 Step 5 JS
- [x] 2×2 exposed-grid event inputs — Task 4 HTML, `.exp-grid-2` CSS
- [x] Square slider thumb in Army Gold — Task 1 CSS, border-radius:0
- [x] SDL quick-select buttons restyled — Task 4 HTML `.sdl-step`, Task 6 Step 3
- [x] IAR threshold mini-grid — Task 4 HTML `.iar-tc.gc/sc/bc`
- [x] 2-col performance analysis — Task 5 HTML `.exp-grid-2col`
- [x] Radar chart restyled — Task 6 Step 6
- [x] Bar chart restyled — Task 6 Step 6
- [x] Threshold table with gold header row — Task 1 CSS, Task 5 HTML
- [x] Your Score row with 2px gold top rule — Task 1 CSS `.your-row`
- [x] MOS section — Task 5 HTML
- [x] Footer — Task 5 HTML
- [x] Focus outline: 3px solid Army Gold — Task 1 CSS `input[type=number]:focus`
- [x] `cubic-bezier(0.85,0,0.15,1)` transitions — Task 1 CSS throughout
- [x] Responsive 800px breakpoint — Task 1 CSS media query
- [x] All JS-referenced IDs preserved — verified per-task

**No placeholders or TBDs found.**

**Type consistency:** All IDs used in Task 6 JS (`chip-black`, `chip-gray`, `chip-gold`, `pdc-grade grade-X`, `band-chip active-X`) match what is defined in Task 3 HTML and Task 1 CSS.
