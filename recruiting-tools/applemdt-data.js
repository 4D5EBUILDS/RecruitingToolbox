/**
 * APPLE MDT Pre-Qualification Tool - Data Layer
 * Provides all regulation data, screening tables, guidance, talk tracks, and conditional logic.
 * Exposes variables on the window namespace for the React application.
 */

(function () {
  // Helper to calculate age from DOB
  const calcAge = (dob) => {
    if (!dob) return null;
    const d = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age;
  };

  // ─── SECTION DEFINITIONS ───────────────────────────────────────────────────
  window.APPLEMDT_SECTIONS = [
    { id: 'age', letter: 'A', title: 'Age', icon: '📅' },
    { id: 'prior_service', letter: 'P', title: 'Prior Service', icon: '🎖️' },
    { id: 'physical', letter: 'P', title: 'Physical (Ht/Wt)', icon: '⚖️' },
    { id: 'legal', letter: 'L', title: 'Legal', icon: '⚖️' },
    { id: 'education', letter: 'E', title: 'Education', icon: '🎓' },
    { id: 'medical', letter: 'M', title: 'Medical', icon: '🏥' },
    { id: 'dependents', letter: 'D', title: 'Dependents', icon: '👨‍👩‍👧‍👦' },
    { id: 'tattoos', letter: 'T', title: 'Tattoos', icon: '✒️' },
    { id: 'citizenship', letter: 'C', title: 'Citizenship', icon: '🌐' },
  ];

  // ─── AGE SECTION ───────────────────────────────────────────────────────────
  window.APPLEMDT_AGE = {
    questions: [
      "What is your date of birth?",
      "Are you currently married? (Married 17-year-olds do not require parental consent)"
    ],
    rules: [
      {
        id: 'age_under_17',
        condition: (lead) => {
          const age = calcAge(lead.age.dob);
          return age !== null && age < 17;
        },
        status: 'red',
        title: 'Not Eligible — Under Minimum Age',
        guidance: 'Applicant must be at least 17 years old to enlist. Processing cannot start until their 17th birthday.',
        cite: 'AR 601-210, para 2-3',
        talkTrack: "I appreciate your interest in the Army! Unfortunately, you need to be at least 17 to start the enlistment process. Let's stay in touch — I'd love to work with you when you're eligible. Can I get your contact info to follow up?"
      },
      {
        id: 'age_minor_17',
        condition: (lead) => {
          const age = calcAge(lead.age.dob);
          return age === 17 && !lead.age.married;
        },
        status: 'gold',
        title: 'Minor — Parental Consent Required',
        guidance: 'Applicant is 17 years old. Written parental/legal guardian consent is required on DD Form 1966. BOTH parents must sign unless sole legal custody is established by a court order. Consent cannot be obtained more than 30 days before their 17th birthday. If EITHER parent objects, enlistment is NOT authorized.',
        cite: 'AR 601-210, para 2-4',
        talkTrack: "Great news — you're eligible to start the process! Since you're 17, we'll need your parent or legal guardian to sign some paperwork. Do both of your parents support your decision? That's important because we'll need consent from both unless one parent has sole legal custody.",
        actionItems: [
          'Obtain DD Form 1966 with parental signatures',
          'If divorced parents: verify custody arrangement and obtain court decree',
          'If one parent objects: enlistment cannot proceed',
          'Verify consent obtained within 30 days of 17th birthday'
        ]
      },
      {
        id: 'age_minor_17_married',
        condition: (lead) => {
          const age = calcAge(lead.age.dob);
          return age === 17 && lead.age.married;
        },
        status: 'green',
        title: 'Minor but Married — No Parental Consent Needed',
        guidance: 'A married, legally separated, or divorced 17-year-old may enlist without parental consent. Must provide a marriage certificate, separation agreement, or divorce decree.',
        cite: 'AR 601-210, para 2-4',
        talkTrack: "Since you're married, you can enlist without parental consent. We'll just need a copy of your marriage certificate or legal papers.",
        actionItems: ['Obtain marriage license/certificate or divorce decree']
      },
      {
        id: 'age_eligible_18_42',
        condition: (lead) => {
          const age = calcAge(lead.age.dob);
          return age !== null && age >= 18 && age <= 42;
        },
        status: 'green',
        title: 'Age Qualified',
        guidance: 'Applicant meets age requirements for enlistment (18-42).',
        cite: 'AR 601-210, para 2-3'
      },
      {
        id: 'age_over_42_nps',
        condition: (lead) => {
          const age = calcAge(lead.age.dob);
          return age !== null && age > 42 && !lead.priorService.isPriorService;
        },
        status: 'red',
        title: 'Over Maximum Age (42) — Disqualified',
        guidance: 'Applicant exceeds the maximum enlistment age of 42. Since they have no prior military service, they are not eligible. Age waivers are extremely rare for non-prior service.',
        cite: 'AR 601-210, para 2-3',
        talkTrack: "The current maximum enlistment age is 42. Since you haven't served in the military before, we aren't able to process an age waiver. I appreciate your willingness to serve."
      },
      {
        id: 'age_over_42_ps_qualified',
        condition: (lead) => {
          const age = calcAge(lead.age.dob);
          if (age === null || age <= 42 || !lead.priorService.isPriorService) return false;
          const yos = parseInt(lead.priorService.yearsOfService) || 0;
          return (age - yos) < 43;
        },
        status: 'green',
        title: 'Age Qualified (Adjusted for Prior Service)',
        guidance: 'Applicant is over 42, but subtracting their active duty years of service from their current age yields an adjusted age of under 43. Qualified under prior service age adjustment rules.',
        cite: 'AR 601-210, para 2-3',
        talkTrack: "Because of your prior military service, we can subtract your years of service from your current age. That brings your adjusted age to under 43, which makes you qualified!"
      },
      {
        id: 'age_over_42_ps_dq',
        condition: (lead) => {
          const age = calcAge(lead.age.dob);
          if (age === null || age <= 42 || !lead.priorService.isPriorService) return false;
          const yos = parseInt(lead.priorService.yearsOfService) || 0;
          return (age - yos) >= 43;
        },
        status: 'blue',
        title: 'Over Max Age — Prior Service Waiver Required',
        guidance: 'Applicant\'s adjusted age (current age minus prior service years) is 43 or older. An age waiver is required (USAREC CG authority).',
        cite: 'AR 601-210, para 2-3',
        talkTrack: "Even after subtracting your prior service years, your adjusted age is 43 or older. We can still try to submit an age waiver to USAREC headquarters. It will depend on the needs of the Army and your overall qualifications."
      }
    ]
  };

  // ─── PRIOR SERVICE SECTION ─────────────────────────────────────────────────
  window.APPLEMDT_PRIOR_SERVICE = {
    questions: [
      "Do you have prior service in any military branch (active duty, guard, or reserve)?",
      "What is your reenlistment (RE) code on your DD-214?",
      "What was your narrative reason for separation?",
      "Are you still in the reserves or have any military service obligation (MSO) remaining?"
    ],
    rules: [
      {
        id: 'ps_nps',
        condition: (lead) => !lead.priorService.isPriorService,
        status: 'green',
        title: 'Non-Prior Service (NPS) Qualified',
        guidance: 'Applicant has no prior military service. Standard enlistment criteria apply.',
        cite: 'AR 601-210, Ch 2'
      },
      {
        id: 'ps_re1',
        condition: (lead) => lead.priorService.isPriorService && lead.priorService.reCode === 'RE-1',
        status: 'green',
        title: 'RE-1: Fully Qualified for Reenlistment',
        guidance: 'Applicant separated with an RE-1 code. Fully qualified for reenlistment in any component, subject to normal administrative processing.',
        cite: 'AR 601-210, Table 3-1',
        talkTrack: "Your RE-1 code is the best possible code. You're fully qualified to reenlist, and we just need to verify your DD-214 and medical status."
      },
      {
        id: 'ps_re2',
        condition: (lead) => lead.priorService.isPriorService && lead.priorService.reCode === 'RE-2',
        status: 'gold',
        title: 'RE-2: Verification of Eligibility Required',
        guidance: 'Applicant separated with an RE-2 code. RE-2 is waivable or qualified depending on the separation reason on the DD-214. Check the separation designator code (SPD) and narrative reason for separation to ensure the underlying disqualifier has been resolved.',
        cite: 'AR 601-210, Table 3-1',
        talkTrack: "An RE-2 code is workable, but we need to check the exact reason for separation on your DD-214 to make sure the issue is resolved. Do you have a copy of your DD-214 Member-4 copy?",
        actionItems: ['Obtain and review DD-214 Member-4 copy', 'Verify narrative reason and SPD code']
      },
      {
        id: 'ps_re3',
        condition: (lead) => lead.priorService.isPriorService && lead.priorService.reCode === 'RE-3',
        status: 'blue',
        title: 'RE-3: Reenlistment Waiver Required',
        guidance: 'Applicant separated with an RE-3 code. A reenlistment waiver is required, with USAREC CG as the waiver authority. Generally requires a 90-day waiting period from the date of separation before processing can begin. Must show that the condition leading to discharge no longer exists.',
        cite: 'AR 601-210, Ch 3 & Ch 6',
        talkTrack: "An RE-3 code requires a reenlistment waiver. This is very common, and we process them all the time. There is normally a 90-day wait from your separation date before we can submit. What was the reason listed for your discharge?",
        actionItems: [
          'Obtain DD-214 Member-4 copy',
          'Obtain all medical/disciplinary records relating to separation',
          'Wait 90 days from separation date before submitting waiver'
        ]
      },
      {
        id: 'ps_re4',
        condition: (lead) => lead.priorService.isPriorService && lead.priorService.reCode === 'RE-4',
        status: 'red',
        title: 'RE-4: Disqualified — Generally Non-Waivable',
        guidance: 'Applicant separated with an RE-4 code. RE-4 is a bar to enlistment and is generally non-waivable. Exceptions are extremely rare and require Secretarial-level Exception to Policy or correction of military records by the discharge review board.',
        cite: 'AR 601-210, Table 3-1',
        talkTrack: "An RE-4 code means you are currently ineligible to reenlist, and we cannot process a waiver for it. Your main option would be to apply to the Board for Correction of Military Records (BCMR) or Discharge Review Board to have the RE code upgraded. If they upgrade it, we can work with you."
      },
      {
        id: 'ps_mso',
        condition: (lead) => lead.priorService.isPriorService && lead.priorService.hasMSO,
        status: 'gold',
        title: 'MSO Remaining — DD Form 368 Required',
        guidance: 'Applicant has a remaining Military Service Obligation (MSO). A DD Form 368 (Conditional Release) must be approved by their current reserve component or branch before they can enlist in the active component.',
        cite: 'AR 601-210, para 3-5',
        talkTrack: "Since you still have MSO remaining, we'll need to submit a DD Form 368 Conditional Release to your current unit command. They have to sign off on releasing you to the Active Duty Army. Let's get that form started.",
        actionItems: ['Prepare DD Form 368', 'Submit to applicant\'s current Unit Administrator/Commander']
      },
      {
        id: 'ps_break_90',
        condition: (lead) => {
          if (!lead.priorService.isPriorService || !lead.priorService.separationDate) return false;
          const sep = new Date(lead.priorService.separationDate);
          const now = new Date();
          const diffDays = (now - sep) / (1000 * 60 * 60 * 24);
          return diffDays < 90 && lead.priorService.reCode === 'RE-3';
        },
        status: 'amber',
        title: 'Within 90-Day Separation Window',
        guidance: 'Applicant is less than 90 days from separation. Per USAREC regulation, RE-3 waivers cannot be processed or submitted until 90 days have elapsed since the separation date.',
        cite: 'USAREC Message 22-045',
        talkTrack: "Because you separated recently, we have to wait until you've been out for at least 90 days before we can submit the RE-3 waiver. Let's gather all your paperwork now so we're ready to submit the day you hit 90 days."
      }
    ]
  };

  // ─── PHYSICAL SECTION ──────────────────────────────────────────────────────
  // Helper to look up max screening weight
  const getMaxWeight = (gender, height, dob) => {
    const h = parseInt(height);
    if (!h || h < 58 || h > 80) return null;
    const age = calcAge(dob);
    if (age === null) return null;
    const table = window.APPLEMDT_PHYSICAL.screeningWeights[gender] || [];
    const row = table.find(r => r.height === h);
    if (!row) return null;
    if (age >= 17 && age <= 20) return row.ages[0];
    if (age >= 21 && age <= 27) return row.ages[1];
    if (age >= 28 && age <= 39) return row.ages[2];
    if (age >= 40) return row.ages[3];
    return null;
  };

  window.APPLEMDT_PHYSICAL = {
    questions: [
      "What is your current height and weight?",
      "Have you ever been taped for body fat? What is your neck and waist measurement?"
    ],
    screeningWeights: {
      male: [
        { height: 58, ages: [109, 113, 116, 118] },
        { height: 59, ages: [114, 117, 121, 123] },
        { height: 60, ages: [118, 122, 125, 127] },
        { height: 61, ages: [123, 127, 130, 132] },
        { height: 62, ages: [128, 131, 135, 137] },
        { height: 63, ages: [133, 136, 140, 142] },
        { height: 64, ages: [137, 141, 145, 147] },
        { height: 65, ages: [142, 146, 150, 152] },
        { height: 66, ages: [147, 151, 155, 158] },
        { height: 67, ages: [152, 156, 161, 163] },
        { height: 68, ages: [157, 161, 166, 169] },
        { height: 69, ages: [162, 166, 171, 174] },
        { height: 70, ages: [167, 172, 177, 179] },
        { height: 71, ages: [173, 177, 182, 185] },
        { height: 72, ages: [178, 183, 188, 191] },
        { height: 73, ages: [183, 188, 194, 197] },
        { height: 74, ages: [189, 194, 200, 203] },
        { height: 75, ages: [194, 200, 206, 209] },
        { height: 76, ages: [200, 206, 212, 216] },
        { height: 77, ages: [206, 212, 219, 222] },
        { height: 78, ages: [212, 218, 225, 229] },
        { height: 79, ages: [218, 225, 232, 236] },
        { height: 80, ages: [224, 231, 239, 243] }
      ],
      female: [
        { height: 58, ages: [109, 112, 115, 119] },
        { height: 59, ages: [113, 116, 119, 123] },
        { height: 60, ages: [117, 120, 123, 128] },
        { height: 61, ages: [121, 124, 128, 132] },
        { height: 62, ages: [126, 129, 133, 137] },
        { height: 63, ages: [130, 134, 138, 142] },
        { height: 64, ages: [135, 138, 143, 147] },
        { height: 65, ages: [139, 143, 148, 152] },
        { height: 66, ages: [144, 148, 153, 158] },
        { height: 67, ages: [149, 153, 159, 163] },
        { height: 68, ages: [154, 158, 164, 169] },
        { height: 69, ages: [159, 163, 170, 174] },
        { height: 70, ages: [164, 169, 175, 180] },
        { height: 71, ages: [170, 174, 181, 186] },
        { height: 72, ages: [175, 180, 187, 192] },
        { height: 73, ages: [181, 186, 194, 199] },
        { height: 74, ages: [187, 192, 200, 205] },
        { height: 75, ages: [193, 198, 207, 212] },
        { height: 76, ages: [199, 205, 214, 219] },
        { height: 77, ages: [206, 211, 221, 227] },
        { height: 78, ages: [212, 218, 229, 234] },
        { height: 79, ages: [219, 225, 236, 242] },
        { height: 80, ages: [226, 232, 244, 250] }
      ]
    },
    bodyFatMax: {
      male: { '17-20': 20, '21-27': 22, '28-39': 24, '40+': 26 },
      female: { '17-20': 30, '21-27': 32, '28-39': 34, '40+': 36 }
    },
    rules: [
      {
        id: 'phys_height_out',
        condition: (lead) => {
          const h = parseInt(lead.physical.heightInches);
          return h > 0 && (h < 58 || h > 80);
        },
        status: 'gold',
        title: 'Height Outside Standard Range (58-80")',
        guidance: 'Applicant\'s height is outside standard limits. Enlistment requires a Chief Medical Officer (CMO) waiver at MEPS.',
        cite: 'AR 40-501, Ch 2',
        talkTrack: "The standard height range is between 58 and 80 inches. Since you fall outside this, we'll need to submit a CMO height waiver when we go to MEPS. As long as you're otherwise healthy, these are very common and often approved."
      },
      {
        id: 'phys_underweight',
        condition: (lead) => {
          const h = parseInt(lead.physical.heightInches);
          const w = parseInt(lead.physical.weightLbs);
          return h > 0 && w > 0 && w < 100;
        },
        status: 'gold',
        title: 'Low Weight / Potential BMI Issue',
        guidance: 'Applicant weight is under 100 lbs. Check BMI at MEPS. A BMI under 17.5 is disqualifying without a medical waiver.',
        cite: 'AR 40-501, Ch 2',
        talkTrack: "Since your weight is under 100 lbs, we'll need to ensure your Body Mass Index (BMI) is at least 17.5. If it's lower, we can look into a medical waiver, or work on a healthy nutrition plan to help you gain a few pounds."
      },
      {
        id: 'phys_overweight',
        condition: (lead) => {
          const max = getMaxWeight(lead.physical.gender, lead.physical.heightInches, lead.age.dob);
          const w = parseInt(lead.physical.weightLbs);
          return max !== null && w > max;
        },
        status: 'gold',
        title: 'Over Screening Weight — Body Fat Tape Required',
        guidance: 'Applicant exceeds screening weight standard. Must conduct body fat tape assessment. Maximum body fat standards: Male: 17-20: 20%, 21-27: 22%, 28-39: 24%, 40+: 26%. Female: 17-20: 30%, 21-27: 32%, 28-39: 34%, 40+: 36%. If within 6% (male) or 8% (female) of the body fat standard, applicant may qualify for the Future Soldier Preparatory Course (FSPC).',
        cite: 'AR 600-9, para 3-2',
        talkTrack: "You're slightly over the screening weight limit, which is very common! This just means we'll do a quick tape measurement of your neck and waist to find your body fat percentage. If you're within the body fat standard, or close enough to qualify for the Future Soldier Prep Course, you can still enlist.",
        actionItems: ['Conduct tape measurement (AR 600-9)', 'Calculate body fat percentage', 'Assess eligibility for FSPC Physical Track']
      },
      {
        id: 'phys_qualified',
        condition: (lead) => {
          const max = getMaxWeight(lead.physical.gender, lead.physical.heightInches, lead.age.dob);
          const w = parseInt(lead.physical.weightLbs);
          return max !== null && w <= max;
        },
        status: 'green',
        title: 'Weight Qualified',
        guidance: 'Applicant\'s weight meets the screening weight standards for height, age, and gender. No tape test required.',
        cite: 'AR 600-9'
      }
    ]
  };

  // ─── LEGAL SECTION ─────────────────────────────────────────────────────────
  window.APPLEMDT_LEGAL = {
    questions: [
      "Have you ever been arrested, cited, charged, or had contact with law enforcement, even as a juvenile?",
      "Have you ever had a charge dismissed, expunged, sealed, or set aside?",
      "Are you currently under civil restraint (probation, parole, community service, or pending court dates)?",
      "How many times in your life have you ever used marijuana or other substances?"
    ],
    offenseTypes: [
      { id: 'minor_traffic', name: 'Minor Traffic Violation', category: 'Traffic', authority: 'None', cite: 'AR 601-210, para 4-35', details: 'Speeding (under 20mph over limit), seatbelt violations, minor tickets.' },
      { id: 'mj_possession', name: 'Marijuana Possession (Single)', category: 'Misconduct', authority: 'None', cite: 'AR 601-210, para 4-6', details: 'Single charge of possession of marijuana under 2026 update, no waiver required if resolved.' },
      { id: 'dui', name: 'DUI / DWI', category: 'Misconduct', authority: 'Battalion Commander / USAREC', cite: 'AR 601-210, para 4-8', details: 'Driving Under the Influence or Driving While Intoxicated.' },
      { id: 'petty_theft', name: 'Petty Theft / Shoplifting', category: 'Misconduct', authority: 'Battalion Commander', cite: 'AR 601-210, para 4-11', details: 'Theft of property/goods valued under $500 depending on jurisdiction.' },
      { id: 'domestic_violence', name: 'Domestic Violence (Lautenberg)', category: 'Major Misconduct / Bar', authority: 'None (Bar)', cite: '18 USC § 922(g)(9)', details: 'Misdemeanor or felony domestic violence conviction. Absolute bar to enlisting.' },
      { id: 'sex_offense', name: 'Sex Offense', category: 'Major Misconduct / Bar', authority: 'None (Bar)', cite: 'AR 601-210, para 4-22j', details: 'Rape, sexual assault, or any offense requiring sex offender registration. Absolute bar.' },
      { id: 'murder', name: 'Murder / Manslaughter', category: 'Major Misconduct / Bar', authority: 'None (Bar)', cite: 'AR 601-210, para 4-22', details: 'Murder, attempted murder, or manslaughter conviction. Absolute bar.' },
      { id: 'felony_assault', name: 'Felony Assault', category: 'Major Misconduct', authority: 'USAREC / DMPM', cite: 'AR 601-210, Ch 4', details: 'Assault with a deadly weapon or causing serious bodily injury.' },
      { id: 'drug_possession_other', name: 'Drug Possession (Non-Marijuana)', category: 'Major Misconduct', authority: 'USAREC / DMPM', cite: 'AR 601-210, Ch 4', details: 'Possession of schedule I-V drugs other than marijuana.' }
    ],
    rules: [
      {
        id: 'legal_clean',
        condition: (lead) => !lead.legal.hasViolations,
        status: 'green',
        title: 'No Law Violations',
        guidance: 'Applicant reports no law violations or arrests.',
        cite: 'AR 601-210, Ch 4'
      },
      {
        id: 'legal_pending',
        condition: (lead) => lead.legal.hasViolations && lead.legal.pendingCharges,
        status: 'red',
        title: 'Pending Charges — Processing Barred',
        guidance: 'Applicant has pending charges, open court cases, or unresolved citations. Processing is strictly prohibited until all charges are fully resolved, court costs are paid, and any probation/confinement is completed.',
        cite: 'AR 601-210, para 4-22g',
        talkTrack: "The Army cannot process your application while you have any open court cases or pending charges. Once the charges are resolved and court case is closed, we can proceed. Let me know when that happens, and we'll pick back up.",
        actionItems: ['Instruct lead to resolve court issues and pay outstanding fines', 'Request official court disposition papers once closed']
      },
      {
        id: 'legal_civil_restraint',
        condition: (lead) => lead.legal.hasViolations && lead.legal.civilRestraint,
        status: 'red',
        title: 'Civil Restraint — Processing Barred',
        guidance: 'Applicant is under civil restraint (probation, parole, community service, or suspended sentence). Processing is barred until all civil restraint is officially terminated by court order or completion of sentence.',
        cite: 'AR 601-210, para 4-22h',
        talkTrack: "Since you're currently on probation, we have to wait until you are completely off probation before we can process your application. Once you complete it and have court documents showing it's closed, we can proceed.",
        actionItems: ['Obtain court order terminating probation/restraint', 'Verify completion of sentence']
      },
      {
        id: 'legal_absolute_bar',
        condition: (lead) => {
          if (!lead.legal.hasViolations) return false;
          return lead.legal.offenses.some(o => ['murder', 'sex_offense', 'domestic_violence'].includes(o.typeId));
        },
        status: 'red',
        title: 'Absolute Bar to Enlistment',
        guidance: 'Applicant has a conviction or charge that is an absolute bar to enlistment (e.g. Murder, Sex Offense, or Domestic Violence/Lautenberg Amendment). No waiver authority exists at any level.',
        cite: 'AR 601-210, para 4-22 & 18 USC § 922(g)(9)',
        talkTrack: "Unfortunately, due to federal laws and Army regulations regarding this specific type of offense, there is an absolute bar to enlisting, and no waivers are authorized. I cannot process your application.",
        actionItems: ['Inform applicant they are permanently disqualified', 'Close out lead profile']
      },
      {
        id: 'legal_multiple_felonies',
        condition: (lead) => {
          if (!lead.legal.hasViolations) return false;
          const felonies = lead.legal.offenses.filter(o => ['felony_assault', 'drug_possession_other'].includes(o.typeId))
            .reduce((acc, curr) => acc + (curr.count || 1), 0);
          return felonies >= 2;
        },
        status: 'red',
        title: 'Multiple Felonies — Absolute Bar',
        guidance: 'Applicant has 2 or more felony-level offenses. Conviction or adverse disposition of 2 or more felonies is a permanent bar to enlistment. Waiver is not authorized.',
        cite: 'AR 601-210, para 4-22'
      },
      {
        id: 'legal_dui_rule',
        condition: (lead) => {
          if (!lead.legal.hasViolations) return false;
          return lead.legal.offenses.some(o => o.typeId === 'dui');
        },
        status: 'blue',
        title: 'DUI / DWI — Moral Waiver Required',
        guidance: 'Applicant has a DUI/DWI offense. A moral waiver is required. Authority is typically USAREC CG or Battalion Commander depending on separation timeframe and number of offenses.',
        cite: 'AR 601-210, para 4-8',
        talkTrack: "A DUI does require a moral waiver, but it is waivable. We'll need the court documents, police report, and you'll write a statement explaining what happened. It shows character to own up to past mistakes.",
        actionItems: ['Obtain court dockets', 'Obtain police incident report', 'Draft applicant statement (handwritten)', 'Draft commander interview memo']
      },
      {
        id: 'legal_single_mj_pos',
        condition: (lead) => {
          if (!lead.legal.hasViolations) return false;
          const singleMJ = lead.legal.offenses.filter(o => o.typeId === 'mj_possession');
          return singleMJ.length === 1 && lead.legal.offenses.length === 1 && singleMJ[0].count === 1;
        },
        status: 'green',
        title: 'Single MJ Possession — Qualified',
        guidance: 'Under the latest policy update, a single minor marijuana possession charge does not require a moral waiver, provided there are no other offenses and it has been fully resolved.',
        cite: 'AR 601-210, para 4-6',
        actionItems: ['Obtain court disposition showing charge is resolved and closed']
      },
      {
        id: 'legal_minor_traffic_only',
        condition: (lead) => {
          if (!lead.legal.hasViolations || lead.legal.offenses.length === 0) return false;
          return lead.legal.offenses.every(o => o.typeId === 'minor_traffic');
        },
        status: 'green',
        title: 'Minor Traffic Only — Qualified',
        guidance: 'Applicant only has minor traffic violations. No moral waiver is required, provided they are resolved and fines are paid.',
        cite: 'AR 601-210, para 4-35'
      },
      {
        id: 'legal_drug_use_regular',
        condition: (lead) => lead.legal.drugHistory === 'regular',
        status: 'red',
        title: 'Regular / Habitual Drug Use — Disqualified',
        guidance: 'Applicant reports regular or habitual drug use. This is disqualifying and generally non-waivable. Check if they have been drug-free for a significant period or if they require rehab documentation.',
        cite: 'AR 601-210, Ch 4',
        talkTrack: "Based on the frequency of drug use you reported, Army regulations currently disqualify you from enlistment. We cannot process a waiver for habitual drug use. I recommend staying clean and in touch."
      },
      {
        id: 'legal_drug_use_occasional',
        condition: (lead) => lead.legal.drugHistory === 'occasional',
        status: 'gold',
        title: 'Occasional Drug Use — Screening Required',
        guidance: 'Applicant reports occasional drug use (6-25 times). Requires screening and a self-admitted drug usage statement. Drug test at MEPS will be critical.',
        cite: 'AR 601-210, Ch 4'
      },
      {
        id: 'legal_drug_use_experimental',
        condition: (lead) => lead.legal.drugHistory === 'experimental',
        status: 'green',
        title: 'Experimental Drug Use — Qualified',
        guidance: 'Applicant reports experimental drug use (1-5 times). Within acceptable screening limits. No waiver required, but must be documented on security screening.',
        cite: 'AR 601-210, Ch 4'
      }
    ]
  };

  // ─── EDUCATION SECTION ─────────────────────────────────────────────────────
  window.APPLEMDT_EDUCATION = {
    questions: [
      "What is your highest level of education completed?",
      "Do you have a high school diploma or a GED?",
      "Have you completed any college credits? How many?",
      "Have you ever taken the ASVAB? What was your AFQT score?"
    ],
    rules: [
      {
        id: 'ed_tier1',
        condition: (lead) => {
          const level = lead.education.level;
          const credits = parseInt(lead.education.collegeCredits) || 0;
          return ['high_school', 'some_college', 'associates', 'bachelors', 'masters_plus'].includes(level) || credits >= 15;
        },
        status: 'green',
        title: 'Tier 1 Education Status',
        guidance: 'Applicant is a Tier 1 education candidate (HS Diploma or 15+ college credits). AFQT minimum score of 31 is required for enlistment.',
        cite: 'AR 601-210, para 2-7'
      },
      {
        id: 'ed_tier2',
        condition: (lead) => {
          const level = lead.education.level;
          const credits = parseInt(lead.education.collegeCredits) || 0;
          const isGED = level === 'ged' || lead.education.hasGED;
          return isGED && credits < 15;
        },
        status: 'gold',
        title: 'Tier 2 Education Status (GED)',
        guidance: 'Applicant is a Tier 2 education candidate (GED only). Tier 2 applicants require a higher AFQT minimum score of 50. Suggest earning 15+ college credits to upgrade to Tier 1.',
        cite: 'AR 601-210, para 2-7',
        talkTrack: "Since you have a GED, you'll need to score at least a 50 on the ASVAB. Another option is to earn 15 college credits, which would upgrade you to a Tier 1 status. Tier 1 has a lower minimum score requirement and more job openings.",
        actionItems: ['Obtain official GED certificate and transcript', 'Assess capability to complete 15 college credits']
      },
      {
        id: 'ed_homeschool',
        condition: (lead) => {
          return lead.education.level === 'home_school' || lead.education.homeSchool;
        },
        status: 'gold',
        title: 'Home School — Tier 1 Verification Required',
        guidance: 'Home schooled applicants are considered Tier 1 IF the curriculum is state-compliant and verified. Document state compliance, curriculum materials, and graduation certificate.',
        cite: 'AR 601-210, Ch 2',
        actionItems: [
          'Verify state compliance laws for home schooling',
          'Obtain parent-signed transcript and diploma',
          'Complete Home School Verification Form'
        ]
      },
      {
        id: 'ed_tier3',
        condition: (lead) => {
          const level = lead.education.level;
          const credits = parseInt(lead.education.collegeCredits) || 0;
          return level === 'no_diploma' && !lead.education.hasGED && credits < 15;
        },
        status: 'red',
        title: 'Tier 3 — No Credential (Disqualified)',
        guidance: 'Applicant is a Tier 3 candidate (no high school credential). Tier 3 enlistments are extremely restricted and generally closed. Strongly recommend obtaining a GED or completing high school before processing.',
        cite: 'AR 601-210, para 2-7',
        talkTrack: "Right now, the Army is only accepting applicants with a high school diploma or a GED. I highly encourage you to finish your diploma or study for a GED, and then we'd be thrilled to help you enlist."
      },
      {
        id: 'ed_afqt_low_tier1',
        condition: (lead) => {
          const level = lead.education.level;
          const credits = parseInt(lead.education.collegeCredits) || 0;
          const isTier1 = ['high_school', 'some_college', 'associates', 'bachelors', 'masters_plus'].includes(level) || credits >= 15;
          const afqt = parseInt(lead.education.afqt);
          return isTier1 && afqt > 0 && afqt < 31;
        },
        status: 'red',
        title: 'AFQT Below Minimum (Tier 1)',
        guidance: 'Applicant score ({lead.education.afqt}) is below the Tier 1 minimum of 31. Recommend study and prep for retesting after 30 days.',
        cite: '10 USC § 520',
        talkTrack: "You scored a {lead.education.afqt} on the ASVAB, which is just below the minimum of 31 needed for a high school graduate. Don't worry, you can retake the test in 30 days. I have some great study guides and prep tools that can help you raise your score."
      },
      {
        id: 'ed_afqt_low_tier2',
        condition: (lead) => {
          const level = lead.education.level;
          const credits = parseInt(lead.education.collegeCredits) || 0;
          const isGED = level === 'ged' || lead.education.hasGED;
          const isTier2 = isGED && credits < 15;
          const afqt = parseInt(lead.education.afqt);
          return isTier2 && afqt > 0 && afqt < 50;
        },
        status: 'red',
        title: 'AFQT Below Minimum (Tier 2)',
        guidance: 'Applicant score is below the Tier 2 minimum of 50. GED holders must score 50 or higher to enlist.',
        cite: 'AR 601-210, para 2-7'
      },
      {
        id: 'ed_adv_grade',
        condition: (lead) => {
          const credits = parseInt(lead.education.collegeCredits) || 0;
          const level = lead.education.level;
          return credits >= 15 || ['associates', 'bachelors', 'masters_plus'].includes(level);
        },
        status: 'green',
        title: 'Advanced Enlistment Grade Eligible',
        guidance: 'Applicant is eligible for advanced enlistment grade due to college credits or degree: 15-29 credits (PV2/E-2), 30-59 credits (PFC/E-3), 60+ credits or Bachelor\'s degree (SPC/E-4).',
        cite: 'AR 601-210, Ch 2',
        talkTrack: "Because you have college credits/degree, you're eligible to enlist at a higher rank and pay grade! That means you start earning more money on day one.",
        actionItems: ['Obtain official college transcripts']
      }
    ]
  };

  // ─── MEDICAL SECTION ───────────────────────────────────────────────────────
  window.APPLEMDT_MEDICAL = {
    questions: [
      "Have you ever been hospitalized, had surgeries, or broken any bones?",
      "Do you currently take any prescription medications, or have you in the past?",
      "Have you ever been treated for asthma, ADHD, depression, or anxiety?",
      "Do you have any food, drug, or environmental allergies that cause a severe reaction?"
    ],
    conditions: [
      {
        id: 'med_asthma',
        name: 'Asthma / Reactive Airway Disease',
        category: 'Respiratory',
        likelihood: 'possible',
        details: 'Asthma, bronchitis, or reactive airway disease diagnosed or symptomatic after 13th birthday.',
        docs: 'All medical records regarding asthma, pharmacy records, and Pulmonary Function Test (PFT) results.',
        timeline: 'Must be asymptomatic and off all asthma meds/inhalers for at least 12-24 months.',
        talkTrack: "Asthma after age 13 is a DQ at MEPS, but we can submit a medical waiver. If you haven't needed an inhaler or had symptoms for a couple of years, we'll request a waiver. We'll need your medical files and probably a lung breathing test.",
        cite: 'AR 40-501, para 2-23'
      },
      {
        id: 'med_adhd',
        name: 'ADHD / ADD',
        category: 'Neurological',
        likelihood: 'possible',
        details: 'History of ADD or ADHD, taking stimulant medications, or having academic accommodations (IEP/504).',
        docs: 'Medical evaluation records, pharmacy records (past 3 years), and high school IEP/504 plans or college/work records.',
        timeline: 'Off ADHD medications for at least 12 consecutive months, showing stable academic or work performance.',
        talkTrack: "ADHD is very common. To enlist without a waiver, you need to be off medication for at least 12 months and show you've done well in school or work without it. We'll need to gather your pharmacy history and IEP records if you had them.",
        cite: 'AR 40-501, para 2-27'
      },
      {
        id: 'med_depression',
        name: 'Depression / Anxiety',
        category: 'Mental Health',
        likelihood: 'possible',
        details: 'History of depressive disorders, anxiety disorders, mood disorders, or psychiatric counseling.',
        docs: 'All therapist/psychiatrist records, discharge summaries, pharmacy records, and a current psychiatric evaluation if requested.',
        timeline: 'Must be off all psychotropic medications (antidepressants, anti-anxiety meds) for a minimum of 24-36 months.',
        talkTrack: "Depression and anxiety are treatable, but the military requires a period of stability off medication. Generally, you need to be off all psychiatric meds for at least 24 to 36 months before we can submit a waiver. Let's look at your treatment timeline.",
        cite: 'AR 40-501, para 2-27'
      },
      {
        id: 'med_seizures',
        name: 'Seizures / Epilepsy',
        category: 'Neurological',
        likelihood: 'unlikely',
        details: 'History of seizures, epilepsy, or unexplained convulsions after the age of 5.',
        docs: 'Neurology records, EEG reports, MRI reports, and pharmacy records.',
        timeline: 'Must be seizure-free and off all anti-seizure medications for at least 5 years.',
        talkTrack: "Seizures after age 5 are a significant medical disqualifier. If you've been seizure-free and off meds for over 5 years, we can attempt a waiver, but it requires a very thorough neurological review.",
        cite: 'AR 40-501, para 2-27'
      },
      {
        id: 'med_diabetes',
        name: 'Diabetes',
        category: 'Endocrine',
        likelihood: 'unlikely',
        details: 'History of Type 1 or Type 2 Diabetes.',
        docs: 'Endocrinology records, HbA1c history, and current treatment plan.',
        timeline: 'Type 1 is generally non-waivable. Type 2 may be waivable in rare cases if controlled by diet/exercise only (no meds).',
        talkTrack: "Type 1 diabetes requires insulin and is unfortunately an absolute bar to military service. Type 2 diabetes can sometimes be waived if it is controlled purely by diet and exercise with excellent blood sugar levels.",
        cite: 'AR 40-501, para 2-12'
      },
      {
        id: 'med_vision',
        name: 'Vision Issues / Severe Refraction',
        category: 'Eyes',
        likelihood: 'likely',
        details: 'Severe near/farsightedness, astigmatism, or history of corrective surgery (LASIK/PRK).',
        docs: 'Optometry records, preoperative and postoperative records for LASIK/PRK.',
        timeline: 'If corrective surgery was performed, must be at least 180 days post-op (or 90 days in some cases) with stable vision.',
        talkTrack: "Vision issues are usually very easy to clear. If you had LASIK or PRK, we just need the pre-op and post-op files showing your eyes have healed and your vision is stable. Standard glasses are completely fine.",
        cite: 'AR 40-501, para 2-13'
      },
      {
        id: 'med_hearing',
        name: 'Hearing Loss / Hearing Aid',
        category: 'Ears',
        likelihood: 'possible',
        details: 'Hearing loss, chronic ear infections, perforated eardrum, or use of a hearing aid.',
        docs: 'Audiogram results, ENT specialist evaluations, and treatment history.',
        timeline: 'Perforated eardrum must be fully healed and closed for at least 180 days.',
        talkTrack: "Hearing is tested at MEPS. If you have some hearing loss or a past eardrum perforation, we can look into an ENT evaluation. If your hearing is functional, a waiver may be possible.",
        cite: 'AR 40-501, para 2-14'
      },
      {
        id: 'med_surgeries',
        name: 'Prior Surgeries (ACL, Shoulder, Spine, etc.)',
        category: 'Orthopedic',
        likelihood: 'possible',
        details: 'Any major surgical procedure, especially orthopedic surgeries (joint reconstructions, spinal surgeries).',
        docs: 'Operative reports, discharge summaries, physical therapy clearance, and post-operative X-rays/MRIs.',
        timeline: 'Must be fully cleared by the surgeon and physical therapist, typically 6 months post-op, with full range of motion.',
        talkTrack: "Surgeries are very common. We'll need the surgical notes and a doctor's release showing you have 100% range of motion, no pain, and no physical limitations. We process joint waivers all the time.",
        cite: 'AR 40-501, para 2-26'
      },
      {
        id: 'med_sleep_apnea',
        name: 'Sleep Apnea / CPAP Use',
        category: 'Respiratory',
        likelihood: 'unlikely',
        details: 'Sleep apnea diagnosed by sleep study, prescription for a CPAP machine.',
        docs: 'Sleep study reports (polysomnography), compliance reports from CPAP, and specialist reviews.',
        timeline: 'Requires waiver, very difficult to waive if CPAP machine is actively prescribed or required.',
        talkTrack: "Active sleep apnea that requires a CPAP machine is generally not waivable due to deployment constraints. If you had mild sleep apnea that was resolved or did not require a machine, we can try to submit a waiver.",
        cite: 'AR 40-501, para 2-23'
      },
      {
        id: 'med_skin_eczema',
        name: 'Skin Conditions (Eczema, Psoriasis)',
        category: 'Skin',
        likelihood: 'possible',
        details: 'History of eczema, psoriasis, severe dermatitis, or chronic skin rashes.',
        docs: 'Dermatologist records, prescription history, and photographs of current skin condition.',
        timeline: 'No active lesions or prescription steroid creams/treatments for at least 12 months.',
        talkTrack: "Eczema or psoriasis can be a DQ if it's active or requires prescription creams. If it's mild and hasn't flared up or needed prescription meds in a year, we have a good chance of getting a waiver.",
        cite: 'AR 40-501, para 2-22'
      },
      {
        id: 'med_prescriptions',
        name: 'Current Prescriptions / Active Meds',
        category: 'General Medication',
        likelihood: 'possible',
        details: 'Any active prescription medications (asthma, mental health, blood pressure, etc.).',
        docs: 'Pharmacy records (past 2-3 years) and prescribing doctor\'s notes.',
        timeline: 'Timeline varies by drug class. General rule: must be off the medication for the required time before enlisting.',
        talkTrack: "Any active medications will be visible in the GENESIS system when you go to MEPS. We'll need to know exactly what you're taking so we can make sure you've been off it for the legally required amount of time before you process."
      },
      {
        id: 'med_self_harm',
        name: 'Self-Harm / Suicidal Ideation History',
        category: 'Mental Health',
        likelihood: 'unlikely',
        details: 'History of self-harm (cutting, burning), suicide attempts, or hospitalizations for suicidal ideation.',
        docs: 'All psychiatric hospital records, crisis intervention files, therapist notes, and a detailed current psych evaluation.',
        timeline: 'Usually requires a long period of stability (3-5+ years) off all treatments. Very difficult waiver.',
        talkTrack: "A history of self-harm or suicidal thoughts is taken very seriously. It is a disqualifier, and getting a waiver is a tough process that requires a lot of documentation and a modern psychological evaluation. Let's see what documentation we have, and we can discuss the next steps.",
        cite: 'AR 40-501, para 2-27'
      },
      {
        id: 'med_autism',
        name: 'Autism Spectrum Disorder (ASD)',
        category: 'Neurological',
        likelihood: 'possible',
        details: 'History of Autism, Asperger\'s, or related spectrum disorders.',
        docs: 'School records (IEP/504), cognitive tests, medical records, and employment evaluations.',
        timeline: 'Must demonstrate high-functioning ability without academic/workplace accommodations for at least 12-24 months.',
        talkTrack: "Autism is a disqualifier under MEPS standards, but we can request a medical waiver if you are high-functioning, have graduated high school, and can show you work or study without accommodations. We'll need your school and employment records to support the waiver.",
        cite: 'AR 40-501, para 2-27'
      },
      {
        id: 'med_heart_conditions',
        name: 'Heart Conditions',
        category: 'Cardiovascular',
        likelihood: 'unlikely',
        details: 'History of heart murmur, valve disease, arrhythmia, or congenital heart issues.',
        docs: 'Cardiology evaluations, echocardiogram (ECHO) reports, and EKG results.',
        timeline: 'Must be fully resolved, asymptomatic, and require no medication or restriction.',
        talkTrack: "Heart issues require a clear signal from a cardiologist. If you had a childhood murmur that resolved, that's usually fine. If you have an active condition, we'll need a full set of tests showing your heart is fully healthy under stress.",
        cite: 'AR 40-501, para 2-18'
      },
      {
        id: 'med_scoliosis',
        name: 'Scoliosis / Spine Issues',
        category: 'Orthopedic',
        likelihood: 'possible',
        details: 'History of scoliosis, kyphosis, herniated disc, or spinal fusion surgery.',
        docs: 'Spinal X-rays, orthopedist records, and range of motion measurements.',
        timeline: 'Scoliosis curve must be under 30 degrees (thoracic) or 20 degrees (lumbar) to qualify without a waiver.',
        talkTrack: "Scoliosis is common. If your spinal curvature is mild (under 20-30 degrees), you're qualified. If it's more severe, we'll need to submit spinal X-rays for a medical waiver, as long as it doesn't cause you pain or limit your movement.",
        cite: 'AR 40-501, para 2-26'
      },
      {
        id: 'med_allergies',
        name: 'Severe Allergies (Food/Stings)',
        category: 'Allergies',
        likelihood: 'possible',
        details: 'History of anaphylaxis, severe food allergies (peanuts, shellfish), or systemic reactions to insect stings.',
        docs: 'Allergy testing results (IgE tests, oral food challenges) and medical records.',
        timeline: 'May require an oral food challenge at MEPS or a private allergist to prove the allergy is not severe.',
        talkTrack: "Severe allergies that cause anaphylaxis or require an EpiPen are disqualifying. If you've outgrown the allergy, or if it was never severe, we can get an allergist to run a test and submit those results for a waiver.",
        cite: 'AR 40-501, para 2-29'
      },
      {
        id: 'med_broken_bones',
        name: 'Broken Bones / Fractures with Hardware',
        category: 'Orthopedic',
        likelihood: 'likely',
        details: 'Prior fractures or broken bones, especially those requiring surgical plates, pins, or screws.',
        docs: 'X-rays showing healed bone, operative report for hardware insertion, and doctor\'s clearance.',
        timeline: 'Bone must be fully healed (typically 3-6 months), with no pain or limitation of movement. If hardware is present, it must be stable and not interfere with military gear.',
        talkTrack: "A broken bone in the past is rarely an issue. If you have metal plates or screws, as long as they don't hurt and are fully healed, MEPS will check your range of motion and we can clear it easily.",
        cite: 'AR 40-501, para 2-26'
      },
      {
        id: 'med_migraines',
        name: 'Migraines / Severe Headaches',
        category: 'Neurological',
        likelihood: 'possible',
        details: 'History of frequent or severe headaches, migraines, requiring prescription abortive medications (e.g. triptans).',
        docs: 'Medical records, prescription history, and neurologist notes.',
        timeline: 'Must not require frequent emergency care or cause significant disruption, off or stabilized on medications.',
        talkTrack: "Frequent migraines are disqualifying if they interfere with daily activities or require prescription abortive meds. If they are infrequent or well-managed, we can submit a waiver with your treatment records.",
        cite: 'AR 40-501, para 2-27'
      },
      {
        id: 'med_gi_conditions',
        name: 'GI Conditions (Crohn\'s, Colitis, Celiac)',
        category: 'Gastrointestinal',
        likelihood: 'unlikely',
        details: 'History of inflammatory bowel disease, Crohn\'s, ulcerative colitis, or celiac disease.',
        docs: 'Gastroenterology records, colonoscopy/endoscopy reports, biopsies, and dietary requirements.',
        timeline: 'Crohn\'s and colitis are generally non-waivable. Celiac disease is disqualifying due to field ration (MRE) constraints, and is very difficult to waive.',
        talkTrack: "Chronic GI conditions like Crohn's or Celiac are difficult to waive. Celiac is a DQ because military field rations (MREs) contain gluten, and it's impossible to guarantee gluten-free meals in combat zones. We can look at your exact diagnosis to see if there's any room for review.",
        cite: 'AR 40-501, para 2-15'
      }
    ],
    rules: [
      {
        id: 'med_clean',
        condition: (lead) => (lead.medical.conditions || []).length === 0 && lead.medical.mentalHealthHistory === 'none' && !lead.medical.medications,
        status: 'green',
        title: 'No Medical Issues Reported',
        guidance: 'Applicant reports no medical conditions, surgeries, or psychiatric treatment. Standard MEPS physical screening applies.',
        cite: 'AR 40-501, Ch 2'
      },
      {
        id: 'med_has_issues',
        condition: (lead) => (lead.medical.conditions || []).length > 0 || lead.medical.mentalHealthHistory !== 'none' || !!lead.medical.medications,
        status: 'gold',
        title: 'Medical Review Required',
        guidance: 'Applicant reports medical conditions, active prescriptions, or mental health history. MEPS will require full medical records via GENESIS. Prescriptions must be disclosed and may require a period off medications.',
        cite: 'AR 40-501',
        actionItems: ['Identify all checked conditions in checklist', 'Gather 3 years of pharmacy records', 'Obtain treatment records and doctor clearances for each condition']
      },
      {
        id: 'med_active_mh_treatment',
        condition: (lead) => ['current_treatment', 'medication'].includes(lead.medical.mentalHealthHistory),
        status: 'red',
        title: 'Active Mental Health Treatment / Medication',
        guidance: 'Applicant is currently undergoing mental health treatment or taking psychotropic medication. Processing is barred. Applicant must be fully stable off all psychiatric medications for at least 24-36 months before a waiver can be processed.',
        cite: 'AR 40-501, para 2-27',
        talkTrack: "To enlist, the Army requires you to be fully off all mental health medications and out of treatment for a period of stability, typically 2 to 3 years. We cannot submit a waiver while you are actively taking medication. I recommend continuing to work with your doctor, and we can look at this down the road."
      },
      {
        id: 'med_self_harm_rule',
        condition: (lead) => (lead.medical.conditions || []).includes('med_self_harm'),
        status: 'red',
        title: 'History of Self-Harm / Suicidal Ideation',
        guidance: 'Applicant has checked self-harm or suicidal ideation history. This is a high-level disqualifier. A waiver is required and is highly scrutinized, requiring long-term stability and a comprehensive psychiatric evaluation.',
        cite: 'AR 40-501, para 2-27'
      }
    ]
  };

  // ─── DEPENDENTS SECTION ────────────────────────────────────────────────────
  window.APPLEMDT_DEPENDENTS = {
    questions: [
      "What is your current marital status?",
      "How many children or dependents under 18 do you have?",
      "If you are single with children, do you have legal custody? Has custody been legally transferred to another guardian?"
    ],
    rules: [
      {
        id: 'dep_clean',
        condition: (lead) => {
          const marital = lead.dependents.maritalStatus;
          const count = lead.dependents.dependentsUnder18;
          return (marital === 'single' || marital === 'divorced' || marital === 'separated') && count === 0 && !lead.dependents.pregnant;
        },
        status: 'green',
        title: 'No Dependency Issues',
        guidance: 'Applicant is single with no minor dependents. Fully qualified.',
        cite: 'AR 601-210, para 2-11'
      },
      {
        id: 'dep_married_standard',
        condition: (lead) => {
          const marital = lead.dependents.maritalStatus;
          const count = lead.dependents.dependentsUnder18;
          return marital === 'married' && count <= 2 && !lead.dependents.pregnant;
        },
        status: 'green',
        title: 'Married, Standard Dependents — Qualified',
        guidance: 'Applicant is married with 2 or fewer minor dependents. No dependency waiver is required.',
        cite: 'AR 601-210, para 2-11'
      },
      {
        id: 'dep_married_waiver',
        condition: (lead) => {
          const marital = lead.dependents.maritalStatus;
          const count = lead.dependents.dependentsUnder18;
          return marital === 'married' && count > 2;
        },
        status: 'blue',
        title: 'Married w/ 3+ Dependents — Waiver Required',
        guidance: 'Applicant is married with 3 or more minor dependents. A dependency waiver is required. Authority: Recruiting Battalion Commander. Must demonstrate financial capability to support family.',
        cite: 'AR 601-210, para 2-11',
        talkTrack: "Since you're married and have 3 or more children, we'll need to submit a dependency waiver. This is just a financial screening to show that your Army pay will comfortably cover your family expenses. We'll put together a simple monthly budget sheet.",
        actionItems: ['Complete financial worksheet (budget)', 'Submit dependency waiver to Battalion Commander']
      },
      {
        id: 'dep_single_parent_custody',
        condition: (lead) => {
          const marital = lead.dependents.maritalStatus;
          const count = lead.dependents.dependentsUnder18;
          return marital !== 'married' && count > 0 && lead.dependents.hasCustody && !lead.dependents.custodyTransferred;
        },
        status: 'red',
        title: 'Single Parent with Custody — Ineligible',
        guidance: 'A single parent with sole or primary custody of minor dependents is ineligible to enlist in the Regular Army. No waiver is authorized. Exception: legal custody can be transferred to another guardian by court order with no intent to regain custody during enlistment.',
        cite: 'AR 601-210, para 2-11',
        talkTrack: "Army regulations do not allow single parents with legal custody of minor children to enlist on active duty, due to the requirements of 24/7 military service. To become eligible, legal custody must be transferred to someone else through a court order, and it must be a permanent change without plans to regain custody while you're serving.",
        actionItems: ['Explain custody rules and enlistment restrictions']
      },
      {
        id: 'dep_single_parent_transferred',
        condition: (lead) => {
          const marital = lead.dependents.maritalStatus;
          const count = lead.dependents.dependentsUnder18;
          return marital !== 'married' && count > 0 && lead.dependents.hasCustody && lead.dependents.custodyTransferred;
        },
        status: 'gold',
        title: 'Custody Transferred — Verification Required',
        guidance: 'Applicant is a single parent who has transferred legal custody. Must obtain court order proving custody has been legally and permanently transferred to another guardian. Any statement or indication of intent to regain custody immediately after enlisting is a bar.',
        cite: 'AR 601-210, para 2-11',
        actionItems: ['Obtain official court-ordered custody transfer papers', 'Verify no statements indicating intent to regain custody']
      },
      {
        id: 'dep_pregnant',
        condition: (lead) => lead.dependents.pregnant,
        status: 'red',
        title: 'Pregnancy — Processing Deferred',
        guidance: 'An applicant who is pregnant is temporarily disqualified from enlistment. Processing is deferred until postpartum, typically 6 months after delivery. Medical clearance is required.',
        cite: 'AR 601-210, para 2-11',
        talkTrack: "We cannot process your enlistment while you are pregnant, for your health and safety. We'd love to work with you once you've had the baby and are medically cleared, which is typically 6 months after delivery."
      }
    ]
  };

  // ─── TATTOOS SECTION ───────────────────────────────────────────────────────
  window.APPLEMDT_TATTOOS = {
    questions: [
      "Do you have any tattoos, brands, or body markings?",
      "Are any of your tattoos located on your face, neck, head, scalp, or hands?",
      "Do any of your tattoos contain extremist, racist, sexist, or gang-related symbols or words?"
    ],
    locations: [
      { id: 'face_head', name: 'Face, Head, or Scalp', rule: 'Prohibited', status: 'red', cite: 'AR 670-1', details: 'Any tattoos on the face, head, scalp, or inside the mouth are prohibited. Must be fully removed or covered.' },
      { id: 'neck_front', name: 'Front of Neck', rule: 'Prohibited', status: 'red', cite: 'AR 670-1', details: 'Tattoos on the front of the neck (above the collar line) are prohibited. Must be fully removed.' },
      { id: 'neck_back', name: 'Back of Neck (≤2")', rule: 'One Allowed (≤2")', status: 'green', cite: 'AR 670-1 (2022)', details: 'One tattoo on the back of the neck is allowed, provided it is no larger than 2 inches in measurement.' },
      { id: 'hands', name: 'Hands / Fingers (excl. ring)', rule: 'One Allowed (≤1")', status: 'gold', cite: 'AR 670-1 (2022)', details: 'One tattoo per hand is allowed, provided it is under 1 inch in total size. Other finger tattoos are prohibited.' },
      { id: 'ring', name: 'Ring Finger (Single)', rule: 'One Ring Allowed', status: 'green', cite: 'AR 670-1 (2022)', details: 'One single-band ring tattoo is permitted on one finger of each hand, representing a wedding band.' },
      { id: 'arms_legs', name: 'Arms or Legs (Sleeves)', rule: 'No Limit (2022)', status: 'green', cite: 'AR 670-1 (2022)', details: 'Tattoos on the arms and legs are fully permitted, including full sleeves. No size or number restrictions.' },
      { id: 'chest_back', name: 'Chest or Back (below collar)', rule: 'No Limit', status: 'green', cite: 'AR 670-1', details: 'Tattoos on chest or back are fully permitted, provided they are below the standard t-shirt collar line.' }
    ],
    rules: [
      {
        id: 'tat_clean',
        condition: (lead) => !lead.tattoos.hasTattoos,
        status: 'green',
        title: 'No Tattoos Reported',
        guidance: 'Applicant reports no tattoos or body markings.',
        cite: 'AR 670-1'
      },
      {
        id: 'tat_safe',
        condition: (lead) => {
          return lead.tattoos.hasTattoos &&
            lead.tattoos.locations.every(l => ['arms_legs', 'chest_back', 'ring'].includes(l)) &&
            !lead.tattoos.contentConcerns;
        },
        status: 'green',
        title: 'Tattoos Fully Qualified',
        guidance: 'Applicant has tattoos only in permitted areas (arms, legs, chest, back, or single ring tattoo) and reports no content concerns. Fully qualified under the 2022 policy update.',
        cite: 'AR 670-1 (2022 Update)'
      },
      {
        id: 'tat_prohibited',
        condition: (lead) => {
          return lead.tattoos.hasTattoos &&
            (lead.tattoos.locations.includes('face_head') || lead.tattoos.locations.includes('neck_front'));
        },
        status: 'red',
        title: 'Prohibited Tattoo Locations',
        guidance: 'Applicant has tattoos on their face, head, scalp, or front of the neck. These locations are strictly prohibited. The applicant is disqualified unless the tattoos are fully and professionally removed (laser removal).',
        cite: 'AR 670-1',
        talkTrack: "The Army's grooming standards prohibit tattoos on the face, head, and front of the neck. If you are willing to have them professionally removed, we can process your application once they are gone. Let me know if that's something you'd consider.",
        actionItems: ['Explain tattoo removal options', 'Re-evaluate once removal is complete']
      },
      {
        id: 'tat_hand_check',
        condition: (lead) => {
          return lead.tattoos.hasTattoos && lead.tattoos.locations.includes('hands');
        },
        status: 'gold',
        title: 'Hand Tattoo Verification Required',
        guidance: 'Applicant has a hand tattoo. Under the 2022 policy, one tattoo is permitted on each hand, provided it is no larger than 1 inch in measurement. Any additional hand/finger tattoos (except a ring tattoo) are prohibited and require removal or waiver.',
        cite: 'AR 670-1 (2022 Update)',
        talkTrack: "Under the new policy, you are allowed to have one tattoo on your hand, but it must be smaller than 1 inch. We'll need to measure it when you come into the office to make sure it meets the size standard.",
        actionItems: ['Measure hand tattoo in office', 'Photograph and document hand tattoo']
      },
      {
        id: 'tat_neck_back_check',
        condition: (lead) => {
          return lead.tattoos.hasTattoos && lead.tattoos.locations.includes('neck_back') && lead.tattoos.locations.length === 1;
        },
        status: 'green',
        title: 'Back of Neck Tattoo — Qualified',
        guidance: 'Applicant has a tattoo on the back of the neck. A single tattoo on the back of the neck is allowed if it does not exceed 2 inches in measurement.',
        cite: 'AR 670-1 (2022 Update)'
      },
      {
        id: 'tat_content',
        condition: (lead) => lead.tattoos.hasTattoos && lead.tattoos.contentConcerns,
        status: 'red',
        title: 'Tattoo Content Violation — Disqualified',
        guidance: 'Applicant reports tattoos with potentially extremist, gang-related, racist, sexist, or discriminatory content. This is an absolute bar to enlistment. Tattoos must be completely removed. No waivers are authorized.',
        cite: 'AR 670-1 & AR 600-20',
        talkTrack: "The Army has a zero-tolerance policy for tattoos that show or represent gang symbols, extremist views, or discriminatory text. If you have any markings like that, they must be completely removed before we can move forward.",
        actionItems: ['Inspect and document all tattoos in question', 'Advise on content bar policies']
      }
    ]
  };

  // ─── CITIZENSHIP SECTION ───────────────────────────────────────────────────
  window.APPLEMDT_CITIZENSHIP = {
    questions: [
      "What is your citizenship status?",
      "If Dual Citizen: Are you willing to surrender your foreign passport?",
      "If Green Card Holder (LPR): What is your country of origin and expiration date of your I-551 Card?"
    ],
    rules: [
      {
        id: 'cit_usc',
        condition: (lead) => lead.citizenship && lead.citizenship.status === 'usc',
        status: 'green',
        title: 'U.S. Citizen',
        guidance: 'Applicant is a U.S. citizen. Fully eligible for enlistment, security clearances, and all MOS specialties.',
        cite: 'AR 601-210, para 2-2'
      },
      {
        id: 'cit_dual',
        condition: (lead) => lead.citizenship && lead.citizenship.status === 'dual' && lead.citizenship.willingToSurrender,
        status: 'gold',
        title: 'Dual Citizen — Disclose Passport',
        guidance: 'Applicant holds dual citizenship and is willing to surrender their foreign passport. Eligible to enlist, but must disclose foreign interests on security screening. Some sensitive MOSs may require formal renunciation of foreign citizenship or passport surrender.',
        cite: 'AR 601-210, para 2-2 & AR 380-67',
        talkTrack: "Being a dual citizen is fine for enlisting. However, to get a security clearance or certain jobs, you must be willing to surrender your foreign passport and declare any foreign interests. We'll document this during your security screening.",
        actionItems: ['Document foreign passport details (number, country, expiration)', 'Verify willingness to surrender passport on security questionnaire']
      },
      {
        id: 'cit_dual_unwilling',
        condition: (lead) => lead.citizenship && lead.citizenship.status === 'dual' && !lead.citizenship.willingToSurrender,
        status: 'blue',
        title: 'Dual Citizen — Unwilling to Surrender Passport',
        guidance: 'Applicant holds dual citizenship but is unwilling to surrender their foreign passport or renounce foreign allegiance. This may disqualify them from obtaining a security clearance, restricting them to non-sensitive MOS specialties or requiring a suitability waiver.',
        cite: 'AR 380-67',
        talkTrack: "If you want to keep your foreign passport and are not willing to surrender it, you won't be able to qualify for jobs that require a security clearance. We can still process you for non-sensitive specialties, but it will limit your job options. Let's discuss if any of those options align with your goals."
      },
      {
        id: 'cit_lpr',
        condition: (lead) => {
          if (!lead.citizenship || lead.citizenship.status !== 'lpr') return false;
          if (!lead.citizenship.greenCardExp) return true;
          const exp = new Date(lead.citizenship.greenCardExp);
          const now = new Date();
          const diffMonths = (exp - now) / (1000 * 60 * 60 * 24 * 30.4);
          return diffMonths >= 6;
        },
        status: 'gold',
        title: 'Lawful Permanent Resident (Green Card) — Restricted MOS',
        guidance: 'Applicant is a Lawful Permanent Resident (LPR) with a valid I-551 (Green Card) that has at least 6 months remaining. Eligible to enlist, but strictly restricted from jobs requiring a security clearance (e.g., Intel, Cyber, Special Forces, or officers). Must verify green card physically and run a SAVE verification.',
        cite: 'AR 601-210, para 2-2 & USAREC G-3',
        talkTrack: "As a permanent resident with a valid green card, you are eligible to enlist! However, because you aren't a U.S. citizen yet, you won't be eligible for jobs that require a security clearance, like intelligence or cyber. You can choose from many other great jobs, and once you're in, you can apply for expedited U.S. citizenship. We just need to verify your physical card and make sure it has at least 6 months left before expiration.",
        actionItems: [
          'Verify physical I-551 card (Green Card)',
          'Ensure card is valid for at least 6 months from enlistment',
          'Initiate USCIS SAVE verification check',
          'Counsel applicant on MOS restrictions (non-clearance jobs only)'
        ]
      },
      {
        id: 'cit_lpr_expired',
        condition: (lead) => {
          if (!lead.citizenship || lead.citizenship.status !== 'lpr' || !lead.citizenship.greenCardExp) return false;
          const exp = new Date(lead.citizenship.greenCardExp);
          const now = new Date();
          const diffMonths = (exp - now) / (1000 * 60 * 60 * 24 * 30.4);
          return diffMonths < 6;
        },
        status: 'amber',
        title: 'Green Card Expired / Expiring Within 6 Months',
        guidance: 'Applicant\'s I-551 (Green Card) is expired or has less than 6 months of validity remaining. Processing is deferred until the applicant obtains an extension (I-797 Notice of Action) or a new card from USCIS. Extension must show validity for at least 6 months.',
        cite: 'AR 601-210, para 2-2 & USAREC Message',
        talkTrack: "Your green card needs to have at least 6 months of validity remaining for us to process your enlistment. Since yours is expired or expiring soon, you'll need to show us an official extension notice (I-797) from USCIS or renew the card. Once you have that documentation, we can resume processing immediately.",
        actionItems: ['Obtain I-797 Notice of Action or new I-551 Card', 'Verify card or extension shows at least 6 months validity']
      },
      {
        id: 'cit_ineligible',
        condition: (lead) => lead.citizenship && ['visa', 'undocumented'].includes(lead.citizenship.status),
        status: 'red',
        title: 'Non-Immigrant / Undocumented — Not Eligible',
        guidance: 'Applicant is a visa holder, undocumented, or DACA recipient. Under current Department of Defense regulations, only U.S. citizens and Lawful Permanent Residents (green card holders) are eligible to enlist. The MAVNI program is currently closed.',
        cite: 'AR 601-210, para 2-2 & 10 USC § 504',
        talkTrack: "Under current military regulations, we are only authorized to enlist U.S. citizens or green card holders. We cannot enlist visa holders or DACA recipients at this time because the special programs for foreign nationals are closed. I highly recommend working with an immigration professional to obtain permanent residency, and we can enlist you as soon as you get your green card.",
        actionItems: ['Advise lead on enlistment requirements', 'Close out lead profile']
      }
    ]
  };
})();
