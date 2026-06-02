// interactive-tools.jsx — Recruiter Interactive Tools (Gap Finder, MFR Generator, Document Vault)
// Exports components to window

const { useState, useEffect, useMemo, useCallback, useRef } = React;

/* localStorage-backed state — survives tab switches (component unmounts) AND
   full page reloads, so a recruiter never loses work mid-packet. */
const usePersistedState = (key, initial) => {
  const [state, setState] = useState(() => {
    try { const s = localStorage.getItem(key); return s !== null ? JSON.parse(s) : initial; }
    catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) {}
  }, [key, state]);
  return [state, setState];
};
// Expose so the main app can clear all tool data on Reset.
window.PQC_TOOL_KEYS = ["pqc-gap-residences","pqc-gap-employment","pqc-gap-dl",
  "pqc-mfr-template","pqc-mfr-inputs","pqc-vault-filename","pqc-ref-type","pqc-ref-inputs"];

/* =========================================================================
   1. GAP FINDER (10-Year Address & Employment Audit)
   ========================================================================= */
const GapFinder = ({ profile }) => {
  const [residences, setResidences] = usePersistedState("pqc-gap-residences", [
    { id: 1, desc: "Current Address", fromMonth: 5, fromDay: 1, fromYear: 2024, toMonth: 5, toDay: 1, toYear: 2026, isPresent: true },
    { id: 2, desc: "Prior Home", fromMonth: 8, fromDay: 1, fromYear: 2020, toMonth: 5, toDay: 1, toYear: 2024, isPresent: false },
    { id: 3, desc: "High School Dorms", fromMonth: 9, fromDay: 1, fromYear: 2016, toMonth: 8, toDay: 1, toYear: 2020, isPresent: false }
  ]);
  const [employment, setEmployment] = usePersistedState("pqc-gap-employment", [
    { id: 1, desc: "Lincoln Target - Sales Clerk", fromMonth: 6, fromDay: 1, fromYear: 2024, toMonth: 5, toDay: 1, toYear: 2026, isPresent: true },
    { id: 2, desc: "Summer Lifeguard", fromMonth: 5, fromDay: 1, fromYear: 2022, toMonth: 8, toDay: 1, toYear: 2022, isPresent: false }
  ]);
  const [dlAddress, setDlAddress] = usePersistedState("pqc-gap-dl", "123 Tactical Way, Lincoln NE");
  const [results, setResults] = useState(null);

  const MONTHS = [
    { v: 1, l: "Jan" }, { v: 2, l: "Feb" }, { v: 3, l: "Mar" }, { v: 4, l: "Apr" },
    { v: 5, l: "May" }, { v: 6, l: "Jun" }, { v: 7, l: "Jul" }, { v: 8, l: "Aug" },
    { v: 9, l: "Sep" }, { v: 10, l: "Oct" }, { v: 11, l: "Nov" }, { v: 12, l: "Dec" }
  ];
  const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

  const yearsRange = useMemo(() => {
    const curr = new Date().getFullYear();
    const arr = [];
    for (let y = curr; y >= curr - 15; y--) arr.push(y);
    return arr;
  }, []);

  const addResidence = () => {
    const y = new Date().getFullYear();
    setResidences(p => [...p, { id: Date.now(), desc: "", fromMonth: 1, fromDay: 1, fromYear: y - 5, toMonth: 1, toDay: 1, toYear: y - 4, isPresent: false }]);
  };

  const addEmployment = () => {
    const y = new Date().getFullYear();
    setEmployment(p => [...p, { id: Date.now(), desc: "", fromMonth: 1, fromDay: 1, fromYear: y - 5, toMonth: 1, toDay: 1, toYear: y - 4, isPresent: false }]);
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
        next.toDay = now.getDate();
        next.toYear = now.getFullYear();
      }
      return next;
    }));
  };

  const runAudit = () => {
    const MS = 86400000; // ms per day
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayIdx = Math.floor(today.getTime() / MS);
    // 10-year window (or the GC may verify back to the 16th birthday — 10y is the floor)
    const windowStart = new Date(today); windowStart.setFullYear(windowStart.getFullYear() - 10);
    const windowStartIdx = Math.floor(windowStart.getTime() / MS);

    const dayIdx = (y, m, d) => Math.floor(new Date(y, m - 1, d).getTime() / MS);
    const fmtIdx = (idx) => {
      const dt = new Date(idx * MS);
      return `${MONTHS.find(x => x.v === dt.getMonth() + 1).l} ${dt.getDate()}, ${dt.getFullYear()}`;
    };
    const fmtRange = (s, e) => {
      const days = e - s + 1;
      return `${fmtIdx(s)} to ${fmtIdx(e)} (${days} day${days !== 1 ? "s" : ""})`;
    };

    const analyze = (items) => {
      const errors = [], overlaps = [];
      const intervals = [];
      items.forEach(item => {
        const s = dayIdx(item.fromYear, item.fromMonth, item.fromDay || 1);
        const e = item.isPresent ? todayIdx : dayIdx(item.toYear, item.toMonth, item.toDay || 1);
        if (s > e) {
          errors.push(`"${item.desc || 'Unnamed Entry'}" has start date after end date.`);
          return;
        }
        intervals.push({ s, e, desc: item.desc || "Unnamed Entry" });
      });

      // Overlaps — sort by start, compare consecutive
      intervals.sort((a, b) => a.s - b.s || a.e - b.e);
      for (let i = 1; i < intervals.length; i++) {
        if (intervals[i].s <= intervals[i - 1].e) {
          overlaps.push(`"${intervals[i - 1].desc}" overlaps "${intervals[i].desc}" (${fmtIdx(intervals[i].s)} – ${fmtIdx(Math.min(intervals[i - 1].e, intervals[i].e))})`);
        }
      }

      // Gaps — clamp to the 10-year window, sweep for uncovered stretches
      const clamped = intervals
        .map(iv => ({ s: Math.max(iv.s, windowStartIdx), e: Math.min(iv.e, todayIdx) }))
        .filter(iv => iv.s <= iv.e)
        .sort((a, b) => a.s - b.s);
      const gaps = [];
      let cursor = windowStartIdx;
      clamped.forEach(iv => {
        if (iv.s > cursor) gaps.push(fmtRange(cursor, iv.s - 1));
        cursor = Math.max(cursor, iv.e + 1);
      });
      if (cursor <= todayIdx) gaps.push(fmtRange(cursor, todayIdx));

      return { errors, overlaps, gaps };
    };

    const resAudit = analyze(residences);
    const empAudit = analyze(employment);

    const findings = {
      resGaps: resAudit.gaps,
      empGaps: empAudit.gaps,
      errors: [
        ...resAudit.errors, ...empAudit.errors,
        ...resAudit.overlaps.map(o => `Residence overlap — ${o}`),
        ...empAudit.overlaps.map(o => `Employment overlap — ${o}`),
      ],
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
              <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 1.3fr 1.3fr 78px 24px", gap: 8, alignItems: "center", padding: "10px 0", borderBottom: idx < residences.length - 1 ? "1px solid var(--border)" : "none" }}>
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
                  <select value={r.fromDay} onChange={e => updateRow("res", r.id, "fromDay", parseInt(e.target.value))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", fontSize: 11, padding: 4 }}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
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
                  <select value={r.toDay} disabled={r.isPresent} onChange={e => updateRow("res", r.id, "toDay", parseInt(e.target.value))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", fontSize: 11, padding: 4, opacity: r.isPresent ? 0.4 : 1 }}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
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
            
            {employment.map((emp, idx) => (
              <div key={emp.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 1.3fr 1.3fr 78px 24px", gap: 8, alignItems: "center", padding: "10px 0", borderBottom: idx < employment.length - 1 ? "1px solid var(--border)" : "none" }}>
                <input
                  type="text"
                  value={emp.desc}
                  onChange={e => updateRow("emp", emp.id, "desc", e.target.value)}
                  placeholder="Employer Name (or 'Unemployed')..."
                  style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: "6px 8px", fontSize: 12, fontFamily: '"GI",Arial,sans-serif' }}
                />

                {/* FROM */}
                <div style={{ display: "flex", gap: 4 }}>
                  <select value={emp.fromMonth} onChange={e => updateRow("emp", emp.id, "fromMonth", parseInt(e.target.value))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", fontSize: 11, padding: 4 }}>
                    {MONTHS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                  </select>
                  <select value={emp.fromDay} onChange={e => updateRow("emp", emp.id, "fromDay", parseInt(e.target.value))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", fontSize: 11, padding: 4 }}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={emp.fromYear} onChange={e => updateRow("emp", emp.id, "fromYear", parseInt(e.target.value))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", fontSize: 11, padding: 4 }}>
                    {yearsRange.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                {/* TO */}
                <div style={{ display: "flex", gap: 4 }}>
                  <select value={emp.toMonth} disabled={emp.isPresent} onChange={e => updateRow("emp", emp.id, "toMonth", parseInt(e.target.value))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", fontSize: 11, padding: 4, opacity: emp.isPresent ? 0.4 : 1 }}>
                    {MONTHS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                  </select>
                  <select value={emp.toDay} disabled={emp.isPresent} onChange={e => updateRow("emp", emp.id, "toDay", parseInt(e.target.value))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", fontSize: 11, padding: 4, opacity: emp.isPresent ? 0.4 : 1 }}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={emp.toYear} disabled={emp.isPresent} onChange={e => updateRow("emp", emp.id, "toYear", parseInt(e.target.value))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", fontSize: 11, padding: 4, opacity: emp.isPresent ? 0.4 : 1 }}>
                    {yearsRange.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                {/* PRESENT */}
                <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 10, fontFamily: '"GI",Arial,sans-serif', textTransform: "uppercase", color: "var(--fg-muted)" }}>
                  <input type="checkbox" checked={emp.isPresent} onChange={e => updateRow("emp", emp.id, "isPresent", e.target.checked)} />
                  Present
                </label>

                {/* REMOVE */}
                <button onClick={() => removeRow("emp", emp.id)} style={{ background: "transparent", border: "none", color: "var(--danger)", fontSize: 14, cursor: "pointer" }}>✕</button>
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
                <div style={{ color: "var(--danger)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", fontFamily: '"GI",Arial,sans-serif', marginBottom: 4 }}>❌ Errors &amp; Overlaps Detected</div>
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

const MfrGenerator = ({ profile }) => {
  const [template, setTemplate] = usePersistedState("pqc-mfr-template", "tattoo");
  const [inputs, setInputs] = usePersistedState("pqc-mfr-inputs", {
    recruiter: profile.gc || "SSG Thompson, R.",
    station: "Lincoln Recruiting Station, USAREC",
    applicant: profile.name || "Martinez, Carlos A.",
    ssn: profile.ssnLast4 ? `XXX-XX-${profile.ssnLast4}` : "XXX-XX-7742",
    date: `${new Date().getDate()} ${new Date().toLocaleDateString("en-US", { month: "long" })} ${new Date().getFullYear()}`,
    details: "Neck Tattoo: 'BLESSED' in cursive script, approximately 2x3 inches, placed on left lateral neck.",
    commander: "CPT Harris, Marcus L.",
    gainingUnit: "174th Infantry Regiment (TPU)",
    reason: "Waiver recommended based on high moral character, perfect ASVAB score (91 AFQT), and strong dedication to enlistment.",
    tattooLocation: "left lateral neck",
    tattooDimensions: "2x3 inches",
    tattooDescription: "'BLESSED' in cursive script",
    tattooMeaning: "represents personal faith and family blessings",
    afqtScore: "91",
    recruiterPhone: "555-0199",
    mos: "11B",
    rank: "SGT / E-5",
    paraLinePos: "Para 101, Line 03, Position 04221980",
    skillsCert: true,
    fcpAck: true,
    dutyPref1: "Fort Carson, CO",
    dutyPref2: "Fort Riley, KS",
    dutyPref3: "Fort Cavazos, TX",
    spouseServing: false,
    spouseComponent: "US Army",
    spouseLocation: "Fort Carson, CO",
    spouseSSN: "XXX-XX-1234",
    efmpStatus: "No"
  });

  // ── Editable letterhead (AR 25-50 ¶2-3a / 1-16) ─────────────────────────────
  const LH_DEFAULTS = {
    unitName: "U.S. ARMY GRAND ISLAND DETACHMENT, DENVER RECRUITING BATTALION",
    unitAddress: "3341 W STATE ST, SUITE B1, GRAND ISLAND, NEBRASKA 68803",
    officeSymbol: "RCSW-DEN-GI",
  };
  const lh = k => (inputs[k] != null && inputs[k] !== "" ? inputs[k] : LH_DEFAULTS[k]);

  // ── Single source of truth: memo content model per template ─────────────────
  // Returns { subject, paras:[{t, sub}], sig:[{t, b}] }. Rendered identically into
  // the live preview, the .TXT, and the Word .doc so they can never drift apart.
  const buildMemo = () => {
    const A = inputs.applicant || "Martinez, Carlos A.";
    const ssn = inputs.ssn || "XXX-XX-7742";
    const recruiter = inputs.recruiter || "SSG Thompson, R.";
    const phone = inputs.recruiterPhone || "555-0199";
    const cdr = (inputs.commander || "CPT Harris, Marcus L.").toUpperCase();

    if (template === "tattoo") {
      const loc = (inputs.tattooLocation || "left lateral neck").trim();
      const desc = (inputs.tattooDescription || "'BLESSED' in cursive script").trim();
      const dim = (inputs.tattooDimensions || "2x3 inches").trim();
      const meaning = (inputs.tattooMeaning || "represents personal faith and family blessings").trim();
      const afqt = inputs.afqtScore || "91";
      const fLoc = loc.charAt(0).toUpperCase() + loc.slice(1);
      return {
        subject: `Self-Identification and Recommendation for Tattoo Waiver - Applicant ${A.toUpperCase()}`,
        paras: [
          { t: "1. References:" },
          { t: "a. AR 670-1 (Wear and Appearance of Army Uniforms and Insignia).", sub: true },
          { t: "b. USAREC Regulation 601-210 (Enlistment and Accessions Processing).", sub: true },
          { t: `2. In accordance with reference 1a, the undersigned has inspected the tattoo(s) of Applicant ${A} (SSN: ${ssn}).` },
          { t: "3. Tattoo details:" },
          { t: `a. Location/Description: ${fLoc} Tattoo: ${desc}, approximately ${dim}, placed on ${loc}. Meaning: ${meaning}.`, sub: true },
          { t: "b. The tattoo does not contain extremist, indecent, sexist, or racist imagery and is fully compliant with Army values.", sub: true },
          { t: `4. Recommendation: The Station Commander strongly recommends approval of this waiver. The applicant possesses outstanding potential for military service, holding an AFQT score of ${afqt}, and demonstrates exceptional motivation.` },
          { t: `5. Point of contact for this action is the enlisting recruiter, ${recruiter}, at ${phone}.` },
        ],
        sig: [{ t: cdr, b: true }, { t: "CPT, IN" }, { t: "Commanding" }],
      };
    }

    if (template === "b0m0") {
      const unit = inputs.gainingUnit || "174th Infantry Regiment (TPU)";
      return {
        subject: `Command Endorsement for B0M0 "No Medical Required" Enlistment - ${A.toUpperCase()}`,
        paras: [
          { t: "1. References:" },
          { t: "a. USAREC Message 26-046 (B0M0 Processing Guidance).", sub: true },
          { t: "b. USMEPCOM Regulation 40-1 (Medical Processing).", sub: true },
          { t: `2. Applicant ${A} (SSN: ${ssn}) is enlisting into the ${unit} via the "No Medical Required" (B0M0) program.` },
          { t: "3. The command has audited the applicant's medical readiness files and certifies:" },
          { t: `a. Periodic Health Assessment (PHA) is green/amber and active (PHA Date: ${inputs.details || "N/A"}).`, sub: true },
          { t: "b. Individual Medical Readiness (IMR) indicates a fully deployable status with valid HIV testing within 24 months.", sub: true },
          { t: `c. Medical justification for IMR Red Categories: ${inputs.reason || "N/A"}.`, sub: true },
          { t: "4. The gaining unit accepts full administrative and medical readiness custody of the applicant upon enlistment." },
        ],
        sig: [{ t: cdr, b: true }, { t: "LTC, IN" }, { t: "Commanding" }],
      };
    }

    if (template === "tpu_acceptance") {
      const unit = inputs.gainingUnit || "174th Infantry Regiment (TPU)";
      const rank = inputs.rank || "SGT / E-5";
      const mos = inputs.mos || "11B";
      const plp = inputs.paraLinePos || "Para 101, Line 03, Position 04221980";
      return {
        subject: `Gaining Unit Acceptance and Family Care Plan Endorsement - ${A.toUpperCase()}`,
        paras: [
          { t: "1. References:" },
          { t: "a. AR 140-111 (U.S. Army Reserve Reenlistment Program).", sub: true },
          { t: "b. AR 600-20 (Army Command Policy), Chapter 5 (Family Care Plans).", sub: true },
          { t: "c. AR 601-210 (Active and Reserve Component Enlistment Program).", sub: true },
          { t: `2. Gaining Unit Acceptance: The gaining unit (${unit}) accepts the enlistment/assignment of applicant ${A} in the grade of ${rank} and MOS ${mos}. The applicant will be assigned to ${plp} of this unit.` },
          { t: "3. Skills Certification: Gaining command certifies that the applicant possesses the necessary technical and administrative skills required for the assigned position, and maintenance of prior grade is approved." },
          { t: "4. Family Care Plan Certification: In accordance with reference 1b, the command has reviewed the sole-parent Family Care Plan (FCP) bundle (DA Forms 5304, 5840, and 5841) for the applicant. The command certifies that the FCP is feasible and accepts the applicant for enlistment." },
          { t: `5. Gaining unit point of contact for this action is the enlisting recruiter, ${recruiter}, at ${phone}.` },
        ],
        sig: [{ t: cdr, b: true }, { t: "LTC, IN" }, { t: "Commanding" }],
      };
    }

    if (template === "ra_grade") {
      const rank = inputs.rank || "SGT / E-5";
      const mos = inputs.mos || "11B";
      const pref1 = inputs.dutyPref1 || "Fort Carson, CO";
      const pref2 = inputs.dutyPref2 || "Fort Riley, KS";
      const pref3 = inputs.dutyPref3 || "Fort Cavazos, TX";
      const spouseStr = inputs.spouseServing
        ? `My spouse is a serving member of the Armed Forces. Component: ${inputs.spouseComponent || "N/A"}, Location: ${inputs.spouseLocation || "N/A"}, SSN: ${inputs.spouseSSN || "N/A"}. Joint domicile is requested.`
        : "My spouse is not a serving member of the Armed Forces. Joint domicile is not requested.";
      return {
        subject: `Prior Service Grade Determination Statement - Applicant ${A.toUpperCase()}`,
        paras: [
          { t: "1. References:" },
          { t: "a. AR 601-210 (Active and Reserve Component Enlistment Program), Chapter 3.", sub: true },
          { t: "b. USAREC Regular Army Grade Determination Worksheet.", sub: true },
          { t: `2. In connection with my application for Regular Army prior service enlistment in the rank of ${rank} and MOS ${mos}, I, ${A} (SSN: ${ssn}), submit the following statement as required for grade determination:` },
          { t: "3. Duty Preferences: I request assignment to one of the following three duty locations in my enlisting MOS:" },
          { t: `a. Preference 1: ${pref1}`, sub: true },
          { t: `b. Preference 2: ${pref2}`, sub: true },
          { t: `c. Preference 3: ${pref3}`, sub: true },
          { t: `4. Joint Domicile / Serving Spouse Information: ${spouseStr}` },
          { t: `5. Exceptional Family Member Program (EFMP): I am ${inputs.efmpStatus === "Yes" ? "currently" : "not"} enrolled in the Exceptional Family Member Program.` },
          { t: `6. Point of contact is the enlisting recruiter, ${recruiter}, at ${phone}.` },
        ],
        sig: [{ t: A.toUpperCase(), b: true }, { t: "Applicant" }],
      };
    }

    // moral
    return {
      subject: `Applicant Moral Statement & Waiver Justification - ${A.toUpperCase()}`,
      paras: [
        { t: `1. Under the guidance of enlisting recruiter ${recruiter}, Applicant ${A} (SSN: ${ssn}) submits the following personal statement regarding moral offenses being waived:` },
        { t: "2. Incident Details:" },
        { t: `a. ${inputs.details || "N/A"}`, sub: true },
        { t: "3. Applicant Statement of Hardship and Rehabilitation:" },
        { t: `a. "${inputs.reason || "N/A"}"`, sub: true },
        { t: "4. The applicant has completed all court mandates, paid all fines, and has shown complete rehabilitation. Recommending waiver approval." },
      ],
      sig: [{ t: A.toUpperCase(), b: true }, { t: "Applicant" }],
    };
  };

  // Plain-text rendering (Copy / .TXT) — AR 25-50 heading + body + signature.
  const getMfrText = () => {
    const m = buildMemo();
    const pad = "                                  "; // signature ~ center
    const body = m.paras.map(p => (p.sub ? "   " + p.t : p.t)).join("\n\n");
    const sig = m.sig.map(s => pad + s.t).join("\n");
    return `DEPARTMENT OF THE ARMY\n${lh("unitName")}\n${lh("unitAddress")}\n\n` +
      `${lh("officeSymbol")}${" ".repeat(40)}${inputs.date}\n\n` +
      `MEMORANDUM FOR RECORD\n\nSUBJECT: ${m.subject}\n\n${body}\n\n\n${sig}`;
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

  // Build the Word .doc entirely in the browser (static site, no backend) from the
  // shared buildMemo() model, formatted per AR 25-50 (Arial 12, 1" margins, DA
  // letterhead with embedded seal, flush-right date, centered signature block).
  const downloadMfrDocx = async () => {
    try {
      const m = buildMemo();
      const esc = v => String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      // Embed the DA seal as base64 so the letterhead survives offline.
      let sealImg = "";
      try {
        const resp = await fetch("../../assets/logos/memo-emblem.jpg");
        const blob = await resp.blob();
        const dataUrl = await new Promise((res, rej) => {
          const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob);
        });
        sealImg = `<img src="${dataUrl}" width="78" height="78" style="display:block;"/>`;
      } catch (e) { /* seal optional */ }

      const bodyHtml = m.paras.map(p =>
        `<p style="margin:0 0 12pt 0;${p.sub ? "margin-left:0.25in;" : ""}">${esc(p.t)}</p>`
      ).join("");
      const sigHtml = m.sig.map(s => `<p style="margin:0;${s.b ? "font-weight:normal;" : ""}">${esc(s.t)}</p>`).join("");
      const safeName = (inputs.applicant || "applicant").replace(/\s+/g, "_");

      const html =
        '<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
        '<head><meta charset="utf-8"><title>MFR</title>' +
        "<style>@page WordSection1 { size:8.5in 11.0in; margin:1.0in 1.0in 1.0in 1.0in; } " +
        "div.WordSection1 { page:WordSection1; } body,p,td { font-family:Arial,sans-serif; font-size:12.0pt; }</style></head>" +
        '<body><div class="WordSection1">' +
        '<table style="width:100%;border-collapse:collapse;"><tr>' +
          `<td style="width:90pt;vertical-align:top;">${sealImg}</td>` +
          '<td style="text-align:center;vertical-align:top;">' +
            '<p style="margin:0;font-size:10pt;font-weight:bold;">DEPARTMENT OF THE ARMY</p>' +
            `<p style="margin:0;font-size:8.5pt;font-weight:bold;">${esc(lh("unitName"))}</p>` +
            `<p style="margin:0;font-size:8.5pt;font-weight:bold;">${esc(lh("unitAddress"))}</p>` +
          '</td><td style="width:90pt;"></td>' +
        '</tr></table>' +
        '<p style="margin:18pt 0 0 0;">&nbsp;</p>' +
        '<table style="width:100%;border-collapse:collapse;"><tr>' +
          `<td style="text-align:left;">${esc(lh("officeSymbol"))}</td>` +
          `<td style="text-align:right;">${esc(inputs.date)}</td>` +
        '</tr></table>' +
        '<p style="margin:24pt 0 0 0;">MEMORANDUM FOR RECORD</p>' +
        `<p style="margin:12pt 0 18pt 0;">SUBJECT: ${esc(m.subject)}</p>` +
        bodyHtml +
        `<div style="margin-top:36pt;margin-left:3.25in;">${sigHtml}</div>` +
        '</div></body></html>';

      const blob = new Blob(["﻿", html], { type: "application/msword" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `MFR_${template.toUpperCase()}_${safeName}.doc`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(`Error generating Word document: ${e.message}`);
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
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { id: "tattoo", label: "Tattoo Waiver MFR" },
            { id: "b0m0", label: "B0M0 Gaining Unit MFR" },
            { id: "moral", label: "Moral Statement MFR" },
            { id: "tpu_acceptance", label: "TPU Acceptance Letter" },
            { id: "ra_grade", label: "RA Grade Statement" }
          ].map(t => (
            <button key={t.id} onClick={() => setTemplate(t.id)} style={{
              background: template === t.id ? "var(--gold)" : "rgba(255,204,1,.05)",
              border: `1px solid ${template === t.id ? "var(--gold)" : "var(--border)"}`,
              color: template === t.id ? "var(--black)" : "var(--fg-muted)",
              padding: "8px 16px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", cursor: "pointer", marginBottom: 5
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

            {/* ── Letterhead (prints on the memo per AR 25-50) ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 8, background: "rgba(255,204,1,0.03)", border: "1px dashed var(--border)" }}>
              <div style={{ fontFamily: '"GI",Arial,sans-serif', fontWeight: 700, fontSize: 8.5, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--gold)", opacity: .8 }}>
                Letterhead
              </div>
              <label style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 10, color: "var(--fg-muted)" }}>
                Unit / Organization
                <input type="text" value={lh("unitName")} onChange={e => setInputs(p => ({ ...p, unitName: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 5, fontSize: 11 }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 10, color: "var(--fg-muted)" }}>
                Unit Address
                <input type="text" value={lh("unitAddress")} onChange={e => setInputs(p => ({ ...p, unitAddress: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 5, fontSize: 11 }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 10, color: "var(--fg-muted)" }}>
                Office Symbol
                <input type="text" value={lh("officeSymbol")} onChange={e => setInputs(p => ({ ...p, officeSymbol: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 5, fontSize: 11 }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 10, color: "var(--fg-muted)" }}>
                Date (AR 25-50 format, e.g. 1 June 2026)
                <input type="text" value={inputs.date} onChange={e => setInputs(p => ({ ...p, date: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 5, fontSize: 11 }} />
              </label>
            </div>

            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
              Applicant Name
              <input type="text" value={inputs.applicant} onChange={e => setInputs(p => ({ ...p, applicant: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
              Applicant SSN
              <input type="text" value={inputs.ssn} onChange={e => setInputs(p => ({ ...p, ssn: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
            </label>

            {/* Template specific fields */}
            {template === "tattoo" && (
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
            )}

            {(template === "b0m0" || template === "moral") && (
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                {template === "b0m0" ? "PHA Date" : "Offense Details"}
                <textarea value={inputs.details} onChange={e => setInputs(p => ({ ...p, details: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12, minHeight: 46 }} />
              </label>
            )}

            {template === "tpu_acceptance" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                    Grade / Rank
                    <input type="text" value={inputs.rank} onChange={e => setInputs(p => ({ ...p, rank: e.target.value }))} placeholder="e.g. SGT / E-5" style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                    MOS
                    <input type="text" value={inputs.mos} onChange={e => setInputs(p => ({ ...p, mos: e.target.value }))} placeholder="e.g. 11B" style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                  </label>
                </div>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                  Para, Line, Position Number
                  <input type="text" value={inputs.paraLinePos} onChange={e => setInputs(p => ({ ...p, paraLinePos: e.target.value }))} placeholder="e.g. Para 101, Line 03, Position 04221980" style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                  Recruiter Phone Number
                  <input type="text" value={inputs.recruiterPhone} onChange={e => setInputs(p => ({ ...p, recruiterPhone: e.target.value }))} placeholder="e.g. 555-0199" style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                </label>
              </>
            )}

            {template === "ra_grade" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                    Grade / Rank
                    <input type="text" value={inputs.rank} onChange={e => setInputs(p => ({ ...p, rank: e.target.value }))} placeholder="e.g. SGT / E-5" style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                    MOS
                    <input type="text" value={inputs.mos} onChange={e => setInputs(p => ({ ...p, mos: e.target.value }))} placeholder="e.g. 11B" style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                  </label>
                </div>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                  Duty Preference 1
                  <input type="text" value={inputs.dutyPref1} onChange={e => setInputs(p => ({ ...p, dutyPref1: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                  Duty Preference 2
                  <input type="text" value={inputs.dutyPref2} onChange={e => setInputs(p => ({ ...p, dutyPref2: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                  Duty Preference 3
                  <input type="text" value={inputs.dutyPref3} onChange={e => setInputs(p => ({ ...p, dutyPref3: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                </label>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 8, background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border)", margin: "4px 0" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, cursor: "pointer", color: "var(--fg-alt)" }}>
                    <input type="checkbox" checked={inputs.spouseServing} onChange={e => setInputs(p => ({ ...p, spouseServing: e.target.checked }))} />
                    Spouse is Serving in Armed Forces
                  </label>
                  {inputs.spouseServing && (
                    <>
                      <label style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 10, color: "var(--fg-muted)" }}>
                        Spouse Component
                        <input type="text" value={inputs.spouseComponent} onChange={e => setInputs(p => ({ ...p, spouseComponent: e.target.value }))} placeholder="e.g. US Army" style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 4, fontSize: 11 }} />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 10, color: "var(--fg-muted)" }}>
                        Spouse Location
                        <input type="text" value={inputs.spouseLocation} onChange={e => setInputs(p => ({ ...p, spouseLocation: e.target.value }))} placeholder="e.g. Fort Carson, CO" style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 4, fontSize: 11 }} />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 10, color: "var(--fg-muted)" }}>
                        Spouse SSN
                        <input type="text" value={inputs.spouseSSN} onChange={e => setInputs(p => ({ ...p, spouseSSN: e.target.value }))} placeholder="e.g. XXX-XX-1234" style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 4, fontSize: 11 }} />
                      </label>
                    </>
                  )}
                </div>

                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                  EFMP Status
                  <select value={inputs.efmpStatus} onChange={e => setInputs(p => ({ ...p, efmpStatus: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 5, fontSize: 12 }}>
                    <option value="No">No — Not Enrolled</option>
                    <option value="Yes">Yes — Enrolled</option>
                  </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                  Recruiter Phone Number
                  <input type="text" value={inputs.recruiterPhone} onChange={e => setInputs(p => ({ ...p, recruiterPhone: e.target.value }))} placeholder="e.g. 555-0199" style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
                </label>
              </>
            )}

            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
              {template === "moral" || template === "ra_grade" ? "Applicant Name" : template === "tpu_acceptance" ? "Unit Commander" : template === "tattoo" ? "Commander Endorsing" : "TPU Commander"}
              <input type="text" 
                value={template === "moral" || template === "ra_grade" ? inputs.applicant : inputs.commander} 
                onChange={e => setInputs(p => (template === "moral" || template === "ra_grade" ? { ...p, applicant: e.target.value } : { ...p, commander: e.target.value }))} 
                style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
            </label>

            {(template === "b0m0" || template === "tpu_acceptance") && (
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                Gaining TPU Unit
                <input type="text" value={inputs.gainingUnit} onChange={e => setInputs(p => ({ ...p, gainingUnit: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12 }} />
              </label>
            )}

            {(template === "moral" || template === "b0m0") && (
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--fg-muted)" }}>
                {template === "b0m0" ? "Medical Justification Remarks" : "Moral Statement / Rehabilitation Info"}
                <textarea value={inputs.reason} onChange={e => setInputs(p => ({ ...p, reason: e.target.value }))} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--fg-alt)", padding: 6, fontSize: 12, minHeight: 60 }} />
              </label>
            )}
          </div>

          {/* Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ flex: 1, background: "#FFFFFF", border: "1px solid #CCCCCC", color: "#000000", padding: "40px 46px", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 12, lineHeight: 1.3, overflow: "auto", minHeight: 440, maxHeight: 560, boxShadow: "inset 0 0 10px rgba(0,0,0,0.1)" }}>
              {(() => {
                const m = buildMemo();
                return (
                  <React.Fragment>
                    {/* Letterhead (AR 25-50 ¶1-16) */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
                      <img src="../../assets/logos/memo-emblem.jpg" alt="DA Seal" style={{ height: 68, width: "auto", flexShrink: 0 }}/>
                      <div style={{ flex: 1, textAlign: "center", lineHeight: 1.25 }}>
                        <div style={{ fontWeight: "bold", fontSize: 11 }}>DEPARTMENT OF THE ARMY</div>
                        <div style={{ fontWeight: "bold", fontSize: 8.5 }}>{lh("unitName")}</div>
                        <div style={{ fontWeight: "bold", fontSize: 8.5 }}>{lh("unitAddress")}</div>
                      </div>
                      <div style={{ width: 68, flexShrink: 0 }}/>
                    </div>
                    {/* Office symbol (left) + date flush right (AR 25-50 ¶2-4a) */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26, marginBottom: 26 }}>
                      <span>{lh("officeSymbol")}</span>
                      <span>{inputs.date}</span>
                    </div>
                    <div style={{ marginBottom: 18 }}>MEMORANDUM FOR RECORD</div>
                    <div style={{ marginBottom: 18 }}>SUBJECT: {m.subject}</div>
                    {m.paras.map((p, idx) => (
                      <p key={idx} style={{ margin: "0 0 12px 0", paddingLeft: p.sub ? 28 : 0 }}>{p.t}</p>
                    ))}
                    {/* Signature block — center of page (AR 25-50 ¶2-4c) */}
                    <div style={{ marginTop: 44, marginLeft: "50%" }}>
                      {m.sig.map((s2, idx) => (
                        <div key={idx} style={{ fontWeight: s2.b ? "bold" : "normal" }}>{s2.t}</div>
                      ))}
                    </div>
                  </React.Fragment>
                );
              })()}
            </div>
            
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={copyToClipboard} style={{ flex: 1, background: "rgba(255,204,1,.1)", border: "1px solid var(--gold)", color: "var(--gold)", padding: "10px 14px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", cursor: "pointer" }}>
                📋 Copy Text
              </button>
              <button onClick={downloadMfr} style={{ flex: 1, background: "rgba(255,204,1,.1)", border: "1px solid var(--gold)", color: "var(--gold)", padding: "10px 14px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", cursor: "pointer" }}>
                💾 Download .TXT
              </button>
              <button onClick={downloadMfrDocx} style={{ flex: 1.5, background: "var(--gold)", border: "none", color: "var(--black)", padding: "10px 14px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", cursor: "pointer" }}>
                📝 Download Word (.doc)
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
  const [fileName, setFileName] = usePersistedState("pqc-vault-filename", "");
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
  const [refType, setRefType] = usePersistedState("pqc-ref-type", "personal");
  const [inputs, setInputs] = usePersistedState("pqc-ref-inputs", {
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

