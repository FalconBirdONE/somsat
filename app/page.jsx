"use client";

import React, { useState } from "react";
import Link from "next/link";
import OrbitVisual from "@/components/OrbitVisual";
import WorkstreamCard from "@/components/WorkstreamCard";

const WORKSTREAMS = [
  {
    id: "A",
    label: "Requirements & Interfaces",
    glyph: (
      <>
        <path d="M12 6h18l6 6v30H12z" />
        <path d="M30 6v6h6" />
        <path d="M18 24h12M18 32h12" />
      </>
    ),
  },
  {
    id: "B",
    label: "AI Model Training",
    glyph: (
      <>
        <circle cx="24" cy="12" r="4" />
        <circle cx="13" cy="34" r="4" />
        <circle cx="35" cy="34" r="4" />
        <path d="M21 15 16 30M27 15l5 15M17 34h14" />
      </>
    ),
  },
  {
    id: "C",
    label: "Payload & Deployer",
    glyph: (
      <>
        <rect x="17" y="17" width="14" height="14" rx="2" />
        <path d="M17 24h-7M38 24h-7M24 17v-7M24 38v-7" />
        <path d="M8 20v8M40 20v8" />
      </>
    ),
  },
  {
    id: "D",
    label: "Deployment & HIL",
    glyph: (
      <>
        <rect x="10" y="14" width="28" height="20" rx="2" />
        <path d="M17 22h5l3 6 3-9 2 3h5" />
        <path d="M18 40h12" />
      </>
    ),
  },
  {
    id: "E",
    label: "Ground Station",
    glyph: (
      <>
        <path d="M14 38 26 16" />
        <path d="M10 36h12" />
        <path d="M20 12a13 13 0 0 1 12 12" />
        <path d="M26 6a20 20 0 0 1 16 18" />
        <circle cx="27" cy="15" r="2" />
      </>
    ),
  },
];

const VERSION_OPTIONS = [
  { id: "v2.0-live", label: "v2.0-live", note: "Active Deployment", snr: "12.4 dB", pass: "03:42 SEC" },
  { id: "v1.2-telemetry", label: "v1.2-telemetry", note: "Telemetry Sim", snr: "10.8 dB", pass: "05:15 SEC" },
  { id: "v1.0-alpha", label: "v1.0-alpha", note: "Core Blueprint", snr: "8.2 dB", pass: "02:30 SEC" },
];

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [operatorId, setOperatorId] = useState("shardul shinde");
  const [password, setPassword] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("v2.0-live");
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const activeVersionMeta = VERSION_OPTIONS.find((v) => v.id === selectedVersion) || VERSION_OPTIONS[0];

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setIsAuthenticated(true);
      setIsLoginOpen(false);
    }, 400);
  };

  const handleDisconnect = () => {
    setIsAuthenticated(false);
    setPassword("");
  };

  return (
    <main className="flex-1 bg-obsidian-950 text-steel flex flex-col justify-between min-h-screen">
      {/* ================================================================
          HERO / PORTAL INTERACTIVE CONTAINER
         ================================================================ */}
      <section className="relative w-full max-w-6xl mx-auto px-5 sm:px-8 pt-6 sm:pt-8 pb-12 transition-all duration-700 ease-in-out">
        {/* Prominent Centered Typography (Collapses smoothly on Authentication) */}
        <div
          className={`text-center max-w-4xl mx-auto transition-all duration-700 ease-in-out overflow-hidden ${
            isAuthenticated
              ? "max-h-0 opacity-0 -translate-y-6 scale-95 mb-0 pointer-events-none"
              : "max-h-96 opacity-100 translate-y-0 scale-100 mb-2 pt-1 pb-1"
          }`}
        >
          <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.34em] text-steel/50 mb-2">
            5CM POCKETQUBE CAPSTONE MISSION
          </p>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl text-white tracking-[-0.01em] leading-[0.92] uppercase">
            SOMAIYASAT <span className="text-steel/40">&amp;</span> SOMAIYAPOD
          </h1>
          <p className="mt-3 max-w-xl mx-auto font-sans text-xs sm:text-sm leading-6 text-steel/80">
            Autonomous downlink routing and multi-payload coordination across
            M17, Codec2, SSTV, and TT&amp;C channels under a sub-1&nbsp;W
            power budget.
          </p>
        </div>

        {/* Morphing Interactive Grid (Expands & Contracts seamlessly) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch transition-all duration-700 ease-in-out mt-2">
          {/* ============================================================
              LEFT / CENTER COLUMN: PERSISTENT ORBIT VISUAL
             ============================================================ */}
          <div
            className={`transition-all duration-700 ease-in-out flex flex-col justify-between ${
              isAuthenticated
                ? "lg:col-span-5 rounded-2xl border border-edge bg-obsidian-900 p-5 sm:p-6 shadow-2xl"
                : "lg:col-span-12 rounded-none border-transparent bg-transparent p-0"
            }`}
          >
            {/* Live Orbit Telemetry Header (Fades in when Authenticated) */}
            <div
              className={`transition-all duration-700 ease-in-out overflow-hidden flex items-center justify-between border-b border-edge ${
                isAuthenticated
                  ? "max-h-12 opacity-100 pb-3 mb-2"
                  : "max-h-0 opacity-0 pb-0 mb-0 pointer-events-none"
              }`}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel/50">
                LIVE ORBIT TELEMETRY
              </span>
              <span className="font-mono text-[10px] text-nominal flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-nominal animate-ping" />
                LOCKED
              </span>
            </div>

            {/* Persistent OrbitVisual Canvas (Smoothly scales & shifts) */}
            <div className="w-full flex items-center justify-center transition-all duration-700 ease-in-out">
              <OrbitVisual compact={isAuthenticated} />
            </div>

            {/* Live Orbit Telemetry Footer Chips (Fades in when Authenticated) */}
            <div
              className={`transition-all duration-700 ease-in-out overflow-hidden space-y-2 rounded-xl border border-edge bg-obsidian-850 font-mono text-[11px] ${
                isAuthenticated
                  ? "max-h-48 opacity-100 p-3.5 mt-3"
                  : "max-h-0 opacity-0 p-0 mt-0 pointer-events-none"
              }`}
            >
              <div className="flex justify-between">
                <span className="text-steel/45">ORBIT REGIME</span>
                <span className="text-steel">LEO 500 KM · 97.4° SSO</span>
              </div>
              <div className="flex justify-between">
                <span className="text-steel/45">PASS WINDOW</span>
                <span className="text-signal font-semibold">{activeVersionMeta.pass}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-steel/45">DOWNLINK SNR</span>
                <span className="text-nominal">{activeVersionMeta.snr} (NOMINAL)</span>
              </div>
            </div>
          </div>

          {/* ============================================================
              RIGHT COLUMN: OPERATOR NAVIGATION HUD (Expands / Contracts)
             ============================================================ */}
          <div
            className={`transition-all duration-700 ease-in-out flex flex-col justify-between rounded-2xl border border-edge bg-obsidian-900 overflow-hidden ${
              isAuthenticated
                ? "lg:col-span-7 max-h-[900px] opacity-100 p-6 sm:p-8 scale-100 translate-x-0 shadow-2xl"
                : "lg:col-span-0 max-h-0 opacity-0 p-0 scale-95 translate-x-8 pointer-events-none border-transparent hidden lg:flex"
            }`}
          >
            {/* HUD Header */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-edge pb-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel/50">
                    TACTICAL NAVIGATION HUD
                  </span>
                  <h2 className="font-display mt-1 text-2xl sm:text-3xl uppercase text-white leading-none">
                    AUTHORIZATION: FLIGHT DIRECTOR
                  </h2>
                </div>

                <div className="inline-flex items-center gap-2 rounded-lg border border-nominal/30 bg-nominal/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-nominal">
                  <span className="h-1.5 w-1.5 rounded-full bg-nominal" />
                  OPERATOR: {operatorId.toUpperCase()}
                </div>
              </div>

              {/* 3-Item Tactical Navigation List */}
              <div className="mt-6 space-y-3">
                {/* 01 // MISSION CONTROL PORTAL */}
                <Link
                  href="/mission-control"
                  className="group relative flex items-center justify-between rounded-xl border border-signal/40 bg-signal/[0.04] p-4 transition-all duration-300 hover:border-signal hover:bg-signal/[0.1] focus-visible:outline-2 focus-visible:outline-signal"
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold text-signal">
                        01 //
                      </span>
                      <h3 className="font-display text-lg tracking-wide uppercase text-white transition-colors group-hover:text-signal">
                        MISSION CONTROL PORTAL
                      </h3>
                    </div>
                    <p className="mt-1 font-sans text-xs text-steel/80 max-w-md">
                      Live telemetry feeds, subsystem status matrix, ground
                      station override &amp; autonomous routing decoders.
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-signal text-signal transition-all duration-300 group-hover:bg-signal group-hover:text-obsidian-950">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </div>
                </Link>

                {/* 02 // WEATHER & ATC CHECK */}
                <div className="relative flex items-center justify-between rounded-xl border border-edge bg-obsidian-850/40 p-4 opacity-60 cursor-not-allowed">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-steel/40">
                        02 //
                      </span>
                      <h3 className="font-display text-lg tracking-wide uppercase text-steel/60">
                        WEATHER &amp; ATC CHECK
                      </h3>
                    </div>
                    <p className="mt-1 font-sans text-xs text-steel/40 max-w-md">
                      Launch range meteorological telemetry, atmospheric
                      Doppler shifts &amp; airspace sector clearances.
                    </p>
                  </div>

                  <span className="shrink-0 rounded-md border border-edge bg-obsidian-800 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-steel/50">
                    [STANDBY / NOT BUILT]
                  </span>
                </div>

                {/* 03 // TACTICAL NAVIGATION MENU */}
                <div className="relative flex items-center justify-between rounded-xl border border-edge bg-obsidian-850/40 p-4 opacity-60 cursor-not-allowed">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-steel/40">
                        03 //
                      </span>
                      <h3 className="font-display text-lg tracking-wide uppercase text-steel/60">
                        TACTICAL NAVIGATION MENU
                      </h3>
                    </div>
                    <p className="mt-1 font-sans text-xs text-steel/40 max-w-md">
                      Orbit maneuver planner, attitude determination (ADCS)
                      &amp; reaction wheel torque telemetry.
                    </p>
                  </div>

                  <span className="shrink-0 rounded-md border border-edge bg-obsidian-800 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-steel/50">
                    [STANDBY / NOT BUILT]
                  </span>
                </div>
              </div>
            </div>

            {/* Cockpit Footer & Disconnect Trigger */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-edge pt-4 font-mono text-[10px]">
              <span className="text-steel/45 uppercase tracking-wider">
                ENCRYPTED TLS-V1.3 SESSION · KEY: KJS-SRS-01
              </span>

              <button
                type="button"
                onClick={handleDisconnect}
                className="flex items-center gap-2 rounded-lg border border-edge px-3.5 py-1.5 uppercase tracking-wider text-steel/50 transition-colors hover:border-fault/40 hover:text-fault focus-visible:outline-2 focus-visible:outline-fault"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                >
                  <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                  <line x1="12" y1="2" x2="12" y2="12" />
                </svg>
                <span>DISCONNECT / LOGOUT</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================
            CONTROL DOCK (Guest View)
           ================================================================ */}
        <div
          className={`transition-all duration-700 ease-in-out overflow-hidden flex justify-center ${
            isAuthenticated
              ? "max-h-0 opacity-0 translate-y-6 pointer-events-none mt-0"
              : "max-h-96 opacity-100 translate-y-0 mt-3"
          }`}
        >
          <div className="relative rounded-2xl bg-obsidian-900 border border-edge shadow-2xl p-2 sm:p-2.5 transition-all duration-500 ease-in-out">
            <div className="flex flex-wrap items-center justify-center gap-3 transition-all duration-300">
              {/* Version Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsVersionDropdownOpen(!isVersionDropdownOpen)}
                  aria-expanded={isVersionDropdownOpen}
                  aria-label="Select portal version"
                  className="flex items-center gap-2.5 rounded-xl border border-edge bg-obsidian-850 px-3.5 py-2 font-mono text-[11px] uppercase tracking-wider text-steel transition-colors hover:border-edge-strong hover:text-white"
                >
                  <span className="text-steel/45">VER:</span>
                  <span className="font-semibold text-white">{selectedVersion}</span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`h-3.5 w-3.5 text-steel/50 transition-transform duration-200 ${
                      isVersionDropdownOpen ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {isVersionDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-52 rounded-xl border border-edge bg-obsidian-900 p-1.5 shadow-2xl z-30">
                    {VERSION_OPTIONS.map((ver) => (
                      <button
                        key={ver.id}
                        type="button"
                        onClick={() => {
                          setSelectedVersion(ver.id);
                          setIsVersionDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider transition-colors ${
                          selectedVersion === ver.id
                            ? "bg-signal/10 text-signal font-semibold"
                            : "text-steel/70 hover:bg-obsidian-850 hover:text-white"
                        }`}
                      >
                        <span>{ver.label}</span>
                        <span className="text-[9px] text-steel/40">{ver.note}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Expandable Operator Login Trigger */}
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-signal/30 bg-signal/[0.08] px-5 py-2 font-mono text-[11px] uppercase tracking-wider text-signal transition-all hover:border-signal hover:bg-signal hover:text-obsidian-950 focus-visible:outline-2 focus-visible:outline-signal"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>OPERATOR LOGIN</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          FLOATING UP & EXPANDED OPERATOR LOGIN MODAL
         ================================================================ */}
      {isLoginOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
          onClick={() => setIsLoginOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md transition-all duration-500 ease-out"
        >
          {/* Elevated Floating Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl border border-edge-strong bg-obsidian-900 p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.9)] border-signal/20 animate-[float-up_0.4s_ease-out] transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-edge pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-steel/50">
                  SECURITY CLEARANCE // LEVEL-4 · KJS-SRS-01
                </span>
                <h2
                  id="login-modal-title"
                  className="font-display mt-1 text-2xl sm:text-3xl uppercase text-white leading-none"
                >
                  OPERATOR AUTHENTICATION
                </h2>
                <p className="mt-2 font-sans text-xs text-steel/70">
                  Enter authorized flight controller callsign and passcode to establish an encrypted downlink session.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsLoginOpen(false)}
                aria-label="Close operator login"
                className="rounded-lg p-1.5 text-steel/45 hover:bg-obsidian-850 hover:text-white transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="modal-operator-id"
                    className="font-mono text-[10px] uppercase tracking-wider text-steel/55"
                  >
                    OPERATOR IDENTIFIER / CALLSIGN
                  </label>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-signal/80 bg-signal/10 px-2 py-0.5 rounded">
                    ROLE: FLIGHT DIRECTOR
                  </span>
                </div>
                <input
                  id="modal-operator-id"
                  type="text"
                  required
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  className="w-full rounded-xl border border-edge bg-obsidian-850 px-4 py-2.5 font-mono text-sm text-white transition-colors focus:border-signal focus:outline-none"
                  placeholder="Enter operator callsign..."
                />
              </div>

              <div>
                <label
                  htmlFor="modal-passcode"
                  className="block font-mono text-[10px] uppercase tracking-wider text-steel/55 mb-1.5"
                >
                  SECURITY PASSCODE / ACCESS KEY
                </label>
                <input
                  id="modal-passcode"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-edge bg-obsidian-850 px-4 py-2.5 font-mono text-sm text-white transition-colors focus:border-signal focus:outline-none"
                  placeholder="••••••••••••"
                />
              </div>

              {/* Live Security Strip */}
              <div className="rounded-xl border border-edge bg-obsidian-850 p-3 font-mono text-[10px] text-steel/60 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-nominal" />
                  SESSION: ENCRYPTED TLS-V1.3
                </span>
                <span className="text-steel/40">GND READY</span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLoginOpen(false)}
                  className="rounded-xl px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-steel/60 hover:text-white transition-colors"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="flex items-center gap-2 rounded-xl bg-signal px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-obsidian-950 transition-all hover:bg-signal/90 focus-visible:outline-2 focus-visible:outline-signal disabled:opacity-50 shadow-lg shadow-signal/20"
                >
                  {isAuthenticating ? (
                    <>
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-obsidian-950 border-t-transparent animate-spin" />
                      <span>AUTHORIZING...</span>
                    </>
                  ) : (
                    <span>AUTHORIZE SESSION &rarr;</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================
          MISSION WORKSTREAMS SECTION (A–E)
         ================================================================ */}
      <section className="mx-auto w-full max-w-6xl px-5 sm:px-8 pb-16 pt-8">
        <h2 className="font-display border-b border-edge pb-3 text-xs tracking-[0.3em] uppercase text-steel/60">
          MISSION WORKSTREAMS (A–E)
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {WORKSTREAMS.map((w) => (
            <WorkstreamCard key={w.id} {...w} />
          ))}
        </div>
      </section>
    </main>
  );
}
