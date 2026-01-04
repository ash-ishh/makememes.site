import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "makememes.site",
  description: "Code-first meme generator using VideoDB Editor templates",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
