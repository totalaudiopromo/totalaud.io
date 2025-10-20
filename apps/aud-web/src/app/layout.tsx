import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { GlobalCommandPalette } from "@/components/GlobalCommandPalette";

export const metadata: Metadata = {
  title: "TotalAud.io",
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
        <ThemeProvider>
          {children}
          <GlobalCommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}

