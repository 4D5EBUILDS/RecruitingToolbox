(function () {

/* ════════════════════════════════════════════════════════════════════════
   MORAL WAIVER BUILDER — DATA FILE
   Regulation basis: AR 601-210, 20 March 2026 (effective 20 April 2026)
   All table codes and paragraph cites verified against the source PDF.
   ════════════════════════════════════════════════════════════════════════ */

window.REG_VERSION = 'AR 601-210, 20 March 2026 (effective 20 April 2026)';

/* ── OFFENSE CATEGORIES ──────────────────────────────────────────────────
   class:  'bar'    → not waivable when convicted/adverse (engine hard stop)
           'major'  → Table 4-4 (felony level) — CG USARD, 24-month wait (4-7a)
           'misc'   → Table 4-3 (misdemeanor level) — count-based per 4-6a
           'minor'  → Table 4-2 (minor nontraffic) — waiver only at 5+ (4-6a(1))
           'traffic'→ Table 4-1 (minor traffic) — no waiver
           'dat'    → MEPS drug/alcohol test (4-18)
           'ps'     → prior-service military discipline (4-12c, RE-code rules)
   singleWaiver:   a SINGLE conviction/adverse disposition requires a waiver (4-6a(4))
   noWaiverSingle: a single conviction requires NO waiver (2026 marijuana change)
   dui / drugPossession: feed the 4-7c(4)/(6) 3-year counting rules
   suitability: {level, cite} — 4-2f(2)(a) suitability review trigger,
                applies REGARDLESS of disposition
─────────────────────────────────────────────────────────────────────────── */
window.OFFENSE_CATEGORIES = [

  // ─── ABSOLUTE BARS (conviction/adverse disposition = permanent DQ) ──────
  { id:'bar_lautenberg', label:'Domestic Violence — Lautenberg Conviction', group:'bars', class:'bar',
    sub:'Qualifying misdemeanor DV conviction (18 USC 922) — Table 4-4, Code 414',
    barPara:'para 4-7b · Table 4-4, Code 414',
    barText:'Qualifying misdemeanor conviction for domestic violence (use or attempted use of physical force, or threatened deadly weapon, by a current/former spouse, parent, guardian, cohabitant, or similarly situated person). Enlistment is prohibited and no waivers will be approved at any level.',
    suitability:{ level:'USARD', cite:'4-2f(2)(a)5' } },

  { id:'bar_sex_offense', label:'Sex Offense / Sex Offender Registration', group:'bars', class:'bar',
    sub:'Rape, sexual abuse/assault, incest, other sex offense, or any registry listing',
    barPara:'para 4-22j / 4-7d',
    barText:'Conviction (including juvenile adjudication of guilt) for a felony sex crime, or any disposition requiring sex offender registration, or current/past listing on any Federal or State registry — permanently disqualified. No waivers are authorized.',
    suitability:{ level:'USARD', cite:'4-2f(2)(a)6' } },

  { id:'bar_murder', label:'Murder / Intentional Homicide', group:'bars', class:'bar',
    sub:'Table 4-4, Code 427 — permanent disqualification at all levels',
    barPara:'para 4-22k',
    barText:'Persons with a conviction of murder are permanently disqualified. No waiver authority exists at any level.' },

  { id:'bar_drug_distribution', label:'Drug Sale / Distribution / Trafficking (incl. "intent to")', group:'bars', class:'bar',
    sub:'Cannabis or ANY controlled substance — Table 4-4, Code 436. Conviction/adverse disposition = NOT waivable',
    barPara:'para 4-7c(3) · Table 4-4, Code 436',
    barText:'A waiver may not be considered for a conviction or other adverse disposition for sale, distribution, or trafficking (including "intent to") of cannabis (marijuana) or any other controlled substance. If charges were DISMISSED with no adverse disposition, no waiver is required — but a major misconduct charge still triggers a CG USARD suitability review regardless of disposition.',
    suitability:{ level:'USARD', cite:'4-2f(2)(a)3' } },

  // ─── MAJOR MISCONDUCT — Table 4-4 → CG USARD, 24-month wait ────────────
  { id:'major_violent', label:'Major Misconduct — Violent Offense', group:'major', class:'major',
    sub:'Aggravated assault (400), manslaughter (426), robbery (435), carjacking (406), kidnapping (424), arson (401)' },

  { id:'major_property', label:'Major Misconduct — Burglary / Grand Theft', group:'major', class:'major',
    sub:'Burglary (405), breaking & entering (403), grand larceny ≥$500 (418), grand theft auto (419), stolen property ≥$500 (438)' },

  { id:'major_fraud', label:'Major Misconduct — Fraud / Financial (Felony)', group:'major', class:'major',
    sub:'Embezzlement (415), forgery (417), extortion (416), fraud/credit card ≥$500 (421), worthless checks >$500 (409)' },

  { id:'major_drug_possess', label:'Major Drug Possession / Use (Non-Marijuana)', group:'major', class:'major', drugPossession:true,
    sub:'Narcotics or habit-forming drugs, wrongful possession or use — Code 428 ("marijuana not included")' },

  { id:'major_weapons', label:'Major Misconduct — Weapons (Felony)', group:'major', class:'major',
    sub:'Firearm on school grounds (408), bomb/explosive materials (431), felony weapons offenses',
    suitability:{ level:'USARD', cite:'4-2f(2)(a)7' } },

  { id:'major_terrorist_threats', label:'Terrorist Threats (incl. Bomb / School Threats)', group:'major', class:'major',
    sub:'Table 4-4, Code 439 — treated as major misconduct; suitability review required regardless of disposition',
    suitability:{ level:'USARD', cite:'4-2f(2)(a)3 & (a)7' } },

  { id:'major_other', label:'Major Misconduct — Other Felony', group:'major', class:'major',
    sub:'Any felony not listed: hate crimes (420), riot (434), perjury (430), vehicular homicide (429), other (441)' },

  // ─── MISCONDUCT — Table 4-3 (misdemeanor level) ─────────────────────────
  { id:'misc_dui', label:'DUI / DWI / Driving Impaired', group:'misc', class:'misc', dui:true, singleWaiver:true,
    sub:'Table 4-3, Code 309 — a SINGLE conviction requires a BN CO waiver (4-6a(4)(a)). Most common waiver type' },

  { id:'misc_marijuana_possess', label:'Marijuana / Paraphernalia Possession', group:'misc', class:'misc', drugPossession:true, noWaiverSingle:true,
    sub:'Table 4-3, Code 316 — 2026 change: a SINGLE conviction requires NO waiver (4-6a). Two or more = BN CO waiver. Negative MEPS drug test required' },

  { id:'misc_dv_non_laut', label:'Domestic Violence — Non-Lautenberg', group:'misc', class:'misc', singleWaiver:true,
    sub:'Table 4-3, Code 308 — single conviction requires BN CO waiver (4-6a(4)(c)) + CG USARD suitability review',
    suitability:{ level:'USARD', cite:'4-2f(2)(a)4' } },

  { id:'misc_prostitution', label:'Prostitution / Solicitation', group:'misc', class:'misc', singleWaiver:true,
    sub:'Table 4-3, Code 317 — single conviction requires BN CO waiver (4-6a(4)(b))',
    suitability:{ level:'USARD', cite:'4-2f(2)(a)6' } },

  { id:'misc_assault', label:'Assault / Fighting / Battery (Misdemeanor)', group:'misc', class:'misc',
    sub:'Table 4-3, Code 300 — fine/restitution OVER $500 or confinement ordered. If $500 or less and no confinement, use "Simple Assault" under Minor Nontraffic instead' },

  { id:'misc_theft_minor', label:'Larceny / Theft / Fraud (Under $500)', group:'misc', class:'misc',
    sub:'Larceny <$500 (311), credit/bank card fraud <$500 (310), stolen property received <$500 (322)' },

  { id:'misc_weapons', label:'Weapons — Unlawful Carry / Concealed Firearm', group:'misc', class:'misc',
    sub:'Unlawful carrying of firearms or carrying concealed firearm (325); selling or leasing weapons (321)' },

  { id:'misc_trespass', label:'Criminal Trespass / Unlawful Entry', group:'misc', class:'misc',
    sub:'Criminal trespass (306), unlawful entry (326). Simple/non-criminal trespass is minor nontraffic (237)' },

  { id:'misc_vandalism', label:'Vandalism / Criminal Mischief (Over $500)', group:'misc', class:'misc',
    sub:'Vandalism >$500 or confinement (328); criminal mischief >$500 or confinement (305)' },

  { id:'misc_resist', label:'Resisting Arrest / Eluding Police / Reckless Endangerment', group:'misc', class:'misc',
    sub:'Resisting arrest or eluding police (320); reckless endangerment (319)' },

  { id:'misc_driving', label:'Reckless Driving (Fine ≥$300) / Hit-and-Run', group:'misc', class:'misc',
    sub:'Reckless/careless driving with fine ≥$300 or confinement (318); leaving scene of accident / hit-and-run (312). Reckless driving under $300 fine = minor traffic' },

  { id:'misc_harassment', label:'Electronic Harassment / Threats (Misdemeanor)', group:'misc', class:'misc',
    sub:'Use of telephone, internet, or electronic means to abuse, annoy, harass, threaten, or torment (327)' },

  { id:'misc_other', label:'Misconduct — Other Misdemeanor', group:'misc', class:'misc',
    sub:'Any misdemeanor-level offense not listed — Table 4-3, Code 330' },

  // ─── MINOR NONTRAFFIC — Table 4-2 (waiver only at 5 or more) ────────────
  { id:'minor_assault_simple', label:'Simple Assault (Fine ≤$500, No Confinement)', group:'minor', class:'minor',
    sub:'Table 4-2, Code 201 — simple assault with fine/restitution of $500 or less and no confinement ordered' },

  { id:'minor_disorderly', label:'Disorderly Conduct / Disturbing the Peace / Drunk in Public', group:'minor', class:'minor',
    sub:'Disorderly conduct (210), disturbing the peace (211), drunk in public (213). On the para 4-35 unsupervised-probation list' },

  { id:'minor_mip', label:'Minor in Possession — Alcohol / Tobacco', group:'minor', class:'minor',
    sub:'Table 4-2, Code 231 — purchase, possession, or consumption by a minor. On the para 4-35 list' },

  { id:'minor_trespass_simple', label:'Simple Trespass / Loitering / Littering / Curfew', group:'minor', class:'minor',
    sub:'Simple trespass (237), loitering (227), littering (226), curfew violation (206)' },

  { id:'minor_harassment', label:'Harassment / Menacing / Stalking (Non-Felony)', group:'minor', class:'minor',
    sub:'Table 4-2, Code 219 — misdemeanor harassment, menacing, or stalking. Felony stalking = major misconduct' },

  { id:'minor_other', label:'Minor Nontraffic — Other', group:'minor', class:'minor',
    sub:'Any other Table 4-2 offense (fare evasion, gambling, unlawful assembly, public nuisance, etc.)' },

  // ─── TRAFFIC — Table 4-1 ────────────────────────────────────────────────
  { id:'traffic_minor', label:'Minor Traffic Violation(s)', group:'traffic', class:'traffic',
    sub:'Table 4-1 — no waiver required. CAUTION: UNPAID tickets count as pending charges (4-22g) and stop processing until paid' },

  // ─── MEPS DRUG / ALCOHOL TEST (para 4-18) ───────────────────────────────
  { id:'dat_mj_first', label:'DAT Positive #1 — Marijuana or Alcohol', group:'dat', class:'dat', datRetestDays:90,
    sub:'First positive at MEPS — BN CO waiver; must wait 90 days from test date before retest (4-18b(1))' },

  { id:'dat_other_first', label:'DAT Positive #1 — Cocaine / Other Drug', group:'dat', class:'dat', datRetestDays:365,
    sub:'First positive for cocaine or any other tested drug (excluding marijuana) — BN CO waiver; 1-YEAR wait from test date before retest (4-18b(2))' },

  { id:'dat_second', label:'DAT Positive #2 — Any Substance', group:'dat', class:'bar',
    sub:'Second positive test — PERMANENT disqualification from all Army components',
    barPara:'para 4-18b',
    barText:'A second positive drug or alcohol test at MEPS permanently disqualifies the applicant from enlisting in all Army components. No waiver authority exists.' },

  // ─── PRIOR SERVICE (military discipline — not civil offenses) ──────────
  { id:'ps_njp', label:'Prior Service — Article 15 / NJP History', group:'ps', class:'ps',
    sub:'UCMJ history that meets waiver criteria requires a CG USARD suitability review (4-12c). Does NOT count as a civil conviction',
    suitability:{ level:'USARD', cite:'4-12c' } },

  { id:'ps_court_martial', label:'Prior Service — Court-Martial Conviction', group:'ps', class:'ps',
    sub:'General/special court-martial history — CG USARD suitability review (4-12c); RE-code and discharge waiver rules also apply. Consult S1/EEPD',
    suitability:{ level:'USARD', cite:'4-12c' } },

  { id:'ps_adsep', label:'Prior Service — Admin Separation / RE Code', group:'ps', class:'ps',
    sub:'Admin separation for misconduct — processed as an RE-code/admin waiver (separate from moral waiver). Verify RE code and separation narrative' },
];

/* ── CASE-LEVEL QUESTIONS — asked ONCE per applicant ─────────────────────── */
window.CASE_QUESTIONS = [
  {
    id: 'pending_charges',
    q: 'Are any criminal or juvenile charges currently pending?',
    hint: 'AR 601-210, 4-22g / 4-33 — ANY pending charge blocks ALL processing until fully resolved, in every state. Unpaid traffic tickets count as pending charges.',
    options: [
      { v:'no',  l:'No — all charges fully resolved' },
      { v:'yes', l:'Yes — one or more charges pending (STOPS processing)' }
    ]
  },
  {
    id: 'civil_restraint',
    q: 'Is the applicant currently under any civil restraint?',
    hint: 'Civil restraint = confinement, parole, or probation (4-22h). EXCEPTION (4-35): may enlist while on UNSUPERVISED probation for minor traffic or these minor offenses only: curfew, disorderly conduct/disturbance, littering, loitering, MIP alcohol/tobacco, truancy/runaway, vagrancy, fireworks/fish-and-game/leash-law violations, turnstile jumping, and similar — provided all fines are paid and all conditions complete.',
    options: [
      { v:'no',           l:'No civil restraint of any kind' },
      { v:'unsupervised', l:'Unsupervised probation for a para 4-35 minor offense only (may process)' },
      { v:'active',       l:'Yes — confined, on parole, or on supervised probation (STOPS processing)' }
    ]
  },
  {
    id: 'lautenberg',
    q: 'Any conviction for misdemeanor domestic violence (Lautenberg, 18 USC 922)?',
    hint: 'Covers ANY qualifying misdemeanor DV conviction — even old or (in some states) expunged convictions. Victim must be a current/former spouse, parent, guardian, cohabitant, or co-parent. If in doubt, check with JAG.',
    options: [
      { v:'no',  l:'No' },
      { v:'yes', l:'Yes — qualifying DV conviction (PERMANENT BAR)' }
    ]
  },
  {
    id: 'sex_offender',
    q: 'Any sex offense conviction, or listing on any sex offender registry?',
    hint: 'Includes felony rape, sexual abuse/assault, incest, any other sexual offense, juvenile adjudications of guilt, and any current or past registry listing — Federal or State (4-22j / 4-7d).',
    options: [
      { v:'no',  l:'No' },
      { v:'yes', l:'Yes (PERMANENT BAR — no waiver authorized)' }
    ]
  },
  {
    id: 'dependence',
    q: 'Any history of alcohol or drug dependence?',
    hint: 'Persons who are or were alcohol- or drug-dependent are ineligible unless in sustained remission for 12 consecutive months (4-22b / 4-22c). Current enrollment in a recovery program = not in remission.',
    options: [
      { v:'no',        l:'No history of dependence' },
      { v:'remission', l:'Prior dependence — in sustained remission 12+ consecutive months' },
      { v:'yes',       l:'Dependent / in treatment / less than 12 months remission (STOPS processing)' }
    ]
  },
];

/* ── PER-OFFENSE QUESTIONS (compact form fields, not a wizard) ───────────── */
window.DISPOSITION_OPTIONS = [
  { v:'convicted',  l:'Convicted (guilty plea, nolo contendere, or verdict)' },
  { v:'adverse',    l:'Other adverse disposition (diversion, deferred adjudication, probated sentence, fine/community service, juvenile adjudication)' },
  { v:'dismissed',  l:'Dismissed / dropped — NO adverse disposition' },
  { v:'self_admit', l:'Self-admitted only — no charge ever filed, no court record' },
];

window.CONFINEMENT_OPTIONS = [
  { v:'no',     l:'No confinement served' },
  { v:'under24',l:'Confined less than 24 hours (booking/overnight)' },
  { v:'1to14',  l:'Confined 1–14 days (3-month wait after release — 4-31b(2))' },
  { v:'15plus', l:'Confined 15 days or more (6-month wait after release — 4-31b(3))' },
];

window.PROBATION_OPTIONS = [
  { v:'no',        l:'No probation / parole imposed' },
  { v:'completed', l:'Probation/parole imposed — fully COMPLETED' },
  { v:'active',    l:'Probation/parole still ACTIVE' },
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
    id:'police_rpt', label:'Police Incident Report (all non-traffic offenses)', validity:null, unit:null, group:'non_traffic', ref:'Para 4-28e(1)',
    note:'NOT required for traffic-only offenses',
    howto:'Contact the law enforcement agency that made the arrest (city PD, county sheriff, state police). Request a copy of the incident/arrest report for case #[X]. Most agencies charge $5–25. Allow 5–15 business days. If records destroyed, get a letter from the agency confirming destruction.',
    tip:'FOIA request may be needed if agency is initially unresponsive. Get everything in writing.'
  },
  {
    id:'court_info', label:'Court Docket — Information / Charging Document', validity:null, unit:null, group:'non_traffic', ref:'Para 4-28e(1)',
    howto:"Call the clerk of courts where the case was heard. Ask for 'certified copies of the charging document (information or indictment) for case number [X] in the matter of the State v. [Name].' Fees vary by county. If court is out of state, call during their business hours.",
    tip:"If court says records are sealed (juvenile), use UF 601-210.02 instead — do NOT skip this item."
  },
  {
    id:'court_finding', label:'Court Docket — Finding / Sentencing', validity:null, unit:null, group:'non_traffic', ref:'Para 4-28e(1)',
    howto:"Same clerk of courts request: 'I also need the judgment/finding and sentencing order for case number [X].' This is a separate document from the charging document. Both must be certified.",
    tip:'Deferred adjudication: get the deferral agreement AND any final dismissal/completion order.'
  },
  {
    id:'court_disp', label:'Court Docket — Final Disposition', validity:null, unit:null, group:'non_traffic', ref:'Para 4-28e(1)',
    howto:"Request: 'Finally, I need the final disposition order — the document showing what ultimately happened to the case (dismissed, convicted, fine paid, probation completed, etc.)' This may be the same document as the sentencing order or a separate final order.",
    tip:"If case is very old (10+ years), court may charge extra for archived record retrieval. Some counties use third-party services — verify authenticity."
  },
  {
    id:'uf_210_02', label:'UF 601-210.02 (In Lieu of Court Dockets)', validity:null, unit:null, group:'all', ref:'Para 4-28e(1)',
    howto:"Use this form ONLY when the court will not furnish required documents. The form requires the court's signature/stamp confirming they cannot provide records. Do NOT use as a shortcut — courts should always be the first attempt.",
    tip:'Sealed juvenile records are a valid use case. Get the court to complete Section II of the form.'
  },
  {
    id:'probation_docs', label:'Probation / Parole Officer Documents', validity:null, unit:null, group:'probation', ref:'Para 4-28e(2)',
    note:'Required when probation or parole was part of any sentence',
    howto:"Contact the supervising probation/parole officer. Request a letter on official letterhead stating: (1) start/end dates of supervision, (2) offense for which supervising, (3) compliance status, (4) any violations. Officer's contact info must be included.",
    tip:'If probation is complete, get a "certificate of completion" or "discharge from probation" document.'
  },
  {
    id:'correction_docs', label:'Documents from Correctional Facility', validity:null, unit:null, group:'confined', ref:'Para 4-28e(3)',
    note:'Required when applicant was detained/confined',
    howto:"Contact the jail or prison where applicant was confined. Request: (1) official record of confinement dates (in/out), (2) disciplinary record during confinement, (3) any release documentation. Many facilities have a records request form.",
    tip:'County jails vs. state prisons have different records departments. Confirm which facility held the applicant.'
  },
  {
    id:'fl_210_04', label:'USAREC FL 601-210.04 (Request for Info from Institution)', validity:null, unit:null, group:'confined_24plus', ref:'QC Checklist',
    note:'Required when applicant was confined 24 hours or more',
    howto:'Submit FL 601-210.04 to the correctional facility to request official records of the confinement period. Facility completes and returns the form. Allow 2–4 weeks.',
    tip:'Do this EARLY — correctional facilities are often slow to respond. Follow up weekly.'
  },
  {
    id:'dd369', label:'DD 369s — Work, Live, School (last 3 yrs + offense locations)', validity:180, unit:'days', group:'all', ref:'Para 4-28e(1)',
    howto:'Complete a DD Form 369 for EVERY location where the applicant: (1) lived for the past 3 years, (2) worked for the past 3 years, (3) attended school for the past 3 years, AND (4) each location where a waiver-related offense occurred (even if outside 3-yr window). Each DD 369 must be submitted to the local law enforcement agency for that jurisdiction.',
    tip:'Must be under 6 months old at submission. Track submission dates carefully. Aliases require separate DD 369 forms.'
  },
  {
    id:'appl_statement', label:"Applicant's Written Statement (Newest to Oldest; Steps Taken to Overcome)", validity:null, unit:null, group:'all', ref:'QC Checklist / UR 601-210 15-3c(3)',
    howto:"Applicant writes a detailed, chronological statement addressing: (1) each offense, starting with most recent (INCLUDE traffic violations), (2) circumstances and context, (3) concrete steps taken since (education, employment, counseling, community service), (4) why they want to serve. Must be handwritten OR signed. NO generic templates — personalize every statement.",
    tip:'The statement is often the deciding factor for borderline cases. A vague or generic statement is a rejection risk. Coach applicant extensively.'
  },
  {
    id:'co_mfr', label:"Company Commander's Interview MFR", validity:null, unit:null, group:'all', ref:'UR 601-210 15-3c(1)',
    howto:"Schedule the interview with the Company AND Battalion commander per UR 601-210 15-3c. The MFR (AR 25-50 format) must include: (1) interview date, (2) details of the conversation, (3) description of the disqualification and why it no longer exists, (4) APPROVE or DISAPPROVE recommendation with justification. Submit original — do NOT modify after signature.",
    tip:'The commander must actually interview the applicant — results may be annotated in the RZ remarks section or an uploaded MFR.'
  },
  {
    id:'dd1966_sf86', label:'DD Form 1966 and SF 86 (Section III — Civil Offenses)', validity:null, unit:null, group:'all', ref:'Para 4-28e(7)',
    howto:'DD Form 1966 is completed at MEPS. SF 86 is the security clearance questionnaire — available through eApp (OPM). Per 4-30a, ALL offenses regardless of outcome must be listed on the SF 86 — including original charges when a plea to a lesser offense was entered. Discrepancies between forms and the RZ are common rejection causes.',
    tip:'CRITICAL: Any offense requiring a waiver MUST also be disclosed on the SF 86. Omission = fraudulent enlistment risk.'
  },
  {
    id:'uf_210_08', label:'UF 601-210.08 (All Law Violations; Asterisk Waived Offenses)', validity:null, unit:null, group:'all', ref:'QC Checklist',
    howto:'List ALL law violations ever — not just the waiver offense. Use the Moral Waiver Builder PDF generator to auto-fill this form. Offenses requiring a waiver must be asterisked (*). Order: newest to oldest. Applicant signs at bottom.',
    tip:'Most common rejection reason: offense listed on RZ but missing from 210.08, or not asterisked.'
  },
  {
    id:'dd370', label:'DD Form 370 — Request for Reference (3 required)', validity:null, unit:null, group:'usard', ref:'Para 4-28e(4)',
    note:'NOT required at BN level — CG USARD level only',
    howto:'Reference letters from employers covering the year prior to application and schools attended in the 3 years prior (include transcripts if currently attending college). Each reference completes DD 370 independently. Explain all unemployment periods of 3+ months in the preceding year. If a reference would jeopardize current employment, it is not required — document that.',
    tip:'References should be aware of the waiver situation — vague references that cannot speak to the offense context weaken the packet.'
  },
  {
    id:'dd2808', label:'DD Form 2808 (Genesis Report / MEPS Physical)', validity:null, unit:null, group:'major', ref:'Para 4-28e(5)',
    note:'Required for ALL major misconduct (felony-level) waivers',
    howto:'Completed at MEPS during the medical examination. The Genesis Report is the electronic record created from the MEPS physical. Ensure MEPS has all relevant medical and mental health history disclosed.',
    tip:'Drug-related waivers: ensure any treatment or counseling history is documented in the physical.'
  },
  {
    id:'dd2807_2', label:'DD Form 2807-2 (Accession Medical Prescreen)', validity:null, unit:null, group:'major', ref:'QC Checklist',
    howto:'Completed by the recruiter with the applicant prior to MEPS. Captures medical history including any substance abuse treatment, mental health treatment, or physical conditions related to the offense.',
    tip:'Do not leave any field blank — write "None" or "N/A" where applicable.'
  },
];

/* ── MOS RESTRICTIONS (ADVISORY ONLY — not sourced from AR 601-210; verify
      with the MOS-specific career manager and DA PAM 611-21) ─────────────── */
window.MOS_RESTRICTIONS = [
  {
    group: 'Intelligence / MI',
    mos: ['35F','35L','35M','35N','35P','35Q','35S','35T','35U','35X','35Y','35Z','18F','37F'],
    label: 'Intelligence & HUMINT',
    notes: 'ADVISORY: Drug distribution history conflicts with clearance adjudication. DUI within 3 years generally complicates TS/SCI. Any drug conviction (including marijuana) complicates adjudication.',
    restrictions: ['Drug distribution — clearance conflict','DUI caution — clearance risk','Drug conviction complicates TS/SCI','Background investigation required'],
    severity: 'high'
  },
  {
    group: 'Aviation',
    mos: ['15A','15B','15C','15D','15E','15F','15G','15H','15J','15K','15M','15N','15P','15Q','15R','15S','15T','15U','15V','15W','15X','15Y','15Z'],
    label: 'Aviation (Pilot & Crew)',
    notes: 'ADVISORY: FAA medical certificate required. DUI/DWI history typically requires FAA Special Issuance. Drug offense history may prevent FAA class I/II medical. Coordinate with Aviation Branch.',
    restrictions: ['FAA medical cert required','DUI/DWI — FAA Special Issuance process','Drug offense — FAA medical risk','Coordinate waiver with Aviation Branch'],
    severity: 'high'
  },
  {
    group: 'Special Operations',
    mos: ['18A','18B','18C','18D','18E','18F','18X','37F','38A','38B','79S'],
    label: 'Special Forces / Special Operations',
    notes: 'ADVISORY: Major misconduct waivers are rarely compatible with SF candidacy. BN-level waivers for minor offenses reviewed more strictly. DUI within 3 years typically problematic for the SF pipeline.',
    restrictions: ['Major misconduct waiver rarely approved for SF','DUI within 3 yrs — SF pipeline risk','Stricter character assessment required'],
    severity: 'high'
  },
  {
    group: 'Nuclear / Personnel Reliability',
    mos: ['13M','55B','55D','55E','55G','92A'],
    label: 'Nuclear / Sensitive Material (PRP)',
    notes: 'ADVISORY: Personnel Reliability Program positions. Drug conviction is virtually automatic PRP disqualification. DUI and financial misconduct also problematic. Coordinate with unit PRP program manager.',
    restrictions: ['Drug conviction = PRP disqualification','DUI/DWI — PRP risk','Financial misconduct — PRP risk','Coordinate with PRP program manager'],
    severity: 'high'
  },
  {
    group: 'Medical / Healthcare',
    mos: ['68A','68B','68C','68D','68E','68F','68G','68H','68J','68K','68L','68M','68N','68P','68Q','68R','68S','68T','68U','68V','68W','68X','68Z','65A','65B','65C','65D'],
    label: 'Medical (68 series)',
    notes: 'ADVISORY: Drug convictions may affect state professional licensing. Substance-abuse-pattern offenses scrutinized heavily. Prior prescription drug abuse especially relevant.',
    restrictions: ['Drug conviction may affect state licensure','Substance abuse pattern scrutinized','Rx drug abuse — medical credential risk'],
    severity: 'medium'
  },
  {
    group: 'Finance / Legal',
    mos: ['27A','27D','36A','36B','36C','36D'],
    label: 'Finance / JAG',
    notes: 'ADVISORY: Financial crimes (theft, fraud, identity theft) are particularly problematic. Security clearance required for finance positions.',
    restrictions: ['Financial crime = high clearance risk','Fraud history — likely disqualifying','Security clearance required'],
    severity: 'medium'
  },
  {
    group: 'Cyber / Signal',
    mos: ['17A','17B','17C','17E','25A','25B','25D','25E','25F','25H','25L','25M','25N','25P','25Q','25R','25S','25T','25U','25V','25W','25X','25Z'],
    label: 'Cyber / Signal',
    notes: 'ADVISORY: Computer-crime convictions are essentially disqualifying for cyber MOSs. TS/SCI typically required. All clearance-related offense risks apply.',
    restrictions: ['Cybercrime conviction — likely disqualifying','TS/SCI required — drug/DV history risks','Coordinate with signal career manager'],
    severity: 'high'
  },
  {
    group: 'Law Enforcement',
    mos: ['31A','31B','31D','31E','31K'],
    label: 'Military Police / CID',
    notes: 'ADVISORY: Law enforcement MOSs require higher character standards. Drug and violent offense waivers extremely rare. DUI waivers reviewed carefully by MP career manager.',
    restrictions: ['Drug/violent waiver extremely rare for MP','DUI — reviewed by MP career manager','Higher character standard required'],
    severity: 'high'
  },
  {
    group: 'Infantry / Combat Arms',
    mos: ['11A','11B','11C','11X','12A','12B','12C','12D','12E','12G','12H','12K','12M','12N','12P','12Q','12R','12T','12W','12Y','12Z','13A','13B','13F','13J','13M','13R','14A','14E','14G','14H','14J','14P','14S','14T'],
    label: 'Combat Arms (11, 12, 13, 14 series)',
    notes: 'ADVISORY: Generally more flexible for BN-level offenses. Major misconduct still requires CG USARD. Weapons convictions reviewed carefully for 11/12 series.',
    restrictions: ['Weapons felony — clearance and MOS conflict','Combat arms generally more waiver-flexible','Violent offense history reviewed for fitness'],
    severity: 'low'
  },
];

/* ── APPROVABILITY FACTORS (UNOFFICIAL estimate — not from regulation) ───── */
window.APPROVABILITY_FACTORS = {
  timeFactors: [
    { yearsAgo: 0.5, mod: -30, label: 'Very recent offense (under 6 months)' },
    { yearsAgo: 1,   mod: -20, label: 'Recent offense (6–12 months)' },
    { yearsAgo: 2,   mod: -10, label: '1–2 years since offense' },
    { yearsAgo: 3,   mod:   0, label: '2–3 years since offense' },
    { yearsAgo: 5,   mod:  10, label: '3–5 years since offense' },
    { yearsAgo: 7,   mod:  20, label: '5–7 years since offense' },
    { yearsAgo: 99,  mod:  25, label: '7+ years since offense' },
  ],
  authorityMods: { BN: 15, USARD: -15 },
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
  juvenileMod: 15,
  firstOffenseMod: 10,
};

/* ── SAMPLE SCENARIOS (fictional data; SSN last-4 only) ──────────────────── */
window.SAMPLE_SCENARIOS = [
  {
    id:'s1', title:'Bar Fight — Simple Assault (≤$500)', tag:'NO WAIVER · 2026-correct outcome',
    applicant:{ lastName:'Applicant', firstName:'John', mi:'M', ssn:'0001', dob:'2001-03-15', rsid:'RS0001', educationLevel:'HS Diploma', educationCode:'2A', afqt:'52', psNps:'NPS', maritalStatus:'Single', numDependents:'0' },
    caseAnswers:{ pending_charges:'no', civil_restraint:'no', lautenberg:'no', sex_offender:'no', dependence:'no' },
    offenses:[{ id:'o1', categoryId:'minor_assault_simple', offenseDate:'2022-06-10', convictionDate:'2022-08-02', disposition:'convicted', confinement:'no', releaseDate:'', probation:'no',
      description:'Simple assault — altercation outside a bar, no weapons, $250 fine', city:'Columbus', county:'Franklin', state:'OH', dispositionText:'Convicted — Misdemeanor, $250 fine, no confinement', courtDocs:true, incidentRpt:true }]
  },
  {
    id:'s2', title:'DUI — Most Common Waiver', tag:'BN CO · Single-conviction waiver (4-6a(4))',
    applicant:{ lastName:'Sample', firstName:'Jane', mi:'K', ssn:'0002', dob:'2000-08-22', rsid:'RS0002', educationLevel:'Some College (No Degree)', educationCode:'4E', afqt:'61', psNps:'NPS', maritalStatus:'Single', numDependents:'0' },
    caseAnswers:{ pending_charges:'no', civil_restraint:'no', lautenberg:'no', sex_offender:'no', dependence:'no' },
    offenses:[{ id:'o2', categoryId:'misc_dui', offenseDate:'2023-01-14', convictionDate:'2023-03-20', disposition:'convicted', confinement:'no', releaseDate:'', probation:'completed',
      description:'DUI — BAC 0.09, no accident, no injury, routine traffic stop', city:'Nashville', county:'Davidson', state:'TN', dispositionText:'Convicted — Misdemeanor, $500 fine, 6-month suspended license, 12-month unsupervised probation (completed)', courtDocs:true, incidentRpt:true }]
  },
  {
    id:'s3', title:'Juvenile Grand Theft', tag:'CG USARD · Major misconduct (juvenile)',
    applicant:{ lastName:'Recruit', firstName:'Marcus', mi:'T', ssn:'0003', dob:'2003-11-05', rsid:'RS0003', educationLevel:'HS Diploma', educationCode:'2A', afqt:'58', psNps:'NPS', maritalStatus:'Single', numDependents:'0' },
    caseAnswers:{ pending_charges:'no', civil_restraint:'no', lautenberg:'no', sex_offender:'no', dependence:'no' },
    offenses:[{ id:'o3', categoryId:'major_property', offenseDate:'2019-09-03', convictionDate:'2019-11-15', disposition:'adverse', confinement:'no', releaseDate:'', probation:'completed',
      description:'Grand theft — shoplifting $620 merchandise, committed at age 15', city:'Phoenix', county:'Maricopa', state:'AZ', dispositionText:'Adjudicated juvenile — adverse disposition, 60 hrs community service completed, no confinement', courtDocs:true, incidentRpt:true }]
  },
  {
    id:'s4', title:'Marijuana Possession ×2', tag:'BN CO · Two misconduct convictions (4-6a(2))',
    applicant:{ lastName:'Test', firstName:'Alex', mi:'R', ssn:'0004', dob:'1999-04-17', rsid:'RS0004', educationLevel:'GED', educationCode:'6A', afqt:'44', psNps:'NPS', maritalStatus:'Single', numDependents:'0' },
    caseAnswers:{ pending_charges:'no', civil_restraint:'no', lautenberg:'no', sex_offender:'no', dependence:'no' },
    offenses:[
      { id:'o4a', categoryId:'misc_marijuana_possess', offenseDate:'2021-07-22', convictionDate:'2021-09-01', disposition:'convicted', confinement:'no', releaseDate:'', probation:'no',
        description:'Marijuana possession — approx 5g personal use', city:'Atlanta', county:'Fulton', state:'GA', dispositionText:'Convicted — Misdemeanor, $200 fine', courtDocs:true, incidentRpt:true },
      { id:'o4b', categoryId:'misc_marijuana_possess', offenseDate:'2020-03-11', convictionDate:'2020-05-14', disposition:'convicted', confinement:'no', releaseDate:'', probation:'no',
        description:'Marijuana possession — paraphernalia (pipe)', city:'Atlanta', county:'Fulton', state:'GA', dispositionText:'Convicted — Misdemeanor, $100 fine', courtDocs:true, incidentRpt:true }
    ]
  },
  {
    id:'s5', title:'Felony Burglary — Single Major', tag:'CG USARD · 24-month clock met',
    applicant:{ lastName:'Candidate', firstName:'Chris', mi:'D', ssn:'0005', dob:'1997-12-30', rsid:'RS0005', educationLevel:'HS Diploma', educationCode:'2A', afqt:'67', psNps:'NPS', maritalStatus:'Single', numDependents:'0' },
    caseAnswers:{ pending_charges:'no', civil_restraint:'no', lautenberg:'no', sex_offender:'no', dependence:'no' },
    offenses:[{ id:'o5', categoryId:'major_property', offenseDate:'2023-08-15', convictionDate:'2023-11-08', disposition:'convicted', confinement:'no', releaseDate:'', probation:'completed',
      description:'Burglary — entered detached garage, took tools valued $1,400', city:'Houston', county:'Harris', state:'TX', dispositionText:'Convicted — Felony, 18-month supervised probation completed May 2025, restitution paid, no confinement', courtDocs:true, incidentRpt:true }]
  },
  {
    id:'s6', title:'DUI + Petty Theft — Multi-Offense', tag:'BN CO · Two misconduct offenses',
    applicant:{ lastName:'Johnson', firstName:'Tyler', mi:'A', ssn:'0006', dob:'2000-06-12', rsid:'RS0006', educationLevel:'HS Diploma', educationCode:'2A', afqt:'55', psNps:'NPS', maritalStatus:'Single', numDependents:'0' },
    caseAnswers:{ pending_charges:'no', civil_restraint:'no', lautenberg:'no', sex_offender:'no', dependence:'no' },
    offenses:[
      { id:'o6a', categoryId:'misc_dui', offenseDate:'2022-09-17', convictionDate:'2022-11-30', disposition:'convicted', confinement:'no', releaseDate:'', probation:'completed',
        description:'DUI — BAC 0.11, traffic stop, no accident', city:'Tampa', county:'Hillsborough', state:'FL', dispositionText:'Convicted — Misdemeanor, $750 fine, 1-year probation (completed)', courtDocs:true, incidentRpt:true },
      { id:'o6b', categoryId:'misc_theft_minor', offenseDate:'2020-04-03', convictionDate:'2020-06-10', disposition:'adverse', confinement:'no', releaseDate:'', probation:'no',
        description:'Petty theft — shoplifting $85 merchandise from Walmart', city:'Tampa', county:'Hillsborough', state:'FL', dispositionText:'Deferred adjudication — 6 months, community service completed, case closed (counts as adverse disposition per 4-30b)', courtDocs:true, incidentRpt:true }
    ]
  },
  {
    id:'s7', title:'Two Misconduct + Confinement', tag:'BN CO · 6-month wait from release',
    applicant:{ lastName:'Rivera', firstName:'Carlos', mi:'E', ssn:'0007', dob:'1998-02-28', rsid:'RS0007', educationLevel:'HS Diploma', educationCode:'2A', afqt:'49', psNps:'NPS', maritalStatus:'Single', numDependents:'1', dependentAges:'2' },
    caseAnswers:{ pending_charges:'no', civil_restraint:'no', lautenberg:'no', sex_offender:'no', dependence:'no' },
    offenses:[
      { id:'o7', categoryId:'misc_assault', offenseDate:'2025-11-01', convictionDate:'2026-01-15', disposition:'convicted', confinement:'15plus', releaseDate:'2026-03-01', probation:'completed',
        description:'Assault — fight resulting in injury, no weapons; 30 days county jail served', city:'Charlotte', county:'Mecklenburg', state:'NC', dispositionText:'Convicted — Misdemeanor, $800 fine, 30 days confinement served, probation completed', courtDocs:true, incidentRpt:true },
      { id:'o7b', categoryId:'misc_theft_minor', offenseDate:'2023-02-14', convictionDate:'2023-04-01', disposition:'convicted', confinement:'no', releaseDate:'', probation:'no',
        description:'Petty theft — shoplifting $120 merchandise', city:'Charlotte', county:'Mecklenburg', state:'NC', dispositionText:'Convicted — Misdemeanor, $150 fine, restitution paid', courtDocs:true, incidentRpt:true }
    ]
  },
];

/* ── PARAGRAPH TEXT (AR 601-210, 20 March 2026) ──────────────────────────── */
window.PARA_TEXT = {
  '4-6':   'Conduct waivers (other than major misconduct) — BN CO approval. A waiver is required for: (1) FIVE or more minor nontraffic offenses; (2) TWO to five misconduct offenses; (3) a combination of five nontraffic/misconduct offenses; or (4) a SINGLE conviction/adverse disposition for DUI/DWI, prostitution or solicitation, or non-Lautenberg domestic violence. 2026 change: a single conviction for possession of marijuana or drug paraphernalia no longer requires a waiver.',
  '4-6c':  'A waiver may not be considered for any person with civil convictions or other adverse dispositions for SIX or more misconduct offenses that occurred prior to application.',
  '4-7':   'Major misconduct — a waiver is required for ANY conviction or other adverse disposition for a major misconduct (felony-level) offense (Table 4-4). Approval authority: CG, USARD for RA/USAR (CNGB for ARNG). Applicants incur a 24-MONTH wait from the date of conviction before waiver processing.',
  '4-7b':  'Lautenberg Amendment (18 USC 922) — enlistment of applicants with a qualifying misdemeanor domestic violence conviction is prohibited and no waivers will be approved. A qualifying conviction is not affected by expungement or pardon unless civil rights (including firearms) were fully restored.',
  '4-7c':  'A waiver may NOT be considered for a person with a major misconduct conviction who also has ANY of: (1) three or more total non-traffic offenses; (3) conviction/adverse disposition for sale, distribution, or trafficking (incl. intent) of cannabis or any controlled substance; (4) two or more DUI convictions/adverse dispositions within 3 years of application; (5) PS applicant whose major misconduct occurred during or after military service; (6) two or more drug/paraphernalia possession charges within 3 years of application. Juvenile major misconduct with no offenses within 5 years may be considered in meritorious cases (4-7c(2)).',
  '4-12c': 'UCMJ violations must be listed in the applicant’s packet. Any UCMJ history that meets waiver criteria for an NPS applicant requires a suitability review. Approval authority for UCMJ actions not rising to major misconduct is the CG, USARD.',
  '4-18':  'Positive drug or alcohol test at MEPS: First positive for marijuana/alcohol — 90-day wait for retest, BN CO waiver. First positive for cocaine/other drugs — 1-YEAR wait for retest. Second positive of any kind — PERMANENT disqualification from all Army components. PS applicants who test positive: no waiver may be considered.',
  '4-22b': 'Alcoholism — person not in sustained remission (less than 12 consecutive months since last occurrence) cannot be waived.',
  '4-22c': 'Drug dependence — person not in sustained remission (less than 12 consecutive months) cannot be waived.',
  '4-22g': 'Person with criminal or juvenile court charges filed or PENDING by civil authorities cannot be waived. Note: pending charges include UNPAID traffic violations.',
  '4-22h': 'Person under civil restraint — confinement, parole, or probation — cannot be waived. Exception: unsupervised probation for para 4-35 minor offenses may process.',
  '4-22i': 'Subject of civilian court conviction or adverse disposition for MORE THAN ONE major misconduct (felony-level) offense cannot be waived.',
  '4-22j': 'Conviction for a sex offense = not eligible, no waivers authorized. Applicants currently or previously listed on any Federal or State sex offender registry are not eligible. Typical offenses include rape, carnal knowledge, forcible sodomy, indecent assault, child pornography, and attempts/conspiracy to commit them.',
  '4-22k': 'Persons with a conviction of murder cannot be waived.',
  '4-27':  'Waivers are valid for 6 MONTHS from approval date unless a change in status occurs (DEP/delayed status: valid until RA enlistment if no change). Additional offenses acquired after approval require waiver resubmission. Conduct-waiver Future Soldier losses must process a NEW waiver before enlisting.',
  '4-28':  'Waiver approval procedures — required documents: (1) police checks and court documents (not required for traffic offenses); (2) probation/parole officer documents showing satisfactory completion; (3) correctional facility documents; (4) reference letters (employers 1 yr / schools 3 yrs — not required at BN level); (5) current MEPS DD 2808 for major misconduct waivers; (6) DD 214/215, NGB 22 as applicable; (7) DD Form 1966 and SF 86 section III. Multiple disqualifications are approved by the HIGHEST required authority.',
  '4-28e4':'Reference letters from employers covering 1 year prior and schools attended 3 years prior (with transcripts if enrolled). Explain all unemployment periods of 3+ months. NOT required at battalion level unless the BN CO requires it.',
  '4-28e5':'For major misconduct-level waivers, the applicant’s current MEPS DD Form 2808 is required.',
  '4-30':  'All offenses regardless of outcome must be listed on the SF 86 — including original charges when a plea to a lesser offense was entered. NO waiver is needed if an arrest did not result in referral of charges, or charges were dismissed without conviction/adverse disposition. Expungement or sealing does NOT remove the waiver requirement — underlying facts must be revealed. A charge dropped on condition of enlistment = waiver NOT authorized.',
  '4-31':  'Waiting periods after civil restraint: (1) parole/probation/suspended sentence — may process once ALL court-ordered requirements are complete; (2) confinement under 15 days — 3-month wait (BN CO may waive up to 45 days if sentenced only to a fine and elected confinement instead, with court verification); (3) confinement 15+ days — 6-month wait (BN CO may waive up to 3 months, same conditions); (4) no wait for DEP/DTP members whose civil restraint is complete, with BN CO approval; (5) waits do not apply to minor traffic restrictions or unsupervised traffic probation.',
  '4-35':  'Unsupervised probation — applicant MAY enlist while on unsupervised probation for: all minor traffic offenses, plus these minor nontraffic offenses only: curfew violation, damaging road signs, disorderly conduct/creating disturbance, dumping refuse, turnstile jumping, juvenile status adjudications (runaway/truant/incorrigible), littering, loitering, minor in possession (alcohol/tobacco), robbing an orchard, vagrancy, fireworks/fish-and-game/leash law violations — provided no movement restriction, all fines paid, all conditions complete, and no further court action pending.',
  '4-2f':  'Suitability reviews (required BEFORE projection/MEPS processing, regardless of disposition): 2+ misconduct offenses → BN CO review; 4+ combined nontraffic/misconduct → BN CO; ANY major misconduct offense or felony charge → CG USARD; domestic battery/violence (non-Lautenberg) → CG USARD; any sexually based offense (incl. sexting) → CG USARD; carrying/possessing ANY weapon on school grounds (even if handled informally by the school) → CG USARD.',
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
  bar_lautenberg:         ['4-7b'],
  bar_sex_offense:        ['4-22j'],
  bar_murder:             ['4-22k'],
  bar_drug_distribution:  ['4-7c','4-2f'],
  misc_dui:               ['4-6','4-31'],
  misc_marijuana_possess: ['4-6','4-18'],
  misc_dv_non_laut:       ['4-6','4-2f'],
  misc_prostitution:      ['4-6'],
  dat_mj_first:           ['4-18'],
  dat_other_first:        ['4-18'],
  dat_second:             ['4-18'],
  traffic_minor:          ['4-22g','4-35'],
  ps_njp:                 ['4-12c'],
  ps_court_martial:       ['4-12c'],
  ps_adsep:               ['4-12c'],
};

window.Q_PARA_MAP = {
  pending_charges: ['4-22g'],
  civil_restraint: ['4-22h','4-35','4-31'],
  lautenberg:      ['4-7b'],
  sex_offender:    ['4-22j'],
  dependence:      ['4-22b','4-22c'],
};

})();
