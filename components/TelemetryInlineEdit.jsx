"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

/**
 * ============================================================================
 * SOMAIYASAT / SOMAIYAPOD MISSION CONTROL TELEMETRY
 * IN-PAGE EDITING MODULE (PATTERN A: CLICK-TO-EDIT)
 * ----------------------------------------------------------------------------
 * Specifications:
 * - Design System: Monospaced, zero border-radius, pure black (#000000),
 *   1px hairline borders (rgba(255,255,255,0.15)), #00FF41 nominal,
 *   #FFB700 caution, #FF3333 critical.
 * - Component A: Satellite Identifier Nickname Click-to-Edit.
 * - Component B: RF Comm Link Downlink Frequency Click-to-Edit with
 *   UHF amateur satellite band validation (435.000 - 438.000 MHz).
 * - Continuous Background Telemetry: Real-time uninterrupted streaming of
 *   frames, RSSI, SNR, Sub-1W power, Doppler shift, and packet log.
 * ============================================================================
 */

export default function TelemetryInlineEdit() {
  // ==========================================================================
  // 1. EDITABLE STATE: SATELLITE IDENTIFIER (COMPONENT A)
  // ==========================================================================
  const [satelliteId, setSatelliteId] = useState("SOMAIYASAT-1");
  const [isEditingId, setIsEditingId] = useState(false);
  const [tempId, setTempId] = useState("SOMAIYASAT-1");
  const [idError, setIdError] = useState("");
  const idInputRef = useRef(null);

  // ==========================================================================
  // 2. EDITABLE STATE: RF COMM DOWNLINK FREQUENCY (COMPONENT B)
  // ==========================================================================
  const [frequency, setFrequency] = useState("437.525");
  const [isEditingFreq, setIsEditingFreq] = useState(false);
  const [tempFreq, setTempFreq] = useState("437.525");
  const [freqError, setFreqError] = useState("");
  const freqInputRef = useRef(null);

  // ==========================================================================
  // 3. TOAST & NOTIFICATION SYSTEM
  // ==========================================================================
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((msg, type = "nominal") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage({ text: msg, type, timestamp: new Date().toISOString().substring(11, 19) });
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  // ==========================================================================
  // 4. CONTINUOUS REAL-TIME TELEMETRY FEED (RUNS UNINTERRUPTED)
  // ==========================================================================
  const [telemetry, setTelemetry] = useState({
    ttcFrameCount: 14289,
    m17PacketCount: 8521,
    sstvLineCount: 1280,
    rssi: -102.4,
    snr: 14.2,
    powerWatts: 0.782,
    busVoltage: 3.338,
    busCurrentMa: 234.3,
    batterySoc: 88.6,
    dopplerShiftKhz: 1.84,
    carrierLock: true,
    metSeconds: 154829, // Mission Elapsed Time in seconds
  });

  const [packetLogs, setPacketLogs] = useState([
    { id: 1, time: "14:32:01", channel: "TT&C", hex: "4D 31 37 01 8A FC", status: "VALID CRC" },
    { id: 2, time: "14:32:03", channel: "M17", hex: "53 4F 4D 53 41 54", status: "DECODED" },
    { id: 3, time: "14:32:05", channel: "HK-V", hex: "03 4E 02 A1 12 00", status: "SYNCHRONIZED" },
  ]);

  // Telemetry stream generator (updates every 1000ms independently of UI edits)
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const nextTtc = prev.ttcFrameCount + (Math.random() > 0.3 ? 1 : 0);
        const nextM17 = prev.m17PacketCount + (Math.random() > 0.5 ? 1 : 0);
        const nextSstv = prev.sstvLineCount + (Math.random() > 0.4 ? 2 : 0);

        // Realistic RF noise jitter
        const rssiJitter = Number((prev.rssi + (Math.random() * 0.8 - 0.4)).toFixed(1));
        const snrJitter = Number((prev.snr + (Math.random() * 0.4 - 0.2)).toFixed(1));
        const powerJitter = Number((0.78 + (Math.random() * 0.03 - 0.015)).toFixed(3));
        const dopplerJitter = Number((prev.dopplerShiftKhz - 0.01).toFixed(2));

        return {
          ...prev,
          ttcFrameCount: nextTtc,
          m17PacketCount: nextM17,
          sstvLineCount: nextSstv,
          rssi: Math.min(-96, Math.max(-108, rssiJitter)),
          snr: Math.min(18, Math.max(10, snrJitter)),
          powerWatts: powerJitter,
          busVoltage: Number((3.34 + (Math.random() * 0.02 - 0.01)).toFixed(3)),
          busCurrentMa: Number((powerJitter / 3.34 * 1000).toFixed(1)),
          batterySoc: Number((prev.batterySoc - 0.001).toFixed(2)),
          dopplerShiftKhz: dopplerJitter < -2.5 ? 2.5 : dopplerJitter,
          metSeconds: prev.metSeconds + 1,
        };
      });

      // Periodic packet feed simulation
      if (Math.random() > 0.6) {
        const now = new Date().toISOString().substring(11, 19);
        const types = ["TT&C", "M17", "SSTV-HDR", "PWR-RAIL", "RF-BEACON"];
        const type = types[Math.floor(Math.random() * types.length)];
        const randomHex = Array.from({ length: 6 }, () =>
          Math.floor(Math.random() * 256)
            .toString(16)
            .toUpperCase()
            .padStart(2, "0")
        ).join(" ");

        setPacketLogs((prev) => [
          {
            id: Date.now(),
            time: now,
            channel: type,
            hex: randomHex,
            status: "CRC-32 OK",
          },
          ...prev.slice(0, 4),
        ]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format seconds to MET (Days:Hours:Mins:Secs)
  const formatMet = (totalSec) => {
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `T+${String(d).padStart(2, "0")}D:${String(h).padStart(2, "0")}H:${String(m).padStart(2, "0")}M:${String(s).padStart(2, "0")}S`;
  };

  // ==========================================================================
  // 5. HANDLERS FOR SATELLITE ID (COMPONENT A)
  // ==========================================================================
  const startEditId = () => {
    setTempId(satelliteId);
    setIdError("");
    setIsEditingId(true);
    setTimeout(() => idInputRef.current?.focus(), 50);
  };

  const handleIdChange = (e) => {
    const val = e.target.value.toUpperCase();
    setTempId(val);
    if (!val.trim()) {
      setIdError("IDENTIFIER CANNOT BE BLANK");
    } else if (val.length < 3) {
      setIdError("MINIMUM 3 CHARACTERS REQUIRED");
    } else if (!/^[A-Z0-9\-_]+$/.test(val)) {
      setIdError("ALLOWED: A-Z, 0-9, HYPHEN, UNDERSCORE");
    } else {
      setIdError("");
    }
  };

  const saveId = () => {
    const trimmed = tempId.trim();
    if (!trimmed || trimmed.length < 3 || !/^[A-Z0-9\-_]+$/.test(trimmed)) {
      setIdError("INVALID IDENTIFIER FORMAT");
      return;
    }
    setSatelliteId(trimmed);
    setIsEditingId(false);
    showToast(`SATELLITE IDENTIFIER RECONFIGURED // "${trimmed}" COMMITTED TO TELEMETRY FRAME`);
  };

  const cancelId = () => {
    setIsEditingId(false);
    setIdError("");
  };

  const handleIdKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveId();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelId();
    }
  };

  // ==========================================================================
  // 6. HANDLERS FOR COMM DOWNLINK FREQUENCY (COMPONENT B)
  // ==========================================================================
  const startEditFreq = () => {
    setTempFreq(frequency);
    setFreqError("");
    setIsEditingFreq(true);
    setTimeout(() => freqInputRef.current?.focus(), 50);
  };

  const validateFrequency = (valStr) => {
    const num = parseFloat(valStr);
    if (isNaN(num)) {
      return "INVALID NUMERIC INPUT (E.G. 437.525)";
    }
    if (num < 435.0 || num > 438.0) {
      return "ERROR: OUT OF UHF AMATEUR SATELLITE BAND (435.000 - 438.000 MHZ)";
    }
    return "";
  };

  const handleFreqChange = (e) => {
    const val = e.target.value;
    setTempFreq(val);
    const err = validateFrequency(val);
    setFreqError(err);
  };

  const saveFreq = () => {
    const err = validateFrequency(tempFreq);
    if (err) {
      setFreqError(err);
      return;
    }
    const formatted = parseFloat(tempFreq).toFixed(3);
    setFrequency(formatted);
    setIsEditingFreq(false);
    setFreqError("");
    showToast(
      `RF COMM DOWNLINK FREQ UPDATED // ${formatted} MHZ (UHF PLL SYNTHESIZER LOCKED)`,
      "nominal"
    );
  };

  const cancelFreq = () => {
    setIsEditingFreq(false);
    setFreqError("");
  };

  const handleFreqKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveFreq();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelFreq();
    }
  };

  // ==========================================================================
  // 7. INLINE STYLES (MONOCHROME AEROSPACE SYSTEM - 0PX RADIUS)
  // ==========================================================================
  const styles = {
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
      padding: "20px",
      marginBottom: "20px",
      position: "relative",
    },
    subPanel: {
      backgroundColor: "#080808",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      borderRadius: "0px",
      padding: "16px",
    },
    headerTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexWrap: "wrap",
      gap: "16px",
      borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
      paddingBottom: "16px",
      marginBottom: "24px",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "11px",
      padding: "4px 10px",
      borderRadius: "0px",
      border: "1px solid #00FF41",
      color: "#00FF41",
      backgroundColor: "rgba(0, 255, 65, 0.05)",
      fontWeight: "bold",
    },
    buttonDefault: {
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
      transition: "all 0.15s ease",
    },
    buttonSave: {
      backgroundColor: "#00FF41",
      color: "#000000",
      border: "1px solid #00FF41",
      borderRadius: "0px",
      padding: "6px 14px",
      fontSize: "11px",
      fontFamily: "inherit",
      fontWeight: "bold",
      cursor: "pointer",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },
    buttonCancel: {
      backgroundColor: "transparent",
      color: "#8E8E93",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "0px",
      padding: "6px 12px",
      fontSize: "11px",
      fontFamily: "inherit",
      cursor: "pointer",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },
    input: {
      backgroundColor: "#000000",
      color: "#FFFFFF",
      border: "1px solid #00FF41",
      borderRadius: "0px",
      padding: "6px 10px",
      fontSize: "13px",
      fontFamily: "inherit",
      letterSpacing: "0.08em",
      outline: "none",
      boxSizing: "border-box",
    },
    inputError: {
      border: "1px solid #FF3333",
      color: "#FF3333",
    },
    errorBanner: {
      backgroundColor: "rgba(255, 51, 51, 0.1)",
      border: "1px solid #FF3333",
      color: "#FF3333",
      padding: "8px 12px",
      fontSize: "10px",
      marginTop: "8px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      borderRadius: "0px",
    },
    grid2Col: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
      gap: "20px",
      marginBottom: "20px",
    },
    grid4Col: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "12px",
    },
    fieldLabel: {
      fontSize: "10px",
      color: "#8E8E93",
      marginBottom: "4px",
      letterSpacing: "0.12em",
    },
    fieldValue: {
      fontSize: "14px",
      color: "#FFFFFF",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.container}>
      {/* ====================================================================
          TOP TOAST NOTIFICATION BANNER
         ==================================================================== */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            top: "16px",
            right: "16px",
            zIndex: 9999,
            backgroundColor: "#000000",
            border: `1px solid ${toastMessage.type === "error" ? "#FF3333" : "#00FF41"}`,
            color: toastMessage.type === "error" ? "#FF3333" : "#00FF41",
            padding: "12px 18px",
            fontSize: "11px",
            borderRadius: "0px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontWeight: "bold" }}>[{toastMessage.timestamp} UTC]</span>
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: "12px",
              marginLeft: "8px",
            }}
          >
            [✕]
          </button>
        </div>
      )}

      {/* ====================================================================
          MISSION CONTROL HEADER STRIP
         ==================================================================== */}
      <header style={styles.headerTop}>
        <div>
          <div style={{ fontSize: "10px", color: "#5A5A5F", marginBottom: "4px", letterSpacing: "0.2em" }}>
            SOMAIYASAT / SOMAIYAPOD // MISSION CONTROL GATEWAY (KJS-SRS-01)
          </div>
          <h1 style={{ fontSize: "20px", margin: "0 0 6px 0", color: "#FFFFFF", fontWeight: "bold" }}>
            TELEMETRY &amp; RF DOWNLINK COMMAND MATRIX
          </h1>
          <div style={{ fontSize: "11px", color: "#8E8E93" }}>
            POCKETQUBE 5CM UNIT · LEO 500KM 97.4° SSO · AUTONOMOUS AI ROUTER ENABLED
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <div style={styles.badge}>
            <span
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: "#00FF41",
                display: "inline-block",
              }}
            />
            CONTINUOUS MONITORING: LOCKED
          </div>
          <div style={{ fontSize: "11px", color: "#8E8E93" }}>
            MISSION CLOCK: <span style={{ color: "#FFFFFF" }}>{formatMet(telemetry.metSeconds)}</span>
          </div>
        </div>
      </header>

      {/* ====================================================================
          COMPONENT A & COMPONENT B GRID (IN-PAGE EDITING MODULES)
         ==================================================================== */}
      <div style={styles.grid2Col}>
        {/* ==================================================================
            COMPONENT A: SATELLITE IDENTIFIER (CLICK-TO-EDIT)
           ================================================================== */}
        <section style={styles.panel} aria-labelledby="satellite-identifier-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ fontSize: "10px", color: "#8E8E93", letterSpacing: "0.15em" }}>
              [COMPONENT A] // FLIGHT VEHICLE DESIGNATOR
            </span>
            <span style={{ fontSize: "10px", color: "#5A5A5F" }}>PATTERN A: CLICK-TO-EDIT</span>
          </div>

          <div style={styles.subPanel}>
            <div style={styles.fieldLabel}>SATELLITE IDENTIFIER (NICKNAME)</div>

            {!isEditingId ? (
              // Normal Read-Only View
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                  paddingTop: "6px",
                  paddingBottom: "6px",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "18px",
                      color: "#00FF41",
                      fontWeight: "bold",
                      letterSpacing: "0.12em",
                    }}
                  >
                    [ {satelliteId} ]
                  </span>
                  <div style={{ fontSize: "10px", color: "#8E8E93", marginTop: "4px" }}>
                    CALLSIGN: 8T2PQ · NORAD ID: 99124 · ACTIVE PAYLOAD BUS
                  </div>
                </div>

                <button
                  type="button"
                  onClick={startEditId}
                  style={styles.buttonDefault}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                    e.currentTarget.style.color = "#000000";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#FFFFFF";
                  }}
                  aria-label="Edit Satellite Identifier"
                >
                  [ EDIT ✎ ]
                </button>
              </div>
            ) : (
              // Editable State View
              <div style={{ marginTop: "8px" }}>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                  <input
                    ref={idInputRef}
                    type="text"
                    value={tempId}
                    onChange={handleIdChange}
                    onKeyDown={handleIdKeyDown}
                    style={{
                      ...styles.input,
                      ...(idError ? styles.inputError : {}),
                      flex: "1 1 200px",
                    }}
                    placeholder="ENTER VEHICLE CALLSIGN..."
                    maxLength={24}
                    aria-label="Edit Satellite Identifier input"
                  />
                  <button type="button" onClick={saveId} style={styles.buttonSave}>
                    [ ✓ SAVE ]
                  </button>
                  <button type="button" onClick={cancelId} style={styles.buttonCancel}>
                    [ ✕ CANCEL ]
                  </button>
                </div>

                {idError && (
                  <div style={styles.errorBanner} role="alert">
                    <span>[!]</span>
                    <span>{idError}</span>
                  </div>
                )}

                <div style={{ fontSize: "9px", color: "#5A5A5F", marginTop: "8px" }}>
                  HINT: PRESS [ENTER] TO COMMIT TO DOWNLINK FRAME · [ESC] TO DISCARD
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: "14px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              fontSize: "10px",
            }}
          >
            <div>
              <span style={{ color: "#5A5A5F" }}>COSPAR ID: </span>
              <span style={{ color: "#8E8E93" }}>2026-088-PQ</span>
            </div>
            <div>
              <span style={{ color: "#5A5A5F" }}>OPERATOR: </span>
              <span style={{ color: "#8E8E93" }}>GND-MUMBAI-GS01</span>
            </div>
          </div>
        </section>

        {/* ==================================================================
            COMPONENT B: RF COMM LINK FREQUENCY (CLICK-TO-EDIT + VALIDATION)
           ================================================================== */}
        <section style={styles.panel} aria-labelledby="rf-comm-link-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ fontSize: "10px", color: "#8E8E93", letterSpacing: "0.15em" }}>
              [COMPONENT B] // RF TRANSCEIVER CONFIGURATION
            </span>
            <span style={{ fontSize: "10px", color: "#5A5A5F" }}>UHF AMATEUR SATELLITE BAND</span>
          </div>

          <div style={styles.subPanel}>
            <div style={styles.fieldLabel}>DOWNLINK CENTER FREQUENCY (MHZ)</div>

            {!isEditingFreq ? (
              // Normal Read-Only View
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                  paddingTop: "6px",
                  paddingBottom: "6px",
                }}
              >
                <div>
                  <div style={{ fontSize: "18px", color: "#FFFFFF", fontWeight: "bold" }}>
                    DOWNLINK FREQ: <span style={{ color: "#00FF41" }}>{frequency} MHz</span>
                  </div>
                  <div style={{ fontSize: "10px", color: "#00FF41", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "6px", height: "6px", backgroundColor: "#00FF41", display: "inline-block" }} />
                    TX STATUS: ACTIVE LINK (PLL SYNTHESIZER LOCKED)
                  </div>
                </div>

                <button
                  type="button"
                  onClick={startEditFreq}
                  style={styles.buttonDefault}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                    e.currentTarget.style.color = "#000000";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#FFFFFF";
                  }}
                  aria-label="Edit Downlink Frequency"
                >
                  [ EDIT ✎ ]
                </button>
              </div>
            ) : (
              // Editable State View with Validation
              <div style={{ marginTop: "8px" }}>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ position: "relative", flex: "1 1 180px" }}>
                    <input
                      ref={freqInputRef}
                      type="text"
                      value={tempFreq}
                      onChange={handleFreqChange}
                      onKeyDown={handleFreqKeyDown}
                      style={{
                        ...styles.input,
                        ...(freqError ? styles.inputError : {}),
                        width: "100%",
                      }}
                      placeholder="437.525"
                      aria-label="Edit Downlink Frequency in MHz"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={saveFreq}
                    disabled={Boolean(freqError)}
                    style={{
                      ...styles.buttonSave,
                      ...(freqError
                        ? {
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            color: "#5A5A5F",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            cursor: "not-allowed",
                          }
                        : {}),
                    }}
                  >
                    [ ✓ SAVE ]
                  </button>
                  <button type="button" onClick={cancelFreq} style={styles.buttonCancel}>
                    [ ✕ CANCEL ]
                  </button>
                </div>

                {freqError ? (
                  <div style={styles.errorBanner} role="alert">
                    <span>[!]</span>
                    <span>{freqError}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: "10px", color: "#8E8E93", marginTop: "8px" }}>
                    AMATEUR UHF ALLOCATION: <span style={{ color: "#00FF41" }}>435.000 — 438.000 MHz</span> · CHANNEL STEP: 5 kHz
                  </div>
                )}

                <div style={{ fontSize: "9px", color: "#5A5A5F", marginTop: "6px" }}>
                  PRESS [ENTER] TO RETUNE CARRIER · [ESC] TO CANCEL
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: "14px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              fontSize: "10px",
            }}
          >
            <div>
              <span style={{ color: "#5A5A5F" }}>MODULATION: </span>
              <span style={{ color: "#8E8E93" }}>GMSK / 2-FSK (9600 BPS)</span>
            </div>
            <div>
              <span style={{ color: "#5A5A5F" }}>FRAMING: </span>
              <span style={{ color: "#8E8E93" }}>AX.25 + M17 CODEC2</span>
            </div>
          </div>
        </section>
      </div>

      {/* ====================================================================
          SURROUNDING CONTEXT: CONTINUOUS REAL-TIME TELEMETRY FEED (READ-ONLY)
         ==================================================================== */}
      <section style={styles.panel} aria-labelledby="live-telemetry-feed">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
            paddingBottom: "12px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: "#00FF41",
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: "12px", fontWeight: "bold", color: "#FFFFFF" }}>
              LIVE DOWNLINK PHYSICAL LAYER &amp; POWER METRICS (CONTINUOUS)
            </span>
          </div>
          <span style={{ fontSize: "10px", color: "#8E8E93" }}>
            SAMPLING INTERVAL: 1.00 SEC · PACKET STREAM UNINTERRUPTED
          </span>
        </div>

        {/* 4-Column Live Metric Stream */}
        <div style={styles.grid4Col}>
          {/* RSSI & SNR */}
          <div style={styles.subPanel}>
            <div style={styles.fieldLabel}>RECEIVER SIGNAL (RSSI / SNR)</div>
            <div style={{ fontSize: "16px", color: "#00FF41", fontWeight: "bold" }}>
              {telemetry.rssi} dBm
            </div>
            <div style={{ fontSize: "11px", color: "#8E8E93", marginTop: "4px" }}>
              SNR: <span style={{ color: "#FFFFFF" }}>+{telemetry.snr} dB</span> (NOMINAL)
            </div>
            <div style={{ marginTop: "8px", backgroundColor: "#000000", height: "4px", width: "100%" }}>
              <div
                style={{
                  backgroundColor: "#00FF41",
                  height: "100%",
                  width: `${Math.min(100, Math.max(10, (telemetry.rssi + 120) * 4))}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Sub-1W Power Rail */}
          <div style={styles.subPanel}>
            <div style={styles.fieldLabel}>SUB-1W POWER CONSUMPTION</div>
            <div style={{ fontSize: "16px", color: "#00FF41", fontWeight: "bold" }}>
              {telemetry.powerWatts} W
            </div>
            <div style={{ fontSize: "11px", color: "#8E8E93", marginTop: "4px" }}>
              BUS: <span style={{ color: "#FFFFFF" }}>{telemetry.busVoltage}V @ {telemetry.busCurrentMa}mA</span>
            </div>
            <div style={{ marginTop: "8px", backgroundColor: "#000000", height: "4px", width: "100%" }}>
              <div
                style={{
                  backgroundColor: telemetry.powerWatts > 0.9 ? "#FFB700" : "#00FF41",
                  height: "100%",
                  width: `${(telemetry.powerWatts / 1.0) * 100}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Doppler & Tracking */}
          <div style={styles.subPanel}>
            <div style={styles.fieldLabel}>RF DOPPLER SHIFT (LEO 500KM)</div>
            <div style={{ fontSize: "16px", color: "#FFFFFF", fontWeight: "bold" }}>
              {telemetry.dopplerShiftKhz > 0 ? `+${telemetry.dopplerShiftKhz}` : telemetry.dopplerShiftKhz} kHz
            </div>
            <div style={{ fontSize: "11px", color: "#8E8E93", marginTop: "4px" }}>
              BATTERY SOC: <span style={{ color: "#00FF41" }}>{telemetry.batterySoc}%</span>
            </div>
            <div style={{ marginTop: "8px", backgroundColor: "#000000", height: "4px", width: "100%" }}>
              <div
                style={{
                  backgroundColor: "#00FF41",
                  height: "100%",
                  width: `${telemetry.batterySoc}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Frame Counters */}
          <div style={styles.subPanel}>
            <div style={styles.fieldLabel}>DECODED FRAME COUNTER</div>
            <div style={{ fontSize: "16px", color: "#FFFFFF", fontWeight: "bold" }}>
              TT&amp;C: {telemetry.ttcFrameCount}
            </div>
            <div style={{ fontSize: "11px", color: "#8E8E93", marginTop: "4px" }}>
              M17: <span style={{ color: "#00FF41" }}>{telemetry.m17PacketCount}</span> · SSTV: {telemetry.sstvLineCount} L
            </div>
            <div style={{ marginTop: "8px", fontSize: "9px", color: "#5A5A5F" }}>
              PER: 0.02% · ZERO DROPPED FRAMES
            </div>
          </div>
        </div>

        {/* Live Packet Log Stream */}
        <div style={{ marginTop: "16px", backgroundColor: "#080808", border: "1px solid rgba(255, 255, 255, 0.1)", padding: "12px" }}>
          <div style={{ fontSize: "10px", color: "#8E8E93", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
            <span>REAL-TIME PACKET CAPTURE LOG // RECENT 4 FRAMES</span>
            <span style={{ color: "#00FF41" }}>[ LIVE STREAMING ]</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px" }}>
            {packetLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px dashed rgba(255, 255, 255, 0.08)",
                  paddingBottom: "4px",
                }}
              >
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ color: "#5A5A5F" }}>{log.time}</span>
                  <span style={{ color: "#00FF41", fontWeight: "bold", width: "70px" }}>[{log.channel}]</span>
                  <span style={{ color: "#FFFFFF", letterSpacing: "0.12em" }}>{log.hex}</span>
                </div>
                <span style={{ color: "#8E8E93", fontSize: "10px" }}>{log.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
