import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ThemeResolver } from "@aud-web/components/themes/ThemeResolver";
import { GlobalCommandPalette } from "@aud-web/components/GlobalCommandPalette";

export const metadata: Metadata = {
  title: "totalaud.io",
  description: "Marketing your music should be as creative as making it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeResolver>
          {children}
          <Suspense fallback={null}>
            <GlobalCommandPalette />
          </Suspense>
        </ThemeResolver>
      </body>
    </html>
  );
}

