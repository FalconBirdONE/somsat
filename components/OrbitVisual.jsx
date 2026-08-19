"use client";

import React from "react";

/**
 * 3D Tilted Top-Down Orbit Visual
 * Simulates an elevated top-down perspective of Earth with an elliptical PocketQube orbit (rx=240, ry=85),
 * depth occlusion (back orbit behind Earth, front orbit in front), and a continuous telemetry downlink ray.
 */
export default function OrbitVisual({ compact = false, className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`relative flex items-center justify-center overflow-hidden transition-all duration-700 ease-in-out ${
        compact
          ? "h-48 sm:h-56 w-full max-w-sm mx-auto"
          : "h-[15rem] sm:h-[18rem] lg:h-[21rem] w-full max-w-3xl mx-auto"
      } ${className}`}
    >
      <style>{`
        @keyframes orbit-elliptical {
          0% {
            transform: translate(540px, 200px) scale(0.85);
            opacity: 0.85;
          }
          12.5% {
            transform: translate(470px, 260px) scale(1.05);
            opacity: 0.95;
          }
          25% {
            transform: translate(300px, 285px) scale(1.18);
            opacity: 1;
          }
          37.5% {
            transform: translate(130px, 260px) scale(1.05);
            opacity: 0.95;
          }
          50% {
            transform: translate(60px, 200px) scale(0.85);
            opacity: 0.85;
          }
          62.5% {
            transform: translate(130px, 140px) scale(0.68);
            opacity: 0.6;
          }
          75% {
            transform: translate(300px, 115px) scale(0.6);
            opacity: 0.45;
          }
          87.5% {
            transform: translate(470px, 140px) scale(0.68);
            opacity: 0.6;
          }
          100% {
            transform: translate(540px, 200px) scale(0.85);
            opacity: 0.85;
          }
        }

        @keyframes beam-sweep {
          0%, 100% {
            opacity: 0.5;
            stroke-dashoffset: 0;
          }
          50% {
            opacity: 0.85;
            stroke-dashoffset: -16;
          }
        }

        @keyframes pulse-signal-glow {
          0%, 100% {
            r: 3;
            opacity: 0.9;
          }
          50% {
            r: 6;
            opacity: 0.3;
          }
        }
      `}</style>

      {/* Atmospheric radial bloom */}
      <div
        className={`absolute rounded-full bg-[radial-gradient(circle,rgba(184,190,201,0.12)_0%,transparent_68%)] pointer-events-none transition-all duration-700 ${
          compact ? "h-48 w-48" : "h-[22rem] w-[22rem] sm:h-[28rem] sm:w-[28rem]"
        }`}
      />

      {/* Primary 3D Tilted Viewport */}
      <svg
        viewBox="0 70 600 260"
        className="w-full h-full object-contain pointer-events-none select-none"
      >
        <defs>
          {/* Earth Shadow and Surface Gradient */}
          <radialGradient id="earth-surface" cx="42%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#1a1d26" />
            <stop offset="45%" stopColor="#121319" />
            <stop offset="85%" stopColor="#0a0a0d" />
            <stop offset="100%" stopColor="#050507" />
          </radialGradient>

          {/* Earth Atmospheric Rim Glow */}
          <linearGradient id="earth-atmosphere" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(184, 190, 201, 0.45)" />
            <stop offset="50%" stopColor="rgba(184, 190, 201, 0.1)" />
            <stop offset="100%" stopColor="rgba(184, 190, 201, 0.02)" />
          </linearGradient>

          {/* Telemetry Ray Gradient */}
          <linearGradient id="telemetry-ray" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8ff4d" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#b8bec9" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Tilted System Plane (-12 deg tilt for top-down 3D impression) */}
        <g transform="rotate(-12 300 200)">
          {/* ========================================================
              LAYER 1: BACK ORBIT ARC (Behind the Planet)
             ======================================================== */}
          {/* Outer dashed reference ring */}
          <path
            d="M 20,200 A 280 100 0 0 1 580 200"
            fill="none"
            stroke="rgba(184, 190, 201, 0.08)"
            strokeWidth="1"
            strokeDasharray="2 8"
          />

          {/* Main PocketQube Back Orbit Track (rx=240, ry=85) */}
          <path
            d="M 60,200 A 240 85 0 0 1 540 200"
            fill="none"
            stroke="rgba(184, 190, 201, 0.22)"
            strokeWidth="1.5"
            strokeDasharray="3 5"
          />

          {/* ========================================================
              LAYER 2: CENTRAL PLANETARY BODY (Earth)
             ======================================================== */}
          {/* Outer Atmospheric Aura */}
          <circle
            cx="300"
            cy="200"
            r="82"
            fill="none"
            stroke="url(#earth-atmosphere)"
            strokeWidth="2.5"
            opacity="0.8"
          />

          {/* Planet Sphere */}
          <circle
            cx="300"
            cy="200"
            r="76"
            fill="url(#earth-surface)"
            stroke="rgba(184, 190, 201, 0.2)"
            strokeWidth="1.5"
          />

          {/* Spherical Top-down Latitude Curvatures */}
          <path
            d="M 230,170 A 74 28 0 0 0 370 170"
            fill="none"
            stroke="rgba(184, 190, 201, 0.12)"
            strokeWidth="1"
          />
          <path
            d="M 224,200 A 76 34 0 0 0 376 200"
            fill="none"
            stroke="rgba(184, 190, 201, 0.15)"
            strokeWidth="1"
          />
          <path
            d="M 230,230 A 74 28 0 0 0 370 230"
            fill="none"
            stroke="rgba(184, 190, 201, 0.12)"
            strokeWidth="1"
          />

          {/* Spherical Longitude Arc */}
          <path
            d="M 300,124 A 36 76 0 0 1 300 276"
            fill="none"
            stroke="rgba(184, 190, 201, 0.1)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />

          {/* Ground Station Target (GS-01 / Somaiya Ground Terminal) */}
          <g transform="translate(288, 168)">
            <circle cx="0" cy="0" r="2.5" fill="#e8ff4d" />
            <circle
              cx="0"
              cy="0"
              r="6"
              fill="none"
              stroke="#e8ff4d"
              strokeWidth="1"
              style={{ animation: "pulse-signal-glow 2.4s ease-in-out infinite" }}
            />
            <text
              x="8"
              y="3"
              fill="rgba(184, 190, 201, 0.65)"
              className="font-mono text-[8px] uppercase tracking-wider select-none"
            >
              GS-01
            </text>
          </g>

          {/* ========================================================
              LAYER 3: FRONT ORBIT ARC (In Front of the Planet)
             ======================================================== */}
          {/* Main PocketQube Front Orbit Track (rx=240, ry=85) */}
          <path
            d="M 540,200 A 240 85 0 0 1 60 200"
            fill="none"
            stroke="rgba(184, 190, 201, 0.45)"
            strokeWidth="1.75"
            strokeDasharray="4 6"
          />

          {/* Outer front reference arc */}
          <path
            d="M 580,200 A 280 100 0 0 1 20 200"
            fill="none"
            stroke="rgba(184, 190, 201, 0.15)"
            strokeWidth="1"
            strokeDasharray="2 8"
          />

          {/* ========================================================
              LAYER 4: ORBITING SATELLITE NODE & TELEMETRY BEAM
             ======================================================== */}
          <g
            style={{
              animation: "orbit-elliptical 28s linear infinite",
              transformOrigin: "0px 0px",
            }}
          >
            {/* Telemetry Downlink Ray to Ground Station (288, 168) */}
            <line
              x1="0"
              y1="0"
              x2="-12"
              y2="-32"
              stroke="url(#telemetry-ray)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              style={{ animation: "beam-sweep 3s ease-in-out infinite" }}
            />

            {/* Satellite Beacon Pulse */}
            <circle
              cx="0"
              cy="0"
              r="14"
              fill="rgba(232, 255, 77, 0.08)"
              className="motion-safe:animate-ping"
            />

            {/* Satellite Body (5cm PocketQube with Solar Wings) */}
            {/* Left Solar Panel */}
            <rect
              x="-18"
              y="-4"
              width="8"
              height="8"
              rx="1"
              fill="#101116"
              stroke="rgba(184, 190, 201, 0.6)"
              strokeWidth="1"
            />
            {/* Solar Cell Grid */}
            <line
              x1="-14"
              y1="-4"
              x2="-14"
              y2="4"
              stroke="rgba(184, 190, 201, 0.3)"
              strokeWidth="0.75"
            />

            {/* Main Satellite Cube Body */}
            <rect
              x="-6"
              y="-6"
              width="12"
              height="12"
              rx="2"
              fill="#101116"
              stroke="#b8bec9"
              strokeWidth="1.5"
            />

            {/* Right Solar Panel */}
            <rect
              x="10"
              y="-4"
              width="8"
              height="8"
              rx="1"
              fill="#101116"
              stroke="rgba(184, 190, 201, 0.6)"
              strokeWidth="1"
            />
            {/* Solar Cell Grid */}
            <line
              x1="14"
              y1="-4"
              x2="14"
              y2="4"
              stroke="rgba(184, 190, 201, 0.3)"
              strokeWidth="0.75"
            />

            {/* Monopole Antenna */}
            <line
              x1="0"
              y1="-6"
              x2="0"
              y2="-14"
              stroke="#e8ff4d"
              strokeWidth="1.25"
            />

            {/* Center Status LED / Interactive Signal Beacon */}
            <circle cx="0" cy="0" r="2.5" fill="#e8ff4d" />
          </g>
        </g>
      </svg>
    </div>
  );
}
