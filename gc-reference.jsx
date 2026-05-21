// gc-reference.jsx — GC Reference tab content
// Exports GCReference to window

const GC_STEPS = [
  { n:1,  text:'Confirm SC QC initiation in RZ — verify "Initiate Station Commander Checkpoint" was clicked by the recruiter in RZ. A remark in the SC Remarks field does NOT count as initiation and will be an automatic return.' },
  { n:2,  text:'"Station Live Scan Authorized" must be entered in Contact History in RZ — NOT in SC Remarks. This is the single most common NO-GO. The entry must appear in Contact History specifically, not anywhere else in the applicant record.' },
  { n:3,  text:"Check GENESIS completeness — Person Tab (legal name, status, physical description, ethnicity, DOB/POB, address, DL info, marital status), Screening Tabs 1 & 2 (all aliases, immediate family, psychological criteria, technology info, group associations, contact method). No blanks anywhere. Alias Tab must be populated for every prior legal name — maiden name, adoption name, or court-ordered name change." },
  { n:4,  text:"Validate residences — 10 years back or to the applicant's 16th birthday, whichever is less. No unexplained gaps. DL address must match the most recent residence entry exactly. Any gap between entries must have an explanation in remarks — 'between residences' is not acceptable." },
  { n:5,  text:"Validate employment — same 10-year window. Part-time, seasonal, summer, and self-employment must all be included. Gaps between jobs must be explained in remarks. Do not leave any period of non-employment unaccounted for." },
  { n:6,  text:"Confirm SF 86 Validation Report was run and all flags resolved before SC QC initiation. GC checks the report run date — if run before a retest or profile change, it must be re-run. Every flag must have been addressed, not just noted." },
  { n:7,  text:"Cross-check all dates across DD 2807-2, UMF 680-3A, and GENESIS — any date mismatch between these three sources is an automatic return. DOB, POB, dates of incidents, and treatment dates must match exactly across all three documents." },
  { n:8,  text:"Verify DD 369 returns — all three jurisdictions (city, county, state) must be in hand before projection. Each must be dated within 6 months. Each must be run separately under every alias the applicant has used — IAW UM 21-022, hand-jamming an alias onto an already-returned form is not acceptable." },
  { n:9,  text:"Confirm Live Scan validity — valid 120 days from the date of the scan. If the scan will be expired by the MEPS appointment date, the applicant must redo before projecting. No exceptions." },
  { n:10, text:"Verify UF 601-210.15 was completed within the 3–7 calendar day window before the projected MEPS date. Completed too early = expired by MEPS date. Completed same-day or too late = procedural defect. Either is a return." },
  { n:11, text:"Check MIRS 1.1 is current — must be printed the same day as packet submission. Data changes after a retest or profile update. A MIRS printed before a score change or profile update is stale and will be returned, especially in waiver packets." },
  { n:12, text:"Moral waiver packet review (always check — confirm a waiver was not incorrectly initiated for a non-waiver offense):\n• UF 601-210.08: offenses listed newest to oldest; only waived offense(s) asterisked; AFQT on form matches current RZ score\n• DD Form 370: three references present (employment, school, personal); no family members as personal references; college/vo-tech references include transcript\n• Court dockets: all three components per offense — charging document + court finding/sentencing + final disposition\n• DD 369: covers every jurisdiction where an offense occurred, within 6 months, run under all aliases\n• FL 601-210.04: present if applicant was confined 24+ hours in any institution (jail, detention, juvenile facility, inpatient program)\n• DA Form 3072-2: all income entries are monthly — not annual, not weekly. Do not include anticipated military pay\n• Marijuana/paraphernalia possession or use: confirm NO waiver packet was initiated — AR 601-210 para 4-6 (Mar 2026) removed the waiver requirement. If a packet was opened, it must be withdrawn. Verify offense classification (possession/use vs. distribution) with GC before assuming." },
];

const GC_RETURNS = [
  { type:"category", text:"GENESIS Errors" },
  { type:"nogo",     text:'Live Scan authorization entered in SC Remarks instead of Contact History in RZ — wrong field, automatic return regardless of whether the scan itself is valid.' },
  { type:"nogo",     text:'Alias Tab empty when applicant has a prior legal name (maiden name, adoption name, court-ordered name change) — every prior legal name must appear in the Alias Tab.' },
  { type:"nogo",     text:'Residence or employment gaps left unexplained — any period not covered by an entry must have an explanation in remarks.' },
  { type:"nogo",     text:'DL address does not match the most recent residence entry in GENESIS — these must be identical.' },
  { type:"nogo",     text:'SF 86 Validation Report flags not resolved before SC QC initiation — GC checks the report; unresolved flags stop processing.' },
  { type:"nogo",     text:'LPR applicant: I-551 alien number, expiration date, or category code missing in GENESIS Citizenship Tab — all three fields required.' },

  { type:"category", text:"Document Defects" },
  { type:"nogo",     text:'Source documents blurry, cut off, or mislabeled in GENESIS uploads — GC cannot verify what they cannot read. Every upload must be legible and correctly labeled.' },
  { type:"nogo",     text:'Foreign-language document present without a certified English translation — machine translations are not accepted. Both original and certified translation must be in the packet.' },
  { type:"nogo",     text:'Photocopy submitted for an identity document (SSC, BC, I-551, Naturalization Certificate) — originals or certified copies (raised seal or certifying stamp) only.' },
  { type:"nogo",     text:'Multi-page document not numbered (Page X of Y) or total page count missing from the first page.' },

  { type:"category", text:"Timing Failures" },
  { type:"nogo",     text:'UF 601-210.15 completed too early — expired by the MEPS appointment date. Must be completed within the 3–7 calendar day window before the projected MEPS date.' },
  { type:"nogo",     text:'Live Scan expired — valid 120 days from scan date. If expired by MEPS date, applicant must redo before projecting.' },
  { type:"nogo",     text:'Temp Res beyond 7-day validity (UR 601-210 para 24-3) — if MEPS date shifts past 7 days from the Temp Res date, recreate it. Maximum 3 per applicant.' },
  { type:"nogo",     text:'MIRS 1.1 stale — must be printed the same day as packet submission. An outdated MIRS is a common waiver packet return reason.' },
  { type:"nogo",     text:'DD 368 (MSO release) expired or approval not received before MEPS scheduling — must be approved and unexpired before any MEPS processing.' },

  { type:"category", text:"Waiver Errors" },
  { type:"nogo",     text:'Unnecessary waiver initiated for marijuana possession or use offense — AR 601-210 para 4-6 (Mar 2026) removed the waiver requirement. Confirm offense classification (possession/use vs. distribution) with GC before assuming.' },
  { type:"nogo",     text:'AFQT on UF 601-210.08 does not match current ASVAB score in RZ — must match most recent score. If applicant retested after the form was completed, the form must be redone.' },
  { type:"nogo",     text:'Court docket incomplete — all three components required per offense: charging document + court finding/sentencing + final disposition. One missing component = return.' },
  { type:"nogo",     text:'DD 369 not run under all aliases — hand-jamming an alias onto an already-run form is not acceptable (IAW UM 21-022). Each alias requires a separate run.' },
  { type:"nogo",     text:'DD 369 does not cover the jurisdiction where an offense occurred — must cover all locations where the applicant lived, worked, attended school, or committed an offense during the last 3 years.' },
  { type:"nogo",     text:'FL 601-210.04 missing when applicant was confined 24+ hours in any institution (jail, detention, juvenile facility, inpatient program) — institution must fill out and sign page 2.' },
  { type:"nogo",     text:'DA Form 3072-2 income entries are annual or weekly instead of monthly — all income must be entered as a monthly figure.' },

  { type:"category", text:"SC Checkpoint Errors" },
  { type:"nogo",     text:'SC QC not formally initiated in RZ — recruiter remarked in SC Remarks instead of clicking "Initiate Station Commander Checkpoint." SC and ASC must receive the automatic RZ email for the checkpoint to count.' },
  { type:"nogo",     text:'Complex prescreen submitted but no MEPS disposition received before projection — do not schedule for MEPS until MEPS returns a disposition on the prescreen.' },

  { type:"category", text:"Citizenship / LPR Issues" },
  { type:"nogo",     text:'LPR applicant projected without confirmed I-551 alien number, expiration date, and category code in GENESIS Citizenship Tab — all three required. Any missing field stops MEPS processing.' },
  { type:"nogo",     text:'Naturalized citizen: Naturalization Certificate not present as a certified original or raised-seal copy — photocopies not acceptable.' },
  { type:"nogo",     text:'Foreign-born citizen: Consular Report of Birth Abroad (FS-240) or Certification of Report of Birth (DS-1350) missing — required for all applicants born outside the U.S. to U.S. citizen parents.' },
];

/* ── GCRefAccordion ───────────────────────────────────── */
const GCRefAccordion = ({ title, icon, items, defaultOpen = true }) => {
  const [open, setOpen] = React.useState(defaultOpen);

  const renderItem = (item, i) => {
    if (item.type === "category") return (
      <div key={i} style={{
        fontFamily:'"GI",Arial,sans-serif', fontWeight:700, fontSize:10,
        textTransform:"uppercase", letterSpacing:".1em", color:"var(--gold)",
        padding:"14px 0 5px", borderBottom:"1px solid var(--border-mid)"
      }}>{item.text}</div>
    );
    if (item.type === "nogo") return (
      <div key={i} style={{ display:"flex", gap:8, padding:"7px 0",
        borderBottom:"1px solid var(--border)", alignItems:"flex-start" }}>
        <span style={{ color:"var(--danger)", fontWeight:700, fontSize:13,
          flexShrink:0, lineHeight:1.5 }}>✗</span>
        <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:400, fontSize:12.5,
          color:"var(--fg-alt)", lineHeight:1.65 }}>{item.text}</div>
      </div>
    );
    // step (numbered)
    return (
      <div key={i} style={{ display:"flex", gap:12, padding:"8px 0",
        borderBottom:"1px solid var(--border)" }}>
        <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:700, fontSize:11,
          color:"var(--gold)", opacity:.6, width:20, flexShrink:0, paddingTop:2 }}>{item.n}</div>
        <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:400, fontSize:12.5,
          color:"var(--fg-alt)", lineHeight:1.65, whiteSpace:"pre-line" }}>{item.text}</div>
      </div>
    );
  };

  return (
    <div style={{ marginBottom:10, border:"1px solid var(--border-mid)",
      borderLeft:"3px solid rgba(255,204,1,.4)" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width:"100%", background:"transparent", border:"none",
        borderBottom:open ? "1px solid var(--border)" : "none",
        padding:"12px 16px", display:"flex", alignItems:"center", gap:10,
        cursor:"pointer", textAlign:"left" }}>
        <span style={{ fontSize:16 }}>{icon}</span>
        <span style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:700, fontSize:12,
          textTransform:"uppercase", letterSpacing:".05em", color:"var(--fg)", flex:1 }}>
          {title}
        </span>
        <span style={{ color:"var(--fg-muted)", fontSize:12,
          transform:open ? "rotate(180deg)" : "none", transition:"transform .2s" }}>▾</span>
      </button>
      {open && (
        <div style={{ padding:"4px 16px 12px" }}>
          {items.map(renderItem)}
        </div>
      )}
    </div>
  );
};

/* ── GCReference ──────────────────────────────────────── */
const GCReference = () => (
  <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"auto",
    background:"var(--bg)" }}>
    <div style={{ maxWidth:860, margin:"0 auto", width:"100%", padding:"28px 32px 56px" }}>

      {/* Header */}
      <div style={{ marginBottom:24, paddingBottom:16, borderBottom:"2px solid var(--gold)" }}>
        <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:700, fontSize:8,
          textTransform:"uppercase", letterSpacing:".16em",
          color:"rgba(255,204,1,.4)", marginBottom:4 }}>
          AR 601-210 · USMEPCOM 601-23 · UM 21-022
        </div>
        <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:700, fontSize:20,
          textTransform:"uppercase", color:"var(--gold)", lineHeight:1.1, marginBottom:8 }}>
          GC Reference
        </div>
        <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:400, fontSize:13,
          color:"var(--fg-muted)", lineHeight:1.55, maxWidth:640 }}>
          What the Guidance Counselor checks before approving a packet for MEPS.
          Use this to self-audit from the GC perspective before submitting.
        </div>
      </div>

      <GCRefAccordion
        title="GC Verification Steps"
        icon="✓"
        items={GC_STEPS}
        defaultOpen={true}
      />
      <GCRefAccordion
        title="Common Return Reasons"
        icon="✗"
        items={GC_RETURNS}
        defaultOpen={true}
      />

      <div style={{ height:24 }}/>
    </div>
  </div>
);

Object.assign(window, { GCReference });
