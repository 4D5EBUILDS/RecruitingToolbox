(function () {

window.OFFENSE_CATEGORIES = [
  { id:'major_drug_dist',    label:'Drug Distribution / Trafficking',          sub:'Incl. cannabis — AR 601-210 Table 4-4, Code 436', level:'MAJOR',       authority:'DMPM',   bar:false },
  { id:'major_violent',      label:'Major Misconduct — Violent',                sub:'Aggravated assault, manslaughter, arson — Code 400/426/401', level:'MAJOR', authority:'USAREC', bar:false },
  { id:'major_property',     label:'Major Misconduct — Property / Financial',   sub:'Grand larceny ≥$500, burglary, embezzlement — Code 418/405/415', level:'MAJOR', authority:'USAREC', bar:false },
  { id:'major_drug_possess', label:'Major Drug Possession / Use (Non-Marijuana)', sub:'Code 428 — marijuana explicitly excluded from this category', level:'MAJOR', authority:'USAREC', bar:false },
  { id:'major_other',        label:'Major Misconduct — Other',                  sub:'Table 4-4, Code 441',                             level:'MAJOR',       authority:'USAREC', bar:false },
  { id:'misc_marijuana',     label:'Marijuana Possession / Paraphernalia',      sub:'Table 4-3, Code 316 — conviction required for waiver; self-admit see ETP note', level:'MISC', authority:'BN', bar:false },
  { id:'misc_dui',           label:'DUI / Driving While Impaired',              sub:'Table 4-3, Code 309',                             level:'MISC',        authority:'BN',     bar:false },
  { id:'misc_theft_minor',   label:'Theft / Fraud Under $500',                  sub:'Table 4-3, Code 310–311',                         level:'MISC',        authority:'BN',     bar:false },
  { id:'misc_weapons',       label:'Weapons — Unlawful Carry / Concealed',      sub:'Table 4-3, Code 325',                             level:'MISC',        authority:'BN',     bar:false },
  { id:'misc_other',         label:'Misconduct — Other Nontraffic',             sub:'Table 4-3, Code 330',                             level:'MISC',        authority:'BN',     bar:false },
  { id:'dat_positive',       label:'DAT Positive (MEPS / USMEPCOM)',            sub:'Para 4-18 — 1st positive: BN; 2nd positive: permanent disqualification', level:'MISC', authority:'BN', bar:false },
  { id:'traffic_above_minor',label:'Traffic — Above Minor',                     sub:'Para 4-8',                                        level:'TRAFFIC',     authority:'BN',     bar:false },
  { id:'juvenile',           label:'Juvenile Offense',                          sub:'Para 4-30(b)(5) — authority depends on offense type', level:'VARIES',   authority:'BN',     bar:false },
  { id:'misc_dv_non_laut',   label:'Domestic Violence — Non-Lautenberg',        sub:'Table 4-3, Code 308',                             level:'MISC',        authority:'BN',     bar:false },
  { id:'bar_lautenberg',     label:'Domestic Violence — Lautenberg (18 USC § 922)', sub:'NOT WAIVABLE if convicted — absolute bar',  level:'BAR',         authority:'NONE',   bar:true, barPara:'Table 4-4, Code 414', barText:'A conviction for domestic violence as defined by the Lautenberg Amendment (18 USC § 922(g)(9)) is an absolute disqualification. Not waivable.' },
  { id:'bar_sex_offense',    label:'Sex Offense / Sex Offender Registration',   sub:'NOT WAIVABLE — absolute bar',                     level:'BAR',         authority:'NONE',   bar:true, barPara:'Para 4-22j',          barText:'Persons convicted of rape, carnal knowledge, sodomy, prostitution involving a minor, indecent assault, or any offense requiring sex offender registration are permanently disqualified.' },
  { id:'bar_murder',         label:'Murder',                                    sub:'NOT WAIVABLE — absolute bar',                     level:'BAR',         authority:'NONE',   bar:true, barPara:'Para 4-22k',          barText:'Persons convicted of murder (intentional homicide) are permanently disqualified.' },
];

window.QUALIFYING_QUESTIONS = [
  {
    id: 'is_adult',
    q: 'Was the applicant age 18 or older at the time of the offense?',
    hint: 'Juvenile offenses (under 18) are processed under AR 601-210, para 4-30(b)(5)',
    options: [
      { v:'yes', l:'Yes — age 18 or older at time of offense' },
      { v:'no',  l:'No — under age 18 (juvenile) at time of offense' }
    ]
  },
  {
    id: 'disposition',
    q: 'What was the court disposition for the offense?',
    hint: null,
    options: [
      { v:'convicted', l:'Convicted' },
      { v:'adverse',   l:'Adverse Disposition — no conviction (deferred prosecution, diversion, plea to lesser)' },
      { v:'dismissed', l:'Dismissed — no adverse disposition' },
      { v:'self_admit',l:'No Court Record — Self-Admittal Only (no charge was filed)' }
    ]
  },
  {
    id: 'pending_charges',
    q: 'Are any criminal or juvenile charges currently pending?',
    hint: 'AR 601-210, para 4-22g — pending charges block waiver processing',
    options: [
      { v:'yes', l:'Yes — charges are pending' },
      { v:'no',  l:'No — all charges are resolved' }
    ]
  },
  {
    id: 'civil_restraint',
    q: 'Is the applicant currently under any civil restraint?',
    hint: 'Civil restraint includes active confinement, parole, or supervised probation — para 4-22h',
    options: [
      { v:'yes', l:'Yes — currently confined, on parole, or on supervised probation' },
      { v:'no',  l:'No' }
    ]
  },
  {
    id: 'major_count',
    q: 'How many total major misconduct (felony-level) convictions does the applicant have in their entire history?',
    hint: 'Count all felony-level convictions, including any prior to the offense being waived — para 4-22i',
    options: [
      { v:'0',     l:'None' },
      { v:'1',     l:'One (1)' },
      { v:'2plus', l:'Two or more (2+)' }
    ]
  },
  {
    id: 'lautenberg',
    q: 'Does any offense involve domestic violence as defined by the Lautenberg Amendment (18 USC § 922)?',
    hint: 'This covers misdemeanor domestic violence convictions that prohibit firearm possession under federal law',
    options: [
      { v:'yes', l:'Yes — convicted of a qualifying domestic violence offense' },
      { v:'no',  l:'No' }
    ]
  },
  {
    id: 'sex_offender',
    q: 'Does any offense require registration as a sex offender, or involve a sex offense listed in para 4-22j?',
    hint: 'Includes rape, carnal knowledge, sodomy, indecent assault, pornography involving minors, prostitution involving minors',
    options: [
      { v:'yes', l:'Yes' },
      { v:'no',  l:'No' }
    ]
  },
  {
    id: 'confinement_days',
    q: 'Was the applicant confined as a result of this offense?',
    hint: 'Para 4-31 — confinement length determines the mandatory waiting period before waiver submission',
    options: [
      { v:'15plus',    l:'Yes — confined 15 or more days' },
      { v:'under15',   l:'Yes — confined, but fewer than 15 days' },
      { v:'no',        l:'No confinement' }
    ]
  },
  {
    id: 'probation_minor',
    q: 'Is the applicant currently on unsupervised probation for a minor offense listed in AR 601-210, para 4-35?',
    hint: 'Para 4-35 minor offenses (e.g., minor traffic violations with no confinement) may be processed without waiting for probation to end',
    options: [
      { v:'yes', l:'Yes — unsupervised probation for a para 4-35 minor offense' },
      { v:'no',  l:'No' }
    ]
  }
];

window.CHECKLIST_ITEMS = [
  { id:'live_scan',       label:'Live Scan Results',                                 validity:120, unit:'days', group:'all',              ref:'UM 21-022',          note:'' },
  { id:'sex_off_check',   label:'Sex Offender Check (IAW UM 21-022)',                validity:null, unit:null,  group:'all',              ref:'UM 21-022',          note:'' },
  { id:'source_docs',     label:'Source Documents (Birth Cert, Ed Docs, SSN, PS)',   validity:null, unit:null,  group:'all',              ref:'Para 4-28',          note:'' },
  { id:'rz_complete',     label:'RZ Complete — Q1 (last 7 yrs), Q2 (felony/firearms/alcohol-drugs/DV), Q3 (traffic)', validity:null, unit:null, group:'all', ref:'Para 4-28', note:'' },
  { id:'police_rpt',      label:'Police Incident Report (all non-traffic offenses)', validity:null, unit:null,  group:'non_traffic',      ref:'Para 4-28',          note:'NOT required for traffic-only offenses' },
  { id:'court_info',      label:'Court Docket — Information / Charging Document',   validity:null, unit:null,  group:'non_traffic',      ref:'Para 4-28',          note:'' },
  { id:'court_finding',   label:'Court Docket — Finding / Sentencing',              validity:null, unit:null,  group:'non_traffic',      ref:'Para 4-28',          note:'' },
  { id:'court_disp',      label:'Court Docket — Final Disposition',                 validity:null, unit:null,  group:'non_traffic',      ref:'Para 4-28',          note:'' },
  { id:'uf_210_02',       label:'USAREC Form 601-210.02 (when court will not furnish docs)', validity:null, unit:null, group:'all',      ref:'Para 4-28',          note:'In lieu of court dockets' },
  { id:'probation_docs',  label:'Probation / Parole Officer Documents',             validity:null, unit:null,  group:'probation',        ref:'Para 4-28(e)(2)',    note:'If applicable' },
  { id:'correction_docs', label:'Documents from Correctional Facility',             validity:null, unit:null,  group:'confined',         ref:'Para 4-28(e)(3)',    note:'Required if confined' },
  { id:'dd369',           label:'DD 369s — Work, Live, School (last 3 yrs + offense locations)', validity:180, unit:'days', group:'all', ref:'Para 4-28',         note:'< 6 months old; include each location where offense occurred' },
  { id:'appl_statement',  label:"Applicant's Statement (newest to oldest; steps taken to overcome)", validity:null, unit:null, group:'all', ref:'Para 4-28',       note:'' },
  { id:'co_mfr',          label:"Company Commander's Interview MFR",                validity:null, unit:null,  group:'all',              ref:'Para 4-28',          note:'' },
  { id:'dd1966_sf86',     label:'DD Form 1966 and SF 86',                           validity:null, unit:null,  group:'all',              ref:'Para 4-28(e)(7)',    note:'' },
  { id:'uf_210_08',       label:'UF 601-210.08 (all law violations; asterisk waived offenses)', validity:null, unit:null, group:'all',  ref:'Para 4-28',          note:'' },
  { id:'dd370',           label:'DD Form 370 — Request for Reference (3 required)', validity:null, unit:null,  group:'usarec_dmpm',      ref:'Para 4-28(e)(4)',    note:'NOT at BN level; employers 1 yr prior, schools 3 yrs prior' },
  { id:'dd2808',          label:'DD Form 2808 (Genesis Report / MEPS Physical)',    validity:null, unit:null,  group:'major',            ref:'Para 4-28(e)(5)',    note:'Required for all major misconduct waivers' },
  { id:'dd2807_2',        label:'DD Form 2807-2',                                   validity:null, unit:null,  group:'major_applicable', ref:'Para 4-28',          note:'For applicable cases' },
  { id:'fl_210_04',       label:'USAREC FL 601-210.04 (Request for Info from Institution)', validity:null, unit:null, group:'confined_24plus', ref:'Para 4-28',  note:'Required when confined 24+ hours' },
];

window.SAMPLE_SCENARIOS = [
  {
    id:'s1', title:'The Bar Fight', tag:'BN CO — Typical Misconduct',
    applicant:{ lastName:'Applicant', firstName:'John', mi:'M', ssn:'000-00-0001', dob:'2001-03-15', rsid:'RS0001', educationLevel:'HS Diploma', afqt:'52' },
    offenses:[{ id:'o1', date:'2022-06-10', description:'Simple Assault — altercation outside a bar, no weapons involved', city:'Columbus', county:'Franklin', state:'OH', disposition:'Convicted — Misdemeanor, $250 fine, 12-month unsupervised probation', courtDocs:true, incidentRpt:true }],
    screening:{ offenseId:'misc_other', is_adult:'yes', disposition:'convicted', pending_charges:'no', civil_restraint:'no', major_count:'0', lautenberg:'no', sex_offender:'no', confinement_days:'no', probation_minor:'no' }
  },
  {
    id:'s2', title:'DUI — Most Common Waiver', tag:'BN CO',
    applicant:{ lastName:'Sample', firstName:'Jane', mi:'K', ssn:'000-00-0002', dob:'2000-08-22', rsid:'RS0002', educationLevel:'Some College (No Degree)', afqt:'61' },
    offenses:[{ id:'o2', date:'2023-01-14', description:'DUI — BAC 0.09, no accident, no injury, traffic stop', city:'Nashville', county:'Davidson', state:'TN', disposition:'Convicted — Misdemeanor, $500 fine, 6-month suspended license', courtDocs:true, incidentRpt:true }],
    screening:{ offenseId:'misc_dui', is_adult:'yes', disposition:'convicted', pending_charges:'no', civil_restraint:'no', major_count:'0', lautenberg:'no', sex_offender:'no', confinement_days:'no', probation_minor:'no' }
  },
  {
    id:'s3', title:'Grand Theft — Juvenile Felony', tag:'USAREC CG',
    applicant:{ lastName:'Recruit', firstName:'Marcus', mi:'T', ssn:'000-00-0003', dob:'2003-11-05', rsid:'RS0003', educationLevel:'HS Diploma', afqt:'58' },
    offenses:[{ id:'o3', date:'2019-09-03', description:'Grand Theft — shoplifting $620 merchandise, committed at age 16', city:'Phoenix', county:'Maricopa', state:'AZ', disposition:'Adjudicated Juvenile — adverse disposition, 60 hrs community service, no confinement', courtDocs:true, incidentRpt:true }],
    screening:{ offenseId:'juvenile', is_adult:'no', disposition:'adverse', pending_charges:'no', civil_restraint:'no', major_count:'0', lautenberg:'no', sex_offender:'no', confinement_days:'no', probation_minor:'no' }
  },
  {
    id:'s4', title:'Marijuana Possession x2', tag:'USAREC CG',
    applicant:{ lastName:'Test', firstName:'Alex', mi:'R', ssn:'000-00-0004', dob:'1999-04-17', rsid:'RS0004', educationLevel:'GED', afqt:'44' },
    offenses:[
      { id:'o4a', date:'2021-07-22', description:'Marijuana possession — approx 5g personal use', city:'Atlanta', county:'Fulton', state:'GA', disposition:'Convicted — Misdemeanor, $200 fine', courtDocs:true, incidentRpt:true },
      { id:'o4b', date:'2020-03-11', description:'Marijuana possession — paraphernalia (pipe)', city:'Atlanta', county:'Fulton', state:'GA', disposition:'Convicted — Misdemeanor, $100 fine', courtDocs:true, incidentRpt:true }
    ],
    screening:{ offenseId:'misc_marijuana', is_adult:'yes', disposition:'convicted', pending_charges:'no', civil_restraint:'no', major_count:'0', lautenberg:'no', sex_offender:'no', confinement_days:'no', probation_minor:'no' }
  },
  {
    id:'s5', title:'Drug Distribution — Felony', tag:'DMPM — Highest Level',
    applicant:{ lastName:'Candidate', firstName:'Chris', mi:'D', ssn:'000-00-0005', dob:'1997-12-30', rsid:'RS0005', educationLevel:'HS Diploma', afqt:'67' },
    offenses:[{ id:'o5', date:'2020-11-08', description:'Felony drug distribution — cannabis, 28g, exchange for cash, adult (age 22)', city:'Houston', county:'Harris', state:'TX', disposition:'Convicted — Felony, 18-month supervised probation (completed Jan 2022), no confinement', courtDocs:true, incidentRpt:true }],
    screening:{ offenseId:'major_drug_dist', is_adult:'yes', disposition:'convicted', pending_charges:'no', civil_restraint:'no', major_count:'1', lautenberg:'no', sex_offender:'no', confinement_days:'no', probation_minor:'no' }
  }
];

window.PARA_TEXT = {
  '4-22b':  'Persons who are, or have been, alcohol dependent are not eligible to enlist unless they have been in sustained remission for at least 12 consecutive months prior to enlistment.',
  '4-22c':  'Persons who are, or have been, drug dependent (including marijuana) are not eligible to enlist unless they have been in sustained remission for at least 12 consecutive months prior to enlistment.',
  '4-22g':  'Applicant with any pending criminal or juvenile charge, including referral to or pending action by a juvenile authority, is ineligible for enlistment. Processing may not begin until all charges are resolved.',
  '4-22h':  'Applicant currently under civil restraint — defined as confinement, parole, or probation — is ineligible for enlistment processing. Exception: unsupervised probation for minor offenses listed in paragraph 4-35.',
  '4-22i':  'Applicants who have been convicted of two or more offenses classified as major misconduct are permanently disqualified. No waiver authority exists.',
  '4-22j':  'Persons convicted of rape, carnal knowledge, sodomy, prostitution involving a minor, indecent assault, pornography involving a minor, or any offense that required registration as a sex offender are permanently disqualified.',
  '4-22k':  'Persons convicted of murder (intentional homicide) are permanently disqualified. No waiver authority exists.',
  '4-27':   'A waiver approval is valid for 6 months from the date of approval. If the applicant acquires additional moral disqualifications after approval, the waiver must be resubmitted for reconsideration.',
  '4-28':   'Prior to waiver submission, the recruiter will collect: (a) all source documents; (b) police incident report for all non-traffic offenses; (c) court documents — information/charging, finding/sentencing, final disposition; (d) DD 369s for work, live, and school locations covering the past 3 years plus all locations where offenses occurred (must be under 6 months old); (e) applicant\'s written statement; (f) company commander\'s interview MFR; (g) DD Form 1966 and SF 86; (h) UF 601-210.08 with all law violations listed and asterisks next to offense(s) being waived.',
  '4-28e4': 'At USAREC and DMPM levels: DD Form 370 (Request for Reference) is required — 3 references from employers covering 1 year prior to application and from schools attended in the 3 years prior. NOT required at BN level.',
  '4-28e5': 'For major misconduct waivers: DD Form 2808 (Genesis Report / MEPS physical) is required.',
  '4-30':   'When no court record of a specific offense exists and there is no adverse disposition, a waiver is not required. For self-admittal cases with no court record, an exception to policy may be required before a waiver can be submitted.',
  '4-31':   'Mandatory waiting periods following release from confinement: (a) Confinement under 15 days — 3-month wait (BN CO may waive up to 45 days of this period); (b) Confinement 15 days or more — 6-month wait (BN CO may waive up to 3 months of this period). All court-ordered requirements must be completed before waiver submission.',
  '4-35':   'Persons on unsupervised probation for minor offenses as designated by the CG, USAREC (including minor traffic violations, minor misdemeanors with no confinement imposed) may be processed and enlisted without waiting for the probationary period to expire.',
};

window.ED_LEVELS = [
  'No HS Diploma / No GED',
  'GED',
  'HS Diploma',
  'Some College (No Degree)',
  'Associates Degree',
  'Bachelors Degree',
  'Graduate Degree'
];

window.US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
];

})();
