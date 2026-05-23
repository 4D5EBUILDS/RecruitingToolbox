// interactive-tools.jsx — Recruiter Interactive Tools (Gap Finder, MFR Generator, Document Vault)
// Exports components to window

const { useState, useEffect, useMemo, useCallback, useRef } = React;

/* =========================================================================
   1. GAP FINDER (10-Year Address & Employment Audit)
   ========================================================================= */
const GapFinder = ({ profile }) => {
  const [residences, setResidences] = useState([
    { id: 1, desc: "Current Address", fromMonth: 5, fromYear: 2024, toMonth: 5, toYear: 2026, isPresent: true },
    { id: 2, desc: "Prior Home", fromMonth: 8, fromYear: 2020, toMonth: 5, toYear: 2024, isPresent: false },
    { id: 3, desc: "High School Dorms", fromMonth: 9, fromYear: 2016, toMonth: 8, toYear: 2020, isPresent: false }
  ]);
  const [employment, setEmployment] = useState([
    { id: 1, desc: "Lincoln Target - Sales Clerk", fromMonth: 6, fromYear: 2024, toMonth: 5, toYear: 2026, isPresent: true },
    { id: 2, desc: "Summer Lifeguard", fromMonth: 5, fromYear: 2022, toMonth: 8, toYear: 2022, isPresent: false }
  ]);
  const [dlAddress, setDlAddress] = useState("123 Tactical Way, Lincoln NE");
  const [results, setResults] = useState(null);

  const MONTHS = [
    { v: 1, l: "Jan" }, { v: 2, l: "Feb" }, { v: 3, l: "Mar" }, { v: 4, l: "Apr" },
    { v: 5, l: "May" }, { v: 6, l: "Jun" }, { v: 7, l: "Jul" }, { v: 8, l: "Aug" },
    { v: 9, l: "Sep" }, { v: 10, l: "Oct" }, { v: 11, l: "Nov" }, { v: 12, l: "Dec" }
  ];

  const yearsRange = useMemo(() => {
    const curr = new Date().getFullYear();
    const arr = [];
    for (let y = curr; y >= curr - 15; y--) arr.push(y);
    return arr;
  }, []);

  const addResidence = () => {
    const y = new Date().getFullYear();
    setResidences(p => [...p, { id: Date.now(), desc: "", fromMonth: 1, fromYear: y - 5, toMonth: 1, toYear: y - 4, isPresent: false }]);
  };

  const addEmployment = () => {
    const y = new Date().getFullYear();
    setEmployment(p => [...p, { id: Date.now(), desc: "", fromMonth: 1, fromYear: y - 5, toMonth: 1, toYear: y - 4, isPresent: false }]);
  };

  const removeRow = (type, id) => {
    if (type === "res") setResidences(p => p.filter(r => r.id !== id));
    else setEmployment(p => p.filter(e => e.id !== id));
  };

  const updateRow = (type, id, key, val) => {
    const set = type === "res" ? setResidences : setEmployment;
    set(prev => prev.map(item => {
      if (item.id !== id) return item;
      const next = { ...item, [key]: val };
      if (key === "isPresent" && val === true) {
        const now = new Date();
        next.toMonth = now.getMonth() + 1;
        next.toYear = now.getFullYear();
      }
      return next;
    }));
  };

  const runAudit = () => {
    const now = new Date();
    const currMonth = now.getMonth() + 1;
    const currYear = now.getFullYear();
    const targetMonths = 120; // 10 years

    const getTimelineMonths = (items) => {
      const active = Array(targetMonths).fill(false);
      const errors = [];
      const overlaps = [];

      items.forEach(item => {
        const startTotal = item.fromYear * 12 + (item.fromMonth - 1);
        const endYear = item.isPresent ? currYear : item.toYear;
        const endMonth = item.isPresent ? currMonth : item.toMonth;
        const endTotal = endYear * 12 + (endMonth - 1);

        if (startTotal > endTotal) {
          errors.push(`"${item.desc || 'Unnamed Entry'}" has start date after end date.`);
          return;
        }

        // Map to index relative to 120 months ago
        const currTotal = currYear * 12 + (currMonth - 1);
        const startIdx = Math.max(0, targetMonths - 1 - (currTotal - startTotal));
        const endIdx = Math.min(targetMonths - 1, targetMonths - 1 - (currTotal - endTotal));

        for (let i = startIdx; i <= endIdx; i++) {
          if (active[i]) {
            overlaps.push(i);
          }
          active[i] = true;
        }
      });

      return { active, errors, overlaps };
    };

    const resAudit = getTimelineMonths(residences);
    const empAudit = getTimelineMonths(employment);

    // Calculate gaps
    const findGaps = (activeArray) => {
      const gaps = [];
      let inGap = false;
      let gapStart = null;

      for (let i = 0; i < targetMonths; i++) {
        if (!activeArray[i] && !inGap) {
          inGap = true;
          gapStart = i;
        } else if (activeArray[i] && inGap) {
          inGap = false;
          gaps.push({ start: gapStart, end: i - 1 });
        }
      }
      if (inGap) {
        gaps.push({ start: gapStart, end: targetMonths - 1 });
      }
      return gaps;
    };

    const resGaps = findGaps(resAudit.active);
    const empGaps = findGaps(empAudit.active);

    const formatGapMsg = (gap) => {
      const curr = currYear * 12 + (currMonth - 1);
      
      const idxToDate = (idx) => {
        const total = curr - (targetMonths - 1 - idx);
        const y = Math.floor(total / 12);
        const m = (total % 12) + 1;
        return `${MONTHS.find(x => x.v === m).l} ${y}`;
      };

      return `${idxToDate(gap.start)} to ${idxToDate(gap.end)} (${(gap.end - gap.start + 1)} months)`;
    };

    const findings = {
      resGaps: resGaps.map(formatGapMsg),
      empGaps: empGaps.map(formatGapMsg),
      errors: [...resAudit.errors, ...empAudit.errors],
      dlMatches: dlAddress.toLowerCase().includes(residences.find(r => r.isPresent)?.desc?.toLowerCase() || "___")
    };

    setResults(findings);
  };

  return (
    <div style={{ flex: 1, padding: "28px 32px 56px", overflow: "auto", background: "var(--bg)" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: "2px solid var(--gold)" }}>
          <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 700, fontSize: 8, textTransform: "uppercase", letterSpacing: ".16em", color: "rgba(255,204,1,.4)", marginBottom: 4 }}>
            AR 601-210 · SF 86 AUDITOR
          </div>
          <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 700, fontSize: 20, textTransform: "uppercase", color: "var(--gold)", lineHeight: 1.1, marginBottom: 8 }}>
            Address &amp; Employment Gap Finder
          </div>
          <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 400, fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.55 }}>
            Guidance Counselors verify 10 years (or back to the 16th birthday) of history with ZERO gaps or overlaps. Use this validator to identify history gaps before running the SF 86 Validation Report in RZ.
          </div>
        </div>

        {/* DL & Profile Check */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-mid)", padding: 16, marginBottom: 20 }}>
          <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--gold)", marginBottom: 8 }}>
            Driver's License Address Alignment Check
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input 
              type="text" 
              value={dlAddress} 
              onChange={e => setDlAddress(e.target.value)} 
              placeholder="Enter DL Address exactly as written..."
              style={{ flex: 1, background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: "8px 12px", fontFamily: '"GI",Arial,sans-serif', fontSize: 12.5 }}
            />
            <span style={{ fontSize: 11, color: "var(--fg-muted)", fontFamily: '"GI",Arial,sans-serif' }}>
              Must match current residence exactly.
            </span>
          </div>
        </div>

        {/* Grid layout for Residences & Employment */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 28 }}>
          
          {/* RESIDENCES SECTION */}
          <div style={{ border: "1px solid var(--border-mid)", padding: 18, background: "var(--bg-surface)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--gold)" }}>
                📍 Residence History (Last 10 Years)
              </div>
              <button onClick={addResidence} style={{ background: "rgba(255,204,1,.1)", border: "1px solid var(--gold)", color: "var(--gold)", padding: "5px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}>
                + Add Address
              </button>
            </div>
            
            {residences.map((r, idx) => (
              <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 100px 30px", gap: 8, alignItems: "center", padding: "10px 0", borderBottom: idx < residences.length - 1 ? "1px solid var(--border)" : "none" }}>
                <input 
                  type="text" 
                  value={r.desc} 
                  onChange={e => updateRow("res", r.id, "desc", e.target.value)} 
                  placeholder="Street, City, State..."
                  style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: "6px 8px", fontSize: 12, fontFamily: '"GI",Arial,sans-serif' }}
                />
                
                {/* FROM */}
                <div style={{ display: "flex", gap: 4 }}>
                  <select value={r.fromMonth} onChange={e => updateRow("res", r.id, "fromMonth", parseInt(e.target.value))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", fontSize: 11, padding: 4 }}>
                    {MONTHS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                  </select>
                  <select value={r.fromYear} onChange={e => updateRow("res", r.id, "fromYear", parseInt(e.target.value))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", fontSize: 11, padding: 4 }}>
                    {yearsRange.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                {/* TO */}
                <div style={{ display: "flex", gap: 4 }}>
                  <select value={r.toMonth} disabled={r.isPresent} onChange={e => updateRow("res", r.id, "toMonth", parseInt(e.target.value))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", fontSize: 11, padding: 4, opacity: r.isPresent ? 0.4 : 1 }}>
                    {MONTHS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                  </select>
                  <select value={r.toYear} disabled={r.isPresent} onChange={e => updateRow("res", r.id, "toYear", parseInt(e.target.value))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", fontSize: 11, padding: 4, opacity: r.isPresent ? 0.4 : 1 }}>
                    {yearsRange.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                {/* PRESENT */}
                <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 10, fontFamily: '"GI",Arial,sans-serif', textTransform: "uppercase", color: "var(--fg-muted)" }}>
                  <input type="checkbox" checked={r.isPresent} onChange={e => updateRow("res", r.id, "isPresent", e.target.checked)} />
                  Present
                </label>

                {/* REMOVE */}
                <button onClick={() => removeRow("res", r.id)} style={{ background: "transparent", border: "none", color: "var(--danger)", fontSize: 14, cursor: "pointer" }}>✕</button>
              </div>
            ))}
          </div>

          {/* EMPLOYMENT SECTION */}
          <div style={{ border: "1px solid var(--border-mid)", padding: 18, background: "var(--bg-surface)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--gold)" }}>
                💼 Employment &amp; Unemployment History
              </div>
              <button onClick={addEmployment} style={{ background: "rgba(255,204,1,.1)", border: "1px solid var(--gold)", color: "var(--gold)", padding: "5px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}>
                + Add Work/Unemp
              </button>
            </div>
            
            {employment.map((e, idx) => (
              <div key={e.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 100px 30px", gap: 8, alignItems: "center", padding: "10px 0", borderBottom: idx < employment.length - 1 ? "1px solid var(--border)" : "none" }}>
                <input 
                  type="text" 
                  value={e.desc} 
                  onChange={e => updateRow("emp", e.id, "desc", e.target.value)} 
                  placeholder="Employer Name (or 'Unemployed')..."
                  style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: "6px 8px", fontSize: 12, fontFamily: '"GI",Arial,sans-serif' }}
                />
                
                {/* FROM */}
                <div style={{ display: "flex", gap: 4 }}>
                  <select value={e.fromMonth} onChange={e => updateRow("emp", e.id, "fromMonth", parseInt(e.target.value))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", fontSize: 11, padding: 4 }}>
                    {MONTHS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                  </select>
                  <select value={e.fromYear} onChange={e => updateRow("emp", e.id, "fromYear", parseInt(e.target.value))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", fontSize: 11, padding: 4 }}>
                    {yearsRange.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                {/* TO */}
                <div style={{ display: "flex", gap: 4 }}>
                  <select value={e.toMonth} disabled={e.isPresent} onChange={e => updateRow("emp", e.id, "toMonth", parseInt(e.target.value))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", fontSize: 11, padding: 4, opacity: e.isPresent ? 0.4 : 1 }}>
                    {MONTHS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                  </select>
                  <select value={e.toYear} disabled={e.isPresent} onChange={e => updateRow("emp", e.id, "toYear", parseInt(e.target.value))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", fontSize: 11, padding: 4, opacity: e.isPresent ? 0.4 : 1 }}>
                    {yearsRange.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                {/* PRESENT */}
                <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 10, fontFamily: '"GI",Arial,sans-serif', textTransform: "uppercase", color: "var(--fg-muted)" }}>
                  <input type="checkbox" checked={e.isPresent} onChange={e => updateRow("emp", e.id, "isPresent", e.target.checked)} />
                  Present
                </label>

                {/* REMOVE */}
                <button onClick={() => removeRow("emp", e.id)} style={{ background: "transparent", border: "none", color: "var(--danger)", fontSize: 14, cursor: "pointer" }}>✕</button>
              </div>
            ))}
          </div>

        </div>

        {/* AUDIT TRIGGER */}
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <button onClick={runAudit} style={{ background: "var(--gold)", border: "none", color: "var(--black)", padding: "12px 28px", fontFamily: '"GI",Arial,sans-serif', fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", cursor: "pointer" }}>
            🔍 Audit History Gaps
          </button>
        </div>

        {/* AUDIT RESULTS PREVIEW */}
        {results && (
          <div style={{ marginTop: 28, background: "var(--bg-card)", border: "1px solid var(--border-str)", padding: 20 }}>
            <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 700, fontSize: 11, textTransform: "uppercase", color: "var(--gold)", borderBottom: "1px solid var(--border-mid)", paddingBottom: 8, marginBottom: 12 }}>
              🛡️ Audit Findings &amp; Discrepancies
            </div>

            {results.errors.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: "var(--danger)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", fontFamily: '"GI",Arial,sans-serif', marginBottom: 4 }}>❌ Input Errors Detected</div>
                {results.errors.map((err, i) => <div key={i} style={{ fontSize: 12.5, color: "var(--fg-alt)", padding: "2px 0" }}>• {err}</div>)}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", fontFamily: '"GI",Arial,sans-serif', color: results.resGaps.length > 0 ? "var(--danger)" : "#4ade80", marginBottom: 6 }}>
                  📍 Residence Gaps ({results.resGaps.length})
                </div>
                {results.resGaps.length === 0 ? (
                  <div style={{ fontSize: 12.5, color: "#4ade80" }}>✓ Zero address history gaps detected!</div>
                ) : (
                  results.resGaps.map((gap, i) => <div key={i} style={{ fontSize: 12.5, color: "var(--danger)", padding: "2px 0" }}>☠ Gap: {gap}</div>)
                )}
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", fontFamily: '"GI",Arial,sans-serif', color: results.empGaps.length > 0 ? "var(--danger)" : "#4ade80", marginBottom: 6 }}>
                  💼 Employment Gaps ({results.empGaps.length})
                </div>
                {results.empGaps.length === 0 ? (
                  <div style={{ fontSize: 12.5, color: "#4ade80" }}>✓ Zero employment history gaps detected!</div>
                ) : (
                  results.empGaps.map((gap, i) => <div key={i} style={{ fontSize: 12.5, color: "var(--danger)", padding: "2px 0" }}>☠ Gap: {gap}</div>)
                )}
              </div>
            </div>

            {/* DL Match check results */}
            <div style={{ marginTop: 18, borderTop: "1px solid var(--border-mid)", paddingTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: results.dlMatches ? "#4ade80" : "var(--danger)" }}>
                {results.dlMatches ? "✓ Driver's License matches active current address." : "⚠ WARNING: DL address does not seem to match the designated current residence. Check if a remark/explanation memo is needed."}
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

/* =========================================================================
   2. MFR MEMORANDUM GENERATOR (Auto-Populated MFR Templates)
   ========================================================================= */
const MfrGenerator = ({ profile }) => {
  const [template, setTemplate] = useState("tattoo");
  const [inputs, setInputs] = useState({
    recruiter: profile.gc || "SSG Thompson, R.",
    station: "Lincoln Recruiting Station, USAREC",
    applicant: profile.name || "Martinez, Carlos A.",
    ssn: profile.ssnLast4 ? `XXX-XX-${profile.ssnLast4}` : "XXX-XX-7742",
    date: new Date().toLocaleDateString("en-US", { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
    details: "Neck Tattoo: 'BLESSED' in cursive script, approximately 2x3 inches, placed on left lateral neck.",
    commander: "CPT Harris, Marcus L.",
    gainingUnit: "174th Infantry Regiment (TPU)",
    reason: "Waiver recommended based on high moral character, perfect ASVAB score (91 AFQT), and strong dedication to enlistment.",
    tattooLocation: "left lateral neck",
    tattooDimensions: "2x3 inches",
    tattooDescription: "'BLESSED' in cursive script",
    tattooMeaning: "represents personal faith and family blessings",
    afqtScore: "91",
    recruiterPhone: "555-0199"
  });

  const getMfrText = () => {
    if (template === "tattoo") {
      const loc = inputs.tattooLocation ? inputs.tattooLocation.trim() : "left lateral neck";
      const desc = inputs.tattooDescription ? inputs.tattooDescription.trim() : "'BLESSED' in cursive script";
      const dim = inputs.tattooDimensions ? inputs.tattooDimensions.trim() : "2x3 inches";
      const meaning = inputs.tattooMeaning ? inputs.tattooMeaning.trim() : "represents personal faith and family blessings";
      const afqt = inputs.afqtScore || "91";
      const phone = inputs.recruiterPhone || "555-0199";
      const formattedLoc = loc.charAt(0).toUpperCase() + loc.slice(1);
      const detailsStr = `${formattedLoc} Tattoo: ${desc}, approximately ${dim}, placed on ${loc}. Meaning: ${meaning}.`;

      return `DEPARTMENT OF THE ARMY
${inputs.station.toUpperCase()}
123 RECRUITER BLVD, LINCOLN, NE 68508

SUBJECT: Self-Identification and Recommendation for Tattoo Waiver - Applicant ${inputs.applicant.toUpperCase()}

1. References:
   a. AR 670-1 (Wear and Appearance of Army Uniforms and Insignia).
   b. USAREC Regulation 601-210 (Enlistment and Accessions Processing).

2. In accordance with reference 1a, the undersigned has inspected the tattoo(s) of Applicant ${inputs.applicant} (SSN: ${inputs.ssn}). 

3. Tattoo details:
   - Location/Description: ${detailsStr}
   - The tattoo does not contain extremist, indecent, sexist, or racist imagery and is fully compliant with Army values.

4. Recommendation: The Station Commander strongly recommends approval of this waiver. The applicant possesses outstanding potential for military service, holding an AFQT score of ${afqt}, and demonstrates exceptional motivation.

5. Point of contact for this action is the enlisting recruiter, ${inputs.recruiter}, at ${phone}.



                                  ${inputs.commander.toUpperCase()}
                                  CPT, IN
                                  Commanding`;
    }

    if (template === "b0m0") {
      return `DEPARTMENT OF THE ARMY
${inputs.gainingUnit.toUpperCase()}
LINCOLN RESERVE CENTER, LINCOLN, NE 68508

SUBJECT: Command Endorsement for B0M0 "No Medical Required" Enlistment - ${inputs.applicant.toUpperCase()}

1. References:
   a. USAREC Message 26-046 (B0M0 Processing Guidance).
   b. USMEPCOM Regulation 40-1 (Medical Processing).

2. Applicant ${inputs.applicant} (SSN: ${inputs.ssn}) is enlisting into the ${inputs.gainingUnit} via the "No Medical Required" (B0M0) program.

3. The command has audited the applicant's medical readiness files and certifies:
   - Periodic Health Assessment (PHA) is green/amber and active (PHA Date: ${inputs.date}).
   - Individual Medical Readiness (IMR) indicates a fully deployable status with valid HIV testing within 24 months.
   - Medical justification for IMR Red Categories: ${inputs.reason}.

4. The gaining unit accepts full administrative and medical readiness custody of the applicant upon enlistment. 



                                  ${inputs.commander.toUpperCase()}
                                  LTC, IN
                                  Commanding`;
    }

    return `DEPARTMENT OF THE ARMY
${inputs.station.toUpperCase()}
123 RECRUITER BLVD, LINCOLN, NE 68508

SUBJECT: Applicant Moral Statement & Waiver Justification - ${inputs.applicant.toUpperCase()}

1. Under the guidance of enlisting recruiter ${inputs.recruiter}, Applicant ${inputs.applicant} (SSN: ${inputs.ssn}) submits the following personal statement regarding moral offenses being waived:

2. Incident Details:
   - ${inputs.details}

3. Applicant Statement of Hardship and Rehabilitation:
   - "${inputs.reason}"

4. The applicant has completed all court mandates, paid all fines, and has shown complete rehabilitation. Recommending waiver approval.



                                  ${inputs.applicant.toUpperCase()}
                                  Applicant`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getMfrText());
    alert("MFR copied to clipboard! (Verify template values before pasting)");
  };

  const downloadMfr = () => {
    const element = document.createElement("a");
    const file = new Blob([getMfrText()], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `MFR_${template.toUpperCase()}_${inputs.applicant.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  const downloadMfrDocx = async () => {
    let subjectLine = "";
    let bodyParagraphs = [];
    let sigLines = [];
    
    if (template === "tattoo") {
      subjectLine = `Self-Identification and Recommendation for Tattoo Waiver - Applicant ${inputs.applicant.toUpperCase()}`;
      const loc = inputs.tattooLocation ? inputs.tattooLocation.trim() : "left lateral neck";
      const desc = inputs.tattooDescription ? inputs.tattooDescription.trim() : "'BLESSED' in cursive script";
      const dim = inputs.tattooDimensions ? inputs.tattooDimensions.trim() : "2x3 inches";
      const meaning = inputs.tattooMeaning ? inputs.tattooMeaning.trim() : "represents personal faith and family blessings";
      const afqt = inputs.afqtScore || "91";
      const phone = inputs.recruiterPhone || "555-0199";
      const formattedLoc = loc.charAt(0).toUpperCase() + loc.slice(1);
      const detailsStr = `${formattedLoc} Tattoo: ${desc}, approximately ${dim}, placed on ${loc}. Meaning: ${meaning}.`;

      bodyParagraphs = [
        "1. References:",
        "   a. AR 670-1 (Wear and Appearance of Army Uniforms and Insignia).",
        "   b. USAREC Regulation 601-210 (Enlistment and Accessions Processing).",
        "",
        `2. In accordance with reference 1a, the enlisting recruiter has inspected the tattoo(s) of Applicant ${inputs.applicant} (SSN: ${inputs.ssn}).`,
        "",
        "3. Tattoo details:",
        `   - Location/Description: ${detailsStr}`,
        "   - The tattoo does not contain extremist, indecent, sexist, or racist imagery and is fully compliant with Army values.",
        "",
        `4. Recommendation: The Station Commander strongly recommends approval of this waiver. The applicant possesses outstanding potential for military service, holding an AFQT score of ${afqt}, and demonstrates exceptional motivation.`,
        "",
        `5. Point of contact for this action is the enlisting recruiter, ${inputs.recruiter}, at ${phone}.`
      ];
      sigLines = [
        inputs.commander.toUpperCase(),
        "CPT, IN",
        "Commanding"
      ];
    } else if (template === "b0m0") {
      subjectLine = `Command Endorsement for B0M0 "No Medical Required" Enlistment - ${inputs.applicant.toUpperCase()}`;
      bodyParagraphs = [
        "1. References:",
        "   a. USAREC Message 26-046 (B0M0 Processing Guidance).",
        "   b. USMEPCOM Regulation 40-1 (Medical Processing).",
        "",
        `2. Applicant ${inputs.applicant} (SSN: ${inputs.ssn}) is enlisting into the ${inputs.gainingUnit} via the "No Medical Required" (B0M0) program.`,
        "",
        "3. The command has audited the applicant's medical readiness files and certifies:",
        `   - Periodic Health Assessment (PHA) is green/amber and active (PHA Date: ${inputs.details}).`,
        "   - Individual Medical Readiness (IMR) indicates a fully deployable status with valid HIV testing within 24 months.",
        `   - Medical justification for IMR Red Categories: ${inputs.reason}.`,
        "",
        "4. The gaining unit accepts full administrative and medical readiness custody of the applicant upon enlistment."
      ];
      sigLines = [
        inputs.commander.toUpperCase(),
        "LTC, IN",
        "Commanding"
      ];
    } else {
      subjectLine = `Applicant Moral Statement & Waiver Justification - ${inputs.applicant.toUpperCase()}`;
      bodyParagraphs = [
        `1. Under the guidance of enlisting recruiter ${inputs.recruiter}, Applicant ${inputs.applicant} (SSN: ${inputs.ssn}) submits the following personal statement regarding moral offenses being waived:`,
        "",
        "2. Incident Details:",
        `   - ${inputs.details}`,
        "",
        "3. Applicant Statement of Hardship and Rehabilitation:",
        `   - "${inputs.reason}"`,
        "",
        "4. The applicant has completed all court mandates, paid all fines, and has shown complete rehabilitation. Recommending waiver approval."
      ];
      sigLines = [
        inputs.applicant.toUpperCase(),
        "Applicant"
      ];
    }

    try {
      const response = await fetch('/api/generate-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: inputs.date,
          subject: "SUBJECT: " + subjectLine,
          paragraphs: bodyParagraphs,
          signature: sigLines,
          filename: `MFR_${template.toUpperCase()}_${inputs.applicant.replace(/\s+/g, '_')}.docx`
        })
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MFR_${template.toUpperCase()}_${inputs.applicant.replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert(`Error generating DOCX: ${e.message}`);
    }
  };

  return (
    <div style={{ flex: 1, padding: "28px 32px 56px", overflow: "auto", background: "var(--bg)" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: "2px solid var(--gold)" }}>
          <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 700, fontSize: 8, textTransform: "uppercase", letterSpacing: ".16em", color: "rgba(255,204,1,.4)", marginBottom: 4 }}>
            USAREC MEMORANDUM BUILDER
          </div>
          <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 700, fontSize: 20, textTransform: "uppercase", color: "var(--gold)", lineHeight: 1.1, marginBottom: 8 }}>
            Auto-Populated MFR Template Generator
          </div>
          <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 400, fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.55 }}>
            Generate error-free memorandums. Built-in warnings prevent common copy-paste errors (such as leaving "Assumption of Command" in the subject line).
          </div>
        </div>

        {/* Template Select */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {[
            { id: "tattoo", label: "Tattoo Waiver MFR" },
            { id: "b0m0", label: "B0M0 Gaining Unit MFR" },
            { id: "moral", label: "Moral Statement MFR" }
          ].map(t => (
            <button key={t.id} onClick={() => setTemplate(t.id)} style={{
              background: template === t.id ? "var(--gold)" : "rgba(255,204,1,.05)",
              border: `1px solid ${template === t.id ? "var(--gold)" : "var(--border)"}`,
              color: template === t.id ? "var(--black)" : "var(--fg-muted)",
              padding: "8px 16px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", cursor: "pointer"
            }}>{t.label}</button>
          ))}
        </div>

        {/* Twin panel setup */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24 }}>
          
          {/* Inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, background: "var(--bg-surface)", padding: 16, border: "1px solid var(--border-mid)" }}>
            <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 700, fontSize: 11, textTransform: "uppercase", color: "var(--gold)", borderBottom: "1px solid var(--border)", paddingBottom: 6, marginBottom: 4 }}>
              Template Variables
            </div>

            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
              Recruiting Station
              <input type="text" value={inputs.station} onChange={e => setInputs(p => ({ ...p, station: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
              Applicant Name
              <input type="text" value={inputs.applicant} onChange={e => setInputs(p => ({ ...p, applicant: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
              Applicant SSN
              <input type="text" value={inputs.ssn} onChange={e => setInputs(p => ({ ...p, ssn: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
            </label>

            {template === "tattoo" ? (
              <>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                  Tattoo Body Location
                  <input type="text" value={inputs.tattooLocation} onChange={e => setInputs(p => ({ ...p, tattooLocation: e.target.value }))} placeholder="e.g. left lateral neck" style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                    Dimensions
                    <input type="text" value={inputs.tattooDimensions} onChange={e => setInputs(p => ({ ...p, tattooDimensions: e.target.value }))} placeholder="e.g. 2x3 inches" style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                    AFQT Score
                    <input type="text" value={inputs.afqtScore} onChange={e => setInputs(p => ({ ...p, afqtScore: e.target.value }))} placeholder="e.g. 91" style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                  </label>
                </div>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                  Tattoo Content & Description
                  <input type="text" value={inputs.tattooDescription} onChange={e => setInputs(p => ({ ...p, tattooDescription: e.target.value }))} placeholder="e.g. 'BLESSED' in cursive script" style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                  Tattoo Meaning
                  <input type="text" value={inputs.tattooMeaning} onChange={e => setInputs(p => ({ ...p, tattooMeaning: e.target.value }))} placeholder="e.g. represents personal faith" style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                  Recruiter Phone Number
                  <input type="text" value={inputs.recruiterPhone} onChange={e => setInputs(p => ({ ...p, recruiterPhone: e.target.value }))} placeholder="e.g. 555-0199" style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                </label>
              </>
            ) : (
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                {template === "b0m0" ? "PHA Date" : "Offense Details"}
                <textarea value={inputs.details} onChange={e => setInputs(p => ({ ...p, details: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12, minHeight: 46 }} />
              </label>
            )}

            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
              {template === "tattoo" ? "Commander Endorsing" : template === "b0m0" ? "TPU Commander" : "Recruiter Name"}
              <input type="text" value={template === "moral" ? inputs.recruiter : inputs.commander} onChange={e => setInputs(p => (template === "moral" ? { ...p, recruiter: e.target.value } : { ...p, commander: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
            </label>

            {template === "b0m0" && (
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                Gaining TPU Unit
                <input type="text" value={inputs.gainingUnit} onChange={e => setInputs(p => ({ ...p, gainingUnit: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
              </label>
            )}

            {template !== "tattoo" && (
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                {template === "b0m0" ? "Medical Justification Remarks" : "Moral Statement / Rehabilitation Info"}
                <textarea value={inputs.reason} onChange={e => setInputs(p => ({ ...p, reason: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12, minHeight: 60 }} />
              </label>
            )}
          </div>

          {/* Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ flex: 1, background: "#FFFFFF", border: "1px solid #CCCCCC", color: "#333333", padding: "30px", fontFamily: '"Times New Roman", Times, serif', fontSize: 13, lineHeight: 1.25, overflow: "auto", minHeight: 440, maxHeight: 520, boxShadow: "inset 0 0 10px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }}>
              {/* Header block with Logo */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, borderBottom: "2px solid #000000", paddingBottom: 10, alignItems: "center" }}>
                <div style={{ fontWeight: "bold", fontSize: 10.5, color: "#111111", letterSpacing: "0.02em" }}>
                  REPLY TO ATTENTION OF<br/>
                  RCSW-DEN-GI<br/><br/>
                  DEPARTMENT OF THE ARMY<br/>
                  U.S. ARMY GRAND ISLAND DETACHMENT DENVER RECRUITING BATTALION<br/>
                  3341 W STATE ST. SUITE B1 GRAND ISLAND, NEBRASKA 68803
                </div>
                <div>
                  <img src="../../assets/logos/memo-emblem.jpg" alt="Army Seal" style={{ height: 64, width: "auto" }}/>
                </div>
              </div>

              {/* Date */}
              <div style={{ textAlign: "right", marginBottom: 15, fontWeight: "bold", color: "#111111" }}>
                {inputs.date}
              </div>

              {/* MFR Header */}
              <div style={{ fontWeight: "bold", marginBottom: 15, color: "#111111" }}>
                MEMORANDUM FOR RECORD
              </div>

              {/* Subject */}
              <div style={{ fontWeight: "bold", marginBottom: 15, textTransform: "uppercase", color: "#111111" }}>
                SUBJECT: {template === "tattoo" 
                  ? `Self-Identification and Recommendation for Tattoo Waiver - Applicant ${inputs.applicant.toUpperCase()}`
                  : template === "b0m0"
                  ? `Command Endorsement for B0M0 "No Medical Required" Enlistment - ${inputs.applicant.toUpperCase()}`
                  : `Applicant Moral Statement & Waiver Justification - ${inputs.applicant.toUpperCase()}`
                }
              </div>

              {/* Body Paragraphs */}
              <div style={{ flex: 1, color: "#222222" }}>
                {template === "tattoo" && (() => {
                  const loc = inputs.tattooLocation ? inputs.tattooLocation.trim() : "left lateral neck";
                  const desc = inputs.tattooDescription ? inputs.tattooDescription.trim() : "'BLESSED' in cursive script";
                  const dim = inputs.tattooDimensions ? inputs.tattooDimensions.trim() : "2x3 inches";
                  const meaning = inputs.tattooMeaning ? inputs.tattooMeaning.trim() : "represents personal faith and family blessings";
                  const afqt = inputs.afqtScore || "91";
                  const phone = inputs.recruiterPhone || "555-0199";
                  const formattedLoc = loc.charAt(0).toUpperCase() + loc.slice(1);
                  const detailsStr = `${formattedLoc} Tattoo: ${desc}, approximately ${dim}, placed on ${loc}. Meaning: ${meaning}.`;
                  
                  return (
                    <div>
                      <p style={{ marginBottom: 10 }}>1. References:</p>
                      <p style={{ paddingLeft: 20, marginBottom: 5 }}>a. AR 670-1 (Wear and Appearance of Army Uniforms and Insignia).</p>
                      <p style={{ paddingLeft: 20, marginBottom: 15 }}>b. USAREC Regulation 601-210 (Enlistment and Accessions Processing).</p>
                      <p style={{ marginBottom: 15 }}>2. In accordance with reference 1a, the undersigned has inspected the tattoo(s) of Applicant {inputs.applicant} (SSN: {inputs.ssn}).</p>
                      <p style={{ marginBottom: 5 }}>3. Tattoo details:</p>
                      <p style={{ paddingLeft: 20, marginBottom: 5 }}>- Location/Description: {detailsStr}</p>
                      <p style={{ paddingLeft: 20, marginBottom: 15 }}>- The tattoo does not contain extremist, indecent, sexist, or racist imagery and is fully compliant with Army values.</p>
                      <p style={{ marginBottom: 15 }}>4. Recommendation: The Station Commander strongly recommends approval of this waiver. The applicant possesses outstanding potential for military service, holding an AFQT score of {afqt}, and demonstrates exceptional motivation.</p>
                      <p style={{ marginBottom: 15 }}>5. Point of contact for this action is the enlisting recruiter, {inputs.recruiter}, at {phone}.</p>
                    </div>
                  );
                })()}

                {template === "b0m0" && (
                  <div>
                    <p style={{ marginBottom: 10 }}>1. References:</p>
                    <p style={{ paddingLeft: 20, marginBottom: 5 }}>a. USAREC Message 26-046 (B0M0 Processing Guidance).</p>
                    <p style={{ paddingLeft: 20, marginBottom: 15 }}>b. USMEPCOM Regulation 40-1 (Medical Processing).</p>
                    <p style={{ marginBottom: 15 }}>2. Applicant {inputs.applicant} (SSN: {inputs.ssn}) is enlisting into the {inputs.gainingUnit} via the "No Medical Required" (B0M0) program.</p>
                    <p style={{ marginBottom: 5 }}>3. The command has audited the applicant's medical readiness files and certifies:</p>
                    <p style={{ paddingLeft: 20, marginBottom: 5 }}>- Periodic Health Assessment (PHA) is green/amber and active (PHA Date: {inputs.details}).</p>
                    <p style={{ paddingLeft: 20, marginBottom: 5 }}>- Individual Medical Readiness (IMR) indicates a fully deployable status with valid HIV testing within 24 months.</p>
                    <p style={{ paddingLeft: 20, marginBottom: 15 }}>- Medical justification for IMR Red Categories: {inputs.reason}.</p>
                    <p style={{ marginBottom: 15 }}>4. The gaining unit accepts full administrative and medical readiness custody of the applicant upon enlistment.</p>
                  </div>
                )}

                {template === "moral" && (
                  <div>
                    <p style={{ marginBottom: 15 }}>1. Under the guidance of enlisting recruiter {inputs.recruiter}, Applicant {inputs.applicant} (SSN: {inputs.ssn}) submits the following personal statement regarding moral offenses being waived:</p>
                    <p style={{ marginBottom: 5 }}>2. Incident Details:</p>
                    <p style={{ paddingLeft: 20, marginBottom: 15 }}>- {inputs.details}</p>
                    <p style={{ marginBottom: 5 }}>3. Applicant Statement of Hardship and Rehabilitation:</p>
                    <p style={{ paddingLeft: 20, marginBottom: 15 }}>- "{inputs.reason}"</p>
                    <p style={{ marginBottom: 15 }}>4. The applicant has completed all court mandates, paid all fines, and has shown complete rehabilitation. Recommending waiver approval.</p>
                  </div>
                )}
              </div>

              {/* Signature Block */}
              <div style={{ alignSelf: "flex-end", width: "45%", marginTop: 24, fontSize: 12.5, color: "#111111", lineHeight: 1.2 }}>
                {template === "tattoo" && (
                  <div>
                    <span style={{ fontWeight: "bold" }}>{inputs.commander.toUpperCase()}</span><br/>
                    CPT, IN<br/>
                    Commanding
                  </div>
                )}
                {template === "b0m0" && (
                  <div>
                    <span style={{ fontWeight: "bold" }}>{inputs.commander.toUpperCase()}</span><br/>
                    LTC, IN<br/>
                    Commanding
                  </div>
                )}
                {template === "moral" && (
                  <div>
                    <span style={{ fontWeight: "bold" }}>{inputs.applicant.toUpperCase()}</span><br/>
                    Applicant
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={copyToClipboard} style={{ flex: 1, background: "rgba(255,204,1,.1)", border: "1px solid var(--gold)", color: "var(--gold)", padding: "10px 14px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", cursor: "pointer" }}>
                📋 Copy Text
              </button>
              <button onClick={downloadMfr} style={{ flex: 1, background: "rgba(255,204,1,.1)", border: "1px solid var(--gold)", color: "var(--gold)", padding: "10px 14px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", cursor: "pointer" }}>
                💾 Download .TXT
              </button>
              <button onClick={downloadMfrDocx} style={{ flex: 1.5, background: "var(--gold)", border: "none", color: "var(--black)", padding: "10px 14px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", cursor: "pointer" }}>
                📝 Download .DOCX (Template)
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

/* =========================================================================
   3. DOCUMENT VAULT (Filename Check & Validation Vault)
   ========================================================================= */
const DocumentVault = ({ profile }) => {
  const [fileName, setFileName] = useState("");
  const [results, setResults] = useState(null);

  const checkFileName = () => {
    if (!fileName.trim()) {
      setResults(null);
      return;
    }

    const clean = fileName.trim();
    const parts = clean.split(".")[0].split("_");
    
    const errors = [];
    const nameBCParts = profile.nameBC ? profile.nameBC.split(" ") : [];
    
    // Naming structure check: LAST_FIRST_SSN_DOCNAME.ext
    if (parts.length < 4) {
      errors.push("Filename does not match standard pattern (LASTNAME_FIRSTNAME_SSN_DOCNAME). Missing components.");
    } else {
      const lastName = parts[0];
      const firstName = parts[1];
      const ssnPart = parts[2];
      const docName = parts.slice(3).join("_");

      // Case check
      if (clean !== clean.toUpperCase()) {
        errors.push("USAREC rules mandate ALL CAPITAL LETTERS in document filenames.");
      }

      // SSN match check
      if (profile.ssnLast4 && ssnPart !== profile.ssnLast4) {
        errors.push(`SSN in filename (${ssnPart}) does not match profile SSN last 4 (${profile.ssnLast4}).`);
      }

      // Spaces check
      if (clean.includes(" ")) {
        errors.push("Filename contains spaces. Use underscores (_) only.");
      }

      // Extension check
      const ext = clean.split(".").pop().toLowerCase();
      if (ext !== "pdf") {
        errors.push("Document is not a PDF. MEPS RZ only accepts PDF uploads.");
      }
    }

    setResults({
      valid: errors.length === 0,
      errors
    });
  };

  return (
    <div style={{ flex: 1, padding: "28px 32px 56px", overflow: "auto", background: "var(--bg)" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: "2px solid var(--gold)" }}>
          <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 700, fontSize: 8, textTransform: "uppercase", letterSpacing: ".16em", color: "rgba(255,204,1,.4)", marginBottom: 4 }}>
            USAREC RZ DOCUMENT VAULT
          </div>
          <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 700, fontSize: 20, textTransform: "uppercase", color: "var(--gold)", lineHeight: 1.1, marginBottom: 8 }}>
            Filename &amp; Document Naming Audit
          </div>
          <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 400, fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.55 }}>
            Incorrectly named files are kicked back automatically by the RZ system. Type or paste your filename below to audit it against enlisting conventions.
          </div>
        </div>

        {/* Input box */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-str)", padding: 20, marginBottom: 24 }}>
          <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--gold)", marginBottom: 8 }}>
            Filename Auditor Input
          </div>
          
          <div style={{ display: "flex", gap: 12 }}>
            <input 
              type="text" 
              value={fileName} 
              onChange={e => setFileName(e.target.value)} 
              placeholder="e.g. MARTINEZ_CARLOS_7742_DD2807.pdf"
              style={{ flex: 1, background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: "10px 14px", fontFamily: "monospace", fontSize: 14 }}
            />
            <button onClick={checkFileName} style={{ background: "var(--gold)", border: "none", color: "var(--black)", padding: "10px 20px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", cursor: "pointer" }}>
              Validate Name
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div style={{ border: "1px solid var(--border-str)", padding: 20, background: results.valid ? "rgba(74,222,128,.05)" : "rgba(207,0,0,.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>{results.valid ? "✅" : "❌"}</span>
              <span style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 700, fontSize: 12, textTransform: "uppercase", color: results.valid ? "#4ade80" : "var(--danger)" }}>
                {results.valid ? "Filename fully compliant!" : "Filename Discrepancies Found"}
              </span>
            </div>

            {results.errors.length > 0 ? (
              results.errors.map((err, i) => (
                <div key={i} style={{ fontFamily: '"GI",Arial,sans-serif', fontSize: 12.5, color: "var(--fg-alt)", padding: "4px 0" }}>
                  • {err}
                </div>
              ))
            ) : (
              <div style={{ fontFamily: '"GI",Arial,sans-serif', fontSize: 12.5, color: "var(--fg-alt)" }}>
                This file fits the required USAREC format: <code>LASTNAME_FIRSTNAME_SSN_DOCNAME.pdf</code>.
              </div>
            )}
          </div>
        )}

        {/* Convention Reference */}
        <div style={{ marginTop: 28, background: "var(--bg-surface)", border: "1px solid var(--border-mid)", padding: 20 }}>
          <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 700, fontSize: 11, textTransform: "uppercase", color: "var(--gold)", borderBottom: "1px solid var(--border)", paddingBottom: 6, marginBottom: 12 }}>
            Standard Naming Guideline Examples
          </div>
          
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, color: "var(--fg-alt)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: 6, color: "var(--gold)" }}>Document Type</th>
                <th style={{ textAlign: "left", padding: 6, color: "var(--gold)" }}>Correct Filename Pattern</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: 6 }}>Social Security Card</td>
                <td style={{ padding: 6 }}><code>LAST_FIRST_SSN_SSC.pdf</code></td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: 6 }}>Birth Certificate</td>
                <td style={{ padding: 6 }}><code>LAST_FIRST_SSN_BC.pdf</code></td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: 6 }}>DD Form 1966</td>
                <td style={{ padding: 6 }}><code>LAST_FIRST_SSN_DD1966.pdf</code></td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: 6 }}>DD Form 2807-2</td>
                <td style={{ padding: 6 }}><code>LAST_FIRST_SSN_DD2807_2.pdf</code></td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: 6 }}>moral waiver package</td>
                <td style={{ padding: 6 }}><code>LAST_FIRST_SSN_MORAL_WAIVER.pdf</code></td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

/* =========================================================================
   4. REFERENCE AUDITOR (DD Form 370 Verification Tool)
   ========================================================================= */
const ReferenceAuditor = ({ profile }) => {
  const [refType, setRefType] = useState("personal");
  const [inputs, setInputs] = useState({
    name: "Martinez, Julia A.",
    relationship: "Sister",
    yearsKnown: "5",
    schoolName: "Grand Island Community College",
    schoolLevel: "college",
    schoolStartDate: "2023-09-01",
    schoolEndDate: "2025-05-30",
    hasTranscript: "no",
    hasDiscipline: "no",
    employerName: "Target Corp",
    jobTitle: "Sales Associate",
    empStartDate: "2025-06-01",
    empEndDate: "2026-04-30",
    separationReason: "resigned",
    recommendation: "recommended",
    formSigned: true,
    formDated: true,
    noWiteout: true
  });

  const audit = useMemo(() => {
    const errors = [];
    const warnings = [];
    
    // 1. General form completion checks
    if (!inputs.formSigned) {
      errors.push("Signature Missing: Referee signature block is empty. Forms must be physically or digitally signed.");
    }
    if (!inputs.formDated) {
      errors.push("Date Missing: Form lacks signature date. Back-dating or missing dates trigger an automatic GC kickback.");
    }
    if (!inputs.noWiteout) {
      errors.push("unauthorized Edits: Document contains Wite-Out or uninitialed correction marks. Draw a single line and initial instead.");
    }

    // 2. Type-specific checks
    if (refType === "personal") {
      const appLastName = profile.name ? profile.name.split(",")[0].trim().toUpperCase() : "MARTINEZ";
      const refNameClean = inputs.name.trim().toUpperCase();
      
      // Relative Name Check
      if (refNameClean.includes(appLastName)) {
        errors.push(`Relative Conflict: Reference last name matches applicant's last name "${appLastName}". Family members are strictly prohibited as personal references.`);
      }
      
      // Relationship keyword check
      const relClean = inputs.relationship.trim().toLowerCase();
      const relativeKeywords = ["sister", "brother", "mother", "father", "parent", "sibling", "uncle", "aunt", "cousin", "wife", "husband", "spouse", "relative"];
      if (relativeKeywords.some(kw => relClean.includes(kw))) {
        errors.push(`Relative Conflict: Relationship is declared as "${inputs.relationship}". Personal references cannot be relatives.`);
      }

      // Years known check
      const years = parseInt(inputs.yearsKnown, 10);
      if (isNaN(years) || years < 3) {
        warnings.push(`Short Coverage: Reference has only known applicant for ${inputs.yearsKnown} years. Standard moral/suitability references require a minimum of 3 years.`);
      }
    } else if (refType === "school") {
      if (inputs.schoolLevel === "college" && inputs.hasTranscript === "no") {
        errors.push("Missing Transcript: College/Vo-Tech references require an official transcript to be attached to the packet.");
      }
      if (inputs.hasDiscipline === "yes") {
        warnings.push("Discipline Disclosure: Referee noted school disciplinary history. This requires a Station Commander clarification memo.");
      }
      if (inputs.schoolStartDate && inputs.schoolEndDate && inputs.schoolStartDate >= inputs.schoolEndDate) {
        errors.push("Timeline Error: School start date cannot be after or equal to the end date.");
      }
    } else if (refType === "employment") {
      if (inputs.separationReason === "terminated") {
        warnings.push("Adverse Separation: Applicant was terminated. Recruiter must address this in the moral statement / SC interview MFR.");
      }
      if (inputs.recommendation === "not-recommended") {
        errors.push("Negative Endorsement: Referee selected 'Not Recommended' for military service. GCs will automatically reject this reference.");
      }
      if (inputs.empStartDate && inputs.empEndDate && inputs.empStartDate >= inputs.empEndDate) {
        errors.push("Timeline Error: Employment start date cannot be after or equal to the end date.");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }, [refType, inputs, profile]);

  return (
    <div style={{ flex: 1, padding: "28px 32px 56px", overflow: "auto", background: "var(--bg)" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: "2px solid var(--gold)" }}>
          <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 700, fontSize: 8, textTransform: "uppercase", letterSpacing: ".16em", color: "rgba(255,204,1,.4)", marginBottom: 4 }}>
            USAREC FORM 370 AUDITOR
          </div>
          <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 700, fontSize: 20, textTransform: "uppercase", color: "var(--gold)", lineHeight: 1.1, marginBottom: 8 }}>
            DD Form 370 Reference Auditor
          </div>
          <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 400, fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.55 }}>
            Verify returned Request for Reference (DD Form 370) packets. Ensure correct timeline matching, resolve family conflict rules, and prevent transcript omissions.
          </div>
        </div>

        {/* Reference Type Selector */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {[
            { id: "personal", label: "👥 Personal Reference" },
            { id: "school", label: "🎓 School Reference" },
            { id: "employment", label: "💼 Employment Reference" }
          ].map(t => (
            <button key={t.id} onClick={() => setRefType(t.id)} style={{
              background: refType === t.id ? "var(--gold)" : "rgba(255,204,1,.05)",
              border: `1px solid ${refType === t.id ? "var(--gold)" : "var(--border)"}`,
              color: refType === t.id ? "var(--black)" : "var(--fg-muted)",
              padding: "8px 16px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", cursor: "pointer"
            }}>{t.label}</button>
          ))}
        </div>

        {/* Twin panel setup */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24 }}>
          
          {/* Inputs Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, background: "var(--bg-surface)", padding: 16, border: "1px solid var(--border-mid)" }}>
            <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 700, fontSize: 11, textTransform: "uppercase", color: "var(--gold)", borderBottom: "1px solid var(--border)", paddingBottom: 6, marginBottom: 4 }}>
              Reference Parameters
            </div>

            {/* General Form Checkboxes */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 8, background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border)", marginBottom: 8 }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "var(--fg-muted)" }}>Form Completion Checklist</div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, cursor: "pointer", color: "var(--fg-alt)" }}>
                <input type="checkbox" checked={inputs.formSigned} onChange={e => setInputs(p => ({ ...p, formSigned: e.target.checked }))} />
                Referee Signature Present
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, cursor: "pointer", color: "var(--fg-alt)" }}>
                <input type="checkbox" checked={inputs.formDated} onChange={e => setInputs(p => ({ ...p, formDated: e.target.checked }))} />
                Date of Signature Complete
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, cursor: "pointer", color: "var(--fg-alt)" }}>
                <input type="checkbox" checked={inputs.noWiteout} onChange={e => setInputs(p => ({ ...p, noWiteout: e.target.checked }))} />
                No Wite-Out / Liquid Paper Used
              </label>
            </div>

            {/* Personal Reference Specific */}
            {refType === "personal" && (
              <>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                  Reference Full Name
                  <input type="text" value={inputs.name} onChange={e => setInputs(p => ({ ...p, name: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 10 }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                    Relationship to Applicant
                    <input type="text" value={inputs.relationship} onChange={e => setInputs(p => ({ ...p, relationship: e.target.value }))} placeholder="e.g. Sister, Landlord, Friend" style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                    Years Known
                    <input type="number" min="0" value={inputs.yearsKnown} onChange={e => setInputs(p => ({ ...p, yearsKnown: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                  </label>
                </div>
              </>
            )}

            {/* School Reference Specific */}
            {refType === "school" && (
              <>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                  School Name
                  <input type="text" value={inputs.schoolName} onChange={e => setInputs(p => ({ ...p, schoolName: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                    Educational Level
                    <select value={inputs.schoolLevel} onChange={e => setInputs(p => ({ ...p, schoolLevel: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 5, fontSize: 12 }}>
                      <option value="high-school">High School</option>
                      <option value="college">College / University</option>
                      <option value="vo-tech">Vocational / Trade School</option>
                    </select>
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                    Official Transcript Attached?
                    <select value={inputs.hasTranscript} onChange={e => setInputs(p => ({ ...p, hasTranscript: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 5, fontSize: 12 }}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </label>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                    Attendance Start Date
                    <input type="date" value={inputs.schoolStartDate} onChange={e => setInputs(p => ({ ...p, schoolStartDate: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 5, fontSize: 12 }} />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                    Attendance End Date
                    <input type="date" value={inputs.schoolEndDate} onChange={e => setInputs(p => ({ ...p, schoolEndDate: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 5, fontSize: 12 }} />
                  </label>
                </div>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                  History of Disciplinary Actions?
                  <select value={inputs.hasDiscipline} onChange={e => setInputs(p => ({ ...p, hasDiscipline: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 5, fontSize: 12 }}>
                    <option value="no">No disciplinary record noted</option>
                    <option value="yes">Yes, suspensions/expulsions noted</option>
                  </select>
                </label>
              </>
            )}

            {/* Employment Reference Specific */}
            {refType === "employment" && (
              <>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                  Employer / Business Name
                  <input type="text" value={inputs.employerName} onChange={e => setInputs(p => ({ ...p, employerName: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                    Job Title / Position
                    <input type="text" value={inputs.jobTitle} onChange={e => setInputs(p => ({ ...p, jobTitle: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                    Separation Reason
                    <select value={inputs.separationReason} onChange={e => setInputs(p => ({ ...p, separationReason: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 5, fontSize: 12 }}>
                      <option value="resigned">Resigned / Voluntarily Left</option>
                      <option value="laid-off">Laid Off (Lack of Work)</option>
                      <option value="terminated">Terminated / Fired (Adverse)</option>
                    </select>
                  </label>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                    Employment Start Date
                    <input type="date" value={inputs.empStartDate} onChange={e => setInputs(p => ({ ...p, empStartDate: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 5, fontSize: 12 }} />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                    Employment End Date
                    <input type="date" value={inputs.empEndDate} onChange={e => setInputs(p => ({ ...p, empEndDate: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 5, fontSize: 12 }} />
                  </label>
                </div>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                  Military Service Recommendation
                  <select value={inputs.recommendation} onChange={e => setInputs(p => ({ ...p, recommendation: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 5, fontSize: 12 }}>
                    <option value="highly-recommended">Highly Recommended</option>
                    <option value="recommended">Recommended</option>
                    <option value="neutral">Neutral / No Comment</option>
                    <option value="not-recommended">Not Recommended (Adverse)</option>
                  </select>
                </label>
              </>
            )}
          </div>

          {/* Results Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ 
              flex: 1, 
              border: `1px solid ${audit.errors.length > 0 ? "var(--danger)" : audit.warnings.length > 0 ? "rgba(255,204,1,.4)" : "rgba(74,222,128,.4)"}`, 
              background: "var(--bg-surface)", 
              padding: 20,
              minHeight: 320
            }}>
              
              {/* Header Status Card */}
              <div style={{ 
                padding: "12px 16px", 
                background: audit.errors.length > 0 ? "rgba(207,0,0,.08)" : audit.warnings.length > 0 ? "rgba(255,204,1,.05)" : "rgba(74,222,128,.05)", 
                border: `1px solid ${audit.errors.length > 0 ? "var(--danger)" : audit.warnings.length > 0 ? "rgba(255,204,1,.2)" : "rgba(74,222,128,.2)"}`, 
                marginBottom: 16,
                borderRadius: 2
              }}>
                <div style={{ fontSize: 9, textTransform: "uppercase", fontWeight: 700, color: "var(--fg-muted)", letterSpacing: ".05em", marginBottom: 2 }}>
                  Audit Verdict
                </div>
                <div style={{ 
                  fontFamily: '"GI",Arial,sans-serif', 
                  fontWeight: 700, 
                  fontSize: 16, 
                  color: audit.errors.length > 0 ? "var(--danger)" : audit.warnings.length > 0 ? "var(--gold)" : "#4ade80",
                  textTransform: "uppercase"
                }}>
                  {audit.errors.length > 0 ? "❌ RETURN TO RECRUITER" : audit.warnings.length > 0 ? "⚠️ ACTION REQUIRED" : "✅ COMPLIANT REFERENCE"}
                </div>
              </div>

              {/* Mismatch & Rule Violations */}
              {audit.errors.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "var(--danger)", borderBottom: "1px solid rgba(207,0,0,.2)", paddingBottom: 4, marginBottom: 8 }}>
                    Critical Discrepancies ({audit.errors.length})
                  </div>
                  {audit.errors.map((err, i) => (
                    <div key={i} style={{ fontSize: 12.5, color: "var(--fg-alt)", padding: "4px 0", lineHeight: 1.5, display: "flex", gap: 6 }}>
                      <span style={{ color: "var(--danger)" }}>•</span>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Warnings & Reminders */}
              {audit.warnings.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "var(--gold)", borderBottom: "1px solid rgba(255,204,1,.2)", paddingBottom: 4, marginBottom: 8 }}>
                    Waiver Warnings ({audit.warnings.length})
                  </div>
                  {audit.warnings.map((warn, i) => (
                    <div key={i} style={{ fontSize: 12.5, color: "var(--fg-alt)", padding: "4px 0", lineHeight: 1.5, display: "flex", gap: 6 }}>
                      <span style={{ color: "var(--gold)" }}>•</span>
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Compliant state */}
              {audit.errors.length === 0 && audit.warnings.length === 0 && (
                <div style={{ fontSize: 12.5, color: "var(--fg-muted)", textAlign: "center", padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 28 }}>🌟</span>
                  <div style={{ fontWeight: 700, color: "#4ade80", textTransform: "uppercase", fontSize: 12 }}>Reference Audit Clear</div>
                  This DD Form 370 meets standard USAREC and Guidance Counselor compliance criteria. Date fields are structured and parent-child/relative flags are clear.
                </div>
              )}
            </div>

            {/* Quick Reference Card */}
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-mid)", padding: 12, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.45 }}>
              <div style={{ fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", fontSize: 9, letterSpacing: ".05em", marginBottom: 4 }}>
                DD Form 370 Regulations Quick Guide
              </div>
              • <strong>Dates</strong> must align <em>exactly</em> with Recruiter Zone history. A mismatch of even one day triggers a GC rejection.<br/>
              • <strong>No Family Members</strong> can serve as character references. This applies to DD 370s and RZ reference logs.<br/>
              • <strong>College References</strong> require an official transcript. High school references do not.<br/>
              • <strong>Confinement History</strong>: If applicant discloses jail time, an institution DD 370 (or FL 601-210.04) is required.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

// Expose to window for index files
Object.assign(window, { GapFinder, MfrGenerator, DocumentVault, ReferenceAuditor });

