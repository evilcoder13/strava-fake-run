import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "StravaFakeRun | Realistic GPX/TCX Activity Generator",
  description: "Generate realistic, privacy-focused activity routes with simulated biometric data (HR, Cadence) for Strava, Garmin, and more. No account required.",
  keywords: ["Strava", "Garmin", "GPX generator", "TCX generator", "biometric simulation", "privacy", "route planning"],
  authors: [{ name: "evilcoder13" }],
  openGraph: {
    title: "StravaFakeRun | Realistic Activity Generator",
    description: "Privacy-first realistic activity generator with simulated heart rate and cadence data.",
    type: "website",
    url: "https://stravafakerun.com", // Placeholder URL
    siteName: "StravaFakeRun",
  },
  twitter: {
    card: "summary_large_image",
    title: "StravaFakeRun",
    description: "Generate realistic activities with simulated biometrics for Strava.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
