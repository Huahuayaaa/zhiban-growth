import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "智伴成长｜劳动教育实训评价平台",
  description: "连接课程、虚拟实训、成果评价与劳动成长档案。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
