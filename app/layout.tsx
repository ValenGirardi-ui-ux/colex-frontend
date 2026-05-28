import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/src/components/layout/Footer";
import { MobileBottomNav } from "@/src/components/layout/mobile-bottom-nav";
import { AppProviders } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Colex",
  description: "Marketplace de artículos escolares e institucionales",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col overflow-x-hidden">
        <AppProviders>
          <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden max-lg:pb-[calc(3.25rem+env(safe-area-inset-bottom))]">
            {children}
          </div>
          <Footer />
          <MobileBottomNav />
        </AppProviders>
      </body>
    </html>
  );
}
