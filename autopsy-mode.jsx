// autopsy-mode.jsx — Packet QC v3.0 Autopsy Edition
// Rendered when activeTab === "autopsy"
// Props: sections, statuses, profile, aliasCheck, onToggle, onQuickComplete, onReset

const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ═══════════════════════════════════════════════════════
   SCOPED CSS — injected on mount, removed on unmount
════════════════════════════════════════════════════════ */
const AUTOPSY_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');

.aut-card {
  transition: all 0.2s cubic-bezier(0.23, 1.0, 0.32, 1);
  position: relative; overflow: hidden;
  border-radius: 24px; background: #111; border: 1px solid #3f3f46;
}
.aut-card:hover {
  transform: translateY(-3px) scale(1.005);
  box-shadow: 0 0 0 4px rgba(255, 204, 1, 0.15);
}
.aut-card::before {
  content: ''; position: absolute; top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: linear-gradient(to bottom right, transparent 40%, rgba(255,204,1,0.04) 50%, transparent 60%);
  transform: rotate(30deg); transition: transform 0.6s;
  pointer-events: none; z-index: 0;
}
.aut-card:hover::before { transform: translateX(100%) rotate(30deg); }
.aut-card-inner { position: relative; z-index: 1; }

.aut-section-header {
  background: linear-gradient(90deg, #111 0%, #1a1a1a 100%);
  border-bottom: 3px solid #FFCC01;
  padding: 16px 20px;
  display: flex; align-items: center; justify-content: space-between; cursor: pointer;
}
.aut-badge {
  font-family: 'Press Start 2P', monospace; font-size: 7px; padding: 4px 10px;
  font-weight: 900; letter-spacing: 1.5px; border: 2px solid currentColor;
  cursor: pointer; user-select: none; display: inline-block;
  transition: all 0.1s; border-radius: 0; line-height: 1.4;
}
.aut-badge-complete { background:#052e16; color:#4ade80; border-color:#4ade80; }
.aut-badge-pending  { background:#451a03; color:#fbbf24; border-color:#fbbf24; }
.aut-badge-flagged  {
  background:#450a0a; color:#f87171; border-color:#f87171;
  animation: aut-death-pulse 1.5s infinite;
  box-shadow: 0 0 12px rgba(248,113,113,0.5);
}
.aut-badge-na { background:#18181b; color:#52525b; border-color:#3f3f46; }
@keyframes aut-death-pulse { 0%,100%{opacity:1} 50%{opacity:0.65} }

.aut-pstart { font-family:'Press Start 2P', monospace; }
.aut-vt323  { font-family:'VT323', monospace; }
.aut-morgue-log { font-family:'VT323',monospace; font-size:14px; line-height:1.3; }

.aut-vital { background:#111; border-radius:16px; padding:16px; transition:border-color .2s; }

.aut-item-row {
  padding: 14px 20px; display:flex; align-items:flex-start; gap:16px;
  border-bottom: 1px solid #1f2937; transition: background .1s;
}
.aut-item-row:last-child { border-bottom:none; }
.aut-item-row:hover { background: rgba(255,255,255,0.02); }

.aut-skull-btn {
  background:none; border:none; cursor:pointer;
  color:rgba(248,113,113,0.45); font-size:18px; padding:2px 4px;
  transition: color .15s, transform .15s; line-height:1; flex-shrink:0;
}
.aut-skull-btn:hover { color:#f87171; transform:scale(1.2); }

.aut-nuclear-btn {
  font-family:'Press Start 2P',monospace; font-size:7px; padding:10px 20px;
  background:rgba(127,29,29,0.3); border:2px solid #8B0000; color:#f87171;
  cursor:pointer; letter-spacing:1.5px; transition:background .15s;
  animation: aut-nuke-glow 1.4s infinite alternate;
}
.aut-nuclear-btn:hover { background:rgba(185,28,28,0.4); }
@keyframes aut-nuke-glow {
  from { box-shadow:0 0 6px rgba(248,113,113,.25); }
  to   { box-shadow:0 0 18px rgba(248,113,113,.55); }
}
.aut-cmd-btn {
  font-family:'Press Start 2P',monospace; font-size:7px; padding:10px 16px;
  background:rgba(255,255,255,0.03); border:1px solid #3f3f46; color:#e5e5e5;
  cursor:pointer; letter-spacing:1px; transition:background .12s,border-color .12s;
}
.aut-cmd-btn:hover { background:rgba(255,255,255,.07); border-color:#71717a; }

.aut-submit-btn {
  font-family:'Press Start 2P',monospace; font-size:8px; padding:20px 28px;
  cursor:pointer; letter-spacing:1.5px; transition:all .15s;
  display:flex; align-items:center; justify-content:center; gap:12px; border-radius:24px;
}
.aut-submit-btn.ready {
  background:linear-gradient(90deg,#FFCC01,#fde047); border:none; color:#000;
  box-shadow:0 8px 32px rgba(255,204,1,.25);
}
.aut-submit-btn.ready:hover { filter:brightness(1.07); transform:scale(1.01); }
.aut-submit-btn.blocked {
  background:rgba(255,204,1,.06); border:1px solid rgba(255,204,1,.18); color:rgba(255,204,1,.45); cursor:pointer;
}
.aut-submit-btn.blocked:hover { background:rgba(255,204,1,.12); color:rgba(255,204,1,.65); }

.aut-confess-btn {
  font-family:'Press Start 2P',monospace; font-size:7px; padding:14px 20px;
  border-radius:12px; cursor:pointer; letter-spacing:1px;
  display:flex; align-items:center; justify-content:center; gap:8px;
  transition:all .12s; width:100%;
}
.aut-modal-overlay {
  position:fixed; inset:0; background:rgba(0,0,0,0.92); z-index:2000;
  display:flex; align-items:center; justify-content:center; padding:24px;
  animation:overlayIn .15s ease;
}
.aut-modal-box { animation:modalIn .2s cubic-bezier(.2,.6,0,1); max-width:580px; width:100%; }
.aut-input {
  width:100%; background:#050505; border:1px solid #3f3f46;
  font-family:'VT323',monospace; font-size:15px; color:#e5e5e5;
  padding:12px; resize:vertical; outline:none; border-radius:0;
}
.aut-input:focus { border-color:#71717a; }

.aut-ticker-wrap {
  overflow:hidden; flex:1; background:rgba(0,0,0,.4);
  border:1px solid rgba(248,113,113,.2); border-radius:4px;
  padding:4px 0; margin:0 12px;
}
.aut-ticker-track {
  display:inline-block; white-space:nowrap;
  animation: aut-ticker 35s linear infinite;
  font-family:'VT323',monospace; font-size:14px; color:rgba(248,113,113,.7);
}
@keyframes aut-ticker {
  from { transform:translateX(100%); }
  to   { transform:translateX(-100%); }
}
.aut-full-autopsy-btn {
  font-family:'Press Start 2P',monospace; font-size:7px; padding:7px 14px;
  background:rgba(139,0,0,.15); border:1px solid rgba(139,0,0,.5);
  color:rgba(248,113,113,.7); cursor:pointer; letter-spacing:1px;
  border-radius:6px; transition:all .15s;
}
.aut-full-autopsy-btn:hover { background:rgba(139,0,0,.3); color:#f87171; }
`;

/* ═══════════════════════════════════════════════════════
   ORGAN MAP — all 23 sections with humorous descriptions
════════════════════════════════════════════════════════ */
const ORGAN_MAP = {
  "identity":       { organ:"HEART",               emoji:"❤️",  tag:"CORE VITALS",     desc:"Without this, everything else is decorative paperwork. The heart pumps. The SSC, BC, and ID are the heartbeat. No pulse = no packet." },
  "education":      { organ:"PREFRONTAL CORTEX",   emoji:"🧠",  tag:"SMART TISSUE",    desc:"Where the Army decides how smart it thinks you are. HS diploma preferred. GED accepted with a sigh. No diploma? Congratulations, you're Tier III. GC is already exhausted." },
  "genesis":        { organ:"NERVOUS SYSTEM",      emoji:"⚡",  tag:"CENTRAL COMMAND", desc:"The most error-prone organ in the entire body. One wrong nerve (Live Scan in SC Remarks instead of Contact History) and the whole system seizes. This section kills more packets than all waivers combined." },
  "background":     { organ:"LIVER",               emoji:"🫀",  tag:"TOXIN FILTER",    desc:"The liver processes everything dark, criminal, and morally questionable. DD 369 returns from all 3 jurisdictions. It either clears or it doesn't. GC will not compromise on toxin levels." },
  "medical":        { organ:"IMMUNE SYSTEM",        emoji:"🩺",  tag:"MEPS READINESS",  desc:"The body either fights or it doesn't. Date consistency is everything here. One-day mismatch on any form and MEPS sends the patient home. GC treats date errors like a personal insult." },
  "enlistment":     { organ:"SPINE",               emoji:"🦴",  tag:"STRUCTURAL",      desc:"Holds the entire operation upright. UF 601-210.15 is the vertebrae. Complete it too early and the spine expires. MIRS is the spinal cord — print it on submission day or you're going in paralyzed." },
  "dependents":     { organ:"UMBILICAL CORD",      emoji:"👶",  tag:"ATTACHED",        desc:"Dependent documents are the umbilical cord. They keep things alive. They are also the most tearjerking paperwork in the recruiting business. Marriage cert, spouse docs, kids' birth certificates — all of it." },
  "prior-service":  { organ:"SCAR TISSUE",         emoji:"🪖",  tag:"PRIOR TRAUMA",    desc:"Evidence of a prior military life. DD 214, RE code, character of discharge. Scar tissue doesn't lie. GC will examine every inch of it. An RE code that needs a waiver means you call GC before touching anything else." },
  "mso-rel":        { organ:"APPENDIX",            emoji:"💊",  tag:"VESTIGIAL",       desc:"No one fully understands why it exists. But when it flares up (unapproved or expired DD 368), it will absolutely derail the entire operation. Get the DD 368 approved first. Then breathe." },
  "moral-waiver":   { organ:"CRIMINAL RECORD GLAND", emoji:"⚖️", tag:"CONTROVERSIAL",  desc:"The most complex organ in the body. Requires a personal statement (written by the applicant, not you), all dockets, incident reports, character references, CO interview, and BN endorsement. GC will read every word." },
  "suit-waiver":    { organ:"SHADOW GLAND",        emoji:"🕵️", tag:"AMBIGUOUS",       desc:"Like the moral waiver gland but with more paperwork and less clarity. GC will ask questions you didn't prepare for. The applicant statement must be thorough. 'It wasn't that serious' is not a legal argument." },
  "medical-waiver": { organ:"DEFECTIVE PANCREAS",  emoji:"🏥",  tag:"SPECIAL HANDLING",desc:"Do not project until MEPS sends a written disposition. That's the rule. Full stop. The complex prescreen goes to MEPS. MEPS responds. Then you move. Skipping this step is how you get a 6am phone call from the CMO." },
  "age-waiver":     { organ:"GROWTH PLATE",        emoji:"📏",  tag:"DEVELOPING",      desc:"Still technically developing but motivated enough to want in early. AFQT must be 50+. Fully medically qualified. Live Scan current. MIRS printed. GC will check all four before approving the idea of reviewing your packet." },
  "tattoo-waiver":  { organ:"EPIDERMIS",           emoji:"🎨",  tag:"ART GALLERY",     desc:"The applicant decided their skin was a canvas. Now AR 670-1 has opinions. Color photos (not black & white — GC will ask why you're colorblind), CO memo, and a statement explaining every piece being waived. GC will zoom in." },
  "rel-waiver":     { organ:"SOUL",                emoji:"🙏",  tag:"UNQUANTIFIABLE",  desc:"The only packet that requires a chaplain signature. Applicant statement on sincere religious belief, CO memo, BN memo, and BDE Chaplain letter. GC treats this with gravity. So should you." },
  "re-waiver":      { organ:"SCAR FROM PRIOR OP",  emoji:"🔄",  tag:"RECURRING",       desc:"They've been through the system before and it left a mark. RE code waiver requires three fingerprint cards (DD 370), a statement explaining the separation, CO memo, and BN endorsement. GC has the prior record. They will find discrepancies." },
  "dep-waiver":     { organ:"GUILT GLAND",         emoji:"😬",  tag:"HEAVY",           desc:"The dependency waiver carries the weight of every person who depends on this applicant. DA 3072-2 income entries must be MONTHLY. Not annual. Not weekly. Monthly. GC will do the math. Their math will be correct. Yours needs to be too." },
  "arms-docs":      { organ:"PERFORMANCE TISSUE",  emoji:"💪",  tag:"ENHANCED",        desc:"ARMS 2.0 and FSPC exist because someone decided the standard bar needed adjusting. Additional prescreen (680-ADP), body fat worksheet if over screening weight, and current MIRS. We didn't lower the standards. We re-evaluated the metrics. (We lowered the bar.)" },
  "ocs-docs":       { organ:"EGO CENTER",          emoji:"⭐",  tag:"OFFICER MATERIAL", desc:"For those who looked at the enlisted packet and said 'I want MORE paperwork.' DA 61, sealed transcripts, three letters from O-3+, GT 110+, ACFT scores, Army photo in ASU (within 6 months). Officer Candidate School begins with the officer candidate completing their own forms correctly." },
  "flri-docs":      { organ:"PHOENIX LOBE",        emoji:"🔥",  tag:"RESURRECTED",     desc:"Prior officers coming back from the dead. DD 214 showing commissioned service, DA 61, sealed transcripts, O-4+ recommendation letters. Get the FLRI eligibility memo from RSC before touching anything. This program changes more often than GC's mood." },
  "atp-docs":       { organ:"TRAINING NUCLEUS",    emoji:"🔬",  tag:"EXPERIMENTAL",    desc:"ATP requirements change so frequently that verifying with GC is not a suggestion — it's the first step. Call GC. Confirm ATP is open, the MOS is available, the iKrome code is correct. Then start. Not before." },
  "smp-docs":       { organ:"DUAL PROCESSOR",      emoji:"💻",  tag:"MULTITASKING",    desc:"Running ROTC and the Army Reserve simultaneously. The enrollment letter must come from the PMS specifically — not any other ROTC staff. Academic probation? Stop. Call GC. SMP eligibility may be void and GC will find out either way." },
  "woft-docs":      { organ:"WINGS",               emoji:"✈️",  tag:"THE COOL ONE",    desc:"The only packet where the MEPS physical is a Class 1A Flight Physical — NOT the standard physical. Coordinate with MEPS and your RSC in advance. SIFT minimum 40. GT minimum 110. One retake on SIFT after 6 months. This is the one that makes the whole station jealous." },
};

/* ═══════════════════════════════════════════════════════
   HUMOROUS BUT DIDACTIC ITEM SUB-TEXT
   Overrides the standard sub in autopsy mode
════════════════════════════════════════════════════════ */
const AUTOPSY_SUBS = {
  "ssc":          "Original only. SSA.gov printouts will be used as toilet paper by GC. Metal 'I Am Awesome' cards from the mall will be used as evidence against you. Lamination of the original is acceptable. Everything else is a prayer.",
  "bc":           "Certified copy with raised seal. The 'congrats it's a girl' napkin from the hospital does not count. Neither does a photocopy. Neither does Google Translate. Neither does your uncle who 'took Spanish in high school.' All of them: no.",
  "pid":          "Current. Not expired by one day. Not expired by one hour. GC treats an expired ID like you walked in with a document from a parallel timeline. Learner's permit: adorable. MEPS will laugh, then send you home.",
  "passport":     "N/A if they don't have one — most citizens don't, and that's fine. If they do have one, verify name/DOB match. LPR? Hidden — they don't have a U.S. passport. That's the point of being an LPR.",
  "i551":         "Alien number + expiration date + category code. All three. In GENESIS Citizenship Tab. Miss one field and GC will circle it in a color you've never seen before and don't want to see again.",
  "fp-lpr":       "LPR — check if they still have a valid or recently expired foreign passport. If yes, it goes in. If surrendered or expired, mark N/A and document it. Do not guess. Document.",
  "natcert":      "N-550 or N-570. USCIS stamp. Original or certified copy. Photocopy: GC will look at you for a long time and then say nothing. Record the certificate number in GENESIS Citizenship Tab.",
  "dd1966-sp":    "Single parent: both pages 4 AND 5. Page 4: parent info. Page 5: consent. Parent signs both. Pre-signed forms are not witnessed. GC knows the difference between 'witnessed' and 'I handed them the pen and looked away.'",
  "dd1966-bp":    "Both parents living: both sign page 5. One missing? You get to explain to the applicant why their packet is on hold while you track down their dad. One parent deceased/legally absent: document it and call GC.",
  "selsvc":       "Males 18+: verify at SSS.gov before projecting. Not registered? They register first. You wait. Then you proceed. Projecting an unregistered 18-year-old male is a conversation you don't want to have with GC.",
  "gen-person":   "Legal name. Not 'what they go by.' Not their Discord username. The name on the birth certificate. DL address must match most recent residence entry. Do NOT put a nickname in the legal name field. GC will call you.",
  "gen-s1":       "Every alias. The married name. The maiden name. The name on the expired ID they used in 2017. Both Screening Tab p.1 AND Alias Tab — BOTH. Not one. GC will check both. Empty Alias Tab = automatic return with 'DID YOU EVEN READ THE INSTRUCTIONS' written in remarks.",
  "gen-s2":       "No blank boxes. Every single field. Write N/A. GC cannot fill in the blanks for you. They can only return the packet with a handwritten note that says 'NO,' then forward it to the group chat labeled 'LEARNING OPPORTUNITY.'",
  "gen-res":      "10 years or back to age 16 — whichever is shorter. No unexplained gaps. Lived somewhere for 3 weeks between apartments? That address goes in. DL address must match the most recent entry. GC will check.",
  "gen-emp":      "Every job. The summer at the ice cream shop. The weekend gig. Self-employment (including side hustles). Include JROTC in the Education tab — it may be worth an E-2 and you'd feel bad for missing it.",
  "gen-tabs":     "Education (all schools attended, including JROTC), Military Service Schools if applicable, Background/Investigation, Financial History. JROTC in Education, not Military Service. This matters. GC knows the difference.",
  "gen-refs":     "At least 3 references. Full names (not just 'Mike from work'). 3–7 year coverage. No family members as personal references on DD Form 370. GC will ask how the applicant knows 3 people and none of them are related.",
  "gen-docs":     "Upload everything with accurate, descriptive file names. Legible scans. Not blurry. Not cut off. Not a photo of a photo taken in poor lighting. Multi-page documents get labeled Page X of Y. GC reads every label.",
  "gen-sf86":     "Run the SF 86 Validation Report. Fix every flag. Run it again. Change one thing in GENESIS? Run it again. Unresolved flags before SC QC = automatic return. 'I thought it was fine' is not an answer.",
  "gen-lsa":      "CONTACT HISTORY. Not SC Remarks. Not a sticky note on the applicant folder. Not a text to your buddy who happens to be SC. CONTACT HISTORY IN RZ. This is the #1 cause of death in the entire recruiting force. GC will make sure everyone in the battalion knows it was you.",
  "gen-sck":      "Recruiter clicks 'Initiate SC Checkpoint' in RZ. SC and ASC get an automatic email. SC does NOT auto-reply. Call them to confirm receipt. Then coordinate directly. Do not assume the email was enough.",
  "livescan":     "Valid 120 days from the date of the scan. Not your best guess. The scan date. Expired by one day? Redo it. No exceptions. GC will not 'just check this time.' GC has never checked this time.",
  "dd369":        "City police + county sheriff + state. ALL THREE RETURNED. Every alias gets its own separate DD 369 — hand-writing an alias onto an existing form is how you get blacklisted from GC's good graces permanently. GC will not negotiate. They will not count two out of three as 'close enough.'",
  "sex-off":      "NSOPW.gov plus applicable state registry. Document results in GENESIS remarks before SC QC. A hit means you stop immediately, call GC, and do not move. 'I thought I'd check after projecting' is career-altering logic.",
  "legal":        "Compare DD 369 returns against what the applicant disclosed during moral screening. New offense discovered = immediate GC call. Disclosure inconsistency (medical vs. moral) is also a GC return. Cross-reference everything.",
  "umf680":       "Sign in front of you. Not mailed. Not before the appointment. In your physical presence. Dates must match DD 2807-2 and GENESIS. Do not accept pre-signed forms. GC will ask the applicant directly. They will know.",
  "umf680-2":     "Companion form to the 680-3A. Required for all applicants. Not optional. Not 'we usually skip this.' If the applicant has braces, attach the orthodontist letter here. GC checks for this specifically.",
  "umf408":       "MEPS processing form. Required. Has braces? Attach the braces letter from the orthodontist. MEPS will send the applicant home without it. You will explain this to the applicant. It will not be a fun conversation.",
  "dd2807":       "Every block answered. Write N/A for non-applicable. Blank blocks are where packets go to die slowly and expensively. Dates must match UMF 680-3A and GENESIS. Disclosure inconsistency with moral screening = GC return.",
  "dd2005":       "Privacy Act statement for health care records. Current signature. Not a previously signed copy. Not pre-signed. Current. Applicant signs acknowledging the statement. It exists. It's required. GC will notice if it's missing.",
  "dates":        "Cross-check DD 2807-2 vs. UMF 680-3A vs. UMF 680-3A-2 vs. GENESIS. Every date. One-day difference = returned. GC has a calendar. They will use it. They enjoy using it. Do this before initiating SC QC every time.",
  "uf15":         "3 to 7 calendar days before MEPS. Not 8. Not 14. Not 'I finished it early to stay ahead.' It expires. Your organizational enthusiasm will be rewarded with a returned packet and a conversation about reading instructions.",
  "temp-res":     "Valid 7 calendar days only. MEPS date shifts past 7 days? Recreate it. Maximum 3 per applicant. On your third one, call GC before clicking anything. GC will want to know why you've been to the well twice already.",
  "mirs":         "Print on submission day. Not yesterday. Not last week. Not 'I'm pretty sure it's current.' Today. AFQT must match the most recent ASVAB in RZ. Stale MIRS on waiver packets is a very specific and very avoidable source of shame.",
  "asvab":        "Valid 2 years from test date. PICAT requires a MEPS confirmation test before scores are official — those aren't real scores yet. Verify AFQT matches MIRS 1.1. These are two different numbers and they must be the same number.",
  "sigs":         "All signatures obtained in your physical presence. Not mailed. Not pre-signed. Not 'they were right here when I had the pen.' Wite-Out on a government form is a war crime. GC will circle it. Then circle you. Single line through the error, write the correction, initials. That is the law.",
  "mar-cert":     "Certified copy with raised seal. Verify name matches current legal name. Prior marriages? Every divorce decree, for every prior marriage, in the packet. 'I forgot about that one' is not a GENESIS entry.",
  "sp-docs":      "SSC (original or certified), birth certificate (certified), government-issued photo ID. All three. For each spouse. Names must be consistent across documents. GC will check all three.",
  "div-dec":      "Required for each prior marriage. Certified copy showing final decree. Note N/A if there are no prior marriages. Do not assume. Ask the applicant directly. 'It's complicated' is not a legal status.",
  "dep-docs":     "SSC and birth certificate for each dependent child. Both. Original or certified. For each child. GC will count the children. GC will count the documents. These numbers must match.",
  "child-sup":    "Required if there's a court-ordered child support obligation. Mark N/A if there's no court order. 'I pay informally' is not a court order. 'We have an agreement' is not a court order. A court order is a court order.",
  "dd214":        "RE code: must be eligible. Character of discharge: Honorable or General. Dates of service must match GENESIS. RE code requiring waiver? Call GC before you touch anything else. GC will want to discuss this. You should want to discuss it too.",
  "redd":         "Required for all prior service. Applicant acknowledges their prior service record. Must be signed. If they haven't signed it, it's not done. This is a complete sentence and also a complete checklist item.",
  "promo-ord":    "Most recent promotion orders. N/A if they separated at E-1 (no shame in that). Required to verify rank at separation for enlistment grade determination. GC will verify. Your orders better match what GENESIS says.",
  "imr":          "USAR/NG prior service. Individual Medical Record. Provides medical history for MEPS review. Mark N/A if not available — note it in GENESIS remarks so GC knows you thought about it.",
  "pha":          "Periodic Health Assessment. Most recent one. USAR/NG. Required for MEPS. If they don't have it, document why in remarks. GC would rather see a note explaining the absence than a blank space implying you didn't look.",
  "dd368-irr":    "IRR/Reserves obligation remaining? DD 368 required and must be approved before MEPS processing. N/A if no remaining obligation. Verify the IRR status. Don't guess. Guessing is how you find out at MEPS.",
  "dd368":        "DD 368 must be approved by both gaining AND releasing component commanders. Not pending. Not submitted. Approved. And not expired. Check the approval date and the expiration. Both. GC will.",
  "mor-stmt":     "Written by the applicant. In their own words. In their own handwriting — or typed by them. You may not write it. You may not 'help them phrase it.' You may not 'clean it up a little.' GC has read enough recruiter-written personal statements to identify your writing style by font choice alone.",
  "uf60108":      "Newest to oldest. Asterisk the offense(s) being waived — only those. AFQT must match most recent ASVAB in RZ. Marijuana possession/use: NO waiver required per AR 601-210 para 4-6 (Mar 2026). Distribution is different. Verify with GC before assuming.",
  "mor-incident": "Police incident report from the arresting jurisdiction. For every offense above traffic. Can't get a report? Use UF 601-210.02. Do not submit without one or the other. GC needs to read what happened. 'Trust me' is not a document.",
  "dockets":      "Three components per offense: (1) charging document (information docket), (2) court finding and sentencing, (3) final disposition. All three. For every offense above traffic. If the court won't furnish: UF 601-210.02. GC will ask for each one.",
  "dd370":        "Three references: employment, school, personal. All returned and in hand before projecting. College reference must include a transcript. No family as personal references. GC will read these letters. Ensure the references know they're references.",
  "uf601-02":     "Use when the court won't furnish dockets, or for self-admittal offenses with no arrest record. Mark N/A on items where official records were obtained. GC accepts one or the other — not neither.",
  "fl60104":      "Required if applicant was confined 24+ hours in any institution: jail, detention center, juvenile facility, inpatient program. The institution fills out and signs page 2. Mark N/A if no confinement. GC will ask if they see a confinement history without this form.",
  "mor-co":       "Company Commander interviews the applicant. Produces an MFR documenting the interview, findings, and recommendation. On official letterhead. Signed. Dated. Undated or unsigned = GC sends it back. Every time.",
  "mor-bn":       "Battalion Commander endorsement recommending approval or disapproval. On official letterhead. Signed. Dated. Must reference the specific offense(s) being waived. GC compares this to the UF 601-210.08. They match or they don't.",
  "meps-disp":    "Submit the complex prescreen to MEPS. Wait for a written disposition. Do not schedule MEPS until MEPS responds in writing. 'I called and they said it might be okay' is not a written MEPS disposition. GC will ask to see the disposition letter.",
  "med-stmt":     "Applicant describes the condition, treatment history, and current status. Must address the specific condition(s) being waived. MEPS told you what they need — the statement should address it. GC will compare the statement to the MEPS disposition.",
  "med-recs":     "Whatever MEPS specified in the disposition letter: get it. All of it. Number multi-page records. Legible. Complete. Missing records = MEPS return. GC will remind you that MEPS told you exactly what they needed.",
  "age-stmt":     "Applicant statement supporting the Age ETP request. Explain motivation, maturity, plans. GC wants to believe this person is ready. Help them believe it.",
  "age-asvab":    "Minimum AFQT of 50 required for Age ETP. Verify the current valid score in RZ. Below 50 = does not qualify. No exceptions. No 'but they're really motivated.' Motivated with a 49 doesn't qualify.",
  "age-med":      "Fully medically qualified with no pending disqualifiers. Age ETP cannot be submitted with a pending medical issue. MEPS must clear them medically before the Age ETP goes anywhere.",
  "age-scan":     "Current valid Live Scan. Valid 120 days from scan date. Expired? Redo it. Same rule as always. GC doesn't make exceptions for Age ETP applicants any more than they do for anyone else.",
  "age-mirs":     "Current MIRS 1.1 printout. Print it the day you submit the packet. Not the day before. Today. AFQT on the MIRS must match what's in RZ. Same rule as always.",
  "tat-stmt":     "Applicant describes each tattoo being waived: location, size, content, and why it's being waived. Must address each one individually. 'All my tattoos' is not a description. GC will look at the photos and compare.",
  "tat-photos":   "Color photos. Not black and white — GC will ask why you're colorblind. Full tattoo visible. Body location shown for context. Photos dated. For each tattoo being waived. GC will zoom in. Make sure the photos are worth zooming into.",
  "tat-co":       "Company Commander reviews the tattoo content against AR 670-1 and writes a recommendation memo. On letterhead. Signed. Dated. GC defers to the CO review but reserves the right to have additional opinions.",
  "tat-picat":    "Current valid ASVAB or PICAT score on file in RZ. Same as always — if it's PICAT, the MEPS confirmation test must already be done. GC won't approve a waiver packet on unconfirmed scores.",
  "tat-dd2807":   "Completed medical prescreening, same requirements as any other packet. Tattooed applicants still have bodies. Those bodies still go to MEPS. MEPS still needs the 2807.",
  "rel-stmt":     "Applicant describes the specific religious accommodation being requested and the religious basis. Must be sincere. Must be specific. GC forwards this to a chaplain. Chaplains can tell the difference between sincere belief and creative writing.",
  "rel-co":       "Company Commander review and recommendation. On letterhead. Signed. Dated. This is a sensitive packet. GC handles it accordingly. So should everyone else.",
  "rel-bn":       "Battalion Commander endorsement. On letterhead. Signed. Dated. Same requirements as CO memo but from one level up. GC checks both.",
  "rel-chaplain": "BDE Chaplain memo supporting or addressing the accommodation request. The chaplain has reviewed the religious basis and weighed in. This signature carries significant weight in GC's review.",
  "re-stmt":      "Applicant explains the circumstances of the prior separation and RE code. Not a brief explanation. A complete account. GC reads the DD 214, then reads this statement. They must be compatible.",
  "re-dd370":     "Three fingerprint cards (DD 370). Current and properly completed. Not three copies of the same card. Three cards. RE code waiver packets have their own requirements and GC knows all of them.",
  "re-co":        "Company Commander review and recommendation. On letterhead. Signed. Dated. GC will check the CO against the BN Commander. These recommendations should be aligned.",
  "re-bn":        "Battalion Commander endorsement. On letterhead. Signed. Dated. Must address the RE code specifically. GC compares the BN memo to the CO memo and the DD 214. Everything must be consistent.",
  "dep-stmt":     "Applicant explains the dependency situation and their ability to fulfill military obligations. GC needs to believe this applicant can serve. The statement is their argument. Help them make a good one — without writing it for them.",
  "dep-co":       "Company Commander memo addressing the waiver. Required. On letterhead. Signed. Dated. GC reviews the CO's assessment alongside the caretaker statement and family care plan.",
  "dep-caretaker":"Signed statement from the designated caretaker for each dependent. They confirm willingness and ability to care for the dependent during service. Without this, the dependency waiver has no plan. GC will note the absence immediately.",
  "dep-da3072":   "DA Form 3072-2 — Financial Disclosure. All income entries must be MONTHLY. Not annual divided by 12. Not weekly times 4. Monthly. Do NOT include anticipated military pay. GC will do the math. Their calculator works.",
  "dep-fcp":      "Family Care Plan designating caretakers for deployment and training. Required. Completed. Not 'we have someone in mind.' Completed. With names. With signatures. GC treats this as the applicant's commitment on paper.",
  "arms-680adp":  "ARMS-specific prescreening form — USMEPCOM 680-ADP. Required IN ADDITION to the standard 680-3A. Both forms. ARMS packets have additional medical screening requirements. 'I didn't know there was another form' is not a GC answer.",
  "arms-da5500":  "DA 5500: Body Fat Worksheet for males over screening weight. Required if applicable. Army method, trained assessor. Results must meet Army standards for enlistment. MEPS will not process an overweight applicant without this.",
  "arms-da5501":  "DA 5501: Body Fat Worksheet for females over screening weight. Required if applicable. Same method, same standard, different form. MEPS will not process without it. GC will return the packet without it.",
  "arms-mirs":    "Current MIRS 1.1 — print on submission day. ARMS packets require current AFQT and GT scores to meet program minimums. GC cross-checks the MIRS against iKrome. They must match.",
  "fspc-elig":    "FSPC sub-program requirements change frequently. Verify current eligibility with GC before initiating. Confirm the correct sub-program code in iKrome. GC has seen FSPC packets submitted under the wrong sub-program. They do not enjoy this.",
  "ocs-da61":     "DA Form 61: Application for commissioned officer appointment. No blanks. Every field. GC has a gift for finding the one blank field in a 4-page form. Fill all of them.",
  "ocs-trans":    "Official sealed transcripts from all colleges attended. Bachelor's degree from a regionally accredited institution required. GPA visible. Degree major visible. Unsealed transcripts are not official. GC knows the difference.",
  "ocs-lor":      "Three letters from officers O-3 or above. On official letterhead. Signed. Dated within 12 months of packet submission. Below O-3: doesn't count. Older than 12 months: doesn't count. GC will check the dates and the ranks.",
  "ocs-gt":       "Minimum GT score of 110. Verify in iKrome line scores. Below 110: applicant does not qualify. No waivers for GT score on OCS. No exceptions. GC will not review an OCS packet from a GT-109 applicant.",
  "ocs-acft":     "Current certified ACFT scores meeting the OCS standard for the applicant's age/gender group. From an official ACFT administration. Not self-reported. Not estimated. Official. Certified.",
  "ocs-photo":    "Army photo in Army Service Uniform (ASU). Taken within 6 months of packet submission. Not their high school graduation photo. Not their JROTC photo. A current, official Army photo. In ASU.",
  "ocs-med":      "Standard MEPS physical clearance. No pending medical holds. OCS uses the standard MEPS physical — not a specialized physical. Medically cleared means cleared. Not 'in progress.'",
  "flri-dd214":   "DD 214 showing commissioned officer service, separation code, and Honorable character of discharge. FLRI is for prior commissioned officers specifically. Enlisted veterans don't qualify. GC will check the separation code.",
  "flri-da61":    "DA Form 61. Same form as OCS but submitted under the FLRI program. No blanks. On official letterhead. Per current HRC instructions. The instructions for FLRI change. GC knows the current version.",
  "flri-elig":    "FLRI eligibility verification memo from RSC or USAREC — obtained BEFORE initiating any packet documents. FLRI has quotas. FLRI requirements change. Processing without this memo means you may have worked on a packet that was never going to be approved.",
  "flri-trans":   "Sealed official transcripts. Bachelor's degree from regionally accredited institution required. Same requirements as OCS. FLRI is a former officer returning — their educational credentials are still being reviewed.",
  "flri-lor":     "Letters from O-4 or above (higher rank requirement than OCS). Official letterhead. Signed. Within 12 months. One letter below O-4 means the packet is incomplete. GC checks the ranks. Always.",
  "atp-elig":     "Call GC before initiating ATP documents. ATP MOS availability changes by cycle. ATP requirements change by regulation. The call takes 5 minutes. The alternative is completing a packet for a program that doesn't currently have an opening.",
  "atp-scores":   "Line scores for the intended MOS must meet the minimum. Verify against current ASVAB scores in iKrome. The MOS must be available. Both conditions must be true at the same time.",
  "atp-contract": "ATP enlistment option coded in iKrome before MEPS scheduling. Confirm with GC. Do not schedule MEPS on an uncoded ATP packet. MEPS will not know what to do with it. Neither will you.",
  "atp-mos":      "ATP MOS must be available in the current cycle and all line score minimums must be met. Two separate requirements. Both must be confirmed. Simultaneously. GC will check both before approving the packet for review.",
  "rotc-ltr":     "From the Professor of Military Science only. Not the ROTC admin. Not the recruiting officer. Not any cadet. The PMS. Active enrollment confirmed. Program year (MS-I through MS-IV) stated. Expected commissioning date included. GC will ask for the PMS signature specifically.",
  "smp-cont":     "Applicant AND ROTC battalion representative both sign. Contract covers current semester through expected commissioning. Scholarship terms must appear for scholarship cadets. GC will check for missing scholarship language. It is a thing that happens.",
  "smp-orders":   "Most recent assignment orders to current unit. Verify unit designation and UIC match GENESIS. Recently transferred? Get orders from the current unit. GC will not process SMP paperwork that points to a previous unit.",
  "smp-trans":    "Academic transcript confirming enrollment and good standing. Academic probation or suspension? Stop. Call GC before proceeding. SMP eligibility may be void. GC would rather hear this from you than discover it in the transcript.",
  "smp-eval":     "Most recent NCOER or OER — required if applicant is E-5 or above, or holds officer rank in reserve component. Below E-5 with no officer history: N/A. This is one of the few N/A items that actually makes sense.",
  "da61":         "DA Form 61: Application for Warrant Officer appointment. Submit to HRC Aviation per current instructions. No blanks. Current instructions change frequently. Confirm the submission process with your RSC before you seal the packet.",
  "sift":         "Structured Interview for Flight Training. Minimum score: 40. One retake permitted after a mandatory 6-month waiting period. Below 40 = WOFT ineligible. There is no waiver. There is no exception. There is only the 6-month wait and the second try.",
  "flt-phys":     "Class 1A Flight Physical — not a standard MEPS physical. Notify MEPS in advance. Coordinate with your RSC. The WOFT packet cannot be submitted to HRC until the flight physical is complete. Showing up at MEPS without coordinating is how you get sent home.",
  "woft-gt":      "Minimum GT score of 110 required. Verify in iKrome line scores. Below 110 = WOFT ineligible. Same rule as OCS. Different dream. Same cutoff.",
  "woft-trans":   "60+ college credit hours preferred — not required but significantly strengthens the packet. Official transcripts. If they have credits, include them. If they don't, the packet can still work — but HRC notices the difference.",
  "woft-ltrs":    "Three letters of recommendation. At least one from a military officer (CW2+ or commissioned O-1+). Three total. One must be military. All on letterhead. All signed. All current. GC checks the letter count. Every time.",
};

/* ═══════════════════════════════════════════════════════
   GC MOODS — 30 options
════════════════════════════════════════════════════════ */
const GC_MOODS = [
  "HUNGRY & JUDGMENTAL",
  "SUSPICIOUS OF EVERYTHING",
  "SEEN IT ALL BEFORE (AND HATED IT)",
  "CAFFEINATED & DANGEROUS",
  "MONDAY ENERGY ON A FRIDAY",
  "REVIEWING YOUR SINS",
  "DISAPPOINTINGLY CALM",
  "IN A MEETING — DO NOT DISTURB",
  "JUST RETURNED ANOTHER PACKET",
  "HOLDING THE POWER TO DESTROY YOU",
  "FILING PAPERWORK WITH PREJUDICE",
  "NOT IMPRESSED. NOT EVEN SLIGHTLY.",
  "AWAITING YOUR INEVITABLE MISTAKE",
  "READING YOUR SF-86 WITH DELIGHT",
  "CIRCLING DD 369 IN RED PEN",
  "FORWARDING TO BATTALION AS EXAMPLE",
  "RUNNING ON COFFEE AND SPITE",
  "ACTIVELY LOOKING FOR PROBLEMS",
  "FOUND PROBLEMS. CATALOGUING THEM.",
  "WRITING RETURN MEMO AS WE SPEAK",
  "HAS SEEN WORSE (BARELY)",
  "AMUSED BY YOUR CONFUSION",
  "CALENDARING YOUR FAILURE",
  "ZOOMING IN ON YOUR TATTOO PHOTO",
  "COMPARING YOUR DATES WITH A RULER",
  "PERFORMING A LIVE SCAN ON YOUR CAREER",
  "CURRENTLY READING PARA 2-11B AGAIN",
  "BUILDING A CASE",
  "SLEEP DEPRIVED AND UNFORGIVING",
  "ONE MORE THING AWAY FROM RETIRING",
];

/* ═══════════════════════════════════════════════════════
   GC VOICE LINES — 30 options
════════════════════════════════════════════════════════ */
const GC_VOICE_LINES = [
  "Where's the Live Scan authorization in Contact History? ...That's what I thought.",
  "You completed the UF 601-210.15 three weeks early. Bold choice. Wrong choice. Come back in two weeks.",
  "I have your packet. I have questions. They are not good questions. You should sit down.",
  "The Alias Tab is empty. I see two different names on your documents. I'm circling both.",
  "Your DD 369 does not cover the offense location. Try again. From the beginning. All three jurisdictions.",
  "Did you just Wite-Out a government form? Did you? Do you know what a line and initials are? Go find out.",
  "The MIRS is from last Tuesday. Reprint it. Today. While I watch.",
  "I'm looking at your SF 86 validation report. It has flags. Many flags. It looks like a golf course in July.",
  "Station Live Scan Authorized was entered in SC Remarks. That is not Contact History. That is not even the same page.",
  "I need you to explain what 'approximately complete' means on a federal enlistment document. Take your time.",
  "The dates on the DD 2807-2 and the 680-3A disagree by one day. ONE DAY. The calendar has not changed. Do it again.",
  "Your packet is missing the BN Commander memo. The one I mentioned last time. And the time before that.",
  "A DD 369 with a handwritten alias. I've circled it. I've stared at it. I've shown it to my supervisor. We're all staring at it now.",
  "The applicant signed the form before meeting you. Pre-signed. You know what pre-signed means. Don't you.",
  "I don't know what this document is, but I know with certainty that it is not what I asked for.",
  "The Alias Tab has one entry. The Screening Tab lists three names. Do you want to explain the other two, or should I?",
  "Your source documents are blurry. I have been staring at this scan for four minutes. I cannot read it. MEPS cannot read it. GC cannot read it. Rescan.",
  "The AFQT on the UF 601-210.08 is 67. The AFQT in RZ is 71. These are two different numbers. They cannot both be correct.",
  "You submitted the packet with an expired Temp Res. MEPS already called me. We had a conversation about your attention to detail.",
  "The marijuana offense has a waiver initiated. Per AR 601-210 para 4-6, effective March 2026, marijuana possession and use no longer requires a formal waiver. Would you like a moment to absorb that information?",
  "The UF 601-210.15 was completed 12 days before MEPS. The form is valid for 7 days. We are now on day 12. Do the math with me.",
  "Your reference on DD Form 370 is the applicant's mother. She is listed as a 'personal reference.' She is their mother.",
  "I see a DD 214 with an RE-3 code. I see no phone call from you asking how to proceed. I see a packet on my desk. These three things are related.",
  "The court dockets have two of the three required components. Charging document: present. Court finding: missing. Final disposition: present. You are two-thirds of the way to done. That's not done.",
  "The CO interview MFR is undated. An undated government memo is a theory. We need a document.",
  "I have counted the character references on this DD Form 370. I count two. The requirement is three. You are one reference short of a requirement.",
  "The body fat worksheet is missing. The applicant is over screening weight. MEPS noticed before I did, which means MEPS called me before you did. That is not the preferred order of operations.",
  "The SIFT score is 37. The minimum for WOFT is 40. I have nothing to add to that sentence.",
  "You scheduled MEPS before receiving the written MEPS disposition on the complex prescreen. The MEPS CMO has opinions about this. They shared those opinions with me at length.",
  "I just need you to understand that 'N/A' is a complete answer, but only when the answer is actually 'not applicable.' An empty field and an N/A are not the same thing.",
];

/* ═══════════════════════════════════════════════════════
   SUBMIT TO SC ROASTS — 25 options
════════════════════════════════════════════════════════ */
const SC_SUBMIT_ROASTS = [
  "GC just opened your packet. They smiled. Then they stopped smiling. They haven't looked up since. This is not a good sign.",
  "The SC forwarded it to GC. GC forwarded it to a folder called 'EXAMPLES OF FAILURE.' You are now a teaching tool.",
  "Packet received. GC is currently on page 3. They've been on page 3 for eleven minutes. They have a red pen in their hand.",
  "Submitted successfully. GC has already identified four items to circle. They're warming up their wrist. This is their cardio.",
  "The packet arrived at GC's desk. GC said 'oh.' That's the worst thing they can say. Just 'oh.' With the face.",
  "Station Commander accepted it. GC called them immediately. It was a short call. Nobody laughed. The SC looked at their phone afterward for a long time.",
  "Your packet is now in the queue. GC reviewed the first page and immediately forwarded it to the BN S1 as a cautionary tale for the weekly packet quality brief.",
  "GC opened the packet, found the MIRS, and checked the date. Then checked today's date. Then checked the MIRS date again. Then called you. Check your phone.",
  "The packet has been received. GC pulled up your SF 86 Validation Report. It still has flags. GC is cataloguing them alphabetically.",
  "Submitted. GC just ran your dates against the calendar. Manually. With a ruler. One of your forms has a discrepancy. GC knows which one.",
  "The SC reviewed it in 45 seconds and sent it to GC. GC has now been reviewing it for 23 minutes. The gap in review time tells a story.",
  "Packet received. GC printed it out. All of it. They are now reading it with a highlighter. You will receive a rainbow in return.",
  "GC opened the source documents tab and looked at the scan quality. They stared at it. They zoomed in. They stared at it more. They closed the tab.",
  "The packet arrived. GC flipped directly to the Alias Tab. It was empty. GC has not recovered from this. Neither has the applicant's future.",
  "Submitted. GC checked the DD 369 against the address history. One jurisdiction is missing. GC is already drafting the return memo header. They're on the date line.",
  "The SC said 'looks good.' GC was in the room. GC did not say anything. GC's silence is the most terrifying sound in the United States Army.",
  "GC received your packet and immediately asked the RSC staff if anyone had worked with this station before. The answer was yes. The room got quiet.",
  "Packet confirmed received. GC opened the medical forms. Checked the dates. Cross-referenced them. Found a discrepancy. Wrote it down. Wrote something else next to it. Put it in a folder.",
  "GC has your packet. GC has a list. GC is comparing your packet to the list. There are items on the list that are not in your packet. GC is adding those items to a different list.",
  "The Station Commander submitted it with a note saying 'This one's solid.' GC read the note, then read the packet, then read the note again, then looked at a window for a while.",
  "Packet received. GC found the CO interview MFR. It was undated. GC dated it with a question mark. Then returned it.",
  "GC is reading your applicant statement for the moral waiver. They can tell it was written by you. They're looking at it the way someone looks at a menu they've ordered wrong from before.",
  "Submitted. GC checked the character references. One is the applicant's aunt listed as 'personal friend.' GC knows what an aunt is. GC is writing a note about what a family member is.",
  "The packet has arrived. GC has begun the SF 86 Validation Report review. They're at flag number one. There are more flags. GC is pacing themselves.",
  "GC accepted the packet into review. They said 'we'll see.' In eleven years in this job, 'we'll see' has never meant what you want it to mean.",
];

/* ═══════════════════════════════════════════════════════
   CONFESSIONAL ROASTS — 35 options
════════════════════════════════════════════════════════ */
const CONFESSIONAL_ROASTS = [
  "That's between you, GC, and the Lord. Mostly GC.",
  "I've seen worse. Actually, I haven't. This is a record.",
  "You should have led with that in your first email. Three months ago.",
  "This explains so much about your packet. It explains everything, actually.",
  "The regulations do not forgive. Neither does GC. Neither does the BN Commander who is now aware of this.",
  "Noted. Forwarded to battalion. Good luck out there.",
  "Your recruiter instincts are a work in progress. A very early-stage work in progress.",
  "GC says: Fix it and never speak of this again. To anyone. Ever.",
  "I appreciate the honesty. The recruiter who did this before you was also honest. Eventually. After the packet came back twice.",
  "We're going to need you to take a knee and reflect on the decisions that led to this moment.",
  "This will appear in your next professional development counseling. Not as a positive data point.",
  "The GC has requested that you re-read AR 601-210, specifically the chapter you apparently skipped.",
  "That is the third time this month someone has confessed to this exact thing. You're all reading from the same script.",
  "GC heard your confession and responded with a 14-slide PowerPoint on proper packet preparation. It's titled 'We've Been Over This.'",
  "Noted. The Station Commander is also being informed. As a learning opportunity. For the entire station.",
  "Your penance is to re-read UR 601-210 para 24-3 until you can recite the timing requirements for the UF 601-210.15 from memory.",
  "GC's exact words were: 'I see.' Two words. The most devastating two words in the recruiting force.",
  "This is going in the weekly quality brief. Your station's name will not be mentioned. But everyone will know.",
  "The regulations exist because someone did exactly what you just described. You are now that person for the next generation.",
  "Absolution denied. Please report to your platoon sergeant's office. Take your packet. Take all your packets.",
  "GC responded: 'Thank you for telling me. I already knew.' They didn't elaborate. They didn't need to.",
  "The Lord forgives. GC schedules a call.",
  "I've forwarded your confession to the RSC Master Trainer as a case study. You'll be anonymous. Sort of.",
  "GC read your confession, wrote three notes, crossed out two of them, and kept the most important one. It says 'again.'",
  "Your sincerity is noted and appreciated. Your attention to the regulation requirements will be even more appreciated next time.",
  "GC's advice: 'Stop. Read the reg. Start over.' Three sentences. Delivered in one breath. Without looking up.",
  "You are forgiven. The packet is not. Redo the packet.",
  "This is the recruiting equivalent of calling in sick on payday. You can do it. You just have to live with having done it.",
  "GC says the road to a returned packet is paved with good intentions and incomplete DD 369 returns.",
  "Your honesty is refreshing. Your attention to regulatory guidance needs a similar refresh.",
  "GC filed your confession under 'Things I Already Knew' and moved on. They are efficient like that.",
  "The BN Master Trainer sends their regards. They were forwarded your situation as professional development material.",
  "GC said and I quote: 'I'm not even angry. I'm just tired.' That is actually worse than anger.",
  "Three things: Fix it. Don't do it again. Read para 2-11b. In that order.",
  "You have taken the first step, which is admitting what happened. The second step is fixing it. The third step is never mentioning it to anyone.",
];

/* ═══════════════════════════════════════════════════════
   FULL AUTOPSY COMMENTS
════════════════════════════════════════════════════════ */
const FULL_AUTOPSY_COMMENTS = [
  "AUTOPSY COMPLETE. CAUSE OF DEATH: MULTIPLE ORGAN FAILURE.",
  "FULL DISSECTION PERFORMED. PROGNOSIS: SEEK GC IMMEDIATELY.",
  "RESULTS IN: THIS PACKET HAS SEEN BETTER DAYS.",
  "EXAMINATION COMPLETE. THE LIVER (BACKGROUND) IS THE PROBLEM. IT'S ALWAYS THE LIVER.",
  "FULL AUTOPSY REVEALS: EVERYTHING WAS FINE UNTIL IT WASN'T.",
  "DISSECTION LOG: MORE FLAGS THAN A GOLF COURSE IN JULY.",
  "CAUSE OF DEATH DETERMINED: PREMATURE UF 601-210.15 COMPLETION.",
  "AUTOPSY FINDING: THE NERVOUS SYSTEM (GENESIS) IS IN CRITICAL CONDITION.",
];

const _fmtTime = () => new Date().toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" });
const _rand = arr => arr[Math.floor(Math.random()*arr.length)];

/* ═══════════════════════════════════════════════════════
   PROFILE OPTIONS — humorous labels for dropdowns/toggles
════════════════════════════════════════════════════════ */
const AUTOPSY_PROFILE_OPTS = {
  citizenship: [
    { v:"citizen",     l:"US CITIZEN (NATURAL BORN) — THE DEFAULT SETTING" },
    { v:"naturalized", l:"NATURALIZED CITIZEN — WELCOME TO THE CLUB" },
    { v:"lpr",         l:"PERMANENT RESIDENT (LPR) — GOOD LUCK WITH THAT I-551" },
  ],
  ageGender: [
    { v:"18m",    l:"18+ MALE — BASIC EDITION" },
    { v:"18f",    l:"18+ FEMALE — STILL BASIC" },
    { v:"17m-sp", l:"17 SINGLE PARENT MALE — EXTRA PAPERWORK DLC" },
    { v:"17f-sp", l:"17 SINGLE PARENT FEMALE — NIGHTMARE MODE" },
    { v:"17m-bp", l:"17 BOTH PARENTS MALE — DOUBLE SIGNATURE SPECIAL" },
    { v:"17f-bp", l:"17 BOTH PARENTS FEMALE — PARENTAL GUILT EDITION" },
  ],
  waivers: [
    { v:"moral",      l:"MORAL (THE FUN KIND)" },
    { v:"medical",    l:"MEDICAL (THE EXPENSIVE KIND)" },
    { v:"suitability",l:"SUITABILITY (THE VAGUE KIND)" },
    { v:"age-etp",    l:"AGE ETP (THE 'BUT I'M ALMOST 18' KIND)" },
    { v:"tattoo",     l:"TATTOO (THE 'IT'S JUST A BUTTERFLY' KIND)" },
    { v:"religious",  l:"RELIGIOUS ACCOMMODATION" },
    { v:"re-code",    l:"RE CODE (THE 'I WAS YOUNG AND DUMB' KIND)" },
    { v:"dependency", l:"DEPENDENCY" },
  ],
  programs: [
    { v:"arms20",    l:"ARMS 2.0 — WE LOWERED THE BAR FOR YOU" },
    { v:"fspc3",     l:"FSPC / IIIB" },
    { v:"fspc-arms", l:"FSPC + ARMS 2.0 — DOUBLE THE ACRONYMS" },
    { v:"flri",      l:"FLRI" },
    { v:"ocs",       l:"OCS — OFFICER CANDIDATE SUFFERING" },
    { v:"smp",       l:"SMP — SIMULTANEOUS MEMBERSHIP PAIN" },
    { v:"woft",      l:"WOFT — THE COOL ONE (FLIGHT)" },
    { v:"atp",       l:"ATP" },
  ],
};

const RANDOM_NIGHTMARES = [
  { citizenship:"lpr",       ageGender:"17f-bp", waivers:["moral","medical","dependency"],           programs:["arms20","woft"]        },
  { citizenship:"citizen",   ageGender:"17m-sp", waivers:["moral","re-code","tattoo"],               programs:["ocs","smp"]            },
  { citizenship:"naturalized",ageGender:"18m",   waivers:["medical","suitability"],                  programs:["arms20","fspc3"]       },
  { citizenship:"lpr",       ageGender:"17f-sp", waivers:["moral","medical","tattoo","age-etp"],      programs:["woft"]                },
  { citizenship:"citizen",   ageGender:"18f",    waivers:["suitability","religious"],                 programs:["arms20","fspc-arms","flri"] },
  { citizenship:"naturalized",ageGender:"17m-bp",waivers:["moral","tattoo","re-code","dependency"],   programs:["ocs"]                 },
];

const cycleStatus = (s) => s==="pending"?"complete":s==="complete"?"flagged":"pending";
const badgeClass  = (s) => s==="complete"?"aut-badge aut-badge-complete":s==="flagged"?"aut-badge aut-badge-flagged":s==="na"?"aut-badge aut-badge-na":"aut-badge aut-badge-pending";
const badgeLabel  = (s) => s==="complete"?"COMPLETE":s==="flagged"?"FLAGGED":s==="na"?"N/A":"PENDING";

/* ═══════════════════════════════════════════════════════
   SECTION NOTES — inline notes textarea per organ card
════════════════════════════════════════════════════════ */
const AutSectionNotes = ({ sectionId, value, onChange }) => {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ padding:"10px 20px 14px", borderTop:"1px solid #1f2937" }}>
      <div className="aut-pstart" style={{ fontSize:6, color:"#3f3f46",
        letterSpacing:2, marginBottom:6 }}>FIELD NOTES — INTERNAL ONLY</div>
      <textarea
        value={value || ""}
        onChange={e=>onChange(sectionId, e.target.value)}
        onFocus={()=>setFoc(true)}
        onBlur={()=>setFoc(false)}
        placeholder="Add notes for this section..."
        style={{ width:"100%", resize:"vertical", minHeight:46, maxHeight:140,
          background: foc ? "rgba(255,204,1,.03)" : "#050505",
          color:"#e5e5e5",
          border:`1px solid ${foc ? "rgba(255,204,1,.3)" : "#27272a"}`,
          fontFamily:"'VT323',monospace", fontSize:15, lineHeight:1.5,
          padding:"8px 10px", outline:"none", borderRadius:4,
          fontStyle: value ? "normal" : "italic",
          transition:"border .15s, background .15s" }}/>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════ */
const AutopsyMode = ({ sections, statuses, profile, aliasCheck, onToggle, onQuickComplete, onReset }) => {

  /* ── Inject scoped CSS + Font Awesome ── */
  useEffect(() => {
    const id="aut-styles", faId="aut-fa";
    if (!document.getElementById(id)) {
      const s=document.createElement("style"); s.id=id; s.textContent=AUTOPSY_CSS;
      document.head.appendChild(s);
    }
    if (!document.getElementById(faId)) {
      const l=document.createElement("link"); l.id=faId; l.rel="stylesheet";
      l.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
      document.head.appendChild(l);
    }
    return () => { const el=document.getElementById(id); if(el) el.remove(); };
  }, []);

  /* ── State ── */
  const [gcMood,       setGcMood]       = useState(() => _rand(GC_MOODS));
  const [rageSeconds,  setRageSeconds]  = useState(3600);
  const [morgueLog,    setMorgueLog]    = useState(() => [
    { time:_fmtTime(), text:"☠ AUTOPSY INITIATED — CAUSE OF DEATH: PENDING INVESTIGATION", color:"#f87171" },
    { time:_fmtTime(), text:"SUBJECT: "+(profile.name||"UNKNOWN SOLDIER"), color:"#fbbf24" },
    { time:_fmtTime(), text:"CLICK ANY BADGE TO CYCLE STATUS. CLICK ANY SKULL ☠ FOR REGULATION DETAILS.", color:"#4ade80" },
  ]);
  const [helpItem,     setHelpItem]     = useState(null);
  const [confessOpen,  setConfessOpen]  = useState(false);
  const [confession,   setConfession]   = useState("");
  const [confessResp,  setConfessResp]  = useState("");
  const [gcVoiceOpen,  setGcVoiceOpen]  = useState(false);
  const [gcVoiceLine,  setGcVoiceLine]  = useState("");
  const [submitOpen,   setSubmitOpen]   = useState(false);
  const [submitRoast,  setSubmitRoast]  = useState("");
  const [openSections, setOpenSections] = useState(() => new Set());
  const [localStatuses,setLocalStatuses]= useState({});
  const [localProfile, setLocalProfile] = useState({
    waivers:     profile.waivers  || [],
    programs:    profile.programs || [],
    citizenship: profile.citizenship || "citizen",
    ageGender:   profile.ageGender   || "18m",
    ssnLast4:    profile.ssnLast4    || "????",
    dob:         profile.dob         || "",
  });
  const [autFilter,    setAutFilter]    = useState("all");
  const [autSearch,    setAutSearch]    = useState("");
  const [sectionNotes, setSectionNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pqc-aut-notes") || "{}"); } catch { return {}; }
  });

  const prevStatuses = useRef(statuses);
  const morgueRef    = useRef(null);

  /* ── Stats ── */
  const getStatus = useCallback((id) => {
    return localStatuses[id] !== undefined ? localStatuses[id] : (statuses[id]||"pending");
  }, [localStatuses, statuses]);

  const allItems = useMemo(() =>
    sections.flatMap(s => s.items.map(i => ({ ...i, status:getStatus(i.id) })))
  , [sections, getStatus]);
  const totalCount    = allItems.length;
  const completeCount = allItems.filter(i=>i.status==="complete").length;
  const flagCount     = allItems.filter(i=>i.status==="flagged").length;
  const pendingCount  = allItems.filter(i=>i.status==="pending").length;
  const pulseScore    = totalCount>0 ? Math.round((completeCount/totalCount)*100) : 0;
  const isReady       = pulseScore===100 && flagCount===0;

  /* ── Rage timer ── */
  useEffect(() => {
    const base = Math.max(180, 3600-flagCount*420);
    setRageSeconds(base);
    const iv = setInterval(()=>setRageSeconds(s=>Math.max(0,s-1)),1000);
    return ()=>clearInterval(iv);
  }, [flagCount]);
  const fmtRage = s => `${Math.floor(s/60)}m ${(s%60).toString().padStart(2,"0")}s`;

  /* ── Morgue log — watch parent status changes ── */
  useEffect(() => {
    const prev=prevStatuses.current;
    const entries=[];
    sections.forEach(s=>{
      s.items.forEach(i=>{
        const was=prev[i.id]||"pending", now=statuses[i.id]||"pending";
        if(was!==now){
          const org=(ORGAN_MAP[s.id]||{}).organ||s.title;
          const lbl=i.label.length>40?i.label.slice(0,40)+"…":i.label;
          if(now==="complete") entries.push({time:_fmtTime(),color:"#4ade80",text:`[${org}] ${lbl.toUpperCase()} — PRONOUNCED VIABLE`});
          else if(now==="flagged") entries.push({time:_fmtTime(),color:"#f87171",text:`[${org}] ${lbl.toUpperCase()} — ⚠ CRITICAL. GC IS DRAFTING THE MEMO.`});
          else entries.push({time:_fmtTime(),color:"#fbbf24",text:`[${org}] ${lbl.toUpperCase()} — REVIVED TO PENDING (COWARDICE NOTED)`});
        }
      });
    });
    if(entries.length) setMorgueLog(p=>[...p,...entries].slice(-80));
    prevStatuses.current=statuses;
  }, [statuses, sections]);

  useEffect(()=>{ if(morgueRef.current) morgueRef.current.scrollTop=morgueRef.current.scrollHeight; },[morgueLog]);

  /* ── 3-state cycle (local) ── */
  const handleCycle = useCallback((itemId)=>{
    const current = getStatus(itemId);
    const next    = cycleStatus(current);
    setLocalStatuses(p=>({...p,[itemId]:next}));
    // Sync parent for complete/pending
    if(next==="complete" && statuses[itemId]!=="complete") onToggle(itemId);
    else if(next==="pending" && statuses[itemId]==="complete") onToggle(itemId);
    else if(next==="flagged" && statuses[itemId]==="complete") onToggle(itemId);

    const sec = sections.find(s=>s.items.some(i=>i.id===itemId));
    const itm = sec?.items.find(i=>i.id===itemId);
    const org = sec ? (ORGAN_MAP[sec.id]||{}).organ||sec.title : "";
    const lbl = itm ? itm.label.slice(0,44) : itemId;
    const col = next==="complete"?"#4ade80":next==="flagged"?"#f87171":"#fbbf24";
    const msg = next==="complete"?`[${org}] ${lbl.toUpperCase()} — CLEARED (MIRACLE)`
      :next==="flagged"?`[${org}] ${lbl.toUpperCase()} — ⚠ FLAGGED FOR EXECUTION`
      :`[${org}] ${lbl.toUpperCase()} — PENDING (STILL ALIVE, BARELY)`;
    setMorgueLog(p=>[...p,{time:_fmtTime(),color:col,text:msg}].slice(-80));
  },[getStatus, statuses, onToggle, sections]);

  /* ── Full Autopsy — randomly flag some pending items ── */
  const handleFullAutopsy = useCallback(()=>{
    const pending = allItems.filter(i=>i.status==="pending");
    const count   = Math.min(pending.length, Math.floor(Math.random()*4)+2);
    const shuffled = [...pending].sort(()=>Math.random()-.5).slice(0,count);
    setLocalStatuses(p=>{
      const next={...p};
      shuffled.forEach(i=>{ next[i.id]="flagged"; });
      return next;
    });
    const msg = _rand(FULL_AUTOPSY_COMMENTS);
    setMorgueLog(p=>[...p,
      {time:_fmtTime(),color:"#f87171",text:"☢ INITIATING FULL PACKET AUTOPSY..."},
      {time:_fmtTime(),color:"#f87171",text:msg},
      {time:_fmtTime(),color:"#f87171",text:`${count} ADDITIONAL CRITICAL ISSUES DISCOVERED AND FLAGGED.`},
      {time:_fmtTime(),color:"#fbbf24",text:"RECOMMENDATION: BURN PACKET. START OVER. GC WILL THANK YOU."},
    ].slice(-80));
  },[allItems]);

  /* ── Handlers ── */
  const randomizeGCMood = useCallback(()=>{
    const next=_rand(GC_MOODS); setGcMood(next);
    setMorgueLog(p=>[...p,{time:_fmtTime(),color:"#fbbf24",text:`GC MOOD UPDATED: ${next}`}].slice(-80));
  },[]);

  const handleNuclear = useCallback(()=>{
    setLocalStatuses({});
    setMorgueLog([
      {time:_fmtTime(),color:"#f87171",text:"☢ NUCLEAR OPTION DEPLOYED"},
      {time:_fmtTime(),color:"#f87171",text:"ALL ORGANS RESET TO PENDING. THE SLATE IS CLEAN."},
      {time:_fmtTime(),color:"#fbbf24",text:"START FROM THE TOP. READ THE REG FIRST THIS TIME."},
    ]);
    onReset();
  },[onReset]);

  const openGCVoice = useCallback(()=>{
    setGcVoiceLine(_rand(GC_VOICE_LINES)); setGcVoiceOpen(true);
  },[]);

  const handleSubmit = useCallback(()=>{
    setSubmitRoast(_rand(SC_SUBMIT_ROASTS)); setSubmitOpen(true);
    setMorgueLog(p=>[...p,{time:_fmtTime(),color:"#FFCC01",
      text:"★ PACKET SUBMITTED TO STATION COMMANDER — INITIATING PRAYER PROTOCOL"}].slice(-80));
  },[]);

  const submitConfession = useCallback(()=>{
    setConfessResp(_rand(CONFESSIONAL_ROASTS));
    setMorgueLog(p=>[...p,{time:_fmtTime(),color:"#c084fc",
      text:"CONFESSIONAL SUBMITTED — PENANCE: TBD"}].slice(-80));
  },[]);

  const toggleSection = useCallback((id)=>{
    setOpenSections(p=>{const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n;});
  },[]);

  const toggleWaiver = useCallback((v)=>{
    setLocalProfile(p=>({ ...p, waivers: p.waivers.includes(v)?p.waivers.filter(w=>w!==v):[...p.waivers,v] }));
  },[]);
  const toggleProgram = useCallback((v)=>{
    setLocalProfile(p=>({ ...p, programs: p.programs.includes(v)?p.programs.filter(pg=>pg!==v):[...p.programs,v] }));
  },[]);
  const randomizeProfile = useCallback(()=>{
    const rng = _rand(RANDOM_NIGHTMARES);
    setLocalProfile(p=>({ ...p, ...rng }));
    setMorgueLog(prev=>[...prev,{
      time:_fmtTime(), color:"#f87171",
      text:"☠ RANDOM NIGHTMARE GENERATED. GC HAS BEEN NOTIFIED. PRAYERS ACCEPTED."
    }].slice(-80));
  },[]);

  const saveAutNote = useCallback((sectionId, text) => {
    setSectionNotes(prev => {
      const n = { ...prev, [sectionId]:text };
      localStorage.setItem("pqc-aut-notes", JSON.stringify(n));
      return n;
    });
  }, []);

  /* ── Filtered sections (search + status filter) ── */
  const filteredSections = useMemo(() => {
    return sections.map(s => ({
      ...s,
      filteredItems: s.items.map(i=>({...i,ds:getStatus(i.id)})).filter(i => {
        const matchFilter = autFilter==="all" || i.ds===autFilter;
        const searchTarget = (i.label+" "+(AUTOPSY_SUBS[i.id]||i.sub||"")).toLowerCase();
        const matchSearch  = !autSearch || searchTarget.includes(autSearch.toLowerCase());
        return matchFilter && matchSearch;
      }),
    })).filter(s => s.filteredItems.length > 0);
  }, [sections, autFilter, autSearch, getStatus]);

  /* ── Alias DNA ── */
  const aliasStatus = aliasCheck.status;
  const dnaColor = aliasStatus==="match"?"#4ade80":aliasStatus==="alias"?"#f87171":aliasStatus==="discrepancy"?"#fbbf24":"#52525b";

  /* ── Ticker text ── */
  const tickerText = `
    ☠ LIVE SCAN AUTH GOES IN CONTACT HISTORY — NOT SC REMARKS — THIS IS #1 CAUSE OF DEATH •
    ☠ DD 369: ALL THREE JURISDICTIONS + EVERY ALIAS ON A SEPARATE FORM •
    ☠ UF 601-210.15: 3-7 DAYS BEFORE MEPS ONLY — COMPLETE EARLY AND IT EXPIRES •
    ☠ MARIJUANA POSSESSION/USE: NO WAIVER REQUIRED PER AR 601-210 PARA 4-6 (MAR 2026) •
    ☠ MIRS: PRINT ON SUBMISSION DAY — NEVER USE A STALE COPY •
    ☠ ALIAS TAB MUST MATCH SCREENING TAB p.1 — GC CHECKS BOTH •
    ☠ LPR: ALIEN NUMBER + EXPIRATION + CATEGORY CODE — ALL THREE IN GENESIS •
    ☠ WOFT REQUIRES CLASS 1A FLIGHT PHYSICAL — NOT STANDARD MEPS — COORDINATE IN ADVANCE •
    ☠ OCS/WOFT: GT SCORE MUST BE 110+ — NO EXCEPTIONS — VERIFY IN IKROME •
    ☠ WITE-OUT ON A GOVERNMENT FORM IS A WAR CRIME — LINE THROUGH ERROR + INITIALS ONLY •
  `.trim();

  /* ══════════════════════ RENDER ══════════════════════ */
  return (
    <div style={{ flex:1, overflowY:"auto", background:"#0A080C", color:"#E5E5E5" }}>

      {/* ── COMMAND BAR ── */}
      <div style={{ borderBottom:"2px solid #FFCC01", background:"#000",
        position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"12px 24px",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          {/* Left: logo */}
          <div style={{ display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
            <div style={{ width:46, height:46, background:"#FFCC01", display:"flex",
              alignItems:"center", justifyContent:"center", border:"4px solid #000",
              fontSize:30, lineHeight:1 }}>☠︎</div>
            <div>
              <div className="aut-pstart" style={{ fontSize:20, letterSpacing:4, color:"#FFCC01" }}>PACKET QC</div>
              <div className="aut-pstart" style={{ fontSize:7, letterSpacing:3, color:"#f87171", marginTop:2 }}>v3.0 AUTOPSY EDITION</div>
            </div>
          </div>

          {/* Center: ticker */}
          <div className="aut-ticker-wrap">
            <span className="aut-ticker-track">{tickerText}</span>
          </div>

          {/* Right: buttons */}
          <div style={{ display:"flex", gap:8, flexShrink:0 }}>
            <button className="aut-cmd-btn" onClick={()=>{setConfessOpen(true);setConfessResp("");}}>
              <i className="fas fa-pray" style={{ marginRight:6 }}></i>CONFESS
            </button>
            <button className="aut-cmd-btn" onClick={openGCVoice}
              style={{ background:"rgba(139,0,0,.15)", borderColor:"#8B0000", color:"#f87171" }}>
              <i className="fas fa-skull" style={{ marginRight:6 }}></i>GC VOICE
            </button>
            <button className="aut-nuclear-btn" onClick={handleNuclear}>
              <i className="fas fa-bomb" style={{ marginRight:6 }}></i>NUCLEAR
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"24px 24px 48px" }}>

        {/* ── VITALS DASHBOARD ── */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:10 }}>
            <div>
              <div className="aut-pstart" style={{ fontSize:7, letterSpacing:4, color:"#f87171" }}>
                CURRENT PACKET STATUS • LIVE AUTOPSY
              </div>
              <div className="aut-pstart" style={{ fontSize:22, letterSpacing:1, color:"#fff", marginTop:6, lineHeight:1.2 }}>
                {profile.name||"SUBJECT UNKNOWN"}
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div className="aut-pstart" style={{ fontSize:7, color:"#52525b", letterSpacing:2 }}>GC ON DUTY</div>
              <div className="aut-pstart" style={{ fontSize:9, color:"#FFCC01", marginTop:4 }}>
                {profile.gc||"— UNASSIGNED —"}
              </div>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            {/* Pulse */}
            <div className="aut-vital" style={{ border:"1px solid rgba(74,222,128,.25)" }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <div>
                  <div className="aut-pstart" style={{ fontSize:7, color:"#4ade80", letterSpacing:2 }}>PULSE (SURVIVAL %)</div>
                  <div className="aut-vt323" style={{ fontSize:52, color:"#4ade80", lineHeight:1 }}>{pulseScore}</div>
                  <div className="aut-vt323" style={{ fontSize:14, color:"rgba(74,222,128,.5)" }}>/ 100</div>
                </div>
                <i className="fas fa-heartbeat" style={{ fontSize:32, color:"rgba(74,222,128,.25)", marginTop:4 }}></i>
              </div>
              <div style={{ height:6, background:"#1f2937", borderRadius:3, marginTop:12, overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:3, background:"#4ade80",
                  width:`${pulseScore}%`, transition:"width .7s cubic-bezier(.2,.6,0,1)" }}/>
              </div>
            </div>

            {/* Fever */}
            <div className="aut-vital" style={{ border:`1px solid rgba(248,113,113,${flagCount>0?.35:.12})` }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <div>
                  <div className="aut-pstart" style={{ fontSize:7, color:"#f87171", letterSpacing:2 }}>FEVER (FLAGGED)</div>
                  <div className="aut-vt323" style={{ fontSize:52, lineHeight:1,
                    color:flagCount>5?"#dc2626":flagCount>0?"#f87171":"#4ade80",
                    animation:flagCount>0?"aut-death-pulse 1.5s infinite":"none" }}>
                    {flagCount}
                  </div>
                </div>
                <i className="fas fa-thermometer-full" style={{ fontSize:32, color:"rgba(248,113,113,.25)", marginTop:4 }}></i>
              </div>
              <div className="aut-pstart" style={{ fontSize:7, color:"rgba(248,113,113,.4)", marginTop:8, letterSpacing:1 }}>
                {flagCount===0?"STABLE. SUSPICIOUSLY STABLE.":flagCount>5?"CRITICAL CONDITION":"ELEVATED. GC IS WATCHING."}
              </div>
            </div>

            {/* GC Mood */}
            <div className="aut-vital" onClick={randomizeGCMood}
              style={{ border:"1px solid rgba(251,191,36,.2)", cursor:"pointer" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(251,191,36,.55)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(251,191,36,.2)"}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="aut-pstart" style={{ fontSize:7, color:"#fbbf24", letterSpacing:2, marginBottom:6 }}>GC MOOD</div>
                  <div className="aut-vt323" style={{ fontSize:19, color:"#fbbf24", lineHeight:1.3, wordBreak:"break-word" }}>
                    {gcMood}
                  </div>
                </div>
                <i className="fas fa-user-secret" style={{ fontSize:32, color:"rgba(251,191,36,.2)", flexShrink:0, marginLeft:8, marginTop:4 }}></i>
              </div>
              <div className="aut-pstart" style={{ fontSize:7, color:"rgba(251,191,36,.35)", marginTop:10, letterSpacing:1 }}>
                CLICK TO CHANGE FATE
              </div>
            </div>

            {/* Rage Timer */}
            <div className="aut-vital" style={{ border:"1px solid #27272a" }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <div>
                  <div className="aut-pstart" style={{ fontSize:7, color:"#71717a", letterSpacing:2 }}>TIME UNTIL GC RAGE</div>
                  <div className="aut-vt323" style={{ fontSize:42, lineHeight:1,
                    color:rageSeconds<300?"#f87171":rageSeconds<900?"#fbbf24":"#d4d4d8" }}>
                    {fmtRage(rageSeconds)}
                  </div>
                </div>
                <i className="fas fa-clock" style={{ fontSize:32, color:"rgba(113,113,122,.25)", marginTop:4 }}></i>
              </div>
              <div className="aut-pstart" style={{ fontSize:7, color:"#3f3f46", marginTop:8, letterSpacing:1 }}>
                FLAGS × GC PATIENCE INDEX
              </div>
            </div>
          </div>
        </div>

        {/* ── PACKET BODY + MORGUE LOG ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16, marginBottom:24 }}>
          {/* Packet visual */}
          <div className="aut-card" style={{ borderRadius:24 }}>
            <div className="aut-card-inner" style={{ padding:20 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div className="aut-pstart" style={{ fontSize:7, color:"#71717a", letterSpacing:2 }}>
                  THE PATIENT • SSN: ••••{profile.ssnLast4||"????"}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button className="aut-full-autopsy-btn" onClick={handleFullAutopsy}>
                    <i className="fas fa-stethoscope" style={{ marginRight:6 }}></i>FULL AUTOPSY
                  </button>
                  <button onClick={openGCVoice} className="aut-full-autopsy-btn">
                    <i className="fas fa-skull" style={{ marginRight:6 }}></i>ASK THE GC
                  </button>
                </div>
              </div>
              <div style={{ background:"#1f2937", border:"8px solid #4b5563",
                boxShadow:"inset 0 0 60px rgba(0,0,0,.8)", borderRadius:16,
                padding:24, minHeight:130, display:"flex", alignItems:"center",
                justifyContent:"center", position:"relative" }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:56, marginBottom:4 }}>📁</div>
                  <div className="aut-pstart" style={{ fontSize:14, letterSpacing:3, color:"#fff" }}>PACKET</div>
                  <div className="aut-vt323" style={{ fontSize:16, color:"#71717a", marginTop:4 }}>
                    {isReady?"CLEARED — READY FOR MEPS":flagCount>0?"CRITICAL CONDITION — GC ON ALERT":"UNDER EXAMINATION"}
                  </div>
                </div>
                {flagCount>3 && (
                  <div style={{ position:"absolute", top:"15%", right:"10%", transform:"rotate(12deg)",
                    fontFamily:"'Press Start 2P',monospace", fontSize:24, fontWeight:900,
                    color:"#f87171", opacity:.2, textShadow:"2px 2px 0 #000",
                    pointerEvents:"none", userSelect:"none" }}>RETURNED</div>
                )}
              </div>
              {/* Stats row */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:12 }}>
                {[
                  { label:"VIABLE", count:completeCount, color:"#4ade80" },
                  { label:"FLAGGED", count:flagCount, color:"#f87171" },
                  { label:"PENDING", count:pendingCount, color:"#fbbf24" },
                ].map(s=>(
                  <div key={s.label} style={{ background:"rgba(255,255,255,.02)", border:"1px solid #27272a",
                    borderRadius:10, padding:"10px 14px", textAlign:"center" }}>
                    <div className="aut-vt323" style={{ fontSize:28, color:s.color, lineHeight:1 }}>{s.count}</div>
                    <div className="aut-pstart" style={{ fontSize:6, color:s.color, opacity:.6, marginTop:4, letterSpacing:1 }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Morgue Log */}
          <div style={{ background:"#050505", border:"1px solid #27272a", borderRadius:24,
            padding:16, display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div className="aut-pstart" style={{ fontSize:7, color:"#f87171", letterSpacing:3 }}>
                MORGUE LOG • LIVE
              </div>
              <button onClick={()=>setMorgueLog([{time:_fmtTime(),color:"#52525b",text:"LOG CLEARED. STARTING FRESH. GODSPEED."}])}
                className="aut-vt323"
                style={{ fontSize:14, color:"#3f3f46", background:"none", border:"none", cursor:"pointer" }}>
                CLEAR
              </button>
            </div>
            <div ref={morgueRef} className="aut-morgue-log"
              style={{ flex:1, overflowY:"auto", maxHeight:310, minHeight:120 }}>
              {morgueLog.map((e,i)=>(
                <div key={i} style={{ display:"flex", gap:8, marginBottom:4 }}>
                  <span style={{ color:"#52525b", whiteSpace:"nowrap", flexShrink:0 }}>[{e.time}]</span>
                  <span style={{ color:e.color, flex:1 }}>{e.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── DNA ANALYSIS ── */}
        {aliasStatus!=="unknown" && (
          <div style={{ background:"#111", border:`1px solid ${dnaColor}30`,
            borderRadius:16, padding:"14px 18px", marginBottom:20, animation:"fadeUp .3s ease" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:aliasStatus==="match"?0:10 }}>
              <i className="fas fa-dna" style={{ color:dnaColor, fontSize:18 }}></i>
              <div className="aut-pstart" style={{ fontSize:7, color:dnaColor, letterSpacing:3 }}>DNA ANALYSIS</div>
              <div className="aut-vt323" style={{ fontSize:20, color:dnaColor }}>
                {aliasStatus==="match"?"DNA MATCH — NO ALIAS NEEDED":aliasStatus==="alias"?`⚠ ALIAS DETECTED — ${aliasCheck.groups.length} NAME VARIANT${aliasCheck.groups.length>1?"S":""}`:aliasStatus==="discrepancy"?"MIDDLE NAME MISMATCH — VERIFY WITH SUBJECT":"INCOMPLETE — ENTER DOCUMENT NAMES IN PROFILE"}
              </div>
            </div>
            {aliasStatus==="alias" && aliasCheck.groups.map(({name,docs})=>(
              <div key={name} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:5 }}>
                <span className="aut-pstart" style={{ fontSize:6, color:"#f87171",
                  background:"rgba(248,113,113,.12)", padding:"2px 6px", whiteSpace:"nowrap",
                  flexShrink:0, marginTop:3, letterSpacing:1 }}>{docs.join(" · ")}</span>
                <span className="aut-vt323" style={{ fontSize:16, color:"#e5e5e5" }}>{name}</span>
              </div>
            ))}
            {aliasStatus==="alias" && <div className="aut-pstart" style={{ fontSize:6, color:"#f87171",
              marginTop:6, lineHeight:2, letterSpacing:1 }}>
              ALL NAMES → GENESIS ALIAS TAB · SEPARATE DD 369 PER ALIAS (AR 601-210 PARA 2-11B · UM 21-022)
            </div>}
            {aliasStatus==="discrepancy" && aliasCheck.issues.map((iss,i)=>(
              <div key={i} className="aut-vt323" style={{ fontSize:15, color:"#fbbf24", marginBottom:4 }}>
                {iss.docs[0]}: {iss.vals[0]} &nbsp;vs&nbsp; {iss.docs[1]}: {iss.vals[1]}
              </div>
            ))}
            {aliasStatus==="discrepancy" && <div className="aut-pstart" style={{ fontSize:6,
              color:"rgba(251,191,36,.5)", marginTop:6, lineHeight:2, letterSpacing:1 }}>
              SAME FIRST/LAST — NOT AN ALIAS YET. VERIFY: TYPO OR DIFFERENT LEGAL MIDDLE NAME?
            </div>}
          </div>
        )}

        {/* ── PROFILE BAR ── */}
        <div style={{ background:"#090507", border:"1px solid #27272a", borderRadius:16,
          padding:"16px 20px", marginBottom:20 }}>
          {/* Row 1: inputs + selects + random button */}
          <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span className="aut-vt323" style={{ fontSize:16, color:"#52525b" }}>SSN:</span>
              <input maxLength={4} value={localProfile.ssnLast4}
                onChange={e=>setLocalProfile(p=>({...p,ssnLast4:e.target.value}))}
                style={{ background:"#000", width:64, padding:"4px 8px", textAlign:"center",
                  border:"1px solid #3f3f46", color:"#e5e5e5",
                  fontFamily:"'Press Start 2P',monospace", fontSize:9,
                  borderRadius:4, outline:"none" }}/>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span className="aut-vt323" style={{ fontSize:16, color:"#52525b" }}>DOB:</span>
              <input value={localProfile.dob}
                onChange={e=>setLocalProfile(p=>({...p,dob:e.target.value}))}
                style={{ background:"#000", width:130, padding:"4px 8px",
                  border:"1px solid #3f3f46", color:"#e5e5e5",
                  fontFamily:"'Press Start 2P',monospace", fontSize:9,
                  borderRadius:4, outline:"none" }}/>
            </div>
            <select value={localProfile.citizenship}
              onChange={e=>setLocalProfile(p=>({...p,citizenship:e.target.value}))}
              style={{ background:"#000", border:"1px solid #3f3f46", color:"#e5e5e5",
                fontFamily:"'Press Start 2P',monospace", fontSize:8, padding:"6px 10px",
                borderRadius:4, cursor:"pointer", flex:"1 1 200px", minWidth:200, outline:"none" }}>
              {AUTOPSY_PROFILE_OPTS.citizenship.map(o=>(
                <option key={o.v} value={o.v}>{o.l}</option>
              ))}
            </select>
            <select value={localProfile.ageGender}
              onChange={e=>setLocalProfile(p=>({...p,ageGender:e.target.value}))}
              style={{ background:"#000", border:"1px solid #3f3f46", color:"#e5e5e5",
                fontFamily:"'Press Start 2P',monospace", fontSize:8, padding:"6px 10px",
                borderRadius:4, cursor:"pointer", flex:"1 1 200px", minWidth:200, outline:"none" }}>
              {AUTOPSY_PROFILE_OPTS.ageGender.map(o=>(
                <option key={o.v} value={o.v}>{o.l}</option>
              ))}
            </select>
            <button onClick={randomizeProfile}
              style={{ fontFamily:"'Press Start 2P',monospace", fontSize:8, padding:"8px 18px",
                background:"rgba(139,0,0,.25)", border:"1px solid #8B0000", color:"#f87171",
                cursor:"pointer", letterSpacing:1, borderRadius:6,
                display:"flex", alignItems:"center", gap:8,
                flexShrink:0, whiteSpace:"nowrap" }}>
              <i className="fas fa-dice"></i>RANDOM NIGHTMARE
            </button>
          </div>

          {/* Row 2: waivers + programs checkboxes */}
          <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid #1f2937",
            display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            <div>
              <div className="aut-pstart" style={{ fontSize:8, color:"#52525b",
                marginBottom:10, letterSpacing:2 }}>WAIVERS ACTIVE</div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {AUTOPSY_PROFILE_OPTS.waivers.map(w=>{
                  const active = localProfile.waivers.includes(w.v);
                  return (
                    <div key={w.v} onClick={()=>toggleWaiver(w.v)}
                      style={{ display:"flex", alignItems:"flex-start", gap:10,
                        cursor:"pointer", padding:"6px 10px", borderRadius:8,
                        background:active?"rgba(248,113,113,.07)":"transparent",
                        border:active?"1px solid rgba(248,113,113,.25)":"1px solid transparent",
                        transition:"all .12s" }}>
                      <div style={{ width:16, height:16, flexShrink:0, marginTop:2,
                        border:active?"2px solid #f87171":"2px solid #3f3f46",
                        background:active?"#8B0000":"transparent", borderRadius:3,
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {active && <i className="fas fa-check" style={{ fontSize:8, color:"#f87171" }}></i>}
                      </div>
                      <span className="aut-pstart" style={{ fontSize:9, lineHeight:1.6,
                        color:active?"#f87171":"#52525b" }}>{w.l}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="aut-pstart" style={{ fontSize:8, color:"#52525b",
                marginBottom:10, letterSpacing:2 }}>SPECIAL PROGRAMS</div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {AUTOPSY_PROFILE_OPTS.programs.map(pg=>{
                  const active = localProfile.programs.includes(pg.v);
                  return (
                    <div key={pg.v} onClick={()=>toggleProgram(pg.v)}
                      style={{ display:"flex", alignItems:"flex-start", gap:10,
                        cursor:"pointer", padding:"6px 10px", borderRadius:8,
                        background:active?"rgba(255,204,1,.06)":"transparent",
                        border:active?"1px solid rgba(255,204,1,.22)":"1px solid transparent",
                        transition:"all .12s" }}>
                      <div style={{ width:16, height:16, flexShrink:0, marginTop:2,
                        border:active?"2px solid #FFCC01":"2px solid #3f3f46",
                        background:active?"rgba(255,204,1,.18)":"transparent", borderRadius:3,
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {active && <i className="fas fa-check" style={{ fontSize:8, color:"#FFCC01" }}></i>}
                      </div>
                      <span className="aut-pstart" style={{ fontSize:9, lineHeight:1.6,
                        color:active?"#FFCC01":"#52525b" }}>{pg.l}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── SEARCH & FILTER BAR ── */}
        <div style={{ marginBottom:16, display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          {/* Search input */}
          <div style={{ flex:"1 1 220px", display:"flex", alignItems:"center", gap:8,
            background:"#0a0808", border:"1px solid #27272a", borderRadius:8, padding:"7px 14px" }}>
            <i className="fas fa-search" style={{ color:"#3f3f46", fontSize:12, flexShrink:0 }}></i>
            <input value={autSearch} onChange={e=>setAutSearch(e.target.value)}
              placeholder="Search items..."
              style={{ background:"transparent", border:"none", outline:"none",
                color:"#e5e5e5", fontFamily:"'Press Start 2P',monospace", fontSize:8,
                width:"100%", letterSpacing:1 }}/>
            {autSearch && (
              <button onClick={()=>setAutSearch("")}
                style={{ background:"none", border:"none", cursor:"pointer",
                  color:"#52525b", fontSize:14, lineHeight:1, flexShrink:0 }}>✕</button>
            )}
          </div>
          {/* Status filter chips */}
          <div style={{ display:"flex", gap:5, flexShrink:0 }}>
            {[
              ["all",     "ALL",     "#71717a"],
              ["pending", "PENDING", "#fbbf24"],
              ["complete","VIABLE",  "#4ade80"],
              ["flagged", "FLAGGED", "#f87171"],
            ].map(([k,l,c])=>(
              <button key={k} onClick={()=>setAutFilter(k)}
                className="aut-pstart"
                style={{ fontSize:7, padding:"7px 13px",
                  background: autFilter===k ? c+"22" : "transparent",
                  border:`1px solid ${autFilter===k ? c : "#27272a"}`,
                  color: autFilter===k ? c : "#52525b",
                  cursor:"pointer", letterSpacing:1, borderRadius:6, transition:"all .1s" }}>
                {l}
              </button>
            ))}
          </div>
          {/* Active filter label */}
          {(autFilter!=="all" || autSearch) && (
            <button onClick={()=>{ setAutFilter("all"); setAutSearch(""); }}
              className="aut-pstart"
              style={{ fontSize:6, padding:"5px 10px", background:"rgba(248,113,113,.08)",
                border:"1px solid rgba(248,113,113,.25)", color:"#f87171",
                cursor:"pointer", borderRadius:6, whiteSpace:"nowrap" }}>
              ✕ CLEAR
            </button>
          )}
        </div>

        {/* ── ORGAN CARDS ── */}
        {filteredSections.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div className="aut-pstart" style={{ fontSize:9, color:"#3f3f46", letterSpacing:2 }}>
              NO ORGANS MATCH YOUR FILTER
            </div>
            <div className="aut-vt323" style={{ fontSize:16, color:"#27272a", marginTop:8 }}>
              GC is not impressed by your search skills either.
            </div>
          </div>
        )}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
          {filteredSections.map(section=>{
            const org   = ORGAN_MAP[section.id]||{organ:section.title,emoji:"📄",tag:"",desc:""};
            // All items for section header stats (unfiltered counts)
            const allSectionItems = section.items.map(i=>({...i,ds:getStatus(i.id)}));
            // Display items (filtered by search/status)
            const items = section.filteredItems;
            // Stats based on ALL items (not filtered) for accurate header display
            const sDone  = allSectionItems.filter(i=>i.ds==="complete").length;
            const sFlag  = allSectionItems.filter(i=>i.ds==="flagged").length;
            const sTotal = allSectionItems.length;
            const allDone = sDone===sTotal && sTotal>0;
            const hasFlag = sFlag>0;
            const pct    = sTotal>0?Math.round(sDone/sTotal*100):0;
            const isOpen = openSections.has(section.id);
            const border = hasFlag?"1px solid rgba(248,113,113,.45)":allDone?"1px solid rgba(74,222,128,.3)":"1px solid #3f3f46";

            return (
              <div key={section.id} className="aut-card" style={{ border, borderRadius:24 }}>
                <div className="aut-card-inner">
                  {/* Header */}
                  <div className="aut-section-header" style={{ borderRadius:"24px 24px 0 0" }}
                    onClick={()=>toggleSection(section.id)}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ fontSize:26 }}>{org.emoji}</div>
                      <div>
                        <div className="aut-pstart" style={{ fontSize:11, color:"#FFCC01", lineHeight:1.4 }}>
                          {section.title}
                        </div>
                        <div className="aut-vt323" style={{ fontSize:15, color:"#71717a", marginTop:3 }}>
                          {section.reg} • {org.organ}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      {hasFlag && <span className="aut-badge aut-badge-flagged" style={{ fontSize:6 }}>
                        ⚠ {sFlag} FLAG{sFlag>1?"S":""}
                      </span>}
                      {allDone && <span className="aut-badge aut-badge-complete" style={{ fontSize:6 }}>✓ VIABLE</span>}
                      <div className="aut-pstart" style={{ fontSize:7, padding:"5px 12px", borderRadius:6,
                        background:"rgba(0,0,0,.5)", color:"#FFCC01" }}>{sDone}/{sTotal}</div>
                      <i className={`fas fa-chevron-${isOpen?"up":"down"}`}
                        style={{ color:"rgba(255,204,1,.5)", fontSize:12 }}></i>
                    </div>
                  </div>

                  {/* Organ description — always visible */}
                  <div style={{ padding:"10px 20px 8px", borderBottom:"1px solid #1f2937",
                    background:"rgba(0,0,0,.25)" }}>
                    <div className="aut-vt323" style={{ fontSize:16, color:"#52525b", lineHeight:1.4 }}>
                      {org.desc}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height:4, background:"#1f2937" }}>
                    <div style={{ height:"100%",
                      background:hasFlag?"linear-gradient(90deg,#8B0000,#dc2626)":allDone?"#22c55e":"#FFCC01",
                      width:`${pct}%`, transition:"width .6s cubic-bezier(.2,.6,0,1)" }}/>
                  </div>

                  {/* Items */}
                  {isOpen && (
                    <div>
                      {!allDone && (
                        <div style={{ padding:"8px 20px", borderBottom:"1px solid #1f2937",
                          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <div className="aut-vt323" style={{ fontSize:14, color:"#52525b" }}>
                            {sTotal-sDone} item{sTotal-sDone!==1?"s":""} pending examination
                          </div>
                          <button onClick={e=>{e.stopPropagation();onQuickComplete(section.id);}}
                            className="aut-pstart"
                            style={{ fontSize:6, padding:"5px 12px", background:"rgba(74,222,128,.1)",
                              border:"1px solid rgba(74,222,128,.3)", color:"#4ade80",
                              cursor:"pointer", letterSpacing:1 }}>
                            ✓ MARK ALL VIABLE
                          </button>
                        </div>
                      )}
                      {items.map(item=>{
                        const st=item.ds;
                        const subOverride = AUTOPSY_SUBS[item.id];
                        return (
                          <div key={item.id} className="aut-item-row">
                            <div style={{ paddingTop:2, flexShrink:0 }}>
                              <span className={badgeClass(st)}
                                onClick={e=>{e.stopPropagation();handleCycle(item.id);}}>
                                {badgeLabel(st)}
                              </span>
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                                <div style={{ flex:1, minWidth:0 }}>
                                  <div className="aut-pstart" style={{ fontSize:9, lineHeight:1.7,
                                    color:st==="complete"?"rgba(74,222,128,.4)":"#e5e5e5",
                                    textDecoration:st==="complete"?"line-through":"none" }}>
                                    {item.label}
                                  </div>
                                  {(subOverride||item.sub) && (
                                    <div className="aut-vt323" style={{ fontSize:16, color:"#52525b",
                                      marginTop:4, lineHeight:1.4 }}>
                                      {subOverride||item.sub}
                                    </div>
                                  )}
                                </div>
                                <button className="aut-skull-btn"
                                  onClick={e=>{e.stopPropagation();setHelpItem({item,section});}}>
                                  <i className="fas fa-skull"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {/* ── Section Notes ── */}
                      <AutSectionNotes
                        sectionId={section.id}
                        value={sectionNotes[section.id]}
                        onChange={saveAutNote}/>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── FINAL ACTIONS ── */}
        <div style={{ marginTop:32, display:"flex", gap:12 }}>
          <button onClick={handleSubmit}
            className={`aut-submit-btn ${isReady?"ready":"blocked"}`} style={{ flex:1 }}>
            <i className={`fas fa-${isReady?"paper-plane":"hourglass-half"}`} style={{ fontSize:18 }}></i>
            {isReady
              ? "SUBMIT TO STATION COMMANDER • PRAY FOR MERCY"
              : `SUBMIT TO SC • ${pendingCount} PENDING / ${flagCount} FLAGGED (SUBMIT ANYWAY)`}
          </button>
          <button onClick={openGCVoice}
            className="aut-submit-btn blocked" style={{ flex:"none", padding:"20px 28px", borderRadius:24 }}>
            <i className="fas fa-skull" style={{ fontSize:18 }}></i>
            WHAT WOULD GC SAY?
          </button>
        </div>

        <div className="aut-pstart" style={{ textAlign:"center", marginTop:28, fontSize:6,
          color:"#27272a", lineHeight:2.4, letterSpacing:1 }}>
          HUMOROUS PARODY FOR ENTERTAINMENT AND TRAINING PURPOSES ONLY.<br/>
          ALL REGULATORY REFERENCES REMAIN ACCURATE. DO NOT SUBMIT THIS TO MEPS OR YOUR GC.
        </div>
      </div>

      {/* ═══ HELP MODAL ═══ */}
      {helpItem && (()=>{
        const h=helpItem.item.help;
        if(!h) return null;
        return (
          <div className="aut-modal-overlay" onClick={()=>setHelpItem(null)}>
            <div className="aut-modal-box" onClick={e=>e.stopPropagation()}
              style={{ background:"#0A080C", border:"1px solid #8B0000", borderRadius:24, overflow:"hidden" }}>
              <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid #8B0000", background:"#000",
                display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                <div>
                  <div className="aut-pstart" style={{ fontSize:11, color:"#f87171", lineHeight:1.5 }}>{h.title}</div>
                  <div className="aut-vt323" style={{ fontSize:15, color:"rgba(248,113,113,.5)", marginTop:4 }}>{h.reg}</div>
                </div>
                <button onClick={()=>setHelpItem(null)}
                  style={{ background:"none", border:"none", cursor:"pointer", fontSize:28, color:"rgba(248,113,113,.5)", lineHeight:1 }}>×</button>
              </div>
              <div style={{ padding:24 }}>
                <div className="aut-vt323" style={{ fontSize:17, color:"#d4d4d8",
                  lineHeight:1.6, whiteSpace:"pre-line", marginBottom:h.flags?16:0 }}>
                  {h.body}
                </div>
                {h.timing && (
                  <div style={{ background:"rgba(251,191,36,.07)", border:"1px solid rgba(251,191,36,.2)",
                    borderRadius:8, padding:"10px 14px", marginBottom:12 }}>
                    <div className="aut-pstart" style={{ fontSize:7, color:"#fbbf24", marginBottom:4 }}>⏱ TIMING</div>
                    <div className="aut-vt323" style={{ fontSize:16, color:"#fbbf24" }}>{h.timing}</div>
                  </div>
                )}
                {h.flags?.length>0 && (
                  <div>
                    <div className="aut-pstart" style={{ fontSize:7, color:"#f87171", marginBottom:8 }}>
                      CAUSES OF DEATH:
                    </div>
                    {h.flags.map((f,i)=>(
                      <div key={i} style={{ background:"rgba(139,0,0,.25)", border:"1px solid rgba(139,0,0,.6)",
                        borderRadius:6, padding:"8px 12px", marginBottom:6 }}>
                        <div className="aut-vt323" style={{ fontSize:15, color:"#fca5a5" }}>
                          <i className="fas fa-skull" style={{ marginRight:8, fontSize:12 }}></i>{f}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ CONFESSIONAL MODAL ═══ */}
      {confessOpen && (
        <div className="aut-modal-overlay" onClick={()=>{setConfessOpen(false);setConfessResp("");}}>
          <div className="aut-modal-box" onClick={e=>e.stopPropagation()}
            style={{ background:"rgba(9,5,5,.98)", border:"1px solid #78350f",
              borderRadius:24, maxWidth:480, padding:28 }}>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <i className="fas fa-pray" style={{ fontSize:40, color:"#fbbf24" }}></i>
              <div className="aut-pstart" style={{ fontSize:14, color:"#fbbf24", marginTop:12, letterSpacing:2 }}>
                THE CONFESSIONAL
              </div>
              <div className="aut-vt323" style={{ fontSize:16, color:"rgba(251,191,36,.5)", marginTop:6 }}>
                Tell GC what you did. Be honest. They already know.
              </div>
            </div>
            <textarea className="aut-input" rows={4} value={confession}
              onChange={e=>setConfession(e.target.value)}
              placeholder="I may have... completed the UF 601-210.15 three weeks early..."/>
            {confessResp && (
              <div style={{ background:"rgba(251,191,36,.07)", border:"1px solid rgba(251,191,36,.2)",
                padding:"12px 16px", margin:"12px 0", borderRadius:8 }}>
                <div className="aut-vt323" style={{ fontSize:17, color:"#fbbf24", lineHeight:1.5 }}>
                  GC: "{confessResp}"
                </div>
              </div>
            )}
            <div style={{ display:"flex", gap:8, marginTop:12 }}>
              <button onClick={submitConfession} className="aut-confess-btn"
                style={{ background:"#fbbf24", color:"#000", border:"none" }}>
                <i className="fas fa-fire"></i>RECEIVE MY ROAST
              </button>
              <button onClick={()=>{setConfessOpen(false);setConfessResp("");}}
                className="aut-confess-btn"
                style={{ background:"transparent", border:"1px solid #3f3f46", color:"#71717a" }}>
                NEVER MIND I'M FINE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ GC VOICE MODAL ═══ */}
      {gcVoiceOpen && (
        <div className="aut-modal-overlay" onClick={()=>setGcVoiceOpen(false)}>
          <div className="aut-modal-box" onClick={e=>e.stopPropagation()}
            style={{ background:"#0A080C", border:"1px solid #8B0000",
              borderRadius:24, padding:32 }}>
            <div className="aut-pstart" style={{ fontSize:7, color:"#f87171", letterSpacing:4, marginBottom:12 }}>
              WHAT GC ACTUALLY SAID
            </div>
            <div className="aut-vt323" style={{ fontSize:22, color:"#e5e5e5",
              lineHeight:1.6, marginBottom:28 }}>"{gcVoiceLine}"</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setGcVoiceLine(_rand(GC_VOICE_LINES))}
                className="aut-confess-btn"
                style={{ flex:1, background:"rgba(139,0,0,.2)", border:"2px solid #8B0000", color:"#f87171" }}>
                <i className="fas fa-redo"></i>HEAR ANOTHER
              </button>
              <button onClick={()=>setGcVoiceOpen(false)}
                className="aut-confess-btn"
                style={{ flex:1, background:"transparent", border:"1px solid #3f3f46", color:"#71717a" }}>
                I UNDERSTAND
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SUBMIT TO SC MODAL ═══ */}
      {submitOpen && (
        <div className="aut-modal-overlay" onClick={()=>setSubmitOpen(false)}>
          <div className="aut-modal-box" onClick={e=>e.stopPropagation()}
            style={{ background:"#0A080C", borderRadius:24, overflow:"hidden",
              border:`2px solid ${isReady?"#FFCC01":"#8B0000"}` }}>
            <div style={{ padding:"24px 28px 20px",
              background:isReady?"linear-gradient(135deg,rgba(255,204,1,.15),rgba(255,204,1,.05))":"rgba(139,0,0,.2)",
              borderBottom:`1px solid ${isReady?"rgba(255,204,1,.3)":"#8B0000"}`,
              textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:8 }}>{isReady?"✈️":"💀"}</div>
              <div className="aut-pstart" style={{ fontSize:11, color:isReady?"#FFCC01":"#f87171",
                letterSpacing:2, lineHeight:1.6 }}>
                {isReady?"PACKET SUBMITTED TO STATION COMMANDER":"PACKET SUBMITTED ANYWAY (BOLD CHOICE)"}
              </div>
            </div>
            <div style={{ padding:24 }}>
              <div className="aut-vt323" style={{ fontSize:20, color:"#e5e5e5",
                lineHeight:1.6, marginBottom:20 }}>{submitRoast}</div>
              {!isReady && (
                <div style={{ background:"rgba(139,0,0,.15)", border:"1px solid rgba(139,0,0,.4)",
                  borderRadius:10, padding:"12px 16px", marginBottom:20 }}>
                  <div className="aut-pstart" style={{ fontSize:7, color:"#f87171", marginBottom:8 }}>
                    OUTSTANDING ISSUES:
                  </div>
                  {flagCount>0 && <div className="aut-vt323" style={{ fontSize:16, color:"#fca5a5", marginBottom:4 }}>
                    <i className="fas fa-skull" style={{ marginRight:8, fontSize:12 }}></i>
                    {flagCount} FLAGGED ITEM{flagCount>1?"S":""} — GC HAS ALREADY NOTICED
                  </div>}
                  {pendingCount>0 && <div className="aut-vt323" style={{ fontSize:16, color:"#fbbf24" }}>
                    <i className="fas fa-hourglass-half" style={{ marginRight:8, fontSize:12 }}></i>
                    {pendingCount} PENDING ITEM{pendingCount>1?"S":""} — "PENDING" IS NOT A SUBMISSION STATUS
                  </div>}
                </div>
              )}
              <button onClick={()=>setSubmitOpen(false)}
                className={`aut-submit-btn ${isReady?"ready":"blocked"}`} style={{ width:"100%", borderRadius:16 }}>
                <i className={`fas fa-${isReady?"check":"wrench"}`}></i>
                {isReady?"ACKNOWLEDGED — CLEARED FOR MEPS":"CLOSE AND FIX IT"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

Object.assign(window, { AutopsyMode });
