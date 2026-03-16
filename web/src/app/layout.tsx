import type { Metadata } from "next";
import { Geist, Fraunces } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { Providers } from "@/components/Providers";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "MoodFlow — Emotional Insight",
  description: "A refined tool for tracking cognitive and emotional states during deep work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${fraunces.variable} font-sans bg-stone-50 text-stone-950 antialiased`}>
        <Providers>
          <div className="noise-bg" />
          <div className="flex min-h-screen">
            <Navigation />
            <main className="flex-1 ml-20 xl:ml-64 p-8 xl:p-12 overflow-y-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
