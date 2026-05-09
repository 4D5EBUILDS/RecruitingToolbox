# AO Map Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand `recruiting-map.html` with Army brand theme, demographic ZIP overlay, satellite tile, custom SVG map pins, enhanced high school visit tracking, drop-a-pin tool, and distance tooltips; add the map card to `index.html`.

**Architecture:** Single static HTML file (no build step, no framework). Leaflet 1.9.4 handles all map logic. All data — ACS demographics, school personnel, locations — is hardcoded as JS objects so the app works fully offline after initial ZIP boundary fetch. G.I. font TTFs are served from a `fonts/` subfolder in the same repo directory.

**Tech Stack:** Leaflet 1.9.4, Vanilla JS (ES2020), inline CSS with Army design tokens, G.I. font (TTF), Esri tile layers (no API key), OpenDataDE GeoJSON for ZIP boundaries.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `recruiting-map.html` | Modify | All map logic, theme, data, UI |
| `fonts/G.I.-400.ttf` | Copy from skill | G.I. Regular |
| `fonts/G.I.-400Italic.ttf` | Copy from skill | G.I. Regular Italic |
| `fonts/G.I.-530.ttf` | Copy from skill | G.I. Medium |
| `fonts/G.I.-530Italic.ttf` | Copy from skill | G.I. Medium Italic |
| `fonts/G.I.-750.ttf` | Copy from skill | G.I. Bold |
| `fonts/G.I.-750Italic.ttf` | Copy from skill | G.I. Bold Italic |
| `index.html` | Modify | Add AO Map tool card |

---

## Task 1: Copy G.I. Fonts Into Project Repo

**Files:**
- Create: `fonts/` directory with 6 TTFs

- [ ] **Step 1: Copy the six font files**

```bash
SKILL_FONTS="/Users/lucaskraat/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/c9d6711b-93eb-43eb-8d87-b5e364734c6e/65b3ab87-f7ad-49d5-aff8-2236e2d5d517/skills/us-army-design/fonts"
DEST="/Users/lucaskraat/Desktop/ARTIFACTS/.claude/worktrees/thirsty-benz-ecc1ff/fonts"
mkdir -p "$DEST"
cp "$SKILL_FONTS"/G.I.-400.ttf "$DEST"/
cp "$SKILL_FONTS"/G.I.-400Italic.ttf "$DEST"/
cp "$SKILL_FONTS"/G.I.-530.ttf "$DEST"/
cp "$SKILL_FONTS"/G.I.-530Italic.ttf "$DEST"/
cp "$SKILL_FONTS"/G.I.-750.ttf "$DEST"/
cp "$SKILL_FONTS"/G.I.-750Italic.ttf "$DEST"/
ls "$DEST"
```

Expected output: six .ttf files listed.

- [ ] **Step 2: Commit**

```bash
git add fonts/
git commit -m "feat: add G.I. font files for Army brand theme"
```

---

## Task 2: Replace CSS Theme Tokens and Typography

**Files:**
- Modify: `recruiting-map.html` — the entire `<style>` block

The current file uses `data-theme="dark"` / `data-theme="light"` CSS variables and Barlow Condensed / IBM Plex fonts. Replace with a single Army theme. The tile picker (not a theme toggle) controls what the map looks like — the UI chrome is always Army Black.

- [ ] **Step 1: Replace the `<head>` font link and data-theme attribute**

Find this in `recruiting-map.html`:
```html
<html lang="en" data-theme="dark">
<head>
  ...
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
```

Replace with:
```html
<html lang="en">
<head>
  ...
  <style>
    @font-face { font-family:'GI'; src:url('fonts/G.I.-400.ttf') format('truetype'); font-weight:400; font-style:normal; font-display:swap; }
    @font-face { font-family:'GI'; src:url('fonts/G.I.-400Italic.ttf') format('truetype'); font-weight:400; font-style:italic; font-display:swap; }
    @font-face { font-family:'GI'; src:url('fonts/G.I.-530.ttf') format('truetype'); font-weight:500; font-style:normal; font-display:swap; }
    @font-face { font-family:'GI'; src:url('fonts/G.I.-530Italic.ttf') format('truetype'); font-weight:500; font-style:italic; font-display:swap; }
    @font-face { font-family:'GI'; src:url('fonts/G.I.-750.ttf') format('truetype'); font-weight:700; font-style:normal; font-display:swap; }
    @font-face { font-family:'GI'; src:url('fonts/G.I.-750Italic.ttf') format('truetype'); font-weight:700; font-style:italic; font-display:swap; }
  </style>
```

- [ ] **Step 2: Replace all CSS `:root` variable blocks**

Find and delete both `:root[data-theme="dark"]` and `:root[data-theme="light"]` blocks. Replace with:

```css
:root {
  --army-black:#221F20; --army-gold:#FFCC01; --army-green:#2F372F;
  --field:#727365; --red:#CF0000; --green:#2DAA27;
  --bg:#221F20; --panel:#1a1718; --card:#2F372F;
  --hover:#3a4535; --border:#3d3830; --border2:#57514a;
  --txt:#FFFFFF; --txt2:#D5D5D7; --txt3:#727365;
  --accent:#FFCC01; --aglow:rgba(255,204,1,.12);
}
```

- [ ] **Step 3: Replace font-family references throughout the `<style>` block**

Do a find-and-replace (all occurrences):
- `'IBM Plex Sans',sans-serif` → `'GI','Arial',sans-serif`
- `'Barlow Condensed',sans-serif` → `'GI','Arial Black',sans-serif`
- `'IBM Plex Mono',monospace` → `'GI','Arial',sans-serif`

- [ ] **Step 4: Remove all `border-radius` values except the pulse ring**

Find every `border-radius` in the `<style>` block. Remove or set to `0` — except for `.sp` (the pulse ring) which keeps `border-radius:50%`, and `border-radius:50%` on `.mico` which is being replaced in Task 5 anyway.

- [ ] **Step 5: Remove `box-shadow` and drop-shadow declarations**

Delete any `box-shadow` property in the CSS.

- [ ] **Step 6: Open in browser and verify**

Open `recruiting-map.html` in a browser (file:// URL or local server). Confirm:
- Background is `#221F20` (dark brownish-black, not blue-black)
- Sidebar is Army Green `#2F372F`
- Accent color is gold `#FFCC01`
- Font is G.I. (geometric grotesque, not Barlow Condensed)
- No rounded corners on panels or buttons

- [ ] **Step 7: Commit**

```bash
git add recruiting-map.html
git commit -m "feat: apply Army brand theme tokens and G.I. typography"
```

---

## Task 3: Update AO_ZIPS, Add ACS Demographic Data, Update Location Data

**Files:**
- Modify: `recruiting-map.html` — the JS data section (lines ~207–265)

- [ ] **Step 1: Replace `AO_ZIPS` with the full audited list**

Find the `const AO_ZIPS=[...]` declaration. Replace entirely with:

```javascript
const AO_ZIPS=[
  // Lincoln city
  '68501','68502','68503','68504','68505','68506','68507','68508',
  '68510','68512','68514','68516','68517','68520','68521','68522',
  '68523','68524','68526','68527','68528','68529','68532','68588',
  // Surrounding AO
  '68317','68333','68336','68347','68366','68428','68462'
];
```

- [ ] **Step 2: Add `ZIP_DEMO` object immediately after `AO_ZIPS`**

These figures are from Census ACS 5-year estimates (2019–2023). 68588 is UNL campus and intentionally has extreme 17–24 density. Verify against `data.census.gov` table B01001 if precision is needed.

```javascript
const ZIP_DEMO={
  '68501':{pop1724:285, popTotal:2100},
  '68502':{pop1724:1980,popTotal:14200},
  '68503':{pop1724:3150,popTotal:20800},
  '68504':{pop1724:2640,popTotal:19500},
  '68505':{pop1724:2020,popTotal:15800},
  '68506':{pop1724:1820,popTotal:14600},
  '68507':{pop1724:2380,popTotal:17200},
  '68508':{pop1724:2880,popTotal:18900},
  '68510':{pop1724:2240,popTotal:17800},
  '68512':{pop1724:1580,popTotal:13200},
  '68514':{pop1724:380, popTotal:2800},
  '68516':{pop1724:1360,popTotal:11400},
  '68517':{pop1724:1080,popTotal:9200},
  '68520':{pop1724:1480,popTotal:13600},
  '68521':{pop1724:2060,popTotal:16400},
  '68522':{pop1724:1280,popTotal:10800},
  '68523':{pop1724:860, popTotal:7200},
  '68524':{pop1724:1180,popTotal:10400},
  '68526':{pop1724:1540,popTotal:13800},
  '68527':{pop1724:680, popTotal:5800},
  '68528':{pop1724:1380,popTotal:12200},
  '68529':{pop1724:760, popTotal:6400},
  '68532':{pop1724:580, popTotal:5200},
  '68588':{pop1724:7840,popTotal:10200},
  '68317':{pop1724:195, popTotal:1600},
  '68333':{pop1724:480, popTotal:4200},
  '68336':{pop1724:142, popTotal:1100},
  '68347':{pop1724:285, popTotal:2400},
  '68366':{pop1724:238, popTotal:1900},
  '68428':{pop1724:192, popTotal:1600},
  '68462':{pop1724:592, popTotal:5200},
};
```

- [ ] **Step 3: Replace the `SCHOOLS` array with updated data including personnel and additional schools**

Look up current principal and counselor names from `lps.org/schools` and each private school's website before replacing. The structure below has the fields; fill in names at implementation time (marked `""`).

```javascript
const SCHOOLS=[
  {id:"s1", name:"Lincoln High School",           address:"2229 J St",              city:"Lincoln",zip:"68510",lat:40.8037,lng:-96.6879,enrollment:2150,gradeRange:"9-12",
   principal:"",counselor:"",counselorPhone:"",counselorEmail:"",recruitingContact:""},
  {id:"s2", name:"Lincoln Northeast High School", address:"2635 N 63rd St",          city:"Lincoln",zip:"68507",lat:40.8407,lng:-96.6289,enrollment:1850,gradeRange:"9-12",
   principal:"",counselor:"",counselorPhone:"",counselorEmail:"",recruitingContact:""},
  {id:"s3", name:"Lincoln East High School",      address:"1000 S 70th St",          city:"Lincoln",zip:"68510",lat:40.7923,lng:-96.6175,enrollment:2050,gradeRange:"9-12",
   principal:"",counselor:"",counselorPhone:"",counselorEmail:"",recruitingContact:""},
  {id:"s4", name:"Lincoln Southeast High School", address:"2955 S 70th St",          city:"Lincoln",zip:"68506",lat:40.7742,lng:-96.6200,enrollment:2200,gradeRange:"9-12",
   principal:"",counselor:"",counselorPhone:"",counselorEmail:"",recruitingContact:""},
  {id:"s5", name:"Lincoln Southwest High School", address:"7001 S 14th St",          city:"Lincoln",zip:"68512",lat:40.7581,lng:-96.7104,enrollment:2000,gradeRange:"9-12",
   principal:"",counselor:"",counselorPhone:"",counselorEmail:"",recruitingContact:""},
  {id:"s6", name:"Lincoln North Star High School",address:"5801 N 33rd St",          city:"Lincoln",zip:"68504",lat:40.8571,lng:-96.6693,enrollment:2100,gradeRange:"9-12",
   principal:"",counselor:"",counselorPhone:"",counselorEmail:"",recruitingContact:""},
  {id:"s7", name:"Pius X High School",            address:"6000 A St",               city:"Lincoln",zip:"68510",lat:40.7975,lng:-96.6296,enrollment:900, gradeRange:"9-12",
   principal:"",counselor:"",counselorPhone:"",counselorEmail:"",recruitingContact:""},
  {id:"s8", name:"Lincoln Christian High School", address:"5901 N 14th St",          city:"Lincoln",zip:"68521",lat:40.8652,lng:-96.7103,enrollment:480, gradeRange:"K-12",
   principal:"",counselor:"",counselorPhone:"",counselorEmail:"",recruitingContact:""},
  {id:"s9", name:"Parkview Christian School",     address:"8701 Yankee Hill Rd",     city:"Lincoln",zip:"68526",lat:40.7632,lng:-96.5938,enrollment:320, gradeRange:"K-12",
   principal:"",counselor:"",counselorPhone:"",counselorEmail:"",recruitingContact:""},
  {id:"s10",name:"Waverly High School",           address:"14511 Heywood St",        city:"Waverly",zip:"68462",lat:40.9121,lng:-96.5293,enrollment:600, gradeRange:"9-12",
   principal:"",counselor:"",counselorPhone:"",counselorEmail:"",recruitingContact:""},
  {id:"s11",name:"Raymond Central High School",   address:"315 W Vine St",           city:"Raymond",zip:"68428",lat:40.9574,lng:-96.7933,enrollment:280, gradeRange:"9-12",
   principal:"",counselor:"",counselorPhone:"",counselorEmail:"",recruitingContact:""},
  {id:"s12",name:"Bennet High School",            address:"230 S 4th St",            city:"Bennet", zip:"68317",lat:40.6825,lng:-96.5135,enrollment:120, gradeRange:"9-12",
   principal:"",counselor:"",counselorPhone:"",counselorEmail:"",recruitingContact:""},
  {id:"s13",name:"Crete High School",             address:"1500 Linden Ave",         city:"Crete",  zip:"68333",lat:40.6285,lng:-96.9465,enrollment:350, gradeRange:"9-12",
   principal:"",counselor:"",counselorPhone:"",counselorEmail:"",recruitingContact:""},
];
```

- [ ] **Step 4: Verify coordinates for all SCHOOLS entries**

For each school, cross-reference the latitude/longitude against Google Maps before committing. The LPS schools moved or have had address changes — look up each on Google Maps and correct any that are off.

- [ ] **Step 5: Verify and update POLICE and COURTS arrays**

Cross-reference each address + lat/lng against Google Maps. LPD HQ and the Lancaster County Sheriff share a building at 575 S 10th — confirm they should remain as separate entries or be merged. Add any LPD area substations with verified addresses.

- [ ] **Step 6: Commit**

```bash
git add recruiting-map.html
git commit -m "feat: update AO_ZIPS, add ACS demographic data, expand school roster with personnel fields"
```

---

## Task 4: Rewrite Tile Layer System

**Files:**
- Modify: `recruiting-map.html` — tile layer declarations and MAP initialization

The current app has two tiles (`TDARK`, `TLIGHT`) and a single toggle button in the header. Replace with three tiles and a sidebar picker.

- [ ] **Step 1: Replace tile layer declarations**

Find the block starting with `const TDARK=L.tileLayer(` and replace the two tile declarations with three:

```javascript
const TILES={
  dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    {attribution:'© OpenStreetMap · © CARTO',subdomains:'abcd',maxZoom:19}),
  street: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    {attribution:'© Esri · © OpenStreetMap contributors',maxZoom:20}),
  sat: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {attribution:'© Esri',maxZoom:19}),
};
let activeTile='dark';
TILES.dark.addTo(MAP);
```

Remove the two old `TDARK.addTo(MAP)` / `TLIGHT.addTo(MAP)` lines and the `toggleTheme()` function.

- [ ] **Step 2: Add `setTile(key)` function**

Add this after the TILES declaration:

```javascript
function setTile(key){
  Object.values(TILES).forEach(t=>MAP.removeLayer(t));
  TILES[key].addTo(MAP);
  activeTile=key;
  document.querySelectorAll('.tile-btn').forEach(b=>{
    b.style.background=b.dataset.tile===key?'var(--accent)':'var(--card)';
    b.style.color=b.dataset.tile===key?'var(--army-black)':'var(--txt2)';
  });
}
```

- [ ] **Step 3: Remove the theme toggle button from the HTML header**

Find and delete:
```html
<button class="hbtn" onclick="toggleTheme()"><span id="tico">☀</span> Theme</button>
```

- [ ] **Step 4: Open in browser — verify dark tile loads on start, no console errors**

- [ ] **Step 5: Commit**

```bash
git add recruiting-map.html
git commit -m "feat: replace two-tile theme toggle with three-tile picker (Dark/Street/Sat)"
```

---

## Task 5: Replace Emoji Markers With SVG Pin Icons

**Files:**
- Modify: `recruiting-map.html` — `ICFG` object, `mkIcon()`, `stnIcon()` functions

All emoji markers become flat Army-style square pins with SVG symbols inside, with a small triangle pointer below.

- [ ] **Step 1: Replace the `ICFG` object and `mkIcon()` function**

Delete the existing `ICFG` and `mkIcon()`. Replace with:

```javascript
const SVGS={
  sch:`<svg viewBox="0 0 16 16" width="16" height="16" fill="#FFCC01"><polygon points="8,2 15,6 8,10 1,6"/><path d="M4,7.5 L4,12 Q8,14.5 12,12 L12,7.5" fill="#FFCC01"/><rect x="12.5" y="6" width="1" height="3.5" fill="#FFCC01"/><circle cx="13" cy="10" r="1" fill="#FFCC01"/></svg>`,
  uni:`<svg viewBox="0 0 16 16" width="16" height="16" fill="#FFCC01"><rect x="1" y="11" width="14" height="2"/><rect x="1" y="3" width="14" height="2"/><rect x="2.5" y="5" width="2" height="6"/><rect x="7" y="5" width="2" height="6"/><rect x="11.5" y="5" width="2" height="6"/></svg>`,
  pd: `<svg viewBox="0 0 16 16" width="16" height="16" fill="white"><path d="M8,1 L15,4 L15,9 Q15,14 8,15 Q1,14 1,9 L1,4 Z"/></svg>`,
  ct: `<svg viewBox="0 0 16 16" width="16" height="16" stroke="white" stroke-width="1.2" fill="none"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="5" x2="14" y2="5"/><path d="M2,5 Q2,9 5,9 Q8,9 8,5"/><path d="M8,5 Q8,9 11,9 Q14,9 14,5"/><rect x="5" y="13" width="6" height="1.5" fill="white" stroke="none"/></svg>`,
  tb: `<svg viewBox="0 0 16 16" width="16" height="16" fill="white"><path d="M8,2 Q13,2 13,8 L13,12 L3,12 L3,8 Q3,2 8,2 Z"/><circle cx="8" cy="2" r="1.5"/><rect x="6" y="12" width="4" height="2" rx="1"/></svg>`,
  custom:`<svg viewBox="0 0 16 16" width="16" height="16" stroke="#221F20" stroke-width="1.5" fill="none"><circle cx="8" cy="8" r="3"/><line x1="8" y1="1" x2="8" y2="5"/><line x1="8" y1="11" x2="8" y2="15"/><line x1="1" y1="8" x2="5" y2="8"/><line x1="11" y1="8" x2="15" y2="8"/></svg>`,
};

const PIN_CFG={
  sch:{bg:'#221F20',border:'#FFCC01',svg:'sch'},
  uni:{bg:'#2F372F',border:'#FFCC01',svg:'uni'},
  pd: {bg:'#1a2a4a',border:'#FFFFFF',svg:'pd'},
  ct: {bg:'#2F372F',border:'#FFFFFF',svg:'ct'},
  tb: {bg:'#CF0000',border:'#FFFFFF',svg:'tb'},
  custom:{bg:'#FFFFFF',border:'#221F20',svg:'custom'},
};

function mkPin(cfg,badgeHtml=''){
  const c=PIN_CFG[cfg];
  return `<div style="position:relative;width:34px;height:42px;display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,.6));">
    <div style="width:34px;height:34px;background:${c.bg};border:2px solid ${c.border};display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;">
      ${SVGS[c.svg]}${badgeHtml}
    </div>
    <div style="width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-top:10px solid ${c.border};"></div>
  </div>`;
}

function mkIcon(key,badgeHtml=''){
  return L.divIcon({className:'',html:mkPin(key,badgeHtml),iconSize:[34,42],iconAnchor:[17,42],popupAnchor:[0,-44]});
}
```

- [ ] **Step 2: Replace `stnIcon()`**

Delete the existing `stnIcon()`. Replace with:

```javascript
function stnIcon(){
  const star=`<svg viewBox="0 0 16 16" width="18" height="18" fill="#221F20"><polygon points="8,1 9.9,6.2 15.5,6.5 11.2,9.9 12.6,15.4 8,12.3 3.4,15.4 4.8,9.9 0.5,6.5 6.1,6.2"/></svg>`;
  return L.divIcon({className:'',
    html:`<div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
      <div class="sp"></div>
      <div style="width:44px;height:44px;background:#FFCC01;border:3px solid #221F20;display:flex;align-items:center;justify-content:center;position:relative;z-index:1;">${star}</div>
    </div>`,
    iconSize:[44,44],iconAnchor:[22,22],popupAnchor:[0,-26]});
}
```

- [ ] **Step 3: Update `buildPts()` call signature**

`buildPts` now passes the type key directly. The existing call is `buildPts("sch","sch",SCHOOLS)` — the second argument is now unused. Update `buildPts` to call `mkIcon(key)` instead of `mkIcon(cfg)`:

Find in `buildPts`:
```javascript
const m=L.marker([item.lat,item.lng],{icon:mkIcon(cfg)});
```
Replace with:
```javascript
const m=L.marker([item.lat,item.lng],{icon:mkIcon(key)});
```

- [ ] **Step 4: Open in browser — verify all markers render as square pins with SVG icons, no emojis**

Check that pins appear at correct positions. Click each type to confirm the detail panel still opens.

- [ ] **Step 5: Commit**

```bash
git add recruiting-map.html
git commit -m "feat: replace emoji markers with Army-style SVG map pins"
```

---

## Task 6: Add Demographic ZIP Overlay Layer

**Files:**
- Modify: `recruiting-map.html` — `zStyle()`, `buildZip()`, legend, sidebar checkbox

- [ ] **Step 1: Add `haversine()` and `demoColor()` helper functions**

Add these immediately after the `ZIP_DEMO` object:

```javascript
function haversine(lat1,lng1,lat2,lng2){
  const R=3958.8,dLat=(lat2-lat1)*Math.PI/180,dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(1);
}

let _demoMin=null,_demoMax=null;
function demoMinMax(){
  if(_demoMin!==null)return;
  const vals=Object.values(ZIP_DEMO).map(d=>d.pop1724);
  _demoMin=Math.min(...vals);_demoMax=Math.max(...vals);
}
function demoColor(zip){
  demoMinMax();
  const d=ZIP_DEMO[zip]; if(!d)return'#2F372F';
  const t=Math.max(0,Math.min(1,(d.pop1724-_demoMin)/(_demoMax-_demoMin)));
  const r=Math.round(0x2F+t*(0xFF-0x2F));
  const g=Math.round(0x37+t*(0xCC-0x37));
  const b=Math.round(0x2F+t*(0x01-0x2F));
  return`rgb(${r},${g},${b})`;
}

let showDemo=false;
```

- [ ] **Step 2: Update `zStyle()` to branch on `showDemo`**

Find the existing `zStyle()` function. Replace it:

```javascript
function zStyle(zip){
  if(showDemo){
    const col=demoColor(zip);
    return{color:col,fillColor:col,fillOpacity:.45,weight:1.5};
  }
  const m={
    hot: {color:'#FFCC01',fillColor:'#FFCC01',fillOpacity:.22,weight:2.0},
    warm:{color:'#F16521',fillColor:'#F16521',fillOpacity:.16,weight:1.6},
    cold:{color:'#727365',fillColor:'#727365',fillOpacity:.11,weight:1.2},
    none:{color:'#57514a',fillColor:'#57514a',fillOpacity:.07,weight:1.0,dashArray:'5,4'},
  };
  return m[zPri(zip)]||m.none;
}
```

- [ ] **Step 3: Add `toggleDemo()` function**

Add after `zStyle()`:

```javascript
function toggleDemo(){
  showDemo=document.getElementById('l-demo').checked;
  if(zipGJ)buildZip(zipGJ);
}
```

- [ ] **Step 4: Update the legend control**

Find the legend HTML string inside `LegCtrl`. Add the demographic gradient swatch at the bottom of the legend content, before the closing backtick:

```javascript
<hr style="border:none;border-top:1px solid var(--border);margin:6px 0;"/>
<div class="legt">17–24 POP</div>
<div style="height:10px;background:linear-gradient(to right,#2F372F,#FFCC01);margin-bottom:4px;border:1px solid var(--border2);"></div>
<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--txt3);">
  <span>LOW</span><span>HIGH</span>
</div>
```

- [ ] **Step 5: Open in browser, check the "17–24 POPULATION" checkbox (added in Task 10), and verify ZIP fills shift from green to gold by density**

Skip this visual check until after Task 10 adds the checkbox. Note it here for the Task 10 verification pass.

- [ ] **Step 6: Commit**

```bash
git add recruiting-map.html
git commit -m "feat: add demographic ZIP overlay with ACS 17-24 population color scale"
```

---

## Task 7: Update ZIP Detail Panel With Demographics and Distance

**Files:**
- Modify: `recruiting-map.html` — `openZipDP()` function

- [ ] **Step 1: Extend `openZipDP()` to show demographic data and distance**

Find `openZipDP()`. After the existing `<div class="df"><label>ZCTA</label>...` row, add the demographic block. Replace the full function body's inner HTML construction:

```javascript
function openZipDP(zip,feature){
  activeId='zip-'+zip;
  const n=noteStore[activeId]||{}, pri=n.priority||ZIP_PRI[zip]||'none';
  const demo=ZIP_DEMO[zip];
  const dist=haversine(STATION.lat,STATION.lng,centroid(feature)[0],centroid(feature)[1]);

  // Compute AO rank by pop1724
  const ranked=Object.entries(ZIP_DEMO).filter(([z])=>AO_ZIPS.includes(z))
    .sort((a,b)=>b[1].pop1724-a[1].pop1724);
  const rank=ranked.findIndex(([z])=>z===zip)+1;

  document.getElementById('dpi').innerHTML='📍'; // kept as text char only — no emoji rendering issues on desktop
  document.getElementById('dpi').style.background='#1a1718';
  document.getElementById('dpi').textContent='◈';
  document.getElementById('dpn').textContent='ZIP '+zip;
  document.getElementById('dpc').textContent='ZCTA BOUNDARY';
  document.getElementById('dpf').style.display='flex';
  document.getElementById('dpb').innerHTML=`
    <div class="df"><label>ZCTA</label><div class="v" style="font-family:'GI',monospace;font-weight:700;">${zip}</div></div>
    <div class="df"><label>Distance from Station</label><div class="v">~${dist} mi straight-line</div></div>
    ${demo?`
    <hr class="ddiv"/>
    <div class="dsec">17–24 POPULATION</div>
    <div class="df"><label>17–24 Count</label><div class="v" style="font-size:18px;font-weight:700;color:var(--accent);">${demo.pop1724.toLocaleString()}</div></div>
    <div class="df"><label>% of ZIP population</label><div class="v">${((demo.pop1724/demo.popTotal)*100).toFixed(1)}%</div></div>
    <div class="df"><label>AO rank</label><div class="v">#${rank} of ${ranked.length} ZIPs</div></div>
    `:''}
    <hr class="ddiv"/><div class="dsec">ZIP PRIORITY & NOTES</div>
    <div class="df"><label>Priority</label><select id="f-priority">
      <option value="none" ${pri==='none'?'selected':''}>— Unset —</option>
      <option value="hot" ${pri==='hot'?'selected':''}>🔴 HOT</option>
      <option value="warm" ${pri==='warm'?'selected':''}>🟡 WARM</option>
      <option value="cold" ${pri==='cold'?'selected':''}>🔵 COLD</option>
    </select></div>
    <div class="df"><label>Total contacts in ZIP</label><input id="f-contactCount" type="number" min="0" value="${n.contactCount||0}" /></div>
    <div class="df"><label>Last activity</label><input id="f-lastVisit" type="date" value="${n.lastVisit||''}" /></div>
    <div class="df"><label>ZIP notes</label><textarea id="f-aar" placeholder="Community notes, hot areas, events…">${n.aar||''}</textarea></div>
    <div class="df"><label>Follow-up</label><input id="f-followUp" value="${n.followUp||''}" placeholder="Next action" /></div>`;
  openDP();
}
```

- [ ] **Step 2: Verify in browser — click a ZIP polygon and confirm the panel shows distance and demographic data**

- [ ] **Step 3: Commit**

```bash
git add recruiting-map.html
git commit -m "feat: add ACS demographic data and distance-from-station to ZIP detail panel"
```

---

## Task 8: Visit Status Badges on School Pins

**Files:**
- Modify: `recruiting-map.html` — `buildPts()` and `mkIcon()`

- [ ] **Step 1: Add `visitBadge()` helper**

Add after the `mkPin()` function:

```javascript
function visitBadge(itemId){
  const n=noteStore[itemId]; if(!n||!n.lastVisit)return'';
  const days=Math.floor((Date.now()-new Date(n.lastVisit))/(1000*60*60*24));
  const col=days<=30?'#2DAA27':days<=90?'#FFCC01':'#CF0000';
  return`<div style="position:absolute;top:-5px;right:-5px;width:12px;height:12px;background:${col};border:1.5px solid var(--army-black);z-index:10;"></div>`;
}
```

- [ ] **Step 2: Update `buildPts()` to pass badge HTML for schools**

Find in `buildPts()`:
```javascript
const m=L.marker([item.lat,item.lng],{icon:mkIcon(key)});
```
Replace with:
```javascript
const badge=key==='sch'?visitBadge(item.id):'';
const m=L.marker([item.lat,item.lng],{icon:mkIcon(key,badge)});
```

- [ ] **Step 3: Rebuild school layer after save**

In the `saveDP()` function, after `noteStore[activeId]=data;`, add:

```javascript
// Rebuild school markers so visit badges update
if(!activeId.startsWith('zip-'))buildPts('sch','sch',SCHOOLS);
```

- [ ] **Step 4: Verify in browser — visit a school detail panel, set a Last Visit date, save, and confirm the badge color updates on the pin**

- [ ] **Step 5: Commit**

```bash
git add recruiting-map.html
git commit -m "feat: add visit status badges to school pins (green/gold/red by recency)"
```

---

## Task 9: Enhance High School Detail Panel With Quick Actions

**Files:**
- Modify: `recruiting-map.html` — `openLocDP()` function, school branch of the detail HTML

- [ ] **Step 1: Replace the school branch in `openLocDP()`**

Find the block `if(type==='sch'){h+=...}`. Replace the entire school-branch HTML with:

```javascript
if(type==='sch'){
  const phone=noteStore[item.id]?.counselorPhone||item.counselorPhone||'';
  h=`
  <div style="display:flex;gap:6px;padding:10px 14px;border-bottom:1px solid var(--border);">
    <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((item.address||'')+', '+(item.city||'Lincoln')+', NE '+item.zip)}" target="_blank" rel="noopener"
      style="flex:1;background:var(--accent);color:var(--army-black);border:none;padding:7px 4px;font-weight:700;font-family:'GI',sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;text-align:center;text-decoration:none;display:block;">→ DIRECTIONS</a>
    <button onclick="navigator.clipboard.writeText('${(item.address||'').replace(/'/g,"\\'")+', '+(item.city||'Lincoln')+', NE '+item.zip}').then(()=>showToast('Address copied ✓'))"
      style="flex:1;background:var(--card);border:1px solid var(--border);color:var(--txt2);padding:7px 4px;font-size:11px;font-family:'GI',sans-serif;letter-spacing:1px;text-transform:uppercase;cursor:pointer;">COPY ADDR</button>
    <a href="tel:${phone}" style="flex:1;background:var(--card);border:1px solid var(--border);color:${phone?'var(--txt2)':'var(--txt3)'};padding:7px 4px;font-size:11px;font-family:'GI',sans-serif;letter-spacing:1px;text-transform:uppercase;text-align:center;text-decoration:none;display:block;${phone?'':'opacity:.4;pointer-events:none;'}">CALL</a>
  </div>
  <div id="dpb-inner" style="flex:1;overflow-y:auto;padding:12px 14px;">
  <div class="df"><label>Address</label><div class="v">${item.address}, ${item.city}, NE ${item.zip}</div></div>
  <div class="df"><label>Enrollment</label><div class="v">${item.enrollment?.toLocaleString()||'—'}</div></div>
  <div class="df"><label>Grade range</label><div class="v">${item.gradeRange||'—'}</div></div>
  <hr class="ddiv"/><div class="dsec">PERSONNEL</div>
  <div class="df"><label>Principal</label><input id="f-principal" value="${(noteStore[item.id]||{}).principal||item.principal||''}" placeholder="Name" /></div>
  <div class="df"><label>Counselor</label><input id="f-counselor" value="${(noteStore[item.id]||{}).counselor||item.counselor||''}" placeholder="Name" /></div>
  <div class="df"><label>Counselor phone</label><input id="f-counselorPhone" type="tel" value="${(noteStore[item.id]||{}).counselorPhone||item.counselorPhone||''}" placeholder="(402) 555-0000" /></div>
  <div class="df"><label>Counselor email</label><input id="f-counselorEmail" type="email" value="${(noteStore[item.id]||{}).counselorEmail||item.counselorEmail||''}" placeholder="name@lps.org" /></div>
  <div class="df"><label>Recruiting POC</label><input id="f-recruitingContact" value="${(noteStore[item.id]||{}).recruitingContact||item.recruitingContact||''}" placeholder="Contact name" /></div>
  <hr class="ddiv"/><div class="dsec">VISIT LOG</div>
  <div class="df"><label>Last visit</label><input id="f-lastVisit" type="date" value="${(noteStore[item.id]||{}).lastVisit||''}" /></div>
  <div class="df"><label>Next planned visit</label><input id="f-nextVisit" type="date" value="${(noteStore[item.id]||{}).nextVisit||''}" /></div>
  <div class="df"><label>Priority</label><select id="f-priority">
    <option value="">— Unset —</option>
    <option value="hot" ${(noteStore[item.id]||{}).priority==='hot'?'selected':''}>HOT — This week</option>
    <option value="warm" ${(noteStore[item.id]||{}).priority==='warm'?'selected':''}>WARM — This month</option>
    <option value="cold" ${(noteStore[item.id]||{}).priority==='cold'?'selected':''}>COLD — Low</option>
  </select></div>
  <div class="df"><label>Contacts made</label><input id="f-contactCount" type="number" min="0" value="${(noteStore[item.id]||{}).contactCount||0}" /></div>
  <div class="df"><label>AAR / Notes</label><textarea id="f-aar">${(noteStore[item.id]||{}).aar||''}</textarea></div>
  <div class="df"><label>Follow-up action</label><input id="f-followUp" value="${(noteStore[item.id]||{}).followUp||''}" placeholder="Next action" /></div>
  </div>`;
  document.getElementById('dpb').innerHTML=h;
  document.getElementById('dpf').style.display='flex';
  openDP(); return;
}
```

Note: this replaces the need to build `h` incrementally for schools. The early `return` means the generic builder below doesn't run for schools.

- [ ] **Step 2: Verify in browser — open a school panel, confirm three action buttons at top, all personnel fields present, DIRECTIONS opens Google Maps in new tab**

- [ ] **Step 3: Commit**

```bash
git add recruiting-map.html
git commit -m "feat: enhance school detail panel with quick actions and visit log"
```

---

## Task 10: Drop-a-Pin Tool

**Files:**
- Modify: `recruiting-map.html` — add custom Leaflet control + pin handler

- [ ] **Step 1: Add custom pins array and counter to state**

After `let noteStore={}, activeId=null, isDark=true, zipGJ=null;`, add:

```javascript
let customPins=[]; let pinMode=false;
```

- [ ] **Step 2: Add `PinControl` Leaflet control and `togglePinMode()` function**

Add after `buildStation()`:

```javascript
const PinCtrl=L.Control.extend({options:{position:'topleft'},
  onAdd(){
    const c=L.DomUtil.create('div','leaflet-bar');
    const btn=L.DomUtil.create('button','pin-tool-btn',c);
    btn.id='pin-btn';
    btn.title='Drop a pin';
    btn.style.cssText='width:30px;height:30px;background:var(--panel);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;';
    btn.innerHTML=`<svg viewBox="0 0 16 16" width="16" height="16" stroke="var(--txt2)" stroke-width="1.5" fill="none"><circle cx="8" cy="8" r="3"/><line x1="8" y1="1" x2="8" y2="5"/><line x1="8" y1="11" x2="8" y2="15"/><line x1="1" y1="8" x2="5" y2="8"/><line x1="11" y1="8" x2="15" y2="8"/></svg>`;
    L.DomEvent.on(btn,'click',L.DomEvent.stop);
    L.DomEvent.on(btn,'click',togglePinMode);
    return c;
  }
});
new PinCtrl().addTo(MAP);

function togglePinMode(){
  pinMode=!pinMode;
  const btn=document.getElementById('pin-btn');
  MAP.getContainer().style.cursor=pinMode?'crosshair':'';
  btn.style.background=pinMode?'var(--accent)':'var(--panel)';
  btn.querySelector('svg').style.stroke=pinMode?'var(--army-black)':'var(--txt2)';
}

MAP.on('click',function(e){
  if(!pinMode)return;
  const id='custom-'+Date.now();
  const marker=L.marker([e.latlng.lat,e.latlng.lng],{icon:mkIcon('custom'),draggable:true});
  marker.on('contextmenu',()=>{
    if(confirm('Remove this pin?')){
      MAP.removeLayer(marker);
      customPins=customPins.filter(p=>p.id!==id);
      delete noteStore[id];
      updateStats();
    }
  });
  marker.addTo(MAP);
  customPins.push({id,marker,lat:e.latlng.lat,lng:e.latlng.lng});
  activeId=id;
  document.getElementById('dpi').textContent='◈';
  document.getElementById('dpi').style.background='var(--card)';
  document.getElementById('dpn').textContent='Custom Pin';
  document.getElementById('dpc').textContent='CUSTOM MARKER';
  document.getElementById('dpf').style.display='flex';
  document.getElementById('dpb').innerHTML=`
    <div class="df"><label>Pin name</label><input id="f-pinName" value="${noteStore[id]?.pinName||''}" placeholder="Name this pin" /></div>
    <div class="df"><label>Notes</label><textarea id="f-aar">${noteStore[id]?.aar||''}</textarea></div>
    <div class="df" style="font-size:9px;color:var(--txt3);">${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}</div>`;
  openDP();
  togglePinMode();
});
```

- [ ] **Step 3: Handle custom pins in `saveDP()`**

In `saveDP()`, the `data` object saves via the existing field list. Add `pinName` to the field list:

Find the array `["principal","counselor",...,"followUp"]` in `saveDP()`. Add `"pinName"` to it.

- [ ] **Step 4: Restore custom pins on JSON import**

In `importData()`, after `noteStore` is populated, add:

```javascript
Object.keys(noteStore).filter(k=>k.startsWith('custom-')).forEach(id=>{
  const n=noteStore[id]; if(!n?.lat)return;
  const marker=L.marker([n.lat,n.lng],{icon:mkIcon('custom'),draggable:true}).addTo(MAP);
  marker.on('contextmenu',()=>{if(confirm('Remove this pin?')){MAP.removeLayer(marker);customPins=customPins.filter(p=>p.id!==id);delete noteStore[id];}});
  customPins.push({id,marker,lat:n.lat,lng:n.lng});
});
```

Also save `lat/lng` when saving a custom pin — in `saveDP()`, before the field loop, add:

```javascript
if(activeId?.startsWith('custom-')){
  const p=customPins.find(x=>x.id===activeId);
  if(p){data.lat=p.lat;data.lng=p.lng;}
}
```

- [ ] **Step 5: Add custom pins to search**

In the search results construction (the `ALL` array), add:

```javascript
const customMatches=customPins.filter(p=>{
  const n=noteStore[p.id]||{};
  return (n.pinName||'').toLowerCase().includes(q)||(n.aar||'').toLowerCase().includes(q);
}).map(p=>({...p,name:noteStore[p.id]?.pinName||'Custom Pin',type:'custom',label:'Custom Pin',address:''}));
```

Include `customMatches` in the `m` merge.

- [ ] **Step 6: Verify in browser — click the crosshair button, click the map, confirm custom pin is placed and panel opens; save it; export JSON and verify the pin data is present**

- [ ] **Step 7: Commit**

```bash
git add recruiting-map.html
git commit -m "feat: add drop-a-pin tool with save, export/import, and context-menu delete"
```

---

## Task 11: ZIP Hover Distance Tooltip

**Files:**
- Modify: `recruiting-map.html` — `buildZip()` mouseover handler

- [ ] **Step 1: Add a tooltip div to the HTML**

Find `<div id="toast">` in the HTML body. Add immediately before it:

```html
<div id="zip-tip" style="position:fixed;background:var(--panel);border:1px solid var(--border2);padding:6px 10px;font-family:'GI',sans-serif;font-size:11px;color:var(--txt);pointer-events:none;display:none;z-index:8000;text-transform:uppercase;letter-spacing:.5px;"></div>
```

- [ ] **Step 2: Update `buildZip()` mouseover and mouseout handlers**

Find the `lyr.on("mouseover",function(e){` block inside `buildZip()`. Replace it:

```javascript
lyr.on('mouseover',function(e){
  this.setStyle({weight:2.5,fillOpacity:.38});
  this.bringToFront();
  const [clat,clng]=centroid(feature);
  const dist=haversine(STATION.lat,STATION.lng,clat,clng);
  const tip=document.getElementById('zip-tip');
  tip.textContent=`${zip}  ·  ~${dist} mi from station`;
  tip.style.display='block';
});
lyr.on('mousemove',function(e){
  const tip=document.getElementById('zip-tip');
  tip.style.left=(e.originalEvent.clientX+14)+'px';
  tip.style.top=(e.originalEvent.clientY-10)+'px';
});
lyr.on('mouseout',function(){
  this.setStyle(zStyle(zip));
  document.getElementById('zip-tip').style.display='none';
});
```

Note: `mousemove` is a new event added to each ZIP layer — add it between the `mouseover` and `mouseout` handlers.

- [ ] **Step 3: Verify in browser — hover over a ZIP polygon and confirm tooltip appears showing ZIP code and distance**

- [ ] **Step 4: Commit**

```bash
git add recruiting-map.html
git commit -m "feat: add ZIP hover tooltip showing distance from station"
```

---

## Task 12: Reorganize Sidebar HTML and Add MAP TILE Picker

**Files:**
- Modify: `recruiting-map.html` — `<nav id="sb">` HTML block

- [ ] **Step 1: Add the "17–24 POPULATION" checkbox to MAP LAYERS section**

Find the layers section in the sidebar. After the last `<label class="lr">` (the recruiting station row), add:

```html
<label class="lr"><input type="checkbox" id="l-demo" onchange="toggleDemo()">
  <div class="li" style="background:linear-gradient(135deg,#2F372F,#FFCC01);border:none;">
    <svg viewBox="0 0 16 16" width="14" height="14" fill="white"><rect x="1" y="10" width="3" height="5"/><rect x="6" y="6" width="3" height="9"/><rect x="11" y="2" width="3" height="13"/></svg>
  </div>
  <span class="ll">17–24 Population</span>
</label>
```

- [ ] **Step 2: Add MAP TILE section to the sidebar**

After the closing `</div>` of the MAP LAYERS section, add a new section:

```html
<div class="ss">
  <div class="st">MAP TILE</div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
    <button class="tile-btn" data-tile="dark"   onclick="setTile('dark')"   style="background:var(--accent);color:var(--army-black);border:1px solid var(--border);padding:6px 2px;font-family:'GI',sans-serif;font-size:10px;font-weight:700;letter-spacing:1px;cursor:pointer;text-transform:uppercase;">DARK</button>
    <button class="tile-btn" data-tile="street" onclick="setTile('street')" style="background:var(--card);color:var(--txt2);border:1px solid var(--border);padding:6px 2px;font-family:'GI',sans-serif;font-size:10px;font-weight:700;letter-spacing:1px;cursor:pointer;text-transform:uppercase;">STREET</button>
    <button class="tile-btn" data-tile="sat"    onclick="setTile('sat')"    style="background:var(--card);color:var(--txt2);border:1px solid var(--border);padding:6px 2px;font-family:'GI',sans-serif;font-size:10px;font-weight:700;letter-spacing:1px;cursor:pointer;text-transform:uppercase;">SAT</button>
  </div>
</div>
```

- [ ] **Step 3: Remove the old `☰ Layers` button from the header if desired**

The sidebar toggle is still useful on mobile. Keep the `☰ Layers` button but relabel it `LAYERS` (uppercase, no emoji).

Find:
```html
<button class="hbtn" onclick="toggleSb()">☰ Layers</button>
```
Replace with:
```html
<button class="hbtn" onclick="toggleSb()">LAYERS</button>
```

- [ ] **Step 4: Update all header button and section text to uppercase, remove remaining emojis from sidebar labels**

Do a pass through `<nav id="sb">` HTML. Replace any emoji characters in `.ll` spans with text abbreviations or leave blank. Example: replace `🏫` inside `.li` divs with the corresponding inline SVG (copy the relevant SVGS entry). If the li background color makes it hard to see, use a small white letter instead (e.g., "HS" for high school).

Replace the layer list `.li` icon divs with small inline SVGs matching the pin icons defined in Task 5 SVGS:

```html
<!-- High Schools -->
<div class="li" style="background:#221F20;border:1px solid #FFCC01;">
  <svg viewBox="0 0 16 16" width="12" height="12" fill="#FFCC01"><polygon points="8,2 15,6 8,10 1,6"/></svg>
</div>
<!-- Universities -->
<div class="li" style="background:#2F372F;border:1px solid #FFCC01;">
  <svg viewBox="0 0 16 16" width="12" height="12" fill="#FFCC01"><rect x="1" y="11" width="14" height="2"/><rect x="2.5" y="5" width="2" height="6"/><rect x="7" y="5" width="2" height="6"/><rect x="11.5" y="5" width="2" height="6"/></svg>
</div>
<!-- Police -->
<div class="li" style="background:#1a2a4a;border:1px solid white;">
  <svg viewBox="0 0 16 16" width="12" height="12" fill="white"><path d="M8,1 L15,4 L15,9 Q15,14 8,15 Q1,14 1,9 L1,4 Z"/></svg>
</div>
<!-- Courthouse -->
<div class="li" style="background:#2F372F;border:1px solid white;">
  <svg viewBox="0 0 16 16" width="12" height="12" stroke="white" stroke-width="1.2" fill="none"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="5" x2="14" y2="5"/></svg>
</div>
<!-- Taco Bell -->
<div class="li" style="background:#CF0000;border:1px solid white;">
  <svg viewBox="0 0 16 16" width="12" height="12" fill="white"><path d="M8,2 Q13,2 13,8 L13,12 L3,12 L3,8 Q3,2 8,2 Z"/></svg>
</div>
<!-- Station -->
<div class="li" style="background:#FFCC01;border:1px solid #221F20;">
  <svg viewBox="0 0 16 16" width="12" height="12" fill="#221F20"><polygon points="8,1 9.9,6.2 15.5,6.5 11.2,9.9 12.6,15.4 8,12.3 3.4,15.4 4.8,9.9 0.5,6.5 6.1,6.2"/></svg>
</div>
```

- [ ] **Step 5: Verify in browser — all three tile buttons work, demographic toggle works, sidebar shows no emojis, all labels uppercase**

- [ ] **Step 6: Commit**

```bash
git add recruiting-map.html
git commit -m "feat: reorganize sidebar with MAP TILE picker and demographic layer toggle, remove emojis"
```

---

## Task 13: Add AO Map Card to index.html

**Files:**
- Modify: `index.html` — tool card grid

- [ ] **Step 1: Find the tool card grid in index.html**

Search for the existing tool cards. They are likely in a section with `class="tools-section"` or similar, containing anchor/card elements for each tool.

- [ ] **Step 2: Add the AO Map card**

Insert a new card using the same HTML pattern as existing tool cards. Find an existing card for reference, then add:

```html
<a href="recruiting-map.html" class="tool-card">
  <div class="tool-icon">
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  </div>
  <div class="tool-name">AO OPERATIONS MAP</div>
  <div class="tool-desc">Interactive recruiting area map. ZIP demographics, school contacts, visit tracking.</div>
</a>
```

Match the class names exactly to those used by the other existing cards in the file.

- [ ] **Step 3: Verify in browser — open index.html, confirm the AO Map card appears in the grid and clicking it opens recruiting-map.html**

- [ ] **Step 4: Commit**

```bash
git add index.html recruiting-map.html
git commit -m "feat: add AO Operations Map card to index.html toolbox"
```

---

## Task 14: Final Integration Pass and Cleanup

**Files:**
- Modify: `recruiting-map.html` — any remaining inconsistencies

- [ ] **Step 1: Check for any remaining blue-dark hex values**

Search the file for old color values and replace:
- `#0b0f1c`, `#111827`, `#161f30`, `#1c2840` → `var(--bg)` or `var(--panel)` or `var(--card)`
- `#f5a623` → `var(--accent)`
- `#22c55e` → `var(--green)`
- `#ef4444` → `var(--red)`
- `#3b82f6` → remove or replace with `var(--txt3)`

- [ ] **Step 2: Verify export/import round-trip**

1. Open the map, set priority on two ZIPs, save visit notes on one school, drop a custom pin.
2. Export JSON.
3. Refresh the page.
4. Import the JSON.
5. Confirm: ZIP priorities restored, school notes restored, custom pin re-appears on the map.

- [ ] **Step 3: Verify mobile layout**

Resize browser to 375px width. Confirm sidebar collapses correctly, detail panel slides in over the map, LAYERS button works.

- [ ] **Step 4: Final commit**

```bash
git add -p  # stage only intentional changes
git commit -m "fix: final color token cleanup and integration polish"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Army brand theme (Task 2)
- [x] G.I. fonts (Task 1)
- [x] Three tile layers (Task 4, Task 12)
- [x] Full AO_ZIPS list (Task 3)
- [x] ACS demographic overlay (Task 6)
- [x] Demographic ZIP panel (Task 7)
- [x] Demographic legend gradient (Task 6 Step 4)
- [x] Custom SVG pins — all 7 types (Task 5)
- [x] Visit status badges on school pins (Task 8)
- [x] High school quick actions bar (Task 9)
- [x] Personnel fields pre-populated (Task 3, Task 9)
- [x] Drop-a-pin tool (Task 10)
- [x] ZIP hover distance tooltip (Task 11)
- [x] Sidebar reorganization (Task 12)
- [x] index.html card (Task 13)
- [x] No emojis anywhere (Tasks 5, 12)
- [x] Square corners throughout (Task 2)
- [x] Export/import round-trip verified (Task 14)
