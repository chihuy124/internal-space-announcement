import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Internal Space Announcement",
  description: "Quản lý feature đã deploy của website chính Oroca.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
