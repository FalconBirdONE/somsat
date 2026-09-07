"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

/**
 * ============================================================================
 * SOMAIYASAT / SOMAIYAPOD MISSION CONTROL
 * TACTICAL NAVIGATION HUB // ORBITAL INSERTION & ATTITUDE VECTORING
 * ----------------------------------------------------------------------------
 * Specifications:
 * - Design System: Monospaced ("JetBrains Mono", monospace), 0px border radius,
 *   pure black (#000000), 1px hairlines (rgba(255,255,255,0.15)),
 *   #00FF41 nominal, #FFB700 caution, #FF3333 critical.
 * - Left Column (1.1fr): 2D Orbit Schematic (SVG), Ephemeris Grid,
 *   Maneuver Planner (Pattern A: Click-to-Edit), Pass-Linked Maneuvers (Pattern C: Row Drawer).
 * - Right Column (0.9fr): ADCS Vectoring (Pattern B: Segmented Controls),
 *   Reaction Wheel Desaturation (Pattern B: Direct Sliders & Toggles).
 * ============================================================================
 */

export default function TacticalNavPage() {
  // ==========================================================================
  // 1. GLOBAL STATUS & TOAST NOTIFICATIONS
  // ==========================================================================
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((msg, type = "nominal") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ text: msg, type, time: new Date().toISOString().substring(11, 19) });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  // ==========================================================================
  // 2. ORBIT & SATELLITE REAL-TIME TELEMETRY STATE
  // ==========================================================================
  const [orbitAngle, setOrbitAngle] = useState(45); // Degrees along ellipse
  const [altitude, setAltitude] = useState(423.4);
  const [raan, setRaan] = useState(45.2);
  const [nextAosSec, setNextAosSec] = useState(420); // Seconds to AOS

  // ADCS Streaming Quaternion ($Q_0, Q_1, Q_2, Q_3$)
  const [quaternions, setQuaternions] = useState({
    q0: 0.7071,
    q1: 0.0024,
    q2: -0.0018,
    q3: 0.7071,
  });

  // ADCS Mode State (Pattern B: Segmented Control)
  const [adcsMode, setAdcsMode] = useState("NADIR-LOCK"); // SUN-POINTING | NADIR-LOCK | INERTIAL

  // ==========================================================================
  // 3. MANEUVER PLANNER STATE (PATTERN A: CLICK-TO-EDIT)
  // ==========================================================================
  const [isPlannerOpen, setIsPlannerOpen] = useState(true);
  const [burnTarget, setBurnTarget] = useState("APOGEE BOOST (PERIAPSIS)");
  
  // Click-to-edit Burn Duration (30 <= t <= 300)
  const [burnDuration, setBurnDuration] = useState(120);
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [tempDuration, setTempDuration] = useState("120");
  const [durationError, setDurationError] = useState("");

  // Click-to-edit Ignition Epoch
  const [ignitionEpoch, setIgnitionEpoch] = useState("16:45:00 UTC");
  const [isEditingEpoch, setIsEditingEpoch] = useState(false);
  const [tempEpoch, setTempEpoch] = useState("16:45:00 UTC");

  // Calculated Delta-V (m/s) based on duration (sub-1W ion micro-thruster model)
  const calculatedDeltaV = (burnDuration * 0.0425).toFixed(3);

  // ==========================================================================
  // 4. PASS-LINKED MANEUVERS (PATTERN C: EXPANDABLE ROW DRAWER)
  // ==========================================================================
  const [expandedPassId, setExpandedPassId] = useState(null);
  const [passQueue, setPassQueue] = useState([
    {
      id: "PASS-1042",
      station: "GS-01 MUMBAI",
      aos: "14:22:10 UTC",
      duration: "09:42",
      maxEl: "68.4°",
      status: "ARMED",
      overrideType: "AUTO-SCHEDULED",
      uplinkLocked: true,
      priority: "PRIORITY-1 (CRITICAL)",
    },
    {
      id: "PASS-1043",
      station: "SVALBARD-04",
      aos: "15:58:30 UTC",
      duration: "11:15",
      maxEl: "84.1°",
      status: "QUEUED",
      overrideType: "AUTO-SCHEDULED",
      uplinkLocked: false,
      priority: "PRIORITY-2 (NOMINAL)",
    },
    {
      id: "PASS-1044",
      station: "KIRUNA-NORTH",
      aos: "17:34:00 UTC",
      duration: "08:20",
      maxEl: "42.0°",
      status: "STANDBY",
      overrideType: "INHIBIT BURN",
      uplinkLocked: true,
      priority: "PRIORITY-3 (OPPORTUNISTIC)",
    },
  ]);

  // ==========================================================================
  // 5. REACTION WHEEL DESATURATION STATE (PATTERN B: SLIDERS & TOGGLES)
  // ==========================================================================
  const [desatStrategy, setDesatStrategy] = useState("MAGNETIC TORQUER DUMP (MTQ)");
  const [autoDump, setAutoDump] = useState(true);
  const [wheels, setWheels] = useState({
    rwX: { rpm: 4280, saturation: 71.3, trim: 0 },
    rwY: { rpm: 5120, saturation: 85.3, trim: 0 }, // Caution (>80%)
    rwZ: { rpm: 5640, saturation: 94.0, trim: 0 }, // Critical (>=90%)
  });

  // ==========================================================================
  // 6. REAL-TIME SIMULATION TICKER
  // ==========================================================================
  useEffect(() => {
    const interval = setInterval(() => {
      // Orbit schematic progression
      setOrbitAngle((prev) => (prev + 0.8) % 360);

      // Ephemeris micro-drift
      setAltitude((prev) => Number((423.4 + Math.sin(Date.now() / 8000) * 1.8).toFixed(1)));
      setRaan((prev) => Number((45.2 + (Math.random() * 0.02 - 0.01)).toFixed(2)));
      setNextAosSec((prev) => (prev > 0 ? prev - 1 : 540));

      // Quaternion micro-drift
      setQuaternions((prev) => ({
        q0: Number((0.7071 + (Math.random() * 0.0008 - 0.0004)).toFixed(4)),
        q1: Number((prev.q1 + (Math.random() * 0.0006 - 0.0003)).toFixed(4)),
        q2: Number((prev.q2 + (Math.random() * 0.0006 - 0.0003)).toFixed(4)),
        q3: Number((0.7071 + (Math.random() * 0.0008 - 0.0004)).toFixed(4)),
      }));

      // Reaction wheel saturation drift
      setWheels((prev) => {
        const jitter = (val) => Math.max(10, Math.min(99, val + (Math.random() * 0.4 - 0.2)));
        return {
          rwX: { ...prev.rwX, saturation: Number(jitter(prev.rwX.saturation).toFixed(1)) },
          rwY: { ...prev.rwY, saturation: Number(jitter(prev.rwY.saturation).toFixed(1)) },
          rwZ: { ...prev.rwZ, saturation: Number(jitter(prev.rwZ.saturation).toFixed(1)) },
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format AOS seconds
  const formatAosCountdown = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `T-${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} UTC`;
  };

  // ==========================================================================
  // 7. MANEUVER PLANNER HANDLERS (PATTERN A)
  // ==========================================================================
  const handleDurationApply = () => {
    const val = parseInt(tempDuration, 10);
    if (isNaN(val) || val < 30 || val > 300) {
      setDurationError("DURATION MUST BE BETWEEN 30s AND 300s");
      return;
    }
    setBurnDuration(val);
    setIsEditingDuration(false);
    setDurationError("");
    showToast(`BURN DURATION RE-CONFIGURED TO ${val} SECONDS`);
  };

  const handleDurationCancel = () => {
    setTempDuration(String(burnDuration));
    setIsEditingDuration(false);
    setDurationError("");
  };

  const handleEpochApply = () => {
    if (!tempEpoch.trim()) return;
    setIgnitionEpoch(tempEpoch.trim());
    setIsEditingEpoch(false);
    showToast(`IGNITION EPOCH UPDATED TO [ ${tempEpoch.trim()} ]`);
  };

  const handleCommitManeuver = () => {
    showToast(
      `FLIGHT PLAN COMMITTED // ${burnTarget} · Δt: ${burnDuration}s (ΔV: ${calculatedDeltaV} m/s) @ ${ignitionEpoch}`,
      "nominal"
    );
  };

  // ==========================================================================
  // 8. PASS-LINKED DRAWER HANDLERS (PATTERN C)
  // ==========================================================================
  const togglePassDrawer = (passId) => {
    setExpandedPassId((prev) => (prev === passId ? null : passId));
  };

  const updatePassConfig = (passId, field, value) => {
    setPassQueue((prev) =>
      prev.map((p) => (p.id === passId ? { ...p, [field]: value } : p))
    );
    showToast(`PASS [${passId}] CONFIGURATION UPDATED: ${field.toUpperCase()} -> ${value}`);
  };

  // ==========================================================================
  // 9. REACTION WHEEL DESATURATION HANDLERS (PATTERN B)
  // ==========================================================================
  const handleDumpWheel = (wheelKey) => {
    setWheels((prev) => {
      const current = prev[wheelKey];
      const newSat = Math.max(25, current.saturation - 20);
      const newRpm = Math.floor(current.rpm * 0.7);
      return {
        ...prev,
        [wheelKey]: {
          ...current,
          saturation: Number(newSat.toFixed(1)),
          rpm: newRpm,
        },
      };
    });
    showToast(`DESATURATION COMMAND EXECUTED // ${wheelKey.toUpperCase()} DUMPED -20% SATURATION`);
  };

  const getSaturationColor = (val) => {
    if (val >= 90) return "#FF3333";
    if (val >= 80) return "#FFB700";
    return "#00FF41";
  };

  // Calculate 2D satellite coordinates on ellipse
  const rad = (orbitAngle * Math.PI) / 180;
  const satX = 180 + 130 * Math.cos(rad);
  const satY = 110 + 65 * Math.sin(rad);

  // ==========================================================================
  // 10. STYLES (MONOCHROME AEROSPACE DESIGN SYSTEM - 0PX RADIUS)
  // ==========================================================================
  const S = {
    container: {
      backgroundColor: "#000000",
      color: "#FFFFFF",
      fontFamily: '"JetBrains Mono", "Space Mono", "IBM Plex Mono", monospace',
      textTransform: "uppercase",
      letterSpacing: "0.09em",
      minHeight: "100vh",
      padding: "24px",
      boxSizing: "border-box",
    },
    panel: {
      backgroundColor: "#04060A",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      borderRadius: "0px",
      padding: "18px",
      marginBottom: "20px",
    },
    subPanel: {
      backgroundColor: "#080808",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      borderRadius: "0px",
      padding: "14px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexWrap: "wrap",
      gap: "16px",
      borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
      paddingBottom: "16px",
      marginBottom: "20px",
    },
    btn: {
      backgroundColor: "transparent",
      color: "#FFFFFF",
      border: "1px solid rgba(255, 255, 255, 0.25)",
      borderRadius: "0px",
      padding: "6px 12px",
      fontSize: "11px",
      fontFamily: "inherit",
      cursor: "pointer",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },
    btnActive: {
      backgroundColor: "rgba(0, 255, 65, 0.12)",
      color: "#00FF41",
      border: "1px solid #00FF41",
      borderRadius: "0px",
      padding: "6px 14px",
      fontSize: "11px",
      fontWeight: "bold",
      cursor: "pointer",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },
    btnCommit: {
      backgroundColor: "#00FF41",
      color: "#000000",
      border: "1px solid #00FF41",
      borderRadius: "0px",
      padding: "10px 18px",
      fontSize: "12px",
      fontWeight: "bold",
      fontFamily: "inherit",
      cursor: "pointer",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      width: "100%",
      marginTop: "14px",
    },
    input: {
      backgroundColor: "#000000",
      color: "#FFFFFF",
      border: "1px solid #00FF41",
      borderRadius: "0px",
      padding: "5px 8px",
      fontSize: "12px",
      fontFamily: "inherit",
      letterSpacing: "0.08em",
      outline: "none",
    },
    select: {
      backgroundColor: "#000000",
      color: "#FFFFFF",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "0px",
      padding: "6px 10px",
      fontSize: "11px",
      fontFamily: "inherit",
      outline: "none",
      textTransform: "uppercase",
      width: "100%",
    },
  };

  return (
    <div style={S.container}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "16px",
            right: "16px",
            zIndex: 9999,
            backgroundColor: "#000000",
            border: `1px solid ${toast.type === "error" ? "#FF3333" : "#00FF41"}`,
            color: toast.type === "error" ? "#FF3333" : "#00FF41",
            padding: "12px 18px",
            fontSize: "11px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span>[{toast.time} UTC]</span>
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header Strip */}
      <header style={S.header}>
        <div>
          <div style={{ fontSize: "10px", color: "#5A5A5F", marginBottom: "4px" }}>
            MISSION CONTROL // TACTICAL FLIGHT DIRECTOR CONSOLE
          </div>
          <h1 style={{ fontSize: "20px", margin: "0 0 4px 0", color: "#FFFFFF", fontWeight: "bold" }}>
            TACTICAL NAVIGATION HUB // ORBITAL INSERTION &amp; ATTITUDE VECTORING
          </h1>
          <div style={{ fontSize: "11px", color: "#8E8E93" }}>
            TARGET VEHICLE: <span style={{ color: "#FFFFFF" }}>SAT-001 (SOMAIYASAT 5CM POCKETQUBE)</span> · FLIGHT PLAN: FP-2026-A
          </div>
        </div>

        {/* Metadata Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ ...S.btn, borderColor: "rgba(255,255,255,0.2)", fontSize: "10px" }}>
            OPERATOR: <span style={{ color: "#00FF41" }}>SHARDUL SHINDE</span>
          </div>
          <div style={{ ...S.btn, borderColor: "#00FF41", color: "#00FF41", fontSize: "10px" }}>
            ADCS: {adcsMode}
          </div>
          <div style={{ ...S.btn, borderColor: "#00FF41", color: "#00FF41", fontSize: "10px" }}>
            [ TLS-ENCRYPTED ]
          </div>
        </div>
      </header>

      {/* 2-Column Desktop Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
          gap: "20px",
        }}
      >
        {/* ==================================================================
            LEFT COLUMN: Orbit Tracking & Maneuver Ops (1.1fr)
           ================================================================== */}
        <div>
          {/* 1. 2D Orbit Schematic (SVG) */}
          <section style={S.panel}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "10px", color: "#8E8E93" }}>
              <span>2D ORBITAL INSERTION &amp; GROUND TRACK</span>
              <span style={{ color: "#00FF41" }}>[ REAL-TIME VECTORS ]</span>
            </div>

            <div style={{ backgroundColor: "#080808", border: "1px solid rgba(255,255,255,0.1)", height: "220px", position: "relative" }}>
              <svg viewBox="0 0 360 220" style={{ width: "100%", height: "100%" }}>
                {/* Central Earth geo-reference body */}
                <circle cx="180" cy="110" r="42" fill="#04060A" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                <circle cx="180" cy="110" r="46" fill="none" stroke="rgba(0,255,65,0.2)" strokeWidth="1" strokeDasharray="2 4" />
                <text x="180" y="114" fill="#8E8E93" fontSize="8" textAnchor="middle">
                  EARTH (GEO-REF)
                </text>

                {/* Mumbai Ground Station GS-01 target */}
                <circle cx="195" cy="98" r="3" fill="#00FF41" />
                <text x="203" y="101" fill="#00FF41" fontSize="7">
                  GS-01 MUMBAI
                </text>

                {/* Dashed orbital trajectory ellipse */}
                <ellipse
                  cx="180"
                  cy="110"
                  rx="130"
                  ry="65"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1.2"
                  strokeDasharray="4 6"
                />

                {/* Downlink Ray from Satellite to GS-01 */}
                <line
                  x1={satX}
                  y1={satY}
                  x2="195"
                  y2="98"
                  stroke="rgba(0,255,65,0.4)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />

                {/* Moving Satellite Node */}
                <circle cx={satX} cy={satY} r="5" fill="#00FF41" />
                <circle cx={satX} cy={satY} r="9" fill="none" stroke="#00FF41" strokeWidth="1" opacity="0.6" />
                <text x={satX + 8} y={satY + 3} fill="#FFFFFF" fontSize="8" fontWeight="bold">
                  SAT-001
                </text>
              </svg>
            </div>
          </section>

          {/* 2. Orbital Ephemeris Telemetry Grid */}
          <section style={{ ...S.panel, padding: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", textAlign: "center" }}>
              <div style={S.subPanel}>
                <div style={{ fontSize: "9px", color: "#8E8E93" }}>ALTITUDE</div>
                <div style={{ fontSize: "14px", color: "#00FF41", fontWeight: "bold", marginTop: "4px" }}>
                  {altitude} KM
                </div>
              </div>
              <div style={S.subPanel}>
                <div style={{ fontSize: "9px", color: "#8E8E93" }}>INCLINATION</div>
                <div style={{ fontSize: "14px", color: "#FFFFFF", fontWeight: "bold", marginTop: "4px" }}>
                  97.4° SSO
                </div>
              </div>
              <div style={S.subPanel}>
                <div style={{ fontSize: "9px", color: "#8E8E93" }}>RAAN</div>
                <div style={{ fontSize: "14px", color: "#FFFFFF", fontWeight: "bold", marginTop: "4px" }}>
                  {raan}°
                </div>
              </div>
              <div style={S.subPanel}>
                <div style={{ fontSize: "9px", color: "#8E8E93" }}>NEXT AOS</div>
                <div style={{ fontSize: "14px", color: "#FFB700", fontWeight: "bold", marginTop: "4px" }}>
                  {formatAosCountdown(nextAosSec)}
                </div>
              </div>
            </div>
          </section>

          {/* 3. Maneuver Planner (Pattern A: Click-to-Edit) */}
          <section style={S.panel}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <span style={{ fontSize: "11px", fontWeight: "bold", color: "#FFFFFF" }}>
                TACTICAL MANEUVER PLANNER (PATTERN A: CLICK-TO-EDIT)
              </span>
              <button
                type="button"
                onClick={() => setIsPlannerOpen(!isPlannerOpen)}
                style={{ ...S.btn, borderColor: "#00FF41", color: "#00FF41" }}
              >
                {isPlannerOpen ? "[ COLLAPSE - ]" : "[ PLAN BURN + ]"}
              </button>
            </div>

            {isPlannerOpen && (
              <div style={S.subPanel}>
                {/* Burn Target Dropdown */}
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "10px", color: "#8E8E93", marginBottom: "4px" }}>TARGET MANEUVER REGIME</div>
                  <select
                    value={burnTarget}
                    onChange={(e) => setBurnTarget(e.target.value)}
                    style={S.select}
                  >
                    <option value="APOGEE BOOST (PERIAPSIS)">APOGEE BOOST (PERIAPSIS BURN)</option>
                    <option value="CIRCULARIZATION (500 KM)">CIRCULARIZATION (500 KM SSO)</option>
                    <option value="PHASING & INCLINATION TRIM">PHASING &amp; INCLINATION TRIM</option>
                    <option value="DEORBIT INSERTION">DEORBIT PASS INSERTION</option>
                  </select>
                </div>

                {/* Click-to-Edit Burn Duration */}
                <div style={{ marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px" }}>
                  <div style={{ fontSize: "10px", color: "#8E8E93", marginBottom: "4px" }}>
                    BURN DURATION [Δt: 30s – 300s]
                  </div>

                  {!isEditingDuration ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "16px", color: "#00FF41", fontWeight: "bold" }}>
                        {burnDuration} SECONDS
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setTempDuration(String(burnDuration));
                          setIsEditingDuration(true);
                        }}
                        style={S.btn}
                      >
                        [ EDIT ✎ ]
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                          type="number"
                          value={tempDuration}
                          onChange={(e) => setTempDuration(e.target.value)}
                          style={{ ...S.input, width: "120px" }}
                          min={30}
                          max={300}
                        />
                        <button type="button" onClick={handleDurationApply} style={S.btnActive}>
                          [ ✓ APPLY ]
                        </button>
                        <button type="button" onClick={handleDurationCancel} style={S.btn}>
                          [ ✕ CANCEL ]
                        </button>
                      </div>
                      {durationError && (
                        <div style={{ color: "#FF3333", fontSize: "10px", marginTop: "6px" }}>
                          [!] {durationError}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Click-to-Edit Ignition Epoch */}
                <div style={{ marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px" }}>
                  <div style={{ fontSize: "10px", color: "#8E8E93", marginBottom: "4px" }}>IGNITION EPOCH (UTC)</div>
                  {!isEditingEpoch ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "14px", color: "#FFFFFF" }}>{ignitionEpoch}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setTempEpoch(ignitionEpoch);
                          setIsEditingEpoch(true);
                        }}
                        style={S.btn}
                      >
                        [ EDIT ✎ ]
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        type="text"
                        value={tempEpoch}
                        onChange={(e) => setTempEpoch(e.target.value)}
                        style={{ ...S.input, width: "160px" }}
                      />
                      <button type="button" onClick={handleEpochApply} style={S.btnActive}>
                        [ ✓ APPLY ]
                      </button>
                      <button type="button" onClick={() => setIsEditingEpoch(false)} style={S.btn}>
                        [ ✕ CANCEL ]
                      </button>
                    </div>
                  )}
                </div>

                {/* Calculated Output */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginTop: "10px" }}>
                  <span style={{ color: "#8E8E93" }}>PREDICTED DELTA-V (ΔV):</span>
                  <span style={{ color: "#00FF41", fontWeight: "bold" }}>+{calculatedDeltaV} M/S</span>
                </div>

                {/* Commit Action */}
                <button type="button" onClick={handleCommitManeuver} style={S.btnCommit}>
                  [ COMMIT MANEUVER TO FLIGHT PLAN ]
                </button>
              </div>
            )}
          </section>

          {/* 4. Pass-Linked Maneuvers (Pattern C: Expandable Row Drawer) */}
          <section style={S.panel}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "11px", fontWeight: "bold" }}>
              <span>PASS-LINKED MANEUVERS (PATTERN C: ROW DRAWER)</span>
              <span style={{ fontSize: "10px", color: "#8E8E93" }}>CLICK ROW TO CONFIGURE</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {passQueue.map((p) => {
                const isExpanded = expandedPassId === p.id;
                return (
                  <div key={p.id} style={{ border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "#080808" }}>
                    {/* Header Row */}
                    <div
                      onClick={() => togglePassDrawer(p.id)}
                      style={{
                        padding: "10px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        backgroundColor: isExpanded ? "rgba(0,255,65,0.06)" : "transparent",
                      }}
                    >
                      <div>
                        <span style={{ color: "#00FF41", fontWeight: "bold", fontSize: "12px" }}>{p.id}</span>
                        <span style={{ color: "#FFFFFF", marginLeft: "10px", fontSize: "11px" }}>{p.station}</span>
                      </div>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center", fontSize: "10px" }}>
                        <span style={{ color: "#8E8E93" }}>AOS: {p.aos}</span>
                        <span style={{ color: p.status === "ARMED" ? "#00FF41" : "#FFB700" }}>[{p.status}]</span>
                        <span style={{ color: "#8E8E93" }}>{isExpanded ? "▲" : "▼"}</span>
                      </div>
                    </div>

                    {/* Inline Expandable Drawer (Pattern C) */}
                    {isExpanded && (
                      <div
                        style={{
                          padding: "14px",
                          borderTop: "1px solid rgba(255,255,255,0.1)",
                          backgroundColor: "#04060A",
                        }}
                      >
                        <div style={{ fontSize: "10px", color: "#8E8E93", marginBottom: "10px" }}>
                          INLINE PASS CONFIGURATION DRAWER (ZERO MODAL NAVIGATION)
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          <div>
                            <div style={{ fontSize: "9px", color: "#5A5A5F", marginBottom: "4px" }}>OVERRIDE TYPE</div>
                            <select
                              value={p.overrideType}
                              onChange={(e) => updatePassConfig(p.id, "overrideType", e.target.value)}
                              style={S.select}
                            >
                              <option value="AUTO-SCHEDULED">AUTO-SCHEDULED</option>
                              <option value="MANUAL FORCE-FIRE">MANUAL FORCE-FIRE</option>
                              <option value="INHIBIT BURN">INHIBIT BURN</option>
                            </select>
                          </div>

                          <div>
                            <div style={{ fontSize: "9px", color: "#5A5A5F", marginBottom: "4px" }}>EXEC PRIORITY</div>
                            <select
                              value={p.priority}
                              onChange={(e) => updatePassConfig(p.id, "priority", e.target.value)}
                              style={S.select}
                            >
                              <option value="PRIORITY-1 (CRITICAL)">PRIORITY-1 (CRITICAL)</option>
                              <option value="PRIORITY-2 (NOMINAL)">PRIORITY-2 (NOMINAL)</option>
                              <option value="PRIORITY-3 (OPPORTUNISTIC)">PRIORITY-3 (OPPORTUNISTIC)</option>
                            </select>
                          </div>
                        </div>

                        <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "10px", color: "#8E8E93" }}>UPLINK INTERLOCK:</span>
                          <button
                            type="button"
                            onClick={() => updatePassConfig(p.id, "uplinkLocked", !p.uplinkLocked)}
                            style={{
                              ...S.btn,
                              borderColor: p.uplinkLocked ? "#00FF41" : "#FF3333",
                              color: p.uplinkLocked ? "#00FF41" : "#FF3333",
                            }}
                          >
                            {p.uplinkLocked ? "[ UPLINK LOCKED ✓ ]" : "[ UPLINK UNLOCKED ⚠ ]"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ==================================================================
            RIGHT COLUMN: ADCS & Reaction Wheel Management (0.9fr)
           ================================================================== */}
        <div>
          {/* 1. ADCS Vectoring (Pattern B: Direct Segmented Controls) */}
          <section style={S.panel}>
            <div style={{ fontSize: "11px", fontWeight: "bold", color: "#FFFFFF", marginBottom: "12px" }}>
              ADCS ATTITUDE VECTORING (PATTERN B: DIRECT CONTROLS)
            </div>

            {/* 3-Way Instant Segmented Toggle */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
              {["SUN-POINTING", "NADIR-LOCK", "INERTIAL"].map((mode) => {
                const isActive = adcsMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setAdcsMode(mode);
                      showToast(`ADCS MODE SWITCHED -> [ ${mode} ]`);
                    }}
                    style={isActive ? S.btnActive : S.btn}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>

            {/* Streaming Quaternion Matrix */}
            <div style={S.subPanel}>
              <div style={{ fontSize: "10px", color: "#8E8E93", marginBottom: "8px" }}>
                STREAMING ATTITUDE QUATERNION MATRIX
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: "9px", color: "#5A5A5F" }}>Q0 (W)</div>
                  <div style={{ fontSize: "13px", color: "#00FF41", fontWeight: "bold" }}>{quaternions.q0}</div>
                </div>
                <div>
                  <div style={{ fontSize: "9px", color: "#5A5A5F" }}>Q1 (X)</div>
                  <div style={{ fontSize: "13px", color: "#FFFFFF" }}>{quaternions.q1}</div>
                </div>
                <div>
                  <div style={{ fontSize: "9px", color: "#5A5A5F" }}>Q2 (Y)</div>
                  <div style={{ fontSize: "13px", color: "#FFFFFF" }}>{quaternions.q2}</div>
                </div>
                <div>
                  <div style={{ fontSize: "9px", color: "#5A5A5F" }}>Q3 (Z)</div>
                  <div style={{ fontSize: "13px", color: "#00FF41", fontWeight: "bold" }}>{quaternions.q3}</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#8E8E93" }}>
              <span>POINTING ACCURACY: <strong style={{ color: "#00FF41" }}>0.14° (LOCKED)</strong></span>
              <span>BODY RATE: <strong style={{ color: "#FFFFFF" }}>0.02°/S</strong></span>
            </div>
          </section>

          {/* 2. Reaction Wheel Desaturation (Pattern B: Direct Sliders & Toggles) */}
          <section style={S.panel}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <span style={{ fontSize: "11px", fontWeight: "bold", color: "#FFFFFF" }}>
                REACTION WHEEL DESATURATION (3-AXIS)
              </span>
              <button
                type="button"
                onClick={() => {
                  setAutoDump(!autoDump);
                  showToast(`AUTO-DUMP TOGGLED -> ${!autoDump ? "ENABLED" : "DISABLED"}`);
                }}
                style={{
                  ...S.btn,
                  borderColor: autoDump ? "#00FF41" : "#8E8E93",
                  color: autoDump ? "#00FF41" : "#8E8E93",
                  fontSize: "10px",
                }}
              >
                AUTO-DUMP: {autoDump ? "[ ON ]" : "[ OFF ]"}
              </button>
            </div>

            {/* Strategy Selector */}
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "9px", color: "#5A5A5F", marginBottom: "4px" }}>DESATURATION STRATEGY</div>
              <select
                value={desatStrategy}
                onChange={(e) => {
                  setDesatStrategy(e.target.value);
                  showToast(`DESAT STRATEGY CHANGED: ${e.target.value}`);
                }}
                style={S.select}
              >
                <option value="MAGNETIC TORQUER DUMP (MTQ)">MAGNETIC TORQUER DUMP (MTQ COILS)</option>
                <option value="THRUSTER PULSE JETTISON">THRUSTER PULSE JETTISON</option>
                <option value="GRAVITY-GRADIENT HYBRID">GRAVITY-GRADIENT HYBRID DUMP</option>
              </select>
            </div>

            {/* 3-Axis Reaction Wheels */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { key: "rwX", label: "RW-X (ROLL AXIS)", data: wheels.rwX },
                { key: "rwY", label: "RW-Y (PITCH AXIS)", data: wheels.rwY },
                { key: "rwZ", label: "RW-Z (YAW AXIS)", data: wheels.rwZ },
              ].map(({ key, label, data }) => {
                const satColor = getSaturationColor(data.saturation);
                return (
                  <div key={key} style={S.subPanel}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "bold", color: "#FFFFFF" }}>{label}</span>
                      <span style={{ fontSize: "11px", color: satColor, fontWeight: "bold" }}>
                        {data.rpm} RPM · {data.saturation}%
                      </span>
                    </div>

                    {/* Horizontal Bar Meter with Thresholds (<80%, 80-89%, >=90%) */}
                    <div style={{ backgroundColor: "#000000", height: "8px", width: "100%", marginBottom: "10px" }}>
                      <div
                        style={{
                          backgroundColor: satColor,
                          height: "100%",
                          width: `${data.saturation}%`,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>

                    {/* Inline Trim Slider & Action */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={data.saturation}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setWheels((prev) => ({
                            ...prev,
                            [key]: { ...prev[key], saturation: val },
                          }));
                        }}
                        style={{ flex: 1, accentColor: satColor }}
                      />
                      <button
                        type="button"
                        onClick={() => handleDumpWheel(key)}
                        style={{ ...S.btn, borderColor: satColor, color: satColor, fontSize: "10px" }}
                      >
                        [ DUMP ▾ ]
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
