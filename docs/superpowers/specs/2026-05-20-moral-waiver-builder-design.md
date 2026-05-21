# Moral Waiver Builder — Design Spec
**Date:** 2026-05-20  
**Regulation basis:** AR 601-210 (Chapter 4), USAREC Waiver & Suitability QC Checklist  
**Author:** Lucas Kraat  

---

## Overview

A standalone HTML tool for Army recruiters that streamlines the moral waiver process end-to-end: determining eligibility, identifying the approving authority, building the required document packet, and generating pre-filled documents — including the UF 601-210.08 form.

---

## File Structure

```
ARTIFACTS/RECRUITING TOOLS/moral-waiver/
├── moral-waiver.html          ← main app shell + UI
├── waiver-data.js             ← AR 601-210 offense table, doc requirements, sample scenarios
└── uf-601-210-08.pdf          ← bundled .08 form template (XFA injection target)
```

Follows the existing ARTIFACTS toolkit pattern. No build system. No server. All CDN dependencies loaded via `<script>` tags:
- **pako.js** — deflate/inflate for XFA dataset compression
- **Google Fonts / GI font** — Army branding

---

## Visual Design

Consistent with all existing ARTIFACTS tools:
- `--army-black: #221F20`
- `--army-gold: #FFCC01`
- `--army-green: #2F372F`
- Font: GI (400/500/700 weights from `/fonts/`)
- Three-column nav, dark background, gold accent bars

---

## Three-Phase Workflow

### Phase 1 — Eligibility Screener

**Step 1: Offense Selection**  
Recruiter selects the offense category from a card list derived from AR 601-210 Chapter 4, Table 4-1. Categories include:

| Category | Examples |
|----------|---------|
| Felony — Drug Distribution/Trafficking | Sale, manufacture, distribution of controlled substances |
| Felony — Violent (Non-bar) | Aggravated assault, voluntary manslaughter, arson |
| Felony — Property/Financial | Grand theft, burglary, fraud, forgery |
| Felony — Weapons | Unlawful possession of firearm (felony) |
| Felony — Other | All other adult felony convictions |
| Serious Misdemeanor | DUI causing injury, theft, fraud, weapons, domestic violence |
| Minor Misdemeanor | Simple assault, disorderly conduct, minor in possession |
| Drug — Possession/Use | Marijuana, controlled substance (adult) |
| Drug — DAT Positive | MEPS/USMEPCOM positive drug test |
| Traffic — Above Minor | DUI (no injury), reckless driving, hit and run |
| Juvenile Offense | Any offense adjudicated as a juvenile |
| Domestic Violence | Any offense involving domestic violence (Lautenberg) |
| Sex Offender Registration | Any offense requiring registration |
| Absolute Bar Offense | Murder, sexual assault of minor, human trafficking, terrorism |

**Step 2: Qualifying Questions (yes/no, sequential)**
1. Was applicant an adult (18+) at time of offense?
2. What was the court disposition? (Convicted / Dismissed / Deferred / No court record — self-admittal)
3. How many total qualifying offenses? (1 / 2 / 3+)
4. Does any offense involve firearms? (yes/no)
5. Does any offense involve domestic violence? (yes/no)
6. Has sufficient time elapsed? (per AR 601-210 Table 4-2 thresholds)

**Step 3: Verdict Card**

| Result | Color | Content |
|--------|-------|---------|
| WAIVABLE | Green | Authority level, regulation cite (e.g., "AR 601-210, Para 4-28") |
| NOT WAIVABLE | Red | "Absolute bar — AR 601-210, Para 4-22(b)(1). Do not build packet." |
| ETP REQUIRED | Amber | "Exception to Policy required before waiver submission. Contact battalion S1." |

**Hard Stop:** If an absolute bar offense is selected at any point, the app immediately renders a full red screen with the regulation paragraph and stops all further input. No packet is built.

---

### Phase 2 — Applicant Info + Offense Log

**Applicant Header Fields**
- Last Name, First Name, MI
- SSN (masked input, stored for .08 injection only)
- DOB
- RSID
- Education Level
- AFQT Score

**Offense Log Table**  
Recruiter adds offenses one at a time. Each offense captures:
- Offense Date
- Offense Description (free text)
- City, County, State
- Disposition
- Court Docs obtained? (yes/no)
- Incident Report obtained? (yes/no)

Offenses are displayed newest-to-oldest (per AR 601-210 / UF 601-210.08 requirement).

**Authority Determination**  
App evaluates all logged offenses against AR 601-210 Chapter 4 and displays the highest required authority level:

| Level | Approving Authority |
|-------|-------------------|
| BN | Battalion Commander |
| USAREC | Commanding General, USAREC |
| DMPM | Deputy Chief of Staff, G-1 (DMPM) |

The authority level is displayed prominently in a gold badge throughout Phase 2 and Phase 3.

**Inline AR 601-210 Reference Panel**  
A collapsible side panel shows the exact regulation paragraph(s) driving each determination. Recruiter can expand it to read the text and cite it to leadership.

---

### Phase 3 — Generate Outputs

Triggered by a single "Generate Packet" button. All six outputs are generated simultaneously and presented as individual download/print actions.

---

#### Output 1: Document Checklist

Required documents determined by offense type + authority level, based on USAREC Waiver & Suitability QC Checklist (Moral tab):

**All moral waivers require:**
- Live Scan Results (120-day validity — see Expiration Tracker)
- Sex Offender Check (IAW UM 21-022)
- All source documents (Birth cert, Ed docs, SSN, PS)
- RZ Complete (Q1: last 7 years / Q2: felony, firearms, alcohol/drugs, DV / Q3: traffic)
- Police Incident Report (all offenses above traffic)
- DD 369s — work, live, school (last 3 years + where offenses occurred, < 6 months old)
- Court Dockets (IAW AR 601-210, Para 4-28(1)(e)): information docket, court finding/sentencing, final disposition
- USAREC Form 601-210.02 (in lieu of court dockets when court will not furnish)
- Applicant's Statement (newest to oldest, what applicant has done to overcome behavior, why waiver should be granted)
- Company Commander's Interview MFR
- UF 601-210.08 (all law violations, asterisk next to offense(s) being waived)

**USAREC and DMPM level add:**
- DD Form 370 — Request for Reference (3 required at USAREC/DMPM level)
- DD 2807-2 / DD 2808 (Genesis Report) — for applicable cases

**When confined 24+ hours:**
- USAREC FL 601-210.04 (Request for information from institution)

**Self-admittal cases:**
- Only after court check confirmed no record. Requires ETP to process waiver. (AR 601-210.02 self-admittal procedure applies)

Each checklist item has a checkbox, a status badge (Not Started / In Progress / Complete), and a notes field.

---

#### Output 2: Document Expiration Tracker

For each time-sensitive document, recruiter enters the date obtained. App shows:

| Document | Validity Window | Status |
|----------|----------------|--------|
| Live Scan | 120 days | Green / Yellow (<30 days) / Red (expired) |
| DD 369s | 6 months | Green / Yellow / Red |
| DD 2807-2/2808 | Per MEPS guidance | Green / Yellow / Red |

Red = packet cannot be submitted. Yellow = schedule renewal now.

---

#### Output 3: Printable Cover Sheet

A formatted summary page for the top of the physical packet:
- Applicant name, SSN (last 4 only), DOB, RSID, Ed Level, AFQT
- Offense summary table (all logged offenses)
- Approving Authority (bold, prominent)
- Required document checklist (current status)
- Regulation basis
- Date prepared

Print-optimized CSS. No Army letterhead — plain formatted cover sheet.

---

#### Output 4: Applicant Statement Draft

Pre-filled boilerplate structure per AR 601-210 requirements:

```
MEMORANDUM FOR [Approving Authority]
SUBJECT: Applicant Statement in Support of Moral Waiver

1. I, [FULL NAME], am requesting a moral waiver for the following offense(s):

   a. [OFFENSE 1 — Date, Description, Disposition]
   b. [OFFENSE 2 — Date, Description, Disposition]
   ...

2. The circumstances surrounding the offense(s) are as follows:
   [RECRUITER/APPLICANT FILLS IN]

3. Since the offense(s), I have taken the following steps to overcome this behavior:
   [RECRUITER/APPLICANT FILLS IN]

4. I am requesting this waiver because:
   [RECRUITER/APPLICANT FILLS IN]
```

Downloaded as a `.txt` file or printed directly. Recruiter hands to applicant to personalize and sign.

---

#### Output 5: CO Interview MFR Draft

Pre-filled memorandum for the Company Commander:

```
MEMORANDUM FOR [Battalion Commander / CG USAREC / DMPM]
SUBJECT: Company Commander's Interview — [APPLICANT NAME]

1. I interviewed [APPLICANT NAME] on [DATE] regarding the following offense(s):
   [OFFENSE LIST PRE-FILLED]

2. Summary of interview:
   [CO FILLS IN]

3. Recommendation:
   [CO FILLS IN]

[Signature Block]
```

---

#### Output 6: Routing / Transmittal Memo

Memo from recruiter routing the packet up the chain:

```
MEMORANDUM FOR [Battalion S1]
SUBJECT: Moral Waiver Packet Submission — [APPLICANT NAME]

1. Submitting moral waiver packet for [NAME], SSN (last 4): [XXXX].
2. Offense(s): [LIST]
3. Approving Authority: [BN / USAREC / DMPM]
4. Required documents attached: [CHECKLIST SUMMARY]
5. Point of contact: [RECRUITER] — [RSID]
```

---

#### Output 7: UF 601-210.08 PDF (Pre-filled)

**Method: XFA Dataset Injection**

1. App loads `uf-601-210-08.pdf` as `ArrayBuffer` at runtime
2. Locates the compressed XFA datasets stream in the binary (identified by `<xfa:datasets` marker)
3. Decompresses the stream using pako.js (`pako.inflate`)
4. Builds a new XFA datasets XML document with:
   - Applicant name, SSN, DOB in header fields
   - Each logged offense mapped to the repeating row fields: `DateField2`, `TextField2` (description), `TextField2` (city/county/state), `TextField2` (disposition)
   - Asterisk placed next to offense(s) being waived (per QC checklist requirement)
5. Recompresses with `pako.deflate`
6. Patches the `/Length` value in the PDF object dictionary
7. Appends as a PDF incremental update (preserves original, appends new xref section)
8. Triggers browser download of modified `.pdf`
9. Recruiter opens in Adobe Reader — fields are pre-populated

**Limitation note displayed in app:** "Open with Adobe Acrobat Reader. Other PDF viewers may not render XFA forms correctly."

Full field mapping to be completed during build via XFA template analysis (Stream 6 of the PDF).

---

## Sample Scenarios (Training Mode)

A "Load Sample Scenario" button on the home screen presents 5 fictional cases. Selecting one pre-fills every field in the app — name, SSN, DOB, RSID, offenses, dates, dispositions — so a recruiter can walk through a complete packet without touching real applicant data.

| Scenario | Offense | Authority | Purpose |
|----------|---------|-----------|---------|
| 1 — "The Bar Fight" | Simple assault, convicted, age 19, 2 years ago | BN CO | Typical minor misdemeanor, straightforward |
| 2 — "DUI" | DUI (no injury), convicted, age 21, 18 months ago | BN CO | Most common waiver type |
| 3 — "Grand Theft" | Felony theft, adjudicated as juvenile, dismissed | USAREC CG | Juvenile felony escalation |
| 4 — "Drug Possession" | Marijuana possession x2, adult convictions | USAREC CG | Multiple offenses, drug category |
| 5 — "The Hard One" | Drug distribution (felony), adult, convicted | DMPM | Highest-level waiver, shows full packet complexity |

All names are fictional (e.g., "John M. Applicant"), SSNs are clearly fake (000-00-0001 through 000-00-0005).

---

## Save & Resume

App state (all Phase 1, 2, and 3 inputs) is serialized to `localStorage` under key `moral-waiver-draft`. Auto-saves on every field change. On load, if a draft exists, the app prompts: **"Resume previous applicant?"** with the applicant name and last-saved timestamp. Recruiter can resume or start fresh.

---

## AR 601-210 Version Stamp

Footer displays: **"Eligibility logic based on AR 601-210, [date of regulation edition used]. Verify currency before submission."**

---

## Out of Scope

- Medical waivers (separate tool)
- RE Code / dependency waivers (separate tool, already in QC checklist)
- DAT waivers (separate tool)
- Network/server storage — all data stays local
- Applicant signature capture

---

## Open Questions for Build

1. Full XFA field-name-to-position mapping for the .08 (to be completed during build via template stream analysis)
2. Exact AR 601-210 edition date to stamp in footer (recruiter to confirm current edition)
3. Whether routing memo should include battalion/company commander name fields (currently scoped to applicant info only per user decision)
