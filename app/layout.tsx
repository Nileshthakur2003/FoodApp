// app/layout.tsx
import type { Metadata } from "next";
import KonstaProvider from "./KonstaProvider";
import "./globals.css";

/* FIX: Import Konsta UI's exact React theme sheet through the module graph */
import "konsta/react/theme.css"; 

export const metadata: Metadata = {
  title: "Food App",
  description: "A premium mobile-first food application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <KonstaProvider>
          {children}
        </KonstaProvider>
      </body>
    </html>
  );
}
