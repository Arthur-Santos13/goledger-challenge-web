import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoLedger TV Shows",
  description: "IMDB-like interface to catalogue TV Shows, seasons, episodes and watchlists",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#141414] text-white min-h-screen">{children}</body>
    </html>
  );
}
