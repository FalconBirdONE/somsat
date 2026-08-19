import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Oswald } from "next/font/google";
import "./globals.css";

// Condensed technical display face — headlines, labels, badges.
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"] });

// Neutral body face, used sparingly.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

// Instrumentation face — every numeric telemetry readout renders in this.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SomSat & SomPod",
  description:
    "PocketQube mission with autonomous AI-based data routing across M17, Codec2, SSTV and TT&C payloads.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-obsidian-950">{children}</body>
    </html>
  );
}
