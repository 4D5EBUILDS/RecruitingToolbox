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
  dependents: "none",
  waivers: ["moral"],
  programs: ["arms20"],
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
const A      = () => true;
const LPR    = p => p.citizenship === "lpr";
const NAT    = p => p.citizenship === "naturalized";
const MIN    = p => p.ageGender.startsWith("17");
const MIN_SP = p => p.ageGender === "17m-sp" || p.ageGender === "17f-sp";
const MIN_BP = p => p.ageGender === "17m-bp" || p.ageGender === "17f-bp";
const M18    = p => p.ageGender === "18m";   // 18+ male — selective service
const FEML   = p => p.ageGender.includes("f");
const MSO    = p => p.mso === true;
const MOR    = p => p.waivers.includes("moral");
const MED    = p => p.waivers.includes("medical");
const SUIT   = p => p.waivers.includes("suitability");
const AGEW   = p => p.waivers.includes("age-etp");
const TATW   = p => p.waivers.includes("tattoo");
const RELW   = p => p.waivers.includes("religious");
const RECW   = p => p.waivers.includes("re-code");
const DEPW   = p => p.waivers.includes("dependency");
const SMP    = p => p.programs.includes("smp");
const WOF    = p => p.programs.includes("woft");
const OCS    = p => p.programs.includes("ocs");
const FLRI   = p => p.programs.includes("flri");
const ATP    = p => p.programs.includes("atp");
const ARMS   = p => p.programs.includes("arms20") || p.programs.includes("fspc-arms");
const FSPC   = p => p.programs.some(x => x.startsWith("fspc"));
const PS     = p => p.priorService !== "none";
const USAR   = p => p.priorService === "usar-ng";
const MAR    = p => p.dependents === "married" || p.dependents === "married-kids";
const KIDS   = p => p.dependents === "married-kids" || p.dependents === "single-parent";

// ── Help builder ──────────────────────────────────────────────────────────────
const h = (title, reg, body, timing, flags) => ({ title, reg, body, timing: timing||null, flags: flags||null });

// ── Section icons (inline SVG paths, fill="currentColor") ───────────────────
window.SECTION_ICONS = {
  "identity":        "M4 1h11l5 5v17H4zm10 1v5h5zM7 11h10v1H7zm0 3h10v1H7zm0 3h7v1H7z",
  "genesis":         "M12 1l3 5 5-1-2 5 5 3-5 3 2 5-5-1-3 5-3-5-5 1 2-5-5-3 5-3-2-5 5 1z",
  "background":      "M7 1h3l2 5-2 3H6L4 5zm7 0h3l2 4-2 4h-4l-2-3zM6 11h12v2L12 23 6 13z",
  "medical":         "M2 9h2v6H2zm18 0h2v6h-2zM5 7h2v10H5zm12 0h2v10h-2zM8 10h8v4H8z",
  "enlistment":      "M12 1L3 5v7c0 5 4 9 9 11 5-2 9-6 9-11V5zm0 4l6 3v4c0 3-2 6-6 7-4-1-6-4-6-7V8z",
  "education":       "M12 1l10 5-10 5L2 6zm0 7v14M4 9v8l8 4 8-4V9",
  "dependents":      "M9 2a3 3 0 100 6 3 3 0 000-6zm6 0a3 3 0 100 6 3 3 0 000-6zM3 20c0-3.3 2.7-6 6-6h6c3.3 0 6 2.7 6 6",
  "prior-service":   "M12 1L3 5v7c0 5 4 9 9 11 5-2 9-6 9-11V5zm-1 13l-3-3 1.4-1.4L11 11.2l4.6-4.6L17 8z",
  "mso-rel":         "M12 1a11 11 0 100 22 11 11 0 000-22zm5 8l-7 7-4-4 1.5-1.5L10 13l5.5-5.5z",
  "moral-waiver":    "M12 1.5l2.9 7.2 7.8.4-6 5 2 7.6L12 17.5 5.3 21.7l2-7.6-6-5 7.8-.4z",
  "suit-waiver":     "M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z",
  "age-waiver":      "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 15h-2v-6h2zm0-8h-2V7h2z",
  "tattoo-waiver":   "M12 2a10 10 0 100 20A10 10 0 0012 2zm-2 14l-4-4 1.41-1.41L10 13.17l6.59-6.59L18 8l-8 8z",
  "rel-waiver":      "M12 1l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z",
  "re-waiver":       "M4 2h16v2H4zm0 4h16v12H4zm4 2v8h8V8H8zm2 2h4v4h-4z",
  "dep-waiver":      "M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  "medical-waiver":  "M9 1h6v8h8v6h-8v8H9v-8H1V9h8z",
  "arms-docs":       "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  "ocs-docs":        "M12 1L3 5v7c0 5 4 9 9 11 5-2 9-6 9-11V5zm-1 13l-3-3 1.4-1.4L11 11.2l4.6-4.6L17 8z",
  "flri-docs":       "M6 2h12v20H6zM9 6h6M9 10h6M9 14h4",
  "atp-docs":        "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z",
  "smp-docs":        "M1 9l11-5 11 5-11 5zm4 3.5l7 3.2 7-3.2V17c0 1.5-3.1 3-7 3s-7-1.5-7-3zM20 11v7h1.5v-7z",
  "woft-docs":       "M1 5h22v1H1zm10 2h1v2h7l3 5v3H8l-4-3-2-1V9h3V7h4zm-7 13h18v1H4z",
};

// ── Section definitions ───────────────────────────────────────────────────────
window.SECTION_DEFS = [

  // ── 1. IDENTITY ──────────────────────────────────────────────────────────────
  { id:"identity", title:"Identity Documents", short:"Identity", reg:"AR 601-210 · Ch.2", cond:A, items:[
    { id:"ssc",      cond:A,   init:"complete", label:"Social Security Card",
      sub:"Original only — no copies, printouts, or SSA.gov printouts",
      help:h("Social Security Card","AR 601-210 para 2-3","Must be the original government-issued card. Lamination of the original is acceptable. SSA.gov printouts and hospital birth cards are NOT acceptable.\n\nThe name on the SSC must match the BC and DD 4 exactly — including middle name vs. initial. Any discrepancy must be noted in GENESIS remarks before initiating SC QC.",null,["SSA.gov printouts — NOT ACCEPTABLE","Metal/novelty cards — NOT ACCEPTABLE","Name discrepancy vs. BC or DD 4 — must note in GENESIS remarks"]) },
    { id:"bc",       cond:A,   init:"complete", label:"Birth Certificate",
      sub:"Certified copy — raised seal or certifying stamp",
      help:h("Birth Certificate","AR 601-210 para 2-3","Certified copy with raised seal or certifying stamp required. Hospital records and photocopies are NOT acceptable.\n\nForeign birth certificates require a certified English translation — machine translations are NOT acceptable. Both the original and certified translation must be present in the packet.",null,["Photocopies — NOT ACCEPTABLE","Machine translations (Google Translate) — NOT ACCEPTABLE"]) },
    { id:"pid",      cond:A,   init:"complete", label:"Government-Issued Photo ID",
      sub:"Driver's license, state ID, or U.S. Passport — not expired",
      help:h("Government-Issued Photo ID","AR 601-210 para 2-3","Driver's license, state-issued ID, or U.S. Passport. Must be current and not expired. A learner's permit is acceptable with a recruiter verification note. School ID is acceptable with recruiter verification.",null,["Expired ID — NOT ACCEPTABLE"]) },
    { id:"passport", cond:p => p.citizenship !== "lpr",   init:"na",  label:"U.S. Passport",
      sub:"N/A if not available — verify name/DOB match; note if expired",
      help:h("U.S. Passport","AR 601-210 para 2-3","Mark N/A if the applicant does not have a passport — most citizens do not and that is fine. If the applicant does have one, verify name, DOB, and citizenship status match all other documents. Passport does not need to be current but note if expired. LPR applicants do not have a U.S. passport — this item is hidden for LPR applicants.",null,null) },
    { id:"i551",     cond:LPR, init:"pending",  label:"I-551 Permanent Resident Card",
      sub:"Alien number, expiration date, and category code required in GENESIS",
      help:h("I-551 Permanent Resident Card","AR 601-210 para 2-3","Card must not be expired. Record the alien number, expiration date, and category code in the GENESIS Citizenship Tab. Missing any of these three fields is a GC NO-GO.",null,["Alien number, expiration, or category code missing in GENESIS — GC NO-GO","Expired I-551 — cannot project"]) },
    { id:"fp-lpr",   cond:LPR, init:"na",  label:"Foreign Passport",
      sub:"LPR — N/A if expired/surrendered; required if applicant still has one",
      help:h("Foreign Passport (LPR)","AR 601-210 para 2-3","Required for LPR applicants if the applicant has a valid or recently expired foreign passport. Verify the passport country matches the country of birth listed in GENESIS.",null,null) },
    { id:"natcert",  cond:NAT, init:"pending",  label:"Certificate of Naturalization",
      sub:"Original or certified copy with USCIS stamp",
      help:h("Certificate of Naturalization","AR 601-210 para 2-3","Original Certificate of Naturalization (Form N-550 or N-570) or a certified copy. Must bear the USCIS stamp. Record the certificate number in GENESIS Citizenship Tab. Photocopies are NOT acceptable.",null,["Photocopy without USCIS stamp — NOT ACCEPTABLE"]) },
    { id:"dd1966-sp",cond:MIN_SP, init:"pending", label:"DD 1966 — Pages 4 AND 5",
      sub:"Single parent — both pages required; parent signs p.4, both sign p.5",
      help:h("DD 1966 Pages 4 & 5 — Minor Consent","AR 601-210 para 3-2","For 17-year-old applicants with a single parent/guardian: Page 4 (Parent Information) and Page 5 (Parent/Guardian Consent) are both required. The single parent signs page 4 as the sole custodian and both page 4 and 5 must be completed. Signature must be witnessed by the recruiter or notarized.",null,["Missing page 4 or 5 — packet incomplete","Pre-signed form not witnessed — NOT ACCEPTABLE"]) },
    { id:"dd1966-bp",cond:MIN_BP, init:"pending", label:"DD 1966 — Page 5",
      sub:"Both parents — both must sign page 5",
      help:h("DD 1966 Page 5 — Minor Consent","AR 601-210 para 3-2","For 17-year-old applicants with both parents living: Page 5 (Parent/Guardian Consent) is required with both parents' signatures. If one parent is deceased or legally absent, document the situation — contact GC. Signatures must be witnessed by the recruiter or notarized.",null,["Only one parent signature when both are required — RETURN"]) },
    { id:"selsvc",   cond:M18,    init:"pending", label:"Selective Service Registration Verification",
      sub:"18+ males — verify registration at SSS.gov before projecting",
      help:h("Selective Service Registration","AR 601-210","All male applicants 18 years or older must be registered with the Selective Service. Verify registration at SSS.gov and note in GENESIS remarks. If not registered, the applicant must register before projecting.",null,["Not registered — applicant must register at SSS.gov before projecting"]) },
  ]},

  // ── 2. EDUCATION ─────────────────────────────────────────────────────────────
  { id:"education", title:"Education Documents", short:"Education", reg:"AR 601-210 · Ch.2", cond:A, items:[
    { id:"hs-dip",   cond:p => ["hs-grad","college","some-college","college-grad"].includes(p.education),
      init:"complete", label:"High School Diploma",
      sub:"Original or certified copy — verify school name matches transcript",
      help:h("HS Diploma","AR 601-210","Original diploma or certified copy. Verify school name and graduation date match the transcript. GED recipients: diploma not required.",null,null) },
    { id:"hs-trans", cond:p => ["hs-grad","hs-student"].includes(p.education),
      init:"pending", label:"High School Transcript",
      sub:"Official transcript — if applicable; N/A for college graduates",
      help:h("HS Transcript","AR 601-210","Official transcript from the high school, showing graduation date (or expected graduation for students). Required for enlistment processing. College graduates may not need this if a college transcript is provided.",null,null) },
    { id:"hs-enr",   cond:p => p.education === "hs-student",
      init:"pending", label:"HS Enrollment Letter",
      sub:"Official letterhead, administrator signature, graduation date included",
      help:h("HS Enrollment Letter","AR 601-210","From a school administrator on official letterhead. Must confirm active enrollment and include expected graduation date. Student must be on track to graduate.",null,["Letter without graduation date — incomplete"]) },
    { id:"col-trans",cond:p => ["college","some-college","college-grad"].includes(p.education),
      init:"pending", label:"College Transcript",
      sub:"Official (sealed) transcript — required for 24+ hr credit verification",
      help:h("College Transcript","AR 601-210","Official transcript from the college or university. Required to verify credit hours for education tier. For some-college, must show 24+ credit hours. For WOFT: 60+ credit hours preferred.",null,null) },
    { id:"col-deg",  cond:p => p.education === "college-grad",
      init:"complete", label:"College Degree / Diploma",
      sub:"Official copy — required alongside transcript",
      help:h("College Degree","AR 601-210","Official copy of the degree or diploma, alongside the transcript. Regionally accredited institution required for OCS/WOFT/FLRI eligibility.",null,null) },
    { id:"ged-dip",  cond:p => p.education === "ged",
      init:"pending", label:"GED Diploma",
      sub:"Official GED diploma — required",
      help:h("GED Diploma","AR 601-210","Official GED diploma. Note: GED holders are Tier II — additional waivers may be required for some programs. Confirm GED score meets minimum if required for program.",null,null) },
    { id:"ged-trans",cond:p => p.education === "ged",
      init:"pending", label:"GED Transcript / Score Sheet",
      sub:"Official score documentation",
      help:h("GED Score Sheet","AR 601-210","Official GED score documentation showing passing scores on all sections. Minimum passing scores vary by state — verify passing status.",null,null) },
    { id:"for-trans",cond:p => p.education === "foreign",
      init:"pending", label:"Foreign Transcript (with certified English translation)",
      help:h("Foreign Transcript","AR 601-210","Foreign educational documents require a certified English translation — not a machine translation. Both the original and certified translation must be present. A tier evaluation must also be initiated and completed.",null,["Machine translation — NOT ACCEPTABLE"]) },
    { id:"tier-eval",cond:p => p.education === "foreign",
      init:"pending", label:"Tier Evaluation — Initiated AND Completed",
      help:h("Tier Evaluation","AR 601-210","Required for all foreign education credentials. Both initiation and completion of the tier evaluation must be documented before projecting. Contact GC for current process.",null,null) },
    { id:"no-grad-note",cond:p => p.education === "no-grad",
      init:"pending", label:"Tier III — ED code 111 confirmed; program eligibility verified",
      sub:"Verify waiver/program eligibility with GC",
      help:h("Tier III Applicant","AR 601-210","No high school diploma or GED. Confirm ED code 111 is correctly entered. Verify program eligibility with GC — most programs require Tier I or Tier II.",null,null) },
  ]},

  // ── 3. GENESIS ───────────────────────────────────────────────────────────────
  { id:"genesis", title:"GENESIS Completion", short:"GENESIS", reg:"SF 86 · USMEPCOM 601-23", cond:A, items:[
    { id:"gen-person",   cond:A, init:"complete", label:"Person Tab — all required fields complete",
      sub:"Legal name, status, physical description, DOB/POB, address, DL info, marital status",
      help:h("Person Tab","USMEPCOM 601-23","Complete all fields: legal name, marital status, physical description, ethnicity, DOB/POB, current address, and DL info. Do NOT enter a nickname in the legal name field. DL address must match most recent residence entry.",null,null) },
    { id:"gen-s1",       cond:A, init:"flagged",  label:"Screening Tab p.1 — aliases listed",
      sub:"All prior legal names entered and Alias Tab populated",
      help:h("Screening Tab p.1 & Alias Tab","USMEPCOM 601-23 · UM 21-022","Always ask directly: 'Have you ever used a different legal name?' All aliases must appear in both Screening Tab p.1 AND the Alias Tab. An empty Alias Tab when a prior name exists is an automatic GC return.",null,["Alias Tab empty when applicant has a prior legal name — AUTOMATIC RETURN"]) },
    { id:"gen-s2",       cond:A, init:"pending",  label:"Screening Tab p.2 — family, psych, tech, groups",
      sub:"No blanks — write N/A if not applicable",
      help:h("Screening Tab p.2","USMEPCOM 601-23","No blanks allowed. Enter all immediate family members, complete psychological criteria, technology info, group associations, and contact method. Write 'N/A' for non-applicable fields.",null,null) },
    { id:"gen-res",      cond:A, init:"complete", label:"Residences — 10-year history, no gaps",
      sub:"DL address matches most recent entry; all gaps explained in remarks",
      help:h("Residences","USMEPCOM 601-23","Enter all residences for the last 10 years or back to the applicant's 16th birthday. No unexplained gaps. DL address must match the most recent residence entry. Any gap must be explained in remarks.",null,null) },
    { id:"gen-emp",      cond:A, init:"complete", label:"Employment — 10-year history, gaps explained",
      sub:"Include part-time, seasonal, summer, self-employment",
      help:h("Employment History","USMEPCOM 601-23","Same 10-year window. Include ALL employment types: part-time, seasonal, summer, self-employment. Explain all gaps in remarks. Document JROTC in the Education tab — may qualify for E-2 rank.",null,null) },
    { id:"gen-tabs",     cond:A, init:"pending",  label:"Education, Military Service, Financial History tabs",
      sub:"All applicable fields complete — JROTC in Education tab",
      help:h("Additional GENESIS Tabs","USMEPCOM 601-23","Complete Education (all schools, JROTC), Military Service Schools if applicable, Background/Investigation, and Financial History. JROTC may qualify the applicant for E-2 enlistment rank.",null,null) },
    { id:"gen-refs",     cond:A, init:"complete", label:"Character References — minimum 3 entered",
      sub:"Full names, 3–7 year coverage, no family members where avoidable",
      help:h("Character References","USMEPCOM 601-23","At least 3 references. Full names required — not just first names. 3–7 year coverage. No duplicate references. Avoid family members as personal references where possible.",null,["No family members as personal references on DD Form 370"]) },
    { id:"gen-docs",     cond:A, init:"pending",  label:"Source Documents uploaded and labeled",
      sub:"Legible scans, descriptive file names, correct form labels",
      help:h("Source Documents Tab","USMEPCOM 601-23","Upload all source documents with accurate file names. Each must be legible — blurry, cut-off, or mislabeled documents are a frequent GC return reason. Number multi-page documents (Page X of Y).",null,["Mislabeled, blurry, or cut-off scans — RETURN"]) },
    { id:"gen-sf86",     cond:A, init:"pending",  label:"SF 86 Validation Report — all flags resolved",
      sub:"Run and clear every flag before initiating SC QC; re-run after any data change",
      help:h("SF 86 Validation Report","USMEPCOM 601-23","Run the SF 86 Validation Report in GENESIS. Resolve every flag before clicking 'Initiate Station Commander Checkpoint.' Re-run any time GENESIS data changes after the first run.","Re-run after any GENESIS data change.",["Unresolved flags before SC QC — AUTOMATIC RETURN"]) },
    { id:"gen-lsa",      cond:A, init:"pending",  label:'"Station Live Scan Authorized" in Contact History',
      sub:"SC enters in RZ Contact History — NOT in SC Remarks",
      help:h("Live Scan Authorization Entry","RZ SOP · AR 601-210","SC must enter 'Station Live Scan Authorized' in Contact History in RZ — NOT in SC Remarks. This is the single most common GC NO-GO reason.",null,["Entry in SC Remarks instead of Contact History — AUTOMATIC RETURN"]) },
    { id:"gen-sck",      cond:A, init:"pending",  label:"SC Checkpoint initiated in RZ",
      sub:"Recruiter clicks Initiate SC Checkpoint — SC and ASC receive email",
      help:h("Initiate SC Checkpoint","RZ SOP","Recruiter clicks 'Initiate Station Commander Checkpoint' in RZ. SC and ASC receive an automatic email. SC does NOT auto-reply — coordinate directly to confirm receipt.",null,null) },
  ]},

  // ── 4. BACKGROUND ────────────────────────────────────────────────────────────
  { id:"background", title:"Background Documents", short:"Background", reg:"AR 601-210 · USMEPCOM 601-23", cond:A, items:[
    { id:"livescan",  cond:A, init:"complete", label:"Live Scan — completed and valid",
      sub:"Valid within 120 days of scan date",
      help:h("Live Scan","AR 601-210 · USMEPCOM 601-23","Valid for 120 days from the date of the scan. If expired, applicant must redo before projecting — no exceptions. SC must enter Live Scan authorization in Contact History in RZ (NOT SC Remarks).","Valid 120 days from scan date.",["Expired Live Scan — cannot project","Authorization in SC Remarks instead of Contact History — GC NO-GO"]) },
    { id:"dd369",     cond:A, init:"flagged",  label:"EBC Release — DD 369 (all 3 jurisdictions returned)",
      sub:"City police, county sheriff, AND state — all returned before projecting; run all aliases separately",
      help:h("EBC Release — DD 369 Police Records Check","AR 601-210 para 6-3 · UM 21-022","Run DD 369s for all three jurisdictions: city police, county sheriff, and state law enforcement. All three returns must be in hand before projecting. Run a separate DD 369 for every alias — never hand-write an alias onto an existing form (IAW UM 21-022). Must be dated within 6 months AND cover all locations where the applicant lived, worked, attended school, or committed an offense during the last 3 years.","All 3 jurisdictions must be returned before projection.",["One or more jurisdictions not returned — CANNOT PROJECT","Alias not run on a separate DD 369 — RETURN","DD 369 not covering offense location — RETURN"]) },
    { id:"sex-off",   cond:A, init:"pending",  label:"Sex Offender Registry Check",
      sub:"National registry check — document results in GENESIS remarks",
      help:h("Sex Offender Registry Check","AR 601-210","Check the National Sex Offender Public Website (NSOPW.gov) and any applicable state registry. Document the results (clear or hit) in GENESIS remarks before SC QC initiation. A hit requires immediate consultation with GC — do not project.",null,["Registry hit — stop and contact GC immediately before any further action"]) },
    { id:"legal",     cond:A, init:"complete", label:"DD 369 results reviewed — no undisclosed offenses",
      sub:"Results checked against moral screening disclosures",
      help:h("Legal Review","AR 601-210 · USMEPCOM 601-23","Review DD 369 returns for any offenses not disclosed during moral screening. Any undisclosed offense discovered in returns requires immediate GC consultation. Disclosure inconsistency between medical and moral screening is also a GC return.",null,["Undisclosed offenses discovered — stop and contact GC immediately"]) },
  ]},

  // ── 5. MEDICAL & PHYSICAL ────────────────────────────────────────────────────
  { id:"medical", title:"Medical & Physical", short:"Medical", reg:"USMEPCOM 40-1", cond:A, items:[
    { id:"umf680",    cond:A, init:"complete", label:"UMF 680-3A — Applicant Medical Prescreening Form",
      sub:"All sections filled — signature witnessed by recruiter in person",
      help:h("UMF 680-3A","USMEPCOM 40-1","Complete all sections. Applicant must sign in front of the recruiter — do not accept pre-signed forms. Dates must be consistent with DD 2807-2 and GENESIS. Use DD MON YYYY format.",null,["Pre-signed forms — NOT ACCEPTABLE; signature must be witnessed","Date inconsistency with DD 2807-2 or GENESIS — GC return"]) },
    { id:"umf680-2",  cond:A, init:"pending",  label:"UMF 680-3A-2 — Extended Prescreening Form",
      sub:"Required for all applicants — companion form to 680-3A",
      help:h("UMF 680-3A-2","USMEPCOM 40-1","Companion form to the 680-3A. Required for all applicants. Complete all applicable sections. Attach braces letter if applicant currently has orthodontic braces.",null,["Missing from packet — required for all applicants"]) },
    { id:"umf408",    cond:A, init:"pending",  label:"UMF 40-8-1-E — Applicant Processing Form",
      sub:"MEPS processing form — attach braces letter if applicant has braces",
      help:h("UMF 40-8-1-E","USMEPCOM 40-1","Required MEPS processing form. If the applicant currently has orthodontic braces, a braces letter from the orthodontist must be attached. Ensure all fields are complete.",null,["Missing from packet — required for all applicants","Braces present but no braces letter attached — MEPS return"]) },
    { id:"dd2807",    cond:A, init:"complete", label:"DD 2807-2 — Medical Prescreen",
      sub:"All blocks answered — write N/A if not applicable",
      help:h("DD 2807-2","USMEPCOM 40-1","All blocks must be answered. Write 'N/A' for non-applicable blocks. Dates must be consistent with UMF 680-3A and GENESIS. Disclosures must be consistent with moral screening — inconsistency is a GC return.",null,["Blank blocks — write N/A","Disclosure inconsistency between DD 2807-2 and moral screening — GC return"]) },
    { id:"dd2005",    cond:A, init:"pending",  label:"DD 2005 — Privacy Act Statement",
      sub:"Health care privacy notice — current signature required",
      help:h("DD 2005 — Privacy Act Statement for Health Care Records","USMEPCOM 40-1","Required for all MEPS applicants. The applicant must sign this acknowledging the Privacy Act statement for health care records. Current signature required — do not use a previously signed copy.",null,["Pre-signed or undated — NOT ACCEPTABLE"]) },
    { id:"dates",     cond:A, init:"complete", label:"Dates consistent across all medical forms",
      sub:"DD 2807-2, UMF 680-3A, UMF 680-3A-2, and GENESIS must agree",
      help:h("Date Consistency Check","AR 601-210","Cross-check all dates on DD 2807-2, UMF 680-3A, UMF 680-3A-2, and GENESIS. Even a one-day discrepancy is a GC return. Do this before initiating SC QC every time.",null,["Any date inconsistency across forms — GC return"]) },
  ]},

  // ── 6. ENLISTMENT ────────────────────────────────────────────────────────────
  { id:"enlistment", title:"Enlistment Documents", short:"Enlistment", reg:"UR 601-210 · AR 601-210", cond:A, items:[
    { id:"uf15",      cond:A, init:"pending",  label:"UF 601-210.15 — completed 3–7 days before MEPS",
      sub:"Do not complete early — form expires by MEPS date",
      help:h("UF 601-210.15","UR 601-210 para 24-3","Must be completed within 3–7 calendar days of the projected MEPS date. Do NOT complete early — it will expire. Completing too early is one of the most common GC NO-GO reasons.","Complete 3–7 calendar days before projected MEPS date.",["Completed too early — expires before MEPS date (GC NO-GO)"]) },
    { id:"temp-res",  cond:A, init:"pending",  label:"Temp Reservation — created in RZ",
      sub:"Valid 7 calendar days — recreate if MEPS date shifts; max 3 per applicant",
      help:h("Temp Reservation","UR 601-210 para 24-3","Create the Temp Res in RZ for the projected MEPS date. Valid for 7 calendar days only. If the MEPS date shifts beyond 7 days, the Temp Res must be recreated. Maximum 3 Temp Res per applicant. If the applicant has used all 3, contact GC.",null,["Temp Res expired — MEPS cannot process","Third Temp Res used — contact GC before creating another"]) },
    { id:"mirs",      cond:A, init:"pending",  label:"MIRS 1.1 — printed immediately before submission",
      sub:"Reprint on submission day — never use an old printout",
      help:h("MIRS 1.1","AR 601-210","Print the MIRS immediately before submitting the packet. The AFQT score must match the most recent ASVAB score in RZ. MIRS data changes after a retest or profile update — a stale MIRS is a common waiver packet return.","Print on the day of submission.",["Outdated MIRS with stale AFQT score — waiver packet return"]) },
    { id:"asvab",     cond:A, init:"complete", label:"ASVAB / PICAT — valid within 2 years",
      sub:"Confirm test date and AFQT — PICAT requires MEPS confirmation test",
      help:h("ASVAB / PICAT Validity","AR 601-210","Valid for 2 years from the test date. PICAT requires a MEPS confirmation test before scores are final. Verify AFQT matches MIRS 1.1 and UF 601-210.08 (if waiver packet).","Valid 2 years from test date.",["Expired ASVAB — must retest before projecting","PICAT without MEPS confirmation test — scores not final"]) },
    { id:"sigs",      cond:A, init:"complete", label:"All form signatures witnessed by recruiter",
      sub:"Applicant signs in front of recruiter — no pre-signed forms",
      help:h("Signature Requirements","AR 601-210","All signatures must be obtained in the recruiter's presence. Correction procedure: single line through error, write correction next to it, initial. Do NOT use Wite-Out on any government form.",null,["Pre-signed forms — NOT ACCEPTABLE","Wite-Out corrections — NOT ACCEPTABLE"]) },
  ]},

  // ── 7. DEPENDENT DOCUMENTS (conditional) ────────────────────────────────────
  { id:"dependents", title:"Dependent Documents", short:"Dependents", reg:"AR 601-210 · AR 608-99", cond:p => p.dependents !== "none", items:[
    { id:"mar-cert",  cond:MAR,  init:"pending", label:"Marriage Certificate",
      sub:"Certified copy — verify name matches current legal name",
      help:h("Marriage Certificate","AR 608-99","Certified copy with raised seal or certifying stamp. Verify the name on the certificate matches the applicant's current legal name. If the applicant has a prior marriage, divorce decree(s) are required for each prior marriage.",null,["Photocopy — NOT ACCEPTABLE","Prior marriages without divorce decrees — incomplete"]) },
    { id:"sp-docs",   cond:MAR,  init:"pending", label:"Spouse — SSC + Birth Certificate + Photo ID",
      sub:"All three required for each spouse",
      help:h("Spouse Documents","AR 608-99","Social Security Card (original or certified copy), Birth Certificate (certified copy), and government-issued photo ID required for spouse. Names must be consistent across all documents.",null,null) },
    { id:"div-dec",   cond:MAR,  init:"pending", label:"Divorce Decree(s)",
      sub:"Required for any prior marriages — N/A if no prior marriages",
      help:h("Divorce Decree","AR 608-99","Required for each prior marriage. Must be a certified copy showing final decree. Note 'N/A' if no prior marriages.",null,null) },
    { id:"dep-docs",  cond:KIDS, init:"pending", label:"Dependent Child(ren) — SSC + Birth Certificate",
      sub:"Both documents required for each dependent child",
      help:h("Dependent Children Documents","AR 608-99","Social Security Card and Birth Certificate required for each dependent child. Both must be originals or certified copies.",null,null) },
    { id:"child-sup", cond:KIDS, init:"pending", label:"Child Support Order",
      sub:"If applicable — N/A if no court-ordered support",
      help:h("Child Support Order","AR 608-99","Required if there is a court-ordered child support obligation. Mark N/A if no court order exists.",null,null) },
  ]},

  // ── 8. PRIOR SERVICE (conditional) ──────────────────────────────────────────
  { id:"prior-service", title:"Prior Service Documents", short:"Prior Svc", reg:"AR 601-210 · Ch.3", cond:PS, items:[
    { id:"dd214",     cond:A,    init:"pending", label:"DD 214 (or NGB 22 for NG)",
      sub:"Verify RE code, discharge character, and dates of service",
      help:h("DD 214 / NGB 22","AR 601-210 Ch.3","DD 214 for active duty separations, NGB 22 for National Guard. Verify: RE code (must be eligible), character of discharge (Honorable or General), and dates of service match GENESIS. An RE code requiring waiver cannot be waived by the recruiter — contact GC.",null,["RE code requiring waiver — contact GC before proceeding","Character of discharge other than Honorable/General — contact GC"]) },
    { id:"redd",      cond:A,    init:"pending", label:"REDDPORT — signed by applicant",
      help:h("REDDPORT","AR 601-210","Required for all prior service applicants. Applicant must sign acknowledging their prior service record and obligations.",null,null) },
    { id:"promo-ord", cond:A,    init:"pending", label:"Promotion Orders",
      sub:"If applicable — N/A if not promoted above E-1",
      help:h("Promotion Orders","AR 601-210","Most recent promotion orders. N/A if applicant separated at E-1. Required to verify rank at separation for enlistment grade determination.",null,null) },
    { id:"imr",       cond:USAR, init:"pending", label:"IMR — Individual Medical Record",
      sub:"USAR/NG applicants — N/A if not available",
      help:h("IMR — Individual Medical Record","AR 601-210","Required for USAR/NG prior service. Provides medical history for MEPS review. Mark N/A if not available — note in GENESIS remarks.",null,null) },
    { id:"pha",       cond:USAR, init:"pending", label:"PHA — Periodic Health Assessment",
      sub:"USAR/NG applicants — most recent PHA",
      help:h("PHA — Periodic Health Assessment","AR 601-210","Most recent Periodic Health Assessment for USAR/NG prior service applicants. Required for MEPS review.",null,null) },
    { id:"dd368-irr", cond:p => p.priorService === "army", init:"pending", label:"DD 368 — IRR Release",
      sub:"If IRR/Reserves obligation remaining — N/A if no remaining obligation",
      help:h("DD 368 — IRR Release","AR 601-210","Required if the applicant has a remaining obligation in the Individual Ready Reserve. Must be approved before MEPS processing. N/A if no remaining obligation.",null,["Unapproved or expired — cannot process at MEPS"]) },
  ]},

  // ── 9. MSO RELEASE (conditional) ────────────────────────────────────────────
  { id:"mso-rel", title:"MSO Release", short:"MSO Release", reg:"AR 601-210 para 6-5", cond:MSO, items:[
    { id:"dd368",  cond:A, init:"pending", label:"DD 368 — MSO approved and not expired",
      sub:"Must be approved by both gaining and releasing component commanders",
      help:h("DD 368 — Conditional Release","AR 601-210 para 6-5","Must be approved by both gaining and releasing component commanders AND not expired before any MEPS processing. Verify approval date and expiration before scheduling.","Must be approved and not expired before MEPS processing.",["Expired or unapproved DD 368 — MEPS rejection"]) },
  ]},

  // ── 10. MORAL WAIVER (conditional) ──────────────────────────────────────────
  { id:"moral-waiver", title:"Moral Waiver Packet", short:"Moral Waiver", reg:"AR 601-210 · Ch.4", cond:MOR, items:[
    { id:"mor-stmt",   cond:A, init:"pending", label:"Applicant Statement",
      sub:"Handwritten by applicant — full account of each offense, ownership, and rehabilitation",
      help:h("Applicant Statement","AR 601-210 Ch.4","Applicant must write a personal statement in their own words covering: what happened, their role, the outcome, and what they have done since. Must address each offense being waived. Recruiter should NOT write or dictate the statement.",null,["Recruiter-written statements — NOT ACCEPTABLE","Statement that does not address each waived offense — RETURN"]) },
    { id:"uf60108",    cond:A, init:"pending", label:"UF 601-210.08 — Law Violations List",
      sub:"Newest to oldest; asterisk offense(s) being waived; AFQT must match RZ",
      help:h("UF 601-210.08","AR 601-210 Ch.4","List ALL law violations newest to oldest — not just the waived offenses. Asterisk only the offense(s) being waived. AFQT on this form must match the most recent ASVAB score in RZ.\n\nNote: Marijuana possession/use offenses — NO waiver required per AR 601-210 para 4-6 (Mar 2026). Do not initiate a waiver for possession/use. Verify offense classification (possession/use vs. distribution) with GC.",null,["AFQT on form must match most recent ASVAB score in RZ","Marijuana possession/use — NO waiver required per AR 601-210 para 4-6 (Mar 2026)"]) },
    { id:"mor-incident",cond:A, init:"pending", label:"Police Incident Report(s)",
      sub:"Required for all offenses above traffic — obtain from arresting jurisdiction",
      help:h("Police Incident Reports","AR 601-210 Ch.4","Obtain the police incident report from the arresting jurisdiction for every offense above traffic level. Report must show date, charges, and final disposition. If the jurisdiction will not furnish a report, use UF 601-210.02 in its place.",null,["Missing incident report without UF 601-210.02 — RETURN"]) },
    { id:"dockets",    cond:A, init:"pending", label:"Court Dockets — all offenses above traffic",
      sub:"Charging document + court finding/sentencing + final disposition per offense",
      help:h("Court Dockets","AR 601-210 Ch.4","For every offense above traffic: (1) charging document (information docket), (2) court finding and sentencing, (3) final disposition. All three components required per offense. If the court will not furnish dockets, use UF 601-210.02.",null,["Missing any of the three docket components for an offense — RETURN"]) },
    { id:"dd370",      cond:A, init:"pending", label:"DD Form 370 — three character references",
      sub:"Employment, school, and personal — college references include transcript",
      help:h("DD Form 370","AR 601-210 Ch.4","Three required references: employment, school, and personal. College/vo-tech references must include a transcript. Dates must match RZ entries exactly. No family members as personal references. All three must be returned and in hand before projecting.",null,["College reference without transcript — RETURN","Family member as personal reference — RETURN","Fewer than three references — incomplete"]) },
    { id:"uf601-02",   cond:A, init:"pending", label:"UF 601-210.02",
      sub:"Use when court will not furnish dockets, or for self-admittal offenses",
      help:h("UF 601-210.02","AR 601-210 Ch.4","Required when the court will not furnish dockets for an offense. Also required for self-admittal offenses (no arrest record). Mark N/A on individual items where official records were obtained.",null,null) },
    { id:"fl60104",    cond:A, init:"pending", label:"USAREC FL 601-210.04",
      sub:"Required if applicant was confined 24+ hours in any institution — N/A if not confined",
      help:h("FL 601-210.04 — Request for Information","AR 601-210 Ch.4","Required if the applicant was confined 24+ hours in any institution (jail, detention center, juvenile facility, or inpatient program). The institution fills out and signs the second page. Mark N/A if applicant was never confined 24+ hours.",null,null) },
    { id:"mor-co",     cond:A, init:"pending", label:"CO Commander Interview MFR",
      sub:"Commanding Officer must interview applicant and document findings",
      help:h("CO Commander Interview MFR","AR 601-210 Ch.4","The Company Commander must interview the applicant and produce a Memorandum for Record documenting the interview, findings, and recommendation. Must be on official letterhead, signed, and dated.",null,["Undated or unsigned MFR — RETURN"]) },
    { id:"mor-bn",     cond:A, init:"pending", label:"Battalion Commander Recommendation Memo",
      sub:"BN Commander memo recommending approval or disapproval of waiver",
      help:h("BN Commander Memo","AR 601-210 Ch.4","Battalion Commander endorsement memo recommending approval or disapproval of the waiver request. Must be on official letterhead, signed, and dated. Must reference the specific offense(s) being waived.",null,null) },
  ]},

  // ── 11. SUITABILITY WAIVER (conditional) ────────────────────────────────────
  { id:"suit-waiver", title:"Suitability Waiver Packet", short:"Suit. Waiver", reg:"AR 601-210 · Ch.4", cond:SUIT, items:[
    { id:"suit-stmt",  cond:A, init:"pending", label:"Applicant Statement",
      sub:"Full account of each offense, ownership, and rehabilitation",
      help:h("Applicant Statement (Suitability)","AR 601-210 Ch.4","Same requirements as moral waiver statement. Applicant must write in own words covering all suitability issues.",null,null) },
    { id:"suit-dd369", cond:A, init:"pending", label:"DD 369 — all jurisdictions, <6 months old",
      sub:"Must cover lived, worked, school, and offense locations — last 3 years",
      help:h("DD 369 (Suitability)","AR 601-210 Ch.4","Same DD 369 requirements as moral waiver. Must cover all locations and be run under all aliases.",null,null) },
    { id:"suit-inc",   cond:A, init:"pending", label:"Police Incident Reports",
      sub:"Required for all offenses above traffic",
      help:h("Police Incident Reports (Suitability)","AR 601-210 Ch.4","Obtain for every offense above traffic. Use UF 601-210.02 if the jurisdiction will not furnish.",null,null) },
    { id:"suit-court", cond:A, init:"pending", label:"Court Dockets — all offenses above traffic",
      sub:"Charging document + court finding + final disposition per offense",
      help:h("Court Dockets (Suitability)","AR 601-210 Ch.4","All three components required per offense: charging document, court finding/sentencing, final disposition.",null,null) },
    { id:"suit-uf08",  cond:A, init:"pending", label:"UF 601-210.08 — Law Violations List",
      sub:"All violations newest to oldest; asterisk offense(s) being waived",
      help:h("UF 601-210.08 (Suitability)","AR 601-210 Ch.4","Same requirements as moral waiver UF 601-210.08.",null,null) },
    { id:"suit-fl04",  cond:A, init:"pending", label:"USAREC FL 601-210.04",
      sub:"Required if confined 24+ hours — N/A if not confined",
      help:h("FL 601-210.04 (Suitability)","AR 601-210 Ch.4","Same requirements as moral waiver FL 601-210.04.",null,null) },
    { id:"suit-co",    cond:A, init:"pending", label:"CO Commander Interview MFR",
      help:h("CO Commander Interview MFR (Suitability)","AR 601-210 Ch.4","Company Commander interview MFR — same requirements as moral waiver.",null,null) },
    { id:"suit-bn",    cond:A, init:"pending", label:"Battalion Commander Recommendation Memo",
      help:h("BN Commander Memo (Suitability)","AR 601-210 Ch.4","Battalion Commander endorsement memo — same requirements as moral waiver.",null,null) },
  ]},

  // ── 12. MEDICAL WAIVER (conditional) ────────────────────────────────────────
  { id:"medical-waiver", title:"Medical Waiver Packet", short:"Med Waiver", reg:"AR 601-210 · USMEPCOM 40-1", cond:MED, items:[
    { id:"meps-disp", cond:A, init:"pending", label:"MEPS Complex Prescreen — disposition received",
      sub:"Do not project until MEPS returns a written disposition",
      help:h("Complex Prescreen / MEPS Disposition","USMEPCOM 40-1","Submit the complex prescreen to MEPS and wait for a written disposition before projecting. Do not schedule MEPS until MEPS returns a disposition.",null,["Complex prescreen submitted but no MEPS disposition — DO NOT PROJECT"]) },
    { id:"med-stmt",  cond:A, init:"pending", label:"Applicant Statement",
      sub:"Statement addressing the medical condition and current status",
      help:h("Applicant Statement (Medical)","AR 601-210","Applicant statement describing the medical condition, treatment history, and current status. Must address the specific condition(s) being waived.",null,null) },
    { id:"med-recs",  cond:A, init:"pending", label:"Medical Records — all MEPS-specified documentation",
      sub:"Specialist reports, treatment records, MEPS-required documents",
      help:h("Medical Records","USMEPCOM 40-1","Gather all medical records specified in the MEPS disposition letter. Number multi-page records. Records must be legible and complete.",null,["Incomplete records — MEPS return"]) },
  ]},

  // ── 13. AGE ETP (conditional) ───────────────────────────────────────────────
  { id:"age-waiver", title:"Age ETP Packet", short:"Age ETP", reg:"AR 601-210 Ch.3", cond:AGEW, items:[
    { id:"age-stmt",  cond:A, init:"pending", label:"Applicant Statement",
      help:h("Applicant Statement (Age ETP)","AR 601-210","Statement supporting the Age Exception to Policy request.",null,null) },
    { id:"age-asvab", cond:A, init:"pending", label:"Valid ASVAB / PICAT Score — 50+ AFQT required",
      sub:"Qualifying score on file in RZ",
      help:h("ASVAB Score (Age ETP)","AR 601-210","Age ETPs require a minimum AFQT of 50. Verify current valid score on file in RZ.",null,["AFQT below 50 — does not qualify for Age ETP"]) },
    { id:"age-med",   cond:A, init:"pending", label:"Fully Medically Qualified — no pending disqualifiers",
      help:h("Medical Qualification (Age ETP)","AR 601-210","Applicant must be fully medically qualified with no pending medical disqualifiers before Age ETP can be submitted.",null,null) },
    { id:"age-scan",  cond:A, init:"pending", label:"Live Scan Results",
      help:h("Live Scan (Age ETP)","AR 601-210","Current valid Live Scan results must be included.",null,null) },
    { id:"age-mirs",  cond:A, init:"pending", label:"MIRS 1.1 — current printout",
      help:h("MIRS 1.1 (Age ETP)","AR 601-210","Current MIRS 1.1 printout — same day as packet submission.",null,null) },
  ]},

  // ── 14. TATTOO WAIVER (conditional) ─────────────────────────────────────────
  { id:"tattoo-waiver", title:"Tattoo Waiver Packet", short:"Tattoo Waiver", reg:"AR 670-1 · AR 601-210", cond:TATW, items:[
    { id:"tat-stmt",   cond:A, init:"pending", label:"Applicant Statement",
      help:h("Applicant Statement (Tattoo)","AR 601-210","Statement describing each tattoo, location, size, and content. Must address why the waiver is needed.",null,null) },
    { id:"tat-photos", cond:A, init:"pending", label:"Color Photos of All Tattoo(s)",
      sub:"Full tattoo visible, body location shown, photos dated",
      help:h("Tattoo Photos","AR 670-1","Color photos of each tattoo being waived. Must show the full tattoo clearly, including body location for context. Photos must be dated.",null,["Black-and-white photos — NOT ACCEPTABLE","Tattoo not fully visible — RETURN"]) },
    { id:"tat-co",     cond:A, init:"pending", label:"CO Commander Memo",
      help:h("CO Commander Memo (Tattoo)","AR 601-210","Company Commander memo documenting review and recommendation on the tattoo waiver.",null,null) },
    { id:"tat-picat",  cond:A, init:"pending", label:"Valid PICAT or ASVAB Score",
      help:h("ASVAB/PICAT (Tattoo)","AR 601-210","Current valid ASVAB or PICAT score on file.",null,null) },
    { id:"tat-dd2807", cond:A, init:"pending", label:"Completed DD 2807-2",
      help:h("DD 2807-2 (Tattoo)","AR 601-210","Completed medical prescreening, same requirements as standard packet.",null,null) },
  ]},

  // ── 15. RELIGIOUS ACCOMMODATION (conditional) ───────────────────────────────
  { id:"rel-waiver", title:"Religious Accommodation Packet", short:"Religious", reg:"AR 600-20 · AR 601-210", cond:RELW, items:[
    { id:"rel-stmt",     cond:A, init:"pending", label:"Applicant Statement",
      help:h("Applicant Statement (Religious)","AR 601-210","Statement describing the religious accommodation requested and the specific religious basis for the request.",null,null) },
    { id:"rel-co",       cond:A, init:"pending", label:"CO Commander Memo",
      help:h("CO Memo (Religious)","AR 601-210","Company Commander review and recommendation memo.",null,null) },
    { id:"rel-bn",       cond:A, init:"pending", label:"Battalion Commander Memo",
      help:h("BN Memo (Religious)","AR 601-210","Battalion Commander endorsement memo.",null,null) },
    { id:"rel-chaplain", cond:A, init:"pending", label:"BDE Chaplain Memo",
      help:h("Chaplain Memo (Religious)","AR 601-210","Brigade Chaplain memo supporting or addressing the religious accommodation request.",null,null) },
  ]},

  // ── 16. RE CODE WAIVER (conditional) ────────────────────────────────────────
  { id:"re-waiver", title:"RE Code Waiver Packet", short:"RE Code", reg:"AR 601-210 Ch.3", cond:RECW, items:[
    { id:"re-stmt",  cond:A, init:"pending", label:"Applicant Statement",
      help:h("Applicant Statement (RE Code)","AR 601-210","Statement explaining the circumstances of the prior separation and RE code.",null,null) },
    { id:"re-dd370", cond:A, init:"pending", label:"DD 370 — Fingerprint Cards × 3",
      help:h("DD 370 Fingerprint Cards","AR 601-210","Three fingerprint cards required for RE code waiver packets. Must be current and properly completed.",null,null) },
    { id:"re-co",    cond:A, init:"pending", label:"CO Commander Memo",
      help:h("CO Memo (RE Code)","AR 601-210","Company Commander review and recommendation memo for RE code waiver.",null,null) },
    { id:"re-bn",    cond:A, init:"pending", label:"Battalion Commander Memo",
      help:h("BN Memo (RE Code)","AR 601-210","Battalion Commander endorsement memo for RE code waiver.",null,null) },
  ]},

  // ── 17. DEPENDENCY WAIVER (conditional) ─────────────────────────────────────
  { id:"dep-waiver", title:"Dependency Waiver Packet", short:"Dep. Waiver", reg:"AR 601-210 Ch.5", cond:DEPW, items:[
    { id:"dep-stmt",     cond:A, init:"pending", label:"Applicant Statement",
      help:h("Applicant Statement (Dependency)","AR 601-210","Statement explaining the dependency situation and the applicant's ability to fulfill military obligations.",null,null) },
    { id:"dep-co",       cond:A, init:"pending", label:"CO Commander Memo",
      help:h("CO Memo (Dependency)","AR 601-210","Company Commander memo addressing the dependency waiver.",null,null) },
    { id:"dep-caretaker",cond:A, init:"pending", label:"Caretaker Statement",
      sub:"Signed statement from the designated caretaker for each dependent",
      help:h("Caretaker Statement","AR 601-210","Signed statement from the designated caretaker confirming their willingness and ability to care for the dependent(s) during the applicant's service.",null,null) },
    { id:"dep-da3072",   cond:A, init:"pending", label:"DA Form 3072-2 — Financial Disclosure",
      sub:"All income entries must be MONTHLY — not annual or weekly",
      help:h("DA Form 3072-2","AR 601-210","Financial disclosure form. All income entries must be monthly figures — not annual or weekly. Do NOT include anticipated military pay as other income.",null,["Annual or weekly income entries — RETURN"]) },
    { id:"dep-fcp",      cond:A, init:"pending", label:"Family Care Plan",
      help:h("Family Care Plan","AR 601-210 · AR 600-20","Completed Family Care Plan designating caretakers for dependent family members during deployment or training.",null,null) },
  ]},

  // ── 18. ARMS / FSPC PROGRAM DOCS (conditional) ──────────────────────────────
  { id:"arms-docs", title:"ARMS 2.0 / FSPC Program Documents", short:"ARMS/FSPC", reg:"AR 601-210 · ARMS SOP", cond:ARMS, items:[
    { id:"arms-680adp",cond:A,    init:"pending", label:"USMEPCOM 680-ADP — ARMS Prescreening Form",
      sub:"ARMS-specific prescreen — required in addition to standard 680-3A",
      help:h("USMEPCOM 680-ADP","AR 601-210 · ARMS SOP","ARMS-specific medical prescreening form required in addition to the standard UMF 680-3A. Must be completed and submitted with the packet.",null,["Missing from ARMS packet — required"]) },
    { id:"arms-da5500",cond:p => ARMS(p) && !FEML(p), init:"pending", label:"DA 5500 — Body Fat Content Worksheet (Male)",
      sub:"Required if applicant exceeds screening table weight",
      help:h("DA 5500 — Body Fat Worksheet (Male)","AR 600-9","Required when male applicant exceeds the screening table weight for their height. Must be completed by a trained body fat assessor using the Army method. Results must meet Army standards for enlistment.",null,["Applicant over screening weight without DA 5500 — MEPS will not process"]) },
    { id:"arms-da5501",cond:p => ARMS(p) && FEML(p),  init:"pending", label:"DA 5501 — Body Fat Content Worksheet (Female)",
      sub:"Required if applicant exceeds screening table weight",
      help:h("DA 5501 — Body Fat Worksheet (Female)","AR 600-9","Required when female applicant exceeds the screening table weight for their height. Must be completed by a trained body fat assessor using the Army method.",null,["Applicant over screening weight without DA 5501 — MEPS will not process"]) },
    { id:"arms-mirs",  cond:A,    init:"pending", label:"DD 2808 / MIRS 1.1 — current printout",
      sub:"ARMS requires current MIRS — reprint on submission day",
      help:h("MIRS 1.1 (ARMS)","AR 601-210","Current MIRS 1.1 printout, same day as submission. ARMS packets require the MIRS to confirm AFQT and GT scores meet program requirements.",null,null) },
    { id:"fspc-elig",  cond:FSPC, init:"pending", label:"FSPC Eligibility Documentation",
      sub:"Verify sub-program requirements (IIIB / ARMS 2.0 / 09M) with current USAREC guidance",
      help:h("FSPC Eligibility","AR 601-210","FSPC sub-program requirements change frequently. Verify current eligibility requirements with GC before initiating. Confirm the correct sub-program code is entered in iKrome.",null,null) },
  ]},

  // ── 19. OCS DOCUMENTS (conditional) ─────────────────────────────────────────
  { id:"ocs-docs", title:"OCS — Officer Candidate School", short:"OCS", reg:"AR 601-210 · OCS SOP", cond:OCS, items:[
    { id:"ocs-da61",  cond:A, init:"pending", label:"DA Form 61 — Application for Appointment",
      sub:"Commissioned Officer appointment application — complete, no blanks",
      help:h("DA Form 61 (OCS)","AR 601-210 OCS","Application for appointment as a commissioned officer. Must be completely filled out with no blanks. Submit per current HRC Officer Accessions branch instructions.",null,null) },
    { id:"ocs-trans", cond:A, init:"pending", label:"Official College Transcripts (sealed)",
      sub:"Bachelor's degree required — regionally accredited institution",
      help:h("College Transcripts (OCS)","AR 601-210 OCS","Official sealed transcripts from all colleges/universities attended. Bachelor's degree from a regionally accredited institution required. GPA and degree major must be visible.",null,["Unofficial or unsealed transcripts — NOT ACCEPTABLE"]) },
    { id:"ocs-lor",   cond:A, init:"pending", label:"Letters of Recommendation × 3",
      sub:"O-3 or above; official letterhead; dated within 12 months",
      help:h("OCS Letters of Recommendation","AR 601-210 OCS","Three letters of recommendation from officers O-3 or above. Must be on official letterhead, signed, and dated within 12 months of packet submission.",null,["Letters from below O-3 — do not qualify","Letters older than 12 months — RETURN"]) },
    { id:"ocs-gt",    cond:A, init:"pending", label:"GT Score 110+ — verified in iKrome line scores",
      help:h("GT Score (OCS)","AR 601-210 OCS","Minimum GT score of 110 required. Verify current score in iKrome line scores. If below 110, the applicant does not qualify for OCS.",null,["GT below 110 — does not qualify"]) },
    { id:"ocs-acft",  cond:A, init:"pending", label:"ACFT Score Documentation",
      sub:"Must meet OCS standard for age/gender group — certified results",
      help:h("ACFT Score (OCS)","AR 601-210 OCS","Current certified ACFT score meeting the OCS standard for the applicant's age and gender group. Must be from an official ACFT administration.",null,null) },
    { id:"ocs-photo", cond:A, init:"pending", label:"Official Army Photo — ASU uniform, within 6 months",
      help:h("Army Photo (OCS)","AR 601-210 OCS","Official Army photo in Army Service Uniform (ASU). Must be taken within 6 months of packet submission.",null,null) },
    { id:"ocs-med",   cond:A, init:"pending", label:"MEPS Physical Clearance — standard MEPS only",
      help:h("MEPS Physical (OCS)","AR 601-210 OCS","Standard MEPS physical clearance required. No pending medical holds. OCS uses standard MEPS, not a specialized physical.",null,null) },
  ]},

  // ── 20. FLRI DOCUMENTS (conditional) ────────────────────────────────────────
  { id:"flri-docs", title:"FLRI — Future Leader Recruiting Initiative", short:"FLRI", reg:"AR 601-210 · FLRI SOP", cond:FLRI, items:[
    { id:"flri-dd214",cond:A, init:"pending", label:"DD 214 — Prior Officer Service",
      sub:"Must show commissioned service, separation code, and character of discharge",
      help:h("DD 214 (FLRI)","AR 601-210 FLRI","DD 214 documenting prior commissioned officer service. Must show: commissioned service dates, separation code, and Honorable character of discharge. FLRI is limited to prior officers only.",null,null) },
    { id:"flri-da61", cond:A, init:"pending", label:"DA Form 61 — Application for Appointment",
      help:h("DA Form 61 (FLRI)","AR 601-210 FLRI","Application for appointment — same form as OCS but submitted under FLRI program.",null,null) },
    { id:"flri-elig", cond:A, init:"pending", label:"FLRI Eligibility Verification Memo",
      sub:"From RSC or USAREC — obtain BEFORE initiating any documents",
      help:h("FLRI Eligibility Memo","AR 601-210 FLRI","Obtain FLRI eligibility verification from your RSC or USAREC before initiating any packet documents. FLRI requirements and quotas change frequently. Do not begin processing without this memo.",null,["Processing without eligibility verification — stops at GC"]) },
    { id:"flri-trans",cond:A, init:"pending", label:"Official College Transcripts (sealed)",
      sub:"Degree required — regionally accredited institution",
      help:h("Transcripts (FLRI)","AR 601-210 FLRI","Same requirements as OCS transcripts. Bachelor's degree from regionally accredited institution required.",null,null) },
    { id:"flri-lor",  cond:A, init:"pending", label:"Letters of Recommendation",
      sub:"O-4 or above; official letterhead; within 12 months",
      help:h("Letters of Recommendation (FLRI)","AR 601-210 FLRI","Letters of recommendation from officers O-4 or above (FLRI requires higher rank than OCS). Official letterhead, signed, dated within 12 months.",null,null) },
  ]},

  // ── 21. ATP DOCUMENTS (conditional) ─────────────────────────────────────────
  { id:"atp-docs", title:"ATP — Army Training Program", short:"ATP", reg:"AR 601-210 · ATP SOP", cond:ATP, items:[
    { id:"atp-elig",    cond:A, init:"pending", label:"ATP Eligibility Verification",
      sub:"Confirm with GC BEFORE initiating — requirements change frequently",
      help:h("ATP Eligibility","AR 601-210 ATP","Confirm ATP eligibility with GC before initiating any documents. ATP requirements and available MOSs change frequently. Do not begin processing without GC confirmation.",null,null) },
    { id:"atp-scores",  cond:A, init:"pending", label:"Current ASVAB Line Scores — qualifying for intended MOS",
      help:h("Line Scores (ATP)","AR 601-210 ATP","Verify all required line scores for the intended MOS meet minimum requirements. ATP MOS must be available in the current cycle.",null,null) },
    { id:"atp-contract",cond:A, init:"pending", label:"Enlistment Option Documentation",
      sub:"ATP option confirmed and coded in iKrome before MEPS scheduling",
      help:h("ATP Contract Option","AR 601-210 ATP","The ATP enlistment option must be confirmed and correctly coded in iKrome before MEPS scheduling. Verify with GC.",null,null) },
    { id:"atp-mos",     cond:A, init:"pending", label:"MOS Qualification Verification",
      sub:"ATP MOS available; all line scores qualify",
      help:h("MOS Qualification (ATP)","AR 601-210 ATP","Confirm the intended MOS is available for ATP and that all applicable line score minimums are met.",null,null) },
  ]},

  // ── 22. SMP DOCUMENTS (conditional) ─────────────────────────────────────────
  { id:"smp-docs", title:"SMP Documents", short:"SMP", reg:"AR 601-210 · SMP", cond:SMP, items:[
    { id:"rotc-ltr",  cond:A, init:"pending", label:"ROTC enrollment letter — signed by PMS",
      sub:"From Professor of Military Science only — active enrollment and commissioning date",
      help:h("ROTC Enrollment Letter","AR 601-210 · SMP","Must come from the Professor of Military Science specifically — not any other ROTC staff. Must state active enrollment, current program year (MS-I through MS-IV), and expected commissioning date.",null,["Letter from anyone other than the PMS — RETURN"]) },
    { id:"smp-cont",  cond:A, init:"pending", label:"SMP contract — applicant and ROTC battalion rep signed",
      sub:"Contract period covers current semester through commissioning date",
      help:h("SMP Contract","AR 601-210 · SMP","Both the applicant AND the ROTC battalion representative must sign. Contract period must run from current semester through expected commissioning. Scholarship terms must appear if applicable.",null,["Missing scholarship terms for scholarship cadets — RETURN"]) },
    { id:"smp-orders",cond:A, init:"pending", label:"Assignment orders — current unit only",
      sub:"Verify unit designation and UIC match GENESIS",
      help:h("Assignment Orders","AR 601-210 · SMP","Most recent orders only. Verify unit designation and UIC match GENESIS. If recently transferred, get orders from the current unit.",null,null) },
    { id:"smp-trans", cond:A, init:"pending", label:"Academic transcript — good standing confirmed",
      sub:"Academic probation or suspension must be reported to GC",
      help:h("Academic Transcript (SMP)","AR 601-210 · SMP","Confirms ROTC enrollment and academic standing. If transcript shows academic probation or suspension, stop and consult GC before proceeding — this may void SMP eligibility.",null,["Academic probation or suspension — stop and consult GC"]) },
    { id:"smp-eval",  cond:A, init:"pending", label:"Most Recent NCOER or OER",
      sub:"Required if applicant holds NCO rank (E-5+) or officer rank in reserve component",
      help:h("NCOER / OER (SMP)","AR 601-210 · SMP","Required only if the applicant holds NCO rank (E-5+) or officer rank in the reserve component. If below E-5 with no officer history, mark N/A.",null,null) },
  ]},

  // ── 23. WOFT DOCUMENTS (conditional) ────────────────────────────────────────
  { id:"woft-docs", title:"WOFT / Warrant Flight Packet", short:"WOFT", reg:"AR 601-210 · WOFT", cond:WOF, items:[
    { id:"da61",      cond:A, init:"pending", label:"DA Form 61 — Application for Appointment",
      sub:"Complete and current — submit to HRC Aviation",
      help:h("DA Form 61 (WOFT)","AR 601-210 · WOFT","Application for appointment as a Warrant Officer. Must be completely filled out with no blanks. Submit per current HRC Aviation branch instructions.",null,null) },
    { id:"sift",      cond:A, init:"pending", label:"SIFT score — minimum 40 required",
      sub:"Structured Interview for Flight Training — confirm current and valid",
      help:h("SIFT Score","AR 601-210 · WOFT","Minimum score of 40 required for WOFT eligibility. One retake permitted after a 6-month waiting period.","One retake permitted after 6-month waiting period.",["Score below 40 — WOFT ineligible"]) },
    { id:"flt-phys",  cond:A, init:"pending", label:"Class 1A Flight Physical — completed at MEPS",
      sub:"NOT a standard MEPS physical — notify MEPS in advance; coordinate with RSC",
      help:h("Class 1A Flight Physical","AR 601-210 · WOFT","Class 1A Flight Physical must be completed at MEPS before the WOFT packet can be submitted to HRC. Coordinate with MEPS in advance — this is NOT a standard MEPS physical. Notify RSC.",null,null) },
    { id:"woft-gt",   cond:A, init:"pending", label:"GT Score 110+ — verified in iKrome line scores",
      help:h("GT Score (WOFT)","AR 601-210 WOFT","Minimum GT score of 110 required for WOFT. Verify in iKrome.",null,["GT below 110 — does not qualify"]) },
    { id:"woft-trans",cond:A, init:"pending", label:"College Transcripts",
      sub:"60+ credit hours preferred; official copy",
      help:h("Transcripts (WOFT)","AR 601-210 WOFT","60+ college credit hours preferred. Official transcript required. Not mandatory but significantly strengthens the packet.",null,null) },
    { id:"woft-ltrs", cond:A, init:"pending", label:"Letters of Recommendation — 3 required",
      sub:"At least one from a military officer (CW2+ or commissioned O-1+)",
      help:h("WOFT Letters of Recommendation","AR 601-210 · WOFT","Three letters of recommendation required. At least one must be from a military officer (CW2 or above, or commissioned O-1 or above).",null,["Fewer than 3 letters — incomplete packet"]) },
  ]},

];
