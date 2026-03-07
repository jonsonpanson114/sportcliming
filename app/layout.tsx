import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#020617",
};

export const metadata: Metadata = {
  title: "Summit Pulse - AIクライミングコーチ",
  description:
    "AIがあなたのクライミング上達をサポート。最新のテクニック動画、コーチング、練習記録を一括管理。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Summit Pulse",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased">
        <div className="mesh-bg" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
