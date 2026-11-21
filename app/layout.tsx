// app/layout.tsx
import type { Metadata } from "next";
import KonstaProvider from "./KonstaProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "EatRight - Clean Food & Hygiene Rating",
  description: "A premium Apple-style mobile-first food application rating hygiene and value in Katihar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/sf-pro-display" />
      </head>
      <body className="antialiased font-sans">
        <KonstaProvider>
          {children}
        </KonstaProvider>
      </body>
    </html>
  );
}
