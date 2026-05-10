# PacketQC Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `PacketQC.html` with Army Black/Gold retheme, six new recruiter features, full content enrichment (42 reg citations, 5 expanded tips, 5 new program sections), and three bug fixes — delivered as a single-file HTML with no build step.

**Architecture:** All changes are in-place edits to `PacketQC.html` (224 lines). CSS custom properties handle the retheme (token + font swap only — no layout changes). New features extend the in-memory `state` object and add helper functions before the closing `</script>`. Content enrichment is entirely within the `T` object and `buildSections()` function. No new files created; no CDN links added except replacing the Google Fonts URL.

**Tech Stack:** Vanilla HTML / CSS / JS. Archivo Black + Archivo via Google Fonts. No frameworks, no build step, no server.

---

## File Map

| Area | Lines (approx) | What changes |
|---|---|---|
| `PacketQC.html` L7 | Google Fonts link | Replace font families |
| `PacketQC.html` L10–20 | `:root` CSS tokens | Replace all values |
| `PacketQC.html` L24 | `.hdr` rule | Remove hardcoded bg color |
| `PacketQC.html` L101 | `.tippanel` rule | Remove hardcoded bg color |
| `PacketQC.html` L113 | `@media print` block | Full replacement |
| `PacketQC.html` L114 | After `</style>` | Add `#print-header` CSS + `.tool-chip` CSS |
| `PacketQC.html` L117 | `<body>` | Inject `#print-header` div |
| `PacketQC.html` L143–190 | Profile form `#pinputs` | Add GC + SC text inputs |
| `PacketQC.html` L196 | `const T={...}` | Add/update 42 reg citations, 5 tip expansions, 22 new T keys |
| `PacketQC.html` L197 | `function buildSections(p)` | Remove `umf680_1` item; add OCS/WOFT/SMP/FLRI/ATP blocks |
| `PacketQC.html` L199 | `let state=...` | Add `initials:{}`, `notes:{}` |
| `PacketQC.html` L202–222 | JS functions | Modify `getProfile`, `lockProfile`, `renderAbar`, `buildSectionEl`, `buildItemEl`, `refreshSection`, `updateSbar`, `resetAll`, `unlockProfile`; add 5 new functions |

---

## Task 1: CSS Retheme — Font Link + Token Swap + Hardcoded Colors

**File:** `PacketQC.html`

- [ ] **Step 1: Replace the Google Fonts link (L7)**

Find exactly:
```
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```
Replace with:
```html
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black:wght@400&family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Replace the entire `:root` block (L10–20)**

Find exactly:
```css
:root{
  --bg:#07101f;--surface:#0d1a2f;--surface-2:#121f38;--surface-3:#162440;
  --border:#1a3050;--border-light:#1f3a60;
  --gold:#f0bc1a;--gold-dim:#b8900e;--gold-glow:rgba(240,188,26,0.12);
  --green:#16a34a;--green-light:#22c55e;--green-glow:rgba(22,163,74,0.15);
  --red:#dc2626;--red-light:#ef4444;--red-glow:rgba(220,38,38,0.15);
  --amber:#d97706;--amber-light:#f59e0b;--amber-glow:rgba(217,119,6,0.15);
  --blue:#2563eb;--blue-light:#60a5fa;
  --text:#dde6f0;--text-dim:#8ea8c3;--text-muted:#3d5570;
  --font-d:'Syne',sans-serif;--font-m:'IBM Plex Mono',monospace;
}
```
Replace with:
```css
:root{
  --bg:#221F20;--surface:#2F372F;--surface-2:#3F4B36;--surface-3:#4a5a40;
  --border:#4a5a40;--border-light:#5a6e50;
  --gold:#FFCC01;--gold-dim:#ccaa00;--gold-glow:rgba(255,204,1,0.10);
  --green:#4F7942;--green-light:#5d9150;--green-glow:rgba(79,121,66,0.20);
  --red:#A02E2E;--red-light:#c23a3a;--red-glow:rgba(160,46,46,0.15);
  --amber:#E25822;--amber-light:#f0723a;--amber-glow:rgba(226,88,34,0.15);
  --blue:#2563eb;--blue-light:#60a5fa;
  --text:#ffffff;--text-dim:#A8A6A2;--text-muted:#6E6C68;
  --font-d:'Archivo Black','Arial Black',sans-serif;--font-m:'Archivo',Arial,sans-serif;
}
```

- [ ] **Step 3: Fix hardcoded header background (L24)**

Find:
```
background:linear-gradient(135deg,#060e1c 0%,#0c1828 100%);border-bottom:2px solid var(--gold);padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:200;}
```
Replace with:
```
background:var(--bg);border-bottom:2px solid var(--gold);padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:200;}
```

- [ ] **Step 4: Fix hardcoded tippanel background (L101)**

Find:
```
.tippanel{display:none;background:rgba(6,14,28,.7);
```
Replace with:
```
.tippanel{display:none;background:rgba(34,31,32,.85);
```

- [ ] **Step 5: Open the file in a browser, verify colors**

Expected: header is Army Black (`#221F20`), section cards are OD green, badges and gold accents are `#FFCC01`, fonts are Archivo. No blue-navy anywhere.

- [ ] **Step 6: Commit**

```bash
git add PacketQC.html
git commit -m "feat: retheme PacketQC to Army Black/Gold design system"
```

---

## Task 2: Bug Fixes — Form Reference, Tip Corrections, Mar 2026 Reg Update

**File:** `PacketQC.html`

**Bug 1: UMF 680-3A-1 does not exist** — the USMEPCOM 680 series contains only the 680-3A and 680-3A-2. Remove the item and its T key.

- [ ] **Step 1: Remove `umf680_1` T key**

In the `const T={...}` block (L196), find:
```
umf680_1:{v:"Armed Forces Classification / additional screening data. Verify AFQT and line scores match iKrome record.",m:"Scores on form don't match iKrome — check for re-test update.",r:""},
```
Delete that entire key-value pair (including the trailing comma).

- [ ] **Step 2: Remove `umf680_1` from buildSections (L197)**

In `buildSections`, find:
```
{id:'umf680_1',label:'UMF 680-3A-1',tip:T.umf680_1},
```
Delete that line.

**Bug 2: Live Scan authorization annotation location** — UR 601-210 specifies the SC annotates authorization in CONTACT HISTORY, not "RZ remarks." Update both `live_scan` and `sc_remarks` tips.

- [ ] **Step 3: Fix `live_scan` tip**

Find:
```
live_scan:{v:"Live Scan results are valid for 120 days. SC must enter 'Live Scan Authorized' in the Station Commander Remarks field in RZ before initiating SC QC — without this entry, the results are not validated for MEPS. Do NOT project with an expired Live Scan.",m:"Live Scan older than 120 days — expired. SC has not annotated authorization in RZ remarks — this is a common GC NO GO reason. Live Scan completed at wrong location.",r:"UM 331"}
```
Replace with:
```
live_scan:{v:"Live Scan results are valid for 120 days. Per UR 601-210, the SC must annotate 'Station Live Scan Authorized' in CONTACT HISTORY in RZ — not in the SC Remarks field. Without this contact history entry, the Live Scan is not validated for MEPS. Do NOT project with an expired Live Scan.",m:"Live Scan older than 120 days — expired. SC has annotated authorization in the wrong location (SC Remarks instead of Contact History) — this is a frequent GC NO GO finding. Live Scan completed at wrong location.",r:"UR 601-210 para 5-5"}
```

- [ ] **Step 4: Fix `sc_remarks` tip**

Find:
```
sc_remarks:{v:"The Station Commander must enter 'Live Scan Authorized' in the Station Commander Remarks field in RZ before initiating the SC QC Checkpoint. Without this entry, the Live Scan is not validated for MEPS — this is a frequent GC NO GO finding.",m:"SC QC initiated before the SC adds the Live Scan authorization remark. Recruiter initiates without confirming SC completed this step.",r:"UM 331"}
```
Replace with:
```
sc_remarks:{v:"Per UR 601-210, the SC must annotate 'Station Live Scan Authorized' in CONTACT HISTORY in RZ before the SC QC Checkpoint can be initiated. This is separate from the SC Remarks field. After all GENESIS sections are marked Complete, the recruiter clicks 'Initiate SC Quality Checkpoint' — SC and ASC receive automatic email notification.",m:"SC annotated in SC Remarks instead of Contact History — wrong location, will NO GO at GC review. SC QC initiated before the Contact History entry is made. Recruiter doesn't confirm with SC before initiating.",r:"UR 601-210 para 6-2"}
```

**Bug 3: Temp Res valid only 7 calendar days** — UR 601-210 para 24-3 specifies 7-day validity; current tip omits this.

- [ ] **Step 5: Fix `temp_res` tip**

Find:
```
temp_res:{v:"A Temporary Reservation (Temp Res) must be created in RZ before the MEPS date can be confirmed. Verify the Temp Res reflects the correct MEPS location, projected date, and applicant data. Monitor expiration — if the physical date shifts, extend or recreate as needed.",m:"Scheduling an applicant at MEPS without first creating a Temp Res in RZ. Temp Res created for the wrong MEPS location. Temp Res allowed to expire before the scheduled date — applicant loses the slot and must be re-scheduled.",r:"UM 331"}
```
Replace with:
```
temp_res:{v:"A Temporary Reservation (Temp Res) must be created in RZ before the MEPS date can be confirmed. A Temp Res is valid for only 7 calendar days (UR 601-210 para 24-3) — if the MEPS date shifts beyond 7 days, the Temp Res must be recreated. Maximum 3 Temp Reservations per applicant. Verify the Temp Res reflects the correct MEPS location, projected date, and applicant data.",m:"Temp Res allowed to expire before the scheduled physical — applicant loses the slot. More than 3 Temp Res attempts exhausted — coordinate with GC. Wrong MEPS location on the Temp Res. Scheduling at MEPS without a Temp Res in RZ.",r:"UR 601-210 para 24-3"}
```

**Bug 4: Mar 2026 — single marijuana possession / paraphernalia no longer waiverable** — AR 601-210 para 4-6 (Mar 2026). Add a critical note to `w_stmt`.

- [ ] **Step 6: Update `w_stmt` tip**

Find:
```
w_stmt:{v:"Must be written in first person, signed and dated by the applicant. Must address the specific offense or condition directly. Review for completeness — generic statements that don't address the specific issue are returned by chain of command.",m:"Generic statement doesn't address the specific offense. Recruiter-written statement rather than in the applicant's own words. Unsigned or undated.",r:""}
```
Replace with:
```
w_stmt:{v:"Must be written in first person, signed and dated by the applicant. Must address the specific offense or condition directly. Review for completeness — generic statements that don't address the specific issue are returned by chain of command. CRITICAL (AR 601-210 para 4-6, Mar 2026): a single marijuana possession offense OR a single drug paraphernalia possession offense is no longer waiverable — STOP and notify chain of command immediately if the applicant's disqualifying event falls in this category before preparing any waiver documents.",m:"Generic statement that doesn't address the specific offense. Recruiter-written statement rather than in the applicant's own words. Unsigned or undated. Waiver packet prepared for a marijuana or paraphernalia offense without first confirming waiver eligibility per current AR 601-210 — rule changed March 2026.",r:"AR 601-210 Ch 4; AR 601-210 para 4-6 (Mar 2026)"}
```

- [ ] **Step 7: Open file in browser, generate a checklist with a moral waiver selected**

Verify: `w_stmt` tip shows the March 2026 marijuana note. Live Scan tip correctly references "Contact History." Temp Res tip shows 7-day validity.

- [ ] **Step 8: Commit**

```bash
git add PacketQC.html
git commit -m "fix: correct live scan location, temp res validity, remove non-existent UMF 680-3A-1, add Mar 2026 marijuana waiver note"
```

---

## Task 3: Content Enrichment — Regulatory Citations (42 fields)

**File:** `PacketQC.html` (T object, L196)

All replacements are in the `const T={...}` object. Each entry below shows the **key name**, the **old `r:""` value**, and the **new `r:"citation"` value**. Use editor find-and-replace; the surrounding context is the key name.

- [ ] **Step 1: Apply all 42 reg citation replacements**

For each entry, find the key pattern shown and replace `r:""` with the new value. Work top-to-bottom through the T object.

| Key | Find (ends with) | Replace `r:` with |
|---|---|---|
| `dl` | `Learner's permit used when a full DL is available.",r:""}` | `r:"AR 601-210 para 2-5"` |
| `passport_cit` | `Country-of-origin passport submitted instead of US passport for a naturalized citizen.",r:""}` | `r:"AR 601-210 para 2-5c"` |
| `nat_cert` | `Certificate of Citizenship confused with Certificate of Naturalization — these are different documents issued by USCIS.",r:""}` | `r:"AR 601-210 para 2-5d"` |
| `hs_letter` | `Email printout submitted instead of official letter.",r:""}` | `r:"AR 601-210 para 2-8"` |
| `hs_trans` | `Transcript doesn't reflect graduation for a grad applicant.",r:""}` | `r:"AR 601-210 para 2-8"` |
| `hs_dip` | `Online diploma from an unrecognized program — flag before projecting.",r:""}` | `r:"AR 601-210 para 2-8"` |
| `college_letter` | `Letter doesn't confirm the applicant is currently enrolled this semester.",r:""}` | `r:"AR 601-210 para 2-8"` |
| `college_trans` | `Old transcript that doesn't include most recent semester completed.",r:""}` | `r:"AR 601-210 para 2-8"` |
| `dd214` | `RE code not cross-checked against waiver eligibility.",r:"AR 601-210"}` | `r:"AR 601-210 para 3-2"` |
| `redd` | `Data doesn't match DD 214.",r:""}` | `r:"AR 601-210 para 3-2; USAREC Pam 601-32"` |
| `da1059` | `Missing for PS applicants who attended AIT or formal military schools.",r:""}` | `r:"AR 623-3; AR 601-210 para 3-2"` |
| `pha` | `Missing provider signature.",r:""}` | `r:"AR 40-501; USMEPCOM Reg 40-1"` |
| `mar_cert` | `Unofficial copy. Prior marriage not disclosed by applicant — ask directly`,r:""}` | `r:"AR 601-210 para 2-14"` |
| `div_dec` | `Decree doesn't address custody when children are present.",r:""}` | `r:"AR 601-210 para 2-14"` |
| `dep_docs` | `Stepchild BC doesn't list applicant as parent — adoption paperwork may be needed.",r:""}` | `r:"AR 601-210 para 2-14"` |
| `dd2005` | `applicant must sign a fresh one for each MEPS visit.",r:""}` | `r:"DoDI 6490.02E; 5 USC 552a"` |
| `dd369` | `Don't project until all are back — GC will NO GO the packet.",r:""}` | `r:"AR 601-210 para 2-18"` |
| `sex_offender` | `Check not run before projection. Results not documented.",r:""}` | `r:"AR 601-210 para 2-18; USAREC Policy"` |
| `genesis_person` | `Marital Status not updated after a recent marriage or divorce.",r:""}` | `r:"UR 601-210 Ch 5; UM 331"` |
| `genesis_s1` | `Aliases not matching what appears on other documents.",r:""}` | `r:"UR 601-210 Ch 5; UM 331"` |
| `genesis_s2` | `Family members disclosed elsewhere in the record but missing from this tab.",r:""}` | `r:"UR 601-210 Ch 5; UM 331"` |
| `genesis_psych` | `Group associations section left blank when applicant disclosed membership`,r:""}` | `r:"UR 601-210 Ch 5; UM 331"` |
| `genesis_res` | `Dorm/temporary housing not listed.",r:""}` | `r:"UR 601-210 Ch 5; UM 331"` |
| `genesis_emp` | `Gap periods left blank without explanation.",r:""}` | `r:"UR 601-210 Ch 5; UM 331"` |
| `genesis_mil` | `Prior federal financial issues undisclosed and caught later.",r:""}` | `r:"UR 601-210 Ch 5; UM 331"` |
| `genesis_ed` | `Education entries inconsistent with submitted transcripts.",r:""}` | `r:"UR 601-210 Ch 5; UM 331"` |
| `genesis_fam` | `Parent name in GENESIS doesn't match BC spelling.",r:""}` | `r:"UR 601-210 Ch 5; UM 331"` |
| `genesis_cit` | `I-551 category code not reviewed.",r:"AR 601-210 para 2-5f"}` | `r:"AR 601-210 para 2-5f; UR 601-210 Ch 5"` |
| `genesis_refs` | `Same person listed twice under different relationship labels.",r:""}` | `r:"UR 601-210 Ch 5; UM 331"` |
| `genesis_docs` | `Blurry or cut-off scans not caught before SC QC initiation.",r:""}` | `r:"UR 601-210 Ch 5; UM 331"` |
| `sf86` | `Report run too early — re-run after all final GENESIS edits are complete.",r:""}` | `r:"5 CFR Part 731; UR 601-210 Ch 6"` |
| `w_co` | `Memo dated so long ago a fresh one is needed.",r:""}` | `r:"AR 601-210 para 4-4"` |
| `w_bn` | `Wrong BN letterhead.",r:""}` | `r:"AR 601-210 para 4-4"` |
| `w_incident` | `Applicant's summary of events substituted for official report.",r:""}` | `r:"AR 601-210 para 4-3"` |
| `w_dd370` | `Applicant name and SSN not completed on all three cards.",r:""}` | `r:"AR 601-210; 28 CFR Part 50"` |
| `w_mirs` | `AFQT score on MIRS doesn't match current scores due to a re-test that wasn't updated.",r:""}` | `r:"USMEPCOM Reg 601-23"` |
| `w_tat_photo` | `Undated photos.",r:""}` | `r:"AR 601-210 para 3-4"` |
| `w_chaplain` | `Memo doesn't address the specific accommodation (e.g., beard, headwear).",r:""}` | `r:"AR 600-20 Ch 5; AR 601-210"` |
| `w_caretaker` | `No indication of relationship to applicant or dependents.",r:""}` | `r:"AR 601-210 para 2-15; AR 600-20 Ch 5"` |
| `w_da3072` | `Submitted without the accompanying Family Care Plan.",r:""}` | `r:"AR 601-210 para 2-15; AR 600-20 Ch 5"` |
| `w_fcp` | `Caretaker contact info not included.",r:""}` | `r:"AR 601-210 para 2-15; AR 600-20 Ch 5"` |
| `arms_docs` | `680-ADP incomplete or missing.",r:"FUTURE SOLDIER PREPARATORY COURSE reg"}` | `r:"USAREC ARMS 2.0 Program SOP; USMEPCOM Reg 601-23"` |

- [ ] **Step 2: Verify count — grep for remaining empty r fields**

```bash
grep -o 'r:""' PacketQC.html | wc -l
```
Expected output: `0` (all empty r fields filled)

- [ ] **Step 3: Open file in browser, generate a checklist**

Click a `?` tip button. Verify the `📌` citation line appears at the bottom of at least three different tips.

- [ ] **Step 4: Commit**

```bash
git add PacketQC.html
git commit -m "feat: fill 42 regulatory citations in T object"
```

---

## Task 4: Content Enrichment — Expand 5 Thin Tips

**File:** `PacketQC.html` (T object, L196)

- [ ] **Step 1: Expand `redd` tip**

Find the entire `redd:{...}` value. Current `m:` ends with `Data doesn't match DD 214.`

Replace the `m:` value with:
```
"Unsigned REDD Report. Applicant signed an outdated version of the form — must be the current revision. Data entry errors on separation date or RE code not caught before SC QC — cross-check every field against the DD 214 before initiating. Separation dates on REDD differ by even one day from the DD 214 — reconcile before projection."
```

- [ ] **Step 2: Expand `pha` tip**

Current `m:` ends with `Missing provider signature.`

Replace the `m:` value with:
```
"Outdated PHA — not current for the most recent duty assignment period. Missing provider signature. PHA completed by a provider who is not authorized under AR 40-501 (e.g., civilian provider without DoD credentials). PHA date predates the applicant's most recent duty assignment — must cover the full period of reserve service."
```

- [ ] **Step 3: Expand `umf680_2` tip**

Current `m:` ends with `Inconsistent data between 680-3A and 680-3A-2.`

Replace the `m:` value with:
```
"Inconsistent data between 680-3A and 680-3A-2 — verify every shared field matches. 680-3A-2 completed before the 680-3A was submitted to MEPS — the 680-3A must precede and inform the 680-3A-2. Applicant data changed (address, medical history disclosure) after the 680-3A was submitted but the 680-3A-2 was not updated to reflect the change — always complete these forms in sequence and review both before submission."
```

- [ ] **Step 4: Expand `sex_offender` tip**

Current `m:` ends with `Results not documented.`

Replace the `m:` value with:
```
"Check not run before projection. Results not documented in the file. Check run against only the applicant's current address — must be run against all addresses in the residence history, not just the most recent one. Results printed but not signed or dated by the recruiter — sign and date the printout before placing in the packet."
```

- [ ] **Step 5: Expand `arms_docs` tip**

Current `m:` ends with `680-ADP incomplete or missing.`

Replace the `m:` value with:
```
"MIRS 1.1 not current — print immediately before packet submission, data changes after retests. 680-ADP submitted without a current MIRS confirming the ARMS 2.0 eligibility band. Applicant retested after the 680-ADP was prepared and eligibility band changed — packet not updated to reflect the new band. Verify whether applicant is category AM (1–2% over, BN-level approval) or A6 (2.1–6%, EEPD-level, attends FSPC at Fort Jackson) — different approval chains and different OPAT requirements apply."
```

- [ ] **Step 6: Open file in browser, generate a checklist with an ARMS 2.0 applicant**

Check the `arms_docs` tip. Verify the MIRS + eligibility band content appears.

- [ ] **Step 7: Commit**

```bash
git add PacketQC.html
git commit -m "feat: expand 5 thin tips with additional verify/mistake content"
```

---

## Task 5: New Program Sections — T Keys + buildSections Blocks

**File:** `PacketQC.html`

### Step 1: Insert 22 new T keys into the T object

Find the substring `,temp_res:{v:` in the T object (L196) and insert the following 22 keys immediately before it (between the preceding `}` and `,temp_res`):

```javascript
,ocs_da61:{v:"DA Form 61 — Application for Appointment as Commissioned Officer. All blocks complete; applicant signs in front of recruiter. Verify full legal name matches SSC and BC exactly. Confirm applicant meets OCS basic eligibility: age under 29 NLT commissioning, US citizenship, bachelor's degree.",m:"Unsigned form submitted. Name discrepancy (middle name vs. initial). Wrong version of the form — verify current USAREC edition. Ineligible applicant — OCS requires citizenship, not LPR status.",r:"AR 601-100; AR 601-210"},ocs_trans:{v:"Sealed official transcripts from the degree-granting institution — student or unofficial copies are not acceptable. Must confirm a conferred bachelor's degree. Institution must be regionally accredited. If degree is pending conferral, an official Registrar letter confirming the date is temporarily acceptable — confirm with GC.",m:"Unofficial transcript or student-printed copy submitted. Transcript shows enrollment but not degree conferral. Institution not regionally accredited — verify eligibility with chain of command before proceeding.",r:"AR 601-100"},ocs_lor:{v:"Three letters of recommendation required. Primary recommenders should be commissioned officers (O-3 or above); senior civilian equivalents are acceptable per current USAREC guidance. Each letter must be on official letterhead, dated within 12 months, signed (not initialed), and specifically address leadership potential and character.",m:"Letter from an NCO — O-3 or above is required. Undated or generic letter not addressed to OCS. Letters duplicated from a prior unsuccessful board submission — verify dates are current.",r:"AR 601-100"},ocs_gt:{v:"GT score of 110 or higher verified in iKrome line scores. GT (not AFQT) is the qualifying metric — confirm the GT line score specifically. Score must be within the 2-year validity window. If applicant has a PICAT only, the MEPS confirmation test must be completed before the packet is submitted.",m:"Only AFQT verified — must confirm GT line score specifically. Expired score — must retest before submitting. PICAT on file but confirmation test not yet completed.",r:"AR 601-100"},ocs_acft:{v:"ACFT score documentation must reflect a passing score at the OCS standard for the applicant's age/gender group. Must be certified — signed by the test officer or Master Fitness Trainer. Verify test date for currency; check current USAREC policy on score validity window.",m:"Uncertified score sheet or self-reported score without documentation. Score below OCS standard for the applicant's age group. Test administered by someone not certified as an MFT.",r:"AR 601-100; FM 7-22"},ocs_photo:{v:"Official Army photo in Army Service Uniform (ASU). Must be current — taken within the last 6 months. Front-facing, plain background, per AR 640-30 standards. If prior service, uniform must reflect correct component and rank.",m:"Civilian or informal photo submitted. Photo older than 6 months. Wrong uniform — PT or ACU not acceptable for OCS packet photo.",r:"AR 640-30"},ocs_med:{v:"Standard MEPS physical clearance required — OCS does not use a flight physical. No pending medical holds or unresolved disqualifications. If a complex prescreen was submitted, MEPS must return a favorable disposition before the packet is submitted. Coordinate with GC if any medical issue is flagged.",m:"Packet submitted with an unresolved medical hold. Complex prescreen pending MEPS disposition. Applicant confused about needing a flight physical — standard MEPS only for OCS.",r:"AR 40-501; USMEPCOM Reg 40-1"},woft_da61:{v:"DA Form 61 — Application for Appointment as Warrant Officer (not the Commissioned Officer version). All blocks complete; applicant signs in front of recruiter. Verify name matches SSC and BC. Military service history section must be fully complete for all reserve and prior service.",m:"Commissioned Officer version of DA 61 submitted — wrong version for WOFT. Incomplete military service history. Name discrepancy between DA 61 and source documents.",r:"AR 135-100"},woft_sift:{v:"Minimum SIFT score of 40 required. Obtain the official score sheet from the testing facility or RSC — do not accept self-reported scores. Verify score is current per USAREC policy on validity window. Coordinate with RSC if applicant needs a retest — retesting opportunities are limited.",m:"Score below 40 — do not initiate packet without RSC coordination on retest eligibility. Score sheet from applicant rather than official source. Score validity window not verified — may need retest.",r:"AR 135-100; USAREC WOFT Selection Policy"},woft_fp:{v:"Class 1A Flight Physical is required for WOFT — a standard MEPS physical is NOT sufficient. Must be scheduled at a MEPS that offers the Class 1A exam or at an approved military aviation medical facility. Notify MEPS in advance; coordinate scheduling with the RSC. The flight physical appointment is significantly longer than a standard MEPS processing day.",m:"Standard MEPS physical scheduled instead of a flight physical — applicant may process but will fail the WOFT medical requirement. MEPS location selected does not offer Class 1A exams — verify capability before scheduling. Applicant not informed of the longer appointment duration.",r:"AR 40-501; USAREC WOFT Selection Policy"},woft_gt:{v:"GT score of 110 or higher verified in iKrome line scores — same threshold as OCS. Confirm GT specifically, not just AFQT. Score must be within the 2-year validity window. Coordinate confirmation test if PICAT only.",m:"AFQT verified but GT not specifically confirmed in line scores. Expired score — must retest. PICAT on file without confirmation test scheduled.",r:"AR 135-100"},woft_trans:{v:"60+ credit hours preferred; a full bachelor's degree is not required for WOFT but strengthens the packet. Transcripts must be official. If applicant has no college education, document military training, leadership experience, and other qualifications — coordinate with GC on packet narrative strategy.",m:"No transcripts collected when applicant has college credits. Unofficial transcript submitted instead of official copy.",r:"AR 135-100"},woft_lor:{v:"Letters of recommendation from WO1 or above; commissioned officers are acceptable. Must be on official letterhead, dated within 12 months, and signed. Letters should address leadership potential, technical aptitude, and suitability for aviation service.",m:"Letter from an NCO — WO1 or above is required. Civilian or personal letter without official letterhead. Undated or letter more than 12 months old.",r:"AR 135-100"},smp_rotc:{v:"ROTC enrollment letter must come from the Professor of Military Science (PMS), on ROTC battalion letterhead. Must confirm active enrollment, current program year, and expected commissioning date. Without this letter the SMP cannot proceed — do not collect other documents until this is in hand.",m:"Letter from a ROTC instructor or cadet below PMS level — must be from the PMS specifically. Letter that doesn't include the expected commissioning date. Letter older than 6 months — obtain a current letter.",r:"AR 145-1"},smp_orders:{v:"Most recent assignment or attachment orders from the applicant's USAR or ARNG unit. Verify unit designation, effective date, and that the applicant's current obligation is active. Orders must be consistent with the applicant's reserve service record — if applicant has transferred, get orders from the current unit.",m:"Old orders from a prior unit submitted. Most recent orders not collected — always get the most recent set. Orders don't cover the current period of assignment.",r:"AR 135-91"},smp_trans:{v:"Academic transcript confirming ROTC enrollment and current academic standing. Must show the applicant is enrolled in good standing for the current semester. Unofficial transcript is generally acceptable for initial review; official may be required before packet is submitted — verify with GC.",m:"Transcript not current — doesn't include the most recent semester. Transcript shows academic probation or suspension — flag for GC before proceeding. Enrollment verification letter substituted for transcript.",r:"AR 145-1"},smp_contract:{v:"SMP contract must be signed by both the applicant and the ROTC battalion representative (typically the PMS or Operations Officer). Confirm the contract period aligns with the applicant's current program year. If applicant is a scholarship cadet, scholarship status and terms must be noted in the contract.",m:"Unsigned contract. Contract term doesn't align with current ROTC enrollment year. Scholarship status missing when applicant is a scholarship cadet — affects service obligation.",r:"AR 145-1"},smp_eval:{v:"Required if applicant holds NCO rank (E-5 and above) or officer rank in the reserve component. Must cover the most recent rating period. Coordinate with the applicant's unit chain of command to obtain the official evaluation report.",m:"Evaluation not collected when applicant is an E-5 or above in the reserve component. Outdated evaluation that doesn't cover the most recent rating period. Partial rating only — verify if a complete evaluation report exists.",r:"AR 623-3"},flri_dd214:{v:"Prior service officer separation documents. DD 214 must show commissioned service, the separation code, and character of discharge. If applicant served in multiple commissioned periods, collect DD 214 from each period. Verify RE code for waiver implications. Member 4 copy preferred.",m:"Member 1 copy only — Member 4 contains more separation data. DD 214 from an enlisted period submitted without the commissioned officer separation record. Multiple commissioned service periods but only one DD 214 collected.",r:"AR 601-210 para 3-2"},flri_da61:{v:"DA Form 61 — Application for Appointment. Complete all blocks; applicant signs in front of recruiter. As a prior officer, military service history must be complete and accurate. Verify name matches SSC and BC.",m:"Prior service history incomplete on DA 61. Wrong version of the form. Name discrepancy with source documents.",r:"AR 601-210"},flri_elig:{v:"FLRI eligibility verification memo must be obtained from the RSC or USAREC before initiating any packet documents. Program eligibility requirements change — do not assume the applicant qualifies. Do not begin document collection until written FLRI eligibility confirmation is in hand.",m:"Packet initiated before FLRI eligibility memo received. Memo from GC or recruiter instead of RSC/USAREC. Outdated memo from a previous application attempt — requirements may have changed.",r:"USAREC FLRI Program Policy"},flri_trans:{v:"Official sealed transcripts from the degree-granting institution. Degree is required for FLRI — verify the transcript confirms degree conferral. Institution must be regionally accredited. If applicant has a graduate degree, collect transcripts for both undergraduate and graduate levels.",m:"Unofficial transcript or student copy submitted. Transcript confirms enrollment but not degree conferral. Unaccredited institution.",r:"AR 601-210; AR 601-100"},flri_lor:{v:"Letters of recommendation from O-4 or above. Must be on official letterhead, dated within 12 months, signed (not initialed). Letters should address the applicant's prior leadership performance in commissioned service and suitability for return to commissioned duty.",m:"Letter from an O-3 — FLRI requires O-4 or above. Undated or generic letter. Letter from a prior service period more than 12 months ago.",r:"AR 601-100"},atp_elig:{v:"Confirm the applicant meets current USAREC ATP criteria with the GC before initiating any packet documents. ATP eligibility requirements change based on USAREC mission needs. Do not invest time in document collection until GC confirms the applicant is ATP-eligible in writing or by documented verbal confirmation.",m:"Packet initiated before GC confirms ATP eligibility. Applicant told by recruiter they qualify before GC verification — manage expectations. ATP option entered in iKrome before eligibility was confirmed by GC.",r:"USAREC Policy"},atp_scores:{v:"Current ASVAB or PICAT line scores showing the applicant qualifies on all required composite scores for the intended MOS under the ATP option. Verify in iKrome. ATP options may have MOS-specific line score requirements beyond the standard MOS floor — confirm exact requirements with GC.",m:"Only AFQT verified — composite line scores for the specific MOS must also be confirmed. Score expired — must retest. PICAT completed but MEPS confirmation test not yet scheduled — scores are not final until confirmation.",r:"USAREC Policy"},atp_contract:{v:"ATP enlistment option must be confirmed and coded in iKrome before MEPS scheduling. Verify the option code is correct for the intended MOS. Do not schedule the applicant at MEPS until the ATP option is locked in iKrome — option availability can close with no notice.",m:"MEPS scheduled before ATP option confirmed and coded in iKrome. Wrong ATP option code for the intended MOS. Option was available at the time of initial GC confirmation but closed before scheduling — re-verify before projecting.",r:"USAREC Policy"},atp_mos:{v:"ATP MOS must be available on the current USAREC MOS availability list and the applicant must qualify on all required line scores. Verify both MOS availability and composite score qualification with GC before projecting. ATP MOS availability changes frequently with mission requirements.",m:"MOS selected that is not currently available under ATP — availability must be re-verified immediately before projecting. Applicant meets AFQT but does not meet a required composite line score for the MOS. MOS availability not re-verified after a scheduling delay — option may have closed.",r:"USAREC Policy"}
```

- [ ] **Step 2: Insert 5 new program section blocks into `buildSections()`**

In `buildSections` (L197), find:
```javascript
if(progItems.length)S.push({id:'programs',icon:'📑',title:'Program-Specific Documents',items:progItems});S.push({id:'genesis',
```
Replace with:
```javascript
if(progItems.length)S.push({id:'programs',icon:'📑',title:'Program-Specific Documents',items:progItems});if(p.programs.includes('ocs')){S.push({id:'ocs',icon:'⭐',title:'OCS — Officer Candidate School',items:[{id:'ocs_da61',label:'DA Form 61 — Application for Appointment as Commissioned Officer',tip:T.ocs_da61},{id:'ocs_trans',label:'Official College Transcripts (sealed)',sub:"Bachelor's degree required; regionally accredited institution",tip:T.ocs_trans},{id:'ocs_lor',label:'Letters of Recommendation × 3',sub:'O-3 or above; official letterhead; dated within 12 months',tip:T.ocs_lor},{id:'ocs_gt',label:'GT Score 110+ (verified in iKrome line scores)',tip:T.ocs_gt},{id:'ocs_acft',label:'ACFT Score Documentation',sub:'Must meet OCS standard for age/gender group; certified',tip:T.ocs_acft},{id:'ocs_photo',label:'Official Army Photo — ASU uniform; current within 6 months',tip:T.ocs_photo},{id:'ocs_med',label:'MEPS Physical Clearance — no pending holds; standard MEPS only',tip:T.ocs_med}]});}if(p.programs.includes('woft')){S.push({id:'woft',icon:'🚁',title:'WOFT — Warrant Officer Flight Training',items:[{id:'woft_da61',label:'DA Form 61 — Application for Appointment as Warrant Officer',tip:T.woft_da61},{id:'woft_sift',label:'SIFT Score Sheet (minimum 40)',sub:'Coordinate retests with RSC if below threshold',tip:T.woft_sift},{id:'woft_fp',label:'Class 1A Flight Physical',sub:'NOT a standard MEPS physical — notify MEPS in advance; coordinate with RSC',tip:T.woft_fp},{id:'woft_gt',label:'GT Score 110+ (verified in iKrome line scores)',tip:T.woft_gt},{id:'woft_trans',label:'College Transcripts',sub:'60+ credit hours preferred; official copy',na:true,tip:T.woft_trans},{id:'woft_lor',label:'Letters of Recommendation',sub:'WO1 or above; commissioned officers acceptable',tip:T.woft_lor}]});}if(p.programs.includes('smp')){S.push({id:'smp',icon:'🎓',title:'SMP — Simultaneous Membership Program',items:[{id:'smp_rotc',label:'ROTC Enrollment Letter from PMS',sub:'Battalion letterhead; confirms enrollment and expected commissioning date',tip:T.smp_rotc},{id:'smp_orders',label:'Current USAR/NG Assignment Orders',tip:T.smp_orders},{id:'smp_trans',label:'Academic Transcript',sub:'Confirms ROTC enrollment and academic standing; current semester',tip:T.smp_trans},{id:'smp_contract',label:'SMP Contract — signed by applicant and ROTC battalion',sub:'Confirm program year and scholarship status',tip:T.smp_contract},{id:'smp_eval',label:'Most Recent NCOER or OER',sub:'Required if applicant holds NCO/officer rank in reserve component',na:true,tip:T.smp_eval}]});}if(p.programs.includes('flri')){S.push({id:'flri',icon:'🎖️',title:'FLRI — Future Leaders Recruiting Initiative',items:[{id:'flri_dd214',label:'DD 214 — Prior Officer Service Separation Document',sub:'Must show commissioned service, separation code, character of discharge',tip:T.flri_dd214},{id:'flri_da61',label:'DA Form 61 — Application for Appointment',tip:T.flri_da61},{id:'flri_elig',label:'FLRI Eligibility Verification Memo',sub:'From RSC or USAREC — obtain BEFORE initiating any documents',tip:T.flri_elig},{id:'flri_trans',label:'Official College Transcripts (sealed)',sub:'Degree required; regionally accredited institution',tip:T.flri_trans},{id:'flri_lor',label:'Letters of Recommendation',sub:'O-4 or above; official letterhead; within 12 months',tip:T.flri_lor}]});}if(p.programs.includes('atp')){S.push({id:'atp',icon:'📋',title:'ATP — Army Training Program',items:[{id:'atp_elig',label:'ATP Eligibility Verification',sub:'Confirm with GC BEFORE initiating — requirements change',tip:T.atp_elig},{id:'atp_scores',label:'Current ASVAB/Line Scores — qualifying scores for intended MOS',tip:T.atp_scores},{id:'atp_contract',label:'Enlistment Option Documentation',sub:'ATP option confirmed and coded in iKrome before MEPS scheduling',tip:T.atp_contract},{id:'atp_mos',label:'MOS Qualification Verification',sub:'ATP MOS must be available; all line scores must qualify',tip:T.atp_mos}]});}S.push({id:'genesis',
```

- [ ] **Step 3: Open file in browser and verify each new program section**

Test sequence:
1. Select OCS → Generate → confirm OCS section appears with 7 items
2. Select WOFT → Generate → confirm WOFT section with 6 items, flight physical note visible
3. Select SMP → Generate → confirm SMP section with 5 items, NCOER is N/A-able
4. Select FLRI → Generate → confirm FLRI section with 5 items
5. Select ATP → Generate → confirm ATP section with 4 items
6. Select OCS + WOFT together → both sections appear

- [ ] **Step 4: Commit**

```bash
git add PacketQC.html
git commit -m "feat: add OCS, WOFT, SMP, FLRI, ATP program sections with T keys and buildSections blocks"
```

---

## Task 6: State Evolution — Add `initials` and `notes`, Update Reset Functions

**File:** `PacketQC.html`

- [ ] **Step 1: Update the `state` initializer (L199)**

Find:
```javascript
let state={profile:null,sections:[],items:{}};
```
Replace with:
```javascript
let state={profile:null,sections:[],items:{},initials:{},notes:{}};
```

- [ ] **Step 2: Update `resetAll()` to clear initials and notes (L206)**

Find:
```javascript
state={profile:null,sections:[],items:{}};unlockProfile();
```
Replace with:
```javascript
state={profile:null,sections:[],items:{},initials:{},notes:{}};unlockProfile();
```

- [ ] **Step 3: Update `unlockProfile()` to clear initials and notes (L205)**

`unlockProfile` doesn't need to clear state (per the spec: "clicking Edit Profile alone does not reset" — only `generate()` and `resetAll()` reset). However, when unlocking, the UI elements for initials and notes need to be cleared from the DOM (they'll be rebuilt on next generate). Since `unlockProfile` already destroys `clist` innerHTML, no separate clear is needed for the DOM. The state (`initials`, `notes`) should NOT be cleared on `unlockProfile()` — only on `generate()`.

Update `generate()` to reset initials and notes state on each new generation:

Find:
```javascript
function generate(){const p=getProfile();if(!p.status||!p.age||!p.ed){alert('Status, Age/Gender, and Education are required to generate the checklist.');return;}state.profile=p;state.sections=buildSections(p);state.items={};
```
Replace with:
```javascript
function generate(){const p=getProfile();if(!p.status||!p.age||!p.ed){alert('Status, Age/Gender, and Education are required to generate the checklist.');return;}state.profile=p;state.sections=buildSections(p);state.items={};state.initials={};state.notes={};
```

- [ ] **Step 4: Verify state shape in browser console**

Open file → generate a checklist → open browser console → type `state` → confirm output shows `{profile:..., sections:..., items:..., initials:{}, notes:{}}`.

- [ ] **Step 5: Commit**

```bash
git add PacketQC.html
git commit -m "feat: add initials and notes fields to state, reset on generate"
```

---

## Task 7: GC / SC Profile Fields

**File:** `PacketQC.html`

- [ ] **Step 1: Add GC and SC inputs to the profile form**

In the profile form `#pinputs` section, find:
```html
      <div class="pactions">
        <button class="btn-pri" onclick="generate()">Generate QC Checklist →</button>
        <span class="pnote">Status, Age/Gender, and Education are required</span>
      </div>
```
Replace with:
```html
      <div class="pgrid" style="margin-top:.85rem">
        <div class="pfield"><label>Guidance Counselor (GC) Name</label><input type="text" id="f_gc" placeholder="SSG Smith"></div>
        <div class="pfield"><label>Station Commander (SC) Name</label><input type="text" id="f_sc" placeholder="SSG Jones"></div>
      </div>
      <div class="pactions">
        <button class="btn-pri" onclick="generate()">Generate QC Checklist →</button>
        <span class="pnote">Status, Age/Gender, and Education are required</span>
      </div>
```

- [ ] **Step 2: Add `gc` and `sc` to `getProfile()` (L202)**

Find:
```javascript
function getProfile(){return{name:document.getElementById('f_name').value.trim()||'—',ssn4:document.getElementById('f_ssn4').value.trim()||'——',dob:document.getElementById('f_dob').value||'',status:document.getElementById('f_status').value,age:document.getElementById('f_age').value,ed:document.getElementById('f_ed').value,ps:document.getElementById('f_ps').value,mso:document.getElementById('f_mso').value,dep:document.getElementById('f_dep').value,waivers:[...document.querySelectorAll('#wg input:checked')].map(x=>x.value),programs:[...document.querySelectorAll('#pg input:checked')].map(x=>x.value)};}
```
Replace with:
```javascript
function getProfile(){return{name:document.getElementById('f_name').value.trim()||'—',ssn4:document.getElementById('f_ssn4').value.trim()||'——',dob:document.getElementById('f_dob').value||'',status:document.getElementById('f_status').value,age:document.getElementById('f_age').value,ed:document.getElementById('f_ed').value,ps:document.getElementById('f_ps').value,mso:document.getElementById('f_mso').value,dep:document.getElementById('f_dep').value,waivers:[...document.querySelectorAll('#wg input:checked')].map(x=>x.value),programs:[...document.querySelectorAll('#pg input:checked')].map(x=>x.value),gc:document.getElementById('f_gc').value.trim(),sc:document.getElementById('f_sc').value.trim()};}
```

- [ ] **Step 3: Add GC/SC to `lockProfile()` summary tags (L204)**

Find:
```javascript
if(p.programs.length)h+=`<span class="ptag info">Programs: ${p.programs.join(', ')}</span>`;document.getElementById('ptagsinner').innerHTML=h;}
```
Replace with:
```javascript
if(p.programs.length)h+=`<span class="ptag info">Programs: ${p.programs.join(', ')}</span>`;if(p.gc)h+=`<span class="ptag">GC: ${esc(p.gc)}</span>`;if(p.sc)h+=`<span class="ptag">SC: ${esc(p.sc)}</span>`;document.getElementById('ptagsinner').innerHTML=h;}
```

- [ ] **Step 4: Add GC/SC afields to `renderAbar()` (L207)**

Find:
```javascript
bar.innerHTML=`<div class="afield"><div class="alabel">Applicant</div><div class="avalue">${esc(p.name)}</div></div><div class="afield"><div class="alabel">SSN Last 4</div><div class="avalue">****${esc(p.ssn4)}</div></div><div class="afield"><div class="alabel">DOB</div><div class="avalue">${dob}</div></div><div class="afield"><div class="alabel">QC Date</div><div class="avalue">${new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'})}</div></div><div class="afield"><div class="alabel">Recruiter</div><div class="avalue" style="min-width:120px;border-bottom:1px solid var(--border)">&nbsp;</div></div>`;
```
Replace with:
```javascript
bar.innerHTML=`<div class="afield"><div class="alabel">Applicant</div><div class="avalue">${esc(p.name)}</div></div><div class="afield"><div class="alabel">SSN Last 4</div><div class="avalue">****${esc(p.ssn4)}</div></div><div class="afield"><div class="alabel">DOB</div><div class="avalue">${dob}</div></div><div class="afield"><div class="alabel">QC Date</div><div class="avalue">${new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'})}</div></div><div class="afield"><div class="alabel">Recruiter</div><div class="avalue" style="min-width:120px;border-bottom:1px solid var(--border)">&nbsp;</div></div>${p.gc?`<div class="afield"><div class="alabel">GC</div><div class="avalue">${esc(p.gc)}</div></div>`:''} ${p.sc?`<div class="afield"><div class="alabel">SC</div><div class="avalue">${esc(p.sc)}</div></div>`:''}`;
```

- [ ] **Step 5: Add GC/SC to `resetAll()` — clear input values**

Find in `resetAll()`:
```javascript
['f_name','f_ssn4','f_dob'].forEach(id=>{document.getElementById(id).value=''});
```
Replace with:
```javascript
['f_name','f_ssn4','f_dob','f_gc','f_sc'].forEach(id=>{document.getElementById(id).value=''});
```

- [ ] **Step 6: Verify in browser**

Enter "SSG Smith" in GC field and "SSG Jones" in SC field → Generate → confirm GC and SC appear in the locked profile summary tags and in the applicant bar.

- [ ] **Step 7: Commit**

```bash
git add PacketQC.html
git commit -m "feat: add GC and SC name fields to profile, summary bar, and applicant bar"
```

---

## Task 8: Recruiter Initials per Section

**File:** `PacketQC.html`

### CSS additions

- [ ] **Step 1: Add initials row CSS**

Find the closing `</style>` tag and insert before it:
```css
.initials-row{display:flex;align-items:center;gap:.6rem;padding:.55rem 1.25rem;border-top:1px solid var(--border);opacity:.35;pointer-events:none;transition:opacity .2s,border-color .2s;}
.initials-row.active{opacity:1;pointer-events:auto;}
.initials-row.confirmed{opacity:1;pointer-events:none;}
.initials-label{font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);white-space:nowrap;}
.initials-input{background:var(--bg);border:1px solid var(--border);border-radius:3px;color:var(--text);font-family:var(--font-d);font-size:.78rem;padding:.25rem .5rem;width:4rem;text-transform:uppercase;outline:none;transition:border-color .15s;}
.initials-input:focus{border-color:var(--gold)}
.initials-confirmed{font-family:var(--font-d);font-weight:700;font-size:.82rem;color:var(--gold);letter-spacing:.08em;}
.initials-ts{font-size:.6rem;color:var(--text-muted);margin-left:.25rem;}
.btn-initials{background:var(--gold);color:#221F20;border:none;border-radius:3px;font-family:var(--font-d);font-weight:700;font-size:.65rem;padding:.25rem .6rem;cursor:pointer;letter-spacing:.05em;}
.btn-initials:hover{background:var(--gold-dim)}
```

### New functions

- [ ] **Step 2: Add `buildInitialsRow(secId)` and `confirmInitials(secId)` functions**

Add the following before the closing `</script>` tag:
```javascript
function buildInitialsRow(secId){const row=document.createElement('div');row.className='initials-row';row.id='initrow-'+secId;row.innerHTML=`<span class="initials-label">Recruiter Initials:</span><input class="initials-input" id="init-input-${secId}" maxlength="4" placeholder="JKS" onkeydown="if(event.key==='Enter')confirmInitials('${secId}')"><button class="btn-initials" onclick="confirmInitials('${secId}')">CONFIRM</button>`;return row;}
function confirmInitials(secId){const inp=document.getElementById('init-input-'+secId);if(!inp)return;const val=inp.value.trim().toUpperCase();if(!val||val.length<2)return;const ts=Date.now();state.initials[secId]={value:val,ts};const row=document.getElementById('initrow-'+secId);if(!row)return;const now=new Date(ts);const dateStr=now.toLocaleDateString('en-US',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase();const timeStr=now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false});row.innerHTML=`<span class="initials-label">Recruiter Initials:</span><span class="initials-confirmed">${esc(val)}</span><span class="initials-ts">· ${dateStr} ${timeStr}</span>`;row.classList.remove('active');row.classList.add('confirmed');}
```

### Modify `buildSectionEl`

- [ ] **Step 3: Append initials row to each section and each waiver subsection**

Find `buildSectionEl` (L209):
```javascript
function buildSectionEl(sec){const d=document.createElement('div');d.className='csec';d.id='sec-'+sec.id;d.innerHTML=`<div class="csec-hdr"><div class="csec-title"><span class="csec-icon">${sec.icon}</span><span class="csec-name">${esc(sec.title)}</span></div><div class="csec-right"><span class="csec-prog" id="prog-${sec.id}"></span><div class="sdot" id="dot-${sec.id}"></div></div></div>`;const body=document.createElement('div');body.className='citems';if(sec.subsections&&sec.subsections.length){sec.subsections.forEach(sub=>{const sd=document.createElement('div');sd.className='wsub';sd.innerHTML=`<div class="wsub-hdr">⚠ ${esc(sub.name)}</div>`;sub.items.forEach(item=>{sd.appendChild(buildItemEl(item,sec.id));state.items[item.id]='unchecked';});body.appendChild(sd);});}if(sec.items&&sec.items.length){sec.items.forEach(item=>{body.appendChild(buildItemEl(item,sec.id));state.items[item.id]='unchecked';});}d.appendChild(body);return d;}
```
Replace with:
```javascript
function buildSectionEl(sec){const d=document.createElement('div');d.className='csec';d.id='sec-'+sec.id;d.innerHTML=`<div class="csec-hdr"><div class="csec-title"><span class="csec-icon">${sec.icon}</span><span class="csec-name">${esc(sec.title)}</span></div><div class="csec-right"><span class="csec-prog" id="prog-${sec.id}"></span><div class="sdot" id="dot-${sec.id}"></div></div></div>`;const body=document.createElement('div');body.className='citems';if(sec.subsections&&sec.subsections.length){sec.subsections.forEach(sub=>{const sd=document.createElement('div');sd.className='wsub';sd.innerHTML=`<div class="wsub-hdr">⚠ ${esc(sub.name)}</div>`;sub.items.forEach(item=>{sd.appendChild(buildItemEl(item,sec.id));state.items[item.id]='unchecked';});const subSecId=sec.id+'_'+sub.name.toLowerCase().replace(/[^a-z0-9]+/g,'_');sd.appendChild(buildInitialsRow(subSecId));body.appendChild(sd);});}if(sec.items&&sec.items.length){sec.items.forEach(item=>{body.appendChild(buildItemEl(item,sec.id));state.items[item.id]='unchecked';});}body.appendChild(buildInitialsRow(sec.id));body.appendChild(buildNotesRow(sec.id));d.appendChild(body);return d;}
```

### Modify `refreshSection` to activate initials row

- [ ] **Step 4: Activate the initials row when section is fully resolved**

Find `refreshSection` (L217):
```javascript
function refreshSection(secId){const sec=state.sections.find(s=>s.id===secId);if(!sec)return;const items=getAllSecItems(sec);const total=items.length;const resolved=items.filter(i=>{const s=state.items[i.id];return s==='checked'||(i.na&&s==='na');}).length;const prog=document.getElementById('prog-'+secId);const dot=document.getElementById('dot-'+secId);if(prog)prog.textContent=`${resolved}/${total}`;if(dot){dot.className='sdot';if(resolved===total)dot.classList.add('complete');else if(resolved>0)dot.classList.add('partial');}}
```
Replace with:
```javascript
function refreshSection(secId){const sec=state.sections.find(s=>s.id===secId);if(!sec)return;const items=getAllSecItems(sec);const total=items.length;const resolved=items.filter(i=>{const s=state.items[i.id];return s==='checked'||(i.na&&s==='na');}).length;const prog=document.getElementById('prog-'+secId);const dot=document.getElementById('dot-'+secId);if(prog)prog.textContent=`${resolved}/${total}`;if(dot){dot.className='sdot';if(resolved===total)dot.classList.add('complete');else if(resolved>0)dot.classList.add('partial');}const initRow=document.getElementById('initrow-'+secId);if(initRow&&!initRow.classList.contains('confirmed')){if(resolved===total&&total>0)initRow.classList.add('active');else initRow.classList.remove('active');}}
```

- [ ] **Step 5: Verify in browser**

Generate a checklist → check all items in the Core Documents section → confirm the initials row becomes active (brightens, input becomes editable) → type "JKS" → click CONFIRM → confirm row locks with "JKS · 09 MAY 2026 14:32".

- [ ] **Step 6: Commit**

```bash
git add PacketQC.html
git commit -m "feat: add recruiter initials row per section, activates at 100% completion"
```

---

## Task 9: Per-Section Notes

**File:** `PacketQC.html`

### CSS additions

- [ ] **Step 1: Add notes CSS**

Insert before `</style>`:
```css
.notes-row{padding:.45rem 1.25rem .55rem;}
.notes-toggle{background:none;border:none;font-size:.63rem;color:var(--text-muted);cursor:pointer;font-family:var(--font-m);padding:0;transition:color .15s;}
.notes-toggle:hover{color:var(--gold)}
.notes-area{display:none;margin-top:.4rem;}
.notes-area.open{display:block;}
.notes-textarea{width:100%;background:var(--bg);border:1px solid var(--border);border-radius:3px;color:var(--text);font-family:var(--font-m);font-size:.72rem;padding:.4rem .6rem;resize:vertical;min-height:3.5rem;outline:none;transition:border-color .15s;}
.notes-textarea:focus{border-color:var(--gold)}
.note-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);display:inline-block;margin-left:.35rem;vertical-align:middle;flex-shrink:0;}
```

### New function `buildNotesRow`

- [ ] **Step 2: Add `buildNotesRow(secId)` and `updateNotes(secId, value)` functions**

Add before `</script>`:
```javascript
function buildNotesRow(secId){const row=document.createElement('div');row.className='notes-row';row.id='notesrow-'+secId;row.innerHTML=`<button class="notes-toggle" id="notestoggle-${secId}" onclick="toggleNotesArea('${secId}')">+ Add note</button><div class="notes-area" id="notesarea-${secId}"><textarea class="notes-textarea" id="notesta-${secId}" placeholder="Recruiter note..." oninput="updateNotes('${secId}',this.value)"></textarea></div>`;return row;}
function toggleNotesArea(secId){const area=document.getElementById('notesarea-'+secId);if(area)area.classList.toggle('open');}
function updateNotes(secId,value){state.notes[secId]=value;const toggle=document.getElementById('notestoggle-'+secId);if(!toggle)return;const hdr=document.getElementById('sec-'+secId);const existingDot=hdr?hdr.querySelector('.note-dot'):null;if(value.trim()){toggle.textContent='✎ Note';if(hdr&&!existingDot){const dotEl=document.createElement('span');dotEl.className='note-dot';const progEl=hdr.querySelector('.csec-prog');if(progEl)progEl.parentNode.insertBefore(dotEl,progEl);}}else{toggle.textContent='+ Add note';if(existingDot)existingDot.remove();}}
```

- [ ] **Step 3: Verify in browser**

Generate a checklist → find the "Core Documents" section → click "+ Add note" → type a note → confirm:
- Note dot appears in the section header next to the progress fraction
- Toggle label changes to "✎ Note"
- Closing and reopening the notes area shows the saved text

- [ ] **Step 4: Commit**

```bash
git add PacketQC.html
git commit -m "feat: add per-section notes with indicator dot"
```

---

## Task 10: Document Count Summary in Section Badge Bar

**File:** `PacketQC.html`

- [ ] **Step 1: Modify `updateSbar()` to prepend the doc counter**

Find `updateSbar` (L220):
```javascript
function updateSbar(){if(!state.sections.length)return;const bar=document.getElementById('sbar');let h='';let allDone=true;let anyStarted=false;state.sections.forEach(sec=>{
```
Replace with:
```javascript
function updateSbar(){if(!state.sections.length)return;const bar=document.getElementById('sbar');let h='';let allDone=true;let anyStarted=false;let totalItems=0;let resolvedItems=0;state.sections.forEach(sec=>{const secItems=getAllSecItems(sec);totalItems+=secItems.length;resolvedItems+=secItems.filter(i=>{const s=state.items[i.id];return s==='checked'||(i.na&&s==='na');}).length;});const pct=totalItems>0?resolvedItems/totalItems:0;const docColor=pct>=1?'var(--gold)':pct>=0.5?'var(--amber-light)':'var(--text-muted)';h+=`<span style="font-size:.65rem;font-family:var(--font-d);font-weight:700;color:${docColor};margin-right:.25rem;white-space:nowrap;">${resolvedItems} / ${totalItems} DOCS</span>`;state.sections.forEach(sec=>{
```

- [ ] **Step 2: Verify in browser**

Generate a checklist → confirm "0 / 22 DOCS" (or whatever count) appears at the left of the section badge bar in muted color → check some items → watch the count update and color change (muted → amber → gold at 100%).

- [ ] **Step 3: Commit**

```bash
git add PacketQC.html
git commit -m "feat: add document count summary X/Y DOCS to section badge bar"
```

---

## Task 11: Quick Links to Other Tools

**File:** `PacketQC.html`

### CSS

- [ ] **Step 1: Add `.tool-chip` CSS**

Insert before `</style>`:
```css
.tool-chip{display:inline-flex;align-items:center;font-size:.58rem;color:var(--text-muted);border:1px solid var(--border);border-radius:2px;padding:.1rem .4rem;text-decoration:none;font-family:var(--font-m);white-space:nowrap;transition:all .15s;margin-top:1px;flex-shrink:0;}
.tool-chip:hover{border-color:var(--gold);color:var(--gold)}
@media print{.tool-chip{display:none!important}}
```

### New function + `buildItemEl` modification

- [ ] **Step 2: Add `buildLinkChip(label, href)` function**

Add before `</script>`:
```javascript
function buildLinkChip(label,href){const a=document.createElement('a');a.className='tool-chip';a.href=href;a.target='_blank';a.rel='noopener';a.textContent='→ '+label;return a;}
```

- [ ] **Step 3: Modify `buildItemEl` to inject chips for 3 item IDs**

Find `buildItemEl` (L210):
```javascript
function buildItemEl(item,secId){const d=document.createElement('div');d.className='citem';d.id='iw-'+item.id;const hasTip=item.tip&&(item.tip.v||item.tip.m||item.tip.r);d.innerHTML=`<div class="irow"><div class="icb" id="cb-${item.id}" onclick="toggleItem('${item.id}','${secId}')"></div><div class="ilabel" id="lbl-${item.id}">${esc(item.label)}${item.sub?`<span class="isub">${esc(item.sub)}</span>`:''}</div><div class="ibtns">${item.na?`<button class="btn-na" id="na-${item.id}" onclick="setNA('${item.id}','${secId}')">N/A</button>`:''}${hasTip?`<div class="tiptoggle" id="tt-${item.id}" onclick="toggleTip('${item.id}')">?</div>`:''}</div></div>${hasTip?`<div class="tippanel" id="tp-${item.id}">${buildTipHTML(item.tip)}</div>`:''}`;return d;}
```
Replace with:
```javascript
function buildItemEl(item,secId){const d=document.createElement('div');d.className='citem';d.id='iw-'+item.id;const hasTip=item.tip&&(item.tip.v||item.tip.m||item.tip.r);d.innerHTML=`<div class="irow"><div class="icb" id="cb-${item.id}" onclick="toggleItem('${item.id}','${secId}')"></div><div class="ilabel" id="lbl-${item.id}">${esc(item.label)}${item.sub?`<span class="isub">${esc(item.sub)}</span>`:''}</div><div class="ibtns" id="ibtns-${item.id}">${item.na?`<button class="btn-na" id="na-${item.id}" onclick="setNA('${item.id}','${secId}')">N/A</button>`:''}${hasTip?`<div class="tiptoggle" id="tt-${item.id}" onclick="toggleTip('${item.id}')">?</div>`:''}</div></div>${hasTip?`<div class="tippanel" id="tp-${item.id}">${buildTipHTML(item.tip)}</div>`:''}`;if(item.id==='umf680'||item.id==='dd2807'){const btns=d.querySelector('#ibtns-'+item.id);if(btns)btns.appendChild(buildLinkChip('Medical Screener','./medical_v7.html'));}if(item.id==='arms_680adp'||item.id==='arms_mirs'){const btns=d.querySelector('#ibtns-'+item.id);if(btns)btns.appendChild(buildLinkChip('OPAT Calc','./OPAT_Calculator.html'));}if(item.id==='ocs_gt'||item.id==='woft_gt'){const btns=d.querySelector('#ibtns-'+item.id);if(btns)btns.appendChild(buildLinkChip('ASVAB Tool','./asvab_mos_tool_v2.html'));}return d;}
```

- [ ] **Step 4: Verify in browser**

1. Generate a checklist (any applicant) → scroll to GENESIS/Prescreen section → confirm `→ Medical Screener` link appears on the 680-3A item
2. Select ARMS 2.0 program → generate → confirm `→ OPAT Calc` on the 680-ADP and MIRS items
3. Select OCS or WOFT → generate → confirm `→ ASVAB Tool` on the GT score item

- [ ] **Step 5: Commit**

```bash
git add PacketQC.html
git commit -m "feat: add contextual quick links to Medical Screener, OPAT Calc, ASVAB Tool"
```

---

## Task 12: Enhanced Print Layout

**File:** `PacketQC.html`

### Print header element

- [ ] **Step 1: Inject `#print-header` div into `<body>`**

Find:
```html
<header class="hdr">
```
Insert before it:
```html
<div id="print-header" style="display:none"></div>
```

### Print header CSS + overhaul `@media print`

- [ ] **Step 2: Replace the entire `@media print` block and add print header CSS**

Find:
```css
@media print{.hdr,.hdr-reg,#sbar,.pactions,.btn-sec,.btn-na,.tiptoggle,.pnote{display:none!important}.tippanel{display:none!important}body{background:#fff;color:#000}.csec{border:1px solid #ccc;break-inside:avoid}.icb{border:1.5px solid #555}.icb.checked::after{color:#000}}
```
Replace with:
```css
#print-header{display:none}
@media print{
  #print-header{display:block!important;padding:0 0 .75rem;border-bottom:2px solid #000;margin-bottom:1rem;}
  .ph-row{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;}
  .ph-left{flex:1}
  .ph-title{font-family:'Archivo Black','Arial Black',sans-serif;font-size:1.1rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.3rem;}
  .ph-meta{font-size:.72rem;line-height:1.7}
  .ph-gonogo{font-family:'Archivo Black','Arial Black',sans-serif;font-size:1.4rem;font-weight:900;letter-spacing:.1em;padding:.2rem .6rem;border:2px solid #000;}
  .ph-gonogo.go{background:#d4edda;border-color:#28a745}
  .ph-gonogo.nogo{background:#f8d7da;border-color:#dc3545}
  .hdr,.hdr-reg,#sbar,.pactions,.btn-sec,.btn-na,.tiptoggle,.pnote,#pform,#abar,.notes-row,.initials-row.active .btn-initials,.initials-row input{display:none!important}
  .tippanel,.notes-area:not(.has-content){display:none!important}
  body{background:#fff!important;color:#000!important;font-family:Arial,sans-serif;font-size:10pt}
  .main{max-width:100%;padding:.5rem}
  .csec{border:1px solid #aaa;margin-bottom:.75rem;break-inside:avoid;background:#fff!important}
  .csec-hdr{background:#e8e8e8!important;border-bottom:1px solid #aaa;padding:.4rem .75rem;}
  .csec-name{font-family:'Archivo Black','Arial Black',sans-serif!important;font-size:.8rem;color:#000!important}
  .csec-prog{color:#444!important;font-size:.7rem}
  .sdot{display:none}
  .irow{padding:.3rem .75rem;}
  .irow:hover{background:transparent!important}
  .ilabel{color:#000!important;font-size:.78rem}
  .ilabel.ck{color:#888!important}
  .ilabel.na{color:#888!important;font-style:italic}
  .isub{color:#666!important}
  .icb{border:1.5px solid #555!important;background:transparent!important}
  .icb.checked{background:#d4edda!important;border-color:#28a745!important}
  .icb.checked::after{color:#000!important}
  .icb.na{background:#f0f0f0!important}
  .icb.na::after{color:#888!important}
  .wsub{border:1px solid #bbb;margin:.4rem .75rem;}
  .wsub-hdr{background:#f5f5f5!important;color:#333!important;font-size:.72rem}
  .initials-row{display:flex!important;opacity:1!important;pointer-events:none;border-top:1px solid #ccc;padding:.3rem .75rem;font-size:.68rem;color:#333}
  .initials-row.active .btn-initials{display:none!important}
  .initials-row:not(.confirmed) .initials-input{border-color:#999;background:#f9f9f9}
  .notes-block{background:#f9f9f0;border:1px solid #ccc;border-radius:3px;padding:.4rem .6rem;margin:.3rem .75rem;font-size:.72rem;color:#333;}
  .notes-block-label{font-weight:700;text-transform:uppercase;font-size:.62rem;letter-spacing:.05em;margin-bottom:.2rem;}
  #sec-core,#sec-genesis,#sec-waivers,#sec-final{break-before:page}
  #sec-core:first-of-type{break-before:auto}
}
```

### Populate `#print-header` on generate

- [ ] **Step 3: Populate the print header in `lockProfile()`**

Add at the end of the `lockProfile(p)` function body, just before the closing `}`:

Find:
```javascript
document.getElementById('ptagsinner').innerHTML=h;}
```
Replace with:
```javascript
document.getElementById('ptagsinner').innerHTML=h;const gonogoEl=document.getElementById('gonogo');const goClass=gonogoEl?gonogoEl.className.replace('pending','nogo'):'nogo';const goText=gonogoEl&&gonogoEl.classList.contains('go')?'GO':'NO GO';const dob=p.dob?new Date(p.dob+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'}):'—';const qcDate=new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'});document.getElementById('print-header').innerHTML=`<div class="ph-row"><div class="ph-left"><div class="ph-title">Packet QC Tool — RecruitingToolbox 4D5E // Lincoln NE</div><div class="ph-meta"><strong>${esc(p.name)}</strong> &nbsp;|&nbsp; SSN: ****${esc(p.ssn4)} &nbsp;|&nbsp; DOB: ${dob}<br>QC Date: ${qcDate}${p.gc?' &nbsp;|&nbsp; GC: '+esc(p.gc):''}${p.sc?' &nbsp;|&nbsp; SC: '+esc(p.sc):''}</div></div><div class="ph-gonogo ${goClass}">${goText}</div></div>`;document.getElementById('print-header').style.display='none';}
```

- [ ] **Step 4: Add print notes block rendering**

Currently notes are in a `<textarea>` that prints poorly. Add a printed notes block. In `updateNotes()`, after updating the toggle label, also update or create a print-ready `.notes-block` div inside the section:

Find the `updateNotes` function added in Task 9 and replace with:
```javascript
function updateNotes(secId,value){state.notes[secId]=value;const toggle=document.getElementById('notestoggle-'+secId);if(!toggle)return;const hdr=document.getElementById('sec-'+secId);const existingDot=hdr?hdr.querySelector('.note-dot'):null;let printBlock=document.getElementById('noteprint-'+secId);if(!printBlock){const secEl=document.getElementById('sec-'+secId);if(secEl){printBlock=document.createElement('div');printBlock.className='notes-block';printBlock.id='noteprint-'+secId;secEl.appendChild(printBlock);}}if(value.trim()){toggle.textContent='✎ Note';if(hdr&&!existingDot){const dotEl=document.createElement('span');dotEl.className='note-dot';const progEl=hdr.querySelector('.csec-prog');if(progEl)progEl.parentNode.insertBefore(dotEl,progEl);}if(printBlock)printBlock.innerHTML=`<div class="notes-block-label">Recruiter Note:</div>${esc(value)}`;}else{toggle.textContent='+ Add note';if(existingDot)existingDot.remove();if(printBlock)printBlock.innerHTML='';}}
```

- [ ] **Step 5: Verify print layout**

Generate a checklist → add initials to one section → add a note to another section → press `Ctrl+P` (or `Cmd+P`) → inspect print preview:
- `#print-header` is visible with applicant name, SSN last 4, QC date
- Toolbar, form inputs, and section badges are hidden
- Each section shows checked/unchecked items
- Confirmed initials row prints with initials + timestamp
- Note block prints in a shaded box

- [ ] **Step 6: Commit**

```bash
git add PacketQC.html
git commit -m "feat: enhanced print layout with print header, initials, and notes blocks"
```

---

## Self-Review

### Spec coverage check

| Spec requirement | Task covering it |
|---|---|
| Army Black/Gold token swap | Task 1 |
| Archivo Black + Archivo fonts | Task 1 |
| GC + SC name fields | Task 7 |
| Recruiter initials per section | Task 8 |
| Initials activate at 100% resolution | Task 8, Step 4 |
| Initials lock with timestamp on CONFIRM | Task 8, Step 2 |
| Waiver subsections get own initials row | Task 8, Step 3 |
| Per-section notes (collapsible) | Task 9 |
| Note indicator dot on section header | Task 9, Step 2 |
| Notes print below section items | Task 12, Step 4 |
| Document count `X / Y DOCS` in sbar | Task 10 |
| Doc count color (muted → amber → gold) | Task 10 |
| Quick links for 3 item IDs | Task 11 |
| `.tool-chip` hidden in print | Task 11, Step 1 |
| Enhanced print header with GO/NO GO | Task 12 |
| `@media print` overhaul | Task 12 |
| Page breaks before Genesis, Waivers, Final | Task 12, Step 2 |
| 42 reg citation fills | Task 3 |
| 5 thin tip expansions | Task 4 |
| OCS, WOFT, SMP, FLRI, ATP sections | Task 5 |
| UMF 680-3A-1 removed (non-existent form) | Task 2 |
| Live Scan tip: contact history correction | Task 2 |
| Temp Res 7-day validity | Task 2 |
| Mar 2026 marijuana waiver note | Task 2 |
| `state.initials`, `state.notes` | Task 6 |
| Reset on `generate()` only | Task 6 |
| `unlockProfile()` does NOT reset state | Task 6 |

### Placeholder scan

No TBD, TODO, or placeholder content present. All T key strings are complete.

### Type/name consistency

- `buildInitialsRow(secId)` → used in `buildSectionEl` ✓
- `confirmInitials(secId)` → called in initials row HTML ✓
- `buildNotesRow(secId)` → used in `buildSectionEl` (after Task 9) ✓
- `updateNotes(secId, value)` → called in textarea `oninput` ✓
- `buildLinkChip(label, href)` → used in `buildItemEl` ✓
- `state.initials[secId]` → set in `confirmInitials`, cleared in Task 6 ✓
- `state.notes[secId]` → set in `updateNotes`, cleared in Task 6 ✓
- Waiver subsection ID format: `sec.id + '_' + sub.name.toLowerCase().replace(...)` — used only internally in `buildSectionEl`; matches nothing else, no collision risk ✓

**One ordering note:** `buildSectionEl` (Task 8, Step 3) calls `buildNotesRow()` — but `buildNotesRow` is added in Task 9. This means Task 8 must be done before Task 9 OR the two functions must be added in the same edit session. The plan handles this: Task 8, Step 3 replaces `buildSectionEl` with a version that calls `buildNotesRow`, and Task 9 adds `buildNotesRow`. If implemented sequentially, the function is called before it's defined but JS hoisting handles this since both are `function` declarations. The `buildSectionEl` is only called at runtime (on `generate()`), not at parse time. Safe.

---

## Execution

Plan saved. Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — execute tasks in this session using executing-plans, with checkpoints

Which approach?
