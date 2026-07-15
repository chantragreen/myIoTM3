import type { Metadata } from "next";
import { Space_Grotesk, Sora } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora"
});

export const metadata: Metadata = {
  title: "AIoT Activity Hub",
  description: "Dashboard and Control Center for AIoT event"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${spaceGrotesk.variable} ${sora.variable} font-[var(--font-space-grotesk)] antialiased`}>
        {children}
      </body>
    </html>
  );
}
