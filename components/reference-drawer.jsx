// reference-drawer.jsx — Reference Guidelines & Tips slide-over
// Exports ReferenceDrawer to window

const REF_SECTIONS = [
  {
    id:"doc-standards", title:"Document Standards", icon:"📋",
    items:[
      {type:"rule", text:"Every document must be legible, complete, and unaltered — no Wite-Out, no missing pages, no cut-off seals. Anything the GC can't read gets returned."},
      {type:"rule", text:"Names on all documents must match the SSC exactly. Any discrepancy must be noted in GENESIS remarks and flagged to GC before initiating SC QC."},
      {type:"rule", text:"Originals preferred. Certified copies (raised seal or certifying stamp) accepted where regulation permits. Photocopies are NOT acceptable for identity documents (SSC, BC, I-551, Naturalization Certificate)."},
      {type:"rule", text:"All foreign-language documents require a certified English translation — not a machine translation. Both the original and the certified translation must be present."},
      {type:"rule", text:"Signatures must be original ink on source documents. Dates must be complete (day, month, year). Do not accept undated signatures."},
      {type:"rule", text:'For multi-page documents, mark "Page X of Y" on each page and note the total page count on the first page before placing in the packet.'},
    ]
  },
  {
    id:"timing", title:"Key Timing Rules", icon:"⏱",
    items:[
      {type:"timing", label:"Live Scan", text:"Valid 120 days from the date of the scan. If expired, the applicant must redo before projecting. No exceptions."},
      {type:"timing", label:"UF 601-210.15", text:"Complete within 3–7 calendar days of the projected MEPS date. Do not complete early — it expires and will be a GC NO-GO."},
      {type:"timing", label:"Temp Res", text:"Valid 7 calendar days (UR 601-210 para 24-3). If the MEPS date shifts beyond 7 days, recreate the Temp Res. Maximum 3 per applicant."},
      {type:"timing", label:"DD 369", text:"All three jurisdictions (city, county, state) must be returned and in hand before projecting to MEPS. One missing return = cannot project."},
      {type:"timing", label:"ASVAB / PICAT", text:"Valid 2 years from test date. Expired = must retest before submitting any program packet. PICAT requires a MEPS confirmation test before scores are final."},
      {type:"timing", label:"DD 368 (MSO)", text:"Must be approved and not expired before any MEPS processing. Verify the approval date and expiration before scheduling."},
      {type:"timing", label:"MIRS 1.1", text:"Print immediately before packet submission. Data changes after a retest or profile update. An outdated MIRS is a common waiver packet return reason."},
      {type:"timing", label:"B0M0 PHA (DD 3024)", text:"Valid within 12 months (plus 90-day grace period, up to 15 months maximum). Gaining TPU Commander MFR required for RED MEDPROS/PHA items."},
      {type:"timing", label:"B0M0 HIV test", text:"MEDPROS IMR must show valid HIV test within exactly 2 years of processing date. No exceptions or ETPs."},
      {type:"timing", label:"DD Form 214-1", text:"Effective May 17, 2025 (IAW USAREC MSG 26-016), separations from National Guard/Reserve require BOTH a DD 214 and a DD 214-1 addendum. NGB 22 is deprecated."},
    ]
  },
  {
    id:"genesis-order", title:"GENESIS Completion Order", icon:"💻",
    items:[
      {type:"step", n:1, text:"Complete all Person Tab fields — legal name, status, physical description, ethnicity, DOB/POB, current address, DL info, marital status."},
      {type:"step", n:2, text:"Complete Screening Tab p.1 — all aliases listed and Alias Tab populated; any prior legal name (maiden, adoption, court order) must appear."},
      {type:"step", n:3, text:"Complete Screening Tab p.2 — immediate family, psychological criteria, technology info, group associations, contact method. No blanks."},
      {type:"step", n:4, text:"Enter all Residences — 10 years back or to the applicant's 16th birthday, whichever is less. DL address must match most recent entry. No unexplained gaps."},
      {type:"step", n:5, text:"Enter all Employment — same 10-year window. Include part-time, seasonal, summer, and self-employment. Explain gaps in remarks."},
      {type:"step", n:6, text:"Complete Education, Military Service Schools, Background/Investigation, Financial History tabs. Document JROTC in Education — may qualify for rank promotion."},
      {type:"step", n:7, text:"Enter Character References — full names, 3–7 year coverage, no duplicates, no family members where avoidable."},
      {type:"step", n:8, text:"Upload all source documents to Source Documents Tab — legible scans, descriptive file names, correct form labels."},
      {type:"step", n:9, text:"Run SF 86 Validation Report — resolve every flag before initiating SC QC. Re-run if any GENESIS data changes after the first run."},
      {type:"step", n:10, text:'SC enters "Station Live Scan Authorized" in Contact History in RZ — NOT in SC Remarks. This is the single most common GC NO-GO.'},
      {type:"step", n:11, text:'Recruiter clicks "Initiate Station Commander Checkpoint" in RZ. SC and ASC receive automatic email. SC does NOT auto-reply — coordinate directly.'},
    ]
  },
  {
    id:"no-go", title:"Common GC NO-GO Reasons", icon:"❌",
    items:[
      {type:"nogo", text:"Live Scan authorization entered in SC Remarks instead of Contact History — wrong field, automatic return."},
      {type:"nogo", text:"DD 369s not all returned before projection — even one missing return stops processing."},
      {type:"nogo", text:"Dates inconsistent across forms — DD 2807-2, UMF 680-3A, and GENESIS must all agree."},
      {type:"nogo", text:"UF 601-210.15 completed too early (expired by MEPS date) or missing from the packet."},
      {type:"nogo", text:"Complex prescreen submitted but no MEPS disposition received before projection — do not schedule until MEPS returns a disposition."},
      {type:"nogo", text:"Waiver packet initiated for a marijuana possession or use offense when none is required — per AR 601-210 para 4-6 (Mar 2026), marijuana possession and use offenses no longer require a formal waiver."},
      {type:"nogo", text:"GENESIS Alias Tab empty when applicant has a prior legal name (maiden name, name change, adoption)."},
      {type:"nogo", text:"LPR applicant — I-551 alien number, expiration date, or category code missing in GENESIS Citizenship Tab."},
      {type:"nogo", text:"Minor Consent Dating Mismatch: Parent or Recruiter signed before the applicant (DD 2807-2 or DD 1966). Applicant signature date must be prior to or on the same date as parental and recruiter signatures."},
      {type:"nogo", text:"Minor Consent Section VI: Parent signature missing from Section II or Section VI of the DD Form 2807-2."},
      {type:"nogo", text:"B0M0 Voided: Submitting a prescreen (DD Form 2807-2) in USMIRS permanently voids 'No Medical Required' B0M0 eligibility (USMEPCOM 40-1 para 2-11c)."},
      {type:"nogo", text:"DA Form 5305 Family Care Plan signed by unauthorized representative — must be Gaining TPU Unit Commander; authority cannot be delegated."},
      {type:"nogo", text:"DA Form 3072-2: Financial disclosure income entered as annual or weekly figure (must be monthly)."},
      {type:"nogo", text:"DD 369 addressed to Courthouse instead of Police/Sheriff/State law enforcement agency."},
      {type:"nogo", text:"Prior Service E-5+: Missing Gaining TPU Unit Acceptance Letter specifying grade, MOS, paragraph/line, and position number (AR)."},
      {type:"nogo", text:"MFR Subject Line Template Error: Memo (e.g. recommendation or self-ID) lists copy-paste subject like 'SUBJECT: Assumption of Command'."},
      {type:"nogo", text:"SF 86 Validation Report flags not reviewed or resolved before SC QC initiation."},
      {type:"nogo", text:"Source documents uploaded but mislabeled, blurry, or cut off — GC cannot verify what they can't read."},
      {type:"nogo", text:"Physical screening disclosures don't match moral screening — applicant disclosed DUI on moral but denied alcohol treatment on DD 2807-2."},
    ]
  },
  {
    id:"form-basics", title:"Form Completion Basics", icon:"✏️",
    items:[
      {type:"rule", text:"Use black or blue ink for all handwritten entries. Print clearly — GC returns illegible forms without mercy."},
      {type:"rule", text:"Dates: use DD MON YYYY format (e.g., 09 MAY 2026) unless the specific form instructs otherwise. Be consistent across all forms."},
      {type:"rule", text:'Never leave a required block blank. Write "N/A" if not applicable — a blank looks like an oversight, N/A looks intentional.'},
      {type:"rule", text:"Correction procedure: draw a single line through the error, write the correction above or next to it, and initial it. Do NOT use Wite-Out on any government form."},
      {type:"rule", text:"SSN: write as a full 9-digit number (XXX-XX-XXXX) on all forms — never abbreviate to last 4 on the form itself."},
      {type:"rule", text:"Name format: Last, First MI — consistent with SSC. Middle name vs. initial must match every document."},
      {type:"rule", text:"Applicant's signature must be obtained in front of the recruiter for enlistment documents. Do not accept pre-signed forms."},
      {type:"rule", text:'Before placing any multi-page document in the packet, number the pages and note the total count on the first page (e.g., "1 of 7").'},
    ]
  },
  {
    id:"waiver-assembly", title:"Waiver Packet Assembly Notes", icon:"⚠️",
    items:[
      {type:"rule", label:"DD 369 validity", text:"Must be dated within 6 months AND must cover all locations where the applicant lived, worked, or attended school during the last 3 years — plus any location where an offense took place."},
      {type:"rule", label:"Aliases on DD 369", text:"Must be run separately under every alias the applicant has used (IAW UM 21-022). Hand-jamming an alias onto an already-run form is not acceptable."},
      {type:"rule", label:"Court dockets", text:"Required for every offense above traffic: information docket (charging document) + court finding and sentencing + final disposition. All three components for each offense."},
      {type:"rule", label:"UF 601-210.08 offense list", text:"All law violations newest to oldest. Asterisk only the offense(s) being waived. AFQT on the form must match the most recent ASVAB score in RZ."},
      {type:"rule", label:"DD Form 370 references", text:"Three required: employment, school, and personal. College and vo-tech school references must include a transcript. No family members as personal references."},
      {type:"rule", label:"FL 601-210.04", text:"Required when the applicant was confined 24+ hours in any institution (jail, detention, juvenile facility, inpatient program). The institution fills out and signs the second page."},
      {type:"rule", label:"DA Form 3072-2 income", text:"All income entries must be MONTHLY — not annual, not weekly. Do not include anticipated military pay as other income."},
      {type:"rule", label:"Family Care Plan (FCP)", text:"Sole parents enlisting require the full FCP bundle (DA 5304, 5840, 5841) and DA 5305. DA 5305 must be signed/approved by Gaining TPU Unit Commander specifically (cannot be delegated)."},
      {type:"rule", label:"PS E-5+ Grade Determination", text:"Regular Army (RA) requires GCR request to USAREC, candidate preferences statement (3 locations), and MOS justification memo. Army Reserve (AR) requires TPU Acceptance Letter with paragraph, line, and position numbers, plus GCR approval if break in service exceeds 48 months."},
      {type:"highlight", text:"Marijuana/use offenses (AR 601-210 para 4-6, Mar 2026): no longer require a formal waiver. Process without a waiver packet. Confirm offense classification (possession/use vs. distribution) with GC before making any assumptions."},
    ]
  },
  {
    id:"smp-notes", title:"SMP-Specific Notes", icon:"🎓",
    items:[
      {type:"rule", label:"ROTC enrollment letter", text:"Must come from the Professor of Military Science (PMS) specifically — not any other ROTC staff. Must state active enrollment, current program year (MS-I through MS-IV), and expected commissioning date."},
      {type:"rule", label:"SMP contract", text:"Both the applicant AND the ROTC battalion representative must sign and date. Contract period must run from current semester through expected commissioning. If the applicant is a scholarship cadet, scholarship terms and service obligation must appear in the contract."},
      {type:"rule", label:"Assignment orders", text:"Collect the most recent orders only. Verify unit designation and UIC match GENESIS. If applicant recently transferred units, get orders from the current unit — prior unit orders are not sufficient."},
      {type:"rule", label:"NCOER/OER", text:"Required only if the applicant holds NCO rank (E-5+) or officer rank in the reserve component. If below E-5 with no officer history, mark N/A."},
      {type:"rule", label:"Academic transcript", text:"Confirms ROTC enrollment and academic standing in good standing. If the transcript shows academic probation or suspension, stop and consult GC before proceeding."},
    ]
  },
];

/* ── RefAccordion ──────────────────────────────────────── */
const RefAccordion = ({ section }) => {
  const [open, setOpen] = React.useState(false);
  const renderItem = (item, i) => {
    if (item.type === "step") return (
      <div key={i} style={{ display:"flex", gap:12, padding:"8px 0",
        borderBottom:"1px solid var(--border)" }}>
        <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:700, fontSize:11,
          color:"var(--fg)", opacity:.5, width:20, flexShrink:0, paddingTop:1 }}>{item.n}</div>
        <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:400, fontSize:12.5,
          color:"var(--fg-alt)", lineHeight:1.6 }}>{item.text}</div>
      </div>
    );
    if (item.type === "timing") return (
      <div key={i} style={{ display:"flex", gap:0, padding:"8px 0",
        borderBottom:"1px solid var(--border)" }}>
        <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:700, fontSize:11,
          color:"var(--fg)", width:130, flexShrink:0, paddingTop:1, lineHeight:1.3 }}>{item.label}</div>
        <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:400, fontSize:12.5,
          color:"var(--fg-alt)", lineHeight:1.6, flex:1 }}>{item.text}</div>
      </div>
    );
    if (item.type === "nogo") return (
      <div key={i} style={{ display:"flex", gap:8, padding:"7px 0",
        borderBottom:"1px solid var(--border)", alignItems:"flex-start" }}>
        <span style={{ color:"var(--danger)", fontWeight:700, fontSize:13, flexShrink:0,
          lineHeight:1.5 }}>✗</span>
        <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:400, fontSize:12.5,
          color:"var(--fg-alt)", lineHeight:1.6 }}>{item.text}</div>
      </div>
    );
    if (item.type === "highlight") return (
      <div key={i} style={{ padding:"10px 12px", margin:"8px 0",
        background:"rgba(255,204,1,.08)", border:"1px solid rgba(255,204,1,.25)" }}>
        <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:500, fontSize:12.5,
          color:"var(--fg-alt)", lineHeight:1.65 }}>{item.text}</div>
      </div>
    );
    // rule (with optional label)
    return (
      <div key={i} style={{ padding:"7px 0", borderBottom:"1px solid var(--border)" }}>
        {item.label && <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:700, fontSize:10,
          textTransform:"uppercase", letterSpacing:".05em", color:"var(--fg)", marginBottom:2 }}>{item.label}</div>}
        <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:400, fontSize:12.5,
          color:"var(--fg-alt)", lineHeight:1.65 }}>{item.text}</div>
      </div>
    );
  };
  return (
    <div style={{ marginBottom:4, border:"1px solid var(--border-mid)",
      borderLeft:"3px solid rgba(255,204,1,.4)" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width:"100%", background:"transparent", border:"none",
        borderBottom:open ? "1px solid var(--border)" : "none",
        padding:"11px 14px", display:"flex", alignItems:"center", gap:10,
        cursor:"pointer", textAlign:"left" }}>
        <span style={{ fontSize:15 }}>{section.icon}</span>
        <span style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:700, fontSize:11.5,
          textTransform:"uppercase", letterSpacing:".04em", color:"var(--fg)", flex:1 }}>
          {section.title}
        </span>
        <span style={{ color:"var(--fg-muted)", fontSize:12,
          transform:open ? "rotate(180deg)" : "none", transition:"transform .2s" }}>▾</span>
      </button>
      {open && (
        <div style={{ padding:"4px 14px 10px" }}>
          {section.items.map(renderItem)}
        </div>
      )}
    </div>
  );
};

/* ── ReferenceDrawer ───────────────────────────────────── */
const ReferenceDrawer = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:350,
        background:"rgba(10,8,12,.6)", animation:"overlayIn .15s ease" }}/>
      {/* Drawer */}
      <div style={{ position:"fixed", top:0, right:0, bottom:0, zIndex:360,
        width:520, background:"var(--bg-card)", borderLeft:"1px solid var(--border-str)",
        display:"flex", flexDirection:"column", animation:"drawerIn .22s cubic-bezier(.2,.6,0,1)" }}>
        {/* Header */}
        <div style={{ padding:"16px 20px", borderBottom:"2px solid var(--gold)",
          display:"flex", alignItems:"center", gap:12, flexShrink:0,
          background:"#0c0a0e" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:700, fontSize:8,
              textTransform:"uppercase", letterSpacing:".16em", color:"rgba(255,204,1,.4)" }}>
              AR 601-210 · USMEPCOM 601-23
            </div>
            <div style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:700, fontSize:15,
              textTransform:"uppercase", color:"#FFCC01", lineHeight:1.1 }}>
              Reference Guidelines &amp; Tips
            </div>
          </div>
          <button onClick={onClose} style={{ background:"transparent",
            border:"1px solid rgba(255,204,1,.3)", color:"rgba(255,204,1,.6)",
            width:30, height:30, display:"flex", alignItems:"center",
            justifyContent:"center", cursor:"pointer", fontSize:14 }}>✕</button>
        </div>
        {/* Content */}
        <div style={{ flex:1, overflow:"auto", padding:"14px 16px" }}>
          {REF_SECTIONS.map(s => <RefAccordion key={s.id} section={s}/>)}
          <div style={{ height:24 }}/>
        </div>
        {/* Footer */}
        <div style={{ padding:"10px 20px", borderTop:"1px solid var(--border)",
          flexShrink:0, display:"flex", gap:12 }}>
          {["AR 601-210 (Mar 2026)","UR 601-210","USMEPCOM 601-23","USMEPCOM 40-1"].map(r => (
            <span key={r} style={{ fontFamily:'"GI",Arial,sans-serif', fontWeight:400, fontSize:9,
              color:"var(--fg-dim)", textTransform:"uppercase", letterSpacing:".04em" }}>{r}</span>
          ))}
        </div>
      </div>
    </>
  );
};

Object.assign(window, { ReferenceDrawer });
