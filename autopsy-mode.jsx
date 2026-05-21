// autopsy-mode.jsx — Packet QC v3.0 Autopsy Edition
// Satirical mode toggled from the main TabBar.
// Props: sections, statuses, profile, aliasCheck, onToggle, onQuickComplete, onReset

const { useState, useEffect, useRef, useMemo } = React;

/* ── Helpers ─────────────────────────────────────────────── */
const _fmtTime = () => new Date().toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" });

/* ── Organ metaphors for all 23 sections ─────────────────── */
const ORGAN_MAP = {
  "identity":       { organ:"HEART",               emoji:"💀", desc:"Core vitals. No heartbeat, no packet." },
  "education":      { organ:"PREFRONTAL CORTEX",   emoji:"🧠", desc:"Where smart things supposedly live." },
  "genesis":        { organ:"NERVOUS SYSTEM",      emoji:"⚡", desc:"One bad nerve = full system shutdown." },
  "background":     { organ:"LIVER",               emoji:"🍺", desc:"Filters all the moral toxins." },
  "medical":        { organ:"IMMUNE SYSTEM",        emoji:"🩺", desc:"Determines if the body survives MEPS." },
  "enlistment":     { organ:"SPINE",               emoji:"🦴", desc:"Holds the whole operation upright." },
  "dependents":     { organ:"UMBILICAL CORD",      emoji:"👶", desc:"Attached whether you like it or not." },
  "prior-service":  { organ:"SCAR TISSUE",         emoji:"🪖", desc:"Evidence of prior trauma. It's complicated." },
  "mso-rel":        { organ:"APPENDIX",            emoji:"💊", desc:"No one knows why. Just causes problems." },
  "moral-waiver":   { organ:"CRIMINAL RECORD GLAND", emoji:"⚖️", desc:"The controversial organ. Handle with prayer." },
  "suit-waiver":    { organ:"SHADOW GLAND",        emoji:"🕵️", desc:"Legally ambiguous tissue. GC has opinions." },
  "medical-waiver": { organ:"DEFECTIVE PANCREAS",  emoji:"🏥", desc:"Needs special handling and extra paperwork." },
  "age-waiver":     { organ:"GROWTH PLATE",        emoji:"📏", desc:"Technically still developing. Legally questionable." },
  "tattoo-waiver":  { organ:"EPIDERMIS",           emoji:"🎨", desc:"The walking art gallery. GC will zoom in." },
  "rel-waiver":     { organ:"SOUL",                emoji:"🙏", desc:"Hard to document. Requires a chaplain MFR." },
  "re-waiver":      { organ:"SCAR FROM PRIOR OP",  emoji:"🔄", desc:"You've been here before. The system remembers." },
  "dep-waiver":     { organ:"GUILT GLAND",         emoji:"😬", desc:"Gets heavier with every dependent entered." },
  "arms-docs":      { organ:"PERFORMANCE TISSUE",  emoji:"💪", desc:"ARMS 2.0. We lowered the bar. You're welcome." },
  "ocs-docs":       { organ:"EGO CENTER",          emoji:"⭐", desc:"Future officer material. Or so they believe." },
  "flri-docs":      { organ:"PHOENIX LOBE",        emoji:"🔥", desc:"Risen from the ashes of prior officer service." },
  "atp-docs":       { organ:"TRAINING NUCLEUS",    emoji:"🔬", desc:"Experimental tissue. Requirements change weekly." },
  "smp-docs":       { organ:"DUAL PROCESSOR",      emoji:"💻", desc:"Running Reserve AND ROTC simultaneously. Bold." },
  "woft-docs":      { organ:"WINGS",               emoji:"✈️", desc:"The cool organ. Everyone wishes they had this." },
};

const GC_MOODS = [
  "HUNGRY & JUDGMENTAL",
  "SUSPICIOUS OF EVERYTHING",
  "SEEN IT ALL BEFORE",
  "CAFFEINATED & DANGEROUS",
  "MONDAY ENERGY ON A FRIDAY",
  "REVIEWING YOUR SINS",
  "DISAPPOINTINGLY CALM",
  "IN A MEETING (IGNORE THEM)",
  "JUST RETURNED ANOTHER PACKET",
  "HOLDING THE POWER TO DESTROY YOU",
  "FILING PAPERWORK WITH PREJUDICE",
  "NOT IMPRESSED. NOT EVEN A LITTLE.",
  "AWAITING YOUR INEVITABLE MISTAKE",
  "READING YOUR SF-86 WITH JOY",
  "CIRCLING DD 369 IN RED PEN",
  "CURRENTLY FORWARDING TO BATTALION",
];

const GC_VOICE_LINES = [
  "Where's the Live Scan authorization in Contact History? ...That's what I thought.",
  "You completed the UF 601-210.15 three weeks early. Bold choice. Wrong choice.",
  "I have your packet. I have questions. They are not good questions.",
  "The Alias Tab is empty. I see two different names on your documents. Interesting.",
  "Your DD 369 does not cover the offense location. Try again. From the beginning.",
  "Did you just Wite-Out a government form? Did you?",
  "The MIRS is from last Tuesday. Reprint it. Today. Now.",
  "I'm looking at your SF 86 validation report. It has flags. Many flags. It looks like a golf course.",
  "Station Live Scan Authorized was entered in SC Remarks. That's not Contact History. That's not even close.",
  "I need you to explain what 'approximately complete' means on a federal enlistment document.",
  "The dates on the DD 2807-2 and the 680-3A disagree by one day. ONE DAY. Do it again.",
  "Your packet is missing the BN Commander memo. The one I told you about. Last time. And the time before.",
  "A DD 369 with a handwritten alias. I've circled it. I've stared at it. I've circled it again.",
  "The applicant signed the form before meeting you. Pre-signed. You know what this means.",
  "I don't know what this document is, but it's not what I asked for.",
];

/* ── VT323 terminal font style ───────────────────────────── */
const VT = ({ children, color="#4ade80", size=15, style:sty }) => (
  <span style={{ fontFamily:"'VT323',monospace", fontSize:size, color, lineHeight:1, ...sty }}>{children}</span>
);

/* ── Main AutopsyMode component ─────────────────────────── */
const AutopsyMode = ({ sections, statuses, profile, aliasCheck, onToggle, onQuickComplete, onReset }) => {
  const [gcMood,      setGcMood]      = useState(() => GC_MOODS[Math.floor(Math.random() * GC_MOODS.length)]);
  const [rageSeconds, setRageSeconds] = useState(3600);
  const [morgueLog,   setMorgueLog]   = useState(() => [
    { time:_fmtTime(), text:"☠ AUTOPSY INITIATED — CAUSE OF DEATH PENDING", color:"#f87171" },
    { time:_fmtTime(), text:"SUBJECT: " + (profile.name || "UNKNOWN"), color:"#fbbf24" },
  ]);
  const [confessOpen,    setConfessOpen]    = useState(false);
  const [confession,     setConfession]     = useState("");
  const [confessResp,    setConfessResp]    = useState("");
  const [gcVoiceOpen,    setGcVoiceOpen]    = useState(false);
  const [gcVoiceLine,    setGcVoiceLine]    = useState("");
  const [openSection,    setOpenSection]    = useState(null);

  const prevStatuses = useRef(statuses);
  const morgueRef    = useRef(null);

  /* ── Stats ── */
  const allItems = useMemo(() =>
    sections.flatMap(s => s.items.map(i => ({ ...i, status:statuses[i.id] || "pending" })))
  , [sections, statuses]);
  const totalCount    = allItems.length;
  const completeCount = allItems.filter(i => i.status === "complete").length;
  const flagCount     = allItems.filter(i => i.status === "flagged").length;
  const pulseScore    = totalCount > 0 ? Math.round((completeCount / totalCount) * 100) : 0;

  /* ── Rage timer ── */
  useEffect(() => {
    const base = Math.max(120, 3600 - flagCount * 420);
    setRageSeconds(base);
    const iv = setInterval(() => setRageSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(iv);
  }, [flagCount]);

  const fmtRage = s => {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${m}m ${sec.toString().padStart(2,"0")}s`;
  };

  /* ── Morgue log — watch status changes ── */
  useEffect(() => {
    const prev = prevStatuses.current;
    const entries = [];
    sections.forEach(s => {
      s.items.forEach(i => {
        const was = prev[i.id] || "pending";
        const now = statuses[i.id] || "pending";
        if (was !== now) {
          const organ = (ORGAN_MAP[s.id] || {}).organ || s.title;
          if (now === "complete") entries.push({ time:_fmtTime(),
            text:`[${organ}] ${i.label.toUpperCase()} — PRONOUNCED VIABLE`, color:"#4ade80" });
          else if (now === "flagged") entries.push({ time:_fmtTime(),
            text:`[${organ}] ${i.label.toUpperCase()} — ⚠ CRITICAL. CALL THE GC.`, color:"#f87171" });
          else entries.push({ time:_fmtTime(),
            text:`[${organ}] ${i.label.toUpperCase()} — REVIVED TO PENDING`, color:"#fbbf24" });
        }
      });
    });
    if (entries.length) setMorgueLog(prev => [...prev, ...entries].slice(-60));
    prevStatuses.current = statuses;
  }, [statuses, sections]);

  /* ── Auto-scroll morgue log ── */
  useEffect(() => {
    if (morgueRef.current) morgueRef.current.scrollTop = morgueRef.current.scrollHeight;
  }, [morgueLog]);

  /* ── Handlers ── */
  const randomizeGCMood = () => {
    const next = GC_MOODS[Math.floor(Math.random() * GC_MOODS.length)];
    setGcMood(next);
    setMorgueLog(p => [...p, { time:_fmtTime(), text:`GC MOOD UPDATED: ${next}`, color:"#fbbf24" }].slice(-60));
  };

  const submitConfession = () => {
    const responses = [
      "That's between you, GC, and the Lord. Mostly GC.",
      "I've seen worse. Actually, no I haven't.",
      "You should have led with that in your email.",
      "This explains so much about your packet.",
      "The regulations do not forgive. Neither does GC.",
      "Noted. Forwarded to battalion. Good luck out there.",
      "Your recruiter instincts are... a work in progress.",
    ];
    setConfessResp(responses[Math.floor(Math.random() * responses.length)]);
    setMorgueLog(p => [...p, { time:_fmtTime(), text:"CONFESSIONAL SUBMITTED — PENANCE PENDING", color:"#c084fc" }].slice(-60));
  };

  const openGCVoice = () => {
    setGcVoiceLine(GC_VOICE_LINES[Math.floor(Math.random() * GC_VOICE_LINES.length)]);
    setGcVoiceOpen(true);
  };

  const handleNuclear = () => {
    setMorgueLog([{ time:_fmtTime(), text:"☢ NUCLEAR OPTION DEPLOYED — ALL ORGANS RESET TO PENDING", color:"#f87171" }]);
    onReset();
  };

  /* ── Alias DNA analysis ── */
  const aliasStatus = aliasCheck.status;
  const dnaColor = aliasStatus==="match" ? "#4ade80" : aliasStatus==="alias" ? "#f87171"
    : aliasStatus==="discrepancy" ? "#fbbf24" : "#52525b";
  const dnaLabel = aliasStatus==="match"       ? "DNA MATCH — NO ALIAS NEEDED"
    : aliasStatus==="alias"       ? `⚠ ALIAS DETECTED — ${aliasCheck.groups.length} NAME VARIANT${aliasCheck.groups.length>1?"S":""}`
    : aliasStatus==="discrepancy" ? "MIDDLE NAME MISMATCH — VERIFY WITH SUBJECT"
    : "DNA ANALYSIS INCOMPLETE — ENTER DOCUMENT NAMES ABOVE";

  /* ── Prognosis text ── */
  const prognosis = pulseScore===100 && flagCount===0 ? "★ CLEARED FOR MEPS — REMARKABLE SURVIVAL"
    : flagCount > 3 ? "CRITICAL — GC WILL NOT BE KIND"
    : flagCount > 0 ? "ELEVATED — PRAY FOR MERCY"
    : pulseScore > 80 ? "STABILIZING — KEEP DISSECTING"
    : "IN PROGRESS — CAUSE OF DEATH TBD";
  const prognosisColor = pulseScore===100 && flagCount===0 ? "#FFCC01"
    : flagCount > 0 ? "#f87171" : "#fbbf24";

  /* ── Shared button style helper ── */
  const cmdBtn = (extra={}) => ({
    display:"flex", alignItems:"center", gap:6, padding:"8px 16px",
    fontFamily:'"GI",Arial,sans-serif', fontWeight:700, fontSize:8,
    textTransform:"uppercase", letterSpacing:"1px", cursor:"pointer",
    border:"1px solid #3f3f46", background:"rgba(255,255,255,.03)", color:"#e5e5e5",
    ...extra
  });

  return (
    <div style={{ flex:1, overflow:"auto", background:"#0A080C", fontFamily:'"GI",Arial,sans-serif' }}>

      {/* ════════ TOP COMMAND BAR ════════ */}
      <div style={{ background:"#050305", borderBottom:"2px solid #8B0000",
        padding:"12px 24px", display:"flex", alignItems:"center",
        justifyContent:"space-between", position:"sticky", top:0, zIndex:100,
        boxShadow:"0 4px 24px rgba(139,0,0,.25)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:42, height:42, background:"#FFCC01",
            display:"flex", alignItems:"center", justifyContent:"center",
            border:"3px solid #000", fontSize:26, lineHeight:1 }}>☠</div>
          <div>
            <div style={{ fontWeight:700, fontSize:18, letterSpacing:4,
              color:"#FFCC01", textTransform:"uppercase" }}>PACKET QC</div>
            <div style={{ fontWeight:700, fontSize:7, letterSpacing:3,
              color:"#f87171", textTransform:"uppercase", marginTop:-1 }}>v3.0 AUTOPSY EDITION</div>
          </div>
          <div style={{ padding:"3px 10px", background:"rgba(139,0,0,.25)",
            border:"1px solid #8B0000", fontWeight:700, fontSize:7,
            textTransform:"uppercase", letterSpacing:2, color:"#f87171" }}>
            LIVE FROM THE MORGUE
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => { setConfessOpen(true); setConfessResp(""); }} style={cmdBtn()}>
            🙏 CONFESS YOUR SINS
          </button>
          <button onClick={openGCVoice}
            style={cmdBtn({ background:"rgba(139,0,0,.15)", border:"1px solid #8B0000", color:"#f87171" })}>
            💀 WHAT WOULD GC SAY?
          </button>
          <button onClick={handleNuclear}
            style={cmdBtn({ background:"rgba(127,29,29,.25)", border:"2px solid #8B0000",
              color:"#f87171", animation:"scanPulse 2s ease infinite" })}>
            ☢ NUCLEAR OPTION
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"24px 24px 48px" }}>

        {/* ════════ VITALS DASHBOARD ════════ */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:10 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:7, textTransform:"uppercase",
                letterSpacing:4, color:"#f87171" }}>CURRENT PACKET STATUS • LIVE AUTOPSY</div>
              <div style={{ fontWeight:700, fontSize:26, textTransform:"uppercase",
                letterSpacing:1, color:"#fff", lineHeight:1.1 }}>
                {profile.name || "SUBJECT UNKNOWN"}
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:7, color:"#52525b", textTransform:"uppercase", letterSpacing:2 }}>GC ON DUTY</div>
              <div style={{ fontWeight:700, fontSize:10, textTransform:"uppercase", color:"#FFCC01" }}>
                {profile.gc || "— UNASSIGNED —"}
              </div>
            </div>
          </div>

          {/* Vitals row */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            {/* Pulse */}
            <div style={{ background:"#111", border:"1px solid rgba(74,222,128,.2)", padding:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:7, textTransform:"uppercase",
                    letterSpacing:2, color:"#4ade80" }}>PULSE (SURVIVAL %)</div>
                  <VT size={42} color="#4ade80">{pulseScore}</VT>
                  <div style={{ fontWeight:400, fontSize:7, color:"rgba(74,222,128,.4)" }}> / 100</div>
                </div>
                <div style={{ fontSize:24, opacity:.2, alignSelf:"flex-start" }}>💓</div>
              </div>
              <div style={{ height:4, background:"#1f2937", marginTop:8 }}>
                <div style={{ height:"100%", background:"#4ade80",
                  width:`${pulseScore}%`, transition:"width .7s cubic-bezier(.2,.6,0,1)" }}/>
              </div>
            </div>

            {/* Fever */}
            <div style={{ background:"#111",
              border:`1px solid rgba(248,113,113,${flagCount>0?.35:.12})`, padding:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:7, textTransform:"uppercase",
                    letterSpacing:2, color:"#f87171" }}>FEVER (FLAGS)</div>
                  <VT size={42} color={flagCount>5?"#dc2626":flagCount>0?"#f87171":"#4ade80"}
                    style={{ animation:flagCount>0?"scanPulse 1.5s ease infinite":"none" }}>
                    {flagCount}
                  </VT>
                </div>
                <div style={{ fontSize:24, opacity:.2, alignSelf:"flex-start" }}>🌡️</div>
              </div>
              <VT size={13} color="rgba(248,113,113,.45)" style={{ marginTop:6, display:"block" }}>
                {flagCount===0 ? "STABLE. SUSPICIOUSLY STABLE."
                  : flagCount>5 ? "CRITICAL CONDITION"
                  : "ELEVATED. GC IS WATCHING."}
              </VT>
            </div>

            {/* GC Mood — clickable */}
            <div onClick={randomizeGCMood}
              style={{ background:"#111", border:"1px solid rgba(251,191,36,.2)", padding:14,
                cursor:"pointer", transition:"border-color .2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(251,191,36,.55)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(251,191,36,.2)"}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:7, textTransform:"uppercase",
                    letterSpacing:2, color:"#fbbf24", marginBottom:4 }}>GC MOOD</div>
                  <VT size={17} color="#fbbf24" style={{ maxWidth:160, display:"block", lineHeight:1.25 }}>
                    {gcMood}
                  </VT>
                </div>
                <div style={{ fontSize:24, opacity:.2, alignSelf:"flex-start" }}>🕵️</div>
              </div>
              <div style={{ fontWeight:700, fontSize:7, color:"rgba(251,191,36,.35)",
                marginTop:10, textTransform:"uppercase", letterSpacing:1 }}>CLICK TO CHANGE FATE</div>
            </div>

            {/* Rage Timer */}
            <div style={{ background:"#111", border:"1px solid #27272a", padding:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:7, textTransform:"uppercase",
                    letterSpacing:2, color:"#71717a" }}>TIME UNTIL GC RAGE</div>
                  <VT size={32} color={rageSeconds<300?"#f87171":"#d4d4d8"}>{fmtRage(rageSeconds)}</VT>
                </div>
                <div style={{ fontSize:24, opacity:.2, alignSelf:"flex-start" }}>⏰</div>
              </div>
              <div style={{ fontWeight:700, fontSize:7, color:"#3f3f46", marginTop:8,
                textTransform:"uppercase" }}>BASED ON FLAGS × GC PATIENCE INDEX</div>
            </div>
          </div>
        </div>

        {/* ════════ DNA ANALYSIS (Alias Check) ════════ */}
        {aliasStatus !== "unknown" && (
          <div style={{ background:"#111", border:`1px solid ${dnaColor}35`, padding:"14px 16px",
            marginBottom:20, animation:"fadeUp .3s ease" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:aliasStatus==="match"?0:10 }}>
              <div style={{ fontWeight:700, fontSize:8, textTransform:"uppercase",
                letterSpacing:3, color:dnaColor }}>🧬 DNA ANALYSIS</div>
              <VT size={17} color={dnaColor}>{dnaLabel}</VT>
            </div>
            {aliasStatus==="alias" && aliasCheck.groups.map(({ name, docs }) => (
              <div key={name} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:4 }}>
                <span style={{ fontWeight:700, fontSize:7, color:"#f87171", textTransform:"uppercase",
                  background:"rgba(248,113,113,.12)", padding:"2px 5px", whiteSpace:"nowrap",
                  flexShrink:0, marginTop:2, letterSpacing:1 }}>{docs.join(" · ")}</span>
                <VT size={14} color="#e5e5e5" style={{ lineHeight:1.3 }}>{name}</VT>
              </div>
            ))}
            {aliasStatus==="alias" && <div style={{ fontWeight:700, fontSize:7, color:"#f87171",
              marginTop:6, lineHeight:1.8, textTransform:"uppercase", letterSpacing:1 }}>
              ALL NAMES REQUIRED IN GENESIS ALIAS TAB · SEPARATE DD 369 PER ALIAS (AR 601-210 PARA 2-11B · UM 21-022)
            </div>}
            {aliasStatus==="discrepancy" && aliasCheck.issues.map((iss, i) => (
              <div key={i} style={{ marginBottom:5 }}>
                <VT size={14} color="#fbbf24">
                  {iss.docs[0]}: {iss.vals[0]} &nbsp;vs&nbsp; {iss.docs[1]}: {iss.vals[1]}
                </VT>
              </div>
            ))}
            {aliasStatus==="discrepancy" && <div style={{ fontWeight:700, fontSize:7,
              color:"rgba(251,191,36,.5)", marginTop:6, lineHeight:1.8,
              textTransform:"uppercase", letterSpacing:1 }}>
              SAME FIRST/LAST — NOT AN ALIAS YET. VERIFY: TYPO OR DIFFERENT LEGAL MIDDLE NAME?
            </div>}
          </div>
        )}

        {/* ════════ MORGUE LOG + ORGAN INVENTORY ════════ */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 260px", gap:14, marginBottom:24 }}>
          {/* Morgue log */}
          <div style={{ background:"#050505", border:"1px solid #27272a", padding:14,
            display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <div style={{ fontWeight:700, fontSize:8, textTransform:"uppercase",
                letterSpacing:3, color:"#f87171" }}>MORGUE LOG • LIVE</div>
              <button onClick={() => setMorgueLog([{ time:_fmtTime(),
                  text:"LOG CLEARED. STARTING FRESH. GODSPEED.", color:"#52525b" }])}
                style={{ fontWeight:700, fontSize:7, color:"#3f3f46", background:"none",
                  border:"none", cursor:"pointer", textTransform:"uppercase", letterSpacing:1 }}>
                CLEAR
              </button>
            </div>
            <div ref={morgueRef}
              style={{ flex:1, overflow:"auto", maxHeight:160, minHeight:80 }}>
              {morgueLog.map((e, i) => (
                <div key={i} style={{ display:"flex", gap:8, marginBottom:3 }}>
                  <VT size={11} color="#52525b" style={{ whiteSpace:"nowrap", flexShrink:0 }}>{e.time}</VT>
                  <VT size={13} color={e.color} style={{ lineHeight:1.2 }}>{e.text}</VT>
                </div>
              ))}
            </div>
          </div>

          {/* Organ inventory */}
          <div style={{ background:"#050505", border:"1px solid #27272a", padding:14 }}>
            <div style={{ fontWeight:700, fontSize:8, textTransform:"uppercase",
              letterSpacing:3, color:"#71717a", marginBottom:14 }}>ORGAN INVENTORY</div>
            <VT size={19} color="#4ade80" style={{ display:"block", marginBottom:6 }}>
              ✓ {completeCount} VIABLE
            </VT>
            <VT size={19} color="#f87171"
              style={{ display:"block", marginBottom:6,
                animation:flagCount>0?"scanPulse 2s ease infinite":"none" }}>
              ⚠ {flagCount} CRITICAL
            </VT>
            <VT size={19} color="#fbbf24" style={{ display:"block" }}>
              — {totalCount - completeCount - flagCount} PENDING
            </VT>
            <div style={{ borderTop:"1px solid #27272a", marginTop:14, paddingTop:12 }}>
              <div style={{ fontWeight:700, fontSize:7, color:"#52525b",
                textTransform:"uppercase", letterSpacing:2, marginBottom:5 }}>PROGNOSIS</div>
              <VT size={14} color={prognosisColor} style={{ lineHeight:1.3 }}>{prognosis}</VT>
            </div>
          </div>
        </div>

        {/* ════════ ORGANS / SECTIONS ════════ */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
          {sections.map(section => {
            const org   = ORGAN_MAP[section.id] || { organ:section.title, emoji:"📄", desc:"" };
            const items = section.items.map(i => ({ ...i, status:statuses[i.id] || "pending" }));
            const sDone  = items.filter(i => i.status==="complete").length;
            const sFlag  = items.filter(i => i.status==="flagged").length;
            const sTotal = items.length;
            const allDone = sDone===sTotal && sTotal>0;
            const hasFlag = sFlag>0;
            const pct = sTotal>0 ? Math.round(sDone/sTotal*100) : 0;
            const isOpen  = openSection === section.id;
            const borderColor = hasFlag ? "rgba(248,113,113,.35)" : allDone ? "rgba(74,222,128,.25)" : "rgba(63,63,70,.5)";
            const hdrBg = hasFlag ? "rgba(139,0,0,.18)" : allDone ? "rgba(5,46,22,.25)" : "#111";

            return (
              <div key={section.id} style={{ background:"#111", border:`1px solid ${borderColor}`,
                overflow:"hidden", transition:"border-color .3s", animation:"fadeUp .25s ease" }}>

                {/* ── Header — click to expand ── */}
                <div onClick={() => setOpenSection(isOpen ? null : section.id)}
                  style={{ background:hdrBg, padding:"14px 16px",
                    borderBottom:`2px solid ${hasFlag?"#8B0000":allDone?"#166534":"#27272a"}`,
                    cursor:"pointer", display:"flex", alignItems:"flex-start", gap:12 }}>
                  <div style={{ fontSize:22, lineHeight:1, flexShrink:0 }}>{org.emoji}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:2 }}>
                      <div style={{ fontWeight:700, fontSize:7, textTransform:"uppercase",
                        letterSpacing:3, color:hasFlag?"#f87171":allDone?"#4ade80":"#71717a" }}>
                        {org.organ}
                      </div>
                      {allDone && <span style={{ fontWeight:700, fontSize:7, color:"#4ade80",
                        border:"1px solid #4ade80", padding:"1px 6px", letterSpacing:1 }}>✓ VIABLE</span>}
                      {hasFlag && <span style={{ fontWeight:700, fontSize:7, color:"#f87171",
                        border:"1px solid #f87171", padding:"1px 6px", letterSpacing:1,
                        animation:"scanPulse 1.5s ease infinite" }}>
                        ⚠ {sFlag} FLAG{sFlag>1?"S":""}
                      </span>}
                    </div>
                    <div style={{ fontWeight:700, fontSize:11, textTransform:"uppercase",
                      letterSpacing:1, color:"#e5e5e5", lineHeight:1.1 }}>{section.title}</div>
                    <VT size={13} color="#52525b" style={{ marginTop:3, display:"block" }}>{org.desc}</VT>
                  </div>
                  <div style={{ flexShrink:0, textAlign:"right" }}>
                    <VT size={26} color={hasFlag?"#f87171":allDone?"#4ade80":"#a1a1aa"}>
                      {sDone}<span style={{ color:"#3f3f46" }}>/{sTotal}</span>
                    </VT>
                    <div style={{ fontWeight:700, fontSize:7, color:isOpen?"#FFCC01":"#3f3f46",
                      marginTop:3, textTransform:"uppercase", letterSpacing:1,
                      transition:"color .2s" }}>{isOpen ? "▲ CLOSE" : "▼ DISSECT"}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height:3, background:"#1f2937" }}>
                  <div style={{ height:"100%",
                    background:hasFlag?"#8B0000":allDone?"#22c55e":"#FFCC01",
                    width:`${pct}%`, transition:"width .7s cubic-bezier(.2,.6,0,1)" }}/>
                </div>

                {/* ── Expanded items ── */}
                {isOpen && (
                  <div>
                    {!allDone && (
                      <div style={{ padding:"8px 14px", borderBottom:"1px solid #1a1a1a",
                        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <VT size={12} color="#3f3f46">
                          {sTotal-sDone} item{sTotal-sDone!==1?"s":""} pending examination
                        </VT>
                        <button onClick={e => { e.stopPropagation(); onQuickComplete(section.id); }}
                          style={{ fontWeight:700, fontSize:7, textTransform:"uppercase",
                            letterSpacing:1, padding:"4px 10px",
                            background:"rgba(74,222,128,.08)", border:"1px solid rgba(74,222,128,.25)",
                            color:"#4ade80", cursor:"pointer" }}>
                          ✓ MARK ALL VIABLE
                        </button>
                      </div>
                    )}
                    {items.map(item => {
                      const isDone = item.status === "complete";
                      const isFlag = item.status === "flagged";
                      const ic = isDone ? "#4ade80" : isFlag ? "#f87171" : "#fbbf24";
                      return (
                        <div key={item.id} onClick={e => { e.stopPropagation(); onToggle(item.id); }}
                          style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"10px 14px",
                            borderBottom:"1px solid #141414", cursor:"pointer",
                            background:"transparent", transition:"background .1s" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.02)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <div style={{ width:18, height:18, border:`2px solid ${ic}`,
                            background:isDone?"#4ade80":isFlag?"#f87171":"transparent",
                            flexShrink:0, marginTop:1, display:"flex", alignItems:"center",
                            justifyContent:"center", fontSize:9, color:(isDone||isFlag)?"#000":"transparent",
                            fontWeight:700, transition:"all .15s", lineHeight:1 }}>
                            {isDone ? "✓" : isFlag ? "✗" : ""}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontWeight:500, fontSize:11, lineHeight:1.25,
                              color:isDone ? "rgba(74,222,128,.35)" : "#e5e5e5",
                              textDecoration:isDone ? "line-through" : "none" }}>
                              {item.label}
                            </div>
                            {item.sub && <VT size={12} color="#3f3f46" style={{ marginTop:2, display:"block" }}>
                              {item.sub}
                            </VT>}
                          </div>
                          <div style={{ fontWeight:700, fontSize:7, textTransform:"uppercase",
                            letterSpacing:1, padding:"2px 7px",
                            border:`1px solid ${isDone?"#4ade80":isFlag?"#f87171":"transparent"}`,
                            color:isDone?"#4ade80":isFlag?"#f87171":"transparent", flexShrink:0 }}>
                            {isDone ? "VIABLE" : isFlag ? "CRITICAL" : ""}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ════════ FINAL ACTIONS ════════ */}
        <div style={{ marginTop:32, display:"flex", gap:12 }}>
          <div style={{ flex:1, padding:"20px 24px", display:"flex", alignItems:"center",
            justifyContent:"center", gap:12,
            background:pulseScore===100&&flagCount===0 ? "linear-gradient(90deg,#FFCC01,#fde047)" : "rgba(255,204,1,.05)",
            border:pulseScore===100&&flagCount===0 ? "none" : "1px solid rgba(255,204,1,.15)",
            fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:2,
            color:pulseScore===100&&flagCount===0 ? "#000" : "rgba(255,204,1,.25)" }}>
            ✈ SUBMIT TO STATION COMMANDER — PRAY FOR MERCY
          </div>
          <button onClick={openGCVoice}
            style={{ padding:"20px 28px", border:"2px solid #8B0000",
              background:"rgba(139,0,0,.1)", fontWeight:700, fontSize:9,
              textTransform:"uppercase", letterSpacing:2, color:"#f87171", cursor:"pointer",
              display:"flex", alignItems:"center", gap:10, transition:"background .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(139,0,0,.25)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(139,0,0,.1)"}>
            💀 WHAT WOULD GC SAY?
          </button>
        </div>

        <div style={{ textAlign:"center", marginTop:24 }}>
          <div style={{ fontWeight:400, fontSize:7, color:"#27272a", textTransform:"uppercase",
            letterSpacing:1, lineHeight:1.9 }}>
            Humorous parody for entertainment and training purposes only.<br/>
            All regulatory references remain accurate. Do not actually submit this to MEPS or your GC.
          </div>
        </div>
      </div>

      {/* ════════ CONFESSIONAL MODAL ════════ */}
      {confessOpen && (
        <div onClick={() => { setConfessOpen(false); setConfessResp(""); }}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.95)", zIndex:1000,
            display:"flex", alignItems:"center", justifyContent:"center", padding:24,
            animation:"overlayIn .15s ease" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:"#111", border:"1px solid #78350f",
              maxWidth:440, width:"100%", padding:28, animation:"modalIn .2s cubic-bezier(.2,.6,0,1)" }}>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ fontSize:36 }}>🙏</div>
              <div style={{ fontWeight:700, fontSize:13, textTransform:"uppercase",
                letterSpacing:3, color:"#fbbf24", marginTop:8 }}>THE CONFESSIONAL</div>
              <VT size={14} color="rgba(251,191,36,.5)" style={{ marginTop:4 }}>
                Tell GC what you did. Be honest. They already know.
              </VT>
            </div>
            <textarea value={confession} onChange={e => setConfession(e.target.value)}
              placeholder="I may have... completed the UF 601-210.15 three weeks early..."
              style={{ width:"100%", height:90, background:"#050505",
                border:"1px solid #3f3f46", fontFamily:"'VT323',monospace",
                fontSize:14, color:"#e5e5e5", padding:12, resize:"vertical", outline:"none" }}/>
            {confessResp && (
              <div style={{ background:"rgba(251,191,36,.06)", border:"1px solid rgba(251,191,36,.2)",
                padding:"10px 14px", margin:"12px 0" }}>
                <VT size={15} color="#fbbf24">GC: "{confessResp}"</VT>
              </div>
            )}
            <div style={{ display:"flex", gap:8, marginTop:12 }}>
              <button onClick={submitConfession}
                style={{ flex:1, padding:12, background:"#fbbf24", color:"#000",
                  fontWeight:700, fontSize:8, textTransform:"uppercase",
                  letterSpacing:2, border:"none", cursor:"pointer" }}>
                RECEIVE MY ROAST
              </button>
              <button onClick={() => { setConfessOpen(false); setConfessResp(""); }}
                style={{ flex:1, padding:12, background:"transparent",
                  border:"1px solid #3f3f46", fontWeight:700, fontSize:8,
                  textTransform:"uppercase", letterSpacing:2, color:"#71717a", cursor:"pointer" }}>
                NEVER MIND I'M FINE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ GC VOICE MODAL ════════ */}
      {gcVoiceOpen && (
        <div onClick={() => setGcVoiceOpen(false)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.92)", zIndex:1000,
            display:"flex", alignItems:"center", justifyContent:"center", padding:24,
            animation:"overlayIn .15s ease" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:"#0A080C", border:"1px solid #8B0000",
              maxWidth:560, width:"100%", padding:32, animation:"modalIn .2s cubic-bezier(.2,.6,0,1)" }}>
            <div style={{ fontWeight:700, fontSize:8, textTransform:"uppercase",
              letterSpacing:4, color:"#f87171", marginBottom:8 }}>WHAT GC ACTUALLY SAID</div>
            <VT size={22} color="#e5e5e5" style={{ display:"block", lineHeight:1.55, marginBottom:24 }}>
              "{gcVoiceLine}"
            </VT>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setGcVoiceLine(GC_VOICE_LINES[Math.floor(Math.random()*GC_VOICE_LINES.length)])}
                style={{ flex:1, padding:12, background:"rgba(139,0,0,.18)",
                  border:"1px solid #8B0000", fontWeight:700, fontSize:8,
                  textTransform:"uppercase", letterSpacing:2, color:"#f87171", cursor:"pointer" }}>
                HEAR ANOTHER
              </button>
              <button onClick={() => setGcVoiceOpen(false)}
                style={{ flex:1, padding:12, background:"transparent",
                  border:"1px solid #3f3f46", fontWeight:700, fontSize:8,
                  textTransform:"uppercase", letterSpacing:2, color:"#71717a", cursor:"pointer" }}>
                I UNDERSTAND
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

Object.assign(window, { AutopsyMode });
