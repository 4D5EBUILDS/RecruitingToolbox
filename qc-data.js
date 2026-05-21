// qc-data.js — Packet QC section definitions + profile options
// All conditional logic lives here. Loaded before the React app.

window.PROFILE_DEFAULTS = {
  name: "Martinez, Carlos A.", ssnLast4: "7742", dob: "15 MAR 2002",
  gc: "SSG Thompson, R.", sc: "SFC Williams, D.",
  citizenship: "citizen",      // citizen | naturalized | lpr
  ageGender: "18m",            // 18m | 18f | 17m-sp | 17f-sp | 17m-bp | 17f-bp
  education: "hs-grad",
  priorService: "none",
  mso: false,
  dependents: "married-kids",
  waivers: ["moral"],          // moral | medical | suitability | age-etp | tattoo | religious | re-code | dependency
  programs: ["arms20"],        // arms20 | fspc3 | fspc-arms | flri | ocs | smp | woft | atp
};

window.PROFILE_OPTIONS = {
  citizenship: [
    { v:"citizen",     l:"US Citizen (Natural Born)" },
    { v:"naturalized", l:"Citizen (Naturalized)" },
    { v:"lpr",         l:"Permanent Resident (LPR)" },
  ],
  ageGender: [
    { v:"18m",    l:"18+ Male" }, { v:"18f",    l:"18+ Female" },
    { v:"17m-sp", l:"17 — Single Parent (Male)" }, { v:"17f-sp", l:"17 — Single Parent (Female)" },
    { v:"17m-bp", l:"17 — Both Parents (Male)" },  { v:"17f-bp", l:"17 — Both Parents (Female)" },
  ],
  education: [
    { v:"hs-grad",      l:"HS Graduate" }, { v:"hs-student",   l:"HS Student" },
    { v:"college-grad", l:"College Graduate" }, { v:"some-college", l:"Some College (24+ hrs)" },
    { v:"college",      l:"College Student" }, { v:"ged",          l:"GED" },
    { v:"no-grad",      l:"No Grad (Tier III)" }, { v:"foreign",      l:"Foreign Education" },
  ],
  priorService: [
    { v:"none", l:"None" }, { v:"army", l:"Army (Active)" }, { v:"usar-ng", l:"USAR / NG" },
    { v:"usaf", l:"USAF" }, { v:"usn",  l:"USN" }, { v:"usmc", l:"USMC" }, { v:"uscg", l:"USCG" },
  ],
  dependents: [
    { v:"none", l:"None" }, { v:"married", l:"Married w/o Kids" },
    { v:"married-kids", l:"Married w/ Kids" }, { v:"single-parent", l:"Not Married w/ Kids" },
  ],
  waivers: [
    { v:"moral", l:"Moral" }, { v:"medical", l:"Medical" }, { v:"suitability", l:"Suitability" },
    { v:"age-etp", l:"Age ETP" }, { v:"tattoo", l:"Tattoo" }, { v:"religious", l:"Religious Accomm." },
    { v:"re-code", l:"RE Code" }, { v:"dependency", l:"Dependency" },
  ],
  programs: [
    { v:"arms20", l:"ARMS 2.0" }, { v:"fspc3", l:"FSPC / IIIB" }, { v:"fspc-arms", l:"FSPC / ARMS 2.0" },
    { v:"flri", l:"FLRI" }, { v:"ocs", l:"OCS" }, { v:"smp", l:"SMP" }, { v:"woft", l:"WOFT" }, { v:"atp", l:"ATP" },
  ],
};

// ── Condition helpers ─────────────────────────────────────────────────────────
const A   = () => true;
const LPR = p => p.citizenship === "lpr";
const NAT = p => p.citizenship === "naturalized";
const MIN = p => p.ageGender.startsWith("17");
const MSO = p => p.mso === true;
const MOR = p => p.waivers.includes("moral");
const MED = p => p.waivers.includes("medical");
const SMP = p => p.programs.includes("smp");
const WOF = p => p.programs.includes("woft");

// ── Help builder ──────────────────────────────────────────────────────────────
const h = (title, reg, body, timing, flags) => ({ title, reg, body, timing: timing||null, flags: flags||null });

// ── Section icons (inline SVG paths, fill="currentColor") ───────────────────
window.SECTION_ICONS = {
  "identity":       "M4 1h11l5 5v17H4zm10 1v5h5zM7 11h10v1H7zm0 3h10v1H7zm0 3h7v1H7z",
  "genesis":        "M12 1l3 5 5-1-2 5 5 3-5 3 2 5-5-1-3 5-3-5-5 1 2-5-5-3 5-3-2-5 5 1z",
  "background":     "M7 1h3l2 5-2 3H6L4 5zm7 0h3l2 4-2 4h-4l-2-3zM6 11h12v2L12 23 6 13z",
  "medical":        "M2 9h2v6H2zm18 0h2v6h-2zM5 7h2v10H5zm12 0h2v10h-2zM8 10h8v4H8z",
  "enlistment":     "M12 1L3 5v7c0 5 4 9 9 11 5-2 9-6 9-11V5zm0 4l6 3v4c0 3-2 6-6 7-4-1-6-4-6-7V8z",
  "mso-rel":        "M12 1a11 11 0 100 22 11 11 0 000-22zm5 8l-7 7-4-4 1.5-1.5L10 13l5.5-5.5z",
  "moral-waiver":   "M12 1.5l2.9 7.2 7.8.4-6 5 2 7.6L12 17.5 5.3 21.7l2-7.6-6-5 7.8-.4z",
  "medical-waiver": "M9 1h6v8h8v6h-8v8H9v-8H1V9h8z",
  "smp-docs":       "M1 9l11-5 11 5-11 5zm4 3.5l7 3.2 7-3.2V17c0 1.5-3.1 3-7 3s-7-1.5-7-3zM20 11v7h1.5v-7z",
  "woft-docs":      "M1 5h22v1H1zm10 2h1v2h7l3 5v3H8l-4-3-2-1V9h3V7h4zm-7 13h18v1H4z",
};

// ── Section definitions ───────────────────────────────────────────────────────
window.SECTION_DEFS = [
  // ── 1. IDENTITY ──────────────────────────────────────────────────────────────
  { id:"identity", title:"Identity Documents", short:"Identity", reg:"AR 601-210 · Ch.2", cond:A, items:[
    { id:"ssc",   cond:A,   init:"complete", label:"Social Security Card",          sub:"Original only — no copies or printouts",
      help:h("Social Security Card","AR 601-210 para 2-3","Must be the original government-issued card. Lamination of the original is acceptable. SSA.gov printouts and hospital birth cards are NOT acceptable.\n\nThe name on the SSC must match all other documents exactly. Any discrepancy must be noted in GENESIS remarks before initiating SC QC.",null,["SSA.gov printouts — NOT ACCEPTABLE","Metal/novelty cards — NOT ACCEPTABLE"]) },
    { id:"bc",    cond:A,   init:"complete", label:"Birth Certificate",             sub:"Certified copy — raised seal or certifying stamp",
      help:h("Birth Certificate","AR 601-210 para 2-3","Certified copy with raised seal or certifying stamp required. Hospital records and photocopies are NOT acceptable.\n\nForeign birth certificates require a certified English translation — machine translations are NOT acceptable. Both the original and certified translation must be present.",null,["Photocopies — NOT ACCEPTABLE","Machine translations (Google Translate) — NOT ACCEPTABLE"]) },
    { id:"pid",   cond:A,   init:"complete", label:"Government-Issued Photo ID",   sub:"Driver's license, state ID, or U.S. Passport — not expired",
      help:h("Government-Issued Photo ID","AR 601-210 para 2-3","Driver's license, state-issued ID, or U.S. Passport. Must be current and not expired. A learner's permit is NOT acceptable for MEPS purposes.",null,null) },
    { id:"i551",  cond:LPR, init:"pending",  label:"I-551 Permanent Resident Card",sub:"Alien number, expiration date, and category code required",
      help:h("I-551 Permanent Resident Card","AR 601-210 para 2-3","Card must not be expired. Record the alien number, expiration date, and category code in the GENESIS Citizenship Tab. Missing any of these three fields in GENESIS is a common GC NO-GO.",null,["Alien number, expiration, or category code missing in GENESIS — GC NO-GO"]) },
    { id:"natcert",cond:NAT,init:"pending",  label:"Certificate of Naturalization", sub:"Original or certified copy with USCIS stamp",
      help:h("Certificate of Naturalization","AR 601-210 para 2-3","Original Certificate of Naturalization (Form N-550 or N-570) or a certified copy. Must bear the USCIS stamp. Record the certificate number in GENESIS Citizenship Tab.",null,["Photocopy without USCIS stamp — NOT ACCEPTABLE"]) },
    { id:"da3072",cond:MIN, init:"pending",  label:"DA Form 3072-2 — Parental/Guardian Consent",sub:"Required for all applicants under 18 years of age",
      help:h("DA Form 3072-2","AR 601-210 para 3-2","Required for all applicants under 18. Both parents or legal guardians must sign unless the applicant is a single parent's child (one parent sufficient with supporting documentation). Parent/guardian signature must be witnessed by the recruiter or notarized.",null,["Both parents required unless single-parent situation is documented","Pre-signed form — NOT ACCEPTABLE"]) },
  ]},
  // ── 2. GENESIS ───────────────────────────────────────────────────────────────
  { id:"genesis", title:"GENESIS Completion", short:"GENESIS", reg:"SF 86 · USMEPCOM 601-23", cond:A, items:[
    { id:"gen-person",   cond:A, init:"complete", label:"Person Tab — all required fields",                  sub:"Legal name, status, physical description, DOB/POB, address, DL info",
      help:h("Person Tab","USMEPCOM 601-23","Complete all fields: legal name, marital status, physical description, ethnicity, DOB/POB, current address, and DL info. Do NOT enter a nickname in the legal name field.",null,null) },
    { id:"gen-s1",       cond:A, init:"flagged",  label:"Screening Tab p.1 — aliases listed",               sub:"All prior legal names entered and Alias Tab populated",
      help:h("Screening Tab p.1 & Alias Tab","USMEPCOM 601-23 · UM 21-022","Always ask directly: 'Have you ever used a different legal name?' All aliases must appear in both Screening Tab p.1 AND the Alias Tab. An empty Alias Tab when a prior name exists is an automatic GC return.",null,["Alias Tab empty when applicant has a prior legal name — AUTOMATIC RETURN"]) },
    { id:"gen-s2",       cond:A, init:"pending",  label:"Screening Tab p.2 — family, psych, tech info",     sub:"No blanks — write N/A if not applicable",
      help:h("Screening Tab p.2","USMEPCOM 601-23","No blanks allowed. Enter all immediate family members, complete psychological criteria, and fill in all technology and group association fields. Write 'N/A' for non-applicable fields.",null,null) },
    { id:"gen-res",      cond:A, init:"complete", label:"Residences — 10-year history",                      sub:"No gaps — DL address matches most recent entry",
      help:h("Residences","USMEPCOM 601-23","Enter all residences for the last 10 years or back to the applicant's 16th birthday. No unexplained gaps. DL address must match the most recent residence entry.",null,null) },
    { id:"gen-emp",      cond:A, init:"complete", label:"Employment — 10-year history",                      sub:"Include part-time, seasonal, summer, and self-employment",
      help:h("Employment History","USMEPCOM 601-23","Same 10-year window. Include ALL employment types. Explain all gaps in remarks. Document JROTC in the Education tab — may qualify for rank promotion.",null,null) },
    { id:"gen-tabs",     cond:A, init:"pending",  label:"Education, Military Service, Financial History tabs",sub:"All applicable fields complete — no blanks",
      help:h("Additional GENESIS Tabs","USMEPCOM 601-23","Complete Education (all schools, including JROTC), Military Service Schools if applicable, and Financial History. JROTC may qualify the applicant for E-2 enlistment rank.",null,null) },
    { id:"gen-refs",     cond:A, init:"complete", label:"Character References — minimum 3 entered",           sub:"Full names, 3–7 year coverage, no family members where avoidable",
      help:h("Character References","USMEPCOM 601-23","At least 3 references. For moral waivers, DD Form 370 requires three references: employment, school, and personal. College references must include a transcript.",null,["No family members as personal references on DD Form 370"]) },
    { id:"gen-docs",     cond:A, init:"pending",  label:"Source Documents uploaded and labeled",              sub:"Legible scans, descriptive file names, correct form labels",
      help:h("Source Documents Tab","USMEPCOM 601-23","Upload all source documents with accurate file names. Each must be legible — blurry, cut-off, or mislabeled documents are a frequent GC return reason. Number multi-page documents.",null,["Mislabeled, blurry, or cut-off scans — AUTOMATIC RETURN"]) },
    { id:"gen-sf86",     cond:A, init:"pending",  label:"SF 86 Validation Report — all flags resolved",       sub:"Run and clear every flag before initiating SC QC",
      help:h("SF 86 Validation Report","USMEPCOM 601-23","Run the SF 86 Validation Report in GENESIS. Resolve every flag before clicking 'Initiate Station Commander Checkpoint.' Re-run any time GENESIS data changes.","Re-run after any GENESIS data change.",["Unresolved flags before SC QC — AUTOMATIC RETURN"]) },
    { id:"gen-lsa",      cond:A, init:"pending",  label:'"Station Live Scan Authorized" in Contact History',  sub:"Enter in RZ Contact History — NOT in SC Remarks",
      help:h("Live Scan Authorization Entry","RZ SOP · AR 601-210","SC must enter 'Station Live Scan Authorized' in Contact History in RZ — NOT in SC Remarks. This is the single most common GC NO-GO reason.",null,["Entry in SC Remarks instead of Contact History — AUTOMATIC RETURN"]) },
    { id:"gen-sck",      cond:A, init:"pending",  label:"SC Checkpoint initiated in RZ",                      sub:"Recruiter clicks Initiate SC Checkpoint — SC and ASC receive email",
      help:h("Initiate SC Checkpoint","RZ SOP","Recruiter clicks 'Initiate Station Commander Checkpoint' in RZ. SC and ASC receive an automatic email. SC does NOT auto-reply — coordinate directly to confirm receipt.",null,null) },
  ]},
  // ── 3. BACKGROUND ────────────────────────────────────────────────────────────
  { id:"background", title:"Background Documents", short:"Background", reg:"AR 601-210 · USMEPCOM 601-23", cond:A, items:[
    { id:"livescan",  cond:A, init:"complete", label:"Live Scan — completed and valid",                sub:"Valid within 120 days of scan date",
      help:h("Live Scan","AR 601-210 · USMEPCOM 601-23","Valid for 120 days from the date of the scan. If expired, applicant must redo before projecting — no exceptions.","Valid 120 days from scan date.",["Expired Live Scan — cannot project"]) },
    { id:"dd369",     cond:A, init:"flagged",  label:"DD 369 — all 3 jurisdictions returned",          sub:"City police, county sheriff, and state — all returned before projecting",
      help:h("DD 369 — Police Records Check","AR 601-210 para 6-3","Run DD 369s for all three jurisdictions: city police, county sheriff, and state law enforcement. All three returns must be in hand before projecting. Aliases must be run on separate DD 369s — never hand-write an alias onto an existing form.","All 3 jurisdictions must be returned before projection.",["One or more jurisdictions not returned — CANNOT PROJECT","Alias not run on a separate DD 369 — RETURN"]) },
    { id:"legal",     cond:A, init:"complete", label:"DD 369 results reviewed — no undisclosed offenses",sub:"Results checked against moral screening disclosures",
      help:h("Legal Review","AR 601-210 · USMEPCOM 601-23","Review DD 369 returns for any offenses not disclosed during moral screening. Disclosure inconsistency between medical and moral screening will get the packet returned.",null,["Undisclosed offenses discovered — stop and contact GC immediately"]) },
  ]},
  // ── 4. MEDICAL ───────────────────────────────────────────────────────────────
  { id:"medical", title:"Medical & Physical", short:"Medical", reg:"USMEPCOM 40-1", cond:A, items:[
    { id:"dd2807",    cond:A, init:"complete", label:"DD 2807-2 — complete",                           sub:"All blocks answered — write N/A if not applicable",
      help:h("DD 2807-2","USMEPCOM 40-1","All blocks must be answered. Write 'N/A' for non-applicable blocks. Dates must be consistent with UMF 680-3A and GENESIS.",null,["Disclosure inconsistency between DD 2807-2 and moral screening — GC return"]) },
    { id:"umf680",    cond:A, init:"complete", label:"UMF 680-3A — complete",                          sub:"All sections filled — signature witnessed by recruiter",
      help:h("UMF 680-3A","USMEPCOM 40-1","Complete all sections. Applicant must sign in front of the recruiter — do not accept pre-signed forms. Dates must be in DD MON YYYY format.",null,["Pre-signed forms — NOT ACCEPTABLE; signature must be witnessed"]) },
    { id:"dates",     cond:A, init:"complete", label:"Dates consistent across all medical forms",       sub:"DD 2807-2, UMF 680-3A, and GENESIS must agree",
      help:h("Date Consistency Check","AR 601-210","Cross-check all dates on DD 2807-2, UMF 680-3A, and GENESIS. Even a one-day discrepancy is a GC return. Do this before initiating SC QC every time.",null,["Any date inconsistency across forms — GC return"]) },
  ]},
  // ── 5. ENLISTMENT ────────────────────────────────────────────────────────────
  { id:"enlistment", title:"Enlistment Documents", short:"Enlistment", reg:"UR 601-210 · AR 601-210", cond:A, items:[
    { id:"uf15",      cond:A, init:"pending",  label:"UF 601-210.15 — completed 3–7 days before MEPS",sub:"Do not complete early — form expires by MEPS date",
      help:h("UF 601-210.15","UR 601-210 para 24-3","Must be completed within 3–7 calendar days of the projected MEPS date. Do NOT complete early — it will expire. Completing too early is one of the most common GC NO-GO reasons.","Complete 3–7 calendar days before projected MEPS date.",["Completed too early — expires before MEPS date (GC NO-GO)"]) },
    { id:"mirs",      cond:A, init:"pending",  label:"MIRS 1.1 — printed immediately before submission",sub:"Reprint on submission day — never use an old printout",
      help:h("MIRS 1.1","AR 601-210","Print the MIRS immediately before submitting. The AFQT score must match the most recent ASVAB score in RZ.","Print on the day of submission.",["Outdated MIRS with stale AFQT score — waiver packet return"]) },
    { id:"asvab",     cond:A, init:"complete", label:"ASVAB / PICAT — valid within 2 years",           sub:"Confirm test date and AFQT — PICAT requires MEPS confirmation test",
      help:h("ASVAB / PICAT Validity","AR 601-210","Valid for 2 years from the test date. PICAT requires a MEPS confirmation test before scores are final.","Valid 2 years from test date.",["Expired ASVAB — must retest before projecting"]) },
    { id:"sigs",      cond:A, init:"complete", label:"All form signatures witnessed by recruiter",      sub:"Applicant signs in front of recruiter — no pre-signed forms",
      help:h("Signature Requirements","AR 601-210","All signatures must be obtained in the recruiter's presence. Correction: single line through error, correct next to it, initialed. Do NOT use Wite-Out.",null,["Pre-signed forms — NOT ACCEPTABLE","Wite-Out corrections — NOT ACCEPTABLE"]) },
  ]},
  // ── 6. MSO (conditional) ────────────────────────────────────────────────────
  { id:"mso-rel", title:"MSO Release", short:"MSO Release", reg:"AR 601-210 para 6-5", cond:MSO, items:[
    { id:"dd368",  cond:A, init:"pending", label:"DD 368 — MSO approved and not expired",              sub:"Must be approved by both gaining and releasing component commanders",
      help:h("DD 368 — Conditional Release","AR 601-210 para 6-5","Must be approved by both gaining and releasing component commanders AND not expired before any MEPS processing. Verify approval date and expiration before scheduling.","Must be approved and not expired before MEPS processing.",["Expired or unapproved DD 368 — MEPS rejection"]) },
  ]},
  // ── 7. MORAL WAIVER (conditional) ───────────────────────────────────────────
  { id:"moral-waiver", title:"Moral Waiver Packet", short:"Moral Waiver", reg:"AR 601-210 · Ch.4", cond:MOR, items:[
    { id:"uf60108",cond:A, init:"pending", label:"UF 601-210.08 — offense list complete",              sub:"Newest to oldest; asterisk offense(s) being waived; AFQT must match RZ",
      help:h("UF 601-210.08","AR 601-210 · Ch.4","List all law violations newest to oldest. Asterisk only the offense(s) being waived. AFQT on this form must match the most recent ASVAB score in RZ.",null,["AFQT on form must match most recent ASVAB score in RZ","Marijuana possession/use — NO waiver required per AR 601-210 para 4-6 (Mar 2026)"]) },
    { id:"dd370",  cond:A, init:"pending", label:"DD Form 370 — three character references",            sub:"Employment, school, and personal — college references include transcript",
      help:h("DD Form 370","AR 601-210 · Ch.4","Three required references: employment, school, and personal. College/vo-tech references must include a transcript. Dates must match RZ entries exactly. No family members as personal references.",null,["College reference without transcript — RETURN"]) },
    { id:"dockets",cond:A, init:"pending", label:"Court dockets — all offenses above traffic level",   sub:"Charging document, court finding, and final disposition for each offense",
      help:h("Court Dockets","AR 601-210 · Ch.4","For every offense above traffic: (1) charging document, (2) court finding and sentencing, (3) final disposition. All three components required per offense.",null,["Missing any of the three docket components for an offense — RETURN"]) },
  ]},
  // ── 8. MEDICAL WAIVER (conditional) ────────────────────────────────────────
  { id:"medical-waiver", title:"Medical Waiver Packet", short:"Med Waiver", reg:"AR 601-210 · USMEPCOM 40-1", cond:MED, items:[
    { id:"meps-disp", cond:A, init:"pending", label:"MEPS Complex Prescreen — disposition received",  sub:"Do not project until MEPS returns a written disposition",
      help:h("Complex Prescreen / MEPS Disposition","USMEPCOM 40-1","Submit the complex prescreen to MEPS and wait for a disposition before projecting. Do not schedule MEPS until MEPS returns a written disposition.",null,["Complex prescreen submitted but no MEPS disposition — DO NOT PROJECT"]) },
    { id:"med-recs",  cond:A, init:"pending", label:"Medical records — all MEPS-specified documentation",sub:"Specialist reports, treatment records, and MEPS-required documents",
      help:h("Medical Records","USMEPCOM 40-1","Gather all medical records specified in the MEPS disposition letter. Number multi-page records. Records must be legible and complete.",null,["Incomplete records — MEPS return"]) },
  ]},
  // ── 9. SMP (conditional) ────────────────────────────────────────────────────
  { id:"smp-docs", title:"SMP Documents", short:"SMP", reg:"AR 601-210 · SMP", cond:SMP, items:[
    { id:"rotc-ltr",  cond:A, init:"pending", label:"ROTC enrollment letter — signed by PMS",          sub:"From Professor of Military Science only — active enrollment and commissioning date",
      help:h("ROTC Enrollment Letter","AR 601-210 · SMP","Must come from the Professor of Military Science specifically — not any other ROTC staff. Must state active enrollment, current program year (MS-I through MS-IV), and expected commissioning date.",null,["Letter from anyone other than the PMS — RETURN"]) },
    { id:"smp-cont",  cond:A, init:"pending", label:"SMP contract — applicant and ROTC battalion rep signed",sub:"Contract period covers current semester through commissioning date",
      help:h("SMP Contract","AR 601-210 · SMP","Both the applicant AND the ROTC battalion representative must sign. Contract period must run from current semester through expected commissioning. Scholarship terms must appear if applicable.",null,["Missing scholarship terms for scholarship cadets — frequent return reason"]) },
    { id:"smp-orders",cond:A, init:"pending", label:"Assignment orders — current unit only",            sub:"Verify unit designation and UIC match GENESIS",
      help:h("Assignment Orders","AR 601-210 · SMP","Most recent orders only. Verify unit designation and UIC match GENESIS. If recently transferred, get orders from the current unit.",null,null) },
    { id:"smp-trans", cond:A, init:"pending", label:"Academic transcript — good standing confirmed",    sub:"Academic probation or suspension must be reported to GC",
      help:h("Academic Transcript","AR 601-210 · SMP","Confirms ROTC enrollment and academic standing. If transcript shows academic probation or suspension, stop and consult GC before proceeding — this may void SMP eligibility.",null,["Academic probation or suspension — stop and consult GC"]) },
  ]},
  // ── 10. WOFT (conditional) ──────────────────────────────────────────────────
  { id:"woft-docs", title:"WOFT / Warrant Flight Packet", short:"WOFT", reg:"AR 601-210 · WOFT", cond:WOF, items:[
    { id:"da61",      cond:A, init:"pending", label:"DA Form 61 — Application for Appointment",        sub:"Complete and current — submit to HRC Aviation",
      help:h("DA Form 61","AR 601-210 · WOFT","Application for Appointment as a Warrant Officer. Must be completely filled out with no blanks. Submit per current HRC Aviation branch instructions.",null,null) },
    { id:"sift",      cond:A, init:"pending", label:"SIFT score — minimum 40 required",                sub:"Structured Interview for Flight Training — confirm current and valid",
      help:h("SIFT Score","AR 601-210 · WOFT","Minimum score of 40 required for WOFT eligibility. One retake permitted after a 6-month waiting period.","One retake permitted after 6-month waiting period.",["Score below 40 — WOFT ineligible"]) },
    { id:"flt-phys",  cond:A, init:"pending", label:"Class 1 Flight Physical — completed at MEPS",     sub:"Required before WOFT packet can be submitted to HRC",
      help:h("Class 1 Flight Physical","AR 601-210 · WOFT","Class 1 Flight Physical must be completed at MEPS before the WOFT packet can be submitted to HRC. Coordinate with MEPS to schedule specifically as a Class 1.",null,null) },
    { id:"woft-ltrs", cond:A, init:"pending", label:"Letters of recommendation — 3 required",          sub:"At least one from a military officer (CW2+ or commissioned O-1+)",
      help:h("WOFT Letters of Recommendation","AR 601-210 · WOFT","Three letters of recommendation required. At least one must be from a military officer (CW2 or above, or commissioned O-1 or above).",null,["Fewer than 3 letters — incomplete packet"]) },
  ]},
];
