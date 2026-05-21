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
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  background: #111;
  border: 1px solid #3f3f46;
}
.aut-card:hover {
  transform: translateY(-3px) scale(1.005);
  box-shadow: 0 0 0 4px rgba(255, 204, 1, 0.15);
}
.aut-card::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: linear-gradient(to bottom right, transparent 40%, rgba(255,204,1,0.04) 50%, transparent 60%);
  transform: rotate(30deg);
  transition: transform 0.6s;
  pointer-events: none;
  z-index: 0;
}
.aut-card:hover::before { transform: translateX(100%) rotate(30deg); }
.aut-card-inner { position: relative; z-index: 1; }

.aut-section-header {
  background: linear-gradient(90deg, #111 0%, #1a1a1a 100%);
  border-bottom: 3px solid #FFCC01;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.aut-badge {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  padding: 4px 10px;
  font-weight: 900;
  letter-spacing: 1.5px;
  border: 2px solid currentColor;
  cursor: pointer;
  user-select: none;
  display: inline-block;
  transition: all 0.1s;
  border-radius: 0;
  line-height: 1.4;
}
.aut-badge-complete { background:#052e16; color:#4ade80; border-color:#4ade80; }
.aut-badge-pending  { background:#451a03; color:#fbbf24; border-color:#fbbf24; }
.aut-badge-flagged  {
  background:#450a0a; color:#f87171; border-color:#f87171;
  animation: aut-death-pulse 1.5s infinite;
  box-shadow: 0 0 12px rgba(248,113,113,0.5);
}
.aut-badge-na { background:#18181b; color:#52525b; border-color:#3f3f46; }

@keyframes aut-death-pulse {
  0%,100% { opacity:1; }
  50%      { opacity:0.65; }
}

.aut-pstart { font-family:'Press Start 2P', monospace; }
.aut-vt323  { font-family:'VT323', monospace; }

.aut-morgue-log { font-family:'VT323',monospace; font-size:14px; line-height:1.3; }

.aut-vital {
  background:#111;
  border-radius:16px;
  padding:16px;
  transition: border-color .2s;
}

.aut-item-row {
  padding: 14px 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border-bottom: 1px solid #1f2937;
  transition: background .1s;
}
.aut-item-row:last-child { border-bottom: none; }
.aut-item-row:hover { background: rgba(255,255,255,0.02); }

.aut-skull-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(248,113,113,0.45);
  font-size: 18px;
  padding: 2px 4px;
  transition: color .15s, transform .15s;
  line-height: 1;
  flex-shrink: 0;
}
.aut-skull-btn:hover { color: #f87171; transform: scale(1.2); }

.aut-nuclear-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  padding: 10px 20px;
  background: rgba(127,29,29,0.3);
  border: 2px solid #8B0000;
  color: #f87171;
  cursor: pointer;
  letter-spacing: 1.5px;
  transition: background .15s;
  animation: aut-nuke-glow 1.4s infinite alternate;
}
.aut-nuclear-btn:hover { background: rgba(185,28,28,0.4); }
@keyframes aut-nuke-glow {
  from { box-shadow: 0 0 6px rgba(248,113,113,.25); }
  to   { box-shadow: 0 0 18px rgba(248,113,113,.55); }
}

.aut-cmd-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  padding: 10px 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid #3f3f46;
  color: #e5e5e5;
  cursor: pointer;
  letter-spacing: 1px;
  transition: background .12s, border-color .12s;
}
.aut-cmd-btn:hover { background: rgba(255,255,255,.07); border-color:#71717a; }

.aut-submit-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  padding: 20px 28px;
  cursor: pointer;
  letter-spacing: 1.5px;
  transition: all .15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 24px;
}
.aut-submit-btn.ready {
  background: linear-gradient(90deg, #FFCC01, #fde047);
  border: none;
  color: #000;
  box-shadow: 0 8px 32px rgba(255,204,1,.25);
}
.aut-submit-btn.ready:hover { filter: brightness(1.07); transform: scale(1.01); }
.aut-submit-btn.blocked {
  background: rgba(255,204,1,.06);
  border: 1px solid rgba(255,204,1,.18);
  color: rgba(255,204,1,.35);
  cursor: pointer;
}
.aut-submit-btn.blocked:hover { background: rgba(255,204,1,.10); color: rgba(255,204,1,.55); }

.aut-confess-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  padding: 14px 20px;
  border-radius: 12px;
  cursor: pointer;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all .12s;
  width: 100%;
}
.aut-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.92);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: overlayIn .15s ease;
}
.aut-modal-box {
  animation: modalIn .2s cubic-bezier(.2,.6,0,1);
  max-width: 580px;
  width: 100%;
}
.aut-input {
  width: 100%;
  background: #050505;
  border: 1px solid #3f3f46;
  font-family: 'VT323', monospace;
  font-size: 15px;
  color: #e5e5e5;
  padding: 12px;
  resize: vertical;
  outline: none;
  border-radius: 0;
}
.aut-input:focus { border-color: #71717a; }

.aut-toggle-section {
  overflow: hidden;
  transition: max-height 0.3s cubic-bezier(0.4,0,0.2,1);
}
`;

/* ═══════════════════════════════════════════════════════
   DATA
════════════════════════════════════════════════════════ */
const ORGAN_MAP = {
  "identity":       { organ:"HEART",               emoji:"❤️",  tag:"CORE VITALS"    },
  "education":      { organ:"PREFRONTAL CORTEX",   emoji:"🧠",  tag:"SMART TISSUE"   },
  "genesis":        { organ:"NERVOUS SYSTEM",      emoji:"⚡",  tag:"CENTRAL COMMAND" },
  "background":     { organ:"LIVER",               emoji:"🫀",  tag:"TOXIN FILTER"   },
  "medical":        { organ:"IMMUNE SYSTEM",        emoji:"🩺",  tag:"MEPS READINESS" },
  "enlistment":     { organ:"SPINE",               emoji:"🦴",  tag:"STRUCTURAL"     },
  "dependents":     { organ:"UMBILICAL CORD",      emoji:"👶",  tag:"ATTACHED"       },
  "prior-service":  { organ:"SCAR TISSUE",         emoji:"🪖",  tag:"PRIOR TRAUMA"   },
  "mso-rel":        { organ:"APPENDIX",            emoji:"💊",  tag:"VESTIGIAL"      },
  "moral-waiver":   { organ:"CRIMINAL RECORD GLAND", emoji:"⚖️", tag:"CONTROVERSIAL"  },
  "suit-waiver":    { organ:"SHADOW GLAND",        emoji:"🕵️", tag:"AMBIGUOUS"      },
  "medical-waiver": { organ:"DEFECTIVE PANCREAS",  emoji:"🏥",  tag:"SPECIAL HANDLING"},
  "age-waiver":     { organ:"GROWTH PLATE",        emoji:"📏",  tag:"DEVELOPING"     },
  "tattoo-waiver":  { organ:"EPIDERMIS",           emoji:"🎨",  tag:"ART GALLERY"    },
  "rel-waiver":     { organ:"SOUL",                emoji:"🙏",  tag:"UNQUANTIFIABLE" },
  "re-waiver":      { organ:"SCAR FROM PRIOR OP",  emoji:"🔄",  tag:"RECURRING"      },
  "dep-waiver":     { organ:"GUILT GLAND",         emoji:"😬",  tag:"HEAVY"          },
  "arms-docs":      { organ:"PERFORMANCE TISSUE",  emoji:"💪",  tag:"ENHANCED"       },
  "ocs-docs":       { organ:"EGO CENTER",          emoji:"⭐",  tag:"OFFICER MATERIAL"},
  "flri-docs":      { organ:"PHOENIX LOBE",        emoji:"🔥",  tag:"RESURRECTED"    },
  "atp-docs":       { organ:"TRAINING NUCLEUS",    emoji:"🔬",  tag:"EXPERIMENTAL"   },
  "smp-docs":       { organ:"DUAL PROCESSOR",      emoji:"💻",  tag:"MULTITASKING"   },
  "woft-docs":      { organ:"WINGS",               emoji:"✈️",  tag:"THE COOL ONE"   },
};

const GC_MOODS = [
  "HUNGRY & JUDGMENTAL","SUSPICIOUS OF EVERYTHING","SEEN IT ALL BEFORE",
  "CAFFEINATED & DANGEROUS","MONDAY ENERGY ON A FRIDAY","REVIEWING YOUR SINS",
  "DISAPPOINTINGLY CALM","IN A MEETING (IGNORE THEM)","JUST RETURNED A PACKET",
  "HOLDING POWER TO DESTROY YOU","FILING WITH PREJUDICE","NOT IMPRESSED. NOT EVEN A LITTLE.",
  "AWAITING YOUR MISTAKE","READING SF-86 WITH DELIGHT","CIRCLING DD 369 IN RED PEN",
  "CURRENTLY FORWARDING TO BATTALION","RUNNING ON COFFEE AND SPITE",
];

const GC_VOICE_LINES = [
  "Where's the Live Scan authorization in Contact History? ...That's what I thought.",
  "You completed the UF 601-210.15 three weeks early. Bold choice. Wrong choice.",
  "I have your packet. I have questions. They are not good questions.",
  "The Alias Tab is empty. I see two different names on the documents. Interesting.",
  "Your DD 369 does not cover the offense location. Try again. From the beginning.",
  "Did you just Wite-Out a government form? Did you?",
  "The MIRS is from last Tuesday. Reprint it. Today. Right now.",
  "I'm looking at your SF 86 validation report. It has flags. Many flags. It looks like a golf course.",
  "Station Live Scan Authorized was entered in SC Remarks. That is not Contact History. Not even close.",
  "I need you to explain what 'approximately complete' means on a federal enlistment document.",
  "The dates on the DD 2807-2 and the 680-3A disagree by one day. ONE DAY. Do it again.",
  "Your packet is missing the BN Commander memo. The one I told you about. Last time. And the time before.",
  "A DD 369 with a handwritten alias. I've circled it. I've stared at it. I've circled it again.",
  "The applicant signed the form before meeting you. Pre-signed. You know what this means.",
  "I don't know what this document is, but I know it's not what I asked for.",
];

const SC_SUBMIT_ROASTS = [
  "GC just opened your packet. They smiled. Then they stopped smiling. They haven't looked up since.",
  "The SC forwarded it to GC. GC forwarded it to a folder called 'EXAMPLES OF FAILURE'. You're famous now.",
  "Packet received. GC is currently re-reading page 3. They've been on page 3 for eleven minutes.",
  "Submitted successfully. GC has already identified four things to circle in red pen. They're warming up.",
  "The packet arrived at GC's desk. GC said 'oh.' That's the worst thing they can say. Just 'oh.'",
  "Station Commander accepted it. GC called them. It was a short call. Nobody laughed.",
  "Your packet is now in the queue. GC reviewed the first page and immediately forwarded it to the BN S1 as a cautionary tale.",
];

const _fmtTime = () => new Date().toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" });

/* ═══════════════════════════════════════════════════════
   STATUS CYCLE: pending → complete → flagged → pending
════════════════════════════════════════════════════════ */
const cycleStatus = (current) => {
  if (current === "pending")   return "complete";
  if (current === "complete")  return "flagged";
  return "pending";
};

const badgeClass = (s) => {
  if (s === "complete") return "aut-badge aut-badge-complete";
  if (s === "flagged")  return "aut-badge aut-badge-flagged";
  if (s === "na")       return "aut-badge aut-badge-na";
  return "aut-badge aut-badge-pending";
};

const badgeLabel = (s) => {
  if (s === "complete") return "COMPLETE";
  if (s === "flagged")  return "FLAGGED";
  if (s === "na")       return "N/A";
  return "PENDING";
};

/* ═══════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════ */
const AutopsyMode = ({ sections, statuses, profile, aliasCheck, onToggle, onQuickComplete, onReset }) => {

  /* ── Inject + cleanup scoped CSS ── */
  useEffect(() => {
    const id = "aut-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = AUTOPSY_CSS;
      document.head.appendChild(s);
    }
    /* Also inject Font Awesome if not present */
    const faId = "aut-fa";
    if (!document.getElementById(faId)) {
      const l = document.createElement("link");
      l.id = faId;
      l.rel = "stylesheet";
      l.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
      document.head.appendChild(l);
    }
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, []);

  /* ── State ── */
  const [gcMood,       setGcMood]       = useState(() => GC_MOODS[Math.floor(Math.random()*GC_MOODS.length)]);
  const [rageSeconds,  setRageSeconds]  = useState(3600);
  const [morgueLog,    setMorgueLog]    = useState(() => [
    { time:_fmtTime(), text:"☠ AUTOPSY INITIATED — CAUSE OF DEATH: PENDING", color:"#f87171" },
    { time:_fmtTime(), text:"SUBJECT: " + (profile.name || "UNKNOWN"), color:"#fbbf24" },
  ]);
  const [helpItem,     setHelpItem]     = useState(null);
  const [confessOpen,  setConfessOpen]  = useState(false);
  const [confession,   setConfession]   = useState("");
  const [confessResp,  setConfessResp]  = useState("");
  const [gcVoiceOpen,  setGcVoiceOpen]  = useState(false);
  const [gcVoiceLine,  setGcVoiceLine]  = useState("");
  const [submitOpen,   setSubmitOpen]   = useState(false);
  const [submitRoast,  setSubmitRoast]  = useState("");
  const [openSections, setOpenSections] = useState(() => new Set()); // collapsed by default

  const prevStatuses = useRef(statuses);
  const morgueRef    = useRef(null);

  /* ── Computed stats ── */
  const allItems = useMemo(() =>
    sections.flatMap(s => s.items.map(i => ({ ...i, status:statuses[i.id] || "pending" })))
  , [sections, statuses]);

  const totalCount    = allItems.length;
  const completeCount = allItems.filter(i => i.status === "complete").length;
  const flagCount     = allItems.filter(i => i.status === "flagged").length;
  const pendingCount  = allItems.filter(i => i.status === "pending").length;
  const pulseScore    = totalCount > 0 ? Math.round((completeCount / totalCount) * 100) : 0;
  const isReady       = pulseScore === 100 && flagCount === 0;

  /* ── Rage countdown ── */
  useEffect(() => {
    const base = Math.max(180, 3600 - flagCount * 420);
    setRageSeconds(base);
    const iv = setInterval(() => setRageSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(iv);
  }, [flagCount]);

  const fmtRage = s => {
    const m = Math.floor(s/60), sec = s%60;
    return `${m}m ${sec.toString().padStart(2,"0")}s`;
  };

  /* ── Morgue log — watch for status changes ── */
  useEffect(() => {
    const prev = prevStatuses.current;
    const entries = [];
    sections.forEach(s => {
      s.items.forEach(i => {
        const was = prev[i.id] || "pending";
        const now = statuses[i.id] || "pending";
        if (was !== now) {
          const org = (ORGAN_MAP[s.id] || {}).organ || s.title;
          const label = i.label.length > 42 ? i.label.slice(0,42)+"..." : i.label;
          if (now === "complete") entries.push({ time:_fmtTime(), color:"#4ade80",
            text:`[${org}] ${label.toUpperCase()} — PRONOUNCED VIABLE` });
          else if (now === "flagged") entries.push({ time:_fmtTime(), color:"#f87171",
            text:`[${org}] ${label.toUpperCase()} — ⚠ CRITICAL. GC IS ALREADY DRAFTING THE RETURN MEMO.` });
          else entries.push({ time:_fmtTime(), color:"#fbbf24",
            text:`[${org}] ${label.toUpperCase()} — REVIVED TO PENDING (COWARDICE)` });
        }
      });
    });
    if (entries.length) setMorgueLog(p => [...p, ...entries].slice(-60));
    prevStatuses.current = statuses;
  }, [statuses, sections]);

  /* ── Auto-scroll morgue log ── */
  useEffect(() => {
    if (morgueRef.current) morgueRef.current.scrollTop = morgueRef.current.scrollHeight;
  }, [morgueLog]);

  /* ── Handlers ── */
  const randomizeGCMood = useCallback(() => {
    const next = GC_MOODS[Math.floor(Math.random()*GC_MOODS.length)];
    setGcMood(next);
    setMorgueLog(p => [...p, { time:_fmtTime(), color:"#fbbf24", text:`GC MOOD UPDATED: ${next}` }].slice(-60));
  }, []);

  const handleCycleStatus = useCallback((itemId) => {
    // Use the parent's toggle — but we need 3-state here.
    // We intercept: if currently complete → flag it via toggle twice?
    // Actually we'll call a direct setStatuses via onToggle which only does 2-state.
    // Solution: call onToggle but also track the "flagged" state locally...
    // Better: for autopsy mode we just call onToggle which cycles complete↔pending,
    // but we want 3-state. We'll store flagged overrides locally.
    onToggle(itemId);
  }, [onToggle]);

  // For full 3-state cycle in autopsy mode, we track local overrides
  const [localOverrides, setLocalOverrides] = useState({});

  const handleAutopsyCycle = useCallback((itemId) => {
    const base = statuses[itemId] || "pending";
    const local = localOverrides[itemId];
    const current = local !== undefined ? local : base;
    const next = cycleStatus(current);

    // Sync with parent for complete/pending states
    if (next === "complete" && base !== "complete") onToggle(itemId);
    else if (next === "pending" && base !== "pending") onToggle(itemId);
    // For flagged: store locally, also call onToggle if needed to force pending in parent
    if (next === "flagged") {
      // mark parent as pending (so it doesn't show complete), store flagged locally
      if (base === "complete") onToggle(itemId); // complete→pending in parent
    }
    setLocalOverrides(p => ({ ...p, [itemId]: next }));

    const s = sections.flatMap(s=>s.items).find(i=>i.id===itemId);
    const sec = sections.find(s=>s.items.some(i=>i.id===itemId));
    const orgName = sec ? (ORGAN_MAP[sec.id]||{}).organ || sec.title : "";
    const lbl = s ? s.label.slice(0,44) : itemId;
    const msg = next==="complete" ? `[${orgName}] ${lbl.toUpperCase()} — CLEARED (MIRACLE)`
      : next==="flagged" ? `[${orgName}] ${lbl.toUpperCase()} — ⚠ FLAGGED FOR EXECUTION`
      : `[${orgName}] ${lbl.toUpperCase()} — PENDING (STILL ALIVE, BARELY)`;
    const col = next==="complete"?"#4ade80":next==="flagged"?"#f87171":"#fbbf24";
    setMorgueLog(p => [...p, { time:_fmtTime(), color:col, text:msg }].slice(-60));
  }, [statuses, localOverrides, onToggle, sections]);

  const getDisplayStatus = useCallback((itemId) => {
    const lo = localOverrides[itemId];
    return lo !== undefined ? lo : (statuses[itemId] || "pending");
  }, [statuses, localOverrides]);

  const handleNuclear = useCallback(() => {
    setLocalOverrides({});
    setMorgueLog([
      { time:_fmtTime(), color:"#f87171", text:"☢ NUCLEAR OPTION DEPLOYED" },
      { time:_fmtTime(), color:"#f87171", text:"ALL ORGANS RESET TO PENDING. STARTING FROM THE ASHES." },
    ]);
    onReset();
  }, [onReset]);

  const openGCVoice = useCallback(() => {
    setGcVoiceLine(GC_VOICE_LINES[Math.floor(Math.random()*GC_VOICE_LINES.length)]);
    setGcVoiceOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    const roast = SC_SUBMIT_ROASTS[Math.floor(Math.random()*SC_SUBMIT_ROASTS.length)];
    setSubmitRoast(roast);
    setSubmitOpen(true);
    setMorgueLog(p => [...p, { time:_fmtTime(), color:"#FFCC01",
      text:"★ PACKET SUBMITTED TO STATION COMMANDER — INITIATING PRAYER PROTOCOL" }].slice(-60));
  }, []);

  const submitConfession = useCallback(() => {
    const responses = [
      "That's between you, GC, and the Lord. Mostly GC.",
      "I've seen worse. Actually, no I haven't.",
      "You should have led with that in your email.",
      "This explains so much about your packet.",
      "The regulations do not forgive. Neither does GC.",
      "Noted. Forwarded to battalion. Good luck out there.",
      "Your recruiter instincts are a work in progress.",
      "GC says: Fix it and never speak of this again.",
    ];
    setConfessResp(responses[Math.floor(Math.random()*responses.length)]);
    setMorgueLog(p => [...p, { time:_fmtTime(), color:"#c084fc",
      text:"CONFESSIONAL SUBMITTED — PENANCE: PENDING REVIEW" }].slice(-60));
  }, []);

  const toggleSection = useCallback((id) => {
    setOpenSections(p => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  /* ── Alias DNA ── */
  const aliasStatus = aliasCheck.status;
  const dnaColor = aliasStatus==="match"?"#4ade80":aliasStatus==="alias"?"#f87171":aliasStatus==="discrepancy"?"#fbbf24":"#52525b";

  /* ── Prognosis ── */
  const prognosis = isReady ? "★ CLEARED FOR MEPS — REMARKABLE SURVIVAL"
    : flagCount > 3 ? "CRITICAL — GC WILL NOT BE KIND"
    : flagCount > 0 ? "ELEVATED — PRAY FOR MERCY"
    : pulseScore > 80 ? "STABILIZING — KEEP DISSECTING"
    : "IN PROGRESS — CAUSE OF DEATH TBD";

  /* ═══════ RENDER ═══════ */
  return (
    <div style={{ flex:1, overflowY:"auto", background:"#0A080C", color:"#E5E5E5" }}>

      {/* ══════════════════════════════════════
          TOP COMMAND BAR
      ══════════════════════════════════════ */}
      <div style={{ borderBottom:"2px solid #FFCC01", background:"#000",
        position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"12px 24px",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:46, height:46, background:"#FFCC01", display:"flex",
              alignItems:"center", justifyContent:"center", border:"4px solid #000",
              fontSize:30, lineHeight:1 }}>☠︎</div>
            <div>
              <div className="aut-pstart" style={{ fontSize:20, letterSpacing:4, color:"#FFCC01" }}>PACKET QC</div>
              <div className="aut-pstart" style={{ fontSize:7, letterSpacing:3, color:"#f87171", marginTop:2 }}>
                v3.0 AUTOPSY EDITION
              </div>
            </div>
            <div className="aut-pstart" style={{ fontSize:7, padding:"4px 12px", borderRadius:4,
              background:"rgba(139,0,0,.3)", border:"1px solid #8B0000",
              color:"#f87171", letterSpacing:2 }}>
              LIVE FROM THE MORGUE
            </div>
          </div>

          <div style={{ display:"flex", gap:8 }}>
            <button className="aut-cmd-btn" onClick={() => { setConfessOpen(true); setConfessResp(""); }}>
              <i className="fas fa-pray" style={{ marginRight:6 }}></i>CONFESS YOUR SINS
            </button>
            <button className="aut-cmd-btn" onClick={openGCVoice}
              style={{ background:"rgba(139,0,0,.15)", borderColor:"#8B0000", color:"#f87171" }}>
              <i className="fas fa-skull" style={{ marginRight:6 }}></i>WHAT WOULD GC SAY?
            </button>
            <button className="aut-nuclear-btn" onClick={handleNuclear}>
              <i className="fas fa-bomb" style={{ marginRight:6 }}></i>NUCLEAR OPTION
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"24px 24px 48px" }}>

        {/* ══════════════════════════════════════
            VITALS DASHBOARD
        ══════════════════════════════════════ */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:10 }}>
            <div>
              <div className="aut-pstart" style={{ fontSize:7, letterSpacing:4, color:"#f87171" }}>
                CURRENT PACKET STATUS • LIVE AUTOPSY
              </div>
              <div className="aut-pstart" style={{ fontSize:22, letterSpacing:1, color:"#fff",
                marginTop:6, lineHeight:1.2 }}>
                {profile.name || "SUBJECT UNKNOWN"}
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div className="aut-pstart" style={{ fontSize:7, color:"#52525b", letterSpacing:2 }}>GC ON DUTY</div>
              <div className="aut-pstart" style={{ fontSize:9, color:"#FFCC01", marginTop:4 }}>
                {profile.gc || "— UNASSIGNED —"}
              </div>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            {/* Pulse */}
            <div className="aut-vital" style={{ border:"1px solid rgba(74,222,128,.25)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div className="aut-pstart" style={{ fontSize:7, color:"#4ade80", letterSpacing:2 }}>
                    PULSE (SURVIVAL %)
                  </div>
                  <div className="aut-vt323" style={{ fontSize:52, color:"#4ade80", lineHeight:1 }}>
                    {pulseScore}
                  </div>
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
            <div className="aut-vital"
              style={{ border:`1px solid rgba(248,113,113,${flagCount>0?.35:.12})` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div className="aut-pstart" style={{ fontSize:7, color:"#f87171", letterSpacing:2 }}>
                    FEVER (FLAGGED ISSUES)
                  </div>
                  <div className="aut-vt323" style={{ fontSize:52, lineHeight:1,
                    color:flagCount>5?"#dc2626":flagCount>0?"#f87171":"#4ade80",
                    animation:flagCount>0?"aut-death-pulse 1.5s infinite":"none" }}>
                    {flagCount}
                  </div>
                </div>
                <i className="fas fa-thermometer-full" style={{ fontSize:32, color:"rgba(248,113,113,.25)", marginTop:4 }}></i>
              </div>
              <div className="aut-pstart" style={{ fontSize:7, color:"rgba(248,113,113,.4)",
                marginTop:8, letterSpacing:1 }}>
                {flagCount===0 ? "STABLE. SUSPICIOUSLY STABLE." : flagCount>5 ? "CRITICAL CONDITION" : "ELEVATED. GC IS WATCHING."}
              </div>
            </div>

            {/* GC Mood — clickable */}
            <div className="aut-vital" onClick={randomizeGCMood}
              style={{ border:"1px solid rgba(251,191,36,.2)", cursor:"pointer" }}
              onMouseEnter={e => e.currentTarget.style.borderColor="rgba(251,191,36,.55)"}
              onMouseLeave={e => e.currentTarget.style.borderColor="rgba(251,191,36,.2)"}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="aut-pstart" style={{ fontSize:7, color:"#fbbf24", letterSpacing:2, marginBottom:6 }}>
                    GC MOOD
                  </div>
                  <div className="aut-vt323" style={{ fontSize:20, color:"#fbbf24",
                    lineHeight:1.3, wordBreak:"break-word" }}>
                    {gcMood}
                  </div>
                </div>
                <i className="fas fa-user-secret" style={{ fontSize:32, color:"rgba(251,191,36,.2)", flexShrink:0, marginLeft:8, marginTop:4 }}></i>
              </div>
              <div className="aut-pstart" style={{ fontSize:7, color:"rgba(251,191,36,.35)",
                marginTop:10, letterSpacing:1 }}>CLICK TO CHANGE FATE</div>
            </div>

            {/* Rage Timer */}
            <div className="aut-vital" style={{ border:"1px solid #27272a" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div className="aut-pstart" style={{ fontSize:7, color:"#71717a", letterSpacing:2 }}>
                    TIME UNTIL GC RAGE
                  </div>
                  <div className="aut-vt323" style={{ fontSize:42, lineHeight:1,
                    color:rageSeconds<300?"#f87171":rageSeconds<900?"#fbbf24":"#d4d4d8" }}>
                    {fmtRage(rageSeconds)}
                  </div>
                </div>
                <i className="fas fa-clock" style={{ fontSize:32, color:"rgba(113,113,122,.25)", marginTop:4 }}></i>
              </div>
              <div className="aut-pstart" style={{ fontSize:7, color:"#3f3f46", marginTop:8, letterSpacing:1 }}>
                BASED ON FLAGS × GC PATIENCE
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            PACKET BODY + MORGUE LOG
        ══════════════════════════════════════ */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16, marginBottom:24 }}>
          {/* Packet body */}
          <div className="aut-card" style={{ borderRadius:24 }}>
            <div className="aut-card-inner" style={{ padding:20 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div className="aut-pstart" style={{ fontSize:7, color:"#71717a", letterSpacing:2 }}>
                  THE PATIENT • PACKET #{profile.ssnLast4 || "????"}
                </div>
                <button onClick={openGCVoice}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:6,
                    background:"rgba(139,0,0,.25)", border:"1px solid #8B0000",
                    cursor:"pointer", transition:"background .12s" }}
                  className="aut-pstart"
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(185,28,28,.4)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(139,0,0,.25)"}>
                  <i className="fas fa-stethoscope" style={{ color:"#f87171", fontSize:12 }}></i>
                  <span style={{ fontSize:7, color:"#f87171", letterSpacing:1 }}>ASK THE GC</span>
                </button>
              </div>

              {/* Packet visual */}
              <div style={{ background:"#1f2937", border:"8px solid #4b5563",
                boxShadow:"inset 0 0 60px rgba(0,0,0,.8)", borderRadius:16,
                padding:24, minHeight:120, display:"flex", alignItems:"center",
                justifyContent:"center", position:"relative" }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:56, marginBottom:4 }}>📁</div>
                  <div className="aut-pstart" style={{ fontSize:14, letterSpacing:3, color:"#fff" }}>PACKET</div>
                  <div className="aut-vt323" style={{ fontSize:16, color:"#71717a", marginTop:4 }}>
                    {isReady ? "CLEARED — CAUSE OF DEATH: NONE" : flagCount>0 ? "CRITICAL CONDITION" : "UNDER EXAMINATION"}
                  </div>
                </div>
                {/* Stamp */}
                {flagCount > 3 && (
                  <div style={{ position:"absolute", top:"15%", right:"10%", transform:"rotate(12deg)",
                    fontSize:36, fontWeight:900, color:"#f87171", opacity:.2,
                    fontFamily:"'Press Start 2P',monospace", textShadow:"2px 2px 0 #000",
                    pointerEvents:"none", userSelect:"none" }}>RETURNED</div>
                )}
              </div>

              <div className="aut-vt323" style={{ textAlign:"center", marginTop:8, fontSize:14, color:"#3f3f46" }}>
                Click any organ card below to begin dissection
              </div>
            </div>
          </div>

          {/* Morgue Log */}
          <div style={{ background:"#050505", border:"1px solid #27272a", borderRadius:24, padding:16,
            display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div className="aut-pstart" style={{ fontSize:7, color:"#f87171", letterSpacing:3 }}>
                MORGUE LOG • LIVE
              </div>
              <button onClick={() => setMorgueLog([{ time:_fmtTime(), color:"#52525b",
                  text:"LOG CLEARED. STARTING FRESH. GODSPEED." }])}
                className="aut-vt323"
                style={{ fontSize:14, color:"#3f3f46", background:"none", border:"none",
                  cursor:"pointer" }}>CLEAR</button>
            </div>
            <div ref={morgueRef} className="aut-morgue-log"
              style={{ flex:1, overflowY:"auto", maxHeight:280, minHeight:120 }}>
              {morgueLog.map((e, i) => (
                <div key={i} style={{ display:"flex", gap:8, marginBottom:4 }}>
                  <span style={{ color:"#52525b", whiteSpace:"nowrap", flexShrink:0 }}>[{e.time}]</span>
                  <span style={{ color:e.color, flex:1 }}>{e.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            DNA ANALYSIS (Alias Check)
        ══════════════════════════════════════ */}
        {aliasStatus !== "unknown" && (
          <div style={{ background:"#111", border:`1px solid ${dnaColor}30`,
            borderRadius:16, padding:"14px 18px", marginBottom:20, animation:"fadeUp .3s ease" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
              <i className="fas fa-dna" style={{ color:dnaColor, fontSize:18 }}></i>
              <div className="aut-pstart" style={{ fontSize:7, color:dnaColor, letterSpacing:3 }}>
                DNA ANALYSIS
              </div>
              <div className="aut-vt323" style={{ fontSize:20, color:dnaColor }}>
                {aliasStatus==="match" ? "DNA MATCH — NO ALIAS NEEDED"
                  : aliasStatus==="alias" ? `⚠ ALIAS DETECTED — ${aliasCheck.groups.length} NAME VARIANT${aliasCheck.groups.length>1?"S":""}`
                  : aliasStatus==="discrepancy" ? "MIDDLE NAME MISMATCH — VERIFY WITH SUBJECT"
                  : "INCOMPLETE — ENTER DOCUMENT NAMES IN PROFILE"}
              </div>
            </div>
            {aliasStatus==="alias" && <div style={{ marginTop:10 }}>
              {aliasCheck.groups.map(({ name, docs }) => (
                <div key={name} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:5 }}>
                  <span className="aut-pstart" style={{ fontSize:6, color:"#f87171",
                    background:"rgba(248,113,113,.12)", padding:"2px 6px", whiteSpace:"nowrap",
                    flexShrink:0, marginTop:3, letterSpacing:1 }}>{docs.join(" · ")}</span>
                  <span className="aut-vt323" style={{ fontSize:16, color:"#e5e5e5" }}>{name}</span>
                </div>
              ))}
              <div className="aut-pstart" style={{ fontSize:6, color:"#f87171", marginTop:6,
                lineHeight:2, letterSpacing:1 }}>
                ALL NAMES REQUIRED IN GENESIS ALIAS TAB · SEPARATE DD 369 PER ALIAS (AR 601-210 PARA 2-11B · UM 21-022)
              </div>
            </div>}
            {aliasStatus==="discrepancy" && <div style={{ marginTop:8 }}>
              {aliasCheck.issues.map((iss, i) => (
                <div key={i} className="aut-vt323" style={{ fontSize:15, color:"#fbbf24", marginBottom:4 }}>
                  {iss.docs[0]}: {iss.vals[0]} &nbsp;vs&nbsp; {iss.docs[1]}: {iss.vals[1]}
                </div>
              ))}
              <div className="aut-pstart" style={{ fontSize:6, color:"rgba(251,191,36,.5)",
                marginTop:6, lineHeight:2, letterSpacing:1 }}>
                SAME FIRST/LAST — NOT AN ALIAS YET. VERIFY: TYPO OR DIFFERENT LEGAL MIDDLE?
              </div>
            </div>}
          </div>
        )}

        {/* ══════════════════════════════════════
            PROFILE BAR (compact)
        ══════════════════════════════════════ */}
        <div style={{ background:"rgba(255,255,255,.02)", border:"1px solid #27272a",
          borderRadius:16, padding:"12px 18px", marginBottom:20 }}>
          <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:16 }}>
            <div className="aut-vt323" style={{ fontSize:16, color:"#71717a" }}>
              SSN: <span style={{ color:"#e5e5e5" }}>{profile.ssnLast4 || "—"}</span>
            </div>
            <div className="aut-vt323" style={{ fontSize:16, color:"#71717a" }}>
              DOB: <span style={{ color:"#e5e5e5" }}>{profile.dob || "—"}</span>
            </div>
            <div className="aut-vt323" style={{ fontSize:16, color:"#71717a" }}>
              CTZ: <span style={{ color:"#e5e5e5" }}>
                {profile.citizenship==="citizen" ? "US CITIZEN" : profile.citizenship==="lpr" ? "LPR" : "NATURALIZED"}
              </span>
            </div>
            <div className="aut-vt323" style={{ fontSize:16, color:"#71717a" }}>
              AGE/SEX: <span style={{ color:"#e5e5e5" }}>{(profile.ageGender||"").toUpperCase()}</span>
            </div>
            {profile.waivers && profile.waivers.length > 0 && (
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {profile.waivers.map(w => (
                  <span key={w} className="aut-badge aut-badge-flagged" style={{ fontSize:6 }}>
                    {w.toUpperCase()} WAIVER
                  </span>
                ))}
              </div>
            )}
            {profile.programs && profile.programs.length > 0 && (
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {profile.programs.map(p => (
                  <span key={p} className="aut-pstart" style={{ fontSize:6, padding:"3px 8px",
                    border:"1px solid rgba(255,204,1,.3)", color:"#FFCC01",
                    background:"rgba(255,204,1,.05)" }}>
                    {p.toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════
            ORGAN CARDS — SECTIONS GRID
        ══════════════════════════════════════ */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
          {sections.map(section => {
            const org    = ORGAN_MAP[section.id] || { organ:section.title, emoji:"📄", tag:"" };
            const items  = section.items.map(i => ({ ...i, displayStatus:getDisplayStatus(i.id) }));
            const sDone  = items.filter(i => i.displayStatus==="complete").length;
            const sFlag  = items.filter(i => i.displayStatus==="flagged").length;
            const sTotal = items.length;
            const allDone = sDone===sTotal && sTotal>0;
            const hasFlag = sFlag>0;
            const pct = sTotal>0 ? Math.round(sDone/sTotal*100) : 0;
            const isOpen  = openSections.has(section.id);

            const cardBorder = hasFlag ? "1px solid rgba(248,113,113,.45)"
              : allDone ? "1px solid rgba(74,222,128,.3)" : "1px solid #3f3f46";

            return (
              <div key={section.id} className="aut-card"
                style={{ border:cardBorder, borderRadius:24 }}>
                <div className="aut-card-inner">
                  {/* Section header */}
                  <div className="aut-section-header" style={{ borderRadius:"24px 24px 0 0" }}
                    onClick={() => toggleSection(section.id)}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ fontSize:24 }}>{org.emoji}</div>
                      <div>
                        <div className="aut-pstart" style={{ fontSize:11, color:"#FFCC01", lineHeight:1.3 }}>
                          {section.title}
                        </div>
                        <div className="aut-vt323" style={{ fontSize:14, color:"#71717a", marginTop:2 }}>
                          {section.reg} • {org.organ}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      {hasFlag && <span className="aut-badge aut-badge-flagged" style={{ fontSize:6 }}>
                        {sFlag} FLAG{sFlag>1?"S":""}
                      </span>}
                      {allDone && <span className="aut-badge aut-badge-complete" style={{ fontSize:6 }}>
                        ✓ VIABLE
                      </span>}
                      <div className="aut-pstart" style={{ fontSize:7, padding:"5px 12px", borderRadius:6,
                        background:"rgba(0,0,0,.5)", color:"#FFCC01" }}>
                        {sDone}/{sTotal}
                      </div>
                      <i className={`fas fa-chevron-${isOpen?"up":"down"}`}
                        style={{ color:"rgba(255,204,1,.5)", fontSize:12 }}></i>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height:4, background:"#1f2937" }}>
                    <div style={{ height:"100%",
                      background:hasFlag?"linear-gradient(90deg,#8B0000,#dc2626)":allDone?"#22c55e":"#FFCC01",
                      width:`${pct}%`, transition:"width .6s cubic-bezier(.2,.6,0,1)" }}/>
                  </div>

                  {/* Items — shown when open */}
                  {isOpen && (
                    <div>
                      {!allDone && (
                        <div style={{ padding:"8px 20px", borderBottom:"1px solid #1f2937",
                          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <div className="aut-vt323" style={{ fontSize:14, color:"#52525b" }}>
                            {sTotal-sDone} item{sTotal-sDone!==1?"s":""} pending examination
                          </div>
                          <button onClick={e => { e.stopPropagation(); onQuickComplete(section.id); }}
                            className="aut-pstart"
                            style={{ fontSize:6, padding:"5px 12px", background:"rgba(74,222,128,.1)",
                              border:"1px solid rgba(74,222,128,.3)", color:"#4ade80",
                              cursor:"pointer", letterSpacing:1 }}>
                            ✓ MARK ALL VIABLE
                          </button>
                        </div>
                      )}

                      {items.map(item => {
                        const st = item.displayStatus;
                        return (
                          <div key={item.id} className="aut-item-row">
                            {/* Status badge — click to cycle */}
                            <div style={{ paddingTop:2, flexShrink:0 }}>
                              <span className={badgeClass(st)}
                                onClick={e => { e.stopPropagation(); handleAutopsyCycle(item.id); }}>
                                {badgeLabel(st)}
                              </span>
                            </div>
                            {/* Label + sub */}
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:"flex", alignItems:"flex-start",
                                justifyContent:"space-between", gap:8 }}>
                                <div style={{ flex:1, minWidth:0 }}>
                                  <div className="aut-pstart" style={{ fontSize:8, lineHeight:1.5,
                                    color:st==="complete"?"rgba(74,222,128,.4)":"#e5e5e5",
                                    textDecoration:st==="complete"?"line-through":"none" }}>
                                    {item.label}
                                  </div>
                                  {item.sub && <div className="aut-vt323" style={{ fontSize:14,
                                    color:"#71717a", marginTop:3, lineHeight:1.25 }}>
                                    {item.sub}
                                  </div>}
                                </div>
                                {/* Skull help button */}
                                <button className="aut-skull-btn"
                                  onClick={e => { e.stopPropagation(); setHelpItem({ item, section }); }}>
                                  <i className="fas fa-skull"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ══════════════════════════════════════
            FINAL ACTIONS
        ══════════════════════════════════════ */}
        <div style={{ marginTop:32, display:"flex", flexDirection:"column",
          gap:12, alignItems:"stretch" }}>
          <div style={{ display:"flex", gap:12 }}>
            <button onClick={handleSubmit}
              className={`aut-submit-btn ${isReady?"ready":"blocked"}`}
              style={{ flex:1 }}>
              <i className={`fas fa-${isReady?"paper-plane":"hourglass-half"}`} style={{ fontSize:18 }}></i>
              {isReady
                ? "SUBMIT TO STATION COMMANDER • PRAY FOR MERCY"
                : `SUBMIT TO SC • ${pendingCount} ITEMS PENDING (GO AHEAD, TRY IT)`}
            </button>
            <button onClick={openGCVoice} className="aut-submit-btn blocked"
              style={{ flex:"none", padding:"20px 28px", borderRadius:24 }}>
              <i className="fas fa-skull" style={{ fontSize:18 }}></i>
              WHAT WOULD GC SAY?
            </button>
          </div>
        </div>

        <div className="aut-pstart" style={{ textAlign:"center", marginTop:28, fontSize:6,
          color:"#27272a", lineHeight:2.2, letterSpacing:1 }}>
          HUMOROUS PARODY FOR ENTERTAINMENT AND TRAINING PURPOSES ONLY.<br/>
          ALL REGULATORY REFERENCES REMAIN ACCURATE.<br/>
          DO NOT ACTUALLY SUBMIT THIS TO MEPS OR YOUR GC.
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          HELP MODAL (skull button)
      ═══════════════════════════════════════════ */}
      {helpItem && (() => {
        const h = helpItem.item.help;
        if (!h) return null;
        return (
          <div className="aut-modal-overlay" onClick={() => setHelpItem(null)}>
            <div className="aut-modal-box" onClick={e => e.stopPropagation()}
              style={{ background:"#0A080C", border:"1px solid #8B0000", borderRadius:24, overflow:"hidden" }}>
              <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid #8B0000",
                background:"#000", display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                <div>
                  <div className="aut-pstart" style={{ fontSize:12, color:"#f87171", lineHeight:1.4 }}>
                    {h.title}
                  </div>
                  <div className="aut-vt323" style={{ fontSize:15, color:"rgba(248,113,113,.5)", marginTop:4 }}>
                    {h.reg}
                  </div>
                </div>
                <button onClick={() => setHelpItem(null)}
                  style={{ background:"none", border:"none", cursor:"pointer",
                    fontSize:28, color:"rgba(248,113,113,.5)", lineHeight:1 }}>×</button>
              </div>
              <div style={{ padding:24 }}>
                <div className="aut-vt323" style={{ fontSize:17, color:"#d4d4d8",
                  lineHeight:1.55, whiteSpace:"pre-line", marginBottom:h.flags?16:0 }}>
                  {h.body}
                </div>
                {h.timing && (
                  <div style={{ background:"rgba(251,191,36,.07)", border:"1px solid rgba(251,191,36,.2)",
                    borderRadius:8, padding:"10px 14px", marginBottom:12 }}>
                    <div className="aut-pstart" style={{ fontSize:7, color:"#fbbf24", marginBottom:4 }}>⏱ TIMING</div>
                    <div className="aut-vt323" style={{ fontSize:16, color:"#fbbf24" }}>{h.timing}</div>
                  </div>
                )}
                {h.flags && h.flags.length > 0 && (
                  <div>
                    <div className="aut-pstart" style={{ fontSize:7, color:"#f87171", marginBottom:8 }}>
                      CAUSES OF DEATH:
                    </div>
                    {h.flags.map((f, i) => (
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

      {/* ═══════════════════════════════════════════
          CONFESSIONAL MODAL
      ═══════════════════════════════════════════ */}
      {confessOpen && (
        <div className="aut-modal-overlay" onClick={() => { setConfessOpen(false); setConfessResp(""); }}>
          <div className="aut-modal-box" onClick={e => e.stopPropagation()}
            style={{ background:"rgba(9,5,5,.98)", border:"1px solid #78350f",
              borderRadius:24, maxWidth:440, padding:28 }}>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <i className="fas fa-pray" style={{ fontSize:40, color:"#fbbf24" }}></i>
              <div className="aut-pstart" style={{ fontSize:14, color:"#fbbf24",
                marginTop:12, letterSpacing:2 }}>THE CONFESSIONAL</div>
              <div className="aut-vt323" style={{ fontSize:16, color:"rgba(251,191,36,.5)", marginTop:6 }}>
                Tell GC what you did. Be honest. They already know.
              </div>
            </div>
            <textarea className="aut-input" rows={4} value={confession}
              onChange={e => setConfession(e.target.value)}
              placeholder="I may have... completed the UF 601-210.15 three weeks early..."/>
            {confessResp && (
              <div style={{ background:"rgba(251,191,36,.07)", border:"1px solid rgba(251,191,36,.2)",
                padding:"10px 14px", margin:"12px 0", borderRadius:8 }}>
                <div className="aut-vt323" style={{ fontSize:16, color:"#fbbf24" }}>
                  GC: "{confessResp}"
                </div>
              </div>
            )}
            <div style={{ display:"flex", gap:8, marginTop:12 }}>
              <button onClick={submitConfession} className="aut-confess-btn"
                style={{ background:"#fbbf24", color:"#000", border:"none" }}>
                <i className="fas fa-fire"></i>
                RECEIVE MY ROAST
              </button>
              <button onClick={() => { setConfessOpen(false); setConfessResp(""); }}
                className="aut-confess-btn"
                style={{ background:"transparent", border:"1px solid #3f3f46", color:"#71717a" }}>
                NEVER MIND I'M FINE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          GC VOICE MODAL
      ═══════════════════════════════════════════ */}
      {gcVoiceOpen && (
        <div className="aut-modal-overlay" onClick={() => setGcVoiceOpen(false)}>
          <div className="aut-modal-box" onClick={e => e.stopPropagation()}
            style={{ background:"#0A080C", border:"1px solid #8B0000",
              borderRadius:24, padding:32 }}>
            <div className="aut-pstart" style={{ fontSize:7, color:"#f87171",
              letterSpacing:4, marginBottom:12 }}>WHAT GC ACTUALLY SAID</div>
            <div className="aut-vt323" style={{ fontSize:22, color:"#e5e5e5",
              lineHeight:1.6, marginBottom:28 }}>"{gcVoiceLine}"</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setGcVoiceLine(GC_VOICE_LINES[Math.floor(Math.random()*GC_VOICE_LINES.length)])}
                className="aut-confess-btn"
                style={{ flex:1, background:"rgba(139,0,0,.2)", border:"2px solid #8B0000", color:"#f87171" }}>
                <i className="fas fa-redo"></i> HEAR ANOTHER
              </button>
              <button onClick={() => setGcVoiceOpen(false)}
                className="aut-confess-btn"
                style={{ flex:1, background:"transparent", border:"1px solid #3f3f46", color:"#71717a" }}>
                I UNDERSTAND
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          SUBMIT TO SC MODAL
      ═══════════════════════════════════════════ */}
      {submitOpen && (
        <div className="aut-modal-overlay" onClick={() => setSubmitOpen(false)}>
          <div className="aut-modal-box" onClick={e => e.stopPropagation()}
            style={{ background:"#0A080C", borderRadius:24, overflow:"hidden",
              border:`2px solid ${isReady?"#FFCC01":"#8B0000"}` }}>
            <div style={{ padding:"24px 28px 20px",
              background:isReady?"linear-gradient(135deg,rgba(255,204,1,.15),rgba(255,204,1,.05))":"rgba(139,0,0,.2)",
              borderBottom:`1px solid ${isReady?"rgba(255,204,1,.3)":"#8B0000"}` }}>
              <div style={{ fontSize:48, textAlign:"center", marginBottom:8 }}>
                {isReady ? "✈️" : "💀"}
              </div>
              <div className="aut-pstart" style={{ textAlign:"center", fontSize:12,
                color:isReady?"#FFCC01":"#f87171", letterSpacing:2, lineHeight:1.5 }}>
                {isReady ? "PACKET SUBMITTED" : "PACKET SUBMITTED ANYWAY"}
              </div>
            </div>
            <div style={{ padding:24 }}>
              <div className="aut-vt323" style={{ fontSize:20, color:"#e5e5e5",
                lineHeight:1.6, marginBottom:20 }}>{submitRoast}</div>
              {!isReady && (
                <div style={{ background:"rgba(139,0,0,.15)", border:"1px solid rgba(139,0,0,.4)",
                  borderRadius:10, padding:"10px 14px", marginBottom:20 }}>
                  <div className="aut-pstart" style={{ fontSize:7, color:"#f87171", marginBottom:6 }}>
                    OUTSTANDING ISSUES:
                  </div>
                  {flagCount>0 && <div className="aut-vt323" style={{ fontSize:15, color:"#fca5a5" }}>
                    ⚠ {flagCount} FLAGGED ITEM{flagCount>1?"S":""} — GC HAS ALREADY NOTICED
                  </div>}
                  {pendingCount>0 && <div className="aut-vt323" style={{ fontSize:15, color:"#fbbf24" }}>
                    — {pendingCount} PENDING ITEM{pendingCount>1?"S":""} — TBD IS NOT A STATUS
                  </div>}
                </div>
              )}
              <button onClick={() => setSubmitOpen(false)}
                className="aut-submit-btn ready" style={{ width:"100%", borderRadius:16 }}>
                <i className="fas fa-check"></i>
                {isReady ? "ACKNOWLEDGED — CLEARED FOR MEPS" : "CLOSE AND FIX IT"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

Object.assign(window, { AutopsyMode });
