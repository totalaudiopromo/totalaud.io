import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}

