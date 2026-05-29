(function () {

/* ── OFFENSE CATEGORIES ──────────────────────────────────────────────────── */
window.OFFENSE_CATEGORIES = [
  // ─── ABSOLUTE BARS ───────────────────────────────────────────────────────
  { id:'bar_lautenberg',      label:'Domestic Violence — Lautenberg',        group:'bars',    sub:'18 USC § 922(g)(9) — misdemeanor DV conviction, any date', level:'BAR', authority:'NONE', bar:true, barPara:'Table 4-4, Code 414 / 4-7b', barText:'ABSOLUTE BAR: Qualifying misdemeanor conviction for domestic violence (use or attempted use of physical force, or threatened deadly weapon, by spouse/partner/parent/etc.). Per AR 601-210 4-7b and 18 USC 922(g)(9), NO waiver authority exists at any level — this applicant is permanently disqualified from enlistment in any component.' },
  { id:'bar_sex_offense',     label:'Sex Offense / Sex Offender Registration',group:'bars',   sub:'Rape, carnal knowledge, sodomy, child pornography, registration requirement', level:'BAR', authority:'NONE', bar:true, barPara:'Para 4-22j', barText:'Persons convicted of rape, carnal knowledge, sodomy, prostitution involving a minor, indecent assault, pornography involving a minor, or any offense requiring sex offender registration are permanently disqualified. No waiver authority exists.' },
  { id:'bar_murder',          label:'Murder / Intentional Homicide',          group:'bars',   sub:'NOT WAIVABLE — absolute bar at all levels', level:'BAR', authority:'NONE', bar:true, barPara:'Para 4-22k', barText:'Persons convicted of murder (intentional homicide) are permanently disqualified. No waiver authority exists at any level.' },
  { id:'bar_2plus_major',     label:'Two or More Major Misconduct Convictions',group:'bars',  sub:'2+ felony-level convictions — permanent DQ regardless of offense type', level:'BAR', authority:'NONE', bar:true, barPara:'Para 4-22i', barText:'Applicants with two or more total major misconduct (felony-level) convictions are permanently disqualified. This applies regardless of how much time has passed or the nature of the offenses.' },

  // ─── MAJOR MISCONDUCT — DMPM LEVEL ────────────────────────────────────
  { id:'major_drug_dist',     label:'Drug Distribution / Trafficking',        group:'major',  sub:'Incl. cannabis — Table 4-4, Code 436 — DMPM authority required', level:'MAJOR', authority:'DMPM', bar:false, triggersSuitabilityReview:true },
  { id:'major_trafficking',   label:'Human Trafficking',                       group:'major',  sub:'Table 4-4, Code 438 — DMPM', level:'MAJOR', authority:'DMPM', bar:false },

  // ─── MAJOR MISCONDUCT — USAREC LEVEL ──────────────────────────────────
  { id:'major_violent',       label:'Major Misconduct — Violent',              group:'major',  sub:'Aggravated assault, manslaughter, arson, robbery — Code 400/426/401/420', level:'MAJOR', authority:'USAREC', bar:false },
  { id:'major_property',      label:'Major Misconduct — Property/Financial',   group:'major',  sub:'Grand larceny ≥$500, burglary, embezzlement, grand theft — Code 418/405/415', level:'MAJOR', authority:'USAREC', bar:false },
  { id:'major_drug_possess',  label:'Major Drug Possession/Use (Non-Marijuana)',group:'major',  sub:'Cocaine, heroin, meth, fentanyl, etc. — Code 428 (marijuana explicitly excluded)', level:'MAJOR', authority:'USAREC', bar:false },
  { id:'major_identity',      label:'Identity Theft / Major Financial Crime',  group:'major',  sub:'Identity theft, major fraud, forgery — felony level — Code 417/419', level:'MAJOR', authority:'USAREC', bar:false },
  { id:'major_cybercrime',    label:'Cybercrime / Computer Fraud',             group:'major',  sub:'Unauthorized computer access, cyber fraud, hacking — felony level', level:'MAJOR', authority:'USAREC', bar:false },
  { id:'major_weapons_felon', label:'Weapons — Felony Level',                  group:'major',  sub:'Felony weapons charge, illegal firearm modification, armed robbery — Code 424', level:'MAJOR', authority:'USAREC', bar:false },
  { id:'major_other',         label:'Major Misconduct — Other Felony',         group:'major',  sub:'Any felony-level offense not listed above — Table 4-4, Code 441', level:'MAJOR', authority:'USAREC', bar:false },

  // ─── MISCONDUCT — BN CO LEVEL ────────────────────────────────────────
  { id:'misc_marijuana_single', label:'Marijuana Possession (Single Incident)', group:'misc', sub:'2026 AR 601-210 update — single conviction of possession or paraphernalia NO LONGER requires a waiver (para 4-6)', level:'MISC', authority:'NONE', bar:false, noWaiverRequired:true, noWaiverText:'Per March 2026 AR 601-210 Summary of Change (para 4-6): A single conviction for possession of marijuana or drug paraphernalia does NOT require a waiver. Document the offense on UF 601-210.08 and in the RZ. Multiple incidents or distribution still require processing.' },
  { id:'misc_marijuana',      label:'Marijuana Possession / Paraphernalia (Multiple or Distribution)', group:'misc', sub:'Two or more incidents, or any distribution/trafficking — requires waiver. Single incident now exempt per 2026 policy.', level:'MISC', authority:'BN', bar:false },
  { id:'misc_dui',            label:'DUI / Driving While Impaired',            group:'misc',   sub:'Table 4-3, Code 309 — most common waiver type', level:'MISC', authority:'BN', bar:false },
  { id:'misc_theft_minor',    label:'Petty Theft / Minor Fraud (Under $500)',  group:'misc',   sub:'Table 4-3, Code 310–311 — shoplifting, misdemeanor fraud', level:'MISC', authority:'BN', bar:false },
  { id:'misc_weapons',        label:'Weapons — Unlawful Carry / Concealed',    group:'misc',   sub:'Misdemeanor weapons offense — Table 4-3, Code 325', level:'MISC', authority:'BN', bar:false },
  { id:'misc_dv_non_laut',    label:'Domestic Violence — Non-Lautenberg',      group:'misc',   sub:'DV offense that does NOT trigger Lautenberg — Table 4-3, Code 308', level:'MISC', authority:'BN', bar:false },
  { id:'misc_assault_simple', label:'Simple Assault / Battery',                group:'misc',   sub:'Misdemeanor assault, no weapons, no serious injury — Code 302', level:'MISC', authority:'BN', bar:false },
  { id:'misc_mip_alcohol',    label:'Minor in Possession — Alcohol',           group:'misc',   sub:'MIP alcohol — Code 301 (different from DUI)', level:'MISC', authority:'BN', bar:false },
  { id:'misc_disorderly',     label:'Disorderly Conduct / Disturbing Peace',   group:'misc',   sub:'Misdemeanor public disturbance — Code 303', level:'MISC', authority:'BN', bar:false },
  { id:'misc_trespassing',    label:'Trespassing / Criminal Mischief',         group:'misc',   sub:'Misdemeanor property offense — Code 313', level:'MISC', authority:'BN', bar:false },
  { id:'misc_drug_paraph',    label:'Drug Paraphernalia (Non-Marijuana)',       group:'misc',   sub:'Possession of paraphernalia without drug — Code 316 variant', level:'MISC', authority:'BN', bar:false },
  { id:'misc_rx_drug',        label:'Prescription Drug Abuse / Misuse',        group:'misc',   sub:'Non-felony prescription drug offense — painkiller, benzo, etc.', level:'MISC', authority:'BN', bar:false },
  { id:'misc_restraining',    label:'Restraining / Protective Order Violation',group:'misc',   sub:'Violation of civil protective order — Code 308a', level:'MISC', authority:'BN', bar:false },
  { id:'misc_other',          label:'Misconduct — Other Nontraffic',           group:'misc',   sub:'Misdemeanor offense not listed above — Table 4-3, Code 330', level:'MISC', authority:'BN', bar:false },
  { id:'dat_positive',        label:'DAT Positive (MEPS / USMEPCOM)',          group:'misc',   sub:'Para 4-18 — 1st positive: BN; 2nd positive: permanent disqualification', level:'MISC', authority:'BN', bar:false },

  // ─── TRAFFIC ──────────────────────────────────────────────────────────
  { id:'traffic_above_minor', label:'Traffic — Above Minor',                   group:'traffic',sub:'Para 4-8 — speeding 20+ mph over, reckless driving, hit-and-run', level:'TRAFFIC', authority:'BN', bar:false },
  { id:'traffic_minor',       label:'Traffic — Minor Violation Only',          group:'traffic',sub:'Para 4-35 — minor traffic only, typically no waiver required; confirm with S1', level:'TRAFFIC', authority:'NONE', bar:false, noWaiverRequired:true, noWaiverText:'Minor traffic violations typically do NOT require a waiver (para 4-35). Confirm with battalion S1. If unsupervised probation only, applicant may still be processed.' },

  // ─── JUVENILE ─────────────────────────────────────────────────────────
  { id:'juvenile',            label:'Juvenile Offense (Under Age 18)',         group:'juvenile',sub:'Para 4-30(b)(5) — authority depends on offense type and disposition', level:'VARIES', authority:'BN', bar:false },

  // ─── PRIOR SERVICE ────────────────────────────────────────────────────
  { id:'ps_article15',        label:'Prior Service — Article 15 / NJP',       group:'ps',     sub:'Non-Judicial Punishment — PS applicants only; authority varies by severity', level:'VARIES', authority:'BN', bar:false },
  { id:'ps_court_martial',    label:'Prior Service — Court Martial',          group:'ps',     sub:'BCD or UOTHC discharge waiver — USAREC/DMPM depending on offense', level:'MAJOR', authority:'USAREC', bar:false },
  { id:'ps_adsep',            label:'Prior Service — Admin Separation',       group:'ps',     sub:'Admin sep for misconduct — verify RE code and separation authority', level:'VARIES', authority:'BN', bar:false },
  // ─── MAJOR MISCONDUCT — FINANCIAL & CYBER ────────────────────────────────────
  { id:'major_financial_fraud', label:'Financial Fraud / Embezzlement', group:'major', sub:'Large‑scale fraud, embezzlement, money laundering — Code 430', level:'MAJOR', authority:'USAREC', bar:false },
  { id:'major_cyber_hacking', label:'Cybercrime / Unauthorized Computer Access', group:'major', sub:'Computer fraud, hacking, unauthorized access — Code 432', level:'MAJOR', authority:'USAREC', bar:false },
  // ─── MAJOR MISCONDUCT — OTHER ───────────────────────────────────────────────────────
  { id:'major_identity_theft', label:'Identity Theft / Major Fraud', group:'major', sub:'Identity theft, major fraud, forgery — felony level — Code 417/419', level:'MAJOR', authority:'USAREC', bar:false },

  // ─── NEW: TERRORISTIC / EXTREMISM-RELATED THREATS (per AR 601-210 Table 4-4 + 4-2e) ─────
  { id:'major_terroristic_threats', label:'Terroristic Threats / Terrorist Threats (incl. Bomb Threats)', group:'major', sub:'AR 601-210 Table 4-4 — Threats of violence/terrorism, bomb threats, school threats. Treated as major misconduct. Triggers mandatory extremism/insider threat review (para 4-2e).', level:'MAJOR', authority:'DMPM', bar:false, triggersSuitabilityReview:true, extremismRelated:true },
  { id:'major_extremism_threat', label:'Extremism-Related Threat or Activity', group:'major', sub:'Active participation or threats tied to extremist/hate ideology (AR 600-20 + 601-210 4-2e). Often non-waivable if active support shown.', level:'MAJOR', authority:'DMPM', bar:false, triggersSuitabilityReview:true, extremismRelated:true },
  { id:'major_aggravated_stalking', label:'Aggravated Stalking / Felony Stalking', group:'major', sub:'Felony-level stalking, especially with threats or prior orders. Often overlaps with terroristic threats or DV.', level:'MAJOR', authority:'USAREC', bar:false, triggersSuitabilityReview:true },
  { id:'major_school_threat', label:'Threats Against School / Educational Institution', group:'major', sub:'School-specific terroristic or bomb threats (very common recent cases). Treated with extreme scrutiny under extremism and suitability policies.', level:'MAJOR', authority:'DMPM', bar:false, triggersSuitabilityReview:true, extremismRelated:true },
];

/* ── QUALIFYING QUESTIONS ─────────────────────────────────────────────────── */
window.QUALIFYING_QUESTIONS = [
  {
    id: 'is_adult',
    q: 'Was the applicant age 18 or older at the time of the offense?',
    hint: 'Juvenile offenses (under 18) are processed under AR 601-210, para 4-30(b)(5) and receive special consideration',
    options: [
      { v:'yes', l:'Yes — age 18 or older at time of offense' },
      { v:'no',  l:'No — under age 18 (juvenile) at time of offense' }
    ]
  },
  {
    id: 'disposition',
    q: 'What was the court disposition for the offense?',
    hint: 'Select the most accurate description. "Adverse disposition" includes deferred adjudication, diversion programs, or plea to a lesser charge — even if no conviction was entered.',
    options: [
      { v:'convicted',  l:'Convicted (guilty plea or verdict)' },
      { v:'adverse',    l:'Adverse Disposition — no conviction entered (deferred prosecution, diversion, plea to lesser)' },
      { v:'dismissed',  l:'Dismissed / Charges Dropped — no adverse disposition' },
      { v:'self_admit', l:'No Court Record — Self-Admittal only (no charge was ever filed)' }
    ]
  },
  {
    id: 'pending_charges',
    q: 'Are any criminal or juvenile charges currently pending against this applicant?',
    hint: 'AR 601-210, para 4-22g — ANY pending charges block ALL waiver processing until fully resolved. This includes charges in other states.',
    options: [
      { v:'yes', l:'Yes — one or more charges are currently pending' },
      { v:'no',  l:'No — all charges are fully resolved' }
    ]
  },
  {
    id: 'civil_restraint',
    q: 'Is the applicant currently under any form of civil restraint?',
    hint: 'Civil restraint = active confinement, parole, or supervised probation (para 4-22h). Exception: unsupervised probation for minor offenses per para 4-35.',
    options: [
      { v:'yes',        l:'Yes — currently confined, on parole, or under supervised probation' },
      { v:'unsupervised',l:'Unsupervised probation only (para 4-35 minor offense)' },
      { v:'no',         l:'No civil restraint of any kind' }
    ]
  },
  {
    id: 'major_count',
    q: 'How many total major misconduct (felony-level) convictions does the applicant have in their ENTIRE history?',
    hint: 'Count ALL felony-level convictions ever — not just the current offense. Include juvenile adjudications treated as felony equivalents. Two or more = permanent DQ (para 4-22i).',
    options: [
      { v:'0',     l:'None — no felony-level convictions' },
      { v:'1',     l:'One (1) — including the current offense' },
      { v:'2plus', l:'Two or more (2+) — permanent disqualification' }
    ]
  },
  {
    id: 'lautenberg',
    q: 'Does any offense involve domestic violence as defined by the Lautenberg Amendment (18 USC § 922(g)(9))?',
    hint: 'This covers ANY misdemeanor conviction for domestic violence — even old convictions, even expunged convictions in some states. If in doubt, check with JAG.',
    options: [
      { v:'yes', l:'Yes — convicted of a qualifying domestic violence offense' },
      { v:'no',  l:'No' }
    ]
  },
  {
    id: 'sex_offender',
    q: 'Does any offense require registration as a sex offender, or involve a sex crime listed in para 4-22j?',
    hint: 'Includes: rape, carnal knowledge, sodomy, indecent assault, pornography involving minors, prostitution involving minors. Also includes offenses in foreign countries.',
    options: [
      { v:'yes', l:'Yes — involves sex offense or registration requirement' },
      { v:'no',  l:'No' }
    ]
  },
  {
    id: 'confinement_days',
    q: 'Was the applicant confined (jailed) as a result of this offense?',
    hint: 'Para 4-31 — confinement length triggers mandatory waiting periods. Count actual days served, not suspended sentence length.',
    options: [
      { v:'15plus',  l:'Yes — confined 15 or more days (6-month waiting period)' },
      { v:'under15', l:'Yes — confined, but fewer than 15 days (3-month waiting period)' },
      { v:'no',      l:'No confinement served' }
    ]
  },
  {
    id: 'probation_minor',
    q: 'Is the applicant currently on unsupervised probation for a minor offense per AR 601-210, para 4-35?',
    hint: 'Para 4-35 minor offenses (minor traffic violations, minor misdemeanors with no confinement) — applicant CAN be processed and enlisted without waiting for probation to end.',
    options: [
      { v:'yes', l:'Yes — unsupervised probation for a para 4-35 minor offense' },
      { v:'no',  l:'No' }
    ]
  }
];

/* ── CHECKLIST ITEMS ──────────────────────────────────────────────────────── */
window.CHECKLIST_ITEMS = [
  {
    id:'live_scan', label:'Live Scan Results', validity:120, unit:'days', group:'all', ref:'UM 21-022',
    howto:'Schedule Live Scan at MEPS or an authorized civilian provider. Results are sent electronically to MEPS. Validity is 120 days from the date taken — plan your timeline accordingly. If expired, applicant must redo.',
    tip:'Common issue: applicant moved states — ensure Live Scan covers all states of residence.'
  },
  {
    id:'sex_off_check', label:'Sex Offender Check (IAW UM 21-022)', validity:null, unit:null, group:'all', ref:'UM 21-022',
    howto:'Conducted automatically through MEPS as part of the Live Scan process. Verify with your MEPS counselor that it has been completed and results are on file. You do NOT need to request this separately.',
    tip:'If applicant has lived in multiple states, ensure the check covers all states of residence.'
  },
  {
    id:'source_docs', label:'Source Documents (Birth Cert, Ed Docs, SSN Card, PS Records)', validity:null, unit:null, group:'all', ref:'Para 4-28',
    howto:'Collect certified copies: (1) Birth certificate — if foreign-born, passport or naturalization cert. (2) Education: HS diploma or official transcript. (3) SSN card or W-2 showing full SSN. (4) PS: DD-214 with all copies. Originals must be seen; copies retained.',
    tip:'Diplomas from closed schools: contact state education department for transcript verification.'
  },
  {
    id:'rz_complete', label:'RZ Complete — Q1, Q2, Q3 (all sections)', validity:null, unit:null, group:'all', ref:'Para 4-28',
    howto:'Complete the RZ (Background Interview) with the applicant. Q1 covers last 7 years. Q2 covers felonies, firearms, alcohol/drugs, and DV for the entire history. Q3 covers all traffic violations. Every "yes" answer requires documentation.',
    tip:'Do Q2 first for waiver cases — felony and DV disclosures govern the entire packet.'
  },
  {
    id:'police_rpt', label:'Police Incident Report (all non-traffic offenses)', validity:null, unit:null, group:'non_traffic', ref:'Para 4-28',
    note:'NOT required for traffic-only offenses',
    howto:'Contact the law enforcement agency that made the arrest (city PD, county sheriff, state police). Request a copy of the incident/arrest report for case #[X]. Most agencies charge $5–25. Allow 5–15 business days. If records destroyed, get a letter from the agency confirming destruction.',
    tip:'FOIA request may be needed if agency is initially unresponsive. Get everything in writing.'
  },
  {
    id:'court_info', label:'Court Docket — Information / Charging Document', validity:null, unit:null, group:'non_traffic', ref:'Para 4-28',
    howto:"Call the clerk of courts where the case was heard. Ask for 'certified copies of the charging document (information or indictment) for case number [X] in the matter of the State v. [Name].' Fees vary by county. If court is out of state, call during their business hours.",
    tip:"If court says records are sealed (juvenile), use UF 601-210.02 instead — do NOT skip this item."
  },
  {
    id:'court_finding', label:'Court Docket — Finding / Sentencing', validity:null, unit:null, group:'non_traffic', ref:'Para 4-28',
    howto:"Same clerk of courts request: 'I also need the judgment/finding and sentencing order for case number [X].' This is a separate document from the charging document. Both must be certified.",
    tip:'Deferred adjudication: get the deferral agreement AND any final dismissal/completion order.'
  },
  {
    id:'court_disp', label:'Court Docket — Final Disposition', validity:null, unit:null, group:'non_traffic', ref:'Para 4-28',
    howto:"Request: 'Finally, I need the final disposition order — the document showing what ultimately happened to the case (dismissed, convicted, fine paid, probation completed, etc.)' This may be the same document as the sentencing order or a separate final order.",
    tip:"If case is very old (10+ years), court may charge extra for archived record retrieval. Some counties use third-party services — verify authenticity."
  },
  {
    id:'uf_210_02', label:'UF 601-210.02 (In Lieu of Court Dockets)', validity:null, unit:null, group:'all', ref:'Para 4-28',
    howto:"Use this form ONLY when the court will not furnish required documents. The form requires the court's signature/stamp confirming they cannot provide records. Do NOT use as a shortcut — courts should always be the first attempt.",
    tip:'Sealed juvenile records are a valid use case. Get the court to complete Section II of the form.'
  },
  {
    id:'probation_docs', label:'Probation / Parole Officer Documents', validity:null, unit:null, group:'probation', ref:'Para 4-28(e)(2)',
    howto:"Contact the supervising probation/parole officer. Request a letter on official letterhead stating: (1) start/end dates of supervision, (2) offense for which supervising, (3) compliance status, (4) any violations. Officer's contact info must be included.",
    tip:'If probation is complete, get a "certificate of completion" or "discharge from probation" document.'
  },
  {
    id:'correction_docs', label:'Documents from Correctional Facility', validity:null, unit:null, group:'confined', ref:'Para 4-28(e)(3)',
    howto:"Contact the jail or prison where applicant was confined. Request: (1) official record of confinement dates (in/out), (2) disciplinary record during confinement, (3) any release documentation. Many facilities have a records request form.",
    tip:'County jails vs. state prisons have different records departments. Confirm which facility held the applicant.'
  },
  {
    id:'dd369', label:'DD 369s — Work, Live, School (last 3 yrs + offense locations)', validity:180, unit:'days', group:'all', ref:'Para 4-28',
    howto:'Complete a DD Form 369 for EVERY location where the applicant: (1) lived for the past 3 years, (2) worked for the past 3 years, (3) attended school for the past 3 years, AND (4) each location where a waiver-related offense occurred (even if outside 3-yr window). Each DD 369 must be submitted to the local law enforcement agency for that jurisdiction.',
    tip:'Validity is 180 days from the DATE SUBMITTED to the agency — not date returned. Track submission dates carefully.'
  },
  {
    id:'appl_statement', label:"Applicant's Written Statement (Newest to Oldest; Steps Taken to Overcome)", validity:null, unit:null, group:'all', ref:'Para 4-28',
    howto:"Applicant writes a personal statement addressing: (1) each offense, starting with most recent, (2) circumstances and context, (3) concrete steps taken since (education, employment, counseling, community service), (4) why they want to serve. Must be handwritten OR signed. NO generic templates — personalize every statement.",
    tip:'The statement is often the deciding factor for borderline cases. A vague or generic statement is a rejection risk. Coach applicant extensively.'
  },
  {
    id:'co_mfr', label:"Company Commander's Interview MFR", validity:null, unit:null, group:'all', ref:'Para 4-28',
    howto:"Schedule CO interview with applicant. CO completes the AR 25-50 formatted MFR with: (1) interview date, (2) summary of applicant's explanation, (3) assessment of character, (4) APPROVE or DISAPPROVE recommendation with justification. CO signs. Submit original — do NOT modify after CO signs.",
    tip:'CO must actually interview the applicant — a telephone interview is acceptable only with prior authorization.'
  },
  {
    id:'dd1966_sf86', label:'DD Form 1966 and SF 86 (Security Questionnaire)', validity:null, unit:null, group:'all', ref:'Para 4-28(e)(7)',
    howto:'DD Form 1966 is completed at MEPS. SF 86 is the security clearance questionnaire — available through eApp (OPM). Ensure all moral waiver offenses are disclosed on BOTH forms. Discrepancies between forms and the RZ are common rejection causes.',
    tip:'CRITICAL: Any offense requiring a waiver MUST also be disclosed on the SF 86. Omission = security violation risk.'
  },
  {
    id:'uf_210_08', label:'UF 601-210.08 (All Law Violations; Asterisk Waived Offenses)', validity:null, unit:null, group:'all', ref:'Para 4-28',
    howto:'List ALL law violations ever — not just the waiver offense. Use the Moral Waiver Builder PDF generator to auto-fill this form. Offenses requiring a waiver must be asterisked (*). Order: newest to oldest. Applicant signs at bottom.',
    tip:'Most common rejection reason: offense listed on RZ but missing from 210.08, or not asterisked.'
  },
  {
    id:'dd370', label:'DD Form 370 — Request for Reference (3 required)', validity:null, unit:null, group:'usarec_dmpm', ref:'Para 4-28(e)(4)',
    note:'NOT required at BN level — USAREC and DMPM only',
    howto:'Three references required: (1) employer references covering the year prior to application, (2) school references covering 3 years prior. Each completes DD 370 independently and mails/returns directly. References must know the applicant personally and be able to speak to character.',
    tip:'References should be aware of the waiver situation — vague references that cannot speak to the offense context weaken the packet.'
  },
  {
    id:'dd2808', label:'DD Form 2808 (Genesis Report / MEPS Physical)', validity:null, unit:null, group:'major', ref:'Para 4-28(e)(5)',
    note:'Required for ALL major misconduct waivers',
    howto:'Completed at MEPS during the medical examination. The Genesis Report is the electronic record created from the MEPS physical. Ensure MEPS has all relevant medical and mental health history disclosed.',
    tip:'Drug-related waivers: ensure any treatment or counseling history is documented in the physical.'
  },
  {
    id:'dd2807_2', label:'DD Form 2807-2 (Accession Medical Prescreen)', validity:null, unit:null, group:'major_applicable', ref:'Para 4-28',
    howto:'Completed by the recruiter with the applicant prior to MEPS. Captures medical history including any substance abuse treatment, mental health treatment, or physical conditions related to the offense.',
    tip:'Do not leave any field blank — write "None" or "N/A" where applicable.'
  },
  {
    id:'fl_210_04', label:'USAREC FL 601-210.04 (Request for Info from Institution — 24+ hr confinement)', validity:null, unit:null, group:'confined_24plus', ref:'Para 4-28',
    note:'Required when applicant was confined 24 hours or more',
    howto:'Submit FL 601-210.04 to the correctional facility to request official records of the confinement period. Facility completes and returns the form. Allow 2–4 weeks.',
    tip:'Do this EARLY — correctional facilities are often slow to respond. Follow up weekly.'
  },
];

/* ── MOS RESTRICTIONS ────────────────────────────────────────────────────── */
window.MOS_RESTRICTIONS = [
  // Intelligence / Security
  {
    group: 'Intelligence / MI',
    mos: ['35F','35L','35M','35N','35P','35Q','35S','35T','35U','35X','35Y','35Z','18F','37F'],
    label: 'Intelligence & HUMINT',
    notes: 'No drug distribution convictions. DUI within 3 years generally disqualifying for clearance. Any drug conviction (including marijuana) complicates TS/SCI adjudication. DMPM waivers extremely rare.',
    authOverride: null,
    restrictions: ['No drug distribution waiver','DUI caution — clearance risk','Drug conviction complicates TS/SCI','Background investigation required'],
    severity: 'high'
  },
  // Aviation
  {
    group: 'Aviation',
    mos: ['15A','15B','15C','15D','15E','15F','15G','15H','15J','15K','15M','15N','15P','15Q','15R','15S','15T','15U','15V','15W','15X','15Y','15Z'],
    label: 'Aviation (Pilot & Crew)',
    notes: 'FAA medical certificate required. DUI/DWI history typically requires FAA Special Issuance. Drug offense history may prevent FAA class I/II medical. Coordinate with Aviation Branch.',
    authOverride: null,
    restrictions: ['FAA medical cert required','DUI/DWI — FAA Special Issuance process','Drug offense — FAA medical risk','Coordinate waiver with Aviation Branch'],
    severity: 'high'
  },
  // Special Forces / SF
  {
    group: 'Special Operations',
    mos: ['18A','18B','18C','18D','18E','18F','18X','37F','38A','38B','79S'],
    label: 'Special Forces / Special Operations',
    notes: 'Waivers for major misconduct virtually never approved for SF candidates. BN-level waivers for minor offenses reviewed more strictly. DUI within 3 years typically disqualifying for SF pipeline.',
    authOverride: null,
    restrictions: ['Major misconduct waiver rarely approved for SF','DUI within 3 yrs — SF pipeline risk','Stricter character assessment required'],
    severity: 'high'
  },
  // Nuclear / Sensitive
  {
    group: 'Nuclear / Personnel Reliability',
    mos: ['13M','55B','55D','55E','55G','92A'],
    label: 'Nuclear / Sensitive Material (PRP)',
    notes: 'Personnel Reliability Program (PRP) positions. Drug conviction is virtually automatic PRP disqualification. DUI and financial misconduct also problematic. Coordinate with unit PRP program manager.',
    authOverride: null,
    restrictions: ['Drug conviction = PRP disqualification','DUI/DWI — PRP risk','Financial misconduct — PRP risk','Coordinate with PRP program manager'],
    severity: 'high'
  },
  // Medical
  {
    group: 'Medical / Healthcare',
    mos: ['68A','68B','68C','68D','68E','68F','68G','68H','68J','68K','68L','68M','68N','68P','68Q','68R','68S','68T','68U','68V','68W','68X','68Z','65A','65B','65C','65D'],
    label: 'Medical (68 series)',
    notes: 'Drug convictions may affect state professional licensing. DUI related to substance abuse patterns scrutinized heavily. Prior prescription drug abuse especially relevant.',
    authOverride: null,
    restrictions: ['Drug conviction may affect state licensure','Substance abuse pattern scrutinized','Rx drug abuse — medical credential risk'],
    severity: 'medium'
  },
  // Finance / Legal
  {
    group: 'Finance / Legal',
    mos: ['27A','27D','36A','36B','36C','36D'],
    label: 'Finance / JAG',
    notes: 'Financial crimes (theft, fraud, identity theft) are particularly problematic. Security clearance required for finance positions.',
    authOverride: null,
    restrictions: ['Financial crime = high clearance risk','Identity theft/fraud — likely disqualifying','Security clearance required'],
    severity: 'medium'
  },
  // Cyber
  {
    group: 'Cyber / Signal',
    mos: ['17A','17B','17C','17E','25A','25B','25D','25E','25F','25H','25L','25M','25N','25P','25Q','25R','25S','25T','25U','25V','25W','25X','25Z'],
    label: 'Cyber / Signal',
    notes: 'Cybercrime convictions are essentially disqualifying for cyber MOSs. TS/SCI typically required. All clearance-related offense risks apply.',
    authOverride: null,
    restrictions: ['Cybercrime conviction — likely disqualifying','TS/SCI required — drug/DV history risks','Coordinate with signal career manager'],
    severity: 'high'
  },
  // Law Enforcement
  {
    group: 'Law Enforcement',
    mos: ['31A','31B','31D','31E','31K'],
    label: 'Military Police / CID',
    notes: 'Law enforcement MOSs require higher character standards. Drug and violent offense waivers extremely rare. DUI waivers reviewed carefully by MP career manager.',
    authOverride: null,
    restrictions: ['Drug/violent waiver extremely rare for MP','DUI — reviewed by MP career manager','Higher character standard required'],
    severity: 'high'
  },
  // Infantry / Combat
  {
    group: 'Infantry / Combat Arms',
    mos: ['11A','11B','11C','11X','12A','12B','12C','12D','12E','12G','12H','12K','12M','12N','12P','12Q','12R','12T','12W','12Y','12Z','13A','13B','13F','13J','13M','13R','14A','14E','14G','14H','14J','14P','14S','14T'],
    label: 'Combat Arms (11, 12, 13, 14 series)',
    notes: 'Generally more flexible waiver approval for BN-level offenses. Major misconduct still requires USAREC. Weapons convictions reviewed carefully for 11/12 series.',
    authOverride: null,
    restrictions: ['Weapons felony — clearance and MOS conflict','Combat arms generally more waiver-flexible','Violent offense history reviewed for fitness'],
    severity: 'low'
  },
];

/* ── APPROVABILITY FACTORS ────────────────────────────────────────────────── */
window.APPROVABILITY_FACTORS = {
  // Score modifiers: positive = more likely approved, negative = less likely
  timeFactors: [
    { yearsAgo: 0.5, mod: -30, label: 'Very recent (under 6 months)' },
    { yearsAgo: 1,   mod: -20, label: 'Recent (6–12 months)' },
    { yearsAgo: 2,   mod: -10, label: '1–2 years ago' },
    { yearsAgo: 3,   mod:   0, label: '2–3 years ago' },
    { yearsAgo: 5,   mod:  10, label: '3–5 years ago' },
    { yearsAgo: 7,   mod:  20, label: '5–7 years ago' },
    { yearsAgo: 99,  mod:  25, label: '7+ years ago' },
  ],
  authorityMods: { BN: 20, USAREC: 0, DMPM: -25 },
  offenseCountMods: { 1: 15, 2: -10, 3: -20, '4+': -35 },
  afqtMods: [
    { min:65, mod:15, label:'AFQT 65+ (strong candidate)' },
    { min:50, mod:5,  label:'AFQT 50–64' },
    { min:31, mod:0,  label:'AFQT 31–49' },
    { min:0,  mod:-10,label:'AFQT below 31' },
  ],
  educationMods: {
    'Graduate Degree': 20,
    'Bachelors Degree': 15,
    'Associates Degree': 10,
    'Some College (No Degree)': 5,
    'HS Diploma': 0,
    'GED': -5,
    'No HS Diploma / No GED': -15,
  },
  dispositionMods: {
    adverse:   10, // no conviction entered
    convicted: 0,
    self_admit:15, // no record at all
  },
  juvenileMod: 15,   // bonus if offense was as a juvenile
  firstOffenseMod: 10, // bonus for no prior history
};

/* ── SAMPLE SCENARIOS ────────────────────────────────────────────────────── */
window.SAMPLE_SCENARIOS = [
  {
    id:'s1', title:'Bar Fight — Simple Assault', tag:'BN CO · Typical Misconduct',
    applicant:{ lastName:'Applicant', firstName:'John', mi:'M', ssn:'000-00-0001', dob:'2001-03-15', rsid:'RS0001', educationLevel:'HS Diploma', educationCode:'2A', afqt:'52', psNps:'NPS', maritalStatus:'Single', numDependents:'0' },
    offenses:[{ id:'o1', date:'2022-06-10', description:'Simple Assault — altercation outside a bar, no weapons', city:'Columbus', county:'Franklin', state:'OH', disposition:'Convicted — Misdemeanor, $250 fine, 12-month unsupervised probation', courtDocs:true, incidentRpt:true, waivedOffense:true }],
    screening:{ offenseId:'misc_assault_simple', is_adult:'yes', disposition:'convicted', pending_charges:'no', civil_restraint:'no', major_count:'0', lautenberg:'no', sex_offender:'no', confinement_days:'no', probation_minor:'no' }
  },
  {
    id:'s2', title:'DUI — Most Common Waiver', tag:'BN CO · Classic Case',
    applicant:{ lastName:'Sample', firstName:'Jane', mi:'K', ssn:'000-00-0002', dob:'2000-08-22', rsid:'RS0002', educationLevel:'Some College (No Degree)', educationCode:'4E', afqt:'61', psNps:'NPS', maritalStatus:'Single', numDependents:'0' },
    offenses:[{ id:'o2', date:'2023-01-14', description:'DUI — BAC 0.09, no accident, no injury, routine traffic stop', city:'Nashville', county:'Davidson', state:'TN', disposition:'Convicted — Misdemeanor, $500 fine, 6-month suspended license, 12-month unsupervised probation', courtDocs:true, incidentRpt:true, waivedOffense:true }],
    screening:{ offenseId:'misc_dui', is_adult:'yes', disposition:'convicted', pending_charges:'no', civil_restraint:'no', major_count:'0', lautenberg:'no', sex_offender:'no', confinement_days:'no', probation_minor:'no' }
  },
  {
    id:'s3', title:'Juvenile Grand Theft', tag:'USAREC CG · Felony Equivalent',
    applicant:{ lastName:'Recruit', firstName:'Marcus', mi:'T', ssn:'000-00-0003', dob:'2003-11-05', rsid:'RS0003', educationLevel:'HS Diploma', educationCode:'2A', afqt:'58', psNps:'NPS', maritalStatus:'Single', numDependents:'0' },
    offenses:[{ id:'o3', date:'2019-09-03', description:'Grand Theft — shoplifting $620 merchandise, committed at age 16', city:'Phoenix', county:'Maricopa', state:'AZ', disposition:'Adjudicated Juvenile — adverse disposition, 60 hrs community service, no confinement', courtDocs:true, incidentRpt:true, waivedOffense:true }],
    screening:{ offenseId:'juvenile', is_adult:'no', disposition:'adverse', pending_charges:'no', civil_restraint:'no', major_count:'0', lautenberg:'no', sex_offender:'no', confinement_days:'no', probation_minor:'no' }
  },
  {
    id:'s4', title:'Marijuana Possession x2', tag:'USAREC CG · Multiple Same-Type',
    applicant:{ lastName:'Test', firstName:'Alex', mi:'R', ssn:'000-00-0004', dob:'1999-04-17', rsid:'RS0004', educationLevel:'GED', educationCode:'6A', afqt:'44', psNps:'NPS', maritalStatus:'Single', numDependents:'0' },
    offenses:[
      { id:'o4a', date:'2021-07-22', description:'Marijuana possession — approx 5g personal use', city:'Atlanta', county:'Fulton', state:'GA', disposition:'Convicted — Misdemeanor, $200 fine', courtDocs:true, incidentRpt:true, waivedOffense:true },
      { id:'o4b', date:'2020-03-11', description:'Marijuana possession — paraphernalia (pipe)', city:'Atlanta', county:'Fulton', state:'GA', disposition:'Convicted — Misdemeanor, $100 fine', courtDocs:true, incidentRpt:true, waivedOffense:true }
    ],
    screening:{ offenseId:'misc_marijuana', is_adult:'yes', disposition:'convicted', pending_charges:'no', civil_restraint:'no', major_count:'0', lautenberg:'no', sex_offender:'no', confinement_days:'no', probation_minor:'no' }
  },
  {
    id:'s5', title:'Drug Distribution — Felony', tag:'DMPM · Highest Level',
    applicant:{ lastName:'Candidate', firstName:'Chris', mi:'D', ssn:'000-00-0005', dob:'1997-12-30', rsid:'RS0005', educationLevel:'HS Diploma', educationCode:'2A', afqt:'67', psNps:'NPS', maritalStatus:'Single', numDependents:'0' },
    offenses:[{ id:'o5', date:'2020-11-08', description:'Felony drug distribution — cannabis, 28g, exchange for cash', city:'Houston', county:'Harris', state:'TX', disposition:'Convicted — Felony, 18-month supervised probation completed Jan 2022, no confinement', courtDocs:true, incidentRpt:true, waivedOffense:true }],
    screening:{ offenseId:'major_drug_dist', is_adult:'yes', disposition:'convicted', pending_charges:'no', civil_restraint:'no', major_count:'1', lautenberg:'no', sex_offender:'no', confinement_days:'no', probation_minor:'no' }
  },
  {
    id:'s6', title:'DUI + Minor Theft — Multi-Offense', tag:'BN CO · Multi-Offense Example',
    applicant:{ lastName:'Johnson', firstName:'Tyler', mi:'A', ssn:'000-00-0006', dob:'2000-06-12', rsid:'RS0006', educationLevel:'HS Diploma', educationCode:'2A', afqt:'55', psNps:'NPS', maritalStatus:'Single', numDependents:'0' },
    offenses:[
      { id:'o6a', date:'2022-09-17', description:'DUI — BAC 0.11, traffic stop, no accident', city:'Tampa', county:'Hillsborough', state:'FL', disposition:'Convicted — Misdemeanor, $750 fine, 1-year probation', courtDocs:true, incidentRpt:true, waivedOffense:true },
      { id:'o6b', date:'2020-04-03', description:'Petty theft — shoplifting $85 merchandise from Walmart', city:'Tampa', county:'Hillsborough', state:'FL', disposition:'Deferred adjudication — 6 months, completed community service, case dismissed', courtDocs:true, incidentRpt:true, waivedOffense:false }
    ],
    screening:{ offenseId:'misc_dui', is_adult:'yes', disposition:'convicted', pending_charges:'no', civil_restraint:'no', major_count:'0', lautenberg:'no', sex_offender:'no', confinement_days:'no', probation_minor:'no' }
  },
  {
    id:'s7', title:'Confinement + Waiting Period', tag:'BN CO · 6-Month Wait',
    applicant:{ lastName:'Rivera', firstName:'Carlos', mi:'E', ssn:'000-00-0007', dob:'1998-02-28', rsid:'RS0007', educationLevel:'HS Diploma', educationCode:'2A', afqt:'49', psNps:'NPS', maritalStatus:'Single', numDependents:'1', dependentAges:'2' },
    offenses:[{ id:'o7', date:'2023-06-01', description:'Aggravated assault — fight resulting in injury, no weapons, sentenced to 30 days county jail', city:'Charlotte', county:'Mecklenburg', state:'NC', disposition:'Convicted — Misdemeanor upgraded, 30 days served, 2-year probation', courtDocs:true, incidentRpt:true, waivedOffense:true }],
    screening:{ offenseId:'misc_assault_simple', is_adult:'yes', disposition:'convicted', pending_charges:'no', civil_restraint:'unsupervised', major_count:'0', lautenberg:'no', sex_offender:'no', confinement_days:'15plus', probation_minor:'no' }
  },
];

/* ── PARAGRAPH TEXT ───────────────────────────────────────────────────────── */
window.PARA_TEXT = {
  '4-22b':  'Persons who are, or have been, alcohol dependent are not eligible to enlist unless they have been in sustained remission for at least 12 consecutive months prior to enlistment.',
  '4-22c':  'Persons who are, or have been, drug dependent (including marijuana) are not eligible to enlist unless they have been in sustained remission for at least 12 consecutive months prior to enlistment.',
  '4-22g':  'Applicant with any pending criminal or juvenile charge, including referral to or pending action by a juvenile authority, is ineligible for enlistment. Processing may not begin until all charges are fully resolved.',
  '4-22h':  'Applicant currently under civil restraint — defined as confinement, parole, or probation — is ineligible for enlistment processing. Exception: unsupervised probation for minor offenses listed in paragraph 4-35 may be processed.',
  '4-22i':  'Applicants who have been convicted of two or more offenses classified as major misconduct are permanently disqualified. No waiver authority exists at any level.',
  '4-22j':  'Persons convicted of rape, carnal knowledge, sodomy, prostitution involving a minor, indecent assault, pornography involving a minor, or any offense that required registration as a sex offender are permanently disqualified.',
  '4-22k':  'Persons convicted of murder (intentional homicide) are permanently disqualified. No waiver authority exists.',
  '4-27':   'A waiver approval is valid for 6 months from the date of approval. If the applicant acquires additional moral disqualifications after approval, the waiver must be resubmitted for reconsideration.',
  '4-28':   "Prior to waiver submission, the recruiter will collect: (a) all source documents; (b) police incident report for all non-traffic offenses; (c) court documents — information/charging, finding/sentencing, final disposition; (d) DD 369s for work, live, and school locations covering the past 3 years plus all locations where offenses occurred (must be under 6 months old); (e) applicant's written statement; (f) company commander's interview MFR; (g) DD Form 1966 and SF 86; (h) UF 601-210.08 with all law violations listed and asterisks next to offense(s) being waived.",
  '4-28e4': 'At USAREC and DMPM levels: DD Form 370 (Request for Reference) is required — 3 references from employers covering 1 year prior to application and from schools attended in the 3 years prior. NOT required at BN level.',
  '4-28e5': 'For major misconduct waivers: DD Form 2808 (Genesis Report / MEPS physical) is required.',
  '4-30':   'When no court record of a specific offense exists and there is no adverse disposition, a waiver is not required. For self-admittal cases with no court record, an exception to policy may be required before a waiver can be submitted.',
  '4-31':   'Mandatory waiting periods following release from confinement: (a) Confinement under 15 days — 3-month wait (BN CO may waive up to 45 days of this period); (b) Confinement 15 days or more — 6-month wait (BN CO may waive up to 3 months of this period). All court-ordered requirements must be completed before waiver submission.',
  '4-35':   'Persons on unsupervised probation for minor offenses as designated by the CG, USAREC (including minor traffic violations, minor misdemeanors with no confinement imposed) may be processed and enlisted without waiting for the probationary period to expire.',
  '4-18':   'Drug and Alcohol Testing (DAT) — First positive test at MEPS: waiver required, BN CO authority. Second positive test: permanent disqualification with no waiver authority. Applicant must wait 90 days after a positive test before retesting.',
  '4-8':    'Traffic violations above minor level (speeding 20+ mph over posted limit, reckless driving, vehicular homicide, hit-and-run, driving on suspended/revoked license) require a waiver at the BN CO level. Accumulated minor traffic violations (3 or more in one year) also require a waiver.',
};

/* ── EDUCATION LEVELS ─────────────────────────────────────────────────────── */
window.ED_LEVELS = [
  'No HS Diploma / No GED',
  'GED',
  'HS Diploma',
  'Some College (No Degree)',
  'Associates Degree',
  'Bachelors Degree',
  'Graduate Degree'
];

/* ── US STATES ────────────────────────────────────────────────────────────── */
window.US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
];

/* ── SCREENER → PARA HIGHLIGHT MAPS ──────────────────────────────────────── */
window.CAT_PARA_MAP = {
  bar_lautenberg:        ['4-22j'],
  bar_sex_offense:       ['4-22j'],
  bar_murder:            ['4-22k'],
  bar_2plus_major:       ['4-22i'],
  misc_dui:              ['4-8','4-28'],
  misc_marijuana_single: ['4-18'],
  misc_marijuana:        ['4-18','4-28'],
  dat_positive:          ['4-18'],
  traffic_minor:         ['4-35'],
  traffic_above_minor:   ['4-8'],
  juvenile:              ['4-30'],
  major_drug_dist:       ['4-28e5','4-28'],
  ps_court_martial:      ['4-28e5','4-28'],
};

window.Q_PARA_MAP = {
  is_adult:        ['4-30'],
  disposition:     ['4-30'],
  pending_charges: ['4-22g'],
  civil_restraint: ['4-22h','4-35'],
  major_count:     ['4-22i'],
  lautenberg:      ['4-22j'],
  sex_offender:    ['4-22j'],
  confinement_days:['4-31'],
  probation_minor: ['4-35'],
};

})();
