import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tab Zero — one task at a time",
  description:
    "Dump everything on your mind. AI turns the chaos into one clear task at a time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
